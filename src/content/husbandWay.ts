/**
 * "28 Tage für Ehemänner" (1.43): a plan of 28 days to walk in a Wüstenzeit,
 * with a package of habits beside it. The texts are word for word as given
 * (16 November 2026); only the closing quotation marks are set as „…“.
 *
 * Departures from the rules, asked for: the day is shown as title, theme,
 * Scripture, thought, step, question, prayer, so the step stands before the
 * prayer (rule 2: the Word still stands first, and the day ends in prayer with
 * Christ). The question may be answered in the journal, sin included (the
 * exception to rule 9 of 16 November 2026); the entry stays on the device.
 * The references are named only, never quoted (rule 13).
 */
import type { Run } from './desert';

export const WAY_ID = 'husband';
export const WAY_NAME = '28 Tage für Ehemänner';
export const WAY_DAYS = 28;

export interface WayWeek {
  nummer: number;
  wegstueck: string;
  titel: string;
  einleitung: string;
}

export interface WayDay {
  tag: number;
  woche: number;
  titel: string;
  thema: string;
  /** The references, as divided at "·". */
  schriftwort: readonly string[];
  gedanke: string;
  schritt: string;
  frage: string;
  gebet: string;
}

export interface WayHabit {
  name: string;
  rhythmus: 'täglich' | 'wöchentlich';
  /** "fest": the weekly ones, always kept with the core. */
  art: 'kern' | 'wahl' | 'fest';
}

/** A block of the introduction: a paragraph, a list, or the table of the weeks. */
export type WayIntroBlock =
  | { p: readonly Run[] }
  | { list: readonly (readonly Run[])[] }
  | { table: { head: readonly string[]; rows: readonly (readonly string[])[] } };

export const WAY_INTRO: readonly WayIntroBlock[] = [
  { p: ['Bruder, schön, dass du losgehst. Diese 28 Tage sind kein Trainingsprogramm. Du musst hier niemandem etwas beweisen, auch Gott nicht.'] },
  {
    p: [
      'In der Bibel ist die Wüste der Ort, an dem Gott Sein Volk prüft und es trotzdem jeden Morgen versorgt (5. Mo 8,2–3). So ist dieser Weg gedacht. Du gehst ihn als Ehemann, mit Gottes Wort in der Hand.',
    ],
  },
  { p: ['Zwei Dinge sollst du vorher wissen:'] },
  {
    list: [
      [
        { strong: 'Du wirst dich erkennen.' },
        ' Gottes Gebot zeigt dir, wo du deiner Frau etwas schuldig bleibst. Das tut weh. Aber das Gebot macht dich nicht besser. Das tut nur Christus, der Seine Gemeinde geliebt und Sich für sie hingegeben hat (Eph 5,25). Darum endet jeder Tag bei Ihm.',
      ],
      [
        { strong: 'Deine Ehe ist Geschenk und Auftrag.' },
        ' Gott hat dich an diesen Platz gestellt. Was du deiner Frau Gutes tust, bringt dich bei Gott nicht weiter nach vorn. Es wächst aus dem, was Er dir schon geschenkt hat.',
      ],
    ],
  },
  {
    p: [
      'Du wirst in diesen Wochen auch scheitern. Dann fang am nächsten Morgen neu an. Luther sagt es im Katechismus so: Der alte Adam soll täglich untergehen, und täglich soll ein neuer Mensch aufstehen. Genau das übst du hier, mitten in deiner Ehe.',
    ],
  },
  {
    p: [
      { strong: 'So sieht ein Tag aus:' },
      ' ein Bild aus Israels Wüstenweg, das Thema, ein Bibelwort, ein kurzer Gedanke, ein Schritt für heute, eine Frage für dein Tagebuch und ein Gebet. Plane zehn Minuten ein.',
    ],
  },
  {
    table: {
      head: ['Woche', 'Wegstück', 'Worum es geht'],
      rows: [
        ['1', 'Auszug', 'Umkehren: mich selbst ehrlich sehen'],
        ['2', 'Manna', 'Jeden Tag für sie da sein'],
        ['3', 'Sinai', 'Treu sein im Bund'],
        ['4', 'Jordan', 'Dranbleiben bis ans Ziel'],
      ],
    },
  },
];

