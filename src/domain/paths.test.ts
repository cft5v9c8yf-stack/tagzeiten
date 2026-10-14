import { describe, expect, it } from 'vitest';
import { emptyDay } from './model';
import { getAt, getText, setAt } from './paths';

describe('paths', () => {
  it('reads and writes nested values without mutating', () => {
    const d = emptyDay('2026-09-25');
    const a = setAt(d, 'morning.wreath.thanks', 'Für das Brot');
    expect(getText(a, 'morning.wreath.thanks')).toBe('Für das Brot');
    expect(d.morning.wreath).toEqual({});
    expect(a.morning).not.toBe(d.morning);
    expect(a.evening).toBe(d.evening);
  });

  it('writes into arrays and keeps them dense', () => {
    const d = setAt(emptyDay('2026-09-25'), 'evening.thanks.2', 'c');
    expect(d.evening.thanks).toEqual(['', '', 'c']);
    expect(getAt(d, 'evening.thanks.2')).toBe('c');
  });

  it('removes a key when set to an empty string', () => {
    const d = setAt(emptyDay('2026-09-25'), 'morning.verse', 'x');
    expect('verse' in setAt(d, 'morning.verse', '').morning).toBe(false);
  });

  it('returns undefined for unknown paths', () => {
    expect(getAt(emptyDay('2026-09-25'), 'morning.nothing.here')).toBeUndefined();
  });
});
