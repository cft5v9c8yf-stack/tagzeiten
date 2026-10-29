import { describe, expect, it } from 'vitest';
import { HABIT_PRESETS } from '../content/habits';
import type { DateKey } from './dates';
import {
  addHabit,
  canMoveHabit,
  habitsOfRhythm,
  moveHabit,
  moveHabitTo,
  setHabitFocus,
  canToggle,
  daysDoneInWeek,
  doneDateInPeriod,
  isPerDay,
  setHabitTimes,
  setHabitDays,
  setHabitWhen,
  whenOf,
  whenParts,
  placeHabit,
  daysLabel,
  hasDays,
  habitsFromPresets,
  isDoneInPeriod,
  isDoneOn,
  mergePresets,
  periodDates,
  removeHabit,
  renameHabit,
  toggleHabit,
} from './habits';
import { emptyDay, type Day, type Habit } from './model';

const presets = habitsFromPresets();
const byId = (id: string) => presets.find((h) => h.id === id)!;

function store(days: Day[]) {
  const map = new Map(days.map((d) => [d.date, d]));
  return (k: DateKey) => map.get(k);
}

describe('periods', () => {
  it('weeks run Monday to Sunday', () => {
    const w = periodDates('weekly', '2026-09-25');
    expect(w).toHaveLength(7);
    expect(w[0]).toBe('2026-09-21');
    expect(w[6]).toBe('2026-09-27');
    expect(periodDates('weekly', '2026-09-27')[0]).toBe('2026-09-21');
    expect(periodDates('weekly', '2026-09-28')[0]).toBe('2026-09-28');
  });

  it('months are calendar months', () => {
    expect(periodDates('monthly', '2026-09-25')).toHaveLength(30);
    expect(periodDates('monthly', '2028-02-10')).toHaveLength(29);
    expect(periodDates('monthly', '2026-02-10').at(-1)).toBe('2026-02-28');
  });

  it('a day is a day', () => {
    expect(periodDates('daily', '2026-09-25')).toEqual(['2026-09-25']);
  });
});

describe('weekly and monthly habits', () => {
  const worship = byId('worship');
  const confession = byId('privateConfession');

  it('counts once for the whole week', () => {
    const sunday = { ...emptyDay('2026-09-20'), habits: { worship: true } };
    const lookup = store([sunday]);
    expect(isDoneInPeriod(worship, '2026-09-14', lookup)).toBe(true);
    expect(isDoneInPeriod(worship, '2026-09-20', lookup)).toBe(true);
    // next week starts fresh
    expect(isDoneInPeriod(worship, '2026-09-21', lookup)).toBe(false);
  });

  it('counts once for the whole month', () => {
    const lookup = store([{ ...emptyDay('2026-09-03'), habits: { privateConfession: true } }]);
    expect(doneDateInPeriod(confession, '2026-09-30', lookup)).toBe('2026-09-03');
    expect(isDoneInPeriod(confession, '2026-10-01', lookup)).toBe(false);
  });

  it('is toggled on the day it was recorded, not on another day of the period', () => {
    const lookup = store([{ ...emptyDay('2026-09-20'), habits: { worship: true } }]);
    expect(canToggle(worship, '2026-09-20', '2026-09-25', lookup)).toBe(true);
    expect(canToggle(worship, '2026-09-18', '2026-09-25', lookup)).toBe(false);
    expect(canToggle(worship, '2026-09-25', '2026-09-25', store([]))).toBe(true);
  });
});

describe('weekly habits meant for several days', () => {
  const sport = addHabit([], 'Sport', 'weekly', 'own-sport', 3)[0]!;

  it('keeps how often, and only for weekly habits', () => {
    expect(sport.timesPerWeek).toBe(3);
    expect(isPerDay(sport)).toBe(true);
    expect(isPerDay(byId('worship'))).toBe(false);
    // Once a week is the default and needs no number.
    expect(setHabitTimes([sport], 'own-sport', 1)[0]!.timesPerWeek).toBeUndefined();
    expect(addHabit([], 'Lesen', 'daily', 'own-read', 3)[0]!.timesPerWeek).toBeUndefined();
  });

  it('is recorded day by day and counted for the week, with nothing marked missing', () => {
    const lookup = store([
      { ...emptyDay('2026-09-21'), habits: { 'own-sport': true } },
      { ...emptyDay('2026-09-23'), habits: { 'own-sport': true } },
    ]);
    expect(daysDoneInWeek(sport, '2026-09-25', lookup)).toBe(2);
    // Any day of the week can be entered, also beside a day already entered.
    expect(canToggle(sport, '2026-09-24', '2026-09-25', lookup)).toBe(true);
    expect(canToggle(sport, '2026-09-26', '2026-09-25', lookup)).toBe(false);
    expect(daysDoneInWeek(sport, '2026-09-28', lookup)).toBe(0);
  });
});

