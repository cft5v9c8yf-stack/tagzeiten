/**
 * The three creeds of the early church, as they stand at the head of the
 * Lutheran Book of Concord. Explanations in our own words.
 *
 * The Apostles' Creed in Luther's wording (Small Catechism, rule 12). The
 * Nicene Creed in today's ecumenical wording, on the user's express wish
 * (exception to rule 12, noted in CLAUDE.md). The Athanasian Creed follows
 * once a wording before 1900 is at hand.
 */
import { CREED_LUTHER } from './liturgy';
import { text, type Text } from './types';

export interface Creed {
  id: string;
  title: string;
  /** Short line under the title. */
  line: string;
  /** Absent until the wording is at hand. */
  text?: Text;
  explanation: readonly string[];
}

export const NICENE_CREED = text(
  [
    'Wir glauben an den einen Gott,',
    'den Vater, den Allmächtigen,',
    'der alles geschaffen hat,',
    'Himmel und Erde,',
    'die sichtbare und die unsichtbare Welt.',
    '',
    'Und an den einen Herrn Jesus Christus,',
    'Gottes eingeborenen Sohn,',
    'aus dem Vater geboren vor aller Zeit:',
    'Gott von Gott, Licht vom Licht,',
    'wahrer Gott vom wahren Gott,',
    'gezeugt, nicht geschaffen,',
    'eines Wesens mit dem Vater;',
    'durch ihn ist alles geschaffen.',
    'Für uns Menschen und zu unserm Heil',
    'ist er vom Himmel gekommen,',
    'hat Fleisch angenommen',
    'durch den Heiligen Geist',
    'von der Jungfrau Maria',
    'und ist Mensch geworden.',
    'Er wurde für uns gekreuzigt unter Pontius Pilatus,',
    'hat gelitten und ist begraben worden,',
    'ist am dritten Tage auferstanden nach der Schrift',
    'und aufgefahren in den Himmel.',
    'Er sitzt zur Rechten des Vaters',
    'und wird wiederkommen in Herrlichkeit,',
    'zu richten die Lebenden und die Toten;',
    'seiner Herrschaft wird kein Ende sein.',
    '',
    'Wir glauben an den Heiligen Geist,',
    'der Herr ist und lebendig macht,',
    'der aus dem Vater und dem Sohn hervorgeht,',
    'der mit dem Vater und dem Sohn',
    'angebetet und verherrlicht wird,',
    'der gesprochen hat durch die Propheten,',
    'und die eine, heilige, allgemeine',
    'und apostolische Kirche.',
    'Wir bekennen die eine Taufe zur Vergebung der Sünden.',
    'Wir erwarten die Auferstehung der Toten',
    'und das Leben der kommenden Welt. Amen.',
  ],
  { source: 'Heutige ökumenische Fassung' },
);

export const CREEDS: readonly Creed[] = [
  {
    id: 'apostolicum',
    title: 'Das Apostolische Glaubensbekenntnis',
    line: 'Das Taufbekenntnis der Westkirche',
    text: { ...CREED_LUTHER, source: 'Luther, Kleiner Katechismus' },
    explanation: [
      'Das Bekenntnis, das bei der Taufe gesprochen wird und im Gottesdienst Sonntag für Sonntag. Es wuchs aus dem alten römischen Taufbekenntnis und hat in der Westkirche seine Gestalt erhalten. Seine drei Artikel folgen dem dreieinigen Gott: dem Vater und der Schöpfung, dem Sohn und der Erlösung, dem Heiligen Geist und der Heiligung.',
      'Luther hat im Kleinen Katechismus jeden Artikel mit der Frage „Was ist das?“ ausgelegt. Hier steht es in seinem Wortlaut.',
    ],
  },
  {
    id: 'nicaenum',
    title: 'Das Nizänische Glaubensbekenntnis',
    line: 'Nizäa 325 und Konstantinopel 381',
    text: NICENE_CREED,
    explanation: [
      'Das zweite der drei altkirchlichen Bekenntnisse, die am Anfang des lutherischen Konkordienbuchs stehen. Die Forschung nennt es genauer „Nizäno-Konstantinopolitanum“: Es geht auf das Konzil von Nizäa (325) zurück, erhielt seine Gestalt auf dem Konzil von Konstantinopel (381) und wurde in Chalcedon (451) für verbindlich erklärt. Als einziges Bekenntnis gilt es in den Kirchen des Ostens wie des Westens.',
      'Es wurde in Kämpfen um das rechte Gottes- und Christusbekenntnis geformt. Manche bestritten, dass Jesus Christus ganz und gar Gott ist wie der Vater. Darauf antwortet das Bekenntnis: „Gott von Gott, Licht vom Licht, wahrer Gott vom wahren Gott, gezeugt, nicht geschaffen, eines Wesens mit dem Vater.“ Es ging dabei nicht um Wortstreit, sondern um unser Heil: „Für uns Menschen und zu unserm Heil“ ist er Mensch geworden und für uns gekreuzigt.',
      'Vom Heiligen Geist sagt das Bekenntnis, dass er „aus dem Vater und dem Sohn hervorgeht“. Den Zusatz „und dem Sohn“ (lateinisch filioque) hat die Westkirche später eingefügt; er trug zur Trennung von Ost- und Westkirche bei. Die lutherischen Bekenntnisschriften haben ihn.',
    ],
  },
  {
    id: 'athanasianum',
    title: 'Das Athanasianische Glaubensbekenntnis',
    line: 'Von der Dreieinigkeit und der Menschwerdung',
    explanation: [
      'Das dritte der altkirchlichen Bekenntnisse, nach seinem Anfangswort auch „Quicunque“ genannt. Es trägt den Namen des Athanasius von Alexandrien, der in Nizäa für die volle Gottheit Christi stritt, ist aber später in der Westkirche entstanden, wohl im 5. Jahrhundert. In klaren, fast feierlichen Sätzen bekennt es den einen Gott in drei Personen und den einen Christus, wahren Gott und wahren Menschen.',
      'Der Wortlaut folgt, sobald eine Fassung aus der Zeit vor 1900 vorliegt.',
    ],
  },
];
