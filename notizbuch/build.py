#!/usr/bin/env python3
"""Builds the Henoch notebook sample pages: the artifact page and a standalone HTML that prints to A5.

Run: python3 build.py (writes henoch-notizbuch.html and henoch-notizbuch-druck.html next to this file).
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import ordnung as O

OUT_DIR = pathlib.Path(__file__).resolve().parent
OUT_DIR.mkdir(parents=True, exist_ok=True)

FONTS = ("https://fonts.googleapis.com/css2?family=Caveat:wght@500"
         "&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400"
         "&family=Source+Sans+3:wght@400;600;700&display=swap")

CSS = r"""
/* Layout: a desk with A5 notebook spreads (148 x 210 mm), every page measured in real millimetres via container units */
:root{
  --desk:#E2E0DA; --desk-2:#D6D3CB; --desk-ink:#1D2330; --desk-muted:#5A606C; --desk-rule:#C4C0B6; --chip:#F2F0EB;
  --paper:#FBFAF6; --endpaper:#E9E3D7; --ink:#1D2330; --ink-2:#565D6B; --ink-3:#8E8A82; --line:#D5D0C6; --dot:#C3BDB1;
  --rubric:#8C2F2F; --hand:#243B6B; --silent:#F1EEE7; --shade:rgba(29,35,48,.18);
  --cloth:#1F2B3A; --cloth-2:#162030; --gilt:#C9B27D; --band:#0E141D; --ribbon-1:#8C2F2F; --ribbon-2:#3E6B4E;
  --seg1:#8C2F2F; --seg2:#3A4A63; --seg3:#3E6B4E; --seg4:#9A7B2F;
  --serif:"Literata",Georgia,"Times New Roman",serif;
  --sans:"Source Sans 3",-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;
  --script:"Caveat","Segoe Print","Bradley Hand",cursive;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --desk:#121821; --desk-2:#0D121A; --desk-ink:#E6E1D6; --desk-muted:#9AA2AF; --desk-rule:#2A3443; --chip:#1B2432; --shade:rgba(0,0,0,.55);
  --seg1:#B5554B; --seg2:#5C7098; --seg3:#5E9472; --seg4:#B8994F;
  color-scheme:dark}}
:root[data-theme="dark"]{
  --desk:#121821; --desk-2:#0D121A; --desk-ink:#E6E1D6; --desk-muted:#9AA2AF; --desk-rule:#2A3443; --chip:#1B2432; --shade:rgba(0,0,0,.55);
  --seg1:#B5554B; --seg2:#5C7098; --seg3:#5E9472; --seg4:#B8994F;
  color-scheme:dark}

body{background:var(--desk);color:var(--desk-ink);font-family:var(--sans);font-size:16px;line-height:1.5}
.wrap{max-width:1160px;margin:0 auto;padding-left:max(16px, env(safe-area-inset-left, 0px));padding-right:max(16px, env(safe-area-inset-right, 0px));padding-block:40px 72px}

/* ---------- chrome ---------- */
.top{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:end;border-bottom:1px solid var(--desk-rule);padding-bottom:22px}
.eyebrow{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--desk-muted);font-weight:600;margin:0 0 6px}
h1{font-family:var(--serif);font-weight:600;font-size:clamp(2rem,4.4vw,3rem);line-height:1.08;margin:0;text-wrap:balance;letter-spacing:-.01em}
.lede{font-family:var(--serif);font-size:1.05rem;max-width:62ch;margin:12px 0 0;color:var(--desk-ink)}
.toggle{justify-self:end;display:flex;align-items:center;gap:10px;background:var(--chip);border:1px solid var(--desk-rule);border-radius:999px;padding:7px 14px 7px 8px;font:600 .9rem var(--sans);color:var(--desk-ink);cursor:pointer}
.toggle .sw{width:34px;height:20px;border-radius:999px;background:var(--desk-rule);position:relative;transition:background .2s}
.toggle .sw::after{content:"";position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:var(--paper);transition:transform .2s}
.toggle[aria-pressed="true"] .sw{background:var(--hand)}
.toggle[aria-pressed="true"] .sw::after{transform:translateX(14px)}
.toggle:focus-visible,.nav a:focus-visible{outline:2px solid var(--hand);outline-offset:3px}
.hint{font-size:.85rem;color:var(--desk-muted);margin:8px 0 0;text-align:right;max-width:30ch;justify-self:end}
.nav{display:flex;flex-wrap:wrap;gap:6px 8px;margin:22px 0 0;padding:0;list-style:none}
.nav a{display:inline-block;font-size:.86rem;color:var(--desk-ink);text-decoration:none;border:1px solid var(--desk-rule);border-radius:999px;padding:3px 12px;background:var(--chip)}
.nav a:hover{border-color:var(--desk-muted)}

.block{margin-top:56px;scroll-margin-top:16px}
.gap{height:36px}
.cap{display:grid;grid-template-columns:minmax(0,1fr);gap:4px;max-width:70ch;margin:0 auto 18px;text-align:center}
.cap h2{font-family:var(--serif);font-weight:600;font-size:1.35rem;margin:0;text-wrap:balance}
.cap .pg{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--desk-muted);font-weight:600}
.cap p{margin:0;color:var(--desk-muted);font-size:.95rem}

/* ---------- cover + spec ---------- */
.cover-row{display:grid;grid-template-columns:minmax(0,380px) minmax(0,1fr);gap:48px;align-items:center;justify-content:center}
.book{position:relative;aspect-ratio:148/210;max-width:100%;container-type:inline-size;margin-bottom:28px}
.book .cl{position:absolute;inset:0;border-radius:2px 7px 7px 2px;
  background:
    repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 1px, transparent 1px 3px),
    repeating-linear-gradient(90deg, rgba(0,0,0,.06) 0 1px, transparent 1px 3px),
    linear-gradient(90deg, var(--cloth-2) 0, var(--cloth) 5%, var(--cloth) 100%);
  box-shadow:0 18px 40px var(--shade), inset -2px 0 0 rgba(255,255,255,.05);}
.book .spine{position:absolute;left:4.2%;top:0;bottom:0;width:1px;background:rgba(0,0,0,.35);box-shadow:1px 0 0 rgba(255,255,255,.05)}
.book .band{position:absolute;right:9%;top:-1px;bottom:-1px;width:3.2%;background:var(--band);box-shadow:0 0 0 1px rgba(255,255,255,.03), 2px 0 4px rgba(0,0,0,.3)}
.book .rib{position:absolute;bottom:-26px;width:3.4%;height:40px;clip-path:polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)}
.book .rib.a{left:44%;background:var(--ribbon-1)}
.book .rib.b{left:49%;background:var(--ribbon-2);height:34px;bottom:-20px}
.book .rib.c{left:54%;background:var(--band);height:30px;bottom:-16px}
.book .ttl{position:absolute;left:0;right:0;top:30%;text-align:center;color:var(--gilt)}
.book .ttl b{display:block;font-family:var(--serif);font-weight:600;font-size:11.5cqw;letter-spacing:.32em;padding-left:.32em;text-shadow:0 1px 0 rgba(0,0,0,.45)}
.book .ttl i{display:block;width:16cqw;height:1px;background:var(--gilt);opacity:.7;margin:5cqw auto}
.book .ttl span{display:block;font-family:var(--sans);font-weight:600;font-size:3.4cqw;letter-spacing:.42em;padding-left:.42em;text-transform:uppercase;opacity:.85}
.spec h2{font-family:var(--serif);font-weight:600;font-size:1.35rem;margin:0 0 10px}
.spec dl{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px 18px;margin:0}
.spec dt{font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--desk-muted);font-weight:600;padding-top:3px}
.spec dd{margin:0;font-family:var(--serif)}

/* ---------- spreads ---------- */
.spread{display:grid;grid-template-columns:repeat(2,minmax(0,560px));justify-content:center;filter:drop-shadow(0 14px 22px var(--shade))}
.spread.solo{grid-template-columns:minmax(0,560px)}
.page{container-type:inline-size;aspect-ratio:148/210;background:var(--paper);position:relative;color:var(--ink);overflow:hidden}
.page.l{border-radius:3px 0 0 3px;background-image:linear-gradient(to left, rgba(29,35,48,.10), rgba(29,35,48,0) 7%)}
.page.r{border-radius:0 3px 3px 0;background-image:linear-gradient(to right, rgba(29,35,48,.10), rgba(29,35,48,0) 7%)}
.page.ep{background-color:var(--endpaper)}
.in{--mm:calc(100cqw / 148);--lh:calc(5.5 * var(--mm));position:absolute;inset:0;display:flex;flex-direction:column;
  padding:calc(12 * var(--mm)) calc(14 * var(--mm)) calc(15 * var(--mm)) calc(11 * var(--mm));
  font-family:var(--serif);font-size:calc(2.75 * var(--mm));line-height:1.38}
.r .in{padding-left:calc(14 * var(--mm));padding-right:calc(11 * var(--mm))}
.folio{position:absolute;bottom:calc(7 * var(--mm));font:600 calc(2.3 * var(--mm)) var(--sans);color:var(--ink-3);font-variant-numeric:tabular-nums;letter-spacing:.04em}
.l .folio{left:calc(11 * var(--mm))}
.r .folio{right:calc(11 * var(--mm))}
.runner{position:absolute;top:calc(6.2 * var(--mm));font:600 calc(2 * var(--mm)) var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3)}
.l .runner{left:calc(11 * var(--mm))}
.r .runner{right:calc(11 * var(--mm))}

/* page header */
.ph{display:flex;justify-content:space-between;align-items:flex-end;gap:calc(4 * var(--mm));border-bottom:calc(.35 * var(--mm)) solid var(--rubric);padding-bottom:calc(1.4 * var(--mm));margin-bottom:calc(1 * var(--mm))}
.pt{font-family:var(--serif);font-weight:600;font-size:calc(6 * var(--mm));line-height:1;color:var(--rubric);margin:0;letter-spacing:-.005em}
.pt small{display:block;font:600 calc(2.1 * var(--mm)) var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin-bottom:calc(1.2 * var(--mm))}
.pm{display:flex;flex-direction:column;align-items:flex-end;gap:calc(1.2 * var(--mm))}
.dline{display:flex;align-items:flex-end;gap:calc(1.5 * var(--mm));width:calc(52 * var(--mm));border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--line);height:calc(5 * var(--mm))}

