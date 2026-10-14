#!/usr/bin/env python3
"""Henoch im Kirchenjahr: sample pages for an undated church-year volume.

The book holds every Sunday a church year can have, from the 1st Sunday in Advent to the 27th Sunday
after Trinity. Each Sunday opens a week (Sunday spread with impulses on Gospel and Epistle, then
Monday to Saturday on one page each). Anyone can start at any Sunday; after the last Sunday the
book continues at Advent.

Run: python3 kirchenjahr.py (writes henoch-kirchenjahr.html and henoch-kirchenjahr-druck.html next to this file).
"""
import datetime as dt
import html
import math
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build as B  # noqa: E402
import ordnung as O  # noqa: E402
from build import hw, ln, lines, row, sec, c, b, page, spread, block  # noqa: E402

import texte  # noqa: E402

_adv, LOEHE, WS = texte.load()
ADV = {x["sonntag"]: x for x in _adv["sonntage"]}
ADV_QUELLE = _adv["quelle"]


def esc(t):
    return html.escape(t, quote=False)


D = dt.timedelta
V, W, G, R, S = "violett", "weiß", "grün", "rot", "schwarz"
LIT = {V: "#6E4A9E", W: "#F3EFE6", G: "#3F7F4F", R: "#A33A3A", S: "#2A2A2A"}

# ------------------------------------------------------------------ the Sundays (undated)

SUNDAYS = ([(f"{i}. Advent", V) for i in range(1, 5)]
           + [("1. So. n. d. Christfest", W), ("2. So. n. d. Christfest", W), ("1. So. n. Epiphanias", W)]
           + [(f"{i}. So. n. Epiphanias", G) for i in range(2, 6)] + [("Letzter So. n. Epiphanias", W)]
           + [("Septuagesimae", G), ("Sexagesimae", G), ("Estomihi", G)]
           + [(n, V) for n in ("Invokavit", "Reminiszere", "Okuli", "Lätare", "Judika", "Palmarum")]
           + [(n, W) for n in ("Ostersonntag", "Quasimodogeniti", "Miserikordias Domini", "Jubilate", "Kantate", "Rogate", "Exaudi")]
           + [("Pfingstsonntag", R), ("Trinitatis", W)]
           + [(f"{i}. So. n. Trinitatis", G) for i in range(1, 28)])
assert len(SUNDAYS) == 57
NAMES = [n for n, _ in SUNDAYS]
# feast spreads sit behind the week they fall in; the floating ones close the year
FEASTS_AFTER = {"4. Advent": "Christfest", "2. So. n. d. Christfest": "Epiphanias", "Palmarum": "Gründonnerstag und Karfreitag",
                "Rogate": "Himmelfahrt", "27. So. n. Trinitatis": "Michaelis, Erntedank, Reformationstag, Buß- und Bettag"}
FIRST = 20
WEEK_PAGES = 10  # Sunday 4 pages (Wort, Dieffenbach, Löhe, Der Sonntag), Monday to Saturday one page each


def folio_of(name):
    p = FIRST
    for n in NAMES:
        if n == name:
            return p
        p += WEEK_PAGES
        if n in FEASTS_AFTER:
            p += 4 if n == "27. So. n. Trinitatis" else 2
    raise KeyError(name)


YEAR_END = folio_of("27. So. n. Trinitatis") + WEEK_PAGES + 4 - 1
assert YEAR_END == 601, YEAR_END

# ------------------------------------------------------------------ Easter table


def easter(y):
    a = y % 19; bb = y // 100; cc = y % 100; d = bb // 4; e = bb % 4; f = (bb + 8) // 25; g = (bb - f + 1) // 3
    h = (19 * a + bb - d - g + 15) % 30; i = cc // 4; k = cc % 4; l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    return dt.date(y, (h + l - 7 * m + 114) // 31, ((h + l - 7 * m + 114) % 31) + 1)


def advent1(y):
    xmas = dt.date(y, 12, 25)
    return xmas - D(days=(xmas.weekday() + 1) % 7 or 7) - D(weeks=3)


def sundays_between(a, b_):
    d = a + D(days=(6 - a.weekday()) % 7)
    while d < b_:
        yield d
        d += D(days=7)


def year_row(k):
    e = easter(k + 1)
    sept = e - D(days=63)
    return (f"{k}/{str(k + 1)[2:]}", advent1(k), len(list(sundays_between(dt.date(k + 1, 1, 7), sept))), sept, e,
            e + D(days=49), len(list(sundays_between(e + D(days=57), advent1(k + 1)))))


def dm(d):
    return f"{d.day}.{d.month}."


def dot(col):
    return f'<i class="ld" style="background:{LIT[col]}"></i>'

# ------------------------------------------------------------------ pages


