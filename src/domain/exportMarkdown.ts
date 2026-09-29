/**
 * Human-readable export of all entries. Contains every stored text field.
 */
import { SEVEN_QUESTIONS } from '../content/questions';
import { formatLong } from './dates';
import {
  EVENING_TEXT_FIELDS,
  MORNING_TEXT_FIELDS,
  THREE_KEYS,
  WREATH_FIELDS,
  type ArenaEntry,
  type Day,
  type EveningTextField,
  type Habit,
  type MorningTextField,
  type WreathField,
} from './model';
import { isEmptyDay } from './normalizeDay';
import { isEmptyEntry } from './arena';
import { answeredNewestFirst, ROLE_LABEL, type AnsweredPrayer } from './house';
import { inkToSvg } from './ink';
import { getPlan, portionLabel } from './readingPlan';
import { CARRY_LABEL, MARK_LABEL, MARK_SYMBOL, THREE_LABEL } from './review';

export const MORNING_FIELD_LABEL: Record<MorningTextField, string> = {
  mainPoint: 'Hauptaussage',
  verseRef: 'Stelle',
  verse: 'Vers, den ich mitnehme',
  aboutGod: 'Über Gott',
  aboutMan: 'Über den Menschen',
  questionAnswer: 'Antwort',
  salvationHistory: 'Heilsgeschichte',
  unclear: '? Unklar',
  challenge: '! Fordert mich heraus',
  application: '→ Umsetzung',
  onMyHeart: 'Was mich bewegt',
  forMyself: 'Bitte für mich',
  peopleToday: 'Menschen heute',
};

export const WREATH_LABEL: Record<WreathField, string> = {
  instruction: 'Unterricht',
  thanks: 'Danksagung',
  petition: 'Bitte',
};

export const EVENING_FIELD_LABEL: Record<EveningTextField, string> = {
  reading: 'Lesung (Vesper)',
  intercession: 'Fürbitte (Vesper)',
  people: 'Menschen des Tages',
  passedOnTo: 'Weitergegeben an',
};

const oneLine = (s: string) => s.replace(/\s*\n\s*/g, ' / ').trim();

export function readingLabel(day: Day): string {
  if (!day.reading) return '';
  const plan = getPlan(day.reading.planId);
  return plan.tracks
    .map((t) => {
      const i = day.reading!.portions[t.def.id];
      const p = i === undefined ? undefined : t.portions[i];
      return p ? portionLabel(t, p) : '';
    })
    .filter(Boolean)
    .join(' · ');
}

export type DaySection = 'Stille Zeit' | 'Die drei Dinge' | 'Abend' | 'Gewohnheiten';

/** One input of a day, with the label it has in the app. */
export interface DayEntry {
  section: DaySection;
  label: string;
  value: string;
}

/** What was prayed that day, in order. */
export function prayedOrders(day: Day): string[] {
  const done: string[] = [];
  if (day.morning.done) done.push(day.morning.form === 'short' ? 'Stille Zeit (Kurzform)' : 'Stille Zeit');
  if (day.evening.vespersDone) done.push('Vesper');
  if (day.evening.complineDone) done.push(day.evening.complineForm === 'short' ? 'Nachtgebet (Kurzform)' : 'Nachtgebet');
  return done;
}

/**
 * Every input of a day, in the order of the day, empty ones left out. Used by
 * the export and by the Rückblick, so both list the same.
 */
