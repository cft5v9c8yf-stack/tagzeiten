/**
 * The Wüstenzeit (since 0.39): a fixed span of days with habits chosen from
 * four packages, further habits, or one's own. The texts are word for word
 * as given (7 October 2026), with three changes the rules ask for: no emojis
 * in the names (rule 16), the Bible verses after Luther 1912 (rule 12), and
 * the marks of the rhythm ("nur freitags") not shown. The background notes
 * ("about") come from the collection sent the same day.
 *
 * Since 0.40 nothing stands twice: where Henoch already has the habit (Bibel
 * lesen, Leibliche Übung, Opfer und Gaben, Gemeinschaft mit Brüdern), the offer
 * takes that one, as the Hauskirche always did; and what the orders already
 * hold (the blessings, the psalm, the thanks, the examination) is ticked
 * with them, or by hand on days without them. The 90-Tage-Standard, before a
 * text of its own beside the guide, is a package now, the fifth: its points
 * with their notes from the plan, its phases and weekly focuses in the week.
 */
import type { Weekday } from '../domain/dates';
import type { HouseNeed } from '../domain/house';
import type { Rhythm } from '../domain/model';
import { DEFAULT_TIMES } from '../domain/winterArc';
import { WINTER_ARC_ABOUT, WINTER_ARC_DAY, WINTER_ARC_ITEMS, WINTER_ARC_LEAD, WINTER_ARC_TITLE, WINTER_ARC_WEEK } from './winterArc';

export interface DesertVerse {
  text: string;
  ref: string;
  /** Book, chapter and verse in the Luther 1912 source, for verification. */
  source: string;
}

const verse = (text: string, ref: string, source: string): DesertVerse => ({ text, ref, source });

/** A piece of a paragraph: plain, or set in italics or bold as in the text given. */
export type Run = string | { em: string } | { strong: string };

export const DESERT_HOSEA = verse(
  'Ich will sie locken und will sie in die Wüste führen und freundlich mit ihr reden.',
  'Hos 2,16',
  'Hos 2,16',
);

/** 1 Tim 4,7: the verse of the guide, of Wüstenweg, and of a Wüstenzeit of mostly own habits. */
export const DESERT_VERSE = verse('Übe dich selbst aber in der Gottseligkeit.', '1 Tim 4,7', '1Tim 4,7');

export const DESERT_GUIDE = {
  title: 'Wüstenzeit',
  tagline: 'Weniger Ablenkung. Mehr Raum für Gott.',
  paragraphs: [
    [
      `In der Bibel ist die Wüste kein leerer Ort, sondern ein Ort der Begegnung. Israel lernte in 40 Jahren Wüste, von Gottes Versorgung zu leben. Mose blieb 40 Tage auf dem Berg, Elia wanderte 40 Tage zum Horeb, und Jesus selbst ging vor seinem öffentlichen Wirken 40 Tage in die Wüste. Durch den Propheten Hosea sagt Gott über sein Volk: „${DESERT_HOSEA.text}“ (${DESERT_HOSEA.ref})`,
    ],
    [
      'Später zogen Christen wie Antonius bewusst in die ägyptische Wüste. Diese Wüstenväter suchten Stille, Gebet und ein einfaches Leben. Sie nannten das ',
      { em: 'Askese' },
      ', wörtlich übersetzt: Training.',
    ],
    [
      'Daran knüpft die Wüstenzeit an. Du legst einen festen Zeitraum fest, wählst ein Paket oder eigene Gewohnheiten und bleibst Tag für Tag dran.',
    ],
    [
      { strong: 'Wichtig:' },
      ' Die Wüstenzeit ist kein Leistungsprogramm. Gottes Annahme musst du dir nicht verdienen, sie ist dir in Christus längst geschenkt. Du trainierst also nicht ',
      { em: 'für' },
      ' die Gnade, sondern ',
      { em: 'aus' },
      ' ihr heraus. Du schaffst Raum, damit Gottes Wort in deinem Alltag Platz bekommt. Und wenn du einen Tag verpasst, fängst du am nächsten einfach neu an.',
    ],
  ] as readonly (readonly Run[])[],
  verse: DESERT_VERSE,
} as const;