def p_kreis():
    cx = cy = 60.0
    r1, r0 = 50.0, 38.0
    seg = 360 / 57

    def pt(r, a):
        t = math.radians(a - 90)
        return cx + r * math.cos(t), cy + r * math.sin(t)

    paths = ""
    for i, (name, col) in enumerate(SUNDAYS):
        a0, a1 = i * seg + .3, (i + 1) * seg - .3
        p1, p2, p3, p4 = pt(r1, a0), pt(r1, a1), pt(r0, a1), pt(r0, a0)
        stroke = ' stroke="#B9B2A5" stroke-width=".25"' if col == W else ""
        paths += (f'<path d="M{p1[0]:.2f},{p1[1]:.2f} A{r1},{r1} 0 0 1 {p2[0]:.2f},{p2[1]:.2f} '
                  f'L{p3[0]:.2f},{p3[1]:.2f} A{r0},{r0} 0 0 0 {p4[0]:.2f},{p4[1]:.2f} Z" fill="{LIT[col]}"{stroke}><title>{name}</title></path>')
    seasons = [("Advent", 0, 4), ("Weihnachten", 4, 6), ("Epiphanias", 6, 12), ("Vorpassion", 12, 15), ("Passion", 15, 21),
               ("Ostern", 21, 28), ("Pfingsten", 28, 29), ("Trinitatiszeit", 30, 57)]
    labels = ""
    for t, s0, s1 in seasons:
        a = (s0 + s1) / 2 * seg
        x, y = pt(r1 + 4.4, a)
        anchor = "middle" if abs(x - cx) < 8 else ("start" if x > cx else "end")
        labels += f'<text x="{x:.2f}" y="{y + 1:.2f}" font-size="3" text-anchor="{anchor}" fill="#565D6B" font-weight="600">{t}</text>'
    center = ('<text x="60" y="56" font-size="4.6" text-anchor="middle" fill="#8C2F2F" font-family="Literata, Georgia, serif" font-weight="600">Kirchenjahr</text>'
              '<text x="60" y="62.5" font-size="3.4" text-anchor="middle" fill="#1D2330" font-family="Literata, Georgia, serif">57 Sonntage</text>'
              '<text x="60" y="68" font-size="2.3" text-anchor="middle" fill="#565D6B">1. Advent bis 27. So. n. Trinitatis</text>')
    svg = (f'<svg class="ring" viewBox="-14 -6 148 132" role="img" aria-label="Das Kirchenjahr als Kreis aus 57 Sonntagen in den liturgischen Farben">'
           f'{paths}{labels}{center}</svg>')
    legend = "".join(f'<span>{dot(col)}{t}</span>' for col, t in
                     [(V, "violett · Buße und Erwartung"), (W, "weiß · Christusfeste"), (G, "grün · Wachsen im Wort"),
                      (R, "rot · Geist und Kirche"), (S, "schwarz · Karfreitag")])
    inner = f"""
<header class="ph"><h2 class="pt">Das Kirchenjahr</h2></header>
{svg}
<div class="lg">{legend}</div>
<p class="txt">Das Buch hat keine Daten. Es enthält jeden Sonntag, den ein Kirchenjahr haben kann. Jeder Sonntag öffnet eine Woche: vier Seiten für den Sonntag mit Dieffenbach und Löhe, dann Montag bis Samstag.</p>
<p class="txt">Beginnen kannst du an jedem Sonntag. Nach dem 27. Sonntag nach Trinitatis geht es vorn beim 1. Advent weiter.</p>
"""
    return page("l", "18", "Seite 18: Das Kirchenjahr", inner, runner="Das Kirchenjahr")


def p_ostertafel():
    rows = ""
    for kj, a1, ne, sept, e, pf, nt in (year_row(k) for k in range(2026, 2036)):
        rows += (f'<span class="k">{kj}</span><span>{dm(a1)}</span><span class="n">{ne}</span><span>{dm(sept)}</span>'
                 f'<span><b>{dm(e)}</b></span><span>{dm(pf)}</span><span class="n">{nt}</span>')
    inner = f"""
<header class="ph"><h2 class="pt">Wann ist welcher Sonntag?</h2></header>
<p class="txt">Ostern wandert, und mit ihm die Sonntage von Septuagesimae bis zum Ende des Jahres. Die Tafel zeigt, wann ein Kirchenjahr beginnt, wo Ostern liegt und wie viele Sonntage nach Epiphanias und nach Trinitatis es hat.</p>
<div class="ot">
<span class="th">Kirchen&shy;jahr</span><span class="th">1. Advent</span><span class="th n">So. n. Epiph.</span><span class="th">Septua&shy;gesimae</span><span class="th">Ostern</span><span class="th">Pfingsten</span><span class="th n">So. n. Trin.</span>
{rows}
</div>
<p class="txt">Ein Jahr hat ein bis sechs Sonntage nach Epiphanias und 22 bis 27 nach Trinitatis. Die Seiten der Sonntage, die in einem Jahr ausfallen, bleiben frei für Notizen.</p>
{sec("", "Feste unter der Woche")}
<p class="txt">Christfest, Epiphanias, Gründonnerstag und Karfreitag sowie Himmelfahrt haben eine Doppelseite hinter ihrer Woche. Michaelis, Erntedank, Reformationstag und Buß- und Bettag stehen am Ende des Jahres, S. {YEAR_END - 3}–{YEAR_END}.</p>
"""
    return page("r", "19", "Seite 19: Ostertafel", inner, runner="Das Kirchenjahr")


def lektion_html(abs_):
    """Dieffenbach's paragraphs as the app shows them: without numbers, hymn verses set off."""
    out = ""
    for a in abs_:
        after_hymn = False
        for t in a["teile"]:
            if "zitat" in t:
                out += f'<p class="hym">{esc(t["zitat"])}</p>'
                after_hymn = True
            else:
                out += f'<p class="imp{" cont" if after_hymn else ""}">{esc(t["text"])}</p>'
                after_hymn = False
    return out


def p_so1():
    s = ADV["advent-1"]
    ws = WS["advent1"]
    lw = "".join(f'<div class="lw"><cite>{esc(x["bibelstelle"])}</cite>{esc(x["text"])}</div>' for x in s["leitworte"])
    inner = f"""
<header class="ph"><h2 class="pt"><small>Advent</small>1. Sonntag im Advent</h2>
<div class="pm"><div class="dline" style="width:calc(34 * var(--mm))"><span class="pl">Datum</span>{hw("29. 11. 2026")}</div><span class="lc">{dot(V)}violett</span></div></header>
<div class="vs ws">„{esc(ws["text"])}“<cite>Wochenspruch · {esc(ws["ref"])}</cite></div>
{sec("", "Bibellektion zum Evangelium", esc(s["bibelstelle"]))}
<h3 class="it">{esc(s["titel"])}</h3>
<p class="zus">{esc(s["zusatz"])}</p>
<div class="lws">{lw}</div>
{lektion_html(s["absaetze"][:3])}
"""
    f = folio_of("1. Advent")
    return page("l", str(f), f"Seite {f}: 1. Advent, Dieffenbach", inner, runner="Advent")


def p_so2():
    s = ADV["advent-1"]
    inner = f"""
{lektion_html(s["absaetze"][3:])}
<p class="quelle">{esc(ADV_QUELLE)}</p>
"""
    f = folio_of("1. Advent") + 1
    return page("r", str(f), f"Seite {f}: 1. Advent, Dieffenbach", inner, runner="Advent")


def p_so3():
    e = LOEHE["advent1"]
    paras = "".join(f'<p class="imp">{esc(x)}</p>' for x in e["absaetze"])
    inner = f"""
<header class="ph"><h2 class="pt"><small>Advent</small>Zur Epistel</h2><div class="pm"><span class="pl" style="padding:0">{esc(e["ref"])}</span></div></header>
{sec("", "Betrachtung von Wilhelm Löhe")}
<h3 class="it">{esc(e["titel"])}</h3>
{paras}
<p class="quelle">{esc(e["quelle"])}</p>
{sec("", "Am Tisch", "Sonntagabend, Vesper")}
<p class="ptext">[TEXT VON ANDREAS: Gedanke für den Tisch am Sonntagabend]</p>
{sec("", "Für die Woche")}
<p class="ptext">[TEXT VON ANDREAS: Frage für die Woche]</p>
{lines(2)}
"""
    f = folio_of("1. Advent") + 2
    return page("l", str(f), f"Seite {f}: 1. Advent, Löhe", inner, runner="Advent")


