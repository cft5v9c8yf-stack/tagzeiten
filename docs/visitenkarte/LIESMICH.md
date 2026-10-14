# Visitenkarte Henoch

Quadratische Visitenkarte, 55 × 55 mm, mit 2 mm Anschnitt an jeder Seite (Seitengröße 59 × 59 mm).

- **Vorderseite:** das Bild des App-Symbols randlos über die ganze Fläche, in den Nachtfarben der App (Nachtblau, Gold), darin „Henoch“ und „mit Gott unterwegs“; die Farben stehen oben in `.front`
- **Rückseite:** QR-Code zu https://henoch.app/ und darunter die Adresse

Dateien:

- `henoch-visitenkarte.pdf` – Druckdatei, Seite 1 Vorderseite, Seite 2 Rückseite
- `visitenkarte.html` – Quelle; das Symbol ist als Vektorgrafik nachgezeichnet, die Schriften kommen aus `../anleitung/fonts/`
- `vorschau.png` – Ansicht beider Seiten

Die PDF entsteht aus der HTML-Datei mit Chromium (Drucken, Hintergrundgrafiken an, Ränder keine).
Verlangt die Druckerei ein anderes Format (z. B. 65 × 65 mm) oder einen anderen Anschnitt, `--trim`,
`--bleed` und `@page { size }` in `visitenkarte.html` anpassen und neu drucken.
Die Farben sind RGB; wandelt die Druckerei nicht selbst nach CMYK, vorher nachfragen.
