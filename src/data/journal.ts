/**
 * Synchronous safety net for the last unsaved changes.
 *
 * IndexedDB writes are asynchronous and may not finish when the page is
 * closed right after typing. When the page is hidden, pending documents are
 * written synchronously to localStorage – on this device only (rule 10) –
 * and caught up into IndexedDB on the next start.
 */

export type JournalEntry = [key: string, value: unknown];

export interface Journal {
  save(entries: JournalEntry[]): void;
  load(): JournalEntry[];
  clear(): void;
}

const KEY = 'tz:journal';

export const localJournal: Journal = {
  save(entries) {
    try {
      if (entries.length) localStorage.setItem(KEY, JSON.stringify(entries));
      else localStorage.removeItem(KEY);
    } catch {
      // Storage full or blocked: IndexedDB flush is still attempted.
    }
  },
  load() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown;
      return Array.isArray(v) ? (v.filter((e) => Array.isArray(e) && typeof e[0] === 'string') as JournalEntry[]) : [];
    } catch {
      return [];
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  },
};

export function memoryJournal(): Journal & { entries: JournalEntry[] } {
  const j = {
    entries: [] as JournalEntry[],
    save(e: JournalEntry[]) {
      j.entries = JSON.parse(JSON.stringify(e)) as JournalEntry[];
    },
    load: () => j.entries,
    clear() {
      j.entries = [];
    },
  };
  return j;
}
