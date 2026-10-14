"""Die Ordnung (Gebetsanleitung) pages S. 8-15, texts verbatim from tagzeiten-morgen-und-abend.pdf."""

def br(*ls):
    return "<br>".join(ls)

def lit(*ls, cite=None, cls=""):
    c = f"<cite>{cite}</cite>" if cite else ""
    return f'<div class="lit {cls}">{br(*ls)}{c}</div>'

def run(*ls, cite=None):
    return lit(" ".join(ls), cite=cite, cls="run")

def va(*pairs):
    return "".join(f'<div class="va"><b>{w}</b><span>{t}</span></div>' for w, t in pairs)

def sub(t, em=""):
    e = f"<em>{em}</em>" if em else ""
    return f'<div class="sub">{t}{e}</div>'

def secx(no, title, m=""):
    n = f'<span class="no">{no}</span>' if no else ""
    mm = f'<span class="m">{m}</span>' if m else ""
    return f'<div class="sec">{n}<span class="t">{title}</span>{mm}</div>'

def rb(t):
    return f'<p class="rb">{t}</p>'

def txt(t):
    return f'<p class="txt o">{t}</p>'

GLORIA = lit("Ehre sei dem Vater und dem Sohn und dem Heiligen Geist,", "wie im Anfang, so auch jetzt und alle Zeit",
             "und in Ewigkeit. Amen.")
GLORIA_REF = lit("Ehre sei dem Vater …", cls="ref")

def pstable(rows):
    h = '<div class="pst"><span class="th">Tag</span><span class="th">Ps.</span><span class="th">Antiphon</span>'
    for d, p, a in rows:
        h += f'<span class="d">{d}</span><span class="p">{p}</span><span>{a}</span>'
    return h + "</div>"

PS_M = [("Montag", "63", "Gott, du bist mein Gott; frühe suche ich dich."),
        ("Dienstag", "5", "HERR, frühe wollest du meine Stimme hören."),
        ("Mittwoch", "36", "Bei dir ist die Quelle des Lebens, und in deinem Licht sehen wir das Licht."),
        ("Donnerstag", "57", "Wache auf, meine Ehre, wache auf, Psalter und Harfe!"),
        ("Freitag", "51", "Schaffe in mir, Gott, ein reines Herz."),
        ("Samstag", "92", "Des Morgens deine Gnade und des Nachts deine Wahrheit verkündigen."),
        ("Sonntag", "118", "Dies ist der Tag, den der HERR macht; laßt uns freuen und fröhlich darin sein.")]
PS_A = [("Montag", "141", "Mein Gebet steige vor dir auf wie ein Räuchopfer."),
        ("Dienstag", "121", "Meine Hilfe kommt vom HERRN, der Himmel und Erde gemacht hat."),
        ("Mittwoch", "130", "Bei dem HERRN ist die Gnade und viel Erlösung bei ihm."),
        ("Donnerstag", "23", "Der HERR ist mein Hirte, mir wird nichts mangeln."),
        ("Freitag", "51", "Schaffe in mir, Gott, ein reines Herz."),
        ("Samstag", "84", "Wie lieblich sind deine Wohnungen, HERR Zebaoth."),
        ("Sonntag", "103", "Lobe den HERRN, meine Seele, und vergiß nicht, was er dir Gutes getan hat.")]

VATERUNSER = lit("Vater unser im Himmel.", "Geheiligt werde dein Name.", "Dein Reich komme.",
                 "Dein Wille geschehe, wie im Himmel, so auf Erden.", "Unser tägliches Brot gib uns heute.",
                 "Und vergib uns unsere Schuld,", "wie auch wir vergeben unsern Schuldigern.",
                 "Und führe uns nicht in Versuchung,", "sondern erlöse uns von dem Bösen.",
                 "Denn dein ist das Reich und die Kraft", "und die Herrlichkeit in Ewigkeit. Amen.")

BESCHLUSS = va(("V", "Lasset uns preisen den Herrn."), ("A", "Gott sei ewiglich Dank."),
               ("V", "Es segne und behüte uns der allmächtige und barmherzige Gott, Vater, Sohn und Heiliger Geist."),
               ("A", "Amen."))

