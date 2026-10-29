import { describe, expect, it } from 'vitest';
import { HABIT_PRESETS } from '../content/habits';
import { defaultProfile, normalizeProfile } from './profile';

describe('profile', () => {
  it('starts with presets, plan at the beginning and system theme', () => {
    const p = defaultProfile('2026-09-25');
    expect(p.habits).toHaveLength(HABIT_PRESETS.length);
    expect(p.plan).toEqual({ planId: 'atnt-1-1', positions: { at: 0, nt: 0 } });
    expect(p.theme).toBe('system');
    expect(p.schedule.stillTime).toBe('04:15');
  });

  it('turns "2, 1, 1, 1 im Wechsel" into one chapter of the Old Testament a day, from the same chapter', () => {
    // Portion 4 of the alternation is 1. Mose 6–7; one chapter a day, that is portion 5.
    const p = normalizeProfile({ plan: { planId: 'at2-nt1', positions: { at: 4, nt: 7 }, fixed: 'atnt-g-2' } }, '2026-10-06');
    expect(p.plan).toEqual({ planId: 'atnt-1-1', positions: { at: 5, nt: 7 }, fixed: 'atnt-1-2' });
    expect(normalizeProfile({ plan: { planId: 'atnt-g-3', positions: { at: 0, nt: 0 } } }, '2026-10-06').plan.planId).toBe('atnt-1-3');
  });

  it('keeps the weekdays of a habit only where they make sense', () => {
    const own = (over: object) => ({ id: 'o', name: 'Eigenes', auto: null, active: true, preset: false, focus: false, ...over }) as never;
    const days = (over: object) => normalizeProfile({ habits: [own(over)] }, '2026-09-25').habits.find((h) => h.id === 'o')!.days;
    expect(days({ rhythm: 'daily', days: [0, 6, 6, 9] })).toEqual([6, 0]);
    expect(days({ rhythm: 'daily', days: [5] })).toEqual([5]);
    expect(days({ rhythm: 'weekly', days: [5] })).toBeUndefined();
    expect(days({ rhythm: 'monthly', days: [5] })).toBeUndefined();
    expect(days({ rhythm: 'daily', days: [] })).toBeUndefined();
    expect(days({ rhythm: 'daily', days: [0, 1, 2, 3, 4, 5, 6] })).toBeUndefined();
  });

  it('lists only the switched-on habits in the settings if asked to, and by default all', () => {
    expect(normalizeProfile({}, '2026-09-25').onlyActiveHabits).toBe(false);
    expect(normalizeProfile({ onlyActiveHabits: true } as never, '2026-09-25').onlyActiveHabits).toBe(true);
    expect(normalizeProfile({ onlyActiveHabits: 'yes' } as never, '2026-09-25').onlyActiveHabits).toBe(false);
  });

  it('repairs incomplete or broken data', () => {
    const p = normalizeProfile(
      {
        plan: { planId: 'unknown', positions: { at: 99999, nt: 12 } },
        schedule: { rise: '05:30', stillTime: '25:00' } as never,
        catechism: { memorized: { 'creed.0': true }, weekOffset: -1 },
        // A habit stored before the focus star existed.
        habits: [{ id: 'x', name: 'Eigenes', rhythm: 'weekly', auto: null, active: true, preset: false } as never, { bogus: 1 } as never],
        theme: 'purple' as never,
      },
      '2026-09-25',
    );
    expect(p.plan).toEqual({ planId: 'atnt-1-1', positions: { at: 0, nt: 12 } });
    expect(p.schedule.rise).toBe('05:30');
    expect(p.schedule.stillTime).toBe('04:15');
    expect(p.catechism.weekOffset).toBe(5);
    expect(p.habits[0]).toMatchObject({ id: 'x', focus: false });
    expect(p.habits).toHaveLength(HABIT_PRESETS.length + 1);
    expect(p.theme).toBe('system');
  });
});

describe('the plan before the Wüstenzeit (1.16)', () => {
  it('keeps a known plan to return to, never the plan of the Wüstenzeit itself', () => {
    const base = defaultProfile('2026-10-21');
    const keep = normalizeProfile({ ...base, plan: { planId: 'wueste-40', positions: {}, beforeDesert: 'paulus-60' } }, '2026-10-21');
    expect(keep.plan).toMatchObject({ planId: 'wueste-40', beforeDesert: 'paulus-60' });
    for (const before of ['wueste-90', 'paulus-500', 7]) {
      const p = normalizeProfile({ ...base, plan: { planId: 'jahr', positions: {}, beforeDesert: before as string } }, '2026-10-21');
      expect(p.plan.planId).toBe('jahr');
      expect(p.plan.beforeDesert).toBeUndefined();
    }
  });
});
