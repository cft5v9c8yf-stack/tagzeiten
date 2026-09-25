# Prompt für Claude Code: „Tagzeiten" – eine App für lutherische Männer

> Diesen Prompt als erste Nachricht in Claude Code verwenden. Vorher in das leere Projektverzeichnis legen:
> - `reference/prototype.html` – der funktionierende Prototyp (aus claude.ai)
> - `reference/tagzeiten-morgen-und-abend.pdf` – das Gebetsheft mit allen Texten und Ordnungen
>
> Den Abschnitt „Dauerhafte Regeln" nach dem ersten Lauf als `CLAUDE.md` im Projekt ablegen, damit er in jeder Sitzung gilt.

---

## Deine Rolle

Du baust mit mir eine produktionsreife Progressive Web App namens **Tagzeiten**. Du bist Senior-Entwickler und zugleich aufmerksamer Leser der theologischen Vorgaben unten. Diese Vorgaben sind keine Dekoration. Sie bestimmen Funktionen, Texte und vor allem, was die App **nicht** tut.

Arbeite in Etappen. Lies zuerst `reference/prototype.html` vollständig und die Texte im PDF. Schlage dann einen Umsetzungsplan vor (Projektstruktur, Datenmodell, Reihenfolge der Meilensteine) und warte auf mein Okay, bevor du Code schreibst. Frage nach, bevor du Abhängigkeiten hinzufügst, die nicht unten stehen.

---

## Wofür die App da ist

### Zielgruppe

Christliche Männer lutherischer Konfession, oft in freikirchlich-evangelikalen oder brüdergemeindlichen Gemeinden mit lutherischer Prägung. Sie sind Ehemänner, Väter, Berufstätige und tragen Verantwortung in der Gemeinde, als Prediger, Älteste, Jugendleiter. Sie stehen früh auf, haben wenig Zeit und fühlen sich zwischen **Familie, Gemeinde, Arbeit und sich selbst** zerrieben. Viele haben Andachtsroutinen begonnen und wieder verloren.

### Ziel

1. **Glauben stärken** – durch tägliche Nähe zu Gottes Wort, Katechismus und Gebet, nicht durch Motivation.
2. **Strukturen festigen** – eine Morgen- und Abendordnung, die trägt, auch wenn der Tag anders läuft.
3. **Männern helfen** – ihre Stände (Ehemann, Vater, Beruf, Gemeinde, Nächster) vor Gott zu ordnen, statt jedem Bereich hinterherzulaufen.

### Theologischer Kern: Beruf und Stand

Die App beruht auf Luthers Lehre von der **Berufung im Stand**. Der Mann dient Gott nicht neben seiner Familie und Arbeit, sondern in ihnen. Die App ist darum kein fünfter Lebensbereich, der auch noch bedient werden will. Sie ordnet die vier, die schon da sind. Jede Funktion muss sich an dieser Frage messen lassen: **Entlastet sie oder belastet sie?**

---

## Dauerhafte Regeln (→ `CLAUDE.md`)

Diese Regeln gelten für jede Zeile Code und jeden Text in der App. Wenn eine Anforderung mit ihnen kollidiert, halte an und frage.

### Gesetz und Evangelium

1. **Jede Selbstprüfung endet im Zuspruch.** Wo die App zur Prüfung auffordert (Abendprüfung, Beichte im vierfachen Kranz), folgt immer ein Vergebungswort (z. B. 1. Joh 1,9, Absolution). Eine Prüfung ohne anschließenden Zuspruch ist ein Fehler.
2. **Gottes Wort steht vorn, der Vorsatz hinten.** Die Reihenfolge in allen Abläufen ist: Wort → Gebet → Ausrichtung. Nie beginnt ein Ablauf mit Zielen, Plänen oder Selbstprüfung.
3. **Rückschau ist nicht Beichte.** Die abendliche Rückschau auf die drei Vorsätze („Was ist geschehen?") und die Prüfung am Dekalog („Wo bin ich schuldig geblieben?") sind zwei getrennte Schritte in dieser Reihenfolge, nie vermischt. Ein nicht erreichtes Ziel ist keine Sünde und wird nie so behandelt.

### Keine Leistungsmechanik

