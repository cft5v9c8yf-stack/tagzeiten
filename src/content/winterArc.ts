/**
 * The plan of the Streithalle ("Der 90-Tage-Standard"), word for word after
 * reference/winter-arc.md. Bible verses after Luther 1912, as given there.
 * On request the plan's own name ("Winter Arc") stands nowhere in the app
 * (07.10.2026); code and stored data keep their names.
 *
 * Adjusted after rule 18 (08.10.2026), house before church before work, the
 * self last: weeks 6 and 7 swapped („In der Gemeinde dienen“ before „Bei der
 * Arbeit dienen“), and weeks 9 and 10 („Zu Hause führen“ before „Dich selbst
 * führen“). Their tasks and verses went with them.
 *
 * Changed on request (08.10.2026): the third rule no longer asks to avoid two
 * days in a row (rule 4, no chains), and the printed tracker of the source
 * plan is Henoch's list, the week view of the Wüstenzeit, or the 90 days.
 */
import type { HouseNeed } from '../domain/house';
import type { DayBlock, WinterArcItemId, WinterArcTimes, WinterArcWeeklyId } from '../domain/winterArc';

/** The blocks of the day as the plan names them (its schedule): Gott zuerst, dann das Haus, dann die Arbeit. */
export const WINTER_ARC_BLOCK_LABEL: Record<DayBlock, string> = {
  morning: 'Morgen',
  house: 'Haus',
  work: 'Arbeit',
};

export interface WinterArcItem {
  id: WinterArcItemId;
  block: DayBlock;
  /** The text as the tracker has it; the times come from "Meine Zeiten". */
  text: (t: WinterArcTimes) => string;
  /** What stands on days the point does not apply to ("Ruhe" for training, as in the tracker). */
  off: string;
  /** About the wife: shown only once she is entered under "Mein Haus". */
  needs?: HouseNeed;
}

/**
 * The daily standard, in the order and groups of the tracker. The two work
 * blocks of the tracker ("Fokusblock 08–12", "Block 13–17") are left out on
 * request: the men who use it are employed, their working hours are set by others.
 * Since 0.38 this is the template a round's own standard begins with.
 */
export const WINTER_ARC_ITEMS: readonly WinterArcItem[] = [
  { id: 'wake', block: 'morning', text: (t) => `${t.wake} auf, kein Handy`, off: '–' },
  { id: 'word', block: 'morning', text: () => 'Morgenzeit im Wort und Gebet', off: '–' },
  { id: 'journal', block: 'morning', text: () => 'Tagebuch und drei Dankpunkte', off: '–' },
  { id: 'train', block: 'morning', text: () => 'Trainiert', off: 'Ruhe' },
  { id: 'cook', block: 'house', text: () => 'Zu Hause gekocht', off: '–' },
  { id: 'dinner', block: 'house', text: () => 'Abendessen ohne Handy', off: '–' },
  { id: 'wife', block: 'house', text: () => 'Eine Geste für meine Frau', off: '–', needs: 'wife' },
  { id: 'kitchen', block: 'house', text: (t) => `Küche um ${t.kitchen} zu`, off: '–' },
  { id: 'phone', block: 'house', text: () => 'Handy außerhalb des Schlafzimmers', off: '–' },
  { id: 'night', block: 'house', text: (t) => `Gebetet, ${t.night} Licht aus`, off: '–' },
];

/** The weekly standard, once in each week of the round. */
export const WINTER_ARC_WEEKLY: readonly { id: WinterArcWeeklyId; text: string; needs?: HouseNeed }[] = [
  { id: 'church', text: 'Gottesdienst und Sonntagsruhe' },
  { id: 'talk', text: 'Sonntagsgespräch mit meiner Frau', needs: 'wife' },
  { id: 'date', text: 'Abend zu zweit, von mir geplant', needs: 'wife' },
  { id: 'money', text: '15 Minuten Finanzen' },
];

/** The monthly point; it counts for the calendar month. */
export const WINTER_ARC_MONTHLY = 'Gedient (einmal im Monat)';

/** "Meine Zeiten": what each time stands for. */
export const WINTER_ARC_TIME_LABELS: Record<keyof WinterArcTimes, string> = {
  wake: 'Aufstehen',
  kitchen: 'Küche zu',
  night: 'Licht aus',
};

/* ------------------------------------------------------------ the guide */

export interface WinterArcVerse {
  text: string;
  ref: string;
  /** Book, chapter and verse in the Luther 1912 source, for verification. */
  source: string;
}

