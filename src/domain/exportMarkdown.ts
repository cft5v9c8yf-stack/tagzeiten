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
import { getPlan, portionLabel } from './readingPlan';
import { CARRY_LABEL, MARK_SYMBOL, THREE_LABEL } from './review';

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

export function dayToMarkdown(day: Day, habits: readonly Habit[]): string {
  const m = day.morning;
  const e = day.evening;
  const out: string[] = [`## ${formatLong(day.date)} ${day.date.slice(0, 4)}`, ''];
  const line = (label: string, v: string | undefined) => {
    if (v && v.trim()) out.push(`- **${label}:** ${oneLine(v)}`);
  };

  const done: string[] = [];
  if (m.done) done.push(m.form === 'short' ? 'Stille Zeit (Kurzform)' : 'Stille Zeit');
  if (e.vespersDone) done.push('Vesper');
  if (e.complineDone) done.push(e.complineForm === 'short' ? 'Nachtgebet (Kurzform)' : 'Nachtgebet');
  if (done.length) out.push(`Gebetet: ${done.join(', ')}`, '');

  const reading = readingLabel(day);
  if (reading) line(day.reading?.done ? 'Lesung (gelesen)' : 'Lesung', reading);
  for (const f of MORNING_TEXT_FIELDS) {
    if (f === 'questionAnswer' && m.questionNo !== undefined) {
      line(`Frage: ${SEVEN_QUESTIONS[m.questionNo]}`, m[f] || '—');
    } else line(MORNING_FIELD_LABEL[f], m[f]);
  }
  for (const f of WREATH_FIELDS) line(WREATH_LABEL[f], m.wreath[f]);
  for (const k of THREE_KEYS) {
    const mark = e.marks[k];
    const carry = e.carry[k];
    const suffix = [mark ? MARK_SYMBOL[mark] : '', carry ? CARRY_LABEL[carry] : ''].filter(Boolean).join(', ');
    const text = m.three[k];
    if (text || mark) line(THREE_LABEL[k], `${text ?? '—'}${suffix ? ` (${suffix})` : ''}`);
  }
  e.thanks.forEach((t) => line('Dank', t));
  for (const f of EVENING_TEXT_FIELDS) line(EVENING_FIELD_LABEL[f], e[f]);

  const names = habits.filter((h) => !h.auto && day.habits[h.id]).map((h) => h.name);
  if (names.length) line('Gewohnheiten', names.join(', '));
  out.push('');
  return out.join('\n');
}

function arenaToMarkdown(entries: readonly ArenaEntry[]): string[] {
  const kept = entries.filter((e) => !isEmptyEntry(e)).sort((a, b) => a.createdAt - b.createdAt);
  if (kept.length === 0) return [];
  const out = ['', '# Arena', ''];
  for (const e of kept) {
    out.push(`## ${new Date(e.createdAt).toLocaleDateString('de-DE')}`, '');
    const verses = e.verses.filter((v) => v.trim());
    const concerns = e.concerns.filter((c) => c.trim());
    if (verses.length) out.push(`**Bibelstellen:** ${verses.join(' · ')}`, '');
    if (concerns.length) out.push('**Gebetsanliegen:**', ...concerns.map((c) => `- ${c}`), '');
    if (e.text.trim()) out.push(e.text.trim(), '');
  }
  return out;
}

export function toMarkdown(
  days: readonly Day[],
  habits: readonly Habit[],
  exportedAt: Date,
  arena: readonly ArenaEntry[] = [],
): string {
  const kept = days.filter((d) => !isEmptyDay(d)).sort((a, b) => (a.date < b.date ? -1 : 1));
  const head = [
    '# Tagzeiten – Export',
    '',
    `Exportiert am ${exportedAt.toLocaleDateString('de-DE')} · ${kept.length} Tage`,
    '',
  ];
  return [...head, ...kept.map((d) => dayToMarkdown(d, habits)), ...arenaToMarkdown(arena)].join('\n');
}
