/**
 * "Treffen am Abendbrunnen" (since 1.22): the weekly check-in of a married man
 * with his wife. One meeting a week, kept with its date on the device. Nothing
 * of what is confessed is noted (rule 9): the fields hold resolutions, wishes
 * and prayer concerns only.
 */
import { MAX_PINNED } from './arena';
import { addDays, isDateKey, type DateKey } from './dates';

export interface WellMeeting {
  id: string;
  date: DateKey;
  /** A title chosen by the user; the list shows it instead of the resolution. */
  title?: string;
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
  /** Epoch ms when put into the Rückblick; absent while it stands in the list. */
  archivedAt?: number;
  /** Epoch ms when pinned to the top of the list (at most three); absent otherwise. */
  pinnedAt?: number;
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
  !m.title?.trim() &&
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
    if (str(x.title).trim()) m.title = str(x.title);
    if (typeof x.archivedAt === 'number') m.archivedAt = x.archivedAt;
    else if (typeof x.pinnedAt === 'number') m.pinnedAt = x.pinnedAt;
    if (isEmptyMeeting(m)) continue;
    seen.add(id);
    meetings.push(m);
  }
  // At most MAX_PINNED pinned, also from a backup: the earliest pins stay.
  meetings
    .filter((m) => m.pinnedAt !== undefined)
    .sort((a, b) => a.pinnedAt! - b.pinnedAt!)
    .slice(MAX_PINNED)
    .forEach((m) => delete m.pinnedAt);
  return { on: r.on === true, meetings: meetings.sort(newestFirst) };
}

const newestFirst = (a: WellMeeting, b: WellMeeting) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1);

/** The latest earlier meeting that set a resolution: it is asked about at the next one. */
export function previousResolution(well: Well, current: Pick<WellMeeting, 'id' | 'date'>): WellMeeting | undefined {
  return well.meetings.find((m) => m.id !== current.id && m.date < current.date && m.resolution.trim() !== '');
}

/** How a meeting is named in the list: by its title, else by its resolution, else by its first note. */
export function meetingTitle(m: WellMeeting): string {
  const line = [m.title ?? '', m.resolution, m.herWish, m.herConcern, m.myConcern].map((t) => t.trim()).find(Boolean) ?? 'Treffen';
  const first = line.split('\n')[0]!;
  return first.length > 80 ? `${first.slice(0, 79)}…` : first;
}

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

/** Pinned meetings first, in the order they were pinned; the rest keep their order. */
export function pinnedFirstMeetings(meetings: readonly WellMeeting[]): WellMeeting[] {
  const pinned = meetings.filter((m) => m.pinnedAt !== undefined).sort((a, b) => a.pinnedAt! - b.pinnedAt!);
  return [...pinned, ...meetings.filter((m) => m.pinnedAt === undefined)];
}

/** Meetings whose notes contain every word of the query. */
export function searchMeetings(meetings: readonly WellMeeting[], query: string): WellMeeting[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return meetings.filter((m) => {
    const hay = [m.title ?? '', m.resolution, m.herWish, m.herConcern, m.myConcern].join(' ').toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