/* sections + rows */
.sec{display:flex;align-items:baseline;gap:calc(1.6 * var(--mm));margin-top:calc(2.6 * var(--mm));font:700 calc(2.25 * var(--mm)) var(--sans);letter-spacing:.11em;text-transform:uppercase;color:var(--rubric)}
.sec .no{font-variant-numeric:tabular-nums}
.sec .m{margin-left:auto;font-weight:600;letter-spacing:.04em;text-transform:none;color:var(--ink-3)}
.sub{margin-top:calc(2 * var(--mm));font:700 calc(2.15 * var(--mm)) var(--sans);letter-spacing:.06em;color:var(--ink)}
.sub em{font:italic 400 calc(2.4 * var(--mm)) var(--serif);letter-spacing:0;color:var(--ink-2);margin-left:calc(1.2 * var(--mm))}
.row{display:grid;grid-template-columns:calc(22 * var(--mm)) minmax(0,1fr);align-items:start;position:relative}
.row.kf::before{content:"";position:absolute;left:calc(-3.4 * var(--mm));top:calc(1 * var(--mm));bottom:calc(.8 * var(--mm));width:calc(.7 * var(--mm));background:var(--rubric)}
.lab{font:600 calc(2.3 * var(--mm)) var(--sans);color:var(--ink-2);line-height:1.12;padding-top:calc(var(--lh) - 3.4 * var(--mm));padding-right:calc(1.5 * var(--mm))}
.lab .g{display:inline-block;font:600 calc(3.6 * var(--mm)) var(--serif);color:var(--rubric);width:calc(4.2 * var(--mm));line-height:1;vertical-align:-.1em}
.lines{display:flex;flex-direction:column;min-width:0}
.ln{height:var(--lh);border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--line);display:flex;align-items:flex-end;gap:calc(1.6 * var(--mm));min-width:0;white-space:nowrap;overflow:hidden}
.row.tall{--lh:calc(6.4 * var(--mm))}
.page.dense .in{--lh:calc(5.15 * var(--mm))}
.ln .half{flex:1 1 0;display:flex;align-items:flex-end;gap:calc(1.4 * var(--mm));min-width:0}
.pl{font:600 calc(2.1 * var(--mm)) var(--sans);color:var(--ink-3);letter-spacing:.04em;padding-bottom:calc(.9 * var(--mm));flex:none}
.pi{font:italic 400 calc(2.45 * var(--mm)) var(--serif);color:var(--ink-2);padding-bottom:calc(.8 * var(--mm));flex:none}
.pr{margin:calc(1.2 * var(--mm)) 0 0;font:italic 400 calc(2.4 * var(--mm)) var(--serif);color:var(--ink-2);line-height:1.4}
.rb{margin:calc(1 * var(--mm)) 0 calc(.6 * var(--mm));font:italic 400 calc(2.5 * var(--mm)) var(--serif);color:var(--rubric);line-height:1.4}
.rb cite{font:600 calc(2 * var(--mm)) var(--sans);letter-spacing:.06em;font-style:normal;margin-left:calc(1 * var(--mm))}
.txt{margin:calc(1.2 * var(--mm)) 0 0;font-size:calc(2.7 * var(--mm));line-height:1.45}
.vs{margin:calc(1.2 * var(--mm)) 0 0 calc(3 * var(--mm));font-size:calc(2.75 * var(--mm));line-height:1.42}
.vs cite{display:block;font:600 calc(2 * var(--mm)) var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--rubric);font-style:normal;margin-top:calc(.6 * var(--mm))}
.end{margin-top:auto;padding-top:calc(2 * var(--mm));font:italic 400 calc(2.5 * var(--mm)) var(--serif);color:var(--ink-2);text-align:center}
.grow{flex:1 1 auto}

/* marks, chips, circles, boxes */
.chips{display:flex;flex-wrap:nowrap;gap:calc(1.6 * var(--mm));align-items:flex-end;padding-bottom:calc(.8 * var(--mm))}
.chip{position:relative;font:600 calc(2.25 * var(--mm)) var(--sans);color:var(--ink-2);padding:0 calc(.5 * var(--mm));letter-spacing:.02em}
.days .chip{width:calc(4.6 * var(--mm));text-align:center;padding:0}
.mk{position:relative;font:700 calc(3.1 * var(--mm)) var(--sans);color:var(--ink-2);width:calc(4.2 * var(--mm));text-align:center;line-height:1}
.c{display:inline-block;width:calc(3.1 * var(--mm));height:calc(3.1 * var(--mm));border-radius:50%;border:max(1px,calc(.24 * var(--mm))) solid var(--ink-3);box-sizing:border-box;vertical-align:middle}
.b{position:relative;display:inline-block;width:calc(3 * var(--mm));height:calc(3 * var(--mm));border:max(1px,calc(.24 * var(--mm))) solid var(--ink-3);box-sizing:border-box;vertical-align:middle;flex:none}
.dash{font:600 calc(2.4 * var(--mm)) var(--sans);color:var(--ink-3)}
.rest{font:italic 400 calc(2.2 * var(--mm)) var(--serif);color:var(--ink-3)}

/* handwriting (example entries) */
.hw{display:none;font-family:var(--script);font-weight:500;font-size:calc(4.05 * var(--mm));line-height:1;color:var(--hand);padding:0 0 calc(.45 * var(--mm)) calc(.6 * var(--mm));white-space:nowrap}
.show .hw{display:inline-block}
.show .hc::after{content:"";position:absolute;inset:calc(-.9 * var(--mm)) calc(-1.1 * var(--mm));border:calc(.28 * var(--mm)) solid var(--hand);border-radius:50%;transform:rotate(-6deg);opacity:.9;pointer-events:none}
.show .c.on{background:radial-gradient(circle at 46% 54%, var(--hand) 0 52%, transparent 58%)}
.show .b.on::after{content:"";position:absolute;left:calc(.75 * var(--mm));top:calc(-1 * var(--mm));width:calc(1.1 * var(--mm));height:calc(2.8 * var(--mm));border:solid var(--hand);border-width:0 calc(.5 * var(--mm)) calc(.5 * var(--mm)) 0;transform:rotate(38deg)}
.show .nb.on::after{content:"";position:absolute;left:8%;right:8%;top:50%;height:calc(.45 * var(--mm));background:var(--hand);transform:rotate(-52deg);border-radius:2px}

/* silent panel: prayed, not written */
.silent{margin-top:calc(1.4 * var(--mm));height:calc(13 * var(--mm));background:var(--silent);border-radius:calc(1 * var(--mm));display:grid;place-items:center;font:italic 400 calc(2.6 * var(--mm)) var(--serif);color:var(--ink-2)}
.silent.sm{height:auto;padding:calc(1.6 * var(--mm)) calc(3 * var(--mm));place-items:start;justify-items:start}

/* tables */
.tbl{display:grid;margin-top:calc(1.4 * var(--mm))}
.tbl > div{display:grid;align-items:end;border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--line);min-height:calc(7.6 * var(--mm))}
.tbl .th{font:700 calc(1.95 * var(--mm)) var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3);min-height:0;padding-bottom:calc(1 * var(--mm));border-bottom-color:var(--ink-3);line-height:1.15}
.tbl span{min-width:0;overflow:hidden;white-space:nowrap;padding-bottom:calc(1 * var(--mm))}
.tbl .th span{white-space:normal}
.tbl .d{font:700 calc(2.4 * var(--mm)) var(--sans);color:var(--rubric)}
.tbl .ps{font:400 calc(2.6 * var(--mm)) var(--serif);font-variant-numeric:tabular-nums}
.tbl .st{font:400 calc(2.45 * var(--mm)) var(--serif);color:var(--ink-2)}
.tbl .hw{padding-bottom:0}
.wk > div{grid-template-columns:calc(8 * var(--mm)) calc(18 * var(--mm)) calc(31 * var(--mm)) calc(28 * var(--mm)) minmax(0,1fr)}
.mo > div{grid-template-columns:calc(22 * var(--mm)) minmax(0,1fr) calc(22 * var(--mm)) calc(17 * var(--mm)) calc(19 * var(--mm));min-height:calc(9.5 * var(--mm))}
.mo .ck{text-align:center}
.vz > div{grid-template-columns:calc(27 * var(--mm)) minmax(0,1fr) calc(15 * var(--mm)) calc(10 * var(--mm));min-height:calc(5.6 * var(--mm))}
.vz .r2{text-align:right;padding-right:calc(.6 * var(--mm))}

.hb{display:grid;grid-template-columns:minmax(0,1fr) repeat(7, calc(8.4 * var(--mm)));align-items:end;margin-top:calc(1.2 * var(--mm))}
.hb > span{border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--line);height:calc(6 * var(--mm));display:flex;align-items:center;min-width:0;overflow:hidden;white-space:nowrap}
.hb > span.cc{justify-content:center}
.hb > span.h{font:700 calc(2.1 * var(--mm)) var(--sans);letter-spacing:.06em;color:var(--ink-3);justify-content:center;height:calc(4.6 * var(--mm));border-bottom-color:var(--ink-3)}
.hb > span.h.lft{justify-content:flex-start;text-transform:uppercase;letter-spacing:.1em}
.hb > span.n{font-size:calc(2.65 * var(--mm))}
.hb > span.grp{grid-column:1 / -1;font:700 calc(2.05 * var(--mm)) var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--rubric);height:calc(5.4 * var(--mm));align-items:flex-end;padding-bottom:calc(.8 * var(--mm));border-bottom:none}
.hb .hw{padding-bottom:0}
.hb.wa > span{height:calc(6.9 * var(--mm))}
.hb.wa > span.h{height:calc(4.6 * var(--mm))}
.hb.wa > span.grp{height:calc(6 * var(--mm))}
.tri{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:calc(3 * var(--mm));margin-top:calc(.4 * var(--mm))}
.tri .ln{--lh:calc(5.6 * var(--mm))}
.wl{display:grid;gap:calc(1.6 * var(--mm));margin-top:calc(1.4 * var(--mm))}
.wl label,.wl .it{display:flex;align-items:center;gap:calc(2.2 * var(--mm));font-size:calc(2.75 * var(--mm))}

