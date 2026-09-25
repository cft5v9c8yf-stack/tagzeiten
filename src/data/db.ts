/**
 * IndexedDB schema (Dexie). Only this module and the store talk to the
 * database, so a later opt-in sync can be added here without touching the UI.
 */
import Dexie, { type Table } from 'dexie';
import type { Day, Profile } from '../domain/model';

export const PROFILE_KEY = 'me';

export interface StoredProfile extends Profile {
  id: typeof PROFILE_KEY;
}

export class TagzeitenDB extends Dexie {
  profile!: Table<StoredProfile, string>;
  days!: Table<Day, string>;

  constructor(name = 'tagzeiten') {
    super(name);
    // v1: one profile row, one row per day. updatedAt is indexed for a later sync.
    this.version(1).stores({
      profile: 'id',
      days: 'date, updatedAt',
    });
  }
}
