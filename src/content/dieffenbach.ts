/**
 * The explanations of the three festal circles from Georg Christian Dieffenbach,
 * Evangelische Haus-Agende, das ist: Vollständige Ordnung des Hausgottesdienstes
 * (Mainz 1853): "Zur Erklärung" of each circle, the meaning of every Sunday and
 * feast day, notes, and the closing words. Public domain (rule 12), transcribed
 * from the Fraktur print in the original spelling (rule 16). Bible texts in it
 * are the author's own quotations.
 */
import type { Circle, Season } from '../domain/churchYear';

export const DIEFFENBACH_SOURCE =
  'Georg Christian Dieffenbach, Evangelische Haus-Agende, das ist: Vollständige Ordnung des Hausgottesdienstes, Mainz 1853.';

export interface CircleGuide {
  /** The Bible word over the circle. */
  motto?: { ref: string; text: string };
  /** "Zur Erklärung". */
  explanation: readonly string[];
  /** Closing words and doxology at the end of the circle. */
  closing: readonly string[];
}

export const CIRCLE_GUIDE: Record<Circle, CircleGuide> = {
  christmas: {
    explanation: [
      'Der heilige Weihnachtskreis beginnt mit dem 1. Adventssonntage und schließt mit dem Feste der Erscheinung Christi. (Epiphanias.) Er zerfällt in drei Theile.',
      'I. Die Adventszeit. Es ist dieß die Zeit der Vorbereitung auf Christi Ankunft, auf Sein Kommen in’s Fleisch, zum Gerichte und auf Sein täglich Kommen zu uns. Die Verheißung Seines Kommens und die Verkündigung von Seinem Wirken wird uns hier vor die Seele geführt. (Psalm 24, 9–10.)',
      'II. Die Christfestzeit. Christi Erscheinung im Fleische wird gefeiert, Seine niedrige Geburt und gnadenreiche Menschwerdung. (Joh. 1, 14.)',
      'III. Die Darstellungszeit. In diesen Tagen wird geoffenbaret, daß das neugeborne Kindlein geordnet ist zum Heiland und Erlöser für Israel und alle Heiden, daß es ist das Licht der Welt. Seine Aufnahme bei den Glaubigen aus Israel, Sein Gehorsam, Sein blutig Leiden, Seine Verwerfung von Seiten der Obersten Israels, Seine Verherrlichung unter den Heiden wird hier vorgebildet. (Luc. 2, 29–32.)',
      'Der Weihnachtskreis ist der heilige Festkreis Gottes des Vaters. (Der Osterkreis – der Festkreis des Sohnes; der Pfingstkreis – des heiligen Geistes.)',
      'Der Vater ist es, der von Anfang an die Sendung des Sohnes zur Erlösung der Welt beschlossen und verheißen hat; Er hat durch alle Propheten verkündigen lassen die Zeit der gnädigen Heimsuchung und Erscheinung des Messias. (Adventszeit.)',
      'Der Vater ist es, der also die Welt geliebet hat, daß Er Seinen eingebornen Sohn gab, auf daß Alle, die an Ihn glauben nicht verloren werden, sondern das ewige Leben haben (Joh. 3, 16.), der, da die Zeit erfüllet war, Seinen Sohn sandte, geboren von einem Weibe. (Gal. 4, 4.) Deßhalb singen die Engel auch: „Ehre sei Gott in der Höhe!“ (Christfestzeit.)',
      'Der Vater ist es, der Seinen Sohn unter das Gesetz gethan hat, auf daß Er die, so unter dem Gesetz waren, erlösete, daß wir die Kindschaft empfingen. (Gal. 4, 4–5.) Aber nicht nur für Israel hat der Vater Seinen Sohn zum Heiland geordnet, sondern Er will, daß Allen Menschen geholfen werde (1. Tim. 2, 4.); auch der Heiden Heiland ist der Herr. (Darstellungszeit.)',
      'Weil es also Gott der Vater ist, der den Sohn verheißen, gesendet und zum Heiland der Welt, der Juden sowohl, als der Heiden verordnet hat, so nennen wir mit Recht den Weihnachtskreis die heilige Festzeit Gottes des Vaters.',
    ],
    closing: ['Ehre sei Gott in der Höhe! Friede auf Erden und den Menschen ein Wohlgefallen. Halleluja!'],
  },
  easter: {
    motto: {
      ref: 'Philipper 2,6-11',
      text: 'Christus, ob Er wohl in göttlicher Gestalt war, hielt Er es nicht für einen Raub, Gott gleich sein; sondern äußerte sich selbst und nahm Knechtsgestalt an, ward gleich wie ein anderer Mensch und an Geberden als ein Mensch erfunden. – Er erniedrigte sich selbst und ward gehorsam bis zum Tode, ja zum Tode am Kreuz; – Darum hat Ihn auch Gott erhöhet und hat Ihm einen Namen gegeben, der über alle Namen ist, daß in dem Namen Jesu sich beugen sollen alle derer Kniee, die im Himmel und auf Erden und unter der Erde sind und alle Zungen bekennen sollen, daß Jesus Christus der Herr sei zur Ehre Gottes des Vaters.',
    },
    explanation: [
      'Der heilige Osterkreis beginnt mit dem 1. Sonntage nach Epiphanias und schließt mit dem Feste der Himmelfahrt Christi. Es zerfällt in drei Theile:',
      'I. Die Epiphanienzeit. (Vom 1. Sonntag nach Epiphanias bis an den Aschermittwoch.) Diese Zeit stellt Christum dar als den wahrhaftigen, göttlichen Propheten, mächtig durch Lehre und Zeichen und Wunder erwiesen. (Jes. 61, 1–2.)',
      'II. Die Fastenzeit. (Vom Aschermittwoch bis zum Ostersonnabend.) Der Herr erscheint als der wahrhaftige, göttliche Hohepriester. Seine tiefe Erniedrigung und Seine göttliche Herrlichkeit offenbaren sich in dieser Zeit; Er erscheint als der Gottmensch, der aus unendlicher Liebe das schwerste Leiden trägt und sich selbst als Sühnopfer für die Sünden der Welt dahingibt. (Hebr. 9, 11–12.)',
      'III. Die Freudenzeit. (Die 40 Tage der Freude von Ostern bis Himmelfahrt.) Christus offenbart sich hier als der herrliche, göttliche König. Grab und Tod können Ihn nicht behalten; Er geht siegreich daraus hervor, zeigt sich den Seinen als der Auferstandne und fährt triumphirend auf gen Himmel, um den Thron Seiner Herrlichkeit einzunehmen. (Psalm 97, 1. 8.)',
      'Der Osterkreis ist der heilige Festkreis Gottes des Sohnes, wie der Weihnachtskreis Gottes des Vaters.',
      'Es wird in dieser Zeit das Leben und Wirken, das Leiden und Sterben, die Auferstehung und Verherrlichung des Sohnes, dargestellt von dem ersten prophetischen Worte des Jesusknaben im Tempel bis zur Himmelfahrt des Auferstandnen. In lieblicher und wunderbarer Steigerung entfaltet sich vor uns das Leben unsres hochgelobten Herrn und Heilandes.',
      'In der Epiphanienzeit erscheint Er als ein wahrhaftiger Mensch, gesandt von Gott, daß Er ein Prophet sei in Israel. Seine Menschheit ist vorwaltend, wenn auch überall Seine göttliche Herrlichkeit durchleuchtet. Er ist der Sonne gleich, die auch verhüllt von Wolken dennoch ihr Licht über den Erdkreis ausströmen läßt und mit verhaltnem Glanze leuchtet.',
      'In der Fastenzeit erscheint der Herr als der Gottmensch; obwohl Er in tiefe Schmach und viel Leiden hinabsteigen muß, wird doch in dieser Zeit immer herrlicher Seine Gottheit mit der Menschheit verbunden geoffenbart. Nur weil Er der Gottmensch ist, kann Er der Mittler zwischen Gott und Menschen und der rechte ewige Hohepriester sein. Gottheit und Menschheit, die beiden Naturen in Christo, erscheinen in ihrer unzertrennlichen, unvermischten, unverwandelten Verbindung.',
      'In der Freudenzeit, von Ostern bis Himmelfahrt, erscheint der Herr immer mehr in Seiner göttlichen Herrlichkeit als der ewige König Seiner Gemeinde. Mit verklärtem Leibe ist Er aus Grab und Tod erstanden, aber um der irdischen Schwachheit der Seinen willen offenbart Er sich nicht in vollem Glanze, sondern mit verhaltner Glorie und Herrlichkeit, bis Er endlich am Tage der Himmelfahrt die Menschheit mit sich hinaufträgt in den Himmel, nicht daß sie verschwinde und aufgelöst, sondern daß sie völlig verklärt und verherrlicht werde durch Seine Gottheit. – Der ganze Osterkreis entwickelt sonach die Verklärung der Menschheit Christi durch Seine Gottheit, nachdem der Weihnachtskreis die Erscheinung der Gottheit in der Menschheit dargestellt hat.',
    ],
    closing: [
      'Hiermit ist vollendet das Amt und Werk des Herrn auf Erden. Er hat als Prophet gelehrt, Wunder und Zeichen gethan und die Zukunft enthüllt. (Epiphanienzeit.) Er hat als Hoherpriester das ewiggültige, heilige Versöhnungsopfer dargebracht. (Fastenzeit.) Er hat als König sich den Seinen geoffenbart. (Freudenzeit.) Nun ist Er zurückgekehrt zu Seiner Herrlichkeit; Er thronet zur Rechten Gottes und ist doch bei den Seinen alle Tage bis an der Welt Ende. In Seinem Worte, darin der heilige Geist waltet, wirket Er unter Seiner Gemeinde als der ewige Prophet. Wir haben ferner an Ihm einen großen, ewigen Hohenpriester, der gen Himmel gefahren ist (Hebr. 5, 1.), der da sitzet auf dem Stuhl der Majestät im Himmel (Hebr. 8, 1.), der eingegangen ist in den Himmel selbst, um zu erscheinen vor dem Angesicht Gottes für uns (Hebr. 9, 24.) als unser Fürsprecher. (1. Joh. 2, 1–2.) Er reichet uns im Sacramente Seines Leibes und Blutes fort und fort die heiligen Gnadengüter dar, die Er durch Sein hohepriesterlich Opfer uns erworben hat. – Er ist endlich auch durch Seine Himmelfahrt zu Seiner vollen Herrlichkeit eingegangen und regiert als der ewige König, als das unsichtbare Haupt Seine Gemeinde und führet sie durch Kampf und Streit zum ewigen Siege. Es werden noch Feinde genug sich erheben, „aber das Lamm wird sie überwinden; denn es ist ein Herr aller Herren und ein König aller Könige, und mit Ihm die Berufenen und Auserwählten und Gläubigen.“ (Offenb. 17, 14.) So wird Er, der zur Rechten Gottes thronet und doch bei uns ist wahrhaftig und wirklich, Sein heilig dreifach Amt verwalten unter Seinen Gläubigen, und Seine Gnade und Herrlichkeit immer weiter ausbreiten unter allen Heiden, bis daß Alles vollführet wird, das verheißen ist und gehöret wird „eine Stimme großer Wasser und eine Stimme starker Donner, die sprechen: Halleluja! Denn der allmächtige Gott hat das Reich eingenommen.“ (Offenb. 19, 6.)',
      'Siehe es hat überwunden der Löwe, der da ist vom Geschlecht Juda, die Wurzel Davids! – Das Lamm, das erwürget ist und hat uns Gott erkauft mit Seinem Blute aus allerlei Geschlecht und Zungen und Volk und Heiden, ist würdig zu nehmen Kraft und Reichthum und Weisheit und Stärke und Ehre und Preis und Lob! – Heil sei dem, der auf dem Stuhl sitzt, unserem Gott und dem Lamm von Ewigkeit zu Ewigkeit. Halleluja! (Offenb. 5, 5. 9. 7, 10.)',
    ],
  },
  pentecost: {
    motto: {
      ref: '1. Korinther 12,3-7.11-13',
      text: 'Niemand kann Jesum einen Herrn heißen, ohne durch den heiligen Geist. Es sind mancherlei Gaben, aber es ist ein Geist. Und es sind mancherlei Aemter, aber es ist ein Herr. Und es sind mancherlei Kräfte, aber es ist ein Gott, der da wirket Alles in Allen. In einem Jeglichen erzeigen sich die Gaben des Geistes zum gemeinen Nutzen. – Dieß aber Alles wirket derselbe einige Geist und theilt einem Jeglichen seines zu, nachdem Er will. – Denn gleichwie ein Leib ist und hat doch viele Glieder; alle Glieder aber eines Leibes, wiewohl ihrer viele sind, sind doch ein Leib; also auch Christus. Denn wir sind durch einen Geist alle zu einem Leibe getauft, und sind alle zu einem Geiste getränkt.',
    },
    explanation: [
      'Der heilige Pfingstkreis beginnt mit dem Freitag vor Exaudi und schließt mit dem letzten Tage des Kirchenjahrs. Er zerfällt, gleich dem Weihnachts- und Osterkreise, in drei Theile:',
      'I. Die Wartezeit. (Vom Freitag vor Exaudi bis zum Pfingstsonnabend.) Der Tröster, der Geist der Wahrheit und der Offenbarung, der Hülfe und des Zeugnisses, wird verheißen; auf Seine Erscheinung warten die Jünger und mit ihnen die ganze Christenheit. (Joel 3, 1.)',
      'II. Die Pfingstfestzeit. (Vom ersten Pfingstfeiertag bis zum folgenden Sonnabend.) Was die Propheten verkündigt, was der Herr verheißen, geschieht. Der heilige Geist wird ausgegossen über die Jünger und durch ihr Zeugniß die erste Gemeinde gesammelt und so die heilige Kirche gegründet. (Apostelgesch. 2, 1–4.)',
      'III. Die Trinitatiszeit. (Vom Feste Trinitatis bis zum letzten Tage des Kirchenjahrs.) Der heilige Geist, vom Vater und vom Sohne ausgehend, fängt Sein Walten und Wirken an in der heiligen Taufe. Reich und herrlich ist Sein Wirken in der Berufung und Sammlung der Menschen zum Himmelreiche; in der Erleuchtung und Bekehrung derer, die der Berufung folgen; in der Heiligung und Vollendung der Glaubigen bis zum jüngsten Tage, da der Herr wiederkommt und die Seinen einführen wird zur ewigen Herrlichkeit und Seligkeit. (Tit. 3, 4–7.)',
      'Der Pfingstkreis ist die heilige Festzeit Gottes des heiligen Geistes, so daß die drei hohen Feste der Christenheit den dreieinigen Gott feiern und Sein Walten offenbaren. Der Weihnachtskreis feiert des Vaters, der Osterkreis des Sohnes, der Pfingstkreis des heiligen Geistes Walten und Wirken zur Erlösung der Welt. – Der Pfingstkreis ist des heiligen Geistes Festzeit, weil Seine Verheißung, Sein Kommen, Seine Entfaltung und Sein Walten in der Berufung und Sammlung, in der Erleuchtung, Bekehrung, Heiligung und Vollendung der Kinder Gottes und der heiligen Kirche in dieser Zeit dargestellt wird.',
      'Ehe wir die Bedeutung der einzelnen Sonn- und Festtage dieser Zeit kurz angeben, sei noch auf den innigen Zusammenhang der drei Festkreise und auf den Fortschritt, der in denselben sich zeigt, hingewiesen. – Der Vater hat von Ewigkeit her den Rathschluß zur Erlösung der Welt durch den Sohn gefaßt und darauf durch Verheißung und prophetische Verkündigung hingewiesen; da die Zeit erfüllet ist, sendet Er Seinen lieben Sohn in das Fleisch und verordnet Ihn zum Heiland der Welt, der Juden sowohl, als der Heiden. (Weihnachtskreis.) Der Sohn, vom Vater gesendet, erniedrigt sich selbst, wandelt auf Erden, richtet Sein Amt aus als Prophet und Hoherpriester, stehet auf vom Tode und offenbart Seine königliche Würde, bis Er endlich den Thron Seiner Herrlichkeit besteigt. (Osterkreis.) – Nach Seiner Rückkehr zum Vater sendet Er sammt dem Vater den heiligen Geist; der Geist kommt und hebet nun an Sein Werk der Berufung und Sammlung, der Erleuchtung, Bekehrung, Heiligung und Vollendung der Kinder Gottes. (Pfingstkreis.)',
      'Der heilige Geist berufet und führet zu Christo, denn Niemand kann Jesum einen Herrn nennen, ohne durch den heiligen Geist (1. Cor. 12, 3.); des Geistes Amt ist es, in alle Wahrheit zu leiten, also zu dem, der selbst die Wahrheit (Joh. 14, 6.), und in dem allein Heil und Seligkeit ist (Apostelgesch. 4, 12.), ohne den Niemand zum Vater kommt. (Joh. 14, 6.) Zu Ihm also, zum Heiland Jesu Christo, führet der heilige Geist die, die sich führen lassen, damit sie durch Christum eingehen in die Gemeinschaft des Vaters und also vollendet werde, die Versöhnung der Welt und erfüllet das Gebet unsres Heilandes: „Ich bitte aber nicht allein für sie, sondern auch für die, so durch ihr Wort an mich glauben, auf daß sie Alle eins seien, gleichwie Du, Vater, in mir und Ich in Dir; daß auch sie in uns eins seien, auf daß die Welt glaube, Du habest mich gesandt. Und Ich habe ihnen gegeben die Herrlichkeit, die Du mir gegeben hast, daß sie eins seien, gleichwie wir eins sind: Ich in ihnen und Du in mir, auf daß sie vollkommen seien in eins und die Welt erkenne, daß Du mich gesandt hast und liebest sie, gleichwie Du mich liebest. Vater, Ich will, daß wo Ich bin auch die bei mir seien, die Du mir gegeben hast, daß sie meine Herrlichkeit sehen, die Du mir gegeben hast.“ (Joh. 17, 20–24.)',
      'Vom Vater gehet Alles aus; von Ihm kommt der Sohn (Weihnachtskreis); – dieser bringet Heil und Erlösung (Osterkreis) und sendet dann von und mit dem Vater den heiligen Geist, der, was Er redet, von dem Eigenthume Christi nimmt, das ist von dem Eigenthum des Vaters, denn Alles was der Vater hat, ist auch dem Sohne. (Joh. 16, 14–15.) (Pfingstkreis.) – Vom Vater also gehet Alles Heil und Leben aus durch den Sohn, der vom Vater kommt, und durch den heiligen Geist, der vom Vater und vom Sohne ausgehet. Zum Vater strömet auch wieder Alles zurück durch den Geist und den Sohn; denn darum ist der Sohn gekommen, daß Er die Welt mit Gott versöhne und zu Ihm zurückführe, und darum ist der heilige Geist erschienen, daß Er die, die sich ziehen lassen, zu Christo und durch Christum in die ewige heilige Gemeinschaft des Vaters zurückbringe, die durch die Sünde war zerrissen worden, auf daß sie in Gott leben ein ewig Leben der Herrlichkeit und Seligkeit. Damit ist aufgehoben die Scheidewand, ist ausgefüllt die Kluft, sind zerrissen die Ketten der Finsterniß, und die Erlöseten leben in Gott und Gott in ihnen von Ewigkeit zu Ewigkeit. – Vom Vater gehet aus der Strom der Gnade und strömet durch den Sohn und Geist über die Menschen, und wiederum zurück zum Vater, auf daß Gott endlich sei Alles in Allem! (1. Cor. 15, 28.)',
      'Der heilige Osterkreis tritt sonach recht eigentlich in den Mittelpunkt des ganzen Kirchenjahres und mit Recht. Er ist der Festkreis des Sohnes, in dem ja des Vaters Wesen sich offenbaret und durch den des heiligen Geistes Gabe den Menschen erworben ist. – Der Weihnachtskreis stellt des Vaters Vorbereitung auf das Werk der Erlösung dar. – Der Pfingstkreis zeigt den Erfolg und die Wirkung des durch Christum erworbenen Heiles. – Mitten inne steht der Osterkreis, der das heilige Erlösungswerk selbst feiert. So ist also der heilige Osterkreis sowohl der Zeit, als dem Gedanken nach der Mittelpunkt des ganzen Kirchenjahrs, und in diesem Osterkreise ist es wieder der Charfreitag, der recht eigentlich die Spitze bildet. Es ist das Kreuz aufgerichtet inmitten des Kirchenjahrs; im Kreuze erfüllen sich alle Verheißungen; vom Kreuze gehet aus alle Gnade; – am Kreuze rief der Herr: „Es ist vollbracht!“ Um das Kreuz schaaret sich darum die ganze Christenheit, als um ihr heilig Panier; – unter diesem Zeichen kämpft und siegt die heilige Kirche. – Das Kreuz ist unsrer Kirchen Schmuck und unserer Gräber schönste, verheißungsreiche Zier. Es weiset vom Grabeshügel hin auf Golgathas Höhe, da durch Christi Tod dem Tod und Grab aller Schrecken genommen ward; es weiset hinaus in die letzte Zeit, da der Gekreuzigte wieder kommen und aus allen Gräbern hervorrufen wird die Entschlafenen; – es weiset hinauf zum Himmel, da unsre eigentliche Heimath ist und „von dannen wir auch warten des Heilands Jesu Christi, des Herrn, welcher unsern nichtigen Leib verklären wird, daß er ähnlich werde Seinem verklärten Leibe.“ (Phil. 3, 20–21.)',
    ],
    closing: [
      'Hiermit schließt das ganze Kirchenjahr. Das letzte Gebet, der letzte Ruf am Ende der heiligen Zeit ist das Gebet: Amen, ja komm, Herr Jesu! – Mit dem ersten Advent beginnt das neue Kirchenjahr; der Herr kommt wieder zu Seiner Kirche und zu all den Seinen auf Erden, Er kommt mit Gnade, Heil und Erbarmen, Er bietet noch einmal Seinen Frieden an, gibt noch einmal eine Gnadenfrist, darin Er locket und rufet und uns Alle versammeln will, wie eine Henne ihre Küchlein versammelt unter ihre Flügel. O nütze die Gnadenzeit! Lerne bedenken zu dieser deiner Zeit, was zu deinem Frieden dienet! (Luc. 19, 42.) Höre Gottes Stimme, so lange es heute heißt; widerstrebe nicht dem Ziehen und Walten des heiligen Geistes! – Es kommt die Zeit, da wird erfüllt, was verheißen ist; dann wirst du sehen die Zeichen des Menschensohnes und Er selbst wird kommen auf den Wolken des Himmels mit großer Kraft und Herrlichkeit. – „Ich komme bald!“ hat der gesagt, in deß Mund nie ein Betrug ist erfunden worden. Ach, daß die Zeit schon da wäre, da all das Elend dieser Welt, alle Noth, aller Streit endet und ewiger Friede niederthaut auf die Heiligen Gottes!',
      'Das ängstliche Harren der Creatur wartet auf die Offenbarung der Kinder Gottes (Röm. 8, 19.); viel mehr aber sehnet sich die Christenheit nach dem „lieben jüngsten Tag,“ da ihr Kampf verwandelt wird in ewigen Triumph, ihre Trauer in ewige Freude. – Mache dich bereit auf jenen großen Tag, daß du dem Herrn entgegengehen kannst mit Frohlocken! Rüste deine Lampe, nimm Palmen des Friedens und der Freude zur Hand; – es kommt bald die Stunde, da das ganze Kirchenjahr dieser Zeit und Welt zu Ende geht und anbricht der ewige und herrliche Advent unsres Herrn Jesu Christi. O, daß wir dann Alle Ihm entgegenziehen könnten mit Frohlocken und seligem Hosianna-Ruf!',
      'Wache und bete! – Dazu stärke der heilige Geist dich und die ganze Christenheit, daß sie fröhlich harre des Heilands Jesu Christi und einmüthig bete und flehe im Glauben: Amen! Ja, komm Herr Jesu! Amen!',
    ],
  },
};

