/**
 * Books and reading plans. Plans are pure data: a plan is a set of tracks,
 * each track walks through a list of books in portions following a
 * repeating chapter pattern. Further plans (M'Cheyne, chronological) can be
 * added here without touching the logic.
 */

export interface Book {
  /** Display name, e.g. "1. Mose" */
  name: string;
  chapters: number;
  /** bibleserver.com book slug, e.g. "1.Mose" */
  slug: string;
}

export const OT_BOOKS: readonly Book[] = [
  { name: '1. Mose', chapters: 50, slug: '1.Mose' },
  { name: '2. Mose', chapters: 40, slug: '2.Mose' },
  { name: '3. Mose', chapters: 27, slug: '3.Mose' },
  { name: '4. Mose', chapters: 36, slug: '4.Mose' },
  { name: '5. Mose', chapters: 34, slug: '5.Mose' },
  { name: 'Josua', chapters: 24, slug: 'Josua' },
  { name: 'Richter', chapters: 21, slug: 'Richter' },
  { name: 'Rut', chapters: 4, slug: 'Rut' },
  { name: '1. Samuel', chapters: 31, slug: '1.Samuel' },
  { name: '2. Samuel', chapters: 24, slug: '2.Samuel' },
  { name: '1. Könige', chapters: 22, slug: '1.Könige' },
  { name: '2. Könige', chapters: 25, slug: '2.Könige' },
  { name: '1. Chronik', chapters: 29, slug: '1.Chronik' },
  { name: '2. Chronik', chapters: 36, slug: '2.Chronik' },
  { name: 'Esra', chapters: 10, slug: 'Esra' },
  { name: 'Nehemia', chapters: 13, slug: 'Nehemia' },
  { name: 'Ester', chapters: 10, slug: 'Ester' },
  { name: 'Hiob', chapters: 42, slug: 'Hiob' },
  { name: 'Psalm', chapters: 150, slug: 'Psalm' },
  { name: 'Sprüche', chapters: 31, slug: 'Sprüche' },
  { name: 'Prediger', chapters: 12, slug: 'Prediger' },
  { name: 'Hoheslied', chapters: 8, slug: 'Hoheslied' },
  { name: 'Jesaja', chapters: 66, slug: 'Jesaja' },
  { name: 'Jeremia', chapters: 52, slug: 'Jeremia' },
  { name: 'Klagelieder', chapters: 5, slug: 'Klagelieder' },
  { name: 'Hesekiel', chapters: 48, slug: 'Hesekiel' },
  { name: 'Daniel', chapters: 12, slug: 'Daniel' },
  { name: 'Hosea', chapters: 14, slug: 'Hosea' },
  { name: 'Joel', chapters: 4, slug: 'Joel' },
  { name: 'Amos', chapters: 9, slug: 'Amos' },
  { name: 'Obadja', chapters: 1, slug: 'Obadja' },
  { name: 'Jona', chapters: 4, slug: 'Jona' },
  { name: 'Micha', chapters: 7, slug: 'Micha' },
  { name: 'Nahum', chapters: 3, slug: 'Nahum' },
  { name: 'Habakuk', chapters: 3, slug: 'Habakuk' },
  { name: 'Zefanja', chapters: 3, slug: 'Zefanja' },
  { name: 'Haggai', chapters: 2, slug: 'Haggai' },
  { name: 'Sacharja', chapters: 14, slug: 'Sacharja' },
  { name: 'Maleachi', chapters: 3, slug: 'Maleachi' },
];

/** New Testament in Luther's order: Hebrews, James and Jude before Revelation. */
export const NT_BOOKS: readonly Book[] = [
  { name: 'Matthäus', chapters: 28, slug: 'Matthäus' },
  { name: 'Markus', chapters: 16, slug: 'Markus' },
  { name: 'Lukas', chapters: 24, slug: 'Lukas' },
  { name: 'Johannes', chapters: 21, slug: 'Johannes' },
  { name: 'Apostelgeschichte', chapters: 28, slug: 'Apostelgeschichte' },
  { name: 'Römer', chapters: 16, slug: 'Römer' },
  { name: '1. Korinther', chapters: 16, slug: '1.Korinther' },
  { name: '2. Korinther', chapters: 13, slug: '2.Korinther' },
  { name: 'Galater', chapters: 6, slug: 'Galater' },
  { name: 'Epheser', chapters: 6, slug: 'Epheser' },
  { name: 'Philipper', chapters: 4, slug: 'Philipper' },
  { name: 'Kolosser', chapters: 4, slug: 'Kolosser' },
  { name: '1. Thessalonicher', chapters: 5, slug: '1.Thessalonicher' },
  { name: '2. Thessalonicher', chapters: 3, slug: '2.Thessalonicher' },
  { name: '1. Timotheus', chapters: 6, slug: '1.Timotheus' },
  { name: '2. Timotheus', chapters: 4, slug: '2.Timotheus' },
  { name: 'Titus', chapters: 3, slug: 'Titus' },
  { name: 'Philemon', chapters: 1, slug: 'Philemon' },
  { name: '1. Petrus', chapters: 5, slug: '1.Petrus' },
  { name: '2. Petrus', chapters: 3, slug: '2.Petrus' },
  { name: '1. Johannes', chapters: 5, slug: '1.Johannes' },
  { name: '2. Johannes', chapters: 1, slug: '2.Johannes' },
  { name: '3. Johannes', chapters: 1, slug: '3.Johannes' },
  { name: 'Hebräer', chapters: 13, slug: 'Hebräer' },
  { name: 'Jakobus', chapters: 5, slug: 'Jakobus' },
  { name: 'Judas', chapters: 1, slug: 'Judas' },
  { name: 'Offenbarung', chapters: 22, slug: 'Offenbarung' },
];