const verse = (text: string, ref: string, source: string): WinterArcVerse => ({ text, ref, source });

export const WINTER_ARC_TITLE = 'Der 90-Tage-Standard';

export const WINTER_ARC_LEAD =
  'Gott zuerst, dann das Haus, dann die Arbeit: dieselben Gewohnheiten jeden Tag, 90 Tage lang. Nur die Tiefe wächst. Bibelverse nach Luther 1912.';

export const WINTER_ARC_ABOUT = {
  title: 'Worum es geht',
  paragraphs: [
    'Dieser Plan bringt keine neuen Erkenntnisse. Er ist ein Maßstab: eine kurze Liste dessen, was du jeden Tag tust, aufgeschrieben, abends abgehakt und 90 Tage lang gehalten.',
    'Die meisten Männer scheitern nicht, weil sie es nicht besser wüssten. Sie scheitern, weil in ihrem Tag nichts feststeht. Das Handy bestimmt den Morgen, die Arbeit den Abend, und Gott und die Familie bekommen den Rest.',
    'Der 90-Tage-Standard dreht diese Reihenfolge um. Gott bekommt die erste Stunde. Das Haus bekommt den Rest von dir, wach und gegenwärtig. Die Arbeit bekommt ihre Stunden, aber nur diese.',
  ],
  phases: [
    { weeks: '1 bis 4', phase: 'Disziplin', question: 'Kann ich es halten?' },
    { weeks: '5 bis 8', phase: 'Dienst', question: 'Für wen tue ich es?' },
    { weeks: '9 bis 13', phase: 'Leitung', question: 'Wer schaut zu?' },
  ],
  verse: verse(
    'Trachtet am ersten nach dem Reich Gottes und nach seiner Gerechtigkeit, so wird euch solches alles zufallen.',
    'Matthäus 6,33',
    'Mt 6,33',
  ),
} as const;

export const WINTER_ARC_RULES = {
  title: 'Die vier Regeln',
  lead: 'Alles andere hängt an diesen vier Regeln. Hältst du sie, tragen die 90 Tage.',
  rules: [
    {
      title: 'Eine Stelle, kein Feed.',
      text: 'Hake in Henoch ab, nicht in einer App, die dich mit einem Wisch woandershin zieht. Wer lieber Papier nimmt, schreibt sich die Liste ab und legt sie neben das Bett.',
    },
    {
      title: 'Abends abhaken, vor dem Schlafen.',
      text: 'Jeden Abend, nicht am Wochenende. Nur ehrliche Haken: Ein Haken, den du dir nicht verdient hast, lehrt dich, dich selbst zu belügen.',
    },
    {
      title: 'Einen Tag verpasst, kein Problem.',
      text: 'Ein verpasster Tag ist Leben. Am nächsten Morgen weitermachen, ohne Neustart und ohne Schuldspirale. Die Barmherzigkeit Gottes ist alle Morgen neu.',
    },
    {
      title: 'Tiefer, nicht anders.',
      text: 'Die Gewohnheiten bleiben 90 Tage gleich. Wenn es langweilig wird, kommt nichts Neues dazu. Du gehst tiefer in das, was da ist. Dafür gibt es die drei Phasen.',
    },
  ],
  after:
    'Ziel: fünf gute Tage pro Woche. Fünf starke Tage über dreizehn Wochen verändern mehr als drei perfekte Wochen und dann Abbruch.',
  verse: verse(
    'Lasset uns aber Gutes tun und nicht müde werden; denn zu seiner Zeit werden wir auch ernten ohne Aufhören.',
    'Galater 6,9',
    'Gal 6,9',
  ),
} as const;

export interface WinterArcBlock {
  title: string;
  lead: string;
  items: readonly { title: string; text: string }[];
  after: string;
  verse: WinterArcVerse;
}

