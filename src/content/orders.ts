/**
 * The shape of every order as data: which parts come in which sequence and
 * which fields each part offers. The UI renders from this, and tests check
 * the permanent rules against it:
 *  - Word → prayer → alignment (rule 2)
 *  - every examination and confession ends in absolution (rule 1)
 *  - review comes before examination, in separate steps (rule 3)
 *  - examination and confession have no input field (rule 9)
 *  - every order has a short form (rule 8)
 */
import type { OrderForm } from '../domain/model';

export type OrderId = 'atBed' | 'morning' | 'vespers' | 'compline';

export type PartKind =
  | 'sign-of-cross'
  | 'versicles'
  | 'hymn'
  | 'psalm'
  | 'prayer-before-reading'
  | 'reading'
  | 'prayer-after-reading'
  | 'catechism'
  | 'wreath-instruction'
  | 'wreath-thanks'
  | 'confession'
  | 'absolution'
  | 'wreath-petition'
  | 'free-prayer'
  | 'silence'
  | 'canticle'
  | 'intercession'
  | 'lords-prayer'
  | 'creed'
  | 'armor'
  | 'armor-evening'
  | 'alignment'
  | 'thanks'
  | 'review'
  | 'examination'
  | 'baptism'
  | 'collect'
  | 'blessing'
  | 'morning-blessing'
  | 'evening-blessing'
  | 'house-intercession'
  | 'house-blessing'
  | 'week-review';

/**
 * Path of a stored value within a Day, e.g. "morning.verse",
 * "morning.wreath.thanks", "evening.thanks.0", "evening.marks".
 */
export type FieldPath = string;

export interface Part {
  kind: PartKind;
  title: string;
  fields?: readonly FieldPath[];
  optional?: boolean;
}

export interface Step {
  id: string;
  title: string;
  minutes: number;
  parts: readonly Part[];
}

export interface Order {
  id: OrderId;
  form: OrderForm;
  title: string;
  steps: readonly Step[];
}

const p = (kind: PartKind, title: string, extra: Omit<Part, 'kind' | 'title'> = {}): Part => ({
  kind,
  title,
  ...extra,
});

/* ---------------------------------------------------------------- morning */

const AT_BED: Order = {
  id: 'atBed',
  form: 'full',
  title: 'Am Bett',
  steps: [
    {
      id: 'atBed',
      title: 'Am Bett',
      minutes: 3,
      parts: [
        p('sign-of-cross', 'Kreuzzeichen'),
        p('lords-prayer', 'Vaterunser'),
        p('baptism', 'Taufgedächtnis'),
        p('morning-blessing', 'Morgensegen'),
      ],
    },
  ],
};

/** Short form of the bedside prayer: when even twenty minutes do not work. */
const AT_BED_SHORT: Order = {
  ...AT_BED,
  form: 'short',
  steps: [
    {
      id: 'atBed',
      title: 'Am Bett',
      minutes: 1,
      parts: [p('lords-prayer', 'Vaterunser'), p('morning-blessing', 'Morgensegen')],
    },
  ],
};

const MORNING_FULL: Order = {
  id: 'morning',
  form: 'full',
  title: 'Stille Zeit',
  steps: [
    {
      id: 'opening',
      title: 'Eröffnung',
      minutes: 3,
      parts: [
        p('versicles', 'Versikel und Gloria'),
        p('hymn', 'Hymnus', { optional: true }),
        p('psalm', 'Psalm des Tages'),
      ],
    },
    {
      id: 'word',
      title: 'Das Wort',
      minutes: 20,
      parts: [
        p('prayer-before-reading', 'Eingangsgebet'),
        p('reading', 'Lesung', {
          fields: [
            'morning.mainPoint',
            'morning.verseRef',
            'morning.verse',
            'morning.aboutGod',
            'morning.aboutMan',
            'morning.questionNo',
            'morning.questionAnswer',
            'morning.salvationHistory',
            'morning.unclear',
            'morning.challenge',
            'morning.application',
          ],
        }),
        p('prayer-after-reading', 'Schlußgebet'),
      ],
    },
    {
      id: 'prayer',
      title: 'Das Gebet',
      minutes: 12,
      parts: [
        p('catechism', 'Worüber du betest', { optional: true }),
        p('wreath-instruction', 'Unterricht', { fields: ['morning.wreath.instruction'] }),
        p('wreath-thanks', 'Danksagung', { fields: ['morning.wreath.thanks'] }),
        p('confession', 'Beichte'),
        p('absolution', 'Zuspruch'),
        p('wreath-petition', 'Bitte', { fields: ['morning.wreath.petition'] }),
        p('free-prayer', 'Freies Gebet', { fields: ['morning.onMyHeart', 'morning.forMyself'] }),
        p('silence', 'Stille'),
      ],
    },
    {
      id: 'response',
      title: 'Die Antwort',
      minutes: 5,
      parts: [
        p('canticle', 'Benedictus'),
        p('house-intercession', 'Fürbitte für das Haus'),
        p('intercession', 'Fürbitte', { fields: ['morning.peopleToday'] }),
        p('lords-prayer', 'Vaterunser'),
      ],
    },
    {
      id: 'alignment',
      title: 'Die Ausrichtung',
      minutes: 3,
      parts: [
        // Put on the armour for the day before the day is ordered (Word → prayer → alignment).
        p('armor', 'Die geistliche Waffenrüstung'),
        p('alignment', 'Die drei Dinge', {
          fields: ['morning.three.word', 'morning.three.house', 'morning.three.work'],
        }),
      ],
    },
    {
      id: 'blessing',
      title: 'Der Segen',
      minutes: 2,
      parts: [p('collect', 'Kollekte'), p('blessing', 'Beschluß und Segen')],
    },
  ],
};

