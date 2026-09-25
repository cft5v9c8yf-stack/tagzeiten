/**
 * Reading plan logic. The plan runs by progress, not by date (rule 6):
 * there is no notion of being behind. A day receives the next portion when it
 * is first opened; marking it read moves the position on, unmarking moves it back.
 */
import { BIBLE_BASE_URL, PLANS, type Book, type PlanDef, type TrackDef } from '../content/readingPlans';
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

const cache = new Map<string, Plan>();

export function getPlan(planId: string): Plan {
  const hit = cache.get(planId);
  if (hit) return hit;
  const def = PLANS.find((p) => p.id === planId) ?? PLANS[0];
  if (!def) throw new Error('No reading plans defined');
  const plan: Plan = {
    def,
    tracks: def.tracks.map((t) => ({
      def: t,
      portions: buildPortions(t.books, t.pattern),
      totalChapters: t.books.reduce((s, b) => s + b.chapters, 0),
    })),
  };
  cache.set(planId, plan);
  return plan;
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
