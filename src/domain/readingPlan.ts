/**
 * Reading plan logic. The plan runs by progress, not by date (rule 6):
 * there is no notion of being behind. A day receives the next portion when it
 * is first opened; marking it read moves the position on, unmarking moves it back.
 */
import {
  ALL_BOOKS,
  BEGINNER_SEQUENCE,
  BIBLE_SEQUENCE,
  CHAPTER_CHOICES,
  CHAPTER_VERSES,
  DESERT_SEQUENCE,
  JOHN_REVELATION_SEQUENCE,
  JOHN_SEQUENCE,
  NT_SEQUENCE,
  OT_BOOKS,
  PAUL_MAX_DAYS,
  PAUL_MIN_DAYS,
  PAUL_SEQUENCE,
  SECTION_PLANS,
  DEFAULT_PLAN_ID,
  MINUTE_CHOICES,
  PLANS,
  VERSES,
  VERSES_PER_MINUTE,
  type Book,
  type PlanDef,
  type Stretch,
  type TrackDef,
} from '../content/readingPlans';
import type { DayReading } from './model';
import { MAX_DURATION, MIN_DURATION } from './winterArc';

export interface Portion {
  /** Index into the track's book list. */
  book: number;
  from: number;
  to: number;
  /** Part of a single chapter (from === to): its first and last verse. */
  verses?: readonly [number, number];
  /** Plans by sections: the further pieces of the day's portion, e.g. the next book. */
  more?: readonly Portion[];
}

export interface Track {
  def: TrackDef;
  portions: readonly Portion[];
  totalChapters: number;
}

export interface Plan {
  def: PlanDef;
  tracks: readonly Track[];
  /** Plans by sections: what kind of plan it is; the sections are the portions of its first track. */
  kind?: SectionKind;
}

export type Positions = Record<string, number>;

/** Splits books into portions following a repeating pattern, never across a book boundary. */
export function buildPortions(books: readonly Book[], pattern: readonly number[]): Portion[] {
  if (pattern.length === 0 || pattern.some((n) => n < 1)) throw new Error('Invalid pattern');
  const out: Portion[] = [];
  let step = 0;
  books.forEach((b, book) => {
    let c = 1;
    while (c <= b.chapters) {
      const want = pattern[step % pattern.length] ?? 1;
      step++;
      const n = Math.min(want, b.chapters - c + 1);
      out.push({ book, from: c, to: c + n - 1 });
      c += n;
    }
  });
  return out;
}

/* ---------------------------------------------------------------- daily amounts */

/** A daily amount: so many chapters, or so many minutes of reading. */
export type Amount = { unit: 'chapters' | 'minutes'; value: number };

const isChapterChoice = (n: number) => (CHAPTER_CHOICES as readonly number[]).includes(n);

function parseAmount(code: string): Amount | undefined {
  const m = /^([km])(\d+)$/.exec(code);
  if (!m) return undefined;
  const value = Number(m[2]);
  if (m[1] === 'k') return isChapterChoice(value) ? { unit: 'chapters', value } : undefined;
  return (MINUTE_CHOICES as readonly number[]).includes(value) ? { unit: 'minutes', value } : undefined;
}

const amountCode = (a: Amount) => `${a.unit === 'chapters' ? 'k' : 'm'}${a.value}`;

/** Chapters per portion for a book: fixed, or as many as fit into the time (at least one). */
export function chaptersPerDay(book: Book, a: Amount): number {
  if (a.unit === 'chapters') return a.value;
  const perChapter = (VERSES[book.slug] ?? book.chapters * 25) / book.chapters;
  return Math.max(1, Math.round((a.value * VERSES_PER_MINUTE) / perChapter));
}

/** Portions of a track whose size is set per book, never across a book boundary. */
function portionsBy(books: readonly Book[], size: (b: Book) => readonly number[]): Portion[] {
  return books.flatMap((b, i) => buildPortions([b], size(b)).map((p) => ({ ...p, book: i })));
}

function track(def: TrackDef, portions: Portion[]): Track {
  return { def, portions, totalChapters: def.books.reduce((s, b) => s + b.chapters, 0) };
}

/* ---------------------------------------------------------------- Old and New Testament */

/** Chapters a day in the fixed plan; "base" is the 2-1-1-1 pattern of the Old Testament. */
export type FixedAmounts = { at: number | 'base'; nt: number };

const FIXED_RE = /^atnt-(g|\d+)-(\d+)$/;

export function fixedPlanId(a: FixedAmounts): string {
  if (a.at === 'base' && a.nt === 1) return DEFAULT_PLAN_ID;
  return `atnt-${a.at === 'base' ? 'g' : a.at}-${a.nt}`;
}

