/**
 * The Winter Arc: a round of daily, weekly and monthly ticks over a chosen
 * number of calendar days. Only plain calendar dates are used (no clock time),
 * so summer and winter time shift nothing.
 *
 * Nothing here counts or rates (rules 4–6): a tick is kept, an open box is
 * simply open.
 */
import { addDays, fromKey, isDateKey, type DateKey, type Weekday } from './dates';

/* ------------------------------------------------------------ types */

export const DAILY_ITEMS = [
  'wake',
  'word',
  'journal',
  'train',
  'cook',
  'dinner',
  'wife',
  'kitchen',
  'phone',
  'night',
] as const;
export type WinterArcItemId = (typeof DAILY_ITEMS)[number];

export const WEEKLY_ITEMS = ['church', 'talk', 'date', 'money'] as const;
export type WinterArcWeeklyId = (typeof WEEKLY_ITEMS)[number];

/** "Meine Zeiten": the times named in the checklist. */
export interface WinterArcTimes {
  wake: string;
  kitchen: string;
  night: string;
}

export interface WinterArcSettings {
  /** On which weekdays each daily point applies; on the others it shows "–". */
  weekdays: Record<WinterArcItemId, Weekday[]>;
  times: WinterArcTimes;
  /** Points switched off by the user (daily, weekly, or "serve" for the monthly one); their ticks stay. */
  off: WinterArcPointId[];
}

/** Every point of the Winter Arc that can be switched off. */
export type WinterArcPointId = WinterArcItemId | WinterArcWeeklyId | 'serve';
const POINT_IDS: readonly string[] = [...DAILY_ITEMS, ...WEEKLY_ITEMS, 'serve'];

/** Whether a point is switched on. */
export const isOn = (settings: WinterArcSettings, id: WinterArcPointId): boolean => !settings.off.includes(id);

export type WinterArcStatus = 'active' | 'ended';

export interface WinterArcRun {
  id: string;
  /** What the user calls the round, e.g. "Winter Arc" or "Fastenzeit"; empty means the plan's name. */
  name?: string;
  startDate: DateKey;
  durationDays: number;
  status: WinterArcStatus;
  createdAt: number;
  updatedAt: number;
}

export interface WinterArcDay {
  runId: string;
  date: DateKey;
  checks: Partial<Record<WinterArcItemId, true>>;
  updatedAt: number;
}

export interface WinterArcReview {
  win: string;
  slipped: string;
  lesson: string;
}

export interface WinterArcWeek {
  runId: string;
  week: number;
  weeklyChecks: Partial<Record<WinterArcWeeklyId, true>>;
  review: WinterArcReview;
  updatedAt: number;
}

export interface WinterArcMonth {
  runId: string;
  /** Calendar month, "YYYY-MM". */
  month: string;
  served: boolean;
  updatedAt: number;
}

export interface WinterArcData {
  runs: WinterArcRun[];
  days: WinterArcDay[];
  weeks: WinterArcWeek[];
  months: WinterArcMonth[];
}

export type WinterArcPhase = 'Disziplin' | 'Dienst' | 'Leitung';

/* ------------------------------------------------------------ defaults */

export const MIN_DURATION = 1;
export const MAX_DURATION = 365;
export const DEFAULT_DURATION = 90;
export const QUICK_DURATIONS = [40, 60, 90] as const;
/** The plan has thirteen weekly focuses. */
export const FOCUS_COUNT = 13;

const ALL_DAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
const WORKDAYS: Weekday[] = [1, 2, 3, 4, 5];

export const DEFAULT_TIMES: WinterArcTimes = {
  wake: '04:00',
  kitchen: '20:00',
  night: '21:00',
};

export function defaultWinterArcSettings(): WinterArcSettings {
  const weekdays = {} as Record<WinterArcItemId, Weekday[]>;
  for (const id of DAILY_ITEMS) {
    weekdays[id] = id === 'train' ? [...WORKDAYS] : [...ALL_DAYS];
  }
  return { weekdays, times: { ...DEFAULT_TIMES }, off: [] };
}

export const emptyWinterArc = (): WinterArcData => ({ runs: [], days: [], weeks: [], months: [] });

export const emptyReview = (): WinterArcReview => ({ win: '', slipped: '', lesson: '' });

/* ------------------------------------------------------------ calendar */

const utc = (k: DateKey) => {
  const [y, m, d] = k.split('-').map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
};

