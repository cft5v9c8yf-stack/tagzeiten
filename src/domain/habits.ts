/**
 * Habits: done for a day, a week (Mon–Sun) or a calendar month.
 * There is no streak, chain or score anywhere (rule 4).
 */
import { DESERT_HABITS, type Follow } from '../content/desert';
import { HABIT_NEEDS, HABIT_PRESETS, READING_HABIT, RENAMED_PRESETS, WELL_HABIT } from '../content/habits';
import { houseHas, type House } from './house';
import { addDays, fromKey, mondayOf, toKey, WEEKDAY_LONG, WEEKDAY_SHORT, type DateKey, type Weekday } from './dates';
import type { Day, Habit, Rhythm } from './model';

export type DayLookup = (date: DateKey) => Day | undefined;

/** Whether a habit fits the house: those about wife or children wait until they are entered. */
export const fitsHouse = (h: Habit, house: House): boolean => houseHas(house, h.needs ?? HABIT_NEEDS[h.id]);

/** The habit of the Abendbrunnen is invisible while the Abendbrunnen is switched off. */
export const shownHabit = (h: Habit, wellOn: boolean): boolean => h.id !== WELL_HABIT || wellOn;

const fromPreset = ({ activeOnUpdate: _, ...p }: (typeof HABIT_PRESETS)[number], active: boolean): Habit => ({
  ...p,
  active,
  preset: true,
  focus: false,
});

export function habitsFromPresets(): Habit[] {
  return HABIT_PRESETS.map((p) => fromPreset(p, p.active));
}

/**
 * Adds presets introduced by a later app version without touching the user's
 * own settings: inactive (unless the preset replaces an earlier control), placed
 * after the preset that precedes it.
 */
export function mergePresets(habits: readonly Habit[]): Habit[] {
  const out = habits.map((h) => {
    const r = RENAMED_PRESETS[h.id];
    return r && h.name === r.from ? { ...h, name: r.to } : { ...h };
  });
  HABIT_PRESETS.forEach((p, i) => {
    if (out.some((h) => h.id === p.id)) return;
    const habit = fromPreset(p, !!p.activeOnUpdate);
    const before = i > 0 ? out.findIndex((h) => h.id === HABIT_PRESETS[i - 1]!.id) : -1;
    if (before >= 0) out.splice(before + 1, 0, habit);
    else out.push(habit);
  });
  return out;
}

/** How many days a week a weekly habit may be meant for (1 = once, the default). */
export const TIMES_PER_WEEK = [1, 2, 3, 4, 5, 6] as const;

export function isTimesPerWeek(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 2 && n <= 6;
}

/**
 * Whether the habit is recorded day by day: daily habits, and weekly habits meant
 * for several days of the week ("3-mal in der Woche").
 */
export function isPerDay(habit: Habit): boolean {
  return habit.rhythm === 'daily' || (habit.rhythm === 'weekly' && isTimesPerWeek(habit.timesPerWeek));
}

/** Monday first, as the week is shown. */
export const WEEKDAY_ORDER: readonly Weekday[] = [1, 2, 3, 4, 5, 6, 0];

/** Whether a daily habit is meant for fixed weekdays only (all seven count as none). */
export function hasDays(habit: Habit): boolean {
  return habit.rhythm === 'daily' && !habit.auto && Array.isArray(habit.days) && habit.days.length > 0 && habit.days.length < 7;
}

/** The weekdays as a quiet note: "am Samstag" for one, "Mo, Do" for several. */
export function daysLabel(days: readonly Weekday[]): string {
  const ordered = WEEKDAY_ORDER.filter((d) => days.includes(d));
  return ordered.length === 1 ? `am ${WEEKDAY_LONG[ordered[0]!]}` : ordered.map((d) => WEEKDAY_SHORT[d]).join(', ');
}

/** Days of the week containing `date` on which the habit was recorded. */
export function daysDoneInWeek(habit: Habit, date: DateKey, lookup: DayLookup): number {
  return periodDates('weekly', date).filter((k) => isDoneOn(habit, lookup(k))).length;
}

const FOLLOWS = new Map(DESERT_HABITS.flatMap((o) => (o.follows ? [[o.id, o.follows] as const] : [])));

const KEPT_BY: Record<Follow, (d: Day) => boolean> = {
  atBed: (d) => d.morning.atBed || d.morning.done,
  stillTime: (d) => d.morning.done,
  psalm: (d) => d.morning.done || d.evening.vespersDone,
  blessings: (d) => (d.morning.atBed || d.morning.done) && d.evening.complineDone,
  // The short Nachtgebet has no examination.
  examination: (d) => d.evening.complineDone && d.evening.complineForm === 'full',
  thanks: (d) => d.evening.thanks.some((t) => !!t?.trim()),
};

/** What in the orders keeps a habit of the Wüstenzeit, if anything (see content/desert.ts). */
export const followOf = (habit: Pick<Habit, 'id'>): Follow | undefined => FOLLOWS.get(habit.id);

/**
 * Whether the orders already kept the habit on this day: the Morgensegen with
 * "Am Bett", the thanks with a line written down. Then it is ticked without a
 * second tap; on other days it is ticked by hand.
 */
