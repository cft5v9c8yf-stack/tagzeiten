/**
 * Export of a single Arena entry (Gebetskammer, Eisenschmiede, Wüstenwanderung):
 * as Markdown for a notes system, and as a designed page for printing to PDF.
 * Handwriting goes along as an image. Nothing leaves the device (rule 10).
 */
import type { ArenaEntry } from './model';
import { entryTitle, forgeTitle } from './arena';
import { inkToSvg } from './ink';

const longDate = (ms: number) =>
  new Date(ms).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const isoDate = (ms: number) => {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const PLACE: Record<'journal' | 'forge' | 'desert', string> = {
  journal: 'Gebetskammer',
  forge: 'Eisenschmiede',
  desert: 'Wüstenwanderung',
};
const placeOf = (e: ArenaEntry) => PLACE[e.kind ?? 'journal'];

/** The heading of the entry: the meeting for the forge, else title or first line. */
export function exportTitle(e: ArenaEntry): string {
  if (e.kind === 'forge') return e.title?.trim() || forgeTitle(e);
  return entryTitle(e) || longDate(e.createdAt);
}

/** The date as JJMMTT, the way the files are named. */
const shortDate = (ms: number) => isoDate(ms).slice(2).replace(/-/g, '');

/** The file name without extension: "261023_Titel des Eintrags", without characters a file system dislikes. */
export function exportBasename(e: ArenaEntry): string {
  const title = exportTitle(e)
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
    .trim();
  return `${shortDate(e.createdAt)}_${title || 'Eintrag'}`;
}

export const exportFilename = (e: ArenaEntry, ext: 'md' | 'pdf') => `${exportBasename(e)}.${ext}`;

const filled = (list: readonly string[]) => list.map((s) => s.trim()).filter(Boolean);

export function entryToMarkdown(e: ArenaEntry): string {
  const verses = filled(e.verses);
  const concerns = filled(e.concerns);
  const points = (e.points ?? []).filter((p) => p.text.trim());
  const title = exportTitle(e).replace(/"/g, '\\"');
  const out = [
    '---',
    `title: "${title}"`,
    `date: ${isoDate(e.createdAt)}`,
    `ort: ${placeOf(e)}`,
    ...(e.meetingDate ? [`treffen: ${e.meetingDate}`] : []),
    ...(verses.length ? ['bibelstellen:', ...verses.map((v) => `  - "${v.replace(/"/g, '\\"')}"`)] : []),
    'tags: [henoch, gebet]',
    '---',
    '',
    `# ${exportTitle(e)}`,
    '',
    `*${placeOf(e)} · ${longDate(e.createdAt)}*`,
    '',
  ];
  if (verses.length) out.push(`**Bibelstellen:** ${verses.join(' · ')}`, '');
  if (concerns.length) out.push('## Gebetsanliegen', '', ...concerns.map((c) => `- ${c}`), '');
  if (points.length) out.push('## Zum Besprechen', '', ...points.map((p) => `- [${p.done ? 'x' : ' '}] ${p.text.trim()}`), '');
  if (e.text.trim()) out.push('## Text', '', e.text.trim(), '');
  if (e.ink?.length) {
    out.push('## Handschrift', '', `![Handschrift](data:image/svg+xml;base64,${btoa(inkToSvg(e.ink))})`, '');
  }
  return out.join('\n');
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The paragraphs of a text, line breaks kept. */
const paragraphs = (text: string) =>
  text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('');

/**
 * A complete HTML page for printing: A4, serif type, a thin double rule and the
 * gold of Luther's rose as the only colour. Printed or saved as PDF from the
 * share sheet; the handwriting is drawn on white so it prints as written.
 */
export interface PrintOptions {
  /** Word of comfort for the foot of every page (Luther 1912), as the place shows it. */
  comfort?: readonly { text: string; ref: string }[];
}

export const APP_SUBTITLE = 'Mit Gott unterwegs';

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

export function entryToPrintHtml(e: ArenaEntry, { comfort = [] }: PrintOptions = {}): string {
  const verses = filled(e.verses);
  const concerns = filled(e.concerns);
  const points = (e.points ?? []).filter((p) => p.text.trim());
  const title = exportTitle(e);
  const sections: string[] = [];
  if (verses.length) sections.push(`<p class="verses">${verses.map(esc).join(' · ')}</p>`);
  if (concerns.length) {
    sections.push(`<h2>Gebetsanliegen</h2><ul>${concerns.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`);
  }
  if (points.length) {
    sections.push(
      `<h2>Zum Besprechen</h2><ul class="points">${points
        .map((p) => `<li class="${p.done ? 'done' : ''}"><span class="box">${p.done ? '✓' : ''}</span>${esc(p.text.trim())}</li>`)
        .join('')}</ul>`,
    );
  }
  if (e.text.trim()) sections.push(`<div class="text">${paragraphs(e.text)}</div>`);
  if (e.ink?.length) sections.push(`<h2>Handschrift</h2><div class="ink">${inkToSvg(e.ink).replace(/ width="[\d.]+" height="[\d.]+"/, '')}</div>`);
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
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
.text p { margin: 0 0 3.5mm; text-align: left; hyphens: auto; orphans: 3; widows: 3; }
.ink { border: 0.2mm solid #ddd8ce; border-radius: 1.5mm; overflow: hidden; }
.ink { break-inside: avoid; }
.ink svg { display: block; width: auto; max-width: 100%; max-height: 180mm; margin: 0 auto; }
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
</style></head><body>
<div class="running-head"><div class="brand">${MARK}<div><b>Henoch</b><span>${esc(APP_SUBTITLE)}</span></div></div><div class="place">${esc(placeOf(e))}</div></div>
${comfort.length ? `<div class="running-foot">${comfort.map((c) => `<p>${esc(c.text)} <small>${esc(c.ref)}</small></p>`).join('')}</div>` : ''}
<table class="page"><thead><tr><td><div class="sp-head"></div></td></tr></thead><tfoot><tr><td><div class="sp-foot"></div></td></tr></tfoot><tbody><tr><td>
<header><h1>${esc(title)}</h1><p class="date">${esc(longDate(e.createdAt))}</p></header>
${sections.join('\n')}
</td></tr></tbody></table>
</body></html>`;
}

/**
 * Opens the system's print dialog for the page in a hidden frame; "Als PDF sichern"
 * there makes the file. No library, nothing loaded from outside.
 */
export function printEntry(e: ArenaEntry, options?: PrintOptions): void {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  frame.srcdoc = entryToPrintHtml(e, options);
  const pageTitle = document.title;
  const done = () => {
    document.title = pageTitle;
    frame.remove();
  };
  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) return done();
    // The system names the PDF after the title of the page, so both carry the file name.
    const name = exportBasename(e);
    document.title = name;
    win.document.title = name;
    win.onafterprint = done;
    win.focus();
    win.print();
    setTimeout(done, 120_000);
  };
  document.body.appendChild(frame);
}