/** The daily amounts of the fixed plan, or undefined for a plan of one's own or an unknown id. */
export function fixedAmounts(planId: string): FixedAmounts | undefined {
  if (planId === DEFAULT_PLAN_ID) return { at: 'base', nt: 1 };
  const m = FIXED_RE.exec(planId);
  if (!m) return undefined;
  const at = m[1] === 'g' ? 'base' : Number(m[1]);
  const nt = Number(m[2]);
  if ((at !== 'base' && !isChapterChoice(at)) || !isChapterChoice(nt)) return undefined;
  return { at, nt };
}

const chapters = (n: number) => (n === 1 ? 'einem Kapitel' : `${n} Kapiteln`);

function fixedPlan(id: string, a: FixedAmounts): Plan {
  const base = PLANS.find((p) => p.id === DEFAULT_PLAN_ID) ?? PLANS[0];
  if (!base) throw new Error('No reading plans defined');
  if (id === DEFAULT_PLAN_ID) {
    return { def: base, tracks: base.tracks.map((t) => track(t, buildPortions(t.books, t.pattern))) };
  }
  const tracks = base.tracks.map((t) => ({
    ...t,
    pattern: t.id === 'at' ? (a.at === 'base' ? t.pattern : [a.at]) : [a.nt],
  }));
  const def: PlanDef = {
    id,
    name: 'Altes und Neues Testament',
    description: `Altes Testament ${a.at === 'base' ? 'im Wechsel von zwei und einem Kapitel' : `mit täglich ${chapters(a.at)}`}, Neues Testament mit täglich ${chapters(a.nt)}, in Luthers Buchreihenfolge. Der Plan läuft nach Fortschritt, nicht nach Datum: wer aussetzt, macht beim nächsten Abschnitt weiter.`,
    tracks,
  };
  return { def, tracks: tracks.map((t) => track(t, buildPortions(t.books, t.pattern))) };
}

/* ---------------------------------------------------------------- a plan of one's own */

/** Track ids of a plan of one's own: "bibel", "bibel2", … */
export const OWN_TRACK = 'bibel';
export const MAX_OWN_TRACKS = 4;
export const ownTrackId = (i: number) => (i === 0 ? OWN_TRACK : `${OWN_TRACK}${i + 1}`);

/**
 * Plan id of a plan of one's own: one amount per book read side by side,
 * e.g. "eigen-k3" (one book, 3 chapters), "eigen-m15" (15 minutes),
 * "eigen-k2.k1" (two books, 2 and 1 chapters).
 */
export function ownPlanId(amounts: readonly Amount[]): string {
  return `eigen-${amounts.map(amountCode).join('.')}`;
}

/** The amounts of a plan of one's own, or undefined for the fixed plan or an unknown id. */
export function ownAmounts(planId: string): Amount[] | undefined {
  if (!planId.startsWith('eigen-')) return undefined;
  const codes = planId.slice(6).split('.');
  if (codes.length < 1 || codes.length > MAX_OWN_TRACKS) return undefined;
  const out = codes.map(parseAmount);
  return out.every((a): a is Amount => a !== undefined) ? out : undefined;
}

export const isOwnPlan = (planId: string) => ownAmounts(planId) !== undefined;

const DESCRIBE = (a: Amount) =>
  a.unit === 'chapters' ? (a.value === 1 ? 'ein Kapitel' : `${a.value} Kapitel`) : `etwa ${a.value} Minuten`;

function ownPlan(id: string, amounts: readonly Amount[]): Plan {
  const single = amounts.length === 1;
  const defs: TrackDef[] = amounts.map((a, i) => ({
    id: ownTrackId(i),
    label: single
      ? a.unit === 'minutes'
        ? `Etwa ${a.value} Minuten`
        : 'Lesung'
      : `${i + 1}. Lesung${a.unit === 'minutes' ? ` · ${a.value} Min.` : ''}`,
    books: ALL_BOOKS,
    pattern: [1],
  }));
  const first = amounts[0]!;
  const description = single
    ? first.unit === 'chapters'
      ? `Täglich ${DESCRIBE(first)} aus dem Buch deiner Wahl. Danach geht es in Luthers Buchreihenfolge weiter. Der Plan läuft nach Fortschritt, nicht nach Datum.`
      : `Täglich etwa ${first.value} Minuten aus dem Buch deiner Wahl. Wie viele Kapitel das sind, richtet sich nach der Länge der Kapitel im jeweiligen Buch. Danach geht es in Luthers Buchreihenfolge weiter. Der Plan läuft nach Fortschritt, nicht nach Datum.`
    : `Täglich aus ${amounts.length} Büchern deiner Wahl, aus jedem so viele Kapitel oder so viel Zeit, wie du festlegst. Ist ein Buch zu Ende, geht es dort mit dem nächsten in Luthers Buchreihenfolge weiter. Der Plan läuft nach Fortschritt, nicht nach Datum.`;
  return {
    def: { id, name: 'Eigener Plan', description, tracks: defs },
    tracks: defs.map((t, i) => track(t, portionsBy(t.books, (b) => [chaptersPerDay(b, amounts[i]!)]))),
  };
}