export const WINTER_ARC_DAY = {
  title: 'Der Tagesstandard',
  lead: 'Drei Blöcke, jeden Tag. Die Reihenfolge zählt mehr als die Uhrzeit: Gott vor dem Handy, die Arbeit in ihrem Fenster, das Haus bekommt das Beste vom Rest.',
  schedule: [
    { time: '04:00', block: 'Morgen', what: 'Aufstehen. Das Handy bleibt am Ladeplatz.' },
    { time: '04:15–05:00', block: 'Morgen', what: 'Morgenzeit: Wort, Gebet, Tagebuch mit drei Dankpunkten' },
    { time: '05:15–07:00', block: 'Morgen', what: 'Gym, höchstens 1:15 Std. Training (Mo–Fr)' },
    { time: '07:00–08:00', block: 'Haus', what: 'Frühstück, Kinder auf den Weg bringen' },
    { time: '08:00–12:00', block: 'Arbeit', what: 'Fokusblock 1 im Homeoffice' },
    { time: '12:00–13:00', block: 'Arbeit', what: 'Essen und Pause, weg vom Schreibtisch' },
    { time: '13:00–17:00', block: 'Arbeit', what: 'Block 2: Kundentermine, Calls, Mails gebündelt' },
    { time: '17:00', block: 'Arbeit', what: 'Feierabend: drei Aufgaben für morgen notieren, Arbeitszimmer zu' },
    { time: 'Abend', block: 'Haus', what: 'Zu Hause essen, ohne Handy, eine bewusste Geste für deine Frau' },
    { time: '20:00', block: 'Haus', what: 'Küche zu. Handy lädt außerhalb des Schlafzimmers.' },
    { time: '20:45', block: 'Haus', what: 'Abendgebet' },
    { time: '21:00', block: 'Haus', what: 'Licht aus' },
  ],
  note: 'An Tagen mit Teamtag oder Schulung im Büro verschieben sich die Zeiten. Die Reihenfolge bleibt.',
  blocks: [
    {
      title: 'Block 1: Morgen – Gott zuerst',
      lead: 'Die erste Stunde prägt den ganzen Tag. Worauf du zuerst schaust, darüber hast du entschieden, dass es am wichtigsten ist. Lass es Gott sein.',
      items: [
        {
          title: '04:00 Aufstehen, kein Handy.',
          text: 'Der Wecker steht außer Reichweite. Das Handy hat über Nacht außerhalb des Schlafzimmers geladen.',
        },
        {
          title: '04:15–05:00 Morgenzeit.',
          text: '45 Minuten: Bibellese nach deinem Plan und die Gebetsordnung in Henoch. Langsam lesen, keine Kapitel jagen. Einen Satz markieren, der dich trifft.',
        },
        {
          title: 'Tagebuch und drei Dankpunkte.',
          text: 'Den markierten Satz aufschreiben, dazu drei konkrete Dinge, für die du dankbar bist. Nicht „Familie“, sondern den Moment benennen.',
        },
        {
          title: '05:15 Gym.',
          text: 'Training höchstens 1:15 Std.: Montag Brust/Rücken, Mittwoch Arme/Schultern, Freitag Beine, Dienstag und Donnerstag Lauf. Um 07:00 bist du zu Hause. Wer seinem Körper ein Versprechen hält, hält die anderen leichter.',
        },
        { title: 'Regel:', text: 'Kein Handy, bevor das Wort dran war.' },
      ],
      after:
        'Mit Gott zu beginnen heißt nicht, besonders fromm zu sein. Es heißt, vor allen anderen Stimmen festzulegen, wem du heute antwortest. Wer diesen Block auslässt, reagiert meist den ganzen Tag nur noch.',
      verse: verse(
        'HERR, frühe wollest du meine Stimme hören; frühe will ich mich zu dir schicken und aufmerken.',
        'Psalm 5,4',
        'Ps 5,4',
      ),
    },
    {
      title: 'Block 2: Tag – Die Arbeit',
      lead: 'Zwei geschützte Blöcke im Homeoffice. Harte Arbeit in ihrem Fenster, danach schließt das Fenster. Die Arbeit bekommt deine besten Stunden, aber nicht alle.',
      items: [
        {
          title: '08:00–12:00 Fokusblock 1.',
          text: 'Die schwerste Aufgabe zuerst. „Nicht stören“ an, Mails und Chats warten bis zum Blockende.',
        },
        {
          title: '12:00–13:00 Essen und Pause.',
          text: 'Weg vom Schreibtisch, richtig essen, wenn möglich ein Stück gehen.',
        },
        {
          title: '13:00–17:00 Block 2.',
          text: 'Kundentermine, Calls und die zweitschwerste Aufgabe. Mails in zwei Fenstern statt den ganzen Tag.',
        },
        {
          title: '17:00 Feierabend.',
          text: 'Die drei wichtigsten Aufgaben für morgen notieren, Laptop zu, Arbeitszimmer zu. Im Homeoffice ersetzt das den Heimweg.',
        },
      ],
      after:
        'Wer keine Ziellinie hat, kommt nie wirklich nach Hause. Ein fester Feierabend ist nicht faul. Er erlaubt dir, der Arbeit in ihren Stunden alles zu geben, ohne es der Familie zu stehlen.',
      verse: verse(
        'Alles, was ihr tut, das tut von Herzen als dem HERRN und nicht den Menschen.',
        'Kolosser 3,23',
        'Kol 3,23',
      ),
    },
    {
      title: 'Block 3: Abend – Zuhause',
      lead: 'Diesen Block spüren die Menschen, die dir am nächsten sind, am meisten. Es ist auch der, den Männer zuerst schleifen lassen. Halte ihn wie einen Termin, den du nie verpassen würdest.',
      items: [
        {
          title: 'Zu Hause gekocht.',
          text: 'Wenn möglich gemeinsam. Günstiger, gesünder, und es ist Zeit, die ihr im Restaurant nie hättet.',
        },
        {
          title: 'Abendessen ohne Handy.',
          text: 'Handys in einem anderen Raum. Frag zuerst nach dem Tag deiner Frau und hör wirklich zu.',
        },
        {
          title: 'Jeden Abend eine bewusste Geste für deine Frau.',
          text: 'Klein und konkret: ein Zettel, der Abwasch ungefragt, eine echte Frage. Durchdacht, nicht nebenbei.',
        },
        { title: '20:00 Küche zu.', text: 'Nichts mehr essen, nicht mehr treiben lassen. Der Abend kommt zur Ruhe.' },
        {
          title: 'Handy lädt außerhalb des Schlafzimmers.',
          text: 'Das Schlafzimmer ist für Ruhe und für deine Frau, nicht zum Scrollen.',
        },
        {
          title: '20:45 Abendgebet, 21:00 Licht aus.',
          text: 'Gott für den Tag danken und ihm den Rest übergeben. Um 21:00 im Bett, damit 04:00 möglich ist.',
        },
      ],
      after:
        'Der Morgen wird am Abend gewonnen. Wer um 23 Uhr noch scrollt, steht um 04:00 nicht auf, und der ganze Standard bricht ein. Der Abendblock schützt alle anderen.',
      verse: verse(
        'Die Liebe ist langmütig und freundlich, die Liebe eifert nicht, die Liebe treibt nicht Mutwillen, sie blähet sich nicht.',
        '1. Korinther 13,4',
        '1Kor 13,4',
      ),
    },
  ] as readonly WinterArcBlock[],
} as const;

