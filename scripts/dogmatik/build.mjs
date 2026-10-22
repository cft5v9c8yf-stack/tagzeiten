/**
 * Builds data/dogmatik/band-1.json … band-3.json from the transcription in
 * reference/pieper: 365 days per volume, three years in all.
 *
 *   node scripts/dogmatik/build.mjs
 *
 * Days marked "geprueft": true in an existing file are kept word for word,
 * and so are their boundaries ("anker": page and first words); the days around
 * them are cut afresh. The report goes to reference/pieper/BERICHT.md.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clean } from './clean.mjs';
import { mendOcr } from './ocr.mjs';
import { VOLUMES } from './config.mjs';
import { stream } from './parse.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = join(ROOT, 'reference/pieper');
const OUT = join(ROOT, 'data/dogmatik');
const DAYS = 365;
/** Words read in a minute, for the reading time of a day. */
const WPM = 110;

const QUELLE = (v) =>
  `Francis Pieper, Christliche Dogmatik, Band ${v.band}, St. Louis: Concordia Publishing House, ${v.jahr}. Text nach der Abschrift von BackToLuther (archive.org); nicht durchgesehene Tage können Lesefehler enthalten.`;

/* ---------------------------------------------------------------- structure */

// "Die Beharrung zur Seligkeit.430)": a note's number may hang on a heading.
const strip = (h) => h.replace(/\s*\^$/, '').replace(/\[\[[^\]]+\]\]|\d+\)$/g, '').replace(/\.$/, '').trim();
const normKey = (s) => s.toLowerCase().replace(/[^\p{L}\d]+/gu, ' ').trim();

/**
 * Doctrine, chapter and section for every item. Chapters: "I.", "A." and the
 * numbers that go on from the last chapter of the doctrine; everything else is
 * a section.
 */
