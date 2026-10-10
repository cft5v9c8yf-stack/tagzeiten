/**
 * "Mit der Schrift beten": a guided walk through Scripture in eight steps,
 * one walk per weekday. Only Sunday is written so far; Monday to Saturday can
 * be added in the same shape under their weekday.
 *
 * Bible text after the Lutherbibel 1912, word for word (rule 12): the text
 * given by Andreas (6 October 2026), set to the 1912 wording where it differed
 * (Ps 62,2 keeps "ist stille"; the digital 1912 source is in doubt there). Built after "Praying Scripture for a Week"; the pauses
 * are his own words.
 *
 * Poetry: one entry per line; a leading ">" indents the line one step further
 * (the ">" itself is not shown). Prose: one paragraph.
 */
import type { Weekday } from '../domain/dates';
import { ABSOLUTION_EVENING } from './liturgy';
import type { Text } from './types';

export type Passage =
  | { ref: string; kind: 'poetry'; lines: readonly string[]; intro?: string }
  | { ref: string; kind: 'prose'; text: string };

export interface PrayerStep {
  title: string;
  passages: readonly Passage[];
  /** The pause after the texts, to pray on in one's own words; the last step has none. */
  pause?: string;
  /**
   * A word of forgiveness after a step of confession (rule 1). Not part of the
   * walk as given; it is the word that follows the evening examination, kept
   * there at Andreas' wish (6 October 2026).
   */
  comfort?: Text;
}

export interface PrayerWalk {
  title: string;
  steps: readonly PrayerStep[];
}

export const SCRIPTURE_PRAYER_INTRO =
  'Ein Gebetsgang durch die Schrift in acht Schritten. Bete die Texte langsam und laut; an jeder ❧-Stelle hältst du inne und betest mit eigenen Worten weiter.';

export const SCRIPTURE_PRAYER_SOURCE =
  'Bibeltext: Lutherbibel 1912 (gemeinfrei). Aufbau angelehnt an ‚Praying Scripture for a Week‘; Impulse frei formuliert.';

