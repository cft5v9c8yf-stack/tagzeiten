import { describe, expect, it } from 'vitest';
import { DEFAULT_SCHEDULE } from './model';
import { defaultProfile, normalizeProfile } from './profile';
import { daysLabel, firstGroups, moveDay, removeGroup, scheduleFor } from './schedule';

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
    expect(removeGroup(g, 1).map((x) => daysLabel(x.days))).toEqual(['Mo – So']);
  });

  it('labels runs of days', () => {
    expect(daysLabel([1, 3, 5])).toBe('Mo, Mi, Fr');
    expect(daysLabel([0, 6])).toBe('Sa, So');
    expect(daysLabel([2, 3, 4, 0])).toBe('Di – Do, So');
  });

  it('keeps every weekday in exactly one group when loading', () => {
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
    expect(p.scheduleDays!.groups.map((g) => g.days)).toEqual([
      [1, 2, 3, 4, 5, 0],
      [6],
    ]);
    expect(p.scheduleDays!.groups[1]!.times.rise).toBe('04:00');
  });
});
