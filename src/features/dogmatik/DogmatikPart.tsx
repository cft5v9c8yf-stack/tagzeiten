import { Link } from 'react-router';
import { withDate } from '../../app/useSelectedDate';
import { useStore } from '../../data/hooks';
import type { DateKey } from '../../domain/dates';
import { dayPath, isRead, keyOf, setRead, sourceLine, todaysDay, todaysPortion } from '../../domain/dogmatik';
import { useDogmatikLibrary, useDogmatikSettings } from './useDogmatik';

/** Today's reading of the Dogmatik as a step of the Stille Zeit: what it is, "Lesen", and "Gelesen". */
export function DogmatikPart({ date }: { date: DateKey }) {
  const lib = useDogmatikLibrary();
  const [s, update] = useDogmatikSettings();
  const isToday = date === useStore().today();
  if (!lib) return <p className="small muted">Die Dogmatik wird geladen …</p>;
  const portion = todaysPortion(lib, s, date);
  const open = todaysDay(lib, s, date);
  if (!open) return null;
  const all = portion.every((d) => isRead(s, d));
  const to = withDate(dayPath(open), date, isToday);
  return (
    <div className="dogmatik-step">
      <ul className="dogmatik-portion">
        {portion.map((d) => (
          <li key={keyOf(d)} className={isRead(s, d) ? 'read' : undefined}>
            <span className="dogmatik-step-title">{d.titel}</span>
            <span className="dogmatik-meta">
              <span>
                Band {d.band} · Tag {d.tag}
              </span>
              <span>{sourceLine(d)}</span>
              <span>{d.minuten} Min.</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="cat-actions">
        <Link className="btn" to={`${to}${to.includes('?') ? '&' : '?'}von=stille-zeit`}>
          Lesen
        </Link>
        <button
          type="button"
          className="pill"
          aria-pressed={all}
          onClick={() => update((x) => portion.reduce((acc, d) => setRead(acc, d, all ? null : date), x))}
        >
          {all ? '✓ Gelesen' : 'Gelesen'}
        </button>
      </div>
    </div>
  );
}