/* NT grid */
.nt{display:grid;grid-template-columns:calc(23 * var(--mm)) minmax(0,1fr);row-gap:calc(1.75 * var(--mm));margin-top:calc(2.6 * var(--mm));align-items:center}
.nt .bk{font:600 calc(2.2 * var(--mm)) var(--sans);color:var(--ink-2);white-space:nowrap}
.nt .bx{display:flex;flex-wrap:wrap;gap:calc(.35 * var(--mm))}
.nb{position:relative;width:calc(3.15 * var(--mm));height:calc(3.15 * var(--mm));border:max(1px,calc(.2 * var(--mm))) solid var(--line);box-sizing:border-box;font:600 calc(1.55 * var(--mm)) var(--sans);color:var(--ink-3);display:grid;place-items:center;font-variant-numeric:tabular-nums;line-height:1}

/* catechism list */
.kt{display:grid;grid-template-columns:minmax(0,1fr) calc(15 * var(--mm)) calc(15 * var(--mm));margin-top:calc(1.6 * var(--mm));align-items:end}
.kt > span{border-bottom:max(1px,calc(.2 * var(--mm))) solid var(--line);height:calc(3.1 * var(--mm));display:flex;align-items:flex-end;padding-bottom:calc(.25 * var(--mm));font-size:calc(2.3 * var(--mm));min-width:0;white-space:nowrap;overflow:hidden}
.kt > span.cc{justify-content:center;align-items:center;padding:0}
.kt > span.hs{font:700 calc(2.05 * var(--mm)) var(--sans);letter-spacing:.09em;text-transform:uppercase;color:var(--rubric);height:calc(4.2 * var(--mm));border-bottom-color:transparent}
.kt > span.hs.w{font-weight:600;letter-spacing:.04em;text-transform:none;color:var(--ink-3)}
.kt > span.th{font:700 calc(1.85 * var(--mm)) var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);justify-content:center;text-align:center;line-height:1.1;border-bottom-color:var(--ink-3);height:calc(5 * var(--mm))}
.kt .b{width:calc(2.5 * var(--mm));height:calc(2.5 * var(--mm))}

/* dot grid */
.dots{flex:1 1 auto;margin-top:calc(2 * var(--mm));position:relative;
  background-image:radial-gradient(circle, var(--dot) 0 calc(.26 * var(--mm)), transparent calc(.32 * var(--mm)));
  background-size:calc(5 * var(--mm)) calc(5 * var(--mm));background-position:calc(-2.5 * var(--mm)) calc(-2.5 * var(--mm))}
.dots .note{position:absolute;left:calc(5 * var(--mm));right:calc(3 * var(--mm));display:flex;flex-direction:column}
.dots .note .hw{line-height:calc(5 * var(--mm));height:calc(5 * var(--mm));padding:0;white-space:nowrap}

/* timeline */
.tl{margin-top:calc(2.2 * var(--mm));width:100%;height:auto;display:block}
.tl text{font-family:var(--sans)}
.times{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:calc(2.4 * var(--mm));margin-top:calc(2.4 * var(--mm))}
.times .ln{justify-content:center}
.times .pl{display:block;text-align:center;padding:0 0 calc(.6 * var(--mm))}

/* toc */
.toc{display:grid;grid-template-columns:calc(9 * var(--mm)) minmax(0,1fr);row-gap:calc(1.25 * var(--mm));margin-top:calc(2.2 * var(--mm));font-size:calc(2.7 * var(--mm))}
.toc b{font:600 calc(2.4 * var(--mm)) var(--sans);color:var(--rubric);font-variant-numeric:tabular-nums;padding-top:calc(.25 * var(--mm))}
.toc span em{color:var(--ink-2)}

/* endpapers + title */
.legend{display:grid;grid-template-columns:calc(13 * var(--mm)) minmax(0,1fr);row-gap:calc(1.9 * var(--mm));column-gap:calc(2 * var(--mm));margin-top:calc(1.6 * var(--mm));font-size:calc(2.65 * var(--mm));align-items:baseline}
.legend .k{font:700 calc(3.2 * var(--mm)) var(--sans);color:var(--ink);text-align:center;line-height:1}
.legend .k.serif{font-family:var(--serif);color:var(--rubric)}
.legend .bar{display:block;margin:0 auto;width:calc(.7 * var(--mm));height:calc(4 * var(--mm));background:var(--rubric)}
.sw6{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:calc(1.3 * var(--mm)) calc(3 * var(--mm));margin-top:calc(1.6 * var(--mm));font-size:calc(2.5 * var(--mm))}
.sw6 span{display:flex;gap:calc(1.8 * var(--mm));align-items:center;line-height:1.2}
.sw6 i{flex:none;width:calc(6 * var(--mm));height:calc(2.2 * var(--mm));border-radius:calc(1.1 * var(--mm))}
.title-pg{align-items:center;text-align:center}
.title-pg .big{font:600 calc(12 * var(--mm)) var(--serif);letter-spacing:.22em;padding-left:.22em;color:var(--rubric);margin:calc(30 * var(--mm)) 0 0;line-height:1}
.title-pg .rule{width:calc(22 * var(--mm));height:calc(.35 * var(--mm));background:var(--rubric);margin:calc(4 * var(--mm)) auto}
.title-pg .subt{font-size:calc(3.4 * var(--mm));margin:0}
.title-pg .vs{margin:calc(12 * var(--mm)) auto 0;font-style:italic;max-width:calc(92 * var(--mm))}
.own{margin-top:auto;width:100%;text-align:left;display:grid;gap:calc(1 * var(--mm))}
.bogen p{margin:calc(1 * var(--mm)) 0 0;font-size:calc(2.75 * var(--mm));line-height:1.48}
.bogen h3{margin:calc(4 * var(--mm)) 0 0;font:700 calc(2.25 * var(--mm)) var(--sans);letter-spacing:.11em;text-transform:uppercase;color:var(--rubric)}
.src{margin-top:auto;font:italic 400 calc(2.25 * var(--mm)) var(--serif);color:var(--ink-2);text-align:center;line-height:1.45}

/* page plan */
.plan{max-width:900px;margin:0 auto}
.bar{display:flex;height:34px;border-radius:4px;overflow:hidden;box-shadow:0 1px 0 var(--desk-rule)}
.bar span{display:flex;align-items:center;justify-content:center;color:var(--paper);font:600 .8rem var(--sans);min-width:0;overflow:hidden;white-space:nowrap}
.parts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-top:18px}
.parts h3{margin:0 0 6px;font:600 .78rem var(--sans);letter-spacing:.1em;text-transform:uppercase;display:flex;align-items:center;gap:8px}
.parts h3 i{width:10px;height:10px;border-radius:2px;flex:none}
.parts h3 b{margin-left:auto;font-variant-numeric:tabular-nums;color:var(--desk-muted)}
.parts ul{list-style:none;margin:0;padding:0;display:grid;gap:6px;font-family:var(--serif);font-size:.9rem;line-height:1.35}
.parts li{display:grid;grid-template-columns:4.8em minmax(0,1fr);gap:4px}
.parts li span:first-child{font:600 .8rem var(--sans);color:var(--desk-muted);font-variant-numeric:tabular-nums;padding-top:2px}
.plan .sum{margin:18px 0 0;font-family:var(--serif);color:var(--desk-muted);text-align:center}

/* phones: one page per row */
@media (max-width: 760px){
  .top{grid-template-columns:minmax(0,1fr)}
  .hint{text-align:left;justify-self:start}
  .toggle{justify-self:start}
  .cover-row{grid-template-columns:minmax(0,1fr);gap:40px}
  .book{width:min(320px,100%);margin:0 auto 28px}
  .spread{grid-template-columns:minmax(0,1fr);row-gap:14px}
  .parts{grid-template-columns:repeat(2,minmax(0,1fr))}
  .page.l,.page.r{border-radius:3px}
}
@media (prefers-reduced-motion: reduce){.toggle .sw,.toggle .sw::after{transition:none}}