const MORNING_SHORT: Order = {
  id: 'morning',
  form: 'short',
  title: 'Stille Zeit – Kurzform',
  steps: [
    {
      id: 'opening',
      title: 'Versikel, Gloria, Psalm',
      minutes: 3,
      parts: [p('versicles', 'Versikel und Gloria'), p('psalm', 'Psalm des Tages')],
    },
    {
      id: 'word',
      title: 'Lesung',
      minutes: 10,
      parts: [
        p('reading', 'Einmal lesen, ein Vers, die Doppelfrage', {
          fields: ['morning.verseRef', 'morning.verse', 'morning.aboutGod', 'morning.aboutMan'],
        }),
      ],
    },
    {
      id: 'prayer',
      title: 'Freies Gebet über den Vers',
      minutes: 3,
      parts: [p('free-prayer', 'Freies Gebet', { fields: ['morning.onMyHeart'] })],
    },
    {
      id: 'lordsPrayer',
      title: 'Fürbitte und Vaterunser',
      minutes: 1,
      // The short form prays only the prayer for all, without the one in the centre.
      parts: [p('house-intercession', 'Fürbitte für das Haus'), p('lords-prayer', 'Vaterunser')],
    },
    {
      id: 'alignment',
      title: 'Die drei Dinge',
      minutes: 2,
      parts: [
        p('alignment', 'Die drei Dinge', {
          fields: ['morning.three.word', 'morning.three.house', 'morning.three.work'],
        }),
      ],
    },
    { id: 'blessing', title: 'Segen', minutes: 1, parts: [p('blessing', 'Segen')] },
  ],
};

/* ---------------------------------------------------------------- evening */

/**
 * The Vesper after the Lutheran church orders, on three pages: praise (opening,
 * psalm), the Word (reading or devotion, hymn, Magnificat), prayer (intercession,
 * Lord's Prayer, collect, blessing). The hymn follows the reading, as there.
 */
const VESPERS_FULL: Order = {
  id: 'vespers',
  form: 'full',
  title: 'Vesper',
  steps: [
    { id: 'praise', title: 'Lob', minutes: 3, parts: [p('versicles', 'Eröffnung'), p('psalm', 'Psalm')] },
    {
      id: 'word',
      title: 'Wort',
      minutes: 4,
      parts: [p('reading', 'Lesung', { fields: ['evening.reading'] }), p('hymn', 'Hymnus'), p('canticle', 'Magnificat')],
    },
    {
      id: 'prayer',
      title: 'Gebet',
      minutes: 3,
      parts: [
        p('intercession', 'Fürbitte', { fields: ['evening.intercession'] }),
        p('lords-prayer', 'Vaterunser'),
        p('collect', 'Kollekte'),
        p('blessing', 'Segen'),
      ],
    },
  ],
};

/** Short form: hymn – psalm – short reading – Lord's Prayer – blessing, on one page. */
const VESPERS_SHORT: Order = {
  id: 'vespers',
  form: 'short',
  title: 'Vesper – Kurzform',
  steps: [
    {
      id: 'vespers',
      title: 'Vesper',
      minutes: 5,
      parts: [
        p('hymn', 'Hymnus'),
        p('psalm', 'Psalm'),
        p('reading', 'Kurze Lesung', { fields: ['evening.reading'] }),
        p('lords-prayer', 'Vaterunser'),
        p('blessing', 'Segen'),
      ],
    },
  ],
};

