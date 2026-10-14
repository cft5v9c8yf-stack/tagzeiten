import { describe, expect, it } from 'vitest';
import { emptyDay } from './model';
import { searchDays } from './search';

const a = emptyDay('2026-09-24');
a.morning.verse = 'Sei stille dem HERRN';
a.morning.three.house = 'Mit Anna spazieren';
const b = emptyDay('2026-09-25');
b.evening.thanks = ['das Gespräch mit Paul'];
b.reading = { planId: 'at2-nt1', portions: { at: 0, nt: 0 }, done: true };

describe('archive search', () => {
  it('returns everything for an empty query', () => {
    expect(searchDays([a, b], '  ')).toHaveLength(2);
  });

  it('finds text in any field, case-insensitive', () => {
    expect(searchDays([a, b], 'herrn').map((d) => d.date)).toEqual(['2026-09-24']);
    expect(searchDays([a, b], 'PAUL').map((d) => d.date)).toEqual(['2026-09-25']);
  });

  it('requires all words', () => {
    expect(searchDays([a, b], 'anna stille')).toHaveLength(1);
    expect(searchDays([a, b], 'anna paul')).toHaveLength(0);
  });

  it('finds the reading and the date', () => {
    expect(searchDays([a, b], 'Mose').map((d) => d.date)).toEqual(['2026-09-25']);
    expect(searchDays([a, b], 'donnerstag').map((d) => d.date)).toEqual(['2026-09-24']);
  });
});
