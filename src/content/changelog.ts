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
      { area: 'Arena', text: 'Die Einstellungen der Streithalle sind auch in der Streithalle selbst zu finden, unten zum Aufklappen.' },
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
      { area: 'Arena', text: 'In der Tagesansicht der Streithalle steht unter „Heute“ das Datum.' },
    ],
  },
  {
    version: '0.30.1',
    date: '2026-10-01',
    title: 'Feinschliff der Streithalle',
    changes: [
      { area: 'Arena', text: 'Name und Zeitraum der Runde stehen als Unterzeile unter „Streithalle“; die Einleitung des Plans steht am Anfang der Anleitung. Der Beginn einer Runde steht ohne doppelten Rahmen.' },
      { area: 'Arena', text: 'Ein Tipp auf „Heute“ in der Tagesansicht der Streithalle führt zur Seite „Heute“.' },
      { area: 'Heute', text: 'Auch unter „Heute“ lässt sich beim Tagebuch der Streithalle gleich aufschreiben.' },
    ],
  },
  {
    version: '0.30.0',
    date: '2026-10-01',
    title: 'Arena und Gewohnheiten neu gestaltet',
    changes: [
      { area: 'Arena', text: 'Die Arena beginnt mit drei Kacheln: Gebetskammer, Eisenschmiede und Streithalle, jede mit dem, was dort gerade steht. Ein Tipp öffnet den Ort auf einer eigenen Seite.' },
      { area: 'Arena', text: 'Die Streithalle steht immer in der Arena. Läuft keine Runde, beginnst du dort eine, und die Anleitung ist schon zu lesen.' },
      { area: 'Heute', text: 'Die Gewohnheiten stehen oben als Liste für den Tag, abgehakt mit einem Antippen der ganzen Zeile. Darunter folgt die Woche als Übersicht zum Nachtragen.' },
    ],
  },
  {
    version: '0.29.0',
    date: '2026-10-01',
    title: 'Haus vor Arbeit, schönere Streithalle, besseres Deutsch',
    changes: [
      { area: 'Heute', text: 'Neben „Streithalle“ stehen der Name der Runde und ihr Zeitraum; die Gewohnheiten sind nach „Täglich“ und „Woche und Monat“ gegliedert.' },
      { area: 'Arena', text: 'Im Plan der Streithalle steht das Haus vor der Arbeit. Die Reihenfolge gilt in der ganzen App: Gott, Familie und Haus, Gemeinde, Arbeit, ich.' },
      { area: 'Arena', text: 'Die Tagesansicht der Streithalle ist ruhiger gestaltet: runde Knöpfe zum Blättern, „Aufschreiben“ beim Tagebuch direkt in der Zeile, das Eingabefeld in einer eigenen Fläche.' },
      { area: 'Heute', text: 'Tage vor dem Beginn einer Runde stehen in der Tabelle mit voller Breite und einem stillen Punkt statt eines grauen Streifens.' },
      { area: 'Rückblick', text: 'Bei den Gewohnheiten führt ein Eintrag „Streithalle“ zum Dashboard der laufenden Runde.' },
      { area: 'Sprache', text: 'Texte in Arena, Heute und unter Mehr sind sprachlich überarbeitet.' },
    ],
  },
  {
    version: '0.28.0',
    date: '2026-10-01',
    title: 'Die Streithalle für jeden Zeitraum',
    changes: [
      { area: 'Einstellungen', text: 'Unter Darstellung heißt der Schalter jetzt „Streithalle“. Eine Runde bekommt einen Namen, etwa „Winter Arc“ oder „Fastenzeit“, ein Startdatum und einen letzten Tag oder eine Dauer, von einem Tag bis zu einem Jahr. Der Plan des Winter Arc bleibt die Anleitung.' },
      { area: 'Arena', text: 'Der Name der Runde steht über der Streithalle, im Rückblick und im Export.' },
    ],
  },
  {
    version: '0.27.0',
    date: '2026-10-01',
    title: '„Heute“ im Modus der Streithalle',
    changes: [
      { area: 'Heute', text: 'Solange der Winter Arc läuft, stehen unter „Heute“ die Gewohnheiten der Streithalle an Stelle der übrigen, mit einem Weg zur Streithalle. Deine übrigen Gewohnheiten bleiben gespeichert und kommen zurück, wenn die Runde endet oder du den Winter Arc ausschaltest.' },
    ],
  },
  {
    version: '0.26.0',
    date: '2026-10-01',
    title: 'Gewohnheiten der Streithalle abschalten',
    changes: [
      { area: 'Gewohnheiten', text: 'Jede Gewohnheit der Streithalle lässt sich unter Gewohnheiten einzeln aus- und wieder einschalten. Ausgeschaltet verschwindet sie aus „Heute“ und aus der Streithalle; ihre Haken bleiben.' },
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
    title: 'Die Streithalle neu geordnet',
    changes: [
      { area: 'Arena', text: 'Die Streithalle hat oben eine Karte mit Tag, Phase, Woche, Vers und Auftrag, darunter drei Reiter: Tag, Woche und Anleitung. Die Anleitung steht als Kacheln.' },
      { area: 'Arena', text: 'Unter „Tag“ blätterst du durch die Tage der Runde und trägst nach, was war. Abgehakt wird mit einem Antippen der ganzen Zeile.' },
      { area: 'Arena', text: 'Beim Tagebuch trägst du den Satz, der dich trifft, und drei Dankpunkte gleich dort ein, oder du schreibst in der Gebetskammer.' },
    ],
  },
  {
    version: '0.24.0',
    date: '2026-10-01',
    title: 'Streithalle: Abschluss, Rückblick und Gewohnheiten',
    changes: [
      { area: 'Arena', text: 'Nach dem letzten Tag einer Runde zeigt die Streithalle „Tag 90 – und danach“ mit den Wochenrückblicken der Runde. Von dort beginnst du eine neue Runde oder exportierst alles als Markdown.' },
      { area: 'Rückblick', text: 'Unter „Streithalle“ stehen alle Runden des Winter Arc, auch beendete, zum Nachlesen.' },
      { area: 'Heute', text: 'Solange der Winter Arc läuft, stehen seine Gewohnheiten unter „Heute“ in der Gruppe Streithalle. Ein Haken dort gilt auch in der Streithalle.' },
      { area: 'Gewohnheiten', text: 'Gewohnheiten mit deiner Frau, deinen Kindern oder der Familie erscheinen erst, wenn sie unter „Mein Haus“ eingetragen sind.' },
      { area: 'Arena', text: 'Die beiden Arbeitsblöcke sind aus der Liste des Winter Arc genommen.' },
    ],
  },
  {
    version: '0.23.0',
    date: '2026-10-01',
    title: 'Der Winter Arc in der Streithalle',
    changes: [
      { area: 'Einstellungen', text: 'Unter Darstellung lässt sich der Winter Arc einschalten, der 90-Tage-Standard: mit Startdatum und Dauer in Kalendertagen, eigenen Wochentagen je Punkt und deinen Zeiten. Ausgeschaltet bleibt die Runde mit allen Haken und Rückblicken erhalten.' },
      { area: 'Arena', text: 'Solange er läuft, steht neben Gebetskammer und Eisenschmiede die Streithalle: wo die Runde steht, Vers und Auftrag der Woche, die Liste für heute, die Woche als Raster zum Nachtragen, Wochenstandard und Wochenrückblick mit dem Zuspruch aus Klagelieder 3. Darunter die Anleitung.' },
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
