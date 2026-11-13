// Builds the Henoch writing templates ("Lesen und Hören") as PDFs; how to run it: LIESMICH.md.
// Without a flag: the older print editions (A5 sermon book, A4 folder, tablet folder).
// GN=1: the GoodNotes templates in goodnotes/ (then komplett.py joins them into one file).
// JAHR=1: the year edition for the tablet (855 pages, no longer recommended).
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const ROOT = new URL('../../', import.meta.url).pathname;
const require = createRequire(ROOT);
const { chromium } = require('playwright');

const OUT = new URL('.', import.meta.url).pathname;
const FONTS = ROOT + 'docs/anleitung/fonts';
const SPREADS = 24;
const N = 4 + SPREADS * 2; // title, use, register, spreads, back = 52

const PETALS = [0, 1, 2, 3, 4].map((i) => -90 + i * 72);
const rose = `<svg viewBox="0 0 48 48" class="rose" stroke-linejoin="round">
<circle cx="24" cy="24" r="23" fill="#d9ae00" stroke="#141414" stroke-width="1"/>
<circle cx="24" cy="24" r="20.2" fill="#0bc8ff" stroke="#141414" stroke-width="0.9"/>
${PETALS.map((a) => `<path transform="rotate(${a + 126} 24 24)" d="M24 4.6 C25.8 8 25.9 11 24 14 C22.1 11 22.2 8 24 4.6 Z" fill="#9acd32" stroke="#141414" stroke-width="0.8"/>`).join('')}
${PETALS.map((a) => `<g transform="rotate(${a + 90} 24 24)"><path d="M24 3.6 C29.5 6.5 32.8 10.5 31.2 15.6 C29.9 19.4 26.4 21 24 21.5 C21.6 21 18.1 19.4 16.8 15.6 C15.2 10.5 18.5 6.5 24 3.6 Z" fill="#fff" stroke="#141414" stroke-width="0.9"/><path d="M24 9 C26.6 10.2 27.4 12.6 26.4 15 C25.6 16.6 24.6 17.4 24 17.8 C23.4 17.4 22.4 16.6 21.6 15 C20.6 12.6 21.4 10.2 24 9 Z" fill="#cfcfcf"/></g>`).join('')}
<path d="M24 33.4 C19.2 30 15.6 26.8 15.6 22.8 C15.6 20.2 17.5 18.4 19.8 18.4 C21.6 18.4 23 19.4 24 20.8 C25 19.4 26.4 18.4 28.2 18.4 C30.5 18.4 32.4 20.2 32.4 22.8 C32.4 26.8 28.8 30 24 33.4 Z" fill="#e31e24" stroke="#141414" stroke-width="0.9"/>
<path d="M23 20.4 h2 v3 h3 v2 h-3 v6.4 h-2 v-6.4 h-3 v-2 h3 Z" fill="#fff" stroke="#141414" stroke-width="0.7"/></svg>`;

const LOGO = 'file://' + ROOT + 'public/icons/icon-512.png';
const logo = (cls) => `<img class="logo ${cls}" src="${LOGO}" alt="">`;
const css = `
@font-face{font-family:Literata;src:url(file://${FONTS}/literata-latin-400-normal.woff2);font-weight:400}
@font-face{font-family:Literata;src:url(file://${FONTS}/literata-latin-600-normal.woff2);font-weight:600}
@font-face{font-family:Literata;src:url(file://${FONTS}/literata-latin-400-italic.woff2);font-style:italic}
@font-face{font-family:'Source Sans 3';src:url(file://${FONTS}/source-sans-3-latin-400-normal.woff2);font-weight:400}
@font-face{font-family:'Source Sans 3';src:url(file://${FONTS}/source-sans-3-latin-600-normal.woff2);font-weight:600}
:root{--ink:#1d2330;--muted:#636a76;--line:#c9c3b6;--hair:#ddd8ce;--rubric:#8c2f2f;--gold:#7f6200;--gold-l:#d9ae00;--warm:#f3f1ec;--field:#8a8578;
--serif:Literata,Georgia,serif;--sans:'Source Sans 3',Helvetica,Arial,sans-serif;--lh:7mm}
*{box-sizing:border-box}
html,body{margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;color:var(--ink);font-family:var(--serif)}
.page{width:148mm;height:210mm;position:relative;overflow:hidden;display:flex;flex-direction:column;background:#fff}
.page.r{padding:12mm 12mm 11mm 17mm}
.page.l{padding:12mm 17mm 11mm 12mm}
.foot{position:absolute;bottom:6.5mm;font-family:var(--sans);font-size:7pt;color:var(--muted);letter-spacing:.06em}
.page.r .foot{right:12mm} .page.l .foot{left:12mm}
.foot b{color:var(--ink);font-weight:600;font-variant-numeric:tabular-nums}
.label{font-family:var(--sans);font-size:6.6pt;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:600}
.rubric{font-style:italic;color:var(--rubric);font-size:8.6pt;line-height:1.4}
/* head fields */
.fields{display:grid;grid-template-columns:1fr 1.5fr;column-gap:6mm;row-gap:2.2mm}
.f{border-bottom:.3mm solid var(--line);height:9.5mm;display:flex;align-items:flex-start}
.f.wide{grid-column:1/-1}
.f.text{height:12mm;border-bottom-color:var(--gold)}
.f.text .label{color:var(--gold)}
h2.sec{display:flex;align-items:baseline;gap:3mm;margin:0 0 1mm;font:600 10pt var(--serif)}
h2.sec .label{font-weight:600}
/* ruled area with margin column for references */
.ruled{flex:1;position:relative;overflow:hidden;border-top:.3mm solid var(--line);display:flex;flex-direction:column}
.ln{flex:none;height:var(--lh);border-bottom:.25mm solid var(--hair)}
.ruled.m::before{content:'';position:absolute;top:0;bottom:0;width:0;border-left:.4mm solid var(--rubric)}
.page.l .ruled.m::before{left:21mm} .page.r .ruled.m::before{right:21mm}
.mlabel{position:absolute;top:1mm;font-family:var(--sans);font-size:6pt;letter-spacing:.08em;text-transform:uppercase;color:var(--rubric);font-weight:600}
.page.l .mlabel{left:0} .page.r .mlabel{right:0;text-align:right}
.lines{display:flex;flex-direction:column}
.block{display:flex;flex-direction:column;gap:1mm}
.box{border:.3mm solid var(--line);border-radius:2.5mm;padding:2mm 3mm 0;display:flex;flex-direction:column;gap:.5mm}
.box.law{border-top:1mm solid var(--muted)}
.box.gospel{border-top:1mm solid var(--gold-l)}
.box .q{font-size:8.6pt;font-style:italic;color:var(--ink)}
.box .lines{margin:0 -3mm;padding:0 3mm}.box > .lines .ln:last-child{border-bottom:0}
.stack{display:flex;flex-direction:column;gap:3.4mm}
/* title */
.title{align-items:center;justify-content:center;text-align:center;gap:6mm}
.logo{display:block;border-radius:22%;border:.25mm solid var(--hair)}
.logo.big{width:34mm;height:34mm}.logo.small{width:8.5mm;height:8.5mm}.logo.tiny{width:7mm;height:7mm}
.head{display:flex;align-items:center;gap:3mm;margin-bottom:3.4mm}
.head b{font:600 13pt/1.1 var(--serif)}
.head span{font-family:var(--sans);font-size:6.6pt;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);display:block;margin-top:.6mm}
.legend{display:grid;grid-template-columns:1fr 1fr;column-gap:5mm;row-gap:1.1mm;font-family:var(--sans);font-size:7.2pt;line-height:1.25}
.legend div{display:flex;align-items:center;gap:2mm}
.legend i{flex:none;width:7mm;height:1.5mm;border-radius:1mm;transform:rotate(-4deg)}
.legend b{font-weight:600}
.marks{display:flex;gap:5mm;font-family:var(--sans);font-size:7.2pt;margin-top:1.4mm;padding-top:1.4mm;border-top:.25mm solid var(--hair)}
.marks b{font:600 9pt var(--serif);color:var(--rubric);margin-right:1mm}
.q{font-size:8.6pt;font-style:italic}
.verse{font-size:8.4pt;line-height:1.4;margin:0}
.verse small{font-family:var(--sans);font-size:6.8pt;color:var(--muted);font-style:normal}
.credit{font-family:var(--sans);font-size:6.4pt;color:var(--muted);margin-top:auto;padding-bottom:4mm}
.inl{display:flex;align-items:baseline;gap:2mm}
.one{height:var(--lh);border-bottom:.25mm solid var(--hair);display:flex;align-items:flex-end;padding-bottom:.9mm}
.one span{font-family:var(--sans);font-size:7pt;color:var(--muted)}
/* A4, one column: the A5 layout enlarged by 1.15, with more lines */
.page.a4{width:182.6mm;height:258.2mm;zoom:1.15;padding:13mm 17mm 12mm 17mm}
.page.a4 .foot{left:17mm;right:17mm;bottom:6.5mm;display:flex;justify-content:space-between}
.tab{position:absolute;right:0;width:8.5mm;height:36mm;border-radius:2.6mm 0 0 2.6mm;writing-mode:vertical-rl;display:flex;align-items:center;justify-content:center;font:600 6.6pt var(--sans);letter-spacing:.16em;text-transform:uppercase;color:#fff}
.tab.back{right:auto;left:0;border-radius:0 2.6mm 2.6mm 0}
.tab.sz{top:11mm;background:#a78100}.tab.pn{top:51mm;background:#4f7a17}
.raw{width:210mm;height:297mm;position:relative;overflow:hidden;background:#fff}
.cover svg.art{position:absolute;inset:0;width:210mm;height:297mm}
.cover .eyebrow{position:absolute;left:24mm;top:24mm;font:600 9pt var(--sans);letter-spacing:.32em;text-transform:uppercase;color:var(--gold)}
.cover .no{position:absolute;right:24mm;top:24mm;font:400 9pt var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.cover .ttl{position:absolute;left:24mm;right:24mm;top:204mm}
.cover h1{font:600 44pt/1.02 var(--serif);margin:0;letter-spacing:-.01em}
.cover h1 em{font-style:italic;font-weight:400;color:var(--gold)}
.cover .rule{width:26mm;border-top:.9mm solid var(--rubric);margin:7mm 0 5mm}
.cover .sub{font:400 13pt/1.45 var(--serif);max-width:120mm;margin:0}
.cover .base{position:absolute;left:24mm;right:24mm;bottom:20mm;display:flex;align-items:center;gap:4mm;font:400 8.5pt var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--muted);border-top:.3mm solid var(--line);padding-top:5mm}
.cover .base .logo{width:11mm;height:11mm}
.cover .base b{color:var(--ink);font-weight:600;letter-spacing:.24em}
.cover .base .sp{margin-left:auto}
.toc{padding:26mm 24mm 22mm}
.toc .eyebrow{font:600 8pt var(--sans);letter-spacing:.3em;text-transform:uppercase;color:var(--gold)}
.toc h1{font:600 26pt/1.1 var(--serif);margin:3mm 0 11mm}
.toc ol{list-style:none;margin:0;padding:0;border-top:.3mm solid var(--line)}
.toc li{padding:5mm 0 5.4mm;border-bottom:.3mm solid var(--line)}
.toc .row{display:flex;align-items:baseline;gap:3mm;font:600 14pt var(--serif)}
.toc .row .dots{flex:1;border-bottom:.35mm dotted var(--field);transform:translateY(-1.2mm)}
.toc .row .pg{font:600 12pt var(--sans);font-variant-numeric:tabular-nums}
.toc .row small{font:400 8pt var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.toc .d{font:400 10pt/1.5 var(--sans);color:var(--muted);margin:1.6mm 0 0;display:grid;grid-template-columns:17mm 1fr;row-gap:.6mm}
.toc .d b{font-weight:600;color:var(--ink)}
.toc h2{font:600 15pt var(--serif);margin:15mm 0 4mm;display:flex;align-items:baseline;gap:3mm}
.toc h2 span{font:600 8pt var(--sans);letter-spacing:.14em;color:var(--rubric);text-transform:uppercase}
.toc .use{display:grid;grid-template-columns:1fr 1fr;gap:6mm 10mm}
.toc .use h3{font:600 11pt var(--serif);margin:0 0 1mm}
.toc .use p{font:400 10pt/1.5 var(--serif);margin:0;hyphens:auto}
.toc h1{margin-bottom:8mm}
table.fill{font-size:8pt}table.fill th{font-size:7.5pt;padding-bottom:2.2mm}table.fill td{height:8.3mm;border-bottom:.3mm solid var(--hair)}table.fill td+td{border-left:.3mm solid var(--hair)}
.seite{display:inline-block;width:14mm;border-bottom:.3mm solid var(--line);margin-left:1.5mm}
.toc .pfoot{position:absolute;left:24mm;right:24mm;bottom:14mm;display:flex;justify-content:space-between;font:400 8pt var(--sans);letter-spacing:.08em;color:var(--muted)}

.title h1{font:600 26pt/1.1 var(--serif);margin:0;letter-spacing:.01em}
.title .sub{font-family:var(--sans);font-size:9.5pt;color:var(--muted);letter-spacing:.14em;text-transform:uppercase;margin-top:-3mm}
.title .own{width:88mm;display:grid;gap:4mm;margin-top:14mm;text-align:left}
.title .brand{position:absolute;bottom:12mm;left:0;right:0;font-family:var(--sans);font-size:8pt;letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}
/* text page */
.prose h1{font:600 15pt var(--serif);margin:0 0 4mm}
.prose p{font-size:9.2pt;line-height:1.5;margin:0 0 2.6mm;hyphens:auto;text-align:left}
.prose h3{font:600 9.6pt var(--serif);margin:3.6mm 0 1mm;display:flex;gap:2mm;align-items:baseline}
.prose h3 span{font-family:var(--sans);font-size:7pt;color:var(--rubric);letter-spacing:.06em}
.prose .refs{font-family:var(--sans);font-size:8pt;color:var(--muted);margin-top:auto;border-top:.3mm solid var(--hair);padding-top:2.5mm}
/* register */
table{border-collapse:collapse;width:100%;font-family:var(--sans);font-size:7.4pt}
th{text-align:left;font-weight:600;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;font-size:6.4pt;padding:0 0 1.5mm;border-bottom:.3mm solid var(--line)}
td{height:6.45mm;border-bottom:.25mm solid var(--hair);vertical-align:bottom;padding:0}
td.n{text-align:right;color:var(--muted);font-variant-numeric:tabular-nums;width:9mm}
`;