function structure(items, volume) {
  // Where each doctrine begins: its heading near the page given, else the first heading from that page on.
  const starts = new Map();
  for (const t of volume.teile) {
    const want = normKey(t.heading ?? t.titel);
    let at = items.findIndex((it) => it.kind === 'h' && it.page >= t.seite && it.page <= t.seite + 2 && normKey(it.text).startsWith(want));
    const drop = at >= 0;
    if (!drop) at = items.findIndex((it) => it.kind === 'h' && it.page >= t.seite);
    if (at < 0) throw new Error(`Lehrstück nicht gefunden: ${t.titel}`);
    starts.set(at, { titel: t.titel, drop });
  }
  let teil = null;
  let kapitel = null;
  let abschnitt = null;
  let kapNo = 0;
  let lettered = false;
  const out = [];
  // A heading followed straight by "1. …" opens a list of its own ("Die Ortskirchen.", "Die Erbsünde."): a chapter.
  const nextHeading = (i) => items.slice(i + 1).find((x) => x.kind === 'h');
  items.forEach((it, i) => {
    const t = starts.get(i);
    if (t) {
      teil = t.titel;
      kapitel = null;
      abschnitt = null;
      kapNo = 0;
      lettered = false;
      if (t.drop) return;
    }
    if (it.kind !== 'h') {
      out.push({ ...it, teil, kapitel, abschnitt });
      return;
    }
    let text = strip(it.text);
    if (it.sub && /^\((genus|[a-z])/.test(it.sub)) text = `${text} ${it.sub.replace(/\.$/, '')}`;
    const roman = /^([IVX]+|[A-H])\.\s/.test(text);
    const num = /^(\d+)\.\s/.exec(text);
    let level = 'abschnitt';
    const opensList = !num && /^1\.\s/.test(strip(nextHeading(i)?.text ?? ''));
    if (roman || opensList) {
      level = 'kapitel';
      lettered = true;
    } else if (num && !lettered && Number(num[1]) === kapNo + 1) {
      level = 'kapitel';
      kapNo += 1;
    }
    if (level === 'kapitel') {
      kapitel = text;
      abschnitt = null;
    } else abschnitt = text;
    out.push({ ...it, text, level, teil, kapitel, abschnitt });
  });
  return out;
}

/* ---------------------------------------------------------------- pieces */

const ABBR = new Set(
  'z d u a vgl s st l erl opp ff f vol sq sqq cf usw dr d bd nr art v ca resp bzw sp anm ausg aufl bl th theol ev luth lat griech hebr hebr kap matth mark luk joh apost röm kor gal eph phil kol thess tim tit hebr petr jak offb mos ps jes jer hes dan hos am mich sach mal spr pred hi richt sam kön chron esr neh esth klagel joel ob jon nah hab zeph hagg weish sir makk tob jud bar apol conc trid syst dogm komp vgl gest geb ebd ib ibid iii ii i iv v vi vii viii ix x xi xii xiii xiv xv xvi xvii xviii xix xx xxi xxii'
    .split(' '),
);

/** Places in a paragraph where a sentence ends and a day may begin: never after an abbreviation or a number. */
function sentenceBreaks(text) {
  const out = [];
  const re = /([.!?])([“”"’)]*)((?:\[\[[^\]]+\]\])*)\s+(?=[„"(]?\p{Lu})/gu;
  for (const m of text.matchAll(re)) {
    const before = text.slice(Math.max(0, m.index - 12), m.index);
    const word = /([\p{L}\d]+)$/u.exec(before)?.[1] ?? '';
    if (m[1] === '.' && !m[2] && (/\d$/.test(word) || word.length <= 2 || ABBR.has(word.toLowerCase()))) continue;
    out.push(m.index + m[0].length);
  }
  return out;
}

/** Paragraphs longer than `max` are cut into pieces at sentence ends, so that a day may end within them. */
function pieces(items, max) {
  const out = [];
  let pid = 0;
  for (const it of items) {
    if (it.kind === 'h') {
      out.push(it);
      continue;
    }
    pid += 1;
    const len = it.text.length;
    if (len <= max) {
      out.push({ ...it, pid, part: 0, of: 1 });
      continue;
    }
    const breaks = sentenceBreaks(it.text);
    const cuts = [];
    let from = 0;
    const want = Math.ceil(len / Math.ceil(len / max));
    for (const b of breaks) {
      if (b - from >= want && len - b >= want * 0.4) {
        cuts.push(b);
        from = b;
      }
    }
    const bounds = [0, ...cuts, len];
    for (let k = 0; k < bounds.length - 1; k++) {
      const a = bounds[k];
      const z = bounds[k + 1];
      // The page of a piece: where the paragraph turned its pages.
      const pageAt = (at) => (it.turns ?? []).reduce((p, t) => (t.share * len <= at ? t.page : p), it.page);
      out.push({
        ...it,
        text: it.text.slice(a, z).trim(),
        page: pageAt(a),
        endPage: pageAt(Math.max(a, z - 1)),
        pid,
        part: k,
        of: bounds.length - 1,
      });
    }
  }
  return out;
}

/* ---------------------------------------------------------------- days */

const plainLen = (t) => t.replace(/\[\[[^\]]+\]\]/g, '').length;

/**
 * Cuts units[from, to) into k days of about equal length. A day begins best at
 * a chapter, then at a section, then at a paragraph, and only when it must
 * within a paragraph; a heading always stays with the text after it.
 */
function cut(units, from, to, k) {
  const n = to - from;
  const len = [0];
  for (let i = 0; i < n; i++) len.push(len[i] + (units[from + i].kind === 'h' ? 0 : plainLen(units[from + i].text)));
  const total = len[n];
  const T = total / k;
  const startCost = (i) => {
    // Cost of a day beginning at units[from + i].
    if (i === 0) return 0;
    const u = units[from + i];
    const prev = units[from + i - 1];
    if (prev.kind === 'h') return Infinity;
    if (u.kind === 'h') return u.level === 'kapitel' ? -0.6 : -0.35;
    if (u.part > 0) return 0.5;
    return 0;
  };
  const sc = Array.from({ length: n }, (_, i) => startCost(i));
  const INF = Infinity;
  let prev = new Float64Array(n + 1).fill(INF);
  prev[0] = 0;
  const choice = [];
  for (let d = 1; d <= k; d++) {
    const cur = new Float64Array(n + 1).fill(INF);
    const ch = new Int32Array(n + 1).fill(-1);
    for (let j = 1; j <= n; j++) {
      if (j < n && sc[j] === INF) continue;
      if (d === k && j !== n) continue;
      for (let i = j - 1; i >= 0; i--) {
        const L = len[j] - len[i];
        if (L > 3 * T && j - i > 1) break;
        if (prev[i] === INF || sc[i] === INF) continue;
        if (L === 0) continue;
        const c = prev[i] + ((L - T) / T) ** 2 + sc[i];
        if (c < cur[j]) {
          cur[j] = c;
          ch[j] = i;
        }
      }
    }
    choice.push(ch);
    prev = cur;
  }
  if (prev[n] === INF) throw new Error(`Keine Aufteilung für ${k} Tage (${from}–${to})`);
  const starts = [];
  let j = n;
  for (let d = k - 1; d >= 0; d--) {
    const i = choice[d][j];
    starts.unshift(from + i);
    j = i;
  }
  return starts;
}

/** Days for each region between fixed boundaries, shared among the doctrines by length. */
function allocate(lengths, k) {
  const total = lengths.reduce((a, b) => a + b, 0);
  const raw = lengths.map((l) => (l / total) * k);
  const out = raw.map((r) => Math.max(1, Math.floor(r)));
  let left = k - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]);
  for (let x = 0; left > 0; x = (x + 1) % order.length, left--) out[order[x][1]] += 1;
  while (left < 0) {
    const i = out.indexOf(Math.max(...out));
    out[i] -= 1;
    left += 1;
  }
  return out;
}

