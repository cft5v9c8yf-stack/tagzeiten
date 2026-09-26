/**
 * Liturgical texts. Sources: Luther's Small Catechism, the Deutsche Messe,
 * Luther Bible 1912 (lightly smoothed as in the booklet), hymns before 1900.
 * No texts from Luther 2017/1984 or the modern Evangelisches Gesangbuch (rule 12).
 */
import { text, type Text, type Versicle } from './types';

export const SIGN_OF_THE_CROSS = text(['Das walte Gott Vater, Sohn und Heiliger Geist. Amen.']);

export const GLORIA = text([
  'Ehre sei dem Vater und dem Sohn und dem Heiligen Geist,',
  'wie im Anfang, so auch jetzt und alle Zeit',
  'und in Ewigkeit. Amen.',
]);

export const HALLELUJA = 'Halleluja.';
export const HALLELUJA_RUBRIC = 'In der Passionszeit entfällt das Halleluja.';

export const VERSICLE_OPEN_LIPS: Versicle = {
  v: 'Herr, tue meine Lippen auf,',
  a: 'daß mein Mund deinen Ruhm verkündige.',
};
export const VERSICLE_HELP: Versicle = {
  v: 'O Gott, komm mir zu Hilfe.',
  a: 'Herr, eile, mir zu helfen.',
};
export const KYRIE: Versicle = { v: 'Kyrie eleison.', a: 'Christe eleison. Kyrie eleison.' };
export const BENEDICAMUS: Versicle = { v: 'Lasset uns preisen den Herrn.', a: 'Gott sei ewiglich Dank.' };
export const AFTER_READING = 'Gott sei ewiglich Dank.';

/* ------------------------------------------------ Lord's Prayer and Creed */

/** Ecumenical wording as prayed in the congregations (default). */
export const LORDS_PRAYER_ECUMENICAL = text([
  'Vater unser im Himmel.',
  'Geheiligt werde dein Name.',
  'Dein Reich komme.',
  'Dein Wille geschehe, wie im Himmel, so auf Erden.',
  'Unser tägliches Brot gib uns heute.',
  'Und vergib uns unsere Schuld,',
  'wie auch wir vergeben unsern Schuldigern.',
  'Und führe uns nicht in Versuchung,',
  'sondern erlöse uns von dem Bösen.',
  'Denn dein ist das Reich und die Kraft',
  'und die Herrlichkeit in Ewigkeit. Amen.',
]);

/** Luther's wording from the Small Catechism. */
export const LORDS_PRAYER_LUTHER = text([
  'Vater unser, der du bist im Himmel.',
  'Geheiliget werde dein Name.',
  'Dein Reich komme.',
  'Dein Wille geschehe wie im Himmel, also auch auf Erden.',
  'Unser täglich Brot gib uns heute.',
  'Und vergib uns unsere Schuld,',
  'als wir vergeben unsern Schuldigern.',
  'Und führe uns nicht in Versuchung,',
  'sondern erlöse uns von dem Übel.',
  'Denn dein ist das Reich und die Kraft',
  'und die Herrlichkeit in Ewigkeit. Amen.',
]);

export const CREED_ECUMENICAL = text([
  'Ich glaube an Gott, den Vater, den Allmächtigen,',
  'Schöpfer des Himmels und der Erde.',
  'Und an Jesus Christus,',
  'seinen eingeborenen Sohn, unsern Herrn,',
  'empfangen durch den Heiligen Geist,',
  'geboren von der Jungfrau Maria,',
  'gelitten unter Pontius Pilatus,',
  'gekreuzigt, gestorben und begraben,',
  'hinabgestiegen in das Reich des Todes,',
  'am dritten Tage auferstanden von den Toten,',
  'aufgefahren in den Himmel;',
  'er sitzt zur Rechten Gottes, des allmächtigen Vaters;',
  'von dort wird er kommen, zu richten die Lebenden und die Toten.',
  'Ich glaube an den Heiligen Geist,',
  'die heilige christliche Kirche,',
  'Gemeinschaft der Heiligen,',
  'Vergebung der Sünden,',
  'Auferstehung der Toten',
  'und das ewige Leben. Amen.',
]);

export const CREED_LUTHER = text([
  'Ich glaube an Gott, den Vater, den Allmächtigen,',
  'Schöpfer Himmels und der Erde.',
  'Und an Jesum Christum, seinen eingebornen Sohn, unsern Herrn,',
  'der empfangen ist von dem Heiligen Geist,',
  'geboren von der Jungfrau Maria,',
  'gelitten unter Pontio Pilato,',
  'gekreuzigt, gestorben und begraben,',
  'niedergefahren zur Hölle,',
  'am dritten Tage wieder auferstanden von den Toten,',
  'aufgefahren gen Himmel,',
  'sitzend zur Rechten Gottes, des allmächtigen Vaters,',
  'von dannen er kommen wird, zu richten die Lebendigen und die Toten.',
  'Ich glaube an den Heiligen Geist,',
  'eine heilige christliche Kirche,',
  'die Gemeinde der Heiligen,',
  'Vergebung der Sünden,',
  'Auferstehung des Fleisches',
  'und ein ewiges Leben. Amen.',
]);

