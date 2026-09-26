import { describe, expect, it } from 'vitest';
import { addConcern, emptyPrayer, normalizePrayer, removeConcern } from './prayer';

describe('prayer list', () => {
  it('writes a concern once and sets it on several days', () => {
    let p = addConcern(emptyPrayer(), '  Verfolgte  Kirche ');
    p = addConcern(p, 'Verfolgte Kirche', 1);
    p = addConcern(p, 'Missionare', 1);
    p = addConcern(p, 'Verfolgte Kirche', 'daily');
    expect(p).toEqual({
      concerns: ['Verfolgte Kirche', 'Missionare'],
      daily: ['Verfolgte Kirche'],
      weekly: { 1: ['Verfolgte Kirche', 'Missionare'] },
    });
    expect(addConcern(p, '   ', 2)).toBe(p);
  });

  it('takes a concern off a day, or out of the list and off every day', () => {
    let p = addConcern(addConcern(emptyPrayer(), 'Nachbarn', 3), 'Nachbarn', 'daily');
    p = removeConcern(p, 'Nachbarn', 3);
    expect(p.weekly).toEqual({});
    expect(p.concerns).toEqual(['Nachbarn']);
    expect(removeConcern(p, 'Nachbarn')).toEqual(emptyPrayer());
  });

  it('turns the earlier free texts into concerns', () => {
    expect(normalizePrayer({ daily: 'Haus', weekly: { 1: 'Mission', 9: 'x', 2: '' } })).toEqual({
      concerns: ['Haus', 'Mission'],
      daily: ['Haus'],
      weekly: { 1: ['Mission'] },
    });
    expect(normalizePrayer(null)).toEqual(emptyPrayer());
  });
});
