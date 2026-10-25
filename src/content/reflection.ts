/**
 * The questions of the Reflexion in the Gebetskammer: a prompt to pray and write over, in the
 * first person. They are only an Anregung; what is written is kept as an ordinary entry.
 */
export interface ReflectionCard {
  id: 'ground' | 'stocktaking' | 'weekend';
  title: string;
  /** Paragraphs shown above the field. */
  paragraphs: readonly string[];
  /** Rule 9: a card about sin has no field. */
  field: boolean;
}

export const REFLECTION_CARDS: readonly ReflectionCard[] = [
  {
    id: 'ground',
    title: 'Wo hat der Feind an Boden gewonnen?',
    paragraphs: [
      'Ich denke in dieser Woche ernsthaft über diese Frage nach. Welche gewohnheitsmäßige Sünde kehrt immer wieder zurück? Wo haben Zorn, Begierde, Ablenkung, Groll, Ungeduld oder Verzweiflung Fuß gefasst? Wo habe ich etwas in meinem Leben einfach hingenommen, das eigentlich bekämpft werden sollte?',
    ],
    field: false,
  },
  {
    id: 'stocktaking',
    title: 'Bestandsaufnahme',
    paragraphs: [
      'Eine ehrliche Bestandsaufnahme. Wie läuft es mit den Lesungen? Bete ich die Psalmen? Wie gelingt mir mein konkretes Fasten? Treibe ich Sport? Habe ich das eucharistische Fasten eingehalten? Diese Disziplinen sind keine Auszeichnungen. Sie sind Hilfsmittel, um den Körper zu trainieren und meine Aufmerksamkeit auf Christus zu richten.',
    ],
    field: true,
  },
  {
    id: 'weekend',
    title: 'Zum Ende der Woche',
    paragraphs: [
      'Zum Ende einer weiteren Woche frage ich mich, was Christus in mir bewirkt. Bin ich beständiger im Gebet? Höre ich aufmerksamer auf die Heilige Schrift? Bin ich geduldiger mit meiner Familie? Bin ich großzügiger? Hilfsbereiter im Dienen? Eifrig zu vergeben? Der Maßstab dieser Zeit ist nicht allein, wie viel ich abgelegt habe. Das Ziel ist, dass dort, wo einst Dunkelheit herrschte, das Leben Christi immer mehr Raum einnimmt.',
    ],
    field: true,
  },
];
