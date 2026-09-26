/**
 * How to let the iPhone switch airplane mode on while Tagzeiten is open and off
 * again when it is closed – with the Shortcuts app (Kurzbefehle). The app itself
 * cannot do this; iOS does not allow it for apps, so it is set up once by hand.
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
  'Die App kann den Flugmodus nicht selbst schalten; das lässt iOS nicht zu. Mit der App „Kurzbefehle“, die auf jedem iPhone ist, richtest du es einmal ein – danach geschieht es von selbst.';

export const AIRPLANE_GUIDE: readonly GuidePart[] = [
  {
    title: 'Flugmodus an, wenn Tagzeiten geöffnet wird',
    steps: [
      { text: 'Öffne die App „Kurzbefehle“ und tippe unten auf „Automation“.' },
      { text: 'Tippe auf „Neue Automation“ (oder oben rechts auf „+“).' },
      { text: 'Wähle in der Liste „App“.' },
      {
        text: 'Tippe bei „App“ auf „Auswählen“, wähle „Tagzeiten“ und tippe auf „Fertig“.',
        note: 'Steht Tagzeiten nicht in der Liste, lies unten „Wenn Tagzeiten nicht in der Liste steht“.',
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
    title: 'Flugmodus aus, wenn Tagzeiten geschlossen wird',
    intro: 'Eine zweite Automation, genauso angelegt, mit zwei Unterschieden:',
    steps: [
      { text: 'Setze den Haken bei „Wird geschlossen“ statt bei „Wird geöffnet“.' },
      { text: 'Stelle in „Flugmodus festlegen“ auf „Aus“ (tippe auf „Ein“, um es umzuschalten).' },
    ],
  },
  {
    title: 'Wenn Tagzeiten nicht in der Liste steht',
    intro:
      'Tagzeiten ist eine Web-App vom Home-Bildschirm. Je nach iOS-Version erscheint sie nicht in der Liste der Apps. Dann legst du zwei Kurzbefehle an und startest die Andacht über den ersten:',
    steps: [
      { text: 'In „Kurzbefehle“ unten „Kurzbefehle“ wählen und oben rechts auf „+“ tippen.' },
      { text: 'Aktion „Flugmodus festlegen“ hinzufügen, auf „Ein“ lassen.' },
      {
        text: 'Aktion „URL öffnen“ hinzufügen und die Adresse der App eintragen: https://cft5v9c8yf-stack.github.io/tagzeiten/',
      },
      { text: 'Oben den Namen „Stille beginnen“ vergeben, dann über „Teilen“ → „Zum Home-Bildschirm“ ablegen.' },
      {
        text: 'Einen zweiten Kurzbefehl „Stille beenden“ mit nur einer Aktion anlegen: „Flugmodus festlegen“ auf „Aus“. Ebenfalls auf den Home-Bildschirm legen.',
      },
    ],
  },
];

export const AIRPLANE_NOTES: readonly string[] = [
  'Im Flugmodus erreicht dich niemand – auch Frau und Kinder nicht. Wer erreichbar bleiben will, nimmt statt „Flugmodus festlegen“ die Aktion „Fokus festlegen“ mit „Nicht stören“ und lässt dort Anrufe von bestimmten Personen zu.',
  'Tagzeiten läuft ohne Internet. Nur die Bibellinks zu bibleserver.com brauchen eine Verbindung – dafür liegt die Bibel ohnehin auf dem Tisch.',
  'Die Bezeichnungen können je nach iOS-Version leicht abweichen. Beschrieben ist der Stand von iOS 17 und 18.',
];
