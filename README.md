# Tagzeiten

Gebetsordnung für Morgen und Abend – App für lutherische Männer.

Progressive Web App (React 18, TypeScript, Vite, Dexie). Alle Einträge bleiben auf dem Gerät.
Verbindliche Regeln für Inhalt und Code: [`CLAUDE.md`](CLAUDE.md).
Referenzmaterial (Prototyp, Gebetsheft): [`reference/`](reference/).

## Entwicklung

```sh
npm install
npm run dev        # Entwicklungsserver
npm test           # Vitest
npm run typecheck  # TypeScript
npm run build      # Produktions-Build nach dist/ (inkl. Service Worker)
npm run preview    # Build lokal ausliefern
```

Die App nutzt Browser-Routing. Der Webserver muss unbekannte Pfade auf `index.html` umleiten;
offline übernimmt das der Service Worker.