const SUNDAY: PrayerWalk = {
  title: 'Mit der Schrift beten – Sonntag',
  steps: [
    {
      title: 'Anbetung',
      passages: [
        {
          ref: 'Psalm 96,1–6',
          kind: 'poetry',
          lines: [
            'Singet dem HERRN ein neues Lied;',
            'singet dem HERRN alle Welt!',
            'Singet dem HERRN und lobet seinen Namen;',
            'verkündiget von Tag zu Tage sein Heil!',
            'Erzählet unter den Heiden seine Ehre,',
            'unter allen Völkern seine Wunder.',
            'Denn der HERR ist groß und hoch zu loben,',
            'wunderbar über alle Götter.',
            'Denn alle Götter der Völker sind Götzen;',
            'aber der HERR hat den Himmel gemacht.',
            'Es stehet herrlich und prächtig vor ihm',
            'und gehet gewaltig und löblich zu in seinem Heiligtum.',
          ],
        },
        {
          ref: 'Offenbarung 15,3–4',
          kind: 'poetry',
          intro: 'Und sangen das Lied Mose’s, des Knechtes Gottes, und das Lied des Lammes und sprachen:',
          lines: [
            '>„Groß und wundersam sind deine Werke,',
            '>HERR, allmächtiger Gott!',
            '>Gerecht und wahrhaftig sind deine Wege,',
            '>du König der Heiden!',
            '>Wer sollte dich nicht fürchten, HERR',
            '>und deinen Namen preisen?',
            '>Denn du bist allein heilig.',
            '>Denn alle Heiden werden kommen und anbeten vor dir;',
            '>denn deine Urteile sind offenbar geworden.“',
          ],
        },
      ],
      pause: 'Halte inne und rühme Gott dafür, wer er ist – nenne seine Eigenschaften und preise ihn.',
    },
    {
      title: 'Danksagung',
      passages: [
        {
          ref: 'Jesaja 61,10–11',
          kind: 'poetry',
          lines: [
            'Ich freue mich im HERRN,',
            'und meine Seele ist fröhlich in meinem Gott;',
            'denn er hat mich angezogen mit Kleidern des Heils',
            'und mit dem Rock der Gerechtigkeit gekleidet,',
            'wie einen Bräutigam, mit priesterlichem Schmuck geziert,',
            'und wie eine Braut, die in ihrem Geschmeide prangt.',
            'Denn gleichwie das Gewächs aus der Erde wächst',
            'und Same im Garten aufgeht,',
            'also wird Gerechtigkeit und Lob vor allen Heiden aufgehen',
            'aus dem Herrn HERRN.',
          ],
        },
        {
          ref: 'Psalm 62,2–3',
          kind: 'poetry',
          lines: [
            'Meine Seele ist stille zu Gott, der mir hilft.',
            'Denn er ist mein Hort, meine Hilfe, mein Schutz,',
            'daß mich kein Fall stürzen wird, wie groß er ist.',
          ],
        },
      ],
      pause: 'Halte inne und danke Gott ganz konkret für Spuren seiner Güte in deinem Leben.',
    },
    {
      title: 'Sündenbekenntnis',
      passages: [
        {
          ref: 'Psalm 51,3–12.14–15',
          kind: 'poetry',
          lines: [
            'Gott, sei mir gnädig nach deiner Güte',
            'und tilge meine Sünden nach deiner großen Barmherzigkeit.',
            'Wasche mich wohl von meiner Missetat',
            'und reinige mich von meiner Sünde.',
            'Denn ich erkenne meine Missetat,',
            'und meine Sünde ist immer vor mir.',
            'An dir allein habe ich gesündigt und übel vor dir getan,',
            'auf daß du recht behaltest in deinen Worten',
            'und rein bleibest, wenn du gerichtet wirst.',
            'Siehe, ich bin in sündlichem Wesen geboren,',
            'und meine Mutter hat mich in Sünden empfangen.',
            'Siehe, du hast Lust zur Wahrheit, die im Verborgenen liegt;',
            'du lässest mich wissen die heimliche Weisheit.',
            'Entsündige mich mit Isop, daß ich rein werde;',
            'wasche mich, daß ich schneeweiß werde.',
            'Laß mich hören Freude und Wonne,',
            'daß die Gebeine fröhlich werden, die du zerschlagen hast.',
            'Verbirg dein Antlitz von meinen Sünden',
            'und tilge alle meine Missetaten.',
            'Schaffe in mir, Gott, ein reines Herz',
            'und gib mir einen neuen, gewissen Geist.',
            'Tröste mich wieder mit deiner Hilfe,',
            'und mit einem freudigen Geist rüste mich aus.',
            'Ich will die Übertreter deine Wege lehren,',
            'daß sich die Sünder zu dir bekehren.',
          ],
        },
        {
          ref: 'Psalm 139,23–24',
          kind: 'poetry',
          lines: [
            'Erforsche mich, Gott, und erfahre mein Herz;',
            'prüfe mich und erfahre, wie ich’s meine.',
            'Und siehe, ob ich auf bösem Wege bin,',
            'und leite mich auf ewigem Wege.',
          ],
        },
      ],
      pause: 'Halte inne und bekenne Gott die Sünden, die außer ihm niemand sieht.',
      comfort: ABSOLUTION_EVENING,
    },
    {
      title: 'Vertrauen',
      passages: [
        {
          ref: 'Matthäus 6,19–21',
          kind: 'prose',
          text: 'Ihr sollt euch nicht Schätze sammeln auf Erden, da sie die Motten und der Rost fressen und da die Diebe nachgraben und stehlen. Sammelt euch aber Schätze im Himmel, da sie weder Motten noch Rost fressen und da die Diebe nicht nachgraben noch stehlen. Denn wo euer Schatz ist, da ist auch euer Herz.',
        },
        {
          ref: '2. Korinther 5,9–10',
          kind: 'prose',
          text: 'Darum fleißigen wir uns auch, wir sind daheim oder wallen, daß wir ihm wohl gefallen. Denn wir müssen alle offenbar werden vor dem Richtstuhl Christi, auf daß ein jeglicher empfange, nach dem er gehandelt hat bei Leibesleben, es sei gut oder böse.',
        },
      ],
      pause: 'Halte inne und halte dich daran fest, dass Gott für alles sorgt, was du wirklich brauchst.',
    },
    {
      title: 'Gebet des Herrn',
      passages: [
        {
          ref: 'Matthäus 6,9b–13',
          kind: 'poetry',
          lines: [
            'Unser Vater in dem Himmel!',
            'Dein Name werde geheiligt.',
            'Dein Reich komme.',
            'Dein Wille geschehe auf Erden wie im Himmel.',
            'Unser täglich Brot gib uns heute.',
            'Und vergib uns unsere Schuld,',
            'wie wir unseren Schuldigern vergeben.',
            'Und führe uns nicht in Versuchung,',
            'sondern erlöse uns von dem Übel.',
            'Denn dein ist das Reich und die Kraft und die Herrlichkeit in Ewigkeit.',
            'Amen.',
          ],
        },
      ],
      pause: 'Halte inne und überlege, wie der Wille des Vaters heute durch dich auf Erden geschehen kann.',
    },
    {
      title: 'Bitte',
      passages: [
        {
          ref: 'Jesaja 58,6–9a',
          kind: 'poetry',
          lines: [
            'Das ist aber ein Fasten, das ich erwähle:',
            'Laß los, welche du mit Unrecht gebunden hast;',
            'laß ledig, welche du beschwerst;',
            'gib frei, welche du drängst;',
            'reiß weg allerlei Last;',
            'brich dem Hungrigen dein Brot,',
            'und die, so im Elend sind, führe ins Haus;',
            'so du einen nackt siehst, so kleide ihn,',
            'und entzieh dich nicht von deinem Fleisch.',
            'Alsdann wird dein Licht hervorbrechen wie die Morgenröte,',
            'und deine Besserung wird schnell wachsen,',
            'und deine Gerechtigkeit wird vor dir hergehen,',
            'und die Herrlichkeit des HERRN wird dich zu sich nehmen.',
            'Dann wirst du rufen, so wird dir der HERR antworten;',
            'wenn du wirst schreien, wird er sagen: Siehe, hier bin ich.',
          ],
        },
        {
          ref: 'Philipper 2,3–4',
          kind: 'prose',
          text: 'Nichts tut durch Zank oder eitle Ehre; sondern durch Demut achte einer den andern höher denn sich selbst, und ein jeglicher sehe nicht auf das Seine, sondern auch auf das, was des andern ist.',
        },
        {
          ref: 'Psalm 19,15',
          kind: 'poetry',
          lines: [
            'Laß dir wohl gefallen die Rede meines Mundes',
            'und das Gespräch meines Herzens vor dir,',
            'HERR, mein Hort und mein Erlöser.',
          ],
        },
      ],
      pause: 'Halte inne und bitte Gott für die Anliegen anderer, bevor du an deine eigenen denkst.',
    },
    {
      title: 'Fürbitte',
      passages: [
        {
          ref: 'Kolosser 4,2–6',
          kind: 'prose',
          text: 'Haltet an am Gebet und wachet in demselben mit Danksagung; und betet zugleich auch für uns, auf daß Gott uns eine Tür des Wortes auftue, zu reden das Geheimnis Christi, darum ich auch gebunden bin, auf daß ich es offenbare, wie ich soll reden. Wandelt weise gegen die, die draußen sind, und kauft die Zeit aus. Eure Rede sei allezeit lieblich und mit Salz gewürzt, daß ihr wißt, wie ihr einem jeglichen antworten sollt.',
        },
        {
          ref: 'Epheser 6,19–20',
          kind: 'prose',
          text: '… und für mich, auf daß mir gegeben werde das Wort mit freudigem Auftun meines Mundes, daß ich möge kundmachen das Geheimnis des Evangeliums, dessen Bote ich bin in der Kette, auf daß ich darin freudig handeln möge und reden, wie sich’s gebührt.',
        },
      ],
      pause: 'Halte inne und bete für Menschen, die Jesus noch nicht kennen.',
    },
    {
      title: 'Segen',
      passages: [
        {
          ref: 'Psalm 72,17–19',
          kind: 'poetry',
          lines: [
            'Sein Name wird ewiglich bleiben;',
            'solange die Sonne währt, wird sein Name auf die Nachkommen reichen,',
            'und sie werden durch denselben gesegnet sein;',
            'alle Heiden werden ihn preisen.',
            'Gelobet sei Gott der HERR, der Gott Israels,',
            'der allein Wunder tut;',
            'und gelobet sei sein herrlicher Name ewiglich;',
            'und alle Lande müssen seiner Ehre voll werden!',
            'Amen, amen.',
          ],
        },
      ],
    },
  ],
};

/** The walks by weekday (0 = Sunday); the other days follow in the same shape. */
export const SCRIPTURE_PRAYER: Partial<Record<Weekday, PrayerWalk>> = {
  0: SUNDAY,
};
