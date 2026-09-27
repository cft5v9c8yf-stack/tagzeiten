/**
 * How to put Tagzeiten on the home screen as an app: Android first (Chrome,
 * Samsung Internet), then the iPhone. Once installed it opens without the
 * browser bar, works without internet and keeps its entries on the device.
 */
import type { GuidePart } from './airplaneGuide';

export const APP_URL = 'https://cft5v9c8yf-stack.github.io/tagzeiten/';

export const INSTALL_INTRO =
  'Tagzeiten ist eine Web-App: Sie kommt nicht aus dem Play Store, sondern wird aus dem Browser heraus installiert. Danach liegt sie wie jede andere App auf dem Startbildschirm, öffnet sich ohne Adressleiste und läuft ohne Internet.';

export const INSTALL_GUIDE: readonly GuidePart[] = [
  {
    title: 'Android mit Chrome',
    steps: [
      { text: `Öffne Chrome und rufe die Adresse auf: ${APP_URL}` },
      {
        text: 'Warte, bis die Seite ganz geladen ist. Oft erscheint unten von selbst der Hinweis „Tagzeiten installieren“ – dann tippe darauf und bestätige mit „Installieren“.',
      },
      {
        text: 'Erscheint kein Hinweis: Tippe oben rechts auf das Menü (⋮) und wähle „App installieren“.',
        note: 'Steht dort nur „Zum Startbildschirm hinzufügen“, wähle das und dann „Installieren“ bzw. „Hinzufügen“.',
      },
      { text: 'Bestätige mit „Installieren“. Nach wenigen Sekunden liegt Tagzeiten mit Luthers Rose auf dem Startbildschirm.' },
      { text: 'Öffne Tagzeiten ab jetzt über dieses Symbol, nicht mehr über Chrome.' },
    ],
  },
  {
    title: 'Android mit Samsung Internet',
    steps: [
      { text: `Öffne Samsung Internet und rufe die Adresse auf: ${APP_URL}` },
      {
        text: 'Tippe in der Adressleiste auf das Symbol zum Installieren (ein Pfeil nach unten), falls es erscheint.',
      },
      {
        text: 'Sonst: Tippe unten rechts auf das Menü (☰), dann auf „Seite hinzufügen zu“ und „Startbildschirm“.',
      },
      { text: 'Bestätige mit „Hinzufügen“.' },
    ],
  },
  {
    title: 'iPhone mit Safari',
    steps: [
      { text: `Öffne Safari (nicht Chrome) und rufe die Adresse auf: ${APP_URL}` },
      { text: 'Tippe unten auf „Teilen“ (das Quadrat mit dem Pfeil nach oben).' },
      { text: 'Wähle „Zum Home-Bildschirm“ und tippe oben rechts auf „Hinzufügen“.' },
    ],
  },
];

export const INSTALL_NOTES: readonly string[] = [
  'Deine Einträge bleiben auf dem Gerät. Die installierte App und der Browser teilen sie auf Android miteinander; auf dem iPhone hat die App vom Home-Bildschirm einen eigenen Speicher.',
  'Wer im Browser „Websitedaten löschen“ für diese Seite wählt oder die App deinstalliert, löscht auch die Einträge. Eine Sicherung unter Mehr → Einstellungen → Deine Daten schützt davor.',
  'Neue Versionen kommen von selbst, sobald die App mit Internet geöffnet wird. Du musst nichts aus einem Store laden.',
  'Die Bezeichnungen im Menü können je nach Gerät und Browserversion leicht abweichen.',
];
