import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { Habit } from '../../domain/model';
import { infoOf } from '../../domain/desert';

/*
 * At most one bubble stands open at a time, across every list: opening one
 * closes the other in the same tap. A tap elsewhere closes it only after that
 * tap was done, so the lines moving up can never turn it into a tap on another line.
 */
let openId: string | null = null;
const listeners = new Set<() => void>();
const setOpenId = (id: string | null) => {
  openId = id;
  for (const l of listeners) l();
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/**
 * A line with something to the left (a tick or a checkbox) and the app's "i"
 * to the right; its bubble stands below the line and moves the next lines down.
 */
export function WithInfo({ habit, children }: { habit: Pick<Habit, 'id' | 'name' | 'note'>; children: ReactNode }) {
  const id = useId();
  const open = useSyncExternalStore(subscribe, () => openId === id);
  const line = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const [arrowX, setArrowX] = useState(24);
  const { note, about, henoch } = infoOf(habit);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (openId === id && line.current && !line.current.contains(e.target as Node)) setOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenId(null);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, id]);

  // Opened near the bottom of the screen, the whole bubble comes into view.
  useLayoutEffect(() => {
    if (open) bubble.current?.scrollIntoView?.({ block: 'nearest' });
  }, [open]);

  // Gone with its line (another day shown, a habit taken out): nothing stays open.
  useEffect(() => () => {
    if (openId === id) openId = null;
  }, [id]);

  return (
    <div className="wa-row">
      <div className="wa-row-line desert-line" ref={line}>
        {children}
        {(note || about || henoch) && (
          <>
            <button
              type="button"
              className="info-btn"
              ref={btn}
              aria-label={`Info zu ${habit.name}`}
              aria-expanded={open}
              aria-controls={`${id}-info`}
              onClick={() => {
                const b = btn.current;
                const l = line.current;
                if (b && l) setArrowX(b.getBoundingClientRect().left - l.getBoundingClientRect().left + b.offsetWidth / 2);
                setOpenId(open ? null : id);
              }}
            >
              i
            </button>
            <div
              id={`${id}-info`}
              ref={bubble}
              className="info-bubble"
              role="note"
              hidden={!open}
              style={{ '--arrow-x': `${arrowX}px` } as React.CSSProperties}
            >
              {note && <p>{note}</p>}
              {about && <p className="info-about">{about}</p>}
              {henoch && <p className="info-about">{henoch}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
