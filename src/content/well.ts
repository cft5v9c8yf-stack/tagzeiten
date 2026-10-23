/**
 * "Treffen am Abendbrunnen": the weekly check-in of a married man with his wife.
 * Verses are verbatim Luther 1912 (checked in weeklyVerses.source.test.ts); the
 * guide is as the user wrote it. A name is used only where the question is the
 * husband's own; the questions put to her stay "du".
 */
import type { WeeklyVerse } from './weeklyVerses';

export const WELL_TITLE = 'Treffen am Abendbrunnen';
export const WELL_SUBTITLE = 'Der wöchentliche Ehe-Check-in';

export const WELL_VERSES: readonly WeeklyVerse[] = [
  {
    ref: '1. Mose 24,11',
    source: '1Mo 24,11',
    parts: [
      'Da ließ er die Kamele sich lagern draußen vor der Stadt bei einem Wasserbrunnen, des Abends um die Zeit, wo die Weiber pflegten herauszugehen und Wasser zu schöpfen,',
    ],
  },
  {
    ref: 'Prediger 4,12',
    source: 'Pred 4,12',
    parts: ['Einer mag überwältigt werden, aber zwei mögen widerstehen; und eine dreifältige Schnur reißt nicht leicht entzwei.'],
  },
];

/** The word of comfort under the fourth step (rule 1: a self-examination ends in a word of forgiveness). */
export const WELL_COMFORT: WeeklyVerse = {
  ref: '1. Johannes 1,9',
  source: '1Jo 1,9',
  parts: ['So wir aber unsre Sünden bekennen, so ist er treu und gerecht, daß er uns die Sünden vergibt und reinigt uns von aller Untugend.'],
};

export const WELL_INTRO =
  'Am Brunnen begegnen sich in der Schrift die großen Paare: Rebekka und der Knecht Abrahams (1. Mo 24), Jakob und Rahel (1. Mo 29), Mose und Zippora (2. Mo 2). Der Brunnen ist ein Ort der Begegnung, des Schöpfens und der Erfrischung. Hier trefft ihr euch einmal in der Woche am Abend – zu zweit, mit Gott in der Mitte, als dreifache Schnur.';

export const WELL_FRAME = {
  intro:
    'Einmal pro Woche 20 bis 30 Minuten, immer zur gleichen Zeit am Abend, zum Beispiel nach dem Zubettbringen der Kinder. Handys weg, kein Organisations-Marathon, sondern ein Gespräch.',
  points: [
    { label: 'Zeit', text: 'fester Abend, lieber kürzer als gar nicht' },
    { label: 'Ort', text: 'ruhig, bequem, ohne Ablenkung (Sofa oder Küchentisch)' },
    { label: 'Start und Ende', text: 'mit Dank und Gebet beginnen, mit Gebet füreinander schließen' },
  ],
} as const;

export interface WellStep {
  id: string;
  title: string;
  /** The questions of the step; the wife's name stands in for "dir"/"dich" where the question is the husband's own. */
  questions: (name: string) => string[];
  refs: string;
}

export const WELL_STEPS: readonly WellStep[] = [
  {
    id: 'dank',
    title: 'Dank',
    questions: (n) => [`Was habe ich diese Woche an ${n || 'dir'} besonders geschätzt?`],
    refs: '1. Thess 5,18 · Spr 31,28',
  },
  {
    id: 'befinden',
    title: 'Befinden',
    questions: () => ['Wie geht es dir wirklich: körperlich, seelisch, geistlich?'],
    refs: 'Gal 6,2',
  },
  {
    id: 'entlastung',
    title: 'Entlastung',
    questions: () => ['Wo hast du dich allein gefühlt?', 'Was kann ich konkret übernehmen?'],
    refs: 'Eph 5,25 · Phil 2,3–4',
  },
  {
    id: 'beziehung',
    title: 'Beziehung',
    questions: (n) => [
      `Wo habe ich ${n || 'dich'} verletzt oder übersehen? (Zuerst selbst benennen.)`,
      'Gibt es etwas, das du bisher nicht gesagt hast?',
    ],
    refs: 'Eph 4,26 · Jak 5,16',
  },
  {
    id: 'ausblick',
    title: 'Ausblick',
    questions: (n) => [
      'Was steht nächste Woche an (Termine, Gemeinde, Kinder), und wo brauchen wir einander?',
      `Wie kann ich ${n || 'dir'} in der kommenden Woche dienen?`,
    ],
    refs: 'Spr 16,3',
  },
  {
    id: 'gebet',
    title: 'Gebet',
    questions: () => ['Ein Anliegen von dir, eines von mir. Gemeinsam beten.'],
    refs: '1. Petr 3,7',
  },
];

/** Said under the notes and the fourth step (rule 9): nothing of this is written down. */
export const WELL_CONFESSION_NOTE = 'Was ihr einander bekennt, bleibt im Gespräch und wird hier nicht notiert.';

export const WELL_POSTURE: readonly { label: string; text: string; ref?: string }[] = [
  { label: 'Zuhören vor Lösen', text: 'Frag: „Magst du erzählen, oder soll ich mitdenken?“', ref: 'Jak 1,19' },
  { label: 'Nicht verteidigen', text: 'Erst „Danke, dass du das sagst“, erklären kann später kommen.' },
  { label: 'Vorangehen', text: 'Du bist zuerst offen und benennst zuerst eigene Fehler.' },
  { label: 'Verbindlich werden', text: 'Ein bis zwei konkrete Dinge, die du bis zum nächsten Mal wirklich umsetzt.' },
  { label: 'Kein Gericht', text: 'Das Treffen ist ein Raum für Ehrlichkeit, kein Verhör.' },
  { label: 'Präsent bleiben', text: 'Bei Unangenehmem nicht in Abwehr gehen, sondern atmen, zuhören und dabeibleiben.' },
];

export const WELL_NOTES = {
  resolution: 'Mein Vorsatz für diese Woche',
  herWish: 'Ihr Wunsch an mich, den ich umsetze',
  herConcern: 'Gebetsanliegen von ihr',
  myConcern: 'Gebetsanliegen von mir',
  next: 'Nächstes Treffen am Abendbrunnen',
} as const;
