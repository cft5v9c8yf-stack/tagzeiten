/**
 * Which headings are open or closed, remembered on this device so the app
 * opens the way it was left. A per-device convenience (localStorage); it is
 * not part of the user's entries and not exported.
 */
import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'tz:collapsed';
type Listener = () => void;

let state: Record<string, boolean> = load();
const listeners = new Set<Listener>();

function load(): Record<string, boolean> {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '{}') as unknown;
    return v && typeof v === 'object' ? (v as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function setOpen(id: string, open: boolean): void {
  if (state[id] === open) return;
  state = { ...state, [id]: open };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable: the choice holds for this visit
  }
  for (const l of listeners) l();
}

/** Forget all remembered choices (used by "Alles löschen"). */
export function resetOpenState(): void {
  state = {};
  for (const l of listeners) l();
}

const subscribe = (l: Listener) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Open state of one heading: the remembered choice, otherwise the default. */
export function useOpen(id: string, defaultOpen: boolean): [boolean, (open: boolean) => void] {
  const stored = useSyncExternalStore(subscribe, () => state[id]);
  const set = useCallback((open: boolean) => setOpen(id, open), [id]);
  return [stored ?? defaultOpen, set];
}
