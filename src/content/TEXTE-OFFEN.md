# Texte, die noch fehlen

Geistliche Texte schreibt Claude nicht selbst (CLAUDE.md, Arbeitsweise). Wo
einer fehlt, steht im Code ein Platzhalter der Form `[TEXT VON ANDREAS: …]`,
und die App zeigt ihn so lange an. Jeder Platzhalter steht hier; ein Test
prüft das (`src/domain/rules.test.ts`).

| Platzhalter | Wo er erscheint | Datei |
|---|---|---|
| `[TEXT VON ANDREAS: Zuspruch nach dem Wochenrückblick]` | Nachtgebet am Sonntag, am Ende des Wochenrückblicks | `src/content/weekReview.ts` |
