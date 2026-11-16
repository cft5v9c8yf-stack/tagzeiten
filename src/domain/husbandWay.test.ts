import { describe, expect, it } from 'vitest';
import { normalizeArena } from './arena';
import { canTickStep, toggleStep, wayDayOn } from './husbandWay';
import { normalizeWinterArc, type WinterArcRun } from './winterArc';

const run: WinterArcRun = {
  id: 'r1',
  startDate: '2026-10-14',
  durationDays: 28,
  status: 'active',
  createdAt: 1,
  updatedAt: 1,
  habits: [],
  way: 'husband',
  wayDone: [],
};

describe('the days of "28 Tage für Ehemänner"', () => {
  it('counts from the first day, whatever the weekday', () => {
    expect(wayDayOn(run, '2026-10-13')).toBeUndefined();
    expect(wayDayOn(run, '2026-10-14')).toBe(1);
    expect(wayDayOn(run, '2026-11-10')).toBe(28);
    expect(wayDayOn(run, '2026-12-01')).toBe(28);
  });

  it('ticks a day missed later, never one ahead', () => {
    expect(canTickStep(run, 1, '2026-10-20')).toBe(true);
    expect(canTickStep(run, 8, '2026-10-20')).toBe(false);
    const data = toggleStep({ runs: [run], days: [], weeks: [], months: [] }, 'r1', 3, 2);
    expect(data.runs[0]!.wayDone).toEqual([3]);
    expect(toggleStep(data, 'r1', 3, 3).runs[0]!.wayDone).toEqual([]);
  });

  it('cleans what is stored or imported', () => {
    const data = normalizeWinterArc({ runs: [{ ...run, wayDone: [3, 3, 0, 29, 1.5, 1] as number[], wayIntroSeen: true }], days: [], weeks: [], months: [] });
    expect(data.runs[0]).toMatchObject({ way: 'husband', wayDone: [1, 3], wayIntroSeen: true });
    expect(normalizeWinterArc({ runs: [{ ...run, way: 'other' as never }], days: [], weeks: [], months: [] }).runs[0]!.way).toBeUndefined();
    const [entry] = normalizeArena([{ id: 'e', createdAt: 1, verses: [], concerns: [], text: 'x', kind: 'desert', wayRun: 'r1', wayDay: 4 }]);
    expect(entry).toMatchObject({ wayRun: 'r1', wayDay: 4 });
    const [other] = normalizeArena([{ id: 'f', createdAt: 1, verses: [], concerns: [], text: 'x', wayRun: 'r1', wayDay: 4 }]);
    expect(other!.wayDay).toBeUndefined();
  });
});
