/**
 * Merging two stores of entries, e.g. from the iPhone and the iPad: the first
 * step towards an opt-in sync between devices. Nothing is lost that one of the
 * two holds; where both hold the same entry, the one changed last wins, always
 * as a whole, never mixed field by field.
 *
 * Limits: a deletion is not carried over (there are no deletion marks yet), so
 * an entry deleted on one device comes back from the other.
 */
import type { DateKey } from './dates';
import type { ArenaEntry, Day, Profile } from './model';
import { normalizeProfile } from './profile';
import type { WinterArcData } from './winterArc';

export interface MergeCount {
  /** Entries only the incoming side held. */
  added: number;
  /** Entries both held, where the incoming one was newer. */
  changed: number;
  /** Entries both held, where the local one stays. */
  same: number;
}

export interface MergeResult {
  profile: Profile;
  days: Day[];
  /** Days, and the Arena, Winter Arc and well entries, counted together. */
  count: MergeCount;
}

type Stamped = { updatedAt: number };

/** Merges two lists by key: the newer `updatedAt` wins, on a tie the local one. */
function byKey<T extends Stamped>(local: readonly T[], incoming: readonly T[], key: (x: T) => string, count: MergeCount): T[] {
  const out = new Map(local.map((x) => [key(x), x]));
  for (const x of incoming) {
    const k = key(x);
    const mine = out.get(k);
    if (!mine) {
      out.set(k, x);
      count.added++;
    } else if (x.updatedAt > mine.updatedAt) {
      out.set(k, x);
      count.changed++;
    } else count.same++;
  }
  return [...out.values()];
}

/** Adds what only the incoming list holds; for items without a time of change. */
function union<T>(local: readonly T[], incoming: readonly T[], key: (x: T) => string): T[] {
  const known = new Set(local.map(key));
  return [...local, ...incoming.filter((x) => !known.has(key(x)))];
}

/** Keys missing locally are taken over; the local value stays where both have one. */
const fill = <V>(local: Record<string, V>, incoming: Record<string, V>): Record<string, V> => ({ ...incoming, ...local });

function mergeWinterArc(local: WinterArcData, incoming: WinterArcData, count: MergeCount): WinterArcData {
  return {
    runs: byKey(local.runs, incoming.runs, (r) => r.id, count),
    days: byKey(local.days, incoming.days, (d) => `${d.runId}|${d.date}`, count),
    weeks: byKey(local.weeks, incoming.weeks, (w) => `${w.runId}|${w.week}`, count),
    months: byKey(local.months, incoming.months, (m) => `${m.runId}|${m.month}`, count),
  };
}

/**
 * Merges what is on this device with what comes from another one.
 *
 * - Days, Arena entries and Winter Arc rows: the one changed last wins.
 * - Settings (times, house, prayer, theme …): those of the profile changed last.
 * - Reading plan: per track the further position; progress, never arrears (rule 6).
 * - Habits, answered prayers, meetings at the well, catechism pieces learned,
 *   Dogmatik days read and notes: whatever one of the two holds.
 */
export function mergeStores(
  local: { profile: Profile; days: readonly Day[] },
  incoming: { profile: Profile; days: readonly Day[] },
  today: DateKey,
): MergeResult {
  const count: MergeCount = { added: 0, changed: 0, same: 0 };
  const days = byKey(local.days, incoming.days, (d) => d.date, count).sort((a, b) => (a.date < b.date ? -1 : 1));

  const a = local.profile;
  const b = incoming.profile;
  const base = b.updatedAt > a.updatedAt ? b : a;
  const other = base === a ? b : a;

  const positions = { ...a.plan.positions };
  for (const [track, pos] of Object.entries(b.plan.positions)) positions[track] = Math.max(positions[track] ?? 0, pos);

  const arena: ArenaEntry[] = byKey(a.arena, b.arena, (e) => e.id, count);
  const meetings = union(base.well.meetings, other.well.meetings, (m) => m.id);
  count.added += meetings.length - base.well.meetings.length;

  const profile = normalizeProfile(
    {
      ...base,
      plan: { ...base.plan, positions },
      habits: union(base.habits, other.habits, (h) => h.id),
      answered: union(base.answered, other.answered, (x) => x.id),
      well: { ...base.well, meetings },
      catechism: { ...base.catechism, memorized: fill(base.catechism.memorized, other.catechism.memorized) },
      dogmatik: {
        ...base.dogmatik,
        read: fill(base.dogmatik.read, other.dogmatik.read),
        notes: fill(base.dogmatik.notes, other.dogmatik.notes),
      },
      ...(base.seasonsDeclined || other.seasonsDeclined
        ? { seasonsDeclined: [...new Set([...(base.seasonsDeclined ?? []), ...(other.seasonsDeclined ?? [])])] }
        : {}),
      arena,
      winterArc: mergeWinterArc(a.winterArc, b.winterArc, count),
      updatedAt: Math.max(a.updatedAt, b.updatedAt),
    },
    today,
  );
  return { profile, days, count };
}