/**
 * The Nachtgebet on four pages, after Luther's evening blessing in the Small
 * Catechism (sign of the cross, Creed, Lord's Prayer, evening blessing), with
 * thanks and review, then examination, confession and absolution on one page:
 * review before examination, never mixed (rule 3), the examination always
 * ending in the word of forgiveness (rule 1).
 */
const COMPLINE_FULL: Order = {
  id: 'compline',
  form: 'full',
  title: 'Nachtgebet',
  steps: [
    {
      id: 'sign',
      title: 'Kreuz, Glaube, Vaterunser',
      minutes: 0,
      parts: [
        p('sign-of-cross', 'Kreuzzeichen'),
        p('armor-evening', 'Seid nüchtern und wachet'),
        p('creed', 'Glaubensbekenntnis'),
        p('lords-prayer', 'Vaterunser'),
      ],
    },
    {
      id: 'review',
      title: 'Dank und Rückschau',
      minutes: 0,
      parts: [
        p('thanks', 'Dank', { fields: ['evening.thanks.0', 'evening.thanks.1', 'evening.thanks.2'] }),
        p('review', 'Rückschau', { fields: ['evening.marks', 'evening.carry'] }),
      ],
    },
    {
      id: 'examination',
      title: 'Prüfung und Zuspruch',
      minutes: 0,
      parts: [p('examination', 'Prüfung am Dekalog in deinem Stand'), p('confession', 'Bekenntnis'), p('absolution', 'Zuspruch')],
    },
    {
      id: 'blessing',
      title: 'Abendsegen',
      minutes: 0,
      parts: [
        p('baptism', 'Taufgedächtnis'),
        p('intercession', 'Fürbitte', { fields: ['evening.people', 'evening.passedOnTo'] }),
        p('canticle', 'Nunc dimittis', { optional: true }),
        p('evening-blessing', 'Abendsegen'),
        p('house-blessing', 'Segen über das Haus'),
      ],
    },
  ],
};

/**
 * On Sunday evening the weekly review takes the place of the day's thanks and
 * review in the full Nachtgebet: the same page, still before the examination
 * (rule 3). The short form stays short.
 */
export const WEEK_REVIEW_STEP: Step = {
  id: 'review',
  title: 'Wochenrückblick',
  minutes: 0,
  parts: [p('week-review', 'Wochenrückblick')],
};

/** "Kreuzzeichen – Rückschau – Vaterunser – Abendsegen. Das genügt vollkommen." One page. */
const COMPLINE_SHORT: Order = {
  id: 'compline',
  form: 'short',
  title: 'Nachtgebet – Kurzform',
  steps: [
    {
      id: 'compline',
      title: 'Nachtgebet',
      minutes: 0,
      parts: [
        p('sign-of-cross', 'Kreuzzeichen'),
        p('review', 'Rückschau', { fields: ['evening.marks', 'evening.carry'] }),
        p('lords-prayer', 'Vaterunser'),
        p('evening-blessing', 'Abendsegen'),
        p('house-blessing', 'Segen über das Haus'),
      ],
    },
  ],
};

export const ORDERS: readonly Order[] = [
  AT_BED,
  AT_BED_SHORT,
  MORNING_FULL,
  MORNING_SHORT,
  VESPERS_FULL,
  VESPERS_SHORT,
  COMPLINE_FULL,
  COMPLINE_SHORT,
];

export function getOrder(id: OrderId, form: OrderForm): Order {
  const o = ORDERS.find((x) => x.id === id && x.form === form);
  if (!o) throw new Error(`Unknown order ${id}/${form}`);
  return o;
}

export function orderMinutes(o: Order): number {
  return o.steps.reduce((s, st) => s + st.minutes, 0);
}

/** Nominal durations as printed in the booklet. */
export const ORDER_MINUTES: Record<OrderId, Record<OrderForm, number>> = {
  atBed: { full: 3, short: 1 },
  morning: { full: 45, short: 20 },
  vespers: { full: 10, short: 5 },
  compline: { full: 10, short: 3 },
};

/* ---------------------------------------------------------------- rubrics */

