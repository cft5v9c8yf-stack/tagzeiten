import { describe, expect, it } from 'vitest';
import { CIRCLE_INFO, SEASON_INFO, SUNDAY_INFO, trinityGroupOf } from '../content/churchYearGuide';
import { churchYearOutline, CIRCLES } from './churchYear';

describe('church year guide', () => {
  it('explains every circle and season', () => {
    for (const c of CIRCLES) expect(CIRCLE_INFO[c].intro.length).toBeGreaterThan(80);
    for (const t of Object.values(SEASON_INFO)) expect(t.length).toBeGreaterThan(60);
  });

  it('has theme, Gospel and Epistle for every Sunday and major feast of several years', () => {
    const missing = new Set<string>();
    for (const start of ['2024-12-01', '2025-11-30', '2026-11-29', '2027-11-28', '2028-12-03', '2034-12-03', '2037-11-29']) {
      for (const e of churchYearOutline(start).entries) if (!SUNDAY_INFO[e.key]) missing.add(e.key);
    }
    // Only the rare Sundays beyond the 24th after Trinity may lack an entry.
    expect([...missing].filter((k) => !/^trinity(2[5-9])$/.test(k))).toEqual([]);
  });

  it('gives well-formed references', () => {
    for (const [key, info] of Object.entries(SUNDAY_INFO)) {
      for (const ref of [info.gospel, info.epistle]) {
        expect(ref, key).toMatch(/^(\d\. )?[A-ZÄÖÜ][a-zäöüß]+ \d+,\d/);
      }
    }
  });

  it('outlines a church year in order, with seasons covering it without gaps', () => {
    const o = churchYearOutline('2026-09-25');
    expect(o.churchYear).toBe(2025);
    expect(o.entries[0]).toMatchObject({ date: '2025-11-30', key: 'advent1', kind: 'sunday', circle: 'christmas' });
    expect(o.entries.at(-1)).toMatchObject({ date: '2026-11-22', key: 'eternity' });
    expect(o.entries.find((e) => e.key === 'goodFriday')).toMatchObject({ date: '2026-04-03', kind: 'feast', season: 'lent' });
    const dates = o.entries.map((e) => e.date);
    expect([...dates].sort()).toEqual(dates);
    expect(o.seasons[0]!.from).toBe(o.start);
    expect(o.seasons.at(-1)!.to).toBe(o.end);
    for (let i = 1; i < o.seasons.length; i++) expect(o.seasons[i]!.from > o.seasons[i - 1]!.to).toBe(true);
  });
});

describe('groups of the Trinity season', () => {
  const title = (k: string) => trinityGroupOf(k)?.title;

  it('assigns the Sundays after Trinity to their groups', () => {
    expect(title('trinity')).toBe('Berufung und Sammlung');
    expect(title('trinity5')).toBe('Berufung und Sammlung');
    expect(title('trinity6')).toBe('Erleuchtung');
    expect(title('trinity10')).toBe('Erleuchtung');
    expect(title('trinity11')).toBe('Bekehrung');
    expect(title('trinity14')).toBe('Bekehrung');
    expect(title('trinity15')).toBe('Heiligung');
    expect(title('trinity23')).toBe('Heiligung');
    expect(title('trinity24')).toBe('Vollendung');
  });

  it('puts the last Sundays of the church year into "Vollendung"', () => {
    for (const k of ['thirdLast', 'secondLast', 'eternity']) expect(title(k)).toBe('Vollendung');
  });

  it('leaves other weeks ungrouped', () => {
    expect(trinityGroupOf('pentecost')).toBeUndefined();
    expect(trinityGroupOf('advent1')).toBeUndefined();
  });
});
