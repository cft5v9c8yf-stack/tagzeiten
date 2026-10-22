/**
 * The Dogmatik: Francis Pieper, Christliche Dogmatik, three volumes read in
 * three years, a section a day – or as many as fit into the time chosen –
 * and a book to look things up in.
 *
 * The text lives in data/dogmatik/band-1.json … band-3.json (made by
 * scripts/dogmatik/build.mjs) and is checked here when loaded (normalizeBook):
 * a corrected file needs no change of code. The plan runs by the reader's own
 * progress, never by the calendar (rule 6): today's reading is the first
 * section not yet read.
 */
import { addDays, isDateKey, type DateKey } from './dates';
import { fold, prepare, search, type SearchHit } from './fulltext';

/* ---------------------------------------------------------------- book */

export interface DogmatikQuote {
  /** The Latin as in the book; may carry footnote markers. */
  lat: string;
  /** A German translation (an addition, not the book's text). */
  de?: string;
  /** Stands after this paragraph (1-based); absent: after the last. */
  nach?: number;
}

export interface DogmatikDay {
  /** The volume, 1 to 3: the year of the plan. */
  band: number;
  /** Number of the day within its volume, 1 … 365. */
  tag: number;
  titel: string;
  /** The doctrine (Lehrstück), e.g. "Die Heilige Schrift". */
  teil: string;
  /** The chapter within the doctrine, as headed in the book. */
  kapitel?: string;
  /** A heading within the chapter. */
  abschnitt?: string;
  /** Pages in the book, e.g. "90 f.". */
  seite?: string;
  /** Reading time in minutes. */
  minuten: number;
  /** A Bible word to begin with (an addition). */
  bibelwort?: { stelle: string; text: string };
  /** The paragraphs; footnotes stand as markers "[[313]]", headings within the day as "## …". */
  absaetze: string[];
  fussnoten: Record<string, string>;
  zitate: DogmatikQuote[];
  /** Core sentence of the day (an addition). */
  kernsatz?: string;
  /** A question to think about (an addition). */
  frage?: string;
  /** Read and corrected by hand against the print. */
  geprueft: boolean;
}

export interface DogmatikBook {
  buch: {
    autor: string;
    titel: string;
    band: number;
    /** Days of the volume (365). */
    umfang: number;
    /** Where the text comes from. */
    quelle?: string;
  };
  /** In the book's order. */
  tage: DogmatikDay[];
}

/** The three volumes, in order, and all their days as one sequence. */
export interface DogmatikLibrary {
  baende: DogmatikBook[];
  tage: DogmatikDay[];
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function quote(v: unknown): DogmatikQuote | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const q = v as Record<string, unknown>;
  const lat = str(q.lat);
  if (!lat) return undefined;
  const out: DogmatikQuote = { lat };
  if (str(q.de)) out.de = str(q.de);
  if (Number.isInteger(q.nach) && (q.nach as number) > 0) out.nach = q.nach as number;
  return out;
}

function day(v: unknown, band: number): DogmatikDay | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const d = v as Record<string, unknown>;
  const tag = d.tag;
  const absaetze = Array.isArray(d.absaetze) ? d.absaetze.map(str).filter(Boolean) : [];
  if (!Number.isInteger(tag) || (tag as number) < 1 || !str(d.titel) || absaetze.length === 0) return undefined;
  const out: DogmatikDay = {
    band,
    tag: tag as number,
    titel: str(d.titel),
    teil: str(d.teil) || 'Ohne Lehrstück',
    minuten: typeof d.minuten === 'number' && d.minuten > 0 ? Math.round(d.minuten) : 3,
    absaetze,
    fussnoten: {},
    zitate: Array.isArray(d.zitate) ? d.zitate.map(quote).filter((q): q is DogmatikQuote => !!q) : [],
    geprueft: d.geprueft === true,
  };
  if (str(d.kapitel)) out.kapitel = str(d.kapitel);
  if (str(d.abschnitt)) out.abschnitt = str(d.abschnitt);
  if (str(d.seite) || typeof d.seite === 'number') out.seite = String(d.seite).trim();
  const bw = d.bibelwort as Record<string, unknown> | undefined;
  if (bw && str(bw.stelle) && str(bw.text)) out.bibelwort = { stelle: str(bw.stelle), text: str(bw.text) };
  if (d.fussnoten && typeof d.fussnoten === 'object') {
    for (const [k, t] of Object.entries(d.fussnoten as Record<string, unknown>)) if (str(t)) out.fussnoten[k.trim()] = str(t);
  }
  if (str(d.kernsatz)) out.kernsatz = str(d.kernsatz);
  if (str(d.frage)) out.frage = str(d.frage);
  return out;
}

