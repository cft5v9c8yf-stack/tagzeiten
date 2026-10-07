import { describe, expect, it } from 'vitest';
import { addDays } from './dates';
import {
  activeRun,
  dayNumber,
  defaultWinterArcSettings,
  emptyWinterArc,
  endDateOf,
  endRun,
  focusOf,
  monthOf,
  normalizeWinterArc,
  normalizeWinterArcSettings,
  phaseOf,
  positionOf,
  stageOf,
  startRun,
  totalWeeks,
  weekDates,
  weekOfDay,
  runName,
} from './winterArc';

// A zone with summer and winter time, so the changes on 25.10.2026 and 28.03.2027 are real here.
process.env.TZ = 'Europe/Berlin';

describe('Winter Arc calendar', () => {
  it('runs 90 days from 5 October 2026 to 2 January 2027', () => {
    const start = '2026-10-05';
    expect(endDateOf(start, 90)).toBe('2027-01-02');
    expect(dayNumber(start, start)).toBe(1);
    expect(dayNumber(start, '2027-01-02')).toBe(90);
  });

  it('counts plain calendar days across the changes of summer and winter time', () => {
    const start = '2026-10-05';
    // 25 October 2026 (winter time) and 28 March 2027 (summer time)
    expect(dayNumber(start, '2026-10-24')).toBe(20);
    expect(dayNumber(start, '2026-10-25')).toBe(21);
    expect(dayNumber(start, '2026-10-26')).toBe(22);
    expect(dayNumber('2027-03-20', '2027-03-28')).toBe(9);
    expect(dayNumber('2027-03-20', '2027-03-29')).toBe(10);
    for (let i = 0; i < 400; i++) expect(dayNumber(start, addDays(start, i))).toBe(i + 1);
  });

  it('counts weeks from the start date, the last one may be shorter', () => {
    expect(weekOfDay(1)).toBe(1);
    expect(weekOfDay(7)).toBe(1);
    expect(weekOfDay(8)).toBe(2);
    expect(totalWeeks(90)).toBe(13);
    expect(totalWeeks(40)).toBe(6);
    expect(totalWeeks(7)).toBe(1);
    expect(weekDates('2026-10-07', 2)).toEqual([
      '2026-10-14',
      '2026-10-15',
      '2026-10-16',
      '2026-10-17',
      '2026-10-18',
      '2026-10-19',
      '2026-10-20',
    ]);
  });

  it('gives each week its focus', () => {
    for (let w = 1; w <= 13; w++) expect(focusOf(w, totalWeeks(90))).toBe(w);
    expect([1, 2, 3, 4, 5, 6].map((w) => focusOf(w, totalWeeks(40)))).toEqual([1, 3, 6, 8, 11, 13]);
    expect(focusOf(1, totalWeeks(7))).toBe(13);
  });

  it('takes the phase from the focus', () => {
    expect(phaseOf(1)).toBe('Disziplin');
    expect(phaseOf(4)).toBe('Disziplin');
    expect(phaseOf(5)).toBe('Dienst');
    expect(phaseOf(8)).toBe('Dienst');
    expect(phaseOf(9)).toBe('Leitung');
    expect(phaseOf(13)).toBe('Leitung');
  });

  it('knows before, during and after a round', () => {
    const run = { startDate: '2026-10-05', durationDays: 90 };
    expect(stageOf(run, '2026-10-04')).toBe('before');
    expect(stageOf(run, '2026-10-05')).toBe('during');
    expect(stageOf(run, '2027-01-02')).toBe('during');
    expect(stageOf(run, '2027-01-03')).toBe('after');
    expect(positionOf(run, '2026-11-20')).toMatchObject({ day: 47, week: 7, weeks: 13, focus: 7, phase: 'Dienst' });
  });

  it('takes the calendar month for the monthly point', () => {
    expect(monthOf('2026-10-31')).toBe('2026-10');
    expect(monthOf('2026-11-01')).toBe('2026-11');
  });
});

