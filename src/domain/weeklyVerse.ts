import { FEAST_VERSES, WEEKLY_VERSES, type WeeklyVerse } from '../content/weeklyVerses';
import { churchDay } from './churchYear';
import type { DateKey } from './dates';

export interface VerseOfDay {
  text: string;
  ref: string;
  /** "Wochenspruch" or "Spruch des Tages" (feasts with their own verse). */
  kind: 'week' | 'feast';
}

/** Joins the verbatim excerpts into a sentence: capital start, closing punctuation. */
export function composeVerse(v: WeeklyVerse): string {
  let out = '';
  for (const raw of v.parts) {
    const part = raw.trim();
    const capital = out === '' || /[.!?:]$/.test(out);
    const p = capital ? part[0]!.toUpperCase() + part.slice(1) : part;
    out = out ? `${out} ${p}` : p;
  }
  out = out.replace(/[,;:]$/, '');
  return /[.!?]$/.test(out) ? out : `${out}.`;
}

/** The verse of the day: a feast's own verse, otherwise the weekly verse. */
export function verseOfDay(date: DateKey): VerseOfDay | undefined {
  const c = churchDay(date);
  const feast = c.feast ? FEAST_VERSES[c.feast] : undefined;
  if (feast) return { text: composeVerse(feast), ref: feast.ref, kind: 'feast' };
  const week = WEEKLY_VERSES[c.weekKey];
  return week ? { text: composeVerse(week), ref: week.ref, kind: 'week' } : undefined;
}
