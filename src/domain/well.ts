/**
 * "Treffen am Abendbrunnen" (since 1.22): the weekly check-in of a married man
 * with his wife. One meeting a week, kept with its date on the device. Nothing
 * of what is confessed is noted (rule 9): the fields hold resolutions, wishes
 * and prayer concerns only.
 */
import { addDays, isDateKey, mondayOf, type DateKey } from './dates';

export interface WellMeeting {
  id: string;
  date: DateKey;
  /** "Mein Vorsatz für diese Woche". */
  resolution: string;
  /** Ticked at the next meeting: "Umgesetzt?". */
  resolutionDone: boolean;
  /** "Ihr Wunsch an mich, den ich umsetze". */
  herWish: string;
  herConcern: string;
  myConcern: string;
  /** The day of the next meeting, if fixed. */
  next?: DateKey;
}

export interface Well {
  /** "Ich bin verheiratet / Abendbrunnen anzeigen". Off: no tile, no page. */
  on: boolean;
  /** Newest first. */
  meetings: WellMeeting[];
}

export const emptyWell = (): Well => ({ on: false, meetings: [] });

const str = (v: unknown) => (typeof v === 'string' ? v : '');

export const newMeetingId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const newMeeting = (date: DateKey, id = newMeetingId()): WellMeeting => ({
  id,
  date,
  resolution: '',
  resolutionDone: false,
  herWish: '',
  herConcern: '',
  myConcern: '',
});

/** Nothing written yet: such a meeting is not kept. */
export const isEmptyMeeting = (m: WellMeeting) =>
  !m.resolution.trim() && !m.herWish.trim() && !m.herConcern.trim() && !m.myConcern.trim() && !m.next;

export function normalizeWell(raw: unknown): Well {
  if (!raw || typeof raw !== 'object') return emptyWell();
  const r = raw as Partial<Well>;
  const seen = new Set<string>();
  const meetings: WellMeeting[] = [];
  for (const x of Array.isArray(r.meetings) ? (r.meetings as Partial<WellMeeting>[]) : []) {
    if (!x || typeof x !== 'object') continue;
    const id = str(x.id);
    if (!id || seen.has(id) || !isDateKey(x.date)) continue;
    const m: WellMeeting = {
      id,
      date: x.date,
      resolution: str(x.resolution),
      resolutionDone: x.resolutionDone === true,
      herWish: str(x.herWish),
      herConcern: str(x.herConcern),
      myConcern: str(x.myConcern),
    };
    if (isDateKey(x.next)) m.next = x.next;
    if (isEmptyMeeting(m)) continue;
    seen.add(id);
    meetings.push(m);
  }
  return { on: r.on === true, meetings: meetings.sort(newestFirst) };
}

const newestFirst = (a: WellMeeting, b: WellMeeting) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1);

/** The meeting of this week (Monday to Sunday), if one was begun. */
export function meetingOfWeek(well: Well, today: DateKey): WellMeeting | undefined {
  const monday = mondayOf(today);
  const sunday = addDays(monday, 6);
  return well.meetings.find((m) => m.date >= monday && m.date <= sunday);
}

/** The latest earlier meeting that set a resolution: it is asked about at the next one. */
export function previousResolution(well: Well, current: Pick<WellMeeting, 'id' | 'date'>): WellMeeting | undefined {
  return well.meetings.find((m) => m.id !== current.id && m.date < current.date && m.resolution.trim() !== '');
}

/** The meetings before the one of this week, newest first, for reading. */
export const pastMeetings = (well: Well, currentId?: string): WellMeeting[] =>
  well.meetings.filter((m) => m.id !== currentId);

/** The wife's name, trimmed; empty when none is given (the standard text then says "dir"). */
export const wifeName = (name: string) => name.trim();

/**
 * What the last meeting set for the week, for the morning: the newest meeting of the past seven days
 * with a resolution or a wish of hers. A reminder of the week, never of something missed (rule 7).
 */
export function weekIntent(well: Well, today: DateKey): { resolution: string; wish: string } | undefined {
  if (!well.on) return undefined;
  const from = addDays(today, -6);
  const m = well.meetings.find((x) => x.date <= today && x.date >= from && (x.resolution.trim() || x.herWish.trim()));
  return m ? { resolution: m.resolution.trim(), wish: m.herWish.trim() } : undefined;
}
