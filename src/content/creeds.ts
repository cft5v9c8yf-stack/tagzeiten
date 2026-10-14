/**
 * The three creeds of the early church, as they stand at the head of the
 * Lutheran Book of Concord. Explanations in our own words.
 *
 * The Apostles' Creed in Luther's wording (Small Catechism, rule 12). The
 * Nicene Creed in today's ecumenical wording, on the user's express wish
 * (exception to rule 12, noted in CLAUDE.md). The Athanasian Creed as the
 * Book of Concord has it (edition of 1881, after the text of 1580).
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

/** The edition of the Book of Concord the old wordings are taken from. */
export const CONCORDIA =
  'Concordienbuch, das ist: Die symbolischen Bücher der evang.-luth. Kirche. Nach dem Urtext vom Jahre 1580 revidirte Ausgabe. St. Louis, Lutherischer Concordia-Verlag 1881';

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

/** Book of Concord, St. Louis 1881 (after the text of 1580), p. 20 f., word for word. */
export const ATHANASIAN_CREED = text(
  [
    'Wer da will selig werden, der muß vor allen Dingen den rechten christlichen Glauben haben.',
    'Wer denselben nicht ganz und rein hält, der wird ohne Zweifel ewiglich verloren sein.',
    'Dies ist aber der rechte christliche Glaube, daß wir einen einigen Gott in drei Personen und drei Personen in einiger Gottheit ehren,',
    'Und nicht die Personen in einander mengen, noch das göttliche Wesen zertrennen.',
    'Eine andere Person ist der Vater, eine andere der Sohn, eine andere der Heilige Geist.',
    'Aber der Vater und Sohn und Heilige Geist ist ein einiger Gott, gleich in der Herrlichkeit, gleich in ewiger Majestät.',
    'Welcherlei der Vater ist, solcherlei ist der Sohn, solcherlei ist auch der Heilige Geist.',
    'Der Vater ist nicht geschaffen, der Sohn ist nicht geschaffen, der Heilige Geist ist nicht geschaffen.',
    'Der Vater ist unmeßlich, der Sohn ist unmeßlich, der Heilige Geist ist unmeßlich.',
    'Der Vater ist ewig, der Sohn ist ewig, der Heilige Geist ist ewig;',
    'Und sind doch nicht drei Ewige, sondern es ist Ein Ewiger:',
    'Gleichwie auch nicht drei Ungeschaffene, noch drei Unmeßliche, sondern es ist Ein Ungeschaffener und Ein Unmeßlicher.',
    'Also auch, der Vater ist allmächtig, der Sohn ist allmächtig, der Heilige Geist ist allmächtig;',
    'Und sind doch nicht drei Allmächtige, sondern es ist Ein Allmächtiger.',
    'Also, der Vater ist Gott, der Sohn ist Gott, der Heilige Geist ist Gott;',
    'Und sind doch nicht drei Götter, sondern es ist Ein Gott.',
    'Also, der Vater ist der HErr, der Sohn ist der HErr, der Heilige Geist ist der HErr;',
    'Und sind doch nicht drei HErren, sondern es ist Ein HErr.',
    'Denn gleichwie wir müssen nach christlicher Wahrheit eine jegliche Person für sich Gott und HErrn bekennen:',
    'Also können wir im christlichen Glauben nicht drei Götter oder drei HErren nennen.',
    'Der Vater ist von niemand, weder gemacht, noch geschaffen, noch geboren.',
    'Der Sohn ist allein vom Vater, nicht gemacht, noch geschaffen, sondern geboren.',
    'Der Heilige Geist ist vom Vater und Sohn, nicht gemacht, nicht geschaffen, nicht geboren, sondern ausgehend.',
    'So ists nun Ein Vater, nicht drei Väter; Ein Sohn, nicht drei Söhne; Ein Heiliger Geist, nicht drei Heilige Geister.',
    'Und unter diesen drei Personen ist keine die erste, keine die letzte, keine die größeste, keine die kleinste;',
    'Sondern alle drei Personen sind mit einander gleich ewig, gleich groß:',
    'Auf daß also, wie gesagt ist, drei Personen in Einer Gottheit und Ein Gott in drei Personen geehret werde.',
    'Wer nun will selig werden, der muß also von den drei Personen in Gott halten.',
    '',
    'Es ist aber auch noth zur ewigen Seligkeit, daß man treulich glaube, daß JEsus Christus, unser HErr, sei wahrhaftiger Mensch.',
    'So ist nun dies der rechte Glaube, so wir glauben und bekennen, daß unser HErr JEsus Christus, Gottes Sohn, Gott und Mensch ist:',
    'Gott ist er aus des Vaters Natur vor der Welt geboren, Mensch ist er aus der Mutter Natur in der Welt geboren:',
    'Ein vollkommener Gott, ein vollkommener Mensch mit vernünftiger Seele und menschlichem Leibe;',
    'Gleich ist er dem Vater nach der Gottheit, kleiner ist er, denn der Vater, nach der Menschheit;',
    'Und wiewohl er Gott und Mensch ist, so ist er doch nicht zween, sondern Ein Christus,',
    'Einer, nicht daß die Gottheit in die Menschheit verwandelt sei, sondern daß die Gottheit hat die Menschheit an sich genommen.',
    'Ja, Einer ist er, nicht daß die zwo Naturen vermengt sind, sondern daß er eine einige Person ist.',
    'Denn gleichwie Leib und Seele Ein Mensch ist, so ist Gott und Mensch Ein Christus,',
    'Welcher gelitten hat um unserer Seligkeit willen, zur Höllen gefahren, am dritten Tage auferstanden von den Todten,',
    'Aufgefahren gen Himmel, sitzet zur Rechten Gottes, des allmächtigen Vaters,',
    'Von dannen er kommen wird, zu richten die Lebendigen und die Todten.',
    'Und zu seiner Zukunft müssen alle Menschen auferstehen mit ihren eigenen Leibern,',
    'Und müssen Rechenschaft geben, was sie gethan haben;',
    'Und welche Gutes gethan haben, werden ins ewige Leben gehen; welche aber Böses gethan, ins ewige Feuer.',
    '',
    'Das ist der rechte christliche Glaube; wer denselben nicht fest und treulich glaubt, der kann nicht selig werden.',
  ],
  { source: `${CONCORDIA}, S. 20 f.` },
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
    text: ATHANASIAN_CREED,
    explanation: [
      'Das dritte der altkirchlichen Bekenntnisse, nach seinem Anfangswort auch „Quicunque“ genannt. Es trägt den Namen des Athanasius von Alexandrien, der in Nizäa für die volle Gottheit Christi stritt, ist aber später in der Westkirche entstanden, wohl im 5. Jahrhundert. In klaren, fast feierlichen Sätzen bekennt es den einen Gott in drei Personen und den einen Christus, wahren Gott und wahren Menschen.',
      'Hier steht es im Wortlaut des Konkordienbuchs.',
    ],
  },
];
