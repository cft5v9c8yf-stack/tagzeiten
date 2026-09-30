/**
 * Explanations of the church year: festal circles, seasons and every Sunday
 * and major feast, with Gospel and Epistle.
 *
 * Readings: the historic (altkirchliche) order of Gospels and Epistles, as in
 * Luther's church and in Dieffenbach's Haus-Agende (1853); the last three
 * Sundays are the 25th to 27th after Trinity. Only references are given; the
 * text is read in the Bible (rule 13). Explanations are written in our own words.
 */
import type { Circle, Season } from '../domain/churchYear';

export const LECTIONARY_NOTE =
  'Evangelium und Epistel nach der altkirchlichen Leseordnung, wie sie in der lutherischen Kirche seit der Reformation gilt und auch Dieffenbachs Haus-Agende folgt.';

/**
 * The festal circles after Georg Christian Dieffenbach, Evangelische Haus-Agende
 * (Mainz 1853): each circle celebrates the work of one person of the Trinity.
 */
export const CIRCLE_INFO: Record<Circle, { title: string; of: string; range: string; intro: string }> = {
  christmas: {
    title: 'Weihnachtskreis',
    of: 'Der Festkreis Gottes des Vaters',
    range: 'Vom 1. Advent bis Sonnabend nach Epiphanias',
    intro:
      'Der Weihnachtskreis feiert, was Gott der Vater zur Erlösung getan hat: die Verheißung und Vorbereitung auf Christus, die Sendung des Sohnes selbst und seine Darstellung als Heiland der Welt. Er feiert die stille Vorbereitung des Erlösungswerkes.',
  },
  easter: {
    title: 'Osterkreis',
    of: 'Der Festkreis Gottes des Sohnes',
    range: 'Vom 1. Sonntag nach Epiphanias bis Himmelfahrt',
    intro:
      'Der Osterkreis feiert, was Gott der Sohn zur Erlösung der Welt getan hat, in seinem dreifachen Amt: als Prophet, der lehrt und sich durch Zeichen erweist; als Hoherpriester, der am Kreuz das Opfer für die Sünden der Welt vollbringt; als König, der aus Grab und Tod siegreich hervorgeht. Er feiert das Werk der Erlösung selbst.',
  },
  pentecost: {
    title: 'Pfingstkreis',
    of: 'Der Festkreis Gottes des Heiligen Geistes',
    range: 'Vom Freitag vor Exaudi bis zum letzten Tag des Kirchenjahres',
    intro:
      'Der Pfingstkreis feiert, was Gott der Heilige Geist zur Erlösung wirkt: nach einer kurzen Wartezeit seine Ausgießung, danach sein Walten in der Berufung und Sammlung, der Erleuchtung, Bekehrung, Heiligung und Vollendung der Gemeinde. Er feiert, wie die erworbenen Gnadengüter angeeignet werden und reifen bis zur Vollendung.',
  },
};

/** What each season celebrates, in Dieffenbach's words (Haus-Agende 1853). */
export const SEASON_THEME: Record<Season, string> = {
  advent: 'Die Vorbereitung auf Christi Ankunft',
  christmastide: 'Die Erscheinung Christi im Fleische',
  presentation: 'Die Darstellung Christi als des Heilands der Welt',
  epiphany: 'Christus als Prophet',
  lent: 'Christus als Hoherpriester',
  eastertide: 'Christus als König',
  waiting: 'Das Harren auf die Erscheinung des verheißenen Geistes',
  pentecost: 'Die Ausgießung des heiligen Geistes',
  trinity: 'Das Walten und Wirken des heiligen Geistes',
};