/**
 * Brings one volume's file into shape: days without number, title or text are
 * left out, a number given twice counts once, the days are put in order.
 * Whatever the file holds, the app gets a usable book.
 */
export function normalizeBook(raw: unknown, fallbackBand = 1): DogmatikBook {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const b = (r.buch && typeof r.buch === 'object' ? r.buch : {}) as Record<string, unknown>;
  const band = Number.isInteger(b.band) ? (b.band as number) : fallbackBand;
  const seen = new Set<number>();
  const tage: DogmatikDay[] = [];
  for (const v of Array.isArray(r.tage) ? r.tage : []) {
    const d = day(v, band);
    if (!d || seen.has(d.tag)) continue;
    seen.add(d.tag);
    tage.push(d);
  }
  tage.sort((a, z) => a.tag - z.tag);
  const last = tage.at(-1)?.tag ?? 0;
  return {
    buch: {
      autor: str(b.autor) || 'Francis Pieper',
      titel: str(b.titel) || 'Christliche Dogmatik',
      band,
      umfang: Math.max(Number.isInteger(b.umfang) ? (b.umfang as number) : 0, last),
      ...(str(b.quelle) ? { quelle: str(b.quelle) } : {}),
    },
    tage,
  };
}

export function library(books: readonly DogmatikBook[]): DogmatikLibrary {
  const baende = [...books].sort((a, z) => a.buch.band - z.buch.band);
  return { baende, tage: baende.flatMap((b) => b.tage) };
}

/** Problems in a file worth fixing (a footnote marker without its note, and the like); used by the tests. */
export function bookProblems(book: DogmatikBook): string[] {
  const out: string[] = [];
  for (const d of book.tage) {
    const texts = [...d.absaetze, ...d.zitate.map((q) => q.lat)];
    const markers = texts.flatMap((t) => [...t.matchAll(MARKER)].map((m) => m[1]!));
    for (const m of markers) if (!(m in d.fussnoten)) out.push(`Band ${d.band}, Tag ${d.tag}: Fußnote ${m} fehlt`);
    for (const k of Object.keys(d.fussnoten)) if (!markers.includes(k)) out.push(`Band ${d.band}, Tag ${d.tag}: Fußnote ${k} steht nicht im Text`);
    for (const q of d.zitate) if (q.nach && q.nach > d.absaetze.length) out.push(`Band ${d.band}, Tag ${d.tag}: Zitat nach Absatz ${q.nach}, den es nicht gibt`);
  }
  return out;
}

/* ---------------------------------------------------------------- text */

const MARKER = /\[\[([^\]\s]+)\]\]/g;

export type TextPiece = { text: string } | { note: string } | { gap: true };

/** A paragraph in pieces: plain text, footnote markers ("[[313]]") and places where Hebrew is missing. */
export function pieces(text: string): TextPiece[] {
  const out: TextPiece[] = [];
  let at = 0;
  for (const m of text.matchAll(/\[\[([^\]\s]+)\]\]|\[hebräisch\]/g)) {
    if (m.index! > at) out.push({ text: text.slice(at, m.index) });
    out.push(m[1] ? { note: m[1] } : { gap: true });
    at = m.index! + m[0].length;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}

/** The notes in the order they stand in a text. */
export const notesIn = (text: string): string[] => [...text.matchAll(MARKER)].map((m) => m[1]!);

/** The text without markers, for search and export. */
export const plain = (text: string): string => text.replace(MARKER, '');

/** A heading within the day ("## Primäre und sekundäre Fundamentallehren"), or null. */
export const headingOf = (p: string): string | null => (p.startsWith('## ') ? p.slice(3) : null);