/* ------------------------------------------------ Luther's blessings */

export const MORNING_BLESSING = text(
  [
    'Ich danke dir, mein himmlischer Vater,',
    'durch Jesus Christus, deinen lieben Sohn,',
    'daß du mich diese Nacht vor allem Schaden und Gefahr behütet hast,',
    'und bitte dich, du wollest mich diesen Tag auch behüten',
    'vor Sünden und allem Übel,',
    'daß dir all mein Tun und Leben gefalle.',
    'Denn ich befehle mich, meinen Leib und Seele und alles in deine Hände.',
    'Dein heiliger Engel sei mit mir,',
    'daß der böse Feind keine Macht an mir finde. Amen.',
  ],
  { source: 'Luther, Kleiner Katechismus' },
);

export const EVENING_BLESSING = text(
  [
    'Ich danke dir, mein himmlischer Vater,',
    'durch Jesus Christus, deinen lieben Sohn,',
    'daß du mich diesen Tag gnädiglich behütet hast,',
    'und bitte dich, du wollest mir vergeben alle meine Sünde,',
    'wo ich Unrecht getan habe,',
    'und mich diese Nacht auch gnädiglich behüten.',
    'Denn ich befehle mich, meinen Leib und Seele und alles in deine Hände.',
    'Dein heiliger Engel sei mit mir,',
    'daß der böse Feind keine Macht an mir finde. Amen.',
  ],
  { source: 'Luther, Kleiner Katechismus' },
);

export const BAPTISM_REMEMBRANCE = text([
  'Ich bin getauft auf den Namen des Vaters und des Sohnes',
  'und des Heiligen Geistes.',
  'Der alte Adam in mir soll durch tägliche Reue und Buße ersäuft werden',
  'und sterben mit allen Sünden und bösen Lüsten,',
  'und täglich soll wieder herauskommen und auferstehen der neue Mensch,',
  'der in Gerechtigkeit und Reinheit vor Gott ewiglich lebe. Amen.',
]);

/* ------------------------------------------------ hymns (before 1900) */

export const HYMN_MORNING = text(
  [
    'Die helle Sonn leucht jetzt herfür,',
    'fröhlich vom Schlaf aufstehen wir;',
    'Gott Lob, der uns in dieser Nacht',
    'behüt hat vor des Teufels Macht.',
  ],
  { source: 'Nikolaus Herman, 1560' },
);
export const HYMN_MORNING_ALTERNATIVES =
  'Oder: Aus meines Herzens Grunde (Georg Niege, 1592), oder: Wach auf, mein Herz, und singe (Paul Gerhardt, 1647).';

export const HYMN_EVENING = text(
  [
    'Christe, du bist der helle Tag,',
    'vor dir die Nacht nicht bleiben mag;',
    'du leuchtest uns vom Vater her',
    'und bist des Lichtes Prediger.',
    '',
    'Ach lieber Herr, behüte uns',
    'in dieser Nacht vor allem Bös,',
    'laß uns in dir ruhen fein',
    'und vor dem Feind behütet sein.',
  ],
  { source: 'Erasmus Alber, 1556' },
);
export const HYMN_EVENING_ALTERNATIVES = 'Oder: Nun ruhen alle Wälder (Paul Gerhardt, 1647), Str. 1, 8 und 9.';

/* ------------------------------------------------ canticles */

export const BENEDICTUS_ANTIPHON = 'Gelobt sei der Herr, der Gott Israels.';
export const BENEDICTUS = text(
  [
    'Gelobt sei der Herr, der Gott Israels,',
    'denn er hat besucht und erlöst sein Volk',
    'und hat uns aufgerichtet ein Horn des Heils',
    'in dem Hause seines Dieners David,',
    'wie er vorzeiten geredet hat',
    'durch den Mund seiner heiligen Propheten:',
    'daß er uns errettete von unsern Feinden',
    'und von der Hand aller, die uns hassen,',
    'und Barmherzigkeit erzeigte unsern Vätern',
    'und gedächte an seinen heiligen Bund,',
    'daß wir, erlöst aus der Hand unserer Feinde,',
    'ihm dienten ohne Furcht unser Leben lang',
    'in Heiligkeit und Gerechtigkeit, die ihm gefällig ist.',
    'Und du, Kindlein, wirst ein Prophet des Höchsten heißen;',
    'du wirst vor dem Herrn hergehen, daß du seinen Weg bereitest',
    'und Erkenntnis des Heils gebest seinem Volk,',
    'die da ist in Vergebung ihrer Sünden,',
    'durch die herzliche Barmherzigkeit unseres Gottes,',
    'durch welche uns besucht hat der Aufgang aus der Höhe,',
    'auf daß er erscheine denen, die da sitzen in Finsternis',
    'und Schatten des Todes,',
    'und richte unsere Füße auf den Weg des Friedens.',
  ],
  { ref: 'Lukas 1,68–79' },
);