describe('Winter Arc rounds', () => {
  it('ends the round under way when a new one begins, and deletes nothing', () => {
    let data = startRun(emptyWinterArc(), '2026-10-05', 90, 1, 'a');
    data = { ...data, days: [{ runId: 'a', date: '2026-10-05', checks: { wake: true }, updatedAt: 1 }] };
    data = startRun(data, '2027-01-04', 40, 2, 'b');
    expect(data.runs.map((r) => [r.id, r.status])).toEqual([
      ['a', 'ended'],
      ['b', 'active'],
    ]);
    expect(data.days).toHaveLength(1);
    expect(activeRun(data)?.id).toBe('b');
    const off = endRun(data, 3);
    expect(activeRun(off)).toBeUndefined();
    expect(off.days).toHaveLength(1);
  });

  it('no longer names a round "Winter Arc": the old default name reads as "Runde"', () => {
    const data = normalizeWinterArc({
      runs: [
        { id: 'a', name: 'Winter Arc', startDate: '2026-09-21', durationDays: 90, status: 'active', createdAt: 1, updatedAt: 1 },
        { id: 'b', name: 'Fastenzeit', startDate: '2026-02-18', durationDays: 40, status: 'ended', createdAt: 0, updatedAt: 0 },
      ],
      days: [],
      weeks: [],
      months: [],
    });
    expect(data.runs[0]!.name).toBeUndefined();
    expect(data.runs.map(runName)).toEqual(['Runde', 'Fastenzeit']);
    expect(runName({ name: 'Winter Arc' })).toBe('Runde');
  });

  it('cleans imported rounds', () => {
    const data = normalizeWinterArc({
      runs: [
        { id: 'a', startDate: '2026-10-05', durationDays: 90, status: 'active', createdAt: 1, updatedAt: 1 },
        { id: 'b', startDate: '2026-12-05', durationDays: 40, status: 'active', createdAt: 2, updatedAt: 2 },
        { id: 'c', startDate: 'kein Datum', durationDays: 90, status: 'active', createdAt: 3, updatedAt: 3 },
        { id: 'd', startDate: '2026-10-05', durationDays: 400, status: 'active', createdAt: 4, updatedAt: 4 },
      ],
      days: [
        { runId: 'a', date: '2026-10-05', checks: { wake: true, nonsense: true } as never, updatedAt: 1 },
        { runId: 'x', date: '2026-10-05', checks: { wake: true }, updatedAt: 1 },
      ],
      weeks: [],
      months: [{ runId: 'a', month: '2026-13', checks: { serve: true }, updatedAt: 1 }],
    });
    expect(data.runs.map((r) => [r.id, r.status])).toEqual([
      ['a', 'ended'],
      ['b', 'active'],
    ]);
    expect(data.days).toEqual([{ runId: 'a', date: '2026-10-05', checks: { wake: true }, updatedAt: 1 }]);
    expect(data.months).toEqual([]);
    expect(normalizeWinterArc(undefined)).toEqual(emptyWinterArc());
  });
});

describe('Winter Arc settings', () => {
  it('has the weekdays of the tracker and the times of the plan by default', () => {
    const s = defaultWinterArcSettings();
    expect(s.weekdays.wake).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(s.weekdays.train).toEqual([1, 2, 3, 4, 5]);
    expect(s.times).toEqual({ wake: '04:00', kitchen: '20:00', night: '21:00' });
  });

  it('keeps the points switched off, and only known ones', () => {
    expect(defaultWinterArcSettings().off).toEqual([]);
    expect(normalizeWinterArcSettings({ off: ['serve', 'wake', 'nonsense', 'focus1'] as never }).off).toEqual(['wake', 'serve']);
  });

  it('keeps valid own times and weekdays, and drops the rest', () => {
    const s = normalizeWinterArcSettings({
      weekdays: { train: [1, 3, 5, 9] } as never,
      times: { wake: '05:30', focus1: '09-13', kitchen: '25:00', night: '22:00' } as never,
    });
    expect(s.weekdays.train).toEqual([1, 3, 5]);
    expect(s.weekdays.wake).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(s.times).toEqual({ wake: '05:30', kitchen: '20:00', night: '22:00' });
  });
});