let A4 = false;
const L = (a5, a4) => (A4 ? a4 : a5);
const foot = (n) => `<div class="foot">${n % 2 ? 'Predigtbuch · <b>' + n + '</b>' : '<b>' + n + '</b> · Predigtbuch'}</div>`;
const tfoot = (t) => `<div class="foot">Henoch · ${t}</div>`;
const head = (t, sub) => `<div class="head">${logo('small')}<div><b>${t}</b><span>${sub}</span></div></div>`;
const side = (n) => (n % 2 ? 'r' : 'l');
const ln = (k) => '<div class="ln"></div>'.repeat(k);
const lines = (k) => `<div class="lines">${ln(k)}</div>`;

function title() {
  return `<section class="page r title">${logo('big')}
  <h1>Predigtbuch</h1><div class="sub">Notizen beim Hören</div>
  <div class="own"><div class="f"><span class="label">Name</span></div><div class="f"><span class="label">Begonnen am</span></div></div>
  <div class="brand">Henoch</div></section>`;
}

function use() {
  return `<section class="page l prose" style="display:flex;flex-direction:column">
  <h1>Zum Gebrauch</h1>
  <p>Der Glaube kommt aus dem Hören. Dieses Heft hilft dir, beim Hören wach zu bleiben und das Gehörte in die Woche mitzunehmen. Für jede Predigt gibt es eine Doppelseite.</p>
  <h3><span>VORHER</span>Erst das Wort</h3>
  <p>Trag Datum, Sonntag und Predigttext ein, bevor der Prediger auf die Kanzel geht. Dann werde still und bitte Gott, dass Er dir das Ohr öffnet.</p>
  <h3><span>WÄHREND</span>Mitschreiben</h3>
  <p>Schreib die Gliederung so mit, wie der Prediger sie gibt, und was dich trifft. Bibelstellen, die er anführt, kommen in die rote Randspalte. Du schlägst sie später in deiner Bibel nach.</p>
  <h3><span>DANACH</span>Gesetz und Evangelium</h3>
  <p>Am Mittag oder am Abend: Was fordert Gott in diesem Text, und was schenkt Er in Christus? Das Evangelium steht zuletzt, es hat das letzte Wort. Dann ein Gedanke für das Gespräch am Tisch im Haus und ein Wort für die Woche.</p>
  <h3><span>LÜCKEN</span>Kein Rückstand</h3>
  <p>Ein Satz genügt; auch das ist eine vollständige Notiz. Ein Sonntag ohne Eintrag ist kein Versäumnis. Du schreibst einfach auf der nächsten freien Doppelseite weiter.</p>
  <div class="refs">Römer 10, 17 · Jakobus 1, 22 · 1. Samuel 3, 10 · Lukas 8, 18</div>
  ${foot(2)}</section>`;
}

function register() {
  let rows = '';
  for (let i = 0; i < SPREADS; i++) rows += `<tr><td style="width:17mm"></td><td style="width:30mm"></td><td></td><td class="n">${4 + i * 2}</td></tr>`;
  return `<section class="page r prose"><h1>Verzeichnis</h1>
  <table><thead><tr><th>Datum</th><th>Predigttext</th><th>Prediger · Thema</th><th style="text-align:right">Seite</th></tr></thead><tbody>${rows}</tbody></table>
  ${foot(3)}</section>`;
}

function left(n) {
  return `<section class="page l">${head('Predigtnotiz', 'Notizen beim Hören')}<div class="fields">
   <div class="f"><span class="label">Datum</span></div>
   <div class="f"><span class="label">${L('Sonntag im Kirchenjahr', 'Sonntag · Anlass')}</span></div>
   <div class="f"><span class="label">Gemeinde</span></div>
   <div class="f"><span class="label">Prediger</span></div>
   <div class="f text wide"><span class="label">Predigttext</span></div>
   <div class="f"><span class="label">Lesungen</span></div>
   <div class="f"><span class="label">Lied</span></div>
  </div>
  <p class="rubric" style="margin:3.4mm 0 3mm">Vor der Predigt still werden und um ein hörendes Herz bitten (1. Samuel 3, 10).</p>
  <h2 class="sec"><span class="label">Mitschrift</span></h2>
  <div class="ruled m"><span class="mlabel">Stellen</span>${ln(L(30, 36))}</div>
  ${n ? foot(n) : tfoot('Predigtnotiz')}</section>`;
}

function right(n) {
  return `<section class="page r">
  <div class="ruled m" style="flex:none"><span class="mlabel">Stellen</span>${ln(L(8, 6))}</div>
  <div class="stack" style="margin-top:3.4mm">
   <div class="block"><span class="label">Ein Satz, der bleibt</span>${lines(2)}</div>
   ${L('', '<p class="rubric" style="margin:0 0 -1mm">Beide Fragen gelten dem Text, nicht dem Prediger.</p>')}
   <div class="box law"><span class="label">Gesetz</span><span class="q">Was fordert Gott in diesem Text?</span>${lines(L(3, 4))}</div>
   <div class="box gospel"><span class="label" style="color:var(--gold)">Evangelium</span><span class="q">Was schenkt Gott in Christus?</span>${lines(L(3, 4))}</div>
   ${L(`<div class="block"><span class="label">Für den Tisch im Haus</span>${lines(2)}</div>
   <div class="block"><span class="label">Ein Wort für die Woche</span>${lines(1)}</div>`,
   `<div class="block"><span class="label">Für den Tisch im Haus</span><span class="rubric">Zuerst fragen, was Frau und Kinder gehört haben.</span>
    <div class="one"><span>Ein Satz zum Weitergeben</span></div><div class="ln"></div><div class="one"><span>Eine Frage an die Kinder</span></div><div class="ln"></div></div>
   <div class="block"><span class="label">Ein Wort für die Woche</span><span class="q">Zur Wochenmitte noch einmal lesen.</span>${lines(1)}</div>`)}
  </div>
  ${n ? foot(n) : tfoot('Predigtnotiz')}</section>`;
}

function back(n) {
  return `<section class="page l"><h2 class="sec"><span class="label">Weitere Notizen</span></h2>
  <div class="ruled">${ln(30)}</div>
  <div style="display:flex;align-items:center;gap:3mm;margin-top:5mm;font-family:var(--sans);font-size:7pt;color:var(--muted)">
   ${logo('tiny')}
   <span>Predigtbuch aus Henoch. Die Bibel liegt daneben, auf Papier.</span></div>
  ${foot(n)}</section>`;
}


// Bible reading template. Wording of the fields follows the app (content/fields.ts, content/method.ts).
const COLORS = [
  ['Blau', '#2f6fce', 'Wer Gott ist und was Er tut'],
  ['Rot', '#d23a2f', 'Was Gott gebietet und fordert'],
  ['Violett', '#7b4bb7', 'Antworten in Gottesfurcht'],
  ['Braun', '#8a5a2b', 'Sünde und Gottlosigkeit'],
  ['Orange', '#ef8a1f', 'Schlüsselbegriffe'],
  ['Grün', '#3c9a4a', 'Wo die Bibel sich selbst zitiert'],
];
const legend = `<div class="box" style="padding-bottom:2mm"><span class="label">Farbstifte und Randzeichen</span>
    <div class="legend">${COLORS.map(([c, h, m]) => `<div><i style="background:${h}"></i><span><b>${c}</b> · ${m}</span></div>`).join('')}</div>
    <div class="marks"><span><b>?</b>Unklar</span><span><b>!</b>Fordert mich heraus</span><span><b>→</b>Umsetzung</span></div></div>`;
