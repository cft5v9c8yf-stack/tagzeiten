/**
 * Full-text search over the archive: every text of a day, its reading and its
 * date. All words of the query must occur (case-insensitive).
 */
import { formatLong } from './dates';
import { readingLabel } from './exportMarkdown';
import { EVENING_TEXT_FIELDS, MORNING_TEXT_FIELDS, THREE_KEYS, WREATH_FIELDS, type Day } from './model';

const normalize = (s: string) => s.toLocaleLowerCase('de-DE').normalize('NFC');

export function dayText(day: Day): string {
  const m = day.morning;
  const e = day.evening;
  return normalize(
    [
      day.date,
      formatLong(day.date),
      readingLabel(day),
      ...MORNING_TEXT_FIELDS.map((f) => m[f] ?? ''),
      ...WREATH_FIELDS.map((f) => m.wreath[f] ?? ''),
      ...THREE_KEYS.map((k) => m.three[k] ?? ''),
      ...EVENING_TEXT_FIELDS.map((f) => e[f] ?? ''),
      ...e.thanks,
    ].join('\n'),
  );
}

export function searchDays(days: readonly Day[], query: string): Day[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [...days];
  return days.filter((d) => {
    const text = dayText(d);
    return terms.every((t) => text.includes(t));
  });
}
