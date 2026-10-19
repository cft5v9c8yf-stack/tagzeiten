# Texte, die noch fehlen

Geistliche Texte schreibt Claude nicht selbst (CLAUDE.md, Arbeitsweise). Wo
einer fehlt, steht im Code ein Platzhalter der Form `[TEXT VON ANDREAS: …]`,
und die App zeigt ihn so lange an. Jeder Platzhalter steht hier; ein Test
prüft das (`src/domain/rules.test.ts`).

Der Zuspruch des Wochenrückblicks ist seit 0.37.1 derselbe wie in der
Streithalle (Klagelieder 3,22–23).

Einrichtung beim ersten Start (`src/features/onboarding/`, ab 1.17.0):

- Seite 1, „So beginnt der Tag“:
  `[TEXT VON ANDREAS: zwei, drei Sätze zur Stillen Zeit und zur Kurzform, die vollwertig ist]`
- Seite 7, „Was auf deinem Gerät bleibt“:
  `[TEXT VON ANDREAS: Zuspruch zum Schluss, etwa 1. Joh 1,9]`
- „Mehr, Anleitung“, Lesemethode:
  `[TEXT VON ANDREAS: Kurzbeschreibung der Lesemethode in eigenen Worten]`