/** Calendar days from a to b (negative if b lies before a). */
export function daysBetween(a: DateKey, b: DateKey): number {
  return Math.round((utc(b) - utc(a)) / 864e5);
}

/** The last day of the round: start + duration − 1. */
export function endDateOf(start: DateKey, durationDays: number): DateKey {
  return addDays(start, durationDays - 1);
}

/** Day n of the round (the start is day 1); may lie outside 1…D. */
export function dayNumber(start: DateKey, date: DateKey): number {
  return daysBetween(start, date) + 1;
}

export const weekOfDay = (n: number): number => Math.ceil(n / 7);

export const totalWeeks = (durationDays: number): number => Math.ceil(durationDays / 7);

/** Which of the thirteen weekly focuses belongs to week w of W. */
export function focusOf(week: number, weeks: number): number {
  if (weeks <= 1) return FOCUS_COUNT;
  return 1 + Math.round(((week - 1) * (FOCUS_COUNT - 1)) / (weeks - 1));
}

export function phaseOf(focus: number): WinterArcPhase {
  if (focus <= 4) return 'Disziplin';
  if (focus <= 8) return 'Dienst';
  return 'Leitung';
}

/** The seven dates of week w, counted from the start (not from Monday). */
export function weekDates(start: DateKey, week: number): DateKey[] {
  const first = addDays(start, (week - 1) * 7);
  return Array.from({ length: 7 }, (_, i) => addDays(first, i));
}

export function isInRun(run: Pick<WinterArcRun, 'startDate' | 'durationDays'>, date: DateKey): boolean {
  const n = dayNumber(run.startDate, date);
  return n >= 1 && n <= run.durationDays;
}

/** Before the start, during the round, or after its last day. */
export function stageOf(
  run: Pick<WinterArcRun, 'startDate' | 'durationDays'>,
  today: DateKey,
): 'before' | 'during' | 'after' {
  const n = dayNumber(run.startDate, today);
  if (n < 1) return 'before';
  return n > run.durationDays ? 'after' : 'during';
}

/** Where a date stands in a round: day, week, focus and phase. */
export function positionOf(run: Pick<WinterArcRun, 'startDate' | 'durationDays'>, date: DateKey) {
  const D = run.durationDays;
  const day = Math.min(Math.max(dayNumber(run.startDate, date), 1), D);
  const week = weekOfDay(day);
  const weeks = totalWeeks(D);
  const focus = focusOf(week, weeks);
  return { day, days: D, week, weeks, focus, phase: phaseOf(focus) };
}

/** The calendar month of a date, "YYYY-MM"; the monthly point counts for it. */
export const monthOf = (date: DateKey): string => date.slice(0, 7);

export const isValidDuration = (n: number): boolean => Number.isInteger(n) && n >= MIN_DURATION && n <= MAX_DURATION;

/* ------------------------------------------------------------ rounds */

export function activeRun(data: WinterArcData): WinterArcRun | undefined {
  return data.runs.find((r) => r.status === 'active');
}

