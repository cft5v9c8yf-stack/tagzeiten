# Backlog

Vorhaben, die vorgemerkt, aber noch nicht begonnen sind.

## Lutherische Bekenntnisschriften unter Katechismus / Anhang

Gewünscht (26.09.2026): die Bekenntnisschriften im Anhang des Katechismus, mit
Volltextsuche, Filtern und passenden Bibelstellen.

Stand:

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
