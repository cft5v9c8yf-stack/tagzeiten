# Visitenkarte Henoch

Quadratische Visitenkarte für Vistaprint, 65 × 65 mm, mit 1,5 mm Anschnitt an jeder Seite (Seitengröße 68 × 68 mm).

- **Vorderseite:** das Bild des App-Symbols randlos über die ganze Fläche in den Farben des Symbols wie auf der Homepage, darin „Henoch“ und „Mit Gott durch den Tag.“; die Farben stehen oben in `.front`
- **Rückseite:** QR-Code zu https://henoch.app/ und darunter die Adresse

Dateien:

- `henoch-visitenkarte-vorderseite.pdf` und `henoch-visitenkarte-rueckseite.pdf` – Druckdateien, je eine Seite
- `visitenkarte.html` – Quelle; das Symbol ist als Vektorgrafik nachgezeichnet, die Schriften kommen aus `../anleitung/fonts/`
- `vorschau.png` – Ansicht beider Seiten

Die PDFs entstehen aus der HTML-Datei mit Chromium (Drucken, Hintergrundgrafiken an, Ränder keine; Seite 1 und Seite 2 getrennt).
Verlangt die Druckerei ein anderes Format (z. B. 55 × 55 mm) oder einen anderen Anschnitt, `--trim`,
`--bleed` und `@page { size }` in `visitenkarte.html` anpassen und neu drucken.
Die Farben sind RGB; wandelt die Druckerei nicht selbst nach CMYK, vorher nachfragen.
