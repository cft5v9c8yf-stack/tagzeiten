/**
 * IndexedDB schema (Dexie). Only this module and the store talk to the
 * database, so a later opt-in sync can be added here without touching the UI.
 */
import Dexie, { type Table } from 'dexie';
import { normalizeArena } from '../domain/arena';
import type { ArenaEntry, Day, Profile } from '../domain/model';

export const PROFILE_KEY = 'me';

/** The profile as stored: the Arena entries live in their own table (v2). */
export interface StoredProfile extends Omit<Profile, 'arena'> {
  id: typeof PROFILE_KEY;
  /** Only in databases from before v2; moved into the arena table on upgrade. */
  arena?: unknown;
}

export class TagzeitenDB extends Dexie {
  profile!: Table<StoredProfile, string>;
  days!: Table<Day, string>;
  arena!: Table<ArenaEntry, string>;

  constructor(name = 'tagzeiten') {
    super(name);
    // v1: one profile row, one row per day. updatedAt is indexed for a later sync.
    this.version(1).stores({
      profile: 'id',
      days: 'date, updatedAt',
    });
    // v2: the Arena (Gebetskammer, Eisenschmiede) gets a row per entry, so the
    // profile stays small however much is written by hand. The entries move out
    // of the profile in the same transaction as the new table is made: either
    // both happen or neither.
    this.version(2)
      .stores({
        profile: 'id',
        days: 'date, updatedAt',
        arena: 'id, updatedAt',
      })
      .upgrade(async (tx) => {
        const profile = tx.table<StoredProfile, string>('profile');
        const p = await profile.get(PROFILE_KEY);
        if (!p || !('arena' in p)) return;
        await tx.table<ArenaEntry, string>('arena').bulkPut(normalizeArena(p.arena));
        const { arena: _, ...rest } = p;
        await profile.put(rest);
      });
  }
}