/** Paragraphs, headings and quotations in reading order: each quotation after its paragraph. */
export function blocks(
  d: DogmatikDay,
): ({ kind: 'p'; text: string; no: number } | { kind: 'h'; text: string; no: number } | { kind: 'q'; quote: DogmatikQuote; no: number })[] {
  const out: ReturnType<typeof blocks> = [];
  d.absaetze.forEach((text, i) => {
    const h = headingOf(text);
    out.push(h !== null ? { kind: 'h', text: h, no: i + 1 } : { kind: 'p', text, no: i + 1 });
    d.zitate.forEach((q, k) => {
      if (Math.min(q.nach ?? d.absaetze.length, d.absaetze.length) === i + 1) out.push({ kind: 'q', quote: q, no: k + 1 });
    });
  });
  return out;
}

/* ---------------------------------------------------------------- settings and progress */

/** Reading time a day: 0 is one section a day (three years), else minutes. */
export const DAILY_MINUTES = [0, 5, 10, 15, 20] as const;
export type DailyMinutes = (typeof DAILY_MINUTES)[number];

export interface DogmatikSettings {
  /** The reading plan is used; off, the book is there to look things up in. */
  on: boolean;
  /** Read in the Stille Zeit, after the Word. */
  stilleZeit: boolean;
  /** One section a day (0), or as many as fit into these minutes. */
  minuten: DailyMinutes;
  showVerse: boolean;
  /** Core sentence and question to think about. */
  showCore: boolean;
  /** Footnotes open under their paragraph without a tap. */
  footnotesOpen: boolean;
  /** Size of the reading text, in steps from -2 to 3. */
  fontStep: number;
  /** The days read, by key ("1-47"), with the date they were read on. */
  read: Record<string, DateKey>;
  /** What was written to the question, by key. */
  notes: Record<string, string>;
}

export const FONT_STEPS = { min: -2, max: 3 } as const;

/** "1-47": volume and day. */
export const keyOf = (d: { band: number; tag: number }): string => `${d.band}-${d.tag}`;
const KEY = /^[1-9]-\d{1,3}$/;

export const defaultDogmatik = (): DogmatikSettings => ({
  on: true,
  stilleZeit: false,
  minuten: 0,
  showVerse: true,
  showCore: true,
  footnotesOpen: false,
  fontStep: 0,
  read: {},
  notes: {},
});

export function normalizeDogmatik(raw: unknown): DogmatikSettings {
  const base = defaultDogmatik();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<DogmatikSettings> & { when?: unknown };
  // Before 1.16 (preview) a day was keyed by its number alone, in Band 1.
  const key = (k: string) => (/^\d+$/.test(k) ? `1-${k}` : k);
  const read: Record<string, DateKey> = {};
  for (const [k, v] of Object.entries(r.read ?? {})) if (KEY.test(key(k)) && isDateKey(v)) read[key(k)] = v;
  const notes: Record<string, string> = {};
  for (const [k, v] of Object.entries(r.notes ?? {})) if (KEY.test(key(k)) && typeof v === 'string' && v.trim()) notes[key(k)] = v;
  return {
    on: r.on !== false,
    stilleZeit: r.stilleZeit === true || r.when === 'morning',
    minuten: (DAILY_MINUTES as readonly number[]).includes(r.minuten as number) ? (r.minuten as DailyMinutes) : 0,
    showVerse: r.showVerse !== false,
    showCore: r.showCore !== false,
    footnotesOpen: r.footnotesOpen === true,
    fontStep: Number.isInteger(r.fontStep) ? Math.min(FONT_STEPS.max, Math.max(FONT_STEPS.min, r.fontStep!)) : 0,
    read,
    notes,
  };
}

export const isRead = (s: DogmatikSettings, d: { band: number; tag: number }): boolean => keyOf(d) in s.read;

/**
 * Today's reading: from the first section read today (or, when none is, the
 * first not yet read) on, as many sections as fit into the time chosen – at
 * least one. Sections read ahead on another day are passed over. Whoever left
 * off three days goes on where they stand; nothing is behind (rule 6).
 */
export function todaysPortion(lib: DogmatikLibrary, s: DogmatikSettings, date: DateKey): DogmatikDay[] {
  const seq = lib.tage;
  const readToday = (d: DogmatikDay) => s.read[keyOf(d)] === date;
  let start = seq.findIndex(readToday);
  if (start < 0) start = seq.findIndex((d) => !isRead(s, d));
  if (start < 0) return seq.length ? [seq.at(-1)!] : [];
  const out: DogmatikDay[] = [];
  let total = 0;
  for (let i = start; i < seq.length; i++) {
    const d = seq[i]!;
    if (isRead(s, d) && !readToday(d)) continue;
    if (out.length && (s.minuten === 0 || total >= s.minuten)) break;
    out.push(d);
    total += d.minuten;
  }
  return out;
}

