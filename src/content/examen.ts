/**
 * Examination at the Decalogue in one's station, one station per weekday.
 * The examination has no input field (rule 9) and is always followed by
 * confession and absolution (rule 1).
 */
import type { Weekday } from '../domain/dates';

export type StationId = 'husband' | 'father' | 'worker' | 'preacher' | 'neighbour';

export interface Station {
  id: StationId;
  title: string;
  /** Lead-in above the question; defaults to "Als {title}". */
  label?: string;
  question: string;
  /** Matching passages from the Table of Duties (Haustafel). */
  refs: readonly string[];
}

export const STATIONS: Record<StationId, Station> = {
  husband: {
    id: 'husband',
    title: 'Ehemann',
    question: 'Habe ich meine Frau heute geehrt, oder nur verwaltet?',
    refs: ['1. Petrus 3,7', 'Kolosser 3,19'],
  },
  father: {
    id: 'father',
    title: 'Vater',
    question: 'Habe ich meine Kinder heute gesehen, oder nur beaufsichtigt?',
    refs: ['Epheser 6,4', 'Kolosser 3,21'],
  },
  worker: {
    id: 'worker',
    title: 'Mitarbeiter und Kollege',
    question:
      'War ich treu in dem, was mir anvertraut ist? Habe ich über andere geredet, wie ich möchte, daß über mich geredet wird?',
    refs: ['Epheser 6,5-8', 'Epheser 6,9'],
  },
  preacher: {
    id: 'preacher',
    title: 'Prediger und Bruder in der Gemeinde',
    question: 'Habe ich Gottes Wort heute geachtet und gern gehört? Habe ich gedient oder mich dargestellt?',
    refs: ['1. Timotheus 3,2-6', 'Titus 1,9'],
  },
  neighbour: {
    id: 'neighbour',
    title: 'Nächster',
    label: 'Gegenüber dem Nächsten',
    // Echoes Rom 13,8: "Seid niemand nichts schuldig, denn daß ihr euch untereinander liebet."
    question: 'Wem bin ich heute die Liebe schuldig geblieben?',
    refs: ['Römer 13,8-10'],
  },
};

export const STATION_BY_WEEKDAY: Record<Weekday, StationId> = {
  1: 'husband',
  2: 'father',
  3: 'worker',
  4: 'preacher',
  5: 'neighbour',
  6: 'father',
  0: 'husband',
};

export const EXAMEN_INTRO =
  'Andere Frage, anderes Register: nicht „was ist geschehen“, sondern „wo bin ich schuldig geblieben“. Nicht Stimmungen abklopfen, sondern das Amt befragen, das dir gegeben ist. Eine Frage genügt.';
export const EXAMEN_NOTE = 'Wird gebetet, nicht notiert.';
