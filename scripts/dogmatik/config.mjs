/**
 * The three volumes: source files, the doctrines (Lehrstücke) with the page
 * they begin on, as named on the title page of each volume, and titles set
 * without the "^" of the transcription (found as whole, centred lines).
 */
export const VOLUMES = [
  {
    band: 1,
    jahr: 1924,
    files: ['band1a.txt', 'band1b.txt'],
    teile: [
      { seite: 1, titel: 'Wesen und Begriff der Theologie' },
      { seite: 233, titel: 'Die Heilige Schrift' },
      { seite: 445, titel: 'Die Lehre von Gott' },
      { seite: 570, titel: 'Die Schöpfung der Welt und des Menschen' },
      { seite: 587, titel: 'Die göttliche Vorsehung', heading: 'Die göttliche Vorsehung oder die Erhaltung und Regierung der Welt.' },
      { seite: 600, titel: 'Die Engel' },
      { seite: 617, titel: 'Die Lehre vom Menschen' },
    ],
    // Slips in headings, checked against the contents of the volume.
    fixes: [
      { from: 'Die Schrift im Grundiert', to: 'Die Schrift im Grundtext' },
      { from: '4. > Zahl der Engel', to: '4. Zahl der Engel' },
    ],
    titles: [
      'Die Heilige Schrift.',
      'Die Lehre von Gott.',
      'Einwände gegen die göttliche Providenz.',
      'Causae Peccati Actualis intra Hominem.',
    ],
  },
  {
    band: 2,
    jahr: 1917,
    files: ['band2a.txt', 'band2b.txt'],
    teile: [
      { seite: 1, titel: 'Die seligmachende Gnade Gottes' },
      { seite: 56, titel: 'Die Lehre von Christo' },
      { seite: 473, titel: 'Die Aneignung des Heils' },
      { seite: 503, titel: 'Der seligmachende Glaube' },
      { seite: 542, titel: 'Die Entstehung des Glaubens', heading: 'Die Entstehung des Glaubens an das Evangelium oder die Lehre von der Bekehrung.' },
      { seite: 606, titel: 'Die Rechtfertigung durch den Glauben' },
    ],
    // Notes of the transcription that the general rule cannot take out (a bracket in a bracket, a bracket closed by a parenthesis).
    // In the source, before it is read: two notes run together on page 301.
    rawFixes: [{ from: 'Note 312.650) S. 167.', to: 'Note 312.  650) S. 167.' }],
    fixes: [
      { from: ' [Ed. – Trigl. 141, Art. IV [II], 73; BookOfConcord here, #69-74, esp. #73)', to: '' },
      { from: 'Terrninologie', to: 'Terminologie' },
      { from: 'für dieBekämpfung', to: 'für die Bekämpfung' },
    ],
    titles: [
      'Die seligmachende Gnade Gottes.',
      'Die Lehre von Christo.',
      'Die drei Arten der Mitteilung der Eigenschaften.',
      'III. Die Lehre von Christi Werk.',
      'Das prophetische Amt Christi.',
    ],
  },
  {
    band: 3,
    jahr: 1920,
    files: ['band3a.txt', 'band3b.txt'],
    teile: [
      { seite: 1, titel: 'Das christliche Leben' },
      { seite: 107, titel: 'Die Beharrung zur Seligkeit' },
      { seite: 121, titel: 'Die Gnadenmittel' },
      { seite: 259, titel: 'Gesetz und Evangelium' },
      { seite: 297, titel: 'Die Taufe' },
      { seite: 340, titel: 'Das Abendmahl' },
      { seite: 458, titel: 'Die christliche Kirche' },
      { seite: 501, titel: 'Das öffentliche Predigtamt' },
      { seite: 534, titel: 'Die ewige Erwählung' },
      { seite: 569, titel: 'Die letzten Dinge' },
    ],
    fixes: [
      { from: ' [Google Translated)', to: '' },
      { from: 'Der große Wert der guten Werken', to: 'Der große Wert der guten Werke' },
      { from: 'Das Ende der Wett', to: 'Das Ende der Welt' },
      { from: 'Die ewige Verdammns', to: 'Die ewige Verdammnis' },
    ],
    titles: ['Das christliche Leben', 'Die Gnadenmittel im allgemeinen.', 'Die ewige Erwählung.', '1. Der zeitliche Tod.'],
  },
];
