import type { ReactNode } from 'react';
import { Rubric } from '../../ui/PrayerText';

/** Title of an order, its rubric, and its options (form, family mode) in one quiet row. */
export function OrderHead({ title, rubric, children }: { title: string; rubric?: ReactNode; children?: ReactNode }) {
  return (
    <header className="order-head">
      <h2>{title}</h2>
      {rubric && <Rubric>{rubric}</Rubric>}
      {children && <div className="order-options">{children}</div>}
    </header>
  );
}

/** Shown once an order is prayed. */
export function DonePanel({
  note,
  children,
  next,
  onReopen,
}: {
  note: ReactNode;
  children?: ReactNode;
  next?: { label: string; onClick: () => void };
  onReopen: () => void;
}) {
  return (
    <div className="panel done-panel">
      <p>
        <b>{note}</b> {children}
      </p>
      <div className="done-actions">
        {next && (
          <button type="button" className="btn primary" onClick={next.onClick}>
            {next.label}
          </button>
        )}
        <button type="button" className="btn quiet" onClick={onReopen}>
          Abschluss zurücknehmen
        </button>
      </div>
    </div>
  );
}
