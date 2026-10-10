/**
 * How to let the phone switch airplane mode on while Henoch is open and off
 * again when it is closed: on the iPhone with the Shortcuts app (Kurzbefehle),
 * on Samsung phones with "Modi und Routinen". Other Android phones have no such
 * trigger without extra apps; there "Bitte nicht stören" at the time of the
 * Stille Zeit is the nearest thing. The app itself cannot switch airplane mode:
 * neither iOS nor Android allow it, so it is set up once by hand.
 */

export interface GuideStep {
  text: string;
  /** A hint under the step. */
  note?: string;
}

export interface GuidePart {
  title: string;
  intro?: string;
  steps: readonly GuideStep[];
}

export const AIRPLANE_INTRO =
  'Die App kann den Flugmodus nicht selbst schalten; das lassen weder iOS noch Android zu. Du richtest es einmal auf dem Telefon ein – danach geschieht es von selbst: auf dem iPhone mit „Kurzbefehle“, auf Samsung-Geräten mit „Modi und Routinen“.';

export const AIRPLANE_GUIDE: readonly GuidePart[] = [
  {
    title: 'iPhone: Flugmodus an, wenn Henoch geöffnet wird',
    steps: [
      { text: 'Öffne die App „Kurzbefehle“ und tippe unten auf „Automation“.' },
      { text: 'Tippe auf „Neue Automation“ (oder oben rechts auf „+“).' },
      { text: 'Wähle in der Liste „App“.' },
      {
        text: 'Tippe bei „App“ auf „Auswählen“, wähle „Henoch“ und tippe auf „Fertig“.',
        note: 'Steht Henoch nicht in der Liste, lies unten „iPhone: Wenn Henoch nicht in der Liste steht“.',
      },
      { text: 'Setze den Haken bei „Wird geöffnet“ – nicht bei „Wird geschlossen“.' },
      {
        text: 'Wähle „Sofort ausführen“ und tippe auf „Weiter“.',
        note: '„Bei Ausführung benachrichtigen“ kannst du ausschalten, dann erscheint kein Hinweis.',
      },
      { text: 'Tippe auf „Neuer leerer Kurzbefehl“, dann auf „Aktion hinzufügen“.' },
      { text: 'Suche nach „Flugmodus“ und wähle „Flugmodus festlegen“.' },
      { text: 'Achte darauf, dass dort „Flugmodus aktivieren“ bzw. „Ein“ steht. Tippe auf „Fertig“.' },
    ],
  },
  {
    title: 'iPhone: Flugmodus aus, wenn Henoch geschlossen wird',
    intro: 'Eine zweite Automation, genauso angelegt, mit zwei Unterschieden:',
    steps: [
      { text: 'Setze den Haken bei „Wird geschlossen“ statt bei „Wird geöffnet“.' },
      { text: 'Stelle in „Flugmodus festlegen“ auf „Aus“ (tippe auf „Ein“, um es umzuschalten).' },
    ],
  },
  {
    title: 'iPhone: Wenn Henoch nicht in der Liste steht',
    intro:
      'Henoch ist eine Web-App vom Home-Bildschirm. Je nach iOS-Version erscheint sie nicht in der Liste der Apps. Dann legst du zwei Kurzbefehle an und startest die Andacht über den ersten:',
    steps: [
      { text: 'In „Kurzbefehle“ unten „Kurzbefehle“ wählen und oben rechts auf „+“ tippen.' },
      { text: 'Aktion „Flugmodus festlegen“ hinzufügen, auf „Ein“ lassen.' },
      {
        text: 'Aktion „URL öffnen“ hinzufügen und die Adresse der App eintragen: https://mein.henoch.app/',
      },
      { text: 'Oben den Namen „Stille beginnen“ vergeben, dann über „Teilen“ → „Zum Home-Bildschirm“ ablegen.' },
      {
        text: 'Einen zweiten Kurzbefehl „Stille beenden“ mit nur einer Aktion anlegen: „Flugmodus festlegen“ auf „Aus“. Ebenfalls auf den Home-Bildschirm legen.',
      },
    ],
  },
  {
    title: 'Android (Samsung): Flugmodus, solange Henoch offen ist',
    intro:
      'Samsung-Geräte haben dafür „Modi und Routinen“. Eine Routine schaltet den Flugmodus ein, sobald Henoch geöffnet wird, und stellt ihn wieder zurück, wenn du die App verlässt.',
    steps: [
      {
        text: 'Installiere Henoch zuerst über Chrome als App (siehe „App installieren“).',
        note: 'Nur dann steht Henoch als eigene App in der Auswahl.',
      },
      { text: 'Öffne die Einstellungen und tippe auf „Modi und Routinen“, dann unten auf „Routinen“.' },
      { text: 'Tippe oben auf „+“, um eine neue Routine anzulegen.' },
      { text: 'Tippe bei „Wenn“ auf „+“, wähle „App geöffnet“ und dann „Henoch“. Tippe auf „Fertig“.' },
      {
        text: 'Tippe bei „Dann“ auf „+“, wähle „Verbindungen“ und dann „Flugmodus“. Stelle ihn auf „Ein“ und tippe auf „Fertig“.',
      },
      {
        text: 'Achte darauf, dass beim Ende der Routine die Einstellungen zurückgesetzt werden.',
        note: 'Dann geht der Flugmodus von selbst wieder aus, sobald du Henoch verlässt. Je nach Version heißt die Option „Einstellungen zurücksetzen“ oder sie ist schon eingeschaltet.',
      },
      { text: 'Tippe auf „Speichern“ und gib der Routine einen Namen, etwa „Stille“.' },
    ],
  },
  {
    title: 'Andere Android-Geräte (z. B. Pixel)',
    intro:
      'Ohne Samsung-Oberfläche gibt es keine eingebaute Routine „wenn App geöffnet“, und Android lässt den Flugmodus auch von Zusatz-Apps nicht schalten. Der nächstbeste Automatismus: „Bitte nicht stören“ schaltet sich zur Zeit deiner Stillen Zeit von selbst ein und wieder aus.',
    steps: [
      { text: 'Öffne die Einstellungen und tippe auf „Töne und Vibration“ (oder „Benachrichtigungen“), dann auf „Bitte nicht stören“.' },
      { text: 'Tippe auf „Zeitpläne“ und lege einen neuen Zeitplan „Zeitbasiert“ an.' },
      { text: 'Stelle Tage, Beginn und Ende auf die Zeit deiner Stillen Zeit, z. B. 5:30 bis 6:15 Uhr.' },
      {
        text: 'Wer ganz offline sein will, tippt zu Beginn in den Schnelleinstellungen (zweimal von oben wischen) auf „Flugmodus“ und danach wieder.',
      },
    ],
  },
];

export const AIRPLANE_NOTES: readonly string[] = [
  'Im Flugmodus erreicht dich niemand – auch Frau und Kinder nicht. Wer erreichbar bleiben will, nimmt statt des Flugmodus „Nicht stören“ (iPhone: „Fokus festlegen“) und lässt dort Anrufe von bestimmten Personen zu.',
  'Henoch läuft ganz ohne Internet. Die Bibel liegt ohnehin auf dem Tisch.',
  'Die Bezeichnungen können je nach Version leicht abweichen. Beschrieben ist der Stand von iOS 17 und 18 und von Android 14 (Samsung One UI 6).',
];
