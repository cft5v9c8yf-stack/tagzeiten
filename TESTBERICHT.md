# Testbericht Henoch vor Version 1.0

Stand: 8. Oktober 2026 · geprüft: Version 0.40.0 · Korrekturen aus Phase 2 in Version 0.41.0 (Zweig `claude/focused-pascal-sol6ng`)

## Kurzfassung

Henoch ist reif für 1.0. Seit 0.41.1 ist auch das Impressum vollständig.

**Phase 1** fand zwei kritische Punkte: das Impressum mit Platzhaltern und „Heute“, das nach
Mitternacht auf dem Vortag stehen blieb. Alles andere lief:

- 649 automatische Tests
- 36 Browser-Abläufe gegen den echten Build
- Daten aus Version 0.20 und 0.39 überstehen das Update
- die App läuft offline
- neue Versionen kommen über „Jetzt aktualisieren“ an

**Phase 2** (Version 0.41.0) hat den Tageswechsel, die E-Mail, den Datenschutz, die Reihenfolge
nach Regel 18 und die Textfehler behoben.

**Phase 3:** am 8. Oktober als Version 1.0.0 veröffentlicht.

**Offen bei dir:** das rechtliche Gegenlesen des Datenschutzes und das GitHub Release.

## 1. Projektzustand

