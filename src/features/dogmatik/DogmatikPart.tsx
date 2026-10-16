import { Link } from 'react-router';
import { withDate } from '../../app/useSelectedDate';
import { useStore } from '../../data/hooks';
import type { DateKey } from '../../domain/dates';
import { dayPath, isRead, setRead, sourceLine, todaysDay } from '../../domain/dogmatik';
import { useDogmatikBook, useDogmatikSettings } from './useDogmatik';

/** Today's section of the Dogmatik as a step of the Stille Zeit (or a page of the Vesper). */
export function DogmatikPart({ date, from }: { date: DateKey; from: 'stille-zeit' | 'vesper' }) {
  const book = useDogmatikBook();
  const [s, update] = useDogmatikSettings();
  const isToday = date === useStore().today();
  if (!book) return <p className="small muted">Die Dogmatik wird geladen …</p>;
  const day = todaysDay(book, s, date);
  if (!day) return null;
  const read = isRead(s, day.tag);
  const to = withDate(dayPath(day.tag), date, isToday);
  return (
    <div className="dogmatik-step">
      <p className="dogmatik-step-title">{day.titel}</p>
      <p className="dogmatik-meta">
        <span>Tag {day.tag}</span>
        <span>{sourceLine(book, day)}</span>
        <span>{day.minuten} Min.</span>
      </p>
      <div className="cat-actions">
        <Link className="btn" to={`${to}${to.includes('?') ? '&' : '?'}von=${from}`}>
          Lesen
        </Link>
        <button
          type="button"
          className="pill"
          aria-pressed={read}
          onClick={() => update((x) => setRead(x, day.tag, read ? null : date))}
        >
          {read ? '✓ Gelesen' : 'Gelesen'}
        </button>
      </div>
    </div>
  );
}
