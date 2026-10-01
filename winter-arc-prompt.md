# Auftrag: Modus „Winter Arc“ für Henoch

## Vorgehen

1. Lies zuerst `CLAUDE.md` und alle dort genannten dauerhaften Regeln.
2. Sieh dir an, wie der Modus **Waffenrüstung** umgesetzt ist: Schalter in den Einstellungen, Dauer, Datenhaltung, wo er in der Oberfläche auftaucht. Der Winter Arc wird nach **demselben Muster** gebaut (gleiche Komponenten, gleiche Struktur in der Datenschicht, gleiche Optik).
3. Lies `reference/winter-arc.md`. Das ist der vollständige Inhalt des Plans (Anleitung, Zeitplan, Phasen, 13 Wochenschwerpunkte, Verse, Tracker). Alle Texte daraus werden **wortgetreu** übernommen. Nichts umformulieren, kürzen oder ergänzen. Bibeltexte nur nach Luther 1912, wie sie in der Datei stehen.
4. Schlag mir einen Plan vor und warte auf mein Okay, bevor du Code änderst. Wenn die Waffenrüstung anders funktioniert als hier angenommen, folge dem bestehenden Muster und nenne die Abweichung im Plan.

Ändere bestehende Bereiche nur an den unten genannten Einhängepunkten (Einstellungen, Arena).

## 1. Aktivierung unter Einstellungen

- Neuer Schalter **„Winter Arc“** in den Einstellungen, direkt bei der Waffenrüstung. Standard: aus.
- Beim Einschalten öffnet sich ein kurzer Dialog:
  - **Startdatum** (Standard: heute, frei wählbar). Hinweis darunter: „Ein Start an einem Montag passt am besten zum Wochen-Tracker.“
  - **Dauer in Kalendertagen** (Zahlenfeld, Standard 90, erlaubt 7 bis 365, Schnellwahl 40 / 60 / 90).
  - Angezeigt wird das errechnete **Enddatum** = Startdatum + Dauer − 1 Tag.
- Waffenrüstung und Winter Arc sind unabhängig. Beide dürfen gleichzeitig aktiv sein.
- **Ausschalten** fragt nach Bestätigung. Die Einträge der Runde bleiben gespeichert (Status „beendet“), nichts wird gelöscht.
- Erneutes Einschalten startet eine **neue Runde**. Alte Runden bleiben im Archiv lesbar.
- Nach dem Enddatum bleibt der Modus aktiv, bis ich ihn ausschalte oder eine neue Runde starte. Arena zeigt dann die Abschlussseite (siehe 4).

## 2. Kalenderlogik

Alles mit reinen Kalenderdaten (lokales Datum, ohne Uhrzeit), damit Sommer- und Winterzeit nichts verschieben.

- D = Dauer in Tagen. Tag n = Kalendertage seit Start + 1 (Starttag = Tag 1, Endtag = Tag D).
- Woche w = aufrunden(n / 7). Gesamtwochen W = aufrunden(D / 7). Die letzte Woche darf kürzer sein.
- Wochen laufen ab dem Startdatum, nicht ab Montag. Der Tracker zeigt als Spaltenköpfe die echten Wochentage der sieben Tage.
- **Wochenschwerpunkt** f (1 bis 13) aus `reference/winter-arc.md`:
  - W = 1 → f = 13
  - sonst f = 1 + runden((w − 1) × 12 / (W − 1))
  - Bei D = 90 ergibt das W = 13 und f = w. Bei D = 40 ergibt das W = 6 und f = 1, 3, 6, 8, 11, 13.
- **Phase** aus f: 1–4 Disziplin, 5–8 Dienst, 9–13 Leitung.
- Tage außerhalb der Runde sind im Tracker neutral ausgegraut.

## 3. Checkliste

Feste IDs, Texte und Gruppen wie im Tracker in `reference/winter-arc.md`:

| ID | Gruppe | Text | Standard-Wochentage |
| --- | --- | --- | --- |
| `wake` | Morgen | 04:00 auf, kein Handy | Mo–So |
| `word` | Morgen | Morgenzeit im Wort und Gebet | Mo–So |
| `journal` | Morgen | Tagebuch und drei Dankpunkte | Mo–So |
| `train` | Morgen | Trainiert | Mo–Fr |
| `focus1` | Arbeit | Fokusblock 08–12 | Mo–Fr |
| `focus2` | Arbeit | Block 13–17 | Mo–Fr |
| `cook` | Haus | Zu Hause gekocht | Mo–So |
| `dinner` | Haus | Abendessen ohne Handy | Mo–So |
| `wife` | Haus | Eine Geste für meine Frau | Mo–So |
| `kitchen` | Haus | Küche um 20:00 zu | Mo–So |
| `phone` | Haus | Handy außerhalb des Schlafzimmers | Mo–So |
| `night` | Haus | Gebetet, 21:00 Licht aus | Mo–So |

Wochenstandard (einmal pro Woche der Runde): `church` Gottesdienst und Sonntagsruhe, `talk` Sonntagsgespräch mit meiner Frau, `date` Abend zu zweit, von mir geplant, `money` 15 Minuten Finanzen.
Monatlich: `serve` Gedient. Gilt pro Kalendermonat; einmal abgehakt, ist es in allen Wochen dieses Monats erledigt.

