/**
 * Luther's Small Catechism in the traditional wording (public domain),
 * the Table of Duties and the weekday table for the six-week cycle.
 * Transcribed from reference/prototype.html.
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
        words: 'Du sollst keine anderen Götter haben.',
        qa: [
          [
            'Was ist das?',
            'Wir sollen Gott über alle Dinge fürchten, lieben und vertrauen.',
          ],
        ],
      },
      {
        title: 'Das zweite Gebot',
        words: 'Du sollst den Namen deines Gottes nicht unnützlich führen.',
        qa: [
          [
            'Was ist das?',
            'Wir sollen Gott fürchten und lieben, daß wir bei seinem Namen nicht fluchen, schwören, zaubern, lügen oder trügen, sondern denselben in allen Nöten anrufen, beten, loben und danken.',
          ],
        ],
      },
      {
        title: 'Das dritte Gebot',
        words: 'Du sollst den Feiertag heiligen.',
        qa: [
          [
            'Was ist das?',
            'Wir sollen Gott fürchten und lieben, daß wir die Predigt und sein Wort nicht verachten, sondern dasselbe heilig halten, gerne hören und lernen.',
          ],
        ],
      },
      {
        title: 'Das vierte Gebot',
        words: 'Du sollst deinen Vater und deine Mutter ehren.',
        qa: [
          [
            'Was ist das?',
            'Wir sollen Gott fürchten und lieben, daß wir unsere Eltern und Herren nicht verachten noch erzürnen, sondern sie in Ehren halten, ihnen dienen, gehorchen, sie lieb und wert haben.',
          ],
        ],
      },
      {
        title: 'Das fünfte Gebot',
        words: 'Du sollst nicht töten.',
        qa: [
          [
            'Was ist das?',
            'Wir sollen Gott fürchten und lieben, daß wir unserm Nächsten an seinem Leibe keinen Schaden noch Leid tun, sondern ihm helfen und fördern in allen Leibesnöten.',
          ],
        ],
      },
      {
        title: 'Das sechste Gebot',
        words: 'Du sollst nicht ehebrechen.',
        qa: [
          [
            'Was ist das?',
            'Wir sollen Gott fürchten und lieben, daß wir keusch und züchtig leben in Worten und Werken und ein jeglicher sein Gemahl liebe und ehre.',
          ],
        ],
      },
      {
        title: 'Das siebente Gebot',
        words: 'Du sollst nicht stehlen.',
        qa: [
          [
            'Was ist das?',
            'Wir sollen Gott fürchten und lieben, daß wir unsers Nächsten Geld oder Gut nicht nehmen noch mit falscher Ware oder Handel an uns bringen, sondern ihm sein Gut und Nahrung helfen bessern und behüten.',
          ],
        ],
      },
      {
        title: 'Das achte Gebot',
        words: 'Du sollst nicht falsch Zeugnis reden wider deinen Nächsten.',
        qa: [
          [
            'Was ist das?',
            'Wir sollen Gott fürchten und lieben, daß wir unsern Nächsten nicht fälschlich belügen, verraten, afterreden oder bösen Leumund machen, sondern sollen ihn entschuldigen, Gutes von ihm reden und alles zum Besten kehren.',
          ],
        ],
      },
      {
        title: 'Das neunte Gebot',
        words: 'Du sollst nicht begehren deines Nächsten Haus.',
        qa: [
          [
            'Was ist das?',
            'Wir sollen Gott fürchten und lieben, daß wir unserm Nächsten nicht mit List nach seinem Erbe oder Hause stehen und mit einem Schein des Rechts an uns bringen, sondern ihm dasselbe zu behalten förderlich und dienstlich sein.',
          ],
        ],
      },
      {
        title: 'Das zehnte Gebot',
        words: 'Du sollst nicht begehren deines Nächsten Weib, Knecht, Magd, Vieh oder was sein ist.',
        qa: [
          [
            'Was ist das?',
            'Wir sollen Gott fürchten und lieben, daß wir unserm Nächsten nicht sein Weib, Gesinde oder Vieh abspannen, abdringen oder abwendig machen, sondern dieselben anhalten, daß sie bleiben und tun, was sie schuldig sind.',
          ],
        ],
      },
      {
        title: 'Der Beschluß der Gebote',
        words: 'Was sagt nun Gott von diesen Geboten allen? Er sagt so: Ich, der HERR, dein Gott, bin ein eifriger Gott, der über die, so mich hassen, die Sünde der Väter heimsucht an den Kindern bis ins dritte und vierte Glied; aber denen, so mich lieben und meine Gebote halten, tue ich wohl in tausend Glied.',
        qa: [
          [
            'Was ist das?',
            'Gott dräuet zu strafen alle, die diese Gebote übertreten; darum sollen wir uns fürchten vor seinem Zorn und nicht wider solche Gebote tun. Er verheißt aber Gnade und alles Gute allen, die solche Gebote halten; darum sollen wir ihn auch lieben und vertrauen und gerne tun nach seinen Geboten.',
          ],
        ],
      },
    ],
  },
  {
    id: 'creed',
    title: 'Der Glaube',
    pieces: [
      {
        title: 'Der erste Artikel: Von der Schöpfung',
        words: 'Ich glaube an Gott, den Vater, den Allmächtigen, Schöpfer Himmels und der Erde.',
        qa: [
          [
            'Was ist das?',
            'Ich glaube, daß mich Gott geschaffen hat samt allen Kreaturen, mir Leib und Seele, Augen, Ohren und alle Glieder, Vernunft und alle Sinne gegeben hat und noch erhält; dazu Kleider und Schuh, Essen und Trinken, Haus und Hof, Weib und Kind, Acker, Vieh und alle Güter; mit allem, was not tut für Leib und Leben, mich reichlich und täglich versorgt, wider alle Fährlichkeit beschirmt und vor allem Übel behütet und bewahrt; und das alles aus lauter väterlicher, göttlicher Güte und Barmherzigkeit, ohn all mein Verdienst und Würdigkeit; des alles ich ihm zu danken und zu loben und dafür zu dienen und gehorsam zu sein schuldig bin. Das ist gewißlich wahr.',
          ],
        ],
      },
      {
        title: 'Der zweite Artikel: Von der Erlösung',
        words: 'Und an Jesum Christum, seinen eingebornen Sohn, unsern Herrn, der empfangen ist von dem Heiligen Geist, geboren von der Jungfrau Maria, gelitten unter Pontio Pilato, gekreuzigt, gestorben und begraben, niedergefahren zur Hölle, am dritten Tage wieder auferstanden von den Toten, aufgefahren gen Himmel, sitzend zur Rechten Gottes, des allmächtigen Vaters, von dannen er kommen wird, zu richten die Lebendigen und die Toten.',
        qa: [
          [
            'Was ist das?',
            'Ich glaube, daß Jesus Christus, wahrhaftiger Gott, vom Vater in Ewigkeit geboren, und auch wahrhaftiger Mensch, von der Jungfrau Maria geboren, sei mein Herr, der mich verlornen und verdammten Menschen erlöst hat, erworben, gewonnen von allen Sünden, vom Tode und von der Gewalt des Teufels; nicht mit Gold oder Silber, sondern mit seinem heiligen, teuren Blut und mit seinem unschuldigen Leiden und Sterben; auf daß ich sein eigen sei und in seinem Reich unter ihm lebe und ihm diene in ewiger Gerechtigkeit, Unschuld und Seligkeit, gleichwie er ist auferstanden vom Tode, lebet und regieret in Ewigkeit. Das ist gewißlich wahr.',
          ],
        ],
      },
      {
        title: 'Der dritte Artikel: Von der Heiligung',
        words: 'Ich glaube an den Heiligen Geist, eine heilige christliche Kirche, die Gemeinde der Heiligen, Vergebung der Sünden, Auferstehung des Fleisches und ein ewiges Leben. Amen.',
        qa: [
          [
            'Was ist das?',
            'Ich glaube, daß ich nicht aus eigener Vernunft noch Kraft an Jesum Christum, meinen Herrn, glauben oder zu ihm kommen kann; sondern der Heilige Geist hat mich durch das Evangelium berufen, mit seinen Gaben erleuchtet, im rechten Glauben geheiligt und erhalten; gleichwie er die ganze Christenheit auf Erden beruft, sammelt, erleuchtet, heiligt und bei Jesu Christo erhält im rechten, einigen Glauben; in welcher Christenheit er mir und allen Gläubigen täglich alle Sünden reichlich vergibt und am Jüngsten Tage mich und alle Toten auferwecken wird und mir samt allen Gläubigen in Christo ein ewiges Leben geben wird. Das ist gewißlich wahr.',
          ],
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
          [
            'Was ist das?',
            'Gott will damit uns locken, daß wir glauben sollen, er sei unser rechter Vater und wir seine rechten Kinder, auf daß wir getrost und mit aller Zuversicht ihn bitten sollen wie die lieben Kinder ihren lieben Vater.',
          ],
        ],
      },
      {
        title: 'Die erste Bitte',
        words: 'Geheiliget werde dein Name.',
        qa: [
          [
            'Was ist das?',
            'Gottes Name ist zwar an ihm selbst heilig; aber wir bitten in diesem Gebet, daß er auch bei uns heilig werde.',
          ],
          [
            'Wie geschieht das?',
            'Wo das Wort Gottes lauter und rein gelehrt wird und wir auch heilig als die Kinder Gottes danach leben. Dazu hilf uns, lieber Vater im Himmel! Wer aber anders lehrt und lebt, denn das Wort Gottes lehrt, der entheiligt unter uns den Namen Gottes. Davor behüt uns, lieber himmlischer Vater!',
          ],
        ],
      },
      {
        title: 'Die zweite Bitte',
        words: 'Dein Reich komme.',
        qa: [
          [
            'Was ist das?',
            'Gottes Reich kommt wohl ohne unser Gebet von ihm selbst; aber wir bitten in diesem Gebet, daß es auch zu uns komme.',
          ],
          [
            'Wie geschieht das?',
            'Wenn der himmlische Vater uns seinen Heiligen Geist gibt, daß wir seinem heiligen Wort durch seine Gnade glauben und göttlich leben, hier zeitlich und dort ewiglich.',
          ],
        ],
      },
      {
        title: 'Die dritte Bitte',
        words: 'Dein Wille geschehe wie im Himmel, also auch auf Erden.',
        qa: [
          [
            'Was ist das?',
            'Gottes guter, gnädiger Wille geschieht wohl ohne unser Gebet; aber wir bitten in diesem Gebet, daß er auch bei uns geschehe.',
          ],
          [
            'Wie geschieht das?',
            'Wenn Gott allen bösen Rat und Willen bricht und hindert, so uns den Namen Gottes nicht heiligen und sein Reich nicht kommen lassen wollen, als da ist des Teufels, der Welt und unsers Fleisches Wille; sondern stärkt und behält uns fest in seinem Wort und Glauben bis an unser Ende. Das ist sein gnädiger, guter Wille.',
          ],
        ],
      },
      {
        title: 'Die vierte Bitte',
        words: 'Unser täglich Brot gib uns heute.',
        qa: [
          [
            'Was ist das?',
            'Gott gibt täglich Brot auch wohl ohne unsere Bitte allen bösen Menschen; aber wir bitten in diesem Gebet, daß er’s uns erkennen lasse und mit Danksagung empfangen unser täglich Brot.',
          ],
          [
            'Was heißt denn täglich Brot?',
            'Alles, was zur Leibesnahrung und -notdurft gehört, wie Essen, Trinken, Kleider, Schuh, Haus, Hof, Acker, Vieh, Geld, Gut, fromm Gemahl, fromme Kinder, fromm Gesinde, fromme und getreue Oberherren, gut Regiment, gut Wetter, Friede, Gesundheit, Zucht, Ehre, gute Freunde, getreue Nachbarn und desgleichen.',
          ],
        ],
      },
      {
        title: 'Die fünfte Bitte',
        words: 'Und vergib uns unsere Schuld, als wir vergeben unsern Schuldigern.',
        qa: [
          [
            'Was ist das?',
            'Wir bitten in diesem Gebet, daß der Vater im Himmel nicht ansehen wolle unsere Sünden und um derselben willen solche Bitte nicht versagen; denn wir sind der keines wert, das wir bitten, haben’s auch nicht verdient; sondern er wolle es uns alles aus Gnaden geben; denn wir täglich viel sündigen und wohl eitel Strafe verdienen. So wollen wir zwar wiederum auch herzlich vergeben und gerne wohltun denen, die sich an uns versündigen.',
          ],
        ],
      },
      {
        title: 'Die sechste Bitte',
        words: 'Und führe uns nicht in Versuchung.',
        qa: [
          [
            'Was ist das?',
            'Gott versucht zwar niemand; aber wir bitten in diesem Gebet, daß uns Gott wolle behüten und erhalten, auf daß uns der Teufel, die Welt und unser Fleisch nicht betrüge noch verführe in Mißglauben, Verzweiflung und andere große Schande und Laster; und ob wir damit angefochten würden, daß wir doch endlich gewinnen und den Sieg behalten.',
          ],
        ],
      },
      {
        title: 'Die siebente Bitte',
        words: 'Sondern erlöse uns von dem Übel.',
        qa: [
          [
            'Was ist das?',
            'Wir bitten in diesem Gebet, als in der Summa, daß uns der Vater im Himmel von allerlei Übel an Leib und Seele, Gut und Ehre erlöse und zuletzt, wenn unser Stündlein kommt, ein seliges Ende beschere und mit Gnaden von diesem Jammertal zu sich nehme in den Himmel.',
          ],
        ],
      },
      {
        title: 'Der Beschluß',
        words: 'Denn dein ist das Reich und die Kraft und die Herrlichkeit in Ewigkeit. Amen.',
        qa: [
          [
            'Was heißt Amen?',
            'Daß ich soll gewiß sein, solche Bitten sind dem Vater im Himmel angenehm und erhört; denn er selbst hat uns geboten, also zu beten, und verheißen, daß er uns will erhören. Amen, Amen, das heißt: Ja, ja, es soll also geschehen.',
          ],
        ],
      },
    ],
  },
  {
    id: 'baptism',
    title: 'Das Sakrament der heiligen Taufe',
    pieces: [
      {
        title: 'Zum Ersten',
        words: '',
        qa: [
          [
            'Was ist die Taufe?',
            'Die Taufe ist nicht allein schlicht Wasser, sondern sie ist das Wasser in Gottes Gebot gefaßt und mit Gottes Wort verbunden.',
          ],
          [
            'Welches ist denn solch Wort Gottes?',
            'Da unser Herr Christus spricht Matthäi am letzten: Gehet hin in alle Welt, lehret alle Heiden und taufet sie im Namen des Vaters und des Sohnes und des Heiligen Geistes.',
          ],
        ],
      },
      {
        title: 'Zum Andern',
        words: '',
        qa: [
          [
            'Was gibt oder nützet die Taufe?',
            'Sie wirkt Vergebung der Sünden, erlöst vom Tode und Teufel und gibt die ewige Seligkeit allen, die es glauben, wie die Worte und Verheißung Gottes lauten.',
          ],
          [
            'Welches sind denn solche Worte und Verheißung Gottes?',
            'Da unser Herr Christus spricht Markus am letzten: Wer da glaubet und getauft wird, der wird selig werden; wer aber nicht glaubet, der wird verdammt werden.',
          ],
        ],
      },
      {
        title: 'Zum Dritten',
        words: '',
        qa: [
          [
            'Wie kann Wasser solch große Dinge tun?',
            'Wasser tut’s freilich nicht, sondern das Wort Gottes, so mit und bei dem Wasser ist, und der Glaube, so solchem Wort Gottes im Wasser traut. Denn ohne Gottes Wort ist das Wasser schlicht Wasser und keine Taufe; aber mit dem Worte Gottes ist’s eine Taufe, das ist ein gnadenreich Wasser des Lebens und ein Bad der neuen Geburt im Heiligen Geist, wie St. Paulus sagt zu Titus im dritten Kapitel: Gott macht uns selig durch das Bad der Wiedergeburt und Erneuerung des Heiligen Geistes, welchen er ausgegossen hat über uns reichlich durch Jesum Christum, unsern Heiland, auf daß wir durch desselben Gnade gerecht und Erben seien des ewigen Lebens nach der Hoffnung. Das ist gewißlich wahr.',
          ],
        ],
      },
      {
        title: 'Zum Vierten',
        words: '',
        qa: [
          [
            'Was bedeutet denn solch Wassertaufen?',
            'Es bedeutet, daß der alte Adam in uns durch tägliche Reue und Buße soll ersäuft werden und sterben mit allen Sünden und bösen Lüsten; und wiederum täglich herauskommen und auferstehen ein neuer Mensch, der in Gerechtigkeit und Reinigkeit vor Gott ewiglich lebe.',
          ],
          [
            'Wo steht das geschrieben?',
            'St. Paulus zu den Römern im sechsten Kapitel spricht: Wir sind samt Christus durch die Taufe begraben in den Tod, auf daß, gleichwie Christus ist auferweckt von den Toten durch die Herrlichkeit des Vaters, also sollen auch wir in einem neuen Leben wandeln.',
          ],
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
          [
            'Was ist die Beichte?',
            'Die Beichte begreift zwei Stücke in sich: eins, daß man die Sünde bekenne; das andere, daß man die Absolution oder Vergebung vom Beichtiger empfange als von Gott selbst und ja nicht daran zweifle, sondern fest glaube, die Sünden seien dadurch vergeben vor Gott im Himmel.',
          ],
        ],
      },
      {
        title: 'Welche Sünden soll man beichten?',
        words: '',
        qa: [
          [
            'Welche Sünden soll man denn beichten?',
            'Vor Gott soll man sich aller Sünden schuldig geben, auch die wir nicht erkennen, wie wir im Vaterunser tun; aber vor dem Beichtiger sollen wir allein die Sünden bekennen, die wir wissen und fühlen im Herzen.',
          ],
        ],
      },
      {
        title: 'Welche sind die?',
        words: '',
        qa: [
          [
            'Welche sind die?',
            'Da siehe deinen Stand an nach den Zehn Geboten, ob du Vater, Mutter, Sohn, Tochter, Herr, Frau, Knecht seiest, ob du ungehorsam, untreu, unfleißig gewesen seiest, ob du jemand Leid getan hast mit Worten oder Werken, ob du gestohlen, versäumt, verwahrlost oder Schaden getan hast.',
          ],
        ],
      },
      {
        title: 'Die Absolution',
        words: '',
        qa: [
          [
            'Was spricht der Beichtiger?',
            'Gott sei dir gnädig und stärke deinen Glauben. Amen. Glaubst du auch, daß meine Vergebung Gottes Vergebung sei? – Ja, lieber Herr. – Wie du glaubst, so geschehe dir. Und ich aus dem Befehl unsers Herrn Jesu Christi vergebe dir deine Sünde im Namen des Vaters und des Sohnes und des Heiligen Geistes. Amen. Gehe hin im Frieden.',
          ],
        ],
      },
    ],
  },
  {
    id: 'lordsSupper',
    title: 'Das Sakrament des Altars',
    pieces: [
      {
        title: 'Was ist das Sakrament des Altars?',
        words: '',
        qa: [
          [
            'Was ist das Sakrament des Altars?',
            'Es ist der wahre Leib und Blut unsers Herrn Jesu Christi, unter dem Brot und Wein uns Christen zu essen und zu trinken von Christus selbst eingesetzt.',
          ],
          [
            'Wo steht das geschrieben?',
            'So schreiben die heiligen Evangelisten Matthäus, Markus, Lukas und St. Paulus: Unser Herr Jesus Christus, in der Nacht, da er verraten ward, nahm er das Brot, dankte und brach’s und gab’s seinen Jüngern und sprach: Nehmet hin und esset; das ist mein Leib, der für euch gegeben wird. Solches tut zu meinem Gedächtnis. Desselbengleichen nahm er auch den Kelch nach dem Abendmahl, dankte, gab ihnen den und sprach: Nehmet hin und trinket alle daraus; dieser Kelch ist das neue Testament in meinem Blut, das für euch vergossen wird zur Vergebung der Sünden. Solches tut, sooft ihr’s trinket, zu meinem Gedächtnis.',
          ],
        ],
      },
      {
        title: 'Was nützt solch Essen und Trinken?',
        words: '',
        qa: [
          [
            'Was nützt denn solch Essen und Trinken?',
            'Das zeigen uns diese Worte: Für euch gegeben und vergossen zur Vergebung der Sünden; nämlich, daß uns im Sakrament Vergebung der Sünden, Leben und Seligkeit durch solche Worte gegeben wird; denn wo Vergebung der Sünden ist, da ist auch Leben und Seligkeit.',
          ],
        ],
      },
      {
        title: 'Wie kann leiblich Essen solch große Dinge tun?',
        words: '',
        qa: [
          [
            'Wie kann leiblich Essen und Trinken solch große Dinge tun?',
            'Essen und Trinken tut’s freilich nicht, sondern die Worte, so da stehen: Für euch gegeben und vergossen zur Vergebung der Sünden. Welche Worte sind neben dem leiblichen Essen und Trinken das Hauptstück im Sakrament; und wer denselben Worten glaubt, der hat, was sie sagen und wie sie lauten, nämlich: Vergebung der Sünden.',
          ],
        ],
      },
      {
        title: 'Wer empfängt es würdig?',
        words: '',
        qa: [
          [
            'Wer empfängt denn solch Sakrament würdiglich?',
            'Fasten und leiblich sich bereiten ist wohl eine feine äußerliche Zucht; aber der ist recht würdig und wohl geschickt, wer den Glauben hat an diese Worte: Für euch gegeben und vergossen zur Vergebung der Sünden. Wer aber diesen Worten nicht glaubt oder zweifelt, der ist unwürdig und ungeschickt; denn das Wort ‚Für euch‘ fordert eitel gläubige Herzen.',
          ],
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