/* print: A5 pages only, no desk */
@page{size:148mm 210mm;margin:0}
@media print{
  html,body{background:#fff}
  :root{padding:0}
  .wrap{max-width:none;padding:0}
  .top,.cap,.cover-block,.nav,#seiten,.gap{display:none}
  .block{margin:0}
  .spread{display:block;filter:none}
  .page{width:148mm;height:210mm;aspect-ratio:auto;break-after:page;border-radius:0;background-image:none}
}
"""

# ------------------------------------------------------------------ helpers

def hw(t):
    return f'<span class="hw">{t}</span>' if t else ""

def ln(content="", cls=""):
    return f'<div class="ln {cls}">{content}</div>'

def lines(n, hws=(), cls=""):
    out = []
    for i in range(n):
        t = hws[i] if i < len(hws) else ""
        out.append(ln(hw(t), cls))
    return '<div class="lines">' + "".join(out) + "</div>"

def row(label, body, kf=False):
    return f'<div class="row{" kf" if kf else ""}"><div class="lab">{label}</div>{body}</div>'

def sec(no, title, m=""):
    n = f'<span class="no">{no}</span>' if no else ""
    mm = f'<span class="m">{m}</span>' if m else ""
    return f'<div class="sec">{n}<span class="t">{title}</span>{mm}</div>'

def chips(items, on=(), cls="chips"):
    return f'<span class="{cls}">' + "".join(
        f'<span class="chip{" hc" if it in on else ""}">{it}</span>' for it in items) + "</span>"

def days(on=None):
    return chips(["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"], on=(on,) if on else (), cls="chips days")

def c(on=False):
    return f'<span class="c{" on" if on else ""}"></span>'

def b(on=False):
    return f'<span class="b{" on" if on else ""}"></span>'

def page(side, folio, label, inner, cls="", runner=""):
    f = f'<span class="folio">{folio}</span>' if folio else ""
    r = f'<span class="runner">{runner}</span>' if runner else ""
    return (f'<section class="page {side} {cls}" aria-label="{label}">'
            f'<div class="in">{inner}{r}{f}</div></section>')

def spread(*pages, solo=False):
    return f'<div class="spread{" solo" if solo else ""}">' + "".join(pages) + "</div>"

def block(anchor, kicker, title, text, body):
    return (f'<section class="block" id="{anchor}"><div class="cap"><span class="pg">{kicker}</span>'
            f'<h2>{title}</h2><p>{text}</p></div>{body}</section>')

# ------------------------------------------------------------------ pages

def p_endpaper_front():
    inner = f"""
<header class="ph"><h2 class="pt">Zeichen in diesem Buch</h2></header>
{sec("", "Beim Lesen, am Rand der Bibel")}
<div class="legend">
  <span class="k serif">?</span><span>Unklar – hier nachfassen.</span>
  <span class="k serif">!</span><span>Fordert mich heraus.</span>
  <span class="k serif">→</span><span>Umsetzungsidee. Dieses Zeichen liefert das erste der drei Dinge.</span>
</div>
{sec("", "Farbcode für die Stifte")}
<div class="sw6">
  <span><i style="background:#2F5DA8"></i>Blau · Gottes Wesen und Handeln</span>
  <span><i style="background:#B23A3A"></i>Rot · Gottes Aufforderungen und Gebote</span>
  <span><i style="background:#6E4A9E"></i>Violett · Gottesfürchtige Reaktionen</span>
  <span><i style="background:#7A5230"></i>Braun · Sündige, gottlose Handlungen</span>
  <span><i style="background:#D9822B"></i>Orange · Wichtige Begriffe</span>
  <span><i style="background:#3F7F4F"></i>Grün · Innerbiblische Zitate</span>
</div>
{sec("", "Abends, bei den drei Dingen")}
<div class="legend">
  <span class="k">+</span><span>geschehen</span>
  <span class="k">~</span><span>angefangen</span>
  <span class="k">–</span><span>nicht geschehen. Ein Zeichen, kein Kommentar.</span>
</div>
{sec("", "Gewohnheiten")}
<div class="legend">
  <span class="k"><span class="c"></span></span><span>offen</span>
  <span class="k"><span class="c" style="background:var(--ink)"></span></span><span>gehalten. Gezählt wird nichts.</span>
</div>
{sec("", "Im ganzen Buch")}
<div class="legend">
  <span class="k"><span class="bar"></span></span><span>Roter Randstrich: die Kurzform. Wer nur diese Felder füllt, hat die Ordnung gehalten.</span>
  <span class="k"><span style="display:block;margin:0 auto;width:calc(9 * var(--mm));height:calc(4 * var(--mm));background:var(--paper);border-radius:calc(.8 * var(--mm))"></span></span><span>Bei Beichte und Prüfung hat dieses Buch keine Zeilen. Was dort geschieht, wird gebetet, nicht notiert.</span>
</div>
"""
    return page("l ep", "", "Vorderer Innendeckel: Zeichen", inner)


def p_title():
    inner = f"""
<p class="big">HENOCH</p>
<div class="rule"></div>
<p class="subt">Ein Notizbuch für Morgen und Abend</p>
<div class="vs">„Und dieweil er ein göttliches Leben führte, nahm ihn Gott hinweg, und er ward nicht mehr gesehen.“<cite>1. Mose 5,24</cite></div>
<div class="own">
  {row("Dieses Buch gehört", lines(1, ["Andreas"]))}
  {row("Band", '<div class="lines"><div class="ln"><span class="half">' + hw("1") + '</span><span class="half"><span class="pl">begonnen am</span>' + hw("5. 10. 2026") + '</span><span class="half"><span class="pl">beendet am</span></span></div></div>')}
  {row("Falls gefunden, bitte zurück an", lines(2))}
</div>
"""
    return page("r title-pg", "1", "Seite 1: Titel", inner)


def p_aufbau():
    toc = [
        ("1", "Titel · 2 Aufbau · 3 Gebetsübersicht"),
        ("4", "Leseplan: Altes Testament (S. 4–5), Neues Testament (S. 6)"),
        ("7", "Der Kleine Katechismus"),
        ("8", "Die Ordnung am Morgen, mit allen Gebetstexten"),
        ("12", "Die Ordnung am Abend: Vesper und Nachtgebet"),
        ("16", "Die Tage – dreizehn Wochen zu je sechzehn Seiten: <em>eine Doppelseite für die Woche, dann jeder Tag auf einer Doppelseite, links der Morgen, rechts der Abend</em>"),
        ("224", "Arena: Brüder, Winter Arc, Treffen"),
        ("275", "Notizen"), ("283", "Verse, die ich mitnehme"), ("288", "Monatlich: Privatbeichte, Abendmahl"),
    ]
    toc_html = "".join(f"<b>{n}</b><span>{t}</span>" for n, t in toc)
    # timeline 04:00-21:00 on a 123 x 24 viewBox (mm)
    x0, x1 = 3.0, 120.0
    def X(h):
        return x0 + (h - 4) * (x1 - x0) / 17
    ticks = "".join(
        f'<line x1="{X(h):.2f}" y1="13" x2="{X(h):.2f}" y2="{15.6 if h % 2 == 0 else 14.6}" stroke="#8E8A82" stroke-width=".2"/>'
        + (f'<text x="{X(h):.2f}" y="19" font-size="2.1" text-anchor="middle" fill="#8E8A82">{h:02d}</text>' if h % 2 == 0 else "")
        for h in range(4, 22))
    blocks = [(4.25, 5.0, "Stille Zeit"), (18.5, 18.67, "Vesper"), (20.75, 20.92, "Nachtgebet")]
    bl = ""
    for a, e, t in blocks:
        bl += (f'<rect x="{X(a):.2f}" y="9.6" width="{max(X(e) - X(a), 1.1):.2f}" height="3.4" fill="#8C2F2F" fill-opacity=".14" stroke="#8C2F2F" stroke-width=".25"/>'
               f'<text x="{X(a) + (X(e) - X(a)) / 2:.2f}" y="7.6" font-size="2.05" text-anchor="middle" fill="#8C2F2F" font-weight="600">{t}</text>')
    svg = (f'<svg class="tl" viewBox="0 0 123 21" role="img" aria-label="Tagesbogen von 4 bis 21 Uhr: Stille Zeit am Morgen, Vesper und Nachtgebet am Abend">'
           f'<line x1="{x0}" y1="13" x2="{x1}" y2="13" stroke="#565D6B" stroke-width=".3"/>{ticks}{bl}'
           f'<line x1="{X(21):.2f}" y1="8.6" x2="{X(21):.2f}" y2="13" stroke="#1D2330" stroke-width=".35"/></svg>')
    times = [("Am Bett", "04:00"), ("Stille Zeit", "04:15"), ("Vesper", "18:30"), ("Nachtgebet", "20:45"), ("Licht aus", "21:00")]
    times_html = "".join(f'<div><span class="pl">{t}</span><div class="ln">{hw(v)}</div></div>' for t, v in times)
    inner = f"""
<header class="ph"><h2 class="pt">So ist dieses Buch gebaut</h2></header>
<div class="toc">{toc_html}</div>
<p class="txt">Die Seiten sind nicht datiert. Wer drei Tage aussetzt, schlägt die nächste freie Seite auf. Nicht nachholen, nicht rechnen – wieder anfangen.</p>
<p class="txt">Alle Felder sind freiwillig. Der rote Randstrich zeigt die Kurzform. Ein Band reicht für dreizehn Wochen.</p>
{sec("", "Meine Zeiten")}
{svg}
<div class="times">{times_html}</div>
<p class="rb">Wer um 04:00 aufsteht, muß für sieben Stunden Schlaf um 21:00 liegen. Der Abend ist Teil der Morgenordnung.</p>
"""
    return page("l", "2", "Seite 2: Aufbau und Zeiten", inner)


def p_gebetsuebersicht():
    wk = [("Montag", "verfolgte Kirche"), ("Dienstag", "Missionare"), ("Mittwoch", "Obrigkeit und Frieden"),
          ("Donnerstag", "Nachbarn"), ("Freitag", "Kranke"), ("Samstag", "Patenkinder"), ("Sonntag", "Bekannte ohne Glauben")]
    wk_html = "".join(row(d, lines(1, [t])) for d, t in wk)
    inner = f"""
<header class="ph"><h2 class="pt">Gebetsübersicht</h2></header>
<p class="pr">Hanniel führt für das tägliche Gebet eine solche Übersicht und sieht von Zeit zu Zeit hinein, um nicht zu vergessen, was ihm sonst entgleitet.</p>
{sec("", "Täglich")}
{row("Haus · Frau, Kinder", lines(3, ["meine Frau – Kraft für die neue Stelle", "J. – Schule, Freunde · M. – Schlaf", ""]))}
{row("Gemeinde", lines(2, ["Älteste, Jugendleiter, die Predigt am Sonntag"]))}
{row("Arbeit · Kollegen", lines(2, ["Team im Umbruch – Ruhe und Klarheit"]))}
{sec("", "Wöchentlich")}
<p class="pr">Ein Anliegen je Wochentag, damit nichts liegenbleibt.</p>
{wk_html}
<p class="pr">Zum Beispiel: verfolgte Kirche, Missionare, Obrigkeit, Nachbarn, Ungläubige im Bekanntenkreis, Kranke, Patenkinder.</p>
"""
    return page("r", "3", "Seite 3: Gebetsübersicht", inner)


NT_BOOKS = [("Matthäus", 28), ("Markus", 16), ("Lukas", 24), ("Johannes", 21), ("Apostelgeschichte", 28), ("Römer", 16),
            ("1. Korinther", 16), ("2. Korinther", 13), ("Galater", 6), ("Epheser", 6), ("Philipper", 4), ("Kolosser", 4),
            ("1. Thessalonicher", 5), ("2. Thessalonicher", 3), ("1. Timotheus", 6), ("2. Timotheus", 4), ("Titus", 3),
            ("Philemon", 1), ("1. Petrus", 5), ("2. Petrus", 3), ("1. Johannes", 5), ("2. Johannes", 1), ("3. Johannes", 1),
            ("Hebräer", 13), ("Jakobus", 5), ("Judas", 1), ("Offenbarung", 22)]
assert sum(n for _, n in NT_BOOKS) == 260


def p_nt():
    rows = ""
    for name, n in NT_BOOKS:
        bx = "".join(f'<span class="nb{" on" if (name == "Matthäus" and i <= 4) else ""}">{i}</span>' for i in range(1, n + 1))
        rows += f'<span class="bk">{name}</span><span class="bx">{bx}</span>'
    inner = f"""
<header class="ph"><h2 class="pt"><small>Leseplan</small>Neues Testament</h2>
<div class="pm"><div class="dline"><span class="pl">begonnen am</span>{hw("5. 10. 2026")}</div></div></header>
<p class="pr">260 Kapitel, eines je Lesung, in Luthers Reihenfolge. Abhaken, was gelesen ist. Der Plan läuft nach Fortschritt, nicht nach Datum: Wer aussetzt, liest beim nächsten freien Kästchen weiter.</p>
<div class="nt">{rows}</div>
<p class="pr" style="margin-top:auto">Altes Testament auf S. 4–5: 929 Kapitel im Muster 2-1-1-1, keine Portion über eine Buchgrenze.</p>
"""
    return page("l", "6", "Seite 6: Leseplan Neues Testament", inner)


KATECHISMUS = [
    ("Woche 1", "Die Zehn Gebote", ["Das erste Gebot", "Das zweite Gebot", "Das dritte Gebot", "Das vierte Gebot", "Das fünfte Gebot",
                                    "Das sechste Gebot", "Das siebente Gebot", "Das achte Gebot", "Das neunte Gebot", "Das zehnte Gebot",
                                    "Der Beschluß der Gebote"]),
    ("Woche 2", "Der Glaube", ["Der erste Artikel: Von der Schöpfung", "Der zweite Artikel: Von der Erlösung", "Der dritte Artikel: Von der Heiligung"]),
    ("Woche 3", "Das Vaterunser", ["Die Anrede", "Die erste Bitte", "Die zweite Bitte", "Die dritte Bitte", "Die vierte Bitte",
                                  "Die fünfte Bitte", "Die sechste Bitte", "Die siebente Bitte", "Der Beschluß"]),
    ("Woche 4", "Die heilige Taufe", ["Zum Ersten", "Zum Andern", "Zum Dritten", "Zum Vierten"]),
    ("Woche 5", "Die Beichte", ["Was ist die Beichte?", "Welche Sünden soll man beichten?", "Welche sind die?", "Die Absolution"]),
    ("Woche 6", "Das Sakrament des Altars", ["Was ist das Sakrament des Altars?", "Was nützt solch Essen und Trinken?",
                                             "Wie kann leiblich Essen solch große Dinge tun?", "Wer empfängt es würdig?"]),
]
assert sum(len(p) for _, _, p in KATECHISMUS) == 35


def p_katechismus():
    body = '<span class="th" style="justify-content:flex-start">Stück</span><span class="th">aus&shy;wendig</span><span class="th">mit den Kindern</span>'
    for wk, hs, pieces in KATECHISMUS:
        body += f'<span class="hs">{hs}</span><span class="hs w" style="grid-column:span 2;justify-content:flex-end">{wk}</span>'
        for i, p in enumerate(pieces):
            me = hs == "Die Zehn Gebote" and i < 3
            kids = hs == "Die Zehn Gebote" and i < 2
            body += f'<span>{p}</span><span class="cc">{b(me)}</span><span class="cc">{b(kids)}</span>'
    inner = f"""
<header class="ph"><h2 class="pt"><small>Luther, 1529</small>Der Kleine Katechismus</h2></header>
<p class="pr">Sechs Wochen, sechs Hauptstücke, dann von vorn. Pro Tag ein Stück, nach der Wochenseite.</p>
<div class="kt">{body}</div>
"""
    return page("r", "7", "Seite 7: Katechismus", inner)


WEEK = [("Mo", "63 · 141", "Ehemann", "1. Gebot", "verfolgte Kirche"),
        ("Di", "5 · 121", "Vater", "2. Gebot", "Missionare"),
        ("Mi", "36 · 130", "Mitarbeiter und Kollege", "3. Gebot", "Obrigkeit"),
        ("Do", "57 · 23", "Prediger und Bruder", "4. Gebot", "Nachbarn"),
        ("Fr", "51 · 51", "Nächster", "5. und 6. Gebot", "Kranke"),
        ("Sa", "92 · 84", "Vater", "7. und 8. Gebot", "Patenkinder"),
        ("So", "118 · 103", "Ehemann", "9., 10., Beschluß", "Bekannte ohne Glauben")]


def p_woche_l():
    t = ('<div class="th"><span>Tag</span><span>Psalm<br>früh · abends</span><span>Prüfung im Stand</span>'
         '<span>Katechismus</span><span>Anliegen</span></div>')
    for d, ps, st, k, a in WEEK:
        t += f'<div><span class="d">{d}</span><span class="ps">{ps}</span><span class="st">{st}</span><span>{hw(k)}</span><span>{hw(a)}</span></div>'
    hs = chips(["Gebote", "Glaube", "Vaterunser", "Taufe", "Beichte", "Abendmahl"], on=("Gebote",))
    inner = f"""
<header class="ph"><h2 class="pt">Woche</h2>
<div class="pm"><div class="dline"><span class="pl">vom</span>{hw("5. 10.")}<span class="pl" style="margin-left:auto">bis</span>{hw("11. 10.")}</div></div></header>
{row("Hauptstück", '<div class="lines"><div class="ln">' + hs + '</div></div>')}
<div class="tbl wk">{t}</div>
{sec("", "Vers zum Auswendiglernen")}
{row("Stelle", lines(1, ["Kolosser 3,23"]))}
{row("Wo ich stehe", lines(1, ["sitzt bis „von Herzen“"]))}
{sec("", "Notizen zur Woche")}
{lines(14, ["Sonntag Jugendgottesdienst – ich predige", "Mi abends Ältestenkreis"])}
"""
    return page("l", "16", "Seite 16: Woche, Übersicht", inner, runner="Woche 1")


def p_woche_r():
    D = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    daily = [("Stille Zeit", [1, 1, 0, 1]), ("Vesper mit der Familie", [1, 0, 1, 1]), ("Nachtgebet", [1, 1, 1, 1]),
             ("Tischgebet mit der Familie", [1, 1, 1, 1]), ("Die Kinder segnen", [1, 0, 1, 1]),
             ("Mit meiner Frau beten", [0, 1, 0, 1]), (hw("Vers wiederholen"), [1, 0, 1, 0]), ("", [])]
    g = '<span class="h lft">Täglich</span>' + "".join(f'<span class="h">{d}</span>' for d in D)
    for name, marks in daily:
        g += f'<span class="n">{name}</span>' + "".join(
            f'<span class="cc">{c(i < len(marks) and marks[i] == 1)}</span>' for i in range(7))
    weekly = [("Gottesdienst – den Feiertag heiligen", False), ("Katechismus mit den Kindern", True),
              ("Gemeinschaft mit Brüdern", False), ("Zeit allein mit meiner Frau", False)]
    w = "".join(f'<div class="it">{b(on)}<span>{n}</span></div>' for n, on in weekly)
    inner = f"""
<header class="ph"><h2 class="pt">Gewohnheiten</h2>
<div class="pm"><span class="pl" style="padding:0">○ offen · ● gehalten</span></div></header>
<div class="hb">{g}</div>
{sec("", "Diese Woche")}
<div class="wl">{w}<div class="it">{b()}<span class="grow" style="border-bottom:1px solid var(--line);height:calc(4 * var(--mm))"></span></div></div>
<p class="pr">Stille Zeit, Vesper und Nachtgebet ergeben sich aus den Tagesseiten. Gezählt wird nichts; ein offener Kreis bleibt einfach offen.</p>
{sec("", "Für die kommende Woche")}
{lines(12, ["Samstag: Abend mit meiner Frau planen"])}
"""
    return page("r", "17", "Seite 17: Woche, Gewohnheiten", inner, runner="Woche 1")


def p_morgen():
    lesung = ('<div class="lines"><div class="ln"><span class="half"><span class="pl">AT</span>' + hw("1. Mose 5") +
              '</span><span class="half"><span class="pl">NT</span>' + hw("Matthäus 4") + '</span></div></div>')
    vers = ('<div class="lines"><div class="ln"><span class="pl">Stelle</span>' + hw("1. Mose 5,24") +
            '</div>' + ln(hw("„Und dieweil er ein göttliches Leben führte,")) + ln(hw("nahm ihn Gott hinweg …“")) + "</div>")
    frage = ('<div class="lines"><div class="ln">' + chips([str(i) for i in range(1, 8)], on=("7",)) +
             hw("Um ein Leben mit Gott, mitten im Alltag.") + "</div></div>")
    heil = ('<div class="lines"><div class="ln">' + chips(["Schöpfung", "Fall", "Erlösung", "Vollendung"], on=("Vollendung",)) +
            hw("Der Tod hat nicht das letzte Wort.") + "</div></div>")
    stoff = '<div class="lines"><div class="ln">' + chips(["Vers aus der Lesung", "Katechismusstück"], on=("Vers aus der Lesung",)) + "</div></div>"
    inner = f"""
<header class="ph"><h2 class="pt">Morgen</h2>
<div class="pm"><div class="dline"><span class="pl">Datum</span>{hw("Donnerstag, 8. Oktober")}</div>{days("Do")}</div></header>
{row("Am Bett", '<div class="lines"><div class="ln">' + b(True) + '<span class="pi">Kreuzzeichen · Vaterunser · Taufgedächtnis · Morgensegen</span></div></div>')}
{sec("1", "Eröffnung", "3 Min. · S. 8")}
{row("Psalm", lines(1, ["57 – „Wache auf, meine Ehre“"]), kf=True)}
{sec("2", "Das Wort", "20 Min. · S. 9")}
<p class="rb">Öffne mir die Augen, daß ich sehe die Wunder an deinem Gesetz.<cite>Ps 119,18</cite></p>
{row("Lesung", lesung, kf=True)}
{row("Hauptaussage", lines(1, ["Achtmal „und starb“ – bei Henoch steht etwas anderes."]))}
{row("Vers, den ich mitnehme", vers, kf=True)}
{row("Über Gott", lines(1, ["Er kennt jeden Namen in der langen Reihe."]), kf=True)}
{row("Über den Menschen", lines(1, ["Wir sterben alle. Es zählt, mit wem wir gehen."]), kf=True)}
{row("Frage", frage)}
{row("Heilsgeschichte", heil)}
{row('<span class="g">?</span>Unklar', lines(1, ["Was hieß „göttliches Leben“ bei ihm konkret?"]))}
{row('<span class="g">!</span>Fordert', lines(1, ["V. 22: mit Söhnen und Töchtern, also im Alltag."]))}
{row('<span class="g">→</span>Umsetzen', lines(1, ["Mittags gehen und beten, ohne Handy."]))}
{sec("3", "Das Gebet", "12 Min. · S. 10")}
{row("Stoff", stoff)}
{row("Unterricht", lines(1, ["Du sagst mir: Mit dir gehen geht auch heute."]))}
{row("Dank", lines(1, ["daß du im Alltag mitgehst, nicht erst am Sonntag."]))}
{row("Beichte", '<div class="lines"><div class="ln" style="border-bottom-color:transparent"><span class="pi">Wird gebetet, nicht notiert.</span></div></div>')}
{row("Bitte", lines(1, ["Laß mich heute bei dir bleiben, auch im Büro."]))}
<p class="rb">Freies Gebet. Eine Minute Stille: Sei stille dem HERRN und warte auf ihn.<cite>Ps 37,7</cite></p>
{sec("4", "Die Antwort", "5 Min. · S. 10")}
{row("Menschen heute", lines(1, ["T. (Kollege), Familie K. von nebenan, die Jugendleiter"]))}
{sec("5", "Die drei Dinge", "3 Min. · S. 11")}
{row("Wort", lines(1, ["Mittagspause: gehen und beten, ohne Handy"]), kf=True)}
{row("Haus", lines(1, ["Beim Abendessen den Kindern von Henoch erzählen"]), kf=True)}
{row("Werk", lines(1, ["Angebot für Kunde M. bis 12 Uhr fertig"]), kf=True)}
<p class="end">6 · Der Segen. Und dann mit Freuden an dein Werk gegangen.</p>
"""
    return page("l dense", "24", "Seite 24: Morgen", inner, runner="Woche 1 · Tag 4")


def p_abend():
    def rs(label, mark, carry=None):
        body = ('<div class="lines"><div class="ln">' +
                "".join(f'<span class="mk{" hc" if m == mark else ""}">{m}</span>' for m in ["+", "~", "–"]) +
                '<span class="grow"></span>' + chips(["Morgen wieder", "Fallenlassen"], on=(carry,) if carry else ()) +
                "</div></div>")
        return row(label, body, kf=True).replace('class="row kf"', 'class="row kf tall"', 1)
    dank = '<div class="lines">' + "".join(
        ln(f'<span class="pl">{i}</span>' + hw(t)) for i, t in
        [(1, "die halbe Stunde im Wald, mittags"), (2, "J. hat beim Essen nachgefragt"), (3, "einen ruhigen Abend")]) + "</div>"
    staende = chips(["Ehemann", "Vater", "Mitarbeiter", "Prediger und Bruder", "Nächster"], on=("Prediger und Bruder",))
    inner = f"""
<header class="ph"><h2 class="pt">Abend</h2>
<div class="pm"><div class="dline"><span class="pl">Datum</span>{hw("Donnerstag, 8. Oktober")}</div></div></header>
{sec("1", "Vesper", "10 Min. · S. 12")}
{row("Psalm", lines(1, ["23"]))}
{row("Lesung", lines(1, ["Lukas 10,38–42"]))}
{row("Fürbitte", lines(1, ["Oma im Krankenhaus, Familie K."]))}
<p class="pr">Versikel · Hymnus · Psalm · Lesung · Magnificat · Fürbitte · Vaterunser · Kollekte · Segen</p>
{sec("2", "Nachtgebet", "10 Min. · S. 14")}
<p class="pr">Kreuzzeichen · Glaubensbekenntnis · Vaterunser</p>
{row("Dank<br><span style='font-weight:400;font-style:italic;font-family:var(--serif)'>für …</span>", dank)}
<div class="sub">Rückschau<em>Rechenschaft, nicht Beichte.</em></div>
{rs("Wort", "+")}
{rs("Haus", "+")}
{rs("Werk", "~", "Morgen wieder")}
<p class="pr">+ geschehen · ~ angefangen · – nicht geschehen. Ein Zeichen, kein Kommentar.</p>
<div class="sub">Prüfung im Stand<em>Wo bin ich schuldig geblieben?</em></div>
<div class="row"><div class="lab">Stand heute</div><div class="lines"><div class="ln">{staende}</div></div></div>
<div class="silent">Wird gebetet, nicht notiert.</div>
<div class="sub">Bekenntnis und Zuspruch<em>laut, nicht gedacht</em></div>
<div class="vs">So wir aber unsere Sünde bekennen, so ist er treu und gerecht, daß er uns die Sünde vergibt und reinigt uns von aller Untugend.<cite>1. Johannes 1,9</cite></div>
<div class="sub">Taufgedächtnis</div>
<div class="vs" style="margin-top:calc(.6 * var(--mm))">Ich bin getauft auf den Namen des Vaters und des Sohnes und des Heiligen Geistes.</div>
{row("Fürbitte", lines(1, ["T., Familie K., die Jugendleiter"]))}
{row("Weitergegeben an", lines(1, ["den Kindern beim Abendessen: Henoch"]))}
<p class="end">Nunc dimittis · Abendsegen. Und dann, wie Luther schreibt: flugs und fröhlich geschlafen.</p>
"""
    return page("r", "25", "Seite 25: Abend", inner, runner="Woche 1 · Tag 4")


def p_notizen():
    notes = ["8. 10. · 1. Mose 5 – achtmal „und starb“. Dann Henoch.",
             "Für die Jugend am Sonntag: Wer mit Gott geht, kommt an.",
             "",
             "4. Gebot: „in Ehren halten, ihnen dienen, gehorchen,",
             "sie lieb und wert haben.“ Als Vater: mich ehrbar machen.",
             "",
             "Hebräer 11,5 nachlesen – Henoch im Glauben."]
    note_html = "".join(f'<span class="hw">{t or "&nbsp;"}</span>' for t in notes)
    inner = f"""
<header class="ph"><h2 class="pt">Notizen</h2></header>
<p class="pr">Was im Katechismus oder in der Lesung aufgeht – ein Satz, nicht ein Aufsatz. Über Monate wird daraus das Material, aus dem Predigt und Beichte leben.</p>
<div class="dots"><div class="note" style="top:calc(2.3 * var(--mm))">{note_html}</div></div>
"""
    return page("l", "276", "Seite 276: Notizen", inner)


def p_verse():
    ex = [("1. Mose 1,31", "alles sehr gut", "5. 10.", "18"), ("1. Mose 3,9", "„Wo bist du?“", "6. 10.", "20"),
          ("Matthäus 3,17", "der liebe Sohn", "7. 10.", "22"), ("1. Mose 5,24", "ein göttliches Leben", "8. 10.", "24")]
    t = '<div class="th"><span>Stelle</span><span>Stichwort</span><span>Datum</span><span class="r2">S.</span></div>'
    for i in range(24):
        if i < len(ex):
            s, k, d, p = ex[i]
            t += f'<div><span>{hw(s)}</span><span>{hw(k)}</span><span>{hw(d)}</span><span class="r2">{hw(p)}</span></div>'
        else:
            t += "<div><span></span><span></span><span></span><span></span></div>"
    inner = f"""
<header class="ph"><h2 class="pt">Verse, die ich mitnehme</h2></header>
<p class="pr">Aus dem Morgen übertragen. Die Seitenzahl führt zurück zum Tag.</p>
<div class="tbl vz">{t}</div>
"""
    return page("r", "283", "Seite 283: Verse, die ich mitnehme", inner)


def p_monatlich():
    t = ('<div class="th"><span>Monat</span><span>Privatbeichte · am, bei</span><span>Abendmahl</span>'
         '<span class="ck">Opfer und Gaben</span><span class="ck">Barm&shy;herzig&shy;keit</span></div>')
    rows = [("Oktober", "24. 10. · Bruder H.", "18. 10.", True, False), ("November", "", "", False, False),
            ("Dezember", "", "", False, False), ("Januar", "", "", False, False)]
    for m, bk, am, op, wb in rows:
        t += (f'<div><span>{hw(m)}</span><span>{hw(bk)}</span><span>{hw(am)}</span>'
              f'<span class="ck">{b(op)}</span><span class="ck">{b(wb)}</span></div>')
    inner = f"""
<header class="ph"><h2 class="pt">Monatlich</h2></header>
<p class="pr">Was seinen eigenen Termin hat. Ein Band umfasst drei bis vier Monate.</p>
<div class="tbl mo">{t}</div>
{sec("", "Privatbeichte")}
<p class="txt">Monatlich, terminiert. Nicht nach Bedarfslage des Gewissens, sonst kommt sie nie. Zusätzlich, wenn eine bestimmte Sache dich drückt.</p>
<p class="txt"><b>Beichtvater:</b> Ein Ältester deines Vertrauens, ein befreundeter Prediger, oder ein lutherischer Pfarrer vor Ort, der Beichte hält.</p>
<p class="txt"><b>Vorbereitung:</b> Nicht alles aufzählen; Luther sagt ausdrücklich, das könne niemand. Nur, was dich wirklich drückt.</p>
<div class="silent sm">Hier steht der Termin. Was gebeichtet wird, steht nirgends.</div>
{sec("", "Zuspruch")}
<div class="vs">Wie du glaubst, so geschehe dir. Und auf Befehl unseres Herrn Jesu Christi vergebe ich dir deine Sünden im Namen des Vaters und des Sohnes und des Heiligen Geistes. Amen. Gehe hin in Frieden.</div>
{sec("", "Danach")}
<p class="txt">Nicht nachprüfen, ob es gewirkt hat. Das Wort steht, unabhängig von deinem Gefühl. Wenn Zweifel kommen, ist die Antwort nicht neue Prüfung, sondern das Taufgedächtnis.</p>
"""
    return page("l", "288", "Seite 288: Monatlich", inner)


def p_endpaper_back():
    inner = """
<header class="ph"><h2 class="pt">Der Bogen</h2></header>
<div class="bogen">
<h3>Am Morgen</h3>
<p>Die Eröffnung stellt dich in das Lob der Kirche.<br>Das Wort redet, bevor du redest.<br>Das Gebet macht aus dem Gehörten dein eigenes Wort.<br>Die Antwort trägt es in das Gebet der Kirche.<br>Die Ausrichtung bringt es an den Tag.<br>Der Segen entläßt dich.</p>
<h3>Am Abend</h3>
<p>Die Vesper stellt dich wieder in das Lob.<br>Die Rückschau legt den Vorsatz ab.<br>Die Prüfung legt die Schuld ab.<br>Der Zuspruch hebt sie auf.<br>Das Taufgedächtnis sagt, worauf du morgen wieder aufstehst.</p>
<h3>Und einmal im Monat</h3>
<p>holt die Beichte dich aus dem Kreis heraus, in dem du sonst mit dir selbst verhandelst.</p>
</div>
<p class="src">Bibeltexte nach Luther 1912. Gebetstexte aus dem Kleinen Katechismus und der Deutschen Messe. Leseteil nach Hanniel Strebel, „Überblick: Hanniel zum Lesen der Bibel“, hanniel.ch, 31. August 2026.</p>
"""
    return page("r ep", "", "Hinterer Innendeckel: Der Bogen", inner)


def p_wa_l():
    D = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    groups = [("Morgen", [("04:00 auf, kein Handy", "all", [1, 1, 1, 1]),
                          ("Morgenzeit im Wort und Gebet", "all", [1, 1, 0, 1]),
                          ("Tagebuch und drei Dankpunkte", "all", [1, 1, 0, 1]),
                          ("Trainiert", "rest", [1, 1, 1, 0])]),
              ("Arbeit", [("Fokusblock 08–12", "dash", [1, 0, 1, 1]),
                          ("Block 13–17", "dash", [1, 1, 1, 1])]),
              ("Haus", [("Zu Hause gekocht", "all", [1, 1, 0, 1]),
                        ("Abendessen ohne Handy", "all", [1, 0, 1, 1]),
                        ("Eine Geste für meine Frau", "all", [1, 1, 0, 1]),
                        ("Küche um 20:00 zu", "all", [0, 1, 1, 1]),
                        ("Handy außerhalb des Schlafzimmers", "all", [1, 1, 1, 1]),
                        ("Gebetet, 21:00 Licht aus", "all", [1, 1, 1, 0])])]
    g = '<span class="h lft">Tagesstandard</span>' + "".join(f'<span class="h">{d}</span>' for d in D)
    for gname, items in groups:
        g += f'<span class="grp">{gname}</span>'
        for name, kind, marks in items:
            g += f'<span class="n">{name}</span>'
            for i in range(7):
                if i >= 5 and kind == "rest":
                    g += '<span class="cc"><span class="rest">Ruhe</span></span>'
                elif i >= 5 and kind == "dash":
                    g += '<span class="cc"><span class="dash">–</span></span>'
                else:
                    g += f'<span class="cc">{b(i < len(marks) and marks[i] == 1)}</span>'
    inner = f"""
<header class="ph"><h2 class="pt"><small>Phase Disziplin · Kann ich es halten?</small>Woche 1 · Einfach da sein</h2>
<div class="pm"><div class="dline" style="width:calc(34 * var(--mm))"><span class="pl">Woche vom</span>{hw("5. 10.")}</div></div></header>
{row("Auftrag der Woche", '<div class="lines"><p class="txt" style="margin:calc(1 * var(--mm)) 0">Die Woche nicht bewerten. Abhaken, was war, leer lassen, was nicht war. Ziel: sieben Abende ehrlich abgehakt.</p></div>')}
<p class="rb" style="margin-left:calc(22 * var(--mm))">„Alles, was ihr tut, das tut von Herzen als dem HERRN.“<cite>Kol 3,23</cite></p>
<div class="hb wa">{g}</div>
<p class="pr" style="margin-top:auto">Ein leeres Kästchen ist kein Urteil, nur eine ehrliche Auskunft.</p>
"""
    return page("l", "234", "Seite 234: Winter Arc, Wochen-Tracker", inner, runner="Arena · Winter Arc")


def p_wa_r():
    ws = [("Gottesdienst und Sonntagsruhe", False), ("Sonntagsgespräch mit meiner Frau", False),
          ("Abend zu zweit, von mir geplant", False), ("15 Minuten Finanzen", True), ("Gedient (einmal im Monat)", False)]
    w = "".join(f'<div class="it">{b(on)}<span>{n}</span></div>' for n, on in ws)
    inner = f"""
<header class="ph"><h2 class="pt"><small>Woche 1</small>Wochenstandard</h2></header>
<div class="wl" style="margin-top:calc(3 * var(--mm))">{w}</div>
{sec("", "Sonntagabend")}
{row("Ein Sieg dieser Woche", lines(3))}
{row("Das Kästchen, das ich schleifen ließ", lines(3))}
{row("Was Gott mich lehrt", lines(3))}
<p class="pr" style="margin-top:calc(4 * var(--mm))">Zum Schluss der Zuspruch:</p>
<div class="vs">„Die Güte des HERRN ist’s, daß wir nicht gar aus sind; seine Barmherzigkeit hat noch kein Ende, sondern sie ist alle Morgen neu, und deine Treue ist groß.“<cite>Klagelieder 3,22–23</cite></div>
"""
    return page("r", "235", "Seite 235: Winter Arc, Wochenstandard und Sonntagabend", inner, runner="Arena · Winter Arc")


def p_ord(n, fn, side, label, runner):
    return page(side + " ord", str(n), f"Seite {n}: {label}", fn(), runner=runner)


def p_arena():
    toc = [("225", "Meine Brüder"), ("226", "Winter Arc: Anleitung, wortgetreu nach dem Plan"),
           ("234", "Winter Arc: dreizehn Wochen, je eine Doppelseite"), ("260", "Tag 90 – und danach"),
           ("262", "Treffen der Brüder, eine Seite je Treffen")]
    toc_html = "".join(f"<b>{n}</b><span>{t}</span>" for n, t in toc)
    inner = f"""
<header class="ph"><h2 class="pt"><small>Dritter Teil</small>Arena</h2></header>
<div class="vs" style="margin-top:calc(3 * var(--mm))">„Ein Messer wetzt das andere und ein Mann den andern.“<cite>Sprüche 27,17</cite></div>
<p class="txt">Hier gehst du nicht allein. Zwei oder drei Brüder halten sich gegenseitig ehrlich, mit dem, was jeder teilen will.</p>
{sec("", "In der Arena")}
<div class="toc">{toc_html}</div>
{sec("", "Was geteilt wird")}
<p class="txt">Die drei Dinge, einzelne Gewohnheiten, der Stand im Winter Arc.</p>
{sec("", "Was nicht geteilt wird")}
<p class="txt">Gebet, Prüfung und die Tagesseiten. Was einer dem andern bekennt, wird nicht notiert.</p>
<p class="rb" style="margin-top:auto">Geh den nächsten Durchgang nicht allein. Nimm einen oder zwei Brüder aus der Arena mit und haltet euch gegenseitig ehrlich.</p>
"""
    return page("l", "224", "Seite 224: Arena", inner, runner="Arena")


def p_brueder():
    def bro(name, reach, pray):
        return (row("Name", lines(1, [name])) + row("erreichbar", lines(1, [reach])) +
                row("Für ihn beten", lines(2, pray)))
    inner = f"""
<header class="ph"><h2 class="pt">Meine Brüder</h2></header>
{sec("", "Erster Bruder")}
{bro("Matthias", "Signal · wohnt zwei Straßen weiter", ["Schlaf, das Kleinkind zahnt", "Geduld mit dem Chef"])}
{sec("", "Zweiter Bruder")}
{bro("Daniel", "Signal · Jugendkreis dienstags", ["Bewerbung bis Ende Oktober"])}
{sec("", "Dritter Bruder")}
{bro("", "", [])}
{sec("", "Wir treffen uns")}
{row("Wann", lines(1, ["samstags, 7 Uhr, jede Woche"]))}
{row("Wo", lines(1, ["Bäckerei am Markt"]))}
{sec("", "Abends den Stand schicken an")}
{row("Bruder", lines(1, ["Matthias, ab Woche 11"]))}
<p class="pr">Winter Arc, Woche 11: Einen Mann einladen, den Standard mitzugehen, etwa aus der Arena. Ihm jeden Abend kurz deinen Stand schicken.</p>
"""
    return page("r", "225", "Seite 225: Meine Brüder", inner, runner="Arena")


def p_treffen(n, side, ex):
    e = ex or {}
    def g(k, i=0):
        v = e.get(k, [])
        return v if isinstance(v, list) else [v]
    def stand(i):
        names = e.get("names", ["", "", ""])
        tr = e.get("traegt", ["", "", ""])
        br_ = e.get("braucht", ["", "", ""])
        return ('<div class="lines">'
                + ln('<span class="pl">Name</span>' + hw(names[i]))
                + ln('<span class="pl">trägt</span>' + hw(tr[i]))
                + ln('<span class="pl">braucht</span>' + hw(br_[i]))
                + ln('<span class="pl">Winter Arc</span>' + hw(e.get("wa", ["", "", ""])[i])) + ln("") + "</div>")
    inner = f"""
<header class="ph"><h2 class="pt">Treffen</h2>
<div class="pm"><div class="dline"><span class="pl">Datum</span>{hw(e.get("date", ""))}</div></div></header>
{row("Dabei", lines(1, g("who")))}
{sec("1", "Das Wort", "einer bringt es mit")}
{row("Stelle", lines(1, g("ref")))}
{row("Was wir mitnehmen", lines(3, g("take")))}
{sec("2", "Der Stand", "jeder, so viel er teilen will")}
<div class="tri">{stand(0)}{stand(1)}{stand(2)}</div>
<p class="pr">Was einer dem andern bekennt, wird nicht notiert.</p>
{sec("3", "Füreinander beten")}
{lines(5, g("pray"))}
{sec("4", "Bis zum nächsten Mal")}
{row("Wer fragt was nach", lines(3, g("ask")))}
{row("Nächstes Treffen", lines(1, g("next")))}
<p class="end">Vaterunser gemeinsam. Segen.</p>
"""
    return page(side, str(n), f"Seite {n}: Treffen", inner, runner="Arena")


# ------------------------------------------------------------------ document

TREFFEN_EX = {"date": "Samstag, 10. Oktober", "who": "Andreas, Matthias, Daniel", "ref": "Sprüche 27,17",
              "take": ["Keiner hält den Standard allein."],
              "names": ["Andreas", "Matthias", "Daniel"],
              "traegt": ["04:00 hält", "Fokusblöcke", "startet Montag"],
              "braucht": ["Küche um 20:00", "Schlaf", "Nachfragen"],
              "wa": ["Woche 1", "Woche 1", "ab Montag"],
              "pray": ["M.: Schlaf und Geduld · D.: Bewerbung", "A.: Predigt am Sonntag"],
              "ask": ["Matthias fragt Andreas Mittwoch nach der Küche."],
              "next": ["Samstag, 17. 10., 7 Uhr, Bäckerei"]}

PARTS = [("Vorn", 15, "--seg1", [("1–3", "Titel, Aufbau, Gebetsübersicht"), ("4–6", "Leseplan AT und NT"), ("7", "Katechismus"), ("8–15", "Die Ordnung, Morgen und Abend")]),
         ("Die Tage", 208, "--seg2", [("16–223", "13 Wochen × 16 Seiten"), ("", "je Woche: 2 Seiten Woche, 7 Tage × 2 Seiten")]),
         ("Arena", 51, "--seg3", [("224–225", "Arena, Meine Brüder"), ("226–233", "Winter Arc: Anleitung"), ("234–259", "13 Wochen-Tracker"), ("260–261", "Tag 90 – und danach"), ("262–274", "13 Treffen")]),
         ("Hinten", 14, "--seg4", [("275–282", "Notizen"), ("283–287", "Verse, die ich mitnehme"), ("288", "Monatlich")])]
assert sum(p[1] for p in PARTS) == 288
PLAN = ('<section class="block" id="seiten"><div class="cap"><span class="pg">Umfang</span><h2>288 Seiten in 18 Lagen</h2>'
        '<p>Ein Band trägt dreizehn Wochen, also genau eine Runde Winter Arc. 288 Seiten sind 18 Lagen zu je 16 Seiten, so lässt sich das Buch fadenheften.</p></div>'
        '<div class="plan"><div class="bar" role="img" aria-label="Vorn 15, Die Tage 208, Arena 51, Hinten 14 Seiten">'
        + "".join(f'<span style="flex:{n};background:var({c})">{n if n > 20 else ""}</span>' for _, n, c, _ in PARTS)
        + '</div><div class="parts">'
        + "".join(f'<div><h3><i style="background:var({c})"></i>{t}<b>{n} S.</b></h3><ul>'
                  + "".join(f"<li><span>{a}</span><span>{b}</span></li>" for a, b in items) + "</ul></div>"
                  for t, n, c, items in PARTS)
        + '</div><p class="sum">Dazu Vorsatz und Nachsatz im Deckel. Wer keinen Winter Arc läuft, nutzt die Tracker-Seiten für Notizen der Brüder.</p></div></section>')


def build():
    cover = """
<section class="block cover-block" id="umschlag">
  <div class="cover-row">
    <div class="book" role="img" aria-label="Umschlag: dunkelblaues Leinen, Titel Henoch in Gold, Gummiband, zwei Lesebändchen">
      <div class="cl"></div><div class="spine"></div><div class="band"></div>
      <div class="rib a"></div><div class="rib b"></div><div class="rib c"></div>
      <div class="ttl"><b>HENOCH</b><i></i><span>Morgen · Abend</span></div>
    </div>
    <div class="spec">
      <h2>Ausstattung</h2>
      <dl>
        <dt>Format</dt><dd>A5, 148 × 210 mm, so groß wie das Gebetsheft</dd>
        <dt>Umfang</dt><dd>288 nummerierte Seiten in 18 Lagen, ein Band für dreizehn Wochen; etwa 2 cm stark</dd>
        <dt>Bindung</dt><dd>Fadenheftung, liegt offen flach; Leineneinband</dd>
        <dt>Papier</dt><dd>90 g, füllhaltertauglich; Linien im Abstand von 5,5 mm, hinten Punktraster</dd>
        <dt>Bändchen</dt><dd>Drei: rot für den Tag, grün für die Ordnung, schwarz für die Arena</dd>
        <dt>Dazu</dt><dd>Gummiband, Einstecktasche hinten für Gottesdienstblatt und Zettel</dd>
      </dl>
    </div>
  </div>
</section>"""
    blocks = [
        cover,
        PLAN,
        block("titel", "Innendeckel · S. 1", "Zeichen und Titel",
              "Vorn im Deckel stehen alle Zeichen, die im Buch vorkommen. Die Titelseite nennt den Band, kein Jahr: Ein Band reicht für dreizehn Wochen.",
              spread(p_endpaper_front(), p_title())),
        block("aufbau", "S. 2–3", "Aufbau und Gebetsübersicht",
              "Die Seiten sind nicht datiert, deshalb gibt es keinen Rückstand. Wer aussetzt, macht auf der nächsten freien Seite weiter.",
              spread(p_aufbau(), p_gebetsuebersicht())),
        block("leseplan", "S. 6–7", "Leseplan und Katechismus",
              "Der Leseplan ist eine Liste zum Abhaken, kein Kalender. Beim Katechismus gibt es eine zweite Spalte für das Lernen mit den Kindern.",
              spread(p_nt(), p_katechismus())),
        block("ordnung", "S. 8–15", "Die Ordnung",
              "Die Gebetsanleitung steht vorn im Buch, mit allen Texten aus dem Gebetsheft: vier Seiten für den Morgen, vier für den Abend. Das grüne Bändchen bleibt hier liegen, das rote im Tag. Jede Tagesseite nennt bei jedem Schritt die Seite der Ordnung.",
              spread(p_ord(8, O.o8, "l", "Ordnung am Morgen, Am Bett und Eröffnung", "Die Ordnung · Morgen"),
                     p_ord(9, O.o9, "r", "Ordnung am Morgen, Psalm und Das Wort", "Die Ordnung · Morgen"))
              + '<div class="gap"></div>' +
              spread(p_ord(10, O.o10, "l", "Ordnung am Morgen, Das Gebet und Benedictus", "Die Ordnung · Morgen"),
                     p_ord(11, O.o11, "r", "Ordnung am Morgen, Vaterunser, Ausrichtung, Segen", "Die Ordnung · Morgen"))
              + '<div class="gap"></div>' +
              spread(p_ord(12, O.o12, "l", "Ordnung am Abend, Vesper", "Die Ordnung · Abend"),
                     p_ord(13, O.o13, "r", "Ordnung am Abend, Magnificat und Segen", "Die Ordnung · Abend"))
              + '<div class="gap"></div>' +
              spread(p_ord(14, O.o14, "l", "Ordnung am Abend, Nachtgebet bis zur Rückschau", "Die Ordnung · Abend"),
                     p_ord(15, O.o15, "r", "Ordnung am Abend, Prüfung, Zuspruch, Abendsegen", "Die Ordnung · Abend"))),
        block("woche", "S. 16–17", "Die Woche",
              "Links stehen Psalmen und Stand für jeden Wochentag, rechts die Gewohnheiten. Ein leerer Kreis bleibt leer, zusammengezählt wird nichts.",
              spread(p_woche_l(), p_woche_r())),
        block("tag", "S. 24–25", "Ein Tag: Morgen und Abend",
              "Die Doppelseite folgt der Ordnung: Wort, Gebet, Ausrichtung am Morgen; Rückschau, Prüfung, Zuspruch am Abend. Für Beichte und Prüfung gibt es keine Zeile. Der rote Randstrich markiert die Kurzform, die Seitenzahl im Kopf jedes Schritts führt zur Ordnung.",
              spread(p_morgen(), p_abend())),
        block("hinten", "S. 276 · 283", "Notizen und Verse",
              "Hinten sammelt sich, was über die Wochen aufgeht. Die Versliste führt mit der Seitenzahl zurück zum Tag.",
              spread(p_notizen(), p_verse())),
        block("monatlich", "S. 288 · Innendeckel", "Monatlich und der Bogen",
              "Privatbeichte und Abendmahl haben ihren eigenen Termin. Notiert wird das Datum, nie der Inhalt. Der hintere Deckel trägt den Bogen aus dem Gebetsheft.",
              spread(p_monatlich(), p_endpaper_back())),
        block("arena", "S. 224–274", "Arena",
              "Der dritte Teil gehört den Brüdern und dem Winter Arc. Vorn stehen die Brüder, dann die Anleitung des Winter Arc wortgetreu, dreizehn Wochen-Tracker, Tag 90 und je eine Seite für jedes Treffen.",
              spread(p_arena(), p_brueder())
              + '<div class="gap"></div>' + spread(p_wa_l(), p_wa_r())
              + '<div class="gap"></div>' + spread(p_treffen(262, "l", TREFFEN_EX), p_treffen(263, "r", None))),
    ]
    nav = [("umschlag", "Umschlag"), ("seiten", "288 Seiten"), ("titel", "Titel"), ("aufbau", "Aufbau"), ("leseplan", "Leseplan"),
           ("ordnung", "Die Ordnung"), ("woche", "Woche"), ("tag", "Tag"), ("arena", "Arena"),
           ("hinten", "Notizen und Verse"), ("monatlich", "Monatlich")]
    nav_html = "".join(f'<li><a href="#{a}">{t}</a></li>' for a, t in nav)
    body = f"""
<div class="wrap">
  <header class="top">
    <div>
      <p class="eyebrow">Henoch · Musterseiten</p>
      <h1>Henoch als Notizbuch</h1>
      <p class="lede">Ein Band in A5 für dreizehn Wochen. Er folgt derselben Ordnung wie die App: erst das Wort, dann der Vorsatz. Es gibt keine Serien, und für Sünden gibt es keine Zeile.</p>
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
  var btn=document.getElementById('ex-toggle'), book=document.getElementById('book'), KEY='henoch-nb-examples';
  function set(on){{ book.classList.toggle('show',on); btn.setAttribute('aria-pressed', on?'true':'false'); }}
  try{{ var v=localStorage.getItem(KEY); if(v==='0') set(false); }}catch(e){{}}
  btn.addEventListener('click',function(){{
    var on=!book.classList.contains('show'); set(on);
    try{{ localStorage.setItem(KEY,on?'1':'0'); }}catch(e){{}}
  }});
}})();
</script>
"""
    CSSALL = CSS + O.ORD_CSS
    head = (f'<title>Henoch Notizbuch</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
            f'<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            f'<link rel="stylesheet" href="{FONTS}">\n<style>{CSSALL}</style>\n')
    fragment = head + body
    (OUT_DIR / "henoch-notizbuch.html").write_text(fragment, encoding="utf-8")
    full = ('<!doctype html><html lang="de"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
            + head + '</head><body>' + body + '</body></html>')
    (OUT_DIR / "henoch-notizbuch-druck.html").write_text(full, encoding="utf-8")
    print("ok")


if __name__ == "__main__":
    build()
