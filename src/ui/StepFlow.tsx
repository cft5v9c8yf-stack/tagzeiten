import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { FlowIcon, type FlowIconName } from './FlowIcon';

export interface FlowStep {
  id: string;
  title: string;
  /** Shown in the circle: a number, "·", or nothing (a plain point). */
  mark?: ReactNode;
  /** Gold icon in the circle: what happens in this step (replaces the mark). */
  icon?: FlowIconName;
  done?: boolean;
  /** A short name shown under the mark, where a row has few of them ("Lob", "Wort"). */
  short?: string;
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
  titleLevel = 3,
}: {
  /** Name of the order, for screen readers ("Stille Zeit"). */
  label: string;
  steps: readonly FlowStep[];
  /** Index of the step in view; null shows only the row (e.g. after completion). */
  current: number | null;
  onSelect: (index: number) => void;
  children?: ReactNode;
  footer?: ReactNode;
  /** Heading level of the step title; 4 for a flow inside a step of another flow. */
  titleLevel?: 3 | 4;
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

  // Names under all marks while they fit in the row, otherwise only under the one in view.
  const listRef = useRef<HTMLOListElement>(null);
  const [allNames, setAllNames] = useState(true);
  const namesKey = steps.map((s) => `${s.short ?? ''}|${s.icon ?? ''}`).join('\n');
  useLayoutEffect(() => {
    const ol = listRef.current;
    if (!ol) return;
    const measure = () => {
      const items = Array.from(ol.children) as HTMLElement[];
      const named = items.filter((li) => li.querySelector('.flow-short'));
      if (named.length === 0) return;
      let total = 4 * (items.length - 1) + 28;
      for (const li of items) {
        const nameW = li.querySelector<HTMLElement>('.flow-short')?.offsetWidth ?? 0;
        const btnW = li.classList.contains('current') ? 48 : 28;
        total += Math.max(btnW, nameW) + 4;
      }
      setAllNames(total <= ol.clientWidth);
    };
    measure();
    const ro = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    ro?.observe(ol);
    return () => ro?.disconnect();
  }, [namesKey, current]);

  // The mark in view stays in view when the row scrolls.
  useEffect(() => {
    const li = listRef.current?.children[current ?? -1] as HTMLElement | undefined;
    li?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
  }, [current]);

  const step = current === null ? undefined : steps[current];
  const Title = titleLevel === 4 ? 'h4' : 'h3';

  return (
    <div className="flow" ref={rootRef}>
      <nav className={`flow-chain${allNames ? ' names-all' : ''}`} aria-label={`Ablauf: ${label}`}>
        <ol ref={listRef}>
          {steps.map((s, i) => (
            <li
              key={s.id}
              className={`${s.done ? 'done' : ''}${i === current ? ' current' : ''}${!s.icon && (s.mark === undefined || s.mark === '') ? ' point' : ''}`}
            >
              <button
                type="button"
                aria-current={i === current ? 'step' : undefined}
                aria-label={`${s.title}${s.done ? ', gebetet' : ''}`}
                title={s.title}
                onClick={() => onSelect(i)}
              >
                {/* The icon names the step; numbers only where there is no icon. */}
                {s.icon ? <FlowIcon name={s.icon} size={17} /> : <span aria-hidden="true">{s.mark}</span>}
              </button>
              {s.short && (
                <span className="flow-short" aria-hidden="true">
                  {s.short}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {step && (
        <section className={`flow-step step-${step.id}`} aria-labelledby={titleId}>
          <Title id={titleId} ref={titleRef} tabIndex={-1} className="flow-title">
            {step.icon && <FlowIcon name={step.icon} size={22} />}
            <span>{step.title}</span>
          </Title>
          {children}
          {footer && <div className="flow-footer">{footer}</div>}
          {current !== null && current > 0 && (
            <div className="flow-back">
              <button type="button" className="btn quiet" onClick={() => onSelect(current - 1)}>
                Zurück zu: {steps[current - 1]!.title}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