/** The section to open with "Heute lesen": the first of today's reading not yet read, else its last. */
export function todaysDay(lib: DogmatikLibrary, s: DogmatikSettings, date: DateKey): DogmatikDay | undefined {
  const portion = todaysPortion(lib, s, date);
  return portion.find((d) => !isRead(s, d)) ?? portion.at(-1);
}

/** Days read, newest first. */
export function recentlyRead(lib: DogmatikLibrary, s: DogmatikSettings, n = 3): { day: DogmatikDay; date: DateKey }[] {
  return lib.tage
    .filter((d) => isRead(s, d))
    .map((d) => ({ day: d, date: s.read[keyOf(d)]! }))
    .sort((a, z) => (a.date === z.date ? z.day.band - a.day.band || z.day.tag - a.day.tag : a.date < z.date ? 1 : -1))
    .slice(0, n);
}

/** Sections read in the 30 days up to `date`: documented, not judged (rule 4). */
export function readInThirtyDays(s: DogmatikSettings, date: DateKey): number {
  const from = addDays(date, -29);
  return Object.values(s.read).filter((d) => d >= from && d <= date).length;
}

/** The week of the volume's year a day falls in (day 47: week 7). */
export const weekOfPlan = (tag: number): number => Math.ceil(tag / 7);

/** About how many days the whole plan takes with the time chosen. */
export function planDays(lib: DogmatikLibrary, minuten: DailyMinutes): number {
  if (minuten === 0) return lib.tage.length;
  const total = lib.tage.reduce((a, d) => a + d.minuten, 0);
  return Math.ceil(total / minuten);
}

/** "drei Jahre", "etwa 17 Monate" */
export function planLength(days: number): string {
  if (days >= 3 * 365 - 5 && days <= 3 * 365 + 5) return 'drei Jahre';
  const months = Math.round(days / 30.4);
  return months >= 24 ? `etwa ${Math.round(days / 365)} Jahre` : `etwa ${months} Monate`;
}

export function setRead(s: DogmatikSettings, d: { band: number; tag: number }, date: DateKey | null): DogmatikSettings {
  const read = { ...s.read };
  if (date) read[keyOf(d)] = date;
  else delete read[keyOf(d)];
  return { ...s, read };
}

export function setNote(s: DogmatikSettings, d: { band: number; tag: number }, text: string): DogmatikSettings {
  const notes = { ...s.notes };
  if (text.trim()) notes[keyOf(d)] = text;
  else delete notes[keyOf(d)];
  return { ...s, notes };
}

/** Neighbours in reading order, across the volumes. */
export function neighbours(lib: DogmatikLibrary, d: { band: number; tag: number }): { prev?: DogmatikDay; next?: DogmatikDay } {
  const i = lib.tage.findIndex((x) => x.band === d.band && x.tag === d.tag);
  return i < 0 ? {} : { prev: lib.tage[i - 1], next: lib.tage[i + 1] };
}

/** A day by its key ("2-100"); a bare number means Band 1 (links from before 1.16). */
export function findDay(lib: DogmatikLibrary, key: string): DogmatikDay | undefined {
  const m = /^(?:(\d)-)?(\d{1,3})$/.exec(key);
  if (!m) return undefined;
  const band = Number(m[1] ?? 1);
  const tag = Number(m[2]);
  return lib.tage.find((d) => d.band === band && d.tag === tag);
}

/* ---------------------------------------------------------------- contents */

export interface ContentsPart {
  teil: string;
  chapters: { kapitel?: string; sections: { abschnitt?: string; tage: DogmatikDay[] }[] }[];
}

/** The table of contents of a volume: doctrines, chapters, headings and days, in the book's order. */
export function contents(book: DogmatikBook): ContentsPart[] {
  const out: ContentsPart[] = [];
  for (const d of book.tage) {
    let part = out.find((p) => p.teil === d.teil);
    if (!part) out.push((part = { teil: d.teil, chapters: [] }));
    let ch = part.chapters.find((c) => c.kapitel === d.kapitel);
    if (!ch) part.chapters.push((ch = { kapitel: d.kapitel, sections: [] }));
    let sec = ch.sections.find((x) => x.abschnitt === d.abschnitt);
    if (!sec) ch.sections.push((sec = { abschnitt: d.abschnitt, tage: [] }));
    sec.tage.push(d);
  }
  return out;
}

