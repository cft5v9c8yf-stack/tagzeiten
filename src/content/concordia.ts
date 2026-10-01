/**
 * The Book of Concord (1580): what it is and what it contains, in our own
 * words. Parts already in the app link to their page.
 */

export const CONCORDIA_INTRO: readonly string[] = [
  'Das Konkordienbuch ist die Sammlung der Bekenntnisschriften der lutherischen Kirche. Es erschien am 25. Juni 1580 in Dresden auf Deutsch, genau fünfzig Jahre nach der Übergabe der Augsburgischen Konfession. Die maßgebliche lateinische Ausgabe folgte 1584 in Leipzig.',
  'Nach Luthers Tod stritten die lutherischen Theologen jahrzehntelang heftig um die Lehre: um Mitteldinge im Gottesdienst, um den freien Willen, um Gesetz und Evangelium, um gute Werke. Der Streit gefährdete auch den Zusammenhalt der lutherischen Länder. Frühere Sammlungen der Bekenntnisse, darunter eine von Melanchthon (1558), fanden keine allgemeine Anerkennung.',
  'Darum schrieb man zuerst ein neues Bekenntnis, das die Augsburgische Konfession in den strittigen Fragen auslegt: die Konkordienformel von 1577. Die Hauptarbeit daran taten Jakob Andreae, Martin Chemnitz und Nikolaus Selnecker. Sie legte zugleich fest, welche Schriften als Bekenntnis gelten. Diese wurden dann mit einer gemeinsamen Vorrede zum Konkordienbuch zusammengefasst und von Fürsten, Städten und Pfarrern unterschrieben.',
  'Das Konkordienbuch stellt sich nicht neben die Heilige Schrift. Die Schrift allein ist Richtschnur aller Lehre; die Bekenntnisse bezeugen, wie die Kirche sie verstanden hat und versteht.',
];

export interface ConcordiaPart {
  title: string;
  line: string;
  /** Route within the app, where the text is at hand. */
  to?: string;
}

export const CONCORDIA_CONTENTS: readonly { heading: string; parts: readonly ConcordiaPart[] }[] = [
  {
    heading: 'Die drei altkirchlichen Bekenntnisse',
    parts: [{ title: 'Apostolikum, Nizänum, Athanasianum', line: 'Die Bekenntnisse der ganzen Christenheit', to: '/katechismus/bekenntnisse' }],
  },
  {
    heading: 'Die lutherischen Bekenntnisse',
    parts: [
      { title: 'Die Augsburgische Konfession', line: 'Vor Kaiser und Reich bekannt, 1530', to: '/katechismus/augsburgische-konfession' },
      { title: 'Die Apologie der Augsburgischen Konfession', line: 'Melanchthons Verteidigung, 1531' },
      { title: 'Die Schmalkaldischen Artikel', line: 'Luther, 1537', to: '/katechismus/schmalkaldische-artikel' },
      { title: 'Von der Gewalt und Obrigkeit des Papstes', line: 'Melanchthon, 1537' },
      { title: 'Der Kleine Katechismus', line: 'Die Hauptstücke, hier in der Lehre zum Auswendiglernen', to: '/katechismus/commandments' },
      { title: 'Der Große Katechismus', line: 'Luthers Auslegung der Hauptstücke, 1529', to: '/katechismus/grosser-katechismus' },
      { title: 'Die Konkordienformel', line: 'Kurze Fassung und ausführliche Erklärung, 1577' },
    ],
  },
];

export const CONCORDIA_NOTE =
  'Wortlaut in der App nach der Ausgabe St. Louis 1881, nach dem Urtext von 1580. Die übrigen Schriften folgen, sobald die Seiten vorliegen.';
