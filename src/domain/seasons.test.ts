import { describe, expect, it } from 'vitest';
import { defaultProfile, normalizeProfile } from './profile';
import { arenaOffer, seasonLinkOf, seasonOffer, todayOffer } from './seasons';
import { startRun } from './winterArc';

describe('a Wüstenzeit in Advent', () => {
  it('is offered from the third Sunday before Advent through its first week', () => {
    expect(seasonOffer('2026-11-07')).toBeUndefined();
    expect(seasonOffer('2026-11-08')).toMatchObject({ key: 'advent-2026', name: 'Advent 2026', begin: '2026-11-29', end: '2026-12-24' });
    expect(seasonOffer('2026-12-05')).toBeDefined();
    expect(seasonOffer('2026-12-06')).toBeUndefined();
    expect(seasonOffer('2026-06-01')).toBeUndefined();
  });

  it('runs until Christmas Eve, from the first Sunday in Advent or, once begun, from today', () => {
    expect(seasonOffer('2026-11-16')).toMatchObject({ begun: false, start: '2026-11-29', days: 26 });
    expect(seasonOffer('2026-11-29')).toMatchObject({ begun: true, start: '2026-11-29', days: 26 });
    expect(seasonOffer('2026-12-02')).toMatchObject({ begun: true, start: '2026-12-02', days: 23 });
    expect(seasonOffer('2028-11-20')).toMatchObject({ begin: '2028-12-03', days: 22 });
    expect(seasonOffer('2027-11-28')).toMatchObject({ days: 27 });
  });

  it('links the article of its year, and none where there is none', () => {
    expect(seasonOffer('2026-11-16')!.link).toBe('https://henoch.app/neuigkeiten/advent-2026/');
    expect(seasonOffer('2027-11-16')!.link).toBeUndefined();
  });

  it('leaves "Heute" after "Diesmal nicht" and stays in the Arena', () => {
    const p = { ...defaultProfile('2026-11-16'), seasonsDeclined: ['advent-2026'] };
    expect(todayOffer(p, '2026-11-16')).toBeUndefined();
    expect(arenaOffer(p, '2026-11-16')).toBeDefined();
    // Next year it comes again.
    expect(todayOffer(p, '2027-11-16')).toBeDefined();
  });

  it('is not offered while a Wüstenzeit is under way or planned, but is after one has ended', () => {
    const base = defaultProfile('2026-11-16');
    const planned = { ...base, winterArc: startRun(base.winterArc, '2026-11-29', 26, 1) };
    expect(todayOffer(planned, '2026-11-16')).toBeUndefined();
    expect(arenaOffer(planned, '2026-11-16')).toBeUndefined();
    const over = { ...base, winterArc: startRun(base.winterArc, '2026-09-01', 40, 1) };
    expect(todayOffer(over, '2026-11-16')).toBeDefined();
  });

  it('finds the article for a Wüstenzeit that falls in Advent', () => {
    expect(seasonLinkOf({ startDate: '2026-11-29', durationDays: 26 })).toBe('https://henoch.app/neuigkeiten/advent-2026/');
    expect(seasonLinkOf({ startDate: '2026-10-01', durationDays: 40 })).toBeUndefined();
    expect(seasonLinkOf({ startDate: '2026-11-01', durationDays: 40 })).toBe('https://henoch.app/neuigkeiten/advent-2026/');
  });

  it('keeps "Diesmal nicht" with the profile and drops what is not a key', () => {
    const p = normalizeProfile({ ...defaultProfile('2026-11-16'), seasonsDeclined: ['advent-2026', 'advent-2026', 'x', 3] as never }, '2026-11-16');
    expect(p.seasonsDeclined).toEqual(['advent-2026']);
    expect('seasonsDeclined' in normalizeProfile(defaultProfile('2026-11-16'), '2026-11-16')).toBe(false);
  });
});
