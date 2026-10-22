import { NT_BOOKS, OT_BOOKS, START_PLAN_ID } from '../../content/readingPlans';
import type { Profile } from '../../domain/model';
import {
  fixedAmounts,
  fixedPlanId,
  getPlan,
  ownAmounts,
  ownPlanId,
  positionFor,
  type Plan,
} from '../../domain/readingPlan';

/** What is read: both Testaments (the fixed plan), or only one (a plan of one's own with one track). */
export type Scope = 'both' | 'nt' | 'at';

/** Chapters a day offered for one Testament alone. */
export const SINGLE_CHOICES = [1, 2, 3] as const;

const OT = OT_BOOKS.length;

/** A place in the whole Bible: the book (index into OT + NT books) and the chapter. */
interface Place {
  book: number;
  chapter: number;
}

const OFFSET: Record<'at' | 'nt', number> = { at: 0, nt: OT };

/** Where a track of a plan stands, as a place in the whole Bible. */
function placeIn(plan: Plan, trackId: string, positions: Profile['plan']['positions']): Place | undefined {
  const track = plan.tracks.find((t) => t.def.id === trackId);
  const p = track?.portions[positions[trackId] ?? 0];
  if (!track || !p) return undefined;
  const offset = trackId === 'nt' ? OT : 0;
  return { book: offset + p.book, chapter: p.from };
}

/** The own plan of one track with a few chapters a day, if that is what runs. */
function singleAmount(planId: string): number | undefined {
  const own = ownAmounts(planId);
  const a = own?.length === 1 ? own[0]! : undefined;
  return a?.unit === 'chapters' && (SINGLE_CHOICES as readonly number[]).includes(a.value) ? a.value : undefined;
}

/** The scope of the plan that runs now; undefined for a plan the setup does not offer (several tracks, minutes …). */
export function scopeOf(profile: Profile): Scope | undefined {
  const id = profile.plan.planId;
  if (fixedAmounts(id)) return 'both';
  if (singleAmount(id) === undefined) return undefined;
  const place = placeIn(getPlan(id), 'bibel', profile.plan.positions);
  return place && place.book >= OT ? 'nt' : 'at';
}

/** The book (index into the whole Bible) and chapter the single track stands at. */
export function singlePlace(profile: Profile): Place | undefined {
  return placeIn(getPlan(profile.plan.planId), 'bibel', profile.plan.positions);
}

export const singleChapters = (profile: Profile): number => singleAmount(profile.plan.planId) ?? 1;

/** The plan to set when the scope changes, with the places the tracks start at (so nobody loses their place). */
export function changeScope(profile: Profile, from: Scope, to: Scope): { planId: string; starts: Record<string, number> } {
  const { positions, planId: current } = profile.plan;
  const cur = getPlan(current);
  const baseId = fixedAmounts(current) ? current : profile.plan.fixed && fixedAmounts(profile.plan.fixed) ? profile.plan.fixed : START_PLAN_ID;
  const base = getPlan(baseId);
  const amounts = fixedAmounts(baseId)!;
  const place = (t: 'at' | 'nt'): Place | undefined =>
    from === 'both' ? placeIn(cur, t, positions) : from === t ? placeIn(cur, 'bibel', positions) : placeIn(base, t, positions);
  const ownValue = singleAmount(current) ?? 1;
  const fixedValue = (t: 'at' | 'nt') => Math.min(3, amounts[t] === 'base' ? 1 : amounts[t]);

  if (to === 'both') {
    const next = { ...amounts, ...(from !== 'both' ? { [from]: ownValue } : {}) };
    const planId = fixedPlanId(next);
    const plan = getPlan(planId);
    const starts: Record<string, number> = {};
    for (const t of ['at', 'nt'] as const) {
      const p = place(t);
      const track = plan.tracks.find((x) => x.def.id === t)!;
      if (p) starts[t] = positionFor(track, p.book - OFFSET[t], p.chapter);
    }
    return { planId, starts };
  }
  const planId = ownPlanId([{ unit: 'chapters', value: from === 'both' ? fixedValue(to) : ownValue }]);
  const track = getPlan(planId).tracks[0]!;
  const p = place(to) ?? { book: OFFSET[to], chapter: 1 };
  return { planId, starts: { [track.def.id]: positionFor(track, p.book, p.chapter) } };
}

export const TESTAMENT_BOOKS = { at: OT_BOOKS, nt: NT_BOOKS } as const;
export const TESTAMENT_OFFSET = OFFSET;
