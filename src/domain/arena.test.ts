import { describe, expect, it } from 'vitest';
import { entryTitle, normalizeArena, searchArena } from './arena';

const base = { createdAt: 1, updatedAt: 1, verses: [], concerns: [] };

describe('Eisenschmiede points', () => {
  it('turns the free text of an older entry into one point per line', () => {
    const [e] = normalizeArena([{ ...base, id: 'a', kind: 'forge', text: 'Beruf\n\n  Ehe  \n' }]);
    expect(e!.points).toEqual([
      { text: 'Beruf', done: false },
      { text: 'Ehe', done: false },
    ]);
    expect(e!.text).toBe('');
  });

  it('keeps points and their ticks, finds them, and names the entry by the first', () => {
    const [e] = normalizeArena([
      { ...base, id: 'b', kind: 'forge', text: '', points: [{ text: 'Gemeinde', done: true }, { text: 'Ehe' }, 7] },
    ]);
    expect(e!.points).toEqual([
      { text: 'Gemeinde', done: true },
      { text: 'Ehe', done: false },
    ]);
    expect(entryTitle(e!)).toBe('Gemeinde');
    expect(searchArena([e!], 'ehe')).toHaveLength(1);
  });

  it('drops an entry with nothing but empty points, and leaves the journal alone', () => {
    expect(normalizeArena([{ ...base, id: 'c', kind: 'forge', text: '', points: [{ text: ' ', done: false }] }])).toEqual([]);
    const [j] = normalizeArena([{ ...base, id: 'd', text: 'Was mich bewegt' }]);
    expect(j!.points).toBeUndefined();
    expect(j!.text).toBe('Was mich bewegt');
  });
});