const one = (t) => `<div class="one"><span>${t}</span></div>`;
function bibleLeft() {
  return `<section class="page l">${head('Bibellese', 'Notizen beim Lesen')}
  <div class="fields"><div class="f"><span class="label">Datum</span></div><div class="f text" style="height:9.5mm"><span class="label">Lesung</span></div></div>
  <p class="rubric" style="margin:3.4mm 0 3mm">Gebet vorher, Gebet nachher. Dreimal lesen: ohne Stift, mit Stift nach Farbcode, dann zusammenfassen.</p>
  <div class="stack">
   ${legend}
   <div class="block"><span class="label">Hauptaussage</span>${lines(4)}</div>
   <div class="block"><div class="inl"><span class="label">Vers, den ich mitnehme</span><span class="label" style="margin-left:auto">Stelle</span><i class="seite" style="width:38mm"></i></div>${lines(3)}</div>
   <div class="box gospel" style="padding-bottom:1mm"><span class="label" style="color:var(--gold)">Gebet über dem Wort</span><span class="q">Was Gott mir hier sagt, wofür ich danke, worum ich bitte.</span>${lines(4)}</div>
   <div class="block"><span class="label">Ausrichtung für heute</span><span class="rubric">Zuletzt, nach dem Gebet: Was heißt dieses Wort heute?</span>
    ${one('Haus · Frau und Kinder')}${one('Gemeinde')}${one('Werk · Arbeit')}${one('Wem gebe ich es weiter?')}</div>
  </div>
  <p class="rubric" style="margin:auto 0 4mm">Diese Seite genügt. Die Rückseite ist zum Vertiefen, wenn Zeit ist.</p>
  <div class="foot"><span>Henoch · Bibellese</span><span>Blatt<i class="seite"></i></span></div></section>`;
}
function bibleRight() {
  const two = 'display:grid;grid-template-columns:1fr 1fr;gap:5mm';
  return `<section class="page r"><h2 class="sec"><span class="label">Vertiefen</span></h2><div class="stack">
   <div style="${two}">
    <div class="block"><span class="label">Was lerne ich über Gott?</span>${lines(3)}</div>
    <div class="block"><span class="label">Was lerne ich über den Menschen?</span>${lines(3)}</div>
   </div>
   <div style="${two}">
    <div class="box law"><span class="label">Gesetz</span><span class="q">Was fordert Gott in diesem Text?</span>${lines(3)}</div>
    <div class="box gospel"><span class="label" style="color:var(--gold)">Evangelium</span><span class="q">Was schenkt Gott in Christus?</span>${lines(3)}</div>
   </div>
   <div class="block"><span class="label">Heilsgeschichte</span><span class="q">Schöpfung, Fall, Erlösung, Vollendung: Wo steht der Text, und wie weist er auf Christus?</span>${lines(2)}</div>
   <div style="${two}">
    <div class="block"><span class="label"><b style="color:var(--rubric)">?</b>&ensp;Unklar</span>${lines(2)}</div>
    <div class="block"><span class="label"><b style="color:var(--rubric)">!</b>&ensp;Fordert mich heraus</span>${lines(2)}</div>
   </div>
   <div class="box gospel" style="padding-bottom:2.4mm;gap:1.6mm"><span class="label" style="color:var(--gold)">Der vierfache Kranz · ausführlich</span>
    <div class="block"><span class="q">Unterricht: Was sagst Du mir hier?</span>${lines(2)}</div>
    <div class="block"><span class="q">Danksagung: Welche Gabe steckt darin?</span>${lines(1)}</div>
    <div class="block"><span class="q">Beichte</span><span class="rubric">Wird gebetet, nicht notiert.</span>
     <p class="verse">So wir aber unsre Sünden bekennen, so ist er treu und gerecht, daß er uns die Sünden vergibt und reinigt uns von aller Untugend. <small>1. Johannes 1, 9</small></p></div>
    <div class="block"><span class="q">Bitte: Worum bitte ich Dich?</span>${lines(1)}</div>
   </div>
   <div class="block"><span class="label">Fürbitte mit Namen</span>${one('Meine Frau')}${one('Meine Kinder')}${one('Brüder und Gemeinde')}</div>
  </div>
  <div class="foot"><span>Henoch · Bibellese · Vertiefen</span><span></span></div></section>`;
}

const pages = [title(), use(), register()];
for (let i = 0; i < SPREADS; i++) pages.push(left(4 + 2 * i), right(5 + 2 * i));
pages.push(back(N));
if (pages.length !== N) throw new Error('page count');

const doc = (body, extra) => `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>${css}${extra}</style></head><body>${body}</body></html>`;

// A5, one page per sheet
const a5 = doc(pages.join(''), `@page{size:148mm 210mm;margin:0}.page{break-after:page}`);
writeFileSync(OUT + 'a5.html', a5);

// A4 landscape booklet: fold the stack in the middle, print double-sided, flip on the short edge.
const sheets = [];
for (let i = 0; i < N / 4; i++) {
  sheets.push([N - 1 - 2 * i, 2 * i], [2 * i + 1, N - 2 - 2 * i]);
}
const a4 = doc(
  sheets.map(([a, b]) => `<div class="sheet">${pages[a]}${pages[b]}</div>`).join(''),
  `@page{size:297mm 210mm;margin:0}.sheet{display:flex;width:297mm;height:210mm;break-after:page}
   .sheet .page:first-child{box-shadow:inset -.2mm 0 0 #eee}`,
);
writeFileSync(OUT + 'a4.html', a4);

