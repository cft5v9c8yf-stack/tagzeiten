import { useEffect, useId, useRef, type ReactNode } from 'react';

export interface FlowStep {
  id: string;
  title: string;
  /** Shown in the circle: a number, "·", or nothing (a plain point). */
  mark?: ReactNode;
  done?: boolean;
}

/**
 * An order prayed one step at a time: the sequence as a row of marks at the
 * top (orientation, any mark can be tapped), below it only the current step.
 * The row shows where one stands in this order today – not a chain across days
 * (rule 4).
 */
export function StepFlow({
  label,
  steps,
  current,
  onSelect,
  children,
  footer,
}: {
  /** Name of the order, for screen readers ("Stille Zeit"). */
  label: string;
  steps: readonly FlowStep[];
  /** Index of the step in view; null shows only the row (e.g. after completion). */
  current: number | null;
  onSelect: (index: number) => void;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const shown = useRef(current);

  // After moving on (not on first render), bring the new step into view and put the focus on its title.
  useEffect(() => {
    if (shown.current === current) return;
    shown.current = current;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    rootRef.current?.scrollIntoView?.({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    titleRef.current?.focus({ preventScroll: true });
  }, [current]);

  const step = current === null ? undefined : steps[current];

  return (
    <div className="flow" ref={rootRef}>
      <nav className="flow-chain" aria-label={`Ablauf: ${label}`}>
        <ol>
          {steps.map((s, i) => (
            <li
              key={s.id}
              className={`${s.done ? 'done' : ''}${i === current ? ' current' : ''}${s.mark === undefined || s.mark === '' ? ' point' : ''}`}
            >
              <button
                type="button"
                aria-current={i === current ? 'step' : undefined}
                aria-label={`${s.title}${s.done ? ', gebetet' : ''}`}
                title={s.title}
                onClick={() => onSelect(i)}
              >
                <span aria-hidden="true">{s.mark}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      {step && (
        <section className={`flow-step step-${step.id}`} aria-labelledby={titleId}>
          <h3 id={titleId} ref={titleRef} tabIndex={-1} className="flow-title">
            {step.title}
          </h3>
          {children}
          {footer && <div className="flow-footer">{footer}</div>}
        </section>
      )}
    </div>
  );
}
