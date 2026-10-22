# Freigabe: wann eine Neuerung live geht

Gilt für jede größere Neuerung (Regel „Was direkt, was erst in die Vorschau“ in `CLAUDE.md`).
Fehler und Kleinigkeiten brauchen diesen Ablauf nicht.

Ablauf: Neuerung auf den Zweig `vorschau` → Andreas testet unter https://mein.henoch.app/vorschau/ →
Claude fragt die Parameter ab → sind alle erfüllt, öffnet Claude den PR `vorschau` → `main` mit der
ausgefüllten Liste → Andreas führt zusammen → Claude prüft den Lauf auf `main` und die Seite.

Ein Parameter, der nicht erfüllt ist, hält die Freigabe an. Es wird nichts „trotzdem“ live gebracht.

## A. Automatisch (`node scripts/freigabe.mjs`)

| # | Parameter | Erfüllt, wenn |
|---|-----------|---------------|
| A1 | Stand des Zweigs | Arbeitsverzeichnis sauber, `main` ist in `vorschau` enthalten |
| A2 | Version | höher als auf `main`, in `package.json` und `package-lock.json` gleich |
| A3 | Namen, die nie wechseln | Datenbank `'tagzeiten'` und `BACKUP_FORMAT` `'tagzeiten'` unverändert |
| A4 | Tests | `npx vitest run` ohne Fehler, mit `LUT1912_DIR` (Bibelverse gegen Luther 1912, Regeltests, Stildateien) |
| A5 | Bau der App | `npm run build` (mit Typen) |
| A6 | Bau der Demo | `npm run build:demo` |
| A7 | Bau der Vorschau | `BASE_PATH=/vorschau/ PREVIEW=1` baut |
| A8 | Lauf der Vorschau | der letzte Lauf „Vorschau“ und „Pages“ auf GitHub für diesen Stand ist grün (Claude prüft es auf GitHub) |

## B. Von Andreas (Claude fragt als Auswahlfrage, Andreas tippt die Antwort)

Die Fragen kommen mit dem Werkzeug `AskUserQuestion`, nicht als Fließtext: eine Frage je Parameter, höchstens
vier in einem Aufruf, also zwei Runden (B1 bis B4, dann B5 bis B7). Jede Frage hat die Antworten
**„Ja“** (zuerst, empfohlen) und **„Nein“**, bei den „nur bei …“-Parametern zusätzlich **„Entfällt“**. Bei „Nein“ fragt Claude
einmal nach, was nicht stimmt, und hält die Freigabe an. Die Überschrift der Frage ist die Nummer und das
Stichwort (zum Beispiel „B1 Handy“). Die Antworten kommen in den PR-Text.

| # | Parameter | Frage |
|---|-----------|-------|
| B1 | Handy | In der Vorschau auf dem iPhone ausprobiert, sauber dargestellt? |
| B2 | Hell und dunkel | In beiden Darstellungen angesehen? |
| B3 | Neuer Nutzer | Die Einrichtung bis „Heute“ geht ohne Fehler durch? (nur bei Änderungen an Einrichtung oder Daten) |
| B4 | Vorhandene Daten | Eine Sicherung aus Henoch in der Vorschau eingespielt, die Einträge sind da? (nur bei Änderungen an Daten) |
| B5 | Ton und Regeln | Texte stimmen: du, kein Motivationsvokabular, Zuspruch nach jeder Prüfung, Fürwörter für Gott groß? |
| B6 | Die Neuerung | Sie tut, was der Eintrag im Verlauf der Versionen sagt? |
| B7 | Freigabe | Soll die Neuerung jetzt live gehen? (Antworten „Ja, live“ und „Nein, noch nicht“; kommt zuletzt und allein, erst wenn B1 bis B6 erfüllt sind) |

„Nur bei …“ heißt: Trifft es nicht zu, ist der Parameter erfüllt (Claude schreibt „entfällt“ in die Liste).

## C. Der PR nach `main`

Titel wie die Neuerung. Im Text steht die Liste A und B mit Häkchen und, was Andreas bei B6 bestätigt hat.
Danach (Andreas führt zusammen): Lauf „Pages“ auf `main` prüfen, die Seite ansehen, Arbeitszweig und
`vorschau` wieder auf `main` bringen.
