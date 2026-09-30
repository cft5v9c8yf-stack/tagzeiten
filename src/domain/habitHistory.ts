/**
 * The last weeks of the habits, for the optional overview in the Rückblick.
 * Documentation, not assessment (rule 4): counts per week, no percentages,
 * no trend, no streak.
 */
import { addDays, mondayOf, type DateKey } from './dates';
import { isDoneInPeriod, isDoneOn, isPerDay, type DayLookup } from './habits';
import type { Habit } from './model';

export const HISTORY_WEEKS = 8;

export interface HabitWeek {
  /** Monday of the week. */
  monday: DateKey;
  /** Days of the week up to today (7 for past weeks). */
  days: number;
  /** Habits kept day by day: days done; weekly and monthly habits: 1 if recorded in the week, else 0. */
  done: number;
}

/** The last `weeks` weeks up to the one containing `today`, oldest first. */
export function habitWeeks(habit: Habit, today: DateKey, lookup: DayLookup, weeks = HISTORY_WEEKS): HabitWeek[] {
  const current = mondayOf(today);
  return Array.from({ length: weeks }, (_, i) => {
    const monday = addDays(current, -7 * (weeks - 1 - i));
    const dates = Array.from({ length: 7 }, (_, d) => addDays(monday, d)).filter((k) => k <= today);
    if (isPerDay(habit)) {
      return { monday, days: dates.length, done: dates.filter((k) => isDoneOn(habit, lookup(k))).length };
    }
    // Weekly and monthly: was it recorded on a day of this week?
    const done = dates.some((k) => isDoneOn(habit, lookup(k))) ? 1 : 0;
    return { monday, days: dates.length, done };
  });
}

/** Monthly habits: the current and the two months before, oldest first. */
export function habitMonths(habit: Habit, today: DateKey, lookup: DayLookup, months = 3): { month: DateKey; done: boolean }[] {
  const [y, m] = today.split('-').map(Number) as [number, number];
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(y, m - 1 - (months - 1 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    return { month: key, done: isDoneInPeriod(habit, key, lookup) };
  });
}