/* ---------------------------------------------------------------- plans by sections (1.16) */

/**
 * Plans by sections: a sequence of books (or stretches of them) spread evenly
 * over a number of sections, one a day. With fewer sections than chapters the
 * chapters are grouped; with more, chapters are divided by verses, where their
 * verses are known. Still by progress, not by date (rule 6).
 */
export type SectionKind = 'beginner' | 'nt90' | 'paul' | 'john' | 'year' | 'desert';

const BOOK_BY_SLUG = new Map(ALL_BOOKS.map((b) => [b.slug, b]));

/** The books of a sequence, each once, in the order they first appear. */
function booksOf(seq: readonly Stretch[]): Book[] {
  return [...new Set(seq.map((s) => s.slug))].map((slug) => {
    const b = BOOK_BY_SLUG.get(slug);
    if (!b) throw new Error(`Unknown book ${slug}`);
    return b;
  });
}

/** Every chapter of a sequence, in order, as book index and chapter. */
function chaptersOf(seq: readonly Stretch[], books: readonly Book[]): { book: number; chapter: number }[] {
  return seq.flatMap((s) => {
    const book = books.findIndex((b) => b.slug === s.slug);
    const from = s.from ?? 1;
    const to = s.to ?? books[book]!.chapters;
    return Array.from({ length: to - from + 1 }, (_, i) => ({ book, chapter: from + i }));
  });
}

/** Consecutive chapters of one book joined into pieces: the first carries the rest. */
function joined(chapters: readonly { book: number; chapter: number }[]): Portion {
  const pieces: Portion[] = [];
  for (const c of chapters) {
    const last = pieces[pieces.length - 1];
    if (last && last.book === c.book && last.to === c.chapter - 1) last.to = c.chapter;
    else pieces.push({ book: c.book, from: c.chapter, to: c.chapter });
  }
  const [first, ...more] = pieces;
  return more.length ? { ...first!, more } : first!;
}

/** The sections a sequence is spread over; never more than chapters, unless their verses are known. */
export function maxSections(seq: readonly Stretch[]): number {
  const books = booksOf(seq);
  const chapters = chaptersOf(seq, books);
  const versed = chapters.every((c) => CHAPTER_VERSES[books[c.book]!.slug]?.[c.chapter - 1]);
  return versed ? chapters.reduce((s, c) => s + CHAPTER_VERSES[books[c.book]!.slug]![c.chapter - 1]!, 0) : chapters.length;
}

/**
 * Spreads a sequence over `count` sections. Fewer sections than chapters: the
 * chapters are shared out evenly, the remainder spread across the plan. More:
 * each chapter is divided into parts of about the same number of verses, the
 * longest chapters first.
 */
export function spreadSections(seq: readonly Stretch[], count: number): { books: Book[]; portions: Portion[] } {
  const books = booksOf(seq);
  const chapters = chaptersOf(seq, books);
  const n = chapters.length;
  const days = Math.max(1, Math.min(Math.round(count), maxSections(seq)));
  if (days <= n) {
    const portions = Array.from({ length: days }, (_, i) =>
      joined(chapters.slice(Math.floor((i * n) / days), Math.floor(((i + 1) * n) / days))),
    );
    return { books, portions };
  }
  const verses = chapters.map((c) => CHAPTER_VERSES[books[c.book]!.slug]![c.chapter - 1]!);
  const parts = chapters.map(() => 1);
  for (let extra = days - n; extra > 0; extra--) {
    let best = 0;
    verses.forEach((v, i) => {
      if (v / parts[i]! > verses[best]! / parts[best]!) best = i;
    });
    parts[best]! += 1;
  }
  const portions = chapters.flatMap((c, i) => {
    const v = verses[i]!;
    const k = parts[i]!;
    if (k === 1) return [{ book: c.book, from: c.chapter, to: c.chapter }];
    return Array.from({ length: k }, (_, j) => ({
      book: c.book,
      from: c.chapter,
      to: c.chapter,
      verses: [Math.floor((j * v) / k) + 1, Math.floor(((j + 1) * v) / k)] as const,
    }));
  });
  return { books, portions };
}