TAUFE = (lit("Ich bin getauft auf den Namen des Vaters und des Sohnes", "und des Heiligen Geistes.") +
         lit("Der alte Adam in mir soll durch tägliche Reue und Buße ersäuft werden",
             "und sterben mit allen Sünden und bösen Lüsten,",
             "und täglich soll wieder herauskommen und auferstehen der neue Mensch,",
             "der in Gerechtigkeit und Reinheit vor Gott ewiglich lebe. Amen."))


def o8():
    return f"""
<header class="ph"><h2 class="pt"><small>Die Ordnung</small>Am Morgen</h2><div class="pm"><span class="pl" style="padding:0">fünfundvierzig Minuten</span></div></header>
{secx("", "Vor der Stille Zeit", "3 Min. · am Bett")}
{rb("Gleich nach dem Aufstehen, noch bevor der Tag anfängt. Die Stille Zeit beginnt danach, am Tisch.")}
{sub("Kreuzzeichen", "Bekreuzige dich und sprich:")}
{lit("Das walte Gott Vater, Sohn und Heiliger Geist. Amen.")}
{sub("Vaterunser", "S. 11")}
{sub("Taufgedächtnis", "Bekreuzige dich noch einmal:")}
{TAUFE}
{sub("Morgensegen", "Luther, Kleiner Katechismus")}
{lit("Ich danke dir, mein himmlischer Vater,", "durch Jesus Christus, deinen lieben Sohn,",
     "daß du mich diese Nacht vor allem Schaden und Gefahr behütet hast,",
     "und bitte dich, du wollest mich diesen Tag auch behüten", "vor Sünden und allem Übel,",
     "daß dir all mein Tun und Leben gefalle.", "Denn ich befehle mich, meinen Leib und Seele und alles in deine Hände.",
     "Dein heiliger Engel sei mit mir,", "daß der böse Feind keine Macht an mir finde. Amen.")}
{secx("1", "Eröffnung", "3 Min.")}
{va(("V", "Herr, tue meine Lippen auf,"), ("A", "daß mein Mund deinen Ruhm verkündige."))}
{va(("V", "O Gott, komm mir zu Hilfe."), ("A", "Herr, eile, mir zu helfen."))}
{lit("Ehre sei dem Vater und dem Sohn und dem Heiligen Geist,", "wie im Anfang, so auch jetzt und alle Zeit", "und in Ewigkeit. Amen.", "Halleluja.")}
{rb("In der Passionszeit entfällt das Halleluja.")}
{sub("Hymnus", "wahlweise, eine Strophe")}
{lit("Die helle Sonn leucht jetzt herfür,", "fröhlich vom Schlaf aufstehen wir;", "Gott Lob, der uns in dieser Nacht", "behüt hat vor des Teufels Macht.")}
<p class="pr">Nikolaus Herman, 1560. Oder Aus meines Herzens Grunde (Georg Niege, 1592), oder Wach auf, mein Herz, und singe (Paul Gerhardt, 1647).</p>
"""


def o9():
    return f"""
{sub("Psalm", "des Wochentages, mit seiner Antiphon")}
{rb("Er gehört nicht zur Bibellese und wird nicht ausgelegt – er wird gebetet.")}
{pstable(PS_M)}
{GLORIA_REF}
{rb("Die Antiphon wird wiederholt.")}
{secx("2", "Das Wort", "20 Min. · nach Hanniel Strebel")}
{sub("Eingangsgebet", "Die Lesung beginnt und endet im Gebet.")}
{lit("Öffne mir die Augen,", "daß ich sehe die Wunder an deinem Gesetz.", cite="Psalm 119,18")}
{sub("Die Portion")}
{txt("Dem Leseplan folgen, nicht der Stimmung. Ein bis zwei Kapitel aus dem Alten Testament und eines aus dem Neuen. Lieber weniger und dreimal gelesen als mehr und einmal.")}
{sub("Dreimal lesen")}
{txt("<b>Erster Gang:</b> durchlesen, ohne Stift. Was steht da?<br><b>Zweiter Gang:</b> mit Stift. Markieren nach dem Farbcode, Randzeichen setzen.<br><b>Dritter Gang:</b> die Hauptaussage innerlich zusammenfassen. Pro Kapitel einen Vers auswählen und sich einprägen.")}
{sub("Die Doppelfrage", "nach jedem Text, ohne Ausnahme")}
{lit("Was lerne ich hier über Gott?", "Was lerne ich hier über den Menschen?")}
{sub("Die heilsgeschichtliche Brille")}
{txt("Wo steht der Text im Panorama von Schöpfung, Fall, Erlösung und Vollendung? Worauf weist er hin, wenn er auf Christus weist?")}
{sub("Die sieben Fragen", "eine, abhängig vom Text")}
<ol class="q7"><li>Was sagt der Text?</li><li>Was bedeutete er für die ersten Leser?</li><li>Was lehrt er über Gott?</li><li>Was über den Menschen?</li><li>Was erwartet er von mir?</li><li>Wie verändert das meinen Umgang mit anderen?</li><li>Wozu treibt er mich im Gebet?</li></ol>
{rb("Was heute offenbleibt, bleibt offen. Fragezeichen an den Rand, weiterlesen.")}
{sub("Schlußgebet")}
{lit("Herr, du hast geredet.", "Laß dein Wort nicht leer zurückkommen,", "sondern tun, wozu du es gesandt hast. Amen.", cite="nach Jesaja 55,11")}
"""


