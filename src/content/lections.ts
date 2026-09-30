/**
 * Readings on the Sunday's texts from Lutheran books of the 19th century,
 * opened from the Gospel and the Epistle on the Sunday page. Public domain
 * (rule 12), transcribed from the Fraktur print word for word, in the original
 * spelling (rule 16). Keys follow the week keys of domain/churchYear.ts; a
 * Sunday without an entry shows none.
 */
import { DIEFFENBACH_SOURCE } from './dieffenbach';

export interface Lection {
  /** What it is, for the tile and the button: "Andacht", "Betrachtung". */
  kind: string;
  /** The line on the tile that opens it. */
  hint: string;
  /** The reference as printed, e.g. "Matth. 22, 34–46". */
  ref: string;
  /** The heading of the lesson. */
  title: string;
  /** The paragraphs, in order (shown without their numbers). */
  paragraphs: readonly string[];
  /** Author, book and page. */
  source: string;
}

/**
 * On the Gospel: the Bible lessons ("Bibellectionen") for the Sunday from
 * Dieffenbach's Evangelische Haus-Agende (Mainz 1853).
 */
export const LECTIONS: Record<string, Lection> = {
  trinity18: {
    kind: 'Andacht',
    hint: 'Andacht aus der Haus-Agende lesen',
    ref: 'Matth. 22, 34–46',
    title: 'Des Gesetzes und des Evangeliums Summe.',
    source: `${DIEFFENBACH_SOURCE} S. 459 f.`,
    paragraphs: [
      'Die Pharisäer fragen den Herrn hier nach dem Gesetze und der Herr, nachdem Er ihnen das Gesetz recht ausgelegt, weis’t sie auf das Evangelium hin. Du sollst beides wohl kennen; das Gesetz ist nothwendig und das Evangelium ist nothwendig. Durch das Gesetz wird das Evangelium vorbereitet, dadurch wird es eine frohe Botschaft für Alle, die unter dem Fluche des Gesetzes liegen.',
      'V. 34–40. Meister, welches ist das vornehmste Gebot? — So fragt der Pharisäer Einer. Sie grübelten darüber nach, welches das höchste Gebot im Gesetz wäre und wollen nun auch des neuen Propheten Meinung hören. Der Herr hat Antwort für sie und uns: Die Liebe zu Gott — und zum Nächsten! das ist das vornehmste Gebot und darin hanget das Gesetz und die Propheten.',
      'Siehe, da hast du in kurzen Worten des ganzen Gesetzes Summe. Die Liebe ist des Gesetzes Erfüllung. (Röm. 13, 10.) Du kennst das Gesetz; die Pharisäer und Schriftgelehrten kannten’s auch. Wie aber steht es mit der Erfüllung? Ist dein Herz durchdrungen von reiner, lauterer, ungetheilter Liebe zu Gott? Gehen all deine Gedanken und Sinne auf Ihn allein? Hast du Ihn allezeit vor Augen und im Herzen? Geschieht Alles, Alles, was du thust, allein zu Seiner Ehre, und aus Liebe zu Ihm? — So lange dein Herz getheilt ist zwischen Gott und Welt, so lange du noch nicht all dein Leben, Thun und Denken deinem Gotte zum Opfer gebracht hast; so lange du noch nicht sprechen kannst: „Wenn ich nur Dich habe, so frage ich nichts nach Himmel und Erde“ (Psalm 73, 25.), — so lange hast du das vornehmste Gebot noch nicht erfüllt. — O, wer unter uns hat doch all sein Leben lang Gott von ganzem Herzen, von ganzer Seele und von ganzem Gemüthe geliebt? Herr Gott, wir beugen uns in Demuth, Reue und Schaam vor Dir und bekennen Dir, daß wir Dein heilig Gebot nimmer ganz erfüllet haben. Erbarme Dich unser!',
      'Und wie steht es mit der Liebe zum Nächsten, — mit der Liebe, davon Paulus so lieblich redet I. Cor. 13? — Es ist wohl niemals vorher so viel von Liebe geredet worden, als zu dieser Zeit, und ist doch in der That so wenig wahrhaftige Liebe da. Ach, Herr, gieße aus Deiner Fülle rechte Liebe in unsre Herzen!',
      'Bekenne es in Demuth, — du hast die vornehmsten Gebote nicht gehalten. In diesen beiden aber hanget das Gesetz und die Propheten, darum bist du des ganzen Gesetzes schuldig! — Wo willst du nun Trost suchen? — Höre, wie der Herr dich hinweis’t auf das Evangelium.',
      'V. 41–46. Nach dem Gesetze fragten die Pharisäer, — der Herr redet vom Evangelio und vom Glauben. Denn des Evangeliums Kern ist ja Christus und von Christo, von Seinem eignen Wesen redet der Herr; da Er fragt: Wie dünket euch um Christo? — Das ist die große Lebensfrage; darauf kommt es an, wie du sie beantwortest. Die Welt hat allerlei Antwort darauf. Ganze Schaaren lachen zu solcher Frage; Spott ist ihre Antwort; der Herr sei ihnen gnädig und lehre sie den Weg des Friedens! Viele wissen nur zu antworten, wie die Pharisäer: Er ist Davids Sohn! Er ist ein frommer Mensch. Weißt du sonst keine Antwort, so hast du keinen Erlöser. „Kann doch ein Bruder Niemand erlösen, noch Gott Jemand versöhnen!“ (Psalm 49, 8.) Der Herr aber widerleget aus der Schrift den Irrthum. Seinen Herrn nennt David den Messias, — wie kann Er Davids Sohn sein? Von Seiner Erhöhung zur Rechten Gottes zeuget die Schrift, — wie sollte Er nur ein Mensch sein? Sieh, da klinget deutlich hindurch des Evangeliums Summe: „Gott war in Christo und versöhnte die Welt mit Ihm selber.“ (II. Cor. 5, 19.) „Kündlich groß ist das gottselige Geheimniß: Gott ist geoffenbaret im Fleisch!“ (I. Tim. 3, 16.) — Was willst du nun antworten auf des Herrn Frage: Wie dünket euch um Christo? — Rufe mit Petrus aus: Du bist Christus, der Sohn des lebendigen Gottes! und mit Thomas sinke vor Ihm nieder mit dem Rufe: Mein Herr und mein Gott!',
      'So ist also hier des Gesetzes Summe und des Evangeliums Summe neben einander gerückt. Das Gesetz kann dich nicht selig machen, denn du hast es nicht erfüllt. Das Gesetz richtet nur Zorn an (Röm. 4, 15.); es ist gekommen um der Sünde willen; „es zeigt uns die Sünde an und offenbaret Gottes Zorn über die Sünde, dadurch wir verursacht werden, Vergebung der Sünden und Trost wider Gottes Zorn und den ewigen Tod bei unsrem Herrn und Heiland Jesu Christo zu suchen.“ Es ist ein Zuchtmeister auf Christum (Gal. 3, 24.); zu Ihm weis’t es uns hin; zu Christo treibt es uns, weil es uns nur Sünde und Tod, Verdammniß und Zorn offenbaren kann. O laß das Gesetz dich zu Christo treiben! Erkenne daran dein Sündenelend und wirf im Glauben dich dem in die Arme, der da ist Davids und Gottes Sohn und sitzet zur Rechten Gottes, bis daß Seine Feinde geleget sind zum Schemel Seiner Füße. Durch den alten Bund zum neuen, vom Gesetz zum Evangelio, von Sinai nach Golgatha, — das ist ein selig Wallen. O Herr Jesu nimm uns auf in Gnaden! Amen.',
    ],
  },
};