export const MAGNIFICAT_ANTIPHON = 'Meine Seele erhebt den Herrn.';
export const MAGNIFICAT = text(
  [
    'Meine Seele erhebt den Herrn,',
    'und mein Geist freuet sich Gottes, meines Heilandes;',
    'denn er hat die Niedrigkeit seiner Magd angesehen.',
    'Siehe, von nun an werden mich selig preisen alle Kindeskinder.',
    'Denn er hat große Dinge an mir getan,',
    'der da mächtig ist und dessen Name heilig ist.',
    'Und seine Barmherzigkeit währet immer für und für',
    'bei denen, die ihn fürchten.',
    'Er übet Gewalt mit seinem Arm',
    'und zerstreut, die hoffärtig sind in ihres Herzens Sinn.',
    'Er stößt die Gewaltigen vom Stuhl',
    'und erhebt die Niedrigen.',
    'Die Hungrigen füllt er mit Gütern',
    'und läßt die Reichen leer.',
    'Er denkt der Barmherzigkeit und hilft seinem Diener Israel auf,',
    'wie er geredet hat unsern Vätern, Abraham und seinem Samen ewiglich.',
  ],
  { ref: 'Lukas 1,46–55' },
);

export const NUNC_DIMITTIS = text(
  [
    'Herr, nun lässest du deinen Diener in Frieden fahren,',
    'wie du gesagt hast;',
    'denn meine Augen haben deinen Heiland gesehen,',
    'welchen du bereitet hast vor allen Völkern,',
    'ein Licht, zu erleuchten die Heiden,',
    'und zum Preis deines Volkes Israel.',
  ],
  { ref: 'Lukas 2,29–32' },
);

/* ------------------------------------------------ collects and blessing */

export const COLLECT_MORNING = text([
  'Herr Gott, himmlischer Vater,',
  'der du uns diesen Tag geschenkt hast:',
  'Wir bitten dich, regiere uns durch deinen Heiligen Geist,',
  'daß wir in unserem Beruf treu seien,',
  'unserm Nächsten dienen',
  'und nichts tun, was dir mißfällt,',
  'durch Jesus Christus, deinen Sohn, unsern Herrn. Amen.',
]);

export const COLLECT_EVENING = text([
  'Herr Gott, himmlischer Vater,',
  'der du die Nacht gemacht hast, daß der Mensch ruhe:',
  'Wir bitten dich, vergib uns, was wir heute gefehlt haben,',
  'behüte uns diese Nacht',
  'und laß uns morgen fröhlich aufstehen zu deinem Dienst,',
  'durch Jesus Christus, deinen Sohn, unsern Herrn. Amen.',
]);

export const BLESSING: Versicle = {
  v: 'Es segne und behüte uns der allmächtige und barmherzige Gott, Vater, Sohn und Heiliger Geist.',
  a: 'Amen.',
};

/* ------------------------------------------------ the Word */

export const PRAYER_BEFORE_READING = text(['Öffne mir die Augen,', 'daß ich sehe die Wunder an deinem Gesetz.'], {
  ref: 'Psalm 119,18',
});

export const PRAYER_AFTER_READING = text(
  ['Herr, du hast geredet.', 'Laß dein Wort nicht leer zurückkommen,', 'sondern tun, wozu du es gesandt hast. Amen.'],
  { ref: 'nach Jesaja 55,11' },
);

export const SILENCE = text(['Sei stille dem HERRN und warte auf ihn.'], { ref: 'Psalm 37,7' });

/* ------------------------------------------------ confession and absolution */

export const GENERAL_CONFESSION = text([
  'Ich armer, elender Sünder bekenne dir alle meine Sünde und Missetat,',
  'die ich begangen habe mit Gedanken, Worten und Werken,',
  'womit ich dich erzürnt und deine Strafe verdient habe.',
  'Sie sind mir leid, und ich bitte um Gnade.',
  'Und was ich nicht erkenne, das erkennst du:',
  'vergib mir auch das, um deines Sohnes Jesu Christi willen.',
]);

