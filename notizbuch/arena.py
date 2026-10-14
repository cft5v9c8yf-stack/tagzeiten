#!/usr/bin/env python3
"""Henoch Arena: sample pages for the two places of the Arena, Gebetskammer and Eisenschmiede.

Structure and wording follow the app (src/features/arena/ArenaPage.tsx, src/content/settingsVerses.ts):
the verse of the Arena, the notes of each place, the fields of an entry and the words of comfort.
The Wüstenwanderung, the Arena's third place in the app, is left out of the book.

Run: python3 arena.py (writes henoch-arena.html and henoch-arena-druck.html next to this file).
"""
import html
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build as B  # noqa: E402
import ordnung as O  # noqa: E402
from build import hw, ln, lines, row, sec, b, page, spread, block  # noqa: E402


def esc(t):
    return html.escape(t, quote=False)


# ------------------------------------------------------------------ the app's texts (verbatim)

ARENA_VERSE = ("kämpfe den guten Kampf des Glaubens; ergreife das ewige Leben", "1. Timotheus 6,12")  # settingsVerses: arena
FORGE_VERSE = ("Ein Messer wetzt das andere und ein Mann den andern.", "Sprüche 27,17")  # settingsVerses: forge

JOURNAL = {
    "title": "Gebetskammer",
    "note": "Hier schreibst du auf, was dich belastet und womit du ringst. Sünde wird gebetet, nicht notiert – dafür ist die Beichte im Nachtgebet.",
    "tile": "Was dich belastet und womit du ringst",
    "text_label": "Was dich bewegt",
    "text_hint": "Was dich belastet, womit du ringst, was Gott dir heute gezeigt hat …",
    "concern_hint": "Wofür du betest",
    "comfort": [("Gott ist getreu, der euch nicht läßt versuchen über euer Vermögen, sondern macht, daß die Versuchung so ein Ende gewinne, daß ihr’s könnet ertragen.", "1. Korinther 10,13"),
                ("Aber in dem allem überwinden wir weit um deswillen, der uns geliebt hat.", "Römer 8,37")],
}
FORGE = {
    "title": "Eisenschmiede",
    "note": "Was du zum nächsten Treffen mit deinen Brüdern mitbringst: was ihr besprechen und wofür ihr miteinander beten sollt. Was ihr einander bekennt, bleibt im Gespräch und wird hier nicht notiert.",
    "tile": "Für das Treffen mit deinen Brüdern",
    "concern_hint": "Wofür ihr gemeinsam betet",
    "points_label": "Was du mit den Brüdern besprechen willst",
    "point_hint": "Was dich umtreibt, wo du Rat brauchst …",
    "comfort": [("Einer trage des andern Last, so werdet ihr das Gesetz Christi erfüllen.", "Galater 6,2"),
                ("Denn wo zwei oder drei versammelt sind in meinem Namen, da bin ich mitten unter ihnen.", "Matthäus 18,20")],
}

# ------------------------------------------------------------------ helpers


def hint(t):
    return f'<span class="phint">{esc(t)}</span>'


def hlines(n, hint_text=None, hws=()):
    """n writing lines; the first carries the app's placeholder in grey until the examples are switched on."""
    out = []
    for i in range(n):
        t = hws[i] if i < len(hws) else ""
        inner = hw(esc(t)) if t else ""
        if i == 0 and hint_text:
            inner = hint(hint_text) + inner
        out.append(ln(inner))
    return '<div class="lines">' + "".join(out) + "</div>"


def verse_html(text, ref):
    return f'<div class="vs ws">„{esc(text)}“<cite>{esc(ref)}</cite></div>'


def comfort_html(items):
    return '<aside class="comfort" aria-label="Zuspruch">' + "".join(
        f'<p>{esc(t)}<cite>{esc(r)}</cite></p>' for t, r in items) + "</aside>"


def datefield(example=""):
    return f'<div class="dline" style="width:calc(46 * var(--mm))"><span class="pl">Datum</span>{hw(esc(example)) if example else ""}</div>'

# ------------------------------------------------------------------ pages


def p_arena(folio):
    tiles = [("Gebetskammer", JOURNAL["tile"], "S. 3"), ("Eisenschmiede", FORGE["tile"], "S. 17")]
    t = "".join(f'<div class="atile"><b>{a}</b><span>{esc(l)}</span><i>{p}</i></div>' for a, l, p in tiles)
    inner = f"""
<header class="ph"><h2 class="pt">Arena</h2></header>
{verse_html(*ARENA_VERSE)}
<div class="atiles">{t}</div>
"""
    return page("l", str(folio), f"Seite {folio}: Arena", inner, runner="Arena")


