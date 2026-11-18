/**
 * The Arena: a journal of spiritual struggle – what burdens you, where you
 * fight – with Bible verses and prayer concerns. Sin is not written down here
 * (rule 9); it is prayed in the confession of the night prayer.
 */
import { formatLong, isDateKey, type DateKey } from './dates';
import { normalizeInk, type InkStroke } from './ink';
import type { ArenaEntry, ArenaPoint } from './model';

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

export function newEntry(
  now: number,
  kind?: 'forge' | 'desert',
  id = `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
): ArenaEntry {
  const e: ArenaEntry = { id, createdAt: now, updatedAt: now, verses: [''], concerns: [''], text: '' };
  if (kind) e.kind = kind;
  if (kind === 'forge') e.points = [{ text: '', done: false }];
  return e;
}

/** The Reflexion holds handwriting under at least one question. */
export const hasInks = (e: ArenaEntry) => Object.values(e.inks ?? {}).some((s) => s.length > 0);

/** Nothing written yet: such entries are not kept. */
export const isEmptyEntry = (e: ArenaEntry) =>
  !e.title?.trim() &&
  !e.text.trim() &&
  e.verses.every((v) => !v.trim()) &&
  e.concerns.every((c) => !c.trim()) &&
  (e.points ?? []).every((p) => !p.text.trim()) &&
  !e.ink?.length &&
  !hasInks(e);

function points(v: unknown): ArenaPoint[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((p): p is { text: unknown; done?: unknown } => !!p && typeof p === 'object')
    .map((p) => ({ text: str(p.text), done: p.done === true }));
}

/** Keeps well-formed entries, newest first; drops empty ones. */
export function normalizeArena(raw: unknown): ArenaEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: ArenaEntry[] = [];
  const seen = new Set<string>();
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const x = r as Partial<ArenaEntry>;
    const id = str(x.id);
    const createdAt = typeof x.createdAt === 'number' ? x.createdAt : NaN;
    if (!id || seen.has(id) || !Number.isFinite(createdAt)) continue;
    const e: ArenaEntry = {
      id,
      createdAt,
      updatedAt: typeof x.updatedAt === 'number' ? x.updatedAt : createdAt,
      verses: strs(x.verses),
      concerns: strs(x.concerns),
      text: str(x.text),
    };
    if (str(x.title).trim()) e.title = str(x.title);
    if (typeof x.archivedAt === 'number') e.archivedAt = x.archivedAt;
    else if (typeof x.pinnedAt === 'number') e.pinnedAt = x.pinnedAt;
    if (x.kind === 'forge' || x.kind === 'desert') e.kind = x.kind;
    const ink = e.kind === 'forge' ? [] : normalizeInk(x.ink);
    if (ink.length) e.ink = ink;
    if (e.kind !== 'forge' && x.inks && typeof x.inks === 'object' && !Array.isArray(x.inks)) {
      const inks: Record<string, InkStroke[]> = {};
      for (const [k, v] of Object.entries(x.inks as Record<string, unknown>)) {
        const strokes = normalizeInk(v);
        if (strokes.length && k.length <= 40) inks[k] = strokes;
      }
      if (Object.keys(inks).length) e.inks = inks;
    }
    if (e.kind === 'forge' && isDateKey(x.meetingDate)) e.meetingDate = x.meetingDate;
    if (e.kind === 'forge') {
      e.points = points(x.points);
      // Written before the list existed: each line of the text becomes a point.
      if (e.points.length === 0 && e.text.trim()) {
        e.points = e.text
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .map((text) => ({ text, done: false }));
        e.text = '';
      }
    }
    if (isEmptyEntry(e)) continue;
    seen.add(id);
    out.push(e);
  }
  // At most MAX_PINNED per place, also from a backup: the earliest pins stay.
  for (const kind of [undefined, 'forge', 'desert']) {
    out
      .filter((e) => e.pinnedAt !== undefined && e.kind === kind)
      .sort((a, b) => a.pinnedAt! - b.pinnedAt!)
      .slice(MAX_PINNED)
      .forEach((e) => delete e.pinnedAt);
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}

/** The title, else the first line of the text (or the first point), for the list. */
export function entryTitle(e: ArenaEntry): string {
  const title = e.title?.trim();
  if (title) return title;
  const line = (e.text.split('\n').find((l) => l.trim()) ?? e.points?.find((p) => p.text.trim())?.text)?.trim();
  if (line) return line.length > 80 ? `${line.slice(0, 79)}…` : line;
  return e.concerns.find((c) => c.trim()) ?? e.verses.find((v) => v.trim()) ?? (e.ink?.length || hasInks(e) ? 'Handschrift' : '');
}

/** Looks like a Bible reference ("Römer 8,37", "1. Korinther 10,13"), so it can be linked. */
export const isReference = (s: string) => /^\s*(\d\.\s*)?[A-ZÄÖÜ][\wäöüß.]*\s+\d+(,\d+([–-]\d+)?[ab]?)?\s*$/.test(s);

/** Entries whose verses, concerns, text or points contain every word of the query. */
export function searchArena(entries: readonly ArenaEntry[], query: string): ArenaEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [...entries];
  return entries.filter((e) => {
    const hay = [e.title ?? '', ...e.verses, ...e.concerns, e.text, ...(e.points ?? []).map((p) => p.text)].join(' ').toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/**
 * The meeting a new Eisenschmiede entry is for: the next one already planned
 * (today or later) among the open entries, if any.
 */
export function nextMeeting(entries: readonly ArenaEntry[], today: DateKey): DateKey | undefined {
  return entries
    .filter((e) => e.kind === 'forge' && e.archivedAt === undefined && e.meetingDate && e.meetingDate >= today)
    .map((e) => e.meetingDate!)
    .sort()[0];
}

/** Open Eisenschmiede entries grouped by meeting: earliest meeting first, entries without a date last. */
export function byMeeting(entries: readonly ArenaEntry[]): { date?: DateKey; entries: ArenaEntry[] }[] {
  const groups = new Map<string, ArenaEntry[]>();
  for (const e of entries) {
    const k = e.meetingDate ?? '';
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === '' ? 1 : b === '' ? -1 : a < b ? -1 : 1))
    .map(([k, list]) => ({ date: k || undefined, entries: list }));
}

export const meetingLabel = (d: DateKey) => `Treffen am ${formatLong(d)}`;

/** At most this many entries stand pinned at the top of a place. */
export const MAX_PINNED = 3;

/** Pinned entries first, in the order they were pinned; the rest keep their order. */
export function pinnedFirst(entries: readonly ArenaEntry[]): ArenaEntry[] {
  const pinned = entries.filter((e) => e.pinnedAt !== undefined).sort((a, b) => a.pinnedAt! - b.pinnedAt!);
  return [...pinned, ...entries.filter((e) => e.pinnedAt === undefined)];
}

/** How an Eisenschmiede entry is named: by the meeting it is for. */
export const forgeTitle = (e: ArenaEntry) => (e.meetingDate ? meetingLabel(e.meetingDate) : 'Treffen noch ohne Termin');

/** Archived entries stand in the Rückblick under "Mehr". */
export const REVIEW_PATH = '/mehr/rueckblick?ansicht=arena';
