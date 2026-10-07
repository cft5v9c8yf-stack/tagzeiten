/**
 * The Wüstenzeit (since 0.39): a round of the Arena whose habits are habits of
 * the profile, ticked like all others. The round keeps its span, the ids of the
 * habits chosen for it and its weekly reviews; the ticks live in the days.
 *
 * Kept is documented, never rated (rule 4): no quota, no streak; a day left
 * open is simply open, and the next one begins anew.
 */
import { DESERT_HABITS, DESERT_PACKS, DESERT_VERSE, type DesertHabit, type DesertVerse } from '../content/desert';
import { firstAdvent } from './churchYear';
import { addDays, mondayOf, weekdayOf, type DateKey } from './dates';
import { fitsHouse, isDoneOn, isPerDay, periodDates, type DayLookup } from './habits';
import type { Habit, Profile, Rhythm } from './model';
import { activeRun, endDateOf, isInRun, lastDayOfWeek, startRun, type WinterArcData, type WinterArcRun } from './winterArc';
import { pointsOf } from './winterArcPoints';

export const DEFAULT_DESERT_DAYS = 40;
export const QUICK_DESERT_DAYS = [40, 90] as const;

/** A Wüstenzeit, as against a round of the Streithalle from before 0.39. */
export const isDesert = (run: WinterArcRun): boolean => Array.isArray(run.habits);

/** The Wüstenzeit under way (begun, running, or over but not yet closed). */
export function activeDesert(data: WinterArcData): WinterArcRun | undefined {
  const run = activeRun(data);
  return run && isDesert(run) ? run : undefined;
}

/** Begins a Wüstenzeit with the habits chosen; a round under way is ended, nothing is deleted. */
export function startDesert(
  data: WinterArcData,
  startDate: DateKey,
  durationDays: number,
  now: number,
  habits: readonly string[],
  id?: string,
): WinterArcData {
  const next = startRun(data, startDate, durationDays, now, id);
  const run = next.runs[next.runs.length - 1]!;
  return { ...next, runs: next.runs.map((r) => (r === run ? { ...r, habits: [...new Set(habits)] } : r)) };
}

/* ------------------------------------------------------------ the offer */

const ORDER = new Map(DESERT_HABITS.map((h, i) => [h.id, i]));

/** The offer a habit comes from, if any. */
export const offerOf = (id: string): DesertHabit | undefined => DESERT_HABITS.find((h) => h.id === id);

/** The package a habit belongs to; undefined for the further ones and the user's own. */
export const packOf = (id: string) => DESERT_PACKS.find((p) => p.habits.some((h) => h.id === id));

/** A habit of the offer as a habit of the profile: off in everyday life until taken over. */
export function habitFromOffer(o: DesertHabit): Habit {
  return {
    id: o.id,
    name: o.name,
    rhythm: o.rhythm,
    auto: null,
    active: false,
    preset: false,
    focus: false,
    desert: packOf(o.id)?.id ?? 'more',
    ...(o.days ? { days: [...o.days] } : {}),
    ...(o.advent ? { advent: true as const } : {}),
    ...(o.needs ? { needs: o.needs } : {}),
  };
}

/** What the "i" tells about a habit: its short description and, if any, the background. */
export function infoOf(h: Pick<Habit, 'id' | 'note'>): { note?: string; about?: string } {
  const o = offerOf(h.id);
  return o ? { note: o.note, about: o.about } : { note: h.note };
}

/** The habits of a Wüstenzeit that "Mein Haus" allows, in the order of the offer, own ones last. */
export function habitsOf(run: WinterArcRun, profile: Pick<Profile, 'habits' | 'house'>): Habit[] {
  const ids = run.habits ?? [];
  const rank = (id: string) => ORDER.get(id) ?? DESERT_HABITS.length + ids.indexOf(id);
  return ids
    .map((id) => profile.habits.find((h) => h.id === id))
    .filter((h): h is Habit => !!h && fitsHouse(h, profile.house))
    .sort((a, b) => rank(a.id) - rank(b.id));
}

const setIds = (data: WinterArcData, runId: string, fn: (ids: string[]) => string[], now: number): WinterArcData => ({
  ...data,
  runs: data.runs.map((r) => (r.id === runId ? { ...r, habits: [...new Set(fn(r.habits ?? []))], updatedAt: now } : r)),
});

/** Takes habits of the offer into a Wüstenzeit, or out of it; Henoch's habits gain those it lacks. */
export function choose(p: Profile, runId: string, offers: readonly DesertHabit[], on: boolean, now: number): Profile {
  const ids = offers.map((o) => o.id);
  const missing = on ? offers.filter((o) => !p.habits.some((h) => h.id === o.id)).map(habitFromOffer) : [];
  return {
    ...p,
    habits: [...p.habits, ...missing],
    winterArc: setIds(p.winterArc, runId, (cur) => (on ? [...cur, ...ids] : cur.filter((x) => !ids.includes(x))), now),
  };
}