describe('automatic habits', () => {
  const stillTime = byId('stillTime');
  const vespers = byId('vespers');
  const compline = byId('compline');

  it('are derived from the orders', () => {
    const d = emptyDay('2026-09-25');
    expect(isDoneOn(stillTime, d)).toBe(false);
    d.morning.done = true;
    d.evening.vespersDone = true;
    expect(isDoneOn(stillTime, d)).toBe(true);
    expect(isDoneOn(vespers, d)).toBe(true);
    expect(isDoneOn(compline, d)).toBe(false);
  });

  it('count the short form in full (rule 8)', () => {
    const d = emptyDay('2026-09-25');
    d.morning.form = 'short';
    d.morning.done = true;
    d.evening.complineForm = 'short';
    d.evening.complineDone = true;
    expect(isDoneOn(stillTime, d)).toBe(true);
    expect(isDoneOn(compline, d)).toBe(true);
  });

  it('ignore manual entries and cannot be toggled', () => {
    const d = { ...emptyDay('2026-09-25'), habits: { stillTime: true } };
    expect(isDoneOn(stillTime, d)).toBe(false);
    expect(canToggle(stillTime, d.date, d.date, store([d]))).toBe(false);
    expect(() => toggleHabit(d, stillTime)).toThrow();
  });

  it('exist exactly for the three orders', () => {
    expect(HABIT_PRESETS.filter((p) => p.auto).map((p) => p.auto)).toEqual(['morning', 'vespers', 'compline']);
  });
});

describe('manual habits', () => {
  const table = byId('tablePrayer');

  it('toggle per day', () => {
    const d = emptyDay('2026-09-25');
    const on = toggleHabit(d, table);
    expect(isDoneOn(table, on)).toBe(true);
    expect(isDoneOn(table, toggleHabit(on, table))).toBe(false);
    expect(d.habits).toEqual({}); // input untouched
  });

  it('cannot be recorded for the future', () => {
    expect(canToggle(table, '2026-09-26', '2026-09-25', store([]))).toBe(false);
  });
});

describe('managing habits', () => {
  it('adds, renames and removes own habits; presets stay', () => {
    let hs: Habit[] = addHabit(presets, '  Psalm mit den Kindern ', 'weekly', 'own-1');
    expect(hs.at(-1)).toEqual({
      id: 'own-1',
      name: 'Psalm mit den Kindern',
      rhythm: 'weekly',
      auto: null,
      active: true,
      preset: false,
      focus: false,
    });
    hs = renameHabit(hs, 'own-1', 'Psalm im Wechsel');
    expect(hs.at(-1)!.name).toBe('Psalm im Wechsel');
    expect(renameHabit(hs, 'worship', 'x').find((h) => h.id === 'worship')!.name).toBe(byId('worship').name);
    expect(removeHabit(hs, 'worship')).toHaveLength(hs.length);
    expect(removeHabit(hs, 'own-1')).toHaveLength(presets.length);
    expect(addHabit(presets, '   ', 'daily', 'own-2')).toHaveLength(presets.length);
  });

  it('places a new preset after its predecessor and switches on a replacing one', () => {
    const old = presets.filter((h) => h.id !== 'bibleReading');
    const merged = mergePresets(old);
    const ids = merged.map((h) => h.id);
    expect(ids.indexOf('bibleReading')).toBe(ids.indexOf('stillTime') + 1);
    expect(merged.find((h) => h.id === 'bibleReading')!.active).toBe(true);
    expect(merged.every((h) => !('activeOnUpdate' in h))).toBe(true);
  });

  it('adds new presets inactive without changing existing settings', () => {
    const old = presets.filter((h) => h.id !== 'mercy').map((h) => (h.id === 'fasting' ? { ...h, active: true } : h));
    const merged = mergePresets(old);
    expect(merged.find((h) => h.id === 'mercy')!.active).toBe(false);
    expect(merged.find((h) => h.id === 'fasting')!.active).toBe(true);
    expect(merged).toHaveLength(presets.length);
  });
});

