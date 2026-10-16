# Backlog

Vorhaben, die vorgemerkt, aber noch nicht begonnen sind.

## Lutherische Bekenntnisschriften unter Katechismus / Anhang

Gewünscht (26.09.2026): die Bekenntnisschriften im Anhang des Katechismus, mit
Volltextsuche, Filtern und passenden Bibelstellen.

**Stand 06.10.2026:** Großer Katechismus, Augsburgische Konfession, Apologie,
Schmalkaldische Artikel und Traktat sind eingebaut (0.18.0 bis 0.22.0), nach
dem Konkordienbuch St. Louis 1881. Die Konkordienformel ist pausiert. Beim
Traktat fehlt noch der Hinweis, dass die lateinischen Unterschriftenlisten am
Ende weggelassen sind.

Stand vom 26.09.2026, vor dem Einbau:

- **Textquelle fehlt.** Nur gemeinfreie Ausgaben kommen in Frage: das
  Konkordienbuch (1580) oder eine Ausgabe des 19. Jahrhunderts, etwa
  J. T. Müller, „Die symbolischen Bücher der evangelisch-lutherischen Kirche“
  (1860 ff.). Moderne Bearbeitungen (BSLK, „Unser Glaube“, der ökumenische
  Text der altkirchlichen Bekenntnisse) sind geschützt. Die Texte werden nicht
  aus dem Gedächtnis geschrieben.
- **Zugang.** Aus der Cloud-Umgebung sind archive.org und de.wikisource.org
  gesperrt. Möglich: beide Domains unter „Netzwerkzugriff“ freigeben (gilt für
  neue Sitzungen), oder den „FULL TEXT“ einer Ausgabe von archive.org als
  Datei hochladen. Die PDF selbst war zu groß.
- **Regel 12** in CLAUDE.md nennt das Konkordienbuch noch nicht. Vor dem
  Einbau fragen, ob sie erweitert werden darf.
- **Umfang.** Vorschlag: in Etappen, beginnend mit Augsburger Bekenntnis und
  Schmalkaldischen Artikeln; danach Apologie, Großer Katechismus, Traktat,
  Konkordienformel. Jede Seite gegen den Scan prüfen.
- **Bibelstellen.** Die im Bekenntnistext selbst angeführten Stellen, als
  Angabe ohne Link (Regel 13).
- **Suche und Filter.** Volltextsuche über alle Schriften; Filter nach Schrift,
  Thema (z. B. Rechtfertigung, Taufe, Abendmahl, Beichte) und Bibelbuch.

## Widgets für Startbildschirm und Sperrbildschirm

Gewünscht (28.09.2026). Entwurf mit Beispieldaten:
https://claude.ai/artifact/5NL6udynWnCejjAorL6grt

- **Klein:** die nächste Gebetszeit („Vesper 18:30“, darunter die folgende).
- **Mittel:** Datum und Woche im Kirchenjahr, der Tagesbogen mit den drei
  Zeiten, „Heute lesen“ nach dem Leseplan.
- **Groß:** dazu Wochenspruch (Luther 1912), die drei Zeiten mit Stand und die
  drei Dinge (Wort, Haus, Werk).
- **Sperrbildschirm:** rund, rechteckig und einzeilig, nur Zeit und Name.

Regeln: offene Zeiten neutral, keine Zähler, kein Hinweis auf Versäumtes
(Regeln 4, 5, 7). Ohne Nachtgebet nur Stille Zeit und Vesper.

Stand:

- **Braucht eine native App.** Eine Web-App kann auf iPhone und Android keine
  Widgets anbieten. Nötig ist eine native Hülle (z. B. Capacitor) mit einem
  Widget-Teil in Swift/WidgetKit (iPhone, Apple-Entwicklerkonto) und
  Kotlin (Android).
- **Speicher.** Das Widget kann die IndexedDB des Browsers nicht lesen. Die
  Einträge müssten in einen lokalen Speicher, den App und Widget teilen (App
  Group auf dem iPhone, gemeinsamer Speicher auf Android). Weiter nur auf dem
  Gerät (Regel 10).

## Wochenrückblick und kleine Erweiterungen

Gewünscht (06.10.2026). Kein neuer Bereich, kein neuer Tab; jeder Punkt in
Vorhandenes eingehängt und in seinem Bereich einzeln abschaltbar, ohne dass
Daten verloren gehen. Höchstens eine Minute mehr am Tag. Geistliche Texte
schreibt Claude nicht selbst: fehlende Texte stehen als
`[TEXT VON ANDREAS: …]` im Code und in `content/TEXTE-OFFEN.md`. Entwürfe als
Screenshots in der Demo wurden gezeigt.

Bestand:

| Punkt | Vorhanden | Fehlt |
|---|---|---|
| Wochenrückblick nach den Ständen | umgesetzt in 0.37.0 | – |
| Gedenktage in Mein Haus | Name und Anliegen pro Person; Reihe der Fürbitte (Mo Frau, Di–Fr Kinder, Sa Ehe, So Haus) | Daten und Vorrang vor der Reihe |
| Fürbitte über das Haus hinaus | „Fürbitte“ im Morgen mit den Anliegen der Gebetsübersicht nach Wochentag | die sieben Themen der Wochentage |
| Sonntagsruhe | umgesetzt in 0.35.0 | – |

Plan:

1. **Wochenrückblick:** umgesetzt in 0.37.0, nach Entwurf D
   (https://claude.ai/artifact/MDjkWE4GLEtEHaBK2Jt4wR). Am Sonntagabend im
   vollen Nachtgebet an Stelle von „Dank und Rückschau“, vor Prüfung und
   Zuspruch (Regel 3); die Kurzform bleibt kurz; unter „Darstellung“
   abschaltbar. „Wofür danke ich?“ für: Frau und Kinder (mit Namen aus Mein
   Haus, nur wenn eingetragen), Meine Gemeinde, Meine Arbeit, Meine Nächsten,
   Unser Land (statt „Bürger“, mit 1. Timotheus 2,1–2), je mit einer
   Bibelstelle; dazu höchstens ein Vorsatz. Oben, was die Woche über abends
   beim Dank notiert wurde; bei laufender Streithalle ihre drei Fragen mit
   denselben Daten. Am Ende derselbe Zuspruch wie in der Streithalle
   (Klagelieder 3,22–23, seit 0.37.1). Inhalte in
   `src/content/weekReview.ts`. Offen: ein wählbarer Rückblickstag.
2. **Gedenktage:** pro Person Geburtstag und Tauftag, bei der Ehefrau der
   Hochzeitstag. Ein Gedenktag geht der Reihe der Fürbitte vor. Drei Gebete
   als Platzhalter (Geburtstag, Tauftag, Hochzeitstag).
3. **Fürbitte über das Haus hinaus:** eine Zeile pro Morgen nach der Fürbitte
   für das Haus: Mo Gemeinde · Di Prediger und Älteste · Mi Brüder aus der
   Arena · Do Beruf · Fr Obrigkeit (1. Timotheus 2,1–2) · Sa verfolgte
   Christen · So die ganze Kirche. Namen und Anliegen selbst gepflegt.
4. **Sonntagsruhe:** umgesetzt in 0.35.0, anders als zuerst geplant: eine
   Einstellung unter „Darstellung“ (Standard aus). Eingeschaltet sind am
   Sonntag die Gewohnheiten ausgeblendet und zählen im Rückblick nicht mit;
   unter „Heute“ steht stattdessen der Sonntag. Die Streithalle folgt ihren
   eigenen Tagen.

Tests: jeder Punkt abschaltbar ohne Datenverlust; Gedenktag vor der Reihe; bei
aktiver Streithalle genau ein Rückblick am Rückblickstag; jeder Platzhalter in `content/TEXTE-OFFEN.md`. Eine neue Version,
ein Commit pro Punkt.

Offene Fragen vor dem Beginn:

- **Pflege der Fürbitte über das Haus hinaus:** in Mein Haus (Auftrag) oder als
  Überschriften der Tage in der Gebetsübersicht (Empfehlung: vermeidet
  Doppeltes, deren „Fürbitte“ steht direkt darunter).
- **Hochzeitstag:** im Mittelpunkt „unsere Ehe“ oder die Ehefrau.

## Wüstenwanderung und Wüstenzeit (früher Streithalle)

Gewünscht (07.10.2026), **umgesetzt in 0.39.0**. Die Streithalle ist zur
Wüstenzeit geworden: ein fester Zeitraum (40, 90 oder frei) mit Gewohnheiten aus
vier Paketen, weiteren Vorschlägen aus der Sammlung oder eigenen
(`src/content/desert.ts`). Die Gewohnheiten sind gewöhnliche Gewohnheiten des
Profils (Felder `desert`, `note`, `days`, `advent`, `needs`); ihre Haken liegen
in den Tagen. Die Runde (`winterArcRuns`, Feld `habits`) merkt sich nur Zeitraum,
Auswahl und Wochenrückblicke. Eine laufende Runde der Streithalle wird beim Laden
übernommen (`fromRound`). Vier Gewohnheiten der Hauskirche sind die bestehenden
(Tischgebet, Familienandacht, Kinder segnen, Katechismus), dazu Gottesdienst.

Abweichungen von der Vorlage nach CLAUDE.md: keine Erfüllungsquote (Regel 4),
statt dessen „an N Tagen gehalten“; keine Emojis (Regel 16); Verse nach Luther
1912 (1 Tim 4,7 „Gottseligkeit“, Mk 1,35, Hos 2,16 vollständiger).

Seit 0.39.1 heißt der Ort in der Arena „Wüstenwanderung“; jede einzelne Zeit darin
bleibt eine Wüstenzeit (Schalter unter Darstellung, Gruppe unter „Heute“, Texte).
Die älteren Einträge unter „Was ist neu“ nennen die Streithalle nicht mehr.

Seit 0.40.0 (Prüfung der App auf Doppeltes, 07.10.2026): Angebote, die Henoch
schon hat, sind die bestehende Gewohnheit (`bibleReading`, `exercise`,
`offering`, `brothers`, `timeWithWife`, `mercy`); ältere Wahlen werden beim Laden
umgestellt (`relink`). Was eine Gebetszeit schon enthält, folgt ihr (`follows`
in `content/desert.ts`, `keptByOrder` in `domain/habits.ts`) und bleibt an
anderen Tagen von Hand abhakbar. Der 90-Tage-Standard ist das fünfte Paket
(`wz-std-*`); mit ihm zeigt die Woche Schwerpunkt, Vers und Phase. Unter „Heute“
stehen die Gebetszeiten nur als Kacheln; im Rückblick sind die Gewohnheiten
eine eigene Ansicht. Die Stille Zeit klappt die weiteren Felder der Lesung ein,
die Vesper lässt die Fürbitte dem Nachtgebet.

## Tagebuch der Wüstenwanderung

Gewünscht (16.10.2026). Wer eine Wüstenwanderung bewusst beginnt, hatte keinen
eigenen Ort zum Schreiben: nur der 90-Tage-Standard hat „Tagebuch und drei
Dankpunkte“, und freies Schreiben führte in die Gebetskammer. Die Gebetskammer
ist aber für einzelne Kämpfe da (anheften, begleiten, archivieren); ein Tagebuch
ist eine fortlaufende Spur durch eine Zeit mit Anfang und Ende.

**Umgesetzt in 1.15.0, zuerst als Demo zur Abnahme:** Das Tagebuch gehört zum
Tag (`evening.journal`, Handschrift in `evening.journalInk`) und so zu Sicherung,
Abgleich, Suche, Export und Löschen. Es steht in der Wüstenwanderung unter der
Liste des Tages (nicht für Tage, die noch kommen), beim Punkt „Tagebuch und drei
Dankpunkte“ zwischen Satz und Dank, und ist im Abschluss und im Rückblick einer
Wüstenzeit Tag für Tag zu lesen (`RoundJournal`). Die Gebetskammer bleibt, wie
sie ist. Am Feld steht nach Regel 9, dass Sünde gebetet und nicht notiert wird.

## Schrift der App

Besprochen am 11.10.2026. **Entscheidung: vorerst bleibt alles, wie es ist.** Vor dem Druck der
Visitenkarten noch einmal darüber sprechen, damit Karte und App dieselben Schriften tragen.

- **Heute:** Literata für Texte, Source Sans 3 für Beschriftungen und Bibelstellen. Beide frei
  (OFL), selbst ausgeliefert über `@fontsource` (geladen in `src/main.tsx`, festgelegt als
  `--serif` und `--sans` in `src/styles/tokens.css`).
- **Gewünscht und verglichen:**
  - Die Schrift der King James Bibel: 1611 eine gebrochene Schrift. Als Leseschrift ungeeignet,
    höchstens als Zierde (Name, Anfangsbuchstabe). Heutige KJV-Ausgaben nutzen Buchschriften in
    Garamond-Art, oft lizenzpflichtig. Freie Verwandte: EB Garamond, IM Fell.
  - Merriweather für Texte: für den Bildschirm gebaut, gut lesbar, kräftiger und breiter als
    Literata.
  - Montserrat nur für die Bibelstellen: verworfen, weil dann zwei serifenlose Schriften
    nebeneinander stünden. Wenn Montserrat, dann statt Source Sans überall.
  - Vergleich in der Demo (links heute, Mitte Merriweather + Montserrat, rechts Literata +
    Montserrat) ergab: Montserrat läuft breit, lange Stellen wie „1. Thessalonicher 5,1-11“
    brechen eher um; „1. Mose 1“ wirkt wie ein Schild statt wie aus einem Buch.
- **Empfehlung:** bei Literata und Source Sans bleiben. Sonst als Paar Merriweather und
  Montserrat, für die ganze App.
- **Aufwand einer Umstellung:**
  - Klein: zwei Pakete tauschen, fünf Importe in `src/main.tsx`, zwei Zeilen in `tokens.css`.
    Gebraucht werden 400, 400 kursiv und 600. Keine Daten betroffen.
  - Mittel: alle Ansichten in Handybreite (etwa 25, hell und dunkel) durchgehen und Größen und
    Abstände nachjustieren, weil beide neuen Schriften breiter laufen (Kacheln, Knöpfe,
    Wochentage, untere Leiste).
  - Danach: Bildschirmfotos der Anleitung neu (`docs/anleitung/`, Skript vorhanden) und die
    Artefakte („Henoch am Sonntag“ u. a.) angleichen.
- **Vorgehen, wenn es so weit ist:** zuerst eine Schriftprobe als eigene Demo, die Andreas ein
  paar Tage auf dem Handy liest, vor allem morgens. Erst danach die App umstellen.

## Schwerpunkt Lehre

Beschlossen am 14.10.2026. Der Schwerpunkt liegt jetzt auf dem Inhalt der Lehre. **Berichtigung vom
15.10.2026:** Es gilt kein Stopp für neue Funktionen. Andreas meinte nur „erstmal keine“: Eine App lebt von
guten Neuerungen, die jederzeit willkommen sind. Erwartet werden
zwei Texte, die Andreas als bereinigten Export liefert (Wortlaut verbindlich, Prüfung Wort für Wort
gegen `reference/`, wie bei den Adventslektionen in `data/advent-lektionen.json`):

- **Dieffenbach, Evangelische Haus-Agende (1853): die tägliche Lesung.** Konzept (Bilder vom 13.10.2026):
  in der Vesper unter „Wort“ als dritte Wahl neben „Lesung“ und „Andacht“; bei der Gewohnheit
  „Familienandacht“ unter „Heute“ ein Knopf „Lesen“; dasselbe Fenster wie bei Löhe; unter „Darstellung“
  ein Schalter „Haus-Agende am Abend“. Kein Rückstand, kein Nachholen (Regel 6). Offen: Wie ist die
  Tageslesung aufgebaut (Bibellektion mit Auslegung für jeden Tag, oder nur eine Tafel mit Stellen)?
  Zuerst ein Festkreis (Advent bis Epiphanias), das ganze Jahr danach.
- **Löhe, Haus-, Schul- und Kirchenbuch (Erster Theil, 4. Aufl.): die Erklärung zum Katechismus.**
  Entschieden: nur unter Wort › Lehre, nicht in der Stillen Zeit. Auf der Seite jedes Hauptstücks ein
  eingeklapptes Feld „Erklärung von Wilhelm Löhe“ mit Fragen und Antworten; Fragen zum ganzen Katechismus
  auf der Übersichtsseite der Lehre. Beginn mit „Einleitende Fragen zum ersten Hauptstück“ (Foto S. 31,
  Nr. 17 ff.). Der Text kommt als bereinigter Export, nicht aus der Fraktur abgelesen.
  **Stand 14.10.2026 (1.6.0):** Die Fragen und Antworten zu den Hauptstücken (Nr. 1–769) sind eingebaut,
  nach der Ausgabe Stuttgart 1845 (Digitalisat der Bayerischen Staatsbibliothek), nicht nach der 4. Auflage.
  Wort-Erklärungen, Spruchkatechismus, Rosinus und Kindergebete sind nicht übernommen. Einige Stellen, an
  denen die Texterkennung unleserlich war, sind nach dem Sinn ergänzt und sollten am Scan geprüft werden:
  Nr. 34 („zum Lager“), 88, 131, 136, 161 („Kinder“), 238, 244, 256, 259, 272, 273 („Herrschaft“), 298,
  308, 345 („Vereinigung“), 461, 523, 584, 589, 619 („geschehenden“), 697 („am 11.“), 730, 736; dazu die
  Stellenangaben Luc. 24 (Nr. 246, 248; Scan: 26) und Luc. 1 (Nr. 563; Scan: 2).
- **„Lehre und Wehre“:** Vorschlag B (Überschrift über den lutherischen Bekenntnissen im Konkordienbuch,
  mit einem Satz zu Walthers Zeitschrift); der Bereich selbst heißt weiter „Lehre“. Noch nicht entschieden.
- Zur Schrift der App siehe oben: erst vor dem Druck der Visitenkarten.

## Mögliche Neuerungen (Ideen, nicht beschlossen)

- **Gerätewechsel iPhone/iPad:** Heute hat jedes Gerät seinen eigenen Bestand (Regel 10); Sichern und
  Einspielen unter Deine Daten ersetzt den Bestand. Denkbar: freiwilliger, Ende-zu-Ende verschlüsselter
  Abgleich (CLAUDE.md sieht ihn vor), oder ein Einspielen, das zusammenführt, statt zu ersetzen.
- **Passionszeit** als zweite Gelegenheit für die Wüstenzeit (Aschermittwoch bis Karsamstag, Matthäus 4,1).