/** Above the choice of habits. */
export const DESERT_CHOICE_LEAD =
  'Wähle ein Paket als Startpunkt oder stell dir deine eigene Wüstenzeit zusammen. Weniger ist oft mehr: Lieber drei Gewohnheiten treu halten als zehn halbherzig.';

/**
 * What in the orders already keeps a habit of the offer: "Am Bett" or the
 * Stille Zeit (the Morgensegen), the Stille Zeit itself, a psalm prayed in the Stille Zeit or the
 * Vesper, both blessings, the full Nachtgebet with its examination, a line of
 * thanks written down.
 */
export type Follow = 'atBed' | 'stillTime' | 'psalm' | 'blessings' | 'examination' | 'thanks';

export interface DesertHabit {
  /** The id of the habit in the profile; where Henoch already has the habit, its id. */
  id: string;
  name: string;
  /** The short description. */
  note: string;
  /** Background, from the collection. */
  about?: string;
  rhythm: Rhythm;
  /** Daily habits only on these weekdays. */
  days?: readonly Weekday[];
  /** Only in Advent. */
  advent?: true;
  /** Listed once "Mein Haus" holds wife, children or both. */
  needs?: HouseNeed;
  /** Kept with the orders as well as by hand. */
  follows?: Follow;
}

export interface DesertPack {
  id: string;
  name: string;
  tagline: string;
  description: string;
  verse: DesertVerse;
  habits: readonly DesertHabit[];
}

const daily = (id: string, name: string, note: string, extra: Partial<DesertHabit> = {}): DesertHabit => ({
  id,
  name,
  note,
  rhythm: 'daily',
  ...extra,
});
const weekly = (id: string, name: string, note: string, extra: Partial<DesertHabit> = {}): DesertHabit => ({
  id,
  name,
  note,
  rhythm: 'weekly',
  ...extra,
});

const monthly = (id: string, name: string, note: string, extra: Partial<DesertHabit> = {}): DesertHabit => ({
  id,
  name,
  note,
  rhythm: 'monthly',
  ...extra,
});

const BLESSING_ABOUT = 'Luthers Segen aus dem Kleinen Katechismus: kurz und bewährt. Du findest ihn in Henoch.';

/** The notes of the plan to a point of the day, word for word (see content/winterArc.ts). */
const dayNote = (block: number, item: number): string => WINTER_ARC_DAY.blocks[block]!.items[item]!.text;
const weekNote = (row: number): string => WINTER_ARC_WEEK.rows[row]!.how;
const point = (id: string) => WINTER_ARC_ITEMS.find((it) => it.id === id)!;
const pointName = (id: string) => point(id).text(DEFAULT_TIMES);

/**
 * The 90-Tage-Standard as a package: the points of the plan, the times as the
 * plan sets them. Where Henoch has the habit (training, the service, the
 * Sunday, the evening with the wife), that one; the morning in the Word is
 * kept with the Stille Zeit, the journal with a line of thanks.
 */
const STANDARD_PACK: DesertPack = {
  id: 'standard',
  name: WINTER_ARC_TITLE,
  tagline: 'Auf 90 Tage angelegt',
  description: WINTER_ARC_LEAD,
  verse: verse(WINTER_ARC_ABOUT.verse.text, WINTER_ARC_ABOUT.verse.ref, WINTER_ARC_ABOUT.verse.source),
  habits: [
    daily('wz-std-wake', pointName('wake'), dayNote(0, 0)),
    daily('wz-std-word', pointName('word'), dayNote(0, 1), { follows: 'stillTime' }),
    daily('wz-std-journal', pointName('journal'), dayNote(0, 2), { follows: 'thanks' }),
    daily('exercise', pointName('train'), dayNote(0, 3)),
    daily('wz-std-cook', pointName('cook'), dayNote(2, 0)),
    daily('wz-std-dinner', pointName('dinner'), dayNote(2, 1)),
    daily('wz-std-wife', pointName('wife'), dayNote(2, 2), { needs: 'wife' }),
    daily('wz-std-kitchen', pointName('kitchen'), dayNote(2, 3)),
    daily('wz-std-phone', pointName('phone'), dayNote(2, 4)),
    daily('wz-std-night', pointName('night'), dayNote(2, 5)),
    weekly('worship', 'Gottesdienst und Sonntagsruhe', weekNote(0)),
    weekly('wz-std-talk', 'Sonntagsgespräch mit meiner Frau', weekNote(1), { needs: 'wife' }),
    weekly('timeWithWife', 'Abend zu zweit, von mir geplant', weekNote(2)),
    weekly('wz-std-money', '15 Minuten Finanzen', weekNote(3)),
    monthly('mercy', 'Einmal im Monat dienen', weekNote(4)),
  ],
};

