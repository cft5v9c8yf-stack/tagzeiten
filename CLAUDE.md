# CLAUDE.md – Dauerhafte Regeln für „Henoch" (früher „Tagzeiten")

Diese Regeln gelten für jede Zeile Code und jeden Text in der App. Wenn eine Anforderung mit ihnen kollidiert, halte an und frage.

## Gesetz und Evangelium

1. **Jede Selbstprüfung endet im Zuspruch.** Wo die App zur Prüfung auffordert (Abendprüfung, Beichte im vierfachen Kranz), folgt immer ein Vergebungswort (z. B. 1. Joh 1,9, Absolution). Eine Prüfung ohne anschließenden Zuspruch ist ein Fehler.
2. **Gottes Wort steht vorn, der Vorsatz hinten.** Die Reihenfolge in allen Abläufen ist: Wort → Gebet → Ausrichtung. Nie beginnt ein Ablauf mit Zielen, Plänen oder Selbstprüfung.
3. **Rückschau ist nicht Beichte.** Die abendliche Rückschau auf die drei Vorsätze („Was ist geschehen?") und die Prüfung am Dekalog („Wo bin ich schuldig geblieben?") sind zwei getrennte Schritte in dieser Reihenfolge, nie vermischt. Ein nicht erreichtes Ziel ist keine Sünde und wird nie so behandelt.

## Ordnung des Lebens

18. **Die Reihenfolge gilt immer: Gott, Familie (Haus), Gemeinde, Arbeit, ich.** Wo die App Lebensbereiche nennt, ordnet oder gegeneinander abwägt, steht das Haus vor der Gemeinde und die Gemeinde vor der Arbeit. Das gilt auch für übernommene Pläne; Abweichungen werden angepasst und im Kopf der Quelldatei vermerkt.

## Keine Leistungsmechanik

4. **Keine Serienzähler (Streaks), keine Ketten, keine Abzeichen, keine Punkte, keine Ranglisten.** Auch nicht „dezent". Fortschritt wird dokumentiert (Kapitel gelesen, Katechismusstücke auswendig, Stille Zeiten in 30 Tagen), aber nie als Leistung bewertet.
5. **Keine roten Markierungen für Versäumtes.** Fehlende Tage sind neutral grau, nicht rot. Die Akzentfarbe Rot ist für liturgische Rubriken reserviert.
6. **Kein Rückstand.** Der Leseplan läuft nach Fortschritt, nicht nach Datum. Wer drei Tage aussetzt, macht beim nächsten Abschnitt weiter. Es gibt nie „Du bist 12 Kapitel im Rückstand".
7. **Benachrichtigungen (später) nie mit Schuldgefühl.** Kein „Du hast gestern nicht gebetet". Erlaubt ist eine Erinnerung an die Zeit, nicht an ein Versäumnis.
8. **Kurzformen sind vollwertig.** Jede Ordnung hat eine Kurzform. Wer sie betet, hat die Ordnung erfüllt; die App behandelt das nicht als „teilweise".

## Privatsphäre

9. **Sünden werden nie gespeichert.** Es gibt kein Eingabefeld für Sündenbekenntnis, weder in der Abendprüfung noch im vierfachen Kranz. Die Oberfläche sagt an dieser Stelle: „Wird gebetet, nicht notiert."
10. **Lokal zuerst.** Alle Einträge liegen standardmäßig nur auf dem Gerät (IndexedDB). Eine spätere Synchronisierung ist opt-in und Ende-zu-Ende verschlüsselt. Keine Analytik, keine Tracker, keine Drittanbieter-Skripte außer Schriften.
11. **Export gehört dem Nutzer.** Jederzeit vollständiger Export als Markdown und JSON, und vollständiges Löschen.

## Texte und Urheberrecht