const SECTION_RE = /^(einsteiger|einsteiger-psalm|nt90|johannes|johannes-offb|jahr|paulus-(\d+)|wueste-(\d+))$/;

/** Plan id of "Mit Paulus unterwegs" over so many days. */
export const paulPlanId = (days: number) => `paulus-${days}`;
/** Plan id of the Wüstenzeit's "Bewährung und Nachfolge" over so many days. */
export const desertPlanId = (days: number) => `wueste-${days}`;

const validPaulDays = (d: number) => Number.isInteger(d) && d >= PAUL_MIN_DAYS && d <= PAUL_MAX_DAYS;
const validDesertDays = (d: number) => Number.isInteger(d) && d >= MIN_DURATION && d <= MAX_DURATION;

/** The kind of a plan by sections, or undefined for the fixed plan, a plan of one's own or an unknown id. */
export function sectionKind(planId: string): SectionKind | undefined {
  const m = SECTION_RE.exec(planId);
  if (!m) return undefined;
  if (m[2] !== undefined) return validPaulDays(Number(m[2])) ? 'paul' : undefined;
  if (m[3] !== undefined) return validDesertDays(Number(m[3])) ? 'desert' : undefined;
  const kinds: Record<string, SectionKind> = {
    einsteiger: 'beginner',
    'einsteiger-psalm': 'beginner',
    nt90: 'nt90',
    johannes: 'john',
    'johannes-offb': 'john',
    jahr: 'year',
  };
  return kinds[planId];
}

/** The number in a plan id with a chosen duration ("paulus-40"), else undefined. */
export const sectionDays = (planId: string): number | undefined => {
  const m = /-(\d+)$/.exec(planId);
  return m && sectionKind(planId) ? Number(m[1]) : undefined;
};

/** The track of "Bewährung und Nachfolge". */
export const DESERT_TRACK = 'wueste';

/** Psalms read beside the beginners' plan, one a day. */
export const PSALM_TRACK = 'psalm';

function sectionPlan(id: string, kind: SectionKind): Plan {
  const spec: Record<SectionKind, () => { seq: readonly Stretch[]; count: number; track: string; label: string }> = {
    beginner: () => ({ seq: BEGINNER_SEQUENCE, count: 59, track: 'einsteiger', label: 'Lesung' }),
    nt90: () => ({ seq: NT_SEQUENCE, count: 90, track: 'nt90', label: 'NT' }),
    paul: () => ({ seq: PAUL_SEQUENCE, count: sectionDays(id)!, track: 'paulus', label: 'Lesung' }),
    john: () => ({
      seq: id === 'johannes-offb' ? JOHN_REVELATION_SEQUENCE : JOHN_SEQUENCE,
      count: id === 'johannes-offb' ? 50 : 28,
      track: 'johannes',
      label: 'Lesung',
    }),
    year: () => ({ seq: BIBLE_SEQUENCE, count: 365, track: 'jahr', label: 'Bibel' }),
    desert: () => ({ seq: DESERT_SEQUENCE, count: sectionDays(id)!, track: DESERT_TRACK, label: 'Lesung' }),
  };
  const s = spec[kind]();
  const { books, portions } = spreadSections(s.seq, s.count);
  const main: TrackDef = { id: s.track, label: s.label, books, pattern: [1] };
  const tracks: Track[] = [{ def: main, portions, totalChapters: chaptersOf(s.seq, books).length }];
  if (id === 'einsteiger-psalm') {
    const psalms = OT_BOOKS.filter((b) => b.slug === 'Psalm');
    tracks.push(track({ id: PSALM_TRACK, label: 'Psalm', books: psalms, pattern: [1] }, buildPortions(psalms, [1])));
  }
  const info = SECTION_PLANS[kind];
  return { def: { id, name: info.name, description: info.description, tracks: tracks.map((t) => t.def) }, tracks, kind };
}

/** Where a plan by sections stands: section so many of so many. Progress, not a rating (rule 4). */
export function sectionOf(plan: Plan, reading: Pick<DayReading, 'portions'>): { section: number; sections: number } | undefined {
  const main = plan.tracks[0];
  if (!plan.kind || !main) return undefined;
  const i = reading.portions[main.def.id];
  return i === undefined ? undefined : { section: i + 1, sections: main.portions.length };
}

/* ---------------------------------------------------------------- plans */

