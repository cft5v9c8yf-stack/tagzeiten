/**
 * The weekly review on Sunday evening (backlog, 6 October 2026), in the full
 * Nachtgebet in place of the day's thanks and review. A review, not a
 * confession: the examination follows on its own page (rule 3).
 *
 * Thanks for the people and tasks God has entrusted, in the order of rule 18:
 * the house, the church, the work, then the neighbours and the country. The
 * plan named "Bürger" (Romans 13,1); it became "Unser Land" with 1 Timothy
 * 2,1–2, which calls for thanksgiving for those in authority.
 */
import type { HouseNeed } from '../domain/house';
import type { EveningTextField } from '../domain/model';
import { WINTER_ARC_COMFORT } from './winterArc';

export interface WeekPlace {
  field: EveningTextField;
  /** The matching passage, as a reference only (rule 13). */
  ref: string;
  /** Shown only when "Mein Haus" holds this person; then under his or her name. */
  needs?: HouseNeed;
}

export const WEEK_PLACES: readonly WeekPlace[] = [
  { field: 'weekWife', ref: '1. Petrus 3,7', needs: 'wife' },
  { field: 'weekChildren', ref: 'Epheser 6,4', needs: 'children' },
  { field: 'weekChurch', ref: '1. Thessalonicher 5,12-13' },
  { field: 'weekWork', ref: 'Epheser 6,5-8' },
  { field: 'weekNeighbours', ref: 'Römer 13,8-10' },
  { field: 'weekCountry', ref: '1. Timotheus 2,1-2' },
];

export const WEEK_REVIEW = {
  rubric:
    'Schau auf die Woche zurück: auf die Menschen und Aufgaben, die Gott dir anvertraut hat. Eine Zeile genügt. Was leer bleibt, darf leer bleiben.',
  noted: 'Diese Woche abends notiert',
  thanks: 'Wofür danke ich?',
  hall: 'Aus der Streithalle',
  ahead: 'Für die neue Woche',
} as const;

/**
 * The review ends in the word of comfort the Streithalle's weekly review ends
 * in (Lamentations 3,22–23), so a Sunday with a round under way has only one.
 */
export const WEEK_REVIEW_COMFORT = WINTER_ARC_COMFORT;
