import { useEffect, useState, useSyncExternalStore } from 'react';
import { formatClock, timer } from './timerState';

type WakeLock = { release: () => Promise<void> };

/** Keeps the screen on while the timer runs (where supported). */
function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WakeLock> } };
    let lock: WakeLock | null = null;
    let cancelled = false;
    const acquire = () => {
      nav.wakeLock
        ?.request('screen')
        .then((l) => {
          if (cancelled) void l.release();
          else lock = l;
        })
        .catch(() => {});
    };
    acquire();
    const onVisible = () => document.visibilityState === 'visible' && acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void lock?.release().catch(() => {});
    };
  }, [active]);
}

export function Timer({ totalMinutes, hint }: { totalMinutes: number; hint: string }) {
  const state = useSyncExternalStore(timer.subscribe, timer.get);
  const [, tick] = useState(0);
  const running = state.startedAt !== null;

  useEffect(() => timer.setTotal(totalMinutes * 60), [totalMinutes]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useWakeLock(running);

  const left = timer.left();
  const started = running || state.elapsedSec > 0;

  return (
    <div className="timer">
      <span className="clock" role="timer" aria-label={`Verbleibende Zeit ${formatClock(left)}`}>
        {formatClock(left)}
      </span>
      <span className="hint">{hint}</span>
      <button type="button" className="btn" onClick={() => (running ? timer.pause() : timer.start())}>
        {running ? 'Anhalten' : started ? 'Fortsetzen' : 'Zeit starten'}
      </button>
      {!running && started && (
        <button type="button" className="btn quiet" onClick={() => timer.reset(totalMinutes * 60)}>
          Zurücksetzen
        </button>
      )}
    </div>
  );
}