def o10():
    kranz = [("1", "Unterricht", "Was sagst du mir hier?", "Herr, du sagst mir in diesem Wort …"),
             ("2", "Danksagung", "Welche Gabe steckt darin?", "Ich danke dir, daß …"),
             ("3", "Beichte", "Wo stehe ich dagegen?", "Ich bekenne dir, daß ich …"),
             ("4", "Bitte", "Was folgt daraus?", "Darum bitte ich dich …")]
    kz = '<div class="kz">' + "".join(
        f'<span class="kn">{n}</span><span><b>{t}</b> – {q}<i>{p}</i></span>' for n, t, q, p in kranz) + "</div>"
    bened = [
        "Gelobt sei der Herr, der Gott Israels, denn er hat besucht und erlöst sein Volk",
        "und hat uns aufgerichtet ein Horn des Heils in dem Hause seines Dieners David,",
        "wie er vorzeiten geredet hat durch den Mund seiner heiligen Propheten:",
        "daß er uns errettete von unsern Feinden und von der Hand aller, die uns hassen,",
        "und Barmherzigkeit erzeigte unsern Vätern und gedächte an seinen heiligen Bund,",
        "daß wir, erlöst aus der Hand unserer Feinde, ihm dienten ohne Furcht unser Leben lang in Heiligkeit und Gerechtigkeit, die ihm gefällig ist.",
        "Und du, Kindlein, wirst ein Prophet des Höchsten heißen; du wirst vor dem Herrn hergehen, daß du seinen Weg bereitest",
        "und Erkenntnis des Heils gebest seinem Volk, die da ist in Vergebung ihrer Sünden,",
        "durch die herzliche Barmherzigkeit unseres Gottes, durch welche uns besucht hat der Aufgang aus der Höhe,",
        "auf daß er erscheine denen, die da sitzen in Finsternis und Schatten des Todes, und richte unsere Füße auf den Weg des Friedens."]
    return f"""
{secx("3", "Das Gebet", "12 Min. · in eigenen Worten")}
{sub("Der Stoff", "eines von beiden, nicht beides")}
{txt("Der Vers aus der Lesung – der, den du dir eben eingeprägt hast. Oder das Katechismusstück nach dem Wochenplan – ein Gebot, ein Artikel, eine Bitte.")}
{rb("Hat die Lesung dich getroffen, bleib beim Vers. War sie spröde, nimm den Katechismus.")}
{sub("Der vierfache Kranz", "etwa sechs Minuten, halblaut, nicht nur gedacht")}
{kz}
{rb("Luther: Wenn der Heilige Geist mitten hinein zu predigen anfängt und Gedanken schenkt, die reicher sind als die Ordnung, dann laß die Ordnung fahren und höre zu.")}
{sub("Freies Gebet", "etwa fünf Minuten")}
{txt("Jetzt, was dich selbst bewegt – ohne Vorlage. Sorge und Freude, eine Entscheidung, die ansteht, eine Last, die du trägst, Bitte für dich selbst. Auch Klage: die Psalmen geben dir die Erlaubnis dazu.")}
{sub("Stille", "eine Minute")}
{lit("Sei stille dem HERRN und warte auf ihn.", cite="Psalm 37,7")}
{secx("4", "Die Antwort", "5 Min.")}
{sub("Benedictus", "Antiphon: Gelobt sei der Herr, der Gott Israels.")}
{"".join(run(s) for s in bened)}
{GLORIA_REF}
"""