const LOEHE =
  'Wilhelm Löhe, lutherischer Pfarrer: Kurze Lectionen zu den sonn- und festtäglichen Episteln des Kirchenjahres. Neben der Evangelienpostille zu lesen. Stuttgart, Samuel Gottlieb Liesching';

/**
 * On the Epistle: Wilhelm Löhe's "Kurze Lectionen" on the Sunday Epistles,
 * bound with his Evangelien-Postille (Stuttgart, Liesching).
 */
export const EPISTLE_LECTIONS: Record<string, Lection> = {
  trinity17: {
    kind: 'Betrachtung',
    hint: 'Betrachtung von Wilhelm Löhe lesen',
    ref: 'Ephes. 4, 1–6',
    title: 'Am siebzehnten Sonntage nach Trinitatis.',
    source: `${LOEHE}, S. 214.`,
    paragraphs: [
      'Wenn wir zur Demuth, zur Sanftmuth, zur Geduld, zur Liebe, zum Frieden vermahnt werden und vermahnen, so gefällt dies allen, die von irgend einem Hauche himmlischen Lebens angeweht sind. Wer wird in aller Welt jene heiligen, lieblichen Namen christlicher Tugenden nicht gerne hören? Wer verkennen, daß diese Namen herrliche, himmlische Güter benennen? — Aber wenn nun der Apostel weiter ruft: Ein Leib und Ein Geist! Wenn nun der Eine Leib erklärt wird als Eine sichtbare Kirche, die von Einem Geiste und durch den Geist von Einem Sinn und Muth belebt wird, wie dann? Wenn auf Grund dieser Worte behauptet wird, daß wie Ein Herr, so nur Ein Glaube sei und nicht mehrere rechte Glaubensarten, Glaubensbekenntnisse und was man alles zu des Glaubens Bildern und Werken zählt! Dann ist man vor den Ohren der jetzt Lebenden zum Thoren nicht allein geworden, der nimmer schauen wird, wovon er redet; sondern auch zum Frevler, der nicht mehr Demuth, Sanftmuth, Geduld, Liebe und Frieden haben oder üben kann! Die Zahl eins ist ihnen unleidlich, denn sie behaupten, dieselbe fache Krieg an und sei wider die Einigkeit! Ein Quodlibet des Glaubens alleine scheint ihnen Einigkeit zu verbürgen! Jede Lehre dulden, nicht leicht etwas hoch aufnehmen in der Lehre, nichts genau nehmen im Betreff göttlicher Gedanken — das nennen sie Demuth und Sanftmuth und Geduld und Liebe und Frieden. Warum kümmern wir uns denn um solches Geschwätz? Warum soll denn der Wahn die gesunden Sinne bethören? Und warum läßt man sich irren, wenn man im guten Gewißen die Straße des heiligen Geistes zieht? Es ist ja doch nur Ein Gott und darum, so wahr Er lebt, nur Eine Wahrheit, und darum nur Eine Lehre und Ein reiner Glaube! Das ist und bleibt wahr am Tage des Gerichts! So laß sie unrecht reden, schelten und sündigen, die Feinde der heiligen Kirche: sie brechen ja die Einigkeit, weil sie die Wahrheit nicht wollen! Du brichst sie durch Bekenntnis nicht; du lockst und rufst vielmehr herzu zur Wahrheit! Bete für die Feinde, denn es sind Feinde, die den Einen Leib des HErrn anfeinden! Trage sie, wie sie getragen werden sollen! Bescheide dich! Entschuldige, was ohne Lüge entschuldigt werden kann! Uebe Liebe in Wahrheit und sei zufrieden, daß die Welt und die sie und Gottes Kirche nicht erkennen, sich mit jener wider diese vereinen! Sei zufrieden — denn anders ists nicht und wirds nicht, so leid dirs thue!',
    ],
  },
  trinity18: {
    kind: 'Betrachtung',
    hint: 'Betrachtung von Wilhelm Löhe lesen',
    ref: '1. Corinth. 1, 4–9',
    title: 'Am achtzehnten Sonntage nach Trinitatis.',
    source: `${LOEHE}, S. 214 f.`,
    paragraphs: [
      'Wenn man die Briefe des heiligen Paulus an die Corinther mit der Absicht liest, sich ein Bild jener berühmten Gemeinde zu verschaffen; so liest man mit Verwunderung Ermahnungen und Warnungen, welche auf bedeutende Flecken jener Gemeinde schließen laßen. Und doch kann auch wieder das nicht Schmeichelei und Lüge sein, was der heilige Apostel in unserm Texte von der Herrlichkeit jener Gemeinde sagt. Ohne Zweifel war also auch jene Gemeinde ein Waizenfeld, auf dem auch Unkraut wucherte, — d. h. sie war, wenn auch vielleicht dem Grade nach doch verschieden, der Art nach unsern Gemeinden gleich. — Es ist das freilich eine Behauptung, die nicht sonderlich mit dem übereinstimmt, was auf so vielen Kanzeln von den ersten Gemeinden gepredigt wird. Aber doch geht die Behauptung nicht von Neid und ungerechter Quelle aus, sondern im Gegentheil, sie ist gerecht: sie gibt und läßt einer jeden Zeit das Ihre — und übersieht nur in keiner die vorhandenen Gegensätze. Es fragt sich nur, ob die Behauptung wahr ist! Und das eben ist es, was wir durchs Urtheil unbefangener, aufmerksamer Leser bestätigt wünschen — und bestätigt sehen werden. Ist aber die Behauptung wahr, so ist sie auch tröstlich. Nicht daß wir uns mit den Fehlern anderer trösten wollten und gewisser Maßen Schadenfreude hegten, sondern was wir tröstlich finden, ist das, daß eine Gemeinde Flecken haben und doch Sein sein kann, daß er die Sünder nicht bloß sucht, sondern auch bei ihnen helfend und heilend bleibt. Und brauchen denn wir armen Sünder diesen Trost nicht? Wird er uns etwa im Guten lähmen oder vielmehr die matten Hände stärken?',
      'Diese gemischte Gemeinde von Corinth wird nun ohne Unterscheidung ihrer heiligeren und unheiligeren Glieder angeredet. Unser Text spricht, als gälte es allen, von den reichen Gnaden, welche über sie ausgeschüttet seien, und versichert, die Gemeinde von Corinth bedürfe nur Treue bis ans Ende und die Vollendung des jüngsten Tages. Haben nun etwa die Gottlosen ein Recht gehabt, dieß auf sich zu ziehen? Gewis nicht! Im Gegentheil, es muß ihnen gewesen sein, als kenne sie der Apostel nicht, als rechne er sie nicht, so lange er von der Herrlichkeit der Gemeinde redete. — Und wenn hernachmals die Warnungen an alle ergehen, die Bestrafung über alle kommt: wie dann? Wird ausgelöscht, was unser Text sagt? Wiederum nicht! Die Frommen werden gedemüthigt — und es wird ihnen gezeigt, daß einer des andern Hüter sein sollte, daß einer für des andern Thun und Laßen in gewissem Maße verantwortlich ist. Sie werden zu Fürbitte, Liebe, Vermahnung und Seelsorge getrieben! Einst kam ein Lehrer in eine Schule, wo die meisten tobten, einige ruhig saßen. Er strafte die Ruhigen mit den andern, darum daß sie das Beßere erwählt hatten, ohne versucht zu haben, ob es nicht auch den andern mitgetheilt werden könnte. Das war paulinische Weisheit! Wüßte sie nur jeder Lehrer in rechter Weise anzuwenden. An sich selber ist sie kein Fehler, sondern von vielen nicht begriffene, beßernde Weisheit! — Merke drum: die Kirchen hier bestehen aus Auserwählten und bloß Berufenen, aber jene sind für diese verantwortlich! Bete, daß du fleißig seiest in beßernder Liebe! Bete daß es mit dir viele seien, — daß man nicht so schnell den langsamen Schüler Jesu aufgebe, — daß man die Langsamen in die Mitte nehme! Bete, daß die Kirche würdig werde, so behandelt zu werden, wie sie St. Paulus in seinen Briefen behandelt!',
    ],
  },
};
