/**
 * Export of a single meeting at the Abendbrunnen: as Markdown for a notes system and
 * as a page for printing to PDF, in the common layout of printDoc. Nothing of what is
 * confessed is kept in the meeting (rule 9), so nothing of it is exported.
 */
import { WELL_COMFORT, WELL_NOTES, WELL_TITLE } from '../content/well';
import { formatLong } from './dates';
import { esc, paragraphs, printHtml, printPageHtml, safeName, shortDate, type PrintDoc } from './printDoc';
import type { WellMeeting } from './well';

const dateLong = (k: string) => `${formatLong(k)} ${k.slice(0, 4)}`;

/** The heading: the title the user gave, else the day of the meeting. */
const heading = (m: WellMeeting) => m.title?.trim() || `Treffen am ${dateLong(m.date)}`;

export const meetingBasename = (m: WellMeeting) => `${shortDate(m.date)}_${safeName(heading(m)) || 'Treffen'}`;
export const meetingFilename = (m: WellMeeting, ext: 'md' | 'pdf') => `${meetingBasename(m)}.${ext}`;

const COMFORT = [{ text: WELL_COMFORT.parts.join(' '), ref: WELL_COMFORT.ref }] as const;

interface Field {
  label: string;
  text: string;
}
const fieldsOf = (m: WellMeeting): Field[] =>
  [
    { label: WELL_NOTES.resolution, text: `${m.resolution.trim()}${m.resolution.trim() && m.resolutionDone ? ' (umgesetzt)' : ''}` },
    { label: WELL_NOTES.herWish, text: m.herWish.trim() },
    { label: WELL_NOTES.herConcern, text: m.herConcern.trim() },
    { label: WELL_NOTES.myConcern, text: m.myConcern.trim() },
    { label: WELL_NOTES.next, text: m.next ? dateLong(m.next) : '' },
  ].filter((f) => f.text);

export function meetingToMarkdown(m: WellMeeting): string {
  const out = [
    '---',
    `title: "${heading(m).replace(/"/g, '\\"')}"`,
    `date: ${m.date}`,
    `ort: ${WELL_TITLE}`,
    'tags: [henoch, abendbrunnen]',
    '---',
    '',
    `# ${heading(m)}`,
    '',
    `*${WELL_TITLE} · ${dateLong(m.date)}*`,
    '',
  ];
  for (const f of fieldsOf(m)) out.push(`## ${f.label}`, '', f.text, '');
  return out.join('\n');
}

export function meetingToPrintDoc(m: WellMeeting): PrintDoc {
  return {
    place: WELL_TITLE,
    title: heading(m),
    subtitle: m.title?.trim() ? `Treffen am ${dateLong(m.date)}` : undefined,
    body: fieldsOf(m)
      .map((f) => `<h2>${esc(f.label)}</h2><div class="text">${paragraphs(f.text)}</div>`)
      .join('\n'),
    comfort: COMFORT,
  };
}

/** Opens the print dialog for a meeting; "Als PDF sichern" there makes the file. */
export const printMeeting = (m: WellMeeting): void => printHtml(printPageHtml(meetingToPrintDoc(m)), meetingBasename(m));