/* ---------------------------------------------------------------- anchors */

const words = (s) => s.replace(/\[\[[^\]]+\]\]/g, '').replace(/[^\p{L}\d]+/gu, ' ').trim().toLowerCase();

/** The unit where a day with this anchor begins; splits a paragraph if the anchor lies within it. */
function findAnchor(units, anker) {
  const want = words(anker.anfang);
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (u.kind === 'h' || u.endPage < anker.seite || u.page > anker.seite + 1) continue;
    const w = words(u.text);
    if (w.startsWith(want)) {
      let s = i;
      while (s > 0 && units[s - 1].kind === 'h') s -= 1;
      return s;
    }
    const at = w.indexOf(` ${want}`);
    if (at >= 0) {
      // Split the text at the anchor's first word.
      const first = anker.anfang.split(/\s+/)[0];
      const re = new RegExp(`(?<=[.!?:;“"]\\s|[.!?:;]\\[\\[[^\\]]+\\]\\]\\s)${first.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'u');
      const m = re.exec(u.text);
      if (!m) continue;
      const a = { ...u, text: u.text.slice(0, m.index).trim() };
      const b = { ...u, text: u.text.slice(m.index).trim(), part: (u.part ?? 0) + 0.5 };
      units.splice(i, 1, a, b);
      return i + 1;
    }
  }
  throw new Error(`Anker nicht gefunden: S. ${anker.seite} „${anker.anfang}“`);
}

/* ---------------------------------------------------------------- output */

const firstWords = (t, n = 6) =>
  t.replace(/\[\[[^\]]+\]\]/g, '').replace(/^…\s*/, '').split(/\s+/).slice(0, n).join(' ').replace(/[,;:.]$/, '');

const pages = (a, z) => (z <= a ? `${a}` : z === a + 1 ? `${a} f.` : `${a}–${z}`);

const titleOf = (h) =>
  h
    .replace(/^([IVX]+|[A-Ha-i]|\d+)\.\s+/, '')
    .replace(/\s*\((?![^)]*\s)[^)]*\)$/, '')
    .replace(/\s*\([A-Z][a-z]+ [A-Za-z]+\.?\)$/, '')
    .replace(/\.$/, '')
    .trim();

function makeDay(tag, units, context) {
  const absaetze = [];
  const fussnoten = {};
  let minutesText = '';
  let first = null;
  let last = null;
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (u.kind === 'h') {
      // Headings at the very start set the day's place; later ones stand in the text.
      if (absaetze.length) absaetze.push(`## ${u.text}`);
      continue;
    }
    first ??= u;
    last = u;
    const prev = units[i - 1];
    // Pieces of one paragraph within the day are one paragraph again.
    if (prev && prev.kind !== 'h' && prev.pid === u.pid && absaetze.length) absaetze[absaetze.length - 1] += ` ${u.text}`;
    else absaetze.push(u.part > 0 && absaetze.length === 0 ? `… ${u.text}` : u.text);
    for (const m of u.text.matchAll(/\[\[([^\]]+)\]\]/g)) if (u.notes[m[1]]) fussnoten[m[1]] = u.notes[m[1]];
    minutesText += ` ${u.text}`;
  }
  // The day ends within a paragraph: "…" at its end.
  const after = context.next;
  if (after && after.kind !== 'h' && last && after.pid === last.pid && absaetze.length) absaetze[absaetze.length - 1] += ' …';
  const ctx = units.find((u) => u.kind !== 'h') ?? units[0];
  const lead = units.filter((u, i) => u.kind === 'h' && units.slice(0, i).every((x) => x.kind === 'h'));
  const where = lead.at(-1) ?? ctx;
  const wordsN = minutesText.replace(/\[\[[^\]]+\]\]/g, '').split(/\s+/).filter(Boolean).length;
  return {
    tag,
    titel: '',
    teil: where.teil,
    ...(where.kapitel ? { kapitel: where.kapitel } : {}),
    ...(where.abschnitt ? { abschnitt: where.abschnitt } : {}),
    seite: pages(first.page, last.endPage),
    minuten: Math.max(1, Math.round(wordsN / WPM)),
    absaetze,
    fussnoten,
    anker: { seite: first.page, anfang: firstWords(first.text) },
  };
}