export const WINTER_ARC_WEEK = {
  title: 'Der Wochenstandard',
  lead: 'Der Tagesstandard hält dich stabil, der Wochenstandard hält die Richtung. Du hakst ihn in der Wochenansicht der Wüstenzeit ab.',
  rows: [
    {
      when: 'Sonntag',
      what: 'Gottesdienst und Sonntagsruhe',
      how: 'In den Gottesdienst gehen, danach wirklich ruhen. Keine Dienstmails, kein Nacharbeiten.',
    },
    {
      when: 'Sonntag',
      what: 'Gespräch mit deiner Frau',
      how: '20 Minuten: Wie war ihre Woche? Was steht an? Was braucht sie diese Woche von dir? Mehr zuhören als reden.',
    },
    {
      when: 'Wöchentlich',
      what: 'Ein Abend zu zweit, von dir geplant',
      how: 'Du planst, du buchst, du organisierst auch die Betreuung der Kinder. Sie muss keinen Finger rühren und nichts entscheiden. Muss nicht viel kosten, aber durchdacht sein.',
    },
    {
      when: 'Wöchentlich',
      what: '15 Minuten Finanzen',
      how: 'Was kam rein, was ging raus, wohin geht es. Immer am selben Tag.',
    },
    {
      when: 'Monatlich',
      what: 'Einmal im Monat dienen',
      how: 'Zeit geben, die nicht zurückkommt, außerhalb deiner festen Aufgaben in der Gemeinde: ein Nachbar, der Hilfe braucht, eine Tafel, ein Einsatz, um den du sonst nicht gebeten wirst.',
    },
  ],
  verse: verse(
    'Gedenke des Sabbattags, daß du ihn heiligest. Sechs Tage sollst du arbeiten und alle deine Dinge beschicken.',
    '2. Mose 20,8–9',
    '2Mo 20,8-9',
  ),
} as const;

