# Anleitung „Henoch Schritt für Schritt“

Eine eigenständige Seite für die Homepage: `index.html` mit den Bildschirmfotos in `img/` und
den Schriften der App in `fonts/` (Literata und Source Sans 3, SIL Open Font License, Lizenzen
liegen bei). Die Seite ruft keine fremden Server auf, setzt keine Cookies und braucht weder PHP
noch eine Datenbank.

## Online stellen

1. Den ganzen Ordner `anleitung` (mit `img` und `fonts`) in das Hauptverzeichnis des Webspace
   laden, zum Beispiel bei IONOS über den Webspace-Explorer oder per SFTP.
2. Die Seite ist dann unter `https://<domain>/anleitung/` erreichbar.
3. Von der Startseite der Homepage auf `/anleitung/` verlinken.

## Pflegen

Die Bilder stammen aus der Demo-Fassung (`npm run build:demo`) bei 390 × 844 Punkten und doppelter
Auflösung, mit ausgeblendetem Demo-Hinweis. Ändert sich die App sichtbar, die betroffenen Bilder
neu aufnehmen und den Text in `index.html` anpassen. Eine Vorschau liegt als Artefakt unter
https://claude.ai/artifact/5X8JZdiDqBTHc1NeXrKQds.
