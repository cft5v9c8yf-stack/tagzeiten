#!/usr/bin/env python3
"""Henoch im Advent: a notebook from the first Sunday in Advent to Christmas Eve.

Every day has one spread. It opens like "Heute" in the app, with the prayer
times of the day and the habits, and then follows the Stille Zeit step by step:
Eröffnung, Das Wort, Das Gebet, Die Antwort, Die Ausrichtung, Der Segen, and at
the foot of the right page the evening. Every Sunday adds the week's verse, the
lessons of Dieffenbach and Löhe, the service and the weekly review. At the back
stand the two places of the Arena, Gebetskammer and Eisenschmiede.

All words come from the app: notizbuch/app_texte.ts prints them as JSON (run
with tsx, set TSX to the command if npx is not wanted), the step icons are read
from src/ui/FlowIcon.tsx, the colours from src/styles/tokens.css, the texts of
the Arena from src/features/arena/ArenaPage.tsx. What only
makes sense on a screen (archiving, suggestions, buttons) is left out; where an
app text points to the screen, the change is noted next to it.

Output: henoch-advent.html (preview with sample handwriting) and
henoch-advent-druck.html (a whole document for printing, A5).
"""
import html
import json
import os
import pathlib
import re
import shlex
import subprocess

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parent


def app_texts():
    cmd = shlex.split(os.environ.get("TSX", "npx --yes tsx")) + [str(HERE / "app_texte.ts")]
    return json.loads(subprocess.run(cmd, cwd=REPO, capture_output=True, text=True, check=True).stdout)


def flow_icons():
    src = (REPO / "src" / "ui" / "FlowIcon.tsx").read_text(encoding="utf-8")
    body = src.split("const PATHS", 1)[1].split("\n};", 1)[0]
    found = re.finditer(r"^  (\w+): (.*?)(?=^  (?:\w+:|//)|\Z)", body, re.S | re.M)
    return {m.group(1): "".join(re.findall(r"<(?:path|circle)\b[^>]*/>", m.group(2))) for m in found}


def tokens():
    """The light colours and the fonts of the app (the first :root block)."""
    src = (REPO / "src" / "styles" / "tokens.css").read_text(encoding="utf-8")
    root = src.split(":root {", 1)[1].split("}", 1)[0]
    return dict(re.findall(r"(--[\w-]+):\s*([^;]+);", root))


def arena_texts():
    """The texts of the Arena's two places, read from the page of the app (it cannot be imported without React)."""
    src = (REPO / "src" / "features" / "arena" / "ArenaPage.tsx").read_text(encoding="utf-8")
    places = src.split("const PLACES = {", 1)[1].split("} as const;", 1)[0]
    journal, forge = places.split("\n  forge: {", 1)

    def get(part, key):
        m = re.search(key + r": '([^']*)'", part)
        assert m, key
        return m.group(1)

    def comfort(part):
        return [{"text": t, "ref": r} for t, r in re.findall(r"text: '([^']*)',\s*ref: '([^']*)'", part)]

    def lit(t):
        assert t in src, t
        return t

    out = {k: {key: get(part, key) for key in ["title", "note", "concernHint"]} for k, part in [("journal", journal), ("forge", forge)]}
    out["journal"].update(textLabel=get(journal, "textLabel"), textHint=get(journal, "textHint"), comfort=comfort(journal),
                          tile=lit("Was dich belastet und womit du ringst"))
    out["forge"].update(comfort=comfort(forge), tile=lit("Für das Treffen mit deinen Brüdern"),
                        kind=lit("Eisenschmiede · fürs Treffen mit den Brüdern"), meeting=lit("Für das Treffen am"),
                        points=lit("Was du mit den Brüdern besprechen willst"), pointHint=lit("Was dich umtreibt, wo du Rat brauchst …"))
    out["verses"], out["concerns"], out["verseHint"] = lit("Bibelstelle"), lit("Gebetsanliegen"), lit("z. B. Römer 8,37")
    assert len(out["journal"]["comfort"]) == 2 and len(out["forge"]["comfort"]) == 2
    return out


A = app_texts()
AR = arena_texts()
ICONS = flow_icons()
TOK = tokens()
F = A["fields"]
R = A["rubrics"]
LIT = A["liturgy"]
ARC = A["arc"]["morning"]
SUNDAYS = A["advent"]["sundays"]
WD = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
ARMOR = {p["weekday"]: p for p in A["armor"]["week"]}
STATIONS = A["examen"]["stations"]

# Folios: fifteen pages in front, four weeks of 22 pages, the Christfest, the Arena (24 pages) and the
# sources: 128 pages, eight quires of 16.
FRONT = 15
WEEK = 22  # Sunday 8, the week overview 2, Monday to Saturday 12
P_NIGHT = 10        # Nachtgebet, two pages
P_ARMOR = 8         # Die geistliche Waffenrüstung
P_ORDER_RESPONSE = 7
P_PRAYERLIST = 13   # Gebetsübersicht
P_TODAY = 14         # Heute
P_HABITS = 15        # Gewohnheiten
P_END = FRONT + 4 * WEEK + 1    # Das Christfest
P_ARENA = P_END + 1
P_CHAMBER = P_ARENA + 1         # Gebetskammer, then its entries
CHAMBER_PAGES = 13
P_FORGE = P_CHAMBER + 1 + CHAMBER_PAGES  # Eisenschmiede, then its meetings
FORGE_PAGES = 7
P_SOURCES = P_FORGE + 1 + FORGE_PAGES


def week_start(i):
    return FRONT + 1 + i * WEEK


# ------------------------------------------------------------------ helpers

def esc(t):
    return html.escape(t, quote=False)


def hw(t):
    return f'<span class="hw">{esc(t)}</span>' if t else ""


