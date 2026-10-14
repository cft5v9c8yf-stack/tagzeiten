import { describe, expect, it } from 'vitest';
import { DEFAULT_SCHEDULE } from './model';
import { defaultProfile, normalizeProfile } from './profile';
import { daysLabel, firstGroups, freeDays, moveDay, orderIssue, removeGroup, scheduleFor } from './schedule';

const late = { ...DEFAULT_SCHEDULE, rise: '07:00' };

describe('times per weekday', () => {
  it('holds the same times every day until weekdays are switched on', () => {
    const p = defaultProfile('2026-09-25');
    expect(scheduleFor(p, '2026-09-26').rise).toBe('04:00');
    const groups = firstGroups(DEFAULT_SCHEDULE);
    groups[1] = { ...groups[1]!, times: late };
    expect(scheduleFor({ ...p, scheduleDays: { on: false, groups } }, '2026-09-26').rise).toBe('04:00');
    const on = { ...p, scheduleDays: { on: true, groups } };
    expect(scheduleFor(on, '2026-09-25').rise).toBe('04:00'); // Friday
    expect(scheduleFor(on, '2026-09-26').rise).toBe('07:00'); // Saturday
    expect(scheduleFor(on, '2026-09-27').rise).toBe('07:00'); // Sunday
  });

  it('moves a day between groups and drops a group left without days', () => {
    const g = firstGroups(DEFAULT_SCHEDULE);
    const friday = moveDay(g, 5, 1);
    expect(friday.map((x) => daysLabel(x.days))).toEqual(['Mo – Do', 'Fr – So']);
    const added = [...g, { days: [], times: late }];
    expect(moveDay(added, 0, 2).map((x) => daysLabel(x.days))).toEqual(['Mo – Fr', 'Sa', 'So']);
    expect(moveDay(moveDay(added, 0, 2), 6, 2).map((x) => daysLabel(x.days))).toEqual(['Mo – Fr', 'Sa, So']);
    // Tapped where it is, a day leaves its group and keeps the times for all days.
    const off = moveDay(g, 3, 0);
    expect(off.map((x) => daysLabel(x.days))).toEqual(['Mo, Di, Do, Fr', 'Sa, So']);
    expect(freeDays(off)).toEqual([3]);
    expect(
      scheduleFor(
        {
          ...defaultProfile('2026-09-25'),
          scheduleDays: { on: true, groups: off.map((x, i) => (i === 0 ? { ...x, times: late } : x)) },
        },
        '2026-09-23',
      ).rise,
    ).toBe('04:00');
    expect(removeGroup(g, 1).map((x) => daysLabel(x.days))).toEqual(['Mo – So']);
  });

  it('labels runs of days', () => {
    expect(daysLabel([1, 3, 5])).toBe('Mo, Mi, Fr');
    expect(daysLabel([0, 6])).toBe('Sa, So');
    expect(daysLabel([2, 3, 4, 0])).toBe('Di – Do, So');
  });

  it('keeps every weekday in at most one group when loading', () => {
    const p = normalizeProfile(
      {
        scheduleDays: {
          on: true,
          groups: [
            { days: [1, 2], times: late },
            { days: [2, 6, 9 as never], times: { ...DEFAULT_SCHEDULE, rise: 'x' } },
          ],
        },
      },
      '2026-09-25',
    );
    expect(p.scheduleDays!.groups.map((g) => g.days)).toEqual([[1, 2], [6]]);
    expect(p.scheduleDays!.groups[1]!.times.rise).toBe('04:00');
  });
});

describe('order of the times', () => {
  it('notes a time before the one it follows, and lets night times pass midnight', () => {
    expect(orderIssue(DEFAULT_SCHEDULE)).toBeUndefined();
    const early = orderIssue({ ...DEFAULT_SCHEDULE, rise: '06:00' });
    expect(early?.key).toBe('stillTime');
    expect(early?.message).toBe(
      'Stille Zeit (04:15) liegt vor Aufstehen (06:00). So geht es nicht: Stille Zeit kommt nach Aufstehen.',
    );
    expect(orderIssue({ ...DEFAULT_SCHEDULE, compline: '23:30', lightsOut: '00:15' })).toBeUndefined();
    expect(orderIssue({ ...DEFAULT_SCHEDULE, vespers: '21:00' })?.key).toBe('compline');
  });
});