4. **Keine Serienzähler (Streaks), keine Ketten, keine Abzeichen, keine Punkte, keine Ranglisten.** Auch nicht „dezent". Fortschritt wird dokumentiert (Kapitel gelesen, Katechismusstücke auswendig, Stille Zeiten in 30 Tagen), aber nie als Leistung bewertet.
5. **Keine roten Markierungen für Versäumtes.** Fehlende Tage sind neutral grau, nicht rot. Die Akzentfarbe Rot ist für liturgische Rubriken reserviert.
6. **Kein Rückstand.** Der Leseplan läuft nach Fortschritt, nicht nach Datum. Wer drei Tage aussetzt, macht beim nächsten Abschnitt weiter. Es gibt nie „Du bist 12 Kapitel im Rückstand".
7. **Benachrichtigungen (später) nie mit Schuldgefühl.** Kein „Du hast gestern nicht gebetet". Erlaubt ist eine Erinnerung an die Zeit, nicht an ein Versäumnis.
8. **Kurzformen sind vollwertig.** Jede Ordnung hat eine Kurzform. Wer sie betet, hat die Ordnung erfüllt; die App behandelt das nicht als „teilweise".

### Privatsphäre

9. **Sünden werden nie gespeichert.** Es gibt kein Eingabefeld für Sündenbekenntnis, weder in der Abendprüfung noch im vierfachen Kranz. Die Oberfläche sagt an dieser Stelle: „Wird gebetet, nicht notiert."
10. **Lokal zuerst.** Alle Einträge liegen standardmäßig nur auf dem Gerät (IndexedDB). Eine spätere Synchronisierung ist opt-in und Ende-zu-Ende verschlüsselt. Keine Analytik, keine Tracker, keine Drittanbieter-Skripte außer Schriften.
11. **Export gehört dem Nutzer.** Jederzeit vollständiger Export als Markdown und JSON, und vollständiges Löschen.

### Texte und Urheberrecht