def p_overview(folio, kind):
    if kind == "journal":
        ex = [("12. 10.", "Gespräch mit T. morgen", "Römer 8,37"), ("14. 10.", "Müde, und doch dran bleiben", "1. Korinther 10,13"),
              ("18. 10.", "Dank für die ruhige Woche", "Psalm 103,2")]
        head = '<div class="th"><span>Datum</span><span>Erste Zeile</span><span>Bibelstellen</span><span class="ck">archiviert</span></div>'
        rows = ""
        for i in range(18):
            d, z, v = ex[i] if i < len(ex) else ("", "", "")
            rows += f'<div><span>{hw(d) if d else ""}</span><span>{hw(esc(z)) if z else ""}</span><span>{hw(esc(v)) if v else ""}</span><span class="ck">{b(False)}</span></div>'
        inner = f"""
<header class="ph"><h2 class="pt">{JOURNAL["title"]}</h2></header>
{verse_html(*ARENA_VERSE)}
<p class="txt">{esc(JOURNAL["note"])}</p>
<div class="tbl ov jt">{head}{rows}</div>
"""
        return page("r", str(folio), f"Seite {folio}: Gebetskammer, Übersicht", inner, runner="Gebetskammer")
    ex = [("Sa 17. 10.", "Küche um 20 Uhr hält noch nicht", True), ("Sa 24. 10.", "Wie lade ich einen Bruder ein?", False)]
    head = '<div class="th"><span>Treffen am</span><span>Erster Punkt</span><span class="ck">besprochen</span></div>'
    rows = ""
    for i in range(18):
        d, z, ok = ex[i] if i < len(ex) else ("", "", False)
        rows += f'<div><span>{hw(d) if d else ""}</span><span>{hw(esc(z)) if z else ""}</span><span class="ck"><span class="b{" on" if ok else ""}"></span></span></div>'
    inner = f"""
<header class="ph"><h2 class="pt">{FORGE["title"]}</h2></header>
{verse_html(*FORGE_VERSE)}
<p class="txt">{esc(FORGE["note"])}</p>
<div class="tbl ov ft">{head}{rows}</div>
"""
    return page("l", str(folio), f"Seite {folio}: Eisenschmiede, Übersicht", inner, runner="Eisenschmiede")


def p_journal_l(folio, ex):
    e = ex or {}
    inner = f"""
<header class="ph"><h2 class="pt"><small>Eintrag</small>{JOURNAL["title"]}</h2><div class="pm">{datefield(e.get("date", ""))}</div></header>
{sec("", "Bibelstelle")}
{hlines(3, "z. B. Römer 8,37", e.get("verses", ()))}
{sec("", "Gebetsanliegen")}
{hlines(4, JOURNAL["concern_hint"], e.get("concerns", ()))}
{sec("", JOURNAL["text_label"])}
{hlines(17, JOURNAL["text_hint"], e.get("text", ()))}
"""
    return page("l", str(folio), f"Seite {folio}: Gebetskammer, Eintrag", inner, runner="Gebetskammer")


def p_journal_r(folio, ex):
    e = ex or {}
    inner = f"""
{hlines(22, None, e.get("text2", ()))}
{comfort_html(JOURNAL["comfort"])}
<div class="arch"><span class="b"></span><span>archiviert am</span><span class="afill"></span></div>
"""
    return page("r", str(folio), f"Seite {folio}: Gebetskammer, Eintrag", inner, runner="Gebetskammer")


def p_forge(folio, side, ex):
    e = ex or {}
    pts = e.get("points", [])
    prow = ""
    for i in range(9):
        t, done = pts[i] if i < len(pts) else ("", False)
        ph = hint(FORGE["point_hint"]) if i == 0 and not t else ""
        prow += f'<div class="pt-row"><span class="b{" on" if done else ""}"></span><div class="ln">{ph}{hw(esc(t)) if t else ""}</div></div>'
    inner = f"""
<header class="ph"><h2 class="pt"><small>fürs Treffen mit den Brüdern</small>{FORGE["title"]}</h2></header>
<div class="meet"><span class="pl">Für das Treffen am</span>{hw(esc(e.get("date", ""))) if e.get("date") else ""}</div>
{sec("", "Bibelstelle")}
{hlines(2, "z. B. Galater 6,2", e.get("verses", ()))}
{sec("", "Gebetsanliegen")}
{hlines(3, FORGE["concern_hint"], e.get("concerns", ()))}
{sec("", FORGE["points_label"], "Haken, wenn besprochen")}
<div class="pts">{prow}</div>
{comfort_html(FORGE["comfort"])}
<div class="arch"><span class="b"></span><span>Besprochen, archiviert am</span><span class="afill"></span></div>
"""
    return page(side, str(folio), f"Seite {folio}: Eisenschmiede, Eintrag", inner, runner="Eisenschmiede")


