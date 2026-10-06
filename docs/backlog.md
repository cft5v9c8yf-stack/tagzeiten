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
| Wochenrückblick nach den Ständen | umgesetzt in 0.37.0 | Zuspruch `[TEXT VON ANDREAS]` |
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
   denselben Daten. Am Ende der Zuspruch `[TEXT VON ANDREAS]`. Inhalte in
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
