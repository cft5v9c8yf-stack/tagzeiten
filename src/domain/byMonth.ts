import { MONTH_LONG, type DateKey } from './dates';

export interface MonthGroup<T> {
  /** "2026-09" */
  key: string;
  month: string;
  items: T[];
}

export interface YearGroup<T> {
  year: number;
  months: MonthGroup<T>[];
}

/** Items grouped by year and month, newest first, and newest first within each month. */
export function byYearAndMonth<T>(items: readonly T[], dateOf: (t: T) => DateKey): YearGroup<T>[] {
  const sorted = [...items].sort((a, b) => (dateOf(a) < dateOf(b) ? 1 : dateOf(a) > dateOf(b) ? -1 : 0));
  const years: YearGroup<T>[] = [];
  for (const item of sorted) {
    const d = dateOf(item);
    const year = Number(d.slice(0, 4));
    const key = d.slice(0, 7);
    let y = years[years.length - 1];
    if (!y || y.year !== year) years.push((y = { year, months: [] }));
    let m = y.months[y.months.length - 1];
    if (!m || m.key !== key) y.months.push((m = { key, month: MONTH_LONG[Number(d.slice(5, 7)) - 1]!, items: [] }));
    m.items.push(item);
  }
  return years;
}
