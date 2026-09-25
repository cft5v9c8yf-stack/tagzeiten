import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useOpen } from './collapseState';

type Level = 2 | 3 | 4 | 5;

/**
 * A heading that folds its content away. The choice is remembered per device
 * (key `id`). An optional "i" next to the heading shows an explanation in a
 * speech bubble.
 */
export function Section({
  id,
  title,
  level = 3,
  defaultOpen = true,
  info,
  aside,
  className,
  titleClassName,
  children,
}: {
  /** Stable storage key, e.g. "today.reading". */
  id: string;
  title: ReactNode;
  level?: Level;
  defaultOpen?: boolean;
  /** Explanation shown in a speech bubble from the "i" button. */
  info?: ReactNode;
  /** Shown next to the title, also when folded (e.g. a count). */
  aside?: ReactNode;
  className?: string;
  titleClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useOpen(id, defaultOpen);
  const bodyId = useId();
  const Heading = `h${level}` as const;
  return (
    <section className={`fold-section level-${level}${open ? ' is-open' : ''}${className ? ` ${className}` : ''}`}>
      <div className="fold-head">
        <Heading className={`fold-title${titleClassName ? ` ${titleClassName}` : ''}`}>
          <button type="button" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen(!open)}>
            <span className="fold-chevron" aria-hidden="true" />
            <span className="fold-text">{title}</span>
          </button>
        </Heading>
        {aside && <span className="fold-aside">{aside}</span>}
        {info && <InfoToggle title={typeof title === 'string' ? title : 'diesem Abschnitt'}>{info}</InfoToggle>}
      </div>
      <div id={bodyId} className="fold-body" hidden={!open}>
        {children}
      </div>
    </section>
  );
}

/** A small "i" that opens an explanation in a speech bubble (toggletip). */
export function InfoToggle({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [arrowX, setArrowX] = useState(0);
  const bubbleId = useId();
  const wrap = useRef<HTMLSpanElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span className="info-wrap" ref={wrap}>
      <button
        type="button"
        className="info-btn"
        aria-label={`Info zu ${title}`}
        aria-expanded={open}
        aria-controls={bubbleId}
        ref={btn}
        onClick={() => {
          // Point the bubble's tip at the "i" (the bubble spans the heading row).
          const b = btn.current;
          const head = b?.closest('.fold-head') as HTMLElement | null;
          if (b && head) setArrowX(b.getBoundingClientRect().left - head.getBoundingClientRect().left + b.offsetWidth / 2);
          setOpen((o) => !o);
        }}
      >
        i
      </button>
      <span
        id={bubbleId}
        className="info-bubble"
        role="note"
        hidden={!open}
        style={{ '--arrow-x': `${arrowX}px` } as React.CSSProperties}
      >
        {children}
      </span>
    </span>
  );
}