export const DESERT_PACKS: readonly DesertPack[] = [
  {
    id: 'aufbruch',
    name: 'Aufbruch',
    tagline: 'Für den Einstieg',
    description:
      'Du willst anfangen, aber ohne dich zu überfordern? Aufbruch hilft dir, mit wenigen Gewohnheiten eine feste geistliche Routine aufzubauen. Klein anfangen und treu bleiben, darum geht es hier.',
    verse: verse('Wer im Geringsten treu ist, der ist auch im Großen treu.', 'Lk 16,10', 'Lk 16,10'),
    habits: [
      daily('wz-morgensegen', 'Morgensegen', 'Beginne den Tag mit Luthers Morgensegen.', { about: BLESSING_ABOUT, follows: 'atBed' }),
      daily('bibleReading', 'Bibellese', 'Lies täglich einen kurzen Abschnitt aus einem Evangelium.'),
      daily('wz-handy-spaeter', 'Handy später', 'Kein Handy, bevor du gebetet hast.'),
      daily('wz-dankbarkeit', 'Dankbarkeit', 'Notiere abends drei Dinge, für die du dankbar bist.', {
        about: 'Im Nachtgebet ist dafür Platz.',
        follows: 'thanks',
      }),
    ],
  },
  {
    id: 'wuestenweg',
    name: 'Wüstenweg',
    tagline: 'Die klassische Wüstenzeit',
    description:
      'Der Wüstenweg verbindet Gebet, Gottes Wort, Verzicht und Bewegung. Diese vier Bereiche haben Christen seit jeher geprägt. Du schaffst bewusst Raum für Gott und übst dich in Treue.',
    verse: DESERT_VERSE,
    habits: [
      daily('wz-segen', 'Morgen- und Abendsegen', 'Rahme deinen Tag mit Gebet ein.', {
        about: 'Luthers Segen aus dem Kleinen Katechismus: kurz und bewährt. Du findest beide in Henoch.',
        follows: 'blessings',
      }),
      daily('wz-psalm', 'Psalm des Tages', 'Bete täglich einen Psalm, so wie die Kirche es seit Jahrhunderten tut.', {
        about: 'Die Mönche beteten alle 150 Psalmen regelmäßig durch. Ein Psalm am Tag reicht für den Anfang.',
        follows: 'psalm',
      }),
      daily('bibleReading', 'Bibel nach Plan', 'Lies ein biblisches Buch während der Wüstenzeit vollständig.', {
        about: 'Ein Evangelium oder ein Brief am Stück, verteilt auf die Wüstenzeit.',
      }),
      daily('wz-freitagsfasten', 'Freitagsfasten', 'Verzichte freitags auf eine Mahlzeit und nutze die Zeit zum Gebet.', {
        days: [5],
      }),
      daily('exercise', 'Bewegung', 'Bewege dich täglich bewusst. Dein Körper ist ein Tempel des Heiligen Geistes.', {
        about: 'Siehe 1. Korinther 6,19.',
      }),
    ],
  },
  {
    id: 'wuestenvaeter',
    name: 'Wie die Wüstenväter',
    tagline: 'Für alle, die tiefer gehen wollen',
    description:
      'Inspiriert von den Christen, die in die Wüste zogen, um Gott ungeteilt zu suchen. Dieses Paket ist anspruchsvoll. Es verlangt frühes Aufstehen, festes Gebet und echten Verzicht. Es ist kein Leistungsnachweis, sondern eine Einladung zu einem Leben ohne Ablenkung.',
    verse: verse(
      'Und des Morgens vor Tage stand er auf und ging hinaus. Und Jesus ging in eine wüste Stätte und betete daselbst.',
      'Mk 1,35',
      'Mk 1,35',
    ),
    habits: [
      daily('wz-frueh-aufstehen', 'Früh aufstehen', 'Steh vor dem Tagesbeginn auf. Die erste Stunde gehört Gott.', {
        about: 'Siehe Psalm 5,4 und Markus 1,35.',
      }),
      daily('wz-stille', 'Stille vor Gott', 'Bleib zehn Minuten in der Stille, ohne Worte und ohne Ablenkung.'),
      daily('wz-vaterunser', 'Vaterunser dreimal täglich', 'Bete es morgens, mittags und abends, wie es die frühen Christen taten.', {
        about: 'Die Didache (um 100 n. Chr.) empfiehlt, es dreimal am Tag zu beten.',
      }),
      daily('wz-fasten-mi-fr', 'Fasten am Mittwoch und Freitag', 'Halte die altkirchlichen Fastentage.', {
        days: [3, 5],
        about: 'Die altkirchliche Praxis aus der Didache: eine Mahlzeit oder ein ganzer Tag.',
      }),
      daily('wz-medienfasten', 'Medienfasten', 'Kein Social Media während der Wüstenzeit.'),
      daily('wz-gewissen', 'Gewissenserforschung', 'Geh abends den Tag vor Gott durch, bekenne Schuld und empfange Vergebung.', {
        about: 'So übst du Gesetz und Evangelium täglich ein. Im Nachtgebet steht dafür „Prüfung und Zuspruch“.',
        follows: 'examination',
      }),
      weekly('wz-bibelvers', 'Bibelvers lernen', 'Lerne jede Woche einen Vers auswendig.'),
    ],
  },
  {
    id: 'hauskirche',
    name: 'Hauskirche',
    tagline: 'Für die ganze Familie',
    description:
      'Luther schrieb seinen Kleinen Katechismus für die Familie, also so, wie ihn ein Hausvater seinem Haus erklären soll. Die Hauskirche holt die Wüstenzeit an euren Küchentisch. Ihr müsst dafür keine perfekte Familienandacht halten. Es geht um kleine, feste Momente, in denen ihr gemeinsam vor Gott kommt und eure Kinder den Glauben im Alltag erleben.',
    verse: verse('Ich aber und mein Haus wollen dem HERRN dienen.', 'Jos 24,15', 'Jos 24,15'),
    habits: [
      daily('tablePrayer', 'Tischgebet', 'Betet vor jeder gemeinsamen Mahlzeit, gesprochen oder gesungen.'),
      daily('wz-abendgebet-kinder', 'Abendgebet mit den Kindern', 'Beendet den Tag gemeinsam mit Gebet, Dank und Fürbitte.', {
        needs: 'children',
      }),
      daily('blessChildren', 'Kinder segnen', 'Legt euren Kindern vor dem Schlafen die Hand auf und sprecht ihnen den Segen zu.'),
      daily('familyDevotion', 'Familienandacht', 'Lest einmal am Tag eine Geschichte aus der (Kinder-)Bibel und redet darüber.'),
      weekly('catechismChildren', 'Katechismus gemeinsam', 'Lernt jede Woche ein Stück aus dem Kleinen Katechismus.', {
        about: 'Er steht in Henoch unter „Wort“ › „Lehre“.',
      }),
      weekly('wz-singen', 'Gemeinsam singen', 'Singt ein Lied pro Woche, das ihr als Familie lernt.', { needs: 'family' }),
      weekly('wz-familienabend', 'Bildschirmfreier Familienabend', 'Haltet einmal pro Woche einen Abend ohne Bildschirme frei.', {
        needs: 'family',
      }),
      daily('wz-adventskalender', 'Bibel-Adventskalender', 'Lest jeden Tag einen Vers, der auf Weihnachten hinführt.', {
        advent: true,
        needs: 'family',
      }),
      daily('wz-adventskranz', 'Adventskranz-Andacht', 'Zündet die Kerze an, singt ein Lied und betet ein kurzes Gebet.', {
        advent: true,
        needs: 'family',
      }),
    ],
  },
  STANDARD_PACK,
];

