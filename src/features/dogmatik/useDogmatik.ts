import { useEffect, useState } from 'react';
import { loadDogmatik, loadedDogmatik } from '../../content/dogmatik';
import { useProfile, useStore } from '../../data/hooks';
import type { DogmatikSettings } from '../../domain/dogmatik';
import type { UpdateOptions } from '../../data/store';

/** The three volumes, once loaded (undefined while they load). */
export function useDogmatikLibrary() {
  const [lib, setLib] = useState(loadedDogmatik);
  useEffect(() => {
    if (lib) return;
    let live = true;
    void loadDogmatik().then((l) => live && setLib(l));
    return () => {
      live = false;
    };
  }, [lib]);
  return lib;
}

/** The reading plan's settings and progress, and a way to change them. */
export function useDogmatikSettings(): [DogmatikSettings, (fn: (s: DogmatikSettings) => DogmatikSettings, opts?: UpdateOptions) => void] {
  const store = useStore();
  const s = useProfile().dogmatik;
  const update = (fn: (s: DogmatikSettings) => DogmatikSettings, opts: UpdateOptions = { immediate: true }) =>
    store.updateProfile((p) => ({ ...p, dogmatik: fn(p.dogmatik) }), opts);
  return [s, update];
}