def o11():
    kf = [("1", "Versikel, Gloria, Psalm des Tages", "3"), ("2", "Lesung – einmal durch, ein Vers, Doppelfrage", "10"),
          ("3", "Freies Gebet über den Vers", "3"), ("4", "Vaterunser", "1"), ("5", "Die drei Dinge", "2"), ("6", "Segen", "1")]
    kft = '<div class="kft">' + "".join(f'<span class="d">{a}</span><span>{b}</span><span class="m">{c}</span>' for a, b, c in kf) + "</div>"
    return f"""
{sub("Fürbitte")}
{va(("V", "Kyrie eleison."), ("A", "Christe eleison. Kyrie eleison."))}
{txt("Nach der Gebetsübersicht (S. 3): das Anliegen des Wochentages und die Menschen, denen du heute begegnen wirst – namentlich, kurz.")}
{sub("Vaterunser")}
{VATERUNSER}
{secx("5", "Die Ausrichtung", "3 Min. · die drei Dinge")}
{txt("Jetzt, und erst jetzt, wird der Tag angesehen. Drei Dinge, nicht mehr – eines aus jedem Bereich: das Wort, das Haus, das Werk. Beobachtbar, nicht gesinnungsmäßig: etwas, das man abends mit Ja oder Nein beantworten kann.")}
{secx("6", "Der Segen", "2 Min.")}
{sub("Kollekte")}
{lit("Herr Gott, himmlischer Vater,", "der du uns diesen Tag geschenkt hast:", "Wir bitten dich, regiere uns durch deinen Heiligen Geist,",
     "daß wir in unserem Beruf treu seien,", "unserm Nächsten dienen", "und nichts tun, was dir mißfällt,",
     "durch Jesus Christus, deinen Sohn, unsern Herrn. Amen.")}
{sub("Beschluß")}
{BESCHLUSS}
{rb("Und dann, wie Luther schreibt: mit Freuden an dein Werk gegangen.")}
{sub("Kurzform am Morgen", "zwanzig Minuten")}
{kft}
{rb("Und wenn auch zwanzig nicht gehen: Vaterunser und Morgensegen am Bett. Dann ist es genug.")}
"""


def o12():
    return f"""
<header class="ph"><h2 class="pt"><small>Die Ordnung</small>Am Abend</h2><div class="pm"><span class="pl" style="padding:0">zwanzig Minuten</span></div></header>
{secx("1", "Vesper", "10 Min. · beim Abendessen, mit der Familie")}
{rb("Gebet der Kirche, nicht Selbstprüfung. Kurzform für die Familie: Lied – Psalm im Wechsel – kurze Lesung – Vaterunser – Segen. Fünf Minuten. Die Kinder können die Antiphon sprechen.")}
{sub("Eröffnung")}
{va(("V", "O Gott, komm mir zu Hilfe."), ("A", "Herr, eile, mir zu helfen."))}
{lit("Ehre sei dem Vater … Halleluja.", cls="ref")}
{sub("Hymnus", "Christe, du bist der helle Tag – Erasmus Alber, 1556")}
<div class="two">{lit("Christe, du bist der helle Tag,", "vor dir die Nacht nicht bleiben mag;", "du leuchtest uns vom Vater her", "und bist des Lichtes Prediger.")}{lit("Ach lieber Herr, behüte uns", "in dieser Nacht vor allem Bös,", "laß uns in dir ruhen fein", "und vor dem Feind behütet sein.")}</div>
<p class="pr">Oder: Nun ruhen alle Wälder (Paul Gerhardt, 1647), Str. 1, 8 und 9.</p>
{sub("Psalm", "Antiphon: Mein Gebet steige vor dir auf wie ein Räuchopfer, und meiner Hände Aufheben wie ein Abendopfer.")}
{lit("HERR, ich rufe zu dir, eile zu mir;", "vernimm meine Stimme, wenn ich dich anrufe.")}
{lit("Mein Gebet müsse vor dir gelten wie ein Räuchopfer,", "mein Händeaufheben wie ein Abendopfer.")}
{lit("HERR, behüte meinen Mund", "und bewahre die Tür meiner Lippen.")}
{lit("Neige mein Herz nicht auf etwas Böses,", "ein gottloses Wesen zu führen mit den Übeltätern.")}
{lit("Denn auf dich, HERR Herr, sehen meine Augen;", "ich traue auf dich, verstoße meine Seele nicht.", cite="Psalm 141")}
{GLORIA_REF}
{sub("Psalmenreihe für die Woche")}
{pstable(PS_A)}
"""


