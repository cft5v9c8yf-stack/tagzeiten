/**
 * "28 Tage für Ehemänner" (1.43): a plan of days walked in a Wüstenzeit of 28
 * days. Day n is the n-th day of the Wüstenzeit; a step missed stays open and
 * can be ticked later. What is ticked is documented, never rated: no count,
 * no chain, nothing owed (rules 4 and 6).
 */
import { HUSBAND_PACK } from '../content/desert';
import { WAY_DAYS, WAY_DAYS_TEXT, WAY_WEEKS, type WayDay, type WayWeek } from '../content/husbandWay';
import type { DateKey } from './dates';
import { hasWife } from './house';
import type { ArenaEntry, Profile } from './model';
import { dayNumber, type WinterArcData, type WinterArcRun } from './winterArc';

export const isWayRun = (run: Pick<WinterArcRun, 'way'> | undefined): boolean => run?.way === 'husband';

/** The plan is offered only with a wife in "Mein Haus". */
export const wayOffered = (p: Pick<Profile, 'house'>): boolean => hasWife(p.house);

/** The day of the plan a date falls on: 1 to 28; undefined before the first day. */
export function wayDayOn(run: Pick<WinterArcRun, 'startDate' | 'durationDays'>, date: DateKey): number | undefined {
  const n = dayNumber(run.startDate, date);
  if (n < 1) return undefined;
  return Math.min(n, run.durationDays, WAY_DAYS);
}

export const wayDayText = (n: number): WayDay | undefined => WAY_DAYS_TEXT.find((d) => d.tag === n);

export const wayWeekText = (n: number): WayWeek | undefined => WAY_WEEKS.find((w) => w.nummer === n);

export const stepDone = (run: Pick<WinterArcRun, 'wayDone'>, n: number): boolean => !!run.wayDone?.includes(n);

/** Whether the step of a day can be ticked today: from its day on, never ahead. */
export const canTickStep = (run: Pick<WinterArcRun, 'startDate' | 'durationDays'>, n: number, today: DateKey): boolean =>
  n >= 1 && n <= WAY_DAYS && dayNumber(run.startDate, today) >= n;

const setRun = (data: WinterArcData, runId: string, fn: (r: WinterArcRun) => WinterArcRun): WinterArcData => ({
  ...data,
  runs: data.runs.map((r) => (r.id === runId && isWayRun(r) ? fn(r) : r)),
});

/** Ticks the step of a day, or takes the tick away. */
export function toggleStep(data: WinterArcData, runId: string, n: number, now: number): WinterArcData {
  return setRun(data, runId, (r) => {
    const done = r.wayDone ?? [];
    const next = done.includes(n) ? done.filter((x) => x !== n) : [...done, n].sort((a, b) => a - b);
    return { ...r, wayDone: next, updatedAt: now };
  });
}

export const markIntroSeen = (data: WinterArcData, runId: string, now: number): WinterArcData =>
  setRun(data, runId, (r) => ({ ...r, wayIntroSeen: true, updatedAt: now }));

/** The habits that come along at the beginning: the core and the weekly ones. */
export const WAY_START_HABITS: readonly string[] = HUSBAND_PACK.habits.filter((h) => h.art !== 'wahl').map((h) => h.id);

/** The journal entry answering the question of a day, if written. */
export const wayEntryOf = (entries: readonly ArenaEntry[], runId: string, n: number): ArenaEntry | undefined =>
  entries.find((e) => e.kind === 'desert' && e.wayRun === runId && e.wayDay === n);

/** The entries of a Wüstenzeit, by day. */
export const wayEntries = (entries: readonly ArenaEntry[], runId: string): ArenaEntry[] =>
  entries.filter((e) => e.kind === 'desert' && e.wayRun === runId).sort((a, b) => a.wayDay! - b.wayDay! || a.createdAt - b.createdAt);
