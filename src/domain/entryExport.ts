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

/** A file name without characters a file system dislikes. */
export function exportFilename(e: ArenaEntry, ext: 'md' | 'pdf'): string {
  const slug = exportTitle(e)
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `henoch-${isoDate(e.createdAt)}${slug ? `-${slug}` : ''}.${ext}`;
}

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
export function entryToPrintHtml(e: ArenaEntry): string {
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
@page { size: A4; margin: 22mm 20mm 20mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; color: #1d2330; font: 11.5pt/1.55 Literata, Georgia, 'Times New Roman', serif; }
header { text-align: center; padding-bottom: 7mm; margin-bottom: 8mm; border-bottom: 0.4mm solid #a78100; position: relative; }
header::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1.6mm; border-bottom: 0.15mm solid #a78100; }
.place { font: 600 8.5pt/1 'Source Sans 3', Helvetica, Arial, sans-serif; letter-spacing: 0.22em; text-transform: uppercase; color: #7f6200; margin: 0 0 4mm; }
h1 { font-size: 21pt; line-height: 1.2; font-weight: 600; margin: 0 0 3mm; hyphens: auto; }
.date { font-style: italic; color: #636a76; margin: 0; }
.verses { text-align: center; color: #7f6200; margin: 0 0 6mm; }
h2 { font: 600 8.5pt/1 'Source Sans 3', Helvetica, Arial, sans-serif; letter-spacing: 0.18em; text-transform: uppercase; color: #2e4057; margin: 8mm 0 3mm; break-after: avoid; }
ul { margin: 0; padding-left: 5mm; }
li { margin-bottom: 1.5mm; break-inside: avoid; }
ul.points { list-style: none; padding: 0; }
.box { display: inline-block; width: 3.6mm; height: 3.6mm; margin-right: 2.5mm; border: 0.3mm solid #8a8578; border-radius: 0.6mm; font-size: 8pt; line-height: 3.4mm; text-align: center; vertical-align: -0.4mm; }
.done .box { border-color: #4f7a17; color: #4f7a17; }
.text p { margin: 0 0 3.5mm; text-align: left; hyphens: auto; orphans: 3; widows: 3; }
.ink { border: 0.2mm solid #ddd8ce; border-radius: 1.5mm; overflow: hidden; }
.ink svg { display: block; width: 100%; height: auto; }
footer { margin-top: 12mm; text-align: center; font: 8pt/1 'Source Sans 3', Helvetica, Arial, sans-serif; letter-spacing: 0.12em; color: #8a8578; }
</style></head><body>
<header><p class="place">${esc(placeOf(e))}</p><h1>${esc(title)}</h1><p class="date">${esc(longDate(e.createdAt))}</p></header>
${sections.join('\n')}
<footer>Henoch</footer>
</body></html>`;
}

/**
 * Opens the system's print dialog for the page in a hidden frame; "Als PDF sichern"
 * there makes the file. No library, nothing loaded from outside.
 */
export function printEntry(e: ArenaEntry): void {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  frame.srcdoc = entryToPrintHtml(e);
  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) return frame.remove();
    win.onafterprint = () => frame.remove();
    win.focus();
    win.print();
    setTimeout(() => frame.remove(), 120_000);
  };
  document.body.appendChild(frame);
}
