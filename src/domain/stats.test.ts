import { describe, expect, it } from 'vitest';
import type { DateKey } from './dates';
import { emptyDay, type Day } from './model';
import { collectedVerses, lookback, markCounts, stillTimesIn } from './stats';

function lookupOf(days: Day[]) {
  const m = new Map(days.map((d) => [d.date, d]));
  return (k: DateKey) => m.get(k);
}

describe('stats', () => {
  const a = emptyDay('2026-09-25');
  a.morning.done = true;
  a.evening.complineDone = true;
  a.evening.marks = { word: 'plus', house: 'minus' };
  a.morning.verse = 'Sei stille dem HERRN';
  a.morning.verseRef = 'Psalm 37,7';
  const b = emptyDay('2026-09-20');
  b.morning.done = true;
  b.morning.form = 'short';
  b.evening.marks = { word: 'tilde' };
  const old = emptyDay('2026-08-01');
  old.morning.done = true;
  const lookup = lookupOf([a, b, old]);

  it('shows 28 neutral days with prayed days marked', () => {
    const dots = lookback(lookup, '2026-09-25');
    expect(dots).toHaveLength(28);
    expect(dots.at(-1)).toEqual({ date: '2026-09-25', state: 'both' });
    expect(dots[0]!.date).toBe('2026-08-29');
    expect(dots.find((d) => d.date === '2026-09-20')!.state).toBe('one');
    expect(dots.filter((d) => d.state === 'none')).toHaveLength(26);
  });

  it('counts still times in 30 days, short forms included', () => {
    expect(stillTimesIn(lookup, '2026-09-25')).toBe(2);
  });

  it('counts review marks', () => {
    expect(markCounts(lookup, '2026-09-25')).toEqual({ plus: 1, tilde: 1, minus: 1 });
  });

  it('collects verses newest first', () => {
    expect(collectedVerses([b, a])).toEqual([{ date: '2026-09-25', verse: 'Sei stille dem HERRN', ref: 'Psalm 37,7' }]);
  });
});
