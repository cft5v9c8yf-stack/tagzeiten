/**
 * What changed from version to version, newest first, in the words of the
 * app (rule 15/16). The first entry is the current version; a test keeps it
 * equal to the version in package.json.
 */
export interface Release {
  version: string;
  /** Day of the release, "2026-09-26". */
  date: string;
  title: string;
  changes: readonly { area: string; text: string }[];
}

export const CHANGELOG: readonly Release[] = [
  {
    version: '1.38.0',
    date: '2026-10-30',
    title: 'Freies Gebet',
    changes: [
      { area: 'Andacht', text: 'Neben der Gebetsordnung gibt es für Morgen und Abend eine zweite Form: das freie Gebet. Es heißt am Morgen Morgengebet und am Abend Abendgebet, und beide sehen gleich aus. Oben steht die Reihe der Schritte, darunter ein einziges ruhiges Blatt, das du auf einen Blick erfasst und dann betest, ohne ständig aufs iPhone zu schauen: „Im Namen Gottes des Vaters, des Sohnes und des Heiligen Geistes. Amen.“, das Wort (der Psalm, darunter der Leseplan des Tages), Bitte und Fürbitte (Mein Haus, was du täglich trägst, die Anliegen des Wochentages), Dank, Vaterunser und Segen (die Texte zum Aufklappen) und zum Schluss „Das walte Gott Vater, Sohn und Heiliger Geist. Amen.“ Am Morgen folgen danach die drei Dinge für den Tag. Am Abend folgt das Nachtgebet; ist es ausgeblendet, folgen Rückschau (auf die drei Dinge vom Morgen, ohne zweiten Dank) und Prüfung mit Zuspruch. Es gibt keine Uhr, keine Kurzform und kein „Am Bett“; das freie Gebet gilt genauso wie die Gebetsordnung. Du wählst es schon in der Einrichtung („Wie du betest“) und jederzeit unter Mehr → Tag und Woche → Der Tag, „Art des Gebets“, für Morgen und Abend je für sich. Die Anliegen kommen aus der Gebetsübersicht, Frau und Kinder aus „Mein Haus“.' },
      { area: 'Andacht', text: 'In der Gebetsordnung heißt der Teil der Stillen Zeit, in dem du betest, was dich selbst bewegt, jetzt „Eigenes Gebet“ (vorher „Freies Gebet“), damit er nicht mit dem freien Gebet als eigener Form verwechselt wird.' },
    ],
  },
  {
    version: '1.37.1',
    date: '2026-10-30',
    title: 'Gewohnheiten: Wischen zum Löschen',
    changes: [
      { area: 'Mehr', text: 'Unter Gewohnheiten kannst du eine Zeile nach links wischen. Bei einer eigenen Gewohnheit erscheint „Löschen“, mit der Rückfrage wie bisher; bei allen anderen „Ausschalten“, dann liegt sie wieder unter „Gewohnheit hinzufügen“. Ein Tipp auf die Zeile schließt den Knopf wieder. Das Aufklappen mit „löschen …“ und dem Schalter bleibt, wie es war.' },
    ],
  },
  {
    version: '1.37.0',
    date: '2026-10-29',
    title: 'Gewohnheiten: wann sie dran sind',
    changes: [
      { area: 'Mehr', text: 'Die Liste unter Gewohnheiten ist kurz: Sie zeigt nur, was du hältst, mit dem Namen und darunter, wann es dran ist: bei täglichen Gewohnheiten als Woche in sieben Kreisen (gefüllt an jedem Tag, an dem sie dran ist), sonst in Worten („einmal die Woche“, „einmal im Monat“). Zum Sortieren ziehst du am Griff. Tippst du eine Gewohnheit an, öffnet sich, was du ändern kannst: wann sie dran ist, den Stern „Im Blick“, ausschalten und bei eigenen das Löschen. Bei „Wann“ wählst du jeden Tag, an bestimmten Tagen (dann tippst du die Tage an, etwa den Long Run am Samstag), einmal bis sechsmal die Woche oder einmal im Monat. Alle Vorlagen und „Eigene anlegen“ stehen unter „+ Gewohnheit hinzufügen“. Der Hinweis, dass eine Gewohnheit erst erscheint, wenn Frau oder Kind unter „Mein Haus“ eingetragen sind, steht hinter einem „i“. Die Zählung „6 von 11 eingeschaltet“ entfällt.' },
      { area: 'Heute', text: 'Die Gruppen unter „Heute“ heißen jetzt „Heute“ (oder der Tag, den du gewählt hast), „In dieser Woche“ und „In diesem Monat“. Was an bestimmten Tagen dran ist, steht nur an diesen Tagen da, mit dem Hinweis „am Samstag“; an den anderen Tagen ruht es, das ist kein Versäumnis. In der Wochenübersicht sind die anderen Tage blass; wer etwas einmal verschiebt, trägt es dort am anderen Tag ein. Bisher eingetragene Haken bleiben, wie sie waren.' },
    ],
  },
  {
    version: '1.36.1',
    date: '2026-10-30',
    title: 'Treffen am Abendbrunnen: der Weg dorthin in der Zeile',
    changes: [
      { area: 'Heute', text: 'Unter „Heute“ führt bei der Gewohnheit „Treffen am Abendbrunnen“ ein goldener Pfeil in einem Ring am Zeilenende zum Treffen, wie der Ring zum Abhaken auf der anderen Seite. Er ersetzt die eigene Zeile „Zum Treffen am Abendbrunnen“ darunter.' },
    ],
  },
  {
    version: '1.36.0',
    date: '2026-10-25',
    title: 'Reflexion in der Gebetskammer',
    changes: [
      { area: 'Gebetskammer', text: 'Wenn du einen neuen Eintrag schreibst, wählst du oben „Beten“ oder „Wachen“, unter dem Wort aus Matthäus 26,41; die Seite baut sich danach auf. „Beten“ ist der freie Eintrag, mit dem Wort aus Psalm 65,3: Gott erhört Gebet. „Wachen“ ist die Reflexion. Sie ist eine zweite Form für deine persönliche Rückschau, mit drei Fragen als Anregung: Zum Ende der Woche. Bestandsaufnahme. Wo hat der Feind an Boden gewonnen? Davor steht Psalm 139,23–24, danach der Zuspruch aus 1. Johannes 1,9. Die Fragen stehen untereinander auf einer Seite: Der Fragetext öffnet sich hinter dem „i“ neben der Überschrift (beim ersten Mal ist die erste Frage offen). Zu jeder Frage schreibst du mit der Tastatur oder mit dem Pencil. Der Eintrag „Reflexion“ wird beim Schreiben gesichert, wie jeder andere. Zuletzt kannst du Gewohnheiten festlegen und mit „In die Gewohnheiten übernehmen“ in deine Gewohnheitsliste aufnehmen; sie stehen dann auch im Eintrag. Die Liste der Einträge bleibt eine Liste. Beim Exportieren (Markdown und PDF) steht die Reflexion unter „Was dich bewegt“, mit den Fragen und den Gewohnheiten als deutliche Zwischenüberschriften.' },
      { area: 'Gebetskammer', text: 'Nur in der Reflexion darfst du auch Sünde und Schwäche aufschreiben, um zu sehen, wie der Heilige Geist verändert. Unter der Frage nach dem Boden des Feindes steht das Wort aus 1. Johannes 1,9. Die Einträge bleiben auf dem Gerät.' },
    ],
  },
  {
    version: '1.35.3',
    date: '2026-10-23',
    title: 'Die Versionen in Zehnergruppen',
    changes: [
      { area: 'Mehr', text: 'Unter Über Henoch, „Versionen“, stehen nur noch die zehn neuesten Versionen einzeln da, die neueste aufgeklappt. Die früheren sind in Zehnergruppen zusammengefaltet (1.20 bis 1.29, 1.10 bis 1.19, 1.0 bis 1.9), darunter wie bisher der Aufbau bis Henoch 1.0. Jede Gruppe lässt sich aufklappen.' },
    ],
  },
  {
    version: '1.35.2',
    date: '2026-10-23',
    title: 'Ohne „Erhört“ in Mein Haus',
    changes: [
      { area: 'Gebet', text: 'Unter „Mein Haus“ gibt es den Knopf „Erhört“ nicht mehr; bei deiner Frau und jedem Kind steht nur das Anliegen. Was du früher als erhört festgehalten hast, bleibt im Rückblick unter „Gebetserhörungen“. Ist dort nichts, steht diese Ansicht nicht mehr im Rückblick.' },
    ],
  },
  {
    version: '1.35.1',
    date: '2026-10-23',
    title: '„Erhört“ in Mein Haus aufgeräumt',
    changes: [
      { area: 'Gebet', text: 'Unter „Mein Haus“ steht „Erhört“ bei deiner Frau und bei jedem Kind wieder sauber am rechten Rand; der Hinweis „Erst wenn ein Anliegen dasteht“ steht klein links daneben, auf einer Linie mit dem Knopf.' },
    ],
  },
  {
    version: '1.35.0',
    date: '2026-10-23',
    title: 'PDF ohne Druckfenster, auch in der installierten App',
    changes: [
      { area: 'Arena', text: '„Als PDF sichern“ erstellt das Blatt jetzt direkt auf deinem Gerät und öffnet das Teilen-Menü: von dort sicherst du es in Dateien, Notizen oder deinem Notizsystem. Das geht in Safari und in der installierten App, wo es kein Druckfenster gibt. Das Blatt sieht aus wie zuvor; die Handschrift steht in einem Kasten, so hoch wie das Geschriebene.' },
    ],
  },
  {
    version: '1.34.1',
    date: '2026-10-23',
    title: 'Als PDF sichern öffnet das Druckfenster zuverlässig',
    changes: [
      { area: 'Arena', text: '„Als PDF sichern“ öffnet das Druckfenster jetzt auch aus dem Menü neben einem Eintrag oder Treffen und beim zweiten Mal. Vorher tat sich in Safari manchmal nichts.' },
      { area: 'Arena', text: 'Alle Einträge eines Ortes exportierst du jetzt über das Menü neben seiner Überschrift, nicht mehr mit zwei Knöpfen unter der Liste.' },
    ],
  },
  {
    version: '1.34.0',
    date: '2026-10-23',
    title: 'Mehr mit sechs Kacheln',
    changes: [
      { area: 'Mehr', text: 'Unter „Mehr“ stehen nur noch sechs Kacheln: Gewohnheiten, Gebet, Tag und Woche, Rückblick, App und Daten, Über Henoch.' },
      { area: 'Mehr', text: '„Tag und Woche“ fasst zusammen, wie dein Tag und deine Woche laufen: unter „Der Tag“ die Zeiten, Am Bett am Morgen, das Nachtgebet und die geistliche Waffenrüstung; unter „Die Woche“ der Wochenrückblick, die Sonntagsruhe und das Treffen am Abendbrunnen; unter „Besondere Zeiten“ die Wüstenzeit.' },
      { area: 'Mehr', text: '„App und Daten“ hat das Farbschema, wie du die App installierst und den Flugmodus beim Beten, darunter deine Daten: speichern, exportieren, einspielen, löschen. „Über Henoch“ hat dazu die Anleitung, die Versionen und den Weg zu den Neuigkeiten.' },
      { area: 'Rückblick', text: 'Ob deine Gewohnheiten der letzten acht Wochen im Rückblick stehen, schaltest du jetzt unten im Rückblick selbst ein.' },
      { area: 'Mehr', text: 'Alles, was du eingestellt hast, bleibt, wie es war. Alte Verweise führen an die neue Stelle.' },
    ],
  },
  {
    version: '1.33.0',
    date: '2026-10-23',
    title: 'Die Einstellungen neu geordnet',
    changes: [
      { area: 'Einstellungen', text: 'Unter „Darstellung“ stand vieles, was mit dem Aussehen nichts zu tun hat. Jetzt steht jedes dort, wo es hingehört: „Darstellung“ hat nur noch das Farbschema und die Gewohnheiten im Rückblick. Neu ist „Andacht“: Am Bett am Morgen, Nachtgebet am Bett, geistliche Waffenrüstung, Wochenrückblick und Sonntagsruhe. Neu ist auch „Arena“: das Treffen am Abendbrunnen und die Wüstenzeit. Alles, was du eingestellt hast, bleibt, wie es war.' },
    ],
  },
  {
    version: '1.32.0',
    date: '2026-10-23',
    title: 'Ein Blatt für alle Exporte, Tab und Enter in den Feldern',
    changes: [
      { area: 'Arena', text: 'Alles, was du aus der Arena exportierst, hat dasselbe ruhige Blatt: schmaler Kopf mit dem Zeichen der App, rechts der Ort, darunter eine feine goldene Linie, im Fuß der Zuspruch. Das gilt für die Einträge der Gebetskammer, der Eisenschmiede und der Wüstenwanderung, jetzt auch für jedes Treffen am Abendbrunnen (im Treffen oben „Exportieren“, in der Liste im Menü) und für die Wüstenzeit nach ihrem Ende.' },
      { area: 'Arena', text: 'Jeder Ort kann alle seine Einträge auf einmal exportieren: unter der Liste „Alle als Text exportieren (Markdown)“ und „Alle als PDF sichern“. So nimmst du das ganze Tagebuch der Wüstenwanderung, alle Treffen der Eisenschmiede, die Gebetskammer oder alle Treffen am Abendbrunnen in eine Datei, der Reihe nach, der älteste zuerst.' },
      { area: 'Einstellungen', text: 'Unter „Mehr“, Daten gibt es neben dem Text und der Sicherung auch „Als PDF sichern“ für alles auf einmal, auf demselben Blatt.' },
      { area: 'Arena', text: 'Mit der Tastatur springen Tab und Umschalt-Tab von Feld zu Feld; Enter im Titel und in einzeiligen Feldern geht ins nächste. In den Bibelstellen und Gebetsanliegen macht Enter eine neue Zeile darunter, in einer leeren Zeile geht es zum nächsten Feld; die Rücktaste in einer leeren Zeile nimmt sie weg. Das gilt in der Gebetskammer, der Eisenschmiede, der Wüstenwanderung und im Treffen am Abendbrunnen.' },
    ],
  },
  {
    version: '1.31.1',
    date: '2026-10-23',
    title: 'Enter in den Listen der Arena',
    changes: [
      { area: 'Arena', text: 'Mit der Tastatur: In den Bibelstellen und Gebetsanliegen macht Enter eine neue Zeile darunter und setzt den Cursor hinein, wie bei den Anliegen fürs Treffen. Die Rücktaste in einer leeren Zeile nimmt sie wieder weg.' },
    ],
  },
  {
    version: '1.31.0',
    date: '2026-10-23',
    title: 'Einträge einzeln exportieren',
    changes: [
      { area: 'Arena', text: 'Jeder Eintrag der Gebetskammer, der Eisenschmiede und der Wüstenwanderung lässt sich einzeln exportieren: im Eintrag oben das Zeichen „Exportieren“, in der Liste im Menü neben dem Eintrag. Als Text (Markdown) für dein Notizsystem, mit Kopfblock, Bibelstellen, Anliegen und Text; die Handschrift liegt als Bild bei. Oder als PDF: ein gestaltetes Blatt in A4 mit schmalem Kopf (Zeichen der App, „Henoch“, „Mit Gott unterwegs“, rechts der Ort) und dem Zuspruch des Ortes im Fuß, auf dem iPhone und iPad über das Druckfenster mit „Als PDF sichern“. Die Datei heißt wie der Eintrag: Datum als JJMMTT, dann der Titel. Alles bleibt auf dem Gerät.' },
    ],
  },
  {
    version: '1.30.0',
    date: '2026-10-22',
    title: 'Abendbrunnen: von der Gewohnheit unter „Heute“ direkt zum Treffen',
    changes: [
      { area: 'Heute', text: 'Neue wöchentliche Gewohnheit „Treffen am Abendbrunnen“. Ist sie eingeschaltet, steht unter „Heute“ bei ihr der Weg zum Treffen in der Arena. Sie ist nur zu sehen, solange der Abendbrunnen eingeschaltet ist.' },
      { area: 'Einstellungen', text: 'Unter „Treffen am Abendbrunnen“ wählst du, welche Gewohnheit zum Treffen führt. Das kann auch eine eigene sein, etwa „Gespräch mit meiner Frau“. Löschst du sie, führt wieder die Vorlage hin.' },
    ],
  },
  {
    version: '1.29.0',
    date: '2026-10-22',
    title: 'Abendbrunnen: ein Titel für jedes Treffen, der Vorsatz bricht um',
    changes: [
      { area: 'Arena', text: 'Ein Treffen am Abendbrunnen hat wie die Eisenschmiede ein Feld „Titel“: So heißt es in der Übersicht, sonst nach deinem Vorsatz. Der Vorsatz bricht im Feld um und ist ganz zu lesen; Enter macht keine neue Zeile, er bleibt ein Satz. Alle Felder eines Treffens sind so hoch wie ihr Text.' },
    ],
  },
  {
    version: '1.28.1',
    date: '2026-10-22',
    title: 'Abendbrunnen: die Notizfelder wachsen mit dem Text',
    changes: [
      { area: 'Arena', text: 'Die Felder eines Treffens am Abendbrunnen waren bei langem Text zu niedrig, der Text war halb verdeckt. Sie wachsen jetzt mit, wie in der Gebetskammer. Unter „Heute“ bricht der Vorsatz um, nur „Mein Vorsatz“ davor bleibt in einer Zeile.' },
    ],
  },
  {
    version: '1.28.0',
    date: '2026-10-22',
    title: 'Abendbrunnen: dieselben Zeichen wie überall in der Arena',
    changes: [
      { area: 'Arena', text: 'Ein Treffen am Abendbrunnen hat oben dieselben Zeichen wie jeder Eintrag der Arena: Sichern und zurück, Anheften, Archivieren und Löschen. Dasselbe bietet das Menü neben dem Eintrag in der Liste. Angeheftete Treffen stehen oben (höchstens drei). Archivierte stehen im Rückblick unter „Arena“ und lassen sich zurückholen.' },
    ],
  },
  {
    version: '1.27.0',
    date: '2026-10-22',
    title: 'Abendbrunnen: Rahmen und Haltung als Kacheln',
    changes: [
      { area: 'Arena', text: 'Auf der Titelseite des Treffens am Abendbrunnen stehen nach den sechs Schritten „Rahmen“ und „Haltung“ als zwei Kacheln, die du bei Bedarf aufklappst. Die Seite ist kürzer, die Liste der Treffen rückt nach oben. Die Texte sind unverändert.' },
    ],
  },
  {
    version: '1.26.0',
    date: '2026-10-22',
    title: 'Abendbrunnen: wie die Eisenschmiede, jedes Treffen eine Seite',
    changes: [
      { area: 'Arena', text: 'Das Treffen am Abendbrunnen ist wie die Eisenschmiede gebaut: Auf der Titelseite stehen die Verse, der Rahmen, die sechs Schritte und die Haltung im Gespräch, darunter „Treffen aufschreiben“ und die Treffen als Liste. Jedes Treffen hat eine Seite für sich, mit dem Vorsatz vom letzten zum Abhaken, dem Datum und den Notizen. Löschen kannst du ein Treffen auf seiner Seite oder über das Menü neben dem Eintrag in der Liste.' },
    ],
  },
  {
    version: '1.25.0',
    date: '2026-10-22',
    title: 'Heute: „Fokus heute“ mit Persönlich und Familie',
    changes: [
      { area: 'Heute', text: 'Hat das Treffen am Abendbrunnen für die Woche einen Vorsatz oder einen Wunsch festgehalten, heißt der Abschnitt „Fokus heute“. Er hat zwei Teile: „Persönlich“ mit den drei Dingen aus der Stillen Zeit und „Familie“ mit deinem Vorsatz und ihrem Wunsch. Sonst bleibt „Die drei Dinge“ wie bisher.' },
    ],
  },
  {
    version: '1.24.0',
    date: '2026-10-22',
    title: 'Abendbrunnen: der Vorsatz der Woche in der Stillen Zeit',
    changes: [
      { area: 'Stille Zeit', text: 'Ist das Treffen am Abendbrunnen eingeschaltet, steht in der Ausrichtung bis zu sieben Tage nach dem Treffen dein Vorsatz für die Woche, dazu ihr Wunsch an dich. Es ist eine Erinnerung an das, was ihr euch vorgenommen habt, kein Haken und keine Zahl. Ausgeschaltet ändert sich nichts.' },
    ],
  },
  {
    version: '1.23.0',
    date: '2026-10-22',
    title: 'Treffen am Abendbrunnen: der wöchentliche Ehe-Check-in',
    changes: [
      { area: 'Arena', text: 'Neu für Verheiratete: das „Treffen am Abendbrunnen“. Es hat zwei Bibelworte, den Rahmen, sechs Schritte für den Abend zu zweit (Dank, Befinden, Entlastung, Beziehung, Ausblick, Gebet), die Haltung im Gespräch und Notizen für jede Woche. Beim nächsten Treffen steht dein Vorsatz vom letzten oben, zum Abhaken. Ein Zuspruch folgt auf die Frage nach dem, was zwischen euch steht; was ihr einander bekennt, wird nicht notiert.' },
      { area: 'Einstellungen', text: 'Unter „Mehr“, Darstellung gibt es „Treffen am Abendbrunnen“: ein Schalter „Ich bin verheiratet – Abendbrunnen anzeigen“ und das Feld „Name meiner Frau“. Ist der Schalter aus, ist das Treffen nirgends zu sehen. Die Notizen bleiben auf dem Gerät, sind in der Sicherung und im Export und lassen sich löschen.' },
    ],
  },
  {
    version: '1.22.2',
    date: '2026-10-23',
    title: 'Tab und Enter in den Feldern der Arena',
    changes: [
      { area: 'Arena', text: 'Mit der Tastatur (etwa am iPad) springen Tab und Umschalt-Tab in einem Eintrag von Feld zu Feld; Enter im Titel geht ins nächste Feld. In den Bibelstellen und Gebetsanliegen macht Enter eine neue Zeile darunter, in einer leeren Zeile geht es zum nächsten Feld; die Rücktaste in einer leeren Zeile nimmt sie wieder weg.' },
    ],
  },
  {
    version: '1.22.1',
    date: '2026-10-22',
    title: 'Die Lesung der Wüstenzeit zum Lesen',
    changes: [
      { area: 'Arena', text: 'Der Abschnitt des Tages steht in der Wüstenwanderung weiter oben, aber ohne Haken. Abgehakt wird mit „Bibel lesen“ unter „Heute“, wie alles der Wüstenzeit. Ist er gelesen, steht „gelesen“ dabei.' },
    ],
  },
  {
    version: '1.22.0',
    date: '2026-10-22',
    title: 'Lesepläne nach Abschnitten',
    changes: [
      { area: 'Wort', text: 'Unter „Leseplan einstellen“ stehen neue Pläne zur Wahl: für Einsteiger „Christus finden“ mit den Büchern, die nach Luthers Vorrede auf das Neue Testament Christus am deutlichsten zeigen (Johannes, 1. Johannes, Römer, Galater, Epheser, 1. Petrus), mit Luthers Worten dazu, auf Wunsch mit einem Psalm; „Mit Paulus unterwegs“, die Apostelgeschichte mit den Briefen an ihrem Ort, in 40, 60 oder einer eigenen Zahl von Tagen; die Bibel in einem Jahr. Die Kapitel sind gleichmäßig auf die Abschnitte verteilt.' },
      { area: 'Wort', text: 'Unter „Heute lesen“ steht, welcher Abschnitt dran ist, und du hakst ihn dort ab, wie mit „Bibel lesen“ unter „Heute“. Jeder Plan merkt sich, wo du stehst; wer aussetzt, macht beim nächsten Abschnitt weiter.' },
      { area: 'Arena', text: 'Zur Wüstenzeit gehört der Leseplan „Bewährung und Nachfolge“: die Versuchung Jesu, die Bergpredigt, das Evangelium nach Johannes, Jakobus, 1. Petrus und Hebräer, verteilt auf die Tage der Wüstenzeit, bei vielen Tagen in kleineren Abschnitten. Beim Beginnen ist er vorgeschlagen; du kannst deinen Plan behalten oder ohne Lesung gehen, und das jederzeit unter „Einstellungen der Wüstenzeit“ ändern.' },
      { area: 'Arena', text: 'In der Wüstenwanderung steht der Abschnitt des Tages oben, vor der Wochenübersicht, und wird dort abgehakt, derselbe Haken wie „Bibel lesen“ unter „Heute“. „Bewährung und Nachfolge“ gilt vom ersten bis zum letzten Tag der Wüstenzeit, auch wenn du sie für später anlegst. So lange ruht dein bisheriger Plan; danach, oder wenn du sie vorzeitig beendest, geht er von selbst dort weiter, wo du aufgehört hast.' },
    ],
  },
  {
    version: '1.21.0',
    date: '2026-10-21',
    title: 'Stille Zeit: „Bibel lesen“ wird mit dem Wort abgehakt',
    changes: [
      { area: 'Stille Zeit', text: 'Wenn du im Schritt „Das Wort“ weiterklickst, ist die Lesung des Tages gelesen: „Bibel lesen“ ist abgehakt und der Leseplan rückt zum nächsten Abschnitt. Das gilt in der Kurzform genauso. Von Hand kannst du den Haken weiterhin setzen und wieder wegnehmen.' },
    ],
  },
  {
    version: '1.20.3',
    date: '2026-10-20',
    title: 'Wüstenwanderung: Kacheln statt loser Kästen',
    changes: [
      { area: 'Arena', text: 'Die Wüstenwanderung ist neu geordnet: Überblick, der Hinweis nach „Heute“, der Rückblick als eingeklappte Kachel über die volle Breite, dann das Tagebuch. Ganz unten stehen „Anleitung“ und „Einstellungen der Wüstenzeit“ als zwei Kacheln nebeneinander, wie unter „Mehr“. Ein Panel öffnet sich unter der Reihe; die Einstellungen und das Beenden sind unverändert.' },
    ],
  },
  {
    version: '1.20.2',
    date: '2026-10-20',
    title: 'Wüstenwanderung: Abschluss mit einem Tagebuch',
    changes: [
      { area: 'Arena', text: 'Nach dem letzten Tag der Wüstenzeit steht das Tagebuch nur noch einmal da, mit den Einträgen wie zuvor. Die alten Tagesblätter bleiben darunter eingeklappt unter „Aus den Tagesblättern“ lesbar.' },
    ],
  },
  {
    version: '1.20.1',
    date: '2026-10-20',
    title: 'Wüstenwanderung: Überblick wie die Wochenübersicht',
    changes: [
      { area: 'Arena', text: 'Der Überblick oben in der Wüstenwanderung sieht aus wie die Wochenübersicht unter „Heute“: Mo bis So, eine Zeile je Gewohnheit der Wüstenzeit, je Tag ein Kreis, wöchentliche und monatliche Gewohnheiten als Plakette. Du blätterst Woche für Woche; er beginnt in der laufenden Woche. Er ist nur zum Lesen: Abhaken kannst du unter „Heute“.' },
    ],
  },
  {
    version: '1.20.0',
    date: '2026-10-19',
    title: 'Wüstenwanderung: Überblick und Tagebuch mit Einträgen',
    changes: [
      { area: 'Arena', text: 'Die Wüstenwanderung beginnt jetzt oben mit einem Überblick: je Gewohnheit eine Zeile, je Tag ein Feld, nach Wochen geordnet. Abgehakt ist gefüllt, nicht abgehakt grau, ein kommender Tag nur umrandet. Wöchentliche und monatliche Gewohnheiten haben ein Feld je Woche und je Monat. Der Überblick ist nur zum Lesen.' },
      { area: 'Arena', text: 'Darunter steht das Tagebuch als Einträge, wie in der Gebetskammer: neuer Eintrag, Titel, Bibelstellen, Gebetsanliegen, Text oder Handschrift, anheften, archivieren, löschen. Die Einträge gehören zur Wüstenwanderung und stehen nicht in der Gebetskammer. Sie sind in Sicherung und Export enthalten.' },
      { area: 'Arena', text: 'Was du früher auf den Tagesblättern geschrieben hast, bleibt lesbar: eingeklappt unter „Aus den Tagesblättern“. Rückblick und Anleitung stehen eingeklappt darunter. Die Ansichten Tag und Woche sind entfallen.' },
    ],
  },
  {
    version: '1.19.0',
    date: '2026-10-19',
    title: 'Wüstenzeit: die Gewohnheiten unter „Heute“',
    changes: [
      { area: 'Heute', text: 'Die Gewohnheiten der Wüstenzeit pflegst und hakst du nur noch unter „Heute“ ab. Unter der Gruppe „Wüstenzeit“ steht eine einklappbare Auswahl: Pakete und Vorschläge wählen und abwählen, eigene anlegen und löschen, mit dem „i“ bei jeder Gewohnheit.' },
      { area: 'Arena', text: 'Die Wüstenwanderung zeigt keine Gewohnheiten zum Abhaken oder Auswählen mehr. Sie hat vier Ansichten: den Verlauf (die Tage der Wüstenzeit, Woche für Woche, ein Tag mit Haken gefüllt, sonst grau), das Tagebuch, den Rückblick und die Anleitung. Wo früher die Gewohnheiten standen, führt ein Hinweis nach „Heute“.' },
    ],
  },
  {
    version: '1.18.5',
    date: '2026-10-19',
    title: 'Wüstenwanderung: alle gewählten Gewohnheiten',
    changes: [
      { area: 'Einrichtung', text: 'Wer in der Einrichtung die Wüstenwanderung wählt, hat danach alle Gewohnheiten, die er angehakt hat, und nicht nur eine.' },
    ],
  },
  {
    version: '1.18.4',
    date: '2026-10-19',
    title: 'Wüstenwanderung: Beginn nicht in der Vergangenheit',
    changes: [
      { area: 'Einrichtung', text: 'Bei „Anderer Tag“ gilt frühestens heute. Ein Tag in der Vergangenheit lässt sich nicht wählen.' },
    ],
  },
  {
    version: '1.18.3',
    date: '2026-10-19',
    title: 'Einrichtung: ein Testament lesen',
    changes: [
      { area: 'Einrichtung', text: 'Auf der Seite „Dein Leseplan“ wählst du, was du liest: beide Testamente, nur das Neue oder nur das Alte. Bei einem Testament gibst du die Startstelle und die Kapitel am Tag an. Wechselst du zurück, findest du deine Stellen wieder.' },
    ],
  },
  {
    version: '1.18.2',
    date: '2026-10-19',
    title: 'Einrichtung: Erklärung nach der Wahl',
    changes: [
      { area: 'Einrichtung', text: 'Auf der Seite „Wofür möchtest du Henoch nutzen?“ erscheint die Erklärung erst, wenn du eine Karte wählst, und gilt nur für diese Karte.' },
    ],
  },
  {
    version: '1.18.1',
    date: '2026-10-19',
    title: 'Anleitung ohne Lesemethode, Gewohnheiten gefaltet',
    changes: [
      { area: 'Mehr', text: 'Die Lesemethode steht nicht mehr unter „Mehr, Anleitung“. Die Anleitung öffnet nur die Einrichtung.' },
      { area: 'Einrichtung', text: 'Bei der Wüstenwanderung sind die Pakete der Gewohnheiten zugeklappt. Wo schon etwas gewählt ist, steht es offen.' },
    ],
  },
  {
    version: '1.18.0',
    date: '2026-10-19',
    title: 'Einrichtung: der Weg Wüstenwanderung',
    changes: [
      { area: 'Einrichtung', text: 'Wer „Wüstenwanderung“ wählt, hat jetzt einen eigenen Weg: Dauer (40 Tage, 90 Tage oder eigene) und Beginn (heute, morgen oder ein anderer Tag), die Gewohnheiten für diese Zeit, deine Zeiten und die Zusammenfassung.' },
      { area: 'Einrichtung', text: 'Die Wüstenzeit beginnt erst mit „Zur Wüstenwanderung“ auf der letzten Seite. Zurückgehen und Überspringen starten nichts. Wer den Weg wechselt, behält, was er auf dem anderen eingegeben hat.' },
    ],
  },
  {
    version: '1.17.2',
    date: '2026-10-19',
    title: 'Lesemethode in der Anleitung',
    changes: [
      { area: 'Mehr', text: 'Unter „Mehr, Anleitung“ steht jetzt die Lesemethode: die drei Durchgänge und der Farbcode, mit der Quelle.' },
    ],
  },
  {
    version: '1.17.1',
    date: '2026-10-19',
    title: 'Einrichtung: Texte, Leseplan, Wiederaufnahme',
    changes: [
      { area: 'Einrichtung', text: 'Wer die Einrichtung mittendrin verlässt oder die Seite neu lädt, kommt beim nächsten Start auf die Seite zurück, an der er war.' },
      { area: 'Einrichtung', text: 'Der Leseplan hat nur noch die Startstelle für Altes und Neues Testament und die Kapitel am Tag. Einen eigenen Plan stellst du unter „Wort“ ein.' },
      { area: 'Einrichtung', text: 'Neue Texte zur Stillen Zeit und ihrer Kurzform, zu Wüstenwanderung und Alltag, zu deinen Zeiten, und am Ende das Wort aus 1. Johannes 1,9.' },
    ],
  },
  {
    version: '1.17.0',
    date: '2026-10-19',
    title: 'Einrichtung beim ersten Start',
    changes: [
      { area: 'Einrichtung', text: 'Beim allerersten Start führt Henoch durch eine kurze Einrichtung: der Tag mit Wort, Gebet und Ausrichtung, dann dein Haus, deine Zeiten, deine Gewohnheiten und dein Leseplan. Alles lässt sich überspringen oder mit „Später ansehen“ auf später legen.' },
      { area: 'Einrichtung', text: 'Zur Wahl stehen „Alltag“ und „Wüstenwanderung“. Die Wüstenwanderung öffnet gleich ihren Anfang in der Arena.' },
      { area: 'Mehr', text: 'Unter „Mehr“ gibt es die „Anleitung“. Dort öffnest du die Einrichtung noch einmal; sie ändert nur, was du änderst.' },
    ],
  },
  {
    version: '1.16.15',
    date: '2026-10-19',
    title: 'Wüstenwanderung ohne Unterzeile',
    changes: [
      { area: 'Arena', text: 'Auf der Seite der Wüstenwanderung steht unter dem Titel keine zweite Überschrift mit Unterzeile mehr. Sie beginnt wie die anderen Orte mit dem Wort.' },
    ],
  },
  {
    version: '1.16.14',
    date: '2026-10-19',
    title: 'Keine Unterstreichungen mehr',
    changes: [
      { area: 'Henoch', text: 'Links und Textschaltflächen sind nirgends mehr unterstrichen, auch nicht „Gestern nachtragen“. Sie bleiben in Gold, im Fließtext zusätzlich fett.' },
    ],
  },
  {
    version: '1.16.13',
    date: '2026-10-19',
    title: 'Kirchenjahr, Versionen und Maße',
    changes: [
      { area: 'Kirchenjahr', text: 'Die Zeiten des Kirchenjahres sind eingeklappt, nur die laufende steht offen. Die Sprungmarken oben bleiben.' },
      { area: 'Versionen', text: 'Der Verlauf zeigt die letzten drei Fassungen der neuesten Nummer. Frühere klappst du darunter auf.' },
      { area: 'Henoch', text: 'Links, die im Browser öffnen, sagen es dem Vorleseprogramm: „öffnet im Browser“.' },
      { area: 'Henoch', text: 'Karten, Schritte und Schaltflächen haben dieselben Rundungen und Abstände. Am Computer ist die Tab-Leiste so breit wie der Inhalt.' },
    ],
  },
  {
    version: '1.16.12',
    date: '2026-10-19',
    title: 'Mehr auf einer Ebene',
    changes: [
      { area: 'Mehr', text: 'Die Kachel „Einstellungen“ ist aufgelöst. Darstellung, Deine Daten und Über Henoch stehen jetzt direkt unter Mehr. App installieren und Flugmodus findest du unter „Über Henoch“. Alte Links bleiben gültig.' },
      { area: 'Arena', text: 'Im Eintrag der Eisenschmiede entfällt die Zeile unter den Symbolen. Der Eintrag beginnt wie in der Gebetskammer gleich mit der Überschrift.' },
    ],
  },
  {
    version: '1.16.11',
    date: '2026-10-19',
    title: 'Zeichen, Bestätigungen und Schaltflächen vereinheitlicht',
    changes: [
      { area: 'Henoch', text: 'Neue Zeichen für Gewohnheiten, Sicherung einspielen, Exportieren, App installieren, Flugmodus und Über Henoch. Gebet zeigt gefaltete Hände, die Gebetsübersicht behält die Personen. Der Stern steht nur noch für den Fokus.' },
      { area: 'Henoch', text: 'Wo etwas gelöscht wird, fragt immer dieselbe Zeile nach: erst „löschen …“, dann die Antwort und „Behalten“.' },
      { area: 'Henoch', text: 'Was gerade nicht geht, ist überall gleich blass. Fehlt ein Name, steht ein Hinweis dabei. Der Fokusrahmen hat überall dieselbe Farbe.' },
      { area: 'Henoch', text: 'Schaltflächen haben drei Stufen: gefüllt, umrandet und als Text. Alleinstehende Links sind dünn unterstrichen.' },
      { area: 'Wüstenzeit', text: 'In den Masken für Dank und Prüfung steht die Hauptschaltfläche über die ganze Breite, die übrigen darunter.' },
    ],
  },
  {
    version: '1.16.10',
    date: '2026-10-19',
    title: 'Andacht: Text höher, Weg bleibt in Reichweite',
    changes: [
      { area: 'Andacht', text: 'Die Stille Zeit beginnt mit einer kleinen Schaltfläche „Zeit starten“. Der Streifen mit der Uhr erscheint erst, wenn die Zeit läuft. Die Wahl zwischen ganzer Ordnung und Kurzform steht direkt über der Schrittleiste.' },
      { area: 'Andacht', text: 'Unter allen Zeichen der Schrittleiste steht der Name, solange der Platz reicht. Sonst trägt ihn nur der Schritt, in dem du bist. Ist die Leiste noch enger, lässt sie sich zur Seite schieben.' },
      { area: 'Andacht', text: 'Die Schaltfläche am Ende eines Schritts („Weiter zu: …“, „… abschließen“) bleibt bei langen Texten über der Tab-Leiste stehen. Darunter steht „Zurück zu: …“.' },
      { area: 'Andacht', text: 'Bei der Beichte im Kranz steht „Ich bekenne dir, daß ich …“ als Gebetszeile. „Wird gebetet, nicht notiert.“ ist besser zu lesen.' },
    ],
  },
  {
    version: '1.16.9',
    date: '2026-10-19',
    title: 'Heute kürzer, ruhigerer Abschluss am Abend',
    changes: [
      { area: 'Heute', text: 'Die letzten vier Wochen sind eingeklappt, die Wochenübersicht ebenso. Was du aufklappst, merkt sich die App.' },
      { area: 'Heute', text: 'Der Sonntag trägt jetzt den Namen „Sonntag dieser Kirchenwoche“. Im Tab Wort unter Lehre führt „Der kommende Sonntag“ direkt zum nächsten Sonntag.' },
      { area: 'Sonntag', text: 'Der Schritt zurück heißt „Vorheriger Sonntag“, die laufende Woche „diese Kirchenwoche“.' },
      { area: 'Rückschau', text: 'Was nicht erreicht wurde, heißt „offen geblieben“.' },
      { area: 'Vesper', text: 'Nach „Vesper abschließen“ bleibst du bei der Vesper. „Weiter zum Nachtgebet“ und „Zurück zu Heute“ stehen bereit, wann du magst.' },
      { area: 'Henoch', text: 'Die kurze Meldung unten steht knapp über der Tab-Leiste und verschwindet nach knapp zwei Sekunden.' },
    ],
  },
  {
    version: '1.16.8',
    date: '2026-10-19',
    title: 'Arena: Schaltflächen unten entfallen',
    changes: [
      { area: 'Arena', text: 'Unter einem Eintrag stehen keine Schaltflächen mehr. Sichern, Anheften, Archivieren und Löschen findest du als Symbole oben. Was du schreibst, bleibt beim Schreiben erhalten.' },
    ],
  },
  {
    version: '1.16.7',
    date: '2026-10-19',
    title: 'Gleiche Maße für Kacheln und Felder',
    changes: [
      { area: 'Henoch', text: 'Kacheln, Karten und Felder haben dieselben Rundungen, Abstände und Höhen. Eingabefelder sind mindestens 44 Pixel hoch.' },
      { area: 'Mehr', text: 'Kacheln, die sich aufklappen, tragen einen kleinen Pfeil nach unten. Kacheln, die auf eine andere Seite führen, bleiben ohne.' },
    ],
  },
  {
    version: '1.16.6',
    date: '2026-10-19',
    title: 'Eine Bildsprache für alle Zeichen',
    changes: [
      { area: 'Henoch', text: 'Alle Zeichen haben dieselbe Strichstärke, und Knöpfe mit Zeichen gibt es in drei festen Größen. Die Tippfläche bleibt überall 44 Pixel groß.' },
      { area: 'Henoch', text: 'Plus, Kreuz zum Entfernen, das Zeichen für das Menü und die Pfeile nach rechts und links sind jetzt gezeichnete Zeichen statt Textzeichen und sehen überall gleich aus.' },
    ],
  },
  {
    version: '1.16.5',
    date: '2026-10-19',
    title: 'Jede Seite beginnt gleich',
    changes: [
      { area: 'Henoch', text: 'Alle Seiten haben denselben Kopf: links der Name des Bereichs, rechts die Suche, darunter in einer ruhigen Zeile das Datum, wo es gebraucht wird.' },
      { area: 'Henoch', text: 'Der Pfeil zurück steht auf jeder Unterseite an derselben Stelle, links neben dem Titel.' },
    ],
  },
  {
    version: '1.16.4',
    date: '2026-10-19',
    title: 'Schaltflächen, die man sieht und spürt',
    changes: [
      { area: 'Henoch', text: 'Schaltflächen sind mindestens 44 Pixel hoch, haben einen deutlicheren Rand und geben beim Drücken sichtbar nach. Kleine Knöpfe wie Pillen, Fürbitten-Zeichen und das „i“ lassen sich mit 44 Pixeln Tippfläche leichter treffen.' },
      { area: 'Mehr', text: 'Löschen erkennst du auch ohne Farbe: Rand statt Füllung und ein Papierkorb. „Neuigkeiten“ trägt den Pfeil, der aus der App hinausführt, und der Knopf zum Einspielen heißt „Sicherung aus Datei wählen“.' },
      { area: 'Mehr', text: 'Einspielen, Löschen und „Jetzt aktualisieren“ lassen sich nicht zweimal auslösen, solange sie laufen.' },
    ],
  },
  {
    version: '1.16.3',
    date: '2026-10-19',
    title: 'Die Schrittleiste nennt ihre Schritte',
    changes: [
      { area: 'Stille Zeit', text: 'Unter dem Zeichen des gewählten Schritts steht sein Name. Die Zeit oben sagt „Jetzt: Am Bett“, solange du am Bett bist, und passt so zur Leiste.' },
      { area: 'Heute', text: 'Die letzten vier Wochen liest ein Bildschirmleser als einen Satz vor, nicht als 28 einzelne Meldungen.' },
    ],
  },
  {
    version: '1.16.2',
    date: '2026-10-19',
    title: 'Besser zu treffen, besser zu lesen',
    changes: [
      { area: 'Henoch', text: 'Kleine Knöpfe lassen sich leichter treffen: die Kreise der Woche, die Schrittleiste, die Lupe, der Pfeil zurück und Textlinks haben eine Tippfläche von 44 Pixeln, ohne dass sie größer aussehen.' },
      { area: 'Henoch', text: 'Eingabefelder haben einen deutlicheren Rand, Platzhalter und das Gold der Symbole sind kräftiger, und die kleinsten Beschriftungen sind etwas größer, auch in der Leiste unten.' },
    ],
  },
  {
    version: '1.16.1',
    date: '2026-10-17',
    title: 'Die Dogmatik vorerst wieder heraus',
    changes: [
      { area: 'Lehre', text: 'Die Dogmatik ist vorerst wieder herausgenommen. Sie kommt zurück, wenn alle Tage gegen den Druck durchgesehen sind. Was du schon gelesen und notiert hast, bleibt gespeichert.' },
    ],
  },
  {
    version: '1.16.0',
    date: '2026-10-16',
    title: 'Die Dogmatik',
    changes: [
      { area: 'Lehre', text: 'Neu unter „Wort“ › „Lehre“: Francis Pieper, Christliche Dogmatik, alle drei Bände, ein Band im Jahr. Die Karte zeigt, wo du stehst, die Lesung des Tages und die zuletzt gelesenen Abschnitte. Der Plan geht nach deinem Lesestand: Wer aussetzt, liest beim nächsten Abschnitt weiter.' },
      { area: 'Lehre', text: 'Statt eines Abschnitts am Tag kannst du eine Lesezeit wählen, 5 bis 20 Minuten; dann stehen so viele Abschnitte in der Lesung, wie hineinpassen. Ohne Leseplan bleibt das Buch zum Nachschlagen.' },
      { area: 'Lehre', text: 'Der Lesetag: der Text in der Leseschrift mit A− und A+, Fußnoten zum Antippen, Zwischenüberschriften des Buches. Wo vorhanden: Bibelwort, lateinische Zitate mit Übersetzung, Kernsatz und Frage zum Nachdenken; deine Gedanken lassen sich in die Gebetskammer schreiben. Was nicht aus dem Buch stammt, heißt „Ergänzung“. Tage, die noch nicht gegen den Druck durchgesehen sind, sagen es.' },
      { area: 'Lehre', text: '„Nachschlagen“: der Leseplan ab heute, das Inhaltsverzeichnis jedes Bandes nach Lehrstück und Kapitel, und eine Suche durch alle drei Bände. Darunter „Leseplan einstellen“.' },
      { area: 'Andacht', text: 'Auf Wunsch steht die Lesung in der Stillen Zeit als eigener Schritt nach dem Wort, vor dem Gebet. Die Kurzform bleibt kurz.' },
    ],
  },
  {
    version: '1.15.2',
    date: '2026-10-16',
    title: 'Der Dank nach der Wüstenzeit',
    changes: [
      { area: 'Heute', text: 'Der Dank des Tages steht unter den drei Dingen nur, solange eine Wüstenzeit mit dem Dank läuft. Beendest du sie, verschwindet der Abschnitt; was du aufgeschrieben hast, bleibt beim Nachtgebet, im Wochenrückblick und im Tagebuch der Wüstenwanderung.' },
    ],
  },
  {
    version: '1.15.1',
    date: '2026-10-16',
    title: 'Der Dank unter „Heute“',
    changes: [
      { area: 'Heute', text: 'Unter den drei Dingen steht der Dank des Tages in einem eigenen Abschnitt, sobald du ihn aufgeschrieben hast, in der Wüstenzeit oder im Nachtgebet.' },
      { area: 'Henoch', text: 'Aufzählungen haben einen eigenen Punkt: eine Ähre im Strich und Gold der übrigen Symbole, beim Dank des Tages und bei den Quellen der Sonntagshilfe gleich.' },
    ],
  },
  {
    version: '1.15.0',
    date: '2026-10-16',
    title: 'Tagebuch der Wüstenwanderung',
    changes: [
      { area: 'Arena', text: 'Während einer Wüstenzeit steht unter der Liste des Tages ein Tagebuch, mit der Tastatur oder in Handschrift. Es gehört zu diesem Tag; mit „Vortag“ blätterst du zurück. Die Gebetskammer bleibt für das, womit du ringst.' },
      { area: 'Arena', text: 'Beim 90-Tage-Standard steht das Tagebuch auch bei „Tagebuch und drei Dankpunkte“, zwischen dem Satz und dem Dank.' },
      { area: 'Rückblick', text: 'Ist eine Wüstenzeit zu Ende, liest du ihr Tagebuch Tag für Tag im Abschluss und unter Rückblick, Wüstenwanderung. Es steht auch in der Suche und im Export.' },
    ],
  },
  {
    version: '1.14.3',
    date: '2026-10-16',
    title: 'Hauptstücke beim Namen',
    changes: [
      { area: 'Lehre', text: 'Auf den Kacheln der Hauptstücke steht oben „1. Hauptstück“ bis „5. Hauptstück“, der Name darunter in der zweiten Zeile, auch bei Löhes Fragen. Bei der Beichte bleibt die obere Zeile frei.' },
    ],
  },
  {
    version: '1.14.2',
    date: '2026-10-15',
    title: 'Langer Text in der Gebetskammer',
    changes: [
      { area: 'Arena', text: 'Das Feld „Was dich bewegt“ wächst mit dem Text. Ein langer Eintrag lässt sich bis zum Ende lesen, indem du die Seite scrollst, auch auf dem iPad.' },
    ],
  },
  {
    version: '1.14.1',
    date: '2026-10-15',
    title: 'Löhes Zählung erklärt',
    changes: [
      { area: 'Lehre', text: 'Unter Löhes Fragen steht, warum er von sechs Hauptstücken spricht: Er zählt nach der Ausgabe seiner Zeit die Beichte mit. Seine Fragen bleiben, wie er sie geschrieben hat.' },
    ],
  },
  {
    version: '1.14.0',
    date: '2026-10-15',
    title: 'Fünf Hauptstücke',
    changes: [
      { area: 'Lehre', text: 'Der Kleine Katechismus hat fünf Hauptstücke. Die Beichte steht wie bei Luther zwischen Taufe und Abendmahl, aber ohne Nummer; das Sakrament des Altars ist das fünfte Hauptstück. Die Woche der Beichte bleibt im Wechsel, Gelerntes bleibt erhalten. Löhes Fragen zählen nach seiner Ausgabe von 1845 weiter sechs und stehen wortgetreu.' },
      { area: 'Lehre', text: 'Nummer und Titel eines Hauptstücks stehen in einer Zeile; die Taufe heißt dort kurz „Die heilige Taufe“. Im Hausvater-Modus blättern Pfeile im Strich der übrigen Symbole.' },
      { area: 'Arena', text: 'Das Menü am untersten Eintrag öffnet nach oben, wenn unten die Leiste im Weg wäre. Im dunklen Modus stehen die Symbole in vollem Gold. Mehr als drei angeheftete Einträge aus einer Sicherung werden auf drei begrenzt.' },
    ],
  },
  {
    version: '1.13.2',
    date: '2026-10-15',
    title: 'Ruhigere Köpfe unter „Mehr“',
    changes: [
      { area: 'Mehr', text: 'Oben in jedem Bereich stehen nur noch der Pfeil zurück und der Titel. Was hinter dem „i“ stand, steht jetzt klein darunter; das Symbol des Bereichs bleibt auf seiner Kachel.' },
    ],
  },
  {
    version: '1.13.1',
    date: '2026-10-15',
    title: 'Der Pfeil neben der Überschrift',
    changes: [
      { area: 'Henoch', text: 'Der Pfeil zurück steht nicht mehr allein über der Überschrift, sondern links daneben auf ihrer ersten Zeile. Die Seiten beginnen dadurch ruhiger und etwas höher.' },
    ],
  },
  {
    version: '1.13.0',
    date: '2026-10-15',
    title: 'Ein Pfeil für den Weg zurück',
    changes: [
      { area: 'Henoch', text: 'Wo oben ein Weg zurückführt, steht jetzt nur ein Pfeil im Strich der übrigen Symbole, ohne Wort: in der Arena, in der Lehre, unter „Mehr“, beim Kirchenjahr und am Sonntag. Wohin er führt, zeigt er, wenn du darauf zeigst.' },
    ],
  },
  {
    version: '1.12.2',
    date: '2026-10-15',
    title: 'Symbole oben, Knöpfe unten',
    changes: [
      { area: 'Arena', text: 'Oben im Eintrag stehen wieder kleine, dezente Symbole: sichern und zurück, anheften, archivieren und löschen. Unten bleiben alle Knöpfe mit Text, auch „Oben anheften“.' },
    ],
  },
  {
    version: '1.12.1',
    date: '2026-10-15',
    title: 'Nur noch Sichern oben',
    changes: [
      { area: 'Arena', text: 'Oben im Eintrag steht nur noch ein kleines, dezentes Symbol zum Sichern. Anheften, Archivieren und Löschen stehen wieder als Knöpfe unten, „Oben anheften“ auch.' },
    ],
  },
  {
    version: '1.12.0',
    date: '2026-10-15',
    title: 'Symbole oben im Eintrag',
    changes: [
      { area: 'Arena', text: 'Oben links im Eintrag stehen neben dem Weg zurück kleine Symbole: Sichern und zurück, oben anheften, archivieren und löschen. Angeheftet leuchtet die Nadel golden. Vor dem Löschen fragt die App gleich darunter noch einmal nach. Die Knöpfe unten bleiben.' },
    ],
  },
  {
    version: '1.11.0',
    date: '2026-10-15',
    title: 'Ein Menü neben jedem Eintrag',
    changes: [
      { area: 'Arena', text: 'Neben jedem Eintrag in der Gebetskammer und in der Eisenschmiede steht das Zeichen „⋯“. Es öffnet ein Menü: oben anheften oder nicht mehr anheften, archivieren und löschen. Vor dem Löschen fragt die App noch einmal nach.' },
    ],
  },
  {
    version: '1.10.0',
    date: '2026-10-15',
    title: 'Titel und angeheftete Einträge',
    changes: [
      { area: 'Arena', text: 'Jeder Eintrag in der Gebetskammer und in der Eisenschmiede kann einen Titel bekommen. In der Übersicht steht dann der Titel statt der ersten Zeile des Textes.' },
      { area: 'Arena', text: '„Oben anheften“ im Eintrag stellt ihn an den Anfang der Liste, mit dem Zeichen „Angeheftet“. Bis zu drei Einträge je Ort können oben stehen. „Nicht mehr anheften“ stellt ihn zurück zu den anderen; wird er archiviert, ist er nicht mehr angeheftet.' },
    ],
  },
  {
    version: '1.9.1',
    date: '2026-10-15',
    title: 'Löhes Fragen im Fenster',
    changes: [
      { area: 'Lehre', text: 'Im Hauptstück stehen Löhes Stücke als Kacheln, zwei nebeneinander, das Stück von heute in Gold. Ein Tipp öffnet seine Fragen in einem Fenster über den Kacheln; „Fragen schließen“ führt zurück, und die Kacheln stehen, wo sie waren.' },
    ],
  },
  {
    version: '1.9.0',
    date: '2026-10-15',
    title: 'Löhes Fragen in Kacheln',
    changes: [
      { area: 'Lehre', text: 'Die Seite „Fragen und Antworten zum Katechismus“ zeigt die Hauptstücke als Kacheln, wie die Übersicht der Lehre. Ein Tipp öffnet das Hauptstück mit einer Karte für jedes Stück: bei den Geboten für jedes Gebot, beim Glauben für jeden Artikel, beim Vaterunser für jede Bitte. Davor stehen die einleitenden Fragen, danach die Übergangsfragen. Offen ist zuerst das Stück von heute.' },
      { area: 'Lehre', text: 'Löhes Fragen zum ganzen Katechismus haben eine eigene Kachel. Die Suche führt direkt zum Hauptstück.' },
    ],
  },
  {
    version: '1.8.1',
    date: '2026-10-14',
    title: 'Löhes Fragen passend zum Stück',
    changes: [
      { area: 'Lehre', text: 'Am Tisch stehen rechts jetzt genau Löhes Fragen zu dem Stück, das links steht, etwa beim dritten Gebot die Fragen 64–77. Bisher waren seine Fragen nach der Zahl auf die Woche verteilt und reichten so in das Gebot davor und danach. Wird ein Stück an zwei Tagen gelernt, teilen sich die beiden Tage seine Fragen. Die einleitenden Fragen kommen mit dem ersten Stück, die Übergangsfragen mit dem letzten.' },
    ],
  },
  {
    version: '1.8.0',
    date: '2026-10-14',
    title: 'Löhes Fragen im Anhang',
    changes: [
      { area: 'Lehre', text: 'Löhes Fragen und Antworten haben eine eigene Kachel unten bei den Büchern für das Haus: „Fragen und Antworten zum Katechismus“. Für jedes Hauptstück eine Karte, die Fragen unter dem Stück, das sie erklären; offen ist zuerst das Hauptstück dieser Woche.' },
      { area: 'Lehre', text: 'Die Seiten der Hauptstücke zeigen wieder nur Luthers Text, alle Stücke offen. Am Tisch stehen Löhes Fragen des Tages weiter neben dem Stück.' },
    ],
  },
  {
    version: '1.7.0',
    date: '2026-10-14',
    title: 'Löhes Fragen am Tisch',
    changes: [
      { area: 'Lehre', text: 'Am Tisch steht links das Stück zum Lernen und rechts die Fragen von Wilhelm Löhe für den Tag, alle auf einmal und mit Antwort: zum Verstehen, ohne Tippen, einfach weiterlesen. Löhes Fragen eines Hauptstücks sind gleichmäßig auf die sieben Tage der Woche verteilt, in der Reihenfolge seines Buches. Mit einem Wisch zur Seite geht es zum nächsten oder vorigen Stück.' },
      { area: 'Lehre', text: 'Auf der Seite eines Hauptstücks stehen Löhes Fragen ohne Aufklappen direkt unter Luthers Antwort. Seine einleitenden Fragen stehen vor dem ersten Stück, seine Übergangsfragen nach dem letzten. Offen ist zuerst nur das Stück von heute; die anderen öffnen sich mit einem Tipp auf den Titel.' },
    ],
  },
  {
    version: '1.6.1',
    date: '2026-10-14',
    title: 'Löhes Fragen bei jedem Stück',
    changes: [
      { area: 'Lehre', text: 'Löhes Fragen stehen jetzt unter dem Stück, zu dem sie gehören: eingeklappt als „Fragen von Wilhelm Löhe“, daneben ihre Nummern. Die einleitenden Fragen eines Hauptstücks stehen beim ersten Stück, die Übergangsfragen beim letzten.' },
      { area: 'Lehre', text: 'Im Hausvater-Modus folgen nach Luthers Fragen zu einem Stück Löhes Fragen, jede mit „Antwort zeigen“. Mit „Nächstes Stück“ geht es ohne sie weiter.' },
    ],
  },
  {
    version: '1.6.0',
    date: '2026-10-14',
    title: 'Löhes Fragen zum Katechismus',
    changes: [
      { area: 'Lehre', text: 'Unter jedem Hauptstück steht eingeklappt die „Erklärung von Wilhelm Löhe“: seine Fragen und Antworten aus dem Haus-, Schul- und Kirchenbuch (1845), wortgetreu und in seine Lektionen eingeteilt. Jede Lektion lässt sich einzeln aufklappen.' },
      { area: 'Lehre', text: 'Auf der Übersicht der Lehre stehen unter den Hauptstücken Löhes Fragen zum ganzen Katechismus und zu den Gnadenmitteln. Die Suche findet alle 769 Fragen.' },
    ],
  },
  {
    version: '1.5.2',
    date: '2026-10-12',
    title: 'Die Bibellektion ohne Nummern',
    changes: [{ area: 'Sonntag', text: 'Die Absätze der Bibellektion nach Dieffenbach stehen ohne Nummern, wie bei Löhes Betrachtung. Die Liedverse bleiben abgesetzt.' }],
  },
  {
    version: '1.5.1',
    date: '2026-10-12',
    title: 'Die Bibellektion am Evangelium',
    changes: [
      { area: 'Sonntag', text: 'Die Bibellektion nach Dieffenbach öffnet sich jetzt im Advent über die Kachel „Evangelium“, so wie Löhes Betrachtung über die Kachel „Epistel“: „Andacht aus der Haus-Agende lesen“. Die eigene Kachel und die eigene Seite sind dafür weggefallen.' },
      { area: 'Sonntag', text: 'Außerhalb des Advents führt unter „Im Kirchenjahr“ ein Link zum ersten Advent; von dort geht es mit den Pfeilen von Sonntag zu Sonntag.' },
    ],
  },
  {
    version: '1.5.0',
    date: '2026-10-12',
    title: 'Die Bibellektionen der Adventssonntage',
    changes: [
      { area: 'Sonntag', text: 'In jeder Adventswoche steht über den Kacheln „Der Sonntag“ und „Mit der Schrift beten“ die Bibellektion des Sonntags nach Dieffenbachs Evangelischer Haus-Agende (1853): Überschrift, Leitwort, die Stelle zum Lesen in der Bibel und die Auslegung in nummerierten Absätzen, Liedverse abgesetzt. Der vierte Advent ist der letzte Sonntag vor dem Christfest.' },
      { area: 'Sonntag', text: 'Außerhalb des Advents führt im Sonntagsbereich ein Link zu den vier Bibellektionen; unten auf der Seite geht es von Sonntag zu Sonntag.' },
    ],
  },
  {
    version: '1.4.1',
    date: '2026-10-10',
    title: 'Die Gewissenserforschung wie zuvor',
    changes: [
      { area: 'Arena', text: 'Die Gewissenserforschung ist wieder wie vor 1.4.0: Psalm 139, die Prüfung am Dekalog aus dem Nachtgebet, Bekenntnis und Zuspruch. Die sechs Fragen und der Link in der Gebetskammer sind wieder herausgenommen.' },
    ],
  },
  {
    version: '1.4.0',
    date: '2026-10-10',
    title: 'Die Gewissenserforschung mit sechs Fragen',
    changes: [
      { area: 'Arena', text: 'Die Gewissenserforschung beginnt mit der Taufe aus dem Kleinen Katechismus („daß der alte Adam in uns durch tägliche Reue und Buße soll ersäuft werden …“) und Psalm 139,23 als Gebet. Danach stehen sechs Fragen zum Beten, ohne Feld: Wird gebetet, nicht notiert.' },
      { area: 'Arena', text: 'Nach dem Bekenntnis aus dem Nachtgebet steht jeden Tag zuerst ein Wort der Vergebung, am Montag, Mittwoch, Freitag und Sonntag 1. Johannes 1,9 mit Römer 8,14, an den anderen Tagen Römer 8,1 mit Galater 5,24. Zum Schluss: „Du bist getauft. Gehe hin in Frieden.“' },
      { area: 'Arena', text: 'In der Gebetskammer führt ein Link unter „Neuen Eintrag schreiben“ zur Gewissenserforschung, auch ohne Wüstenzeit. Läuft eine mit dieser Gewohnheit, hakt „Gebetet, abhaken und zurück“ sie ab.' },
    ],
  },
  {
    version: '1.3.0',
    date: '2026-10-10',
    title: 'Das Paket „Erbe“',
    changes: [
      { area: 'Arena', text: 'In der Wüstenzeit gibt es das Paket „Erbe“ für Väter: Gewissenserforschung, Familienzeit ohne Handy, jede Woche Zeit allein mit einem Kind und der Austausch mit einem Bruder.' },
      { area: 'Arena', text: 'Pakete lassen sich kombinieren: „Paket übernehmen“ fügt zu dem hinzu, was schon gewählt ist. Was in zwei Paketen steht, zählt einmal. Das steht jetzt auch in der Auswahl.' },
    ],
  },
  {
    version: '1.2.1',
    date: '2026-10-10',
    title: 'Die Kachel „Neuigkeiten“ schlichter',
    changes: [{ area: 'Mehr', text: 'Die Kachel „Neuigkeiten“ steht ohne Pfeil, darunter „Neues auf henoch.app“.' }],
  },
  {
    version: '1.2.0',
    date: '2026-10-10',
    title: 'Neuigkeiten und Versionen',
    changes: [
      { area: 'Mehr', text: 'Die Kachel „Neuigkeiten“ öffnet die Artikel auf henoch.app im Browser. Henoch gibt dabei nichts mit.' },
      { area: 'Mehr', text: 'Unter „Versionen“ stehen die Versionen von Henoch 1 obenauf. Die Versionen 0.1 bis 0.41 aus der Zeit des Aufbaus sind darunter zusammen zugeklappt.' },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-10-10',
    title: 'Eine Wüstenzeit im Advent',
    changes: [
      { area: 'Heute', text: 'Vom dritten Sonntag vor dem Advent bis zum Ende der ersten Adventswoche lädt eine Karte unter „Diese Woche“ zu einer Wüstenzeit bis Heiligabend ein. „Wüstenzeit vorbereiten“ öffnet den Beginn mit den Daten schon eingetragen. Nach „Diesmal nicht“ steht die Karte nicht mehr unter „Heute“, nur noch in der Arena.' },
      { area: 'Arena', text: 'In der Wüstenwanderung steht im Advent die Einladung mit Jesaja 40,3, den Daten und dem Weg hinein; „Anderen Zeitraum wählen“ beginnt eine Wüstenzeit wie bisher. Die Kachel nennt den Advent.' },
      { area: 'Arena', text: '„Mehr dazu auf henoch.app“ öffnet den Artikel zum Advent im Browser, auch unter „Anleitung“ einer Wüstenzeit im Advent. Henoch gibt dabei nichts mit.' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-10-08',
    title: 'Henoch 1.0',
    changes: [
      { area: 'Henoch', text: 'Die erste feste Version: Stille Zeit, Vesper und Nachtgebet, Gewohnheiten, Gebetskammer und Eisenschmiede, die geistliche Waffenrüstung, die Wüstenzeit, Wort und Lehre. Alles, was du einträgst, bleibt auf deinem Gerät.' },
      { area: 'Arena', text: 'Im 90-Tage-Standard steht die dritte Regel ohne „Zwei hintereinander vermeiden“. Statt vom Tracker ist von der Liste, der Wochenansicht der Wüstenzeit und den 90 Tagen die Rede.' },
    ],
  },
  {
    version: '0.41.1',
    date: '2026-10-08',
    title: 'Das Impressum vollständig',
    changes: [{ area: 'Mehr', text: 'Das Impressum nennt jetzt Anschrift und Kontaktadresse; kein Platzhalter steht mehr darin.' }],
  },
  {
    version: '0.41.0',
    date: '2026-10-08',
    title: 'Vor 1.0 durchgesehen',
    changes: [
      { area: 'Heute', text: 'Bleibt die App über Nacht offen oder holst du sie morgens aus dem Hintergrund, zeigt „Heute“ den neuen Tag. Vorher stand dort bis zum Neuladen der Vortag, und ein Haken landete dort.' },
      { area: 'Mehr', text: 'Ganz unten unter „Mehr“ steht die Versionsnummer. Das Impressum nennt die Kontaktadresse kontakt@henoch.app; der Datenschutz nennt jetzt auch die Rechtsgrundlage, die Übermittlung in die USA durch GitHub, den Speicher auf deinem Gerät und alle deine Rechte.' },
      { area: 'Ordnung', text: 'Das Haus steht vor der Gemeinde und die Gemeinde vor der Arbeit, jetzt auch in der Fürbitte der Vesper, unter „Über Henoch“, beim Stück der Waffenrüstung am Mittwoch und in den Wochen des 90-Tage-Standards (Woche 6 und 7, 9 und 10 getauscht).' },
      { area: 'Abend', text: 'Die Kurzform der Vesper spricht nicht mehr von Kindern; die Vesper betest du für dich.' },
      { area: 'Texte', text: 'Kleine Korrekturen: „heute Morgen“, der Weg zum Katechismus („Wort“ › „Lehre“), fünf Pakete der Wüstenzeit, „Gebetskammer“ statt „Tagebuch“ beim Schriftgebet und in der Suche.' },
    ],
  },
  {
    version: '0.40.0',
    date: '2026-10-07',
    title: 'Jedes nur einmal',
    changes: [
      { area: 'Heute', text: 'Stille Zeit, Vesper und Nachtgebet stehen nur noch oben als Kacheln, nicht zusätzlich in der Liste der Gewohnheiten. In der Wochenübersicht bleiben sie. Der Abschnitt unten heißt jetzt „Die letzten vier Wochen“.' },
      { area: 'Arena', text: 'Was Henoch schon kennt, führt die Wüstenzeit nicht doppelt: Bibellese und Bibel nach Plan sind das „Bibel lesen“ nach deinem Leseplan, Bewegung die „Leibliche Übung“, Geben „Opfer und Gaben“, der Geistliche Begleiter die „Gemeinschaft mit Brüdern“. Was du davon schon gewählt hattest, ist mit seinen Häkchen übernommen.' },
      { area: 'Arena', text: 'Morgensegen, Morgen- und Abendsegen, Psalm des Tages, Gewissenserforschung und Dankbarkeit sind abgehakt, sobald „Am Bett“, die Stille Zeit, die Vesper oder das Nachtgebet sie enthält oder eine Zeile Dank dasteht. An anderen Tagen hakst du von Hand ab. Das „i“ sagt jeweils, wo Henoch die Gewohnheit führt.' },
      { area: 'Arena', text: 'Der 90-Tage-Standard ist ein eigenes Paket, mit seinen Gewohnheiten und den Erklärungen aus der Vorlage. Wer ihn wählt, sieht in der Woche den Schwerpunkt mit Vers und Phase, und unter „Anleitung“ den ganzen Standard.' },
      { area: 'Arena', text: '„Wüstenzeit beginnen“ steht oben, gleich unter dem Bibelwort. Die Anleitung folgt darunter.' },
      { area: 'Stille Zeit', text: 'In der Lesung stehen Stelle, Vers und die Doppelfrage. Hauptaussage, Frage des Tages, Heilsgeschichte und die Randzeichen sind unter „Mehr notieren“ eingeklappt; steht dort schon etwas, ist es beim Öffnen gleich aufgeklappt. Die Bitte im vierfachen Kranz fragt jetzt „Worum bitte ich dich?“; was aus der Lesung folgt, gehört zu den drei Dingen.' },
      { area: 'Abend', text: 'Folgt das Nachtgebet, notierst du die Namen des Tages nur dort. Die Vesper hat dann kein eigenes Feld für die Fürbitte.' },
      { area: 'Rückblick', text: 'Die Gewohnheiten der letzten Wochen sind eine eigene Ansicht neben Tagen, Versen und Arena. Jeder Tag ist eine Zeile; „Morgen öffnen“, „Abend öffnen“ und „Tagesübersicht“ stehen im geöffneten Tag. Gezählt wird ohne Maßstab: „an 3 Tagen“ statt „an 3 von 7 Tagen“.' },
    ],
  },
  {
    version: '0.39.5',
    date: '2026-10-07',
    title: 'Der Dank in seinen Zeilen',
    changes: [
      { area: 'Heute', text: '„Aufschreiben“ bei der Dankbarkeit öffnet die drei Zeilen „Ich danke dir, mein Gott, für …“ des Tages. Der Dank steht dann auch im Nachtgebet und im Wochenrückblick. Beim Tagebuch einer übernommenen Runde steht davor „Der Satz, der mich trifft“. Wer lieber frei schreibt, geht von dort in die Gebetskammer.' },
    ],
  },
  {
    version: '0.39.4',
    date: '2026-10-07',
    title: 'Die Gewissenserforschung auf eigener Seite',
    changes: [
      { area: 'Heute', text: 'Bei der Gewissenserforschung der Wüstenzeit steht „Beten“: Es öffnet eine eigene Seite mit Psalm 139, der Frage des Tages, dem Bekenntnis und dem Zuspruch wie im Nachtgebet. Ein Schreibfeld gibt es dort nicht; Sünde wird gebetet, nicht notiert. „Gebetet, abhaken und zurück“ hakt die Gewohnheit ab und führt zurück zur Liste.' },
    ],
  },
  {
    version: '0.39.3',
    date: '2026-10-07',
    title: 'Die Erklärung am richtigen Platz',
    changes: [
      { area: 'Arena', text: 'Die Erklärung hinter dem „i“ einer Gewohnheit steht jetzt direkt unter ihrer Zeile und schiebt die übrigen nach unten. Es ist immer nur eine offen: Ein Tipp auf ein anderes „i“ wechselt zu dessen Erklärung, ein Tipp anderswo schließt sie.' },
    ],
  },
  {
    version: '0.39.2',
    date: '2026-10-07',
    title: 'Den Dank aufschreiben',
    changes: [
      { area: 'Heute', text: 'Bei der Dankbarkeit und beim Tagebuch der Wüstenzeit steht „Aufschreiben“: Es öffnet einen neuen Eintrag in der Gebetskammer. „Sichern, abhaken und zurück“ hakt die Gewohnheit ab und führt zurück zur Liste. Wer lieber auf Papier schreibt, hakt einfach ab.' },
    ],
  },
  {
    version: '0.39.1',
    date: '2026-10-07',
    title: 'Die Wüstenwanderung',
    changes: [
      { area: 'Arena', text: 'Der Ort in der Arena heißt jetzt „Wüstenwanderung“. Jede einzelne Zeit darin bleibt eine Wüstenzeit, ebenso der Schalter unter Darstellung und die Gruppe unter „Heute“.' },
    ],
  },
  {
    version: '0.39.0',
    date: '2026-10-07',
    title: 'Die Wüstenzeit',
    changes: [
      { area: 'Arena', text: 'In der Arena steht die Wüstenwanderung. Eine Wüstenzeit ist ein fester Zeitraum von 40 oder 90 Tagen oder frei gewählt, mit Gewohnheiten aus vier Paketen (Aufbruch, Wüstenweg, Wie die Wüstenväter, Hauskirche), aus weiteren Vorschlägen oder eigenen. Ein Paket übernimmst du auf einmal, jede Gewohnheit wählst du auch einzeln.' },
      { area: 'Heute', text: 'Die Gewohnheiten der Wüstenzeit stehen unter „Heute“ als eigene Gruppe zuerst, deine übrigen darunter. Das kleine „i“ öffnet eine kurze Beschreibung. Fastentage, wöchentliche und Advent-Gewohnheiten erscheinen nur, wenn sie dran sind. Am Montag lässt sich der Sonntag noch nachtragen.' },
      { area: 'Arena', text: 'In der Arena stehen Anleitung und Überblick: Tag und Woche, was du bisher gehalten hast, und der Leitvers deines Pakets. Nach dem letzten Tag kannst du Gewohnheiten in den Alltag übernehmen. Der 90-Tage-Standard bleibt in der Anleitung.' },
      { area: 'Arena', text: 'Eine laufende Runde wird zur Wüstenzeit; ihre Gewohnheiten und Haken bleiben erhalten. Frühere Runden stehen weiter im Rückblick.' },
    ],
  },
  {
    version: '0.38.1',
    date: '2026-10-07',
    title: 'Neue Namen in der Wüstenwanderung',
    changes: [
      { area: 'Arena', text: 'Die Anleitung der Wüstenwanderung heißt jetzt „Der 90-Tage-Standard“, die Liste daraus beim Start einer Runde „Vorlage“. Eine Runde ohne eigenen Namen heißt einfach „Runde“; den Namen wählst du frei, etwa „Fastenzeit“.' },
    ],
  },
  {
    version: '0.38.0',
    date: '2026-10-07',
    title: 'Eigene Gewohnheiten in der Wüstenwanderung',
    changes: [
      { area: 'Arena', text: 'In der Wüstenwanderung legst du die Gewohnheiten selbst fest. Unter „Meine Gewohnheiten“ fügst du eigene hinzu, änderst Wortlaut, Tage und Block (Morgen, Haus, Arbeit), sortierst sie und nimmst heraus, was nicht passt. Was die Vorlage vorschlägt, steht darunter zum Aufnehmen bereit.' },
      { area: 'Arena', text: 'Eine neue Runde beginnt mit den Gewohnheiten der letzten Runde, mit der Vorlage oder leer. Jede Runde behält ihre eigene Liste; frühere Runden bleiben, wie sie waren.' },
      { area: 'Arena', text: 'Nimmst du eine Gewohnheit heraus, die du schon abgehakt hast, bleiben ihre Haken gespeichert und stehen im Export. Die Uhrzeiten schreibst du jetzt direkt in den Wortlaut, etwa „05:00 auf, kein Handy“.' },
    ],
  },
  {
    version: '0.37.4',
    date: '2026-10-06',
    title: 'Kapitel am Tag ohne Wechsel',
    changes: [
      { area: 'Bibel', text: 'Beim Leseplan gibt es „2, 1, 1, 1 im Wechsel“ nicht mehr. Wer ihn hatte, liest im Alten Testament jetzt ein Kapitel am Tag, ab dem Kapitel, an dem er stand; das lässt sich unter „Kapitel am Tag“ ändern. Ein neuer Plan beginnt mit je einem Kapitel aus dem Alten und dem Neuen Testament.' },
    ],
  },
  {
    version: '0.37.3',
    date: '2026-10-06',
    title: 'Die neue Adresse',
    changes: [
      { area: 'Mehr', text: 'Henoch ist umgezogen und jetzt unter mein.henoch.app zu finden. Die Anleitungen zum Installieren und zum Flugmodus nennen die neue Adresse.' },
    ],
  },
  {
    version: '0.37.2',
    date: '2026-10-06',
    title: 'Die Wüstenwanderung, neu beschrieben',
    changes: [
      { area: 'Arena', text: 'Die Einladung in die Wüstenwanderung ist neu gefasst: Du hältst für einen Zeitraum deiner Wahl einen festen Tagesstandard, mit festen Gewohnheiten, die dir helfen, geistlich zu wachsen.' },
    ],
  },
  {
    version: '0.37.1',
    date: '2026-10-06',
    title: 'Der Zuspruch im Wochenrückblick',
    changes: [
      { area: 'Andacht', text: 'Der Wochenrückblick endet mit demselben Zuspruch wie der Wochenrückblick der Wüstenwanderung: „Die Güte des HERRN ist’s, daß wir nicht gar aus sind“ (Klagelieder 3,22–23).' },
    ],
  },
  {
    version: '0.37.0',
    date: '2026-10-06',
    title: 'Der Wochenrückblick',
    changes: [
      { area: 'Andacht', text: 'Neu: Am Sonntagabend steht im Nachtgebet der Wochenrückblick, an Stelle von Dank und Rückschau des Tages. Wofür danke ich in dieser Woche? Für meine Frau und die Kinder, mit ihren Namen aus „Mein Haus“, für meine Gemeinde, meine Arbeit, meine Nächsten und unser Land, jeweils mit einer Stelle aus der Schrift. Dazu höchstens ein Vorsatz für die neue Woche. Danach folgen wie immer Prüfung und Zuspruch.' },
      { area: 'Andacht', text: 'Oben steht, was du die Woche über abends beim Dank notiert hast. Läuft eine Wüstenzeit, stehen ihre drei Fragen im selben Rückblick. Die Taste „Weiter“ springt zum nächsten Feld.' },
      { area: 'Mehr', text: 'Unter „Mehr → Darstellung“ lässt sich der Wochenrückblick ausschalten. Die Kurzform des Nachtgebets bleibt kurz.' },
    ],
  },
  {
    version: '0.36.2',
    date: '2026-10-06',
    title: 'Die Vorbereitung am Samstagabend',
    changes: [
      { area: 'Sonntag', text: 'Am Samstagabend heißt es jetzt „Vorbereitung“ statt „Bereitung“: im Hinweis ab 18 Uhr und in der Hilfe für das Haus.' },
    ],
  },
  {
    version: '0.36.1',
    date: '2026-10-06',
    title: 'Der Gebetsgang nach Luther 1912',
    changes: [
      { area: 'Sonntag', text: 'Die Bibeltexte im Gebetsgang „Mit der Schrift beten“ stehen jetzt Wort für Wort nach der Lutherbibel 1912, etwa Psalm 51,14 „und mit einem freudigen Geist rüste mich aus“ und Philipper 2,4 „sondern auch auf das, was des andern ist“.' },
    ],
  },
  {
    version: '0.36.0',
    date: '2026-10-06',
    title: 'Der Sonntag im Haus',
    changes: [
      { area: 'Sonntag', text: 'Neu: „Der Sonntag – eine Hilfe für das Haus“, eine Seite zum Lesen über Wort und Ruhe, einen Sonntag im Haus und was frei bleibt. Ab Samstag 18 Uhr führt ein Hinweis direkt zur Bereitung am Samstagabend.' },
      { area: 'Sonntag', text: 'Neu: „Mit der Schrift beten“, ein Gebetsgang durch die Schrift in acht Schritten, von der Anbetung bis zum Segen. Nach jedem Schritt hältst du inne und betest mit eigenen Worten weiter. Am Ende kannst du Gedanken in der Gebetskammer festhalten.' },
      { area: 'Sonntag', text: 'Am Sonntag stehen beide oben auf der Sonntagsseite und, mit der Sonntagsruhe, auch unter „Heute“. An den anderen Tagen findest du sie am Ende der Sonntagsseite.' },
    ],
  },
  {
    version: '0.35.2',
    date: '2026-10-06',
    title: 'Mehr zu diesem Sonntag',
    changes: [
      { area: 'Heute', text: 'Der Knopf unter der Sonntagskarte heißt jetzt „Mehr zu diesem Sonntag“. Er führt zu Bedeutung, Lesungen und Kirchenjahr.' },
    ],
  },
  {
    version: '0.35.1',
    date: '2026-10-06',
    title: 'Der Rückblick aufgeräumt',
    changes: [
      { area: 'Heute', text: 'Im Rückblick stehen die Stillen Zeiten und die gesammelten Verse nebeneinander, die drei Dinge in voller Breite darunter. Nichts läuft mehr über den Rand, und die Legende steht sauber neben ihren Farben.' },
    ],
  },
  {
    version: '0.35.0',
    date: '2026-10-06',
    title: 'Sonntagsruhe',
    changes: [
      { area: 'Heute', text: 'Neu unter „Mehr → Darstellung“: die Sonntagsruhe. Eingeschaltet stehen am Sonntag keine Gewohnheiten an. Oben unter „Heute“ steht dann der Sonntag selbst, mit Wochenspruch, Evangelium und Epistel.' },
      { area: 'Rückblick', text: 'Mit der Sonntagsruhe zählt der Sonntag bei den Gewohnheiten im Rückblick nicht mit: eine Woche hat dort sechs Tage. Was du an Sonntagen schon abgehakt hast, bleibt gespeichert.' },
    ],
  },
  {
    version: '0.34.1',
    date: '2026-10-05',
    title: 'Was gebetet war, auch an vergangenen Tagen',
    changes: [
      { area: 'Heute', text: 'Stille Zeit, Vesper und Nachtgebet stehen wieder in der Liste des Tages. Blätterst du auf einen vergangenen Tag, siehst du, was du an ihm gebetet hast. Abgehakt werden sie durch das Gebet selbst.' },
    ],
  },
  {
    version: '0.34.0',
    date: '2026-10-02',
    title: 'Der Abend neu geordnet',
    changes: [
      { area: 'Andacht', text: 'Die Vesper hat drei Seiten nach der Ordnung der lutherischen Kirchenordnungen: Lob (Eröffnung, Psalm), Wort (Lesung oder Andacht, Hymnus, Magnificat) und Gebet (Fürbitte, Vaterunser, Kollekte, Segen). Die Kurzform steht auf einer Seite.' },
      { area: 'Andacht', text: 'Das Nachtgebet folgt Luthers Abendsegen aus dem Kleinen Katechismus und hat vier Seiten: Kreuz, Glaube, Vaterunser – Dank und Rückschau – Prüfung und Zuspruch – Abendsegen. Die Kurzform steht auf einer Seite.' },
      { area: 'Andacht', text: 'Unter den Zeichen der Leiste stehen die Namen der Seiten.' },
      { area: 'Andacht', text: 'Nach der Rückschau führt „In der Gebetskammer weiterschreiben“ in die Arena, für alles, was ausführlicher werden will.' },
    ],
  },
  {
    version: '0.33.0',
    date: '2026-10-02',
    title: 'Eine Andacht in der Vesper',
    changes: [
      { area: 'Andacht', text: 'In der Vesper wählst du bei der Lesung zwischen „Lesung“ und „Andacht“. Für eine Andacht aus einem Buch trägst du ein, welche es war, und schreibst in ein mitwachsendes Feld, was dir wichtig geworden ist. Beides steht im Rückblick, in der Suche und im Export.' },
    ],
  },
  {
    version: '0.32.2',
    date: '2026-10-02',
    title: 'Das Gebet verständlicher erklärt',
    changes: [
      { area: 'Andacht', text: 'Am Anfang von „Das Gebet“ heißt der Schritt jetzt „Worüber du betest“. Der Text erklärt in einfachen Sätzen, was der vierfache Kranz ist und welchen Text du dafür nimmst.' },
    ],
  },
  {
    version: '0.32.1',
    date: '2026-10-01',
    title: 'Einheitliche Überschriften unter „Wort“',
    changes: [
      { area: 'Wort', text: 'Die Seite heißt wie ihr Bereich „Wort“; darunter wählst du Bibel oder Lehre. Doppelte Überschriften sind weggefallen.' },
    ],
  },
  {
    version: '0.32.0',
    date: '2026-10-01',
    title: 'Fünf Bereiche, ruhigeres „Heute“',
    changes: [
      { area: 'Bedienung', text: 'Unten stehen fünf Bereiche: Wort, Andacht, Heute in der Mitte, Arena, Mehr. Die App öffnet immer bei „Heute“.' },
      { area: 'Heute', text: 'Der Sonntag der Woche ist eine Kachel unter „Heute“. In der Liste der Gewohnheiten stehen nur noch die, die du selbst abhakst; Stille Zeit, Vesper und Nachtgebet stehen oben als Kacheln. Erledigte wöchentliche und monatliche rücken ans Ende.' },
      { area: 'Wort', text: 'Bibel und Lehre stehen unter „Wort“ nebeneinander, oben umschaltbar.' },
      { area: 'Arena', text: 'Die Einstellungen der Wüstenwanderung sind auch in der Wüstenwanderung selbst zu finden, unten zum Aufklappen.' },
      { area: 'Mehr', text: 'Das Impressum steht als schmale Zeile unter den Kacheln. Im Rückblick unter „Heute“ stehen die Zeichen der drei Dinge mit Worten.' },
    ],
  },
  {
    version: '0.31.0',
    date: '2026-10-01',
    title: 'Gewohnheiten: ein Tag, eine Liste',
    changes: [
      { area: 'Mehr', text: 'Unter „Was sich geändert hat“ stehen die Versionen nach ihrer Nummer gruppiert: Nachbesserungen wie 0.30.1 stehen bei 0.30.' },
      { area: 'Heute', text: 'Die Gewohnheiten stehen nur noch einmal da: oben die sieben Tage der Woche zum Antippen, darunter die Liste des gewählten Tages. So trägst du auch frühere Tage nach. Die Wochenübersicht als Raster ist eingeklappt darunter.' },
      { area: 'Arena', text: 'In der Tagesansicht der Wüstenwanderung steht unter „Heute“ das Datum.' },
    ],
  },
  {
    version: '0.30.1',
    date: '2026-10-01',
    title: 'Feinschliff der Wüstenwanderung',
    changes: [
      { area: 'Arena', text: 'Name und Zeitraum der Runde stehen als Unterzeile unter „Wüstenwanderung“; die Einleitung des Plans steht am Anfang der Anleitung. Der Beginn einer Runde steht ohne doppelten Rahmen.' },
      { area: 'Arena', text: 'Ein Tipp auf „Heute“ in der Tagesansicht der Wüstenwanderung führt zur Seite „Heute“.' },
      { area: 'Heute', text: 'Auch unter „Heute“ lässt sich beim Tagebuch der Wüstenwanderung gleich aufschreiben.' },
    ],
  },
  {
    version: '0.30.0',
    date: '2026-10-01',
    title: 'Arena und Gewohnheiten neu gestaltet',
    changes: [
      { area: 'Arena', text: 'Die Arena beginnt mit drei Kacheln: Gebetskammer, Eisenschmiede und Wüstenwanderung, jede mit dem, was dort gerade steht. Ein Tipp öffnet den Ort auf einer eigenen Seite.' },
      { area: 'Arena', text: 'Die Wüstenwanderung steht immer in der Arena. Läuft keine Runde, beginnst du dort eine, und die Anleitung ist schon zu lesen.' },
      { area: 'Heute', text: 'Die Gewohnheiten stehen oben als Liste für den Tag, abgehakt mit einem Antippen der ganzen Zeile. Darunter folgt die Woche als Übersicht zum Nachtragen.' },
    ],
  },
  {
    version: '0.29.0',
    date: '2026-10-01',
    title: 'Haus vor Arbeit, schönere Wüstenwanderung, besseres Deutsch',
    changes: [
      { area: 'Heute', text: 'Neben „Wüstenwanderung“ stehen der Name der Runde und ihr Zeitraum; die Gewohnheiten sind nach „Täglich“ und „Woche und Monat“ gegliedert.' },
      { area: 'Arena', text: 'Im Plan der Wüstenwanderung steht das Haus vor der Arbeit. Die Reihenfolge gilt in der ganzen App: Gott, Familie und Haus, Gemeinde, Arbeit, ich.' },
      { area: 'Arena', text: 'Die Tagesansicht der Wüstenwanderung ist ruhiger gestaltet: runde Knöpfe zum Blättern, „Aufschreiben“ beim Tagebuch direkt in der Zeile, das Eingabefeld in einer eigenen Fläche.' },
      { area: 'Heute', text: 'Tage vor dem Beginn einer Runde stehen in der Tabelle mit voller Breite und einem stillen Punkt statt eines grauen Streifens.' },
      { area: 'Rückblick', text: 'Bei den Gewohnheiten führt ein Eintrag „Wüstenwanderung“ zum Dashboard der laufenden Runde.' },
      { area: 'Sprache', text: 'Texte in Arena, Heute und unter Mehr sind sprachlich überarbeitet.' },
    ],
  },
  {
    version: '0.28.0',
    date: '2026-10-01',
    title: 'Die Wüstenwanderung für jeden Zeitraum',
    changes: [
      { area: 'Einstellungen', text: 'Unter Darstellung heißt der Schalter jetzt „Wüstenzeit“. Eine Runde bekommt einen Namen, etwa „Fastenzeit“, ein Startdatum und einen letzten Tag oder eine Dauer, von einem Tag bis zu einem Jahr. Der 90-Tage-Standard bleibt die Anleitung.' },
      { area: 'Arena', text: 'Der Name der Runde steht über der Wüstenwanderung, im Rückblick und im Export.' },
    ],
  },
  {
    version: '0.27.0',
    date: '2026-10-01',
    title: '„Heute“ im Modus der Wüstenwanderung',
    changes: [
      { area: 'Heute', text: 'Solange eine Runde läuft, stehen unter „Heute“ die Gewohnheiten der Wüstenwanderung an Stelle der übrigen, mit einem Weg zur Wüstenwanderung. Deine übrigen Gewohnheiten bleiben gespeichert und kommen zurück, wenn die Runde endet oder du die Wüstenwanderung ausschaltest.' },
    ],
  },
  {
    version: '0.26.0',
    date: '2026-10-01',
    title: 'Gewohnheiten der Wüstenwanderung abschalten',
    changes: [
      { area: 'Gewohnheiten', text: 'Jede Gewohnheit der Wüstenwanderung lässt sich unter Gewohnheiten einzeln aus- und wieder einschalten. Ausgeschaltet verschwindet sie aus „Heute“ und aus der Wüstenwanderung; ihre Haken bleiben.' },
    ],
  },
  {
    version: '0.25.1',
    date: '2026-10-01',
    title: 'Durch die ganze Runde blättern',
    changes: [
      { area: 'Arena', text: 'Unter „Tag“ blätterst du jetzt durch die ganze Runde, auch nach vorn. Künftige Tage siehst du, abhaken kannst du sie erst an ihnen selbst.' },
      { area: 'Darstellung', text: 'Lange Wörter in Kacheln werden mit Bindestrich getrennt, auch in der Vorschau.' },
    ],
  },
  {
    version: '0.25.0',
    date: '2026-10-01',
    title: 'Die Wüstenwanderung neu geordnet',
    changes: [
      { area: 'Arena', text: 'Die Wüstenwanderung hat oben eine Karte mit Tag, Phase, Woche, Vers und Auftrag, darunter drei Reiter: Tag, Woche und Anleitung. Die Anleitung steht als Kacheln.' },
      { area: 'Arena', text: 'Unter „Tag“ blätterst du durch die Tage der Runde und trägst nach, was war. Abgehakt wird mit einem Antippen der ganzen Zeile.' },
      { area: 'Arena', text: 'Beim Tagebuch trägst du den Satz, der dich trifft, und drei Dankpunkte gleich dort ein, oder du schreibst in der Gebetskammer.' },
    ],
  },
  {
    version: '0.24.0',
    date: '2026-10-01',
    title: 'Wüstenwanderung: Abschluss, Rückblick und Gewohnheiten',
    changes: [
      { area: 'Arena', text: 'Nach dem letzten Tag einer Runde zeigt die Wüstenwanderung „Tag 90 – und danach“ mit den Wochenrückblicken der Runde. Von dort beginnst du eine neue Runde oder exportierst alles als Markdown.' },
      { area: 'Rückblick', text: 'Unter „Wüstenwanderung“ stehen alle Runden, auch beendete, zum Nachlesen.' },
      { area: 'Heute', text: 'Solange eine Runde läuft, stehen ihre Gewohnheiten unter „Heute“ in der Gruppe Wüstenwanderung. Ein Haken dort gilt auch in der Wüstenwanderung.' },
      { area: 'Gewohnheiten', text: 'Gewohnheiten mit deiner Frau, deinen Kindern oder der Familie erscheinen erst, wenn sie unter „Mein Haus“ eingetragen sind.' },
      { area: 'Arena', text: 'Die beiden Arbeitsblöcke sind aus der Liste der Wüstenwanderung genommen.' },
    ],
  },
  {
    version: '0.23.0',
    date: '2026-10-01',
    title: 'Der 90-Tage-Standard in der Wüstenwanderung',
    changes: [
      { area: 'Einstellungen', text: 'Unter Darstellung lässt sich der 90-Tage-Standard einschalten: mit Startdatum und Dauer in Kalendertagen, eigenen Wochentagen je Punkt und deinen Zeiten. Ausgeschaltet bleibt die Runde mit allen Haken und Rückblicken erhalten.' },
      { area: 'Arena', text: 'Solange er läuft, steht neben Gebetskammer und Eisenschmiede die Wüstenwanderung: wo die Runde steht, Vers und Auftrag der Woche, die Liste für heute, die Woche als Raster zum Nachtragen, Wochenstandard und Wochenrückblick mit dem Zuspruch aus Klagelieder 3. Darunter die Anleitung.' },
    ],
  },
  {
    version: '0.22.0',
    date: '2026-10-01',
    title: 'Die Apologie und der Traktat',
    changes: [
      { area: 'Lehre', text: 'Im Konkordienbuch steht jetzt die Apologie der Augsburgischen Konfession in Justus Jonas’ Verdeutschung: Melanchthons Vorrede und alle Artikel, wortgetreu nach der Ausgabe von 1881. Weil sie lang ist, lädt sie erst, wenn du sie öffnest.' },
      { area: 'Lehre', text: 'Dazu kommt Melanchthons Traktat „Von der Gewalt und Oberkeit des Pabsts“ von 1537, mit dem Abschnitt von der Bischöfe Gewalt und Jurisdiction.' },
      { area: 'Suchen', text: 'Die Suche findet auch in Apologie und Traktat.' },
    ],
  },
  {
    version: '0.21.0',
    date: '2026-10-01',
    title: 'Die Schmalkaldischen Artikel',
    changes: [
      { area: 'Lehre', text: 'Im Konkordienbuch stehen jetzt Luthers Schmalkaldische Artikel von 1537: Vorrede, die drei Theile mit allen Artikeln und Melanchthons Unterschrift, wortgetreu nach der Ausgabe von 1881.' },
      { area: 'Lehre', text: 'Die Augsburgische Konfession ist vollständig: Der XXVIII. Artikel „Von der Bischöfe Gewalt“ und der Beschluß mit den Unterschriften sind dazugekommen.' },
      { area: 'Suchen', text: 'Die Suche findet auch in den Schmalkaldischen Artikeln und im XXVIII. Artikel.' },
    ],
  },
  {
    version: '0.20.0',
    date: '2026-10-01',
    title: 'Die Lehre neu geordnet',
    changes: [
      { area: 'Lehre', text: 'Die Seite heißt jetzt „Lehre“ und hat zwei Bereiche. Unter „Lernen“ stehen die Karte der Woche, schlanker als bisher, und die sechs Hauptstücke. Unter „Lesen“ steht das Konkordienbuch über die ganze Breite, darunter Kirchenjahr, Haustafel, Tischgebete und Privatbeichte.' },
      { area: 'Lehre', text: 'Ein anderes Hauptstück für die Woche wählst du jetzt auf seiner eigenen Seite mit „Für diese Woche nehmen“.' },
    ],
  },
  {
    version: '0.19.0',
    date: '2026-10-01',
    title: 'Das Konkordienbuch',
    changes: [
      { area: 'Lehre', text: 'Oben in der Lehre steht das Konkordienbuch als eigene Kachel: was es ist und wie es entstand, dazu sein Inhalt. Die drei Bekenntnisse, die Augsburgische Konfession, der Kleine und der Große Katechismus öffnen sich von dort; Apologie, Schmalkaldische Artikel, Traktat und Konkordienformel folgen.' },
    ],
  },
  {
    version: '0.18.0',
    date: '2026-10-01',
    title: 'Der Große Katechismus',
    changes: [
      { area: 'Lehre', text: 'Im Anhang steht Luthers Großer Katechismus vollständig: beide Vorreden, die Zehn Gebote, der Glaube, das Vater Unser, die Taufe mit der Kindertaufe und das Sacrament des Altars, jedes Stück für sich aufzuklappen, wortgetreu nach dem Konkordienbuch (St. Louis 1881). Die Suche findet ihn mit.' },
      { area: 'Arena', text: 'Gebetsanliegen, Bibelstellen und was du mit den Brüdern besprechen willst, brechen am Ende der Zeile um, das Feld wächst mit. Bekannte Anliegen stehen beim Tippen als Vorschläge darunter.' },
    ],
  },
  {
    version: '0.17.0',
    date: '2026-09-30',
    title: 'Der Kleine Katechismus nach dem Konkordienbuch',
    changes: [
      { area: 'Lehre', text: 'Luthers Kleiner Katechismus steht jetzt wortgetreu im Wortlaut des Konkordienbuchs (St. Louis 1881, nach dem Urtext von 1580): „Du sollst nicht andere Götter haben“, „Geheiligt werde dein Name“, „Und verlaß uns unsere Schuld“, in der Rechtschreibung der Ausgabe.' },
    ],
  },
  {
    version: '0.16.0',
    date: '2026-09-30',
    title: 'Suchen',
    changes: [
      { area: 'Suchen', text: 'Oben rechts steht auf jeder Seite die Lupe. Die Suche geht durch Katechismus, Bekenntnisse, Augsburgische Konfession, Sonntage, Betrachtungen, Gebete und deine eigenen Einträge und öffnet die Stelle mit einem Tipp.' },
      { area: 'Suchen', text: 'Alte Schreibweisen werden mitgefunden („Teil“ findet „Theil“, „Sakrament“ findet „Sacrament“), ebenso ein Wort mit einem Tippfehler. Die Suche läuft ganz auf deinem Gerät.' },
    ],
  },
  {
    version: '0.15.0',
    date: '2026-09-30',
    title: 'Die Augsburgische Konfession',
    changes: [
      { area: 'Lehre', text: 'Im Anhang steht die Augsburgische Konfession von 1530: die Vorrede und die Artikel I bis XXVII, jeder für sich aufzuklappen, wortgetreu nach dem Konkordienbuch (St. Louis 1881). Der XXVIII. Artikel und der Beschluss folgen.' },
    ],
  },
  {
    version: '0.14.0',
    date: '2026-09-30',
    title: 'Das Athanasianum im Wortlaut',
    changes: [
      { area: 'Lehre', text: 'Das Athanasianische Glaubensbekenntnis steht jetzt vollständig im Anhang „Die drei Bekenntnisse“, wortgetreu nach dem Konkordienbuch (St. Louis 1881, nach dem Urtext von 1580).' },
    ],
  },
  {
    version: '0.13.0',
    date: '2026-09-30',
    title: 'Löhe am 2. Christtag und zu Neujahr',
    changes: [
      { area: 'Sonntag', text: 'In der Woche, in die der 2. Christtag oder der Neujahrstag fällt, steht unter Evangelium und Epistel eine eigene Kachel mit der Epistel des Festtags. Sie öffnet Löhes Betrachtung aus der Winterpostille.' },
    ],
  },
  {
    version: '0.12.0',
    date: '2026-09-30',
    title: 'Löhe im Advent und zu Weihnachten',
    changes: [
      { area: 'Sonntag', text: 'Die Epistel-Kachel öffnet Löhes Betrachtungen aus der Winterpostille für die vier Adventssonntage, das Christfest, den Sonntag nach dem Christfest und den Sonntag nach Neujahr, im Wortlaut und in der Rechtschreibung des Originals.' },
    ],
  },
  {
    version: '0.11.0',
    date: '2026-09-30',
    title: 'Die drei Bekenntnisse',
    changes: [
      { area: 'Lehre', text: 'Im Anhang stehen die drei altkirchlichen Bekenntnisse, je mit einer Erklärung: das Apostolische in Luthers Wortlaut, das Nizänische in der heutigen Fassung und das Athanasianische. Dessen Wortlaut folgt, sobald eine alte Fassung vorliegt.' },
    ],
  },
  {
    version: '0.10.1',
    date: '2026-09-30',
    title: 'Löhes Buch beim Namen',
    changes: [
      { area: 'Sonntag', text: 'Unter Löhes Betrachtungen zur Epistel steht jetzt der Titel seines Buches: „Kurze Lectionen zu den sonn- und festtäglichen Episteln des Kirchenjahres. Neben der Evangelienpostille zu lesen.“' },
    ],
  },
  {
    version: '0.10.0',
    date: '2026-09-30',
    title: 'Löhe zur Epistel',
    changes: [
      { area: 'Sonntag', text: 'Auch die Epistel kann nun eine Betrachtung öffnen: Wilhelm Löhe, lutherischer Pfarrer, zu den Episteln des 17. und 18. Sonntags nach Trinitatis, Wort für Wort in der alten Schreibweise.' },
    ],
  },
  {
    version: '0.9.1',
    date: '2026-09-30',
    title: 'Die Andacht ohne Nummern',
    changes: [
      { area: 'Sonntag', text: 'Die Andacht aus der Haus-Agende steht als fortlaufender Text, ohne die Nummern der Abschnitte.' },
    ],
  },
  {
    version: '0.9.0',
    date: '2026-09-30',
    title: 'Die alte Leseordnung',
    changes: [
      { area: 'Sonntag', text: 'Evangelium und Epistel folgen jetzt der altkirchlichen Leseordnung, wie in der lutherischen Kirche seit der Reformation und in Dieffenbachs Haus-Agende – am 18. Sonntag nach Trinitatis also Matthäus 22,34-46. Themen und Kurzfassungen sind dazu neu geschrieben. Die letzten drei Sonntage sind der 25. bis 27. nach Trinitatis.' },
      { area: 'Haus-Agende', text: 'Wo die Haus-Agende eine Bibellection zum Sonntag hat, öffnet ein Tipp auf das Evangelium diese Andacht, Wort für Wort in der Schreibweise von 1853. Den Anfang macht der 18. Sonntag nach Trinitatis: „Des Gesetzes und des Evangeliums Summe“.' },
    ],
  },
  {
    version: '0.8.4',
    date: '2026-09-30',
    title: 'Auch die Episteln durchgesehen',
    changes: [
      { area: 'Sonntag', text: 'Die Kurzfassungen der Episteln sind mit dem Text der Lutherbibel 1912 abgeglichen und stehen näher an seinem Wortlaut: etwa „Gnadenstuhl“ statt „Thron der Gnade“, „Geduld bringt Erfahrung“, „das Bad der Wiedergeburt“, „Richtstuhl Christi“, „Unser Wandel ist im Himmel“, „lasst die Sonne nicht über eurem Zorn untergehen“.' },
    ],
  },
  {
    version: '0.8.3',
    date: '2026-09-30',
    title: 'Genauer nacherzählt',
    changes: [
      { area: 'Sonntag', text: 'Die Kurzfassungen von Evangelium und Epistel sind durchgesehen und näher am Text: Die kanaanäische Frau bittet für ihre kranke Tochter; am Ostermorgen spricht ein Jüngling in weißem Kleid; bei der Himmelfahrt zwei Männer in weißen Kleidern; bei Matthäus die Tochter eines Obersten (ohne den Namen Jairus). Auch das große Abendmahl, die Weingärtner und die Bergpredigt vom Vergelten sind genauer gefasst.' },
    ],
  },
  {
    version: '0.8.2',
    date: '2026-09-30',
    title: 'Versionen zum Aufklappen',
    changes: [
      { area: 'Versionen', text: 'Die Versionen stehen als Liste mit Nummer, Datum und Titel. Ein Tipp klappt auf, was sie gebracht hat; die neueste ist offen, und es ist immer nur eine aufgeklappt.' },
    ],
  },
  {
    version: '0.8.1',
    date: '2026-09-30',
    title: 'Ein neues Zeichen',
    changes: [
      { area: 'App-Symbol', text: 'Henoch hat ein eigenes Zeichen: die Sonne über dem Horizont, der Weg, der zu ihr führt. Dasselbe Zeichen steht unten in der Leiste bei „Heute“.' },
    ],
  },
  {
    version: '0.8.0',
    date: '2026-09-30',
    title: 'Ein eigener Platz für die Gebetskammer',
    changes: [
      { area: 'Gebetskammer', text: 'Die Einträge der Gebetskammer und der Eisenschmiede liegen jetzt in einem eigenen Speicher, jeder für sich. Auch viele Seiten Handschrift machen die App nicht langsamer, und beim Schreiben wird nur der Eintrag gespeichert, an dem du gerade schreibst.' },
      { area: 'Deine Daten', text: 'Beim ersten Start zieht die App die vorhandenen Einträge einmal um, in einem Schritt: Die alte Ablage wird erst geleert, wenn alles am neuen Platz liegt. Sicherungen aus früheren Versionen lassen sich weiter einspielen.' },
    ],
  },
  {
    version: '0.7.1',
    date: '2026-09-30',
    title: 'Durchgesehen',
    changes: [
      { area: 'Neuer Tag', text: 'Bleibt die App über Nacht offen, zeigt sie beim Wiederöffnen den neuen Tag. Vorher stand unter „Heute“ noch der Vortag, und ein Tipp wurde dort eingetragen.' },
      { area: 'Alles löschen', text: 'Löscht jetzt auch die letzten Geräte-Einstellungen, etwa ob du zuletzt mit dem Stift geschrieben hast.' },
      { area: 'Bibeltexte', text: 'Jeder Bibelvers der App wird bei jeder neuen Version automatisch Wort für Wort mit der Lutherbibel 1912 abgeglichen.' },
    ],
  },
  {
    version: '0.7.0',
    date: '2026-09-30',
    title: 'Wie oft in der Woche',
    changes: [
      { area: 'Gewohnheiten', text: 'Bei wöchentlichen Gewohnheiten legst du fest, wie oft in der Woche – etwa Sport dreimal. Beim Anlegen und danach in der Liste, von „einmal“ bis „6-mal die Woche“.' },
      { area: 'Heute', text: 'Eine solche Gewohnheit trägst du Tag für Tag ein, wie die täglichen. Darunter steht, wie oft sie diese Woche eingetragen ist. Eine Woche mit weniger ist kein Versäumnis und wird nicht markiert.' },
      { area: 'Rückblick', text: 'In der Übersicht der Gewohnheiten erscheint sie als Verlauf über die Wochen, wie die täglichen.' },
    ],
  },
  {
    version: '0.6.7',
    date: '2026-09-30',
    title: 'Infotexte am rechten Ort',
    changes: [
      { area: 'Infotexte', text: 'Jeder Infotext öffnet direkt unter seinem „i“ und steht ganz im Bild. Wo unten kein Platz mehr ist, öffnet er darüber. Vorher erschien er in den Kacheln manchmal unten am Bildschirm, abgeschnitten.' },
      { area: 'Kirchenjahr', text: 'Nur eine Karte ist offen: Wer den nächsten Kreis öffnet, schließt den vorigen. Die Zeit „Vom … bis …“ steht in einer eigenen Zeile.' },
      { area: 'Gebetsschatz', text: 'Das Sterbejahr bleibt mit seinem Kreuz in einer Zeile, etwa „Habermann († 1590)“.' },
    ],
  },
  {
    version: '0.6.6',
    date: '2026-09-29',
    title: 'Mein Haus aufgeräumt',
    changes: [
      { area: 'Mein Haus', text: 'Sohn oder Tochter wählst du in zwei gleich breiten Feldern wie im Rückblick. Das Anliegen wächst mit dem Text und wird nicht mehr abgeschnitten; „Erhört“ steht darunter.' },
    ],
  },
  {
    version: '0.6.5',
    date: '2026-09-29',
    title: 'Kacheln auf schmalen Handys',
    changes: [
      { area: 'Kacheln', text: 'Auf schmalen Handys sind die Namen der Kacheln etwas kleiner, damit sie neben dem Symbol auf einer Zeile bleiben.' },
    ],
  },
  {
    version: '0.6.4',
    date: '2026-09-29',
    title: 'Symbol und Name nebeneinander',
    changes: [
      { area: 'Kacheln', text: 'Der Name steht jetzt direkt neben dem Symbol, die Zeile darunter. Die Kacheln unter „Mehr“ und in den Bereichen haben dieselbe Größe, Schrift und denselben Abstand.' },
    ],
  },
  {
    version: '0.6.3',
    date: '2026-09-29',
    title: 'Eine Kachel zur Zeit',
    changes: [
      { area: 'Kacheln', text: 'In jeder Kachelgruppe ist nur eine Kachel offen. Wer „Gebetsübersicht“ öffnet, schließt damit „Mein Haus“; so auch in Einstellungen, Darstellung, Deine Daten, Über Henoch, Mein Haus und im Gebetsschatz.' },
    ],
  },
  {
    version: '0.6.2',
    date: '2026-09-29',
    title: 'Die Schrift, wie sie steht',
    changes: [
      { area: 'Bibeltexte', text: 'Alle Bibelverse der App stehen jetzt Wort für Wort nach der Lutherbibel 1912, nichts mehr geglättet: Benedictus, Magnificat und Nunc dimittis, die Versikel, die Antiphonen der Psalmen, die Tischgebete, das Wort nach der Prüfung (1. Johannes 1,9) und die Kurzzitate im Kirchenjahr. Im Benedictus steht wieder der ausgelassene Vers vom Eid an Abraham.' },
      { area: 'Über Henoch', text: 'Die Quellenangabe sagt es: Bibeltexte wortgetreu nach der Lutherbibel 1912.' },
    ],
  },
  {
    version: '0.6.1',
    date: '2026-09-29',
    title: 'Gewohnheiten im neuen Kleid',
    changes: [
      { area: 'Heute', text: 'Gewohnheiten mit Stern stehen oben unter „Im Blick“, die übrigen darunter nach Täglich, Wöchentlich und Monatlich.' },
      { area: 'Gewohnheiten', text: 'Unter „Mehr“ steht jeder Rhythmus als Karte, mit der Zahl der eingeschalteten; die Schalter im Gold der App, die Art als kleines Etikett.' },
      { area: 'Zeiten', text: 'Der Umschalter „Alle Tage gleich / Tage unterschiedlich“ sieht aus wie die Ansichten im Rückblick.' },
    ],
  },
  {
    version: '0.6.0',
    date: '2026-09-29',
    title: 'Kacheln statt Listen',
    changes: [
      { area: 'Einstellungen und Gebet', text: 'Die Abschnitte stehen als Kacheln, je zwei nebeneinander, mit Symbol, Titel und dem, was gerade eingestellt ist oder darin steht. Ein Tipp öffnet die Kachel darunter über die ganze Breite. So auch in Darstellung, Deine Daten, Über Henoch, Mein Haus und im Gebetsschatz.' },
      { area: 'Vaterunser und Glaubensbekenntnis', text: 'Stehen jetzt immer in Luthers Fassung aus dem Kleinen Katechismus; die Wahl der Fassung entfällt.' },
    ],
  },
  {
    version: '0.5.1',
    date: '2026-09-29',
    title: 'Name oben, Kirchenjahr als Karten',
    changes: [
      { area: 'Kopfzeile', text: 'Unter „Mehr“ steht oben „Henoch – mit Gott durch den Tag“, auf den anderen Seiten wie bisher das Datum; über dem Sonntag steht nichts. Ist ein anderer Tag geöffnet, steht überall dessen Datum mit dem Weg zurück zu heute.' },
      { area: 'Kirchenjahr', text: 'Unter „Lehre“ › „Das Kirchenjahr“ stehen Einleitung und die drei Festkreise als Karten: mit Nummer, dem Festkreis und seiner Zeit auf einen Blick; ein Tipp klappt den Text auf.' },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-09-29',
    title: 'Henoch: Fürbitte für das Haus, Gebetsschatz und Handschrift',
    changes: [
      { area: 'Name', text: 'Die App heißt jetzt Henoch, nach dem Mann, der sein Leben mit Gott führte (1. Mose 5,24). Über dem Sonntag steht: „Henoch – mit Gott durch den Tag“. Deine Einträge, deine Sicherungen und die Adresse der App bleiben, wie sie sind.' },
      { area: 'Mein Haus', text: 'Unter „Mehr → Gebet“ trägst du deine Frau und deine Kinder ein, die Kinder sortierbar und jeweils als Sohn oder Tochter, jeder mit einem aktuellen Anliegen. In der Stillen Zeit steht im Schritt „Die Antwort“ nach dem Benedictus die Fürbitte für das Haus: täglich für alle mit Namen, dazu einer im Mittelpunkt – montags deine Frau, dienstags bis freitags je ein Kind, samstags eure Ehe, sonntags das ganze Haus. Im Nachtgebet folgt nach Luthers Abendsegen der Segen über das Haus.' },
      { area: 'Gebetserhörungen', text: 'Ein Anliegen aus „Mein Haus“, das Gott erhört hat, hältst du mit „Erhört“ fest. Es steht mit Datum und Person im Rückblick.' },
      { area: 'Gebetsschatz', text: 'Neu unter „Mehr → Gebet“: das Gebet für deine Frau (montags in der Stillen Zeit), das Gebet eines Ehemannes von Johann Habermann und das Gebet der Eltern für ihre Kinder von Johann Arndt, wortgetreu. Die beiden alten Gebete stehen auch am Samstag und am Sonntag in der Fürbitte für das Haus.' },
      { area: 'Gebet', text: 'Unter „Mehr“ fasst die Kachel „Gebet“ „Mein Haus“, die Gebetsübersicht und den Gebetsschatz zusammen, jedes als eigener Abschnitt.' },
      { area: 'Handschrift', text: 'In der Gebetskammer schreibst du wahlweise mit der Tastatur oder von Hand, wie in einem Notizbuch: Stift in Tinte, Gold oder Blau, Textmarker, Radierer und Rückgängig. Mit dem Apple Pencil schreibt der Stift und der Finger blättert. Die Handschrift bleibt auf dem Gerät und steht im Export.' },
      { area: 'Rückblick', text: 'Ein Tipp auf einen Tag zeigt alle Eingaben dieses Tages untereinander. Die Ansichten stehen als gleichmäßiges Raster. Auf Wunsch steht unten, wie du deine Gewohnheiten in den letzten acht Wochen gehalten hast: tägliche als Verlauf über die Wochen, wöchentliche und monatliche als Punkt. Festgehalten, nicht bewertet – ohne Prozente und ohne Serien. Einschalten unter „Einstellungen“ › „Darstellung“.' },
      { area: 'Gebet am Bett', text: 'Am Bett am Morgen und das Nachtgebet lassen sich unter „Einstellungen“ › „Darstellung“ ausblenden. Ohne Nachtgebet stehen Rückschau, Prüfung, Bekenntnis und Zuspruch am Ende der Vesper, und die Vesper schließt den Tag.' },
      { area: 'Geistliche Waffenrüstung', text: 'Steht nicht mehr am Bett, sondern in der Stillen Zeit im Schritt „Die Ausrichtung“, vor den drei Dingen.' },
      { area: 'Einstellungen', text: 'Hier stehen jetzt die Anleitungen „App installieren“ und „Flugmodus beim Beten“, beide für Android und iPhone.' },
      { area: 'Zeiten', text: 'Die Uhrzeitfelder sind kompakt und stehen auch auf dem iPhone sauber nebeneinander.' },
    ],
  },
  {
    version: '0.4.0',
    date: '2026-09-26',
    title: 'Arena, Eisenschmiede und das Kirchenjahr nach Dieffenbach',
    changes: [
      { area: 'Arena', text: 'Die Gebetskammer: ein Ort für den Kampf des Glaubens, mit Bibelversen, Gebetsanliegen und freiem Text. Einträge lassen sich in den Rückblick archivieren und zurückholen. Was du bekennst, gehört ins Gebet, nicht in die App.' },
      { area: 'Eisenschmiede', text: 'Anliegen für das Treffen mit den Brüdern, nach dem Tag des Treffens benannt und geordnet. Was du besprechen willst, steht als Liste zum Abhaken; Enter oder „+“ legt den nächsten Punkt an.' },
      { area: 'Kirchenjahr', text: 'Einteilung, Einleitung und Erklärung der drei Festkreise nach Georg Christian Dieffenbachs Evangelischer Haus-Agende (Mainz 1853), dazu die Deutung jedes Sonn- und Festtags. Die Sonntagsseite zeigt sie für die laufende Woche.' },
      { area: 'Vesper und Familienandacht', text: 'Die Vesper ist der persönliche Abschluss des Tages. Die Familienandacht steht als eigene Gewohnheit.' },
      { area: 'Rückblick', text: 'Unter „Mehr“. Tage, Verse und archivierte Einträge der Arena stehen als Liste, nach Jahr und Monat geordnet.' },
      { area: 'Mehr', text: 'Neu sind das Impressum mit Hinweisen zum Datenschutz, eine Anleitung für den Flugmodus beim Beten und diese Übersicht der Versionen.' },
      { area: 'Deine Daten', text: 'Zeigt, ob der Browser die Einträge dauerhaft behält, und bittet ihn auf Wunsch erneut darum.' },
      { area: 'Bibel', text: 'Die Seite heißt „Mein Bibelleseplan“.' },
      { area: 'Bibelstellen', text: 'Stehen nur noch als Angabe, ohne Link zu bibleserver.com. Die gedruckte Bibel ist das führende Element; die App braucht kein Internet mehr.' },
      { area: 'Lehre', text: 'Der Bereich „Katechismus“ in der Leiste heißt jetzt „Lehre“. Im Anhang steht Dieffenbachs ganze Beschreibung des Kirchenjahres zum Durchlesen.' },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-09-25',
    title: 'Eigener Leseplan, Zeiten nach Wochentagen und die geistliche Waffenrüstung',
    changes: [
      { area: 'Bibel', text: 'Kapitel am Tag für Altes und Neues Testament getrennt. Ein eigener Plan aus einem oder mehreren Büchern, jedes nach Kapiteln oder nach Zeit. Beim Lesen nach Zeit läuft ein Timer.' },
      { area: 'Zeiten', text: 'Alle Tage gleich oder nach Wochentagen in Gruppen. Ein Hinweis, wenn eine Zeit die Ordnung des Tages durchbricht.' },
      { area: 'Gebetsübersicht', text: 'Anliegen als Schlagworte, den Wochentagen zugeordnet, mehrere an einem Tag. Die Tage als Kacheln.' },
      { area: 'Geistliche Waffenrüstung', text: 'Epheser 6 nach Luther 1912: ein Stück am Tag nach dem Morgensegen, 1. Petrus 5,8–9 zur Eröffnung des Nachtgebets und eine Frage in Prüfung und Beichte. Unter „Darstellung“ abschaltbar.' },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-09-25',
    title: 'Sonntag, Kirchenjahr und Bibel',
    changes: [
      { area: 'Sonntag', text: 'Die Woche kommt von ihrem Sonntag: Wochenspruch, Bedeutung, Evangelium und Epistel mit kurzer Zusammenfassung, die Sonntage davor und danach zur Hand.' },
      { area: 'Kirchenjahr', text: 'Die drei Festkreise mit ihren Zeiten und allen Sonntagen, die Trinitatiszeit nach Themen gegliedert.' },
      { area: 'Bibel', text: 'Eine eigene Seite mit Altem und Neuem Testament nebeneinander. Die Lesung wird über die Gewohnheit „Bibel lesen“ vermerkt.' },
      { area: 'Katechismus', text: 'Die Hauptstücke als Kacheln, das Stück dieser Woche in Gold, jedes Hauptstück auf eigener Seite.' },
      { area: 'Gestalt', text: 'Luthers Rose in der Mitte der Leiste und als App-Symbol, die Gebetsordnungen Schritt für Schritt, jede Überschrift einklappbar, die vier Soli am Ende jeder Seite.' },
      { area: 'Gewohnheiten', text: 'Nach Gruppen geordnet, per Ziehen sortierbar, mit Stern für den Schwerpunkt.' },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-09-25',
    title: 'Die erste Fassung',
    changes: [
      { area: 'Andacht', text: 'Stille Zeit am Morgen, Vesper und Nachtgebet, jede Ordnung auch in einer Kurzform, die vollwertig ist.' },
      { area: 'Heute', text: 'Der Tag im Überblick: Zeiten, drei Vorsätze, Gewohnheiten.' },
      { area: 'Katechismus', text: 'Luthers Kleiner Katechismus im Wochenrhythmus, mit Haustafel und Stücken zum Auswendiglernen.' },
      { area: 'Deine Daten', text: 'Alles liegt nur auf diesem Gerät. Export als Text und als Sicherung, Einspielen und vollständiges Löschen. Die App läuft auch ohne Netz.' },
    ],
  },
];
