import { SUNDAY_INFO } from '../content/churchYearGuide';
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

/** Feasts on weekdays that have readings of their own. */
const FEAST_KEYS: Record<string, string> = {
  Gründonnerstag: 'maundyThursday',
  Karfreitag: 'goodFriday',
  Ostermontag: 'easterMonday',
  'Christi Himmelfahrt': 'ascension',
  Pfingstmontag: 'pentecostMonday',
};

export interface ReadingsOfDay {
  gospel: string;
  epistle: string;
  /** Whether the readings belong to a feast on this day or to the week's Sunday. */
  kind: 'week' | 'feast';
}

/** Gospel and Epistle: a feast's own readings, otherwise those of the week's Sunday. */
export function readingsOfDay(date: DateKey): ReadingsOfDay | undefined {
  const c = churchDay(date);
  const feastKey = c.feast ? FEAST_KEYS[c.feast] : undefined;
  const feast = feastKey ? SUNDAY_INFO[feastKey] : undefined;
  if (feast) return { gospel: feast.gospel, epistle: feast.epistle, kind: 'feast' };
  const week = SUNDAY_INFO[c.weekKey];
  return week ? { gospel: week.gospel, epistle: week.epistle, kind: 'week' } : undefined;
}