export const SEASON_INFO: Record<Season, string> = {
  advent:
    'Vom 1. Advent bis zum Heiligen Abend. Advent heißt Ankunft: Die vier Sonntage bereiten auf das Christfest vor und blicken zugleich nach vorn – Christus kam in Bethlehem, er kommt heute in Wort und Sakrament, und er wird wiederkommen.',
  christmastide:
    'Vom Christfest bis zum folgenden Sonnabend. Gott wird Mensch: Der ewige Sohn kommt in unser Fleisch.',
  presentation:
    'Vom Sonntag nach dem Christfest bis zum Sonnabend nach Epiphanias. Der Mensch gewordene Sohn wird der Welt dargestellt – im Tempel, vor den Weisen aus den Völkern, als Heiland für alle.',
  epiphany:
    'Vom 1. Sonntag nach Epiphanias bis Fastnacht. Christus erweist sich als der Prophet: Er lehrt das Volk und offenbart seine Herrlichkeit durch Wunder und Zeichen. Dazu gehören die drei Vorfastensonntage Septuagesimae, Sexagesimae und Estomihi. Die Zahl der Sonntage hängt vom Osterdatum ab.',
  lent:
    'Von Aschermittwoch bis zum Ostersonnabend. Christus als der Hohepriester: Er steigt hinab in das tiefste Leiden und vollbringt am Kreuz das Versöhnungsopfer für die Sünden der Welt. Die Karwoche mit Gründonnerstag und Karfreitag steht am Ende. Das Halleluja schweigt.',
  eastertide:
    'Vom Ostertag bis Himmelfahrt. Christus als der König: Er geht aus Grab und Tod siegreich hervor, offenbart sich den Seinen und steigt auf zur Rechten des Vaters. Die Sonntage tragen die lateinischen Anfangsworte ihrer alten Eingangspsalmen.',
  waiting:
    'Vom Freitag vor Exaudi bis zum Pfingstsonnabend. Die kleine Schar der Jünger harrt auf den verheißenen Tröster, im Gebet beieinander.',
  pentecost:
    'Die Pfingstwoche. Gott gießt seinen Geist aus, und die Kirche beginnt. Der Geist führt zu Christus und schafft Glauben durch das Wort.',
  trinity:
    'Von Trinitatis bis zum letzten Tag des Kirchenjahres – die lange, festlose Hälfte. Der Heilige Geist beruft und sammelt, erleuchtet, bekehrt, heiligt und vollendet die Gemeinde. Die letzten Sonntage richten den Blick auf die Vollendung: Wiederkunft, Gericht und ewiges Leben.',
};

/**
 * The Sundays after Trinity in five groups, after Dieffenbach's Haus-Agende. Trinitatis itself counts as 0.
 * The last three Sundays of the church year take the places of the 24th to
 * 27th Sunday and belong to the last group.
 */
export const TRINITY_GROUPS: readonly { from: number; to: number; title: string; range: string }[] = [
  { from: 0, to: 5, title: 'Berufung und Sammlung', range: 'Trinitatis – 5. Sonntag' },
  { from: 6, to: 10, title: 'Erleuchtung', range: '6. – 10. Sonntag' },
  { from: 11, to: 14, title: 'Bekehrung', range: '11. – 14. Sonntag' },
  { from: 15, to: 23, title: 'Heiligung', range: '15. – 23. Sonntag' },
  { from: 24, to: 27, title: 'Vollendung', range: '24. – 27. Sonntag' },
];

const END_OF_YEAR_KEYS = new Set(['thirdLast', 'secondLast', 'eternity']);

