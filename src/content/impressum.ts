/**
 * Impressum and a short privacy notice. Parts in [square brackets] are
 * placeholders the publisher fills in; the page marks them until then.
 */

export interface ImprintSection {
  title: string;
  lines: readonly string[];
}

export const IMPRINT: readonly ImprintSection[] = [
  {
    title: 'Angaben gemäß § 5 DDG',
    lines: ['Andreas Dykau', '[Straße und Hausnummer]', '[Postleitzahl und Ort]', 'Deutschland'],
  },
  {
    title: 'Kontakt',
    lines: ['E-Mail: [E-Mail-Adresse]'],
  },
  {
    title: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
    lines: ['Andreas Dykau, Anschrift wie oben'],
  },
  {
    title: 'Art des Angebots',
    lines: [
      'Tagzeiten ist ein privates, nicht kommerzielles Angebot: eine Ordnung für Gebet und Bibellese am Morgen und am Abend. Die App ist kostenlos, enthält keine Werbung und verfolgt keine wirtschaftlichen Zwecke.',
    ],
  },
  {
    title: 'Texte und Quellen',
    lines: [
      'Bibeltexte nach der Lutherbibel 1912, gemeinfrei. Vollständige Bibelstellen werden nicht eingebunden; sie sind mit bibleserver.com (Lutherbibel) verlinkt.',
      'Luthers Kleiner Katechismus in traditioneller Fassung, gemeinfrei. Lieder und Gebete aus der Zeit vor 1900.',
      'Die Lesemethode folgt Hanniel Strebel („Überblick: Hanniel zum Lesen der Bibel“, hanniel.ch) und ist in eigenen Worten beschrieben.',
      'Alle übrigen Texte – Deutungen, Hinweise, Gebete ohne Quellenangabe – sind eigene Texte des Anbieters.',
    ],
  },
  {
    title: 'Haftung für Inhalte und Links',
    lines: [
      'Die Inhalte wurden mit Sorgfalt erstellt. Für Richtigkeit, Vollständigkeit und Aktualität kann dennoch keine Gewähr übernommen werden.',
      'Die App enthält Links zu fremden Websites, vor allem zu bibleserver.com. Für deren Inhalte ist allein der jeweilige Anbieter verantwortlich. Werden Rechtsverletzungen bekannt, wird der betreffende Link entfernt.',
    ],
  },
];

export const PRIVACY_NOTICE: readonly ImprintSection[] = [
  {
    title: 'Deine Einträge',
    lines: [
      'Alles, was du einträgst – Andachten, Gewohnheiten, Gebetsanliegen, die Arena –, bleibt auf deinem Gerät (im Speicher des Browsers). Der Anbieter erhält davon nichts. Es gibt keine Konten, keine Analyse, keine Werbung und keine Tracker.',
      'Unter Mehr → Einstellungen → Deine Daten kannst du jederzeit alles exportieren oder vollständig löschen.',
    ],
  },
  {
    title: 'Aufruf der App',
    lines: [
      'Die App wird über GitHub Pages ausgeliefert (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA). Beim Aufruf verarbeitet GitHub technisch notwendige Daten wie deine IP-Adresse, um die Seite auszuliefern und abzusichern. Näheres in der Datenschutzerklärung von GitHub.',
      'Schriften und alle übrigen Bestandteile sind in der App enthalten; beim Beten und Lesen werden keine weiteren Dienste aufgerufen. Erst wenn du einen Bibellink antippst, öffnet sich bibleserver.com mit dessen eigener Datenschutzerklärung.',
    ],
  },
  {
    title: 'Deine Rechte',
    lines: [
      'Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung sowie das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Da der Anbieter keine Daten von dir speichert, genügt für die Einträge in der App das Löschen unter „Deine Daten“. Bei Fragen: [E-Mail-Adresse].',
    ],
  },
];

export const IMPRINT_STAND = 'Stand: September 2026';
