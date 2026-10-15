import { q, type LoeheChapter } from './types';

/** Questions 1–16: on the catechism as a whole. */
export const LOEHE_INTRO: LoeheChapter = {
  pages: 'S. 35–37',
  lessons: [
    {
      lesson: 'I',
      heading: 'Einleitende Fragen zum Catechismus',
      items: [
        q(1, 'Was für ein Büchlein hast du hier in deiner Hand?', 'Es ist der kleine Catechismus Dr. M. Luthers.'),
        q(2, 'Was ist ein Catechismus?', 'Ein Unterricht.'),
        q(3, 'Worin gibt dir dies Büchlein Unterricht?', 'In dem, was ich zu meiner Seelen Seligkeit wißen muß.'),
        q(4, 'Wer hat diesen Catechismus gemacht?', 'Dr. Martin Luther.'),
        q(5, 'Wer war Dr. Martin Luther?', 'Er war ein Doctor, d. i. ein Lehrer der Gottesgelahrtheit; zu Wittenberg in Sachsen.'),
        q(6, 'Wann lebte er?', 'Vor 300 Jahren. Er ist am 10. November 1483 zu Eisleben geboren und am 18. Februar 1546 zu Eisleben gestorben.'),
        q(7, 'Du nennst dieses Büchlein den kleinen Catechismus Luthers: hat er denn mehr als einen gemacht?', 'Ja. Er hat in demselben Jahre auch einen großen Catechismus gemacht.'),
        q(8, 'In welchem Jahre hat er die beiden Catechismen gemacht?', 'Im Jahre 1529.'),
        q(9, 'Hat Dr. Martin Luther in seinen Catechismen seine eigene Weisheit ausgelegt?', 'Nein. Er hat Gottes Wort und Weisheit, wie es in der heiligen Schrift steht, kurz zusammengefaßt und in seine Catechismen niedergelegt.'),
        q(10, 'Was ist also der kleine Catechismus Dr. Martin Luthers?', 'Eine kurze Summe oder Zusammenfaßung der göttlichen Weisheit oder des Wortes Gottes.'),
        q(11, 'Hat man denn auch den kleinen Catechismus Luthers dafür gelten laßen?', 'Ja. Er ist deshalb unter die Glaubensbekenntnisse der lutherischen Kirche aufgenommen worden und seit dreihundert Jahren ein Lieblingsbüchlein der Kirche gewesen.'),
        q(12, 'Was für einen Namen hat Dr. Martin Luther seinem kleinen Catechismus gegeben?', 'Den Namen Enchiridion oder Handbüchlein.'),
        q(13, 'Warum hat er denn seinen kleinen Catechismus Handbüchlein genannt?', 'Weil ihn die Jugend immer in und bei der Hand haben soll, um ihn zu lernen.'),
        q(
          14,
          'Was gehört denn alles zum kleinen Catechismus Dr. Martin Luthers?',
          'Dazu gehört:\na. eine vortreffliche Vorrede an alle treuen frommen Pfarrherren, aus welcher man lernen kann, wie der Catechismus zu lehren und zu lernen ist;\nb. die sechs Hauptstücke;\nc. wie ein Hausvater sein Gesinde soll lehren, morgens und abends sich segnen;\nd. wie ein Hausvater sein Gesinde soll lehren, das Benedicite und Gratias d. i. das Gebet vor und nach Tisch sprechen;\ne. die Haustafel etlicher Sprüche für allerlei Stände;\nf. endlich als Anhang auch die christlichen Fragstücke mit ihren Antworten für die, welche zum Sacrament gehen wollen.',
        ),
        q(15, 'Woran liegt aber im Catechismus am meisten?', 'An den sechs Hauptstücken.'),
        q(
          16,
          'Wovon handeln diese?',
          'Das erste von den heiligen zehen Geboten;\ndas zweite von dem heiligen christlichen Glauben;\ndas dritte von dem heiligen Vater unser;\ndas vierte vom Sacrament der heiligen Taufe;\ndas fünfte vom Beruf und Amt des Worts oder der Schlüßel;\ndas sechste vom Sacrament des Altars.',
        ),
      ],
    },
  ],
};

/** Questions 365–370: on the four last chief parts, the means of grace. */
export const LOEHE_MEANS_OF_GRACE: LoeheChapter = {
  pages: 'S. 75',
  lessons: [
    {
      lesson: 'XIX',
      heading: 'Einleitende Fragen zu den vier letzten Hauptstücken',
      items: [
        q(365, 'Wovon handeln die vier letzten Hauptstücke?', 'Von den Gnadenmitteln.'),
        q(
          366,
          'Wie vielerlei sind diese?',
          'Zweierlei: 1. Mittel, durch welche Gott die Gnade darreicht; 2. Mittel, durch welche der Mensch die von Gott dargereichte Gnade sucht und ergreift.',
          { note: 'Anm. Gleichwie einem Bettler das Almosen nur dadurch zu Theil wird, daß er seine Nehmershand nach der Gabe ausstreckt, der Reiche aber seine Gebershand mit der Gabe entgegenstreckt; so gibt es auch zum Empfang der göttlichen Gaben Nehmers- und Gebershände.' },
        ),
        q(367, 'Welches ist nun das menschliche Gnadenmittel oder die Nehmershand?', 'Das gläubige Gebet, von welchem das dritte Hauptstück handelt.'),
        q(368, 'Und welches sind die göttlichen Gnadenmittel, die Gebershände?', 'Wort und Sacrament.'),
        q(369, 'Welche Hauptstücke handeln insonderheit von den Sacramenten?', 'Das vierte und sechste.'),
        q(370, 'Und das fünfte?', 'Handelt vom Worte Gottes, der Absolution oder dem Evangelium von Vergebung der Sünden.'),
      ],
    },
  ],
};
