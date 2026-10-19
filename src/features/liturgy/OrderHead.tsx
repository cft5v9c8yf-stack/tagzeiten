import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { Rubric } from '../../ui/PrayerText';

/** Title of an order, its rubric, and its options (form) in one quiet row. */
export function OrderHead({
  title,
  rubric,
  aside,
  children,
}: {
  title: string;
  rubric?: ReactNode;
  /** Small control at the end of the title row (e.g. the button that starts the time). */
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="order-head">
      {aside ? (
        <div className="order-head-row">
          <h2>{title}</h2>
          {aside}
        </div>
      ) : (
        <h2>{title}</h2>
      )}
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
  const { date, isToday } = useSelectedDate();
  return (
    <div className="panel done-panel">
      <p>
        <b>{note}</b> {children}
      </p>
      <div className="done-actions">
        {next && (
          <button type="button" className="btn" onClick={next.onClick}>
            {next.label}
          </button>
        )}
        <Link className="btn quiet" to={withDate('/', date, isToday)}>
          Zurück zu Heute
        </Link>
        <button type="button" className="btn quiet" onClick={onReopen}>
          Abschluss zurücknehmen
        </button>
      </div>
    </div>
  );
}