export const WAY_WEEKS: readonly WayWeek[] = [
  {
    nummer: 1,
    wegstueck: 'Auszug',
    titel: 'Umkehren',
    einleitung:
      'In der ersten Woche schaust du ehrlich auf dich selbst. Du siehst, wo du deiner Frau etwas schuldig bleibst, und fängst bei Christus neu an.',
  },
  {
    nummer: 2,
    wegstueck: 'Manna',
    titel: 'Jeden Tag für sie da sein',
    einleitung:
      'In der zweiten Woche geht es um das Tägliche. Gott gab Israel jeden Morgen Manna. Deine Frau braucht jeden Tag dein Ohr, dein Wort und deine Zeit.',
  },
  {
    nummer: 3,
    wegstueck: 'Sinai',
    titel: 'Treu sein im Bund',
    einleitung:
      'In der dritten Woche geht es um Treue. Sie zeigt sich in der Zärtlichkeit, im Zugeben von Schuld, im Blick, im gehaltenen Wort und im Vergeben.',
  },
  {
    nummer: 4,
    wegstueck: 'Jordan',
    titel: 'Dranbleiben bis ans Ziel',
    einleitung: 'In der vierten Woche schaust du nach vorn. Es geht um Freude, Schutz, Offenheit und Gottes Wort bei euch zu Hause.',
  },
];

const refs = (s: string): readonly string[] => s.split('·').map((r) => r.trim());

