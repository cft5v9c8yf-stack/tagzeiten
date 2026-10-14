import { describe, expect, it } from 'vitest';
import {
  addDays,
  formatLong,
  formatShort,
  isDateKey,
  isoWeek,
  mondayIndex,
  mondayOf,
  weekdayOf,
} from './dates';

describe('dates', () => {
  it('validates keys', () => {
    expect(isDateKey('2026-09-25')).toBe(true);
    expect(isDateKey('2026-02-30')).toBe(false);
    expect(isDateKey('2026-9-25')).toBe(false);
    expect(isDateKey('')).toBe(false);
    expect(isDateKey(null)).toBe(false);
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('survives the DST switch', () => {
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29');
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
  });

  it('maps weekdays', () => {
    // 2026-09-25 is a Friday
    expect(weekdayOf('2026-09-25')).toBe(5);
    expect(mondayIndex('2026-09-25')).toBe(4);
    expect(mondayIndex('2026-09-27')).toBe(6);
    expect(mondayOf('2026-09-27')).toBe('2026-09-21');
  });

  it('computes ISO weeks', () => {
    expect(isoWeek('2026-01-01')).toBe(1);
    expect(isoWeek('2026-09-25')).toBe(39);
    expect(isoWeek('2027-01-01')).toBe(53);
  });

  it('formats in German', () => {
    expect(formatLong('2026-09-25')).toBe('Freitag, 25. September');
    expect(formatShort('2026-09-25')).toBe('Fr 25.9.');
  });
});
