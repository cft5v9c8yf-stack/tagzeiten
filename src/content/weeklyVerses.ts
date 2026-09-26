/**
 * Weekly verses (Wochensprüche) of the Lutheran church year, one per Sunday,
 * valid for the whole week. Wording: Luther Bible 1912 (public domain,
 * rule 12), taken from the CC0 edition "xmlbible-lut1912".
 *
 * Every entry is made of verbatim excerpts ("parts") of the 1912 text; the
 * displayed sentence is composed from them (capital first letter, closing
 * full stop). scripts/check-weekly-verses.mjs verifies every part against the
 * 1912 source. The only deliberate deviation is listed in CORRECTIONS.
 */

export interface WeeklyVerse {
  /** Reference as shown, e.g. "Sacharja 9,9". */
  ref: string;
  /** Book abbreviation, chapter and verse(s) in the 1912 source, for verification. */
  source: string;
  /** Verbatim excerpts of the 1912 text. */
  parts: readonly string[];
}

/** Obvious typos of the digital source, corrected against the printed 1912 text. */
export const CORRECTIONS: readonly { source: string; from: string; to: string }[] = [
  { source: 'Joh 3,15', from: 'auf das alle', to: 'auf daß alle' },
  { source: 'Ps 119,105', from: 'meine Fußes', to: 'meines Fußes' },
];

const v = (ref: string, source: string, ...parts: string[]): WeeklyVerse => ({ ref, source, parts });