export const WAY_DAYS_TEXT: readonly WayDay[] = [
  {
    tag: 1,
    woche: 1,
    titel: 'Raus aus der Trägheit',
    thema: 'Nicht mehr danebenstehen',
    schriftwort: refs('1. Mo 3,6 · Röm 6,3–4'),
    gedanke:
      'Als die Schlange mit Eva sprach, stand Adam daneben und sagte nichts. So fängt es bis heute an: Du hältst dich raus. Sie plant, entscheidet und trägt, und du schaust zu. Aber du bist getauft. Du gehörst zu Christus, und Er stand nicht daneben. Er ist für dich eingetreten.',
    schritt: 'Bete heute früh Luthers Morgensegen. Dann pack eine Sache an, die du seit Wochen ihr überlässt.',
    frage: 'Wo schaue ich in unserer Ehe nur zu?',
    gebet: 'Herr Jesus, Du bist für mich eingetreten. Weck mich auf. Amen.',
  },
  {
    tag: 2,
    woche: 1,
    titel: 'Kein Thron',
    thema: 'Dienen statt fordern',
    schriftwort: refs('Mk 10,42–45'),
    gedanke:
      'Jesus sagt von Sich: Ich bin nicht gekommen, um Mich bedienen zu lassen. Viele Männer denken heimlich anders: Mir steht etwas zu. Ruhe, Essen, Dank, Nähe. Deine Ehe ist kein Thron. Sie ist der Platz, an den Gott dich zum Dienen gestellt hat. Abwasch, Windeln und Zuhören sind vor Gott keine Kleinigkeiten.',
    schritt: 'Mach heute eine Arbeit im Haus, die keiner sieht. Sag nichts dazu.',
    frage: 'Wo bestehe ich auf meinem Recht?',
    gebet: 'Herr Christus, Du hast mir gedient bis ans Kreuz. Nimm mir den Anspruch. Amen.',
  },
  {
    tag: 3,
    woche: 1,
    titel: 'Du bist der Mann',
    thema: 'Kritik annehmen',
    schriftwort: refs('1. Mo 3,12 · 2. Sam 12,7.13'),
    gedanke:
      'Adam hat sich herausgeredet: Die Frau, die Du mir gegeben hast, war schuld. David hat es anders gemacht. Als Nathan ihm die Wahrheit sagte, antwortete er nur: Ich habe gesündigt. Wenn deine Frau dich kritisiert, hat sie oft recht. Du musst dich nicht verteidigen. Christus hat dich schon freigesprochen.',
    schritt: 'Denk an eine Kritik von ihr, die du abgewehrt hast. Geh zu ihr und sag: Da hattest du recht.',
    frage: 'Mit welchen Sätzen rede ich mich heraus?',
    gebet: 'Herr, Du sprichst mich frei. Nimm mir die Angst, im Unrecht zu sein. Amen.',
  },
  {
    tag: 4,
    woche: 1,
    titel: 'Der geschlagene Fels',
    thema: 'Den Zorn zügeln',
    schriftwort: refs('4. Mo 20,10–12 · Jak 1,19–20 · Kol 3,19'),
    gedanke:
      'Mose war wütend. Er schrie das Volk an und schlug auf den Felsen. Das hat ihn das verheißene Land gekostet. Dein Zorn macht zu Hause nichts besser. Er macht deiner Frau und den Kindern Angst. Jesus wurde geschlagen und hat nicht zurückgeschlagen (1. Petr 2,23). Bei Ihm findest du Vergebung für jedes harte Wort.',
    schritt: 'Achte heute auf deinen Ton. Wenn du laut oder scharf wirst, bitte noch vor dem Schlafengehen um Vergebung (Eph 4,26).',
    frage: 'Wann hat meine Frau Angst vor meiner Reaktion?',
    gebet: 'Herr, Du bist geduldig und gütig. Mach mein Herz und meine Zunge ruhig. Amen.',
  },
  {
    tag: 5,
    woche: 1,
    titel: 'Vierzig Jahre',
    thema: 'Geduld haben',
    schriftwort: refs('4. Mo 14,18 · 2. Petr 3,9 · 1. Kor 13,4'),
    gedanke:
      'Vierzig Jahre lang hat Gott ein Volk getragen, das ständig gemurrt hat. So geduldig ist Er auch mit dir. Wenn du ungeduldig bist, sagst du deiner Frau ohne Worte: Mein Tempo zählt, deins nicht. Liebe kann warten.',
    schritt: 'Wo drängst du sie jeden Tag? Genau dort wartest du heute, still und freundlich.',
    frage: 'Wo bin ich mit ihr ungeduldiger als Gott mit mir?',
    gebet: 'Vater, Du hast Geduld mit mir. Gib mir Geduld mit meiner Frau. Amen.',
  },
  {
    tag: 6,
    woche: 1,
    titel: 'Die Fleischtöpfe',
    thema: 'Nicht nur an mich denken',
    schriftwort: refs('4. Mo 11,4–6 · Phil 2,4–8'),
    gedanke:
      'In der Wüste dachte Israel nur ans Essen. Wie schlimm Ägypten war, hatten sie vergessen. Selbstsucht ist meistens leise. Wer bestimmt bei euch über den Abend, das Geld, die freie Zeit? Luther sagt: Der Mensch ist in sich selbst verkrümmt. Jesus ist das Gegenteil. Er hat alles hergegeben, damit es uns gut geht.',
    schritt: 'Verzichte heute auf etwas, das dir zusteht, zum Beispiel deinen freien Abend. Schenk ihr die Zeit und rechne es nicht an.',
    frage: 'Worauf verzichte ich in unserer Ehe nie?',
    gebet: 'Herr, richte mich auf. Zeig mir, was meiner Frau guttut. Amen.',
  },
  {
    tag: 7,
    woche: 1,
    titel: 'Zuflucht',
    thema: 'Bei mir ist sie sicher',
    schriftwort: refs('Ps 46,2 · Rut 3,9 · 1. Petr 3,7'),
    gedanke:
      'Gott ist unsere Zuflucht. Bei Ihm darfst du schwach sein. Das Gleiche braucht deine Frau bei dir. Sie soll müde, traurig oder unsicher sein dürfen, ohne dass du sie belehrst oder gleich eine Lösung lieferst. Petrus sagt den Männern: Gebt euren Frauen Ehre.',
    schritt: 'Wenn sie heute müde, traurig oder gereizt ist, erklär nichts und lös nichts. Bleib bei ihr und frag: Was brauchst du gerade von mir?',
    frage: 'Was erzählt sie mir nicht mehr, weil sie meine Reaktion schon kennt?',
    gebet: 'Herr, Du bist meine Zuflucht. Mach mich zu einem Ort, an dem meine Frau zur Ruhe kommt. Amen.',
  },
  {
    tag: 8,
    woche: 2,
    titel: 'Die Kundschafter',
    thema: 'Streit nicht aus dem Weg gehen',
    schriftwort: refs('4. Mo 13,30–14,9 · Mt 5,23–24'),
    gedanke:
      'Zwölf Männer sahen dasselbe Land. Zehn sahen nur Riesen. Josua und Kaleb sahen, was Gott versprochen hatte. In fast jeder Ehe gibt es ein Thema, um das beide einen Bogen machen: Geld, Erziehung, eine alte Verletzung. Schweigen löst es nicht. Es schiebt den Streit nur auf. Jesus ist dem Schweren nicht ausgewichen. Er ist hingegangen und hat Frieden gemacht.',
    schritt: 'Sprich das Thema heute an. Bete vorher. Bleib ruhig. Ihr müsst es heute nicht lösen.',
    frage: 'Welches Gespräch schiebe ich seit Monaten vor mir her?',
    gebet: 'Herr, nimm mir die Angst vor dem offenen Wort. Schenk uns echten Frieden. Amen.',
  },
  {
    tag: 9,
    woche: 2,
    titel: 'Schnell zum Hören',
    thema: 'Zuhören',
    schriftwort: refs('2. Mo 2,24 · Jak 1,19 · Spr 18,13'),
    gedanke:
      'Gott hörte, wie Sein Volk in Ägypten seufzte. Zuhören ist etwas Göttliches. Viele Männer hören nur zu, um eine Lösung zu liefern oder zu widersprechen. Deine Frau will meistens zuerst verstanden werden.',
    schritt: 'Hör ihr heute zehn Minuten zu. Kein Handy, kein Rat. Sag am Ende, was du verstanden hast, und frag: Stimmt das so?',
    frage: 'Was hat sie mir schon oft gesagt, und ich habe es nie richtig gehört?',
    gebet: 'Herr, Du hörst mich. Gib mir ein Ohr und ein Herz für meine Frau. Amen.',
  },
  {
    tag: 10,
    woche: 2,
    titel: 'Lasten tragen',
    thema: 'Selbst anpacken',
    schriftwort: refs('2. Mo 18,17–18 · Gal 6,2'),
    gedanke:
      'Jethro sah, wie Mose alles allein trug, und sagte ihm: Das schaffst du nicht. Schau heute so auf deine Frau. Wer denkt bei euch an Termine, Geschenke, Arzt, Schule und Einkauf? Warte nicht, bis sie dich bittet. Jesus hat deine Last getragen, bevor du Ihn darum gebeten hast.',
    schritt: 'Frag sie, welche Aufgabe sie am meisten drückt. Übernimm sie ganz, nicht nur heute.',
    frage: 'Welche Last trägt sie, die ich noch nie bemerkt habe?',
    gebet: 'Herr, Du trägst mich jeden Tag. Öffne mir die Augen für das, was meine Frau trägt. Amen.',
  },
  {
    tag: 11,
    woche: 2,
    titel: 'Mit Einsicht',
    thema: 'Wissen, wie es ihr geht',
    schriftwort: refs('1. Petr 3,7 · Röm 12,15'),
    gedanke:
      'Petrus schreibt den Männern: Lebt mit euren Frauen mit Einsicht. Das heißt: Kenne sie. Was macht sie müde? Was freut sie? Wovor hat sie Angst? Sie erbt mit dir zusammen das ewige Leben. Petrus sagt sogar: Wenn du sie nicht ehrst, leidet dein Gebet.',
    schritt: 'Stell ihr heute drei Fragen und hör nur zu: Was belastet dich? Was freut dich? Wofür soll ich beten?',
    frage: 'Was weiß ich heute weniger über sie als vor fünf Jahren?',
    gebet: 'Herr, Du kennst mich und liebst mich trotzdem. Hilf mir, meine Frau zu kennen und zu ehren. Amen.',
  },
  {
    tag: 12,
    woche: 2,
    titel: 'Was ist das?',
    thema: 'Neugierig auf sie bleiben',
    schriftwort: refs('2. Mo 16,15 · 4. Mo 21,5 · Klgl 3,22–23'),
    gedanke:
      'Als das Manna zum ersten Mal auf dem Boden lag, fragte Israel staunend: Was ist das? Jahre später hatten sie es satt. So geht es uns mit Geschenken, die jeden Tag da sind. Luther zählt im Vaterunser auch den Ehepartner zum täglichen Brot. Deine Frau ist ein Geschenk, das jeden Morgen neu vor dir steht.',
    schritt: 'Frag sie etwas, das du noch nie gefragt hast: nach einer Erinnerung, einem Wunsch, einer Hoffnung. Danke Gott am Abend für das, was du neu entdeckt hast.',
    frage: 'Was an ihr sehe ich gar nicht mehr, weil es so selbstverständlich geworden ist?',
    gebet: 'Vater, Deine Güte ist jeden Morgen neu. Lass mich meine Frau wieder mit wachen Augen sehen. Amen.',
  },
  {
    tag: 13,
    woche: 2,
    titel: 'Ja und Nein',
    thema: 'Klar und freundlich reden',
    schriftwort: refs('Mt 5,37 · Eph 4,15.29'),
    gedanke:
      'Gott redet klar mit uns. Wir Männer oft nicht. Wir deuten an, schweigen beleidigt oder erwarten, dass sie unsere Gedanken errät. Das ist nicht fair. Das achte Gebot gilt auch zu Hause: ehrlich reden und vom anderen das Beste denken.',
    schritt: 'Sag heute eine Sache klar und freundlich, die du bisher nur angedeutet oder geschluckt hast. Sag sie als Bitte, nicht als Vorwurf.',
    frage: 'Wo erwarte ich, dass sie meine Gedanken errät?',
    gebet: 'Herr, gib mir Worte, die wahr sind und guttun. Amen.',
  },
  {
    tag: 14,
    woche: 2,
    titel: 'Sabbat in der Wüste',
    thema: 'Wirklich da sein',
    schriftwort: refs('2. Mo 16,29–30 · Lk 10,39–42'),
    gedanke:
      'Sogar in der Wüste gab Gott Seinem Volk einen Ruhetag. Du kannst neben deiner Frau sitzen und trotzdem weit weg sein: am Handy, bei der Arbeit, in deinen Gedanken. Gott heißt Immanuel, Gott mit uns. Er ist ganz bei dir, nicht halb.',
    schritt: 'Leg dein Handy heute Abend zwei Stunden in ein anderes Zimmer. Sei bei ihr.',
    frage: 'Wohin flüchte ich, wenn es zu Hause anstrengend wird?',
    gebet: 'Herr, Du bist jeden Tag bei mir. Hilf mir, bei meiner Frau zu sein, wenn ich bei ihr bin. Amen.',
  },
  {
    tag: 15,
    woche: 3,
    titel: 'Die Frau deiner Jugend',
    thema: 'Zärtlich sein',
    schriftwort: refs('Spr 5,18–19 · 1. Kor 7,3–4'),
    gedanke:
      'Die Bibel redet offen und fröhlich davon, dass Mann und Frau sich aneinander freuen. Zärtlichkeit ist ein Geschenk von Gott. Du musst dich dafür nicht schämen. Aber sie ist kein Tauschgeschäft. Wer nur zärtlich ist, wenn er etwas will, macht das Geschenk kaputt.',
    schritt: 'Sei heute zärtlich, ohne etwas zu erwarten. Halte ihre Hand. Nimm sie lange in den Arm. Gib ihr einen Kuss, wenn du gehst und wenn du kommst.',
    frage: 'Berühre ich sie nur, wenn ich etwas von ihr will?',
    gebet: 'Vater, Du hast uns einander geschenkt. Erhalte uns die Zärtlichkeit. Amen.',
  },
  {
    tag: 16,
    woche: 3,
    titel: 'Bekennen',
    thema: 'Zu meinen Fehlern stehen',
    schriftwort: refs('Ps 32,3–5 · 1. Joh 1,8–9'),
    gedanke:
      'David hat seine Schuld lange verschwiegen. Es hat ihn innerlich aufgefressen. Schuld, über die keiner redet, steht wie eine Wand zwischen dir und deiner Frau. Bekennen heißt: kein „aber“, keine Erklärung, keine Gegenrechnung. Und wenn dich etwas weiter drückt, geh zur Beichte. Dort sagt Gott dir selbst: Dir ist vergeben.',
    schritt: 'Sag deiner Frau heute eine konkrete Schuld und bitte sie um Vergebung.',
    frage: 'Welche Schuld erkläre ich lieber, als sie zuzugeben?',
    gebet: 'Herr, ich bekenne Dir meine Schuld. Du vergibst mir. Danke. Amen.',
  },
  {
    tag: 17,
    woche: 3,
    titel: 'Bund mit den Augen',
    thema: 'Augen und Gedanken hüten',
    schriftwort: refs('Hiob 31,1 · Mt 5,27–28 · 1. Joh 1,7'),
    gedanke:
      'Hiob hat mit seinen Augen einen Bund geschlossen. Jesus sagt: Ehebruch fängt im Blick und im Herzen an. Luther erklärt das sechste Gebot so: Jeder soll seine Frau lieben und ehren, in Worten und Taten. Jeder Blick, der einer anderen gilt, nimmt deiner Frau etwas weg. Hier gibt es keine Ausrede. Aber es gibt Vergebung: Das Blut von Jesus macht dich rein von aller Sünde.',
    schritt: 'Räum heute eine Versuchung aus dem Weg: eine App, eine Gewohnheit, eine Uhrzeit. Wenn du allein nicht herauskommst, sprich mit einem Bruder oder Seelsorger und geh zur Beichte.',
    frage: 'Was schaue ich mir an, das sie nicht sehen dürfte?',
    gebet: 'Herr, schenk mir ein reines Herz. Bewahre meine Augen für die Frau, die Du mir gegeben hast. Amen.',
  },
  {
    tag: 18,
    woche: 3,
    titel: 'Was ihr guttut',
    thema: 'So lieben, dass es ankommt',
    schriftwort: refs('1. Kor 13,5 · Röm 15,2 · Phil 2,4'),
    gedanke:
      'Jeder schenkt gern, was er selbst gern bekommt. Und wundert sich, wenn es nicht ankommt. Gott macht es anders. Er kommt so zu uns, dass wir Ihn fassen können: im Wort, im Wasser der Taufe, in Brot und Wein. Liebe fragt nicht: Was fällt mir leicht? Sie fragt: Was tut dir gut?',
    schritt: 'Frag sie: Wann fühlst du dich von mir geliebt? Wenn ich Zeit für dich habe, dir helfe, dir etwas Liebes sage oder dich in den Arm nehme? Tu heute genau das.',
    frage: 'Welche Art von Liebe gebe ich ihr nur, weil sie mir bequem ist?',
    gebet: 'Herr, Du bist mir so begegnet, wie ich es brauche. Zeig mir, wie meine Liebe bei meiner Frau ankommt. Amen.',
  },
  {
    tag: 19,
    woche: 3,
    titel: 'Zum Besten kehren',
    thema: 'Danke sagen',
    schriftwort: refs('2. Mo 20,16 · Spr 31,28'),
    gedanke:
      'Luther erklärt das achte Gebot so: Wir sollen gut vom anderen reden und alles zum Besten kehren. Der Mensch, der dir am nächsten ist, ist deine Frau. Vieles, was sie jeden Tag tut, sieht keiner. Keiner bedankt sich. Wie redest du über sie, vor den Kindern und vor Freunden?',
    schritt: 'Bedank dich heute für eine Arbeit, die sonst keiner bemerkt. Rede vor anderen gut über sie, am besten vor den Kindern.',
    frage: 'Wo denke ich aus Gewohnheit schlecht über das, was sie tut?',
    gebet: 'Vater, Du redest gut von mir, weil Christus für mich einsteht. Lass mich gut von meiner Frau reden. Amen.',
  },
  {
    tag: 20,
    woche: 3,
    titel: 'Das Wort halten',
    thema: 'Verlässlich sein',
    schriftwort: refs('4. Mo 30,3 · Mt 5,37 · Jos 21,45'),
    gedanke:
      'Was ein Mann verspricht, soll er halten. So steht es im Gesetz. Vertrauen entsteht nicht durch große Worte. Es entsteht, wenn du kleine Zusagen hältst: Ich hole die Kinder ab. Ich kümmere mich darum. Ich bin um sechs zu Hause. Gott geht dir darin voran: Kein einziges Seiner Versprechen an Israel ist ausgeblieben.',
    schritt: 'Löse heute ein Versprechen ein, das du ihr gegeben und dann vergessen hast.',
    frage: 'Auf welches meiner Worte kann sie sich nicht verlassen?',
    gebet: 'Herr, Du hältst, was Du versprichst. Mach mich zu einem Mann, auf den man sich verlassen kann. Amen.',
  },
  {
    tag: 21,
    woche: 3,
    titel: 'Die erlassene Schuld',
    thema: 'Vergeben und loslassen',
    schriftwort: refs('Mt 18,21–35 · Eph 4,32'),
    gedanke:
      'An Tag 16 hast du deine Schuld bekannt. Heute lässt du los, was sie dir schuldet. Jesus erzählt von einem Knecht, dem der König eine riesige Schuld erlässt. Danach geht er los und würgt einen anderen wegen ein paar Münzen. So sind wir, wenn wir nachtragen. Vergeben ist kein Gefühl. Es heißt: Ich zerreiße die Rechnung.',
    schritt: 'Sag Gott eine Sache, die du ihr nachträgst. Benutze sie von heute an nie wieder als Argument.',
    frage: 'Welche alte Geschichte hole ich im Streit immer wieder hervor?',
    gebet: 'Vater, vergib mir meine Schuld, wie auch ich meiner Frau vergebe. Amen.',
  },
  {
    tag: 22,
    woche: 4,
    titel: 'Fröhlich machen',
    thema: 'Zusammen Freude haben',
    schriftwort: refs('5. Mo 24,5 · Pred 9,9 · Ps 126,2'),
    gedanke:
      'Im Gesetz steht etwas Erstaunliches: Ein frisch verheirateter Mann musste ein Jahr lang nicht in den Krieg. Er sollte zu Hause bleiben und seine Frau fröhlich machen. Gott nimmt eure Freude ernst. Ehe ist mehr als gemeinsames Organisieren.',
    schritt: 'Plane einen Abend nur für euch zwei. Kümmere dich selbst um alles, auch um die Kinder.',
    frage: 'Wann haben wir zuletzt zusammen gelacht?',
    gebet: 'Vater, Du hast uns einander zur Freude gegeben. Erhalte uns das Lachen. Amen.',
  },
  {
    tag: 23,
    woche: 4,
    titel: 'Erhobene Hände',
    thema: 'Sie beschützen',
    schriftwort: refs('2. Mo 17,11–12 · 1. Tim 2,8 · Ps 121,7'),
    gedanke:
      'Solange Mose die Hände zum Gebet hob, gewann Israel. Du beschützt deine Frau zuerst, indem du für sie betest. Und dann ganz praktisch: Du stellst dich vor sie, wenn jemand schlecht über sie redet. Du merkst, wenn ihr alles zu viel wird. Aber denk daran: Der eigentliche Beschützer ist Gott. Du stehst in Seinem Dienst.',
    schritt: 'Bete heute mit Namen für sie: für ihren Glauben, ihre Gesundheit, ihre Sorgen. Frag sie am Abend: Wo brauchst du gerade meinen Schutz?',
    frage: 'Wo habe ich sie allein gelassen, als sie mich gebraucht hat?',
    gebet: 'Herr, ich lege meine Frau in Deine Hand. Behüte sie an Leib und Seele. Amen.',
  },
  {
    tag: 24,
    woche: 4,
    titel: 'Im Licht',
    thema: 'Nichts verstecken',
    schriftwort: refs('1. Mo 2,25 · 1. Mo 3,7–8 · 1. Joh 1,7'),
    gedanke:
      'Am Anfang waren Adam und Eva nackt und schämten sich nicht. Nach dem Sündenfall versteckten sie sich. Wir Männer verstecken bis heute vieles: Geldsorgen, Versuchungen, Versagen, Angst. Du musst das nicht mehr. In der Taufe hat Christus dich mit Sich selbst bekleidet (Gal 3,27). Bei Ihm bist du angenommen.',
    schritt: 'Erzähl ihr heute von einer Sorge, einer Angst oder einer Schwäche, die du bisher allein trägst.',
    frage: 'Was weiß meine Frau nicht von mir? Und warum nicht?',
    gebet: 'Herr, Du kennst mich ganz und nimmst mich an. Gib mir Mut, offen zu leben. Amen.',
  },
  {
    tag: 25,
    woche: 4,
    titel: 'Der Hausvater',
    thema: 'Im Glauben vorangehen',
    schriftwort: refs('5. Mo 6,6–7 · Jos 24,15'),
    gedanke:
      'Luther hat den Katechismus für Väter geschrieben. Sie sollten ihn zu Hause mit ihrer Familie lernen, ganz einfach. Im Glauben voranzugehen ist kein Rang. Es heißt nur: Du sorgst dafür, dass Gottes Wort bei euch zu Hause gehört wird. Dafür musst du kein Theologe sein. Und du musst nicht warten, bis du dich würdig fühlst.',
    schritt: 'Halte heute eine kurze Andacht mit deiner Familie: ein Bibelabschnitt, ein Stück aus dem Katechismus, das Vaterunser, Luthers Abendsegen. Zehn Minuten reichen.',
    frage: 'Was hält mich davon ab, zu Hause mit Gottes Wort voranzugehen?',
    gebet: 'Herr, ich und mein Haus wollen Dir dienen. Mach mich treu im Kleinen. Amen.',
  },
  {
    tag: 26,
    woche: 4,
    titel: 'Miterbin',
    thema: 'Mich freuen, wenn sie wächst',
    schriftwort: refs('1. Petr 3,7 · Spr 31,28–31 · 1. Kor 12,7'),
    gedanke:
      'Deine Frau ist nicht dazu da, dein Leben zu ergänzen. Petrus sagt: Sie erbt mit dir zusammen die Gnade des Lebens. Gott hat ihr eigene Gaben gegeben und eigene Aufgaben: als Christin, als Ehefrau und Mutter, in der Nachbarschaft, im Beruf, in der Gemeinde. Du kannst ihr dabei Raum geben. Oder du hältst sie klein, weil es für dich bequemer ist.',
    schritt: 'Sag ihr eine Gabe, die du an ihr wachsen siehst. Schaff ihr diese Woche Raum dafür. Halte ihr zum Beispiel einen Abend frei.',
    frage: 'Wo halte ich sie klein, weil es für mich bequemer ist?',
    gebet: 'Vater, Du hast meine Frau reich beschenkt. Lass mich mich daran freuen und ihr helfen. Amen.',
  },
  {
    tag: 27,
    woche: 4,
    titel: 'In Zucht',
    thema: 'Mich selbst im Griff haben',
    schriftwort: refs('Gal 5,22–24 · Tit 2,11–12 · 1. Kor 9,25–27'),
    gedanke:
      'Selbstbeherrschung ist bei Paulus eine Frucht des Geistes. Sie ist also zuerst Gottes Werk und nicht deine Leistung. Trotzdem darfst du üben. Luther nennt Fasten und äußere Ordnung eine gute Übung. Sie machen dich vor Gott nicht besser, aber sie helfen dir. Und sie helfen deiner Familie. Denn wenn du dich gehen lässt, zahlen meistens die anderen.',
    schritt: 'Wo lässt du dich gehen: beim Essen, am Bildschirm, beim Schlaf, mit deiner Zunge? Setz dir dort eine klare Grenze und sag sie deiner Frau.',
    frage: 'Wo zahlt meine Familie dafür, dass ich mich gehen lasse?',
    gebet: 'Heiliger Geist, tu in mir, was ich allein nicht schaffe. Amen.',
  },
  {
    tag: 28,
    woche: 4,
    titel: 'Am Jordan',
    thema: 'Sie neu wählen',
    schriftwort: refs('Jos 3,14–17 · Mt 19,6 · Phil 1,6'),
    gedanke:
      'Heute bist du am Ziel, aber nicht fertig. Israel ging durch den Jordan, so wie es durch das Meer gegangen war: mit trockenen Füßen, weil Gott voranging. Du sagst heute neu Ja zu deiner Frau. Aber eure Ehe hängt nicht an deinem Ja. Gott hat euch zusammengefügt. Morgen geht der Alltag weiter: mit Gebet, mit Gottes Wort, mit Vergebung. Gott hat etwas Gutes in dir angefangen. Er bringt es auch zu Ende.',
    schritt: 'Lies deine Tagebucheinträge noch einmal. Sag deiner Frau dein Eheversprechen neu, in deinen eigenen Worten. Nenn ihr eine Gewohnheit, die du behältst.',
    frage: 'Was hat Gott mir in diesen Wochen gezeigt? Und was hat Er mir geschenkt?',
    gebet: 'Herr, Du hast uns zusammengefügt. Bring zu Ende, was Du angefangen hast, bei mir und in unserer Ehe. Amen.',
  },
];

