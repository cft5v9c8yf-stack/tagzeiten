import { describe, expect, it } from 'vitest';
import { lookbackSummary } from './Lookback';

describe('lookbackSummary', () => {
  it('counts prayed days and leaves empty days unmentioned', () => {
    const dots = [{ state: 'both' }, { state: 'one' }, { state: 'none' }, { state: 'both' }] as const;
    const text = lookbackSummary(dots);
    expect(text).toBe('Die letzten 4 Tage: an 2 Tagen Morgen und Abend gebetet, an 1 Tag eines von beiden.');
    expect(text).not.toMatch(/nichts|kein|verpasst/);
  });
});
