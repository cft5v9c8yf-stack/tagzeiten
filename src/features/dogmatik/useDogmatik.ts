import { useEffect, useState } from 'react';
import { loadDogmatik, loadedDogmatik } from '../../content/dogmatik';
import { useProfile, useStore } from '../../data/hooks';
import type { DogmatikSettings } from '../../domain/dogmatik';
import type { UpdateOptions } from '../../data/store';

/** The book, once loaded (undefined while it loads). */
export function useDogmatikBook() {
  const [book, setBook] = useState(loadedDogmatik);
  useEffect(() => {
    if (book) return;
    let live = true;
    void loadDogmatik().then((b) => live && setBook(b));
    return () => {
      live = false;
    };
  }, [book]);
  return book;
}

/** The reading plan's settings and progress, and a way to change them. */
export function useDogmatikSettings(): [DogmatikSettings, (fn: (s: DogmatikSettings) => DogmatikSettings, opts?: UpdateOptions) => void] {
  const store = useStore();
  const s = useProfile().dogmatik;
  const update = (fn: (s: DogmatikSettings) => DogmatikSettings, opts: UpdateOptions = { immediate: true }) =>
    store.updateProfile((p) => ({ ...p, dogmatik: fn(p.dogmatik) }), opts);
  return [s, update];
}
