/**
 * Countdown for the morning order. Based on timestamps, so it stays correct
 * when the phone suspends the page. Kept for the session in sessionStorage
 * (a per-viewer convenience; nothing here is a record).
 */

export interface TimerState {
  totalSec: number;
  /** Seconds elapsed before the current run. */
  elapsedSec: number;
  /** Epoch ms when the current run started, null when paused. */
  startedAt: number | null;
}

const KEY = 'tz:timer';
type Listener = () => void;

let state: TimerState = load();
const listeners = new Set<Listener>();

function load(): TimerState {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as TimerState | null;
    if (s && typeof s.totalSec === 'number') return s;
  } catch {
    // unavailable storage: start fresh
  }
  return { totalSec: 45 * 60, elapsedSec: 0, startedAt: null };
}

function set(next: TimerState) {
  state = next;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
  for (const l of listeners) l();
}

export const timer = {
  get: () => state,
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  elapsed(now = Date.now()): number {
    return state.elapsedSec + (state.startedAt !== null ? Math.floor((now - state.startedAt) / 1000) : 0);
  },
  /** Seconds left; negative once the time is over. */
  left(now = Date.now()): number {
    return state.totalSec - this.elapsed(now);
  },
  start(now = Date.now()) {
    if (state.startedAt === null) set({ ...state, startedAt: now });
  },
  pause(now = Date.now()) {
    if (state.startedAt !== null) set({ ...state, elapsedSec: this.elapsed(now), startedAt: null });
  },
  reset(totalSec = state.totalSec) {
    set({ totalSec, elapsedSec: 0, startedAt: null });
  },
  /** Changes the length (long/short form) without losing elapsed time. */
  setTotal(totalSec: number) {
    if (state.totalSec !== totalSec) set({ ...state, totalSec });
  },
};

/** "12:05", or "+01:30" after the time is over. */
export function formatClock(sec: number): string {
  const a = Math.abs(sec);
  const m = String(Math.floor(a / 60)).padStart(2, '0');
  const s = String(a % 60).padStart(2, '0');
  return `${sec < 0 ? '+' : ''}${m}:${s}`;
}