def marks(sel=None):
    return "".join(f'<span class="mk{" hc" if m == sel else ""}">{m}</span>' for m in ["+", "~", "–"])


def three(vals=("", "", ""), ms=(None, None, None)):
    return "".join(row(k, '<div class="lines"><div class="ln">' + hw(v) + '<span class="grow"></span>' + marks(m) + "</div></div>", kf=True)
                   for k, v, m in zip(["Wort", "Haus", "Werk"], vals, ms))


def p_sonntag_r():
    D7 = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
    hab = [("Stille Zeit", [1]), ("Vesper mit der Familie", [1]), ("Nachtgebet", [1]), ("Tischgebet mit der Familie", [1]),
           ("Die Kinder segnen", [1]), ("", [])]
    g = '<span class="h lft">Täglich</span>' + "".join(f'<span class="h">{d}</span>' for d in D7)
    for name, mk in hab:
        g += f'<span class="n">{name}</span>' + "".join(f'<span class="cc">{c(i < len(mk) and mk[i] == 1)}</span>' for i in range(7))
    weekly = [("Gottesdienst – den Feiertag heiligen", True), ("Katechismus mit den Kindern", False),
              ("Gemeinschaft mit Brüdern", False), ("Zeit allein mit meiner Frau", False), ("Wochenspruch auswendig", False)]
    w = "".join(f'<div class="it">{b(on)}<span>{n}</span></div>' for n, on in weekly)
    inner = f"""
<header class="ph"><h2 class="pt">Der Sonntag</h2></header>
{sec("", "Gottesdienst")}
{row("Wo, wann", lines(1, ["Gemeinde, 10 Uhr"]))}
{row("Predigttext", lines(1, ["Matthäus 21,1–9"]))}
{row("Was ich mitnehme", lines(3, ["Er kommt sanftmütig. Er kommt zu mir,", "nicht ich zu ihm."]))}
{row("Weitergegeben an", lines(1, ["beim Mittagessen an die Familie"]))}
{sec("", "Stille Zeit am Sonntag", "Kurzform · S. 13")}
{row("Lesung", '<div class="lines"><div class="ln"><span class="half"><span class="pl">AT</span>' + hw("2. Mose 2") + '</span><span class="half"><span class="pl">NT</span>' + hw("Matthäus 28") + "</span></div></div>", kf=True)}
{row("Vers", lines(1, ["Matthäus 28,20"]), kf=True)}
{three(("Wochenspruch auswendig lernen", "erste Kerze, Matthäus 21 am Tisch", "nichts: Sonntagsruhe"), ("+", "+", "+"))}
{sec("", "Diese Woche")}
<div class="hb">{g}</div>
<div class="wl two">{w}</div>
"""
    f = folio_of("1. Advent") + 3
    return page("r", str(f), f"Seite {f}: 1. Advent, Der Sonntag", inner, runner="Advent")


PS = {0: ("63", "141"), 1: ("5", "121")}
STAND = {0: ("Als Ehemann", "Habe ich meine Frau heute geehrt, oder nur verwaltet?"),
         1: ("Als Vater", "Habe ich meine Kinder heute gesehen, oder nur beaufsichtigt?")}
WD = ["Montag", "Dienstag"]


def p_tag(wd, side, folio, ex=None):
    e = ex or {}
    pm, pa = PS[wd]
    st, q = STAND[wd]
    lesung = ('<div class="lines"><div class="ln"><span class="half"><span class="pl">AT</span>' + hw(e.get("at", "")) +
              '</span><span class="half"><span class="pl">NT</span>' + hw(e.get("nt", "")) + "</span></div></div>")
    vers = ('<div class="lines"><div class="ln"><span class="pl">Stelle</span>' + hw(e.get("ref", "")) + "</div>" +
            ln(hw(e.get("vers", ""))) + "</div>")
    inner = f"""
<header class="ph"><h2 class="pt"><small>Woche des 1. Advent</small>{WD[wd]}</h2>
<div class="pm"><div class="dline" style="width:calc(40 * var(--mm))"><span class="pl">Datum</span>{hw(e.get("date", ""))}</div><span class="pl" style="padding:0">Psalm {pm} · abends {pa}</span></div></header>
{sec("", "Morgen", "S. 10–13")}
{row("Am Bett", '<div class="lines"><div class="ln">' + b(e.get("bett", False)) + '<span class="pi">Kreuzzeichen · Vaterunser · Taufgedächtnis · Morgensegen</span></div></div>')}
{row("Lesung", lesung, kf=True)}
{row("Hauptaussage", lines(1, [e.get("haupt", "")]))}
{row("Vers, den ich mitnehme", vers, kf=True)}
{row("Über Gott", lines(1, [e.get("gott", "")]), kf=True)}
{row("Über den Menschen", lines(1, [e.get("mensch", "")]), kf=True)}
{row('<span class="g">→</span>Umsetzen', lines(1, [e.get("um", "")]))}
{row("Katechismus", lines(1, [e.get("kat", "")]))}
{row("Dank · Bitte", lines(1, [e.get("gebet", "")]))}
{row("Beichte", '<div class="lines"><div class="ln" style="border-bottom-color:transparent"><span class="pi">Wird gebetet, nicht notiert.</span></div></div>')}
{row("Menschen heute", lines(1, [e.get("menschen", "")]))}
<div class="sub">Die drei Dinge<em>abends ein Zeichen: + geschehen · ~ angefangen · – nicht geschehen</em></div>
{three(e.get("three", ("", "", "")), e.get("marks", (None, None, None)))}
{sec("", "Abend", "S. 14–17")}
{row("Vesper", '<div class="lines"><div class="ln">' + b(e.get("vesper", False)) + '<span class="pi">Lesung: Matthäus 21,1–9, das Evangelium des Sonntags</span></div></div>')}
{row("Fürbitte", lines(1, [e.get("fb", "")]))}
{row("Dank", lines(2, [e.get("dank", "")]))}
<div class="sub">Prüfung<em>{st}: {q}</em></div>
<div class="silent sm">Wird gebetet, nicht notiert.</div>
<div class="vs" style="margin-top:calc(1.2 * var(--mm))">So wir aber unsere Sünde bekennen, so ist er treu und gerecht, daß er uns die Sünde vergibt und reinigt uns von aller Untugend.<cite>1. Johannes 1,9</cite></div>
{row("Weitergegeben an", lines(1, [e.get("weiter", "")]))}
<p class="end">Abendsegen. Und dann flugs und fröhlich geschlafen.</p>
"""
    return page(side + " dense", str(folio), f"Seite {folio}: {WD[wd]}", inner, runner="Advent")


