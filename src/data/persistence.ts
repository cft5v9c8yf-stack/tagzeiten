/**
 * Asks the browser to keep the database for good, so that it is not cleared
 * when storage runs low (StorageManager.persist). Entries stay on the device
 * either way (rule 10); this only protects them from the browser itself.
 */
export type Persistence = 'persisted' | 'best-effort' | 'unsupported';

function storage(): StorageManager | undefined {
  return typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.persist === 'function'
    ? navigator.storage
    : undefined;
}

export async function persistence(): Promise<Persistence> {
  const s = storage();
  if (!s) return 'unsupported';
  try {
    return (await s.persisted()) ? 'persisted' : 'best-effort';
  } catch {
    return 'best-effort';
  }
}

/** Asks once more if the storage is not yet persistent; returns the state after asking. */
export async function requestPersistence(): Promise<Persistence> {
  const s = storage();
  if (!s) return 'unsupported';
  try {
    if (await s.persisted()) return 'persisted';
    return (await s.persist()) ? 'persisted' : 'best-effort';
  } catch {
    return 'best-effort';
  }
}