12. **Nur gemeinfreie Texte einbetten:** Lutherbibel 1912, Luthers Kleiner Katechismus in traditioneller Fassung, Lieder vor 1900 (Herman, Alber, Gerhardt, Niege), Gebete lutherischer Verfasser vor 1900 (z. B. Habermann, Arndt), wortgetreu. **Keine** Texte aus Luther 2017, Luther 1984, dem Evangelischen Gesangbuch in moderner Bearbeitung oder anderen geschützten Ausgaben. *Ausnahme auf ausdrücklichen Wunsch (30.09.2026):* das Nizänische Glaubensbekenntnis in der heutigen ökumenischen Fassung im Anhang „Die drei Bekenntnisse“.
13. **Keinen vollständigen Bibeltext einbetten.** Die App nennt Bibelstellen nur als Text, ohne Links. Die gedruckte Bibel ist das führende Element; der Nutzer liest auf Papier mit Farbstiften.
14. Die Lesemethode stammt von **Hanniel Strebel** („Überblick: Hanniel zum Lesen der Bibel", hanniel.ch, 31.08.2026). In der App mit Quellenangabe nennen, in eigenen Worten beschreiben, nicht wörtlich übernehmen.

## Sprache und Ton

15. Oberfläche vollständig auf **Deutsch**, Anrede **du**. Code, Bezeichner und Kommentare auf Englisch.
16. Ton: nüchtern, warm, männlich ohne Pose. Kein Motivationsvokabular („Du schaffst das!", „Level up"), keine Emojis in der Oberfläche. Luthers Sprache darf stehen bleiben („flugs und fröhlich geschlafen").
17. Buttons sagen, was passiert („Stille Zeit abschließen", nicht „Fertig!").

## Arbeitsweise in Claude-Sitzungen

Am 06.10.2026 aus der ersten, langen Sitzung übernommen, damit jede neue Sitzung damit weiterarbeiten kann.

- **Zweig:** Gearbeitet und gepusht wird nur auf `claude/focused-pascal-sol6ng` (PR #1 nach `main`).
- **Nie umbenennen:** den Namen der Datenbank (`'tagzeiten'` in `src/data/db.ts`) und `BACKUP_FORMAT` (`'tagzeiten'` in `src/domain/backup.ts`). Sonst findet die App die Einträge und alte Sicherungen nicht mehr.
- **Die App startet immer auf „Heute“**, auch am Sonntag.
- **Vor jedem Push:** `npx vitest run`, `npm run build` (prüft auch die Typen) und `npm run build:demo`. Schlägt etwas fehl, wird nicht gepusht.
- **Jede sichtbare Änderung bekommt eine Version:** Nummer in `package.json` und `package-lock.json` anheben, Eintrag oben in `src/content/changelog.ts`, in den Worten der App. Bei einer neuen Nebenversion (0.x.0) auch die Versionsmuster in `src/features/settings/SettingsPage.test.tsx` anpassen. Commit-Titel auf Deutsch, mit der Version in Klammern, z. B. „Sonntag: … (0.36.0)“.
- **Demo:** Nach dem Push `npm run build:demo` und beide Dateien unter ihrer bisherigen Adresse neu veröffentlichen: `dist-demo/tagzeiten-demo.html` unter https://claude.ai/artifact/E78ZqtEoD8Mhv7ADGAr39F und die Sonntagsvorschau `dist-demo/tagzeiten-demo-sonntag.html` (Uhr auf dem kommenden Sonntag, Sonntagsruhe eingeschaltet) unter https://claude.ai/artifact/WvrdSzyrsMFU2oMUu4Lnkb. In einer neuen Sitzung jedes Artefakt vorher einmal lesen.
- **Bibeltexte** Wort für Wort gegen Luther 1912 prüfen (README, Paket `xmlbible-lut1912`; die Pipeline auf GitHub prüft mit `LUT1912_DIR`). In Psalm 62,2 ist die digitale Ausgabe fehlerhaft.
- **Geistliche Texte** wie Gebete oder Andachten schreibt Claude nicht selbst; Bibelworte und gemeinfreie Texte nach Regel 12 sind erlaubt. Fehlt ein Text, steht ein Platzhalter `[TEXT VON ANDREAS: …]`.
- **Vorschläge für Andachtsliteratur** nur von lutherischen Verfassern.
- **Sprache:** gutes, natürliches Deutsch, kein übersetztes Deutsch. Lange Wörter in schmalen Spalten mit Silbentrennung.
- **Kleine Diffs:** keine Datei als Ganzes neu formatieren.
- **Limit sparen:** Screenshots nur, wenn eine Darstellung wirklich geprüft oder gezeigt werden muss. Keine stündlichen Erinnerungen. Für ein neues Thema eine neue Sitzung; das Wissen steht hier und in `docs/backlog.md`.
- **Weitere Artefakte:** „Henoch am Sonntag“ (Hilfe für das Haus und Gebetsgang als eigene Seite, Quelltext nicht im Repository): https://claude.ai/artifact/UiZea7Krxu37ectiXBU9YC · Entwurf der Widgets: https://claude.ai/artifact/5NL6udynWnCejjAorL6grt · „Henoch Listenmuster“: https://claude.ai/artifact/Dmbq6dK5V7imyq9GJDKY7V · Anleitung „Henoch Schritt für Schritt“ (Quelle und Paket für die Homepage in `docs/anleitung/`): https://claude.ai/artifact/5X8JZdiDqBTHc1NeXrKQds
