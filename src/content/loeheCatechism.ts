/**
 * Wilhelm Löhe's questions and answers on the six chief parts of the Small
 * Catechism, from the "Haus-, Schul- und Kirchenbuch für Christen des
 * lutherischen Bekenntnisses", first part, second division (Stuttgart 1845),
 * after the digitised copy of the Bayerische Staatsbibliothek. Word for word in
 * the spelling of the edition; the long s is set as s, "ꝛc." as "etc.".
 * Löhe's own misprints stay (e.g. question 122, "des siebenten Gebotes").
 */
import { WEEKDAY_PIECES, type ChiefPartId } from './catechism';
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

type Range = readonly [from: number, to: number];

/**
 * Where Löhe's questions stand, in the order of his book: the introductory
 * questions over a chief part, the questions on each piece under the piece,
 * the questions leading on to the next chief part after the last piece.
 * Questions 1–16 introduce the whole catechism and stand on the overview;
 * 365–370 on the means of grace open the Lord's Prayer, as in the book.
 */
export const LOEHE_PLACES: Record<ChiefPartId, { intro?: Range; pieces: readonly Range[]; outro?: Range }> = {
  commandments: {
    intro: [17, 39],
    pieces: [[40, 46], [47, 63], [64, 77], [78, 86], [87, 96], [97, 104], [105, 113], [114, 122], [123, 127], [128, 152], [153, 163]],
    outro: [164, 172],
  },
  creed: { intro: [173, 189], pieces: [[190, 227], [228, 286], [287, 364]] },
  lordsPrayer: {
    intro: [365, 395],
    pieces: [[396, 408], [409, 421], [422, 430], [431, 454], [455, 466], [467, 481], [482, 491], [492, 500], [501, 505]],
  },
  baptism: { intro: [506, 527], pieces: [[528, 552], [553, 565], [566, 582], [583, 600]] },
  confession: { intro: [601, 624], pieces: [[625, 650], [651, 660], [661, 668], [669, 673]] },
  lordsSupper: { pieces: [[674, 745], [746, 748], [749, 756], [757, 769]] },
};

export const LOEHE_HOME: Range = [1, 16];

/**
 * The lessons of the book cut down to the questions from `from` to `to`; a
 * commandment's number stays with the questions it stands over.
 */
export function loeheBetween([from, to]: Range): LoeheLesson[] {
  const inRange = (i: LoeheItem | undefined) => !!i && isQuestion(i) && i.no >= from && i.no <= to;
  const out: LoeheLesson[] = [];
  for (const chapter of LOEHE_IN_ORDER)
    for (const lesson of chapter.lessons) {
      const items = lesson.items.filter((item, i) => (isQuestion(item) ? inRange(item) : inRange(lesson.items[i + 1])));
      if (items.some(isQuestion)) out.push({ ...lesson, items });
    }
  return out;
}

export function loeheForPiece(chief: ChiefPartId, pieceIndex: number): LoeheLesson[] {
  const range = LOEHE_PLACES[chief].pieces[pieceIndex];
  return range ? loeheBetween(range) : [];
}

/** All of Löhe's questions on a chief part, from its introduction to its transition, in the order of the book. */
export function loeheForChiefPart(chief: ChiefPartId): LoeheQuestion[] {
  const p = LOEHE_PLACES[chief];
  const from = (p.intro ?? p.pieces[0]!)[0];
  const to = (p.outro ?? p.pieces.at(-1)!)[1];
  return loeheBetween([from, to]).flatMap((l) => l.items.filter(isQuestion));
}

/** Learning days of a chief part: one week, Monday to Sunday. */
export const LOEHE_DAYS = 7;

/**
 * Löhe's questions on one piece for one learning day (0 = Monday), so that
 * they always explain the piece learned that day. A piece learned on several
 * days has its questions shared out evenly over them. The introductory
 * questions go with the first piece on its first day, the transition with
 * the last piece on its last day. Nothing lapses: what is not asked simply
 * stays in the book.
 */
export function loeheForPieceOnDay(chief: ChiefPartId, pieceIndex: number, dayIndex: number): LoeheQuestion[] {
  const p = LOEHE_PLACES[chief];
  const range = p.pieces[pieceIndex];
  const days = WEEKDAY_PIECES[chief].flatMap((d, i) => (d.includes(pieceIndex) ? [i] : []));
  const share = days.indexOf(dayIndex);
  if (!range || share < 0) return [];
  const qs = (r: Range) => loeheBetween(r).flatMap((l) => l.items.filter(isQuestion));
  const own = qs(range);
  const start = Math.round((own.length * share) / days.length);
  const end = Math.round((own.length * (share + 1)) / days.length);
  return [
    ...(p.intro && pieceIndex === 0 && share === 0 ? qs(p.intro) : []),
    ...own.slice(start, end),
    ...(p.outro && pieceIndex === p.pieces.length - 1 && share === days.length - 1 ? qs(p.outro) : []),
  ];
}

/** All of Löhe's questions for one learning day: those on the pieces learned that day. */
export function loeheForDay(chief: ChiefPartId, dayIndex: number): LoeheQuestion[] {
  return (WEEKDAY_PIECES[chief][dayIndex] ?? []).flatMap((pi) => loeheForPieceOnDay(chief, pi, dayIndex));
}
