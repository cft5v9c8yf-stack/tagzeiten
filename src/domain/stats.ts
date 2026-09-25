/**
 * Documented progress, never judged (rule 4). Missing days are neutral:
 * the state is "none", which the UI renders in grey (rule 5).
 */
import { addDays, type DateKey } from './dates';
import { THREE_KEYS, type Day, type Mark } from './model';
import type { DayLookup } from './habits';

export type DotState = 'none' | 'one' | 'both';

export interface LookbackDot {
  date: DateKey;
  state: DotState;
}

/** The last `n` days up to and including `end`: morning and compline prayed? */
export function lookback(lookup: DayLookup, end: DateKey, n = 28): LookbackDot[] {
  return Array.from({ length: n }, (_, i) => {
    const date = addDays(end, i - (n - 1));
    const d = lookup(date);
    const count = Number(!!d?.morning.done) + Number(!!d?.evening.complineDone);
    return { date, state: count === 2 ? 'both' : count === 1 ? 'one' : 'none' };
  });
}

function lastDays(lookup: DayLookup, end: DateKey, n: number): Day[] {
  const out: Day[] = [];
  for (let i = 0; i < n; i++) {
    const d = lookup(addDays(end, -i));
    if (d) out.push(d);
  }
  return out;
}

export function stillTimesIn(lookup: DayLookup, end: DateKey, n = 30): number {
  return lastDays(lookup, end, n).filter((d) => d.morning.done).length;
}

export function markCounts(lookup: DayLookup, end: DateKey, n = 30): Record<Mark, number> {
  const counts: Record<Mark, number> = { plus: 0, tilde: 0, minus: 0 };
  for (const d of lastDays(lookup, end, n)) {
    for (const k of THREE_KEYS) {
      const m = d.evening.marks[k];
      if (m) counts[m]++;
    }
  }
  return counts;
}

export interface CollectedVerse {
  date: DateKey;
  verse: string;
  ref?: string;
}

/** All "Vers, den ich mitnehme", newest first. */
export function collectedVerses(days: Iterable<Day>): CollectedVerse[] {
  const out: CollectedVerse[] = [];
  for (const d of days) {
    const verse = d.morning.verse?.trim();
    if (verse) out.push({ date: d.date, verse, ref: d.morning.verseRef?.trim() || undefined });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}
