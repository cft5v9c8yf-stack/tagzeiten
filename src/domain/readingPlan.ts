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

/* ---------------------------------------------------------------- a plan of one's own */

/** A daily amount: so many chapters, or so many minutes of reading. */
export type Amount = { unit: 'chapters' | 'minutes'; value: number };

/** The single track of a plan of one's own. */
export const OWN_TRACK = 'bibel';

const OWN_RE = /^eigen-([km])(\d+)$/;

/** Plan id of a plan of one's own, e.g. "eigen-k3" (3 chapters) or "eigen-m15" (15 minutes). */
export function ownPlanId(a: Amount): string {
  return `eigen-${a.unit === 'chapters' ? 'k' : 'm'}${a.value}`;
}

/** The amount of a plan of one's own, or undefined for a fixed plan or an unknown id. */
export function ownAmount(planId: string): Amount | undefined {
  const m = OWN_RE.exec(planId);
  if (!m) return undefined;
  const value = Number(m[2]);
  if (m[1] === 'k') return (CHAPTER_CHOICES as readonly number[]).includes(value) ? { unit: 'chapters', value } : undefined;
  return (MINUTE_CHOICES as readonly number[]).includes(value) ? { unit: 'minutes', value } : undefined;
}

export const isOwnPlan = (planId: string) => ownAmount(planId) !== undefined;

/** Chapters per portion for a book: fixed, or as many as fit into the time (at least one). */
export function chaptersPerDay(book: Book, a: Amount): number {
  if (a.unit === 'chapters') return a.value;
  const perChapter = (VERSES[book.slug] ?? book.chapters * 25) / book.chapters;
  return Math.max(1, Math.round((a.value * VERSES_PER_MINUTE) / perChapter));
}

function ownPlan(id: string, a: Amount): Plan {
  const def: PlanDef = {
    id,
    name: 'Eigener Plan',
    description:
      a.unit === 'chapters'
        ? `Täglich ${a.value === 1 ? 'ein Kapitel' : `${a.value} Kapitel`}, ab dem Buch deiner Wahl. Danach geht es in Luthers Buchreihenfolge weiter. Der Plan läuft nach Fortschritt, nicht nach Datum.`
        : `Täglich etwa ${a.value} Minuten, ab dem Buch deiner Wahl. Wie viele Kapitel das sind, richtet sich nach der Länge der Kapitel im jeweiligen Buch. Danach geht es in Luthers Buchreihenfolge weiter. Der Plan läuft nach Fortschritt, nicht nach Datum.`,
    tracks: [{ id: OWN_TRACK, label: a.unit === 'minutes' ? `Etwa ${a.value} Minuten` : 'Lesung', books: ALL_BOOKS, pattern: [1] }],
  };
  const t = def.tracks[0]!;
  const portions: Portion[] = [];
  t.books.forEach((b, i) => portions.push(...buildPortions([b], [chaptersPerDay(b, a)]).map((p) => ({ ...p, book: i }))));
  return { def, tracks: [{ def: t, portions, totalChapters: t.books.reduce((s, b) => s + b.chapters, 0) }] };
}

/* ---------------------------------------------------------------- plans */

const cache = new Map<string, Plan>();

export function getPlan(planId: string): Plan {
  const hit = cache.get(planId);
  if (hit) return hit;
  const own = ownAmount(planId);
  let plan: Plan;
  if (own) {
    plan = ownPlan(planId, own);
  } else {
    const def = PLANS.find((p) => p.id === planId) ?? PLANS.find((p) => p.id === DEFAULT_PLAN_ID) ?? PLANS[0];
    if (!def) throw new Error('No reading plans defined');
    plan = {
      def,
      tracks: def.tracks.map((t) => ({
        def: t,
        portions: buildPortions(t.books, t.pattern),
        totalChapters: t.books.reduce((s, b) => s + b.chapters, 0),
      })),
    };
  }
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