/** The Trinity group of a week key, or undefined outside the Trinity season and the end of the year. */
export function trinityGroupOf(key: string): (typeof TRINITY_GROUPS)[number] | undefined {
  if (END_OF_YEAR_KEYS.has(key)) return TRINITY_GROUPS[TRINITY_GROUPS.length - 1];
  const m = /^trinity(\d*)$/.exec(key);
  if (!m) return undefined;
  const n = m[1] ? Number(m[1]) : 0;
  return TRINITY_GROUPS.find((g) => n >= g.from && n <= g.to) ?? TRINITY_GROUPS[TRINITY_GROUPS.length - 1];
}

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
  advent1: { theme: 'Der Herr kommt zu seinem Volk: Einzug in Jerusalem.', gospel: 'Matthäus 21,1-9', epistle: 'Römer 13,11-14' },
  advent2: { theme: 'Der kommende Erlöser: Zeichen seiner Wiederkunft.', gospel: 'Lukas 21,25-36', epistle: 'Römer 15,4-13' },
  advent3: { theme: 'Der Vorläufer des Herrn: Johannes der Täufer.', gospel: 'Matthäus 11,2-10', epistle: '1. Korinther 4,1-5' },
  advent4: { theme: 'Das Zeugnis des Täufers: Der nach mir kommt.', gospel: 'Johannes 1,19-28', epistle: 'Philipper 4,4-7' },
  christmas: { theme: 'Das Wort ward Fleisch: die Geburt des Herrn.', gospel: 'Lukas 2,1-14', epistle: 'Titus 2,11-14' },
  christmas1: { theme: 'Simeon und Hanna: das Kind, gesetzt zum Fall und Auferstehen vieler.', gospel: 'Lukas 2,33-40', epistle: 'Galater 4,1-7' },
  christmas2: { theme: 'Die Flucht nach Ägypten: Herodes verfolgt das Kind.', gospel: 'Matthäus 2,13-23', epistle: '1. Petrus 4,12-19' },
  epiphany: { theme: 'Die Weisen aus dem Morgenland: Christus, das Licht der Völker.', gospel: 'Matthäus 2,1-12', epistle: 'Jesaja 60,1-6' },
  epiphany1: { theme: 'Der zwölfjährige Jesus im Tempel: im Hause des Vaters.', gospel: 'Lukas 2,41-52', epistle: 'Römer 12,1-6' },
  epiphany2: { theme: 'Die Hochzeit zu Kana: Jesus offenbart seine Herrlichkeit.', gospel: 'Johannes 2,1-11', epistle: 'Römer 12,6-16' },
  epiphany3: { theme: 'Der Aussätzige und der Hauptmann: Jesus heilt.', gospel: 'Matthäus 8,1-13', epistle: 'Römer 12,16-21' },
  epiphany4: { theme: 'Die Stillung des Sturms: der Herr über Wind und Meer.', gospel: 'Matthäus 8,23-27', epistle: 'Römer 13,8-10' },
  epiphany5: { theme: 'Unkraut unter dem Weizen: Gottes Geduld bis zur Ernte.', gospel: 'Matthäus 13,24-30', epistle: 'Kolosser 3,12-17' },
  epiphanyLast: { theme: 'Die Verklärung Christi auf dem Berg.', gospel: 'Matthäus 17,1-9', epistle: '2. Petrus 1,16-21' },
  // Osterkreis
  septuagesimae: {
    meaning: 'Der siebzigste Tag vor Ostern (gerundet).',
    theme: 'Die Arbeiter im Weinberg: Gnade statt Lohn.',
    gospel: 'Matthäus 20,1-16',
    epistle: '1. Korinther 9,24-10,5',
  },
  sexagesimae: {
    meaning: 'Der sechzigste Tag vor Ostern (gerundet).',
    theme: 'Das Gleichnis vom Sämann: die Kraft des Wortes.',
    gospel: 'Lukas 8,4-15',
    epistle: '2. Korinther 11,19-12,9',
  },
  estomihi: {
    meaning: '„Sei mir ein starker Fels“ (Psalm 31,3).',
    theme: 'Jesus kündigt sein Leiden an; der Blinde vor Jericho.',
    gospel: 'Lukas 18,31-43',
    epistle: '1. Korinther 13,1-13',
  },
  invokavit: {
    meaning: '„Er ruft mich an, so will ich ihn erhören“ (Psalm 91,15).',
    theme: 'Die Versuchung Jesu in der Wüste.',
    gospel: 'Matthäus 4,1-11',
    epistle: '2. Korinther 6,1-10',
  },
  reminiszere: {
    meaning: '„Gedenke, HERR, an deine Barmherzigkeit“ (Psalm 25,6).',
    theme: 'Die kanaanäische Frau: Glaube, der sich nicht abweisen lässt.',
    gospel: 'Matthäus 15,21-28',
    epistle: '1. Thessalonicher 4,1-7',
  },
  okuli: {
    meaning: '„Meine Augen sehen stets zu dem HERRN“ (Psalm 25,15).',
    theme: 'Jesus treibt den Teufel aus: Wer nicht mit mir ist, der ist wider mich.',
    gospel: 'Lukas 11,14-28',
    epistle: 'Epheser 5,1-9',
  },
  laetare: {
    meaning: '„Freuet euch mit Jerusalem“ (Jesaja 66,10) – das „kleine Ostern“ mitten in der Passionszeit.',
    theme: 'Die Speisung der Fünftausend: Brot in der Wüste.',
    gospel: 'Johannes 6,1-15',
    epistle: 'Galater 4,21-31',
  },
  judika: {
    meaning: '„Richte mich, Gott“ (Psalm 43,1).',
    theme: 'Ehe Abraham ward, bin ich: Jesus bezeugt seine Gottheit.',
    gospel: 'Johannes 8,46-59',
    epistle: 'Hebräer 9,11-15',
  },
  palmarum: {
    meaning: 'Palmsonntag: das Volk empfängt Jesus mit Palmzweigen.',
    theme: 'Der Einzug in Jerusalem: der König auf dem Weg ans Kreuz.',
    gospel: 'Matthäus 21,1-9',
    epistle: 'Philipper 2,5-11',
  },
  maundyThursday: { theme: 'Die Einsetzung des heiligen Abendmahls; die Fußwaschung.', gospel: 'Johannes 13,1-15', epistle: '1. Korinther 11,23-32' },
  goodFriday: { theme: 'Die Kreuzigung des Herrn: „Es ist vollbracht!“', gospel: 'Johannes 19,16-30', epistle: 'Jesaja 52,13-53,12' },
  easter: { theme: 'Die Auferstehung des Herrn: das leere Grab.', gospel: 'Markus 16,1-8', epistle: '1. Korinther 5,6-8' },
  easterMonday: { theme: 'Die Emmausjünger: der Auferstandene geht mit.', gospel: 'Lukas 24,13-35', epistle: 'Apostelgeschichte 10,34-41' },
  quasimodogeniti: {
    meaning: '„als die jetzt geborenen Kindlein“ (1. Petrus 2,2).',
    theme: 'Der Auferstandene und Thomas: Selig sind, die nicht sehen und doch glauben.',
    gospel: 'Johannes 20,19-31',
    epistle: '1. Johannes 5,4-10',
  },
  misericordias: {
    meaning: '„Die Erde ist voll der Güte des HERRN“ (Psalm 33,5).',
    theme: 'Der gute Hirte.',
    gospel: 'Johannes 10,11-16',
    epistle: '1. Petrus 2,21-25',
  },
  jubilate: {
    meaning: '„Jauchzet Gott, alle Lande“ (Psalm 66,1).',
    theme: 'Über ein Kleines: Die Traurigkeit wird in Freude verkehrt.',
    gospel: 'Johannes 16,16-23',
    epistle: '1. Petrus 2,11-20',
  },
  kantate: {
    meaning: '„Singet dem HERRN ein neues Lied“ (Psalm 98,1).',
    theme: 'Der Tröster wird kommen und in alle Wahrheit leiten.',
    gospel: 'Johannes 16,5-15',
    epistle: 'Jakobus 1,16-21',
  },
  rogate: {
    meaning: '„Betet!“',
    theme: 'Das Gebet im Namen Jesu.',
    gospel: 'Johannes 16,23-30',
    epistle: 'Jakobus 1,22-27',
  },
  ascension: { theme: 'Christi Himmelfahrt: Gehet hin in alle Welt.', gospel: 'Markus 16,14-20', epistle: 'Apostelgeschichte 1,1-11' },
  exaudi: {
    meaning: '„HERR, höre meine Stimme“ (Psalm 27,7).',
    theme: 'Die Verheißung des Trösters: zwischen Himmelfahrt und Pfingsten.',
    gospel: 'Johannes 15,26-16,4',
    epistle: '1. Petrus 4,7-11',
  },
  // Pfingstkreis
  pentecost: { theme: 'Die Ausgießung des Heiligen Geistes; die Geburtsstunde der Kirche.', gospel: 'Johannes 14,23-31', epistle: 'Apostelgeschichte 2,1-13' },
  pentecostMonday: { theme: 'Also hat Gott die Welt geliebt: das Pfingsten der Heiden.', gospel: 'Johannes 3,16-21', epistle: 'Apostelgeschichte 10,42-48' },
  trinity: {
    meaning: 'Das Fest der Heiligen Dreifaltigkeit.',
    theme: 'Der dreieinige Gott; Nikodemus und die neue Geburt.',
    gospel: 'Johannes 3,1-15',
    epistle: 'Römer 11,33-36',
  },
  trinity1: { theme: 'Der reiche Mann und der arme Lazarus: Gottes Wort ernst nehmen.', gospel: 'Lukas 16,19-31', epistle: '1. Johannes 4,16-21' },
  trinity2: { theme: 'Das große Abendmahl: die Einladung Gottes.', gospel: 'Lukas 14,16-24', epistle: '1. Johannes 3,13-18' },
  trinity3: { theme: 'Das verlorene Schaf: Gottes Freude über den Sünder.', gospel: 'Lukas 15,1-10', epistle: '1. Petrus 5,6-11' },
  trinity4: { theme: 'Seid barmherzig: die Gemeinschaft der Sünder.', gospel: 'Lukas 6,36-42', epistle: 'Römer 8,18-23' },
  trinity5: { theme: 'Der Fischzug des Petrus: Nachfolge auf Christi Wort.', gospel: 'Lukas 5,1-11', epistle: '1. Petrus 3,8-15' },
  trinity6: { theme: 'Die bessere Gerechtigkeit: Versöhne dich mit deinem Bruder.', gospel: 'Matthäus 5,20-26', epistle: 'Römer 6,3-11' },
  trinity7: { theme: 'Die Speisung der Viertausend: der Herr sorgt in der Wüste.', gospel: 'Markus 8,1-9', epistle: 'Römer 6,19-23' },
  trinity8: { theme: 'Die falschen Propheten: an ihren Früchten erkennen.', gospel: 'Matthäus 7,15-23', epistle: 'Römer 8,12-17' },
  trinity9: { theme: 'Der ungerechte Haushalter: die rechte Klugheit.', gospel: 'Lukas 16,1-9', epistle: '1. Korinther 10,6-13' },
  trinity10: { theme: 'Jesus weint über Jerusalem: die Zeit der Heimsuchung.', gospel: 'Lukas 19,41-48', epistle: '1. Korinther 12,1-11' },
  trinity11: { theme: 'Pharisäer und Zöllner: Gnade für den Sünder.', gospel: 'Lukas 18,9-14', epistle: '1. Korinther 15,1-10' },
  trinity12: { theme: 'Die Heilung des Taubstummen: „Hephata – tu dich auf!“', gospel: 'Markus 7,31-37', epistle: '2. Korinther 3,4-11' },
  trinity13: { theme: 'Der barmherzige Samariter: wer ist mein Nächster?', gospel: 'Lukas 10,23-37', epistle: 'Galater 3,15-22' },
  trinity14: { theme: 'Die zehn Aussätzigen: der eine, der dankt.', gospel: 'Lukas 17,11-19', epistle: 'Galater 5,16-24' },
  trinity15: { theme: 'Niemand kann zwei Herren dienen: Sorget nicht.', gospel: 'Matthäus 6,24-34', epistle: 'Galater 5,25-6,10' },
  trinity16: { theme: 'Der Jüngling zu Nain: der Herr über den Tod.', gospel: 'Lukas 7,11-17', epistle: 'Epheser 3,13-21' },
  trinity17: { theme: 'Heilung am Sabbat: Wer sich selbst erniedrigt, wird erhöht.', gospel: 'Lukas 14,1-11', epistle: 'Epheser 4,1-6' },
  trinity18: { theme: 'Das vornehmste Gebot und Davids Sohn: des Gesetzes und des Evangeliums Summe.', gospel: 'Matthäus 22,34-46', epistle: '1. Korinther 1,4-9' },
  trinity19: { theme: 'Der Gichtbrüchige: Deine Sünden sind dir vergeben.', gospel: 'Matthäus 9,1-8', epistle: 'Epheser 4,22-28' },
  trinity20: { theme: 'Die königliche Hochzeit: Viele sind berufen.', gospel: 'Matthäus 22,1-14', epistle: 'Epheser 5,15-21' },
  trinity21: { theme: 'Der Königische: Gehe hin, dein Sohn lebt.', gospel: 'Johannes 4,47-54', epistle: 'Epheser 6,10-17' },
  trinity22: { theme: 'Der Schalksknecht: Vergebung von Herzen.', gospel: 'Matthäus 18,23-35', epistle: 'Philipper 1,3-11' },
  trinity23: { theme: 'Der Zinsgroschen: Bürger zweier Reiche.', gospel: 'Matthäus 22,15-22', epistle: 'Philipper 3,17-21' },
  trinity24: { theme: 'Die Tochter des Obersten: Hoffnung über den Tod hinaus.', gospel: 'Matthäus 9,18-26', epistle: 'Kolosser 1,9-14' },
  thirdLast: { theme: 'Die große Trübsal und die Zukunft des Herrn.', gospel: 'Matthäus 24,15-28', epistle: '1. Thessalonicher 4,13-18' },
  secondLast: { theme: 'Das Weltgericht: Was ihr getan habt einem von diesen Geringsten.', gospel: 'Matthäus 25,31-46', epistle: '2. Petrus 3,3-13' },
  eternity: {
    meaning: 'Ewigkeitssonntag, auch Totensonntag: Gedenken der Verstorbenen im Licht der Ewigkeit.',
    theme: 'Die klugen und törichten Jungfrauen: Wachet!',
    gospel: 'Matthäus 25,1-13',
    epistle: '1. Thessalonicher 5,1-11',
  },
};