| Prüfung | Ergebnis |
|---|---|
| Offene Änderungen | keine |
| Zweige | `claude/focused-pascal-sol6ng` (Arbeitszweig, PR #1 nach `main`, 192 Commits voraus). `claude/fuerbitte-haus` und `claude/upbeat-fermi-71q64v` sind vollständig enthalten und können gelöscht werden. |
| `main` | enthält zwei hochgeladene Dateien, die im Arbeitszweig fehlen: „Winter Arc – Der 90-Tage-Standard.pdf“ und `winter-arc-prompt.md` |
| Build | fehlerfrei, Typprüfung sauber. Eine Warnung: das Haupt-Paket ist 1,4 MB groß (gzip 467 KB). |
| Lint | Es ist kein Linter eingerichtet (nur TypeScript im strengen Modus). |
| `console.log` / `debugger` | keine. Ein `console.error`, wenn die Datenbank nicht geladen werden kann; das gehört so. |
| TODO, Lorem, Platzhalter | im Code keine. Sichtbare Platzhalter nur im Impressum (siehe K1). |
| Testdaten | Die Beispieldaten gibt es nur in der Demo-Fassung, nicht in der App. |
| Auslieferung | GitHub Pages, jeder Push auf den Arbeitszweig und auf `main` geht live nach mein.henoch.app. Die letzten Läufe waren alle erfolgreich. |

## 2. Funktionen (Browser-Tests mit gestellter Uhr, deutsche Zeit)

| Bereich | Geprüft | Ergebnis |
|---|---|---|
| Tagzeiten | 06:00 → Stille Zeit, 19:00 → Vesper, ab 20:15 → Nachtgebet; ganze Stille Zeit durchgebetet und abgeschlossen; Vesper und Nachtgebet abgeschlossen; Kacheln „abgeschlossen“, auch nach Neuladen; Psalm wechselt mit dem Wochentag | in Ordnung |
| Gewohnheiten | anlegen, umbenennen, löschen, Vorlage aus- und einschalten, abhaken (bleibt nach Neuladen), wöchentlich 3-mal mit Zählung „1 eingetragen“, Rückblick ohne „von 7“ | in Ordnung |
| Tagebuch (Gebetskammer) | Eintrag anlegen, bearbeiten, archivieren (steht im Rückblick), löschen; alles nach Neuladen geprüft | in Ordnung |
| Waffenrüstung | standardmäßig an, ausblenden und einblenden unter Einstellungen → Darstellung, bleibt nach Neuladen. Sie steht in der Stillen Zeit (Ausrichtung) und im Nachtgebet, **nicht in der Arena**; das ist so gebaut, kein Fehler. | in Ordnung |
| Wüstenzeit: Dauer | 40, 90 und frei (33 Tage); Start in der Zukunft („beginnt am …“, Heute noch ohne Wüstenzeit) und in der Vergangenheit („Tag 10 von 40“) | in Ordnung |
| Wüstenzeit: Auswahl | „Paket übernehmen“, einzeln wählen und abwählen, eigene Gewohnheit, Änderung während der Laufzeit | in Ordnung |
| Wüstenzeit: Rhythmus | Mi-/Fr-Fasten nur an diesen Tagen, Freitagsfasten nur freitags, wöchentliche Gewohnheit bis zum Abhaken | in Ordnung |
| Wüstenzeit: Advent | 2026: nicht am 28.11., ab 29.11., noch am 24.12., nicht am 25.12. · 2027: nicht am 27.11., ab 28.11. | in Ordnung |
| Wüstenzeit: Nachtragen | Vortag über die Tagesleiste; montags „Gestern nachtragen“ aus der Vorwoche | in Ordnung |
| Wüstenzeit: Tageswechsel | App bleibt über Mitternacht offen | **Fehler K2**, in 0.41.0 behoben und nachgeprüft |
| Wüstenzeit: Tag X von Y | stimmt (z. B. „Tag 7 von 40“ am siebten Tag) | in Ordnung |
| Wüstenzeit: Abschluss | erscheint am Tag nach dem letzten Tag; „Gewohnheiten übernehmen“ und „Neue Wüstenzeit beginnen“ funktionieren | in Ordnung |
| Wüstenzeit: offene Tage | „Heute neu anfangen.“, kein „verpasst“, „versäumt“, „gescheitert“, nichts in Rot | in Ordnung |
| Einstellungen | alle sieben Schalter unter Darstellung wirken und bleiben nach Neuladen (Farbschema, Gewohnheiten im Rückblick, Sonntagsruhe, Am Bett, Nachtgebet, Wochenrückblick, Waffenrüstung) | in Ordnung |
| Konsole | über alle Abläufe kein Fehler | in Ordnung |

## 3. Daten und Sicherheit

- **Speichern:** Alles liegt in IndexedDB (Datenbank `tagzeiten`). Ungesicherte Änderungen
  werden beim Wegwischen der App sofort gesichert und beim nächsten Start wiederhergestellt.
  Die App bittet den Browser, die Daten dauerhaft zu behalten.
- **Update von älteren Versionen:** echt geprüft, mit Daten aus einem Build von 0.20.0 und von
  0.39.5 im selben Browser, danach die aktuelle Fassung:
  - eigene Gewohnheit, Haken und der Vers der Stillen Zeit sind erhalten
  - die Wüstenzeit aus 0.39.5 wird richtig umgestellt (Bibellese → „Bibel lesen“)

  Dazu kommen die Tests für die Datenbank-Umstellung v1 → v2 → v3, die Reparatur
  unvollständiger Daten und die Übernahme alter Runden.
- **Externe Aufrufe:** keine. Schriften (Literata, Source Sans 3) sind im Paket enthalten; es
  gibt kein CDN, keine Analytik und keine Tracker. Beim Aufruf der Seite ist nur GitHub Pages
  beteiligt (Server-Protokolle, IP-Adresse). Im Text steht „hanniel.ch“ als Quellenangabe,
  ohne Link.
- **Sicherung:** Export als JSON und Markdown, Einspielen und „Alles löschen“ sind durch Tests
  abgedeckt.

## 4. PWA und Geräte

- **Manifest:**
  - Name und Kurzname „Henoch“, Start-URL `/`, Theme-Farbe, Hintergrund
  - Icons 192, 512 und 512 maskable, dazu Apple-Touch-Icon 180×180 und Favicon 64
  - Hochformat ist fest eingestellt
- **Service Worker:**
  - **offline:** Heute und Arena laden ohne Netz
  - **Update von 0.39.5 auf 0.40.0:** der Hinweis „Eine neue Version der App ist bereit“
    erscheint, „Jetzt aktualisieren“ lädt die neue Version
  - **Prüfintervall:** einmal pro Stunde, während die App offen ist
  - **Cache:** Jede Datei trägt ihren Inhalts-Fingerabdruck, alte Caches werden aufgeräumt,
    ein Hochzählen von Hand ist nicht nötig
  - **„Später“:** Wer „Später“ tippt, bekommt die neue Version, sobald die App einmal ganz
    geschlossen war
- **iPhone/Android:**
  - Apple-Meta-Angaben (Titel, Statusleiste, Touch-Icon) sind vorhanden
  - Die echte Installation lässt sich hier nicht prüfen → Handy-Checkliste
- **Darstellung:** iPhone SE hoch und quer, 320 px, großes iPhone, Tablet und Desktop, jeweils
  hell und dunkel, 13 Seiten. Nirgends seitliches Scrollen. Querformat auf kleinen Handys ist
  eng (Leiste unten nimmt viel Höhe).
- **Lighthouse 12** (lokal, ohne CDN; eine PWA-Kategorie gibt es in Lighthouse 12 nicht mehr):

  | | Leistung | Barrierefreiheit | Best Practices | SEO |
  |---|---|---|---|---|
  | Handy (langsames 4G simuliert) | 77 | 100 | 100 | 91 |
  | Desktop | 99 | 100 | 100 | 91 |

  Die Leistung auf dem Handy drückt vor allem das große Paket (erster Inhalt nach 3,4 s im
  simulierten langsamen Netz). Danach kommt alles aus dem Cache.
- **Live-Prüfung:** mein.henoch.app ist aus dieser Arbeitsumgebung nicht erreichbar (Netzwerk
  gesperrt). Geprüft wurde stattdessen der erfolgreiche Auslieferungslauf auf GitHub; der Rest
  steht in der Handy-Checkliste.

## 5. Inhalte

- **Begriffe:** kein sichtbares „Winter Arc“, „Streithalle“ oder „Tagzeiten“ als App-Name.
  Wüstenwanderung (der Ort) und Wüstenzeit (die einzelne Zeit) werden richtig verwendet.
- **Anführungszeichen:** durchgehend „…“.
- **Bibelstellen:** überwiegend ausgeschrieben („1. Petrus 5,8“, rund 270 Stellen). Abgekürzt
  sind nur die 13 Wochenschwerpunkte des 90-Tage-Standards und die Verse der Wüstenzeit
  (z. B. „Kol 3,23“, „Lk 16,10“), zusammen 20. Bei Bereichen stehen zwei Formen
  nebeneinander: Bindestrich (Perikopentabelle) und Halbgeviertstrich (neuere Texte).
- **Impressum und Datenschutz:** vorhanden (Mehr → ganz unten, dazu „Über Henoch“), aber mit
  Platzhaltern und Lücken (K1, W1).

## Gefundene Probleme

### Kritisch (blockiert die Veröffentlichung)

| Nr. | Problem | Status |
|---|---|---|
| K1 | Impressum zeigt Platzhalter: Straße, PLZ/Ort und E-Mail (auch im Datenschutz). § 5 DDG verlangt eine ladungsfähige Anschrift. | **behoben:** E-Mail kontakt@henoch.app (0.41.0), Anschrift Bükers Wiesen 16, 33106 Paderborn (0.41.1). Kein Platzhalter mehr. |
| K2 | Bleibt die App über Mitternacht offen oder wird morgens aus dem Hintergrund geholt, zeigt „Heute“ weiter den Vortag. Häkchen landen dann beim Vortag. | **behoben** (0.41.0): Heute, Stille Zeit und Wüstenzeit folgen dem neuen Tag. Das Nachtgebet bleibt beim begonnenen Abend, bis du es verlässt. Neuer Test, im Browser nachgeprüft. |

### Wichtig (sollte vor 1.0 behoben werden)

| Nr. | Problem | Status |
|---|---|---|
| W1 | Datenschutz unvollständig: Rechtsgrundlage der GitHub-Protokolle (Art. 6 Abs. 1 lit. f DSGVO), Übermittlung in die USA, Widerspruch und Datenübertragbarkeit (Art. 20, 21), lokale Speicherung als technisch notwendig (§ 25 Abs. 2 TDDDG); „Stand: September 2026“. Abschnitt „Texte und Quellen“ ungenau (Nizänum in heutiger Fassung, Konkordienbuch, Dieffenbach 1853, Zitate mit Quelle). | **behoben** (0.41.0), Entwurf. **Bitte von jemandem mit Rechtskenntnis gegenlesen lassen.** |
| W2 | Regel 18 (Haus vor Gemeinde vor Arbeit) verletzt: „Über Henoch“ („Haus, Beruf, Gemeinde“), Fürbitte der Vesper (Haus zuletzt), Waffenrüstung („Familie, Beruf und Gemeinde“), 90-Tage-Standard (Woche 6 Arbeit vor Woche 7 Gemeinde, Woche 9 „Dich selbst führen“ vor 10 „Zu Hause führen“). | **behoben** (0.41.0), jeweils im Kopf der Quelldatei vermerkt (auch in `reference/winter-arc.md`). |
| W3 | Rechtschreibung und veraltete Hinweise in eigenen Sätzen der App: „heute morgen“ (3×), Satzbau Kirchenjahr-Einführung, „unter „Katechismus““ (heißt jetzt Wort › Lehre, 2×), „aus vier Paketen“ (jetzt fünf), Zeitform im Eintrag 0.40.0. | **behoben** (0.41.0) |
| W4 | Vesper-Kurzform: Rubrik „Die Kinder sprechen die Antiphon.“ passt nicht zur persönlichen Vesper und erscheint auch ohne Kinder. | **behoben** (0.41.0): Rubrik entfernt |
| W5 | „Tagebuch“ statt „Gebetskammer“ beim Schriftgebet („Gedanken ins Tagebuch“) und in der Suche („Arena · Tagebuch“). | **behoben** (0.41.0) |
| W6 | Versionsnummer nur unter „Über Henoch“ und „Versionen“, nicht unten unter Mehr („Henoch 1.0.0“). | **behoben** (0.41.0): „Henoch 0.41.0“ ganz unten unter Mehr |
| W7 | **Deine Entscheidung:** Der 90-Tage-Standard (dein Text, wortgetreu) enthält „Einen Tag verpasst, kein Problem. Zwei hintereinander vermeiden.“, das reibt sich mit Regel 4 (keine Ketten). Außerdem „druckt den Tracker aus“, „Wochen-Tracker“ und „weil der Tracker zu Ende ist“, obwohl Henoch keinen Tracker zum Ausdrucken hat. | **angepasst** (1.0.0) auf deinen Wunsch: Regel ohne „Zwei hintereinander vermeiden“, „Tracker“ ersetzt, im Kopf der Quelle vermerkt |

### Später (kann in 1.1)

1. **Leistung:** Haupt-Paket 1,4 MB, Handy-Leistung 77. Die Bekenntnisschriften könnten erst
   bei Bedarf nachladen.
2. **Linter:** ESLint einrichten.
3. **Zweige:** zwei erledigte Zweige löschen; die zwei Upload-Dateien auf `main` mit dem
   Arbeitszweig zusammenführen.
4. **Bibelstellen:** einheitlich zitieren (ausgeschrieben, Halbgeviertstrich in Bereichen).
5. **Alte Schreibung in den Texten des Gebetshefts:** „daß“, „mußt“, „entläßt“,
   „Schlußgebet“, „Beschluß“. Ist das bewusst? Nicht geändert.
6. **Kleine Formulierungen aus der Textprüfung**, z. B.:
   - „Letzter Sonntag“ → „Voriger Sonntag“
   - „ein für allemal“ → „ein für alle Mal“
   - „Hephata“/„Hephatha“ einheitlich
   - Wege einheitlich schreiben (Mehr → Einstellungen → …)
   - „keine Analyse“ / „keine Analytik“ einheitlich
   - „Haus-Agende 1852/1853“ einheitlich
   - der Hinweis auf das Konkordienbuch bei den Bekenntnissen
7. **Anglizismen im 90-Tage-Standard**, deine Entscheidung: „Gym“, „Calls“, „Social Media“.
8. **Barrierefreiheit:**
   - Die Tagesleiste nennt sich vorgelesen „Mittwoch, 7. Oktober“, zeigt aber „Mi 7“
     (Sprachsteuerung).
   - Der Linktext „Mehr“ ist wenig sprechend.
9. **Wüstenzeit-Start:** Eine Wüstenzeit, die ganz in der Vergangenheit liegt, springt gleich
   zum Abschluss. Der Start-Dialog könnte das verhindern.
10. **Querformat:** auf kleinen Handys eng.
11. **Flugmodus-Anleitung:** nennt iOS 17/18 und Android 14.

## Checkliste für deinen Test auf dem Handy

1. [ ] mein.henoch.app öffnen: Unter Mehr steht ganz unten die neue Versionsnummer.
2. [ ] iPhone: Safari → Teilen → „Zum Home-Bildschirm“. Das Icon ist das Henoch-Zeichen, der Name „Henoch“.
3. [ ] Android: Chrome → „App installieren“ oder „Zum Startbildschirm hinzufügen“.
4. [ ] Vom Home-Bildschirm starten: ohne Browserleiste, Start auf „Heute“.
5. [ ] Flugmodus an, App neu öffnen: Heute, Andacht und Arena laden.
6. [ ] Stille Zeit (Kurzform) bis „Stille Zeit abschließen“: Die Kachel unter Heute zeigt „abgeschlossen“.
7. [ ] Ein Feld in der Lesung ausfüllen, App wegwischen, neu öffnen: Der Text ist noch da.
8. [ ] Eine Gewohnheit abhaken, App schließen und neu öffnen: Der Haken ist noch da.
9. [ ] Gebetskammer: Eintrag schreiben, App schließen, neu öffnen: Der Eintrag steht in der Liste.
10. [ ] Arena → Wüstenwanderung → „Wüstenzeit beginnen“ mit 40 Tagen: oben „Tag 1 von 40“.
11. [ ] „Aufbruch“ übernehmen: Die vier Gewohnheiten stehen unter Heute in der Gruppe Wüstenzeit.
12. [ ] Das „i“ an einer Gewohnheit: Die Erklärung erscheint direkt darunter; ein zweites „i“ schließt die erste.
13. [ ] App abends offen lassen, am Morgen zurückholen: Heute zeigt den neuen Tag.
14. [ ] Einstellungen → Darstellung → Farbschema „Dunkel“: alles lesbar, auch die Andacht.
15. [ ] Waffenrüstung ausblenden: In der Stillen Zeit fehlt sie unter „Die Ausrichtung“; wieder einblenden.
16. [ ] Mehr → Einstellungen → Deine Daten → „Sichern“: Die Datei lässt sich speichern.
17. [ ] Impressum (Mehr, ganz unten): Anschrift und kontakt@henoch.app stehen da, keine Platzhalter.
18. [ ] iPhone SE oder kleinstes Gerät: nichts abgeschnitten, nichts seitlich verschiebbar.
19. [ ] Nach dem nächsten Update: Der Hinweis „Eine neue Version der App ist bereit“ erscheint, „Jetzt aktualisieren“ lädt sie.
20. [ ] Am Sonntag mit Sonntagsruhe: Oben steht der Sonntag, Gewohnheiten ruhen.

## Phase 2: Korrekturen (Version 0.41.0)

Behoben sind alle Punkte unter „Kritisch“ und „Wichtig“, soweit sie ohne dich gehen. Nach den
Korrekturen:

- 650 automatische Tests grün, Build und Demo fehlerfrei
- alle 36 Browser-Abläufe gegen den neuen Build grün, auch der Tageswechsel um Mitternacht
- keine Konsolenfehler

**Bleibt bei dir:**

1. ~~**K1 Anschrift im Impressum.**~~ Erledigt in 0.41.1.
2. **W1 Datenschutz** einmal rechtlich gegenlesen lassen.
3. ~~**W7 90-Tage-Standard**~~ Erledigt in 1.0.0: auf deinen Wunsch angepasst.

## Phase 3: veröffentlicht als 1.0.0 (8. Oktober 2026)

Freigegeben am Morgen des 8. Oktober. Was dabei geschah, steht unten unter „Live-Gang“.

### Vorbereitung (Stand vor der Freigabe)

Mit 1.0.0 live gehen habe ich bewusst nicht. Jeder Push auf den Arbeitszweig geht automatisch auf
mein.henoch.app. Vorbereitet sind:

- `CHANGELOG.md` mit dem Eintrag für 1.0.0 (als „in Vorbereitung“ markiert)
- `README.md` mit Beschreibung, Funktionen, Live-Link und Kontakt
- `docs/release-notes-1.0.0.md`: der Text für das GitHub Release, für Nutzer geschrieben

**Nach deiner Freigabe (etwa 10 Minuten):**

1. ~~Anschrift eintragen~~ (erledigt in 0.41.1)
2. Version 1.0.0 in `package.json`, `package-lock.json` und in den Versionen der App; die
   Versionsmuster im Test anpassen
3. „in Vorbereitung“ aus `CHANGELOG.md` streichen
4. Tests, Build und Demo
5. Commit „Release 1.0.0“, Tag `v1.0.0`, Push. Die Auslieferung auf GitHub Pages läuft dann von
   selbst. Den Service-Worker-Cache muss niemand von Hand hochzählen: Er richtet sich nach den
   Inhalten der Dateien.
6. Prüfen, dass der Auslieferungslauf auf GitHub grün ist
7. Die Demos neu veröffentlichen

**Zwei Dinge kann ich von hier aus nicht:**

- **Das GitHub Release anlegen.** Mir fehlt dafür das Werkzeug. Du legst es auf GitHub unter
  Releases → „Draft a new release“ → Tag `v1.0.0` an und fügst den Text aus
  `docs/release-notes-1.0.0.md` ein (etwa 2 Minuten).
- **mein.henoch.app selbst aufrufen.** Das Netz der Arbeitsumgebung sperrt die Adresse. Die
  Prüfung nach dem Live-Gang machst du mit den Punkten 1, 4 und 19 der Handy-Checkliste.

Ob PR #1 nach `main` zusammengeführt werden soll, entscheidest du. Die Auslieferung braucht es
nicht; `main` enthält noch die zwei hochgeladenen Dateien zum 90-Tage-Standard.

## Live-Gang 1.0.0 (8. Oktober 2026)

- **Commit:** „Release 1.0.0“ auf dem Arbeitszweig.
  - 650 Tests grün, lokal und auf GitHub (dort mit der Prüfung gegen Luther 1912)
  - Build und Demo fehlerfrei
- **Probe im Browser** gegen den 1.0.0-Build:
  - unten unter Mehr steht „Henoch 1.0.0“
  - unter Versionen „Du nutzt Version 1.0.0.“
  - Impressum ohne Platzhalter
  - Service Worker aktiv, keine Konsolenfehler
- **Auslieferung:** GitHub Pages über den Lauf „Release 1.0.0“ nach mein.henoch.app. Wer die App
  offen hat, bekommt den Hinweis „Eine neue Version der App ist bereit“.
- **Versionsnummer** steht in `package.json`, `package-lock.json`, in der App und in
  `CHANGELOG.md`.
  - Das Manifest kennt kein Versionsfeld.
  - Den Service-Worker-Cache muss niemand hochzählen: Jede Datei trägt ihren
    Inhalts-Fingerabdruck, alte Caches werden aufgeräumt.
- **Tag `v1.0.0`:** lokal gesetzt. Der Git-Zugang dieser Arbeitsumgebung nimmt aber nur Pushes
  auf den Arbeitszweig an. Der Tag entsteht deshalb mit dem GitHub Release:
  1. GitHub → Releases → „Draft a new release“
  2. Tag `v1.0.0` neu anlegen, Ziel: Zweig `claude/focused-pascal-sol6ng`, Commit „Release 1.0.0“
  3. Titel „Henoch 1.0“, Text aus `docs/release-notes-1.0.0.md`
- **Live prüfen:** mein.henoch.app ist aus der Arbeitsumgebung gesperrt. Bitte auf dem Handy
  die Punkte 1, 4 und 19 der Checkliste prüfen (Versionsnummer, Start, Update-Hinweis).

### Offen für Version 1.1

- **Datenschutz:** von jemandem mit Rechtskenntnis gegenlesen lassen (W1)
- **Leistung:** großes Paket aufteilen, Handy-Leistung 77
- **Linter:** ESLint einrichten
- **Zweige:** erledigte Zweige löschen, PR #1 und die zwei Upload-Dateien auf `main`
  zusammenführen
- **Bibelstellen:** einheitlich zitieren
- **Alte Schreibung im Gebetsheft:** „daß“, „mußt“, „Schlußgebet“. Ist das bewusst?
- **Kleine Formulierungen und Anglizismen:** „Gym“, „Calls“, „Social Media“; „Runde“ im
  90-Tage-Standard
- **Barrierefreiheit:** Tagesleiste und Linktext „Mehr“
- **Wüstenzeit:** Eine Wüstenzeit ganz in der Vergangenheit sollte der Start-Dialog verhindern
- **Querformat:** auf kleinen Handys eng
- **Flugmodus-Anleitung:** auf aktuelle Systemversionen bringen