MO_EX = {"date": "30. 11. 2026", "bett": True, "at": "2. Mose 3", "nt": "Markus 1",
         "haupt": "Gott ruft Mose aus dem Busch und schickt ihn nach Ägypten.",
         "ref": "2. Mose 3,14", "vers": "„Ich werde sein, der ich sein werde.“",
         "gott": "Er sieht das Elend und fährt herab (V. 7–8).", "mensch": "Mose fragt: Wer bin ich? Gott sagt: Ich will mit dir sein.",
         "um": "T. heute anrufen, nicht nur schreiben.", "kat": "Das erste Gebot",
         "gebet": "Dank für den Namen · Bitte um Mut für das Gespräch", "menschen": "T., die Kollegen im Planungsteam",
         "three": ("T. anrufen", "Abends mit J. Hausaufgaben, ohne Handy", "Jahresplanung bis 16 Uhr an den Chef"),
         "marks": ("+", "+", "~"), "vesper": True, "fb": "Oma, Familie K.", "dank": "erster Schnee auf dem Weg; J. hat gelacht",
         "weiter": "J.: Gott kommt herab (2. Mose 3)"}

AT_BOOKS = [("1. Mose", 50), ("2. Mose", 40), ("3. Mose", 27), ("4. Mose", 36), ("5. Mose", 34), ("Josua", 24), ("Richter", 21),
            ("Rut", 4), ("1. Samuel", 31), ("2. Samuel", 24), ("1. Könige", 22), ("2. Könige", 25), ("1. Chronik", 29),
            ("2. Chronik", 36), ("Esra", 10), ("Nehemia", 13), ("Ester", 10), ("Hiob", 42), ("Psalm", 150), ("Sprüche", 31),
            ("Prediger", 12), ("Hoheslied", 8), ("Jesaja", 66), ("Jeremia", 52), ("Klagelieder", 5), ("Hesekiel", 48),
            ("Daniel", 12), ("Hosea", 14), ("Joel", 4), ("Amos", 9), ("Obadja", 1), ("Jona", 4), ("Micha", 7), ("Nahum", 3),
            ("Habakuk", 3), ("Zefanja", 3), ("Haggai", 2), ("Sacharja", 14), ("Maleachi", 3)]
assert sum(n for _, n in AT_BOOKS) == 929


def portions(books, pattern):
    out, p = [], 0
    for bi, (_, n) in enumerate(books):
        ch = 1
        while ch <= n:
            k = min(pattern[p % len(pattern)], n - ch + 1)
            p += 1
            out.append(bi)
            ch += k
    return out


AT_P = portions(AT_BOOKS, [2, 1, 1, 1])
assert len(AT_P) == 745
TINTS = ["#D9DEE7", "#C5CCD9", "#B1BACB", "#9DA8BD", "#8996AF"]


def rbar(segs, total):
    bar = "".join(f'<span style="flex:{n};background:{TINTS[i]}">{n}</span>' for i, (_, n, _) in enumerate(segs))
    leg = "".join(f'<div><i style="background:{TINTS[i]}"></i><b>{t}</b><span>{r}</span></div>' for i, (t, _, r) in enumerate(segs))
    return f'<div class="rb2">{bar}</div><div class="rleg">{leg}</div>'


def p_jahresplan():
    nt = [("Evangelien", 89, "Matthäus bis Johannes"), ("Apostelgeschichte", 28, ""), ("Paulus", 87, "Römer bis Philemon"),
          ("Petrus, Johannes", 15, "1. Petrus bis 3. Johannes"), ("Hebräer bis Offenbarung", 41, "mit Jakobus und Judas")]
    groups = [("Mose", 0, 5, "1. bis 5. Mose"), ("Geschichte", 5, 17, "Josua bis Ester"), ("Hiob bis Hoheslied", 17, 22, "mit den Psalmen"),
              ("Propheten", 22, 39, "Jesaja bis Maleachi")]
    at = [(t, len([x for x in AT_P if a <= x < bb]), r) for t, a, bb, r in groups]
    assert sum(n for _, n, _ in nt) == 260 and sum(n for _, n, _ in at) == 745
    durch = [("Neues Testament", "5. 10. 2026", ""), ("Neues Testament", "", ""), ("Altes Testament", "5. 10. 2026", "")]
    t = '<div class="th"><span>Plan</span><span>begonnen am</span><span>beendet am</span></div>'
    for pl, a, e in durch:
        t += f'<div><span class="st">{pl}</span><span>{hw(a)}</span><span>{hw(e)}</span></div>'
    inner = f"""
<header class="ph"><h2 class="pt">Jahresplan Bibellese</h2></header>
<p class="txt">Zwei Pläne laufen nebeneinander, beide nach Fortschritt, nicht nach Datum. Das Neue Testament liest du in einem Jahr, ein Kapitel je Lesung. Das Alte Testament in rund zwei Jahren, im Muster zwei, eins, eins, eins; keine Lesung geht über eine Buchgrenze.</p>
{sec("", "Neues Testament", "260 Lesungen · S. 5")}
{rbar(nt, 260)}
{sec("", "Altes Testament", "745 Lesungen, 929 Kapitel · S. 6–7")}
{rbar(at, 745)}
{sec("", "Durchgänge")}
<div class="tbl dg">{t}</div>
<p class="rb" style="margin-top:auto">Wer aufgehört hat zu lesen, fängt wieder an. Nicht nachholen, nicht rechnen – wieder anfangen.</p>
"""
    return page("l", "4", "Seite 4: Jahresplan Bibellese", inner, runner="Bibellese")