/** Further habits from the collection, without a package. */
export const DESERT_MORE: readonly DesertHabit[] = [
  daily(
    'wz-fuerbitte',
    'Fürbittliste',
    'Bete täglich für bestimmte Menschen, zum Beispiel für deine Familie, die Gemeinde oder jemanden, der Jesus noch nicht kennt.',
  ),
  daily(
    'wz-katechismus',
    'Katechismus',
    'Jeden Tag ein Stück aus Luthers Kleinem Katechismus lesen oder lernen. Er steht in Henoch unter „Wort“ › „Lehre“.',
  ),
  daily('wz-losung', 'Losung lesen', 'Einfach und alltagstauglich.'),
  daily(
    'wz-verzicht',
    'Verzicht auf etwas Bestimmtes',
    'Süßes, Kaffee, Serien oder Ähnliches. Die freie Zeit oder das gesparte Geld nutzt du bewusst anders.',
  ),
  daily('wz-sabbat', 'Sabbatruhe', 'Einen Tag pro Woche bewusst ruhen und den Sonntag heiligen.', { days: [0] }),
  weekly('worship', 'Gottesdienst', 'Jeden Sonntag hingehen, ohne Ausnahme.'),
  daily('wz-gute-tat', 'Eine gute Tat am Tag', 'Jemanden ermutigen, anrufen oder ihm helfen.'),
  monthly(
    'offering',
    'Geben',
    'Regelmäßig spenden, etwa das, was du durch das Fasten sparst. Fasten, Beten und Almosengeben gehören in Matthäus 6 zusammen.',
  ),
  weekly('brothers', 'Geistlicher Begleiter', 'Dich jede Woche mit jemandem austauschen und Rechenschaft geben.'),
];