/* ---------------------------------------------------------------- export */

/** For the Markdown export: the days read, with the thoughts written to their questions. */
export function dogmatikToMarkdown(s: DogmatikSettings, lib: DogmatikLibrary): string[] {
  const keys = [...new Set([...Object.keys(s.read), ...Object.keys(s.notes)])].sort((a, z) => {
    const [ab, at] = a.split('-').map(Number) as [number, number];
    const [zb, zt] = z.split('-').map(Number) as [number, number];
    return ab - zb || at - zt;
  });
  if (!keys.length) return [];
  const out = ['', '# Dogmatik', ''];
  for (const key of keys) {
    const d = findDay(lib, key);
    const [band, tag] = key.split('-');
    const read = s.read[key];
    out.push(`## Band ${band}, Tag ${tag}${d ? ` · ${d.titel}` : ''}`, '');
    if (read) out.push(`Gelesen am ${new Date(`${read}T12:00:00`).toLocaleDateString('de-DE')}`, '');
    const note = s.notes[key]?.trim();
    if (note) out.push(d?.frage ? `**${d.frage}**` : '**Gedanken**', '', note, '');
  }
  return out;
}

/* ---------------------------------------------------------------- search */

export const dayPath = (d: { band: number; tag: number }): string => `/katechismus/dogmatik/${keyOf(d)}`;

/** All the text of a day for the search: paragraphs, quotations, notes and additions. */
export function dayText(d: DogmatikDay): string {
  return [
    ...d.absaetze.map((p) => plain(p).replace(/^## /, '')),
    ...d.zitate.flatMap((q) => [plain(q.lat), q.de ?? '']),
    ...Object.values(d.fussnoten),
    d.bibelwort ? `${d.bibelwort.stelle} ${d.bibelwort.text}` : '',
    d.kernsatz ?? '',
    d.frage ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Search over all three volumes. Over a thousand days would make a heavy index
 * on a phone, so it goes in two steps: each day's text is folded once (old and
 * new spelling alike, see fulltext.ts) and the days holding every word of the
 * query are found by a plain look-up; only the best of them are searched
 * closely, for the order and the excerpt.
 */
const folded = new WeakMap<DogmatikLibrary, { day: DogmatikDay; f: string }[]>();

export function searchLibrary(lib: DogmatikLibrary, query: string, limit = 50): SearchHit[] {
  const terms = [...query.matchAll(/[\p{L}\p{N}]+/gu)].map((m) => fold(m[0])).filter((t) => t.length >= 2);
  if (!terms.length) return [];
  let all = folded.get(lib);
  if (!all) {
    all = lib.tage.map((day) => ({ day, f: ` ${fold(`${day.titel} ${dayText(day)}`).replace(/[^\p{L}\p{N}]+/gu, ' ')} ` }));
    folded.set(lib, all);
  }
  // A word may be misspelt from its fifth letter on; the start must match.
  const heads = terms.map((t) => ` ${t.slice(0, 4)}`);
  const count = (f: string, h: string) => f.split(h).length - 1;
  const candidates = all
    .filter((x) => heads.every((h) => x.f.includes(h)))
    .map((x) => ({ ...x, n: heads.reduce((a, h) => a + count(x.f, h), 0) }))
    .sort((a, z) => z.n - a.n)
    .slice(0, Math.max(limit * 2, 100));
  const index = prepare(
    candidates.map(({ day }) => ({
      area: `Band ${day.band} · Tag ${day.tag} · ${day.abschnitt ?? day.kapitel ?? day.teil}`,
      title: day.titel,
      text: dayText(day),
      to: dayPath(day),
    })),
  );
  return search(index, query, limit);
}

const ROMAN = ['', 'I', 'II', 'III'];

/** "Pieper I, S. 90" */
export const sourceLine = (d: DogmatikDay): string => `Pieper ${ROMAN[d.band] ?? d.band}${d.seite ? `, S. ${d.seite}` : ''}`;