def icon(name, cls="ic"):
    return (f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>')


def ln(content="", cls=""):
    return f'<div class="ln{" " + cls if cls else ""}">{content}</div>'


def pi(t):
    """A prompt from the app (its placeholder), printed where the writing starts."""
    return f'<span class="pi">{esc(t)}</span>'


def il(t):
    return f'<span class="il">{esc(t)}</span>'


def lines(n, hws=(), first=""):
    return "".join(ln((first if i == 0 else "") + hw(hws[i] if i < len(hws) else "")) for i in range(n))


def lab(text, aside=""):
    return f'<div class="lab"><span>{esc(text)}</span>{aside}</div>'


def field(path_or_label, n, hws=(), prompt=None, aside="", hint=False):
    """A label and lines. The prompt starts the first line; a hint (an app placeholder) gives way to the examples."""
    meta = F.get(path_or_label)
    label = meta["label"] if meta else path_or_label
    if prompt is None and meta:
        prompt = meta.get("placeholder", "")
    first = ""
    if prompt:
        first = f'<span class="pi{" ph" if hint and hws else ""}">{esc(prompt)}</span>'
    return lab(label, aside) + lines(n, hws, first)


def rub(t, cls=""):
    return f'<p class="rub{" " + cls if cls else ""}">{esc(t)}</p>'


def note(t):
    return f'<p class="note">{esc(t)}</p>'


def blanks(t):
    return esc(t).replace("NAME", '<span class="blank"></span>')


def pray(t, cls="", run=False, att=True):
    """A prayer text of the app: lines as they stand, or run on as one paragraph."""
    paras, cur = [], []
    for line in t["lines"]:
        if line == "":
            paras.append(cur)
            cur = []
        else:
            cur.append(line)
    paras.append(cur)
    a = t.get("ref") or t.get("source") or ""
    attr = f' <span class="att">{esc(a)}</span>' if (a and att) else ""
    if run:
        body = "".join(f"<p>{blanks(' '.join(p))}{attr if i == len(paras) - 1 else ''}</p>" for i, p in enumerate(paras))
    else:
        body = "".join("<p>" + "".join(f'<span class="l">{blanks(x)}</span>' for x in p)
                       + (attr if i == len(paras) - 1 else "") + "</p>" for i, p in enumerate(paras))
    return f'<div class="pray{" " + cls if cls else ""}{" run" if run else ""}">{body}</div>'


def versicles(items):
    return '<div class="pray vers">' + "".join(
        f'<div class="vr"><b>V</b><span>{esc(x["v"])}</span></div><div class="vr"><b>A</b><span>{esc(x["a"])}</span></div>'
        for x in items) + "</div>"


def marks(on=None):
    return '<span class="mks">' + "".join(
        f'<span class="mk{" on" if m == on else ""}">{m}</span>' for m in ["+", "~", "–"]) + "</span>"


def box(on=False):
    return f'<span class="bx{" on" if on else ""}"></span>'


def header(kicker, title, date=None, small=False):
    d = ""
    if date is not None:
        d = f'<div class="dt">{il("Datum")}{hw(date)}</div>'
    return (f'<header class="hd{" sm" if small else ""}"><div><p class="k">{esc(kicker)}</p><h2>{esc(title)}</h2></div>{d}</header>')


def step(no, ic, title, body, end=False, cls=""):
    n = f'<span class="no">{no}</span>' if no else ""
    return (f'<section class="st{" end" if end else ""}{" " + cls if cls else ""}">'
            f'<div class="sn"><span class="ring">{icon(ic)}</span>{n}<span class="tt">{esc(title)}</span></div>'
            f'<div class="sc">{body}</div></section>')


def page(side, folio, label, inner, cls="", runner="Adventszeit"):
    f = f'<span class="folio">{folio}</span>' if folio else ""
    r = f'<span class="runner">{esc(runner)}</span>' if runner else ""
    return (f'<section class="page {side}{" " + cls if cls else ""}" aria-label="{esc(label)}">'
            f'<div class="in">{inner}{r}{f}</div></section>')


def side(folio):
    return "r" if folio % 2 else "l"


# ------------------------------------------------------------------ front matter

def p_title():
    m = A["motto"][1]
    inner = f"""
<div class="title">
  <p class="k">Henoch</p>
  <h1>Im Advent</h1>
  <p class="sub">Vom 1. Sonntag im Advent bis zum Heiligen Abend</p>
  <span class="ring big">{icon("candle")}</span>
  <p class="theme">{esc(A["advent"]["theme"])}</p>
  <figure class="motto"><blockquote>{esc(m["text"])}</blockquote><figcaption>{esc(m["ref"])}</figcaption></figure>
  <div class="owner">{il("Dieses Heft gehört")}<span class="grow"></span></div>
  <p class="solas" lang="la"><span>Sola scriptura</span> · <span>Sola gratia</span> · <span>Sola fide</span> · <span>Solus Christus</span></p>
</div>"""
    return page("r", "", "Seite 1: Titel", inner, "cover", runner="")


def p_season():
    c = A["advent"]["circle"]
    rows = ""
    for i, s in enumerate(SUNDAYS):
        rows += (f'<div class="sun"><div class="sh"><b>{i + 1}. Sonntag im Advent</b><span>S. {week_start(i)}</span></div>'
                 f'<p class="st-theme">{esc(s["theme"])}</p>'
                 f'<p class="sv">„{esc(s["verse"]["text"])}“ <span class="att">{esc(s["verse"]["ref"])}</span></p>'
                 f'<p class="sr"><span>Evangelium</span> {esc(s["gospel"])} <span>Epistel</span> {esc(s["epistle"])}</p></div>')
    inner = f"""
{header(c["title"] + " · " + c["of"], "Die Adventszeit")}
<p class="lead">{esc(A["advent"]["season"])}</p>
<p class="small muted">{esc(c["intro"])}</p>
<div class="sub">Die vier Sonntage</div>
{rows}
"""
    return page("l", 2, "Seite 2: Die Adventszeit", inner)


def p_way():
    o = A["orders"]
    icons = ["openHands", "bible", "foldedHands", "candle", "compass", "blessing"]
    steps = ""
    for i, s in enumerate(o["morning"]):
        body = (f'<p class="wt"><b>{esc(s["title"])}</b><span>{s["minutes"]} Min.</span></p>'
                f'<p class="arc">{esc(ARC[i])}</p><p class="parts">{esc(" · ".join(s["parts"]))}</p>')
        steps += step(i + 1, icons[i], "", body, end=i == len(o["morning"]) - 1, cls="way")
    short = " · ".join(s["title"] for s in o["morningShort"])
    inner = f"""
{header("Stille Zeit · " + str(o["minutes"]["morning"]["full"]) + " Minuten", "Der Weg durch die Stille Zeit")}
<div class="steps">{steps}</div>
<p class="send">{esc(R["sendOff"])}</p>
<div class="sub">Die Kurzform · {o["minutes"]["morning"]["short"]} Minuten</div>
<p class="small">{esc(short)}</p>
{rub(R["morningShort"])}
<p class="small muted">{esc(R["morningShortDrops"])} {esc(R["morningMinimal"])}</p>
<div class="sub">Im Heft</div>
<p class="small">Jeder Tag hat eine Doppelseite. Oben links steht „Heute“ mit Gebetszeiten und Gewohnheiten, darunter Eröffnung und Wort; rechts Gebet, Antwort, Ausrichtung und Segen, unten der Abend. Was auf den Tagesseiten nur genannt wird, steht vorn in der Ordnung, S. 6–11. Hinten liegt die Arena, S. {P_ARENA}.</p>
"""
    return page("r", 3, "Seite 3: Der Weg durch die Stille Zeit", inner)


def p_method():
    m = A["method"]
    passes = "".join(f'<li><b>{esc(a)}</b> {esc(b)}</li>' for a, b in m["passes"])
    colors = "".join(f'<div class="cc"><i style="background:{c["hex"]}"></i><b>{esc(c["color"])}</b><span>{esc(c["meaning"])}</span></div>'
                     for c in m["colors"])
    mk = "".join(f'<div class="mm"><b>{esc(x["mark"])}</b><span>{esc(x["meaning"])}</span></div>' for x in m["marks"])
    qs = "".join(f"<li>{esc(q)}</li>" for q in m["questions"])
    inner = f"""
{header("Das Wort", "Die Bibel lesen")}
{rub(m["rubrics"]["frame"])}
<p class="small">{esc(m["rubrics"]["portion"])} {esc(m["rubrics"]["restart"])}</p>
<p class="small muted">{esc(m["rubrics"]["paper"].replace(" Die App zeigt nur, wo.", ""))}</p>
<div class="sub">{esc(m["rubrics"]["threeTimes"].split(":")[0])}</div>
<ol class="passes">{passes}</ol>
<div class="sub">Farbcode</div>
<div class="colors">{colors}</div>
<div class="sub">Zeichen am Rand</div>
<div class="mmarks">{mk}</div>
<div class="sub">Die Doppelfrage</div>
<p class="small">{esc(m["doubleQuestion"])}</p>
<div class="sub">Sieben Fragen an den Text</div>
<p class="small muted">Eine am Tag, je nach Text.</p>
<ol class="qs">{qs}</ol>
<p class="small muted">{esc(m["hardPassages"])}</p>
<p class="credit">{esc(m["credit"])}</p>
"""
    return page("l", 4, "Seite 4: Die Bibel lesen", inner)


def p_wreath():
    m = A["method"]
    # The app's sentence ends in "…, das hier darunter steht": on paper the piece is not printed below.
    matter = m["wreathMatter"].replace(", das hier darunter steht", "")
    k = [("morning.wreath.instruction", None), ("morning.wreath.thanks", None)]
    four = ""
    for path, _ in k:
        four += f'<div class="w4"><b>{esc(F[path]["label"])}</b><span class="pi">{esc(F[path]["placeholder"])}</span></div>'
    four += ('<div class="w4"><b>Beichte – Wo stehe ich dagegen?</b><span class="pi">Ich bekenne dir, daß ich …</span>'
             f'<span class="note">{esc(R["confessionNote"])}</span></div>')
    four += f'<div class="w4 z"><b>Zuspruch</b>{pray(LIT["absolutionWreath"], "abs")}</div>'
    four += f'<div class="w4"><b>{esc(F["morning.wreath.petition"]["label"])}</b><span class="pi">{esc(F["morning.wreath.petition"]["placeholder"])}</span></div>'
    inner = f"""
{header("Das Gebet · Luthers vierfacher Kranz", "Über dem Wort beten")}
<p class="small">{esc(m["wreathIntro"])}</p>
<p class="small">{esc(matter)}</p>
<p class="small muted">{esc(m["wreathRule"])}</p>
{rub(R["wreath"])}
<div class="four">{four}</div>
<p class="small muted">{esc(m["wreathFreedom"])}</p>
<div class="sub">Freies Gebet</div>
{rub(R["freePrayer"])}
<div class="sub">Stille</div>
{pray(LIT["silence"])}
{rub(R["silence"])}
"""
    return page("r", 5, "Seite 5: Über dem Wort beten", inner)


def ord_head(title, minutes, ic, no):
    m = f'<span class="min">{minutes} Min.</span>' if minutes else ""
    return f'<div class="oh"><span class="ring">{icon(ic)}</span><span class="no">{no}</span><h3>{esc(title)}</h3>{m}</div>'


def p_order_word():
    o = A["orders"]["morning"]
    ps = A["psalms"]["morning"]
    rows = "".join(f'<div class="pr"><b>{WD[d]}</b><span>Psalm {ps[str(d)]["psalm"]}</span><em>{esc(ps[str(d)]["antiphon"])}</em></div>'
                   for d in [1, 2, 3, 4, 5, 6, 0])
    inner = f"""
<p class="ok">Die Ordnung der Stillen Zeit · S. 6–9</p>
{ord_head(o[0]["title"], o[0]["minutes"], "openHands", 1)}
<div class="pt">Versikel und Gloria</div>
{versicles([LIT["openLips"], LIT["help"]])}
{pray(LIT["gloria"])}
<p class="pray-line">{esc(LIT["halleluja"])} <span class="rubi">{esc(LIT["hallelujaRubric"])}</span></p>
<div class="pt">Hymnus <span class="rubi">Wahlweise. Eine Strophe, gesungen oder gesprochen – wenn die Zeit es erlaubt.</span></div>
{pray(LIT["hymnMorning"])}
<p class="tiny muted">{esc(LIT["hymnMorningAlt"])}</p>
<div class="pt">Psalm des Tages</div>
<div class="psalms">{rows}</div>
<p class="tiny muted">{esc(A["psalms"]["rubricMorning"])} {esc(A["psalms"]["rubricAntiphon"])}</p>
{ord_head(o[1]["title"], o[1]["minutes"], "bible", 2)}
<div class="two">
<div><div class="pt">Eingangsgebet</div>{pray(LIT["beforeReading"])}</div>
<div><div class="pt">Schlußgebet</div>{pray(LIT["afterReading"])}</div>
</div>
"""
    return page("l", 6, "Seite 6: Eröffnung und Wort", inner, "ord")


def p_order_response():
    o = A["orders"]["morning"]
    inner = f"""
<p class="ok">Die Ordnung der Stillen Zeit</p>
{ord_head(o[3]["title"], o[3]["minutes"], "candle", 4)}
<div class="pt">Benedictus</div>
<p class="ant"><span class="rubi">Antiphon:</span> {esc(LIT["benedictusAntiphon"])}</p>
{pray(LIT["benedictus"], "small")}
<p class="tiny muted">Gloria Patri, S. 6. {esc(R["benedictus"])}</p>
<div class="pt">Fürbitte für das Haus</div>
{rub(A["house"]["rubric"])}
{pray(A["house"]["forAll"], "small")}
<p class="tiny muted">Wer heute im Mittelpunkt steht und was du für ihn bittest: Mein Haus, S. 12.</p>
<div class="pt">Fürbitte</div>
{versicles([LIT["kyrie"]])}
{rub(R["intercession"])}
<p class="tiny muted">Die Anliegen der Tage stehen in der Gebetsübersicht, S. 13.</p>
<div class="pt">Vaterunser <span class="rubi">S. {P_NIGHT}</span></div>
"""
    return page("r", 7, "Seite 7: Die Antwort", inner, "ord")


def p_order_armor():
    o = A["orders"]["morning"]
    ar = A["armor"]
    pieces = "".join(
        f'<div class="arp"><p class="aph"><b>{esc(p["day"])}: {esc(p["title"])}</b> <span class="att">{esc(p["ref"])}</span></p>'
        f'<p class="apr">{esc(p["prayer"])}</p><p class="apq">{esc(p["question"])}</p></div>'
        for p in ar["week"])
    inner = f"""
<p class="ok">Die Ordnung der Stillen Zeit</p>
{ord_head(o[4]["title"], o[4]["minutes"], "compass", 5)}
<div class="pt">{esc(ar["title"])}</div>
<blockquote class="call">{esc(ar["call"]["text"])} <span class="att">{esc(ar["call"]["ref"])}</span></blockquote>
<p class="tiny muted">{esc(ar["call"]["note"])} Jedes Stück mit seinem Gebet; die Frage darunter gehört in die Prüfung am Abend.</p>
<div class="armor">{pieces}</div>
<div class="pt">Die drei Dinge</div>
{rub(R["alignment"])}
<p class="tiny muted">{esc(R["alignmentNotAVow"])}</p>
"""
    return page("l", P_ARMOR, "Seite 8: Die Ausrichtung", inner, "ord")


def p_order_blessing():
    o = A["orders"]["morning"]
    inner = f"""
<p class="ok">Die Ordnung der Stillen Zeit</p>
{ord_head(o[5]["title"], o[5]["minutes"], "blessing", 6)}
<div class="pt">Kollekte</div>
{pray(LIT["collectMorning"])}
<div class="pt">Beschluß und Segen</div>
{versicles([LIT["benedicamus"], LIT["blessing"]])}
<p class="send">{esc(R["sendOff"])}</p>
<div class="oh bed"><span class="ring">{icon("bed")}</span><h3>Am Bett</h3><span class="min">{A["orders"]["minutes"]["atBed"]["full"]} Min.</span></div>
{rub(R["atBed"])}
<div class="pt">Kreuzzeichen · Vaterunser <span class="rubi">S. {P_NIGHT}</span></div>
{pray(LIT["sign"])}
<div class="pt">Taufgedächtnis</div>
{pray(LIT["baptism"], run=True)}
<div class="pt">Morgensegen</div>
{pray(LIT["morningBlessing"], run=True)}
"""
    return page("r", 9, "Seite 9: Der Segen und Am Bett", inner, "ord")


def p_night_1():
    c = A["orders"]["compline"]
    inner = f"""
<p class="ok">Das Nachtgebet · {A["orders"]["minutes"]["compline"]["full"]} Minuten · S. {P_NIGHT}–{P_NIGHT + 1}</p>
{ord_head(c[0]["title"], "", "cross", 1)}
<div class="pt">Kreuzzeichen</div>
{pray(LIT["sign"])}
<div class="pt">Seid nüchtern und wachet</div>
<blockquote class="call">{esc(A["armor"]["evening"]["text"])} <span class="att">{esc(A["armor"]["evening"]["ref"])}</span></blockquote>
<div class="two">
<div><div class="pt">Glaubensbekenntnis</div>{pray(LIT["creed"], "small")}</div>
<div><div class="pt">Vaterunser</div>{pray(LIT["lordsPrayer"], "small")}</div>
</div>
<p class="tiny muted">{esc(R["complineCreed"])}</p>
{ord_head(c[1]["title"], "", "review", 2)}
<div class="pt">Dank</div>
{rub(R["thanks"])}
<div class="pt">Rückschau</div>
{rub(R["review"])}
<p class="small"><b>{esc(R["reviewMarks"])}</b></p>
<p class="tiny muted">{esc(R["reviewNotSin"])} Beides schreibst du unten auf der Tagesseite, am Sonntag tritt der Wochenrückblick an diese Stelle. Was dich heute bewegt hat, ausführlicher: in der Gebetskammer, S. {P_CHAMBER}.</p>
"""
    return page("l", P_NIGHT, "Seite 10: Das Nachtgebet", inner, "ord")


def p_night_2():
    c = A["orders"]["compline"]
    by = A["examen"]["byWeekday"]
    rows = ""
    for d in [1, 2, 3, 4, 5, 6, 0]:
        s = STATIONS[by[str(d)]]
        rows += (f'<div class="ex"><b>{WD[d]}</b><span><i>{esc(s.get("label") or "Als " + s["title"])}:</i> '
                 f'{esc(s["question"])}</span></div>')
    inner = f"""
<p class="ok">Das Nachtgebet</p>
{ord_head(c[2]["title"], "", "tablets", 3)}
<p class="tiny muted">{esc(A["examen"]["intro"])}</p>
<div class="exam">{rows}</div>
<p class="tiny muted">Dazu die Frage zum Stück der Waffenrüstung, S. 8.</p>
<p class="silent">{esc(A["examen"]["note"])}</p>
<div class="pt">Bekenntnis</div>
{pray(LIT["confession"], run=True)}
<div class="pt">Zuspruch</div>
{rub(R["absolutionAloud"])}
{pray(LIT["absolutionEvening"], "abs")}
<p class="tiny">{esc(R["absolutionWeight"])}</p>
{ord_head(c[3]["title"], "", "moon", 4)}
<p class="small"><span class="rubi">{esc(R["baptism"])}</span> Taufgedächtnis, S. 9. <span class="muted">{esc(R["complineIntercession"])}</span></p>
{pray(LIT["eveningBlessing"], run=True)}
<div class="pt">Segen über das Haus</div>
{pray(A["house"]["blessing"], "small")}
<p class="send">{esc(R["goodNight"])}</p>
"""
    return page("r", P_NIGHT + 1, "Seite 11: Prüfung und Zuspruch", inner, "ord")


HOUSE_EX = {"wife": ("A.", "Kraft für die Wochen vor dem Fest"),
            "kids": [("J.", "Sohn", "Klassenarbeit am Donnerstag"), ("M.", "Tochter", "Freundschaften in der neuen Klasse"),
                     ("", "", ""), ("", "", "")]}


def p_house():
    k = ""
    for i, (name, role, concern) in enumerate(HOUSE_EX["kids"]):
        k += (f'<div class="kid">{ln(il(f"Kind {i + 1}") + hw(name) + "<span class=grow></span>" + box(role == "Sohn") + il("Sohn") + box(role == "Tochter") + il("Tochter"))}'
              f'{ln(pi("Aktuelles Anliegen") + hw(concern))}</div>')
    focus = [("Montag", "meine Frau"), ("Dienstag bis Freitag", "je ein Kind"), ("Samstag", "unsere Ehe"), ("Sonntag", "das ganze Haus")]
    fr = "".join(f'<div class="fc"><b>{a}</b><span>{b}</span></div>' for a, b in focus)
    inner = f"""
{header("Für die Fürbitte", "Mein Haus", small=True)}
<p class="small">Die Namen setzt du in der Fürbitte für das Haus ein, S. 7. Das Anliegen gehört zu dem, der an seinem Tag im Mittelpunkt steht.</p>
<div class="sub">Meine Frau</div>
{ln(il("Name") + hw(HOUSE_EX["wife"][0]))}
{ln(pi("Aktuelles Anliegen") + hw(HOUSE_EX["wife"][1]))}
{ln()}
<div class="sub">Kinder</div>
{k}
<div class="sub">Im Mittelpunkt</div>
<div class="focus">{fr}</div>
{rub(A["house"]["rubric"])}
"""
    return page("l", 12, "Seite 12: Mein Haus", inner)


PRAYER_EX = {"daily": ["Mein Haus · unsere Gemeinde"], 1: ["Verfolgte Kirche · Missionare"], 2: ["Obrigkeit"], 3: ["Nachbarn"],
             4: ["Ungläubige im Bekanntenkreis"], 5: ["Kranke"], 6: ["Patenkinder"], 0: ["Gottesdienst und Prediger"]}


def p_prayerlist():
    rows = lab("Täglich") + lines(3, PRAYER_EX["daily"])
    for d in [1, 2, 3, 4, 5, 6, 0]:
        rows += lab(WD[d]) + lines(2, PRAYER_EX.get(d, []))
    inner = f"""
{header("Anliegen nach Tagen", "Gebetsübersicht", small=True)}
<p class="small">Schreibe deine Anliegen einmal auf und lege sie auf die Tage, an denen du für sie betest; ein Tag kann mehrere tragen. Bei der Fürbitte in der Stillen Zeit schlägst du hier auf.</p>
<p class="small muted">Zum Beispiel: verfolgte Kirche, Missionare, Obrigkeit, Nachbarn, Ungläubige im Bekanntenkreis, Kranke, Patenkinder.</p>
{rows}
"""
    return page("r", P_PRAYERLIST, "Seite 13: Gebetsübersicht", inner)


# ------------------------------------------------------------------ Heute

PRESETS = A["habits"]["presets"]
RHYTHM = A["habits"]["rhythm"]
GROUP = {"focus": "Im Blick", "daily": "Täglich", "weekly": "Wöchentlich", "monthly": "Monatlich"}
# The book's week begins on Sunday, with the Word.
WEEK_DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
# Lines of the week's overview: one in view, then by rhythm. Stille Zeit, Vesper and Nachtgebet are ticked in the tiles of the day.
ROWS = {"focus": 1, "daily": 6, "weekly": 3, "monthly": 2}
HABIT_SLOTS = 8
# The example in blue: the habits the app starts with that are ticked by hand.
HABIT_EX = [h for h in PRESETS if h["active"] and not h["auto"]]


def ring(on=False):
    """A tick as in the app: an open ring, done a filled one with a check."""
    return f'<span class="rg{" on" if on else ""}"></span>'


def tb(t=""):
    """A short line to write a time on."""
    return f'<span class="tb">{hw(t)}</span>'


def today_top(e):
    """The two tiles at the top of "Heute" in the app: the time to write in, the prayer to tick."""
    t = e.get("tiles", {})
    ev = t.get("ev", ("", ""))
    tiles = (f'<div class="tile2"><span class="tt2">{tb(t.get("st", ""))} · 45 Min.</span><b>Stille Zeit</b>'
             f'<span class="ts2">{ring(t.get("morning"))}gebetet</span></div>'
             f'<div class="tile2"><span class="tt2">{tb(ev[0])} · {tb(ev[1])}</span><b>Vesper und Nachtgebet</b>'
             f'<span class="ts2">{ring(t.get("vespers"))}Vesper<span class="gap"></span>{ring(t.get("compline"))}Nachtgebet</span></div>')
    return f'<div class="today2"><div class="tiles2">{tiles}</div></div>'


def p_today():
    t = A["times"]
    v = A["sectionVerses"]["times"]
    head = "".join(f"<b>{esc(x['label'])}</b>" for x in t)
    rows = "".join(f'<span class="tr2">{d}</span>' + "".join('<span class="tm"></span>' for _ in t)
                   for d in ["Montag bis Samstag", "Sonntag"])
    inner = f"""
{header("So beginnt ein Tag", "Heute")}
<p class="lead">Jede Tagesseite beginnt mit zwei Kacheln: der Stillen Zeit am Morgen, Vesper und Nachtgebet am Abend. Darunter folgt die Stille Zeit.</p>
{today_top(EX_WEEK1[1])}
<div class="sub">Die Kacheln</div>
<p class="small">Oben links die Uhrzeit, wenn du sie festhalten willst. Ist ein Gebet gebetet, füllst du seinen Ring aus. Was offen bleibt, bleibt ein leerer Ring, nie rot.</p>
<div class="sub">Heute lesen und die drei Dinge</div>
<p class="small">Die Lesung steht links unter dem Wort, mit Altem und Neuem Testament. {esc(A["method"]["rubrics"]["restart"])} Die drei Dinge stehen rechts unter der Ausrichtung. Sie werden in der Stillen Zeit festgelegt, nach dem Wort.</p>
<div class="sub">Gewohnheiten</div>
<p class="small">Nach jedem Sonntag kommt eine Doppelseite für die Woche: links trägst du deine Gewohnheiten ein und hakst sie ab, rechts schaust du am Ende der Woche zurück.</p>
<div class="sub">Zeiten</div>
<p class="verse-s">{esc(v["text"])} <span class="att">{esc(v["ref"])}</span></p>
<div class="times" style="grid-template-columns:calc(27 * var(--mm)) repeat({len(t)},minmax(0,1fr))"><span></span>{head}{rows}</div>
<p class="note">{esc(A["noScore"])}</p>
"""
    return page("l", P_TODAY, f"Seite {P_TODAY}: Heute", inner)


def p_habits():
    v = A["sectionVerses"]["habits"]
    rows = ""
    for i in range(HABIT_SLOTS):
        h = HABIT_EX[i] if i < len(HABIT_EX) else None
        opts = ""
        for r in ["daily", "weekly", "monthly"]:
            on = bool(h) and h["rhythm"] == r
            extra = f', <span class="hx">{hw("1") if on and r == "weekly" else ""}</span>-mal in der Woche' if r == "weekly" else ""
            opts += f'<span class="opt2">{ring(on)}{esc(RHYTHM[r])}{extra}</span>'
        focus = bool(h) and h["id"] == "blessChildren"
        opts += f'<span class="opt2 fo">{ring(focus)}{icon("star", "ic st")}im Blick</span>'
        rows += f'<div class="hab">{ln(hw(h["name"]) if h else "")}<div class="rhy">{opts}</div></div>'
    inner = f"""
{header("Für den Advent", "Gewohnheiten")}
<p class="verse-s">{esc(v["text"])} <span class="att">{esc(v["ref"])}</span></p>
<p class="small">Lege deine Gewohnheiten an, jede mit ihrem Rhythmus: täglich, wöchentlich oder monatlich. Was dir gerade besonders wichtig ist, steht „im Blick“. Auf der Seite „Gewohnheiten“ nach jedem Sonntag trägst du sie ein und hakst sie ab. Eine Gewohnheit gilt immer nur für ihren Tag, ihre Woche oder ihren Monat.</p>
<p class="small muted">Stille Zeit, Vesper und Nachtgebet brauchst du hier nicht: Sie stehen in den Kacheln jeder Tagesseite. Zum Beispiel: Psalm mit den Kindern.</p>
<div class="habs">{rows}</div>
"""
    return page("r", P_HABITS, f"Seite {P_HABITS}: Gewohnheiten", inner)


def p_week_habits(i, folio, e=None):
    """The app's Wochenübersicht: your habits by rhythm, a ring for every day, "diese Woche" and "diesen Monat"."""
    e = e or {}
    names, ticks = e.get("names", {}), e.get("ticks", {})
    body = '<span class="th0"></span>' + "".join(f'<b class="thd">{d}</b>' for d in WEEK_DAYS)
    for g in ["focus", "daily", "weekly", "monthly"]:
        star = icon("star", "ic st") if g == "focus" else ""
        body += f'<p class="tg{" focus" if g == "focus" else ""}">{star}{GROUP[g]}</p>'
        for r in range(ROWS[g]):
            n = names.get(g, [])
            body += f'<span class="tn">{hw(n[r] if r < len(n) else "")}</span>'
            if g in ("focus", "daily"):
                body += "".join(f'<span class="tc">{ring(d in ticks.get((g, r), ()))}</span>' for d in range(7))
            else:
                label = "diese Woche" if g == "weekly" else "diesen Monat"
                body += f'<span class="tpl">{ring((g, r) in ticks)}<span class="tpw">{label}</span></span>'
    inner = f"""
{header(f"Woche des {i + 1}. Advent", "Gewohnheiten", e.get("date", ""))}
<p class="small">Trage deine Gewohnheiten für diese Woche ein, wie du sie auf S. {P_HABITS} angelegt hast, und hake sie ab: die täglichen Tag für Tag, die wöchentlichen und monatlichen einmal.</p>
<div class="htab">{body}</div>
<p class="small muted">Stille Zeit, Vesper und Nachtgebet hakst du in den Kacheln der Tagesseiten ab.</p>
"""
    return page(side(folio), folio, f"Seite {folio}: Woche des {i + 1}. Advent, Gewohnheiten", inner)


def p_week_look(i, folio, e=None):
    """The app's "Die letzten vier Wochen", for one week: a field for every day, three plain numbers, the verses taken along."""
    e = e or {}
    days, verses, stats = e.get("days", {}), e.get("verses", []), e.get("stats", {})
    sq = "".join(f'<span class="sqd"><span class="sq {days.get(d, "")}"></span><b>{WEEK_DAYS[d]}</b></span>' for d in range(7))
    marks3 = "".join(f'<span class="m3"><span class="mb {c}">{m}</span>{tb(stats.get(c, ""))}{w}</span>'
                     for m, c, w in [("+", "plus", "geschehen"), ("~", "tilde", "angefangen"), ("–", "minus", "nicht geschehen")])
    vrows = "".join(f'<span class="vd">{WEEK_DAYS[d]}</span><span class="vl">{hw(verses[d][0]) if d < len(verses) else ""}</span>'
                    f'<span class="vl">{hw(verses[d][1]) if d < len(verses) else ""}</span>' for d in range(7))
    inner = f"""
{header(f"Woche des {i + 1}. Advent", "Diese Woche")}
<p class="small muted">Für das Ende der Woche. Ein Feld für jeden Tag: ganz ausgefüllt, wenn du morgens und abends gebetet hast, halb für eines von beiden. Leer bleibt leer.</p>
<div class="look">
  <div class="sqs">{sq}</div>
  <p class="lgd"><span class="lg"><span class="sq both"></span>Morgen und Abend</span><span class="lg"><span class="sq one"></span>eines von beiden</span></p>
  <div class="stats2">
    <div><span class="sn2">{tb(stats.get("still", ""))}</span><span>Stille Zeiten in dieser Woche</span></div>
  </div>
  <div class="marks3">{marks3}</div>
  <p class="m3l">Drei Dinge in dieser Woche</p>
</div>
<div class="sub">Verse der Woche</div>
<div class="vtab"><b></b><b>Stelle</b><b>Vers, den ich mitnehme</b>{vrows}</div>
<p class="note">{esc(A["noScore"])}</p>
"""
    return page(side(folio), folio, f"Seite {folio}: Woche des {i + 1}. Advent, Diese Woche", inner)


# ------------------------------------------------------------------ the day

def focus_of(wd):
    return {0: "das ganze Haus", 1: "meine Frau", 6: "unsere Ehe"}.get(wd, "ein Kind")


def day_left(wd, kicker, folio, title=None, e=None):
    e = e or {}
    ps = A["psalms"]["morning"][str(wd)]
    stelle = f'<span class="aside">{il("Stelle")}<span class="sl">{hw(e.get("ref", ""))}</span></span>'
    more = "".join(ln(f'<span class="mg">{m}</span>' + il(lbl) + hw(e.get(key, "")))
                   for m, lbl, key in [("?", "Unklar", "q"), ("!", "Fordert mich heraus", "x"), ("→", "Umsetzung", "to")])
    opening = step(1, "openHands", "Eröffnung",
                   f'<p class="ps">Versikel und Gloria · <b>Psalm {ps["psalm"]}</b></p>'
                   f'<p class="ant"><span class="rubi">Antiphon:</span> {esc(ps["antiphon"])}</p>')
    word = step(2, "bible", "Das Wort",
                pray(LIT["beforeReading"], run=True)
                + ln(il("Heute lesen") + f'<span class="half">{il("AT")}{hw(e.get("at", ""))}</span>'
                     + f'<span class="half">{il("NT")}{hw(e.get("nt", ""))}</span>')
                + rub(A["method"]["rubrics"]["threeTimes"], "sm")
                + field("morning.mainPoint", 2, e.get("main", ()))
                + field("morning.verse", 2, e.get("verse", ()), aside=stelle)
                + field("morning.aboutGod", 3, e.get("god", ()))
                + field("morning.aboutMan", 3, e.get("man", ()))
                + '<p class="more">Zeichen am Rand</p>'
                + more
                + pray(LIT["afterReading"], run=True), end=True)
    inner = header(kicker, title or WD[wd], e.get("date", "")) + today_top(e) + f'<div class="steps">{opening}{word}</div>'
    return page(side(folio), folio, f"Seite {folio}: {title or WD[wd]}, Wort", inner, "day")


def day_right(wd, folio, sunday=False, review_folio=None, e=None):
    e = e or {}
    piece = ARMOR[wd]
    station = STATIONS[A["examen"]["byWeekday"][str(wd)]]
    st_label = station.get("label") or "als " + station["title"]
    st_label = st_label[0].lower() + st_label[1:]
    w = e.get("wreath", {})
    which = e.get("which")
    gebet = step(3, "foldedHands", "Das Gebet",
                 rub(R["wreath"], "sm")
                 + ln(il("Worüber du betest") + box(which == "vers") + '<span class="opt">mein Vers</span>'
                      + box(which == "kat") + '<span class="opt">Katechismus:</span>' + hw(e.get("kat", "")))
                 + field("morning.wreath.instruction", 2, w.get("i", ()))
                 + field("morning.wreath.thanks", 2, w.get("t", ()))
                 + lab("Beichte – Wo stehe ich dagegen?", f'<span class="silent">{esc(R["confessionNote"])}</span>')
                 + pray(LIT["absolutionWreath"], "abs", run=True)
                 + field("morning.wreath.petition", 2, w.get("p", ()))
                 + field("Freies Gebet · " + F["morning.onMyHeart"]["label"], 2, e.get("heart", ()))
                 + pray(LIT["silence"], run=True))
    antwort = step(4, "candle", "Die Antwort",
                   f'<p class="seq">Benedictus · Fürbitte für das Haus ({focus_of(wd)}) · '
                   f'Anliegen, S. {P_PRAYERLIST} · Vaterunser</p>'
                   + field("morning.peopleToday", 1, e.get("people", ())))
    three = ""
    for (key, path), (val, mk) in zip([("word", "morning.three.word"), ("house", "morning.three.house"), ("work", "morning.three.work")],
                                      e.get("three", [("", None)] * 3)):
        three += ln(il(F[path]["label"]) + hw(val) + '<span class="grow"></span>' + marks(mk))
    ausr = step(5, "compass", "Die Ausrichtung",
                f'<p class="arm"><b>{esc(piece["title"])}</b> <span class="att">{esc(piece["ref"])} · S. {P_ARMOR}</span></p>'
                + three)
    segen = step(6, "blessing", "Der Segen",
                 f'<p class="seq">Kollekte · Beschluß und Segen. <b>{esc(R["sendOff"])}</b></p>', end=True)
    if sunday:
        eve = (f'<p class="seq">Am Sonntag tritt der <b>Wochenrückblick</b>, S. {review_folio}, an die Stelle von Dank und Rückschau. '
               f'Dann die Prüfung {esc(st_label)}, Bekenntnis und Zuspruch. Nachtgebet, S. {P_NIGHT}–{P_NIGHT + 1}.</p>')
    else:
        th = e.get("thanks", ())
        eve = ("".join(ln(pi(F[f"evening.thanks.{i}"]["label"]) + hw(th[i] if i < len(th) else "")) for i in range(3))
               + f'<p class="seq"><b>Rückschau:</b> ein Zeichen bei den drei Dingen. '
               f'Prüfung {esc(st_label)}, Bekenntnis und Zuspruch: S. {P_NIGHT + 1}.</p>')
    evening = f'<div class="fill"></div><div class="eve">{step("", "moon", "Am Abend", eve, end=True)}</div>'
    inner = f'<div class="steps">{gebet}{antwort}{ausr}{segen}</div>{evening}'
    return page(side(folio), folio, f"Seite {folio}: {WD[wd]}, Gebet und Ausrichtung", inner, "day")


# ------------------------------------------------------------------ Sunday

def guide_block(lead):
    for s in A["sundayGuide"]:
        for b in s["blocks"]:
            if b.get("lead") == lead:
                return f'<p class="gd"><span class="rubi">{esc(b["lead"])}</span> {esc(b["text"])}</p>'
    raise KeyError(lead)


def lesson_items(lection):
    items = []
    for s in lection.get("sections") or []:
        for part in s["parts"]:
            items.append(("h", part["zitat"]) if "zitat" in part else ("p", part["text"]))
    if not items:
        items = [("p", p) for p in lection["paragraphs"]]
    return items


def words(t):
    return len(t.split())


def split_items(items, share):
    """Splits the lesson where `share` of its words are reached, inside a paragraph at the end of a sentence."""
    total = sum(words(t) for _, t in items)
    target = total * share
    first, acc = [], 0
    for i, (kind, t) in enumerate(items):
        n = words(t)
        if acc + n <= target or kind == "h":
            first.append((kind, t, False))
            acc += n
            continue
        sentences = re.split(r"(?<=[.!?;:])\s+(?=[A-ZÄÖÜ„–])", t)
        head, k = [], acc
        for s in sentences:
            if k + words(s) > target and head:
                break
            head.append(s)
            k += words(s)
        if len(head) < len(sentences):
            first.append(("p", " ".join(head), False))
            rest = [("p", " ".join(sentences[len(head):]), True)] + [(a, b, False) for a, b in items[i + 1:]]
        else:
            first.append(("p", t, False))
            rest = [(a, b, False) for a, b in items[i + 1:]]
        return first, rest
    return first, []


def items_html(items):
    out = ""
    after_hymn = False
    for kind, t, cont in items:
        if kind == "h":
            out += '<blockquote class="hym">' + "".join(f'<span class="l">{esc(x)}</span>' for x in t.split(" / ")) + "</blockquote>"
            after_hymn = True
        else:
            out += f'<p class="imp{" cont" if (cont or after_hymn) else ""}">{esc(t)}</p>'
            after_hymn = False
    return out


def source_line(lection):
    return f'<p class="quelle">{esc(lection["source"])} In der Rechtschreibung des Originals.</p>'


def lesson_head(lection, track):
    motto = "".join(f'<figure class="lm"><blockquote>{esc(m["text"])}</blockquote><figcaption>{esc(m["ref"])}</figcaption></figure>'
                    for m in lection.get("motto") or [])
    add = f'<p class="add">{esc(lection["addition"])}</p>' if lection.get("addition") else ""
    return (f'<div class="lh"><p class="k">{esc(track)} · {esc(lection["kind"])}</p><h3>{esc(lection["title"])}</h3>'
            f'<p class="lref">{esc(lection["ref"])}</p></div>{add}{motto}')


SHARE = {"advent1": 0.47, "advent2": 0.5, "advent3": 0.5, "advent4": 0.5}


def sunday_pages(i, ex=None):
    """Eight pages: opener, Andacht (2), Betrachtung, Stille Zeit (2), Gottesdienst, Wochenrückblick."""
    s = SUNDAYS[i]
    f0 = week_start(i)
    name = f"{i + 1}. Sonntag im Advent"
    e = ex or {}
    g, ep = s["gospelLection"], s["epistleLection"]
    four = (f'<p class="note">Der Advent endet mit dem Heiligen Abend. Er fällt auf einen der Tage dieser Woche; '
            f'die Seiten danach bleiben frei. Das Christfest steht auf S. {P_END}.</p>' if i == 3 else "")
    opener = f"""
{header(f"Sonntag · Woche des {i + 1}. Advent", name, e.get("date", ""))}
<p class="theme">{esc(s["theme"])}</p>
<figure class="wsp"><blockquote>{esc(s["verse"]["text"])}</blockquote><figcaption>Wochenspruch · {esc(s["verse"]["ref"])}</figcaption></figure>
<div class="tiles">
  <div class="tile"><span class="tr">Evangelium</span><b>{esc(s["gospel"])}</b><span class="sm">{esc(s["summary"]["gospel"])}</span></div>
  <div class="tile"><span class="tr">Epistel</span><b>{esc(s["epistle"])}</b><span class="sm">{esc(s["summary"]["epistle"])}</span></div>
</div>
{guide_block("Samstagabend: die Vorbereitung.")}
{guide_block("Sonntagmorgen.")}
{four}
<div class="fill"></div>
{field("evening.devotionNotes", 6, e.get("notes", ()))}
<p class="next">{esc(g["hint"].replace(" lesen", ""))}, S. {f0 + 1} · {esc(ep["hint"].replace(" lesen", ""))}, S. {f0 + 3} · Stille Zeit, S. {f0 + 4}</p>
"""
    first, rest = split_items(lesson_items(g), SHARE[s["key"]])
    les1 = lesson_head(g, "Evangelium") + items_html(first)
    les2 = items_html(rest) + source_line(g)
    loehe = lesson_head(ep, "Epistel") + items_html([("p", t, False) for _, t in lesson_items(ep)]) + source_line(ep)
    ge = e.get("service", {})
    service = f"""
{header(name, "Der Gottesdienst", small=True)}
{guide_block("Der Gottesdienst.")}
{ln(il("Predigttext") + hw(ge.get("text", "")))}
{guide_block("Am Tisch und am Nachmittag.")}
{field("Was ist hängen geblieben?", 3, ge.get("stuck", ()))}
{field("Was hat getröstet?", 2, ge.get("comfort", ()))}
{field("Was hat getroffen?", 2, ge.get("hit", ()))}
{field("Was die Kinder gehört haben", 2, ge.get("kids", ()))}
{ln(il("Ein Stück aus dem Katechismus") + hw(ge.get("cat", "")))}
{guide_block("Sonntagabend.")}
{field("Ein Wort für die neue Woche", 2, ge.get("word", ()))}
"""
    wr = A["weekReview"]
    rv = e.get("review", {})
    places = "".join(field("evening." + p["field"], 2, rv.get(p["field"], ()), aside=f'<span class="att">{esc(p["ref"])}</span>')
                     for p in wr["places"])
    review = f"""
{header("Sonntagabend · Nachtgebet", "Wochenrückblick", small=True)}
{rub(wr["texts"]["rubric"])}
{places}
<div class="sub">{esc(wr["texts"]["ahead"])}</div>
{field("evening.weekResolve", 2, rv.get("resolve", ()))}
<p class="note">{esc(wr["comfort"]["lead"])}</p>
{pray({"lines": [wr["comfort"]["verse"]["text"]], "ref": wr["comfort"]["verse"]["ref"]}, "abs", run=True)}
<p class="seq">Dann die Prüfung, Bekenntnis und Zuspruch, S. {P_NIGHT + 1}.</p>
"""
    return [
        page("l", f0, f"Seite {f0}: {name}", opener, "open"),
        page("r", f0 + 1, f"Seite {f0 + 1}: {name}, Andacht", les1, "lesson"),
        page("l", f0 + 2, f"Seite {f0 + 2}: {name}, Andacht", les2, "lesson"),
        page("r", f0 + 3, f"Seite {f0 + 3}: {name}, Betrachtung", loehe, "lesson"),
        day_left(0, name, f0 + 4, "Sonntag", e.get("day")),
        day_right(0, f0 + 5, sunday=True, review_folio=f0 + 7, e=e.get("day")),
        page("l", f0 + 6, f"Seite {f0 + 6}: {name}, Gottesdienst", service),
        page("r", f0 + 7, f"Seite {f0 + 7}: {name}, Wochenrückblick", review),
    ]


def week_pages(i, ex=None):
    ex = ex or {}
    out = sunday_pages(i, ex.get(0))
    f = week_start(i) + 8
    out += [p_week_habits(i, f, ex.get("habits")), p_week_look(i, f + 1, ex.get("look"))]
    f += 2
    for wd in range(1, 7):
        e = ex.get(wd)
        out += [day_left(wd, f"Woche des {i + 1}. Advent", f, e=e), day_right(wd, f + 1, e=e)]
        f += 2
    return out


# ------------------------------------------------------------------ end

def p_christmas():
    c = A["advent"]["christmas"]
    inner = f"""
{header("Weihnachtskreis", "Das Christfest")}
<p class="theme">{esc(c["theme"])}</p>
<figure class="wsp big"><blockquote>{esc(c["verse"]["text"])}</blockquote><figcaption>{esc(c["verse"]["ref"])}</figcaption></figure>
<div class="tiles">
  <div class="tile"><span class="tr">Evangelium</span><b>{esc(c["gospel"])}</b></div>
  <div class="tile"><span class="tr">Epistel</span><b>{esc(c["epistle"])}</b></div>
</div>
<p class="lead">{esc(c["season"])}</p>
<div class="fill"></div>
<span class="ring big">{icon("star")}</span>
<div class="fill"></div>
"""
    return page("l", P_END, f"Seite {P_END}: Das Christfest", inner, "xmas")


# ------------------------------------------------------------------ Arena (no archive: the book keeps everything)

def comfort(items):
    """The words of comfort at the foot of an entry, as in the app."""
    return '<div class="pray abs run">' + "".join(f'<p>{esc(c["text"])} <span class="att">{esc(c["ref"])}</span></p>' for c in items) + "</div>"


def index(head, folios, ex=()):
    rows = "".join(f'<span class="ix">{hw(ex[i][0]) if i < len(ex) else ""}</span><span class="ix">{hw(ex[i][1]) if i < len(ex) else ""}</span>'
                   f'<span class="ixp">S. {f}</span>' for i, f in enumerate(folios))
    return f'<div class="index"><b>{esc(head[0])}</b><b>{esc(head[1])}</b><b></b>{rows}</div>'


def p_arena():
    v = A["sectionVerses"]["arena"]
    j, f = AR["journal"], AR["forge"]
    tiles = "".join(f'<div class="ptile"><span class="ring">{icon(ic)}</span><span class="pt2"><b>{esc(t)}</b><span>{esc(line)}</span></span>'
                    f'<span class="pg2">S. {pg}</span></div>'
                    for ic, t, line, pg in [("candle", j["title"], j["tile"], P_CHAMBER), ("people", f["title"], f["tile"], P_FORGE)])
    inner = f"""
{header("Henoch", "Arena")}
<figure class="wsp"><blockquote>{esc(v["text"])}</blockquote><figcaption>{esc(v["ref"])}</figcaption></figure>
<div class="ptiles">{tiles}</div>
"""
    return page("r", P_ARENA, f"Seite {P_ARENA}: Arena", inner, runner="Arena")


CHAMBER_EX = [{"date": "Mittwoch, 2. 12.", "verses": ["Römer 8,37"],
               "concerns": ["Das Gespräch mit T. am Freitag", "Ruhe vor dem Schlafengehen"],
               "text": ["Am Freitag das Gespräch mit T. Ich merke, wie ich innerlich schon", "meine Sätze vorbereite. Ich will zuhören, bevor ich antworte.",
                        "Heute Morgen gebetet und ruhiger geworden."]}]
FORGE_EX = [{"date": "Samstag, 5. 12.", "verses": ["Galater 6,2"], "concerns": ["M.: Schlaf, das Kleinkind zahnt", "D.: die Bewerbung"],
             "points": [("Abendgebet mit den Kindern: wie anfangen?", True), ("Wie lade ich einen Bruder ein?", False),
                        ("Rat für das Gespräch mit T.", False)]}]


def p_chamber():
    j = AR["journal"]
    folios = list(range(P_CHAMBER + 1, P_CHAMBER + 1 + CHAMBER_PAGES))
    inner = f"""
{header(j["tile"], j["title"])}
<p class="lead">{esc(j["note"])}</p>
<p class="small muted">Was dich am Abend bewegt hat, schreibst du hier ausführlicher weiter.</p>
<div class="sub">Einträge</div>
{index(("Datum", "Erste Zeile"), folios, [("2. 12.", "Das Gespräch mit T.")])}
"""
    return page("l", P_CHAMBER, f"Seite {P_CHAMBER}: Gebetskammer", inner, runner="Arena")


def date_head(kicker, label, date):
    return (f'<header class="hd"><div class="dh"><p class="k">{esc(kicker)}</p>'
            f'<div class="tl">{il(label)}{hw(date)}</div></div></header>')


def p_chamber_entry(folio, e=None):
    e = e or {}
    j = AR["journal"]
    inner = f"""
{date_head(j["title"], "Datum", e.get("date", ""))}
{field(AR["verses"], 2, e.get("verses", ()), prompt=AR["verseHint"], hint=True)}
{field(AR["concerns"], 3, e.get("concerns", ()), prompt=j["concernHint"], hint=True)}
{field(j["textLabel"], 19, e.get("text", ()), prompt=j["textHint"], hint=True)}
<div class="fill"></div>
{comfort(j["comfort"])}
"""
    return page(side(folio), folio, f"Seite {folio}: Gebetskammer, Eintrag", inner, runner="Arena")


def p_forge():
    f = AR["forge"]
    v = A["sectionVerses"]["forge"]
    folios = list(range(P_FORGE + 1, P_FORGE + 1 + FORGE_PAGES))
    inner = f"""
{header(f["tile"], f["title"])}
<p class="verse-s">{esc(v["text"])} <span class="att">{esc(v["ref"])}</span></p>
<p class="lead">{esc(f["note"])}</p>
<div class="sub">Treffen</div>
{index((f["meeting"], "Erster Punkt"), folios, [("5. 12.", "Abendgebet mit den Kindern")])}
"""
    return page("l", P_FORGE, f"Seite {P_FORGE}: Eisenschmiede", inner, runner="Arena")


def p_forge_entry(folio, e=None):
    e = e or {}
    f = AR["forge"]
    pts = e.get("points", [])
    points = "".join(ln(box(pts[i][1] if i < len(pts) else False)
                        + (pi(f["pointHint"]) if i == 0 and not pts else "") + hw(pts[i][0] if i < len(pts) else ""))
                     for i in range(17))
    inner = f"""
{date_head(f["kind"], f["meeting"], e.get("date", ""))}
{field(AR["verses"], 2, e.get("verses", ()), prompt=AR["verseHint"], hint=True)}
{field(AR["concerns"], 3, e.get("concerns", ()), prompt=f["concernHint"], hint=True)}
{lab(f["points"], '<span class="silent">abgehakt: besprochen</span>')}
<div class="points">{points}</div>
<div class="fill"></div>
{comfort(f["comfort"])}
"""
    return page(side(folio), folio, f"Seite {folio}: Eisenschmiede, Treffen", inner, runner="Arena")


def p_sources():
    srcs = A["sources"] + [SUNDAYS[0]["gospelLection"]["source"], SUNDAYS[0]["epistleLection"]["source"].replace(", S. 283.", ".")]
    items = "".join(f"<li>{esc(x)}</li>" for x in srcs)
    inner = f"""
{header("Henoch", "Texte und Quellen", small=True)}
<ul class="srcs">{items}</ul>
<p class="small muted">Texte, Ordnung und Felder folgen der App Henoch.</p>
<div class="fill"></div>
<p class="solas" lang="la"><span>Sola scriptura</span> · <span>Sola gratia</span> · <span>Sola fide</span> · <span>Solus Christus</span></p>
"""
    return page(side(P_SOURCES), P_SOURCES, f"Seite {P_SOURCES}: Texte und Quellen", inner)


# ------------------------------------------------------------------ examples (blue handwriting, switchable)

EX_WEEK1 = {
    0: {
        "date": "28. 11.", "notes": ["Er kommt sanftmütig – und zu mir."],
        "day": {"date": "29. 11.", "at": "Jesaja 35", "nt": "Römer 13", "tiles": {"st": "6:30", "morning": True},
                "three": [("Sacharja 9,9 auswendig", None), ("die erste Kerze mit allen", None), ("Sonntagsruhe", None)]},
        "service": {"text": "Matthäus 21,1–9", "stuck": ["Er kommt sanftmütig, auf einem Esel."],
                    "comfort": ["Er kommt zu mir, nicht ich zu ihm."], "kids": ["J.: Warum ein Esel?"],
                    "cat": "Der zweite Artikel", "word": ["Sacharja 9,9"]},
        "review": {"weekWife": ["für ihre Geduld in dieser Woche"], "weekChildren": ["J. und M. beim Kranzbinden"],
                   "resolve": ["Abends die Kinder segnen"]},
    },
    1: {"date": "30. 11.", "at": "Jesaja 40", "nt": "Markus 1",
        "tiles": {"st": "5:00", "ev": ("18:30", "21:00"), "morning": True, "vespers": True, "compline": True}, "main": ["Gott tröstet sein Volk und kommt selbst."],
        "ref": "Jesaja 40,3", "verse": ["„Bereitet dem HERRN den Weg“"],
        "god": ["Er kommt gewaltig und weidet seine Herde", "wie ein Hirte (V. 10–11)."],
        "man": ["Alles Fleisch vergeht wie Heu;", "Gottes Wort bleibt (V. 6–8)."],
        "q": "Wer ist die Stimme in V. 3? → Matthäus 3,3", "x": "V. 8: Das Wort bleibt.", "to": "Abends Jesaja 40,1–11 vorlesen",
        "which": "vers", "wreath": {"i": ["dass du selbst kommst (V. 10)"], "t": ["für dein Wort, das bleibt"], "p": ["Weg frei machen: Gespräch mit T."]},
        "heart": ["Termin am Freitag · Sorge um M."], "people": ["T., das Team, Nachbar K."],
        "three": [("Jesaja 40,1–11 am Tisch vorlesen", "+"), ("mit A. den Adventsplan", "+"), ("Bericht für T. fertig", "~")],
        "thanks": ["die erste Kerze am Abend", "ein gutes Wort von T."]},
}


def _preset(i):
    return next(h["name"] for h in PRESETS if h["id"] == i)


EX_WEEK1["habits"] = {
    "date": "29. 11.",
    "names": {"focus": [_preset("blessChildren")], "daily": [_preset("bibleReading"), _preset("tablePrayer"), _preset("familyDevotion")],
              "weekly": [_preset("worship"), _preset("catechismChildren")], "monthly": [_preset("privateConfession"), _preset("lordsSupper")]},
    "ticks": {("focus", 0): {1}, ("daily", 0): {0, 1}, ("daily", 1): {0, 1}, ("daily", 2): {1}, ("weekly", 0): True},
}
EX_WEEK1["look"] = {"days": {0: "one", 1: "both"}, "verses": [("Sacharja 9,9", "„Siehe, dein König kommt zu dir“"), ("Jesaja 40,3", "„Bereitet dem HERRN den Weg“")]}


# ------------------------------------------------------------------ assembly

def all_pages():
    front = [p_title(), p_season(), p_way(), p_method(), p_wreath(), p_order_word(), p_order_response(),
             p_order_armor(), p_order_blessing(), p_night_1(), p_night_2(), p_house(), p_prayerlist(), p_today(), p_habits()]
    weeks = [week_pages(i, EX_WEEK1 if i == 0 else None) for i in range(4)]
    end = ([p_christmas(), p_arena(), p_chamber()]
           + [p_chamber_entry(P_CHAMBER + 1 + i, CHAMBER_EX[i] if i < len(CHAMBER_EX) else None) for i in range(CHAMBER_PAGES)]
           + [p_forge()]
           + [p_forge_entry(P_FORGE + 1 + i, FORGE_EX[i] if i < len(FORGE_EX) else None) for i in range(FORGE_PAGES)]
           + [p_sources()])
    return front, weeks, end


def spreads(pages, first_folio):
    """Pairs the pages into spreads; a right page standing first or a left page standing last is alone."""
    out, i = [], 0
    if first_folio % 2:
        out.append(f'<div class="spread solo-r">{pages[0]}</div>')
        i = 1
    while i < len(pages):
        pair = pages[i:i + 2]
        out.append(f'<div class="spread{" solo-l" if len(pair) == 1 else ""}">{"".join(pair)}</div>')
        i += 2
    return "".join(out)


def block(anchor, kicker, title, text, body):
    return (f'<section class="block" id="{anchor}"><div class="cap"><span class="pg">{kicker}</span>'
            f'<h2>{title}</h2><p>{text}</p></div>{body}</section>')


def css():
    t = "".join(f"{k}:{TOK[k]};" for k in ["--paper", "--sheet", "--ink", "--muted", "--rule", "--rubric", "--rubric-soft", "--accent",
                                          "--done", "--done-soft", "--gold", "--gold-soft", "--icon-gold", "--warm-soft", "--serif", "--sans"])
    return ":root{" + t + "}" + CSS


CSS = r"""
:root{--desk:#E4E1DA;--desk-ink:#1D2330;--desk-muted:#5A606C;--desk-rule:#C9C4BA;--chip:#F2F0EB;--shade:rgba(29,35,48,.16);
  --hand:#2C4A86;--script:"Caveat","Segoe Print","Bradley Hand",cursive}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--desk:#121821;--desk-ink:#E6E1D6;--desk-muted:#9AA2AF;--desk-rule:#2A3443;--chip:#1B2432;--shade:rgba(0,0,0,.5);color-scheme:dark}}
:root[data-theme="dark"]{--desk:#121821;--desk-ink:#E6E1D6;--desk-muted:#9AA2AF;--desk-rule:#2A3443;--chip:#1B2432;--shade:rgba(0,0,0,.5);color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--desk);color:var(--desk-ink);font-family:var(--sans);font-size:16px;line-height:1.5}
.wrap{max-width:1160px;margin:0 auto;padding:40px max(16px,env(safe-area-inset-right,0px)) 72px max(16px,env(safe-area-inset-left,0px))}
.top{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:end;border-bottom:1px solid var(--desk-rule);padding-bottom:22px}
.eyebrow{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--desk-muted);font-weight:600;margin:0 0 6px}
h1{font-family:var(--serif);font-weight:600;font-size:clamp(2rem,4.4vw,3rem);line-height:1.08;margin:0;letter-spacing:-.01em;text-wrap:balance}
.lede{font-family:var(--serif);font-size:1.05rem;max-width:62ch;margin:12px 0 0}
.toggle{justify-self:end;display:flex;align-items:center;gap:10px;background:var(--chip);border:1px solid var(--desk-rule);border-radius:999px;padding:7px 14px 7px 8px;font:600 .9rem var(--sans);color:var(--desk-ink);cursor:pointer}
.toggle .sw{width:34px;height:20px;border-radius:999px;background:var(--desk-rule);position:relative;transition:background .2s}
.toggle .sw::after{content:"";position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#fff;transition:transform .2s}
.toggle[aria-pressed="true"] .sw{background:var(--hand)}
.toggle[aria-pressed="true"] .sw::after{transform:translateX(14px)}
.toggle:focus-visible,.nav a:focus-visible{outline:2px solid var(--hand);outline-offset:3px}
.hint{font-size:.85rem;color:var(--desk-muted);margin:8px 0 0;text-align:right;max-width:30ch;justify-self:end}
.nav{display:flex;flex-wrap:wrap;gap:6px 8px;margin:22px 0 0;padding:0;list-style:none}
.nav a{display:inline-block;font-size:.86rem;color:var(--desk-ink);text-decoration:none;border:1px solid var(--desk-rule);border-radius:999px;padding:3px 12px;background:var(--chip)}
.block{margin-top:56px;scroll-margin-top:16px}
.cap{max-width:70ch;margin:0 auto 18px;text-align:center}
.cap h2{font-family:var(--serif);font-weight:600;font-size:1.35rem;margin:2px 0}
.cap .pg{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--desk-muted);font-weight:600}
.cap p{margin:0;color:var(--desk-muted);font-size:.95rem}
.spread{display:grid;grid-template-columns:repeat(2,minmax(0,560px));justify-content:center;filter:drop-shadow(0 12px 20px var(--shade));margin-bottom:28px}
.spread.solo-r .page{grid-column:2}
@media (max-width:760px){.top{grid-template-columns:minmax(0,1fr)}.toggle,.hint{justify-self:start;text-align:left}
  .spread{grid-template-columns:minmax(0,1fr);gap:12px}.spread.solo-r .page{grid-column:1}}
@media (prefers-reduced-motion: reduce){.toggle .sw,.toggle .sw::after{transition:none}}

/* ---------- the cover: back, spine, front laid flat (148 + 14 + 148 mm), wine-red leather, gold ---------- */
.case{--w:#5c1a24;--w2:#3f0f17;--gold1:#f3dc93;--gold2:#c9a043;--gold3:#8a6a1e;position:relative;display:grid;grid-template-columns:148fr 14fr 148fr;
  max-width:1000px;margin:0 auto 90px;aspect-ratio:310/214;container-type:inline-size;filter:drop-shadow(0 18px 26px var(--shade))}
.board,.spine{position:relative;background:
  radial-gradient(120% 90% at 30% 20%,rgba(255,255,255,.07),transparent 60%),
  repeating-radial-gradient(circle at 17% 31%,rgba(0,0,0,.05) 0 .5px,transparent .5px 2.5px),
  repeating-radial-gradient(circle at 71% 63%,rgba(255,255,255,.035) 0 .6px,transparent .6px 3px),
  linear-gradient(160deg,var(--w),var(--w2));overflow:hidden}
.board.back{border-radius:6px 0 0 6px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.25),inset 8px 0 18px rgba(0,0,0,.25)}
.board.front{border-radius:0 6px 6px 0;box-shadow:inset 0 0 0 1px rgba(0,0,0,.25),inset -8px 0 18px rgba(0,0,0,.25)}
.board::after{content:"";position:absolute;inset:3.2cqw;border:1px solid rgba(201,160,67,.0)}
.spine{box-shadow:inset 6px 0 10px rgba(0,0,0,.35),inset -6px 0 10px rgba(0,0,0,.35);display:grid;place-items:center}
.spine span{writing-mode:vertical-rl;font:600 2.3cqw/1 var(--serif);letter-spacing:.18em}
.ft{position:absolute;left:0;right:0;top:36%;display:flex;flex-direction:column;align-items:center;gap:1.6cqw}
.ft h2,.ft p,.spine span,.bv p,.bv span{background:linear-gradient(175deg,var(--gold1),var(--gold2) 45%,var(--gold3) 80%,var(--gold2));
  -webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 1px 0 rgba(0,0,0,.25)}
.ft h2{margin:0;font:600 7.4cqw/1 var(--serif);letter-spacing:.06em}
.ft .rule{width:6cqw;height:1px;background:linear-gradient(90deg,transparent,var(--gold2),transparent)}
.ft p{margin:0;font:italic 400 2.3cqw/1.2 var(--serif);letter-spacing:.04em}
.bv{position:absolute;left:12%;right:12%;bottom:11%;text-align:center}
.bv p{margin:0;font:italic 400 1.75cqw/1.5 var(--serif)}
.bv span{display:block;margin-top:.9cqw;font:600 1.25cqw/1 var(--sans);letter-spacing:.14em;text-transform:uppercase}
.ribs{position:absolute;left:calc(50% - 2.3cqw);top:97%;display:flex;gap:.7cqw;z-index:2}
.rib{display:block;width:1.3cqw;height:9cqw;clip-path:polygon(0 0,100% 0,100% 100%,50% 86%,0 100%);box-shadow:inset 0 -1px 0 rgba(0,0,0,.2)}
.rib:nth-child(2){height:7.4cqw}.rib:nth-child(3){height:8.4cqw}
.rib.gold{background:linear-gradient(90deg,#b98f2c,#e2c063,#b98f2c)}
.rib.green{background:linear-gradient(90deg,#3e6114,#5b8a22,#3e6114)}
.rib.blue{background:linear-gradient(90deg,#1f2e40,#344a66,#1f2e40)}
@media (max-width:760px){.case{grid-template-columns:148fr 14fr 148fr}}

/* ---------- the page: A5, every length in millimetres of the paper ---------- */
.page{container-type:inline-size;aspect-ratio:148/210;background:var(--paper);position:relative;color:var(--ink);overflow:hidden}
.page.l{border-radius:3px 0 0 3px;background-image:linear-gradient(to left,rgba(29,35,48,.08),rgba(29,35,48,0) 6%)}
.page.r{border-radius:0 3px 3px 0;background-image:linear-gradient(to right,rgba(29,35,48,.08),rgba(29,35,48,0) 6%)}
.in{--mm:calc(100cqw / 148);--lh:calc(5.9 * var(--mm));position:absolute;inset:0;display:flex;flex-direction:column;
  padding:calc(12 * var(--mm)) calc(15 * var(--mm)) calc(14 * var(--mm)) calc(12 * var(--mm));
  font-family:var(--serif);font-size:calc(2.8 * var(--mm));line-height:1.42;hyphens:auto}
.r .in{padding-left:calc(15 * var(--mm));padding-right:calc(12 * var(--mm))}
.in p{margin:0}
.folio{position:absolute;bottom:calc(6.5 * var(--mm));font:600 calc(2.3 * var(--mm)) var(--sans);color:var(--muted);font-variant-numeric:tabular-nums}
.l .folio{left:calc(12 * var(--mm))}.r .folio{right:calc(12 * var(--mm))}
.runner{position:absolute;top:calc(6 * var(--mm));font:600 calc(1.95 * var(--mm)) var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.l .runner{left:calc(12 * var(--mm))}.r .runner{right:calc(12 * var(--mm))}

.hd{display:flex;justify-content:space-between;align-items:flex-end;gap:calc(4 * var(--mm));padding-bottom:calc(1.6 * var(--mm));border-bottom:max(1px,calc(.3 * var(--mm))) solid var(--rule);margin-bottom:calc(2.6 * var(--mm))}
.hd .k,.lh .k,.title .k{font:600 calc(2.05 * var(--mm)) var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:0 0 calc(1 * var(--mm))}
.hd h2{margin:0;font:600 calc(7 * var(--mm))/1.05 var(--serif);letter-spacing:-.005em}
.hd.sm h2{font-size:calc(5.6 * var(--mm))}
.dt{flex:none;display:flex;align-items:flex-end;gap:calc(1.5 * var(--mm));width:calc(34 * var(--mm));height:calc(5.5 * var(--mm));border-bottom:max(1px,calc(.25 * var(--mm))) solid var(--rule)}

/* the way: a ring per step in the gold of the rose, the number in the rubric, a thin line between */
.steps{display:flex;flex-direction:column}
.st{display:grid;grid-template-columns:calc(13 * var(--mm)) minmax(0,1fr);column-gap:calc(2 * var(--mm))}
.st + .st{margin-top:calc(2.4 * var(--mm))}
.sn{display:flex;flex-direction:column;align-items:center;text-align:center}
.sn::after{content:"";flex:1 1 auto;width:max(1px,calc(.3 * var(--mm)));background:var(--rule);margin:calc(1 * var(--mm)) 0 calc(-2.4 * var(--mm));min-height:calc(2 * var(--mm))}
.st.end .sn::after{display:none}
.ring{display:grid;place-items:center;width:calc(7.4 * var(--mm));height:calc(7.4 * var(--mm));border-radius:50%;border:max(1px,calc(.3 * var(--mm))) solid var(--rule);background:var(--paper);color:var(--icon-gold);flex:none}
.ring .ic{width:calc(4.4 * var(--mm));height:calc(4.4 * var(--mm))}
.ring.big{width:calc(13 * var(--mm));height:calc(13 * var(--mm));margin:calc(6 * var(--mm)) auto}
.ring.big .ic{width:calc(7.6 * var(--mm));height:calc(7.6 * var(--mm))}
.no{font:600 calc(2.6 * var(--mm))/1 var(--serif);color:var(--rubric);margin-top:calc(.9 * var(--mm))}
.tt{font:600 calc(1.95 * var(--mm))/1.15 var(--sans);color:var(--muted);margin-top:calc(.6 * var(--mm));letter-spacing:.01em}
.sc{min-width:0}
.arc{font-style:italic;color:var(--muted);font-size:calc(2.45 * var(--mm));line-height:1.3;margin:calc(.4 * var(--mm)) 0 calc(.9 * var(--mm)) !important}

/* fields: a small label, then lines to write on; the app's prompt starts the line */
.lab{display:flex;align-items:baseline;justify-content:space-between;gap:calc(3 * var(--mm));margin-top:calc(1.5 * var(--mm));font:600 calc(2.2 * var(--mm))/1.2 var(--sans);color:var(--muted)}
.lab .aside{display:flex;align-items:flex-end;gap:calc(1.2 * var(--mm));font-weight:400}
.lab .sl{display:inline-block;width:calc(28 * var(--mm));border-bottom:max(1px,calc(.25 * var(--mm))) solid var(--rule);min-height:calc(4 * var(--mm))}
.ln{height:var(--lh);border-bottom:max(1px,calc(.25 * var(--mm))) solid var(--rule);display:flex;align-items:flex-end;gap:calc(1.4 * var(--mm));white-space:nowrap;overflow:hidden;min-width:0}
.ln .grow,.owner .grow{flex:1 1 auto}
.pi{font:italic 400 calc(2.6 * var(--mm)) var(--serif);color:color-mix(in srgb,var(--muted) 80%,var(--paper));padding-bottom:calc(.9 * var(--mm));flex:none}
.il{font:600 calc(2.1 * var(--mm)) var(--sans);color:var(--muted);padding-bottom:calc(1 * var(--mm));flex:none}
.opt{font-size:calc(2.5 * var(--mm));color:var(--ink);padding-bottom:calc(.8 * var(--mm));flex:none;margin-right:calc(1.5 * var(--mm))}
.mg{font:600 calc(3.2 * var(--mm))/1 var(--serif);color:var(--rubric);width:calc(3 * var(--mm));padding-bottom:calc(.9 * var(--mm));flex:none;text-align:center}
.mks{display:flex;gap:calc(1 * var(--mm));padding-bottom:calc(.8 * var(--mm));flex:none}
.mk{width:calc(4.2 * var(--mm));height:calc(4.2 * var(--mm));border:max(1px,calc(.25 * var(--mm))) solid var(--rule);border-radius:calc(1 * var(--mm));display:grid;place-items:center;font:600 calc(2.5 * var(--mm))/1 var(--sans);color:color-mix(in srgb,var(--muted) 55%,var(--paper))}
.show .mk.on{border-color:var(--hand);color:var(--hand);box-shadow:inset 0 0 0 calc(.25 * var(--mm)) var(--hand)}
.bx{display:inline-block;width:calc(3.2 * var(--mm));height:calc(3.2 * var(--mm));border:max(1px,calc(.25 * var(--mm))) solid var(--muted);border-radius:calc(.6 * var(--mm));margin-bottom:calc(1.1 * var(--mm));flex:none;position:relative}
.show .bx.on::after{content:"";position:absolute;inset:-25%;background:no-repeat center/contain url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4 13l5 5L20 5' fill='none' stroke='%232C4A86' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E")}
.hw{display:none;font-family:var(--script);font-weight:500;font-size:calc(4.1 * var(--mm));line-height:1;color:var(--hand);padding:0 calc(.8 * var(--mm)) calc(.5 * var(--mm)) calc(.6 * var(--mm));white-space:nowrap}
.show .hw{display:inline-block}
.show .pi.ph{display:none}
.blank{display:inline-block;width:calc(16 * var(--mm));border-bottom:max(1px,calc(.25 * var(--mm))) solid var(--muted);vertical-align:baseline}

/* text as in the app: prayers with a rule on the left, the absolution in green, rubrics in red */
.pray{margin:calc(.8 * var(--mm)) 0 calc(.6 * var(--mm));padding-left:calc(2.4 * var(--mm));border-left:calc(.5 * var(--mm)) solid var(--rule)}
.pray p + p{margin-top:calc(1 * var(--mm))}
.pray .l{display:block}
.pray.small{font-size:calc(2.55 * var(--mm));line-height:1.36}
.pray.run{font-size:calc(2.6 * var(--mm));line-height:1.36}
.pray.abs{border-left-color:var(--done)}
.day .pray.run.abs{font-size:calc(2.45 * var(--mm));line-height:1.32}
.att{font:400 calc(2 * var(--mm)) var(--sans);color:var(--muted);white-space:nowrap}
.vr{display:grid;grid-template-columns:calc(3.4 * var(--mm)) minmax(0,1fr);gap:calc(.8 * var(--mm))}
.vr b{color:var(--rubric);font:600 calc(2.4 * var(--mm)) var(--sans);padding-top:calc(.25 * var(--mm))}
.rub{font-style:italic;color:var(--rubric);font-size:calc(2.6 * var(--mm));line-height:1.35;margin:calc(.6 * var(--mm)) 0 !important}
.rub.sm{font-size:calc(2.4 * var(--mm))}
.rubi{font-style:italic;color:var(--rubric);font-weight:400}
.note{font-style:italic;color:var(--muted);font-size:calc(2.5 * var(--mm));line-height:1.35;margin:calc(.8 * var(--mm)) 0 !important}
.silent{font-style:italic;color:var(--muted);font-size:calc(2.45 * var(--mm))}
.small{font-size:calc(2.55 * var(--mm));line-height:1.4;margin:0 0 calc(1.2 * var(--mm)) !important}
.tiny{font-size:calc(2.25 * var(--mm));line-height:1.35;margin:calc(.4 * var(--mm)) 0 calc(.8 * var(--mm)) !important}
.muted{color:var(--muted)}
.lead{font-size:calc(3 * var(--mm));line-height:1.45;margin:0 0 calc(1.6 * var(--mm)) !important}
.sub{margin:calc(3 * var(--mm)) 0 calc(1 * var(--mm));font:600 calc(2.1 * var(--mm)) var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.ps{font-size:calc(2.75 * var(--mm))}
.ps b{font-weight:600}
.ant{font-style:italic;font-size:calc(2.65 * var(--mm));line-height:1.35}
.seq{font-size:calc(2.5 * var(--mm));line-height:1.38;color:var(--ink)}
.seq b{font-weight:600}
.steps + .send{margin-top:calc(1.6 * var(--mm)) !important}
.more{font:600 calc(1.95 * var(--mm)) var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:calc(2.4 * var(--mm)) !important}
.send{font-weight:600;font-size:calc(2.55 * var(--mm));margin-top:calc(.6 * var(--mm)) !important}
.arm{font-size:calc(2.65 * var(--mm))}
.arm b{font-weight:600}
.conf{font-size:calc(2.5 * var(--mm));margin:calc(.6 * var(--mm)) 0 0 !important}
.conf .pi{padding:0}
.fill{flex:1 1 auto;min-height:calc(2 * var(--mm))}
.eve{background:var(--warm-soft);border-radius:calc(2.4 * var(--mm));padding:calc(2.2 * var(--mm)) calc(2.6 * var(--mm)) calc(2.2 * var(--mm)) 0}
.eve .ring{background:var(--warm-soft)}
.eve .seq{margin-top:calc(1 * var(--mm)) !important}
.eve .ln{border-bottom-color:color-mix(in srgb,var(--rule) 70%,var(--muted))}

/* front */
.title{display:flex;flex-direction:column;align-items:center;text-align:center;height:100%;padding-top:calc(16 * var(--mm))}
.title h1{font:600 calc(13 * var(--mm))/1 var(--serif);color:var(--ink);margin:calc(1 * var(--mm)) 0 0}
.title .sub{font:400 calc(3 * var(--mm)) var(--serif);letter-spacing:0;text-transform:none;color:var(--muted);margin-top:calc(3 * var(--mm))}
.title .theme{font-style:italic;font-size:calc(3.1 * var(--mm))}
.motto{margin:calc(10 * var(--mm)) calc(6 * var(--mm)) 0}
.motto blockquote,.wsp blockquote{margin:0;font-size:calc(3.9 * var(--mm));line-height:1.42}
.motto figcaption,.wsp figcaption,.lm figcaption{font:600 calc(2.05 * var(--mm)) var(--sans);color:var(--muted);letter-spacing:.06em;margin-top:calc(1.2 * var(--mm))}
.owner{display:flex;align-items:flex-end;gap:calc(2 * var(--mm));width:80%;height:calc(7 * var(--mm));border-bottom:max(1px,calc(.25 * var(--mm))) solid var(--rule);margin-top:auto}
.solas{font-style:italic;color:var(--gold);font-size:calc(2.3 * var(--mm));letter-spacing:.04em;margin-top:calc(5 * var(--mm)) !important;text-align:center}
.solas span{white-space:nowrap}
.sun{padding:calc(1.6 * var(--mm)) 0;border-top:max(1px,calc(.25 * var(--mm))) solid var(--rule)}
.sun .sh{display:flex;justify-content:space-between;font:600 calc(2.3 * var(--mm)) var(--sans)}
.sun .sh span{color:var(--muted);font-weight:400}
.st-theme{font-size:calc(2.6 * var(--mm))}
.sv{font-style:italic;font-size:calc(2.6 * var(--mm))}
.sr{font-size:calc(2.35 * var(--mm));color:var(--ink)}
.sr span{font:600 calc(1.9 * var(--mm)) var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-left:calc(1.6 * var(--mm))}
.sr span:first-child{margin-left:0}
.way .sn::after{min-height:calc(1 * var(--mm))}
.st.way + .st.way{margin-top:calc(1.4 * var(--mm))}
.wt{display:flex;justify-content:space-between;align-items:baseline;font-size:calc(3 * var(--mm))}
.wt b{font-weight:600}
.wt span{font:400 calc(2.1 * var(--mm)) var(--sans);color:var(--muted)}
.parts{font:400 calc(2.15 * var(--mm)) var(--sans);color:var(--muted)}
.qs{margin-bottom:calc(1.4 * var(--mm))}
.passes,.qs{margin-top:0;margin-left:0;margin-right:0;padding-left:calc(4 * var(--mm));font-size:calc(2.5 * var(--mm));line-height:1.38}
.passes b{font-weight:600}
.colors{display:grid;grid-template-columns:1fr 1fr;gap:calc(.6 * var(--mm)) calc(3 * var(--mm))}
.cc{display:grid;grid-template-columns:calc(5 * var(--mm)) calc(12 * var(--mm)) minmax(0,1fr);align-items:baseline;font-size:calc(2.35 * var(--mm));line-height:1.3}
.cc i{height:calc(1.2 * var(--mm));border-radius:9px;transform:translateY(calc(-.4 * var(--mm)))}
.cc b{font:600 calc(2.2 * var(--mm)) var(--sans)}
.mm{display:grid;grid-template-columns:calc(4 * var(--mm)) minmax(0,1fr);font-size:calc(2.45 * var(--mm))}
.mm b{color:var(--rubric);font:600 calc(3 * var(--mm))/1.1 var(--serif)}
.credit{font:400 calc(2 * var(--mm)) var(--sans);color:var(--muted);margin-top:auto !important}
.four{display:flex;flex-direction:column;gap:calc(1.6 * var(--mm));margin:calc(1 * var(--mm)) 0 calc(1.6 * var(--mm))}
.w4 b{display:block;font:600 calc(2.3 * var(--mm)) var(--sans)}
.w4 .pi{display:block;padding:0}
.w4 .note{margin:0 !important}

/* order pages */
.ord .in{font-size:calc(2.65 * var(--mm))}
.ok{font:600 calc(2.05 * var(--mm)) var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);padding-bottom:calc(1.6 * var(--mm));border-bottom:max(1px,calc(.3 * var(--mm))) solid var(--rule);margin-bottom:calc(1.4 * var(--mm)) !important}
.oh{display:flex;align-items:center;gap:calc(1.8 * var(--mm));margin:calc(1.6 * var(--mm)) 0 calc(.6 * var(--mm))}
.oh h3{margin:0;font:600 calc(5 * var(--mm)) var(--serif)}
.oh .no{margin:0}
.oh .min{margin-left:auto;font:400 calc(2.1 * var(--mm)) var(--sans);color:var(--muted)}
.oh.bed{margin-top:calc(5 * var(--mm));padding-top:calc(3 * var(--mm));border-top:max(1px,calc(.25 * var(--mm))) solid var(--rule)}
.pt{font:600 calc(2.05 * var(--mm)) var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-top:calc(1.8 * var(--mm))}
.pt .rubi{text-transform:none;letter-spacing:0;font-family:var(--serif);font-size:calc(2.4 * var(--mm));margin-left:calc(1 * var(--mm))}
.pray-line{padding-left:calc(2.9 * var(--mm))}
.psalms{display:flex;flex-direction:column;gap:calc(.3 * var(--mm));margin-top:calc(.6 * var(--mm))}
.pr{display:grid;grid-template-columns:calc(17 * var(--mm)) calc(14 * var(--mm)) minmax(0,1fr);font-size:calc(2.4 * var(--mm));line-height:1.3}
.pr b{font:600 calc(2.2 * var(--mm)) var(--sans)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:calc(3 * var(--mm))}
.call{margin:calc(.8 * var(--mm)) 0;font-style:italic;font-size:calc(2.6 * var(--mm))}
.armor{display:flex;flex-direction:column;gap:calc(1.3 * var(--mm));margin-top:calc(.8 * var(--mm))}
.aph{font-size:calc(2.5 * var(--mm))}
.aph b{font:600 calc(2.3 * var(--mm)) var(--sans)}
.apr{font-size:calc(2.35 * var(--mm));line-height:1.33}
.apq{font-size:calc(2.2 * var(--mm));line-height:1.3;font-style:italic;color:var(--muted)}
.exam{display:flex;flex-direction:column;gap:calc(.5 * var(--mm));margin:calc(.6 * var(--mm)) 0}
.ex{display:grid;grid-template-columns:calc(18 * var(--mm)) minmax(0,1fr);font-size:calc(2.4 * var(--mm));line-height:1.32}
.ex b{font:600 calc(2.2 * var(--mm)) var(--sans)}
.ex i{color:var(--muted)}
.kid{margin-bottom:calc(1.2 * var(--mm))}
.focus{display:grid;grid-template-columns:auto 1fr;gap:calc(.6 * var(--mm)) calc(4 * var(--mm));font-size:calc(2.6 * var(--mm));margin-bottom:calc(1 * var(--mm))}
.fc{display:contents}
.focus b{font:600 calc(2.3 * var(--mm)) var(--sans)}

/* Sunday */
.theme{font-size:calc(3.3 * var(--mm));line-height:1.35;margin-bottom:calc(3 * var(--mm)) !important}
.wsp{margin:0 0 calc(3.5 * var(--mm));padding:calc(3 * var(--mm)) calc(3.4 * var(--mm));background:var(--gold-soft);border-radius:calc(2.4 * var(--mm))}
.wsp.big blockquote{font-size:calc(4.6 * var(--mm))}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:calc(2.4 * var(--mm));margin-bottom:calc(3 * var(--mm))}
.tile{display:flex;flex-direction:column;gap:calc(.6 * var(--mm));padding:calc(2 * var(--mm)) calc(2.4 * var(--mm));background:var(--sheet);border:max(1px,calc(.25 * var(--mm))) solid var(--rule);border-radius:calc(2 * var(--mm))}
.tile .tr{font:600 calc(1.9 * var(--mm)) var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.tile b{font-weight:600;font-size:calc(2.9 * var(--mm))}
.tile .sm{font-size:calc(2.35 * var(--mm));line-height:1.35;color:var(--ink)}
.gd{font-size:calc(2.6 * var(--mm));line-height:1.42;margin:calc(1.4 * var(--mm)) 0 !important}
.next{font:400 calc(2.15 * var(--mm)) var(--sans);color:var(--muted);border-top:max(1px,calc(.25 * var(--mm))) solid var(--rule);padding-top:calc(1.6 * var(--mm))}
.lesson .in{font-size:calc(2.75 * var(--mm));line-height:1.45}
.lh{margin-bottom:calc(1.6 * var(--mm))}
.lh h3{margin:0;font:600 calc(4.6 * var(--mm))/1.2 var(--serif)}
.lref{font:600 calc(2.2 * var(--mm)) var(--sans);color:var(--muted);margin-top:calc(.6 * var(--mm)) !important}
.add{font-style:italic;color:var(--muted);font-size:calc(2.5 * var(--mm));margin-bottom:calc(1.4 * var(--mm)) !important}
.lm{margin:0 0 calc(1.6 * var(--mm));padding:calc(1.8 * var(--mm)) calc(2.6 * var(--mm));background:var(--gold-soft);border-radius:calc(2 * var(--mm))}
.lm blockquote{margin:0;font-size:calc(2.6 * var(--mm));line-height:1.4}
.imp{text-indent:calc(3.4 * var(--mm));text-align:justify}
.imp.cont{text-indent:0}
.hym{margin:calc(1.2 * var(--mm)) 0 calc(1.2 * var(--mm)) calc(2 * var(--mm));padding-left:calc(2.6 * var(--mm));border-left:calc(.6 * var(--mm)) solid color-mix(in srgb,var(--gold) 45%,var(--rule));font-style:italic;font-size:calc(2.55 * var(--mm));line-height:1.38}
.hym .l{display:block}
.quelle{font:400 calc(2 * var(--mm)) var(--sans);color:var(--muted);margin-top:calc(2.4 * var(--mm)) !important}
.xmas .ring.big{margin:0 auto calc(6 * var(--mm))}
.srcs{margin:0 0 calc(2 * var(--mm));padding-left:calc(4 * var(--mm));font-size:calc(2.5 * var(--mm));line-height:1.4}
.srcs li + li{margin-top:calc(1 * var(--mm))}

/* Heute, as at the top of the app: the arc of the day, the two tiles; rings as the app's ticks */
.rg{flex:none;position:relative;display:inline-block;width:calc(3.4 * var(--mm));height:calc(3.4 * var(--mm));border-radius:50%;border:max(1px,calc(.3 * var(--mm))) solid var(--muted);background:var(--sheet)}
.show .rg.on{background:var(--accent);border-color:var(--accent)}
.show .rg.on::after{content:"";position:absolute;left:34%;top:16%;width:24%;height:46%;border:solid #fff;border-width:0 calc(.35 * var(--mm)) calc(.35 * var(--mm)) 0;transform:rotate(45deg)}
.today2{margin:0 0 calc(2.6 * var(--mm))}
.arc2{position:relative;height:calc(3.6 * var(--mm));margin:0 calc(1.4 * var(--mm)) calc(1.8 * var(--mm))}
.arc2 i{position:absolute;left:0;right:0;top:50%;height:max(1px,calc(.35 * var(--mm)));background:var(--rule);border-radius:9px}
.ad{position:absolute;top:50%;width:calc(2.8 * var(--mm));height:calc(2.8 * var(--mm));transform:translate(-50%,-50%);border-radius:50%;border:max(1px,calc(.3 * var(--mm))) solid var(--muted);background:var(--paper)}
.tiles2{display:grid;grid-template-columns:1fr 1fr;gap:calc(2.4 * var(--mm))}
.tile2{display:flex;flex-direction:column;gap:calc(.5 * var(--mm));padding:calc(1.8 * var(--mm)) calc(2.6 * var(--mm)) calc(2 * var(--mm));background:var(--sheet);border:max(1px,calc(.25 * var(--mm))) solid var(--rule);border-radius:calc(2.2 * var(--mm))}
.tt2{display:flex;align-items:flex-end;gap:calc(1 * var(--mm));font:400 calc(2.15 * var(--mm)) var(--sans);color:var(--muted)}
.tile2 b{font-weight:600;font-size:calc(3.3 * var(--mm));line-height:1.2}
.ts2{display:flex;align-items:center;gap:calc(1.2 * var(--mm));font:400 calc(2.2 * var(--mm)) var(--sans);color:var(--muted);margin-top:calc(.3 * var(--mm))}
.ts2 .rg{width:calc(3 * var(--mm));height:calc(3 * var(--mm))}
.ts2 .gap{width:calc(2.6 * var(--mm))}
.tb{display:inline-block;min-width:calc(9 * var(--mm));height:calc(3.6 * var(--mm));border-bottom:max(1px,calc(.25 * var(--mm))) solid var(--rule);text-align:center}
.tb .hw{font-size:calc(3.4 * var(--mm));padding:0}
.ln .half{flex:1 1 0;display:flex;align-items:flex-end;gap:calc(1.4 * var(--mm));min-width:0}

/* Gewohnheiten (p. 15): your own habits with their rhythm */
.habs{margin-top:calc(1 * var(--mm))}
.hab{margin-top:calc(.8 * var(--mm))}
.rhy{display:flex;flex-wrap:wrap;gap:calc(1 * var(--mm)) calc(4 * var(--mm));padding:calc(1.2 * var(--mm)) 0 calc(.6 * var(--mm))}
.opt2{display:inline-flex;align-items:center;gap:calc(1.1 * var(--mm));font:400 calc(2.15 * var(--mm)) var(--sans);color:var(--muted)}
.opt2 .rg{width:calc(3 * var(--mm));height:calc(3 * var(--mm))}
.opt2.fo{margin-left:auto}
.ic.st{width:calc(2.8 * var(--mm));height:calc(2.8 * var(--mm));color:var(--gold);fill:currentColor;stroke:none;flex:none}
.hx{display:inline-block;min-width:calc(6 * var(--mm));border-bottom:max(1px,calc(.25 * var(--mm))) solid var(--rule);text-align:center;margin-left:calc(.6 * var(--mm))}
.hx .hw{font-size:calc(3.4 * var(--mm));padding:0}

/* Wochenübersicht, as the app's table: a ring for every day, a pill for the week and the month */
.pillhead{margin:0 0 calc(2 * var(--mm)) !important}
.pillhead span{display:inline-block;font:600 calc(2 * var(--mm)) var(--sans);letter-spacing:.06em;text-transform:uppercase;padding:calc(1 * var(--mm)) calc(3 * var(--mm));border:max(1px,calc(.25 * var(--mm))) solid var(--rule);border-radius:999px;background:var(--sheet)}
.htab{display:grid;grid-template-columns:minmax(0,1fr) repeat(7,calc(7.2 * var(--mm)));align-items:end;background:var(--sheet);border:max(1px,calc(.25 * var(--mm))) solid var(--rule);border-radius:calc(2.4 * var(--mm));padding:calc(2 * var(--mm)) calc(2.8 * var(--mm)) calc(2.4 * var(--mm));margin:calc(1.6 * var(--mm)) 0}
.thd{font:400 calc(2.2 * var(--mm)) var(--sans);color:var(--muted);text-align:center;padding-bottom:calc(1 * var(--mm))}
.tg{grid-column:1 / -1;display:flex;align-items:center;gap:calc(1 * var(--mm));font:600 calc(2 * var(--mm)) var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:calc(2.6 * var(--mm)) 0 calc(.4 * var(--mm)) !important}
.tg.focus{color:var(--gold)}
.tn,.tc,.tpl{height:calc(7.4 * var(--mm));border-bottom:max(1px,calc(.25 * var(--mm))) solid var(--rule);display:flex;align-items:center;min-width:0;overflow:hidden;white-space:nowrap}
.tc{justify-content:center}
.tc .rg{width:calc(4.6 * var(--mm));height:calc(4.6 * var(--mm));border-color:color-mix(in srgb,var(--muted) 70%,var(--rule))}
.show .tc .rg.on,.show .tpl .rg.on{background:var(--done);border-color:var(--done)}
.show .tc .rg.on::after,.show .tpl .rg.on::after{left:50%;top:50%;width:calc(1.4 * var(--mm));height:calc(1.4 * var(--mm));border:0;border-radius:50%;background:#fff;transform:translate(-50%,-50%)}
.tpl{grid-column:span 7;justify-content:flex-end;gap:calc(1.4 * var(--mm))}
.tpl .rg{width:calc(4.6 * var(--mm));height:calc(4.6 * var(--mm))}
.tpw{font:400 calc(2.2 * var(--mm)) var(--sans);color:var(--muted);width:calc(16 * var(--mm))}
.pill{display:inline-block;font:600 calc(2.2 * var(--mm)) var(--sans);color:var(--ink);padding:calc(.9 * var(--mm)) calc(3 * var(--mm));border:max(1px,calc(.3 * var(--mm))) solid var(--rule);border-radius:999px}
.show .pill.on{background:var(--done);border-color:var(--done);color:#fff}
.show .pill.on::before{content:"✓ "}

/* Diese Woche, as the app's "Die letzten vier Wochen" */
.look{background:var(--sheet);border:max(1px,calc(.25 * var(--mm))) solid var(--rule);border-radius:calc(2.4 * var(--mm));padding:calc(3 * var(--mm)) calc(3.2 * var(--mm));margin:calc(1.6 * var(--mm)) 0}
.sqs{display:grid;grid-template-columns:repeat(7,calc(9 * var(--mm)));justify-content:space-between}
.sqd{display:flex;flex-direction:column;align-items:center;gap:calc(.8 * var(--mm))}
.sqd b{font:400 calc(2 * var(--mm)) var(--sans);color:var(--muted)}
.sq{display:inline-block;width:100%;aspect-ratio:1;border-radius:calc(1 * var(--mm));border:max(1px,calc(.25 * var(--mm))) solid var(--rule);background:var(--paper)}
.lg .sq{width:calc(2.6 * var(--mm))}
.show .sq.both,.lg .sq.both{background:var(--done);border-color:var(--done)}
.show .sq.one,.lg .sq.one{background:color-mix(in srgb,var(--done) 50%,var(--rule));border-color:transparent}
.lgd{display:flex;gap:calc(4 * var(--mm));font:400 calc(2.1 * var(--mm)) var(--sans);color:var(--muted);margin:calc(2.2 * var(--mm)) 0 0 !important}
.lg{display:inline-flex;align-items:center;gap:calc(1.2 * var(--mm))}
.stats2{display:grid;grid-template-columns:1fr 1fr;gap:calc(3 * var(--mm));margin-top:calc(3.4 * var(--mm))}
.stats2 > div{display:flex;flex-direction:column;gap:calc(.6 * var(--mm));font:400 calc(2.2 * var(--mm)) var(--sans);color:var(--muted)}
.sn2 .tb{min-width:calc(12 * var(--mm));height:calc(6 * var(--mm))}
.marks3{display:flex;flex-wrap:wrap;gap:calc(1.4 * var(--mm)) calc(4 * var(--mm));margin-top:calc(3 * var(--mm))}
.m3{display:inline-flex;align-items:center;gap:calc(1.2 * var(--mm));font:600 calc(2.1 * var(--mm)) var(--sans);color:var(--ink)}
.mb{display:grid;place-items:center;width:calc(4.4 * var(--mm));height:calc(4.4 * var(--mm));border-radius:50%;font:600 calc(2.4 * var(--mm))/1 var(--sans)}
.mb.plus{background:var(--done-soft);color:var(--done)}
.mb.tilde{background:var(--gold-soft);color:var(--gold)}
.mb.minus{background:var(--warm-soft);color:var(--muted)}
.m3 .tb{min-width:calc(6 * var(--mm))}
.m3l{font:400 calc(2.2 * var(--mm)) var(--sans);color:var(--muted);margin-top:calc(.8 * var(--mm)) !important}
.vtab{display:grid;grid-template-columns:calc(7 * var(--mm)) calc(30 * var(--mm)) minmax(0,1fr);column-gap:calc(2 * var(--mm))}
.vtab b{font:600 calc(2 * var(--mm)) var(--sans);color:var(--muted);padding-bottom:calc(.6 * var(--mm))}
.vd,.vl{height:var(--lh);border-bottom:max(1px,calc(.25 * var(--mm))) solid var(--rule);display:flex;align-items:flex-end;padding-bottom:calc(.8 * var(--mm));white-space:nowrap;overflow:hidden}
.vd{font:600 calc(2.1 * var(--mm)) var(--sans);color:var(--muted)}
.vl .hw{padding-bottom:0}
.verse-s{font-style:italic;font-size:calc(2.6 * var(--mm));margin:0 0 calc(1.2 * var(--mm)) !important}
.times{display:grid;gap:calc(1.2 * var(--mm)) calc(2 * var(--mm));align-items:end;margin-top:calc(.8 * var(--mm))}
.times b{font:600 calc(2 * var(--mm)) var(--sans);color:var(--muted)}
.tr2{font:600 calc(2.1 * var(--mm)) var(--sans)}
.tm{height:calc(6 * var(--mm));border-bottom:max(1px,calc(.25 * var(--mm))) solid var(--rule)}
.tm::after{content:":";display:block;text-align:center;color:var(--rule);font:600 calc(3 * var(--mm))/calc(6 * var(--mm)) var(--sans)}
.mo .bx{margin:0}

/* Arena */
.ptiles{display:grid;gap:calc(2.6 * var(--mm));margin:calc(2 * var(--mm)) 0 calc(4 * var(--mm))}
.ptile{display:flex;align-items:center;gap:calc(3 * var(--mm));padding:calc(3 * var(--mm)) calc(3.4 * var(--mm));background:var(--sheet);border:max(1px,calc(.25 * var(--mm))) solid var(--rule);border-radius:calc(2.4 * var(--mm))}
.ptile .ring{width:calc(10 * var(--mm));height:calc(10 * var(--mm))}
.ptile .ring .ic{width:calc(6 * var(--mm));height:calc(6 * var(--mm))}
.pt2{display:flex;flex-direction:column;flex:1 1 auto}
.pt2 b{font:600 calc(4 * var(--mm)) var(--serif)}
.pt2 span{font-size:calc(2.6 * var(--mm));color:var(--muted)}
.pg2{font:600 calc(2.2 * var(--mm)) var(--sans);color:var(--muted)}
.index{display:grid;grid-template-columns:calc(28 * var(--mm)) minmax(0,1fr) auto;column-gap:calc(3 * var(--mm))}
.index b{font:600 calc(2 * var(--mm)) var(--sans);color:var(--muted);padding-bottom:calc(1 * var(--mm))}
.ix,.ixp{height:calc(7 * var(--mm));border-bottom:max(1px,calc(.25 * var(--mm))) solid var(--rule);display:flex;align-items:flex-end;overflow:hidden;white-space:nowrap}
.ixp{font:400 calc(2.1 * var(--mm)) var(--sans);color:var(--muted);padding-bottom:calc(1 * var(--mm))}
.dh{flex:1 1 auto}
.tl{display:flex;align-items:flex-end;gap:calc(2 * var(--mm));height:calc(8 * var(--mm));width:calc(80 * var(--mm))}
.tl .hw{font-size:calc(5 * var(--mm))}
.points .bx{margin-bottom:calc(1 * var(--mm))}

/* print: A5 pages only */
@page{size:148mm 210mm;margin:0}
@media print{
  html,body{background:#fff}
  .wrap{max-width:none;padding:0}
  .top,.cap,.nav,#einband{display:none}
  .block{margin:0}
  .spread{display:block;filter:none;margin:0}
  .page{width:148mm;height:210mm;aspect-ratio:auto;break-after:page;border-radius:0;background-image:none;
    -webkit-print-color-adjust:exact;print-color-adjust:exact}
}
"""

FONTS = ("https://fonts.googleapis.com/css2?family=Caveat:wght@500"
         "&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400"
         "&family=Source+Sans+3:wght@400;600&display=swap")


# The cover: wine-red leather, gold lettering, three ribbons. The verse is Luther 1912, checked against xmlbible-lut1912.
HENOCH_VERSE = ("Und dieweil er ein göttliches Leben führte, nahm ihn Gott hinweg, und er ward nicht mehr gesehen.", "1. Mose 5,24")
RIBBONS = [("gold", "den Tag"), ("green", "die Ordnung (S. 6–11)"), ("blue", "die Arena")]


def cover():
    rib = "".join(f'<i class="rib {c}"></i>' for c, _ in RIBBONS)
    return f"""
<div class="case">
  <div class="board back"><div class="bv"><p>{esc(HENOCH_VERSE[0])}</p><span>{esc(HENOCH_VERSE[1])}</span></div></div>
  <div class="spine"><span>Henoch</span></div>
  <div class="board front"><div class="ft"><h2>Henoch</h2><i class="rule"></i><p>Mit Gott durch den Tag</p></div></div>
  <div class="ribs">{rib}</div>
</div>"""


def build():
    front, weeks, end = all_pages()
    ribbons = ", ".join(n for _, n in RIBBONS[:-1]) + " und " + RIBBONS[-1][1]
    blocks = [block("einband", "Einband", "Leder in Weinrot, Prägung in Gold",
                    f"Vorn groß „Henoch“, darunter „Mit Gott durch den Tag“. Hinten unten der Vers zu Henoch. "
                    f"Drei Seitenbänder in Gold, Grün und Blau, zum Beispiel für {ribbons}.", cover()),block("vorn", f"S. 1–{FRONT}", "Vorn im Heft",
                    "Titel, die Adventszeit, der Weg durch die Stille Zeit, Lesen und Beten, die Ordnung mit allen Texten, das Nachtgebet, "
                    "Mein Haus, die Gebetsübersicht, Heute und die Gewohnheiten.",
                    spreads(front, 1))]
    for i, w in enumerate(weeks):
        f0 = week_start(i)
        text = (f"Acht Seiten zum Sonntag: Wochenspruch, Andacht von Dieffenbach, Betrachtung von Löhe, die Stille Zeit, "
                f"der Gottesdienst und der Wochenrückblick. Dann die Wochenübersicht der Gewohnheiten und „Diese Woche“, "
                f"danach Montag bis Samstag, je eine Doppelseite, oben wie „Heute“ in der App.")
        if i == 0:
            text += " Sonntag und Montag tragen Beispieleinträge."
        blocks.append(block(f"advent{i + 1}", f"S. {f0}–{f0 + WEEK - 1}", f"{i + 1}. Sonntag im Advent", text, spreads(w, f0)))
    blocks.append(block("arena", f"S. {P_END}–{P_SOURCES}", "Christfest und Arena",
                        f"Das Christfest als Ausblick. Dann die Arena: der Eingang, die Gebetskammer mit {CHAMBER_PAGES} Einträgen "
                        f"und die Eisenschmiede mit {FORGE_PAGES} Treffen, je eine Seite, ohne Archiv. Am Ende die Quellen.",
                        spreads(end, P_END)))
    nav = [("einband", "Einband"), ("vorn", "Vorn"), ("advent1", "1. Advent"), ("advent2", "2. Advent"), ("advent3", "3. Advent"),
           ("advent4", "4. Advent"), ("arena", "Christfest und Arena")]
    nav_html = "".join(f'<li><a href="#{a}">{t}</a></li>' for a, t in nav)
    total = P_SOURCES
    body = f"""
<div class="wrap">
  <header class="top">
    <div>
      <p class="eyebrow">Henoch · Musternotizbuch · {total} Seiten A5</p>
      <h1>Henoch im Advent</h1>
      <p class="lede">Vom 1. Sonntag im Advent bis zum Heiligen Abend. Jeder Tag führt auf einer Doppelseite durch die Stille Zeit der App: zuerst das Wort, dann das Gebet, zuletzt die Ausrichtung. Texte, Felder und Farben kommen aus der App.</p>
    </div>
    <div style="display:grid">
      <button class="toggle" id="ex-toggle" type="button" aria-pressed="true"><span class="sw" aria-hidden="true"></span>Beispieleinträge</button>
      <p class="hint">Blaue Handschrift ist ein Beispiel. Ausgeschaltet zeigen die Seiten, wie sie gedruckt würden.</p>
    </div>
  </header>
  <nav aria-label="Teile"><ul class="nav">{nav_html}</ul></nav>
  <main id="book" class="show">
    {"".join(blocks)}
  </main>
</div>
<script>
(function(){{
  var btn=document.getElementById('ex-toggle'), book=document.getElementById('book'), KEY='henoch-advent-examples';
  function set(on){{ book.classList.toggle('show',on); btn.setAttribute('aria-pressed', on?'true':'false'); }}
  try{{ if(localStorage.getItem(KEY)==='0') set(false); }}catch(e){{}}
  btn.addEventListener('click',function(){{
    var on=!book.classList.contains('show'); set(on);
    try{{ localStorage.setItem(KEY,on?'1':'0'); }}catch(e){{}}
  }});
}})();
</script>
"""
    head = (f'<title>Henoch im Advent</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
            f'<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            f'<link rel="stylesheet" href="{FONTS}">\n<style>{css()}</style>\n')
    (HERE / "henoch-advent.html").write_text(head + body, encoding="utf-8")
    full = ('<!doctype html><html lang="de"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
            + head + "</head><body>" + body + "</body></html>")
    (HERE / "henoch-advent-druck.html").write_text(full, encoding="utf-8")
    print("ok", total, "Seiten")


if __name__ == "__main__":
    build()