def o13():
    magn = ["Meine Seele erhebt den Herrn, und mein Geist freuet sich Gottes, meines Heilandes;",
            "denn er hat die Niedrigkeit seiner Magd angesehen. Siehe, von nun an werden mich selig preisen alle Kindeskinder.",
            "Denn er hat große Dinge an mir getan, der da mächtig ist und dessen Name heilig ist.",
            "Und seine Barmherzigkeit währet immer für und für bei denen, die ihn fürchten.",
            "Er übet Gewalt mit seinem Arm und zerstreut, die hoffärtig sind in ihres Herzens Sinn.",
            "Er stößt die Gewaltigen vom Stuhl und erhebt die Niedrigen.",
            "Die Hungrigen füllt er mit Gütern und läßt die Reichen leer.",
            "Er denkt der Barmherzigkeit und hilft seinem Diener Israel auf, wie er geredet hat unsern Vätern, Abraham und seinem Samen ewiglich."]
    return f"""
{sub("Lesung", "ein kurzer Abschnitt, ohne Auslegung")}
{txt("Nicht die Bibellese vom Morgen – die ist erledigt. Hier genügen wenige Verse, gern das Evangelium des Sonntags.")}
{va(("V", "Gott sei ewiglich Dank."))}
{sub("Magnificat", "Antiphon: Meine Seele erhebt den Herrn.")}
{"".join(run(s) for s in magn)}
{GLORIA_REF}
{rb("Das Magnificat deutet den Tag von Gottes Handeln her, bevor du ihn im Nachtgebet von deinem her prüfst.")}
{sub("Fürbitten und Vaterunser")}
{va(("V", "Kyrie eleison."), ("A", "Christe eleison. Kyrie eleison."))}
{txt("Freie Fürbitte: für die Gemeinde, für Obrigkeit und Frieden, für Kranke und Trauernde, für das eigene Haus. Dann das Vaterunser (S. 11).")}
{sub("Kollekte und Segen")}
{lit("Herr Gott, himmlischer Vater,", "der du die Nacht gemacht hast, daß der Mensch ruhe:",
     "Wir bitten dich, vergib uns, was wir heute gefehlt haben,", "behüte uns diese Nacht",
     "und laß uns morgen fröhlich aufstehen zu deinem Dienst,", "durch Jesus Christus, deinen Sohn, unsern Herrn. Amen.")}
{BESCHLUSS}
"""


def o14():
    return f"""
{secx("2", "Nachtgebet", "10 Min. · gegen 20:45, am Bett")}
{rb("Kurzform an müden Tagen: Kreuzzeichen – Rückschau (drei Zeichen) – Vaterunser – Abendsegen. Das genügt vollkommen.")}
{sub("1 · Kreuzzeichen")}
{lit("Das walte Gott Vater, Sohn und Heiliger Geist. Amen.")}
{sub("2 · Glaubensbekenntnis")}
{lit("Ich glaube an Gott, den Vater, den Allmächtigen,", "Schöpfer des Himmels und der Erde.")}
{lit("Und an Jesus Christus,", "seinen eingeborenen Sohn, unsern Herrn,", "empfangen durch den Heiligen Geist,",
     "geboren von der Jungfrau Maria,", "gelitten unter Pontius Pilatus,", "gekreuzigt, gestorben und begraben,",
     "hinabgestiegen in das Reich des Todes,", "am dritten Tage auferstanden von den Toten,", "aufgefahren in den Himmel;",
     "er sitzt zur Rechten Gottes, des allmächtigen Vaters;", "von dort wird er kommen, zu richten die Lebenden und die Toten.")}
{lit("Ich glaube an den Heiligen Geist,", "die heilige christliche Kirche,", "Gemeinschaft der Heiligen,",
     "Vergebung der Sünden,", "Auferstehung der Toten", "und das ewige Leben. Amen.")}
{sub("3 · Vaterunser", "S. 11")}
{rb("Luther stellt Glaube und Vaterunser voran. Der Tag wird nicht an deinem Gewissen gemessen, sondern an dem, was bekannt und gebetet wird.")}
{sub("4 · Dank", "zwei oder drei Dinge dieses Tages")}
{lit("Ich danke dir, mein Gott, für …")}
{sub("5 · Rückschau", "Rechenschaft, nicht Beichte")}
{txt("Die drei Dinge vom Morgen vorlesen. Zu jedem ein Zeichen setzen, ohne Kommentar: <b>+</b> geschehen · <b>~</b> angefangen · <b>–</b> nicht geschehen. Kein Nachtreten, keine Erklärung. Das Zeichen steht, und damit ist der Punkt erledigt.")}
{txt("Was mit einem Minus geschieht – du entscheidest sofort: <b>Morgen wieder.</b> Es war richtig, es kam nur nicht dazu. <b>Fallenlassen.</b> Es war heute morgen wichtig und ist es nicht mehr. <b>In die Beichte.</b> Nur wenn wirklich ein Gebot dahintersteht – wenn du jemanden im Stich gelassen hast, nicht wenn du eine Aufgabe nicht geschafft hast.")}
"""