12. **Nur gemeinfreie Texte einbetten:** Lutherbibel 1912, Luthers Kleiner Katechismus in traditioneller Fassung, Lieder vor 1900 (Herman, Alber, Gerhardt, Niege). **Keine** Texte aus Luther 2017, Luther 1984, dem Evangelischen Gesangbuch in moderner Bearbeitung oder anderen geschützten Ausgaben.
13. **Keinen vollständigen Bibeltext einbetten.** Die App zeigt Bibelstellen und verlinkt auf bibleserver.com (LUT). Der Nutzer liest auf Papier mit Farbstiften; das ist Teil der Methode.
14. Die Lesemethode stammt von **Hanniel Strebel** („Überblick: Hanniel zum Lesen der Bibel", hanniel.ch, 31.08.2026). In der App mit Quellenangabe nennen, in eigenen Worten beschreiben, nicht wörtlich übernehmen.

### Sprache und Ton

15. Oberfläche vollständig auf **Deutsch**, Anrede **du**. Code, Bezeichner und Kommentare auf Englisch.
16. Ton: nüchtern, warm, männlich ohne Pose. Kein Motivationsvokabular („Du schaffst das!", „Level up"), keine Emojis in der Oberfläche. Luthers Sprache darf stehen bleiben („flugs und fröhlich geschlafen").
17. Buttons sagen, was passiert („Stille Zeit abschließen", nicht „Fertig!").

---

## Funktionsumfang

Der Prototyp in `reference/prototype.html` zeigt alle Funktionen der ersten Version und ihr Verhalten. Übernimm Verhalten und Texte, baue die Struktur sauber neu.

### 1. Heute (Startseite)

- **Tagesbogen**: horizontale Zeitleiste 04:00–21:00 mit den Blöcken Stille Zeit, Vesper, Nachtgebet; abgeschlossen = grün. Zeiten sind in den Einstellungen änderbar (nicht jeder steht um 4 auf).
- Zwei Kacheln: Stille Zeit (Status „x von 6 Schritten") und Vesper/Nachtgebet.
- **Heutige Lesung** (AT und NT) mit Links und Fortschrittsbalken (Kapitel gelesen / gesamt).
- **Die drei Dinge** des Tages mit abendlichem Zeichen (+ ~ –).
- **Gewohnheiten der Woche**: tägliche als 7 Punkte Mo–So; wöchentliche als „diese Woche", monatliche als „diesen Monat". Automatisch abgeleitete Gewohnheiten (Stille Zeit, Vesper, Nachtgebet) sind nicht manuell schaltbar.
- **Rückblick** über 28 Tage als neutrale Punktreihe, dazu drei Zahlen: Stille Zeiten in 30 Tagen, gesammelte Verse, Verteilung der Rückschau-Zeichen.
- **Diese Woche**: Katechismus-Hauptstück und Stück des Tages, Psalm am Morgen und Abend, Stand beim Auswendiglernen.

### 2. Morgen – Stille Zeit (45 Minuten)

Vorspann „Am Bett" (Morgensegen), dann sechs Schritte als Akkordeon mit Timer:

| Schritt | Minuten | Inhalt |
|---|---|---|
| 1 Eröffnung | 3 | Versikel, Gloria, optionaler Hymnus, Psalm des Wochentags mit Antiphon |
| 2 Das Wort | 20 | Ps 119,18; Lesung aus dem Plan; „Gelesen" rückt Plan weiter; Felder: Hauptaussage, Versstelle, Vers, über Gott, über den Menschen, Frage des Tages (1 aus 7), Heilsgeschichte, ? ! →; Schlussgebet nach Jes 55,11 |
| 3 Das Gebet | 12 | Katechismusstück des Tages (aufklappbar); vierfacher Kranz: Unterricht, Dank, Beichte (**ohne Feld**), Bitte; freies Gebet; Bitte für mich; Ps 37,7 und eine Minute Stille |
| 4 Die Antwort | 5 | Benedictus, Anliegen des Wochentags aus der Gebetsübersicht, Menschen heute, Vaterunser |
| 5 Die Ausrichtung | 3 | Drei Dinge: **Wort, Haus, Werk**; Vorschläge aus dem → der Lesung und aus „Morgen wieder" des Vorabends |
| 6 Der Segen | 2 | Kollekte, Benedicamus, Segen; „Stille Zeit abschließen" |

Kurzform (20 Min.) als eigener Modus: Psalm, Lesung einmal mit Doppelfrage, freies Gebet über den Vers, Vaterunser, drei Dinge, Segen.

### 3. Abend

- **Vesper** (10 Min., mit der Familie): Versikel, Hymnus, Psalm, Lesung (Feld), Magnificat, Fürbitte (Feld), Vaterunser, Kollekte, Segen; „Vesper abschließen". Familienmodus mit großer Schrift und V/A-Wechsel für Kinder.
- **Nachtgebet** (10 Min.): Kreuzzeichen, Glaube, Vaterunser → Dank (3 Felder) → **Rückschau** (drei Dinge vom Morgen, je + ~ –; bei ~ oder –: „Morgen wieder" oder „Fallenlassen") → **Prüfung** nach Stand des Wochentags mit passender Haustafel-Stelle, **kein Eingabefeld** → Bekenntnis und **Zuspruch** → Taufgedächtnis → Fürbitte, Weitergegeben an → Nunc dimittis (optional) → Abendsegen → „Tag abschließen".

### 4. Katechismus

- Vollständiger Kleiner Katechismus (traditionelle Fassung, siehe Prototyp): sechs Hauptstücke, Tischgebete, Haustafel mit Bibelstellen.
- Sechs-Wochen-Zyklus, Hauptstück der Woche wählbar; Stücke je Wochentag nach der Tabelle im Prototyp (`KMAP`).
- Pro Stück „auswendig" markierbar; Fortschritt x / 35.
- Knopf „Mit den Kindern gelernt" setzt die Gewohnheit für heute.
- **Hausvater-Modus** (neu in v1): ein Stück groß auf dem Bildschirm, Frage – Antwort zum Abfragen am Tisch, Antwort erst auf Tippen sichtbar.

### 5. Gewohnheiten

Vorlagen, lutherisch und auf den Mann als Hausvater, Ehemann, Bruder zugeschnitten:

- **täglich:** Stille Zeit (auto), Vesper mit der Familie (auto), Nachtgebet (auto), Tischgebet mit der Familie, Die Kinder segnen, Mit meiner Frau beten, Vers auswendig wiederholen, Leibliche Übung
- **wöchentlich:** Gottesdienst – den Feiertag heiligen, Katechismus mit den Kindern, Fasten, Gemeinschaft mit Brüdern, Zeit allein mit meiner Frau
- **monatlich:** Privatbeichte, Abendmahl, Opfer und Gaben, Werk der Barmherzigkeit

Eigene Gewohnheiten mit Rhythmus täglich, wöchentlich oder monatlich anlegen, umbenennen, löschen. Kein Serienzähler (Regel 4).

### 6. Archiv

Tage-Liste und **Versesammlung** (alle „Vers, den ich mitnehme" mit Stelle und Datum), Volltextsuche, Tag öffnen und nachträglich bearbeiten.

### 7. Mehr / Einstellungen

- Gewohnheiten verwalten
- **Gebetsübersicht**: tägliche Anliegen, ein Anliegen je Wochentag
- **Leseplan**: aktuelle Position AT und NT per Buch/Kapitel setzen
- Zeiten des Tagesbogens
- Farbschema: System / Hell / Dunkel (Standard: System; dunkles Schema für 04:00 sorgfältig gestalten)
- Export (Markdown, JSON), Import (JSON), alles löschen
- Über: Quellen (Luther 1912, Kleiner Katechismus, Hanniel Strebel), Hinweis zur Privatsphäre

### Leseplan

- **AT in rund zwei Jahren:** Kapitelmuster 2-1-1-1 wiederholt, Portion endet nie über eine Buchgrenze hinweg → 745 Portionen, 929 Kapitel.
- **NT jährlich:** 1 Kapitel pro Portion → 260 Portionen.
- NT in **Luthers Buchreihenfolge** (Hebräer, Jakobus, Judas vor der Offenbarung).
- Jedem Tag wird beim ersten Öffnen die nächste Portion zugewiesen; „Gelesen" rückt die Position weiter, Abwählen setzt zurück.
- Architektur so, dass weitere Pläne (M'Cheyne, chronologisch) später als Daten ergänzt werden können.

---

## Technik

- **React 18 + TypeScript + Vite**, als **PWA** (vite-plugin-pwa): offline-fähig, installierbar auf iOS über „Zum Home-Bildschirm".
- **Speicher:** IndexedDB über **Dexie**. Eine Datenbankschicht (`src/data/`) kapselt alle Zugriffe, damit später Sync ergänzt werden kann, ohne die UI anzufassen.
- **Styling:** CSS mit Custom Properties (Design-Tokens aus dem Prototyp), kein Tailwind, kein UI-Framework. Schriften: Literata (Texte), Source Sans 3 (Bedienelemente), lokal gebündelt statt von Google Fonts geladen.
- **Routing:** React Router, sechs Bereiche: `/`, `/morgen`, `/abend`, `/katechismus`, `/archiv`, `/mehr`; Datum als Query-Parameter für vergangene Tage.
- **Tests:** Vitest für die Logik. Pflicht-Tests:
  - Leseplan: 929 AT-Kapitel, 260 NT-Kapitel, keine Portion über Buchgrenzen, Weiterrücken und Zurücksetzen
  - Katechismus-Zuordnung: jeder Wochentag jedes Hauptstücks liefert gültige Stücke; 35 Stücke gesamt
  - Gewohnheiten: Wochen- und Monatslogik, automatisch abgeleitete Gewohnheiten
  - Rückschau: „Morgen wieder" erscheint am Folgetag als Vorschlag
  - Regel 9: Es existiert kein Datenfeld für Sündenbekenntnis (Test auf das Schema)
- **Barrierefreiheit:** Tastaturbedienung, sichtbarer Fokus, `prefers-reduced-motion`, ausreichende Kontraste in beiden Schemata, Safe Areas auf dem iPhone.

### Vorgeschlagene Struktur

```
src/
  content/        # gemeinfreie Texte als TypeScript-Daten
    liturgy.ts    # Versikel, Gloria, Cantica, Segen, Kollekten
    catechism.ts  # Kleiner Katechismus, Tischgebete, Haustafel, KMAP
    psalms.ts     # Psalmen und Antiphonen je Wochentag
    readingPlans.ts
    habits.ts     # Vorlagen
  data/           # Dexie-Schema, Repositories, Export/Import
  domain/         # reine Logik: Plan, Gewohnheiten, Katechismus-Tag, Stand des Tages
  features/
    today/  morning/  evening/  catechism/  archive/  settings/
  ui/             # Grundbausteine: PrayerText, Versicle, Field, TriState, Timer
  styles/tokens.css
```

### Datenmodell (Ausgangspunkt)

```ts
interface Profile {
  plan: { at: number; nt: number; planId: 'at2-nt1' };
  habits: Habit[];
  prayer: { daily: string; weekly: Record<0|1|2|3|4|5|6, string> };
  catechism: { memorized: Record<string, boolean>; weekOffset: number };
  schedule: { stillTime: string; vespers: string; compline: string; lightsOut: string };
  theme: 'system' | 'light' | 'dark';
}

interface Habit { id: string; name: string; rhythm: 'daily'|'weekly'|'monthly';
  auto: 'morning'|'vespers'|'compline'|null; active: boolean; preset: boolean; }

interface Day {
  date: string;                     // YYYY-MM-DD
  reading?: { at: number; nt: number; done: boolean };
  morning: { steps: boolean[]; done: boolean; atBed: boolean;
    mainPoint?: string; verseRef?: string; verse?: string; aboutGod?: string; aboutMan?: string;
    questionNo?: number; questionAnswer?: string; salvationHistory?: string;
    unclear?: string; challenge?: string; application?: string;
    wreath?: { instruction?: string; thanks?: string; petition?: string }; // bewusst ohne confession
    onMyHeart?: string; forMyself?: string; peopleToday?: string;
    three?: { word?: string; house?: string; work?: string } };
  evening: { vespersDone: boolean; complineDone: boolean;
    reading?: string; intercession?: string; thanks?: [string?, string?, string?];
    marks?: { word?: Mark; house?: Mark; work?: Mark };
    carry?: { word?: Carry; house?: Carry; work?: Carry };
    people?: string; passedOnTo?: string };
  habits: Record<string, boolean>;
}
type Mark = 'plus' | 'tilde' | 'minus';
type Carry = 'again' | 'drop';
```

---

## Meilensteine

1. **Gerüst:** Vite, TypeScript, PWA, Routing, Design-Tokens, Hell/Dunkel. Leere Bereiche mit Navigation.
2. **Inhalte und Logik:** `content/` und `domain/` aus dem Prototyp übernehmen, alle Pflicht-Tests grün.
3. **Datenbank:** Dexie-Schema, Repositories, Autosave (entprellt, eine Schreiboperation je Dokument zur Zeit).
4. **Morgen und Abend:** Abläufe vollständig, Timer, Kurzformen, Rückschau → Vorschlag am Folgetag.
5. **Heute:** Tagesbogen, Lesung, drei Dinge, Gewohnheiten, Rückblick.
6. **Katechismus, Archiv, Einstellungen** inkl. Hausvater-Modus, Export, Import, Löschen.
7. **Feinschliff:** iPhone-Test (Safe Areas, Installierbarkeit, Offline), Barrierefreiheit, Lighthouse-PWA-Prüfung.

Nach jedem Meilenstein: kurze Zusammenfassung, was fertig ist, was offen ist, und ob eine der Dauerhaften Regeln berührt wurde.

## Später (nicht in v1, aber Architektur darauf vorbereiten)

- Opt-in-Synchronisierung zwischen Geräten, Ende-zu-Ende verschlüsselt
- Erinnerungen per Web Push (iOS ab 16.4), nur zur Uhrzeit, nie als Mahnung
- **Bruderschaft**: freiwilliges Teilen der drei Dinge oder einzelner Gewohnheiten mit zwei, drei Brüdern zur gegenseitigen Rechenschaft – nie Einträge aus Gebet, Prüfung oder Archiv
- Kirchenjahr mit Wochenpsalm und Wochenlied, Anbindung an Perikopenreihen
- Weitere Lesepläne
- Native Swift-App auf Basis desselben Datenmodells

## Akzeptanzkriterien für v1

- Die App läuft offline auf dem iPhone vom Home-Bildschirm.
- Ein kompletter Tag (Morgen, Vesper, Nachtgebet mit Rückschau) lässt sich in der vorgesehenen Zeit durchbeten, ohne die Tastatur zu brauchen – alle Felder sind optional.
- Nirgends in der App gibt es einen Streak, ein Abzeichen, eine rote Markierung für Versäumtes oder ein Feld für Sündenbekenntnis.
- Jede Prüfung ist unmittelbar von einem Zuspruch gefolgt.
- Export enthält alle Einträge; nach „Alles löschen" ist die Datenbank leer.
- Alle Pflicht-Tests grün.
