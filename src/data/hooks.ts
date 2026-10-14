import { useMemo, useSyncExternalStore } from 'react';
import type { DateKey } from '../domain/dates';
import type { Day, Profile } from '../domain/model';
import { useStore } from './StoreContext';

export { useStore } from './StoreContext';

export function useProfile(): Profile {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, () => store.getProfile());
}

export function useDay(date: DateKey): Day {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, () => store.getDay(date));
}

/**
 * Today as the views show it: it moves on when a new day has begun while the
 * app stayed open, or was brought back in the morning (see Store.checkDayChange).
 */
export function useToday(): DateKey {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.getShownDay);
}

/** Re-renders on every store change; use for views that read many days. */
export function useStoreVersion(): number {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.getVersion);
}

/** All stored days, newest first. */
export function useAllDays(): Day[] {
  const store = useStore();
  const version = useStoreVersion();
  return useMemo(() => store.allDays(), [store, version]);
}

/** Lookup function for domain helpers (habits, stats), refreshed on change. */
export function useDayLookup(): (date: DateKey) => Day | undefined {
  const store = useStore();
  const version = useStoreVersion();
  return useMemo(() => (date: DateKey) => store.findDay(date), [store, version]);
}
