# Pieper, Christliche Dogmatik: Quelltext

Francis (Franz) Pieper, *Christliche Dogmatik*, 3 Bände, St. Louis: Concordia
Publishing House 1917 (Band 2), 1920 (Band 3), 1924 (Band 1). Pieper starb 1931;
der Text ist gemeinfrei.

## Herkunft

Die Dateien `band1a.txt` … `band3b.txt` sind die Textschicht (`pdftotext -layout`)
der PDF-Fassungen, die „BackToLuther“ 2015–2017 als Abschrift des Frakturdrucks
auf archive.org veröffentlicht hat:

| Datei | archive.org | Seiten |
|---|---|---|
| band1a.txt | Pieper_ChristlicheDogmatikVol1a_1-333 | 1–333 |
| band1b.txt | Pieper_ChristlicheDogmatikVol1b_334_690 | 334–690 |
| band2a.txt | Pieper_ChristlicheDogmatikVol2a_1-358 | 1–358 |
| band2b.txt | Pieper_ChristlicheDogmatikVol2b_359-672 | 358–672 |
| band3a.txt | Pieper_ChristlicheDogmatikVol3a_1-296 | 1–296 |
| band3b.txt | Pieper_ChristlicheDogmatikVol3b_296-626 | 297–626 |

Die Scans des Drucks zum Nachprüfen: `Christliche_Dogmatik_Erster_Band` (Bildnummer
= Seite + 10), `Christliche_Dogmatik_Zweiter_Band`, `Christliche_Dogmatik_Dritter_Band`.

## Aufbereitung

`node scripts/dogmatik/build.mjs` erzeugt daraus `data/dogmatik/band-1.json` bis
`band-3.json`, je 365 Tage. Der Bericht über alle Eingriffe steht in `BERICHT.md`.

- **Entfernt:** Seitenköpfe, englische Notizen der Abschrift („[English ed. 81]“,
  „[see here]“), Verweise auf die englische Ausgabe.
- **Berichtigt:** Trennungen am Zeilenende, Anführungszeichen, Striche, eine
  geprüfte Liste von Lesefehlern (`scripts/dogmatik/ocr.mjs`), Fußnotenziffern
  mit Tippfehlern (im Bericht einzeln aufgeführt).
- **Hebräisch:** in der Abschrift nur teilweise und meist verderbt; jede Stelle
  steht als „[hebräisch]“ und ist am Scan nachzutragen.
- **Griechisch:** wie in der Abschrift, mit Lesefehlern; nur „ϑ/ΰ“ → „θ“.
- **Durchgesehen:** Tage mit `"geprueft": true` sind von Hand gegen den Druck
  geprüft. Ihr Wortlaut und ihre Grenzen bleiben beim nächsten Lauf erhalten.

## Einen Tag durchsehen

1. Den Tag in `data/dogmatik/band-N.json` gegen den Scan lesen und berichtigen.
2. `"geprueft": true` setzen; Ergänzungen (Bibelwort, Kernsatz, Frage, Übersetzung
   lateinischer Zitate) nach Wunsch.
3. `node scripts/dogmatik/build.mjs` muss danach unverändert durchlaufen; die
   Tests prüfen Fußnoten und Bibelworte.