def o15():
    st = [("Als Ehemann:", "Habe ich meine Frau heute geehrt, oder nur verwaltet?"),
          ("Als Vater:", "Habe ich meine Kinder heute gesehen, oder nur beaufsichtigt?"),
          ("Als Mitarbeiter und Kollege:", "War ich treu in dem, was mir anvertraut ist? Habe ich über andere geredet, wie ich möchte, daß über mich geredet wird?"),
          ("Als Prediger und Bruder in der Gemeinde:", "Habe ich Gottes Wort heute geachtet und gern gehört? Habe ich gedient oder mich dargestellt?"),
          ("Als Nächster:", "Wem bin ich heute begegnet, dem ich schuldig geblieben bin?")]
    sth = "".join(f'<p class="txt o st"><b>{a}</b> {q}</p>' for a, q in st)
    return f"""
{sub("6 · Prüfung am Dekalog in deinem Stand", "wo bin ich schuldig geblieben?")}
{txt("Nicht Stimmungen abklopfen, sondern das Amt befragen, das dir gegeben ist. Eine Frage genügt; der Stand des Wochentages steht auf der Wochenseite.")}
{sth}
<p class="pr">Haustafel: Ehemann 1. Petr 3,7; Kol 3,19 · Vater Eph 6,4; Kol 3,21 · Mitarbeiter Eph 6,5–9 · Prediger 1. Tim 3,2–6; Tit 1,9 · Nächster Röm 13,9</p>
{sub("7 · Bekenntnis und Zuspruch")}
{lit("Ich armer, elender Sünder bekenne dir alle meine Sünde und Missetat,", "die ich begangen habe mit Gedanken, Worten und Werken,",
     "womit ich dich erzürnt und deine Strafe verdient habe.", "Sie sind mir leid, und ich bitte um Gnade.",
     "Und was ich nicht erkenne, das erkennst du:", "vergib mir auch das, um deines Sohnes Jesu Christi willen.")}
{rb("Dann sprich dir laut zu – laut, nicht gedacht:")}
{lit("So wir aber unsere Sünde bekennen, so ist er treu und gerecht,", "daß er uns die Sünde vergibt und reinigt uns von aller Untugend.", cite="1. Johannes 1,9")}
{rb("Dieser Schritt ist der entscheidende. Ohne ihn wird die ganze Ordnung Gesetz.")}
{sub("8 · Taufgedächtnis", "wie am Morgen, S. 8")}
{sub("9 · Fürbitte")}
{txt("Die Menschen, die dir heute begegnet sind. Namentlich, nicht als Gruppe. Dann Frau, Kinder, Gemeinde.")}
{sub("10 · Nunc dimittis", "wahlweise")}
{run("Herr, nun lässest du deinen Diener in Frieden fahren, wie du gesagt hast; denn meine Augen haben deinen Heiland gesehen, welchen du bereitet hast vor allen Völkern, ein Licht, zu erleuchten die Heiden, und zum Preis deines Volkes Israel.")}
{sub("11 · Abendsegen", "Luther, Kleiner Katechismus")}
{lit("Ich danke dir, mein himmlischer Vater,", "durch Jesus Christus, deinen lieben Sohn,", "daß du mich diesen Tag gnädiglich behütet hast,",
     "und bitte dich, du wollest mir vergeben alle meine Sünde,", "wo ich Unrecht getan habe,", "und mich diese Nacht auch gnädiglich behüten.",
     "Denn ich befehle mich, meinen Leib und Seele und alles in deine Hände.", "Dein heiliger Engel sei mit mir,",
     "daß der böse Feind keine Macht an mir finde. Amen.")}
{rb("Und dann, wie Luther schreibt: flugs und fröhlich geschlafen.")}
"""

