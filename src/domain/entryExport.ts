/**
 * Export of a single Arena entry (Gebetskammer, Eisenschmiede, Wüstenwanderung):
 * as Markdown for a notes system, and as a designed page for printing to PDF.
 * Handwriting goes along as an image. Nothing leaves the device (rule 10).
 */
import type { ArenaEntry } from './model';
import { entryTitle, forgeTitle, isEmptyEntry } from './arena';
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

/** The body of an entry in Markdown; `level` is the heading level of its sections. */
function entryContentLines(e: ArenaEntry, level: number): string[] {
  const h = '#'.repeat(level);
  const verses = filled(e.verses);
  const concerns = filled(e.concerns);
  const points = (e.points ?? []).filter((p) => p.text.trim());
  const out: string[] = [];
  if (verses.length) out.push(`**Bibelstellen:** ${verses.join(' · ')}`, '');
  if (concerns.length) out.push(`${h} Gebetsanliegen`, '', ...concerns.map((c) => `- ${c}`), '');
  if (points.length) out.push(`${h} Zum Besprechen`, '', ...points.map((p) => `- [${p.done ? 'x' : ' '}] ${p.text.trim()}`), '');
  if (e.text.trim()) out.push(`${h} Text`, '', e.text.trim(), '');
  if (e.ink?.length) out.push(`${h} Handschrift`, '', `![Handschrift](data:image/svg+xml;base64,${btoa(inkToSvg(e.ink))})`, '');
  return out;
}

export function entryToMarkdown(e: ArenaEntry): string {
  const verses = filled(e.verses);
  const title = exportTitle(e).replace(/"/g, '\\"');
  return [
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
    ...entryContentLines(e, 2),
  ].join('\n');
}

/** The entries of one place that are worth exporting, oldest first. */
const keptEntries = (entries: readonly ArenaEntry[]) => entries.filter((e) => !isEmptyEntry(e)).sort((a, b) => a.createdAt - b.createdAt);

/** All entries of a place in one Markdown file: one section each, oldest first. */
export function entriesToMarkdown(entries: readonly ArenaEntry[], place: string, today: string): string {
  const kept = keptEntries(entries);
  const out = ['---', `title: "${place}"`, `date: ${today}`, `ort: ${place}`, `eintraege: ${kept.length}`, 'tags: [henoch, gebet]', '---', '', `# ${place}`, '', `*${kept.length} ${kept.length === 1 ? 'Eintrag' : 'Einträge'}*`, ''];
  for (const e of kept) out.push(`## ${exportTitle(e)}`, '', `*${longDate(e.createdAt)}*`, '', ...entryContentLines(e, 3));
  return out.join('\n');
}

/** What the printed page of an entry is made of; `comfort` is the word of its place for the foot. */
function entryPrintSections(e: ArenaEntry): string {
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
  return sections.join('\n');
}

export function entryToPrintDoc(e: ArenaEntry, comfort: PrintDoc['comfort'] = []): PrintDoc {
  return {
    place: placeOf(e),
    title: exportTitle(e),
    subtitle: longDate(e.createdAt),
    verses: filled(e.verses).join(' · ') || undefined,
    body: entryPrintSections(e),
    comfort,
  };
}

/** All entries of a place on one printed document, each starting with its title and date. */
export function entriesToPrintDoc(entries: readonly ArenaEntry[], place: string, today: string, comfort: PrintDoc['comfort'] = []): PrintDoc {
  const kept = keptEntries(entries);
  return {
    place,
    title: place,
    subtitle: `${kept.length} ${kept.length === 1 ? 'Eintrag' : 'Einträge'} · Stand ${new Date(`${today}T12:00:00`).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    body: kept
      .map((e) => {
        const verses = filled(e.verses).join(' · ');
        return `<section class="entry"><h3 class="md">${esc(exportTitle(e))}</h3><p class="date">${esc(longDate(e.createdAt))}</p>${verses ? `<p class="verses">${esc(verses)}</p>` : ''}${entryPrintSections(e)}</section>`;
      })
      .join('\n'),
    comfort,
  };
}

/** The file name without extension for all entries of a place: "261023_Gebetskammer". */
export const entriesBasename = (place: string, today: string) => `${shortDate(today)}_${safeName(place)}`;

export const printEntries = (entries: readonly ArenaEntry[], place: string, today: string, comfort?: PrintDoc['comfort']): void =>
  printHtml(printPageHtml(entriesToPrintDoc(entries, place, today, comfort)), entriesBasename(place, today));

export const entryToPrintHtml = (e: ArenaEntry, comfort?: PrintDoc['comfort']) => printPageHtml(entryToPrintDoc(e, comfort));

/** Opens the print dialog for an entry; "Als PDF sichern" there makes the file. */
export const printEntry = (e: ArenaEntry, comfort?: PrintDoc['comfort']): void => printHtml(entryToPrintHtml(e, comfort), exportBasename(e));
