/**
 * Explanations of the church year: festal circles, seasons and every Sunday
 * and major feast, with Gospel and Epistle.
 *
 * Readings: Lutheran order of pericopes of 1978 (valid until 2018), series I
 * (Gospel) and II (Epistle), which largely follows the historic one-year
 * lectionary. Only references are given; the text is read in the Bible
 * (rule 13). Explanations are written in our own words.
 */
import type { Circle, Season } from '../domain/churchYear';

export const LECTIONARY_NOTE =
  'Evangelium und Epistel nach der lutherischen Perikopenordnung von 1978 (Reihe I und II), die weitgehend der altkirchlichen Leseordnung folgt.';

export const CIRCLE_INFO: Record<Circle, { title: string; intro: string }> = {
  christmas: {
    title: 'Weihnachtskreis',
    intro:
      'Der Weihnachtskreis steht um das Christfest. Er erzählt, wie Gott zu uns kommt: erwartet im Advent, geboren in Bethlehem, offenbart vor allen Völkern in der Epiphaniaszeit. Mit ihm beginnt das Kirchenjahr – nicht mit unserem Planen, sondern mit Gottes Kommen.',
  },
  easter: {
    title: 'Osterkreis',
    intro:
      'Der Osterkreis steht um das Osterfest, das älteste und höchste Fest der Christenheit. Er führt von der Vorpassionszeit durch die Passion und die Karwoche zum leeren Grab und durch die fünfzig österlichen Tage bis vor Pfingsten. Hier liegt der Kern des Evangeliums: für uns gestorben, für uns auferstanden.',
  },
  pentecost: {
    title: 'Pfingstkreis',
    intro:
      'Der Pfingstkreis beginnt mit der Ausgießung des Heiligen Geistes und reicht bis zum Ende des Kirchenjahres. Nach den großen Heilstaten Christi geht es nun um das Leben der Kirche und des einzelnen Christen daraus: im Wort, im Sakrament, im Beruf und Stand, im Warten auf den wiederkommenden Herrn.',
  },
};

export const SEASON_INFO: Record<Season, string> = {
  advent:
    'Advent heißt Ankunft. Die vier Sonntage bereiten auf das Christfest vor und blicken zugleich nach vorn: Christus kam in Bethlehem, er kommt heute in Wort und Sakrament, und er wird wiederkommen. Eine Zeit der Buße und der Vorfreude zugleich.',
  christmastide:
    'Vom Christfest bis Epiphanias: Gott wird Mensch. Die Weihnachtszeit feiert die Geburt Christi und das Wunder, dass der ewige Sohn in unser Fleisch gekommen ist.',
  epiphany:
    'Epiphanias heißt Erscheinung. Christus zeigt sich als der Herr – den Weisen aus den Völkern, bei seiner Taufe, in seinen Wundern, zuletzt in der Verklärung auf dem Berg. Die Zahl der Sonntage hängt vom Osterdatum ab.',
  prelent:
    'Drei Sonntage vor der Passionszeit, benannt nach dem ungefähren Abstand zu Ostern (etwa 70, 60 und 50 Tage). Sie leiten über: Gnade statt Verdienst, die Kraft des Wortes, der Weg nach Jerusalem.',
  lent:
    'Die Passionszeit beginnt am Aschermittwoch und umfasst vierzig Tage – die Sonntage nicht mitgezählt, denn jeder Sonntag ist ein kleines Ostern. Sie bedenkt das Leiden Christi und ruft zur Buße. Das Halleluja schweigt bis Ostern.',
  holyWeek:
    'Die Karwoche („Klagewoche“) führt vom Einzug in Jerusalem über das Abendmahl am Gründonnerstag zum Kreuz am Karfreitag und zur Grabesruhe am Karsamstag.',
  eastertide:
    'Fünfzig Tage feiert die Kirche die Auferstehung. Die Sonntage tragen die lateinischen Anfangsworte ihrer alten Eingangspsalmen. Am vierzigsten Tag steht Christi Himmelfahrt.',
  pentecost:
    'Pfingsten, der fünfzigste Tag nach Ostern: Gott gießt seinen Geist aus, und die Kirche beginnt. Der Geist führt zu Christus und schafft Glauben durch das Wort.',
  trinity:
    'Die Trinitatiszeit ist die lange, festlose Hälfte des Kirchenjahres. Sie fragt, wie Christen aus Wort und Sakrament leben – in Glaube und Liebe, im Alltag von Haus, Beruf und Gemeinde. Die Sonntage werden nach Trinitatis gezählt.',
  endOfYear:
    'Die letzten Sonntage richten den Blick auf die letzten Dinge: das Kommen des Reiches Gottes, das Gericht und das ewige Leben. Dazu gehören der Buß- und Bettag und am Schluss der Ewigkeitssonntag, an dem der Verstorbenen gedacht wird.',
};