/** Introduction and notes to a season, where the book has them. */
export const SEASON_GUIDE: Partial<Record<Season, { intro?: string; note?: string }>> = {
  presentation: {
    note: 'Die Darstellungszeit stellet uns ein deutlich Bild des Lebens Jesu Christi dar. Er erscheinet als der Heiland Israels, der unter das Gesetz gethan wird und heiligen Gehorsam übt auch in Schmerz und Leiden (Neujahr); von etlichen geringen Leuten aus Israel wird Er angenommen (Sonntag nach Weihnachten); von Andern und gerade von den Höchsten verworfen (Sonntag nach Neujahr), – von den Heiden aber mit freudigem Glauben angebetet (Epiphanias). Das ist Seines Lebens Bild. Durch Gehorsam, Schmach, Verwerfung und Leiden gehet Er ein zu Seiner Herrlichkeit.',
  },
  epiphany: {
    note: 'Lieblich ist die Steigerung der prophetischen Herrlichkeit Jesu an den sechs Epiphaniensonntagen, die freilich nur höchst selten alle vorkommen, aber deren Lectionen doch alle Jahre im Hausgottesdienste gelesen werden können und sollen. 1) Das erste Aufleuchten des Lichtes. 2) Jesus kehrt ein bei den Menschen. 3) Er hilft in Krankheit und zeigt so Seine Gewalt und Herrlichkeit. 4) Er gebietet sogar über die Elemente; das ist größere Gewalt und Herrlichkeit. 5) Herrlicher, als in Seiner Gewalt und Macht, erscheint Er in Seiner Langmuth und Barmherzigkeit. 6) Auf’s herrlichste endlich offenbaret Er sich in der Verklärung.',
  },
  lent: {
    intro:
      'Während in den Lectionen aus der Leidensgeschichte der Herr in Seiner tiefsten Erniedrigung und Schmach als der Allerverachtetste erscheint, offenbaren die Evangelien dieser Zeit Seine göttliche Herrlichkeit, so daß die ganze Fastenzeit Seine beiden Naturen, Gottheit und Menschheit, immer klarer hervortreten läßt. Neben den Sonntagsevangelien und den dazu gehörigen Lectionen der vier ersten Wochentage wird in dieser Zeit die Leidensgeschichte gelesen. Hierzu sind Freitag und Sonnabend geordnet.',
    note: 'Auch in der Fastenzeit ist eine schöne Ordnung und Steigerung nicht zu verkennen. Die 6 Sonntage in den Fasten zerfallen in zwei gleiche Theile. I. (1–3.) Christus offenbart Seine göttliche Gewalt und Herrlichkeit indem Er a) den Versucher von sich abweist; b) seinen Einfluß auf die Menschen zerstört und c) die bösen Geister sogar zwingt, Ihn in Seiner Herrlichkeit anzuerkennen. II. (4–6.) Christus offenbart Seine Gnade und göttliche Würde indem Er a) das hungernde Volk speiset und ewige Speise verheißt; b) Seine Ewigkeit, Sündlosigkeit und wahrhaftige Gottheit bezeuget und c) durch Seinen feierlichen Einzug in Jerusalem und die Ehrenbezeugung, die Er annimmt, sich als den ewigen König und Sohn Gottes bekundet. – Der Sonntag vor den Fasten enthält die Verkündigung dessen, was an den Festtagen, die den Schluß der Fastenzeit bilden, erfüllt wird.',
  },
  pentecost: {
    note: 'Der Gedanke des Pfingstfestes tritt in den Lectionen aus der Apostelgeschichte klarer hervor, als in den evangelischen Pericopen dieser Tage, wie das in der Natur der Sache liegt, da die Ausgießung des heiligen Geistes zur Geschichte der Apostel gehört.',
  },
  trinity: {
    intro:
      'Diese Zeit, welche die Mittheilung der durch Christum erworbnen Gnade an den einzelnen Menschen und das reiche Walten des heiligen Geistes darstellt, zerfällt in einige Unterabtheilungen, die äußerlich nicht hervortreten, sondern durch den Inhalt der evangelischen Pericopen bedingt sind.',
    note: 'Wir wollten mit obiger Eintheilung nicht etwa ein streng durchgeführtes dogmatisches System in der Wahl der Pericopen nachweisen, sondern den reichen Stoff nur dem Inhalt der Pericopen entsprechend einigermaßen ordnen. Das Walten des heiligen Geistes ist eben immer ein freies, manichfaltiges, wunderbares, das nicht nach engem Schema gemessen werden kann. In einzelnen Strahlen leuchtet uns Sein ewiges Licht hier entgegen.',
  },
};

