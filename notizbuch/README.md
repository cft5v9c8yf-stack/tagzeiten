# Henoch als Notizbuch – archiviert

Stand: 14.10.2026. Das Projekt ruht. Alles liegt auf dem Zweig `notizbuch-musterseiten`; nichts davon ist in `main`.

## Was hier liegt

| Datei | Inhalt |
|---|---|
| `advent.py` | **Henoch im Advent** – der letzte und ausgereifteste Stand. 128 Seiten A5, vom 1. Sonntag im Advent bis zum Heiligen Abend. |
| `app_texte.ts` | Gibt die Texte der App als JSON aus; `advent.py` liest alles daraus (keine Kopie im Repository). |
| `build.py`, `ordnung.py` | Erster Entwurf: 13-Wochen-Band (288 S.) mit der Ordnung aus dem Gebetsheft. |
| `kirchenjahr.py`, `texte.py` | Undatierter Kirchenjahr-Band (704 S.), eine Seite je Werktag. |
| `arena.py` | Musterseiten Gebetskammer und Eisenschmiede (Vorläufer der Arena in `advent.py`). |
| `henoch-*.html`, `*-druck.html`, `*.pdf` | Erzeugte Vorschauen, Druck-HTML, Musterseiten und Druckvorlagen. |

Ältere Entwürfe (`build.py`, `kirchenjahr.py`, `arena.py`) entsprechen nicht mehr dem letzten Stand (z. B. „Winter Arc“, Archiv-Felder).

## Henoch im Advent (`advent.py`)

- **Aufbau:** vorn 15 Seiten (Adventszeit, Weg durch die Stille Zeit, Lesemethode, Kranz, Ordnung mit allen Texten, Nachtgebet, Mein Haus, Gebetsübersicht, Heute, Gewohnheiten). Dann 4 Wochen zu 22 Seiten: Sonntag 8 S. (Wochenspruch, Dieffenbach 2 S., Löhe 1 S., Stille Zeit, Gottesdienst, Wochenrückblick), Wochenübersicht der Gewohnheiten und „Diese Woche“ (2 S.), Montag bis Samstag je eine Doppelseite. Am Ende Christfest, Arena (Gebetskammer 13 Einträge, Eisenschmiede 7 Treffen), Quellen.
- **Tagesseite:** oben die Kacheln wie „Heute“ in der App, links Eröffnung und Wort, rechts Gebet, Antwort, Ausrichtung, Segen und der Abend.
- **Einband (nur Vorschau):** Leder weinrot, vorn „Henoch“ in Gold, Rücken „Mit Gott durch den Tag“, hinten 1. Mose 5,24 (Luther 1912, gegen `xmlbible-lut1912` geprüft), drei Seitenbänder (Gold, Grün, Blau). Kein Kreuz.
- **Vorschau:** https://claude.ai/artifact/7uukFqb2nz8DoiSUDhsfNU

### Bauen

```
TSX="npx --yes tsx" python3 notizbuch/advent.py
```

Schreibt `henoch-advent.html` (Vorschau mit abschaltbarer Beispielschrift) und `henoch-advent-druck.html` (A5, für PDF). Texte, Felder, Schrittsymbole (`src/ui/FlowIcon.tsx`), Farben (`src/styles/tokens.css`) und die Arena-Texte (`src/features/arena/ArenaPage.tsx`) kommen aus der App; ändert sich dort ein erwarteter Text, bricht der Bau ab.

## Offene Punkte, falls es weitergeht

- **Ganzes Kirchenjahr:** mit Andachten ca. 1.312 Seiten (57 Wochen × 22), ohne Andachten ca. 1.200 (57 × 20). Sinnvoll in vier Bänden zu je etwa 320–380 Seiten.
- **Andachten:** In der App liegen Dieffenbach nur für Advent 1–4 und Trinitatis 18, Löhe für Advent 1–4, Christfest, Christfest 1–2, Trinitatis 17–18. Der Rest müsste wortgetreu übertragen werden (CLAUDE.md: keine selbst geschriebenen Andachten, sonst `[TEXT VON ANDREAS: …]`).
- **Einband für den Druck:** eigene Datei mit Beschnitt und Rückenbreite, abhängig von Papier und Bindung.
- Nicht beantwortet: Dieffenbachs Vorwort vorn abdrucken?