def p_at(folio, side, books, title, read=()):
    done = dict(read)
    rows = ""
    for name, n in books:
        bx = "".join(f'<span class="nb{" on" if i <= done.get(name, 0) else ""}">{i}</span>' for i in range(1, n + 1))
        rows += f'<span class="bk">{name}</span><span class="bx">{bx}</span>'
    head = (f'<header class="ph"><h2 class="pt"><small>Leseplan</small>{title}</h2>'
            f'<div class="pm"><div class="dline"><span class="pl">begonnen am</span>{hw("5. 10. 2026") if side == "l" else ""}</div></div></header>'
            if side == "l" else f'<header class="ph"><h2 class="pt"><small>Leseplan</small>{title}</h2></header>')
    inner = f"""
{head}
<div class="nt at">{rows}</div>
"""
    return page(side, folio, f"Seite {folio}: Leseplan Altes Testament", inner, runner="Bibellese")


KM = {"Die Zehn Gebote": (["1. Gebot", "2. Gebot", "3. Gebot", "4. Gebot", "5. Gebot", "6. Gebot", "7. Gebot", "8. Gebot", "9. Gebot", "10. Gebot", "Beschluß"],
                          [[0], [1], [2], [3], [4, 5], [6, 7], [8, 9, 10]]),
      "Der Glaube": (["1. Artikel", "2. Artikel", "3. Artikel"], [[0], [0], [1], [1], [1], [2], [2]]),
      "Das Vaterunser": (["Anrede", "1. Bitte", "2. Bitte", "3. Bitte", "4. Bitte", "5. Bitte", "6. Bitte", "7. Bitte", "Beschluß"],
                         [[0, 1], [2], [3], [4], [5], [6], [7, 8]]),
      "Die heilige Taufe": (["Zum Ersten", "Zum Andern", "Zum Dritten", "Zum Vierten"], [[0], [0], [1], [1], [2], [2], [3]]),
      "Die Beichte": (["Was ist die Beichte?", "Welche Sünden?", "Welche sind die?", "Die Absolution"], [[0], [0], [1], [1], [2], [2], [3]]),
      "Das Sakrament des Altars": (["Was ist es?", "Was nützt es?", "Wie kann es?", "Wer würdig?"], [[0], [0], [1], [1], [2], [3], [3]])}