export const WINTER_ARC_PHASES = {
  title: 'Die drei Phasen',
  lead: 'Die Gewohnheiten bleiben gleich, nur die Tiefe wächst. Jede Phase stellt derselben Liste eine andere Frage. Jede Woche hat einen Schwerpunkt und einen Vers: Sonntagabend lesen, durch die Woche tragen.',
  phases: [
    {
      name: 'Disziplin',
      weeks: 'Wochen 1–4',
      question: 'Kann ich es halten?',
      text: 'Der erste Monat ist der schwerste und der unspektakulärste. Rechne damit, dass die ersten zwei Wochen holprig sind. Bleibt ein Kästchen immer leer, nicht mehr Willenskraft aufbringen, sondern den Rahmen ändern: Ladegerät verlegen, Sportsachen bereitlegen.',
    },
    {
      name: 'Dienst',
      weeks: 'Wochen 5–8',
      question: 'Für wen tue ich es?',
      text: 'Disziplin um ihrer selbst willen nutzt sich ab. Das Training macht dich stark für die, die sich auf dich stützen. Die Arbeit versorgt sie. Der Abend wird ein Geschenk statt einer Pflicht.',
    },
    {
      name: 'Leitung',
      weeks: 'Wochen 9–13',
      question: 'Wer schaut zu?',
      text: 'Im dritten Monat merken es andere. Du gibst den Ton an, zu Hause, bei der Arbeit und für mindestens einen anderen Mann. Du führst nicht, indem du über den Standard redest, sondern indem du ihn hältst.',
    },
  ],
  verse: verse(
    'Alle Züchtigung aber, wenn sie da ist, dünkt sie uns nicht Freude, sondern Traurigkeit zu sein; aber darnach wird sie geben eine friedsame Frucht der Gerechtigkeit denen, die dadurch geübt sind.',
    'Hebräer 12,11',
    'Hebr 12,11',
  ),
} as const;

export interface WinterArcFocus {
  week: number;
  focus: string;
  task: string;
  verse: WinterArcVerse;
}

/** The thirteen weekly focuses with their task and verse. */
export const WINTER_ARC_FOCUS: readonly WinterArcFocus[] = [
  {
    week: 1,
    focus: 'Einfach da sein',
    task: 'Die Woche nicht bewerten. Abhaken, was war, leer lassen, was nicht war. Ziel: sieben Abende ehrlich abgehakt.',
    verse: verse('Alles, was ihr tut, das tut von Herzen als dem HERRN.', 'Kol 3,23', 'Kol 3,23'),
  },
  {
    week: 2,
    focus: 'Den Morgen gewinnen',
    task: 'Handy jeden Abend außerhalb des Schlafzimmers. Um 04:00 auf, ohne zu verhandeln.',
    verse: verse('HERR, frühe wollest du meine Stimme hören.', 'Ps 5,4', 'Ps 5,4'),
  },
  {
    week: 3,
    focus: 'Die Arbeit schützen',
    task: 'Beide Fokusblöcke wie Termine halten. „Nicht stören“ an, schwerste Aufgabe zuerst.',
    verse: verse('Die Anschläge eines Emsigen bringen Überfluß.', 'Spr 21,5', 'Spr 21,5'),
  },
  {
    week: 4,
    focus: 'Den Tag schließen',
    task: 'Küche um 20:00 zu, um 21:00 Licht aus. Rückblick: Welches Kästchen blieb am häufigsten leer?',
    verse: verse('Ich liege und schlafe ganz mit Frieden.', 'Ps 4,9', 'Ps 4,9'),
  },
  {
    week: 5,
    focus: 'Zu Hause dienen',
    task: 'Die Geste für deine Frau wird etwas, worum sie nie bitten würde.',
    verse: verse('Durch die Liebe diene einer dem andern.', 'Gal 5,13', 'Gal 5,13'),
  },
  {
    week: 6,
    focus: 'In der Gemeinde dienen',
    task: 'Fragen, wo Hilfe fehlt, und zu einer Sache Ja sagen, die nicht schon deine Aufgabe ist.',
    verse: verse('Dienet einander, ein jeglicher mit der Gabe, die er empfangen hat.', '1 Petr 4,10', '1Petr 4,10'),
  },
  {
    week: 7,
    focus: 'Bei der Arbeit dienen',
    task: 'Arbeiten wie für Gott, nicht für das Gehalt. Einem Kollegen oder Kunden ungefragt helfen.',
    verse: verse(
      'Ein jeglicher sehe nicht auf das Seine, sondern auch auf das, was des andern ist.',
      'Phil 2,4',
      'Phil 2,4',
    ),
  },
  {
    week: 8,
    focus: 'Einem Fremden dienen',
    task: 'Etwas für jemanden tun, der es dir nie zurückgeben kann. Niemandem davon erzählen.',
    verse: verse('So laß deine linke Hand nicht wissen, was die rechte tut.', 'Mt 6,3', 'Mt 6,3'),
  },
  {
    week: 9,
    focus: 'Zu Hause führen',
    task: 'Am Sonntag die ganze Woche mit deiner Frau planen. Mit ihr beten, wenn sie möchte.',
    verse: verse('Ich aber und mein Haus wollen dem HERRN dienen.', 'Jos 24,15', 'Jos 24,15'),
  },
  {
    week: 10,
    focus: 'Dich selbst führen',
    task: 'Niemand prüft deine Haken außer dir. Das eine Kästchen festziehen, das du noch schleifen lässt.',
    verse: verse(
      'Ein Geduldiger ist besser denn ein Starker, und der seines Mutes Herr ist, denn der Städte gewinnt.',
      'Spr 16,32',
      'Spr 16,32',
    ),
  },
  {
    week: 11,
    focus: 'Einen Bruder mitnehmen',
    task: 'Einen Mann einladen, den Standard mitzugehen, etwa aus der Arena. Ihm jeden Abend kurz deinen Stand schicken.',
    verse: verse('Ein Messer wetzt das andere und ein Mann den andern.', 'Spr 27,17', 'Spr 27,17'),
  },
  {
    week: 12,
    focus: 'Führen, wenn es schwer ist',
    task: 'Etwas wird dich diese Woche prüfen. Den Standard trotzdem halten.',
    verse: verse('Wachet, stehet im Glauben, seid männlich und seid stark!', '1 Kor 16,13', '1Kor 16,13'),
  },
  {
    week: 13,
    focus: 'Den nächsten Standard setzen',
    task: 'Stark beenden. Dann aufschreiben, wie die nächsten 90 Tage aussehen.',
    verse: verse('Ich habe einen guten Kampf gekämpft.', '2 Tim 4,7', '2Tim 4,7'),
  },
];

