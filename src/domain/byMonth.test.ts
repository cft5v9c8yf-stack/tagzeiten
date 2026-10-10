import { describe, expect, it } from 'vitest';
import { byYearAndMonth } from './byMonth';

describe('byYearAndMonth', () => {
  it('groups by year and month, newest first', () => {
    const groups = byYearAndMonth(['2025-12-31', '2026-09-02', '2026-01-05', '2026-09-20'], (d) => d);
    expect(groups.map((y) => y.year)).toEqual([2026, 2025]);
    expect(groups[0]!.months.map((m) => [m.month, m.items])).toEqual([
      ['September', ['2026-09-20', '2026-09-02']],
      ['Januar', ['2026-01-05']],
    ]);
    expect(groups[1]!.months[0]!.month).toBe('Dezember');
  });

  it('is empty for nothing', () => {
    expect(byYearAndMonth([], (d: string) => d)).toEqual([]);
  });
});
