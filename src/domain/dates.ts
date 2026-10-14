/**
 * Calendar helpers. Days are identified by a local-time key "YYYY-MM-DD".
 * Weekday numbers follow Date.getDay(): 0 = Sunday … 6 = Saturday.
 */

export type DateKey = string;
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const WEEKDAY_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'] as const;
export const WEEKDAY_LONG = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
] as const;
export const MONTH_LONG = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const;

const pad = (n: number) => String(n).padStart(2, '0');

export function toKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey(now: Date = new Date()): DateKey {
  return toKey(now);
}

/** True if the string is a real calendar date in key form. */
export function isDateKey(s: string | null | undefined): s is DateKey {
  if (!s) return false;
  const m = KEY_RE.exec(s);
  if (!m) return false;
  const d = fromKey(s);
  return toKey(d) === s;
}

export function fromKey(k: DateKey): Date {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function addDays(k: DateKey, n: number): DateKey {
  const d = fromKey(k);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function weekdayOf(k: DateKey): Weekday {
  return fromKey(k).getDay() as Weekday;
}

/** Monday-based index: Mo = 0 … So = 6 (used by the catechism table). */
export function mondayIndex(k: DateKey): number {
  return (weekdayOf(k) + 6) % 7;
}

export function mondayOf(k: DateKey): DateKey {
  return addDays(k, -mondayIndex(k));
}

/** ISO 8601 week number. */
export function isoWeek(k: DateKey): number {
  const d = fromKey(k);
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const n = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - n);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
}

/** "Freitag, 25. September" */
export function formatLong(k: DateKey): string {
  const d = fromKey(k);
  return `${WEEKDAY_LONG[d.getDay()]}, ${d.getDate()}. ${MONTH_LONG[d.getMonth()]}`;
}

/** "Fr 25.9." */
export function formatShort(k: DateKey): string {
  const d = fromKey(k);
  return `${WEEKDAY_SHORT[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`;
}