/** Keys follow ChurchDay.weekKey (domain/churchYear.ts). */
export const WEEKLY_VERSES: Record<string, WeeklyVerse> = {
  advent1: v('Sacharja 9,9', 'Sach 9,9', 'Siehe, dein König kommt zu dir, ein Gerechter und ein Helfer'),
  advent2: v('Lukas 21,28', 'Lk 21,28', 'sehet auf und erhebet eure Häupter, darum daß sich eure Erlösung naht.'),
  advent3: v('Jesaja 40,3.10', 'Jes 40,3.10', 'Bereitet dem HERRN den Weg,', 'denn siehe, der Herr, HERR kommt gewaltig'),
  advent4: v('Philipper 4,4.5', 'Phil 4,4.5', 'Freuet euch in dem HERRN allewege! Und abermals sage ich: Freuet euch!', 'der HERR ist nahe!'),
  christmas: v('Johannes 1,14', 'Joh 1,14', 'das Wort ward Fleisch und wohnte unter uns, und wir sahen seine Herrlichkeit'),
  christmas1: v(
    'Johannes 1,14',
    'Joh 1,14',
    'wir sahen seine Herrlichkeit, eine Herrlichkeit als des eingeborenen Sohnes vom Vater, voller Gnade und Wahrheit.',
  ),
  christmas2: v(
    'Johannes 1,14',
    'Joh 1,14',
    'wir sahen seine Herrlichkeit, eine Herrlichkeit als des eingeborenen Sohnes vom Vater, voller Gnade und Wahrheit.',
  ),
  epiphany: v('1. Johannes 2,8', '1Jo 2,8', 'die Finsternis vergeht, und das wahre Licht scheint jetzt.'),
  epiphany1: v('Römer 8,14', 'Röm 8,14', 'welche der Geist Gottes treibt, die sind Gottes Kinder.'),
  epiphany2: v(
    'Johannes 1,17',
    'Joh 1,17',
    'das Gesetz ist durch Moses gegeben; die Gnade und Wahrheit ist durch Jesum Christum geworden.',
  ),
  epiphany3: v(
    'Lukas 13,29',
    'Lk 13,29',
    'es werden kommen vom Morgen und vom Abend, von Mitternacht und vom Mittage, die zu Tische sitzen werden im Reich Gottes.',
  ),
  epiphany4: v(
    'Psalm 66,5',
    'Ps 66,5',
    'Kommet her und sehet an die Werke Gottes, der so wunderbar ist in seinem Tun unter den Menschenkindern.',
  ),
  epiphany5: v(
    '1. Korinther 4,5',
    '1Kor 4,5',
    'richtet nicht vor der Zeit, bis der HERR komme, welcher auch wird ans Licht bringen, was im Finstern verborgen ist, und den Rat der Herzen offenbaren',
  ),
  epiphanyLast: v('Jesaja 60,2', 'Jes 60,2', 'über dir geht auf der HERR, und seine Herrlichkeit erscheint über dir.'),
  septuagesimae: v(
    'Daniel 9,18',
    'Dan 9,18',
    'wir liegen vor dir mit unserm Gebet, nicht auf unsre Gerechtigkeit, sondern auf deine große Barmherzigkeit.',
  ),
  sexagesimae: v('Hebräer 3,15', 'Hebr 3,15', 'Heute, so ihr seine Stimme hören werdet, so verstocket eure Herzen nicht'),
  estomihi: v(
    'Lukas 18,31',
    'Lk 18,31',
    'Sehet, wir gehen hinauf gen Jerusalem, und es wird alles vollendet werden, was geschrieben ist durch die Propheten von des Menschen Sohn.',
  ),
  invokavit: v('1. Johannes 3,8', '1Jo 3,8', 'Dazu ist erschienen der Sohn Gottes, daß er die Werke des Teufels zerstöre.'),
  reminiszere: v(
    'Römer 5,8',
    'Röm 5,8',
    'Darum preiset Gott seine Liebe gegen uns, daß Christus für uns gestorben ist, da wir noch Sünder waren.',
  ),
  okuli: v('Lukas 9,62', 'Lk 9,62', 'Wer seine Hand an den Pflug legt und sieht zurück, der ist nicht geschickt zum Reich Gottes.'),
  laetare: v(
    'Johannes 12,24',
    'Joh 12,24',
    "Es sei denn, daß das Weizenkorn in die Erde falle und ersterbe, so bleibt's allein; wo es aber erstirbt, so bringt es viele Früchte.",
  ),
  judika: v(
    'Matthäus 20,28',
    'Mt 20,28',
    'des Menschen Sohn ist nicht gekommen, daß er sich dienen lasse, sondern daß er diene und gebe sein Leben zu einer Erlösung für viele.',
  ),
  palmarum: v(
    'Johannes 3,14.15',
    'Joh 3,14.15',
    'also muß des Menschen Sohn erhöht werden, auf daß alle, die an ihn glauben, nicht verloren werden, sondern das ewige Leben haben.',
  ),
  easter: v(
    'Offenbarung 1,18',
    'Offb 1,18',
    'ich war tot, und siehe, ich bin lebendig von Ewigkeit zu Ewigkeit und habe die Schlüssel der Hölle und des Todes.',
  ),
  quasimodogeniti: v(
    '1. Petrus 1,3',
    '1Petr 1,3',
    'Gelobet sei Gott und der Vater unsers HERRN Jesu Christi, der uns nach seiner Barmherzigkeit wiedergeboren hat zu einer lebendigen Hoffnung durch die Auferstehung Jesu Christi von den Toten',
  ),
  misericordias: v(
    'Johannes 10,11.27.28',
    'Joh 10,11.27.28',
    'Ich bin der gute Hirte.',
    'meine Schafe hören meine Stimme, und ich kenne sie; und sie folgen mir, und ich gebe ihnen das ewige Leben',
  ),
  jubilate: v(
    '2. Korinther 5,17',
    '2Kor 5,17',
    'ist jemand in Christo, so ist er eine neue Kreatur; das Alte ist vergangen, siehe, es ist alles neu geworden!',
  ),
  kantate: v('Psalm 98,1', 'Ps 98,1', 'Singet dem HERRN ein neues Lied; denn er tut Wunder.'),
  rogate: v('Psalm 66,20', 'Ps 66,20', 'Gelobt sei Gott, der mein Gebet nicht verwirft noch seine Güte von mir wendet.'),
  exaudi: v('Johannes 12,32', 'Joh 12,32', 'Und ich, wenn ich erhöht werde von der Erde, so will ich sie alle zu mir ziehen.'),
  pentecost: v(
    'Sacharja 4,6',
    'Sach 4,6',
    'Es soll nicht durch Heer oder Kraft, sondern durch meinen Geist geschehen, spricht der HERR Zebaoth.',
  ),
  trinity: v('Jesaja 6,3', 'Jes 6,3', 'Heilig, heilig, heilig ist der HERR Zebaoth; alle Lande sind seiner Ehre voll!'),
  trinity1: v('Lukas 10,16', 'Lk 10,16', 'Wer euch hört, der hört mich; und wer euch verachtet, der verachtet mich'),
  trinity2: v('Matthäus 11,28', 'Mt 11,28', 'Kommet her zu mir alle, die ihr mühselig und beladen seid; ich will euch erquicken.'),
  trinity3: v('Lukas 19,10', 'Lk 19,10', 'des Menschen Sohn ist gekommen, zu suchen und selig zu machen, das verloren ist.'),
  trinity4: v('Galater 6,2', 'Gal 6,2', 'Einer trage des andern Last, so werdet ihr das Gesetz Christi erfüllen.'),
  trinity5: v('Epheser 2,8', 'Eph 2,8', 'aus Gnade seid ihr selig geworden durch den Glauben, und das nicht aus euch: Gottes Gabe ist es'),
  trinity6: v(
    'Jesaja 43,1',
    'Jes 43,1',
    'Fürchte dich nicht, denn ich habe dich erlöst; ich habe dich bei deinem Namen gerufen; du bist mein!',
  ),
  trinity7: v(
    'Epheser 2,19',
    'Eph 2,19',
    'So seid ihr nun nicht mehr Gäste und Fremdlinge, sondern Bürger mit den Heiligen und Gottes Hausgenossen',
  ),
  trinity8: v(
    'Epheser 5,8.9',
    'Eph 5,8.9',
    'Wandelt wie die Kinder des Lichts, die Frucht des Geistes ist allerlei Gütigkeit und Gerechtigkeit und Wahrheit',
  ),
  trinity9: v(
    'Lukas 12,48',
    'Lk 12,48',
    'welchem viel gegeben ist, bei dem wird man viel suchen; und welchem viel befohlen ist, von dem wird man viel fordern.',
  ),
  trinity10: v('Psalm 33,12', 'Ps 33,12', 'Wohl dem Volk, des Gott der HERR ist, dem Volk, das er zum Erbe erwählt hat!'),
  trinity11: v('1. Petrus 5,5', '1Petr 5,5', 'Gott widersteht den Hoffärtigen, aber den Demütigen gibt er Gnade.'),
  trinity12: v(
    'Jesaja 42,3',
    'Jes 42,3',
    'Das zerstoßene Rohr wird er nicht zerbrechen, und den glimmenden Docht wird er nicht auslöschen.',
  ),
  trinity13: v(
    'Matthäus 25,40',
    'Mt 25,40',
    'Was ihr getan habt einem unter diesen meinen geringsten Brüdern, das habt ihr mir getan.',
  ),
  trinity14: v('Psalm 103,2', 'Ps 103,2', 'Lobe den HERRN, meine Seele, und vergiß nicht, was er dir Gutes getan hat'),
  trinity15: v('1. Petrus 5,7', '1Petr 5,7', 'Alle Sorge werfet auf ihn; denn er sorgt für euch.'),
  trinity16: v(
    '2. Timotheus 1,10',
    '2Tim 1,10',
    'jetzt aber offenbart durch die Erscheinung unsers Heilandes Jesu Christi, der dem Tode die Macht hat genommen und das Leben und ein unvergänglich Wesen ans Licht gebracht durch das Evangelium',
  ),
  trinity17: v('1. Johannes 5,4', '1Jo 5,4', 'unser Glaube ist der Sieg, der die Welt überwunden hat.'),
  trinity18: v('1. Johannes 4,21', '1Jo 4,21', 'dies Gebot haben wir von ihm, daß, wer Gott liebt, daß der auch seinen Bruder liebe.'),
  trinity19: v('Jeremia 17,14', 'Jer 17,14', 'Heile du mich, HERR, so werde ich heil; hilf du mir, so ist mir geholfen'),
  trinity20: v(
    'Micha 6,8',
    'Mi 6,8',
    'Es ist dir gesagt, Mensch, was gut ist und was der HERR von dir fordert, nämlich Gottes Wort halten und Liebe üben und demütig sein vor deinem Gott.',
  ),
  trinity21: v('Römer 12,21', 'Röm 12,21', 'Laß dich nicht das Böse überwinden, sondern überwinde das Böse mit Gutem.'),
  trinity22: v('Psalm 130,4', 'Ps 130,4', 'Denn bei dir ist die Vergebung, daß man dich fürchte.'),
  trinity23: v(
    '1. Timotheus 6,15',
    '1Tim 6,15',
    'der Selige und allein Gewaltige, der König aller Könige und HERR aller Herren.',
  ),
  thirdLast: v('2. Korinther 6,2', '2Kor 6,2', 'Sehet, jetzt ist die angenehme Zeit, jetzt ist der Tag des Heils!'),
  secondLast: v('2. Korinther 5,10', '2Kor 5,10', 'wir müssen alle offenbar werden vor dem Richtstuhl Christi'),
  eternity: v('Lukas 12,35', 'Lk 12,35', 'Lasset eure Lenden umgürtet sein und eure Lichter brennen'),
};

/** Feasts within a week that carry a verse of their own. */
export const FEAST_VERSES: Record<string, WeeklyVerse> = {
  Karfreitag: v(
    'Johannes 3,16',
    'Joh 3,16',
    'Also hat Gott die Welt geliebt, daß er seinen eingeborenen Sohn gab, auf daß alle, die an ihn glauben, nicht verloren werden, sondern das ewige Leben haben.',
  ),
  'Christi Himmelfahrt': v(
    'Johannes 12,32',
    'Joh 12,32',
    'Und ich, wenn ich erhöht werde von der Erde, so will ich sie alle zu mir ziehen.',
  ),
};
