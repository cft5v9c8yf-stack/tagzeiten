import { describe, expect, it } from 'vitest';
import { CATECHISM, WEEKDAY_PIECES } from '../content/catechism';
import { addDays, mondayOf } from './dates';
import {
  ALL_PIECE_IDS,
  catechismFor,
  chiefPartIndexFor,
  memorizedCount,
  offsetForChiefPart,
  TOTAL_PIECES,
} from './catechismDay';

describe('catechism', () => {
  it('has 35 pieces in six chief parts', () => {
    expect(CATECHISM).toHaveLength(6);
    expect(CATECHISM.map((c) => c.pieces.length)).toEqual([11, 3, 9, 4, 4, 4]);
    expect(TOTAL_PIECES).toBe(35);
    expect(new Set(ALL_PIECE_IDS).size).toBe(35);
  });

  it('every weekday of every chief part yields valid pieces', () => {
    for (const chief of CATECHISM) {
      const table = WEEKDAY_PIECES[chief.id];
      expect(table).toHaveLength(7);
      for (const day of table) {
        expect(day.length).toBeGreaterThan(0);
        for (const i of day) {
          expect(Number.isInteger(i)).toBe(true);
          expect(chief.pieces[i]).toBeDefined();
        }
      }
    }
  });

  it('covers every piece of a chief part within its week', () => {
    for (const chief of CATECHISM) {
      const covered = new Set(WEEKDAY_PIECES[chief.id].flat());
      expect(covered.size).toBe(chief.pieces.length);
    }
  });

  it('every piece has text to learn', () => {
    for (const chief of CATECHISM) {
      for (const p of chief.pieces) {
        expect(p.title).not.toBe('');
        expect(p.qa.length).toBeGreaterThan(0);
        for (const [q, a] of p.qa) {
          expect(q).not.toBe('');
          expect(a).not.toBe('');
        }
      }
    }
  });

  it('keeps one chief part for a whole week, Monday to Sunday', () => {
    const monday = mondayOf('2026-09-25');
    const first = chiefPartIndexFor(monday, 0);
    for (let i = 0; i < 7; i++) expect(chiefPartIndexFor(addDays(monday, i), 0)).toBe(first);
    expect(chiefPartIndexFor(addDays(monday, 7), 0)).toBe((first + 1) % 6);
  });

  it('runs the six-week cycle without a jump at the turn of the year', () => {
    let prev = chiefPartIndexFor('2026-12-21', 0);
    for (const d of ['2026-12-28', '2027-01-04', '2027-01-11']) {
      const cur = chiefPartIndexFor(d, 0);
      expect(cur).toBe((prev + 1) % 6);
      prev = cur;
    }
  });

  it('lets the chief part of the week be chosen', () => {
    for (let chief = 0; chief < 6; chief++) {
      const off = offsetForChiefPart('2026-09-25', chief);
      expect(chiefPartIndexFor('2026-09-25', off)).toBe(chief);
      expect(chiefPartIndexFor('2026-09-21', off)).toBe(chief);
    }
  });

  it('gives the pieces of the day with a label', () => {
    const off = offsetForChiefPart('2026-09-25', 0); // commandments, Friday
    const day = catechismFor('2026-09-25', off);
    expect(day.chief.id).toBe('commandments');
    expect(day.pieceIndices).toEqual([4, 5]);
    expect(day.label).toBe('Das fünfte Gebot, Das sechste Gebot');
  });

  it('counts only known memorised pieces', () => {
    expect(memorizedCount({ 'commandments.0': true, 'creed.2': true, 'creed.1': false, 'gone.9': true })).toBe(2);
  });
});