/** The weekly tracker's own words (for the dashboard). */
export const WINTER_ARC_TRACKER_NOTE =
  'Eine Seite pro Woche, jeden Abend abhaken. Oben stehen Woche, Schwerpunkt und Vers aus der Tabelle oben. Ein leeres Kästchen ist kein Urteil, nur eine ehrliche Auskunft.';

/** "Sonntagabend": the three questions of the weekly review. */
export const WINTER_ARC_REVIEW = [
  { key: 'win', label: 'Ein Sieg dieser Woche' },
  { key: 'slipped', label: 'Das Kästchen, das ich schleifen ließ' },
  { key: 'lesson', label: 'Was Gott mich lehrt' },
] as const;

/** Every review ends in the word of comfort (rule 1). */
export const WINTER_ARC_COMFORT = {
  lead: 'Zum Schluss der Zuspruch:',
  verse: verse(
    'Die Güte des HERRN ist’s, daß wir nicht gar aus sind; seine Barmherzigkeit hat noch kein Ende, sondern sie ist alle Morgen neu, und deine Treue ist groß.',
    'Klagelieder 3,22–23',
    'Kla 3,22-23',
  ),
} as const;

export const WINTER_ARC_END = {
  title: 'Tag 90 – und danach',
  paragraphs: [
    'Vor 90 Tagen war das eine Liste. Jetzt ist es, wie du lebst. Hör nicht auf, nur weil die 90 Tage um sind: Starte eine neue Runde mit denselben Gewohnheiten und mehr Tiefe.',
    'Geh den nächsten Durchgang nicht allein. Nimm einen oder zwei Brüder aus der Arena mit und haltet euch gegenseitig ehrlich.',
  ],
  verse: verse(
    'Ich habe einen guten Kampf gekämpft, ich habe den Lauf vollendet, ich habe Glauben gehalten.',
    '2. Timotheus 4,7',
    '2Tim 4,7',
  ),
} as const;

/** Every verse of the Winter Arc, for the check against Luther 1912. */
export const WINTER_ARC_VERSES: readonly WinterArcVerse[] = [
  WINTER_ARC_ABOUT.verse,
  WINTER_ARC_RULES.verse,
  ...WINTER_ARC_DAY.blocks.map((b) => b.verse),
  WINTER_ARC_WEEK.verse,
  WINTER_ARC_PHASES.verse,
  ...WINTER_ARC_FOCUS.map((f) => f.verse),
  WINTER_ARC_COMFORT.verse,
  WINTER_ARC_END.verse,
];