/** Takes one of the user's own habits (already in the profile) in or out. */
export function chooseOwn(p: Profile, runId: string, id: string, on: boolean, now: number): Profile {
  return { ...p, winterArc: setIds(p.winterArc, runId, (cur) => (on ? [...cur, id] : cur.filter((x) => x !== id)), now) };
}

export const OWN_NOTE_MAX = 300;

/** A habit of the user's own for the Wüstenzeit, with an optional description; chosen at once. */
export function addOwn(
  p: Profile,
  runId: string,
  input: { name: string; note?: string; rhythm: Rhythm },
  id: string,
  now: number,
): Profile {
  const name = input.name.replace(/\s+/g, ' ').trim();
  if (!name) return p;
  const note = input.note?.trim().slice(0, OWN_NOTE_MAX);
  const habit: Habit = {
    id,
    name,
    rhythm: input.rhythm,
    auto: null,
    active: false,
    preset: false,
    focus: false,
    desert: 'own',
    ...(note ? { note } : {}),
  };
  return { ...p, habits: [...p.habits, habit], winterArc: setIds(p.winterArc, runId, (cur) => [...cur, id], now) };
}

/** Deletes one of the user's own habits of the Wüstenzeit, from every round too. */
export function removeOwn(p: Profile, id: string, now: number): Profile {
  if (!p.habits.some((h) => h.id === id && h.desert === 'own')) return p;
  let winterArc = p.winterArc;
  for (const r of p.winterArc.runs) if (r.habits?.includes(id)) winterArc = setIds(winterArc, r.id, (cur) => cur.filter((x) => x !== id), now);
  return { ...p, habits: p.habits.filter((h) => h.id !== id), winterArc };
}

/**
 * Habits that can be written down in the Gebetskammer: the thanks, and the
 * journal of a round taken over from the Streithalle. Never the examination of
 * conscience: sins are prayed, not written down (rule 9).
 */
export const canWrite = (h: Pick<Habit, 'id'>): boolean => h.id === 'wz-dankbarkeit' || /^wz-.+-journal$/.test(h.id);

/**
 * The examination of conscience is prayed on a page of its own, without a
 * field: the question of the day, confession and absolution as in the
 * Nachtgebet (rules 1, 2 and 9). Only the tick is kept.
 */
export const canExamine = (h: Pick<Habit, 'id'>): boolean => h.id === 'wz-gewissen';

/** Takes chosen habits into everyday life: they stay switched on after the Wüstenzeit. */
export function adopt(p: Profile, ids: readonly string[]): Profile {
  return { ...p, habits: p.habits.map((h) => (ids.includes(h.id) ? { ...h, active: true } : h)) };
}

/* ------------------------------------------------------------ days and weeks */

/** Advent: from the first Sunday of Advent to 24 December. */
export function inAdvent(date: DateKey): boolean {
  const year = Number(date.slice(0, 4));
  return date >= firstAdvent(year) && date <= `${year}-12-24`;
}

/** Whether a habit is meant for a date at all: by its weekdays, and Advent ones only in Advent. */
export function meantFor(h: Habit, date: DateKey): boolean {
  if (h.advent && !inAdvent(date)) return false;
  return !(h.rhythm === 'daily' && h.days) || h.days.includes(weekdayOf(date));
}

/**
 * Whether a habit stands in the day's list: daily ones on their days; weekly
 * and monthly ones all through their period until ticked, then on the day they were ticked.
 */
export function listedOn(h: Habit, date: DateKey, lookup: DayLookup): boolean {
  if (!meantFor(h, date)) return false;
  if (isPerDay(h)) return true;
  const done = periodDates(h.rhythm, date).find((k) => isDoneOn(h, lookup(k)));
  return done === undefined || done === date;
}

/** The weeks of a Wüstenzeit are calendar weeks, Monday to Sunday, as under "Heute": their Mondays. */
export function desertWeeks(run: Pick<WinterArcRun, 'startDate' | 'durationDays'>): DateKey[] {
  const last = mondayOf(endDateOf(run.startDate, run.durationDays));
  const out: DateKey[] = [];
  for (let m = mondayOf(run.startDate); m <= last; m = addDays(m, 7)) out.push(m);
  return out;
}

/** The week of the Wüstenzeit a date lies in, counted from 1. */
export function desertWeekOf(run: Pick<WinterArcRun, 'startDate' | 'durationDays'>, date: DateKey): number {
  const weeks = desertWeeks(run);
  const i = weeks.indexOf(mondayOf(date));
  return i >= 0 ? i + 1 : date < run.startDate ? 1 : weeks.length;
}

/**
 * How often a habit was kept in the Wüstenzeit up to today: days for those
 * ticked day by day, otherwise weeks or months. A record, not a rate (rule 4).
 */
