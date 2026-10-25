/**
 * The questions of the Reflexion in the Gebetskammer: a prompt to pray and write over, in the
 * first person. They are only an Anregung; what is written is kept as an ordinary entry.
 * Here, and only here, sin and weakness may be written down (exception to rule 9, 25.10.2026), to
 * see how the Holy Spirit changes; the question about sin ends in the word of forgiveness (rule 1).
 */
export interface ReflectionCard {
  id: 'ground' | 'stocktaking' | 'weekend';
  title: string;
  /** Paragraphs shown above the field. */
  paragraphs: readonly string[];
  /** The word of forgiveness under it (rule 1): the card asks about sin. */
  comfort: boolean;
}

export const REFLECTION_CARDS: readonly ReflectionCard[] = [
  {
    id: 'ground',
    title: 'Wo hat der Feind an Boden gewonnen?',
    paragraphs: [
      'Ich denke in dieser Woche ernsthaft über diese Frage nach. Welche gewohnheitsmäßige Sünde kehrt immer wieder zurück? Wo haben Zorn, Begierde, Ablenkung, Groll, Ungeduld oder Verzweiflung Fuß gefasst? Wo habe ich etwas in meinem Leben einfach hingenommen, das eigentlich bekämpft werden sollte?',
      'Ich bin nicht vage, sondern benenne die Sache. Ich bringe sie im Gebet vor Gott und, wenn angebracht, vor meine Brüder und Schwestern. Das Ziel ist, diese festgefahrenen Muster zu erkennen und sie durch gute, traditionelle christliche Gewohnheiten zu ersetzen. Ich kann kein Terrain verteidigen, dessen Verlust ich nicht anerkennen will.',
      'Ich untersuche also weiterhin die Schwächen, die ich zuvor erkannt habe. Welche Ausreden habe ich dafür gefunden? Welche Sünden habe ich als Stress, Persönlichkeitsmerkmal, Erschöpfung oder etwas, mit dem ich einfach „zu kämpfen“ habe, umbenannt? Ich bitte Gott um Unterscheidungsvermögen. Der Feind ist besonders wirksam, wenn wir die Sünde nicht mehr beim Namen nennen.',
    ],
    comfort: true,
  },
  {
    id: 'stocktaking',
    title: 'Bestandsaufnahme',
    paragraphs: [
      'Heute ist wieder Fastentag und eine gute Gelegenheit für eine ehrliche Bestandsaufnahme. Wie läuft es mit den Lesungen? Bete ich die Psalmen? Wie gelingt mir mein konkretes Fasten? Treibe ich Sport? Habe ich das eucharistische Fasten eingehalten? Diese Disziplinen sind keine Auszeichnungen. Sie sind Hilfsmittel, um den Körper zu trainieren und meine Aufmerksamkeit auf Christus zu richten.',
      'Falls ich vom Weg abgekommen bin, korrigiere ich meinen Kurs. Ich gebe nicht gleich die ganze Disziplin auf, nur weil ich ein- oder zweimal gescheitert bin. Bis zum Michaelistag sind es noch Wochen. Ich kehre zum Plan zurück, bitte meine Brüder um Hilfe, wenn nötig, und mache weiter.',
    ],
    comfort: false,
  },
  {
    id: 'weekend',
    title: 'Zum Ende der Woche',
    paragraphs: [
      'Zum Ende einer weiteren Woche frage ich mich, was Christus in mir bewirkt. Bin ich beständiger im Gebet? Höre ich aufmerksamer auf die Heilige Schrift? Bin ich geduldiger mit meiner Familie? Bin ich großzügiger? Hilfsbereiter im Dienen? Eifrig zu vergeben? Der Maßstab dieser Zeit ist nicht allein, wie viel ich abgelegt habe. Das Ziel ist, dass dort, wo einst Dunkelheit herrschte, das Leben Christi immer mehr Raum einnimmt.',
    ],
    comfort: false,
  },
];
