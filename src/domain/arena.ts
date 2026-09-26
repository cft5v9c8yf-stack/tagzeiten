/**
 * The Arena: a journal of spiritual struggle – what burdens you, where you
 * fight – with Bible verses and prayer concerns. Sin is not written down here
 * (rule 9); it is prayed in the confession of the night prayer.
 */
import type { ArenaEntry } from './model';

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

export function newEntry(
  now: number,
  kind?: 'forge',
  id = `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
): ArenaEntry {
  const e: ArenaEntry = { id, createdAt: now, updatedAt: now, verses: [''], concerns: [''], text: '' };
  if (kind) e.kind = kind;
  return e;
}

/** Nothing written yet: such entries are not kept. */
export const isEmptyEntry = (e: ArenaEntry) =>
  !e.text.trim() && e.verses.every((v) => !v.trim()) && e.concerns.every((c) => !c.trim());

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
    if (typeof x.archivedAt === 'number') e.archivedAt = x.archivedAt;
    if (x.kind === 'forge') e.kind = 'forge';
    if (isEmptyEntry(e)) continue;
    seen.add(id);
    out.push(e);
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}

/** The first line of the text, for the list. */
export function entryTitle(e: ArenaEntry): string {
  const line = e.text.split('\n').find((l) => l.trim())?.trim();
  if (line) return line.length > 80 ? `${line.slice(0, 79)}…` : line;
  return e.concerns.find((c) => c.trim()) ?? e.verses.find((v) => v.trim()) ?? '';
}

/** Looks like a Bible reference ("Römer 8,37", "1. Korinther 10,13"), so it can be linked. */
export const isReference = (s: string) => /^\s*(\d\.\s*)?[A-ZÄÖÜ][\wäöüß.]*\s+\d+(,\d+([–-]\d+)?[ab]?)?\s*$/.test(s);

/** Entries whose verses, concerns or text contain every word of the query. */
export function searchArena(entries: readonly ArenaEntry[], query: string): ArenaEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [...entries];
  return entries.filter((e) => {
    const hay = [...e.verses, ...e.concerns, e.text].join(' ').toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
