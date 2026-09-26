import { DEFAULT_PLAN_ID } from '../content/readingPlans';
import type { DateKey, Weekday } from './dates';
import { habitsFromPresets, mergePresets } from './habits';
import { DEFAULT_SCHEDULE, type Habit, type Profile, type Schedule, type ScheduleGroup } from './model';
import { normalizeArena } from './arena';
import { emptyPrayer, normalizePrayer } from './prayer';
import { sortDays } from './schedule';
import { fixedAmounts, getPlan, initialPositions, isOwnPlan, normalizePositions } from './readingPlan';

export function defaultProfile(today: DateKey): Profile {
  const plan = getPlan(DEFAULT_PLAN_ID);
  return {
    plan: { planId: plan.def.id, positions: initialPositions(plan) },
    habits: habitsFromPresets(),
    prayer: emptyPrayer(),
    catechism: { memorized: {}, weekOffset: 0 },
    schedule: { ...DEFAULT_SCHEDULE },
    armor: true,
    arena: [],
    theme: 'system',
    texts: 'ecumenical',
    createdAt: today,
    updatedAt: 0,
  };
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
    armor: raw.armor !== false,
    arena: normalizeArena(raw.arena),
    theme: raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : 'system',
    texts: raw.texts === 'luther' ? 'luther' : 'ecumenical',
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

function normalizePlan(planId: string, raw: Partial<Profile['plan']> | undefined): Profile['plan'] {
  // Positions of other plans stay for a return; they are checked again when used.
  const positions: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw?.positions ?? {})) {
    if (typeof v === 'number' && Number.isInteger(v) && v >= 0) positions[k] = v;
  }
  const out: Profile['plan'] = {
    planId,
    positions: { ...positions, ...normalizePositions(getPlan(planId), raw?.positions) },
  };
  if (typeof raw?.own === 'string' && isOwnPlan(raw.own)) out.own = raw.own;
  if (typeof raw?.fixed === 'string' && fixedAmounts(raw.fixed)) out.fixed = raw.fixed;
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
  };
}

function isHabit(h: unknown): h is Habit {
  if (!h || typeof h !== 'object') return false;
  const x = h as Habit;
  return (
    typeof x.id === 'string' &&
    typeof x.name === 'string' &&
    (x.rhythm === 'daily' || x.rhythm === 'weekly' || x.rhythm === 'monthly')
  );
}
