/**
 * Export of a single meeting at the Abendbrunnen: as Markdown for a notes system and
 * as a page in a PDF file, in the common layout of printDoc. Nothing of what is
 * confessed is kept in the meeting (rule 9), so nothing of it is exported.
 */
import { WELL_COMFORT, WELL_NOTES, WELL_TITLE } from '../content/well';
import { formatLong } from './dates';
import { paragraphs, safeName, savePdf, shortDate, type Block, type PrintDoc } from './printDoc';
import { isEmptyMeeting, type WellMeeting } from './well';

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

const fieldBlocks = (m: WellMeeting): Block[] => fieldsOf(m).flatMap((f): Block[] => [{ kind: 'label', text: f.label }, ...paragraphs(f.text)]);

export function meetingToPrintDoc(m: WellMeeting): PrintDoc {
  return {
    place: WELL_TITLE,
    title: heading(m),
    subtitle: m.title?.trim() ? `Treffen am ${dateLong(m.date)}` : undefined,
    blocks: fieldBlocks(m),
    comfort: COMFORT,
  };
}

/** A meeting as a PDF, handed to the share sheet. */
export const saveMeetingPdf = (m: WellMeeting) => savePdf(meetingToPrintDoc(m), meetingBasename(m));

const keptMeetings = (meetings: readonly WellMeeting[]) => meetings.filter((m) => !isEmptyMeeting(m)).sort((a, b) => (a.date < b.date ? -1 : 1));
const countLine = (n: number) => `${n} Treffen`;

/** The file name without extension for all meetings: "261023_Treffen am Abendbrunnen". */
export const meetingsBasename = (today: string) => `${shortDate(today)}_${safeName(WELL_TITLE)}`;

/** All meetings in one Markdown file, oldest first. */
export function meetingsToMarkdown(meetings: readonly WellMeeting[], today: string): string {
  const kept = keptMeetings(meetings);
  const out = ['---', `title: "${WELL_TITLE}"`, `date: ${today}`, `ort: ${WELL_TITLE}`, `treffen: ${kept.length}`, 'tags: [henoch, abendbrunnen]', '---', '', `# ${WELL_TITLE}`, '', `*${countLine(kept.length)}*`, ''];
  for (const m of kept) {
    out.push(`## ${heading(m)}`, '', ...(m.title?.trim() ? [`*Treffen am ${dateLong(m.date)}*`, ''] : []));
    for (const f of fieldsOf(m)) out.push(`### ${f.label}`, '', f.text, '');
  }
  return out.join('\n');
}

/** All meetings on one printed document, each starting with its heading and day. */
export function meetingsToPrintDoc(meetings: readonly WellMeeting[], today: string): PrintDoc {
  const kept = keptMeetings(meetings);
  return {
    place: WELL_TITLE,
    title: WELL_TITLE,
    subtitle: `${countLine(kept.length)} · Stand ${new Date(`${today}T12:00:00`).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    blocks: kept.flatMap((m): Block[] => [
      { kind: 'entry', title: heading(m), date: m.title?.trim() ? `Treffen am ${dateLong(m.date)}` : undefined },
      ...fieldBlocks(m),
    ]),
    comfort: COMFORT,
  };
}

/** All meetings as one PDF, handed to the share sheet. */
export const saveMeetingsPdf = (meetings: readonly WellMeeting[], today: string) => savePdf(meetingsToPrintDoc(meetings, today), meetingsBasename(today));
