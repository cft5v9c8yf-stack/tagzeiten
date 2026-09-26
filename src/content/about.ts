import { METHOD_CREDIT } from './method';

export const MOTTO = [
  { text: 'Und des Morgens vor Tage stand er auf und ging hinaus. Und Jesus ging in eine wüste Stätte und betete daselbst.', ref: 'Markus 1,35' },
  { text: 'Dein Wort ist meines Fußes Leuchte und ein Licht auf meinem Wege.', ref: 'Psalm 119,105' },
] as const;

/** "Der Bogen" – the arc of the day, from the end of the booklet. */
export const THE_ARC = {
  morning: [
    'Die Eröffnung stellt dich in das Lob der Kirche.',
    'Das Wort redet, bevor du redest.',
    'Das Gebet macht aus dem Gehörten dein eigenes Wort.',
    'Die Antwort trägt es in das Gebet der Kirche.',
    'Die Ausrichtung bringt es an den Tag.',
    'Der Segen entläßt dich.',
  ],
  evening: [
    'Die Vesper stellt dich wieder in das Lob.',
    'Die Rückschau legt den Vorsatz ab.',
    'Die Prüfung legt die Schuld ab.',
    'Der Zuspruch hebt sie auf.',
    'Das Taufgedächtnis sagt, worauf du morgen wieder aufstehst.',
  ],
  monthly:
    'Und einmal im Monat holt die Beichte dich aus dem Kreis heraus, in dem du sonst mit dir selbst verhandelst.',
};

export const SOURCES = [
  'Bibeltexte in der Fassung Luthers (1912), sprachlich behutsam geglättet. Bibelstellen stehen als Angabe; gelesen wird in der gedruckten Bibel.',
  'Gebetstexte aus Luthers Kleinem Katechismus (traditionelle Fassung), der Deutschen Messe und „Eine einfältige Weise zu beten“ (1535).',
  'Lieder: Nikolaus Herman (1560), Erasmus Alber (1556), Georg Niege (1592), Paul Gerhardt (1647).',
  METHOD_CREDIT,
];

export const PRIVACY = [
  'Deine Einträge liegen nur auf diesem Gerät. Es gibt kein Konto, keine Analytik und keine Tracker.',
  'Was du in der Prüfung und in der Beichte betest, wird nirgends gespeichert. Dafür gibt es kein Feld.',
  'Du kannst jederzeit alles exportieren oder alles löschen.',
];

export const NO_SCORE_NOTE = 'Kein Serienzähler, keine Kette, die reißt. Der Rhythmus der Woche, nicht die Leistung.';
