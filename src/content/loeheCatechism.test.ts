import { describe, expect, it } from 'vitest';
import { CATECHISM, WEEKDAY_PIECES } from './catechism';
import {
  LOEHE_BY_CHIEF_PART,
  LOEHE_IN_ORDER,
  LOEHE_OVERVIEW,
  LOEHE_DAYS,
  LOEHE_HOME,
  LOEHE_PLACES,
  isQuestion,
  lessonTitle,
  loeheBetween,
  loeheForChiefPart,
  loeheForDay,
  loeheForPieceOnDay,
  loeheForPiece,
} from './loeheCatechism';

const numbers = (chapters: typeof LOEHE_IN_ORDER) =>
  chapters.flatMap((c) => c.lessons.flatMap((l) => l.items.filter(isQuestion).map((q) => q.no)));

describe("Löhe's questions on the chief parts", () => {
  it('run from 1 to 769 without a gap, in the order of the book', () => {
    const all = numbers(LOEHE_IN_ORDER);
    expect(all).toEqual(Array.from({ length: 769 }, (_, i) => i + 1));
  });

  it('are all shown: every chief part has its chapter, the rest stands on the overview', () => {
    for (const part of CATECHISM) expect(LOEHE_BY_CHIEF_PART[part.id].lessons.length).toBeGreaterThan(0);
    const shown = [...LOEHE_OVERVIEW, ...Object.values(LOEHE_BY_CHIEF_PART)];
    expect(numbers(shown).sort((a, b) => a - b)).toEqual(numbers(LOEHE_IN_ORDER));
  });

  it('have a question and an answer each, and no stray marks from the scan', () => {
    for (const c of LOEHE_IN_ORDER)
      for (const l of c.lessons)
        for (const q of l.items.filter(isQuestion)) {
          expect(q.q.length, `Frage ${q.no}`).toBeGreaterThan(3);
          expect(q.a.length, `Antwort ${q.no}`).toBeGreaterThan(1);
          expect(`${q.q} ${q.a} ${q.note ?? ''}`, `Nr. ${q.no}`).not.toMatch(/[ſꝛ§]/);
        }
  });

  it('give every footnote mark in the text its footnote', () => {
    for (const c of LOEHE_IN_ORDER)
      for (const l of c.lessons)
        for (const q of l.items.filter(isQuestion)) {
          const marks = (`${q.q} ${q.a}`.match(/\*+/g) ?? []).length;
          expect(q.footnotes?.length ?? 0, `Nr. ${q.no}`).toBe(marks);
        }
  });

  it('name each lesson by its numeral and heading or its questions', () => {
    const [ii, iii, iv] = LOEHE_BY_CHIEF_PART.commandments.lessons;
    expect(lessonTitle(ii!)).toBe('II. Einleitende Fragen zum ersten Hauptstück');
    expect(lessonTitle(iii!)).toBe('III. Fragen über den Wortverstand des ersten Hauptstücks');
    expect(lessonTitle(iv!)).toBe('IV. Fragen 64–77');
  });

  it('stand in the order of the book: introduction, pieces, transition, each question once', () => {
    const nos = (r?: readonly [number, number]) => (r ? loeheBetween(r).flatMap((l) => l.items.filter(isQuestion).map((q) => q.no)) : []);
    const placed: number[] = [...nos(LOEHE_HOME)];
    for (const part of CATECHISM) {
      const p = LOEHE_PLACES[part.id];
      expect(p.pieces, part.id).toHaveLength(part.pieces.length);
      placed.push(...nos(p.intro));
      p.pieces.forEach((r, pi) => {
        expect(nos(r).length, `${part.id} ${pi}`).toBeGreaterThan(0);
        placed.push(...nos(r));
      });
      placed.push(...nos(p.outro));
    }
    expect(placed).toEqual(numbers(LOEHE_IN_ORDER));
  });

  it("keep a commandment's number over its questions", () => {
    const first = loeheForPiece('commandments', 0);
    expect(first.map(lessonTitle)).toEqual(['III. Fragen über den Wortverstand des ersten Hauptstücks']);
    expect(first[0]!.items[0]).toEqual({ mark: '1.' });
    const second = loeheForPiece('commandments', 1)[0]!;
    expect(second.items[0]).toEqual({ mark: '2.' });
  });

  it('go with the pieces learned each day, all of them over the week, in the order of the book', () => {
    const totals: Record<string, number> = {};
    for (const part of CATECHISM) {
      const all = loeheForChiefPart(part.id).map((q) => q.no);
      totals[part.id] = all.length;
      const days = Array.from({ length: LOEHE_DAYS }, (_, d) => loeheForDay(part.id, d).map((q) => q.no));
      expect(days.flat(), part.id).toEqual(all);
      // Each question on a piece only on a day that piece is learned.
      for (let d = 0; d < LOEHE_DAYS; d++)
        for (const pi of WEEKDAY_PIECES[part.id][d]!) {
          const [from, to] = LOEHE_PLACES[part.id].pieces[pi]!;
          const own = loeheForPieceOnDay(part.id, pi, d).filter((q) => q.no >= from && q.no <= to);
          expect(own.length, `${part.id} ${pi} ${d}`).toBeGreaterThan(0);
        }
    }
    expect(totals).toEqual({ commandments: 156, creed: 192, lordsPrayer: 141, baptism: 95, confession: 73, lordsSupper: 96 });
    // Wednesday, the third commandment: only Löhe's questions on it.
    expect(loeheForDay('commandments', 2).map((q) => q.no)).toEqual(Array.from({ length: 14 }, (_, i) => 64 + i));
    // Monday, the first commandment, after the introduction.
    expect(loeheForDay('commandments', 0).map((q) => q.no)).toEqual(Array.from({ length: 30 }, (_, i) => 17 + i));
  });
});
