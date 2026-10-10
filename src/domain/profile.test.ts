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
