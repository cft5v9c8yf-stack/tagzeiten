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

## Notizbuch 2027 (A5, fadengeheftet)

Ein gedrucktes Buch für das ganze Jahr, aus denselben Vorlagen, auf A5 verkleinert (Faktor 0,7047):
768 Seiten in 48 Lagen zu 16 Seiten.

```sh
GN=1 BUCH=1 node build.mjs
python3 buch.py
```

Das ergibt drei Dateien (nicht im Repository, je etwa 14 MB):

- `Henoch_Notizbuch_2027_A5.pdf`: Seite für Seite, A5, zum Ansehen oder für den Copyshop.
- `Henoch_Notizbuch_2027_A5_Beschnitt.pdf`: dasselbe mit 3 mm Beschnitt und TrimBox, für die Druckerei.
- `Henoch_Notizbuch_2027_Lagen_A4.pdf`: ausgeschossen auf A4 quer, je Lage vier Bögen; beidseitig
  drucken (an der kurzen Kante wenden), je vier Bögen ineinanderlegen, falzen, heften.

Aufbau: Titel, Zum Gebrauch, Kirchenjahr 2027 (alle Sonntage mit Seitenzahl), Jahresausblick; dann
Woche für Woche auf 14 Seiten: Predigtnotiz und Mitnehmen (Sonntag), Bibellese für jeden Tag,
Wochenrückblick nach dem Freitag, Samstag mit freier Seite, Bibelstudium (im Wechsel Abschnitt, Wort,
Person, Ort) mit Ertrag. Monatsdeckblätter stehen vor der ersten Woche, deren Sonntag in den Monat
fällt; davor links die Quartalsreflexion oder eine freie Seite. Am Ende Jahresrückblick und freie Seiten.

Sonntagsnamen, Evangelium, Epistel und Wochenspruch kommen aus der App (`kirchenjahr2027.json`,
erzeugt aus `kirchenjahr.ts`: mit esbuild bündeln und mit node ausführen). Für ein anderes Jahr die
Jahreszahl in `kirchenjahr.ts` und `YEAR` in `build.mjs` ändern; der Aufbau der ersten und letzten
Tage ist auf 2027 zugeschnitten (1. Januar ein Freitag) und muss dann angepasst werden.
