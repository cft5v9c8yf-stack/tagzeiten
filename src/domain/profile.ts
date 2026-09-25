import { DEFAULT_PLAN_ID } from '../content/readingPlans';
import type { DateKey, Weekday } from './dates';
import { habitsFromPresets, mergePresets } from './habits';
import { DEFAULT_SCHEDULE, type Habit, type Profile, type Schedule } from './model';
import { getPlan, initialPositions, normalizePositions } from './readingPlan';

export function defaultProfile(today: DateKey): Profile {
  const plan = getPlan(DEFAULT_PLAN_ID);
  return {
    plan: { planId: plan.def.id, positions: initialPositions(plan) },
    habits: habitsFromPresets(),
    prayer: { daily: '', weekly: {} },
    catechism: { memorized: {}, weekOffset: 0 },
    schedule: { ...DEFAULT_SCHEDULE },
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
  const schedule: Schedule = { ...base.schedule };
  for (const k of Object.keys(schedule) as (keyof Schedule)[]) {
    const v = raw.schedule?.[k];
    if (typeof v === 'string' && TIME_RE.test(v)) schedule[k] = v;
  }
  const weekly: Partial<Record<Weekday, string>> = {};
  for (const [k, v] of Object.entries(raw.prayer?.weekly ?? {})) {
    const n = Number(k);
    if (n >= 0 && n <= 6 && typeof v === 'string') weekly[n as Weekday] = v;
  }
  return {
    plan: { planId: plan.def.id, positions: normalizePositions(plan, raw.plan?.positions) },
    habits: mergePresets(Array.isArray(raw.habits) ? raw.habits.filter(isHabit).map(cleanHabit) : base.habits),
    prayer: { daily: typeof raw.prayer?.daily === 'string' ? raw.prayer.daily : '', weekly },
    catechism: {
      memorized: { ...(raw.catechism?.memorized ?? {}) },
      weekOffset: Number.isInteger(raw.catechism?.weekOffset) ? (((raw.catechism!.weekOffset % 6) + 6) % 6) : 0,
    },
    schedule,
    theme: raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : 'system',
    texts: raw.texts === 'luther' ? 'luther' : 'ecumenical',
    createdAt: raw.createdAt ?? today,
    updatedAt: raw.updatedAt ?? 0,
  };
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
