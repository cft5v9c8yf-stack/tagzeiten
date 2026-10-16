/**
 * Slips of the text recognition in the transcription, mended word for word.
 * Each one was looked at in its sentence before it was taken in; words that
 * are right in their place stay ("Lehen", "kannten", "worum", Luther's "etwo",
 * Zwingli's "ouch", Latin "mari", "mare", "tactus").
 *
 * WORDS: whole words, wherever they stand. PHRASES: a slip only in that place.
 */
export const WORDS = {
  // German
  tlie: 'die', uicht: 'nicht', nieht: 'nicht', aüch: 'auch', Aüch: 'Auch', anch: 'auch', dnrch: 'durch',
  sondem: 'sondern', öder: 'oder', Cliristi: 'Christi', Menscheu: 'Menschen', fiir: 'für', Lufher: 'Luther',
  haberi: 'haben', Natür: 'Natur', iiber: 'über', nian: 'man', göttlicheu: 'göttlichen', Christa: 'Christo',
  Christeu: 'Christen', Theolagen: 'Theologen', Vergebüng: 'Vergebung', Vergehung: 'Vergebung', seiriem: 'seinem',
  Theölogie: 'Theologie', hezug: 'bezug', bezüg: 'bezug', stebt: 'steht', Ausdrück: 'Ausdruck',
  Konkordienformcl: 'Konkordienformel', modemen: 'modernen', dabin: 'dahin', JEsü: 'JEsu', Iediglich: 'lediglich',
  sönst: 'sonst', rörnische: 'römische', Synergismüs: 'Synergismus', fiigt: 'fügt', genüg: 'genug',
  zügeschrieben: 'zugeschrieben', öffenbar: 'offenbar', züstande: 'zustande', alttestainentlichen: 'alttestamentlichen',
  Geisteswirküng: 'Geisteswirkung', züschreibt: 'zuschreibt', öffentIich: 'öffentlich', zukonime: 'zukomme',
  zükomme: 'zukomme', zügeben: 'zugeben', Missonrisynode: 'Missourisynode', dargestcllt: 'dargestellt',
  Schrnalkaldischen: 'Schmalkaldischen', Könkordienf: 'Konkordienf', Schrnid: 'Schmid', Nichtgebraüch: 'Nichtgebrauch',
  hinzügefügt: 'hinzugefügt', beschlössen: 'beschlossen', Banmgarten: 'Baumgarten', MitteIn: 'Mitteln',
  Kirchengerneinschaften: 'Kirchengemeinschaften', Glaübensbewußtsein: 'Glaubensbewußtsein', ansgegeben: 'ausgegeben',
  diesclbigen: 'dieselbigen', heransgegeben: 'herausgegeben', Kirchcnzeitung: 'Kirchenzeitung',
  verantwörtlich: 'verantwortlich', Gottmerischen: 'Gottmenschen', Umdeütung: 'Umdeutung',
  Schlüsselbnrg: 'Schlüsselburg', Pfingsttagc: 'Pfingsttage', Natürengemeinschaft: 'Naturengemeinschaft',
  Missonri: 'Missouri', Gründlage: 'Grundlage', Gewöhnheit: 'Gewohnheit', Wart: 'Wort', foll: 'soll', Marin: 'Maria',
  Güten: 'Guten', Kürz: 'Kurz', kürz: 'kurz', babe: 'habe', vorausgeseben: 'vorausgesehen',
  // The long s (ſ) read as f.
  find: 'sind', feinem: 'seinem', fei: 'sei', feien: 'seien', feines: 'seines', feiten: 'seiten', fetzen: 'setzen',
  fich: 'sich', fo: 'so', ift: 'ist', ufw: 'usw', fie: 'sie', diefe: 'diese', Ebenfo: 'Ebenso', Weife: 'Weise',
  unfern: 'unsern', Unfern: 'Unsern', Waffer: 'Wasser', feligmachende: 'seligmachende', feligmachenden: 'seligmachenden',
  ausfagt: 'aussagt', zugefchrieben: 'zugeschrieben', hingewiefen: 'hingewiesen', feftzuhalten: 'festzuhalten',
  zuzufchreiben: 'zuzuschreiben', chriftl: 'christl', Schriftausfagen: 'Schriftaussagen', hinzuweifen: 'hinzuweisen',
  fasfen: 'fassen', Schuldfchrift: 'Schuldschrift', fiehet: 'siehet', weift: 'weist', Widerfacher: 'Widersacher',
  Thomafius: 'Thomasius', Apoft: 'Apost', nachgewiefen: 'nachgewiesen', JEfus: 'JEsus', Privatabfolution: 'Privatabsolution',
  Pf: 'Ps', Ies: 'Jes', uwd: 'und',
  // Fraktur letters confused: b/d, b/h, s/f, M/W, B/V, n/u, ä/a and others (second pass).
  ber: 'der', bie: 'die', ünd: 'und', uud: 'und', nnd: 'und', lst: 'ist', nickt: 'nicht', baß: 'daß', dass: 'daß',
  vou: 'von', vön: 'von', auck: 'auch', bem: 'dem', äus: 'aus', Mort: 'Wort', sür: 'für', nnr: 'nur', sci: 'sei',
  Ehristus: 'Christus', Nätur: 'Natur', sägt: 'sagt', Gnabe: 'Gnade', Helligen: 'Heiligen', Jöh: 'Joh',
  Bergebung: 'Vergebung', nsw: 'usw', Morte: 'Worte', Unb: 'Und', Menn: 'Wenn', Kar: 'Kor', Kör: 'Kor', Bgl: 'Vgl',
  Meise: 'Weise', Mas: 'Was', gläuben: 'glauben', bann: 'dann', Eigenschäften: 'Eigenschaften',
  Konkordiensormel: 'Konkordienformel', mackt: 'macht', Dogmätik: 'Dogmatik', uuio: 'unio', vei: 'vel',
  Versühnung: 'Versöhnung', Fäll: 'Fall', Bon: 'Von', baran: 'daran', ausser: 'außer', Teii: 'Teil', bazu: 'dazu',
  vorhänden: 'vorhanden', Ini: 'Im', Annähme: 'Annahme', Ais: 'Als', qna: 'qua', qno: 'quo', sesthalten: 'festhalten',
  ean: 'can', Hosmann: 'Hofmann', Hosmanns: 'Hofmanns', gratiäe: 'gratiae', ausgesägt: 'ausgesagt',
  Schristwort: 'Schriftwort', ete: 'etc', sicht: 'sieht', Svstema: 'Systema', sestgehalten: 'festgehalten',
  geosfenbart: 'geoffenbart', geosfenbarten: 'geoffenbarten', dist: 'bist', Sündensall: 'Sündenfall',
  verlaßen: 'verlassen', überäll: 'überall', auss: 'aufs', gewältig: 'gewaltig', nna: 'una', inkusa: 'infusa',
  kläre: 'klare', verdämmt: 'verdammt', teilhastig: 'teilhaftig', aussen: 'außen', Selbstbewusstsein: 'Selbstbewußtsein',
  Gäbe: 'Gabe', Rechtsertigungslehre: 'Rechtfertigungslehre', Kops: 'Kopf', Zentralsragen: 'Zentralfragen',
  kavor: 'favor', schärst: 'schärft', Konkordiens: 'Konkordienf', Holtzmänn: 'Holtzmann', Briese: 'Briefe',
  Soziniäner: 'Sozinianer', Mäße: 'Maße', zugeständen: 'zugestanden', bedars: 'bedarf', korma: 'forma',
  gesallenen: 'gefallenen', Bries: 'Brief', wahrhast: 'wahrhaft', Baumgärten: 'Baumgarten', iustik: 'iustif',
  fleri: 'fieri', sinde: 'finde', Looss: 'Loofs', iocus: 'locus', Alleinwirksämkeit: 'Alleinwirksamkeit',
  unbegreislichen: 'unbegreiflichen', Gotteskindschast: 'Gotteskindschaft', Täuser: 'Täufer', Umsang: 'Umfang',
  rebeten: 'redeten', Katio: 'Ratio', iustiflcatione: 'iustificatione',
  // Latin
  rion: 'non', qnae: 'quae', snnt: 'sunt', nnio: 'unio', viearia: 'vicaria', qnia: 'quia', genns: 'genus',
  tarnen: 'tamen', tarn: 'tam', lnst: 'Inst', uuiversalis: 'universalis', cansa: 'causa', liomo: 'homo',
  institia: 'iustitia', volnntas: 'voluntas', voluutas: 'voluntas', liominis: 'hominis', peccatnm: 'peccatum',
  liabet: 'habet', liumanam: 'humanam', maiestatieum: 'maiestaticum', liomines: 'homines', pöst: 'post', lnth: 'luth',
  usns: 'usus', aliqnid: 'aliquid', Saneto: 'Sancto', doctriuae: 'doctrinae', liac: 'hac', statn: 'statu',
  idiomatnm: 'idiomatum', dieit: 'dicit', idioinatum: 'idiomatum', Chiliasmns: 'Chiliasmus',
  communieatio: 'communicatio', commuuio: 'communio', liabeat: 'habeat', evangelinm: 'evangelium', modns: 'modus',
  iudieium: 'iudicium', exinanitiouis: 'exinanitionis', terminns: 'terminus', loeus: 'locus', onini: 'omni',
  coutroversiae: 'controversiae', voee: 'voce', motns: 'motus', bonuin: 'bonum', sanguinein: 'sanguinem',
  nüllum: 'nullum', diviuo: 'divino', spiritnalis: 'spiritualis', aequivoee: 'aequivoce', certns: 'certus',
  dieta: 'dicta', cami: 'carni', tides: 'fides', tide: 'fide', Lüth: 'Luth',
  // English and numbers
  wlio: 'who', Snpper: 'Supper', Systematie: 'Systematic', Confessiori: 'Confession', Grod: 'God', modem: 'modern',
  XVIl: 'XVII', XXIl: 'XXII',
};

