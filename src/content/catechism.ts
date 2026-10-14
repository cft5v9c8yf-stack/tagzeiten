/**
 * Luther's Small Catechism word for word after the Book of Concord, St. Louis
 * 1881 (after the text of 1580), pp. 259–266, in the spelling of the edition;
 * the Table of Duties and the weekday table for the six-week cycle.
 */

export type ChiefPartId = 'commandments' | 'creed' | 'lordsPrayer' | 'baptism' | 'confession' | 'lordsSupper';

export interface CatechismPiece {
  /** Heading, e.g. "Das erste Gebot" */
  title: string;
  /** The text of the piece itself; empty for the sacraments and confession. */
  words: string;
  /** Question and answer pairs ("Was ist das?"). */
  qa: readonly (readonly [question: string, answer: string])[];
}

export interface ChiefPart {
  id: ChiefPartId;
  title: string;
  pieces: readonly CatechismPiece[];
}

export const CATECHISM: readonly ChiefPart[] = [
  {
    id: 'commandments',
    title: 'Die Zehn Gebote',
    pieces: [
      {
        title: 'Das erste Gebot',
        words: 'Du sollst nicht andere Götter haben.',
        qa: [
          ['Was ist das?', 'Wir sollen Gott über alle Dinge fürchten, lieben und vertrauen.'],
        ],
      },
      {
        title: 'Das andere Gebot',
        words: 'Du sollst den Namen deines Gottes nicht mißbrauchen.',
        qa: [
          ['Was ist das?', 'Wir sollen Gott fürchten und lieben, daß wir bei seinem Namen nicht fluchen, schwören, zaubern, lügen oder trügen, sondern denselbigen in allen Nöthen anrufen, beten, loben und danken.'],
        ],
      },
      {
        title: 'Das dritte Gebot',
        words: 'Du sollst den Feiertag heiligen.',
        qa: [
          ['Was ist das?', 'Wir sollen Gott fürchten und lieben, daß wir die Predigt und sein Wort nicht verachten, sondern dasselbige heilig halten, gerne hören und lernen.'],
        ],
      },
      {
        title: 'Das vierte Gebot',
        words: 'Du sollst deinen Vater und deine Mutter ehren.',
        qa: [
          ['Was ist das?', 'Wir sollen Gott fürchten und lieben, daß wir unsere Eltern und Herren nicht verachten noch erzürnen, sondern sie in Ehren halten, ihnen dienen, gehorchen, lieb und werth haben.'],
        ],
      },
      {
        title: 'Das fünfte Gebot',
        words: 'Du sollst nicht tödten.',
        qa: [
          ['Was ist das?', 'Wir sollen Gott fürchten und lieben, daß wir unserm Nächsten an seinem Leibe keinen Schaden noch Leid thun, sondern ihm helfen und fördern in allen Leibesnöthen.'],
        ],
      },
      {
        title: 'Das sechste Gebot',
        words: 'Du sollst nicht ehebrechen.',
        qa: [
          ['Was ist das?', 'Wir sollen Gott fürchten und lieben, daß wir keusch und züchtig leben in Worten und Werken, und ein jeglicher sein Gemahl lieben und ehren.'],
        ],
      },
      {
        title: 'Das siebente Gebot',
        words: 'Du sollst nicht stehlen.',
        qa: [
          ['Was ist das?', 'Wir sollen Gott fürchten und lieben, daß wir unsers Nächsten Geld oder Gut nicht nehmen, noch mit falscher Waare oder Handel an uns bringen, sondern ihm sein Gut und Nahrung helfen bessern und behüten.'],
        ],
      },
      {
        title: 'Das achte Gebot',
        words: 'Du sollst nicht falsch Gezeugniß reden wider deinen Nächsten.',
        qa: [
          ['Was ist das?', 'Wir sollen Gott fürchten und lieben, daß wir unsern Nächsten nicht fälschlich belügen, verrathen, afterreden oder bösen Leumund machen, sondern sollen ihn entschuldigen, Gutes von ihm reden und alles zum Besten kehren.'],
        ],
      },
      {
        title: 'Das neunte Gebot',
        words: 'Du sollst nicht begehren deines Nächsten Haus.',
        qa: [
          ['Was ist das?', 'Wir sollen Gott fürchten und lieben, daß wir unserm Nächsten nicht mit List nach seinem Erbe oder Hause stehen und mit einem Schein des Rechten an uns bringen etc., sondern ihm dasselbige zu behalten, förderlich und dienstlich sein.'],
        ],
      },
      {
        title: 'Das zehnte Gebot',
        words: 'Du sollst nicht begehren deines Nächsten Weib, Knecht, Magd, Vieh oder was sein ist.',
        qa: [
          ['Was ist das?', 'Wir sollen Gott fürchten und lieben, daß wir unserm Nächsten nicht sein Weib, Gesinde oder Vieh abspannen, abdringen oder abwendig machen, sondern dieselbigen anhalten, daß sie bleiben und thun, was sie schuldig sind.'],
        ],
      },
      {
        title: 'Was sagt nun Gott von diesen Geboten allen?',
        words: 'Er sagt also: Ich, der HErr dein Gott, bin ein eifriger Gott, der über die, so mich hassen, die Sünde der Väter heimsucht an den Kindern bis ins dritte und vierte Glied, aber denen, so mich lieben und meine Gebote halten, denen thue ich wohl in tausend Glied.',
        qa: [
          ['Was ist das?', 'Gott dräuet zu strafen alle, die diese Gebote übertreten; darum sollen wir uns fürchten vor seinem Zorn und nicht wider solche Gebote thun. Er verheißet aber Gnade und alles Gutes allen, die solche Gebote halten; darum sollen wir ihn auch lieben und vertrauen und gerne thun nach seinen Geboten.'],
        ],
      },
    ],
  },
  {
    id: 'creed',
    title: 'Der Glaube',
    pieces: [
      {
        title: 'Der erste Artikel. Von der Schöpfung',
        words: 'Ich glaube an Gott den Vater allmächtigen, Schöpfer Himmels und der Erden.',
        qa: [
          ['Was ist das?', 'Ich glaube, daß mich Gott geschaffen hat sammt allen Kreaturen, mir Leib und Seele, Augen, Ohren und alle Glieder, Vernunft und alle Sinne gegeben hat und noch erhält; dazu Kleider und Schuh, Essen und Trinken, Haus und Hof, Weib und Kind, Acker, Vieh und alle Güter, mit aller Nothdurft und Nahrung dieses Leibes und Lebens reichlich und täglich versorget, wider alle Fährlichkeit beschirmet und vor allem Uebel behütet und bewahret; und das alles aus lauter väterlicher, göttlicher Güte und Barmherzigkeit, ohne alle mein Verdienst und Würdigkeit: deß alles ich ihm zu danken und zu loben und dafür zu dienen und gehorsam zu sein schuldig bin. Das ist gewißlich wahr.'],
        ],
      },
      {
        title: 'Der andere Artikel. Von der Erlösung',
        words: 'Und an JEsum Christum, seinen einigen Sohn, unsern HErrn, der empfangen ist von dem Heiligen Geist, geboren aus Maria der Jungfrauen, gelitten unter Pontio Pilato, gekreuzigt, gestorben und begraben, niedergefahren zur Höllen, am dritten Tage wieder auferstanden von den Todten, aufgefahren gen Himmel, sitzend zur Rechten Gottes, des allmächtigen Vaters, von dannen er kommen wird, zu richten die Lebendigen und die Todten.',
        qa: [
          ['Was ist das?', 'Ich glaube, daß JEsus Christus wahrhaftiger Gott, vom Vater in Ewigkeit geboren, und auch wahrhaftiger Mensch, von der Jungfrauen Maria geboren, sei mein HErr, der mich verlornen und verdammten Menschen erlöset hat, erworben und gewonnen von allen Sünden, vom Tod und von der Gewalt des Teufels, nicht mit Gold oder Silber, sondern mit seinem heiligen theuern Blut und mit seinem unschuldigen Leiden und Sterben, auf daß ich sein eigen sei und in seinem Reich unter ihm lebe und ihm diene in ewiger Gerechtigkeit, Unschuld und Seligkeit, gleichwie er ist auferstanden vom Tod, lebet und regieret in Ewigkeit. Das ist gewißlich wahr.'],
        ],
      },
      {
        title: 'Der dritte Artikel. Von der Heiligung',
        words: 'Ich glaube an den Heiligen Geist, eine heilige christliche Kirche, die Gemeine der Heiligen, Vergebung der Sünden, Auferstehung des Fleisches, und ein ewiges Leben. Amen.',
        qa: [
          ['Was ist das?', 'Ich glaube, daß ich nicht aus eigener Vernunft noch Kraft an JEsum Christum, meinen HErrn, glauben oder zu ihm kommen kann; sondern der Heilige Geist hat mich durchs Evangelium berufen, mit seinen Gaben erleuchtet, im rechten Glauben geheiligt und erhalten; gleichwie er die ganze Christenheit auf Erden beruft, sammelt, erleuchtet, heiligt und bei JEsu Christo erhält im rechten einigen Glauben; in welcher Christenheit er mir und allen Gläubigen täglich alle Sünden reichlich vergibt, und am jüngsten Tage mich und alle Todten auferwecken wird, und mir sammt allen Gläubigen in Christo ein ewiges Leben geben wird. Das ist gewißlich wahr.'],
        ],
      },
    ],
  },
  {
    id: 'lordsPrayer',
    title: 'Das Vaterunser',
    pieces: [
      {
        title: 'Die Anrede',
        words: 'Vater unser, der du bist im Himmel.',
        qa: [
          ['Was ist das?', 'Gott will damit uns locken, daß wir glauben sollen, er sei unser rechter Vater und wir seine rechten Kinder, auf daß wir getrost und mit aller Zuversicht ihn bitten sollen, wie die lieben Kinder ihren lieben Vater.'],
        ],
      },
      {
        title: 'Die erste Bitte',
        words: 'Geheiligt werde dein Name.',
        qa: [
          ['Was ist das?', 'Gottes Name ist zwar an ihm selbst heilig, aber wir bitten in diesem Gebet, daß er bei uns auch heilig werde.'],
          ['Wie geschieht das?', 'Wo das Wort Gottes lauter und rein gelehret wird und wir auch heilig als die Kinder Gottes darnach leben; das hilf uns, lieber Vater im Himmel. Wer aber anders lehret und lebet, denn das Wort Gottes lehret, der entheiliget unter uns den Namen Gottes; da behüt uns für, himmlischer Vater.'],
        ],
      },
      {
        title: 'Die andere Bitte',
        words: 'Dein Reich komme.',
        qa: [
          ['Was ist das?', 'Gottes Reich kommt wohl ohne unser Gebet von ihm selbst, aber wir bitten in diesem Gebet, daß es auch zu uns komme.'],
          ['Wie geschieht das?', 'Wenn der himmlische Vater uns seinen Heiligen Geist gibt, daß wir seinem heiligen Wort durch seine Gnade glauben und göttlich leben, hie zeitlich und dort ewiglich.'],
        ],
      },
      {
        title: 'Die dritte Bitte',
        words: 'Dein Wille geschehe, wie im Himmel, also auch auf Erden.',
        qa: [
          ['Was ist das?', 'Gottes guter gnädiger Wille geschieht wohl ohne unser Gebet, aber wir bitten in diesem Gebet, daß er auch bei uns geschehe.'],
          ['Wie geschieht das?', 'Wenn Gott allen bösen Rath und Willen bricht und hindert, so uns den Namen Gottes nicht heiligen und sein Reich nicht kommen lassen wollen; als da ist des Teufels, der Welt und unsers Fleisches Wille, sondern stärket und behält uns fest in seinem Wort und Glauben, bis an unser Ende; das ist sein gnädiger guter Wille.'],
        ],
      },
      {
        title: 'Die vierte Bitte',
        words: 'Unser täglich Brot gib uns heute.',
        qa: [
          ['Was ist das?', 'Gott gibt täglich Brot, auch wohl ohne unsere Bitte, allen bösen Menschen; aber wir bitten in diesem Gebet, daß er uns erkennen lasse und mit Danksagung empfahen unser täglich Brot.'],
          ['Was heißt denn täglich Brot?', 'Alles, was zur Leibes Nahrung und Nothdurft gehört, als Essen, Trinken, Kleider, Schuh, Haus, Hof, Acker, Vieh, Geld, Gut, fromm Gemahl, fromme Kinder, fromm Gesinde, fromme und treue Oberherren, gut Regiment, gut Wetter, Friede, Gesundheit, Zucht, Ehre, gute Freunde, getreue Nachbarn und desgleichen.'],
        ],
      },
      {
        title: 'Die fünfte Bitte',
        words: 'Und verlaß uns unsere Schuld, als wir verlassen unsern Schuldigern.',
        qa: [
          ['Was ist das?', 'Wir bitten in diesem Gebet, daß der Vater im Himmel nicht ansehen wolle unsere Sünde, und um derselbigen willen solche Bitte nicht versagen; denn wir sind der keines werth, das wir bitten, haben es auch nicht verdienet; sondern er wolle es uns alles aus Gnaden geben, denn wir täglich viel sündigen und wohl eitel Strafe verdienen; so wollen wir zwar wiederum auch herzlich vergeben und gerne wohlthun denen, die sich an uns versündigen.'],
        ],
      },
      {
        title: 'Die sechste Bitte',
        words: 'Und führe uns nicht in Versuchung.',
        qa: [
          ['Was ist das?', 'Gott versucht zwar niemand, aber wir bitten in diesem Gebet, daß uns Gott wolle behüten und erhalten, auf daß uns der Teufel, die Welt und unser Fleisch nicht betrüge, noch verführe in Mißglauben, Verzweifeln und andere große Schande und Laster; und ob wir damit angefochten würden, daß wir doch endlich gewinnen und den Sieg behalten.'],
        ],
      },
      {
        title: 'Die siebente Bitte',
        words: 'Sondern erlöse uns von dem Uebel.',
        qa: [
          ['Was ist das?', 'Wir bitten in diesem Gebet, als in der Summa, daß uns der Vater im Himmel von allerlei Uebel Leibes und Seele, Gutes und Ehre erlöse, und zuletzt, wenn unser Stündlein kommt, ein seliges Ende beschere, und mit Gnaden von diesem Jammerthal zu sich nehme in den Himmel.'],
        ],
      },
      {
        title: 'Amen',
        words: 'Amen.',
        qa: [
          ['Was ist das?', 'Daß ich soll gewiß sein, solche Bitten sind dem Vater im Himmel angenehm und erhöret; denn er selbst hat uns geboten, also zu beten, und verheißen, daß er uns will erhören. Amen, Amen, das heißt, ja, ja, es soll also geschehen.'],
        ],
      },
    ],
  },
  {
    id: 'baptism',
    title: 'Das Sakrament der heiligen Taufe',
    pieces: [
      {
        title: 'Zum ersten',
        words: '',
        qa: [
          ['Was ist die Taufe?', 'Die Taufe ist nicht allein schlecht Wasser, sondern sie ist das Wasser in Gottes Gebot gefasset und mit Gottes Wort verbunden.'],
          ['Welches ist denn solch Wort Gottes?', 'Da unser HErr Christus spricht Matthäi am letzten: Gehet hin in alle Welt, lehret alle Heiden, und taufet sie im Namen des Vaters und des Sohnes und des Heiligen Geistes.'],
        ],
      },
      {
        title: 'Zum andern',
        words: '',
        qa: [
          ['Was gibt oder nützt die Taufe?', 'Sie wirket Vergebung der Sünden, erlöset vom Tod und Teufel und gibt die ewige Seligkeit allen, die es glauben, wie die Worte und Verheißung Gottes lauten.'],
          ['Welches sind solche Worte und Verheißung Gottes?', 'Da unser HErr Christus spricht Marci am letzten: Wer da glaubet und getauft wird, der wird selig; wer aber nicht glaubet, der wird verdammt.'],
        ],
      },
      {
        title: 'Zum dritten',
        words: '',
        qa: [
          ['Wie kann Wasser solche große Dinge thun?', 'Wasser thuts freilich nicht, sondern das Wort Gottes, so mit und bei dem Wasser ist, und der Glaube, so solchem Worte Gottes im Wasser trauet. Denn ohne Gottes Wort ist das Wasser schlecht Wasser, und keine Taufe; aber mit dem Wort Gottes ists eine Taufe, das ist, ein gnadenreich Wasser des Lebens und ein Bad der neuen Geburt im Heiligen Geist, wie St. Paulus sagt zu Tito am 3. Kapitel: Durch das Bad der Wiedergeburt und Erneuerung des Heiligen Geistes, welchen er ausgegossen hat über uns reichlich durch JEsum Christum, unsern Heiland, auf daß wir durch desselben Gnade gerecht und Erben seien des ewigen Lebens nach der Hoffnung. Das ist je gewißlich wahr.'],
        ],
      },
      {
        title: 'Zum vierten',
        words: '',
        qa: [
          ['Was bedeutet denn solch Wassertaufen?', 'Es bedeutet, daß der alte Adam in uns durch tägliche Reue und Buße soll ersäuft werden und sterben mit allen Sünden und bösen Lüsten, und wiederum täglich heraus kommen und auferstehen ein neuer Mensch, der in Gerechtigkeit und Reinigkeit vor Gott ewiglich lebe.'],
          ['Wo steht das geschrieben?', 'St. Paulus zu den Römern am 6. spricht: Wir sind sammt Christo durch die Taufe begraben in den Tod, daß, gleichwie Christus ist von den Todten auferwecket durch die Herrlichkeit des Vaters, also sollen wir auch in einem neuen Leben wandeln.'],
        ],
      },
    ],
  },
  {
    id: 'confession',
    title: 'Die Beichte',
    pieces: [
      {
        title: 'Was ist die Beichte?',
        words: '',
        qa: [
          ['Was ist die Beichte?', 'Die Beichte begreift zwei Stücke in sich: eines, daß man die Sünde bekenne; das andere, daß man die absolutio oder Vergebung von dem Beichtiger empfahe als von Gott selbst, und ja nicht daran zweifele, sondern fest glaube, die Sünden seien dadurch vergeben vor Gott im Himmel.'],
        ],
      },
      {
        title: 'Welche Sünden soll man denn beichten?',
        words: '',
        qa: [
          ['Welche Sünden soll man denn beichten?', 'Vor Gott soll man aller Sünden sich schuldig geben, auch die wir nicht erkennen, wie wir im Vater Unser thun; aber vor dem Beichtiger sollen wir allein die Sünden bekennen, die wir wissen und fühlen im Herzen.'],
        ],
      },
      {
        title: 'Welche sind die?',
        words: '',
        qa: [
          ['Welche sind die?', 'Da siehe deinen Stand an nach den zehn Geboten: ob du Vater, Mutter, Sohn, Tochter, Herr, Frau, Knecht seiest, ob du ungehorsam, untreu, unfleißig gewesen seiest, ob du jemand Leid gethan hast mit Worten oder Werken, ob du gestohlen, versäumet, verwahrlost, Schaden gethan hast.'],
        ],
      },
      {
        title: 'Darauf soll der Beichtiger sagen',
        words: '',
        qa: [
          ['Darauf soll der Beichtiger sagen:', 'Gott sei dir gnädig und stärke deinen Glauben! Amen. Weiter: Glaubest du auch, daß meine Vergebung Gottes Vergebung sei? Antwort: Ja, lieber Herr. Darauf spreche er: Wie du glaubest, so geschehe dir. Und ich aus dem Befehl unsers HErrn JEsu Christi vergebe dir deine Sünden im Namen des Vaters und des Sohnes und des Heiligen Geistes! Amen. Gehe hin im Friede.'],
        ],
      },
    ],
  },
  {
    id: 'lordsSupper',
    title: 'Das Sakrament des Altars',
    pieces: [
      {
        title: 'Was ist das Sacrament des Altars?',
        words: '',
        qa: [
          ['Was ist das Sacrament des Altars?', 'Es ist der wahre Leib und Blut unsers HErrn JEsu Christi, unter dem Brot und Wein uns Christen zu essen und zu trinken von Christo selbst eingesetzt.'],
          ['Wo steht das geschrieben?', 'So schreiben die heiligen Evangelisten Matthäus, Marcus, Lucas und St. Paulus: Unser HErr JEsus Christus in der Nacht, da er verrathen ward, nahm er das Brot, dankte und brachs, und gabs seinen Jüngern und sprach: Nehmet hin, esset, das ist mein Leib, der für euch gegeben wird; solches thut zu meinem Gedächtniß. Desselbigen gleichen nahm er auch den Kelch nach dem Abendmahl, dankte und gab ihnen den und sprach: Nehmet hin und trinket alle daraus, dieser Kelch ist das neue Testament in meinem Blut, das für euch vergossen wird zur Vergebung der Sünden; solches thut, so oft ihrs trinket, zu meinem Gedächtniß.'],
        ],
      },
      {
        title: 'Was nützt denn solch Essen und Trinken?',
        words: '',
        qa: [
          ['Was nützt denn solch Essen und Trinken?', 'Das zeigen uns diese Worte: „Für euch gegeben und vergossen zur Vergebung der Sünden“, nämlich, daß uns im Sacrament Vergebung der Sünden, Leben und Seligkeit durch solche Worte gegeben wird; denn wo Vergebung der Sünden ist, da ist auch Leben und Seligkeit.'],
        ],
      },
      {
        title: 'Wie kann leiblich Essen und Trinken solche große Dinge thun?',
        words: '',
        qa: [
          ['Wie kann leiblich Essen und Trinken solche große Dinge thun?', 'Essen und Trinken thuts freilich nicht, sondern die Worte, so da stehen: „Für euch gegeben und vergossen zur Vergebung der Sünden.“ Welche Worte sind neben dem leiblichen Essen und Trinken als das Hauptstück im Sacrament, und wer denselbigen Worten glaubet, der hat, was sie sagen und wie sie lauten, nämlich Vergebung der Sünden.'],
        ],
      },
      {
        title: 'Wer empfähet denn solch Sacrament würdiglich?',
        words: '',
        qa: [
          ['Wer empfähet denn solch Sacrament würdiglich?', 'Fasten und leiblich sich bereiten ist wohl eine feine äußerliche Zucht, aber der ist recht würdig und wohlgeschickt, wer den Glauben hat an diese Worte: „Für euch gegeben und vergossen zur Vergebung der Sünden.“ Wer aber diesen Worten nicht glaubet oder zweifelt, der ist unwürdig und ungeschickt; denn das Wort: FÜR EUCH, fordert eitel gläubige Herzen.'],
        ],
      },
    ],
  },
];

