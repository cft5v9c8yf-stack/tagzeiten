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

Die Dauerhaften Regeln aus `CLAUDE.md` sind, wo möglich, als Tests abgesichert
(`src/domain/rules.test.ts` und die Seitentests): kein Feld für Sündenbekenntnis, jede Prüfung
endet im Zuspruch, Rückschau vor Prüfung, Kurzformen vollwertig, keine Streaks, kein Rot für
Versäumtes, keine Emojis.
