/**
 * Wilhelm Löhe's questions and answers on the six chief parts, from his
 * "Haus-, Schul- und Kirchenbuch", first part (1845). A footnote of the book
 * is marked in the text with "*" (the second with "**").
 */
export interface LoeheQuestion {
  /** Löhe's running number, 1 to 769. */
  no: number;
  q: string;
  /** The answer; a line break stands for a new line in the book. */
  a: string;
  /** Löhe's "Anm." after the answer. */
  note?: string;
  /** A passage the book quotes after the answer. */
  quote?: string;
  /** Footnotes, in the order of their marks. */
  footnotes?: readonly string[];
}

/** A number in the book over the questions on one commandment, e.g. "1." or "9. 10.". */
export interface LoeheMark {
  mark: string;
}

export type LoeheItem = LoeheQuestion | LoeheMark;

/** One lesson ("Pensum") as Löhe divides the questions by Roman numerals. */
export interface LoeheLesson {
  /** The Roman numeral; absent where a heading starts within a lesson. */
  lesson?: string;
  /** A heading of the book over the lesson, if it has one. */
  heading?: string;
  items: readonly LoeheItem[];
}

export interface LoeheChapter {
  /** Pages in the book, e.g. "S. 37–53". */
  pages: string;
  lessons: readonly LoeheLesson[];
}

export const q = (
  no: number,
  question: string,
  a: string,
  more: Omit<LoeheQuestion, 'no' | 'q' | 'a'> = {},
): LoeheQuestion => ({ no, q: question, a, ...more });

export const mark = (m: string): LoeheMark => ({ mark: m });

export const isQuestion = (i: LoeheItem): i is LoeheQuestion => 'no' in i;
