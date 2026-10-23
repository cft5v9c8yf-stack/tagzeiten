/**
 * Export of a single Arena entry (Gebetskammer, Eisenschmiede, Wüstenwanderung):
 * as Markdown for a notes system, and as a designed page for printing to PDF.
 * Handwriting goes along as an image. Nothing leaves the device (rule 10).
 */
import type { ArenaEntry } from './model';
import { entryTitle, forgeTitle } from './arena';
import { inkToSvg } from './ink';
import { esc, paragraphs, printHtml, printPageHtml, safeName, shortDate, type PrintDoc } from './printDoc';

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

/** The file name without extension: "261023_Titel des Eintrags". */
export const exportBasename = (e: ArenaEntry): string => `${shortDate(isoDate(e.createdAt))}_${safeName(exportTitle(e)) || 'Eintrag'}`;

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

/** What the printed page of an entry is made of; `comfort` is the word of its place for the foot. */
export function entryToPrintDoc(e: ArenaEntry, comfort: PrintDoc['comfort'] = []): PrintDoc {
  const verses = filled(e.verses);
  const concerns = filled(e.concerns);
  const points = (e.points ?? []).filter((p) => p.text.trim());
  const sections: string[] = [];
  if (concerns.length) sections.push(`<h2>Gebetsanliegen</h2><ul>${concerns.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`);
  if (points.length) {
    sections.push(
      `<h2>Zum Besprechen</h2><ul class="points">${points
        .map((p) => `<li class="${p.done ? 'done' : ''}"><span class="box">${p.done ? '✓' : ''}</span>${esc(p.text.trim())}</li>`)
        .join('')}</ul>`,
    );
  }
  if (e.text.trim()) sections.push(`<div class="text">${paragraphs(e.text)}</div>`);
  if (e.ink?.length) sections.push(`<h2>Handschrift</h2><div class="ink">${inkToSvg(e.ink).replace(/ width="[\d.]+" height="[\d.]+"/, '')}</div>`);
  return {
    place: placeOf(e),
    title: exportTitle(e),
    subtitle: longDate(e.createdAt),
    verses: verses.join(' · ') || undefined,
    body: sections.join('\n'),
    comfort,
  };
}

export const entryToPrintHtml = (e: ArenaEntry, comfort?: PrintDoc['comfort']) => printPageHtml(entryToPrintDoc(e, comfort));

/** Opens the print dialog for an entry; "Als PDF sichern" there makes the file. */
export const printEntry = (e: ArenaEntry, comfort?: PrintDoc['comfort']): void => printHtml(entryToPrintHtml(e, comfort), exportBasename(e));
