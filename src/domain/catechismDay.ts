/**
 * Six-week catechism cycle: one chief part per week, pieces per weekday.
 * Weeks are counted continuously from a fixed Monday so that the cycle does
 * not jump at the turn of the year.
 */
import { CATECHISM, WEEKDAY_PIECES, type ChiefPart } from '../content/catechism';
import { fromKey, mondayIndex, mondayOf, type DateKey } from './dates';

const EPOCH_MONDAY = Date.UTC(2024, 0, 1); // Monday, 1 January 2024
const CYCLE = CATECHISM.length;

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Weeks since the epoch Monday. */
export function weekNumber(date: DateKey): number {
  const m = fromKey(mondayOf(date));
  const utc = Date.UTC(m.getFullYear(), m.getMonth(), m.getDate());
  return Math.round((utc - EPOCH_MONDAY) / (7 * 864e5));
}

export function chiefPartIndexFor(date: DateKey, weekOffset: number): number {
  return mod(weekNumber(date) + weekOffset, CYCLE);
}

export interface CatechismDay {
  chiefIndex: number;
  chief: ChiefPart;
  pieceIndices: readonly number[];
  /** "Das fünfte Gebot, Das sechste Gebot" */
  label: string;
}

export function catechismFor(date: DateKey, weekOffset: number): CatechismDay {
  const chiefIndex = chiefPartIndexFor(date, weekOffset);
  const chief = CATECHISM[chiefIndex]!;
  const pieceIndices = WEEKDAY_PIECES[chief.id][mondayIndex(date)] ?? [];
  return {
    chiefIndex,
    chief,
    pieceIndices,
    label: pieceIndices.map((i) => chief.pieces[i]?.title ?? '').join(', '),
  };
}

/** The week offset that makes `chiefIndex` the chief part of the week containing `date`. */
export function offsetForChiefPart(date: DateKey, chiefIndex: number): number {
  return mod(chiefIndex - weekNumber(date), CYCLE);
}

export const pieceId = (chief: ChiefPart, index: number) => `${chief.id}.${index}`;

export const ALL_PIECE_IDS: readonly string[] = CATECHISM.flatMap((c) => c.pieces.map((_, i) => pieceId(c, i)));

export const TOTAL_PIECES = ALL_PIECE_IDS.length;

/** Pieces marked as learned by heart; stale ids are ignored. */
export function memorizedCount(memorized: Record<string, boolean>): number {
  return ALL_PIECE_IDS.filter((id) => memorized[id]).length;
}