ORD_CSS = r"""
/* Die Ordnung: liturgical typesetting */
.ord .in{font-size:calc(2.55 * var(--mm));line-height:1.36}
.ord .sec{margin-top:calc(2.8 * var(--mm))}
.ord .sub{margin-top:calc(2.1 * var(--mm))}
.ord .rb{margin:calc(.6 * var(--mm)) 0 0}
.ord .pr{margin-top:calc(.6 * var(--mm))}
.lit{margin:calc(.7 * var(--mm)) 0 0 calc(3.5 * var(--mm));font-size:calc(2.55 * var(--mm));line-height:1.36}
.lit.run{text-indent:calc(-2 * var(--mm));padding-left:calc(2 * var(--mm));margin-top:calc(.45 * var(--mm))}
.lit.ref{color:var(--ink-2);font-style:italic}
.lit cite{display:block;font:600 calc(1.95 * var(--mm)) var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--rubric);font-style:normal;margin-top:calc(.4 * var(--mm))}
.va{display:grid;grid-template-columns:calc(3.5 * var(--mm)) minmax(0,1fr);margin-top:calc(.35 * var(--mm));font-size:calc(2.55 * var(--mm));line-height:1.36}
.va b{font:700 calc(2.25 * var(--mm)) var(--sans);color:var(--rubric);padding-top:calc(.2 * var(--mm))}
.txt.o{margin-top:calc(.6 * var(--mm));font-size:calc(2.55 * var(--mm));line-height:1.4}
.txt.st{margin-top:calc(.35 * var(--mm))}
.txt b{font-weight:600}
.pst{display:grid;grid-template-columns:calc(17 * var(--mm)) calc(7 * var(--mm)) minmax(0,1fr);margin:calc(1 * var(--mm)) 0 0 calc(3.5 * var(--mm));font-size:calc(2.45 * var(--mm));line-height:1.3}
.pst > span{border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--line);padding:calc(.55 * var(--mm)) 0}
.pst .th{font:700 calc(1.9 * var(--mm)) var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);border-bottom-color:var(--ink-3)}
.pst .d{font:600 calc(2.2 * var(--mm)) var(--sans);color:var(--ink-2)}
.pst .p{font-variant-numeric:tabular-nums}
.q7{margin:calc(.6 * var(--mm)) 0 0 calc(3.5 * var(--mm));padding-left:calc(3.5 * var(--mm));columns:2;column-gap:calc(5 * var(--mm));font-size:calc(2.45 * var(--mm));line-height:1.36}
.q7 li{break-inside:avoid}
.q7 li::marker{font:600 calc(2.1 * var(--mm)) var(--sans);color:var(--rubric)}
.kz{display:grid;grid-template-columns:calc(3.5 * var(--mm)) minmax(0,1fr);row-gap:calc(.9 * var(--mm));margin-top:calc(.8 * var(--mm))}
.kz .kn{font:700 calc(2.25 * var(--mm)) var(--sans);color:var(--rubric);padding-top:calc(.2 * var(--mm))}
.kz b{font-weight:600}
.kz i{display:block;color:var(--ink-2)}
.two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
.kft{display:grid;grid-template-columns:calc(3.5 * var(--mm)) minmax(0,1fr) calc(10 * var(--mm));margin:calc(.8 * var(--mm)) 0 0 calc(3.5 * var(--mm));font-size:calc(2.45 * var(--mm))}
.kft > span{border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--line);padding:calc(.4 * var(--mm)) 0}
.kft .d{font:700 calc(2.1 * var(--mm)) var(--sans);color:var(--rubric)}
.kft .m{text-align:right;color:var(--ink-3);font:600 calc(2.1 * var(--mm)) var(--sans)}
.kft .m::after{content:" Min."}
"""
