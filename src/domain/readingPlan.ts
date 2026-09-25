/**
 * Reading plan logic. The plan runs by progress, not by date (rule 6):
 * there is no notion of being behind. A day receives the next portion when it
 * is first opened; marking it read moves the position on, unmarking moves it back.
 */
import {
  ALL_BOOKS,
  BIBLE_BASE_URL,
  CHAPTER_CHOICES,
  DEFAULT_PLAN_ID,
  MINUTE_CHOICES,
  PLANS,
  VERSES,
  VERSES_PER_MINUTE,
  type Book,
  type PlanDef,
  type TrackDef,
} from '../content/readingPlans';
import type { DayReading } from './model';

export interface Portion {
  /** Index into the track's book list. */
  book: number;
  from: number;
  to: number;
}

export interface Track {
  def: TrackDef;
  portions: readonly Portion[];
  totalChapters: number;
}

export interface Plan {
  def: PlanDef;
  tracks: readonly Track[];
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
    label: single ? (a.unit === 'minutes' ? `Etwa ${a.value} Minuten` : 'Lesung') : `${i + 1}. Lesung`,
    books: ALL_BOOKS,
    pattern: [1],
  }));
  const first = amounts[0]!;
  const description = single
    ? first.unit === 'chapters'
      ? `Täglich ${DESCRIBE(first)} aus dem Buch deiner Wahl. Danach geht es in Luthers Buchreihenfolge weiter. Der Plan läuft nach Fortschritt, nicht nach Datum.`
      : `Täglich etwa ${first.value} Minuten aus dem Buch deiner Wahl. Wie viele Kapitel das sind, richtet sich nach der Länge der Kapitel im jeweiligen Buch. Danach geht es in Luthers Buchreihenfolge weiter. Der Plan läuft nach Fortschritt, nicht nach Datum.`
    : `Täglich aus ${amounts.length} Büchern deiner Wahl, aus jedem so viele Kapitel, wie du festlegst. Ist ein Buch zu Ende, geht es dort mit dem nächsten in Luthers Buchreihenfolge weiter. Der Plan läuft nach Fortschritt, nicht nach Datum.`;
  return {
    def: { id, name: 'Eigener Plan', description, tracks: defs },
    tracks: defs.map((t, i) => track(t, portionsBy(t.books, (b) => [chaptersPerDay(b, amounts[i]!)]))),
  };
}

/* ---------------------------------------------------------------- plans */

const cache = new Map<string, Plan>();

/** The plan for an id; an unknown id falls back to the fixed plan. */
export function getPlan(planId: string): Plan {
  const hit = cache.get(planId);
  if (hit) return hit;
  const own = ownAmounts(planId);
  const fixed = own ? undefined : fixedAmounts(planId);
  const plan = own ? ownPlan(planId, own) : fixed ? fixedPlan(planId, fixed) : fixedPlan(DEFAULT_PLAN_ID, { at: 'base', nt: 1 });
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
  return `${b.name} ${p.from === p.to ? p.from : `${p.from}–${p.to}`}`;
}

export function portionUrl(track: Track, p: Portion): string {
  const b = track.def.books[p.book];
  if (!b) return BIBLE_BASE_URL;
  return `${BIBLE_BASE_URL}${encodeURIComponent(b.slug)}${p.from}${p.to > p.from ? `-${p.to}` : ''}`;
}

/** Chapters contained in the portions before `index` – the progress within the current round. */
export function chaptersBefore(track: Track, index: number): number {
  let s = 0;
  const end = Math.min(index, track.portions.length);
  for (let i = 0; i < end; i++) {
    const p = track.portions[i];
    if (p) s += p.to - p.from + 1;
  }
  return s;
}

/** Portion index containing the given chapter of the given book. */
export function positionFor(track: Track, book: number, chapter: number): number {
  const i = track.portions.findIndex((p) => p.book === book && chapter >= p.from && chapter <= p.to);
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
