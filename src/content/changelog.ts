/**
 * What changed from version to version, newest first, in the words of the
 * app (rule 15/16). The first entry is the current version; a test keeps it
 * equal to the version in package.json.
 */
export interface Release {
  version: string;
  /** Day of the release, "2026-09-26". */
  date: string;
  title: string;
  changes: readonly { area: string; text: string }[];
}

export const CHANGELOG: readonly Release[] = [
  {
    version: '0.4.0',
    date: '2026-09-26',
    title: 'Arena, Eisenschmiede und das Kirchenjahr nach Dieffenbach',
    changes: [
      { area: 'Arena', text: 'Die Gebetskammer: ein Ort für den Kampf des Glaubens, mit Bibelversen, Gebetsanliegen und freiem Text. Einträge lassen sich in den Rückblick archivieren und zurückholen. Was du bekennst, gehört ins Gebet, nicht in die App.' },
      { area: 'Eisenschmiede', text: 'Anliegen für das Treffen mit den Brüdern, jedes mit dem Tag des Treffens, die Liste nach Treffen geordnet. Was du besprechen willst, steht als Liste zum Abhaken; Enter oder „+“ legt den nächsten Punkt an.' },
      { area: 'Kirchenjahr', text: 'Einteilung, Einleitung und Erklärung der drei Festkreise nach Georg Christian Dieffenbachs Evangelischer Haus-Agende (Mainz 1853), dazu die Deutung jedes Sonn- und Festtags. Die Sonntagsseite zeigt sie für die laufende Woche.' },
      { area: 'Vesper und Familienandacht', text: 'Die Vesper ist der persönliche Abschluss des Tages. Die Familienandacht steht als eigene Gewohnheit.' },
      { area: 'Rückblick', text: 'Unter „Mehr“. Tage, Verse und archivierte Einträge der Arena stehen als Liste, nach Jahr und Monat geordnet.' },
      { area: 'Mehr', text: 'Neu sind das Impressum mit Hinweisen zum Datenschutz, die Anleitung „Flugmodus beim Beten“ für das iPhone und diese Übersicht der Versionen.' },
      { area: 'Deine Daten', text: 'Zeigt, ob der Browser die Einträge dauerhaft behält, und bittet ihn auf Wunsch erneut darum.' },
      { area: 'Bibel', text: 'Die Seite heißt „Mein Bibelleseplan“.' },
      { area: 'Lehre', text: 'Der Bereich „Katechismus“ in der Leiste heißt jetzt „Lehre“.' },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-09-25',
    title: 'Eigener Leseplan, Zeiten nach Wochentagen und die geistliche Waffenrüstung',
    changes: [
      { area: 'Bibel', text: 'Kapitel am Tag für Altes und Neues Testament getrennt. Ein eigener Plan aus einem oder mehreren Büchern, jedes nach Kapiteln oder nach Zeit. Beim Lesen nach Zeit läuft ein Timer.' },
      { area: 'Zeiten', text: 'Alle Tage gleich oder nach Wochentagen in Gruppen. Ein Hinweis, wenn eine Zeit die Ordnung des Tages durchbricht.' },
      { area: 'Gebetsübersicht', text: 'Anliegen als Schlagworte, den Wochentagen zugeordnet, mehrere an einem Tag. Die Tage als Kacheln.' },
      { area: 'Geistliche Waffenrüstung', text: 'Epheser 6 nach Luther 1912: ein Stück am Tag nach dem Morgensegen, 1. Petrus 5,8–9 zur Eröffnung des Nachtgebets und eine Frage in Prüfung und Beichte. Unter „Darstellung“ abschaltbar.' },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-09-25',
    title: 'Sonntag, Kirchenjahr und Bibel',
    changes: [
      { area: 'Sonntag', text: 'Die Woche kommt von ihrem Sonntag: Wochenspruch, Bedeutung, Evangelium und Epistel mit kurzer Zusammenfassung, die Sonntage davor und danach zur Hand.' },
      { area: 'Kirchenjahr', text: 'Die drei Festkreise mit ihren Zeiten und allen Sonntagen, die Trinitatiszeit nach Themen gegliedert.' },
      { area: 'Bibel', text: 'Eine eigene Seite mit Altem und Neuem Testament nebeneinander. Die Lesung wird über die Gewohnheit „Bibel lesen“ vermerkt.' },
      { area: 'Katechismus', text: 'Die Hauptstücke als Kacheln, das Stück dieser Woche in Gold, jedes Hauptstück auf eigener Seite.' },
      { area: 'Gestalt', text: 'Luthers Rose in der Mitte der Leiste und als App-Symbol, die Gebetsordnungen Schritt für Schritt, jede Überschrift einklappbar, die vier Soli am Ende jeder Seite.' },
      { area: 'Gewohnheiten', text: 'Nach Gruppen geordnet, per Ziehen sortierbar, mit Stern für den Schwerpunkt.' },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-09-25',
    title: 'Die erste Fassung',
    changes: [
      { area: 'Andacht', text: 'Stille Zeit am Morgen, Vesper und Nachtgebet, jede Ordnung auch in einer Kurzform, die vollwertig ist.' },
      { area: 'Heute', text: 'Der Tag im Überblick: Zeiten, drei Vorsätze, Gewohnheiten.' },
      { area: 'Katechismus', text: 'Luthers Kleiner Katechismus im Wochenrhythmus, mit Haustafel und Stücken zum Auswendiglernen.' },
      { area: 'Deine Daten', text: 'Alles liegt nur auf diesem Gerät. Export als Text und als Sicherung, Einspielen und vollständiges Löschen. Die App läuft auch ohne Netz.' },
    ],
  },
];
