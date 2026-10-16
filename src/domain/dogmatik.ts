/**
 * The Dogmatik: a daily reading through Francis Pieper, Christliche Dogmatik,
 * volume 1, that is also a book to look things up in.
 *
 * The text lives in data/dogmatik.json and is checked here when loaded
 * (normalizeBook): a longer file with all 365 days needs no change of code.
 * The plan runs by the reader's own progress, never by the calendar (rule 6):
 * today's section is the first one not yet read.
 */
import { addDays, isDateKey, type DateKey } from './dates';
import { prepare, search, type SearchHit } from './fulltext';

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
  /** Number of the day in the book's order, 1 … 365. */
  tag: number;
  titel: string;
  /** The doctrine (locus) it belongs to, e.g. "Einleitung". */
  teil: string;
  /** Page in the book. */
  seite?: string;
  /** Reading time in minutes. */
  minuten: number;
  /** A Bible word to begin with (an addition). */
  bibelwort?: { stelle: string; text: string };
  /** The paragraphs; footnotes stand as markers "[[313]]". */
  absaetze: string[];
  fussnoten: Record<string, string>;
  zitate: DogmatikQuote[];
  /** Core sentence of the day (an addition). */
  kernsatz?: string;
  /** A question to think about (an addition). */
  frage?: string;
}

export interface DogmatikBook {
  buch: { autor: string; titel: string; band: number; /** Days the whole plan has (365). */ umfang: number };
  /** In the book's order. */
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

function day(v: unknown): DogmatikDay | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const d = v as Record<string, unknown>;
  const tag = d.tag;
  const absaetze = Array.isArray(d.absaetze) ? d.absaetze.map(str).filter(Boolean) : [];
  if (!Number.isInteger(tag) || (tag as number) < 1 || !str(d.titel) || absaetze.length === 0) return undefined;
  const out: DogmatikDay = {
    tag: tag as number,
    titel: str(d.titel),
    teil: str(d.teil) || 'Ohne Lehrstück',
    minuten: typeof d.minuten === 'number' && d.minuten > 0 ? Math.round(d.minuten) : 3,
    absaetze,
    fussnoten: {},
    zitate: Array.isArray(d.zitate) ? d.zitate.map(quote).filter((q): q is DogmatikQuote => !!q) : [],
  };
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
 * Brings the JSON file into shape: days without number, title or text are
 * left out, a number given twice counts once, the days are put in the book's
 * order. Whatever the file holds, the app gets a usable book.
 */
export function normalizeBook(raw: unknown): DogmatikBook {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const b = (r.buch && typeof r.buch === 'object' ? r.buch : {}) as Record<string, unknown>;
  const seen = new Set<number>();
  const tage: DogmatikDay[] = [];
  for (const v of Array.isArray(r.tage) ? r.tage : []) {
    const d = day(v);
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
      band: Number.isInteger(b.band) ? (b.band as number) : 1,
      umfang: Math.max(Number.isInteger(b.umfang) ? (b.umfang as number) : 0, last),
    },
    tage,
  };
}

/** Problems in the file worth fixing (a footnote marker without its note, and the like); used by the tests. */
export function bookProblems(book: DogmatikBook): string[] {
  const out: string[] = [];
  for (const d of book.tage) {
    const texts = [...d.absaetze, ...d.zitate.map((q) => q.lat)];
    const markers = texts.flatMap((t) => [...t.matchAll(MARKER)].map((m) => m[1]!));
    for (const m of markers) if (!(m in d.fussnoten)) out.push(`Tag ${d.tag}: Fußnote ${m} fehlt`);
    for (const k of Object.keys(d.fussnoten)) if (!markers.includes(k)) out.push(`Tag ${d.tag}: Fußnote ${k} steht nicht im Text`);
    for (const q of d.zitate) if (q.nach && q.nach > d.absaetze.length) out.push(`Tag ${d.tag}: Zitat nach Absatz ${q.nach}, den es nicht gibt`);
  }
  return out;
}

/* ---------------------------------------------------------------- text */

const MARKER = /\[\[([^\]\s]+)\]\]/g;

export type TextPiece = { text: string } | { note: string };

