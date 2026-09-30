/**
 * The Bible lessons ("Bibellectionen") for the Sunday from Georg Christian
 * Dieffenbach, Evangelische Haus-Agende (Mainz 1853): a short house sermon on
 * the Sunday's Gospel, in numbered paragraphs. Public domain (rule 12),
 * transcribed from the Fraktur print word for word, in the original spelling
 * (rule 16). Keys follow the week keys of domain/churchYear.ts; a Sunday
 * without an entry shows none.
 */

export interface Lection {
  /** The reference as printed, e.g. "Matth. 22, 34–46". */
  ref: string;
  /** The heading of the lesson. */
  title: string;
  /** The paragraphs, in order (shown without their numbers). */
  paragraphs: readonly string[];
  /** Page in the book. */
  page: string;
}

export const LECTIONS: Record<string, Lection> = {
  trinity18: {
    ref: 'Matth. 22, 34–46',
    title: 'Des Gesetzes und des Evangeliums Summe.',
    page: 'S. 459 f.',
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
