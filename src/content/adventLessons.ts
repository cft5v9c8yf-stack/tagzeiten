/**
 * Sunday lessons after Georg Christian Dieffenbach, Evangelische Haus-Agende
 * (Mainz 1853): for each Sunday its title, the guiding words, the Bible lesson
 * as a reference only (read in the Bible on paper, rule 13) and the numbered
 * paragraphs of its exposition, word for word (rule 12). The texts live in
 * data/advent-lektionen.json and are checked against reference/dieffenbach-advent.txt;
 * further Sundays of the church year can be added there.
 */
import data from '../../data/advent-lektionen.json';

/** A piece of a paragraph: running text, or a hymn verse set off as a quotation. */
export type LessonPart = { text: string } | { zitat: string };

export interface SundayLesson {
  /** The Sunday of the church year, e.g. "advent-1". */
  sonntag: string;
  /** "Erster Advent – Sonntag" */
  name: string;
  titel: string;
  /** An addition to the title in brackets, as at the first Sunday in Advent. */
  zusatz?: string;
  /** The guiding words: a Bible reference with its text, as Dieffenbach quotes it. */
  leitworte: readonly { bibelstelle: string; text: string }[];
  /** The Bible lesson, e.g. "Matth. 21, 1–9". */
  bibelstelle: string;
  absaetze: readonly { nr: number; teile: readonly LessonPart[] }[];
}

export const LESSON_SOURCE: string = data.quelle;
export const SUNDAY_LESSONS: readonly SundayLesson[] = data.sonntage as SundayLesson[];

export const lessonById = (id: string | undefined): SundayLesson | undefined => SUNDAY_LESSONS.find((l) => l.sonntag === id);

/** The lesson of a week of the church year ("advent1" → "advent-1"), if there is one. */
export const lessonOfWeek = (weekKey: string): SundayLesson | undefined => lessonById(weekKey.replace(/(\d+)$/, '-$1'));