def p_kat_plan():
    g = '<span class="th">Woche</span>' + "".join(f'<span class="th c7">{d}</span>' for d in ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"])
    for i, (hs, (pieces, km)) in enumerate(KM.items(), 1):
        g += f'<span class="hsn"><b>{i}</b>{hs}</span>' + "".join(f'<span class="c7">{"<br>".join(pieces[j] for j in idx)}</span>' for idx in km)
    dg = '<span class="th">Durchgang</span><span class="th">begonnen am</span>' + "".join(f'<span class="th c7">{i}</span>' for i in range(1, 7))
    ex = {1: ("5. 10.", 6), 2: ("16. 11.", 2)}
    for r in range(1, 10):
        st, n = ex.get(r, ("", 0))
        dg += f'<span class="k">{r}</span><span>{hw(st)}</span>' + "".join(f'<span class="c7">{b(i < n)}</span>' for i in range(6))
    inner = f"""
<header class="ph"><h2 class="pt">Katechismus lernen</h2></header>
<p class="txt">Sechs Wochen, sechs Hauptstücke. Jeden Tag ein Stück, von Montag bis Sonntag nach dieser Tafel, dann von vorn. Das Stück des Tages trägst du auf der Tagesseite ein.</p>
<div class="kp">{g}</div>
{sec("", "Durchgänge", "ein Kästchen je Woche")}
<div class="kd">{dg}</div>
<p class="pr">Im Jahr sind es acht bis neun Durchgänge. Was auswendig sitzt, steht auf der nächsten Seite.</p>
"""
    return page("l", "8", "Seite 8: Katechismus lernen", inner, runner="Katechismus")


def p_gebetskammer():
    ex = [("15. 11.", "Gespräch mit T.", "mich", "30. 11. geführt"), ("28. 11.", "Schlaf und Geduld", "Matthias", ""),
          ("1. 12.", "Bewerbung", "Daniel", "")]
    t = '<div class="th"><span>seit</span><span>Anliegen</span><span>für</span><span>Antwort</span></div>'
    for i in range(23):
        a = ex[i] if i < len(ex) else ("", "", "", "")
        t += "<div>" + "".join(f"<span>{hw(x)}</span>" for x in a) + "</div>"
    inner = f"""
<header class="ph"><h2 class="pt">Gebetskammer</h2></header>
<p class="rb">Geh in dein Kämmerlein und schließ die Tür zu.<cite>nach Matthäus 6,6</cite></p>
<div class="tbl gk">{t}</div>
<p class="pr" style="margin-top:auto">Was du Gott bekennst, steht hier nicht. Es wird gebetet, nicht notiert.</p>
"""
    n = YEAR_END + 29
    return page("l", str(n), f"Seite {n}: Gebetskammer", inner, runner="Gebetskammer")


def p_notes(folio, side, runner, title, sub, ex=()):
    inner = f"""
<header class="ph"><h2 class="pt">{title}</h2></header>
<p class="pr">{sub}</p>
{lines(29, list(ex))}
"""
    return page(side, str(folio), f"Seite {folio}: {title}", inner, runner=runner)


def p_eisenschmiede():
    def entry(date="", who="", notes=()):
        return ('<div class="es">' + row("Datum", '<div class="lines"><div class="ln"><span class="half">' + hw(date) +
                                         '</span><span class="half"><span class="pl">mit</span>' + hw(who) + "</span></div></div>")
                + row("Notizen", lines(4, list(notes))) + "</div>")
    inner = f"""
<header class="ph"><h2 class="pt">Eisenschmiede</h2></header>
<div class="vs" style="margin-top:calc(2 * var(--mm))">„Ein Messer wetzt das andere und ein Mann den andern.“<cite>Sprüche 27,17</cite></div>
{entry("5. 12.", "Matthias, Daniel", ["Daniel fragt: Wann hast du zuletzt mit deiner Frau gebetet?", "Matthias: erst zuhören, dann raten.", "Für mich: Küche um 20 Uhr hält noch nicht."])}
{entry()}
{entry()}
{entry()}
<p class="pr" style="margin-top:auto">Was einer dem andern bekennt, wird nicht notiert.</p>
"""
    n = YEAR_END + 45
    return page("l", str(n), f"Seite {n}: Eisenschmiede", inner, runner="Eisenschmiede")


# ------------------------------------------------------------------ document

CSS_KJ = r"""
.ring{display:block;width:100%;height:auto;margin-top:calc(1 * var(--mm))}
.ring text{font-family:var(--sans)}
.lg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:calc(1 * var(--mm)) calc(3 * var(--mm));font-size:calc(2.35 * var(--mm));margin-top:calc(1 * var(--mm))}
.lg span{display:flex;align-items:center;gap:calc(1.4 * var(--mm))}
.ld{display:inline-block;flex:none;width:calc(2.4 * var(--mm));height:calc(2.4 * var(--mm));border-radius:50%;box-shadow:inset 0 0 0 max(1px,calc(.2 * var(--mm))) rgba(29,35,48,.25)}
.ot{display:grid;grid-template-columns:calc(15 * var(--mm)) repeat(6,minmax(0,1fr));margin-top:calc(2.4 * var(--mm));font-size:calc(2.5 * var(--mm));font-variant-numeric:tabular-nums}
.ot > span{border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--line);padding:calc(1.15 * var(--mm)) 0}
.ot .th{font:700 calc(1.85 * var(--mm)) var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);border-bottom-color:var(--ink-3);line-height:1.15;display:flex;align-items:flex-end}
.ot .k{font:600 calc(2.3 * var(--mm)) var(--sans);color:var(--rubric)}
.ot .n{text-align:center;justify-content:center}
.ot b{font-weight:600}
.pd{font-weight:400;color:var(--ink)}
.rb2{display:flex;height:calc(6 * var(--mm));margin-top:calc(1.8 * var(--mm));border-radius:calc(.8 * var(--mm));overflow:hidden}
.rb2 span{display:flex;align-items:center;justify-content:center;min-width:0;font:600 calc(2.1 * var(--mm)) var(--sans);color:var(--ink);border-right:max(1px,calc(.25 * var(--mm))) solid var(--paper)}
.rleg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:calc(1.2 * var(--mm)) calc(4 * var(--mm));margin-top:calc(1.8 * var(--mm));font-size:calc(2.35 * var(--mm));line-height:1.25}
.rleg div{display:grid;grid-template-columns:calc(3 * var(--mm)) minmax(0,1fr);column-gap:calc(1.4 * var(--mm))}
.rleg i{width:calc(2.6 * var(--mm));height:calc(2.6 * var(--mm));border-radius:calc(.5 * var(--mm));grid-row:span 2;margin-top:calc(.3 * var(--mm))}
.rleg b{font-weight:600}
.rleg span{color:var(--ink-2);font-size:calc(2.15 * var(--mm))}
.dg > div{grid-template-columns:calc(40 * var(--mm)) minmax(0,1fr) minmax(0,1fr);min-height:calc(7 * var(--mm))}
.nt.at{row-gap:calc(1.1 * var(--mm));margin-top:calc(2 * var(--mm))}
.kp{display:grid;grid-template-columns:calc(26 * var(--mm)) repeat(7,minmax(0,1fr));margin-top:calc(2 * var(--mm));font-size:calc(2.05 * var(--mm));line-height:1.2}
.kp > span{border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--line);padding:calc(1 * var(--mm)) calc(.5 * var(--mm)) calc(1 * var(--mm)) 0;min-width:0;overflow-wrap:anywhere}
.kp .th,.kd .th{font:700 calc(1.85 * var(--mm)) var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3);border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--ink-3)}
.kp .c7,.kd .c7{text-align:center}
.kp .hsn{font:600 calc(2.15 * var(--mm)) var(--sans);color:var(--ink)}
.kp .hsn b{color:var(--rubric);margin-right:calc(1 * var(--mm))}
.kd{display:grid;grid-template-columns:calc(18 * var(--mm)) minmax(0,1fr) repeat(6,calc(9 * var(--mm)));margin-top:calc(1.4 * var(--mm));align-items:end}
.kd > span{border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--line);padding:calc(.6 * var(--mm)) 0;min-height:calc(5.6 * var(--mm));display:flex;align-items:flex-end;justify-content:flex-start}
.kd .c7{justify-content:center}
.kd .th{min-height:0}
.kt > span.th{white-space:normal}
.kd .k{font:600 calc(2.3 * var(--mm)) var(--sans);color:var(--rubric)}
.gk > div{grid-template-columns:calc(14 * var(--mm)) minmax(0,1fr) calc(25 * var(--mm)) calc(30 * var(--mm));min-height:calc(6.2 * var(--mm))}
.es{margin-top:calc(3 * var(--mm))}
.es + .es{border-top:max(1px,calc(.3 * var(--mm))) solid var(--ink-3);padding-top:calc(1 * var(--mm))}
.lc{display:flex;align-items:center;gap:calc(1.2 * var(--mm));font:600 calc(2.1 * var(--mm)) var(--sans);color:var(--ink-3)}
.latin{margin:calc(1.2 * var(--mm)) 0 0;font:italic 400 calc(2.6 * var(--mm)) var(--serif);color:var(--ink-2)}
.vs.ws{margin:calc(2.4 * var(--mm)) 0 0;font-size:calc(3.3 * var(--mm));line-height:1.35;color:var(--ink)}
.prop{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:calc(1.4 * var(--mm)) calc(4 * var(--mm));margin-top:calc(2.4 * var(--mm));padding:calc(1.8 * var(--mm)) 0;border-top:max(1px,calc(.2 * var(--mm))) solid var(--line);border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--line)}
.prop > div{display:grid;gap:calc(.3 * var(--mm))}
.prop .pl{padding:0}
.prop .pv{font-size:calc(2.7 * var(--mm));line-height:1.3}
.prop .pv em{font-size:calc(2.3 * var(--mm));color:var(--ink-2)}
.it{margin:calc(1 * var(--mm)) 0 0;font:600 calc(3.3 * var(--mm)) var(--serif);color:var(--ink)}
.imp{margin:calc(1 * var(--mm)) 0 0;font-size:calc(2.5 * var(--mm));line-height:1.42;hyphens:auto}
.imp.cont{margin-top:calc(.6 * var(--mm))}
.hym{margin:calc(.8 * var(--mm)) 0 0 calc(5 * var(--mm));font:italic 400 calc(2.4 * var(--mm)) var(--serif);line-height:1.4;color:var(--ink-2)}
.zus{margin:calc(.4 * var(--mm)) 0 0;font:italic 400 calc(2.35 * var(--mm)) var(--serif);color:var(--ink-2)}
.lws{display:grid;gap:calc(1.1 * var(--mm));margin:calc(1.6 * var(--mm)) 0 calc(.6 * var(--mm));padding:calc(1.4 * var(--mm)) 0;border-top:max(1px,calc(.2 * var(--mm))) solid var(--line);border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--line);font-size:calc(2.45 * var(--mm));line-height:1.38}
.lw cite{display:block;font:600 calc(1.95 * var(--mm)) var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--rubric);font-style:normal;margin-bottom:calc(.2 * var(--mm))}
.quelle{margin:calc(2 * var(--mm)) 0 0;font:italic 400 calc(2.2 * var(--mm)) var(--serif);color:var(--ink-3);line-height:1.4}
.ptext{margin:calc(1 * var(--mm)) 0 0;padding:calc(1.4 * var(--mm)) calc(2 * var(--mm));border:max(1px,calc(.25 * var(--mm))) dashed var(--dot);border-radius:calc(.8 * var(--mm));font:italic 400 calc(2.4 * var(--mm)) var(--serif);color:var(--ink-3)}
.wl.two{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:calc(3 * var(--mm))}
"""


def build():
    css = B.CSS + O.ORD_CSS + CSS_KJ
    cover = """
<section class="block cover-block" id="umschlag">
  <div class="cover-row">
    <div class="book" role="img" aria-label="Umschlag: dunkelblaues Leinen, Titel Henoch, Kirchenjahr">
      <div class="cl"></div><div class="spine"></div><div class="band"></div>
      <div class="rib a"></div><div class="rib b"></div><div class="rib c"></div>
      <div class="ttl"><b>HENOCH</b><i></i><span>Kirchenjahr</span></div>
    </div>
    <div class="spec">
      <h2>Der Band für das Kirchenjahr</h2>
      <dl>
        <dt>Inhalt</dt><dd>Alle 57 Sonntage, die ein Kirchenjahr haben kann, vom 1. Advent bis zum 27. Sonntag nach Trinitatis</dd>
        <dt>Datum</dt><dd>Keins. Beginnen kannst du an jedem Sonntag; nach dem letzten geht es vorn beim Advent weiter</dd>
        <dt>Sonntag</dt><dd>Vier Seiten: Wochenspruch, Dieffenbachs Bibellektion zum Evangelium, Löhes Betrachtung zur Epistel, dann Gottesdienst und die Gewohnheiten der Woche</dd>
        <dt>Woche</dt><dd>Montag bis Samstag je eine Tagesseite für Morgen und Abend</dd>
        <dt>Vorn</dt><dd>Jahresplan Bibellese mit allen Kapiteln zum Abhaken, Katechismus lernen, die Ordnung, Kirchenjahr und Ostertafel</dd>
        <dt>Hinten</dt><dd>Notizseiten für die Gebetskammer und die Eisenschmiede, je 16 Seiten</dd>
        <dt>Umfang</dt><dd>704 nummerierte Seiten in 44 Lagen; Dünndruck, 52 g, füllhaltertauglich, etwa 2,5 cm stark</dd>
        <dt>Bändchen</dt><dd>Drei: rot für den Tag, grün für die Ordnung, schwarz für den Sonntag</dd>
      </dl>
    </div>
  </div>
</section>"""
    year_pages = YEAR_END - FIRST + 1
    Y = YEAR_END
    parts = [("Vorn", 19, "--seg1", [("1–3", "Titel, Aufbau, Gebetsübersicht"), ("4–7", "Jahresplan Bibellese, NT und AT zum Abhaken"), ("8–9", "Katechismus lernen"), ("10–17", "Die Ordnung"), ("18–19", "Kirchenjahr, Ostertafel")]),
             ("Das Kirchenjahr", year_pages, "--seg2", [(f"{FIRST}–{Y}", "57 Wochen × 10 Seiten"), ("", "Sonntag 4 Seiten, Montag bis Samstag je 1 Seite"), ("", "6 Doppelseiten für Feste")]),
             ("Arena", 28, "--seg3", [(f"{Y + 1}–{Y + 2}", "Arena, Meine Brüder"), (f"{Y + 3}–{Y + 28}", "26 Treffen")]),
             ("Gebetskammer", 16, "--seg5", [(f"{Y + 29}–{Y + 44}", "Anliegen und Antworten, Notizen aus der Stille")]),
             ("Eisenschmiede", 16, "--seg6", [(f"{Y + 45}–{Y + 60}", "Notizen aus dem Gespräch unter Brüdern")]),
             ("Hinten", 43, "--seg4", [(f"{Y + 61}–{Y + 94}", "Notizen"), (f"{Y + 95}–{Y + 102}", "Verse, die ich mitnehme"), (f"{Y + 103}", "Monatlich")])]
    assert sum(p[1] for p in parts) == 704 == Y + 103 and 704 % 16 == 0
    plan = ('<section class="block" id="seiten"><div class="cap"><span class="pg">Umfang</span><h2>704 Seiten für ein Kirchenjahr</h2>'
            '<p>Mit der Doppelseite pro Tag aus dem Band für dreizehn Wochen wären es weit über tausend Seiten. Deshalb bekommt hier nur der Sonntag vier Seiten, die Wochentage je eine.</p></div>'
            f'<div class="plan"><div class="bar" role="img" aria-label="Vorn 19, Das Kirchenjahr {year_pages}, Arena 28, Gebetskammer 16, Eisenschmiede 16, Hinten 43 Seiten">'
            + "".join(f'<span style="flex:{n};background:var({c_})">{n if n > 60 else ""}</span>' for _, n, c_, _ in parts)
            + '</div><div class="parts kj">'
            + "".join(f'<div><h3><i style="background:var({c_})"></i>{t}<b>{n} S.</b></h3><ul>'
                      + "".join(f"<li><span>{a}</span><span>{bb}</span></li>" for a, bb in items) + "</ul></div>"
                      for t, n, c_, items in parts)
            + '</div><p class="sum">Sonntage, die in einem Jahr ausfallen, lassen zehn Seiten frei. Gedruckt sind die Texte, die Henoch geprüft hat: die Wochensprüche aller Sonntage, Dieffenbach für die vier Adventssonntage, Löhe für neun Sonn- und Festtage. Wo ein Text noch fehlt, steht ein Platzhalter.</p></div></section>')
    adv = folio_of("1. Advent")
    blocks = [
        cover, plan,
        block("bibellese", "S. 4–7", "Jahresplan Bibellese",
              "Vorn stehen die Bibellese und der Katechismus im Überblick. Der Jahresplan zeigt, wie sich das Neue Testament auf ein Jahr und das Alte auf zwei verteilt; dahinter steht jedes Kapitel zum Abhaken. Der Plan läuft nach Fortschritt, deshalb gibt es keinen Rückstand.",
              spread(p_jahresplan(), B.p_nt("5", "r", "Altes Testament auf S. 6–7.", (("Matthäus", 28), ("Markus", 1))))
              + '<div class="gap"></div>' +
              spread(p_at("6", "l", AT_BOOKS[:17], "Altes Testament", (("1. Mose", 50), ("2. Mose", 3))),
                     p_at("7", "r", AT_BOOKS[17:], "Altes Testament, Hiob bis Maleachi"))),
        block("katechismus", "S. 8–9", "Katechismus lernen",
              "Die Tafel zeigt für jede der sechs Wochen, welches Stück an welchem Tag dran ist, wie in der App. Darunter werden die Durchgänge abgehakt. Rechts steht, was auswendig sitzt und was mit den Kindern gelernt ist.",
              spread(p_kat_plan(), B.p_katechismus("9", "r", "Was auswendig sitzt, für mich und mit den Kindern."))),
        block("kirchenjahr", "S. 18–19", "Das Kirchenjahr",
              "Vorn steht der Jahreskreis mit allen 57 Sonntagen, daneben die Ostertafel. Aus ihr liest man ab, wann ein Kirchenjahr beginnt und welche Sonntage es hat.",
              spread(p_kreis(), p_ostertafel())),
        block("sonntag", f"S. {adv}–{adv + 3}", "Der Sonntag mit Dieffenbach und Löhe",
              "Der Sonntag hat vier Seiten. Vorn stehen der Wochenspruch und Dieffenbachs Bibellektion zum Evangelium aus der Evangelischen Haus-Agende. Dann folgt Löhes Betrachtung zur Epistel, darunter Platz für den Gedanken am Tisch und die Frage für die Woche. Die vierte Seite trägt Gottesdienst, Stille Zeit am Sonntag und die Gewohnheiten der Woche. Die Texte sind die der App, wortgetreu.",
              spread(p_so1(), p_so2()) + '<div class="gap"></div>' + spread(p_so3(), p_sonntag_r())),
        block("tage", f"S. {adv + 4}–{adv + 5}", "Die Wochentage",
              "Ein Tag hat eine Seite, Morgen oben, Abend unten. Psalm und Stand für die Prüfung hängen am Wochentag und sind vorgedruckt, die Vesper liest das Evangelium des Sonntags. Datum, Lesung und Katechismusstück trägt man ein.",
              spread(p_tag(0, "l", adv + 4, MO_EX), p_tag(1, "r", adv + 5))),
        block("gebetskammer", f"S. {YEAR_END + 29}–{YEAR_END + 44}", "Gebetskammer",
              "Hinten im Buch hat die Gebetskammer sechzehn Seiten: links die Anliegen mit der Antwort, wenn sie kommt, rechts Platz für das, was in der Stille aufgeht. Was bekannt wird, steht auch hier nicht.",
              spread(p_gebetskammer(), p_notes(YEAR_END + 30, "r", "Gebetskammer", "Aus der Stille", "Ein Satz genügt.",
                                               ["Ps 37,7: nicht warten auf eine Stimme, sondern ruhen."]))),
        block("eisenschmiede", f"S. {YEAR_END + 45}–{YEAR_END + 60}", "Eisenschmiede",
              "Dann die Eisenschmiede: Notizen aus dem Gespräch unter Brüdern, je Treffen ein Block mit Datum und wer dabei war. Was einer dem andern bekennt, bleibt im Gespräch.",
              spread(p_eisenschmiede(), p_notes(YEAR_END + 46, "r", "Eisenschmiede", "Eisenschmiede", "Weitere Notizen."))),
    ]
    nav = [("umschlag", "Der Band"), ("seiten", "704 Seiten"), ("bibellese", "Bibellese"), ("katechismus", "Katechismus"),
           ("kirchenjahr", "Kirchenjahr"), ("sonntag", "Sonntag"), ("tage", "Wochentage"), ("gebetskammer", "Gebetskammer"), ("eisenschmiede", "Eisenschmiede")]
    nav_html = "".join(f'<li><a href="#{a}">{t}</a></li>' for a, t in nav)
    body = f"""
<div class="wrap">
  <header class="top">
    <div>
      <p class="eyebrow">Henoch · Musterseiten</p>
      <h1>Henoch im Kirchenjahr</h1>
      <p class="lede">Ein undatierter Band mit allen Sonntagen vom 1. Advent bis zum 27. Sonntag nach Trinitatis. Jeder Sonntag bringt Dieffenbachs Bibellektion zum Evangelium und Löhes Betrachtung zur Epistel. Beginnen kannst du an jedem Sonntag.</p>
    </div>
    <div style="display:grid">
      <button class="toggle" id="ex-toggle" type="button" aria-pressed="true"><span class="sw" aria-hidden="true"></span>Beispieleinträge</button>
      <p class="hint">Blaue Handschrift ist ein Beispiel. Ausgeschaltet zeigen die Seiten, wie sie gedruckt würden.</p>
    </div>
  </header>
  <nav aria-label="Seiten"><ul class="nav">{nav_html}</ul></nav>
  <main id="book" class="show">
    {"".join(blocks)}
  </main>
</div>
<script>
(function(){{
  var btn=document.getElementById('ex-toggle'), book=document.getElementById('book'), KEY='henoch-kj-examples';
  function set(on){{ book.classList.toggle('show',on); btn.setAttribute('aria-pressed', on?'true':'false'); }}
  try{{ var v=localStorage.getItem(KEY); if(v==='0') set(false); }}catch(e){{}}
  btn.addEventListener('click',function(){{
    var on=!book.classList.contains('show'); set(on);
    try{{ localStorage.setItem(KEY,on?'1':'0'); }}catch(e){{}}
  }});
}})();
</script>
"""
    head = (f'<title>Henoch Kirchenjahr</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
            f'<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            f'<link rel="stylesheet" href="{B.FONTS}">\n<style>{css}\n.parts.kj{{grid-template-columns:repeat(3,minmax(0,1fr))}}\n@media (max-width:760px){{.parts.kj{{grid-template-columns:repeat(2,minmax(0,1fr))}}}}</style>\n')
    (HERE / "henoch-kirchenjahr.html").write_text(head + body, encoding="utf-8")
    full = ('<!doctype html><html lang="de"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
            + head + "</head><body>" + body + "</body></html>")
    (HERE / "henoch-kirchenjahr-druck.html").write_text(full, encoding="utf-8")
    print("ok: 1. Advent at", adv, "year ends", YEAR_END)


if __name__ == "__main__":
    build()
