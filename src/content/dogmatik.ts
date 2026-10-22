/**
 * Pieper's Dogmatik, loaded when first needed: three volumes of 365 days
 * (data/dogmatik/band-1.json … band-3.json), each packed as a chunk of its own
 * and cached for offline use like the rest of the app. Corrected files need no
 * change here.
 */
import { library, normalizeBook, type DogmatikLibrary } from '../domain/dogmatik';

let loading: Promise<DogmatikLibrary> | undefined;
let loaded: DogmatikLibrary | undefined;

export function loadDogmatik(): Promise<DogmatikLibrary> {
  loading ??= Promise.all([
    import('../../data/dogmatik/band-1.json'),
    import('../../data/dogmatik/band-2.json'),
    import('../../data/dogmatik/band-3.json'),
  ]).then((files) => (loaded = library(files.map((m, i) => normalizeBook(m.default, i + 1)))));
  return loading;
}

/** The library if already loaded, for a first draw without waiting. */
export const loadedDogmatik = (): DogmatikLibrary | undefined => loaded;