export interface SundayInfo {
  /** What the name means, for the Latin names. */
  meaning?: string;
  /** The theme of the day, in a few words. */
  theme: string;
  gospel: string;
  epistle: string;
}

/** Keys follow the week keys of domain/churchYear.ts and its major feast keys. */
export const SUNDAY_INFO: Record<string, SundayInfo> = {
  // Weihnachtskreis
  advent1: { theme: 'Der Herr kommt zu seinem Volk: Einzug in Jerusalem.', gospel: 'Matthäus 21,1-9', epistle: 'Römer 13,8-12' },
  advent2: { theme: 'Der kommende Erlöser: Zeichen seiner Wiederkunft.', gospel: 'Lukas 21,25-33', epistle: 'Jakobus 5,7-8' },
  advent3: { theme: 'Der Vorläufer des Herrn: Johannes der Täufer.', gospel: 'Matthäus 11,2-10', epistle: '1. Korinther 4,1-5' },
  advent4: { theme: 'Die nahende Freude: Maria und der verheißene Sohn.', gospel: 'Lukas 1,26-38', epistle: 'Philipper 4,4-7' },
  christmas: { theme: 'Das Wort ward Fleisch: die Geburt des Herrn.', gospel: 'Lukas 2,1-20', epistle: 'Titus 3,4-7' },
  christmas1: { theme: 'Simeon und Hanna erkennen das Heil Gottes.', gospel: 'Lukas 2,25-38', epistle: '1. Johannes 1,1-4' },
  christmas2: { theme: 'Der zwölfjährige Jesus im Tempel: im Hause des Vaters.', gospel: 'Lukas 2,41-52', epistle: '1. Johannes 5,11-13' },
  epiphany: { theme: 'Die Weisen aus dem Morgenland: Christus, das Licht der Völker.', gospel: 'Matthäus 2,1-12', epistle: 'Epheser 3,2-6' },
  epiphany1: { theme: 'Die Taufe Jesu: der geliebte Sohn.', gospel: 'Matthäus 3,13-17', epistle: 'Römer 12,1-3' },
  epiphany2: { theme: 'Die Hochzeit zu Kana: Jesus offenbart seine Herrlichkeit.', gospel: 'Johannes 2,1-11', epistle: 'Römer 12,9-16' },
  epiphany3: { theme: 'Der Hauptmann von Kapernaum: Glaube aus den Völkern.', gospel: 'Matthäus 8,5-13', epistle: 'Römer 1,16-17' },
  epiphany4: { theme: 'Die Stillung des Sturms: der Herr über die Mächte.', gospel: 'Markus 4,35-41', epistle: '2. Korinther 1,8-11' },
  epiphany5: { theme: 'Unkraut unter dem Weizen: Gottes Geduld bis zur Ernte.', gospel: 'Matthäus 13,24-30', epistle: '1. Korinther 1,4-9' },
  epiphanyLast: { theme: 'Die Verklärung Christi auf dem Berg.', gospel: 'Matthäus 17,1-9', epistle: '2. Korinther 4,6-10' },
  // Osterkreis
  septuagesimae: {
    meaning: 'Der siebzigste Tag vor Ostern (gerundet).',
    theme: 'Die Arbeiter im Weinberg: Gnade statt Lohn.',
    gospel: 'Matthäus 20,1-16',
    epistle: '1. Korinther 9,24-27',
  },
  sexagesimae: {
    meaning: 'Der sechzigste Tag vor Ostern (gerundet).',
    theme: 'Das Gleichnis vom Sämann: die Kraft des Wortes.',
    gospel: 'Lukas 8,4-15',
    epistle: 'Hebräer 4,12-13',
  },
  estomihi: {
    meaning: '„Sei mir ein starker Fels“ (Psalm 31,3).',
    theme: 'Jesus kündigt sein Leiden an; das Hohelied der Liebe.',
    gospel: 'Markus 8,31-38',
    epistle: '1. Korinther 13,1-13',
  },
  invokavit: {
    meaning: '„Er ruft mich an, so will ich ihn erhören“ (Psalm 91,15).',
    theme: 'Die Versuchung Jesu in der Wüste.',
    gospel: 'Matthäus 4,1-11',
    epistle: 'Hebräer 4,14-16',
  },
  reminiszere: {
    meaning: '„Gedenke, HERR, an deine Barmherzigkeit“ (Psalm 25,6).',
    theme: 'Die bösen Weingärtner: der verworfene Sohn.',
    gospel: 'Markus 12,1-12',
    epistle: 'Römer 5,1-5',
  },
  okuli: {
    meaning: '„Meine Augen sehen stets auf den HERRN“ (Psalm 25,15).',
    theme: 'Nachfolge ohne Zurückschauen.',
    gospel: 'Lukas 9,57-62',
    epistle: 'Epheser 5,1-8',
  },
  laetare: {
    meaning: '„Freuet euch mit Jerusalem“ (Jesaja 66,10) – das „kleine Ostern“ mitten in der Passionszeit.',
    theme: 'Das Weizenkorn, das stirbt und Frucht bringt.',
    gospel: 'Johannes 12,20-26',
    epistle: '2. Korinther 1,3-7',
  },
  judika: {
    meaning: '„Richte mich, Gott“ (Psalm 43,1).',
    theme: 'Des Menschen Sohn ist gekommen, um zu dienen.',
    gospel: 'Markus 10,35-45',
    epistle: 'Hebräer 5,7-9',
  },
  palmarum: {
    meaning: 'Palmsonntag: das Volk empfängt Jesus mit Palmzweigen.',
    theme: 'Der Einzug in Jerusalem: der König auf dem Weg ans Kreuz.',
    gospel: 'Johannes 12,12-19',
    epistle: 'Philipper 2,5-11',
  },
  maundyThursday: { theme: 'Die Einsetzung des heiligen Abendmahls; die Fußwaschung.', gospel: 'Johannes 13,1-15', epistle: '1. Korinther 11,23-26' },
  goodFriday: { theme: 'Die Kreuzigung des Herrn: „Es ist vollbracht.“', gospel: 'Johannes 19,16-30', epistle: '2. Korinther 5,14-21' },
  easter: { theme: 'Die Auferstehung des Herrn: das leere Grab.', gospel: 'Markus 16,1-8', epistle: '1. Korinther 15,1-11' },
  easterMonday: { theme: 'Die Emmausjünger: der Auferstandene geht mit.', gospel: 'Lukas 24,13-35', epistle: '1. Korinther 15,12-20' },
  quasimodogeniti: {
    meaning: '„Wie die neugeborenen Kindlein“ (1. Petrus 2,2).',
    theme: 'Der Auferstandene und Thomas: neugeboren zu lebendiger Hoffnung.',
    gospel: 'Johannes 20,19-29',
    epistle: '1. Petrus 1,3-9',
  },
  misericordias: {
    meaning: '„Die Erde ist voll der Güte des HERRN“ (Psalm 33,5).',
    theme: 'Der gute Hirte.',
    gospel: 'Johannes 10,11-16',
    epistle: '1. Petrus 2,21-25',
  },
  jubilate: {
    meaning: '„Jauchzet Gott, alle Lande“ (Psalm 66,1).',
    theme: 'Der Weinstock und die Reben: die neue Schöpfung.',
    gospel: 'Johannes 15,1-8',
    epistle: '1. Johannes 5,1-4',
  },
  kantate: {
    meaning: '„Singet dem HERRN ein neues Lied“ (Psalm 98,1).',
    theme: 'Das Lob Gottes; Jesu Heilandsruf.',
    gospel: 'Matthäus 11,25-30',
    epistle: 'Kolosser 3,12-17',
  },
  rogate: {
    meaning: '„Betet!“',
    theme: 'Das Gebet im Namen Jesu.',
    gospel: 'Johannes 16,23-33',
    epistle: '1. Timotheus 2,1-6',
  },
  ascension: { theme: 'Christi Himmelfahrt: der Herr zur Rechten des Vaters.', gospel: 'Lukas 24,50-53', epistle: 'Apostelgeschichte 1,3-11' },
  exaudi: {
    meaning: '„HERR, höre meine Stimme“ (Psalm 27,7).',
    theme: 'Die Verheißung des Trösters: zwischen Himmelfahrt und Pfingsten.',
    gospel: 'Johannes 15,26-16,4',
    epistle: 'Epheser 3,14-21',
  },
  // Pfingstkreis
  pentecost: { theme: 'Die Ausgießung des Heiligen Geistes; die Geburtsstunde der Kirche.', gospel: 'Johannes 14,23-27', epistle: 'Apostelgeschichte 2,1-18' },
  pentecostMonday: { theme: 'Das Bekenntnis des Petrus: die Kirche auf dem Felsen.', gospel: 'Matthäus 16,13-19', epistle: '1. Korinther 12,4-11' },
  trinity: {
    meaning: 'Das Fest der Heiligen Dreifaltigkeit.',
    theme: 'Der dreieinige Gott; Nikodemus und die neue Geburt.',
    gospel: 'Johannes 3,1-8',
    epistle: 'Römer 11,33-36',
  },
  trinity1: { theme: 'Der reiche Mann und der arme Lazarus: Gottes Wort ernst nehmen.', gospel: 'Lukas 16,19-31', epistle: '1. Johannes 4,16-21' },
  trinity2: { theme: 'Das große Abendmahl: die Einladung Gottes.', gospel: 'Lukas 14,16-24', epistle: 'Epheser 2,17-22' },
  trinity3: { theme: 'Das verlorene Schaf: Gottes Freude über den Sünder.', gospel: 'Lukas 15,1-10', epistle: '1. Timotheus 1,12-17' },
  trinity4: { theme: 'Seid barmherzig: die Gemeinschaft der Sünder.', gospel: 'Lukas 6,36-42', epistle: 'Römer 12,17-21' },
  trinity5: { theme: 'Der Fischzug des Petrus: Nachfolge auf Christi Wort.', gospel: 'Lukas 5,1-11', epistle: '1. Korinther 1,18-25' },
  trinity6: { theme: 'Die Taufe: in Christus begraben und auferweckt.', gospel: 'Matthäus 28,16-20', epistle: 'Römer 6,3-11' },
  trinity7: { theme: 'Die Speisung der Fünftausend: Gott sorgt.', gospel: 'Johannes 6,1-15', epistle: 'Apostelgeschichte 2,41-47' },
  trinity8: { theme: 'Salz der Erde und Licht der Welt.', gospel: 'Matthäus 5,13-16', epistle: 'Epheser 5,8-14' },
  trinity9: { theme: 'Die anvertrauten Pfunde: treue Haushalter.', gospel: 'Matthäus 25,14-30', epistle: 'Philipper 3,7-14' },
  trinity10: { theme: 'Jesus weint über Jerusalem: Gott und sein Volk Israel.', gospel: 'Lukas 19,41-48', epistle: 'Römer 11,25-32' },
  trinity11: { theme: 'Pharisäer und Zöllner: Gnade für den Sünder.', gospel: 'Lukas 18,9-14', epistle: 'Epheser 2,4-10' },
  trinity12: { theme: 'Die Heilung des Taubstummen: „Hephata – tu dich auf!“', gospel: 'Markus 7,31-37', epistle: 'Apostelgeschichte 9,1-20' },
  trinity13: { theme: 'Der barmherzige Samariter: wer ist mein Nächster?', gospel: 'Lukas 10,25-37', epistle: '1. Johannes 4,7-12' },
  trinity14: { theme: 'Die zehn Aussätzigen: der eine, der dankt.', gospel: 'Lukas 17,11-19', epistle: 'Römer 8,14-17' },
  trinity15: { theme: 'Sorget nicht: vom Vertrauen auf den Vater.', gospel: 'Matthäus 6,25-34', epistle: '1. Petrus 5,5-11' },
  trinity16: { theme: 'Die Auferweckung des Lazarus: Christus, der Herr über den Tod.', gospel: 'Johannes 11,1-3.17-27', epistle: '2. Timotheus 1,7-10' },
  trinity17: { theme: 'Die kanaanäische Frau: Glaube, der sich nicht abweisen lässt.', gospel: 'Matthäus 15,21-28', epistle: 'Römer 10,9-17' },
  trinity18: { theme: 'Das höchste Gebot: Gott lieben und den Nächsten.', gospel: 'Markus 12,28-34', epistle: 'Römer 14,17-19' },
  trinity19: { theme: 'Die Heilung des Gelähmten: Vergebung der Sünden.', gospel: 'Markus 2,1-12', epistle: 'Epheser 4,22-32' },
  trinity20: { theme: 'Ehe und Kinder: Gottes gute Ordnung.', gospel: 'Markus 10,2-16', epistle: '1. Thessalonicher 4,1-8' },
  trinity21: { theme: 'Liebet eure Feinde; die geistliche Waffenrüstung.', gospel: 'Matthäus 5,38-48', epistle: 'Epheser 6,10-17' },
  trinity22: { theme: 'Der Schalksknecht: Vergebung empfangen und weitergeben.', gospel: 'Matthäus 18,21-35', epistle: 'Philipper 1,3-11' },
  trinity23: { theme: 'Der Zinsgroschen: Bürger zweier Reiche.', gospel: 'Matthäus 22,15-22', epistle: 'Philipper 3,17-21' },
  trinity24: { theme: 'Die Tochter des Jaïrus: Hoffnung über den Tod hinaus.', gospel: 'Matthäus 9,18-26', epistle: 'Kolosser 1,13-20' },
  thirdLast: { theme: 'Das Kommen des Reiches Gottes.', gospel: 'Lukas 17,20-30', epistle: 'Römer 8,18-25' },
  secondLast: { theme: 'Das Weltgericht: was ihr getan habt …', gospel: 'Matthäus 25,31-46', epistle: 'Römer 14,10-13' },
  eternity: {
    meaning: 'Ewigkeitssonntag, auch Totensonntag: Gedenken der Verstorbenen im Licht der Ewigkeit.',
    theme: 'Die klugen und törichten Jungfrauen; der neue Himmel und die neue Erde.',
    gospel: 'Matthäus 25,1-13',
    epistle: 'Offenbarung 21,1-7',
  },
};
