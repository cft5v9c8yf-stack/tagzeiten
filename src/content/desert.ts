/**
 * The Wüstenzeit (since 0.39): a fixed span of days with habits chosen from
 * four packages, further habits, or one's own. The texts are word for word
 * as given (7 October 2026), with three changes the rules ask for: no emojis
 * in the names (rule 16), the Bible verses after Luther 1912 (rule 12), and
 * the marks of the rhythm ("nur freitags") not shown. The background notes
 * ("about") come from the collection sent the same day.
 */
import type { Weekday } from '../domain/dates';
import type { HouseNeed } from '../domain/house';
import type { Rhythm } from '../domain/model';

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

export interface DesertHabit {
  /** The id of the habit in the profile; the four of the Hauskirche that Henoch already has keep theirs. */
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

const BLESSING_ABOUT = 'Luthers Segen aus dem Kleinen Katechismus: kurz und bewährt. Du findest ihn in Henoch.';

export const DESERT_PACKS: readonly DesertPack[] = [
  {
    id: 'aufbruch',
    name: 'Aufbruch',
    tagline: 'Für den Einstieg',
    description:
      'Du willst anfangen, aber ohne dich zu überfordern? Aufbruch hilft dir, mit wenigen Gewohnheiten eine feste geistliche Routine aufzubauen. Klein anfangen und treu bleiben, darum geht es hier.',
    verse: verse('Wer im Geringsten treu ist, der ist auch im Großen treu.', 'Lk 16,10', 'Lk 16,10'),
    habits: [
      daily('wz-morgensegen', 'Morgensegen', 'Beginne den Tag mit Luthers Morgensegen.', { about: BLESSING_ABOUT }),
      daily('wz-bibellese', 'Bibellese', 'Lies täglich einen kurzen Abschnitt aus einem Evangelium.'),
      daily('wz-handy-spaeter', 'Handy später', 'Kein Handy, bevor du gebetet hast.'),
      daily('wz-dankbarkeit', 'Dankbarkeit', 'Notiere abends drei Dinge, für die du dankbar bist.', {
        about: 'Im Nachtgebet ist dafür Platz.',
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
      }),
      daily('wz-psalm', 'Psalm des Tages', 'Bete täglich einen Psalm, so wie die Kirche es seit Jahrhunderten tut.', {
        about: 'Die Mönche beteten alle 150 Psalmen regelmäßig durch. Ein Psalm am Tag reicht für den Anfang.',
      }),
      daily('wz-bibel-plan', 'Bibel nach Plan', 'Lies ein biblisches Buch während der Wüstenzeit vollständig.', {
        about: 'Ein Evangelium oder ein Brief am Stück, verteilt auf die Wüstenzeit.',
      }),
      daily('wz-freitagsfasten', 'Freitagsfasten', 'Verzichte freitags auf eine Mahlzeit und nutze die Zeit zum Gebet.', {
        days: [5],
      }),
      daily('wz-bewegung', 'Bewegung', 'Bewege dich täglich bewusst. Dein Körper ist ein Tempel des Heiligen Geistes.', {
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
        about: 'Er steht in Henoch unter „Katechismus“.',
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
    'Jeden Tag ein Stück aus Luthers Kleinem Katechismus lesen oder lernen. Er steht in Henoch unter „Katechismus“.',
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
  weekly(
    'wz-geben',
    'Geben',
    'Regelmäßig spenden, etwa das, was du durch das Fasten sparst. Fasten, Beten und Almosengeben gehören in Matthäus 6 zusammen.',
  ),
  weekly('wz-begleiter', 'Geistlicher Begleiter', 'Dich jede Woche mit jemandem austauschen und Rechenschaft geben.'),
];

export const DESERT_MORE_TITLE = 'Weitere Gewohnheiten';

/** Every habit on offer, in the order of the choice. */
export const DESERT_HABITS: readonly DesertHabit[] = [...DESERT_PACKS.flatMap((p) => p.habits), ...DESERT_MORE];

/** Every verse of the Wüstenzeit, for the check against Luther 1912. */
export const DESERT_VERSES: readonly DesertVerse[] = [DESERT_HOSEA, DESERT_VERSE, ...DESERT_PACKS.map((p) => p.verse)];
