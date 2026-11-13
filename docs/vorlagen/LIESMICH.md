# Vorlagen „Lesen und Hören“

Henoch zum Schreiben: Vorlagen für GoodNotes (oder Papier) im Design der App. Sie gehören nicht
zur App und werden nicht mit ihr gebaut.

## Dateien

- `Henoch_Tagebuch_lesen_hoeren_komplett.pdf`: alle Vorlagen in einer Datei, 36 Seiten, mit
  Lesezeichen. Das ist die Datei für die Homepage.
- `Henoch_GoodNotes.zip`: dieselben Vorlagen als einzelne PDFs, zum Anlegen als GoodNotes-Vorlagen.
- `build.mjs`: erzeugt alle Seiten (HTML → PDF mit Playwright und Chromium).
- `komplett.py`: fügt die Seiten in der richtigen Reihenfolge zu einer Datei zusammen (pypdf).
- `monatsverse.json`: die Verse der Monatsdeckblätter.

## Aufbau der Gesamtdatei

Nach dem Rhythmus geordnet: Deckblatt, Inhalt, Zum Gebrauch, Inhaltsverzeichnis zum Ausfüllen;
jeden Tag (Bibellese, Vertiefen), am Sonntag (Predigtnotiz, Mitnehmen), jede Woche (Wochenrückblick
auf zwei Seiten, Woche kompakt quer), jeder Monat (zwölf Deckblätter), jedes Quartal, jedes Jahr
(Ausblick, Rückblick); dazu das Bibelstudium (Abschnitt, Wort, Person, Ort, Abschrift, Stellen,
Notizen, Skizze, Ertrag) und eine freie Seite.

Die Seiten folgen den Regeln aus `CLAUDE.md`: erst das Wort, dann das Gebet, zuletzt die
Ausrichtung; Rückschau und Prüfung getrennt, die Prüfung „wird gebetet, nicht notiert“ und endet mit
1. Joh. 1, 9; Haus vor Gemeinde vor Arbeit; keine Kennzahlen, Bewertungen oder Kästchen zum Abhaken.
Die Reflexionsseiten gehen in drei Schritten: Bestandsaufnahme, Reflexion, Entwicklung.

## Bibelverse

Zitiert wird nur Luther 1912, Wort für Wort aus dem Paket `xmlbible-lut1912`: 1. Joh. 1, 9 und die
zwölf Monatsverse. Bei Psalm 128 fehlen die Überschrift und Vers 2 (die digitale Ausgabe schreibt
dort „Hände arbeit“); in Jeremia 17, 8 fehlt in der digitalen Ausgabe ein Komma vor „sondern“.
Alle anderen Stellen stehen nur als Angabe, ohne Text.

## Neu erzeugen

Im Ordner `docs/vorlagen`:

```sh
GN=1 node build.mjs
python3 komplett.py Henoch_Tagebuch_lesen_hoeren_komplett.pdf
(cd goodnotes && zip -q -X ../Henoch_GoodNotes.zip $(ls *.pdf | grep -v _alle))
```

Gebraucht werden Node mit Playwright (Chromium) und Python mit `pypdf`. Die Schriften kommen aus
`docs/anleitung/fonts`, das Logo aus `public/icons/icon-512.png`. Zwischendateien (HTML, `goodnotes/`,
`komplett/`) sind in `.gitignore` ausgenommen.

## Auf die Homepage

1. `Henoch_Tagebuch_lesen_hoeren_komplett.pdf` in den Webspace laden, zum Beispiel nach `/vorlagen/`.
2. Von der Homepage darauf verlinken, etwa: „Henoch zum Schreiben: Vorlagen für GoodNotes (PDF, 2 MB)“.
