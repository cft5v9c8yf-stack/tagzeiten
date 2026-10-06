/**
 * "Der Sonntag – eine Hilfe für das Haus": a quiet page to read in the Sunday
 * area. Text by Andreas, taken over word for word (6 October 2026); nothing to
 * tick, nothing counted (rule 4). The order of the house follows rule 18.
 */

export type GuideBlock =
  /** A quotation set apart, like the Bible quotations of the app. */
  | { kind: 'quote'; text: string; source: string }
  | { kind: 'p'; text: string }
  /** A paragraph whose bold lead-in is shown as a rubric. */
  | { kind: 'rubric'; id?: string; lead: string; text: string };

export interface GuideSection {
  id: string;
  title: string;
  blocks: readonly GuideBlock[];
}

export const SUNDAY_GUIDE_TITLE = 'Der Sonntag – eine Hilfe für das Haus';

/** Anchor of "Samstagabend: die Bereitung", the target of the hint on Saturday evening. */
export const PREPARATION_ANCHOR = 'bereitung';

export const SUNDAY_GUIDE: readonly GuideSection[] = [
  {
    id: 'woche',
    title: 'Der Sonntag macht die Woche',
    blocks: [
      {
        kind: 'quote',
        text: '„Der Sonntag macht die Woche“, sagt ein altes gutes Sprüchwort; d. h. der Segen des Sonntags und des feierlichen Gottesdienstes wirket fort durch die ganze Woche hindurch.',
        source: 'G. C. Dieffenbach, Vorwort zur Evangelischen Hausagende, 1852',
      },
      {
        kind: 'p',
        text: 'Der Sonntag steht am Anfang der Woche, nicht an ihrem Ende. Von ihm her lebt, was folgt. Nach Dieffenbach gilt zugleich das Umgekehrte: Die Andachten im Haus bereiten durch die Woche hindurch wieder auf den Sonntag vor.',
      },
      {
        kind: 'p',
        text: 'Diese Anleitung ist eine Hilfe, kein Gesetz. Gott hat den Christen keinen bestimmten Wochentag geboten. Die Kirche hat den Sonntag in Freiheit geordnet, damit die Gemeinde weiß, wann sie zusammenkommt. Gerade deshalb halten wir ihn gern: um der Liebe und des Friedens willen, und weil Gott uns an diesem Tag beschenken will.',
      },
      {
        kind: 'p',
        text: 'So hat es auch die lutherische Kirche in Amerika festgehalten. Der Missouri-Pastor Johann Kilian schrieb 1868: „Die Lutheraner feiern den Sonntag in der Freiheit des Geistes als ungebotenen Feiertag.“ Darin sah er einen Gewinn, denn so lassen sich auch die alten christlichen Feste ebenso hoch halten wie der Sonntag. Die Missouri-Synode bekannte 1932, Christen sollten den Sonntag nicht als göttliches, das Gewissen bindendes Gebot ansehen, ihn aber „um der christlichen Liebe und des Friedens willen gern halten“ (Brief Statement, Art. 41, übersetzt).',
      },
    ],
  },
  {
    id: 'wort-und-ruhe',
    title: 'Wort und Ruhe',
    blocks: [
      {
        kind: 'p',
        text: 'Luther nennt im Großen Katechismus zwei Gaben des Feiertags: leibliche Ruhe für alle, die arbeiten und dienen, und Raum für Gottes Wort. Geheiligt wird der Tag nicht durch Müßiggang, sondern durch das Wort. Darum sollen Christen eigentlich an jedem Tag Feiertag halten und „täglich mit Gottes Wort umgehen, im Herzen und Mund umtragen“ (Großer Katechismus, 3. Gebot). Am Sonntag geschieht das gemeinsam und in besonderer Weise.',
      },
      {
        kind: 'p',
        text: 'Bonhoeffer zeigt, warum die Ruhe keine fromme Leistung ist. Die Zehn Gebote kennen kein Gebot zu arbeiten, wohl aber eines, von der Arbeit zu ruhen. Die Ruhe ist das sichtbare Zeichen dafür, dass wir aus Gottes Gnade leben und nicht aus unseren Werken. Der Sonntag ist für ihn der Tag, „an dem wir Jesus Christus an uns und an den Menschen handeln lassen“ (Bonhoeffer, 1944, DBW 16).',
      },
    ],
  },
  {
    id: 'im-haus',
    title: 'Ein Sonntag im Haus',
    blocks: [
      {
        kind: 'rubric',
        id: PREPARATION_ANCHOR,
        lead: 'Samstagabend: die Bereitung.',
        text: 'Lies das Evangelium des kommenden Sonntags, allein oder mit dem ganzen Haus. Was am Sonntag nur Arbeit machen würde, erledigst du heute: Kleidung, Einkauf und, so weit es geht, das Essen. Den Abschluss bildet der Abendsegen.',
      },
      {
        kind: 'rubric',
        lead: 'Sonntagmorgen.',
        text: 'Der Morgensegen und ein Gebet für den Gottesdienst, den Prediger und die Gemeinde.',
      },
      {
        kind: 'rubric',
        lead: 'Der Gottesdienst.',
        text: 'Er ist die Mitte des Tages. Hier hören wir Gottes Wort, beten, singen und feiern das Abendmahl. Alles andere am Sonntag dient diesem Hören.',
      },
      {
        kind: 'rubric',
        lead: 'Am Tisch und am Nachmittag.',
        text: 'Sprecht über die Predigt: Was ist hängen geblieben, was hat getröstet, was hat getroffen? Frag die Kinder, was sie gehört haben, und übe mit ihnen ein Stück aus dem Katechismus.',
      },
      {
        kind: 'rubric',
        lead: 'Ruhe für das ganze Haus.',
        text: 'Die Ruhe gilt besonders denen, die sonst dienen. Für deine Frau soll der Sonntag nicht der schwerste Tag in Küche und Haushalt werden. Teilt euch, was getan werden muss, und lasst liegen, was warten kann.',
      },
      {
        kind: 'rubric',
        lead: 'Sonntagabend.',
        text: 'Der Abendsegen und der Dank für den Tag. Nimm ein Wort aus dem Evangelium oder der Predigt mit in die neue Woche.',
      },
    ],
  },
  {
    id: 'frei',
    title: 'Was frei bleibt',
    blocks: [
      {
        kind: 'p',
        text: 'Nichts davon muss abgehakt werden. Was nötig ist, darf geschehen: Kranke versorgen, Kinder trösten, dem Nachbarn helfen, gemeinsam essen und spazieren gehen. Rosenius sagt, Gott lasse für die Bedürfnisse des Tages alle Freiheit. Zugleich warnt er davor, dass der Sonntag aus lauter Nachsicht fast zum Werktag wird. Die Freiheit ist ein Geschenk, kein Freibrief.',
      },
      {
        kind: 'p',
        text: 'Und wenn ein Sonntag nicht gelingt, weil ein Kind krank ist, der Dienst in der Gemeinde alles fordert oder du einfach müde bist, ist er dennoch nicht verloren. Christus handelt an uns auch dann, wenn wir wenig geben können. Am nächsten Sonntag lädt er wieder ein.',
      },
    ],
  },
];

export const SUNDAY_GUIDE_SOURCES: readonly string[] = [
  'Martin Luther: Großer Katechismus, Auslegung des dritten Gebots (1529)',
  'Augsburger Bekenntnis, Artikel 28 (1530)',
  'Georg Christian Dieffenbach: Vorwort zur Evangelischen Hausagende (1852)',
  'Johann Kilian: Brief an Gottfried Fritschel, Serbin (Texas), 10. Februar 1868',
  'Carl Olof Rosenius: Predigt zu 2. Mose 20,8',
  'Lutherische Kirche – Missouri-Synode: Brief Statement, Artikel 41 „Of Sunday“ (1932)',
  'Dietrich Bonhoeffer: Auslegung der ersten Tafel der Zehn Gebote (1944), DBW 16, S. 670 ff.',
];