const cache = new Map<string, Plan>();

/** The plan for an id; an unknown id falls back to the fixed plan. */
export function getPlan(planId: string): Plan {
  const hit = cache.get(planId);
  if (hit) return hit;
  const own = ownAmounts(planId);
  const fixed = own ? undefined : fixedAmounts(planId);
  const kind = own || fixed ? undefined : sectionKind(planId);
  const plan = own
    ? ownPlan(planId, own)
    : fixed
      ? fixedPlan(planId, fixed)
      : kind
        ? sectionPlan(planId, kind)
        : fixedPlan(DEFAULT_PLAN_ID, { at: 'base', nt: 1 });
  cache.set(planId, plan);
  return plan;
}

/**
 * Carries the place in the Bible from one plan to another: a track the new plan
 * shares with the old one (by id) starts at the chapter where the old one stood.
 * Positions of tracks the new plan does not have are kept for a later return.
 */
export function carryPositions(from: Plan, to: Plan, positions: Positions): Positions {
  const out = { ...positions };
  for (const t of to.tracks) {
    const old = from.tracks.find((o) => o.def.id === t.def.id);
    const p = old?.portions[positions[t.def.id] ?? 0];
    if (old && p) out[t.def.id] = positionFor(t, p.book, p.from);
  }
  return out;
}

export function initialPositions(plan: Plan): Positions {
  return Object.fromEntries(plan.tracks.map((t) => [t.def.id, 0]));
}

/** Keeps positions within range; unknown tracks are dropped, missing ones start at 0. */
export function normalizePositions(plan: Plan, positions: Partial<Positions> | undefined): Positions {
  const out: Positions = {};
  for (const t of plan.tracks) {
    const v = positions?.[t.def.id];
    out[t.def.id] = typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < t.portions.length ? v : 0;
  }
  return out;
}

export function portionAt(track: Track, index: number): Portion | undefined {
  return track.portions[index];
}

export function portionLabel(track: Track, p: Portion): string {
  const b = track.def.books[p.book];
  if (!b) return '';
  const chapters = p.from === p.to ? `${p.from}${p.verses ? `,${p.verses[0]}–${p.verses[1]}` : ''}` : `${p.from}–${p.to}`;
  const rest = (p.more ?? []).map((m) => portionLabel(track, m)).filter(Boolean);
  return [`${b.name} ${chapters}`, ...rest].join('; ');
}

/** The pieces of a portion: itself and those it carries. */
const piecesOf = (p: Portion): Portion[] => [p, ...(p.more ?? [])];

/** Chapters contained in the portions before `index` – the progress within the current round. */
export function chaptersBefore(track: Track, index: number): number {
  let s = 0;
  const end = Math.min(index, track.portions.length);
  for (let i = 0; i < end; i++) {
    for (const q of piecesOf(track.portions[i] ?? { book: 0, from: 1, to: 0 })) s += q.verses ? 0 : q.to - q.from + 1;
  }
  return s;
}

/** Portion index containing the given chapter of the given book. */
export function positionFor(track: Track, book: number, chapter: number): number {
  const i = track.portions.findIndex((p) => piecesOf(p).some((q) => q.book === book && chapter >= q.from && chapter <= q.to));
  return i < 0 ? 0 : i;
}

const next = (track: Track, i: number) => (i + 1) % track.portions.length;

/** The reading assigned to a new day: the current position of every track. */
export function assignReading(plan: Plan, positions: Positions): DayReading {
  return { planId: plan.def.id, portions: { ...normalizePositions(plan, positions) }, done: false };
}

/**
 * Marks a day's reading as read or unread and returns the new plan positions.
 * Reading moves each track on by one portion, if the plan still stands at this
 * day's portion. Unreading moves it back, if nothing was read after it.
 * After the last portion a track starts over (a new round, not a debt).
 */
export function markRead(
  plan: Plan,
  reading: DayReading,
  positions: Positions,
  done: boolean,
): { reading: DayReading; positions: Positions } {
  if (reading.done === done) return { reading, positions };
  const pos = { ...normalizePositions(plan, positions) };
  for (const t of plan.tracks) {
    const id = t.def.id;
    const mine = reading.portions[id];
    if (mine === undefined) continue;
    if (done && pos[id] === mine) pos[id] = next(t, mine);
    if (!done && pos[id] === next(t, mine)) pos[id] = mine;
  }
  return { reading: { ...reading, done }, positions: pos };
}

/** Whether a plan id names a plan (and does not fall back to the fixed one). */
export const isKnownPlan = (planId: string): boolean => getPlan(planId).def.id === planId;
