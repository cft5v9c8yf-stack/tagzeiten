/**
 * What Gospel and Epistle of a Sunday are about, in a sentence each – in our
 * own words, not Bible text (rule 13): the text itself is read on paper.
 * Keys follow SUNDAY_INFO (content/churchYearGuide.ts).
 */
export const READING_SUMMARIES: Record<string, { gospel: string; epistle: string }> = {
  // Weihnachtskreis
  advent1: {
    gospel: 'Jesus zieht auf einem Esel in Jerusalem ein; das Volk jubelt ihm als dem verheißenen König zu.',
    epistle: 'Die Stunde ist da, aufzustehen vom Schlaf; die Nacht ist vorgerückt, der Tag nahe: Lasst uns ablegen die Werke der Finsternis und anziehen den Herrn Jesus Christus.',
  },
  advent2: {
    gospel: 'Jesus kündigt Zeichen an Sonne, Mond und Sternen an; wenn sie kommen, naht die Erlösung. Seine Worte vergehen nicht: Wachet und betet allezeit.',
    epistle: 'Was geschrieben ist, ist uns zur Lehre geschrieben, damit wir durch Geduld und Trost der Schrift Hoffnung haben; nehmt einander auf, wie Christus euch aufgenommen hat – auch die Heiden sollen Gott loben.',
  },
  advent3: {
    gospel: 'Johannes fragt aus dem Gefängnis, ob Jesus der Kommende ist; Jesus verweist auf seine Werke und nennt Johannes seinen Wegbereiter.',
    epistle: 'Paulus versteht sich als Haushalter der Geheimnisse Gottes; richten wird allein der Herr, wenn er kommt.',
  },
  advent4: {
    gospel: 'Priester und Leviten fragen Johannes, wer er sei; er bekennt: Ich bin nicht der Christus, ich bin die Stimme eines Predigers in der Wüste – dem, der nach mir kommt, bin ich nicht wert, die Schuhriemen aufzulösen.',
    epistle: 'Freut euch im Herrn allezeit; sorgt euch um nichts, bringt alles betend vor Gott, und sein Friede bewahrt eure Herzen.',
  },
  christmas: {
    gospel: 'Jesus wird in Bethlehem geboren und in eine Krippe gelegt; ein Engel verkündet den Hirten große Freude, und die Menge der himmlischen Heerscharen lobt Gott.',
    epistle: 'Die heilsame Gnade Gottes ist erschienen allen Menschen und nimmt uns in Zucht, dass wir züchtig, gerecht und gottselig leben und warten auf die Erscheinung des großen Gottes und unseres Heilandes Jesus Christus.',
  },
  christmas1: {
    gospel: 'Simeon segnet das Kind und sagt Maria, es sei gesetzt zum Fall und Auferstehen vieler; die Prophetin Hanna preist Gott, und das Kind wächst, voll Weisheit, und Gottes Gnade ist bei ihm.',
    epistle: 'Als die Zeit erfüllt war, sandte Gott seinen Sohn, geboren von einem Weibe und unter das Gesetz getan, damit wir die Kindschaft empfingen: Du bist nicht mehr Knecht, sondern Kind und Erbe.',
  },
  christmas2: {
    gospel: 'Im Traum gewarnt, flieht Joseph mit dem Kind und seiner Mutter nach Ägypten; Herodes lässt die Kinder in Bethlehem töten. Nach seinem Tod kehren sie zurück und wohnen in Nazareth.',
    epistle: 'Lasst euch die Hitze der Verfolgung nicht befremden, sondern freut euch, dass ihr mit Christus leidet; wer nach Gottes Willen leidet, befehle ihm seine Seele als dem treuen Schöpfer.',
  },
  epiphany: {
    gospel: 'Weise aus dem Osten folgen dem Stern nach Bethlehem, beten das Kind an und bringen ihm Gaben.',
    epistle: 'Mache dich auf, werde licht; denn dein Licht kommt, und die Herrlichkeit des HERRN geht auf über dir: Die Heiden werden in deinem Licht wandeln und Gold und Weihrauch bringen.',
  },
  epiphany1: {
    gospel: 'Der zwölfjährige Jesus bleibt im Tempel zurück und sagt seinen Eltern, er müsse sein in dem, was seines Vaters ist.',
    epistle: 'Gebt euren Leib hin als lebendiges Opfer und stellt euch nicht dieser Welt gleich; wir sind viele Glieder und doch ein Leib in Christus, jeder mit seiner Gabe.',
  },
  epiphany2: {
    gospel: 'Auf der Hochzeit zu Kana verwandelt Jesus Wasser in Wein – sein erstes Zeichen; die Jünger glauben an ihn.',
    epistle: 'Jeder diene mit seiner Gabe; die Liebe sei nicht falsch: Hasst das Arge, hängt dem Guten an, seid fröhlich in Hoffnung, geduldig in Trübsal, haltet an am Gebet.',
  },
  epiphany3: {
    gospel: 'Ein Aussätziger bittet: Herr, so du willst, kannst du mich wohl reinigen – und wird rein; dann traut ein Hauptmann Jesu Wort, und sein Knecht wird gesund.',
    epistle: 'Haltet euch nicht selbst für klug; vergeltet niemand Böses mit Bösem. Lass dich nicht das Böse überwinden, sondern überwinde das Böse mit Gutem.',
  },
  epiphany4: {
    gospel: 'Im Sturm auf dem Meer wecken die Jünger Jesus; er bedroht Wind und Meer, und es wird ganz stille: Was ist das für ein Mann?',
    epistle: 'Seid niemand etwas schuldig, als dass ihr euch untereinander liebt; die Liebe tut dem Nächsten nichts Böses – so ist die Liebe des Gesetzes Erfüllung.',
  },
  epiphany5: {
    gospel: 'Ein Feind sät Unkraut in den Weizen; der Herr lässt beides wachsen bis zur Ernte, dann wird geschieden.',
    epistle: 'Zieht an Erbarmen und Geduld, vergebt einander, lasst das Wort Christi reichlich wohnen und singt Gott dankbar.',
  },
  epiphanyLast: {
    gospel: 'Auf dem Berg wird Jesus vor drei Jüngern verklärt; die Stimme aus der Wolke sagt: Den sollt ihr hören.',
    epistle: 'Petrus ist nicht klugen Fabeln gefolgt, sondern hat Christi Herrlichkeit auf dem heiligen Berg gesehen und die Stimme des Vaters gehört; umso fester ist das prophetische Wort, ein Licht an einem dunklen Ort.',
  },
  // Osterkreis
  septuagesimae: {
    gospel: 'Arbeiter, die zu verschiedenen Stunden in den Weinberg kamen, erhalten denselben Lohn: Gott ist gütig.',
    epistle: 'Lauft so, dass ihr das Kleinod ergreift: Paulus zähmt seinen Leib, damit er nicht anderen predigt und selbst verwerflich wird. Auch die Väter in der Wüste hatten geistliche Speise und Trank, doch an vielen hatte Gott kein Wohlgefallen.',
  },
  sexagesimae: {
    gospel: 'Das Wort Gottes ist wie Same, der auf verschiedenen Boden fällt; im guten Herzen bringt es Frucht in Geduld.',
    epistle: 'Paulus rühmt sich nicht seiner Stärke, sondern seiner Leiden und Schwachheit; auf seine Bitte um den Pfahl im Fleisch antwortet der Herr: Lass dir an meiner Gnade genügen, denn meine Kraft ist in den Schwachen mächtig.',
  },
  estomihi: {
    gospel: 'Jesus kündigt den Zwölfen sein Leiden und seine Auferstehung an, doch sie verstehen es nicht; vor Jericho ruft ein Blinder: Jesu, du Sohn Davids, erbarme dich mein! – und wird sehend.',
    epistle: 'Ohne Liebe ist alles nichts; die Liebe ist langmütig, freundlich und hört nimmer auf.',
  },
  invokavit: {
    gospel: 'Jesus wird in der Wüste vom Teufel versucht und widersteht ihm jedes Mal mit dem Wort der Schrift.',
    epistle: 'Lasst die Gnade Gottes nicht vergeblich sein: Jetzt ist die angenehme Zeit, jetzt ist der Tag des Heils. Die Diener Gottes erweisen sich in Trübsal – als die Traurigen, aber allezeit fröhlich; als die nichts haben und doch alles haben.',
  },
  reminiszere: {
    gospel: 'Eine kanaanäische Frau bittet Jesus um Hilfe für ihre Tochter, die schwer geplagt ist; sie lässt sich nicht abweisen, Jesus lobt ihren großen Glauben, und die Tochter wird gesund.',
    epistle: 'Das ist der Wille Gottes, eure Heiligung: Jeder halte seinen Leib in Heiligung und Ehren und übervorteile seinen Bruder nicht; Gott hat uns nicht berufen zur Unreinigkeit, sondern zur Heiligung.',
  },
  okuli: {
    gospel: 'Jesus treibt einen stummen Teufel aus; manche sagen, er tue es durch Beelzebub. Er antwortet: Wer nicht mit mir ist, der ist wider mich. Selig sind, die Gottes Wort hören und bewahren.',
    epistle: 'Folgt Gott nach als liebe Kinder und wandelt in der Liebe; ihr wart Finsternis, nun seid ihr Licht in dem Herrn – wandelt wie die Kinder des Lichts.',
  },
  laetare: {
    gospel: 'Jesus speist fünftausend Menschen mit fünf Broten und zwei Fischen; es bleiben zwölf Körbe übrig. Als sie ihn zum König machen wollen, entweicht er auf den Berg.',
    epistle: 'Abraham hatte zwei Söhne, einen von der Magd und einen von der Freien: So sind wir nicht der Magd Kinder, sondern der Freien – Kinder der Verheißung wie Isaak.',
  },
  judika: {
    gospel: 'Jesus fragt: Welcher unter euch kann mich einer Sünde zeihen? Wer sein Wort hält, wird den Tod nicht sehen ewiglich. Ehe denn Abraham ward, bin ich – da heben sie Steine auf, ihn zu steinigen.',
    epistle: 'Christus ist gekommen als Hoherpriester und durch sein eigenes Blut ein für allemal in das Heilige eingegangen; er hat eine ewige Erlösung erfunden und ist Mittler des neuen Testaments.',
  },
  palmarum: {
    gospel: 'Jesus zieht auf einem Esel in Jerusalem ein; das Volk ruft: Hosianna dem Sohne Davids! Gelobt sei, der da kommt in dem Namen des Herrn.',
    epistle: 'Christus entäußerte sich, wurde gehorsam bis zum Tod am Kreuz; darum hat Gott ihn erhöht über alle Namen.',
  },
  maundyThursday: {
    gospel: 'Jesus wäscht seinen Jüngern die Füße und gibt ihnen ein Beispiel, einander zu dienen.',
    epistle: 'Paulus gibt weiter, was er empfangen hat: die Einsetzung des Abendmahls in der Nacht des Verrats. Der Mensch prüfe sich selbst und esse so von diesem Brot.',
  },
  goodFriday: {
    gospel: 'Jesus wird gekreuzigt, sorgt noch für seine Mutter und stirbt mit dem Wort: Es ist vollbracht.',
    epistle: 'Der Knecht des HERRN ist der Allerverachtetste; er trägt unsere Krankheit und ist um unserer Missetat willen verwundet. Die Strafe liegt auf ihm, auf dass wir Frieden hätten, und durch seine Wunden sind wir geheilt.',
  },
  easter: {
    gospel: 'Die Frauen finden das Grab leer; ein Jüngling in weißem Kleid sagt ihnen: Er ist auferstanden, er ist nicht hier.',
    epistle: 'Feget den alten Sauerteig aus, damit ihr ein neuer Teig seid; denn wir haben auch ein Osterlamm, das ist Christus, für uns geopfert. Lasst uns Ostern halten im Süßteig der Lauterkeit und Wahrheit.',
  },
  easterMonday: {
    gospel: 'Zwei Jünger gehen nach Emmaus; der Auferstandene legt ihnen die Schrift aus und wird beim Brotbrechen erkannt.',
    epistle: 'Petrus predigt im Haus des Cornelius: Gott sieht die Person nicht an. Jesus von Nazareth, den sie an das Holz gehängt haben, hat Gott am dritten Tag auferweckt, und die Zeugen haben mit ihm gegessen und getrunken.',
  },
  quasimodogeniti: {
    gospel: 'Der Auferstandene kommt zu den Jüngern durch verschlossene Türen; Thomas zweifelt, bis er ihn sieht und bekennt: Mein Herr und mein Gott. Das ist geschrieben, damit ihr glaubt.',
    epistle: 'Alles, was von Gott geboren ist, überwindet die Welt, und unser Glaube ist der Sieg; Jesus ist gekommen mit Wasser und Blut, und der Geist bezeugt es.',
  },
  misericordias: {
    gospel: 'Jesus ist der gute Hirte, der sein Leben für die Schafe lässt und sie kennt.',
    epistle: 'Christus hat für uns gelitten und uns ein Vorbild gelassen; ihr wart wie irrende Schafe, nun seid ihr bekehrt zum Hirten.',
  },
  jubilate: {
    gospel: 'Über ein Kleines werdet ihr mich nicht sehen, und abermals über ein Kleines werdet ihr mich sehen: Eure Traurigkeit soll in Freude verkehrt werden, wie bei einer Frau nach der Geburt.',
    epistle: 'Enthaltet euch als Fremdlinge von den fleischlichen Lüsten und führt einen guten Wandel unter den Heiden; seid untertan aller menschlichen Ordnung um des Herrn willen. Fürchtet Gott, ehrt den König.',
  },
  kantate: {
    gospel: 'Jesus geht zum Vater und sendet den Tröster; der wird die Welt strafen um die Sünde, um die Gerechtigkeit und um das Gericht und die Jünger in alle Wahrheit leiten.',
    epistle: 'Alle gute Gabe und alle vollkommene Gabe kommt von oben herab, von dem Vater des Lichts; er hat uns gezeugt durch das Wort der Wahrheit. Seid schnell zu hören, langsam zu reden, und nehmt das Wort an mit Sanftmut.',
  },
  rogate: {
    gospel: 'Was ihr den Vater bitten werdet in meinem Namen, das wird er euch geben; bittet, so werdet ihr nehmen, dass eure Freude vollkommen sei. Der Vater selbst hat euch lieb.',
    epistle: 'Seid Täter des Worts und nicht Hörer allein; wer in das vollkommene Gesetz der Freiheit schaut und dabei bleibt, der wird selig in seiner Tat. Reiner Gottesdienst ist, Waisen und Witwen in ihrer Trübsal zu besuchen.',
  },
  ascension: {
    gospel: 'Der Auferstandene schilt den Unglauben der Elf und sendet sie: Gehet hin in alle Welt und predigt das Evangelium; wer da glaubt und getauft wird, der wird selig. Dann wird er aufgehoben gen Himmel und sitzt zur Rechten Gottes.',
    epistle: 'Der Auferstandene verheißt den Heiligen Geist und fährt vor ihren Augen auf; zwei Männer in weißen Kleidern kündigen seine Wiederkunft an.',
  },
  exaudi: {
    gospel: 'Jesus verheißt den Tröster, der von ihm zeugen wird, und bereitet die Jünger auf Verfolgung vor.',
    epistle: 'Es ist nahe gekommen das Ende aller Dinge: Seid nüchtern zum Gebet, habt untereinander eine brünstige Liebe, die der Sünden Menge deckt, und dient einander, ein jeglicher mit der Gabe, die er empfangen hat.',
  },
  pentecost: {
    gospel: 'Wer Jesus liebt, hält sein Wort; der Vater und er werden Wohnung bei ihm nehmen, und der Geist lehrt alles. Den Frieden lasse ich euch.',
    epistle: 'Am Pfingsttag kommt der Heilige Geist mit Brausen und Zungen wie von Feuer über die Jünger; sie reden in anderen Sprachen die großen Taten Gottes, und die Menge entsetzt sich.',
  },
  pentecostMonday: {
    gospel: 'Also hat Gott die Welt geliebt, dass er seinen eingeborenen Sohn gab; wer an ihn glaubt, der wird nicht gerichtet. Das Licht ist in die Welt gekommen, doch die Menschen liebten die Finsternis mehr.',
    epistle: 'Während Petrus predigt, fällt der Heilige Geist auf alle, die dem Wort zuhören – auch auf die Heiden; da lässt Petrus sie taufen in dem Namen des Herrn.',
  },
  // Pfingstkreis
  trinity: {
    gospel: 'Nikodemus kommt bei Nacht zu Jesus und hört: Wer nicht aus Wasser und Geist geboren wird, kann nicht ins Reich Gottes kommen; wie Mose die Schlange erhöht hat, so muss des Menschen Sohn erhöht werden.',
    epistle: 'Welch eine Tiefe des Reichtums Gottes: Von ihm und durch ihn und zu ihm sind alle Dinge.',
  },
  trinity1: {
    gospel: 'Ein reicher Mann lebt achtlos am armen Lazarus vorbei; nach dem Tod ist das Los vertauscht – Mose und die Propheten hätten genügt.',
    epistle: 'Gott ist Liebe; wer sagt, er liebe Gott, und hasst seinen Bruder, der lügt.',
  },
  trinity2: {
    gospel: 'Die Geladenen entschuldigen sich; so lädt der Hausherr die Armen, Krüppel, Lahmen und Blinden und zuletzt die Leute von den Landstraßen zum großen Abendmahl.',
    epistle: 'Wir wissen, dass wir aus dem Tod in das Leben gekommen sind, denn wir lieben die Brüder; lasst uns nicht lieben mit Worten noch mit der Zunge, sondern mit der Tat und mit der Wahrheit.',
  },
  trinity3: {
    gospel: 'Der Hirte sucht das verlorene Schaf, die Frau die verlorene Münze: Im Himmel ist Freude über einen Sünder, der Buße tut.',
    epistle: 'Demütigt euch unter die gewaltige Hand Gottes; alle eure Sorge werft auf ihn, denn er sorgt für euch, und widersteht dem Widersacher, fest im Glauben.',
  },
  trinity4: {
    gospel: 'Seid barmherzig wie euer Vater; richtet nicht, und seht zuerst den Balken im eigenen Auge.',
    epistle: 'Die Leiden dieser Zeit sind nicht zu vergleichen mit der Herrlichkeit, die an uns offenbart werden soll; die ganze Kreatur wartet mit uns auf die Erlösung.',
  },
  trinity5: {
    gospel: 'Auf Jesu Wort werfen die Fischer noch einmal die Netze aus und fangen überreich; Petrus erschrickt, und Jesus beruft ihn.',
    epistle: 'Seid allesamt gleichgesinnt, mitleidig, brüderlich, barmherzig, freundlich; vergeltet nicht Böses mit Bösem, sondern segnet. Heiligt Gott den Herrn in euren Herzen und seid bereit zur Verantwortung eurer Hoffnung.',
  },
  trinity6: {
    gospel: 'Eure Gerechtigkeit muss besser sein als die der Schriftgelehrten und Pharisäer: Schon wer mit seinem Bruder zürnt, ist des Gerichts schuldig. Versöhne dich mit deinem Bruder, ehe du opferst.',
    epistle: 'In der Taufe sind wir mit Christus in seinen Tod begraben, damit wir, wie er auferweckt ist, in einem neuen Leben wandeln.',
  },
  trinity7: {
    gospel: 'In der Wüste speist Jesus viertausend Menschen mit sieben Broten und wenigen Fischlein; es bleiben sieben Körbe übrig.',
    epistle: 'Wie ihr eure Glieder einst der Sünde zu Knechten gabt, so gebt sie nun der Gerechtigkeit, dass sie heilig werden: Der Tod ist der Sünde Sold; aber die Gabe Gottes ist das ewige Leben in Christus Jesus.',
  },
  trinity8: {
    gospel: 'Seht euch vor vor den falschen Propheten: An ihren Früchten sollt ihr sie erkennen. Nicht alle, die Herr, Herr sagen, kommen ins Himmelreich, sondern die den Willen des Vaters tun.',
    epistle: 'Wir sind nicht dem Fleisch schuldig; welche der Geist Gottes treibt, die sind Gottes Kinder. Wir rufen: Abba, lieber Vater, und sind Erben Gottes und Miterben Christi.',
  },
  trinity9: {
    gospel: 'Ein ungerechter Haushalter sorgt klug für die Zeit nach seiner Absetzung; Jesus mahnt: Macht euch Freunde mit dem ungerechten Mammon, damit sie euch aufnehmen in die ewigen Hütten.',
    epistle: 'Was Israel in der Wüste widerfuhr, ist uns zum Vorbild geschrieben: Wer sich lässt dünken, er stehe, mag wohl zusehen, dass er nicht falle. Gott ist getreu und lässt euch nicht versuchen über euer Vermögen.',
  },
  trinity10: {
    gospel: 'Jesus weint über Jerusalem, das die Zeit seiner Heimsuchung nicht erkennt, und reinigt den Tempel.',
    epistle: 'Niemand kann Jesus einen Herrn heißen außer durch den Heiligen Geist; es sind mancherlei Gaben, aber ein Geist, und jedem wird seine Gabe zum Nutzen aller gegeben.',
  },
  trinity11: {
    gospel: 'Ein Pharisäer rühmt sich vor Gott, ein Zöllner bittet nur um Gnade – und geht gerechtfertigt heim.',
    epistle: 'Paulus überliefert das Evangelium: Christus starb für unsre Sünden, wurde begraben, ist auferstanden und vielen erschienen – zuletzt auch ihm; von Gottes Gnade ist er, was er ist.',
  },
  trinity12: {
    gospel: 'Jesus heilt einen Taubstummen mit dem Wort „Hephatha“ – tu dich auf; die Leute sagen: Er hat alles wohl gemacht.',
    epistle: 'Unsere Tüchtigkeit ist von Gott, der uns tüchtig gemacht hat zum Amt des neuen Testaments: Der Buchstabe tötet, aber der Geist macht lebendig; das Amt, das die Gerechtigkeit predigt, hat überschwengliche Klarheit.',
  },
  trinity13: {
    gospel: 'Selig sind die Augen, die sehen, was ihr seht. Ein Schriftgelehrter fragt, wer sein Nächster sei; ein Samariter hilft dem Überfallenen, an dem Priester und Levit vorübergehen: Gehe hin und tue desgleichen.',
    epistle: 'Die Verheißung ist Abraham und seinem Samen gegeben, das ist Christus; das Gesetz, das vierhundertdreißig Jahre danach kam, hebt sie nicht auf. Die Schrift hat alles beschlossen unter die Sünde, damit die Verheißung durch den Glauben an Jesus Christus gegeben würde.',
  },
  trinity14: {
    gospel: 'Jesus heilt zehn Aussätzige; nur einer, ein Samariter, kehrt um und dankt.',
    epistle: 'Wandelt im Geist, so werdet ihr die Lüste des Fleisches nicht vollbringen; die Frucht des Geistes ist Liebe, Freude, Friede, Geduld, Freundlichkeit, Gütigkeit, Glaube, Sanftmut, Keuschheit.',
  },
  trinity15: {
    gospel: 'Niemand kann zwei Herren dienen, Gott und dem Mammon. Sorgt nicht um Essen und Kleidung: Seht die Vögel und die Lilien; trachtet am ersten nach dem Reich Gottes.',
    epistle: 'So wir im Geist leben, lasst uns auch im Geist wandeln: Einer trage des andern Last; was der Mensch sät, das wird er ernten. Lasst uns Gutes tun an jedermann, allermeist an des Glaubens Genossen.',
  },
  trinity16: {
    gospel: 'Vor dem Tor von Nain begegnet Jesus dem Leichenzug des einzigen Sohnes einer Witwe; er sagt: Weine nicht, und ruft den Jüngling ins Leben zurück. Gott hat sein Volk heimgesucht.',
    epistle: 'Paulus beugt seine Knie und betet, dass Christus durch den Glauben in den Herzen wohne und sie seine Liebe erkennen, die alle Erkenntnis übertrifft.',
  },
  trinity17: {
    gospel: 'Am Sabbat heilt Jesus im Haus eines Obersten der Pharisäer einen Wassersüchtigen; den Gästen sagt er: Wer sich selbst erhöht, der soll erniedrigt werden, und wer sich selbst erniedrigt, der soll erhöht werden.',
    epistle: 'Wandelt würdig eurer Berufung, in Demut, Sanftmut und Geduld; vertragt einer den andern in der Liebe und haltet die Einigkeit im Geist: ein Leib, ein Geist, ein Herr, ein Glaube, eine Taufe, ein Gott.',
  },
  trinity18: {
    gospel: 'Nach dem vornehmsten Gebot gefragt, nennt Jesus die Liebe zu Gott und die Liebe zum Nächsten; dann fragt er die Pharisäer: Wie dünkt euch um Christus? Wie kann er Davids Sohn sein, wenn David ihn seinen Herrn nennt?',
    epistle: 'Paulus dankt für die Gnade in Korinth: Gott ist treu und wird die Gemeinde fest erhalten bis ans Ende.',
  },
  trinity19: {
    gospel: 'Man bringt Jesus einen Gichtbrüchigen; er spricht: Sei getrost, deine Sünden sind dir vergeben – und damit ihr wisst, dass er Macht hat, Sünden zu vergeben: Stehe auf und gehe heim.',
    epistle: 'Legt den alten Menschen ab und zieht den neuen an: Legt die Lüge ab und redet die Wahrheit, lasst die Sonne nicht über eurem Zorn untergehen; wer gestohlen hat, arbeite und gebe dem Dürftigen.',
  },
  trinity20: {
    gospel: 'Ein König lädt zur Hochzeit seines Sohnes; die Geladenen verachten es, und er lädt, wen man auf den Straßen findet. Einer ohne hochzeitliches Kleid wird hinausgeworfen: Viele sind berufen, aber wenige auserwählt.',
    epistle: 'Seht zu, wie ihr vorsichtig wandelt, und kauft die Zeit aus; sauft euch nicht voll Wein, sondern werdet voll Geistes, singt dem Herrn in euren Herzen und sagt Dank allezeit für alles.',
  },
  trinity21: {
    gospel: 'Ein Königischer bittet Jesus, seinen sterbenden Sohn zu heilen; Jesus spricht: Gehe hin, dein Sohn lebt. Er glaubt dem Wort, und zur selben Stunde wird der Sohn gesund.',
    epistle: 'Zieht die Waffenrüstung Gottes an: Wahrheit, Gerechtigkeit, Glauben, das Heil und das Schwert des Geistes, das Wort Gottes.',
  },
  trinity22: {
    gospel: 'Ein König erlässt seinem Knecht eine unermessliche Schuld; der aber würgt seinen Mitknecht um eine kleine Schuld. So wird auch der Vater tun, wenn ihr nicht von Herzen vergebt.',
    epistle: 'Paulus dankt für die Gemeinde und ist gewiss: Der das gute Werk angefangen hat, wird es auch vollenden.',
  },
  trinity23: {
    gospel: 'Gefragt nach der Steuer, antwortet Jesus: Gebt dem Kaiser, was des Kaisers ist, und Gott, was Gottes ist.',
    epistle: 'Unser Wandel ist im Himmel; von dort warten wir auf den Heiland, der unseren nichtigen Leib verklären wird.',
  },
  trinity24: {
    gospel: 'Jesus erweckt die Tochter eines Obersten; unterwegs wird eine kranke Frau gesund, die im Glauben den Saum seines Kleides anrührt.',
    epistle: 'Paulus bittet, dass sie erfüllt werden mit der Erkenntnis des Willens Gottes und würdig wandeln; Gott hat uns errettet von der Obrigkeit der Finsternis und versetzt in das Reich seines lieben Sohnes.',
  },
  thirdLast: {
    gospel: 'Jesus kündigt eine große Trübsal an und warnt vor falschen Christussen und falschen Propheten: Seine Zukunft wird sein wie der Blitz, der vom Aufgang bis zum Niedergang scheint.',
    epistle: 'Trauert nicht wie die andern, die keine Hoffnung haben: Die da entschlafen sind, wird Gott durch Jesus mit ihm führen; der Herr wird kommen, und wir werden bei dem Herrn sein allezeit. Tröstet euch mit diesen Worten.',
  },
  secondLast: {
    gospel: 'Beim Weltgericht scheidet der König die Völker: Was ihr einem dieser Geringsten getan habt, das habt ihr mir getan.',
    epistle: 'Spötter fragen: Wo ist die Verheißung seiner Zukunft? Ein Tag ist vor dem Herrn wie tausend Jahre; er hat Geduld und will, dass sich jedermann zur Buße kehre. Wir warten auf einen neuen Himmel und eine neue Erde.',
  },
  eternity: {
    gospel: 'Zehn Jungfrauen warten auf den Bräutigam; nur die klugen haben Öl und gehen mit ihm zur Hochzeit: Wachet.',
    epistle: 'Der Tag des Herrn kommt wie ein Dieb in der Nacht; ihr aber seid Kinder des Lichts. Lasst uns wachen und nüchtern sein, angetan mit dem Panzer des Glaubens und der Liebe und mit dem Helm der Hoffnung zur Seligkeit.',
  },
};