describe('order and focus', () => {
  const ids = (hs: Habit[], r: Habit['rhythm']) => habitsOfRhythm(hs, r).map((h) => h.id);

  it('moves a habit within its group only', () => {
    const daily = ids(presets, 'daily');
    const weekly = ids(presets, 'weekly');
    const moved = moveHabit(presets, 'tablePrayer', 'up');
    const d = ids(moved, 'daily');
    expect(d.indexOf('tablePrayer')).toBe(daily.indexOf('tablePrayer') - 1);
    expect(d.slice().sort()).toEqual(daily.slice().sort());
    expect(ids(moved, 'weekly')).toEqual(weekly);
  });

  it('skips habits of other rhythms when moving', () => {
    // An own daily habit appended after all presets moves up past the monthly and weekly ones.
    const hs = addHabit(presets, 'Eigene', 'daily', 'own-1');
    const moved = moveHabit(hs, 'own-1', 'up');
    const d = ids(moved, 'daily');
    expect(d.at(-2)).toBe('own-1');
    expect(ids(moved, 'weekly')).toEqual(ids(presets, 'weekly'));
    expect(ids(moved, 'monthly')).toEqual(ids(presets, 'monthly'));
  });

  it('does nothing at the ends of a group', () => {
    const first = ids(presets, 'weekly')[0]!;
    const last = ids(presets, 'monthly').at(-1)!;
    expect(canMoveHabit(presets, first, 'up')).toBe(false);
    expect(moveHabit(presets, first, 'up')).toEqual(presets);
    expect(canMoveHabit(presets, last, 'down')).toBe(false);
    expect(canMoveHabit(presets, first, 'down')).toBe(true);
  });

  it('moves up and down symmetrically', () => {
    expect(moveHabit(moveHabit(presets, 'fasting', 'down'), 'fasting', 'up')).toEqual(presets);
  });

  it('places a habit anywhere within its group', () => {
    const daily = ids(presets, 'daily');
    const last = moveHabitTo(presets, daily[0]!, 99);
    expect(ids(last, 'daily')).toEqual([...daily.slice(1), daily[0]]);
    const first = moveHabitTo(presets, daily.at(-1)!, 0);
    expect(ids(first, 'daily')).toEqual([daily.at(-1), ...daily.slice(0, -1)]);
    const middle = moveHabitTo(presets, daily[0]!, 2);
    expect(ids(middle, 'daily')).toEqual([daily[1], daily[2], daily[0], ...daily.slice(3)]);
    // other groups and their slots are untouched
    expect(middle.map((h) => h.rhythm)).toEqual(presets.map((h) => h.rhythm));
    expect(ids(middle, 'weekly')).toEqual(ids(presets, 'weekly'));
    expect(moveHabitTo(presets, daily[2]!, 2)).toEqual(presets);
  });

  it('marks and unmarks a focus habit', () => {
    expect(presets.every((h) => !h.focus)).toBe(true);
    const f = setHabitFocus(presets, 'tablePrayer', true);
    expect(f.filter((h) => h.focus).map((h) => h.id)).toEqual(['tablePrayer']);
    expect(setHabitFocus(f, 'tablePrayer', false).some((h) => h.focus)).toBe(false);
  });
});

describe('reading habit', () => {
  const reading = presets.find((h) => h.id === 'bibleReading')!;
  const withReading = (date: string, done: boolean): Day => ({
    ...emptyDay(date),
    reading: { planId: 'standard', portions: { ot: 0, nt: 0 }, done },
  });

  it('follows the day\'s portion and is toggled through the store only', () => {
    expect(isDoneOn(reading, withReading('2026-09-24', true))).toBe(true);
    expect(isDoneOn(reading, withReading('2026-09-24', false))).toBe(false);
    expect(isDoneOn(reading, { ...emptyDay('2026-09-24'), habits: { bibleReading: true } })).toBe(false);
    expect(() => toggleHabit(withReading('2026-09-24', false), reading)).toThrow();
  });

  it('can be ticked today and on past days with a portion only (rule 6)', () => {
    expect(canToggle(reading, '2026-09-25', '2026-09-25', store([]))).toBe(true);
    expect(canToggle(reading, '2026-09-24', '2026-09-25', store([]))).toBe(false);
    expect(canToggle(reading, '2026-09-24', '2026-09-25', store([withReading('2026-09-24', false)]))).toBe(true);
    expect(canToggle(reading, '2026-09-26', '2026-09-25', store([]))).toBe(false);
  });
});

