import { START_PLAN_ID } from '../content/readingPlans';
import type { DateKey, Weekday } from './dates';
import { habitsFromPresets, isTimesPerWeek, mergePresets } from './habits';
import { DEFAULT_SCHEDULE, type Habit, type Profile, type Schedule, type ScheduleGroup } from './model';
import { normalizeArena } from './arena';
import { defaultWinterArcSettings, emptyWinterArc, normalizeWinterArc, normalizeWinterArcSettings } from './winterArc';
import { emptyHouse, normalizeAnswered, normalizeHouse } from './house';
import { emptyPrayer, normalizePrayer } from './prayer';
import { sortDays, WEEK } from './schedule';
import { normalizeDeclined } from './seasons';
import { carryPositions, fixedAmounts, fixedPlanId, getPlan, initialPositions, isOwnPlan, normalizePositions } from './readingPlan';

export function defaultProfile(today: DateKey): Profile {
  const plan = getPlan(START_PLAN_ID);
  return {
    plan: { planId: plan.def.id, positions: initialPositions(plan) },
    habits: habitsFromPresets(),
    prayer: emptyPrayer(),
    catechism: { memorized: {}, weekOffset: 0 },
    schedule: { ...DEFAULT_SCHEDULE },
    house: emptyHouse(),
    answered: [],
    armor: true,
    showHabitHistory: false,
    sundayRest: false,
    weekReview: true,
    showAtBed: true,
    showCompline: true,
    arena: [],
    winterArc: emptyWinterArc(),
    winterArcSettings: defaultWinterArcSettings(),
    theme: 'system',
    createdAt: today,
    updatedAt: 0,
  };
}

function declined(raw: unknown): Pick<Profile, 'seasonsDeclined'> {
  const keys = normalizeDeclined(raw);
  return keys.length ? { seasonsDeclined: keys } : {};
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Brings a stored or imported profile into the current shape: fills gaps with
 * defaults, adds new habit presets, and drops values that are out of range.
 */
export function normalizeProfile(raw: Partial<Profile> | undefined, today: DateKey): Profile {
  const base = defaultProfile(today);
  if (!raw) return base;
  const plan = getPlan(raw.plan?.planId ?? base.plan.planId);
  const schedule = cleanSchedule(raw.schedule, base.schedule);
  return {
    plan: normalizePlan(plan.def.id, raw.plan),
    habits: mergePresets(Array.isArray(raw.habits) ? raw.habits.filter(isHabit).map(cleanHabit) : base.habits),
    prayer: normalizePrayer(raw.prayer),
    catechism: {
      memorized: { ...(raw.catechism?.memorized ?? {}) },
      weekOffset: Number.isInteger(raw.catechism?.weekOffset) ? (((raw.catechism!.weekOffset % 6) + 6) % 6) : 0,
    },
    schedule,
    ...cleanScheduleDays(raw.scheduleDays, schedule),
    house: raw.house ? normalizeHouse(raw.house) : base.house,
    answered: normalizeAnswered(raw.answered),
    armor: raw.armor !== false,
    showHabitHistory: raw.showHabitHistory === true,
    sundayRest: raw.sundayRest === true,
    weekReview: raw.weekReview !== false,
    showAtBed: raw.showAtBed !== false,
    showCompline: raw.showCompline !== false,
    arena: normalizeArena(raw.arena),
    winterArc: normalizeWinterArc(raw.winterArc),
    winterArcSettings: normalizeWinterArcSettings(raw.winterArcSettings),
    ...declined(raw.seasonsDeclined),
    theme: raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : 'system',
    createdAt: raw.createdAt ?? today,
    updatedAt: raw.updatedAt ?? 0,
  };
}

function cleanSchedule(raw: Partial<Schedule> | undefined, fallback: Schedule): Schedule {
  const out: Schedule = { ...fallback };
  for (const k of Object.keys(out) as (keyof Schedule)[]) {
    const v = raw?.[k];
    if (typeof v === 'string' && TIME_RE.test(v)) out[k] = v;
  }
  return out;
}

/** Keeps each weekday in at most one group; days in none keep the times for all days. */
function cleanScheduleDays(raw: Profile['scheduleDays'], schedule: Schedule): Pick<Profile, 'scheduleDays'> {
  if (!raw || !Array.isArray(raw.groups)) return {};
  const seen = new Set<number>();
  const groups: ScheduleGroup[] = [];
  for (const g of raw.groups) {
    if (!g || !Array.isArray(g.days)) continue;
    const days = g.days.filter((d): d is Weekday => Number.isInteger(d) && d >= 0 && d <= 6 && !seen.has(d));
    days.forEach((d) => seen.add(d));
    groups.push({ days: sortDays(days), times: cleanSchedule(g.times, schedule) });
  }
  if (groups.length === 0) return {};
  return { scheduleDays: { on: raw.on === true, groups } };
}

/** "2, 1, 1, 1 im Wechsel" is no longer offered (0.37.4): one chapter of the Old Testament a day instead. */
const withoutAlternation = (planId: string): string => {
  const a = fixedAmounts(planId);
  return a?.at === 'base' ? fixedPlanId({ at: 1, nt: a.nt }) : planId;
};

function normalizePlan(planId: string, raw: Partial<Profile['plan']> | undefined): Profile['plan'] {
  // Positions of other plans stay for a return; they are checked again when used.
  let positions: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw?.positions ?? {})) {
    if (typeof v === 'number' && Number.isInteger(v) && v >= 0) positions[k] = v;
  }
  // A plan with the alternation goes on from the chapter where it stood.
  const to = withoutAlternation(planId);
  if (to !== planId) positions = carryPositions(getPlan(planId), getPlan(to), positions);
  const out: Profile['plan'] = {
    planId: to,
    positions: { ...positions, ...normalizePositions(getPlan(to), positions) },
  };
  if (typeof raw?.own === 'string' && isOwnPlan(raw.own)) out.own = raw.own;
  if (typeof raw?.fixed === 'string' && fixedAmounts(raw.fixed)) out.fixed = withoutAlternation(raw.fixed);
  return out;
}

function cleanHabit(h: Habit): Habit {
  const auto = h.auto === 'morning' || h.auto === 'vespers' || h.auto === 'compline' ? h.auto : null;
  return {
    id: h.id,
    name: h.name,
    rhythm: h.rhythm,
    auto,
    active: h.active !== false,
    preset: h.preset === true,
    focus: h.focus === true,
    ...(h.rhythm === 'weekly' && isTimesPerWeek(h.timesPerWeek) ? { timesPerWeek: h.timesPerWeek } : {}),
    ...(typeof h.note === 'string' && h.note.trim() ? { note: h.note.trim().slice(0, NOTE_MAX) } : {}),
    ...(h.rhythm === 'daily' && Array.isArray(h.days) ? { days: WEEK.filter((d) => h.days!.includes(d)) } : {}),
    ...(h.advent === true ? { advent: true as const } : {}),
    ...(h.needs === 'wife' || h.needs === 'children' || h.needs === 'family' ? { needs: h.needs } : {}),
    ...(typeof h.desert === 'string' && /^[a-z]{2,20}$/.test(h.desert) ? { desert: h.desert } : {}),
  };
}

const NOTE_MAX = 300;

function isHabit(h: unknown): h is Habit {
  if (!h || typeof h !== 'object') return false;
  const x = h as Habit;
  return (
    typeof x.id === 'string' &&
    typeof x.name === 'string' &&
    (x.rhythm === 'daily' || x.rhythm === 'weekly' || x.rhythm === 'monthly')
  );
}