export const RUBRICS = {
  atBed: 'Gleich nach dem Aufstehen, noch bevor der Tag anfängt. Es bringt dich auf die Füße; die Stille Zeit beginnt danach, am Tisch.',
  morningShort: 'Nicht Ausnahme, sondern eingebaute Möglichkeit. Wer sie betet, hat die Ordnung gebetet.',
  morningShortDrops:
    'Kranz, Benedictus und Fürbitte entfallen zuerst. Zwei Dinge bleiben immer: das eigene Gebet und die drei Dinge.',
  morningMinimal: 'Und wenn auch zwanzig nicht gehen: Vaterunser und Morgensegen am Bett. Dann ist es genug.',
  confessionNote: 'Wird gebetet, nicht notiert.',
  wreath: 'Der vierfache Kranz, halblaut.',
  freePrayer:
    'Was dich selbst bewegt – ohne Vorlage. Sorge und Freude, eine Entscheidung, eine Last, Bitte für dich selbst. Auch Klage. Noch nicht die Fürbitte für andere.',
  silence: 'Eine Minute. Nichts sagen, nichts planen. Ruhen vor dem, der schon geredet hat.',
  benedictus: 'Das Benedictus stellt den Tag unter das, was Gott schon getan hat, bevor du ihn planst.',
  intercession: 'Das Anliegen des Wochentages und die Menschen, denen du heute begegnest – namentlich, kurz.',
  alignment: 'Jetzt, und erst jetzt, wird der Tag angesehen. Drei, nicht fünf. Beobachtbar – abends mit Ja oder Nein zu beantworten.',
  alignmentNotAVow: 'Die drei Dinge sind kein Gelübde. Was nicht gelingt, ist nicht Sünde, sondern Material für morgen.',
  sendOff: 'Und dann, wie Luther schreibt: mit Freuden an dein Werk gegangen.',
  vespers: 'Der persönliche Abschluss des Tages, für dich allein. Gebet der Kirche, nicht Selbstprüfung.',
  vespersShort: 'Hymnus – Psalm – kurze Lesung – Vaterunser – Segen. Fünf Minuten.',
  /** Without the Nachtgebet, the Vesper closes the day with its review (and examination). */
  vespersClosing: 'Der persönliche Abschluss des Tages, für dich allein. Erst das Gebet der Kirche, dann Rückschau, Prüfung und Zuspruch.',
  vespersShortClosing: 'Hymnus – Psalm – kurze Lesung – Vaterunser – Segen, dann die Rückschau auf den Tag.',
  vespersReading: 'Ein kurzer Abschnitt, ohne Auslegung. Nicht die Bibellese vom Morgen – hier genügen wenige Verse.',
  vespersDevotion: 'Eine Andacht aus einem Buch, das du zur Hand hast. Lies sie langsam und halte fest, was dir wichtig geworden ist.',
  // The house first, then the church (rule 18; until 0.41 the house stood last).
  vespersIntercession: 'Für das eigene Haus, für die Gemeinde, für Obrigkeit und Frieden, für Kranke und Trauernde.',
  magnificat: 'Das Magnificat deutet den Tag von Gottes Handeln her, bevor du ihn von deinem her prüfst.',
  complineShort: 'Kurzform an müden Tagen: Kreuzzeichen, Rückschau, Vaterunser, Abendsegen. Das genügt vollkommen.',
  complineCreed: 'Der Tag wird nicht an deinem Gewissen gemessen, sondern an dem, was bekannt und gebetet wird.',
  thanks: 'Zwei oder drei Dinge dieses Tages. Konkret, nicht pauschal. Auch das Kleine, gerade das Kleine.',
  review: 'Rechenschaft, nicht Beichte. Ein Zeichen, kein Kommentar.',
  reviewMarks: '+ geschehen · ~ angefangen · – nicht geschehen',
  reviewCarry: '„Morgen wieder“ erscheint morgen früh als Vorschlag. „Fallenlassen“: Es war heute Morgen wichtig und ist es nicht mehr.',
  reviewNotSin:
    'Ein nicht erreichtes Ziel ist keine Sünde. Nur wenn wirklich ein Gebot dahintersteht, gehört es in die Prüfung.',
  absolutionAloud: 'Dann sprich dir laut zu – laut, nicht gedacht:',
  absolutionWeight:
    'Dieser Schritt ist der entscheidende. Die Reue endet nicht im Vorsatz, es besser zu machen, sondern in der Vergebung.',
  baptism: 'Bekreuzige dich noch einmal:',
  complineIntercession: 'Die Menschen, die dir heute begegnet sind. Namentlich, nicht als Gruppe. Dann Frau, Kinder, Gemeinde.',
  goodNight: 'Und dann, wie Luther schreibt: flugs und fröhlich geschlafen.',
} as const;
