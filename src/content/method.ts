/**
 * The reading method follows Hanniel Strebel. Described in our own words,
 * always with the source (rule 14).
 */

export const METHOD_SOURCE = {
  author: 'Hanniel Strebel',
  title: 'Überblick: Hanniel zum Lesen der Bibel',
  site: 'hanniel.ch',
  date: '31.08.2026',
  url: 'https://hanniel.ch',
};

export const METHOD_CREDIT = `Lesemethode nach ${METHOD_SOURCE.author}, „${METHOD_SOURCE.title}“ (${METHOD_SOURCE.site}, ${METHOD_SOURCE.date}).`;

/** Short rubrics shown in step 2. */
export const READING_RUBRICS = {
  frame: 'Gebet vorher, Gebet nachher – die Lesung steht in dieser Klammer.',
  portion: 'Nach dem Plan lesen, nicht nach Lust. Lieber wenig und gründlich als viel und flüchtig.',
  restart: 'Ausgesetzt? Einfach beim nächsten Abschnitt weitermachen. Nichts nachholen, nichts aufrechnen.',
  threeTimes: 'Dreimal lesen: ohne Stift, mit Stift nach Farbcode, dann zusammenfassen.',
  paper: 'Du liest auf Papier, mit Farbstiften. Die App zeigt nur, wo.',
};

export const READING_PASSES = [
  ['Erster Durchgang', 'Ohne Stift. Einfach wahrnehmen, was dasteht.'],
  ['Zweiter Durchgang', 'Mit Stift: nach Farbcode markieren und Zeichen an den Rand setzen.'],
  ['Dritter Durchgang', 'Die Hauptaussage für dich zusammenfassen und je Kapitel einen Vers auswählen, den du dir einprägst.'],
] as const;

/** The coloured pencils on paper; `hex` draws a stroke of that pencil in the app. */
export const COLOR_CODE = [
  { color: 'Blau', hex: '#2f6fce', meaning: 'Wer Gott ist und was er tut' },
  { color: 'Rot', hex: '#d23a2f', meaning: 'Was Gott gebietet und fordert' },
  { color: 'Violett', hex: '#7b4bb7', meaning: 'Antworten in Gottesfurcht' },
  { color: 'Braun', hex: '#8a5a2b', meaning: 'Sünde und Gottlosigkeit' },
  { color: 'Orange', hex: '#ef8a1f', meaning: 'Schlüsselbegriffe' },
  { color: 'Grün', hex: '#3c9a4a', meaning: 'Wo die Bibel sich selbst zitiert' },
] as const;

export const MARGIN_MARKS = [
  { mark: '?', meaning: 'Unklar – später nachfassen.' },
  { mark: '!', meaning: 'Das trifft mich.' },
  { mark: '→', meaning: 'Eine Idee zur Umsetzung. Daraus wird später das erste der drei Dinge.' },
] as const;

export const DOUBLE_QUESTION_NOTE =
  'Die Doppelfrage nach Gott und nach dem Menschen gehört zu jedem Text. Sie hält davon ab, nur zu suchen, was mir gerade nützt.';

export const SALVATION_HISTORY_NOTE =
  'Wohin gehört der Text in der großen Geschichte von Schöpfung, Fall, Erlösung und Vollendung – und wie weist er auf Christus?';

export const HARD_PASSAGES_NOTE =
  'Schwierige Stellen nicht überspringen. Von innen nach außen fragen: das Wort im Satz, der Satz im Abschnitt, der Abschnitt im Buch, das Buch im Testament, das Testament in der ganzen Heilsgeschichte. Was offen bleibt, bekommt ein Fragezeichen.';

export const WREATH_INTRO =
  'Aus dem Gehörten wird dein eigenes Gebet. Luther schrieb den vierfachen Kranz für seinen Barbier Peter Beskendorf – als Anleitung zum Beten, nicht zum Studieren.';
export const WREATH_MATTER = 'Stoff: der Vers aus der Lesung – oder das Katechismusstück. Eines von beiden, nicht beides.';
export const WREATH_RULE_OF_THUMB =
  'Hat die Lesung dich getroffen, bleib beim Vers. War sie spröde, nimm den Katechismus.';
export const WREATH_FREEDOM =
  'Wenn der Heilige Geist mitten hinein zu predigen anfängt, laß die Ordnung fahren und höre zu. Die Form ist Gerüst, nicht Gefängnis.';