/** Ends the round under way (if any) and begins a new one. Nothing is deleted. */
export function startRun(
  data: WinterArcData,
  startDate: DateKey,
  durationDays: number,
  now: number,
  id = `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  name = '',
): WinterArcData {
  const run: WinterArcRun = { id, startDate, durationDays, status: 'active', createdAt: now, updatedAt: now };
  const n = cleanName(name);
  if (n) run.name = n;
  const ended = endRun(data, now);
  return { ...ended, runs: [...ended.runs, run] };
}

/** Marks the round under way as ended; its entries stay. */
export function endRun(data: WinterArcData, now: number): WinterArcData {
  if (!activeRun(data)) return data;
  return {
    ...data,
    runs: data.runs.map((r) => (r.status === 'active' ? { ...r, status: 'ended', updatedAt: now } : r)),
  };
}

/* ------------------------------------------------------------ normalizing */

export const NAME_MAX = 60;
export const DEFAULT_RUN_NAME = 'Winter Arc';
const cleanName = (s: string) => s.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
/** The name a round goes by. */
export const runName = (run: Pick<WinterArcRun, 'name'>): string => run.name || DEFAULT_RUN_NAME;

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object';
const num = (x: unknown, fallback = 0) => (typeof x === 'number' && Number.isFinite(x) ? x : fallback);
const str = (x: unknown) => (typeof x === 'string' ? x : '');

function flags<K extends string>(raw: unknown, keys: readonly K[]): Partial<Record<K, true>> {
  const out: Partial<Record<K, true>> = {};
  if (!isObj(raw)) return out;
  for (const k of keys) if (raw[k] === true) out[k] = true;
  return out;
}

/** Cleans stored or imported rounds; entries of unknown rounds are dropped. */
export function normalizeWinterArc(raw: Partial<WinterArcData> | undefined): WinterArcData {
  if (!isObj(raw)) return emptyWinterArc();
  const runs: WinterArcRun[] = [];
  for (const r of Array.isArray(raw.runs) ? raw.runs : []) {
    if (!isObj(r) || typeof r.id !== 'string' || !r.id || r.id.includes('|')) continue;
    if (!isDateKey(r.startDate as string) || !isValidDuration(r.durationDays as number)) continue;
    if (runs.some((x) => x.id === r.id)) continue;
    const name = cleanName(str(r.name));
    runs.push({
      id: r.id,
      ...(name ? { name } : {}),
      startDate: r.startDate as DateKey,
      durationDays: r.durationDays as number,
      status: r.status === 'active' ? 'active' : 'ended',
      createdAt: num(r.createdAt),
      updatedAt: num(r.updatedAt),
    });
  }
  // At most one round is under way: the newest.
  const active = runs.filter((r) => r.status === 'active').sort((a, b) => b.createdAt - a.createdAt);
  for (const r of active.slice(1)) r.status = 'ended';
  const known = new Set(runs.map((r) => r.id));
  const days = (Array.isArray(raw.days) ? raw.days : [])
    .filter((d): d is WinterArcDay => isObj(d) && known.has(d.runId as string) && isDateKey(d.date as string))
    .map((d) => ({ runId: d.runId, date: d.date, checks: flags(d.checks, DAILY_ITEMS), updatedAt: num(d.updatedAt) }));
  const weeks = (Array.isArray(raw.weeks) ? raw.weeks : [])
    .filter(
      (w): w is WinterArcWeek =>
        isObj(w) && known.has(w.runId as string) && Number.isInteger(w.week) && (w.week as number) >= 1,
    )
    .map((w) => ({
      runId: w.runId,
      week: w.week,
      weeklyChecks: flags(w.weeklyChecks, WEEKLY_ITEMS),
      review: isObj(w.review)
        ? { win: str(w.review.win), slipped: str(w.review.slipped), lesson: str(w.review.lesson) }
        : emptyReview(),
      updatedAt: num(w.updatedAt),
    }));
  const months = (Array.isArray(raw.months) ? raw.months : [])
    .filter(
      (m): m is WinterArcMonth =>
        isObj(m) && known.has(m.runId as string) && /^\d{4}-(0[1-9]|1[0-2])$/.test(str(m.month)),
    )
    .map((m) => ({ runId: m.runId, month: m.month, served: m.served === true, updatedAt: num(m.updatedAt) }));
  return { runs, days, weeks, months };
}

const CLOCK_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidTime(key: keyof WinterArcTimes, value: string): boolean {
  return key in DEFAULT_TIMES && CLOCK_RE.test(value);
}

export function normalizeWinterArcSettings(raw: Partial<WinterArcSettings> | undefined): WinterArcSettings {
  const base = defaultWinterArcSettings();
  if (!isObj(raw)) return base;
  if (isObj(raw.weekdays)) {
    for (const id of DAILY_ITEMS) {
      const v = (raw.weekdays as Record<string, unknown>)[id];
      if (!Array.isArray(v)) continue;
      base.weekdays[id] = ALL_DAYS.filter((d) => v.includes(d));
    }
  }
  if (isObj(raw.times)) {
    for (const k of Object.keys(base.times) as (keyof WinterArcTimes)[]) {
      const v = (raw.times as Record<string, unknown>)[k];
      if (typeof v === 'string' && isValidTime(k, v)) base.times[k] = v;
    }
  }
  if (Array.isArray(raw.off)) {
    base.off = POINT_IDS.filter((id) => (raw.off as unknown[]).includes(id)) as WinterArcPointId[];
  }
  return base;
}

/** Switches a point on or off. */
export function setPointOn(settings: WinterArcSettings, id: WinterArcPointId, on: boolean): WinterArcSettings {
  const off = settings.off.filter((x) => x !== id);
  return { ...settings, off: on ? off : [...off, id] };
}

/* ------------------------------------------------------------ ticks */

/** Whether a daily point applies on a date (by the weekdays chosen for it). */
export function appliesOn(settings: WinterArcSettings, item: WinterArcItemId, date: DateKey): boolean {
  return settings.weekdays[item].includes(fromKey(date).getDay() as Weekday);
}

export function dayOf(data: WinterArcData, runId: string, date: DateKey): WinterArcDay | undefined {
  return data.days.find((d) => d.runId === runId && d.date === date);
}

export function weekOf(data: WinterArcData, runId: string, week: number): WinterArcWeek | undefined {
  return data.weeks.find((w) => w.runId === runId && w.week === week);
}

/** The monthly point counts for the whole calendar month, in every week of it. */
export function servedIn(data: WinterArcData, runId: string, month: string): boolean {
  return data.months.some((m) => m.runId === runId && m.month === month && m.served);
}

/** The calendar months a week of the round touches, in order. */
export function monthsOfWeek(run: Pick<WinterArcRun, 'startDate' | 'durationDays'>, week: number): string[] {
  const out: string[] = [];
  for (const d of weekDates(run.startDate, week)) {
    if (isInRun(run, d) && !out.includes(monthOf(d))) out.push(monthOf(d));
  }
  return out;
}

/** The last day of a week that lies within the round (the last week may be shorter). */
export function lastDayOfWeek(run: Pick<WinterArcRun, 'startDate' | 'durationDays'>, week: number): DateKey {
  const days = weekDates(run.startDate, week).filter((d) => isInRun(run, d));
  return days[days.length - 1] ?? run.startDate;
}

const replaceOrAdd = <T>(list: readonly T[], match: (x: T) => boolean, next: T): T[] =>
  list.some(match) ? list.map((x) => (match(x) ? next : x)) : [...list, next];

export function toggleCheck(
  data: WinterArcData,
  runId: string,
  date: DateKey,
  item: WinterArcItemId,
  now: number,
): WinterArcData {
  const cur = dayOf(data, runId, date);
  const checks = { ...(cur?.checks ?? {}) };
  if (checks[item]) delete checks[item];
  else checks[item] = true;
  const next: WinterArcDay = { runId, date, checks, updatedAt: now };
  return { ...data, days: replaceOrAdd(data.days, (d) => d.runId === runId && d.date === date, next) };
}

function updateWeek(
  data: WinterArcData,
  runId: string,
  week: number,
  fn: (w: WinterArcWeek) => WinterArcWeek,
  now: number,
): WinterArcData {
  const cur = weekOf(data, runId, week) ?? { runId, week, weeklyChecks: {}, review: emptyReview(), updatedAt: 0 };
  const next = { ...fn(cur), runId, week, updatedAt: now };
  return { ...data, weeks: replaceOrAdd(data.weeks, (w) => w.runId === runId && w.week === week, next) };
}

export function toggleWeekly(
  data: WinterArcData,
  runId: string,
  week: number,
  item: WinterArcWeeklyId,
  now: number,
): WinterArcData {
  return updateWeek(
    data,
    runId,
    week,
    (w) => {
      const weeklyChecks = { ...w.weeklyChecks };
      if (weeklyChecks[item]) delete weeklyChecks[item];
      else weeklyChecks[item] = true;
      return { ...w, weeklyChecks };
    },
    now,
  );
}

export function setReview(
  data: WinterArcData,
  runId: string,
  week: number,
  key: keyof WinterArcReview,
  text: string,
  now: number,
): WinterArcData {
  return updateWeek(data, runId, week, (w) => ({ ...w, review: { ...w.review, [key]: text } }), now);
}

export function toggleServed(data: WinterArcData, runId: string, month: string, now: number): WinterArcData {
  const next: WinterArcMonth = { runId, month, served: !servedIn(data, runId, month), updatedAt: now };
  return { ...data, months: replaceOrAdd(data.months, (m) => m.runId === runId && m.month === month, next) };
}

export const hasReview = (w: WinterArcWeek | undefined): boolean =>
  !!w && !!(w.review.win.trim() || w.review.slipped.trim() || w.review.lesson.trim());

/**
 * "Heute" is in the mode of the Streithalle for a calendar week (Mo–So) when a
 * round under way touches it: its habits then stand in place of the usual ones.
 */
export function hallModeIn(data: WinterArcData, date: DateKey): boolean {
  const run = activeRun(data);
  if (!run) return false;
  const monday = addDays(date, -((fromKey(date).getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i)).some((d) => isInRun(run, d));
}