/** A paragraph in pieces: plain text and footnote markers ("[[313]]"). */
export function pieces(text: string): TextPiece[] {
  const out: TextPiece[] = [];
  let at = 0;
  for (const m of text.matchAll(MARKER)) {
    if (m.index! > at) out.push({ text: text.slice(at, m.index) });
    out.push({ note: m[1]! });
    at = m.index! + m[0].length;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}

/** The notes in the order they stand in a text. */
export const notesIn = (text: string): string[] => [...text.matchAll(MARKER)].map((m) => m[1]!);

/** The text without markers, for search and export. */
export const plain = (text: string): string => text.replace(MARKER, '');

/** Paragraphs and quotations in reading order: each quotation after its paragraph. */
export function blocks(d: DogmatikDay): ({ kind: 'p'; text: string; no: number } | { kind: 'q'; quote: DogmatikQuote; no: number })[] {
  const out: ReturnType<typeof blocks> = [];
  d.absaetze.forEach((text, i) => {
    out.push({ kind: 'p', text, no: i + 1 });
    d.zitate.forEach((q, k) => {
      if (Math.min(q.nach ?? d.absaetze.length, d.absaetze.length) === i + 1) out.push({ kind: 'q', quote: q, no: k + 1 });
    });
  });
  return out;
}

/* ---------------------------------------------------------------- settings and progress */

export type DogmatikWhen = 'morning' | 'evening' | 'free';
export type DogmatikOrder = 'book' | 'topic';

export interface DogmatikSettings {
  /** The reading plan is used. */
  on: boolean;
  when: DogmatikWhen;
  order: DogmatikOrder;
  /** With order "topic": the doctrine read first. */
  topic?: string;
  showVerse: boolean;
  /** Core sentence and question to think about. */
  showCore: boolean;
  /** Footnotes open under their paragraph without a tap. */
  footnotesOpen: boolean;
  /** Size of the reading text, in steps from -2 to 3. */
  fontStep: number;
  /** The days read, by number, with the date they were read on. */
  read: Record<string, DateKey>;
  /** What was written to the question, by number. */
  notes: Record<string, string>;
}

export const FONT_STEPS = { min: -2, max: 3 } as const;

export const defaultDogmatik = (): DogmatikSettings => ({
  on: true,
  when: 'free',
  order: 'book',
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
  const r = raw as Partial<DogmatikSettings>;
  const read: Record<string, DateKey> = {};
  for (const [k, v] of Object.entries(r.read ?? {})) if (/^\d+$/.test(k) && isDateKey(v)) read[k] = v;
  const notes: Record<string, string> = {};
  for (const [k, v] of Object.entries(r.notes ?? {})) if (/^\d+$/.test(k) && typeof v === 'string' && v.trim()) notes[k] = v;
  const out: DogmatikSettings = {
    on: r.on !== false,
    when: r.when === 'morning' || r.when === 'evening' ? r.when : 'free',
    order: r.order === 'topic' ? 'topic' : 'book',
    showVerse: r.showVerse !== false,
    showCore: r.showCore !== false,
    footnotesOpen: r.footnotesOpen === true,
    fontStep: Number.isInteger(r.fontStep) ? Math.min(FONT_STEPS.max, Math.max(FONT_STEPS.min, r.fontStep!)) : 0,
    read,
    notes,
  };
  if (typeof r.topic === 'string' && r.topic.trim()) out.topic = r.topic;
  return out;
}

/** The doctrines in the book's order. */
export const parts = (book: DogmatikBook): string[] => [...new Set(book.tage.map((d) => d.teil))];

/** The days in reading order: the book's, or the chosen doctrine first and then the rest of the book. */
export function sequence(book: DogmatikBook, s: DogmatikSettings): DogmatikDay[] {
  if (s.order !== 'topic' || !s.topic) return book.tage;
  return [...book.tage.filter((d) => d.teil === s.topic), ...book.tage.filter((d) => d.teil !== s.topic)];
}

export const isRead = (s: DogmatikSettings, tag: number): boolean => String(tag) in s.read;

/**
 * Today's section: the one read today (the furthest on, when there were
 * several), else the first not yet read. Whoever left off three days goes on
 * where they stand; nothing is behind (rule 6). When all are read, the last.
 */
export function todaysDay(book: DogmatikBook, s: DogmatikSettings, date: DateKey): DogmatikDay | undefined {
  const seq = sequence(book, s);
  const readToday = seq.filter((d) => s.read[String(d.tag)] === date);
  return readToday.at(-1) ?? seq.find((d) => !isRead(s, d.tag)) ?? seq.at(-1);
}

/** Days read, newest first. */
export function recentlyRead(book: DogmatikBook, s: DogmatikSettings, n = 3): { day: DogmatikDay; date: DateKey }[] {
  return book.tage
    .filter((d) => isRead(s, d.tag))
    .map((d) => ({ day: d, date: s.read[String(d.tag)]! }))
    .sort((a, z) => (a.date === z.date ? z.day.tag - a.day.tag : a.date < z.date ? 1 : -1))
    .slice(0, n);
}

/** Days read in the 30 days up to `date`: documented, not judged (rule 4). */
export function readInThirtyDays(s: DogmatikSettings, date: DateKey): number {
  const from = addDays(date, -29);
  return Object.values(s.read).filter((d) => d >= from && d <= date).length;
}

/** The week of the plan a day falls in (day 47: week 7). */
export const weekOfPlan = (tag: number): number => Math.ceil(tag / 7);

export function setRead(s: DogmatikSettings, tag: number, date: DateKey | null): DogmatikSettings {
  const read = { ...s.read };
  if (date) read[String(tag)] = date;
  else delete read[String(tag)];
  return { ...s, read };
}

export function setNote(s: DogmatikSettings, tag: number, text: string): DogmatikSettings {
  const notes = { ...s.notes };
  if (text.trim()) notes[String(tag)] = text;
  else delete notes[String(tag)];
  return { ...s, notes };
}

/** Neighbours in reading order, for "Zurück" and "Weiter". */
export function neighbours(book: DogmatikBook, s: DogmatikSettings, tag: number): { prev?: DogmatikDay; next?: DogmatikDay } {
  const seq = sequence(book, s);
  const i = seq.findIndex((d) => d.tag === tag);
  return i < 0 ? {} : { prev: seq[i - 1], next: seq[i + 1] };
}

/** For the Markdown export: the days read, with the thoughts written to their questions. */
export function dogmatikToMarkdown(s: DogmatikSettings, tage: readonly DogmatikDay[]): string[] {
  const tags = [...new Set([...Object.keys(s.read), ...Object.keys(s.notes)])].map(Number).sort((a, z) => a - z);
  if (!tags.length) return [];
  const out = ['', '# Dogmatik', ''];
  for (const tag of tags) {
    const d = tage.find((x) => x.tag === tag);
    const read = s.read[String(tag)];
    out.push(`## Tag ${tag}${d ? ` · ${d.titel}` : ''}`, '');
    if (read) out.push(`Gelesen am ${new Date(`${read}T12:00:00`).toLocaleDateString('de-DE')}`, '');
    const note = s.notes[String(tag)]?.trim();
    if (note) out.push(d?.frage ? `**${d.frage}**` : '**Gedanken**', '', note, '');
  }
  return out;
}

/* ---------------------------------------------------------------- search */

export const dayPath = (tag: number): string => `/katechismus/dogmatik/${tag}`;

/** All the text of a day for the search: paragraphs, quotations, notes and additions. */
export function dayText(d: DogmatikDay): string {
  return [
    ...d.absaetze.map(plain),
    ...d.zitate.flatMap((q) => [plain(q.lat), q.de ?? '']),
    ...Object.values(d.fussnoten),
    d.bibelwort ? `${d.bibelwort.stelle} ${d.bibelwort.text}` : '',
    d.kernsatz ?? '',
    d.frage ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** The search docs of a book, prepared once per book: 365 days stay quick to search. */
const prepared = new WeakMap<DogmatikBook, ReturnType<typeof prepare>>();

export function searchBook(book: DogmatikBook, query: string, limit = 50): SearchHit[] {
  let index = prepared.get(book);
  if (!index) {
    index = prepare(
      book.tage.map((d) => ({ area: `Tag ${d.tag} · ${d.teil}`, title: d.titel, text: dayText(d), to: dayPath(d.tag) })),
    );
    prepared.set(book, index);
  }
  return search(index, query, limit);
}

/** "Pieper I, S. 90" */
export const sourceLine = (book: DogmatikBook, d: DogmatikDay): string =>
  `Pieper ${['', 'I', 'II', 'III'][book.buch.band] ?? book.buch.band}${d.seite ? `, S. ${d.seite}` : ''}`;
