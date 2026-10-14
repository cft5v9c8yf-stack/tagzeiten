/**
 * Wilhelm Löhe's questions and answers on the six chief parts of the Small
 * Catechism, from the "Haus-, Schul- und Kirchenbuch für Christen des
 * lutherischen Bekenntnisses", first part, second division (Stuttgart 1845),
 * after the digitised copy of the Bayerische Staatsbibliothek. Word for word in
 * the spelling of the edition; the long s is set as s, "ꝛc." as "etc.".
 * Löhe's own misprints stay (e.g. question 122, "des siebenten Gebotes").
 */
import type { ChiefPartId } from './catechism';
import { LOEHE_BAPTISM } from './loehe/baptism';
import { LOEHE_COMMANDMENTS } from './loehe/commandments';
import { LOEHE_CONFESSION } from './loehe/confession';
import { LOEHE_CREED } from './loehe/creed';
import { LOEHE_INTRO, LOEHE_MEANS_OF_GRACE } from './loehe/intro';
import { LOEHE_LORDS_PRAYER } from './loehe/lordsPrayer';
import { LOEHE_LORDS_SUPPER } from './loehe/lordsSupper';
import { isQuestion, type LoeheChapter, type LoeheItem, type LoeheLesson, type LoeheQuestion } from './loehe/types';

export type { LoeheChapter, LoeheLesson, LoeheQuestion } from './loehe/types';
export { isQuestion } from './loehe/types';

export const LOEHE_SOURCE =
  'Wilhelm Löhe, lutherischer Pfarrer: Haus-, Schul- und Kirchenbuch für Christen des lutherischen Bekenntnisses. Erster Theil. Stuttgart, S. G. Liesching 1845. II. Fragen und Antworten zu den sechs Hauptstücken des kleinen Catechismus Dr. M. Luthers';

/** The questions on each chief part, shown on its page. */
export const LOEHE_BY_CHIEF_PART: Record<ChiefPartId, LoeheChapter> = {
  commandments: LOEHE_COMMANDMENTS,
  creed: LOEHE_CREED,
  lordsPrayer: LOEHE_LORDS_PRAYER,
  baptism: LOEHE_BAPTISM,
  confession: LOEHE_CONFESSION,
  lordsSupper: LOEHE_LORDS_SUPPER,
};

/** The questions on the catechism as a whole and on the means of grace, shown on the overview. */
export const LOEHE_OVERVIEW: readonly LoeheChapter[] = [LOEHE_INTRO, LOEHE_MEANS_OF_GRACE];

/** All chapters in the order of the book. */
export const LOEHE_IN_ORDER: readonly LoeheChapter[] = [
  LOEHE_INTRO,
  LOEHE_COMMANDMENTS,
  LOEHE_CREED,
  LOEHE_MEANS_OF_GRACE,
  LOEHE_LORDS_PRAYER,
  LOEHE_BAPTISM,
  LOEHE_CONFESSION,
  LOEHE_LORDS_SUPPER,
];

export const lessonQuestions = (lesson: LoeheLesson): LoeheQuestion[] => lesson.items.filter(isQuestion);

/** "II. Einleitende Fragen …" or, without a heading, "IV. Fragen 64–77". */
export function lessonTitle(lesson: LoeheLesson): string {
  const qs = lessonQuestions(lesson);
  const name = lesson.heading ?? `Fragen ${qs[0]!.no}–${qs.at(-1)!.no}`;
  return lesson.lesson ? `${lesson.lesson}. ${name}` : name;
}

/**
 * Löhe's questions belonging to each piece of the Small Catechism, as ranges
 * of his numbers, in the order of the pieces. The introductory questions of a
 * chief part go with its first piece, the questions leading on to the next
 * chief part with its last. Questions 1–16 and 365–370 stand on the overview.
 */
export const LOEHE_PIECE_RANGES: Record<ChiefPartId, readonly (readonly [from: number, to: number])[]> = {
  commandments: [
    [17, 46], [47, 63], [64, 77], [78, 86], [87, 96], [97, 104], [105, 113], [114, 122], [123, 127], [128, 152], [153, 172],
  ],
  creed: [[173, 227], [228, 286], [287, 364]],
  lordsPrayer: [[371, 408], [409, 421], [422, 430], [431, 454], [455, 466], [467, 481], [482, 491], [492, 500], [501, 505]],
  baptism: [[506, 552], [553, 565], [566, 582], [583, 600]],
  confession: [[601, 650], [651, 660], [661, 668], [669, 673]],
  lordsSupper: [[674, 745], [746, 748], [749, 756], [757, 769]],
};

/**
 * The lessons of a chief part cut down to the questions of one piece; a
 * commandment's number stays with the questions it stands over.
 */
export function loeheForPiece(chief: ChiefPartId, pieceIndex: number): LoeheLesson[] {
  const range = LOEHE_PIECE_RANGES[chief][pieceIndex];
  if (!range) return [];
  const [from, to] = range;
  const inRange = (i: LoeheItem | undefined) => !!i && isQuestion(i) && i.no >= from && i.no <= to;
  const out: LoeheLesson[] = [];
  for (const lesson of LOEHE_BY_CHIEF_PART[chief].lessons) {
    const items = lesson.items.filter((item, i) => (isQuestion(item) ? inRange(item) : inRange(lesson.items[i + 1])));
    if (items.some(isQuestion)) out.push({ ...lesson, items });
  }
  return out;
}

/** "Fragen 40–46" for the fold under a piece. */
export function pieceRangeLabel(chief: ChiefPartId, pieceIndex: number): string {
  const [from, to] = LOEHE_PIECE_RANGES[chief][pieceIndex] ?? [0, 0];
  return from === to ? `Frage ${from}` : `Fragen ${from}–${to}`;
}