J_EX = {"date": "Montag, 12. Oktober 2026", "verses": ["Römer 8,37"],
        "concerns": ["Das Gespräch mit T. morgen", "Ruhe vor dem Schlafengehen"],
        "text": ["Morgen das Gespräch mit T. Ich merke, wie ich innerlich schon", "meine Sätze vorbereite. Ich will zuhören, bevor ich antworte."],
        "text2": ["Ich habe heute Morgen gebetet und bin ruhiger geworden."]}
F_EX = {"date": "Samstag, 17. Oktober 2026", "verses": ["Galater 6,2"],
        "concerns": ["Matthias: Schlaf, das Kleinkind zahnt", "Daniel: die Bewerbung"],
        "points": [("Küche um 20 Uhr hält noch nicht", True), ("Wie lade ich einen Bruder ein?", False), ("Rat für das Gespräch mit T.", False)]}

# ------------------------------------------------------------------ document

CSS_AR = r"""
.atiles{display:grid;gap:calc(2.4 * var(--mm));margin-top:calc(5 * var(--mm))}
.atile{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:calc(.4 * var(--mm)) calc(3 * var(--mm));padding:calc(3 * var(--mm)) calc(3.4 * var(--mm));border:max(1px,calc(.25 * var(--mm))) solid var(--line);border-radius:calc(1.2 * var(--mm))}
.atile b{font:600 calc(4 * var(--mm)) var(--serif);color:var(--rubric)}
.atile span{grid-column:1;font-size:calc(2.6 * var(--mm));color:var(--ink-2)}
.atile i{grid-column:2;grid-row:1 / span 2;align-self:center;font:600 calc(2.3 * var(--mm)) var(--sans);color:var(--ink-3);font-style:normal}
.phint{font:italic 400 calc(2.35 * var(--mm)) var(--serif);color:var(--ink-3);padding-bottom:calc(.9 * var(--mm));white-space:nowrap;overflow:hidden}
.show .phint{display:none}
.comfort{margin-top:calc(3 * var(--mm));padding-top:calc(2 * var(--mm));border-top:max(1px,calc(.3 * var(--mm))) solid var(--ink-3)}
.comfort p{margin:calc(1 * var(--mm)) 0 0;font:italic 400 calc(2.6 * var(--mm)) var(--serif);line-height:1.42;color:var(--ink)}
.comfort cite{display:block;font:600 calc(2 * var(--mm)) var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--rubric);font-style:normal;margin-top:calc(.3 * var(--mm))}
.arch{display:flex;align-items:flex-end;gap:calc(2 * var(--mm));margin-top:auto;padding-top:calc(2 * var(--mm));font:600 calc(2.3 * var(--mm)) var(--sans);color:var(--ink-2)}
.afill{flex:1 1 auto;border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--line);height:calc(4 * var(--mm))}
.jt > div{grid-template-columns:calc(17 * var(--mm)) minmax(0,1fr) calc(34 * var(--mm)) calc(14 * var(--mm));min-height:calc(6.6 * var(--mm))}
.ft > div{grid-template-columns:calc(24 * var(--mm)) minmax(0,1fr) calc(15 * var(--mm));min-height:calc(6.6 * var(--mm))}
.ov .ck{text-align:center;display:flex;justify-content:center;align-items:flex-end}
.meet{display:flex;align-items:flex-end;gap:calc(2 * var(--mm));margin-top:calc(2 * var(--mm));border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--line);min-height:calc(6 * var(--mm))}
.pts{margin-top:calc(1.2 * var(--mm))}
.pt-row{display:grid;grid-template-columns:calc(5 * var(--mm)) minmax(0,1fr);align-items:end;column-gap:calc(1 * var(--mm))}
.pt-row .b{margin-bottom:calc(1.2 * var(--mm))}
.pt-row .ln{--lh:calc(6.2 * var(--mm))}
"""


