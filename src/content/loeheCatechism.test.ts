import { describe, expect, it } from 'vitest';
import { CATECHISM } from './catechism';
import { LOEHE_BY_CHIEF_PART, LOEHE_IN_ORDER, LOEHE_OVERVIEW, isQuestion, lessonTitle } from './loeheCatechism';

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
});
