import { describe, expect, it } from 'vitest';
import { HABIT_PRESETS } from '../content/habits';
import type { DateKey } from './dates';
import {
  addHabit,
  canToggle,
  doneDateInPeriod,
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
    expect(hs.at(-1)).toEqual({ id: 'own-1', name: 'Psalm mit den Kindern', rhythm: 'weekly', auto: null, active: true, preset: false });
    hs = renameHabit(hs, 'own-1', 'Psalm im Wechsel');
    expect(hs.at(-1)!.name).toBe('Psalm im Wechsel');
    expect(renameHabit(hs, 'worship', 'x').find((h) => h.id === 'worship')!.name).toBe(byId('worship').name);
    expect(removeHabit(hs, 'worship')).toHaveLength(hs.length);
    expect(removeHabit(hs, 'own-1')).toHaveLength(presets.length);
    expect(addHabit(presets, '   ', 'daily', 'own-2')).toHaveLength(presets.length);
  });

  it('adds new presets inactive without changing existing settings', () => {
    const old = presets.filter((h) => h.id !== 'mercy').map((h) => (h.id === 'fasting' ? { ...h, active: true } : h));
    const merged = mergePresets(old);
    expect(merged.find((h) => h.id === 'mercy')!.active).toBe(false);
    expect(merged.find((h) => h.id === 'fasting')!.active).toBe(true);
    expect(merged).toHaveLength(presets.length);
  });
});