def build():
    css = B.CSS + O.ORD_CSS + CSS_AR
    cover = """
<section class="block" id="arena-ueberblick"><div class="cap"><span class="pg">Arena</span><h2>Zwei Orte</h2>
<p>Die Arena der App hat die Gebetskammer für dich allein und die Eisenschmiede für das Treffen mit deinen Brüdern. Im Buch folgen sie dem Aufbau der App: dieselben Felder, dieselben Worte, derselbe Zuspruch am Ende. Die Wüstenwanderung bleibt im Buch weg.</p></div>
<div class="plan"><div class="parts kj" style="grid-template-columns:repeat(3,minmax(0,1fr))">
<div><h3><i style="background:var(--seg1)"></i>Arena<b>2 S.</b></h3><ul><li><span>S. 1</span><span>Eingang mit dem Vers der Arena</span></li><li><span>S. 2</span><span>Übersicht der Gebetskammer</span></li></ul></div>
<div><h3><i style="background:var(--seg5)"></i>Gebetskammer<b>16 S.</b></h3><ul><li><span>S. 3–4</span><span>erster Eintrag als Doppelseite</span></li><li><span>S. 5–16</span><span>sechs weitere Einträge</span></li></ul></div>
<div><h3><i style="background:var(--seg6)"></i>Eisenschmiede<b>16 S.</b></h3><ul><li><span>S. 17</span><span>Übersicht der Treffen</span></li><li><span>S. 18–32</span><span>15 Seiten, je ein Treffen</span></li></ul></div>
</div><p class="sum">Zusammen 34 Seiten. Die Muster zeigen davon je die ersten.</p></div></section>"""
    blocks = [
        cover,
        block("a-eingang", "S. 1–2", "Eingang und Übersicht",
              "Der Eingang trägt den Vers der Arena und nennt die beiden Orte, wie die Kacheln der App. Daneben steht die Übersicht der Gebetskammer: Datum, erste Zeile und Bibelstellen jedes Eintrags, dazu ein Feld „archiviert“.",
              spread(p_arena(1), p_overview(2, "journal"))),
        block("a-kammer", "S. 3–6", "Gebetskammer",
              "Ein Eintrag hat eine Doppelseite. Oben stehen Bibelstellen und Gebetsanliegen, dann „Was dich bewegt“ auf vielen Zeilen, am Ende der Zuspruch aus Korinther und Römer. Sünde wird gebetet, nicht notiert; das steht auf der Übersicht, und der Eintrag hat dafür keine Zeile. Die zweite Doppelseite zeigt die leere Vorlage.",
              spread(p_journal_l(3, J_EX), p_journal_r(4, J_EX)) + '<div class="gap"></div>' + spread(p_journal_l(5, None), p_journal_r(6, None))),
        block("a-schmiede", "S. 17–20", "Eisenschmiede",
              "Links die Übersicht der Treffen, nach dem Datum des Treffens. Ein Treffen hat eine Seite: Bibelstellen, Gebetsanliegen und die Liste der Punkte, jeder mit einem Haken, wenn er besprochen ist. Unten der Zuspruch aus Galater und Matthäus. Was die Brüder einander bekennen, steht nicht im Buch.",
              spread(p_overview(17, "forge"), p_forge(18, "r", F_EX)) + '<div class="gap"></div>' + spread(p_forge(19, "l", None), p_forge(20, "r", None))),
    ]
    nav = [("arena-ueberblick", "Zwei Orte"), ("a-eingang", "Eingang"), ("a-kammer", "Gebetskammer"), ("a-schmiede", "Eisenschmiede")]
    nav_html = "".join(f'<li><a href="#{a}">{t}</a></li>' for a, t in nav)
    body = f"""
<div class="wrap">
  <header class="top">
    <div>
      <p class="eyebrow">Henoch · Musterseiten</p>
      <h1>Henoch Arena</h1>
      <p class="lede">Die Arena als Notizbuchseiten: die Gebetskammer für das, was dich bewegt, und die Eisenschmiede für das Treffen mit den Brüdern. Texte, Felder und Zuspruch wie in der App.</p>
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
  var btn=document.getElementById('ex-toggle'), book=document.getElementById('book'), KEY='henoch-arena-examples';
  function set(on){{ book.classList.toggle('show',on); btn.setAttribute('aria-pressed', on?'true':'false'); }}
  try{{ var v=localStorage.getItem(KEY); if(v==='0') set(false); }}catch(e){{}}
  btn.addEventListener('click',function(){{
    var on=!book.classList.contains('show'); set(on);
    try{{ localStorage.setItem(KEY,on?'1':'0'); }}catch(e){{}}
  }});
}})();
</script>
"""
    head = (f'<title>Henoch Arena</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
            f'<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            f'<link rel="stylesheet" href="{B.FONTS}">\n<style>{css}</style>\n')
    (HERE / "henoch-arena.html").write_text(head + body, encoding="utf-8")
    full = ('<!doctype html><html lang="de"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
            + head + "</head><body>" + body + "</body></html>")
    (HERE / "henoch-arena-druck.html").write_text(full, encoding="utf-8")
    print("ok")


if __name__ == "__main__":
    build()
