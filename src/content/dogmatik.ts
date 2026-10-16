/**
 * Pieper's Dogmatik, loaded when first needed: the file grows to all 365 days
 * (data/dogmatik.json) and is packed as a chunk of its own, cached for offline
 * use like the rest of the app. A longer file needs no change here.
 */
import { normalizeBook, type DogmatikBook } from '../domain/dogmatik';

let loading: Promise<DogmatikBook> | undefined;
let loaded: DogmatikBook | undefined;

export function loadDogmatik(): Promise<DogmatikBook> {
  loading ??= import('../../data/dogmatik.json').then((m) => (loaded = normalizeBook(m.default)));
  return loading;
}

/** The book if already loaded, for a first draw without waiting. */
export const loadedDogmatik = (): DogmatikBook | undefined => loaded;