export function keptIn(h: Habit, run: WinterArcRun, lookup: DayLookup, today: DateKey): number {
  const end = endDateOf(run.startDate, run.durationDays);
  const last = end < today ? end : today;
  const dates: DateKey[] = [];
  for (let d = run.startDate; d <= last; d = addDays(d, 1)) dates.push(d);
  const done = dates.filter((d) => meantFor(h, d) && isDoneOn(h, lookup(d)));
  if (isPerDay(h)) return done.length;
  const period = (d: DateKey) => (h.rhythm === 'weekly' ? mondayOf(d) : d.slice(0, 7));
  return new Set(done.map(period)).size;
}

/** "an 12 Tagen gehalten", "in 3 Wochen gehalten": documented, never rated. */
export function keptLine(h: Habit, n: number): string {
  if (isPerDay(h)) return n === 1 ? 'an einem Tag gehalten' : `an ${n} Tagen gehalten`;
  if (h.rhythm === 'weekly') return n === 1 ? 'in einer Woche gehalten' : `in ${n} Wochen gehalten`;
  return n === 1 ? 'in einem Monat gehalten' : `in ${n} Monaten gehalten`;
}

/** Whether anything of the Wüstenzeit was ticked on a date. */
export const tickedOn = (habits: readonly Habit[], date: DateKey, lookup: DayLookup): boolean =>
  habits.some((h) => isDoneOn(h, lookup(date)));

/**
 * The verse over a Wüstenzeit: that of the package most of its habits come
 * from; with mostly further or own habits (or a tie with them), 1 Tim 4,7.
 */
export function leadVerse(run: WinterArcRun): DesertVerse {
  const ids = run.habits ?? [];
  const counts = DESERT_PACKS.map((p) => ({ p, n: ids.filter((id) => p.habits.some((h) => h.id === id)).length }));
  const best = counts.reduce((a, b) => (b.n > a.n ? b : a), counts[0]!);
  const others = ids.length - counts.reduce((s, c) => s + c.n, 0);
  return best.n > 0 && best.n > others ? best.p.verse : DESERT_VERSE;
}

/* ------------------------------------------------------------ the round under way before 0.39 */

/**
 * A round of the Streithalle still under way becomes a Wüstenzeit: its points
 * become habits of the user's own, its ticks are copied into the days (weekly
 * ones on the last day of their week, monthly ones on the first day of their
 * month in the round). The round keeps its old ticks and reviews; nothing is deleted.
 */
export function fromRound(
  p: Profile,
  today: DateKey,
  now: number,
): { profile: Profile; ticks: { date: DateKey; id: string }[] } | undefined {
  const run = activeRun(p.winterArc);
  if (!run || isDesert(run)) return undefined;
  const points = pointsOf(run, p.winterArcSettings).filter((pt) => !pt.removed);
  const idOf = (pointId: string) => `wz-${run.id}-${pointId}`;
  const habits: Habit[] = points.map((pt) => ({
    id: idOf(pt.id),
    name: pt.text,
    rhythm: pt.rhythm,
    auto: null,
    active: false,
    preset: false,
    focus: false,
    desert: 'own',
    ...(pt.rhythm === 'daily' && pt.weekdays && pt.weekdays.length < 7 ? { days: [...pt.weekdays] } : {}),
    ...(pt.needs ? { needs: pt.needs } : {}),
  }));
  const upToToday = (d: DateKey) => (d > today ? today : d);
  const of = (rhythm: Rhythm) => points.filter((pt) => pt.rhythm === rhythm);
  const ticks = [
    ...p.winterArc.days
      .filter((d) => d.runId === run.id && isInRun(run, d.date))
      .flatMap((d) => of('daily').filter((pt) => d.checks[pt.id]).map((pt) => ({ date: d.date, id: idOf(pt.id) }))),
    ...p.winterArc.weeks
      .filter((w) => w.runId === run.id)
      .flatMap((w) =>
        of('weekly')
          .filter((pt) => w.weeklyChecks[pt.id])
          .map((pt) => ({ date: upToToday(lastDayOfWeek(run, w.week)), id: idOf(pt.id) })),
      ),
    ...p.winterArc.months
      .filter((m) => m.runId === run.id)
      .flatMap((m) => {
        const first = `${m.month}-01` < run.startDate ? run.startDate : `${m.month}-01`;
        return of('monthly')
          .filter((pt) => m.checks[pt.id])
          .map((pt) => ({ date: upToToday(first), id: idOf(pt.id) }));
      }),
  ];
  const runs = p.winterArc.runs.map((r) => (r.id === run.id ? { ...r, habits: habits.map((h) => h.id), updatedAt: now } : r));
  return {
    profile: { ...p, habits: [...p.habits.filter((h) => !habits.some((x) => x.id === h.id)), ...habits], winterArc: { ...p.winterArc, runs } },
    ticks,
  };
}