export const PHRASES = [
  // "fein", "feine", "feiner", "feinen" for "sein…" – only where it is not Luther's "fein" (fine, nicely).
  ...[
    'Wort |fein| lassen', 'unter |fein|, des Apostels', 'in |fein| göttliches Ich', 'zu |fein|, um als Geist', 'selig |fein|, ehe',
    'auch da |fein|.', 'nichts |fein| oder', 'nehme |fein| Kreuz', 'man |fein| Fundament', 'Gelegenheit, |fein| Werk',
    'gekommen |fein|.', 'in |feiner| Hand hat', 'Gott in |feiner| Majestät', 'und in |feiner| Vorrede', 'Ausgabe |feiner| Loci',
    'nach |feiner| Größe', 'und |feiner| Himmelfahrt', 'nach |feiner| Menschheit', 'bei |feiner| Kirche',
    'vor |feiner| Menschwerdung', 'in |feiner| Gesamtheit', 'in |feiner| Klugheit', 'nach |feiner| Auferstehung',
    'Überschriften |feiner| Briefe', 'und |feine| unbegreiflichen', 'für |feine| Person', 'Gottes |feine| gebührliche',
    '|feine| Reformationsgedanken', 'verläßt er |feinen| Ankergrund', 'in |feinen| Mund', 'in |feinen| Jüngern',
    'Gott |feinen| Willen',
  ].map((p) => ({ from: p.replace(/\|/g, ''), to: p.replace(/\|f([^|]*)\|/, 's$1') })),
  { from: 'in seiner in feiner Clavis', to: 'in seiner Clavis' },
  { from: 'im Men Testament', to: 'im Alten Testament' },
  // "Mer" for "Wer" and for "Aber".
  { from: 'Mer hat des HErrn Sinn', to: 'Wer hat des HErrn Sinn' },
  { from: 'Mer mich siehet', to: 'Wer mich siehet' },
  { from: 'Mer in ihm bleibet', to: 'Wer in ihm bleibet' },
  { from: 'Mer Sünde tut', to: 'Wer Sünde tut' },
  { from: 'Mer die meisten', to: 'Aber die meisten' },
  { from: 'Mer das überzeugt', to: 'Aber das überzeugt' },
  { from: 'Mer dieser Grundsatz', to: 'Aber dieser Grundsatz' },
  { from: 'Heiden ahne Evangelium', to: 'Heiden ohne Evangelium' },
  { from: 'gerechtfertigt werben', to: 'gerechtfertigt werden' },
  { from: 'Amt und Merk allein', to: 'Amt und Werk allein' },
  { from: 'nicht uni eine allgemeine', to: 'nicht um eine allgemeine' },
  { from: 'was dis Christen', to: 'was die Christen' },
  { from: 'Davi dis est', to: 'Davidis est' },
  { from: '(Kom. 2)', to: '(Röm. 2)' },
  { from: 'Jah. 17, 6', to: 'Joh. 17, 6' },
  { from: 'die Bereinigung von Gott und Mensch', to: 'die Vereinigung von Gott und Mensch' },
  { from: 'Wir aben im vorhergehenden', to: 'Wir haben im vorhergehenden' },
  { from: 'Lutt. reck., p. 234', to: 'Hutt. rediv., p. 234' },
  { from: 'humanisti-schen', to: 'humanistischen' },
  // "aus" for "auf", and a comma for the point of "scil.".
  { from: 'in bezug aus ', to: 'in bezug auf ' },
  { from: ' scil, ', to: ' scil. ' },
];

const WORD = /[A-Za-zÄÖÜäöüß]+/g;

export function mendOcr(text, log) {
  let t = text;
  for (const p of PHRASES) if (t.includes(p.from)) t = t.split(p.from).join(p.to);
  return t.replace(WORD, (w) => {
    const r = WORDS[w];
    if (r) log?.push(`${w} → ${r}`);
    return r ?? w;
  });
}
