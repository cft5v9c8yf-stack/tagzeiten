/**
 * The common page for everything Henoch prints as PDF: a narrow head with the mark of
 * the app, the place on the right and a thin gold rule; the title, date and body; at the
 * foot a word of comfort. A4, no ground colour, one gold. Printed or saved as PDF from
 * the system's print dialog; no library, nothing loaded from outside (rule 10).
 */

export const APP_SUBTITLE = 'Mit Gott unterwegs';

export interface PrintDoc {
  /** The place shown at the top right: "Gebetskammer", "Treffen am Abendbrunnen", … */
  place: string;
  title: string;
  /** Under the title, e.g. "Freitag, 23. Oktober 2026". */
  subtitle?: string;
  /** Bible references under the date, in gold. */
  verses?: string;
  /** The body as HTML, built with `esc`, `paragraphs`, `markdownToHtml`. */
  body: string;
  /** Word of comfort for the foot of every page (Luther 1912). */
  comfort?: readonly { text: string; ref: string }[];
}

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The paragraphs of a text, line breaks kept. */
export const paragraphs = (text: string) =>
  text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('');

/** Bold, italic and code of a line of Markdown, on text that is already escaped. */
const inline = (s: string) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<i>$2</i>')
    .replace(/`(.+?)`/g, '<code>$1</code>');

/**
 * The Markdown the app writes (headings, bold, lists with ticks, quotes, images,
 * a front matter block) as HTML for the page. `#` becomes a section, `##` and `###`
 * smaller headings; a front matter block between two `---` lines is left out.
 */
export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r/g, '').split('\n');
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) lines.splice(0, end + 1);
  }
  const out: string[] = [];
  let list: string[] = [];
  let para: string[] = [];
  const flushList = () => {
    if (list.length) out.push(`<ul>${list.join('')}</ul>`);
    list = [];
  };
  const flushPara = () => {
    if (para.length) out.push(`<p>${para.join('<br>')}</p>`);
    para = [];
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    const li = /^\s*-\s+(?:\[([ x])\]\s+)?(.*)$/.exec(line);
    const img = /^!\[(.*?)\]\((data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+)\)$/.exec(line);
    if (h) {
      flushList();
      flushPara();
      out.push(`<h${h[1]!.length + 1} class="md">${inline(h[2]!)}</h${h[1]!.length + 1}>`);
    } else if (li) {
      flushPara();
      const box = li[1] === undefined ? '' : `<span class="box">${li[1] === 'x' ? '✓' : ''}</span>`;
      list.push(`<li class="${li[1] === 'x' ? 'done' : ''}">${box}${inline(li[2]!)}</li>`);
    } else if (img) {
      flushList();
      flushPara();
      out.push(`<div class="ink"><img alt="${esc(img[1]!)}" src="${img[2]}"></div>`);
    } else if (line.startsWith('> ')) {
      flushList();
      flushPara();
      out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
    } else if (line.trim() === '') {
      flushList();
      flushPara();
    } else {
      flushList();
      para.push(inline(line));
    }
  }
  flushList();
  flushPara();
  return out.join('\n');
}

/**
 * The mark of the app: sun over the horizon, arcs around it, a hill below. Drawn in lines,
 * without a ground of its own, so it stands on the white page.
 */
const MARK = `<svg class="mark" viewBox="0 0 60 40" aria-hidden="true">
<g fill="none" stroke="#cfc8b8" stroke-width="1"><path d="M10 24a20 20 0 0 1 40 0M16 24a14 14 0 0 1 28 0"/></g>
<path d="M23 24a7 7 0 0 1 14 0z" fill="#d4b13c"/>
<path d="M30 25C31 31 38 35 44 39M30 25C29 31 22 35 16 39" fill="none" stroke="#1d2330" stroke-width="1.7"/>
<path d="M2 24H58" stroke="#1d2330" stroke-width="1.7"/>
</svg>`;

