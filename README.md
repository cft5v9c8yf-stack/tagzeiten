# Tagzeiten

Gebetsordnung für Morgen und Abend – App für lutherische Männer.

Progressive Web App (React 18, TypeScript, Vite, Dexie). Alle Einträge bleiben auf dem Gerät.
Verbindliche Regeln für Inhalt und Code: [`CLAUDE.md`](CLAUDE.md).
Referenzmaterial (Prototyp, Gebetsheft): [`reference/`](reference/).

## Entwicklung

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
Tests aus und veröffentlicht unter `https://<name>.github.io/tagzeiten/`. Einmalig einrichten:

1. Settings → Pages → Source: **GitHub Actions**.
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
  features/  Heute, Morgen, Abend, Katechismus, Archiv, Mehr
  ui/        Grundbausteine (Gebetstext, Feld, Schritt, Timer)
  styles/    Design-Tokens und Styles
```

## Wochensprüche prüfen

Die Wochensprüche (`src/content/weeklyVerses.ts`) sind wörtliche Ausschnitte der Lutherbibel 1912.
Gegen die gemeinfreie Textausgabe (CC0) prüfen:

```sh
npm pack xmlbible-lut1912 && tar xzf xmlbible-lut1912-*.tgz
LUT1912_DIR=package/text npx vitest run src/content/weeklyVerses.source.test.ts
```

Die Dauerhaften Regeln aus `CLAUDE.md` sind, wo möglich, als Tests abgesichert
(`src/domain/rules.test.ts` und die Seitentests): kein Feld für Sündenbekenntnis, jede Prüfung
endet im Zuspruch, Rückschau vor Prüfung, Kurzformen vollwertig, keine Streaks, kein Rot für
Versäumtes, keine Emojis.