export const WAY_HABITS_TITLE = 'Gewohnheiten für die 28 Tage';

/** The two paragraphs before the table of habits. */
export const WAY_HABITS_LEAD: readonly string[] = [
  'Neben dem Tagesschritt beobachtest du ein paar feste Gewohnheiten. Fünf sind der Kern. Dazu wählst du höchstens zwei weitere, die bei dir gerade dran sind.',
  'Die Liste ist kein Zeugnis. Wenn du einen Tag nichts abhakst, bist du nicht durchgefallen. Du fängst am nächsten Morgen neu an.',
];

export const WAY_HABITS: readonly WayHabit[] = [
  { name: 'Morgensegen gebetet', rhythmus: 'täglich', art: 'kern' },
  { name: 'Für meine Frau gebetet, mit Namen', rhythmus: 'täglich', art: 'kern' },
  { name: 'Zehn Minuten zugehört, ohne Handy', rhythmus: 'täglich', art: 'kern' },
  { name: 'Ihr gedankt oder gut über sie geredet', rhythmus: 'täglich', art: 'kern' },
  { name: 'Abendsegen mit ihr gebetet', rhythmus: 'täglich', art: 'kern' },
  { name: 'Zärtlich gewesen, ohne etwas zu erwarten', rhythmus: 'täglich', art: 'wahl' },
  { name: 'Kein hartes Wort, oder noch am Abend um Vergebung gebeten', rhythmus: 'täglich', art: 'wahl' },
  { name: 'Augen und Gedanken gehütet', rhythmus: 'täglich', art: 'wahl' },
  { name: 'Eine Aufgabe im Haus ungefragt übernommen', rhythmus: 'täglich', art: 'wahl' },
  { name: 'Meine eigene Grenze gehalten (Essen, Bildschirm, Schlaf)', rhythmus: 'täglich', art: 'wahl' },
  { name: 'Gemeinsam im Gottesdienst gewesen', rhythmus: 'wöchentlich', art: 'fest' },
  { name: 'Hausandacht gehalten', rhythmus: 'wöchentlich', art: 'fest' },
  { name: 'Ein Abend oder Gespräch nur zu zweit', rhythmus: 'wöchentlich', art: 'fest' },
];

/** At most this many of those "zur Wahl". */
export const WAY_CHOICE_MAX = 2;