export function dayEntries(day: Day, habits: readonly Habit[], marks: 'symbol' | 'word' = 'symbol'): DayEntry[] {
  const m = day.morning;
  const e = day.evening;
  const out: DayEntry[] = [];
  const add = (section: DaySection, label: string, v: string | undefined) => {
    if (v && v.trim()) out.push({ section, label, value: v.trim() });
  };

  const reading = readingLabel(day);
  if (reading) add('Stille Zeit', day.reading?.done ? 'Lesung (gelesen)' : 'Lesung', reading);
  for (const f of MORNING_TEXT_FIELDS) {
    if (f === 'questionAnswer' && m.questionNo !== undefined) {
      add('Stille Zeit', `Frage: ${SEVEN_QUESTIONS[m.questionNo]}`, m[f] || '—');
    } else add('Stille Zeit', MORNING_FIELD_LABEL[f], m[f]);
  }
  for (const f of WREATH_FIELDS) add('Stille Zeit', WREATH_LABEL[f], m.wreath[f]);
  for (const k of THREE_KEYS) {
    const mark = e.marks[k];
    const carry = e.carry[k];
    const suffix = [mark ? (marks === 'word' ? MARK_LABEL[mark] : MARK_SYMBOL[mark]) : '', carry ? CARRY_LABEL[carry] : ''].filter(Boolean).join(', ');
    const text = m.three[k];
    if (text || mark) add('Die drei Dinge', THREE_LABEL[k], `${text ?? '—'}${suffix ? ` (${suffix})` : ''}`);
  }
  e.thanks.forEach((t) => add('Abend', 'Dank', t));
  for (const f of EVENING_TEXT_FIELDS) add('Abend', EVENING_FIELD_LABEL[f], e[f]);

  const names = habits.filter((h) => !h.auto && day.habits[h.id]).map((h) => h.name);
  if (names.length) add('Gewohnheiten', 'Gewohnheiten', names.join(', '));
  return out;
}

export function dayToMarkdown(day: Day, habits: readonly Habit[]): string {
  const out: string[] = [`## ${formatLong(day.date)} ${day.date.slice(0, 4)}`, ''];
  const done = prayedOrders(day);
  if (done.length) out.push(`Gebetet: ${done.join(', ')}`, '');
  for (const x of dayEntries(day, habits)) out.push(`- **${x.label}:** ${oneLine(x.value)}`);
  out.push('');
  return out.join('\n');
}

function arenaToMarkdown(entries: readonly ArenaEntry[]): string[] {
  const kept = entries.filter((e) => !isEmptyEntry(e)).sort((a, b) => a.createdAt - b.createdAt);
  if (kept.length === 0) return [];
  const out = ['', '# Arena', ''];
  for (const e of kept) {
    out.push(`## ${new Date(e.createdAt).toLocaleDateString('de-DE')}${e.kind === 'forge' ? ' · Eisenschmiede' : ''}`, '');
    const verses = e.verses.filter((v) => v.trim());
    const concerns = e.concerns.filter((c) => c.trim());
    if (e.meetingDate) out.push(`**Für das Treffen am:** ${new Date(`${e.meetingDate}T12:00:00`).toLocaleDateString('de-DE')}`, '');
    if (verses.length) out.push(`**Bibelstellen:** ${verses.join(' · ')}`, '');
    if (concerns.length) out.push('**Gebetsanliegen:**', ...concerns.map((c) => `- ${c}`), '');
    const points = (e.points ?? []).filter((p) => p.text.trim());
    if (points.length) out.push('**Zum Besprechen:**', ...points.map((p) => `- [${p.done ? 'x' : ' '}] ${p.text.trim()}`), '');
    if (e.text.trim()) out.push(e.text.trim(), '');
    if (e.ink?.length) out.push(`![Handschrift](data:image/svg+xml;base64,${btoa(inkToSvg(e.ink))})`, '');
  }
  return out;
}

function answeredToMarkdown(answered: readonly AnsweredPrayer[]): string[] {
  if (!answered.length) return [];
  return [
    '',
    '# Gebetserhörungen',
    '',
    ...answeredNewestFirst(answered).map(
      (a) =>
        `- ${new Date(`${a.date}T12:00:00`).toLocaleDateString('de-DE')} · ${a.person ? `${a.person} (${ROLE_LABEL[a.role]})` : ROLE_LABEL[a.role]}: ${oneLine(a.concern)}`,
    ),
    '',
  ];
}

export function toMarkdown(
  days: readonly Day[],
  habits: readonly Habit[],
  exportedAt: Date,
  arena: readonly ArenaEntry[] = [],
  answered: readonly AnsweredPrayer[] = [],
): string {
  const kept = days.filter((d) => !isEmptyDay(d)).sort((a, b) => (a.date < b.date ? -1 : 1));
  const head = [
    '# Tagzeiten – Export',
    '',
    `Exportiert am ${exportedAt.toLocaleDateString('de-DE')} · ${kept.length} Tage`,
    '',
  ];
  return [
    ...head,
    ...kept.map((d) => dayToMarkdown(d, habits)),
    ...arenaToMarkdown(arena),
    ...answeredToMarkdown(answered),
  ].join('\n');
}
