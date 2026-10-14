/**
 * Full-text search over the texts of the app and the user's own entries,
 * entirely on the device (rule 10). Tolerant of the old spelling the texts
 * keep ("Theil", "Sacrament", "daß", "Ueber") and of a slip of the finger.
 */

export interface SearchDoc {
  /** Where the hit lives, e.g. "Lehre · Augsburgische Konfession". */
  area: string;
  title: string;
  text: string;
  /** Route to open, e.g. "/katechismus/bekenntnisse". */
  to: string;
}

export interface SearchHit {
  doc: SearchDoc;
  rank: number;
  /** Excerpt of the text around the first hit, split into plain and marked pieces. */
  snippet: readonly { text: string; mark: boolean }[];
  titleMarked: readonly { text: string; mark: boolean }[];
}

/** Folds old and new spelling onto one form: "Theil" and "Teil", "Sacrament" and "Sakrament". */
export function fold(s: string): string {
  return s
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/ä|ae/g, 'a')
    .replace(/ö|oe/g, 'o')
    .replace(/ü|ue/g, 'u')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ph/g, 'f')
    .replace(/th/g, 't')
    .replace(/c(?=[eiy])/g, 'z')
    .replace(/c(?!h)/g, 'k')
    .replace(/y/g, 'i')
    .replace(/([a-z])\1+/g, '$1');
}

/** Words of a text; letters and digits only. */
const WORD = /[\p{L}\p{N}]+/gu;

/** A few names the texts spell otherwise than one types them. */
const SYNONYM_WORDS: Record<string, readonly string[]> = {
  vaterunser: ['vater unser', 'unser vater'],
  abendmahl: ['sakrament des altars'],
  glaubensbekentnis: ['glaube', 'bekentnis'],
  zehngebote: ['zehn gebote'],
  apostolikum: ['apostolische glaubensbekentnis'],
  nizanum: ['nizanische glaubensbekentnis'],
  athanasianum: ['athanasianische glaubensbekentnis'],
  ca: ['augsburgische konfesion'],
  augsburger: ['augsburgische'],
};
const SYNONYMS: Record<string, readonly string[]> = Object.fromEntries(
  Object.entries(SYNONYM_WORDS).map(([k, v]) => [fold(k), v.map((x) => x.split(' ').map(fold).join(' '))]),
);

/** Levenshtein distance, stopped early above `max`. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur.push(v);
      if (v < best) best = v;
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length]!;
}

interface Prepared {
  doc: SearchDoc;
  /** Folded words of the text, with their offsets in the original. */
  words: { f: string; start: number; end: number }[];
  titleWords: { f: string; start: number; end: number }[];
}

function words(s: string) {
  return [...s.matchAll(WORD)].map((m) => ({ f: fold(m[0]), start: m.index!, end: m.index! + m[0].length }));
}

export function prepare(docs: readonly SearchDoc[]): Prepared[] {
  return docs.map((doc) => ({ doc, words: words(doc.text), titleWords: words(doc.title) }));
}

/**
 * One term matches a word when the word begins with it; from five letters on
 * one letter may be wrong. A term of several words ("vater unser") must match
 * that run of words.
 */
function termMatcher(term: string): (ws: Prepared['words'], i: number) => number {
  const parts = term.split(' ');
  const one = (w: string, t: string, last: boolean) =>
    (last ? w.startsWith(t) : w === t) || (t.length >= 5 && w[0] === t[0] && distance(w.slice(0, last ? t.length : undefined), t, 1) <= 1);
  return (ws, i) => {
    for (let k = 0; k < parts.length; k++) {
      const w = ws[i + k];
      if (!w || !one(w.f, parts[k]!, k === parts.length - 1)) return 0;
    }
    return parts.length;
  };
}

/** Alternatives for each word of the query: the word itself and its synonyms. */
function queryTerms(q: string): string[][] {
  const raw = [...q.matchAll(WORD)].map((m) => fold(m[0]));
  const joined = raw.join('');
  if (raw.length > 1 && SYNONYMS[joined]) return [[joined, ...SYNONYMS[joined]!]];
  return raw.map((t) => [t, ...(SYNONYMS[t] ?? [])]);
}

function marked(s: string, ranges: [number, number][], from = 0, to = s.length) {
  const out: { text: string; mark: boolean }[] = [];
  let at = from;
  for (const [a, b] of ranges.filter(([a, b]) => a >= from && b <= to).sort((x, y) => x[0] - y[0])) {
    if (a < at) continue;
    if (a > at) out.push({ text: s.slice(at, a), mark: false });
    out.push({ text: s.slice(a, b), mark: true });
    at = b;
  }
  if (at < to) out.push({ text: s.slice(at, to), mark: false });
  return out;
}

/** All documents that contain every word of the query, best first. */
export function search(index: readonly Prepared[], query: string, limit = 50): SearchHit[] {
  const terms = queryTerms(query).filter((alts) => alts[0]!.length >= 2);
  if (terms.length === 0) return [];
  const matchers = terms.map((alts) => alts.map(termMatcher));
  const hits: SearchHit[] = [];
  for (const p of index) {
    let rank = 0;
    const ranges: [number, number][] = [];
    const titleRanges: [number, number][] = [];
    let all = true;
    for (const alts of matchers) {
      let found = 0;
      for (const [ws, rs, weight] of [
        [p.titleWords, titleRanges, 10],
        [p.words, ranges, 1],
      ] as const) {
        for (let i = 0; i < ws.length; i++) {
          for (const m of alts) {
            const n = m(ws, i);
            if (n) {
              found += weight;
              rs.push([ws[i]!.start, ws[i + n - 1]!.end]);
              break;
            }
          }
        }
      }
      if (!found) {
        all = false;
        break;
      }
      rank += found;
    }
    if (!all) continue;
    const text = p.doc.text;
    const first = ranges.length ? Math.min(...ranges.map((r) => r[0])) : 0;
    let from = Math.max(0, first - 70);
    if (from > 0) from = text.indexOf(' ', from) + 1 || from;
    let to = Math.min(text.length, from + 220);
    if (to < text.length) to = text.lastIndexOf(' ', to) > from ? text.lastIndexOf(' ', to) : to;
    const snippet = marked(text, ranges, from, to);
    if (from > 0) snippet.unshift({ text: '… ', mark: false });
    if (to < text.length) snippet.push({ text: ' …', mark: false });
    hits.push({ doc: p.doc, rank, snippet, titleMarked: marked(p.doc.title, titleRanges) });
  }
  return hits.sort((a, b) => b.rank - a.rank).slice(0, limit);
}
