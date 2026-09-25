import { useId, type ReactNode } from 'react';

/** One step of an order, as an accordion section. */
export function Step({
  no,
  title,
  minutes,
  done,
  expanded,
  onToggle,
  children,
  footer,
  id,
}: {
  no: ReactNode;
  title: string;
  minutes?: number;
  done: boolean;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  footer?: ReactNode;
  id?: string;
}) {
  const bodyId = useId();
  return (
    <section className={`step${done ? ' done' : ''}${expanded ? ' open' : ''}`} id={id}>
      <h3 className="step-head">
        <button type="button" aria-expanded={expanded} aria-controls={bodyId} onClick={onToggle}>
          <span className="no">{no}</span>
          <span className="title">{title}</span>
          <span className="meta">
            {done && <span className="state">gebetet</span>}
            {minutes ? <span className="min">{minutes} Min.</span> : null}
          </span>
        </button>
      </h3>
      <div id={bodyId} className="step-body" hidden={!expanded}>
        {children}
        {footer && <div className="step-footer">{footer}</div>}
      </div>
    </section>
  );
}