/** The Bible word over each group of the Trinity season. */
export const GROUP_REFS: Record<string, readonly string[]> = {
  'Berufung und Sammlung': ['1. Korinther 1,9'],
  Erleuchtung: ['Epheser 1,17-18'],
  Bekehrung: ['Römer 3,23-28'],
  Heiligung: ['Epheser 4,22-24', '1. Thessalonicher 4,7'],
  Vollendung: ['2. Petrus 3,10-13'],
};

/** The meaning of each Sunday and feast day, by the week and feast keys of domain/churchYear.ts. */
export const DAY_GUIDE: Record<string, string> = {
  advent1:
    'Des Herrn Einzug in Jerusalem bildet ab Seine Erscheinung in der Welt und im Fleische. Diese Erscheinung ist von Anfang den ersten Menschen schon, darnach den Erzvätern und ganz Israel verheißen.',
  advent2:
    'Des Herrn erstes Kommen in die Welt mahnet an Sein letztes herrliches Kommen zum Gerichte. Von diesem letzten Kommen handelt die zweite Adventswoche, um uns bereit zu machen zur Annahme des Herrn.',
  advent3:
    'Durch die Propheten ist von Anfang nicht nur des Herrn Erscheinung im Fleische, sondern auch Sein Wirken als Prophet, König und Hoherpriester und das Erscheinen Johannis des Täufers verkündigt. Alle Propheten sind nur des Herrn Herolde.',
  advent4:
    'Johannes der Täufer, größer als alle Propheten, bereitet unmittelbar vor dem Herrn hergehend diesem den Weg. Durch seine Bußpredigt machet er dem Herrn Bahn. Durch Buße sollen auch wir uns bereiten, den Herrn zu empfangen, der täglich bei uns einkehren will.',
  christmas:
    'Christus wird geboren von der Jungfrau Maria in Davids Stadt, wie es verheißen war. Engel lobsingen dem Vater über dem Kindlein und bringen armen Hirten zuerst die frohe Kunde.',
  christmas1:
    'Die ersten Gläubigen aus Israel sammeln sich um das Kindlein. (Simeon und Hanna.) Simeon verkündigt aber, daß dieß Kindlein Vielen auch zum Falle gesetzt sein wird.',
  christmas2:
    'Nicht ganz Israel nimmt seinen Heiland auf. Herodes, auch ein Jude, ist der erste, der sich wider den Herrn erhebt und Ihn verwirft. So hat nachher fast ganz Israel gethan.',
  epiphany:
    'Christus ist nicht nur der Juden, sondern auch der Heiden Heiland. Die Erstlinge aus den Heiden, die Weisen aus dem Morgenland, sammeln sich gläubig und anbetend um das Kindlein und beschämen so Israel, das den Heiligen Gottes verwirft.',
  epiphany1:
    'Der zwölfjährige Jesus im Tempel; Er deutet ahnungsvoll zum erstenmal Sein höheres Wesen an; es ist das erste Aufleuchten des Lichtes der Welt, das erste prophetische Wort des Herrn. Darnach tritt Er durch die Taufe im Jordan Sein prophetisch Amt an, sammelt Jünger und beginnt zu lehren.',
  epiphany2:
    'Jesus in Cana. Er kehrt als Prophet ein in der Menschen Häuser mit Mahnung, Lehre, Freude, Friede, Wundern und Zeichen. Viele nehmen Ihn nicht auf. Ueber die hartnäckigen Verächter ruft Er Sein Wehe! aus.',
  epiphany3: 'Jesus heilt Kranke und erweist durch diese Wunder Seine prophetische Würde und Seine erbarmungsvolle Liebe.',
  epiphany4:
    'Jesus hat auch Gewalt über Sturm und Wellen und zeigt sich dadurch immer klarer als den herrlichsten, als den göttlichen Propheten. Von Alters her hat Er durch Seine allmächtige Hand Sein Volk geführt; Ihm vertraue!',
  epiphany5:
    'Der Herr offenbaret aber nicht nur Seine Gewalt und Macht, sondern auch Seine Barmherzigkeit und Langmuth. Er ist nicht nur ein gewaltiger, sondern auch ein barmherziger Prophet. Seine Langmuth hat Er von Alters her bewiesen. Doch hat sie zuletzt ein Ende.',
  epiphanyLast:
    'Christus wird verklärt und damit bestätigt Gott Ihn als Seinen lieben Sohn, den wir hören sollen, weil Er der höchste, der göttliche Prophet ist. Sein eigen und Seiner Apostel Zeugniß bestätigen Gottes Zeugniß bei der Verklärung.',
  septuagesimae:
    'Jesu Christi prophetisch Wirken dauert länger als Sein Wandel auf Erden. Wie Er von Anfang an Arbeiter in Seinen Weinberg berufen hat, so thut Er bis zur elften Stunde. Er ist der Urprophet und alles prophetische Wirken hat in Ihm seinen Ausgangs- und Mittelpunkt. Die Erwählung und Berufung von Schülern und Gehülfen gehört recht eigentlich zu Seinem prophetischen Amte.',
  sexagesimae:
    'Der Herr weiß sehr wohl, wie die Welt den von Ihm und den Seinen ausgestreuten Samen des Wortes aufnimmt und sagt es voraus, daß nur wenig davon auf gutes Land fällt. Der Same des Wortes ist gut, aber die Welt verachtet ihn oft. Doch wird er nicht vergeblich ausgestreut.',
  estomihi:
    'Der Herr, der heilige Prophet, steht am Ende Seines prophetischen Wirkens und verkündigt Sein nahes Leiden und Sterben, davon auch die Schriften des Alten Bundes schon weissagen. Dieser Sonntag bildet den Uebergang zur Fastenzeit, die mit dem Aschermittwoch beginnt.',
  invokavit:
    'Alles Leiden des Herrn geht zuletzt vom Satan aus. Christus wird vom Satan versuchet, damit Er auch hierin uns gleich würde; Er aber siegt und offenbart so Seine göttliche Herrlichkeit, Seine Reinheit und Heiligkeit, dadurch Er kann ein rechter Hoherpriester werden.',
  reminiszere:
    'Christus überwindet nicht nur selbst in der Versuchung den Satan, sondern befreit auch Andre von der Gewalt der bösen Geister. Als Herr wird Er darum anerkannt auch von einer Heidin. Er gibt noch immer die rechten Waffen wider den Feind.',
  okuli:
    'Der Herr übet göttliche Gewalt über die bösen Geister und zwinget sie sogar, mit Beben Ihn zu bekennen als den Herrn, dem solche Gewalt verliehen ist.',
  laetare:
    'Die Zeit Seines Todes ist nahe; der Herr offenbaret immer mehr Seine Herrlichkeit. Er speiset das Volk wunderbar und verheißet ewige herrliche Speise und herrlichen Trank, – Seinen Leib, den Er in den Tod geben und Sein Blut, das Er vergießen will für der Welt Sünden.',
  judika:
    'Christus gibt ein klares, festes Zeugniß von Seiner Gottheit. Mitten in der tiefsten Schmach tritt so Seine göttliche Herrlichkeit und Sein himmlisch Wesen immer klarer hervor.',
  palmarum:
    'Der Herr zieht ein in Jerusalem und zeigt so durch eine That Seine Herrlichkeit. Sein königlicher Einzug ist aber der Anfang Seiner tiefsten Erniedrigung.',
  maundyThursday:
    'Christus bereitet sich auf Seinen Opfertod vor und stiftet das heilige Abendmahl, das Er zuvor schon verheißen hat; (siehe 4. Sonnt. in den Fasten.)',
  goodFriday:
    'Christus, der allerheiligste, göttliche Hohepriester und das Lamm Gottes, das der Welt Sünde trägt, vollbringt Sein Werk im heiligen Kreuzestode.',
  easter:
    'Der Herr ist auferstanden! Tod und Grab können Ihn nicht behalten. Mit verklärtem Leibe ist Er auferstanden, als ein König und Siegesfürst, aber Er kehrt nicht alsbald in den Himmel zurück, sondern wandelt noch mit den Seinen auf Erden in verhaltner Majestät.',
  easterMonday: 'Der Auferstandne offenbart sich Seinen Jüngern, zuerst den beiden in Emmaus.',
  quasimodogeniti:
    'Der auferstandne König bringt den Seinen reiche Gaben; Er ordnet Boten ab, die das Evangelium von Seinem Reiche verbreiten sollen. Sein Reich ist ein Reich des Friedens und führet zur ewigen Seligkeit.',
  misericordias:
    'Der Herr selbst regieret und leitet die Seinen als ein guter Hirte, wie zuvor verheißen ist, und führet auch die Heiden zu der Einen Heerde hinzu. Wohl uns, daß der Herr uns regieret!',
  jubilate:
    'Als ein lebendiger, allmächtiger König steht der Herr den Seinen bei und gibt ihnen Trost und Freudigkeit im Leid, und führet sie durch der Erde Noth und Streit zur ewigen Freude und seligem Frieden.',
  kantate:
    'Da Christus sich anschickt den Thron Seiner Herrlichkeit im Himmel einzunehmen, verheißt Er als Seinen Stellvertreter einen andern Tröster, den heiligen Geist, der ewiglich bei uns bleibet mit Seinem Segen, und uns leitet auf Wegen der Gnade.',
  rogate:
    'Dazu verheißt der Herr, unser ewiger König, der Seinen Gebet allezeit zu erhören. In Seiner Gemeinschaft sollen wir leben und glücklich sein.',
  ascension:
    'Nach solchen Gnadengaben und seligen Verheißungen kehret der Herr zurück zu der Herrlichkeit, die Er vordem hatte. Er nimmt ein den Stuhl Seiner Majestät zur Rechten Gottes als das Haupt Seiner Gemeinde, als der König der Könige. Einst wird Er wiederkommen mit großer Kraft und Herrlichkeit, um dann Sein königlich Amt im Gerichte ganz zu vollführen.',
  exaudi:
    'Christus verheißt die Sendung des heiligen Geistes, der da ist ein Geist des Trostes, der Hülfe und der Wahrheit, der Weisheit und der Offenbarung, der Kindschaft und des Zeugnisses.',
  pentecost:
    'Die lange zuvor und zuletzt durch Christum verheißene Ausgießung des heiligen Geistes erfolgt unter wunderbaren und herrlichen Zeichen. Die erste Gemeinde des Herrn wird durch den heiligen Geist berufen und gesammelt.',
  pentecostMonday:
    'Wie die Heiden am Epiphanienfest gleichsam ihr Christfest haben, so haben sie auch ihr besonder Pfingstfest. Die Erstlinge aus den Heiden, – Cornelius und seine Hausgenossen, – empfangen den heiligen Geist und werden getauft. Am ersten Pfingstfeiertage wird die erste Christengemeinde aus Israel gesammelt; am zweiten Festtage, als dem Pfingstfest der Heiden, feiern wir die Berufung und Sammlung der ersten Christengemeinde aus den Heiden. Im Evangelium des Tages heißt es ja auch: Also hat Gott die Welt geliebet &c.',
  trinity:
    'Alles Heil, welches Gott, der Vater, der Welt zuvor verheißen, welches der Sohn durch Sein Leben, Leiden und Sterben erworben und der heilige Geist offenbart und bekräftigt hat, wird dem einzelnen Menschen mitgetheilt durch die heilige Taufe. Hierdurch werden die Kinder schon berufen zum Himmelreich. Die Taufe ist innerhalb der Kirche der Anfang der Berufung. – Dieß Fest schaut zurück auf den ganzen Verlauf des Kirchenjahres, auf Alles, was der Vater, Sohn und heilige Geist zum Heile der Welt gethan hat; – es schaut aber auch vorwärts auf die kommende Zeit, denn in der heiligen Taufe wird der einzelne Mensch in das Leben des dreieinigen Gottes eingepflanzt und so beginnt für ihn das neue Leben, dazu wir berufen sind. Von der heiligen Taufe handelt darum die ganze Trinitatiswoche.',
  trinity1:
    'Der Herr beruft uns zum ewigen Leben, doch stellt Er uns auch das Gericht vor, damit wir das gute Theil erwählen und uns nicht durch Reichthum und Lust der Welt abhalten lassen, auf die Berufung des heiligen Geistes durch’s Wort der Propheten &c. zu hören.',
  trinity2:
    'Berufen zum großen Abendmahle, zum ewigen Leben, sind alle Menschen, aber Viele verachten den Ruf; so that Israel, darum erging der Gnadenruf dann an die Heiden. Die Gnadenzeit hat ein Ende; nütze sie.',
  trinity3:
    'Berufen sind wohl alle Menschen zum Leben, mit besonderer Gnade aber nimmt der Herr sich der Elenden, der ganz Verlornen und Verachteten an, und ruft sie immer wieder zu Seiner Heerde.',
  trinity4:
    'In der Berufung offenbart sich Gottes Barmherzigkeit gegen uns so herrlich, daß solche Liebe und gnädige Barmherzigkeit auch uns zu wahrhaftiger Liebe und Barmherzigkeit treiben muß. Wer Gottes gnädige Berufung angenommen und die Barmherzigkeit des Herrn erkannt hat, der kann nicht unbarmherzig gegen seine Brüder sein.',
  trinity5:
    'Eine besondere Berufung ergeht an die, welche das Amt des Herrn führen sollen; denn durch Seine Diener und Unterhirten, die Er bestellt und denen Er Pflicht und Würde gibt, berufet und sammelt der treue Erzhirte in der Kraft des heiligen Geistes Seine Gemeinde und Kirche.',
  trinity6:
    'Der heilige Geist erleuchtet die, welche der Berufung nicht widerstreben und offenbart ihnen vor Allem die Nichtigkeit ihrer Werke, die Thorheit der Eigengerechtigkeit, und zeigt ihnen so die rechte Erfüllung der Gebote Gottes.',
  trinity7:
    'Erkennen wir, erleuchtet vom heiligen Geiste, daß wir durch unsre Gerechtigkeit nicht selig werden können, so lassen wir uns dann gerne auf den Weg zum Leben leuchten, zu Christo, bei dem wir, wie das Volk in der Wüste, reichlich erquickt werden und Leben und volle Genüge empfangen. Folge dem Rufe des Herrn und eile zu Ihm.',
  trinity8:
    'Des heiligen Geistes Erleuchtung zeigt uns darnach auch, wie unser Glaube an den Herrn Christum gute Früchte bringen muß, und wie daran des Baumes Art erkannt, die Wahrheit des Glaubens geprüft wird.',
  trinity9:
    'Des heiligen Geistes Erleuchtung zeigt uns am ungerechten Haushalter die rechte Klugheit, die danach trachtet, sich Reichthümer und Freunde im Himmel zu erwerben. Wer wahrhaft klug ist, baut nicht auf der Erde Güter, sondern trachtet danach, Christum zu gewinnen und lässet sich im Irdischen genügen.',
  trinity10:
    'Wer durch den heiligen Geist erleuchtet ist, der erkennet, daß in Christo allein Heil und Leben ist; Jerusalem hat die gnädige Zeit seiner Heimsuchung und was zu seinem Frieden diente, nicht erkannt; darum weint der Herr über die Stadt und über ihren nahen Fall. Noch müssen alle Christen mit dem Herrn klagen über die Verblendung der Welt, die sich nicht will erleuchten lassen, noch erkennen, was zu ihrem Frieden dient.',
  trinity11:
    'Der heilige Geist, der uns berufet und erleuchtet wirket auch, so wir nicht widerstreben, herzliche Reue und Buße und treibt uns zur wahrhaftigen Bekehrung, daß wir an unsre Brust schlagen und sprechen: Gott sei mir Sünder gnädig! An Mahnungen zur Buße fehlt es nicht; die Frommen haben allezeit Buße gethan und den Bußfertigen ist Gott gnädig.',
  trinity12:
    'Das Gefühl der Sünde und des Elendes erweckt in dem Menschen ein Sehnen nach Gnade und so führet der heilige Geist ihn zu dem Herrn, der Herz und Ohr öffnet dem Worte des Lebens und den Mund zum Bekenntniß Seines Namens, wie Er dem Taubstummen gethan. Die Bekehrung zum Herrn ist also des heiligen Geistes, nicht des Menschen eignes Werk; höre nur das Wort und widerstrebe nicht, daß nicht des Herrn Gerichte über dich kommen.',
  trinity13:
    'Haben wir uns so zum Herrn ziehen lassen, so gibt Er uns die Rechtfertigung durch den Glauben. Als der wahrhaftige barmherzige Samariter nimmt Er sich unsres Elendes an und heilet uns von allen Gebrechen. Nicht durch Werke können wir also selig werden, sondern: Selig sind die Augen, die auf Christum schauen in wahrem Glauben. Des Herrn freie Gnade ist der Erlösung Grund. Sind wir gerechtfertigt aus Gnaden, so gibt der heilige Geist auch Zeugniß unsrem Geiste, daß wir Gottes Kinder sind.',
  trinity14:
    'Der Christ, der also durch den heiligen Geist seiner Rechtfertigung gewiß geworden ist, bringt dem Herrn Dank und Lob dar und legt sich Ihm zu Füßen, wie der dankbare Aussätzige that. Voll heiliger Freude und Dank ist des erlösten Christen Herz allezeit; der heilige Geist erfüllet ihn mit seligem Jubel.',
  trinity15:
    'Aus der Rechtfertigung kommt die Heiligung. Wer in Gnaden angenommen ist um Christi willen, soll nun auch durch des heiligen Geistes Kraft sich Gott ganz hingeben und nicht der Welt leben. Die Sorge der Welt hemmt die Hingabe an den Herrn; darum wirft der Christ, getrieben vom heil. Geiste, alle Sorge getrost auf Gott und trachtet nach dem, das droben ist.',
  trinity16:
    'Die Heiligung wird durch Weltsorge gehemmt, durch Trübsal und Leid gefördert. Dadurch wird das Herz von der Welt ab- und zu dem Herrn hingezogen, der in Kreuz und Noth, ja im Tode selbst Trost und Hülfe zu spenden vermag, wie Er zu Nain bewiesen, da Er die trauernde Wittwe tröstete und den Todten auferweckte. Leiden sind darum heilsam und des Christen Weg geht durch Leid und Streit zur ewigen Freud und Herrlichkeit.',
  trinity17:
    'Zur Heiligung des Christen dienen insbesondere die heiligen Ruhetage, die Gottes Gnade geordnet hat. Der Christ soll diese Tage feiern, dem heiligen Geiste da recht Raum geben und nach des Herrn Mahnung in wahrhaftiger Demuth wandeln.',
  trinity18:
    'Liebe zu Gott und Liebe zum Nächsten ist des Gesetzes Summe; wahre Liebe ist wahre Heiligung. Die wahre Liebe kommt aber nur aus dem Glauben. Das Gesetz zu kennen ist nicht genug; wir vermögen es aus eigner Kraft nicht zu erfüllen. Wenn wir aber im Glauben den Herrn ergreifen, so quillt aus solchem Glauben auch die rechte Liebe; diese ist des Glaubens Frucht, aber kein Verdienst. – Gesetz und Evangelium gehören zusammen.',
  trinity19:
    'Im Ringen nach Heiligung fördert den Christen insbesondere der Trost der täglichen Sündenvergebung, den er durch den heiligen Geist hat; ohne diesen reichen Trost, der durch die „selige Absolution“ des Amtes recht fest und gewiß gemacht wird, kann ein Christ gar nicht der Heiligung nachstreben, die er ja nimmer ganz erreicht.',
  trinity20:
    'Viele sind berufen, aber Wenige sind auserwählt. Durch ernstes Ringen nach wahrer Heiligung in der Kraft des heiligen Geistes sucht der Gerechtfertigte seinen Beruf und Erwählung festzumachen, auf daß er nicht hinausgestoßen werde in die äußerste Finsterniß. Er schaffet mit Furcht und Zittern, daß er selig werden und vor dem Herrn bestehen mag, als angethan mit dem rechten hochzeitlichen Kleide, das der Herr selbst aus Gnaden darreichet.',
  trinity21:
    'Der Trost der Sündenvergebung ermuthigt, – der Gedanke, daß nur Wenige auserwählt sind, spornt den Christen zum Ringen nach Heiligung. Das rechte tägliche Heiligungsmittel ist das Gebet. Der Christ hält darum an im Gebet des Glaubens, welches des Herrn Verheißung hat. Ein Vorbild treuen, anhaltenden Gebetes ist der Königische im Evangelio.',
  trinity22:
    'Zur Ausdauer im Ringen nach Heiligung treibt insbesondere auch der Gedanke an die ernste Rechenschaft. Der Christ weiß aber wohl, daß er trotz alles Strebens nach Heiligung doch vor Gott nicht bestehen kann und hoffet darum allein auf des Herrn Barmherzigkeit und erweiset sich daher auch gegen seine Brüder barmherzig und versöhnlich.',
  trinity23:
    'Die Heiligung des Christen erweiset sich insbesondere durch einen guten, gottseligen Wandel in den Ordnungen Gottes, die in der Kirche, im Staate und im Hause gelten; ein heiliger Wandel in den Werken des vierten Gebotes ziemt dem Christen und hat die Verheißung reichen Segens.',
  trinity24:
    'Der Christ ringet einem ewigen Ziele, der Vollendung, entgegen. Dazu gelangen wir hienieden nicht; erst wenn der Herr uns auferweckt von den Todten und uns einen neuen verklärten Leib gibt, wie Er einst thun wird, bringen wir zur Vollendung hindurch. Die Auferstehung, an Jairi Töchterlein vorgebildet, ist unsre schönste Hoffnung.',
  // The 25th to 27th week after Trinity: the last three Sundays of the church year.
  thirdLast:
    'Diese Hoffnung wird erfüllt, wenn der Herr wiederkommt nach Seiner Verheißung. Gewaltige Zeichen, insbesondere Irrlehre und Abfall, ja die Erscheinung des Antichristes, werden die Wiederkunft Christi anzeigen. Sei allezeit gerüstet; – Er kommt bald!',
  secondLast:
    'Wann der Herr wiederkommt und die Todten auferweckt hat, wird Er Gericht halten und die Einen zum ewigen Leben, die Andern zur ewigen Verdammniß weisen. Sei treu, denke täglich an des Herrn ernstes Gericht und an die ewige Entscheidung jenes großen Tages.',
  eternity:
    'Das Weltende und die Vollendung der Gläubigen ist nahe! Der Herr kommt bald, wie Er auch verheißen hat. Rüste dich und wache, daß du Ihm entgegengehen kannst, wenn Er kommt, Seine Braut, die heilige Kirche, heimzuführen. Prophetisch hat Johannes in der Offenbarung uns diese letzten Zeiten und die Seligkeit der Auserwählten im himmlischen Jerusalem geschildert. Der Herr helfe uns allen durch Seinen Geist, daß wir diese Seligkeit einst selbst sehen und schmecken dürfen!',
};

