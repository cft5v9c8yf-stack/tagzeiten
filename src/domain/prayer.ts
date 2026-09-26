/**
 * The prayer list: concerns written once, then set on the days they are
 * prayed for – every day, or on certain weekdays. A concern is known by its
 * text; the same text is the same concern.
 */
import type { Weekday } from './dates';
import type { Prayer } from './model';

/** Every day, or one weekday. */
export type PrayerDay = Weekday | 'daily';

export const emptyPrayer = (): Prayer => ({ concerns: [], daily: [], weekly: {} });

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

/** The concerns set on a day. */
export function concernsOn(p: Prayer, day: PrayerDay): string[] {
  return (day === 'daily' ? p.daily : p.weekly[day]) ?? [];
}

function withDay(p: Prayer, day: PrayerDay, list: string[]): Prayer {
  if (day === 'daily') return { ...p, daily: list };
  const weekly = { ...p.weekly };
  if (list.length) weekly[day] = list;
  else delete weekly[day];
  return { ...p, weekly };
}

/** Writes a concern into the list and, if a day is given, sets it on that day. */
export function addConcern(p: Prayer, text: string, day?: PrayerDay): Prayer {
  const t = clean(text);
  if (!t) return p;
  const next = p.concerns.includes(t) ? p : { ...p, concerns: [...p.concerns, t] };
  if (day === undefined) return next;
  const on = concernsOn(next, day);
  return on.includes(t) ? next : withDay(next, day, [...on, t]);
}

/** Takes a concern off one day; without a day, out of the list and off every day. */
export function removeConcern(p: Prayer, text: string, day?: PrayerDay): Prayer {
  if (day !== undefined) return withDay(p, day, concernsOn(p, day).filter((c) => c !== text));
  const weekly: Prayer['weekly'] = {};
  for (const [k, list] of Object.entries(p.weekly) as [string, string[]][]) {
    const rest = list.filter((c) => c !== text);
    if (rest.length) weekly[Number(k) as Weekday] = rest;
  }
  return { concerns: p.concerns.filter((c) => c !== text), daily: p.daily.filter((c) => c !== text), weekly };
}

/**
 * Brings a stored prayer list into shape. Earlier versions kept one free text
 * for every day and one per weekday; each such text becomes a concern.
 */
export function normalizePrayer(raw: unknown): Prayer {
  let p = emptyPrayer();
  if (!raw || typeof raw !== 'object') return p;
  const r = raw as { concerns?: unknown; daily?: unknown; weekly?: unknown };
  const texts = (v: unknown): string[] =>
    typeof v === 'string' ? [v] : Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  for (const c of texts(r.concerns)) p = addConcern(p, c);
  for (const c of texts(r.daily)) p = addConcern(p, c, 'daily');
  if (r.weekly && typeof r.weekly === 'object') {
    for (const [k, v] of Object.entries(r.weekly)) {
      const n = Number(k);
      if (!Number.isInteger(n) || n < 0 || n > 6) continue;
      for (const c of texts(v)) p = addConcern(p, c, n as Weekday);
    }
  }
  return p;
}
