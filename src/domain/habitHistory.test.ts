import { describe, expect, it } from 'vitest';
import { emptyDay, type Day, type Habit } from './model';
import { habitMonths, habitWeeks } from './habitHistory';

const habit = (rhythm: Habit['rhythm']): Habit => ({ id: 'h', name: 'H', rhythm, auto: null, active: true, preset: false, focus: false });

function lookupOf(dates: string[]) {
  const days = new Map<string, Day>(dates.map((k) => [k, { ...emptyDay(k), habits: { h: true } }]));
  return (k: string) => days.get(k);
}

describe('habit history', () => {
  // Today: Tuesday 29 September 2026; its week began on Monday 28.
  const today = '2026-09-29';

  it('counts the days a daily habit was kept, per week, oldest first; the current week only up to today', () => {
    const weeks = habitWeeks(habit('daily'), today, lookupOf(['2026-09-21', '2026-09-23', '2026-09-27', '2026-09-28']));
    expect(weeks).toHaveLength(8);
    expect(weeks[0]!.monday).toBe('2026-08-10');
    expect(weeks.at(-2)).toEqual({ monday: '2026-09-21', days: 7, done: 3 });
    expect(weeks.at(-1)).toEqual({ monday: '2026-09-28', days: 2, done: 1 });
  });

  it('marks a weekly habit once for its week, and a monthly one for its month', () => {
    const lookup = lookupOf(['2026-09-24', '2026-08-03']);
    expect(habitWeeks(habit('weekly'), today, lookup).map((w) => w.done)).toEqual([0, 0, 0, 0, 0, 0, 1, 0]);
    expect(habitMonths(habit('monthly'), today, lookup)).toEqual([
      { month: '2026-07-01', done: false },
      { month: '2026-08-01', done: true },
      { month: '2026-09-01', done: true },
    ]);
  });
});
