/**
 * Times of the day, the same every day or set per weekday. With weekdays,
 * every day belongs to exactly one group (e.g. Monday to Friday, and the
 * weekend), and each group has its own times.
 */
import { WEEKDAY_SHORT, weekdayOf, type DateKey, type Weekday } from './dates';
import type { Profile, Schedule, ScheduleGroup } from './model';

/** Monday first, as the week is lived. */
export const WEEK: readonly Weekday[] = [1, 2, 3, 4, 5, 6, 0];

/** The times that hold on a day. */
export function scheduleFor(profile: Profile, date: DateKey): Schedule {
  const byDay = profile.scheduleDays;
  if (!byDay?.on) return profile.schedule;
  const wd = weekdayOf(date);
  return byDay.groups.find((g) => g.days.includes(wd))?.times ?? profile.schedule;
}

/** The first split: working days and the weekend, both with the current times. */
export function firstGroups(times: Schedule): ScheduleGroup[] {
  return [
    { days: [1, 2, 3, 4, 5], times: { ...times } },
    { days: [6, 0], times: { ...times } },
  ];
}

/**
 * Moves a day into a group. The group it leaves is dropped once it has no day
 * left; a group added without days stays until it gets some.
 */
export function moveDay(groups: readonly ScheduleGroup[], day: Weekday, target: number): ScheduleGroup[] {
  if (groups[target]?.days.includes(day)) return [...groups];
  return groups
    .map((g, i) => {
      if (i === target) return { ...g, days: sortDays([...g.days, day]) };
      if (g.days.includes(day)) return { ...g, days: g.days.filter((d) => d !== day), left: true };
      return g;
    })
    .filter((g) => !('left' in g) || g.days.length > 0)
    .map(({ days, times }) => ({ days, times }));
}

/** Removes a group; its days go to the first remaining group. */
export function removeGroup(groups: readonly ScheduleGroup[], index: number): ScheduleGroup[] {
  const gone = groups[index];
  const rest = groups.filter((_, i) => i !== index);
  if (!gone || rest.length === 0) return [...groups];
  const [first, ...others] = rest;
  return [{ ...first!, days: sortDays([...first!.days, ...gone.days]) }, ...others];
}

export const sortDays = (days: readonly Weekday[]): Weekday[] =>
  [...days].sort((a, b) => WEEK.indexOf(a) - WEEK.indexOf(b));

/** "Mo – Fr", "Sa, So", "Mo, Mi, Fr" – runs of three or more are joined with a dash. */
export function daysLabel(days: readonly Weekday[]): string {
  const idx = sortDays(days).map((d) => WEEK.indexOf(d));
  const parts: string[] = [];
  for (let i = 0; i < idx.length; ) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1] === idx[j]! + 1) j++;
    const name = (k: number) => WEEKDAY_SHORT[WEEK[idx[k]!]!];
    if (j - i >= 2) parts.push(`${name(i)} – ${name(j)}`);
    else for (let k = i; k <= j; k++) parts.push(name(k));
    i = j + 1;
  }
  return parts.join(', ');
}