export const DESERT_MORE_TITLE = 'Weitere Gewohnheiten';

/** Every habit on offer, in the order of the choice. The reading of the plan stands in two packages. */
export const DESERT_HABITS: readonly DesertHabit[] = [...DESERT_PACKS.flatMap((p) => p.habits), ...DESERT_MORE];

/** Habits of the offer before 0.40 that Henoch already had: they become the habit Henoch has. */
export const RELINKED: Readonly<Record<string, string>> = {
  'wz-bibellese': 'bibleReading',
  'wz-bibel-plan': 'bibleReading',
  'wz-bewegung': 'exercise',
  'wz-geben': 'offering',
  'wz-begleiter': 'brothers',
};

/** Before the examination of conscience: the Word first (rule 2). */
export const DESERT_EXAMEN_VERSE = verse(
  'Erforsche mich, Gott, und erfahre mein Herz; prüfe mich und erfahre, wie ich’s meine. Und siehe, ob ich auf bösem Wege bin, und leite mich auf ewigem Wege.',
  'Psalm 139,23–24',
  'Ps 139,23-24',
);

/* ------------------------------------------------------------ in the church year (1.1) */

/**
 * The invitation to a Wüstenzeit in Advent: on "Heute" until the brother decides, in the
 * Arena all the while. The articles on the homepage are named per year; a year without one
 * shows no link.
 */
export const ADVENT_INVITE = {
  title: 'Eine Wüstenzeit im Advent',
  verse: verse('Bereitet dem HERRN den Weg, macht auf dem Gefilde eine ebene Bahn unserm Gott!', 'Jesaja 40,3', 'Jes 40,3'),
  links: { 2026: 'https://henoch.app/neuigkeiten/advent-2026/' } as Readonly<Partial<Record<number, string>>>,
};

/** Every verse of the Wüstenzeit, for the check against Luther 1912. */
export const DESERT_VERSES: readonly DesertVerse[] = [
  DESERT_HOSEA,
  ADVENT_INVITE.verse,
  DESERT_VERSE,
  DESERT_EXAMEN_VERSE,
  ...DESERT_PACKS.map((p) => p.verse),
];
