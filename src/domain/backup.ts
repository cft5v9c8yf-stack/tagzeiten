/**
 * JSON backup: everything the user has entered, in one file (rule 11).
 */
import type { DateKey } from './dates';
import type { Day, Profile } from './model';
import { normalizeDay } from './normalizeDay';
import { normalizeProfile } from './profile';

export const BACKUP_FORMAT = 'tagzeiten';
export const BACKUP_VERSION = 1;

export interface Backup {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  profile: Profile;
  days: Day[];
}

export function createBackup(profile: Profile, days: readonly Day[], exportedAt: Date): Backup {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: exportedAt.toISOString(),
    profile,
    days: [...days].sort((a, b) => (a.date < b.date ? -1 : 1)),
  };
}

export class BackupError extends Error {}

/** Parses and cleans an imported file. Throws BackupError with a German message. */
export function parseBackup(json: string, today: DateKey): { profile: Profile; days: Day[] } {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new BackupError('Die Datei ist kein gültiges JSON.');
  }
  const r = (raw ?? {}) as Partial<Backup>;
  if (r.format !== BACKUP_FORMAT) throw new BackupError('Das ist keine Sicherung aus Tagzeiten.');
  if (typeof r.version !== 'number' || r.version > BACKUP_VERSION) {
    throw new BackupError('Diese Sicherung stammt aus einer neueren Version der App.');
  }
  const days = (Array.isArray(r.days) ? r.days : []).map(normalizeDay).filter((d): d is Day => d !== null);
  return { profile: normalizeProfile(r.profile, today), days };
}
