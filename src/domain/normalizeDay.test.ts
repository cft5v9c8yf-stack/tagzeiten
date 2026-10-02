import { describe, expect, it } from 'vitest';
import { emptyDay } from './model';
import { isEmptyDay, normalizeDay } from './normalizeDay';

describe('normalizeDay', () => {
  it('rejects input without a valid date', () => {
    expect(normalizeDay(null)).toBeNull();
    expect(normalizeDay({ date: '2026-02-30' })).toBeNull();
    expect(normalizeDay('x')).toBeNull();
  });

  it('keeps known fields', () => {
    const d = normalizeDay({
      date: '2026-09-25',
      morning: { done: true, form: 'short', verse: 'V', wreath: { thanks: 'T' }, three: { house: 'H' }, questionNo: 3, steps: { word: true, opening: false } },
      evening: { complineDone: true, thanks: ['a', 'b', 'c', 'd'], marks: { word: 'minus' }, carry: { word: 'again' }, passedOnTo: 'Anna' },
      reading: { planId: 'at2-nt1', portions: { at: 4, nt: 4 }, done: true },
      habits: { tablePrayer: true, fasting: false },
      updatedAt: 5,
    })!;
    expect(d.morning).toMatchObject({ done: true, form: 'short', verse: 'V', questionNo: 3, steps: { word: true } });
    expect(d.morning.wreath).toEqual({ thanks: 'T' });
    expect(d.morning.three).toEqual({ house: 'H' });
    expect(d.evening.thanks).toEqual(['a', 'b', 'c']);
    expect(d.evening.carry).toEqual({ word: 'again' });
    expect(d.evening.passedOnTo).toBe('Anna');
    expect(d.reading).toEqual({ planId: 'at2-nt1', portions: { at: 4, nt: 4 }, done: true });
    expect(d.habits).toEqual({ tablePrayer: true });
    expect(d.updatedAt).toBe(5);
  });

  it('drops unknown fields, including any confession field (rule 9)', () => {
    const d = normalizeDay({
      date: '2026-09-25',
      confession: 'x',
      morning: { confession: 'x', wreath: { confession: 'x' }, sins: 'x' },
      evening: { examination: 'x', beichte: 'x' },
    })!;
    expect(JSON.stringify(d)).not.toMatch(/confession|sins|beichte|examination/);
  });

  it('drops a carry decision without a matching mark', () => {
    const d = normalizeDay({ date: '2026-09-25', evening: { marks: { word: 'plus' }, carry: { word: 'again', house: 'drop' } } })!;
    expect(d.evening.carry).toEqual({});
  });

  it('recognises empty days', () => {
    expect(isEmptyDay(emptyDay('2026-09-25'))).toBe(true);
    const d = emptyDay('2026-09-25');
    d.evening.thanks = ['', 'x'];
    expect(isEmptyDay(d)).toBe(false);
  });
});
