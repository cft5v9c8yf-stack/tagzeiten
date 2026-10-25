/**
 * Export of a single Arena entry (Gebetskammer, Eisenschmiede, Wüstenwanderung):
 * as Markdown for a notes system, and as a designed page in a PDF file.
 * Handwriting goes along as an image. Nothing leaves the device (rule 10).
 */
import type { ArenaEntry } from './model';
import { entryTitle, forgeTitle, isEmptyEntry } from './arena';
import { inkToSvg } from './ink';
import { REFLECTION_CARDS } from '../content/reflection';
import { paragraphs, safeName, savePdf, shortDate, type Block, type PrintDoc } from './printDoc';

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
  for (const [id, strokes] of inkOfQuestions(e)) {
    out.push(`${h} Handschrift: ${id}`, '', `![Handschrift](data:image/svg+xml;base64,${btoa(inkToSvg(strokes))})`, '');
  }
  return out;
}

/** The handwriting of the Reflexion, under the title of each question, in the order of the questions. */
function inkOfQuestions(e: ArenaEntry) {
  const inks = e.inks ?? {};
  return REFLECTION_CARDS.filter((c) => inks[c.id]?.length).map((c) => [c.title, inks[c.id]!] as const);
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
function entryBlocks(e: ArenaEntry): Block[] {
  const concerns = filled(e.concerns);
  const points = (e.points ?? []).filter((p) => p.text.trim());
  const out: Block[] = [];
  if (concerns.length) out.push({ kind: 'label', text: 'Gebetsanliegen' }, { kind: 'list', items: concerns.map((c) => ({ runs: [{ text: c }] })) });
  if (points.length) {
    out.push({ kind: 'label', text: 'Zum Besprechen' }, { kind: 'list', items: points.map((p) => ({ runs: [{ text: p.text.trim() }], check: p.done })) });
  }
  if (e.text.trim()) out.push(...paragraphs(e.text));
  if (e.ink?.length) out.push({ kind: 'label', text: 'Handschrift' }, { kind: 'svg', svg: inkToSvg(e.ink) });
  for (const [title, strokes] of inkOfQuestions(e)) out.push({ kind: 'label', text: `Handschrift: ${title}` }, { kind: 'svg', svg: inkToSvg(strokes) });
  return out;
}

export function entryToPrintDoc(e: ArenaEntry, comfort: PrintDoc['comfort'] = []): PrintDoc {
  return {
    place: placeOf(e),
    title: exportTitle(e),
    subtitle: longDate(e.createdAt),
    verses: filled(e.verses).join(' · ') || undefined,
    blocks: entryBlocks(e),
    comfort,
  };
}

/** All entries of a place in one document, each starting with its title and date. */
export function entriesToPrintDoc(entries: readonly ArenaEntry[], place: string, today: string, comfort: PrintDoc['comfort'] = []): PrintDoc {
  const kept = keptEntries(entries);
  return {
    place,
    title: place,
    subtitle: `${kept.length} ${kept.length === 1 ? 'Eintrag' : 'Einträge'} · Stand ${new Date(`${today}T12:00:00`).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    blocks: kept.flatMap((e): Block[] => [
      { kind: 'entry', title: exportTitle(e), date: longDate(e.createdAt), verses: filled(e.verses).join(' · ') || undefined },
      ...entryBlocks(e),
    ]),
    comfort,
  };
}

/** The file name without extension for all entries of a place: "261023_Gebetskammer". */
export const entriesBasename = (place: string, today: string) => `${shortDate(today)}_${safeName(place)}`;

/** All entries of a place as one PDF, handed to the share sheet. */
export const saveEntriesPdf = (entries: readonly ArenaEntry[], place: string, today: string, comfort?: PrintDoc['comfort']) =>
  savePdf(entriesToPrintDoc(entries, place, today, comfort), entriesBasename(place, today));

/** An entry as a PDF, handed to the share sheet. */
export const saveEntryPdf = (e: ArenaEntry, comfort?: PrintDoc['comfort']) => savePdf(entryToPrintDoc(e, comfort), exportBasename(e));