- In den Winter-Arc-Einstellungen kann ich je Punkt die Wochentage ändern. An Tagen, für die ein Punkt nicht gilt, steht ein neutrales „–“.
- Uhrzeiten in den Texten (04:00, 20:00, 21:00, 08–12, 13–17) kommen aus einer Einstellung „Meine Zeiten“ mit diesen Standardwerten, damit andere Nutzer sie anpassen können. Der Anleitungstext bleibt dabei unverändert.

## 4. Arena

Nur wenn der Winter Arc aktiv ist, bekommt die Arena zwei zusätzliche Bereiche. Der bisherige Inhalt der Arena bleibt unverändert und an erster Stelle.

**Anleitung**
- Der komplette Inhalt aus `reference/winter-arc.md`, gegliedert wie dort: Worum es geht, Die vier Regeln, Der Tagesstandard, die drei Blöcke, Der Wochenstandard, Die drei Phasen mit den 13 Wochen, Tag 90.
- Die aktuelle Woche ist in der Wochentabelle hervorgehoben.

**Dashboard**
- Kopf: „Tag n von D“, Phase, Woche w von W, Schwerpunkt, Auftrag der Woche und Vers der Woche.
- **Heute:** die Checkliste, gruppiert nach Morgen, Arbeit, Haus. Antippen setzt oder entfernt den Haken.
- Ist in der Gebetsordnung das Morgengebet für heute abgeschlossen, erscheint beim Punkt `word` der Hinweis „Morgengebet heute gebetet – abhaken?“. Nie automatisch abhaken.
- **Diese Woche:** ein Raster aus sieben Tagen mal Checklistenpunkten. Erledigt = gefüllter Punkt, offen = leerer Umriss. Vergangene Tage der Runde lassen sich nachtragen.
- **Wochenstandard** und der Monatspunkt als Kästchen.
- **Wochenrückblick** am letzten Tag jeder Woche der Runde: drei Textfelder „Ein Sieg dieser Woche“, „Das Kästchen, das ich schleifen ließ“, „Was Gott mich lehrt“. Darunter immer der Zuspruch aus Klagelieder 3,22–23 (Text aus der Referenzdatei).
- Ältere Wochen kann ich zurückblättern und lesen.

**Abschlussseite** (ab dem Tag nach dem Enddatum)
- Der Abschnitt „Tag 90 – und danach“ aus der Referenzdatei, darunter die Wochenrückblicke der Runde zum Nachlesen.
- Knöpfe „Neue Runde starten“ (öffnet den Dialog aus 1) und „Als Markdown exportieren“ (über den vorhandenen Export).

## 5. Daten

- In der bestehenden Dexie-Datenschicht, gekapselt wie die übrigen Module. Neue Datenbankversion mit Migration, ohne bestehende Daten zu verändern.
- Vorschlag (an das Waffenrüstung-Muster anpassen):
  - `winterArcRuns`: `id`, `startDate` (YYYY-MM-DD), `durationDays`, `status` (aktiv / beendet), `createdAt`
  - `winterArcDays`: Schlüssel `[runId+date]`, `checks` (Objekt ID → true)
  - `winterArcWeeks`: Schlüssel `[runId+week]`, `weeklyChecks`, `review` (`win`, `slipped`, `lesson`)
  - `winterArcMonths`: Schlüssel `[runId+month]`, `served`
  - Einstellungen (Wochentage je Punkt, Meine Zeiten) beim bestehenden Settings-Speicher
- Alles bleibt lokal auf dem Gerät.

## 6. Regeln, die nicht aufgeweicht werden

- Keine Serien und keine Streak-Zähler, kein „x Tage in Folge“.
- Kein Rot und keine Warnfarben für Verpasstes. Offen ist ein neutraler Umriss.
- Keine Prozentwerte, Punktestände, Ranglisten oder Abzeichen.
- Keine neuen Benachrichtigungen.
- Jeder Rückblick endet im Zuspruch.
- Nur gemeinfreie Texte, Bibel nur Luther 1912.
- Oberfläche auf Deutsch, Ton wie im Rest der App.

## 7. Tests

- Kalender: Start 05.10.2026 mit D = 90 → Enddatum 02.01.2027, Tag 1 am Start, Tag 90 am Ende; korrekte Tageszahl über die Zeitumstellungen am 25.10.2026 und 28.03.2027.
- Schwerpunkt: D = 90 → f = w für w = 1 bis 13; D = 40 → 1, 3, 6, 8, 11, 13; D = 7 → 13.
- Phase aus f an den Grenzen 4/5 und 8/9.
- Arena zeigt Anleitung und Dashboard nur bei aktivem Winter Arc.
- Ausschalten löscht keine Einträge; Neustart legt eine neue Runde an.
- Monatspunkt gilt für alle Wochen desselben Kalendermonats.
- Kein Element im Winter-Arc-Bereich verwendet die Warn- oder Rotfarbe, und kein Text enthält „in Folge“ oder „Streak“.

## 8. Meilensteine

Nach jedem Meilenstein anhalten, kurz zusammenfassen und einen Pull Request vorbereiten.

1. Einstellungen, Datenmodell mit Migration, Kalenderlogik und deren Tests
2. Arena: Anleitung
3. Arena: Dashboard mit Tracker, Wochenstandard und Rückblick
4. Abschlussseite, Archiv der Runden und Export