export function keptByOrder(habit: Pick<Habit, 'id'>, day: Day | undefined): boolean {
  const f = FOLLOWS.get(habit.id);
  return !!f && !!day && KEPT_BY[f](day);
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
      // Reading the Bible is kept with the day's portion, so the plan can move on.
      if (habit.id === READING_HABIT) return !!day.reading?.done;
      return !!day.habits[habit.id] || keptByOrder(habit, day);
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
 * future days never, nor a day the orders already kept it on. For weekly and monthly habits the toggle lives on the day
 * it was recorded; once done on another day of the period it is shown as done.
 */
export function canToggle(habit: Habit, date: DateKey, today: DateKey, lookup: DayLookup): boolean {
  if (habit.auto) return false;
  if (date > today) return false;
  if (keptByOrder(habit, lookup(date))) return false;
  // A past day can only be ticked if it had a portion; nothing is owed for the others (rule 6).
  if (habit.id === READING_HABIT) return date === today || !!lookup(date)?.reading;
  if (isPerDay(habit)) return true;
  const doneOn = doneDateInPeriod(habit, date, lookup);
  return doneOn === undefined || doneOn === date;
}

/**
 * Returns the day with the habit toggled. Throws for auto habits (derived from
 * the orders) and for the reading habit, which goes through Store.toggleHabit.
 */
export function toggleHabit(day: Day, habit: Habit): Day {
  if (habit.auto) throw new Error(`Habit ${habit.id} is derived from the orders`);
  if (habit.id === READING_HABIT) throw new Error('The reading habit moves the plan: use Store.toggleHabit');
  return { ...day, habits: { ...day.habits, [habit.id]: !day.habits[habit.id] } };
}

export function addHabit(
  habits: readonly Habit[],
  name: string,
  rhythm: Rhythm,
  id: string,
  timesPerWeek = 1,
  days: readonly Weekday[] = [],
): Habit[] {
  const trimmed = name.trim();
  if (!trimmed) return [...habits];
  const habit: Habit = { id, name: trimmed, rhythm, auto: null, active: true, preset: false, focus: false };
  return [...habits, days.length > 0 ? withDays(habit, days) : withTimesPerWeek(habit, timesPerWeek)];
}

function withTimesPerWeek(habit: Habit, times: number): Habit {
  const { timesPerWeek: _, ...rest } = habit;
  return habit.rhythm === 'weekly' && !habit.auto && isTimesPerWeek(times) ? { ...rest, timesPerWeek: times } : rest;
}

/** Only daily habits are bound to weekdays; weekly ones are once or n times in the week, on any day. */
function withDays(habit: Habit, days: readonly Weekday[]): Habit {
  const { days: _, ...rest } = habit;
  const chosen = WEEKDAY_ORDER.filter((d) => days.includes(d));
  if (habit.auto || habit.rhythm !== 'daily' || chosen.length === 0 || chosen.length === 7) return rest;
  return { ...rest, days: chosen };
}

/** The weekdays a daily habit is meant for; none (or all seven) sets it back to every day. */
export function setHabitDays(habits: readonly Habit[], id: string, days: readonly Weekday[]): Habit[] {
  return habits.map((h) => (h.id === id ? withDays(h, days) : h));
}

/** How many days a week a weekly habit is meant for; 1 sets it back to once a week. */
export function setHabitTimes(habits: readonly Habit[], id: string, times: number): Habit[] {
  return habits.map((h) => (h.id === id ? withTimesPerWeek(h, times) : h));
}

/**
 * When a habit is meant, in one answer: every day, fixed weekdays, once or several times a week (on any
 * day), once a month. The rhythm of the habit follows from it; the entries are kept as they were.
 */
export type When = 'daily' | 'days' | 'month' | `week-${number}`;

export const whenOf = (h: Habit): When =>
  h.rhythm === 'monthly' ? 'month' : h.rhythm === 'weekly' ? `week-${isTimesPerWeek(h.timesPerWeek) ? h.timesPerWeek : 1}` : hasDays(h) ? 'days' : 'daily';

export function whenParts(when: When): { rhythm: Rhythm; timesPerWeek: number; byDays: boolean } {
  if (when === 'month') return { rhythm: 'monthly', timesPerWeek: 1, byDays: false };
  if (when === 'daily' || when === 'days') return { rhythm: 'daily', timesPerWeek: 1, byDays: when === 'days' };
  return { rhythm: 'weekly', timesPerWeek: Number(when.slice(5)), byDays: false };
}

/** Sets when a habit is meant. "days" keeps the weekdays it had, or takes the ones given. Habits of the orders keep theirs. */
export function setHabitWhen(habits: readonly Habit[], id: string, when: When, days: readonly Weekday[] = []): Habit[] {
  const { rhythm, timesPerWeek, byDays } = whenParts(when);
  return habits.map((h) => {
    if (h.id !== id || h.auto) return h;
    const { days: kept, timesPerWeek: _, ...rest } = h;
    const base: Habit = { ...rest, rhythm };
    return byDays ? withDays(base, days.length > 0 ? days : (kept ?? [])) : withTimesPerWeek(base, timesPerWeek);
  });
}

/** Puts a habit before another one, or at the end when there is none. */
export function placeHabit(habits: readonly Habit[], id: string, beforeId: string | null): Habit[] {
  const h = habits.find((x) => x.id === id);
  if (!h) return [...habits];
  const rest = habits.filter((x) => x.id !== id);
  const at = beforeId ? rest.findIndex((x) => x.id === beforeId) : -1;
  rest.splice(at < 0 ? rest.length : at, 0, h);
  return rest;
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

/**
 * Places a habit at `index` within its rhythm group (0 = first). The group's
 * habits keep the slots they occupy in the overall list; other groups stay put.
 */
export function moveHabitTo(habits: readonly Habit[], id: string, index: number): Habit[] {
  const h = habits.find((x) => x.id === id);
  if (!h) return [...habits];
  const group = habitsOfRhythm(habits, h.rhythm).filter((x) => x.id !== id);
  const at = Math.max(0, Math.min(index, group.length));
  group.splice(at, 0, h);
  let next = 0;
  return habits.map((x) => (x.rhythm === h.rhythm ? group[next++]! : x));
}

export function newHabitId(now: number = Date.now()): string {
  return `own-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