// ---- A4 folder: cover, contents, both templates (one column)
function cover() {
  const arcs = [31, 45, 59, 73, 87].map((r, i) => `<path d="M${105 - r} 118 A${r} ${r} 0 0 1 ${105 + r} 118" fill="none" stroke="#c9c3b6" stroke-width="${0.9 - i * 0.12}" opacity="${1 - i * 0.16}"/>`).join('');
  const strata = [[123.5, 0.9], [131, 0.75], [142, 0.6], [158, 0.45], [180, 0.3]].map(([y, o]) => `<line x1="0" x2="210" y1="${y}" y2="${y}" stroke="#c9c3b6" stroke-width=".55" opacity="${o}"/>`).join('');
  return `<section class="raw cover">
  <svg class="art" viewBox="0 0 210 297" preserveAspectRatio="none">
   <defs>
    <linearGradient id="way" gradientUnits="userSpaceOnUse" x1="0" y1="118" x2="0" y2="200"><stop offset="0" stop-color="#e9e5dc"/><stop offset="1" stop-color="#e9e5dc" stop-opacity="0"/></linearGradient>
    <linearGradient id="edge" gradientUnits="userSpaceOnUse" x1="0" y1="118" x2="0" y2="198"><stop offset="0" stop-color="#1d2330"/><stop offset=".6" stop-color="#1d2330" stop-opacity=".75"/><stop offset="1" stop-color="#1d2330" stop-opacity="0"/></linearGradient>
   </defs>
   ${arcs}
   <path d="M88 118 A17 17 0 0 1 122 118 Z" fill="#c9a000"/>
   ${strata}
   <path d="M105 118 C104 138 90 162 36 200 L152 200 C124 156 107 136 105 118 Z" fill="url(#way)"/>
   <path d="M105 118 C104 138 90 162 36 200" fill="none" stroke="url(#edge)" stroke-width="1.1" stroke-linecap="round"/>
   <path d="M105 118 C107 136 124 156 152 200" fill="none" stroke="url(#edge)" stroke-width="1.1" stroke-linecap="round"/>
   <line x1="0" x2="210" y1="118" y2="118" stroke="#1d2330" stroke-width="1.1"/>
  </svg>
  <div class="eyebrow">Henoch</div><div class="no">Vorlagen zum Kopieren</div>
  <div class="ttl"><h1>Lesen <em>und</em> Hören</h1><div class="rule"></div>
   <p class="sub">Henoch – Mit Gott durch den Tag.</p></div>
  <div class="base">${logo('')}<b>Henoch</b><span>Bibellese · Predigtnotiz</span><span class="sp">1. Mose 5, 24</span></div>
  </section>`;
}
function reg(title, cols, footnote, pg) {
  const rows = ('<tr>' + '<td></td>'.repeat(cols.length) + '</tr>').repeat(26);
  return `<section class="raw toc"><div class="eyebrow">Henoch · Lesen und Hören</div><h1>${title}</h1>
  <table class="fill"><thead><tr>${cols.map(([t, w], i) => `<th style="${w ? 'width:' + w + 'mm;' : ''}${i === cols.length - 1 ? 'text-align:right' : ''}">${t}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
  <div class="pfoot"><span>Henoch · ${footnote}</span><span>${pg}</span></div></section>`;
}
function useA4() {
  const u = (h, p) => `<div><h3>${h}</h3><p>${p}</p></div>`;
  return `<section class="raw toc"><div class="eyebrow">Henoch · Lesen und Hören</div><h1>Zum Gebrauch</h1>
  <div class="use">
   ${u('Kopieren und nummerieren', 'Die Seiten 5 und 6 ergeben ein Blatt für die Bibellese, die Seiten 7 und 8 ein Blatt für eine Predigt. Die farbige Marke am Rand zeigt im Ordner, welches Blatt es ist. Kopiere sie beidseitig. Jedes Blatt bekommt vorn unten eine Nummer; dieselbe Nummer trägst du ins Inhaltsverzeichnis ein, mit Datum, Bibelstelle und Typ.')}
   ${u('Die Vorderseite genügt', 'Bei der Bibellese ist die Vorderseite für sich vollständig: Lesung, Hauptaussage, ein Vers, Gebet, Ausrichtung. Die Rückseite ist zum Vertiefen, wenn Zeit ist. Leere Zeilen sind kein Versäumnis.')}
   ${u('Erst das Wort, zuletzt der Vorsatz', 'Beide Blätter beginnen mit dem Text. Dann wird gebetet. Erst danach fragst du, was das Wort heute für dein Haus, die Gemeinde und deine Arbeit heißt.')}
   ${u('Gesetz und Evangelium', 'Was fordert Gott, und was schenkt Er in Christus? Die Fragen gelten dem Text, nicht dem Prediger und nicht deiner Leistung. Das Evangelium steht zuletzt, es hat das letzte Wort.')}
   ${u('Am Tisch im Haus', 'Frag zuerst, was deine Frau und die Kinder gehört haben. Dann gib einen Satz weiter und stell den Kindern eine Frage. Mehr braucht es nicht.')}
   ${u('Kein Rückstand', 'Ein Tag oder ein Sonntag ohne Blatt wird nicht nachgeholt. Du nimmst einfach das nächste. Die Bibel liegt daneben, auf Papier, mit Farbstiften.')}
  </div>
  <div class="pfoot"><span>Henoch · Zum Gebrauch</span><span>3</span></div></section>`;
}
A4 = true;
const a4pages = [bibleLeft(), bibleRight(), left(0), right(0)].map((h, i) =>
  h.replace(/class="page [lr]"/, 'class="page l a4"').replace(/<div class="foot">Henoch · Predigtnotiz<\/div>/, i === 2 ? '<div class="foot"><span>Henoch · Predigtnotiz</span><span>Blatt<i class="seite"></i></span></div>' : '<div class="foot"><span>Henoch · Predigtnotiz · Mitnehmen</span><span></span></div>')
   .replace(/<\/section>$/, `<div class="tab ${i < 2 ? 'sz' : 'pn'}${i % 2 ? ' back' : ''}">${i < 2 ? 'Bibellese' : 'Predigtnotiz'}</div></section>`));
A4 = false;
writeFileSync(OUT + 'mappe.html', doc(cover()
  + reg('Inhaltsverzeichnis', [['Datum', 28], ['Bibelstelle', 0], ['Typ', 40], ['Blatt', 16]], 'Inhaltsverzeichnis · Typ: Bibellese oder Predigt', 2)
  + useA4() + '<section class="raw"></section>' + a4pages.join(''), `@page{size:210mm 297mm;margin:0}.raw,.page{break-after:page}`));

// ---- Tablet edition: same pages for a note app (pencil), paper tone, tabs as links, no empty page
function useTablet() {
  const u = (h, p) => `<div><h3>${h}</h3><p>${p}</p></div>`;
  return `<section class="raw toc"><div class="eyebrow">Henoch · Lesen und Hören</div><h1>Zum Gebrauch</h1>
  <div class="use">
   ${u('Seiten duplizieren', 'Öffne die Datei in deiner Notiz-App. Für jeden Tag am Wort duplizierst du die Seiten 4 und 5, für jede Predigt die Seiten 6 und 7. Jede Notiz bekommt unten eine Nummer; dieselbe Nummer trägst du ins Inhaltsverzeichnis ein.')}
   ${u('Springen', 'Die farbigen Laschen am rechten Rand führen zum Inhaltsverzeichnis, hierher, zur Bibellese und zur Predigtnotiz. In manchen Apps musst du dafür den Stift ablegen oder in den Lesemodus wechseln.')}
   ${u('Die erste Seite genügt', 'Bei der Bibellese ist die erste Seite für sich vollständig: Lesung, Hauptaussage, ein Vers, Gebet, Ausrichtung. Die zweite ist zum Vertiefen, wenn Zeit ist. Leere Zeilen sind kein Versäumnis.')}
   ${u('Erst das Wort, zuletzt der Vorsatz', 'Beide Vorlagen beginnen mit dem Text. Dann wird gebetet. Erst danach fragst du, was das Wort heute für dein Haus, die Gemeinde und deine Arbeit heißt.')}
   ${u('Gesetz und Evangelium', 'Was fordert Gott, und was schenkt Er in Christus? Die Fragen gelten dem Text, nicht dem Prediger und nicht deiner Leistung. Das Evangelium steht zuletzt, es hat das letzte Wort.')}
   ${u('Am Tisch im Haus', 'Frag zuerst, was deine Frau und die Kinder gehört haben. Dann gib einen Satz weiter und stell den Kindern eine Frage. Mehr braucht es nicht.')}
   ${u('Kein Rückstand', 'Ein Tag oder ein Sonntag ohne Notiz wird nicht nachgeholt. Du nimmst einfach die nächste Seite.')}
   ${u('Die Bibel bleibt auf Papier', 'Das Tablet ersetzt nur das Notizblatt. Gelesen und angestrichen wird in der gedruckten Bibel, mit Farbstiften. Schalte die Mitteilungen aus, solange du liest und hörst.')}
  </div>
  <div class="pfoot"><span>Henoch · Zum Gebrauch</span><span>3</span></div></section>`;
}
const NAV = [['inhalt', 'Inhalt', '#2e4057'], ['gebrauch', 'Gebrauch', '#636a76'], ['bibellese', 'Bibellese', '#a78100'], ['predigt', 'Predigtnotiz', '#4f7a17']];
const nav = (on) => `<nav class="nav">${NAV.map(([id, t, c]) => `<a href="#${id}" class="${id === on ? 'on' : ''}" style="background:${c}">${t}</a>`).join('')}</nav>`;
const wrap = (html, id, on) => `<div class="wrap"${id ? ` id="${id}"` : ''}>${html}${on ? nav(on) : ''}</div>`;
const strip = (h) => h.replace(/<div class="tab [^>]*>[^<]*<\/div>/, '').replace('Die Rückseite ist zum Vertiefen', 'Die nächste Seite ist zum Vertiefen');
const coverT = cover().replace('<span>Bibellese · Predigtnotiz</span>', '<span><a href="#bibellese">Bibellese</a> · <a href="#predigt">Predigtnotiz</a></span>').replace('Vorlagen zum Kopieren', 'Vorlagen für das Tablet');
const tabletCss = `@page{size:210mm 297mm;margin:0}
  :root{--hair:#cdc6b8;--line:#b9b2a3}
  .wrap{position:relative;width:210mm;height:297mm;overflow:hidden;break-after:page;background:#f6f4ef}
  .page,.raw{background:#f6f4ef}.box{background:#fff}.cover a{color:inherit;text-decoration:none}
  .toc{padding-right:30mm}.page.a4{padding-right:21mm}.page.a4 .foot{right:21mm}.toc .pfoot{right:30mm}
  .toc .use{gap:5mm 9mm}
  .nav{position:absolute;right:0;top:16mm;display:flex;flex-direction:column;align-items:flex-end;gap:2.5mm}
  .nav a{width:9mm;height:40mm;border-radius:3mm 0 0 3mm;writing-mode:vertical-rl;display:flex;align-items:center;justify-content:center;font:600 7.4pt var(--sans);letter-spacing:.16em;text-transform:uppercase;color:#fff;text-decoration:none;opacity:.55}
  .nav a.on{width:13mm;opacity:1}`;
writeFileSync(OUT + 'tablet.html', doc(
  wrap(coverT)
  + wrap(reg('Inhaltsverzeichnis', [['Datum', 28], ['Bibelstelle', 0], ['Typ', 40], ['Blatt', 16]], 'Inhaltsverzeichnis · Typ: Bibellese oder Predigt', 2), 'inhalt', 'inhalt')
  + wrap(useTablet(), 'gebrauch', 'gebrauch')
  + wrap(strip(a4pages[0]), 'bibellese', 'bibellese') + wrap(strip(a4pages[1]), '', 'bibellese')
  + wrap(strip(a4pages[2]), 'predigt', 'predigt') + wrap(strip(a4pages[3]), '', 'predigt'),
  tabletCss));

// ---- Year edition (tablet): 12 months x (index page + 31 Bibellese sheets + 4 Predigtnotiz sheets)
if (process.env.JAHR) {
  const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const PER = 71; // 1 index + 31x2 + 4x2
  const base = (m) => 4 + m * PER;
  const pgB = (m, d) => base(m) + 1 + 2 * (d - 1);
  const pgP = (m, k) => base(m) + 63 + 2 * (k - 1);
  const lnk = (id, t) => `<a href="#${id}">${t}</a>`;
  const jnav = (m, on) => {
    const tabs = m === null
      ? [['uebersicht', 'Übersicht', '#0a7fae', 'uebersicht'], ['gebrauch', 'Gebrauch', '#636a76', 'gebrauch']]
      : [[`m${m}`, 'Inhalt', '#2e4057', 'inhalt'], ['uebersicht', 'Übersicht', '#0a7fae', 'uebersicht'], ['gebrauch', 'Gebrauch', '#636a76', 'gebrauch'], [`m${m}b1`, 'Bibellese', '#a78100', 'bibellese'], [`m${m}p1`, 'Predigtnotiz', '#4f7a17', 'predigt']];
    return `<nav class="nav">${tabs.map(([id, t, c, k]) => `<a href="#${id}" class="${k === on ? 'on' : ''}" style="background:${c}">${t}</a>`).join('')}</nav>`;
  };
  const wrapJ = (html, id, navHtml) => `<div class="wrap"${id ? ` id="${id}"` : ''}>${html}${navHtml}</div>`;

  const coverJ = cover().replace('Vorlagen zum Kopieren', 'Ein Jahr · 12 Monate');
  const tocJ = `<section class="raw toc"><div class="eyebrow">Henoch · Lesen und Hören</div><h1>Übersicht</h1>
   <div class="jahr f"><span class="label">Jahr</span></div>
   <nav class="months">${MONTHS.map((n, m) => `<a href="#m${m}"><span>${n}</span></a>`).join('')}</nav>
   <div class="pfoot"><span>Henoch · Übersicht</span><span>2</span></div></section>`;
  const useJ = () => {
    const u = (h, t) => `<div><h3>${h}</h3><p>${t}</p></div>`;
    return `<section class="raw toc"><div class="eyebrow">Henoch · Lesen und Hören</div><h1>Zum Gebrauch</h1>
    <div class="use">
     ${u('Ein Blatt nach dem anderen', 'Jeder Monat hat 31 Blätter für die Bibellese und 4 für die Predigtnotizen. Nimm immer das nächste freie Blatt. Ein Datum ist nicht vorgedruckt; du schreibst es selbst.')}
     ${u('Inhaltsverzeichnis', 'Jeder Monat beginnt mit einem Inhaltsverzeichnis zum Ausfüllen. Trag dort Datum, Bibelstelle, Typ und Seite ein, dann findest du jedes Blatt wieder.')}
     ${u('Springen', 'Die Lasche „Übersicht“ führt zu den zwölf Monaten; ein Tipp auf einen Monat bringt dich hinein. „Inhalt“ führt zum Inhaltsverzeichnis des Monats, „Bibellese“ und „Predigtnotiz“ zu seinem ersten Blatt. In manchen Apps musst du dafür den Stift ablegen oder in den Lesemodus wechseln.')}
     ${u('Die erste Seite genügt', 'Bei der Bibellese ist die erste Seite für sich vollständig: Lesung, Hauptaussage, ein Vers, Gebet, Ausrichtung. Die zweite ist zum Vertiefen, wenn Zeit ist. Leere Zeilen sind kein Versäumnis.')}
     ${u('Erst das Wort, zuletzt der Vorsatz', 'Beide Vorlagen beginnen mit dem Text. Dann wird gebetet. Erst danach fragst du, was das Wort heute für dein Haus, die Gemeinde und deine Arbeit heißt.')}
     ${u('Gesetz und Evangelium', 'Was fordert Gott, und was schenkt Er in Christus? Die Fragen gelten dem Text, nicht dem Prediger und nicht deiner Leistung. Das Evangelium steht zuletzt, es hat das letzte Wort.')}
     ${u('Am Tisch im Haus', 'Frag zuerst, was deine Frau und die Kinder gehört haben. Dann gib einen Satz weiter und stell den Kindern eine Frage. Mehr braucht es nicht.')}
     ${u('Kein Rückstand', 'Ein Blatt, das leer bleibt, ist kein Versäumnis. Du nimmst einfach das nächste. Gelesen und angestrichen wird in der gedruckten Bibel, mit Farbstiften; das Tablet ersetzt nur das Notizblatt.')}
    </div>
    <div class="pfoot"><span>Henoch · Zum Gebrauch</span><span>3</span></div></section>`;
  };
  const idxJ = (m) => {
    const rows = '<tr><td></td><td></td><td></td><td></td></tr>'.repeat(36);
    return `<section class="raw toc idx"><div class="eyebrow">Henoch · Inhaltsverzeichnis</div><h1>${MONTHS[m]}</h1>
     <table class="fill idx"><thead><tr><th style="width:26mm">Datum</th><th>Bibelstelle</th><th style="width:30mm">Typ</th><th style="width:16mm;text-align:right">Seite</th></tr></thead><tbody>${rows}</tbody></table>
     <div class="pfoot"><span>Henoch · ${MONTHS[m]} · Inhaltsverzeichnis</span><span>${base(m)}</span></div></section>`;
  };
  // the four sheet pages without their edge tab; headings turned into divs so the PDF outline stays short
  const T = a4pages.map((h) => strip(h).replace(/<h2 class="sec">([\s\S]*?)<\/h2>/g, '<div class="sec">$1</div>'));
  const sheetPage = (m, idx, label) => {
    const mo = MONTHS[m];
    const left = [`Henoch · ${mo}`, `Henoch · ${mo} · Vertiefen`, `Henoch · ${mo}`, `Henoch · ${mo} · Mitnehmen`][idx];
    return T[idx].replace(/<div class="foot">[\s\S]*?<\/div>/, () => `<div class="foot"><span>${left}</span><span>${label}</span></div>`);
  };
  const parts = [wrapJ(coverJ, '', ''), wrapJ(tocJ, 'uebersicht', jnav(null, 'uebersicht')), wrapJ(useJ(), 'gebrauch', jnav(null, 'gebrauch'))];
  for (let m = 0; m < 12; m++) {
    parts.push(wrapJ(idxJ(m), `m${m}`, jnav(m, 'inhalt')));
    for (let d = 1; d <= 31; d++) {
      parts.push(wrapJ(sheetPage(m, 0, 'Bibellese ' + d), `m${m}b${d}`, jnav(m, 'bibellese')));
      parts.push(wrapJ(sheetPage(m, 1, 'Bibellese ' + d), '', jnav(m, 'bibellese')));
    }
    for (let k = 1; k <= 4; k++) {
      parts.push(wrapJ(sheetPage(m, 2, 'Predigt ' + k), `m${m}p${k}`, jnav(m, 'predigt')));
      parts.push(wrapJ(sheetPage(m, 3, 'Predigt ' + k), '', jnav(m, 'predigt')));
    }
  }
  if (parts.length !== 3 + 12 * PER) throw new Error('year page count ' + parts.length);
  writeFileSync(OUT + 'jahr.html', doc(parts.join(''), tabletCss + `
  div.sec{display:flex;align-items:baseline;gap:3mm;margin:0 0 1mm;font:600 10pt var(--serif)}div.sec .label{font-weight:600}
  .jahr{position:absolute;right:30mm;top:27mm;width:44mm}
  table.fill a{color:var(--ink);text-decoration:none;font:600 7.4pt var(--sans)}
  .months{display:grid;grid-template-columns:1fr 1fr;column-gap:10mm;margin-top:4mm;border-top:.3mm solid var(--line)}
  .months a{display:flex;align-items:center;height:30mm;border-bottom:.3mm solid var(--line);text-decoration:none;color:var(--ink);font:600 19pt var(--serif)}
  .toc.idx{padding-top:16mm;padding-bottom:16mm}
  .toc.idx h1{font:600 22pt/1.1 var(--serif);margin:2mm 0 5mm}
  table.idx td{height:6.35mm}
  table.idx th:last-child{padding-right:1.2mm}
  table.idx td.n{font:600 7.4pt var(--sans);color:var(--muted)}
`));
}

// ---- GoodNotes: single-page templates plus a small start notebook
const GN = [];
if (process.env.GN) {
  mkdirSync(OUT + 'goodnotes', { recursive: true });
  const gnCss = tabletCss + `
  .page.a4{padding-right:17mm}.page.a4 .foot{right:17mm}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:6mm}
  .fields .f.text:not(.wide){height:9.5mm}
  table.q3 th{text-align:center}
  .fields.frei{grid-template-columns:2fr 1fr}
  .page.a4.frei{padding-left:7mm;padding-right:7mm}.page.a4.frei .foot{left:7mm;right:7mm}
  .box.k-wort{border-top:1mm solid #d9ae00}.box.k-wort>.label{color:var(--gold)}
  .box.k-haus{border-top:1mm solid #4f7a17}.box.k-gem{border-top:1mm solid #0a7fae}.box.k-werk{border-top:1mm solid #2e4057}.box.k-ich{border-top:1mm solid #b9b2a3}
  .days{display:flex;flex-direction:column}.days .day{height:9mm}.day{height:var(--lh);border-bottom:.25mm solid var(--hair);display:flex;align-items:flex-end;padding-bottom:.8mm}
  .day b{font:600 7pt var(--sans);color:var(--muted);letter-spacing:.06em}.day:first-child b{color:var(--gold)}
  table.q3{table-layout:fixed}table.q3 td{height:13mm}table.q3 td:first-child{vertical-align:top}
  .page.a4q{width:258.3mm;height:182.6mm;zoom:1.15;padding:8mm 10mm 11mm;position:relative;display:flex;flex-direction:column;background:#f6f4ef}
  .page.a4q .foot{left:10mm;right:10mm;bottom:3.5mm;display:flex;justify-content:space-between}
  .qgrid{flex:1;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:auto auto 1fr auto 1fr auto 1fr;gap:2.2mm 3mm}
  .qgrid .kopf .head{margin-bottom:1mm}.qgrid .kopf .fields{grid-template-columns:1fr 1fr;column-gap:3mm}.qgrid .kopf .f{height:8mm}
  .qgrid .step{margin-top:.5mm}
  .step{display:flex;align-items:baseline;gap:2.4mm;border-bottom:.35mm solid var(--line);padding-bottom:1.1mm}
  .step b{font:600 12pt var(--serif);color:var(--rubric)}.step span{font:600 10pt var(--serif)}
  .step small{margin-left:auto;font:400 6.8pt var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
  .one.arr{gap:2mm}.one.arr b{font:600 9pt var(--serif);color:var(--rubric)}
  .zeit{display:grid;grid-template-columns:repeat(13,1fr);height:10mm;border:.3mm solid var(--line);border-radius:2mm;background:#fff;overflow:hidden}
  .zeit div{border-left:.25mm solid var(--hair);padding:.6mm 1mm}.zeit div:first-child{border-left:0}.zeit b{font:600 6pt var(--sans);color:var(--muted)}
  .qgrid .box{padding-bottom:1mm;min-width:0}.qgrid .kopf{display:flex;flex-direction:column;gap:1mm}
  .qgrid .verse{font-size:7.6pt}
  .dotbox{border:.3mm solid var(--line);border-radius:2.5mm;overflow:hidden;background:#fff}
  .dotbox.fill{flex:1}.dotbox svg{display:block}
  .ruled.wide{--lh:10mm}.ruled.wide::before{content:'';position:absolute;top:0;bottom:0;right:22mm;border-left:.4mm solid var(--rubric)}
  .ruled.wide .mlabel{right:0;left:auto}.toc{padding-right:24mm}.toc .pfoot{right:24mm}`;
  const one2 = (t) => `<div class="one"><span>${t}</span></div>`;
  const one = (name, html) => { writeFileSync(OUT + `gn-${name}.html`, doc(`<div class="wrap">${html}</div>`, gnCss)); GN.push([`gn-${name}.html`, `goodnotes/Henoch_${name}.pdf`]); };
  const ft = (l, r) => `<div class="foot"><span>${l}</span><span>${r}</span></div>`;
  const seite = 'Seite<i class="seite"></i>';
  const T = a4pages.map(strip);
  const sheet = (i, l, r) => T[i].replace(/<div class="foot">[\s\S]*?<\/div>/, () => ft(l, r))
    .replace('Diese Seite genügt. Die nächste Seite ist zum Vertiefen, wenn Zeit ist.', 'Diese Seite genügt. Wenn Zeit ist, nimm dazu die Vorlage „Vertiefen“.');
  const coverGN = cover().replace('Vorlagen zum Kopieren', 'Tagebuch');
  const tocGN = reg('Inhaltsverzeichnis', [['Datum', 28], ['Bibelstelle', 0], ['Typ', 40], ['Seite', 16]], 'Inhaltsverzeichnis · Typ: Bibellese oder Predigt', '');
  const u = (h, t) => `<div><h3>${h}</h3><p>${t}</p></div>`;
  const useGN = `<section class="raw toc"><div class="eyebrow">Henoch · Lesen und Hören</div><h1>Zum Gebrauch</h1>
  <div class="use">
   ${u('Einmal einrichten', 'Importiere die fünf Vorlagen in GoodNotes als eigene Papiervorlagen: Bibellese, Vertiefen, Predigtnotiz, Mitnehmen und Inhaltsverzeichnis. Dieses Notizbuch ist dein Tagebuch; es wächst Seite um Seite.')}
   ${u('Jeden Tag', 'Füge am Ende eine neue Seite mit der Vorlage „Bibellese“ ein. Am Sonntag nimmst du „Predigtnotiz“ und dazu „Mitnehmen“. Ist Zeit, legst du hinter die Bibellese noch „Vertiefen“.')}
   ${u('Inhaltsverzeichnis', 'Trag Datum, Bibelstelle, Typ und die Seitenzahl aus GoodNotes ein. Ist die Seite voll, füge eine weitere mit der Vorlage „Inhaltsverzeichnis“ dahinter ein.')}
   ${u('Die erste Seite genügt', 'Die Bibellese ist für sich vollständig: Lesung, Hauptaussage, ein Vers, Gebet, Ausrichtung. „Vertiefen“ ist für Tage mit mehr Zeit. Leere Zeilen sind kein Versäumnis.')}
   ${u('Erst das Wort, zuletzt der Vorsatz', 'Beide Vorlagen beginnen mit dem Text. Dann wird gebetet. Erst danach fragst du, was das Wort heute für dein Haus, die Gemeinde und deine Arbeit heißt.')}
   ${u('Gesetz und Evangelium', 'Was fordert Gott, und was schenkt Er in Christus? Die Fragen gelten dem Text, nicht dem Prediger und nicht deiner Leistung. Das Evangelium steht zuletzt, es hat das letzte Wort.')}
   ${u('Am Tisch im Haus', 'Frag zuerst, was deine Frau und die Kinder gehört haben. Dann gib einen Satz weiter und stell den Kindern eine Frage. Mehr braucht es nicht.')}
   ${u('Kein Rückstand', 'Ein Tag ohne Seite wird nicht nachgeholt. Gelesen und angestrichen wird in der gedruckten Bibel, mit Farbstiften; das Tablet ersetzt nur das Notizblatt.')}
  </div>
  <div class="pfoot"><span>Henoch · Zum Gebrauch</span><span></span></div></section>`;
  writeFileSync(OUT + 'gn-start.html', doc([coverGN, useGN, tocGN].map((h) => `<div class="wrap">${h}</div>`).join(''), gnCss));
  GN.push(['gn-start.html', 'goodnotes/Henoch_Tagebuch_Start.pdf']);
  one('Bibellese', sheet(0, 'Henoch · Bibellese', seite));
  one('Bibellese_Vertiefen', sheet(1, 'Henoch · Bibellese · Vertiefen', seite));
  one('Predigtnotiz', sheet(2, 'Henoch · Predigtnotiz', seite));
  one('Predigtnotiz_Mitnehmen', sheet(3, 'Henoch · Predigtnotiz · Mitnehmen', seite));
  one('Inhaltsverzeichnis', tocGN);
  one('Deckblatt', coverGN);

  // ---- intensive study: start pages per kind, shared pages, closing page
  const W = 148.6; // writing width in mm inside .page.a4 (before zoom)
  const dots = (h, w = W) => {
    let c = '';
    for (let y = 2.5; y < h; y += 5) for (let x = 2.3; x < w; x += 5) c += `<circle cx="${x.toFixed(1)}" cy="${y}" r=".32"/>`;
    return `<svg class="dots" viewBox="0 0 ${w} ${h}" style="width:${w}mm;height:${h}mm" fill="#b3ab9b">${c}</svg>`;
  };
  const dotBox = (h) => `<div class="dotbox" style="height:${h}mm">${dots(h)}</div>`;
  const dotFill = () => `<div class="dotbox fill">${dots(240)}</div>`;
  const two = (a, b) => `<div class="two">${a}${b}</div>`;
  const blk = (label, n, q = '') => `<div class="block"><span class="label">${label}</span>${q ? `<span class="q">${q}</span>` : ''}${lines(n)}</div>`;
  const margin = (label, n) => `<div class="ruled m" style="flex:none"><span class="mlabel">${label}</span>${ln(n)}</div>`;
  const sfoot = (t) => `<div class="foot"><span>Henoch · Studie · ${t}</span><span>${seite}</span></div>`;
  const spage = (title, sub, body, t) => `<section class="page l a4">${head(title, sub)}${body}${sfoot(t)}</section>`;
  const fieldsS = (main, a, b, c, d) => `<div class="fields"><div class="f text wide"><span class="label">${main}</span></div>
    <div class="f"><span class="label">${a}</span></div><div class="f"><span class="label">${b}</span></div>
    ${c ? `<div class="f"><span class="label">${c}</span></div><div class="f"><span class="label">${d}</span></div>` : ''}</div>`;
  const rub = (t) => `<p class="rubric" style="margin:3mm 0 3mm">${t}</p>`;

  one('Studie_Wort', spage('Wortstudie', 'Intensives Bibelstudium', fieldsS('Wort', 'Grundtext (hebräisch / griechisch)', 'Umschrift', 'Nummer in der Konkordanz', 'Datum')
    + rub('Erst die Stellen selbst lesen, dann Konkordanz und Lexikon. Der Zusammenhang entscheidet, was ein Wort bedeutet, nicht seine Herkunft.')
    + `<div class="stack">${blk('Grundbedeutung', 3)}
      ${two(blk('Wiedergaben in der Lutherbibel', 2), blk('Wie oft, wo gehäuft?', 2))}
      ${two(blk('Erstes Vorkommen', 2), blk('In meinem Abschnitt', 2))}
      <div class="block"><span class="label">Schlüsselstellen · was das Wort dort bedeutet</span>${margin('Stelle', 6)}</div>
      ${two(blk('Verwandte Wörter', 2), blk('Gegenteil', 2))}
      ${blk('Zusammenfassung', 2, 'Was sagt die Schrift mit diesem Wort?')}</div>`, 'Wort'));

  one('Studie_Person', spage('Person', 'Intensives Bibelstudium', fieldsS('Name', 'Bedeutung des Namens', 'Zeit', 'Hauptstellen', 'Datum')
    + `<div class="stack" style="margin-top:3.4mm"><div class="block"><span class="label">Herkunft und Familie · Stammbaum</span>${dotBox(38)}</div>
      <div class="block"><span class="label">Stationen des Lebens</span>${margin('Stelle', 7)}</div>
      ${two(blk('Wie handelt Gott an dieser Person?', 3), blk('Wie antwortet sie Gott?', 3, 'Glaube, Gehorsam, Versagen'))}
      ${blk('Wo weist ihr Leben auf Christus?', 2)}
      ${two(blk('Was sagt das Neue Testament über sie?', 2), blk('Zusammenfassung', 2))}</div>`, 'Person'));

  one('Studie_Ort', spage('Ort', 'Intensives Bibelstudium', fieldsS('Ort', 'Bedeutung des Namens', 'Lage und Landschaft', 'Hauptstellen', 'Datum')
    + `<div class="stack" style="margin-top:3.4mm"><div class="block"><span class="label">Kartenskizze</span>${dotBox(62)}</div>
      <div class="block"><span class="label">Was hier geschah</span>${margin('Stelle', 7)}</div>
      ${blk('Bedeutung in der Heilsgeschichte', 3, 'Schöpfung, Fall, Erlösung, Vollendung: Wo steht dieser Ort?')}
      ${blk('Zusammenfassung', 2)}</div>`, 'Ort'));

  one('Studie_Abschnitt', spage('Abschnitt', 'Intensives Bibelstudium', fieldsS('Abschnitt', 'Buch · Verfasser', 'Empfänger · Anlass', 'Datum', 'Leitfrage')
    + rub('Gebet vorher. Den Abschnitt mehrmals lesen, auf der Vorlage „Abschrift“ von Hand abschreiben und mit den Farbstiften markieren.')
    + `<div class="stack">${legend}
      ${two(blk('Was steht davor?', 1), blk('Was folgt danach?', 1))}
      <div class="block"><span class="label">Gliederung</span>${margin('Verse', 5)}</div>
      ${blk('Schlüsselwörter', 1)}
      ${blk('Beobachtungen', 2, 'Wer? Was? Wann? Wo? Warum? Wie?')}
      ${two(blk('<b style="color:var(--rubric)">?</b>&ensp;Fragen an den Text', 2), blk('Querverweise', 2))}
      ${blk('Hauptaussage in einem Satz', 2)}</div>`, 'Abschnitt'));

  one('Studie_Abschrift', spage('Abschrift', 'Von Hand abschreiben und markieren', `<div class="fields"><div class="f text"><span class="label">Stelle</span></div><div class="f"><span class="label">Datum</span></div></div>
    ${rub('Wort für Wort abschreiben. Der weite Zeilenabstand lässt Platz für Farben, Kreise und Pfeile; die Randspalte ist für ? ! →.')}
    <div class="ruled wide"><span class="mlabel">Rand</span>${'<div class="ln"></div>'.repeat(24)}</div>`, 'Abschrift'));

  const srows = '<tr><td></td><td></td><td></td></tr>'.repeat(24);
  one('Studie_Stellen', spage('Stellen', 'Konkordanz und Querverweise', `<div class="fields" style="margin-bottom:4mm"><div class="f text wide"><span class="label">Thema</span></div></div>
    <table class="fill"><thead><tr><th style="width:28mm">Stelle</th><th>Was steht da</th><th style="width:34mm">Querverweis</th></tr></thead><tbody>${srows}</tbody></table>`, 'Stellen'));

  one('Studie_Notizen', spage('Notizen', 'Intensives Bibelstudium', `<div class="fields" style="margin-bottom:3mm"><div class="f text wide"><span class="label">Thema</span></div></div>
    <div class="ruled m"><span class="mlabel">Stellen</span>${ln(34)}</div>`, 'Notizen'));

  one('Studie_Skizze', spage('Skizze', 'Karte, Zeitleiste, Stammbaum, Gliederung', `<div class="fields" style="margin-bottom:3mm"><div class="f text wide"><span class="label">Thema</span></div></div>${dotFill()}`, 'Skizze'));

  one('Studie_Ertrag', spage('Ertrag', 'Was die Studie gibt', `<div class="fields"><div class="f text"><span class="label">Thema</span></div><div class="f"><span class="label">Datum</span></div></div>
    <div class="stack" style="margin-top:3.4mm">
      ${two(blk('Was lerne ich über Gott?', 3), blk('Was lerne ich über den Menschen?', 3))}
      ${blk('Wo weist es auf Christus?', 2)}
      ${two(`<div class="box law"><span class="label">Gesetz</span><span class="q">Was fordert Gott?</span>${lines(3)}</div>`, `<div class="box gospel"><span class="label" style="color:var(--gold)">Evangelium</span><span class="q">Was schenkt Gott in Christus?</span>${lines(3)}</div>`)}
      ${blk('<b style="color:var(--rubric)">?</b>&ensp;Was bleibt offen', 2)}
      <div class="box gospel" style="padding-bottom:1mm"><span class="label" style="color:var(--gold)">Gebet über dem Wort</span><span class="q">Was Gott mir hier sagt, wofür ich danke, worum ich bitte.</span>${lines(3)}</div>
      <div class="block"><span class="label">Ausrichtung</span><span class="rubric">Zuletzt, nach dem Gebet: Was heißt das für mich?</span>
       ${one2('Haus · Frau und Kinder')}${one2('Gemeinde')}${one2('Werk · Arbeit')}${one2('Wem gebe ich es weiter?')}</div>
    </div>`, 'Ertrag'));

  const STUDY = ['Studie_Abschnitt', 'Studie_Wort', 'Studie_Person', 'Studie_Ort', 'Studie_Abschrift', 'Studie_Stellen', 'Studie_Notizen', 'Studie_Skizze', 'Studie_Ertrag'];
  writeFileSync(OUT + 'gn-studie-alle.html', doc(STUDY.map((n) => readFileSync(OUT + `gn-${n}.html`, 'utf8').match(/<body>([\s\S]*)<\/body>/)[1]).join(''), gnCss));
  GN.push(['gn-studie-alle.html', 'goodnotes/Henoch_Studie_alle_Vorlagen.pdf']);

  // ---- reflection pages (week, quarter, year): Wort -> Rückschau -> Prüfung -> Zuspruch -> Gebet -> Ausrichtung
  const rpage = (title, sub, body, t) => `<section class="page l a4">${head(title, sub)}${body}<div class="foot"><span>Henoch · Reflexion · ${t}</span><span>${seite}</span></div></section>`;
  const card = (k, label, n, q = '', extra = '') => `<div class="box k-${k}"><span class="label">${label}</span>${q ? `<span class="q">${q}</span>` : ''}${extra}${n ? lines(n) : ''}</div>`;
  const VERSE19 = '<p class="verse">So wir aber unsre Sünden bekennen, so ist er treu und gerecht, daß er uns die Sünden vergibt und reinigt uns von aller Untugend. <small>1. Johannes 1, 9</small></p>';
  const pruefung = `<div class="box law" style="padding-bottom:2mm"><span class="label">Prüfung am Wort</span><span class="rubric">Im Stillen, an den Zehn Geboten. Wird gebetet, nicht notiert.</span>${VERSE19}</div>`;
  const ZUSPRUCH = '<span class="rubric">Er, der das gute Werk in dir angefangen hat, wird es auch vollenden (Philipper 1, 6).</span>';
  const ausrichtung = (title, items, grid = false) => `<div class="block"><span class="label">${title}</span><span class="rubric">Zuletzt, nach dem Gebet:</span>${grid ? `<div class="two" style="gap:0 6mm">${items.map(one2).join('')}</div>` : items.map(one2).join('')}</div>`;
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map((d) => `<div class="day"><b>${d}</b></div>`).join('');
  const fld = (...l) => `<div class="fields">${l.map((t) => `<div class="f"><span class="label">${t}</span></div>`).join('')}</div>`;
  const rub2 = (t) => `<p class="rubric" style="margin:2.6mm 0 2.6mm">${t}</p>`;

  // three steps as on weekview: Bestandsaufnahme -> Reflexion -> Entwicklung, after the Word and with prayer before the steps forward
  const step = (n, t, sub) => `<div class="step"><b>${n}</b><span>${t}</span><small>${sub}</small></div>`;
  const S1 = step(1, 'Bestandsaufnahme', 'Was war?');
  const S2 = step(2, 'Reflexion', 'Was erkenne ich im Licht des Wortes?');
  const S3 = step(3, 'Entwicklung', 'Wohin richte ich mich aus?');
  const arr = (t = '') => `<div class="one arr"><b>→</b><span>${t}</span></div>`;
  const arrs = (n) => arr().repeat(n);
  const tage = `<div class="block"><span class="label">Die Tage</span><span class="q">Gelesen, gehört, erlebt. Ein leerer Tag bleibt leer.</span><div class="days">${days}</div></div>`;
  const G = 'gap:2.6mm';

  one('Reflexion_Woche_1', rpage('Wochenrückblick', 'Reflexion · Woche', fld('Woche', 'Vom · bis')
    + `<div class="stack" style="margin-top:3mm;${G}">${card('wort', 'Das Wort dieser Woche', 2, 'Predigttext, Wochenspruch oder der Vers, der mich begleitet hat')}
      ${S1}
      ${two(tage, `<div class="stack" style="${G}">${blk('Wofür ich danke', 3)}${blk('Was schwer war', 2, 'Wirf es auf Ihn (1. Petrus 5, 7).')}</div>`)}
      ${two(card('haus', 'Meine Frau', 2, 'Was hat sie mir gesagt, das ich hören sollte?'), card('haus', 'Meine Kinder', 2, 'Was habe ich ihnen weitergegeben?'))}
      ${two(card('gem', 'Gemeinde · Brüder', 2, 'Mit wem habe ich über das Wort gesprochen?'), card('werk', 'Arbeit', 2, 'Wo durfte ich Gott und dem Nächsten dienen?'))}
      ${two(blk('Was ich behalten will', 2, 'Ein Satz, eine Begegnung, ein Zitat'), blk('Fazit', 2, 'Ein Satz über diese Woche'))}</div>`, 'Woche'));

  one('Reflexion_Woche_2', rpage('Reflexion und Entwicklung', 'Reflexion · Woche',
    `<div class="stack" style="${G}">${S2}
      ${two(blk('Was ich über Gott erkannt habe', 2), blk('Was ich über mich erkannt habe', 2))}
      ${blk('Rückschau · was ist geschehen?', 2, 'Die Vorsätze der Woche ansehen, ohne zu urteilen.')}
      ${pruefung}
      ${blk('Was ich Gott hinlege', 2, 'Was offen ist und nicht gelöst')}
      ${S3}
      ${blk('Was die neue Woche bringt', 2, 'Termine, Menschen, Lasten')}
      ${card('wort', 'Gebet für die neue Woche', 2, 'Fürbitte mit Namen: meine Frau, meine Kinder, Brüder, Kollegen')}
      <div class="block"><span class="label">Schritte</span><span class="rubric">Zuletzt, nach dem Gebet: Beschluss, Kurskorrektur, ein nächster Schritt.</span>${arr('Haus · Frau und Kinder')}${arr('Gemeinde')}${arr('Werk · Arbeit')}${arr('Ein Wort, das mich begleitet')}</div></div>`, 'Woche'));

  const qrows = [1, 2, 3].map(() => '<tr><td></td><td></td><td></td><td></td><td></td></tr>').join('');
  const zeit = `<div class="block"><span class="label">Zeitstrahl · die dreizehn Wochen</span><div class="zeit">${Array.from({ length: 13 }, (_, k) => `<div><b>${k + 1}</b></div>`).join('')}</div></div>`;
  one('Reflexion_Quartal', rpage('Quartal', 'Reflexion', `<div class="fields"><div class="f"><span class="label">Quartal</span></div><div class="f"><span class="label">Jahr</span></div><div class="f text wide"><span class="label">Das Wort, das mich getragen hat</span></div></div>
    <div class="stack" style="margin-top:3mm;${G}">${S1}
      <table class="fill q3"><thead><tr><th style="width:17mm">Monat</th><th>Im Wort</th><th>Im Haus</th><th>Gemeinde · Arbeit</th><th>Gottes Führung</th></tr></thead><tbody>${qrows}</tbody></table>
      ${zeit}
      ${S2}
      ${two(blk('Was hat geholfen, bei Gott zu bleiben?', 2, 'Wort, Abendmahl, Gebet, Brüder'), blk('Was hat mich abgehalten?', 2, 'Ansehen, nicht anklagen'))}
      ${blk('Wo Gott mich verändert hat', 2, 'Woran sehe ich Christus in mir Gestalt gewinnen (Galater 4, 19)? Wo ringe ich noch?')}
      <div style="margin-top:-1.5mm">${ZUSPRUCH}</div>
      ${S3}
      ${one2('Gebet · Fürbitte mit Namen')}
      <span class="rubric">Zuletzt, nach dem Gebet:</span>
      <div class="two" style="gap:0 6mm">${arr('Haus · Frau und Kinder')}${arr('Gemeinde')}${arr('Werk · Arbeit')}${arr('Leib und Seele · Ruhe, Lernen')}</div></div>`, 'Quartal'));

  one('Reflexion_Jahr_Rueckblick', rpage('Jahresrückblick', 'Reflexion', fld('Jahr', 'Datum')
    + `<div class="stack" style="margin-top:3mm;${G}">${card('wort', 'Das Wort des Jahres', 2, 'Ein Vers, eine Predigt, ein Buch der Bibel, das mich getragen hat')}
      ${S1}
      <div class="block"><span class="label">Wofür ich danke</span>${dotBox(26)}</div>
      ${two(card('haus', 'Im Haus', 2, 'Meine Frau, meine Kinder: was wir erlebt haben'), card('gem', 'Gemeinde · Arbeit', 2, 'Wem ich gedient habe, wer mir gedient hat'))}
      ${blk('Was ich behalten will', 2, 'Gebetserhörungen, Begegnungen, ein Satz')}
      ${S2}
      ${two(blk('Was hat geholfen, bei Gott zu bleiben?', 2), blk('Was hat mich abgehalten?', 2))}
      ${blk('Wo Gott mich verändert hat', 2, 'Woran sehe ich Christus in mir wachsen? Wo ringe ich noch?')}
      <div style="margin-top:-1.5mm">${ZUSPRUCH}</div></div>`, 'Jahr'));

  one('Reflexion_Jahr_Ausblick', rpage('Jahresausblick', 'Reflexion', fld('Jahr', 'Datum')
    + `<div class="stack" style="margin-top:3mm;${G}">${card('wort', 'Ein Wort für das neue Jahr', 2, 'Die Jahreslosung oder ein Vers, mit dem ich ins Jahr gehe')}
      ${S3}
      ${blk('Was das Jahr bringt', 2, 'Termine, Veränderungen, Lasten')}
      ${card('wort', 'Gebet für das Jahr', 2, 'Für meine Frau, für jedes Kind mit Namen, für Gemeinde und Arbeit')}
      <p class="rubric" style="margin:0">Zuletzt, nach dem Gebet: Beschlüsse und nächste Schritte.</p>
      ${two(card('haus', 'Als Ehemann', 0, '', arrs(3)), card('haus', 'Als Vater', 0, '', arrs(3)))}
      ${two(card('gem', 'Gemeinde', 0, '', arrs(3)), card('werk', 'Arbeit', 0, '', arrs(3)))}
      ${card('ich', 'Leib und Seele', 0, 'Sonntagsruhe, Schlaf, Lernen', arrs(2))}</div>`, 'Jahr'));

  // compact week, landscape: one row per step
  const span = (n, html) => `<div style="grid-column:span ${n};display:grid">${html}</div>`;
  const srow = (h) => `<div style="grid-column:1/-1">${h}</div>`;
  const kopf = `<div class="kopf">${head('Woche', 'Reflexion kompakt')}${fld('Woche', 'Vom · bis')}</div>`;
  const kompakt = `<section class="page a4q"><div class="qgrid">
    ${kopf}${span(3, card('wort', 'Das Wort dieser Woche', 1, 'Predigttext, Wochenspruch oder der Vers, der mich begleitet hat'))}
    ${srow(S1)}
    ${card('ich', 'Wofür ich danke', 3)}${card('ich', 'Was schwer war', 2, 'Wirf es auf Ihn (1. Petrus 5, 7).')}${card('haus', 'Frau und Kinder', 2, 'Was habe ich gehört, was weitergegeben?')}${card('gem', 'Gemeinde · Arbeit', 3)}
    ${srow(S2)}
    ${card('ich', 'Was ich erkannt habe', 3, 'Über Gott, über mich')}${card('ich', 'Rückschau', 2, 'Was ist geschehen? Ansehen, nicht urteilen.')}${pruefung}${card('ich', 'Was ich Gott hinlege', 3)}
    ${srow(S3)}
    ${card('ich', 'Was die Woche bringt', 3, 'Termine, Menschen, Lasten')}${card('wort', 'Gebet', 3, 'Fürbitte mit Namen')}
    ${span(2, `<div class="box k-wort"><span class="label">Schritte</span><span class="rubric">Zuletzt, nach dem Gebet:</span><div class="two" style="gap:0 5mm">${arr('Haus')}${arr('Gemeinde')}${arr('Werk')}${arr('Ein Wort für die Woche')}</div></div>`)}
  </div><div class="foot"><span>Henoch · Reflexion · Woche kompakt</span><span>${seite}</span></div></section>`;
  writeFileSync(OUT + 'gn-Reflexion_Woche_kompakt_quer.html', doc(`<div class="wrap">${kompakt}</div>`, gnCss + '@page{size:297mm 210mm}.wrap{width:297mm;height:210mm}'));
  GN.push(['gn-Reflexion_Woche_kompakt_quer.html', 'goodnotes/Henoch_Reflexion_Woche_kompakt_quer.pdf', '297mm', '210mm']);


  // ---- month covers: one per month, with a verse (Luther 1912, checked against xmlbible-lut1912)
  const MV = JSON.parse(readFileSync(OUT + 'monatsverse.json', 'utf8'));
  const monthArt = () => {
    const arcs = [31, 45, 59, 73, 87].map((r, k) => `<path d="M${105 - r} 118 A${r} ${r} 0 0 1 ${105 + r} 118" fill="none" stroke="#c9c3b6" stroke-width="${0.9 - k * 0.12}" opacity="${1 - k * 0.16}"/>`).join('');
    const strata = [[123.5, 0.9], [131, 0.75], [142, 0.6], [158, 0.45], [180, 0.3]].map(([y, o]) => `<line x1="0" x2="210" y1="${y}" y2="${y}" stroke="#c9c3b6" stroke-width=".55" opacity="${o}"/>`).join('');
    return `<svg class="mart" viewBox="0 16 210 172" preserveAspectRatio="none"><defs>
      <linearGradient id="mway" gradientUnits="userSpaceOnUse" x1="0" y1="118" x2="0" y2="200"><stop offset="0" stop-color="#e9e5dc"/><stop offset="1" stop-color="#e9e5dc" stop-opacity="0"/></linearGradient>
      <linearGradient id="medge" gradientUnits="userSpaceOnUse" x1="0" y1="118" x2="0" y2="198"><stop offset="0" stop-color="#1d2330"/><stop offset=".6" stop-color="#1d2330" stop-opacity=".75"/><stop offset="1" stop-color="#1d2330" stop-opacity="0"/></linearGradient></defs>
      ${arcs}<path d="M88 118 A17 17 0 0 1 122 118 Z" fill="#c9a000"/>${strata}
      <path d="M105 118 C104 138 90 162 36 200 L152 200 C124 156 107 136 105 118 Z" fill="url(#mway)"/>
      <path d="M105 118 C104 138 90 162 36 200" fill="none" stroke="url(#medge)" stroke-width="1.1" stroke-linecap="round"/>
      <path d="M105 118 C107 136 124 156 152 200" fill="none" stroke="url(#medge)" stroke-width="1.1" stroke-linecap="round"/>
      <line x1="0" x2="210" y1="118" y2="118" stroke="#1d2330" stroke-width="1.1"/></svg>`;
  };
  const monthCover = (k) => {
    const [name, ref, text] = MV[k];
    return `<section class="raw cover month">${monthArt()}
      <div class="eyebrow">Henoch</div><div class="no">Monat ${String(k + 1).padStart(2, '0')}</div>
      <div class="mt"><h1>${name}</h1><div class="rule"></div>
        <p class="mverse">${text}</p><div class="mref">${ref}</div></div>
      <div class="base">${logo('')}<b>Henoch</b><span>Mit Gott durch den Tag</span><span class="sp">Jahr<i class="seite" style="width:22mm"></i></span></div></section>`;
  };
  const monthCss = `
  .cover.month svg.mart{position:absolute;left:0;top:0;width:210mm;height:172mm}
  .cover.month .mt{position:absolute;left:24mm;right:24mm;top:166mm}
  .cover.month h1{font:600 40pt/1.05 var(--serif);margin:0;letter-spacing:-.01em}
  .cover.month .rule{margin:5mm 0 6mm}
  .mverse{font:italic 400 13.5pt/1.55 var(--serif);margin:0;max-width:150mm;text-wrap:pretty}
  .mref{margin-top:4mm;font:600 8.5pt var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}`;
  MV.forEach((_, k) => {
    const f = `Monat_${String(k + 1).padStart(2, '0')}_${MV[k][0].replace('ä', 'ae')}`;
    writeFileSync(OUT + `gn-${f}.html`, doc(`<div class="wrap">${monthCover(k)}</div>`, gnCss + monthCss));
    GN.push([`gn-${f}.html`, `goodnotes/Henoch_${f}.pdf`]);
  });
  writeFileSync(OUT + 'gn-monate-alle.html', doc(MV.map((_, k) => `<div class="wrap">${monthCover(k)}</div>`).join(''), gnCss + monthCss));
  GN.push(['gn-monate-alle.html', 'goodnotes/Henoch_Monate_alle.pdf']);


  // ---- free page: heading, date, dot grid, for anything
  one('Frei', `<section class="page l a4 frei"><div class="fields frei"><div class="f text"><span class="label">Überschrift</span></div><div class="f"><span class="label">Datum</span></div></div>
    <div style="height:4mm"></div><div class="dotbox fill">${dots(240, 168)}</div><div class="foot"><span></span><span>${seite}</span></div></section>`);
  // ---- everything in one file: contents and use pages (merged afterwards by komplett.py)
  const SECT = [
    ['Zum Gebrauch', '', [[3, 'Zum Gebrauch']]],
    ['Inhaltsverzeichnis', 'zum Ausfüllen', [[4, 'Inhaltsverzeichnis']]],
    ['Jeden Tag', 'Bibellese', [[5, 'Bibellese'], [6, 'Vertiefen']]],
    ['Am Sonntag', 'Predigtnotiz', [[7, 'Predigtnotiz'], [8, 'Mitnehmen']]],
    ['Jede Woche', 'Reflexion', [[9, 'Wochenrückblick'], [10, 'Reflexion und Entwicklung'], [11, 'Woche kompakt (quer)']]],
    ['Jeder Monat', 'Deckblätter', [[12, 'Januar bis Dezember, S. 12–23']]],
    ['Jedes Quartal', 'Reflexion', [[24, 'Quartal']]],
    ['Jedes Jahr', 'Reflexion', [[25, 'Jahresausblick'], [26, 'Jahresrückblick']]],
    ['Bibelstudium', 'wenn Zeit ist', [[27, 'Abschnitt'], [28, 'Wortstudie'], [29, 'Person'], [30, 'Ort'], [31, 'Abschrift'], [32, 'Stellen'], [33, 'Notizen'], [34, 'Skizze'], [35, 'Ertrag']]],
    ['Freie Seite', 'für alles', [[36, 'Freie Seite']]],
  ];
  const inhalt = `<section class="raw toc inh"><div class="eyebrow">Henoch · Lesen und Hören</div><h1>Inhalt</h1><ol>
    ${SECT.map(([t, sub, items]) => `<li><div class="row"><span>${t}</span>${sub ? `<small>${sub}</small>` : ''}<span class="dots"></span><span class="pg">${items[0][0]}</span></div>
      ${items.length > 1 || items[0][1] !== t ? `<div class="d">${items.map(([n, x]) => `<span><b>${n}</b> ${x}</span>`).join('')}</div>` : ''}</li>`).join('')}
    </ol><div class="pfoot"><span>Henoch · Inhalt</span><span>2</span></div></section>`;
  const u2 = (h, t) => `<div><h3>${h}</h3><p>${t}</p></div>`;
  const gebrauch = `<section class="raw toc"><div class="eyebrow">Henoch · Lesen und Hören</div><h1>Zum Gebrauch</h1>
  <div class="use">
   ${u2('Eine Sammlung von Vorlagen', 'Die Datei ist nach dem Rhythmus geordnet: Tag, Sonntag, Woche, Monat, Quartal, Jahr. Am Ende stehen das Bibelstudium für Zeiten, in denen du tiefer graben willst, und eine freie Seite für alles andere. Die Lesezeichen der Datei führen zu jedem Teil.')}
   ${u2('So arbeitest du damit', 'Lass diese Datei unverändert. Für dein Tagebuch kopierst du die Seite, die du brauchst, oder legst sie in GoodNotes als eigene Vorlage an. Dein Tagebuch wächst so Seite um Seite.')}
   ${u2('Jeden Tag', 'Die Bibellese genügt für sich: Lesung, Hauptaussage, ein Vers, Gebet, Ausrichtung. „Vertiefen“ nimmst du dazu, wenn Zeit ist.')}
   ${u2('Am Sonntag und in der Woche', 'Zur Predigt gehören „Predigtnotiz“ und „Mitnehmen“. Am Ende der Woche schaust du mit dem Wochenrückblick zurück, ausführlich auf zwei Seiten oder kompakt auf einer.')}
   ${u2('Monat, Quartal, Jahr', 'Jeder Monat beginnt mit seinem Deckblatt und einem Wort der Schrift. Im Quartal und am Jahresende gehst du dieselben drei Schritte: Bestandsaufnahme, Reflexion, Entwicklung.')}
   ${u2('Erst das Wort, zuletzt der Vorsatz', 'Jede Seite beginnt mit dem Wort. Dann wird gebetet. Erst danach fragst du, was es für dein Haus, die Gemeinde und deine Arbeit heißt.')}
   ${u2('Gesetz und Evangelium', 'Was fordert Gott, und was schenkt Er in Christus? Die Prüfung geschieht im Stillen und wird gebetet, nicht notiert. Das Evangelium hat das letzte Wort.')}
   ${u2('Kein Rückstand', 'Ein Tag ohne Seite wird nicht nachgeholt. Leere Zeilen sind kein Versäumnis. Gelesen und angestrichen wird in der gedruckten Bibel.')}
  </div>
  <div class="pfoot"><span>Henoch · Zum Gebrauch</span><span>3</span></div></section>`;
  writeFileSync(OUT + 'gn-k-inhalt.html', doc(`<div class="wrap">${inhalt}</div>`, gnCss + `
  .toc.inh{padding-top:22mm}.toc.inh h1{margin-bottom:7mm}.toc.inh li{padding:3.4mm 0 3.6mm}
  .toc.inh .row{font-size:12.5pt}.toc.inh .d{display:flex;flex-wrap:wrap;gap:.8mm 5mm;margin-top:1.4mm;font-size:9pt}
  .toc.inh .d b{color:var(--gold);font-variant-numeric:tabular-nums}`));
  writeFileSync(OUT + 'gn-k-gebrauch.html', doc(`<div class="wrap">${gebrauch}</div>`, gnCss));
  GN.push(['gn-k-inhalt.html', 'komplett/inhalt.pdf'], ['gn-k-gebrauch.html', 'komplett/gebrauch.pdf']);
  mkdirSync(OUT + 'komplett', { recursive: true });
  const REFL = ['Reflexion_Woche_1', 'Reflexion_Woche_2', 'Reflexion_Quartal', 'Reflexion_Jahr_Rueckblick', 'Reflexion_Jahr_Ausblick'];
  writeFileSync(OUT + 'gn-reflexion-alle.html', doc(REFL.map((n) => readFileSync(OUT + `gn-${n}.html`, 'utf8').match(/<body>([\s\S]*)<\/body>/)[1]).join(''), gnCss));
  GN.push(['gn-reflexion-alle.html', 'goodnotes/Henoch_Reflexion_alle_hoch.pdf']);
}
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [src, out, w, h] of [
  ['a5.html', 'Henoch-Predigtbuch-A5.pdf', '148mm', '210mm'],
  ['a4.html', 'Henoch-Predigtbuch-A4-Broschuere.pdf', '297mm', '210mm'],
  ['mappe.html', 'Henoch_Tagebuch_lesen_hoeren_Druck.pdf', '210mm', '297mm'],
  ['tablet.html', 'Henoch_Tagebuch_lesen_hoeren.pdf', '210mm', '297mm'],
  ['jahr.html', 'Henoch_Tagebuch_lesen_hoeren_Jahr.pdf', '210mm', '297mm'],
  ...GN.map(([src, out, w = '210mm', h = '297mm']) => [src, out, w, h]),
].filter(([src]) => (process.env.JAHR ? src === 'jahr.html' : process.env.GN ? src.startsWith('gn-') : !src.startsWith('gn-') && src !== 'jahr.html'))) {
  await page.goto('file://' + OUT + src);
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: OUT + out, width: w, height: h, printBackground: true, preferCSSPageSize: true, outline: true, tagged: true });
}
await browser.close();
console.log('ok', N);