/** Days the book explains that have no entry of their own in the church-year list. */
export const EXTRA_DAYS: Partial<Record<Season, readonly { label: string; text: string }[]>> = {
  christmastide: [
    {
      label: 'Zweiter Christfeiertag',
      text: 'Diese erste Weihnachtsverkündigung bringt alsbald Segen. Die Hirten suchen das Kindlein auf, breiten aus, was sie gesehen haben und preisen Gott dafür.',
    },
    {
      label: 'Dritter Christfeiertag',
      text: 'Christus, der hier als Kindlein erscheint, der sich so tief erniedrigt, ist kein anderer, als der ewige Sohn Gottes, das lebendige Wort, das von Ewigkeit bei Gott und selbst Gott von Art und Wesen ist. Das bezeuget Johannes. Nach Gottes Gnade werden wir auch zu Gottes Kindern durch Christum.',
    },
  ],
  presentation: [
    {
      label: 'Neujahr',
      text: 'Christus wird beschnitten und somit unter das Gesetz gethan. Damit hebet Er an, das Gesetz zu erfüllen und sich zu erweisen als den Erlöser Israels; denn darum ist Er ja unter das Gesetz gethan, auf daß Er die, so unter dem Gesetz waren, also die Israeliten, erlösete. Darum ist Er auch Jesus genannt worden „denn Er wird Sein Volk selig machen von ihren Sünden.“ (Matth. 1, 21.)',
    },
  ],
  lent: [
    {
      label: 'Aschermittwoch',
      text: 'Der Herr tritt ein in die Zeit Seiner tiefsten Leiden. Damit hebt an Sein hohepriesterlich Amt, dessen Vorbild das hohepriesterliche Amt des alten Bundes war.',
    },
    {
      label: 'Ostersonnabend',
      text: 'Christi Höllenfahrt. Er steiget hinab in das Gefängniß, nicht um dort behalten zu werden, sondern um das Evangelium zu predigen und als Sieger zurückzukehren. Der Stand Seiner Erniedrigung ist zu Ende; der Stand der Erhöhung beginnt.',
    },
  ],
  eastertide: [
    {
      label: 'Dritter Ostertag',
      text: 'Darnach zeigt Er sich allen Seinen Jüngern und überzeugt sie, daß Er wahrhaftig vom Tode erstanden ist. – Seine Auferstehung ist gewaltig bezeugt von Seinen Jüngern.',
    },
  ],
  waiting: [
    {
      label: 'Freitag und Sonnabend vor Exaudi',
      text: 'Auf den heiligen Geist, der da ist wahrhaftiger Gott und der schon im Alten Testamente verheißen ist, warten die Jünger des Herrn von dem Tage an, da ihr Meister von ihnen geschieden und gen Himmel gefahren ist.',
    },
  ],
  pentecost: [
    {
      label: 'Dritter Pfingstfeiertag',
      text: 'Auch in Samaria wird eine Gemeinde gesammelt und empfängt den heiligen Geist durch der Apostel Handauflegung.',
    },
    {
      label: 'Pfingstwoche',
      text: 'Während das Pfingstfest so die Gründung der ersten Gemeinde Christi durch den heiligen Geist darstellt, sind für die Pfingstwoche etliche Lectionen geordnet, welche das Leben und Wesen dieser ersten Gemeinde zeigen.',
    },
  ],
};

/**
 * Sundays that some years do not have (the calendar moves with Easter), with the
 * season they belong to. The book has them read every year all the same.
 */
export function optionalDays(): { key: string; label: string; season: Season }[] {
  return [
    { key: 'christmas2', label: 'Sonntag nach Neujahr', season: 'presentation' as Season },
    ...[1, 2, 3, 4, 5].map((n) => ({ key: `epiphany${n}`, label: `${n}. Sonntag nach Epiphanias`, season: 'epiphany' as Season })),
    ...Array.from({ length: 24 }, (_, i) => ({
      key: `trinity${i + 1}`,
      label: `${i + 1}. Sonntag nach Trinitatis`,
      season: 'trinity' as Season,
    })),
  ];
}