/** Word of forgiveness after the evening examination (rule 1). */
export const ABSOLUTION_EVENING = text(
  [
    'So wir aber unsere Sünde bekennen, so ist er treu und gerecht,',
    'daß er uns die Sünde vergibt und reinigt uns von aller Untugend.',
  ],
  { ref: '1. Johannes 1,9' },
);

/**
 * Word of forgiveness after the confession within the fourfold wreath (rule 1).
 * Not in the prototype; added so that no confession stands without absolution.
 */
export const ABSOLUTION_WREATH = text(
  [
    'Er handelt nicht mit uns nach unsern Sünden',
    'und vergilt uns nicht nach unsrer Missetat.',
    'So ferne der Morgen ist vom Abend,',
    'läßt er unsre Übertretungen von uns sein.',
  ],
  { ref: 'Psalm 103,10.12' },
);

/* ------------------------------------------------ table prayers */

export const TABLE_PRAYER_BEFORE = {
  verse: text(
    [
      'Aller Augen warten auf dich, HERR,',
      'und du gibst ihnen ihre Speise zu seiner Zeit.',
      'Du tust deine milde Hand auf',
      'und erfüllest alles, was lebet, mit Wohlgefallen.',
    ],
    { ref: 'Psalm 145,15–16' },
  ),
  rubric: 'Vaterunser, dann:',
  prayer: text([
    'Herr Gott, himmlischer Vater, segne uns und diese deine Gaben,',
    'die wir von deiner milden Güte zu uns nehmen,',
    'durch Jesum Christum, unsern Herrn. Amen.',
  ]),
};

export const TABLE_PRAYER_AFTER = {
  verse: text(['Danket dem HERRN; denn er ist freundlich,', 'und seine Güte währet ewiglich.'], {
    ref: 'Psalm 106,1',
  }),
  rubric: 'Vaterunser, dann:',
  prayer: text([
    'Wir danken dir, Herr Gott, himmlischer Vater,',
    'durch Jesum Christum, unsern Herrn, für alle deine Wohltat,',
    'der du lebest und regierest in Ewigkeit. Amen.',
  ]),
};

/* ------------------------------------------------ private confession (appendix) */

export const PRIVATE_CONFESSION = {
  intro: [
    'Eigener Termin, monatlich.',
    'Was du dir nachts selbst zusprichst, ist Gottes Wort und trägt. Aber es ist keine Absolution. Absolution kommt von außen, durch einen anderen Mund, damit du sie hören kannst und nicht prüfen mußt, ob du sie ernst genug gemeint hast.',
  ],
  order: [
    ['Rhythmus', 'Monatlich, terminiert. Nicht nach Bedarfslage des Gewissens, sonst kommt sie nie. Zusätzlich, wenn eine bestimmte Sache dich drückt.'],
    ['Beichtvater', 'Ein Ältester deines Vertrauens, ein befreundeter Prediger oder ein lutherischer Pfarrer vor Ort, der Beichte hält. Jakobus 5,16 trägt das auch dort, wo das Amt anders geordnet ist.'],
    ['Vorbereitung', 'Das Nachtgebet liefert das Material über den Monat – die Prüfung, nicht die Rückschau. Nicht alles aufzählen; Luther sagt ausdrücklich, das könne niemand. Nur, was dich wirklich drückt.'],
  ] as const,
  request: text([
    'Lieber Bruder, ich bitte dich, meine Beichte zu hören',
    'und mir die Vergebung zuzusprechen um Gottes willen.',
  ]),
  confession: text([
    'Ich armer Sünder bekenne mich vor Gott schuldig aller Sünden.',
    'Insonderheit aber bekenne ich vor dir, daß ich …',
  ]),
  confessionRubric: 'Hier das Konkrete. Nach dem Stand, nicht nach der Stimmung.',
  confessionEnd: text(['Das ist mir leid, und ich bitte um Gnade.', 'Ich will mich bessern.']),
  absolution: text([
    'Gott sei dir gnädig und stärke deinen Glauben. Amen.',
    'Glaubst du, daß meine Vergebung Gottes Vergebung sei?',
    '– Ja, ich glaube es.',
    'Wie du glaubst, so geschehe dir.',
    'Und auf Befehl unseres Herrn Jesu Christi vergebe ich dir deine Sünden',
    'im Namen des Vaters und des Sohnes und des Heiligen Geistes. Amen.',
    'Gehe hin in Frieden.',
  ]),
  after:
    'Nicht nachprüfen, ob es gewirkt hat. Das Wort steht, unabhängig von deinem Gefühl. Wenn Zweifel kommen, ist die Antwort nicht neue Prüfung, sondern das Taufgedächtnis.',
};

export type { Text, Versicle };
