import { describe, expect, it } from 'vitest';
import { arcPosition, buildArc, fromMinutes, toMinutes } from './dayArc';
import { DEFAULT_SCHEDULE, emptyDay } from './model';

describe('day arc', () => {
  it('converts times', () => {
    expect(toMinutes('04:15')).toBe(255);
    expect(fromMinutes(255)).toBe('04:15');
    expect(fromMinutes(-30)).toBe('23:30');
  });

  it('spans rising to lights out with the three blocks', () => {
    const arc = buildArc(DEFAULT_SCHEDULE, emptyDay('2026-09-25'));
    expect(arc.start).toBe(4 * 60);
    expect(arc.end).toBe(21 * 60);
    expect(arc.blocks.map((b) => [b.id, fromMinutes(b.start), fromMinutes(b.end)])).toEqual([
      ['stillTime', '04:15', '05:00'],
      ['vespers', '18:30', '18:40'],
      ['compline', '20:45', '20:55'],
    ]);
    expect(arc.ticks).toEqual([240, 480, 720, 960, 1260]); // 20:00 would crowd 21:00
  });

  it('follows changed times and the short form', () => {
    const d = emptyDay('2026-09-25');
    d.morning.form = 'short';
    d.morning.done = true;
    const arc = buildArc({ ...DEFAULT_SCHEDULE, rise: '06:00', stillTime: '06:20', lightsOut: '22:30' }, d);
    expect(arc.start).toBe(360);
    expect(arc.end).toBe(23 * 60);
    expect(arc.blocks[0]).toMatchObject({ start: 380, end: 400, done: true });
  });

  it('places times on the arc', () => {
    const arc = buildArc(DEFAULT_SCHEDULE, emptyDay('2026-09-25'));
    expect(arcPosition(arc, 240)).toBe(0);
    expect(arcPosition(arc, 1260)).toBe(1);
    expect(arcPosition(arc, 0)).toBe(0);
    expect(arcPosition(arc, 750)).toBeCloseTo(0.5);
  });
});