describe('Vesper and Familienandacht', () => {
  it('names the Vesper as the personal close of the day and adds the Familienandacht for existing users', () => {
    const old = habitsFromPresets()
      .filter((h) => h.id !== 'familyDevotion')
      .map((h) => (h.id === 'vespers' ? { ...h, name: 'Vesper mit der Familie' } : h));
    const merged = mergePresets(old);
    expect(merged.find((h) => h.id === 'vespers')!.name).toBe('Vesper');
    const family = merged.find((h) => h.id === 'familyDevotion')!;
    expect(family).toMatchObject({ name: 'Familienandacht', rhythm: 'daily', active: true });
    // A name of one's own stays.
    const own = mergePresets(old.map((h) => (h.id === 'vespers' ? { ...h, name: 'Abendgebet' } : h)));
    expect(own.find((h) => h.id === 'vespers')!.name).toBe('Abendgebet');
  });
});

describe('habits meant for fixed weekdays', () => {
  const run = addHabit([], 'Long Run', 'daily', 'own-run', 1, [6])[0]!;

  it('keeps the weekdays in the order of the week, for daily habits only', () => {
    expect(run.days).toEqual([6]);
    expect(setHabitDays([run], 'own-run', [0, 1, 6])[0]!.days).toEqual([1, 6, 0]);
    // Weekly and monthly habits, and those of the orders, are not bound to weekdays.
    expect(addHabit([], 'Sport', 'weekly', 'own-sport', 1, [5])[0]!.days).toBeUndefined();
    expect(addHabit([], 'Beichte', 'monthly', 'own-conf', 1, [5])[0]!.days).toBeUndefined();
    expect(hasDays(setHabitDays([byId('worship')], 'worship', [0])[0]!)).toBe(false);
  });

  it('is still recorded day by day, and none or all seven mean every day', () => {
    expect(isPerDay(run)).toBe(true);
    expect(hasDays(run)).toBe(true);
    expect(hasDays(setHabitDays([run], 'own-run', [])[0]!)).toBe(false);
    expect(hasDays(setHabitDays([run], 'own-run', [0, 1, 2, 3, 4, 5, 6])[0]!)).toBe(false);
  });

  it('is named quietly: one day as "am Samstag", several by their short names', () => {
    expect(daysLabel([6])).toBe('am Samstag');
    expect(daysLabel([0, 1])).toBe('Mo, So');
  });
});

describe('when a habit is meant', () => {
  const own = (rhythm: 'daily' | 'weekly' | 'monthly') => addHabit([], 'Etwas', rhythm, 'own-x')[0]!;

  it('reads the answer from the habit and splits it again', () => {
    expect(whenOf(own('daily'))).toBe('daily');
    expect(whenOf(own('monthly'))).toBe('month');
    expect(whenOf(own('weekly'))).toBe('week-1');
    expect(whenOf(addHabit([], 'Sport', 'weekly', 'own-s', 3)[0]!)).toBe('week-3');
    expect(whenOf(addHabit([], 'Run', 'daily', 'own-r', 1, [6])[0]!)).toBe('days');
    expect(whenParts('week-4')).toEqual({ rhythm: 'weekly', timesPerWeek: 4, byDays: false });
    expect(whenParts('days')).toEqual({ rhythm: 'daily', timesPerWeek: 1, byDays: true });
  });

  it('changes the rhythm with it and drops what no longer applies, but not for the orders', () => {
    const run = addHabit([], 'Run', 'daily', 'own-r', 1, [6]);
    expect(setHabitWhen(run, 'own-r', 'week-3')[0]).toMatchObject({ rhythm: 'weekly', timesPerWeek: 3 });
    expect(setHabitWhen(run, 'own-r', 'week-3')[0]!.days).toBeUndefined();
    expect(setHabitWhen(run, 'own-r', 'month')[0]).toMatchObject({ rhythm: 'monthly' });
    expect(setHabitWhen(run, 'own-r', 'daily')[0]!.days).toBeUndefined();
    // Weekdays: the ones it had stay; without any, the ones given are taken.
    expect(setHabitWhen(run, 'own-r', 'days')[0]!.days).toEqual([6]);
    expect(setHabitWhen([own('daily')], 'own-x', 'days', [1])[0]!.days).toEqual([1]);
    expect(setHabitWhen(habitsFromPresets(), 'stillTime', 'month').find((h) => h.id === 'stillTime')).toEqual(byId('stillTime'));
  });

  it('places a habit before another one, or at the end', () => {
    const ids = (hs: Habit[]) => hs.map((h) => h.id);
    const hs = ['a', 'b', 'c', 'd'].map((id) => addHabit([], id, 'daily', id)[0]!);
    expect(ids(placeHabit(hs, 'd', 'b'))).toEqual(['a', 'd', 'b', 'c']);
    expect(ids(placeHabit(hs, 'a', null))).toEqual(['b', 'c', 'd', 'a']);
    expect(ids(placeHabit(hs, 'x', 'b'))).toEqual(['a', 'b', 'c', 'd']);
  });
});
