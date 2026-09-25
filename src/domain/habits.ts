/**
 * Habits: done for a day, a week (Mon–Sun) or a calendar month.
 * There is no streak, chain or score anywhere (rule 4).
 */
import { HABIT_PRESETS } from '../content/habits';
import { addDays, fromKey, mondayOf, toKey, type DateKey } from './dates';
import type { Day, Habit, Rhythm } from './model';

export type DayLookup = (date: DateKey) => Day | undefined;

export function habitsFromPresets(): Habit[] {
  return HABIT_PRESETS.map((p) => ({ ...p, preset: true, focus: false }));
}

/**
 * Adds presets introduced by a later app version, inactive, without touching
 * the user's own settings.
 */
export function mergePresets(habits: readonly Habit[]): Habit[] {
  const out = habits.map((h) => ({ ...h }));
  for (const p of HABIT_PRESETS) {
    if (!out.some((h) => h.id === p.id)) out.push({ ...p, active: false, preset: true, focus: false });
  }
  return out;
}

/** Whether the habit was done on this very day. Auto habits follow the orders. */
export function isDoneOn(habit: Habit, day: Day | undefined): boolean {
  if (!day) return false;
  switch (habit.auto) {
    case 'morning':
      return day.morning.done;
    case 'vespers':
      return day.evening.vespersDone;
    case 'compline':
      return day.evening.complineDone;
    default:
      return !!day.habits[habit.id];
  }
}

/** All dates of the period (day, week, month) that contains `date`. */
export function periodDates(rhythm: Rhythm, date: DateKey): DateKey[] {
  if (rhythm === 'daily') return [date];
  if (rhythm === 'weekly') {
    const monday = mondayOf(date);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }
  const d = fromKey(date);
  const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => toKey(new Date(d.getFullYear(), d.getMonth(), i + 1)));
}

/** The date within the period on which the habit was recorded, if any. */
export function doneDateInPeriod(habit: Habit, date: DateKey, lookup: DayLookup): DateKey | undefined {
  return periodDates(habit.rhythm, date).find((k) => isDoneOn(habit, lookup(k)));
}

export function isDoneInPeriod(habit: Habit, date: DateKey, lookup: DayLookup): boolean {
  return doneDateInPeriod(habit, date, lookup) !== undefined;
}

/**
 * Whether the user may toggle the habit for `date`. Auto habits never,
 * future days never. For weekly and monthly habits the toggle lives on the day
 * it was recorded; once done on another day of the period it is shown as done.
 */
export function canToggle(habit: Habit, date: DateKey, today: DateKey, lookup: DayLookup): boolean {
  if (habit.auto) return false;
  if (date > today) return false;
  if (habit.rhythm === 'daily') return true;
  const doneOn = doneDateInPeriod(habit, date, lookup);
  return doneOn === undefined || doneOn === date;
}

/** Returns the day with the habit toggled. Throws for auto habits: they are derived. */
export function toggleHabit(day: Day, habit: Habit): Day {
  if (habit.auto) throw new Error(`Habit ${habit.id} is derived from the orders`);
  return { ...day, habits: { ...day.habits, [habit.id]: !day.habits[habit.id] } };
}

export function addHabit(habits: readonly Habit[], name: string, rhythm: Rhythm, id: string): Habit[] {
  const trimmed = name.trim();
  if (!trimmed) return [...habits];
  return [...habits, { id, name: trimmed, rhythm, auto: null, active: true, preset: false, focus: false }];
}

export function renameHabit(habits: readonly Habit[], id: string, name: string): Habit[] {
  const trimmed = name.trim();
  if (!trimmed) return [...habits];
  return habits.map((h) => (h.id === id && !h.preset ? { ...h, name: trimmed } : h));
}

/** Only own habits can be removed; presets are switched off instead. */
export function removeHabit(habits: readonly Habit[], id: string): Habit[] {
  return habits.filter((h) => h.id !== id || h.preset);
}

export function setHabitActive(habits: readonly Habit[], id: string, active: boolean): Habit[] {
  return habits.map((h) => (h.id === id ? { ...h, active } : h));
}

export function setHabitFocus(habits: readonly Habit[], id: string, focus: boolean): Habit[] {
  return habits.map((h) => (h.id === id ? { ...h, focus } : h));
}

export const RHYTHM_ORDER: readonly Rhythm[] = ['daily', 'weekly', 'monthly'];

/** Habits of one rhythm in the user's order. */
export function habitsOfRhythm(habits: readonly Habit[], rhythm: Rhythm): Habit[] {
  return habits.filter((h) => h.rhythm === rhythm);
}

/** Whether the habit can move one place up or down within its group. */
export function canMoveHabit(habits: readonly Habit[], id: string, direction: 'up' | 'down'): boolean {
  const h = habits.find((x) => x.id === id);
  if (!h) return false;
  const group = habitsOfRhythm(habits, h.rhythm);
  const i = group.findIndex((x) => x.id === id);
  return direction === 'up' ? i > 0 : i < group.length - 1;
}

/**
 * Moves a habit one place up or down within its rhythm group, by swapping it
 * with its neighbour of the same rhythm. Other groups keep their order.
 */
export function moveHabit(habits: readonly Habit[], id: string, direction: 'up' | 'down'): Habit[] {
  const out = [...habits];
  const from = out.findIndex((h) => h.id === id);
  const h = out[from];
  if (!h) return out;
  const step = direction === 'up' ? -1 : 1;
  let to = from + step;
  while (to >= 0 && to < out.length && out[to]!.rhythm !== h.rhythm) to += step;
  if (to < 0 || to >= out.length) return out;
  out[from] = out[to]!;
  out[to] = h;
  return out;
}

export function newHabitId(now: number = Date.now()): string {
  return `own-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