/** "Die Einheit Gottes (2 von 3)": the heading of the day's place, numbered when it spans several days. */
function nameDays(days) {
  // A reviewed day keeps a title given by hand; one named after its place is counted with the others.
  const base = days.map((d) => {
    const auto = titleOf(d.abschnitt ?? d.kapitel ?? d.teil);
    return d.geprueft && d.titel.replace(/ \(\d+ von \d+\)$/, '') !== auto ? null : auto;
  });
  for (let i = 0; i < days.length; ) {
    if (base[i] === null) {
      i += 1;
      continue;
    }
    let j = i;
    while (j + 1 < days.length && base[j + 1] === base[i]) j += 1;
    for (let x = i; x <= j; x++) days[x].titel = j > i ? `${base[i]} (${x - i + 1} von ${j - i + 1})` : base[i];
    i = j + 1;
  }
}

/* ---------------------------------------------------------------- main */

function reviewedDays(band) {
  const file = join(OUT, `band-${band}.json`);
  if (existsSync(file)) {
    const old = JSON.parse(readFileSync(file, 'utf8'));
    const keep = old.tage.filter((d) => d.geprueft);
    // The boundary after each run of reviewed days: the anchor of the day that follows.
    const ends = keep
      .filter((d) => !keep.some((x) => x.tag === d.tag + 1))
      .map((d) => old.tage.find((x) => x.tag === d.tag + 1))
      .filter(Boolean)
      .map((d) => ({ tag: d.tag, anker: d.anker }));
    return { keep, ends };
  }
  return { keep: [], ends: [] };
}

