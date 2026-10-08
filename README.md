# Henoch

Eine Ordnung für Morgen und Abend: Gebet und Bibellese für lutherische Männer, mit Gewohnheiten,
Gebetskammer und Wüstenzeit. Die App läuft im Browser und lässt sich auf dem Handy installieren.

**Zur App:** <https://mein.henoch.app/> · **Kontakt:** kontakt@henoch.app

## Funktionen

- **Tagzeiten:**
  - Stille Zeit am Morgen (mit „Am Bett“), Vesper und Nachtgebet am Abend
  - Schritt für Schritt geführt, jede Ordnung auch als vollwertige Kurzform
  - Die Bibel wird auf Papier gelesen; die App nennt die Stellen nach dem Leseplan
- **Gewohnheiten:**
  - Vorlagen und eigene Gewohnheiten, täglich, wöchentlich oder monatlich
  - Abgehakt wird unter „Heute“
  - Festgehalten wird, was war; ohne Serien, Punkte oder Rückstand
- **Gebetskammer:** Einträge für das, was dich bewegt; dazu die Eisenschmiede für das Treffen mit Brüdern
- **Waffenrüstung:**
  - Jeden Tag ein Stück der geistlichen Waffenrüstung (Epheser 6) in der Stillen Zeit
  - Die Frage dazu in der Prüfung des Nachtgebets
- **Wüstenzeit:**
  - Ein fester Zeitraum (40 Tage, 90 Tage oder frei) mit Gewohnheiten aus fünf Paketen oder eigenen
  - Tagesliste, Wochenansicht, Wochenrückblick und Abschluss
- **Wort und Lehre:** Leseplan, Luthers Kleiner Katechismus, Bekenntnisschriften, Kirchenjahr und Sonntag
- **Rückblick und Export:** alle Tage, Versesammlung und Gebetserhörungen; Export als JSON und Markdown, vollständiges Löschen

## Datenschutz

Alle Einträge bleiben auf dem Gerät (IndexedDB). Es gibt keine Konten, keine Analytik, keine
Tracker und keine Aufrufe fremder Dienste; die Schriften sind in der App enthalten. Ausgeliefert
wird über GitHub Pages. Einzelheiten stehen in der App unter Mehr → Impressum.

## Entwicklung

Progressive Web App (React 18, TypeScript, Vite, Dexie). Verbindliche Regeln für Inhalt und Code:
[`CLAUDE.md`](CLAUDE.md). Referenzmaterial (Prototyp, Gebetsheft): [`reference/`](reference/).
Was sich von Version zu Version geändert hat: [`CHANGELOG.md`](CHANGELOG.md) und in der App unter
Mehr → Versionen.

```sh
npm install
npm run dev         # Entwicklungsserver
npm test            # Vitest
npm run typecheck   # TypeScript
npm run build       # Produktions-Build nach dist/ (inkl. Service Worker)
npm run preview     # Build lokal ausliefern
npm run build:demo  # Vorschau als eine einzige HTML-Datei (dist-demo/tagzeiten-demo.html)
```

## Veröffentlichen

`dist/` auf einen beliebigen statischen Webserver mit HTTPS legen. Der Server muss unbekannte Pfade
auf `index.html` umleiten (z. B. Netlify `_redirects`: `/* /index.html 200`); offline übernimmt
das der Service Worker. Eine neue Version wird in der App angekündigt und erst auf
„Jetzt aktualisieren“ geladen.

### GitHub Pages

Die Action `.github/workflows/pages.yml` baut bei jedem Push (Arbeitszweig und `main`), führt die
Tests aus und veröffentlicht unter `https://mein.henoch.app/`. Einmalig einrichten:

1. Settings → Pages → Source: **GitHub Actions**, Custom domain: `mein.henoch.app`
   (bei IONOS: CNAME `mein` → `cft5v9c8yf-stack.github.io`).
2. Settings → Environments → `github-pages` → Deployment branches: den Arbeitszweig zusätzlich
   erlauben (standardmäßig darf nur `main` veröffentlichen).

Für einen anderen Unterpfad: `BASE_PATH=/pfad/ npm run build`.

Vor der ersten Nutzung auf dem iPhone: [`docs/iphone-checkliste.md`](docs/iphone-checkliste.md).

## Aufbau

```
src/
  content/   gemeinfreie Texte und Abläufe als Daten (Liturgie, Katechismus, Psalmen, Leseplan, Ordnungen)
  domain/    reine Logik ohne UI und Datenbank (Leseplan, Katechismus-Tag, Gewohnheiten, Rückschau, Export)
  data/      Dexie-Schema, Speicher mit Schreibwarteschlange, Journal, React-Hooks
  features/  Heute, Andacht, Wort, Arena, Wüstenzeit, Rückblick, Mehr
  ui/        Grundbausteine (Gebetstext, Feld, Schritt, Timer)
  styles/    Design-Tokens und Styles
```

Die Datenbank heißt aus Gründen der Kompatibilität weiterhin `tagzeiten`, ebenso das Format der
Sicherungsdateien; so findet die App alle älteren Einträge und Sicherungen.

## Bibeltexte prüfen

Alle Bibelworte in der App sind wörtliche Ausschnitte der Lutherbibel 1912. Gegen die gemeinfreie
Textausgabe (CC0) prüfen:

```sh
npm pack xmlbible-lut1912 && tar xzf xmlbible-lut1912-*.tgz
LUT1912_DIR=package/text npx vitest run
```

Die dauerhaften Regeln aus `CLAUDE.md` sind, wo möglich, als Tests abgesichert
(`src/domain/rules.test.ts` und die Seitentests): kein Feld für Sündenbekenntnis, jede Prüfung
endet im Zuspruch, Rückschau vor Prüfung, Kurzformen vollwertig, keine Streaks, kein Rot für
Versäumtes, keine Emojis.