const STYLES = `
/* No page margin: the system then leaves out its own line with address, date and page count. */
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; padding: 0 20mm; color: #1d2330; font: 11.5pt/1.55 Literata, Georgia, 'Times New Roman', serif; }
header { margin-bottom: 7mm; }
h1 { font-size: 16pt; line-height: 1.22; font-weight: 600; margin: 0 0 1.5mm; hyphens: auto; }
.date { font-size: 9.5pt; font-style: italic; color: #636a76; margin: 0; }
.verses { color: #7f6200; font-style: italic; margin: 0 0 4mm; }
h2 { font: 600 8.5pt/1 'Source Sans 3', Helvetica, Arial, sans-serif; letter-spacing: 0.18em; text-transform: uppercase; color: #2e4057; margin: 8mm 0 3mm; break-after: avoid; }
h3.md { font: 600 12pt/1.3 Literata, Georgia, serif; margin: 6mm 0 2mm; break-after: avoid; }
h4.md { font: 600 10.5pt/1.3 'Source Sans 3', Helvetica, Arial, sans-serif; margin: 4mm 0 1.5mm; break-after: avoid; }
section.entry { margin-top: 9mm; padding-top: 5mm; border-top: 0.2mm solid #ddd8ce; }
section.entry:first-child { margin-top: 0; padding-top: 0; border-top: 0; }
section.entry h3.md { margin-top: 0; font-size: 13pt; }
h2.md { margin-top: 12mm; padding-top: 3mm; border-top: 0.2mm solid #ddd8ce; }
blockquote { margin: 3mm 0; padding-left: 4mm; border-left: 0.5mm solid #a78100; font-style: italic; color: #4a5160; }
code { font-size: 0.9em; }
p { margin: 0 0 3mm; }
/* Spacer rows repeat on every page and keep the text clear of the running head and foot. */
table.page { width: 100%; border-collapse: collapse; }
table.page td { padding: 0; }
.sp-head { height: 34mm; }
.sp-foot { height: 32mm; }
ul { margin: 0 0 4mm; padding-left: 5mm; }
li { margin-bottom: 1.5mm; break-inside: avoid; }
ul.points { list-style: none; padding: 0; }
.box { display: inline-block; width: 3.6mm; height: 3.6mm; margin-right: 2.5mm; border: 0.3mm solid #8a8578; border-radius: 0.6mm; font-size: 8pt; line-height: 3.4mm; text-align: center; vertical-align: -0.4mm; }
.done .box { border-color: #4f7a17; color: #4f7a17; }
li:has(> .box) { list-style: none; margin-left: -5mm; }
.text p { text-align: left; hyphens: auto; orphans: 3; widows: 3; margin-bottom: 3.5mm; }
.ink { border: 0.2mm solid #ddd8ce; border-radius: 1.5mm; overflow: hidden; break-inside: avoid; margin: 0 0 4mm; }
.ink svg, .ink img { display: block; width: auto; max-width: 100%; max-height: 180mm; margin: 0 auto; }
.running-head { position: fixed; top: 12mm; left: 20mm; right: 20mm; display: flex; align-items: flex-end; justify-content: space-between; padding-bottom: 3.2mm; border-bottom: 0.25mm solid #a78100; }
.brand { display: flex; align-items: center; gap: 3.2mm; }
.mark { width: 16mm; height: auto; display: block; }
.brand b { display: block; font: 600 13pt/1.05 Literata, Georgia, 'Times New Roman', serif; }
.brand span { display: block; margin-top: 1.2mm; font: 600 6.5pt/1 'Source Sans 3', Helvetica, Arial, sans-serif; letter-spacing: 0.2em; text-transform: uppercase; color: #636a76; }
.place { font: 600 7pt/1 'Source Sans 3', Helvetica, Arial, sans-serif; letter-spacing: 0.22em; text-transform: uppercase; color: #7f6200; padding-bottom: 1mm; }
.running-foot { position: fixed; bottom: 0; left: 0; right: 0; padding: 0 30mm 11mm; text-align: center; font-style: italic; font-size: 8.5pt; line-height: 1.4; color: #4a5160; }
.running-foot::before { content: ''; display: block; width: 12mm; margin: 0 auto 3.5mm; border-top: 0.25mm solid #a78100; }
.running-foot p { margin: 0 0 1.2mm; }
.running-foot small { font: normal 600 7.5pt/1 'Source Sans 3', Helvetica, Arial, sans-serif; font-style: normal; letter-spacing: 0.06em; color: #7f6200; }
`;

/** A complete HTML page for printing. */
export function printPageHtml({ place, title, subtitle, verses, body, comfort = [] }: PrintDoc): string {
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>${STYLES}</style></head><body>
<div class="running-head"><div class="brand">${MARK}<div><b>Henoch</b><span>${esc(APP_SUBTITLE)}</span></div></div><div class="place">${esc(place)}</div></div>
${comfort.length ? `<div class="running-foot">${comfort.map((c) => `<p>${esc(c.text)} <small>${esc(c.ref)}</small></p>`).join('')}</div>` : ''}
<table class="page"><thead><tr><td><div class="sp-head"></div></td></tr></thead><tfoot><tr><td><div class="sp-foot"></div></td></tr></tfoot><tbody><tr><td>
<header><h1>${esc(title)}</h1>${subtitle ? `<p class="date">${esc(subtitle)}</p>` : ''}</header>
${verses ? `<p class="verses">${esc(verses)}</p>` : ''}
${body}
</td></tr></tbody></table>
</body></html>`;
}

/**
 * Opens the system's print dialog for the page in a hidden frame; "Als PDF sichern"
 * there makes the file. The system names the PDF after the title of the page, so the
 * page and the frame both carry the file name (without extension) while it is open.
 */
export function printHtml(html: string, basename: string): void {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  frame.srcdoc = html;
  const pageTitle = document.title;
  const done = () => {
    document.title = pageTitle;
    frame.remove();
  };
  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) return done();
    document.title = basename;
    win.document.title = basename;
    win.onafterprint = done;
    win.focus();
    win.print();
    setTimeout(done, 120_000);
  };
  document.body.appendChild(frame);
}

/** A file name without characters a file system dislikes. */
export const safeName = (s: string) =>
  s
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
    .trim();

/** The date as JJMMTT, the way the files are named. */
export const shortDate = (isoDate: string) => isoDate.slice(2, 10).replace(/-/g, '');

export interface PrintMarkdownOptions {
  place: string;
  title: string;
  subtitle?: string;
  comfort?: PrintDoc['comfort'];
}

/** Prints Markdown the app wrote (a whole export, a Wüstenzeit) in the common layout; `basename` names the PDF. */
export function printMarkdown(md: string, { place, title, subtitle, comfort }: PrintMarkdownOptions, basename: string): void {
  printHtml(printPageHtml({ place, title, subtitle, body: markdownToHtml(md), comfort }), basename);
}