function buildVolume(volume, report) {
  const r = stream(
    volume.files.map((f) => join(SRC, f)),
    { titles: volume.titles, rawFixes: volume.rawFixes },
  );
  // Words broken at the end of a line: joined, unless the volume writes them with a hyphen elsewhere.
  const words = new Set();
  const textsOf = (it) => [it.text, ...Object.values(it.notes ?? {})];
  for (const it of r.items) for (const t of textsOf(it)) for (const w of t.match(/[\p{L}\u00AD-]+/gu) ?? []) if (!w.includes('\u00AD')) words.add(w);
  const unbreak = (t) =>
    t.replace(/[\p{L}-]*\u00AD[\p{L}\u00AD-]*/gu, (w) => {
      const joined = w.replace(/\u00AD/g, '');
      const hyphen = w.replace(/\u00AD/g, '-');
      return !words.has(joined) && words.has(hyphen) ? hyphen : joined;
    });
  // Within a line too: "Ochsen– und Bocksblut", "Lehr–, Wehr– und Nährstand" keep a hyphen;
  // "Ge– danken" is one word; "accomplished– that" in English is a dash.
  const midLine = (t) =>
    t
      .replace(/(\p{L})[–—] (und|oder|als|bis|noch|sowie)\b/gu, '$1- $2')
      .replace(/(\p{L})[–—](?=,)/gu, '$1-')
      .replace(/(\p{L})[–—] (that|for|the|and|which|to|of|in|a|is|or|but)\b/gu, '$1 – $2')
      .replace(/(\p{Ll})– (\p{Ll})/gu, '$1\u00AD$2');
  for (const it of r.items) {
    it.text = unbreak(midLine(it.text));
    if (it.notes) for (const k of Object.keys(it.notes)) it.notes[k] = unbreak(midLine(it.notes[k]));
  }
  const log = [];
  const ocrLog = [];
  for (const it of r.items) {
    it.text = mendOcr(clean(it.text, log, volume.fixes), ocrLog);
    if (it.notes) for (const k of Object.keys(it.notes)) it.notes[k] = mendOcr(clean(it.notes[k], log, volume.fixes), ocrLog);
  }
  const items = structure(r.items.filter((it) => it.kind === 'h' || it.text), volume);
  const total = items.reduce((s, it) => s + (it.kind === 'h' ? 0 : plainLen(it.text)), 0);
  const T = total / DAYS;
  const units = pieces(items, Math.round(T * 0.45));

  // Fixed boundaries: the reviewed days and the day after each run of them.
  const { keep, ends } = reviewedDays(volume.band);
  const fixed = [...keep.map((d) => ({ tag: d.tag, anker: d.anker })), ...ends].sort((a, b) => a.tag - b.tag);
  const marks = fixed.map((f) => ({ tag: f.tag, at: findAnchor(units, f.anker) }));
  // findAnchor may split a unit: find them all again, in order.
  for (const m of marks) m.at = findAnchor(units, fixed.find((f) => f.tag === m.tag).anker);

  // Regions: [start unit, end unit, first tag, number of days, reviewed?]
  const regions = [];
  let at = 0;
  let tag = 1;
  for (const m of marks) {
    const reviewed = keep.some((d) => d.tag === m.tag);
    if (m.at > at || m.tag > tag) regions.push({ from: at, to: m.at, tag, k: m.tag - tag });
    at = m.at;
    tag = m.tag;
    if (reviewed) {
      const next = marks.find((x) => x.tag === m.tag + 1);
      regions.push({ from: m.at, to: next.at, tag: m.tag, k: 1, reviewed: true });
      at = next.at;
      tag = m.tag + 1;
    }
  }
  regions.push({ from: at, to: units.length, tag, k: DAYS - tag + 1 });

  const days = [];
  for (const reg of regions.filter((x) => x.k > 0 || x.to > x.from)) {
    if (reg.reviewed) {
      const d = keep.find((x) => x.tag === reg.tag);
      const ctx = makeDay(reg.tag, units.slice(reg.from, reg.to), { next: units[reg.to] });
      days.push({ ...d, teil: ctx.teil, kapitel: ctx.kapitel, abschnitt: ctx.abschnitt, anker: d.anker });
      continue;
    }
    // Within a region, every doctrine begins a new day.
    const teilStarts = [reg.from];
    for (let i = reg.from + 1; i < reg.to; i++) if (units[i].teil !== units[i - 1].teil) teilStarts.push(i);
    const lens = teilStarts.map((s, x) => {
      const e = teilStarts[x + 1] ?? reg.to;
      return units.slice(s, e).reduce((a, u) => a + (u.kind === 'h' ? 0 : plainLen(u.text)), 0);
    });
    const ks = allocate(lens, reg.k);
    let t = reg.tag;
    teilStarts.forEach((s, x) => {
      const e = teilStarts[x + 1] ?? reg.to;
      const starts = cut(units, s, e, ks[x]);
      starts.forEach((st, y) => {
        const en = starts[y + 1] ?? e;
        days.push(makeDay(t, units.slice(st, en), { next: units[en] }));
        t += 1;
      });
    });
  }
  if (days.length !== DAYS || days.some((d, i) => d.tag !== i + 1)) throw new Error(`Band ${volume.band}: ${days.length} Tage`);
  nameDays(days);

  const lengths = days.filter((d) => !d.geprueft).map((d) => d.minuten);
  const stats = {
    band: volume.band,
    seiten: r.pages,
    absaetze: items.filter((x) => x.kind !== 'h').length,
    ueberschriften: items.filter((x) => x.kind === 'h').length,
    minuten: { min: Math.min(...lengths), max: Math.max(...lengths), mittel: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) },
    imAbsatz: days.filter((d) => d.absaetze[0]?.startsWith('… ')).length,
  };
  report.push(
    `## Band ${volume.band}`,
    '',
    `${stats.seiten} Seiten, ${stats.absaetze} Absätze, ${stats.ueberschriften} Überschriften. Lesezeit je Tag ${stats.minuten.min}–${stats.minuten.max} Minuten, im Mittel ${stats.minuten.mittel}. ${stats.imAbsatz} Tage beginnen mitten in einem Absatz.`,
    '',
    `Fußnoten ohne Ziffer im Text (ans Absatzende gestellt): ${r.unplaced.join(', ') || 'keine'}`,
    '',
    `Fußnotennummern berichtigt: ${r.fixedNos.join(', ') || 'keine'}`,
    '',
    `Fußnotennummern, die in der Abschrift fehlen: ${r.missingNos.join(', ') || 'keine'}`,
    '',
    `Ziffern im Text berichtigt: ${r.fixedMarks.join(', ') || 'keine'}`,
    '',
    `Als Text gelesen, nicht als neue Fußnote: ${r.outOfTurn.join(', ') || 'keine'}`,
    '',
    `Lesefehler berichtigt (${ocrLog.length}): ${[...new Set(ocrLog)].join(', ') || 'keine'}`,
    '',
    `Entfernte Notizen der Abschrift (${log.length}):`,
    '',
    ...[...new Set(log)].map((x) => `- ${x}`),
    '',
  );

  const book = {
    buch: { autor: 'Francis Pieper', titel: 'Christliche Dogmatik', band: volume.band, umfang: DAYS, quelle: QUELLE(volume) },
    tage: days,
  };
  return { book, stats };
}

mkdirSync(OUT, { recursive: true });
const report = ['# Pieper, Christliche Dogmatik: Bericht der Aufbereitung', '', 'Erzeugt von `scripts/dogmatik/build.mjs`.', ''];
const only = process.argv[2] ? Number(process.argv[2]) : null;
for (const v of VOLUMES) {
  if (only && v.band !== only) continue;
  const { book, stats } = buildVolume(v, report);
  writeFileSync(join(OUT, `band-${v.band}.json`), `${JSON.stringify(book, null, 1)}\n`);
  console.log(`Band ${v.band}: ${book.tage.length} Tage, ${stats.minuten.min}–${stats.minuten.max} Min. (Mittel ${stats.minuten.mittel}), ${stats.imAbsatz} im Absatz`);
}
if (!only) writeFileSync(join(SRC, 'BERICHT.md'), report.join('\n'));
