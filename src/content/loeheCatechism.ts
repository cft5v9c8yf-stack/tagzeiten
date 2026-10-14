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
import { isQuestion, type LoeheChapter, type LoeheLesson, type LoeheQuestion } from './loehe/types';

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