/**
 * Pieces per weekday for each chief part, Monday = 0 … Sunday = 6.
 * Every piece of a chief part appears at least once in its week.
 */
export const WEEKDAY_PIECES: Record<ChiefPartId, readonly (readonly number[])[]> = {
  commandments: [[0], [1], [2], [3], [4, 5], [6, 7], [8, 9, 10]],
  creed: [[0], [0], [1], [1], [1], [2], [2]],
  lordsPrayer: [[0, 1], [2], [3], [4], [5], [6], [7, 8]],
  baptism: [[0], [0], [1], [1], [2], [2], [3]],
  confession: [[0], [0], [1], [1], [2], [2], [3]],
  lordsSupper: [[0], [0], [1], [1], [2], [3], [3]],
};

export interface DutyEntry {
  title: string;
  refs: readonly string[];
}

/** Die Haustafel: etliche Sprüche für allerlei heilige Orden und Stände. */
export const TABLE_OF_DUTIES: readonly DutyEntry[] = [
  { title: 'Den Bischöfen, Pfarrherren und Predigern', refs: ['1. Timotheus 3,2-6', 'Titus 1,9'] },
  { title: 'Was die Christen ihren Lehrern und Seelsorgern schuldig sind', refs: ['Lukas 10,7', '1. Korinther 9,14', 'Galater 6,6-7', '1. Timotheus 5,17-18', '1. Thessalonicher 5,12-13', 'Hebräer 13,17'] },
  { title: 'Von weltlicher Obrigkeit', refs: ['Römer 13,1-4'] },
  { title: 'Was die Untertanen der Obrigkeit schuldig sind', refs: ['Matthäus 22,21', 'Römer 13,5-7', '1. Timotheus 2,1-2', 'Titus 3,1', '1. Petrus 2,13-14'] },
  { title: 'Den Ehemännern', refs: ['1. Petrus 3,7', 'Kolosser 3,19'] },
  { title: 'Den Eheweibern', refs: ['1. Petrus 3,1.6', 'Epheser 5,22'] },
  { title: 'Den Eltern', refs: ['Epheser 6,4', 'Kolosser 3,21'] },
  { title: 'Den Kindern', refs: ['Epheser 6,1-3'] },
  { title: 'Den Knechten, Mägden, Tagelöhnern und Arbeitern', refs: ['Epheser 6,5-8'] },
  { title: 'Den Hausherren und Hausfrauen', refs: ['Epheser 6,9'] },
  { title: 'Der gemeinen Jugend', refs: ['1. Petrus 5,5-6'] },
  { title: 'Den Witwen', refs: ['1. Timotheus 5,5-6'] },
  { title: 'Der Gemeinde', refs: ['Römer 13,9', '1. Timotheus 2,1'] },
];

export const CATECHISM_SUBTITLE = 'Wie ihn ein Hausvater seinem Hause einfältiglich vorhalten soll.';
export const TABLE_OF_DUTIES_SUBTITLE = 'Etliche Sprüche für allerlei heilige Orden und Stände.';