export interface TrackDef {
  id: string;
  /** "AT", "NT" */
  label: string;
  books: readonly Book[];
  /** Chapters per portion, repeated; a portion never crosses a book boundary. */
  pattern: readonly number[];
}

export interface PlanDef {
  id: string;
  name: string;
  description: string;
  tracks: readonly TrackDef[];
}

export const PLANS: readonly PlanDef[] = [
  {
    id: 'at2-nt1',
    name: 'Altes Testament in zwei Jahren, Neues Testament jährlich',
    description:
      'Altes Testament in rund zwei Jahren, Neues Testament jährlich, in Luthers Buchreihenfolge. Der Plan läuft nach Fortschritt, nicht nach Datum: wer aussetzt, macht beim nächsten Abschnitt weiter.',
    tracks: [
      { id: 'at', label: 'AT', books: OT_BOOKS, pattern: [2, 1, 1, 1] },
      { id: 'nt', label: 'NT', books: NT_BOOKS, pattern: [1] },
    ],
  },
];

export const DEFAULT_PLAN_ID = 'at2-nt1';

/** The whole Bible in Luther's order, for a plan of one's own. */
export const ALL_BOOKS: readonly Book[] = [...OT_BOOKS, ...NT_BOOKS];

/**
 * Verses per book (common count). Only used to estimate how many chapters fit
 * into a given reading time; chapters differ in length from book to book.
 */
export const VERSES: Readonly<Record<string, number>> = {
  '1.Mose': 1533, '2.Mose': 1213, '3.Mose': 859, '4.Mose': 1288, '5.Mose': 959,
  Josua: 658, Richter: 618, Rut: 85, '1.Samuel': 810, '2.Samuel': 695,
  '1.Könige': 816, '2.Könige': 719, '1.Chronik': 942, '2.Chronik': 822,
  Esra: 280, Nehemia: 406, Ester: 167, Hiob: 1070, Psalm: 2461, Sprüche: 915,
  Prediger: 222, Hoheslied: 117, Jesaja: 1292, Jeremia: 1364, Klagelieder: 154,
  Hesekiel: 1273, Daniel: 357, Hosea: 197, Joel: 73, Amos: 146, Obadja: 21,
  Jona: 48, Micha: 105, Nahum: 47, Habakuk: 56, Zefanja: 53, Haggai: 38,
  Sacharja: 211, Maleachi: 55,
  Matthäus: 1071, Markus: 678, Lukas: 1151, Johannes: 879, Apostelgeschichte: 1007,
  Römer: 433, '1.Korinther': 437, '2.Korinther': 257, Galater: 149, Epheser: 155,
  Philipper: 104, Kolosser: 95, '1.Thessalonicher': 89, '2.Thessalonicher': 47,
  '1.Timotheus': 113, '2.Timotheus': 83, Titus: 46, Philemon: 25, '1.Petrus': 105,
  '2.Petrus': 61, '1.Johannes': 105, '2.Johannes': 13, '3.Johannes': 15,
  Hebräer: 303, Jakobus: 108, Judas: 25, Offenbarung: 404,
};

/** Attentive reading on paper, pencil in hand: verses per minute, roughly. */
export const VERSES_PER_MINUTE = 5;

/** Choices for a plan of one's own. */
export const CHAPTER_CHOICES = [1, 2, 3, 4, 5, 6, 8, 10] as const;
export const MINUTE_CHOICES = [5, 10, 15, 20, 30, 45, 60] as const;

export const BIBLE_BASE_URL = 'https://www.bibleserver.com/LUT/';
