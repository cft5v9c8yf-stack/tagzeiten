import { Link } from 'react-router';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { formatShort } from '../../domain/dates';
import { dayPath, recentlyRead, todaysDay } from '../../domain/dogmatik';
import { useDogmatikBook, useDogmatikSettings } from './useDogmatik';

export const LOOKUP_PATH = '/katechismus/dogmatik';

/**
 * On "Lehre": the reading plan through Pieper with today's section, the last
 * ones read, and whether it is read in the Stille Zeit. Progress is shown as
 * where one stands, never as a debt (rules 4 and 6).
 */
export function DogmatikCard() {
  const { date, isToday } = useSelectedDate();
  const book = useDogmatikBook();
  const [s, update] = useDogmatikSettings();
  const to = (path: string) => withDate(path, date, isToday);
  if (!book) return <p className="small muted">Die Dogmatik wird geladen …</p>;
  const today = todaysDay(book, s, date);
  const recent = recentlyRead(book, s);
  const inMorning = s.on && s.when === 'morning';

  return (
    <>
      <section className="block block-hero cat-week dogmatik-card" aria-labelledby="dogmatik-title">
        <p className="cat-week-kicker">{s.on ? 'Leseplan aktiv' : 'Zum Nachschlagen'}</p>
        <h4 id="dogmatik-title" className="cat-week-title">
          {book.buch.autor.split(' ').at(-1)}, {book.buch.titel}
        </h4>
        {s.on && today && (
          <>
            <p className="dogmatik-progress">
              Tag {today.tag} von {book.buch.umfang}
            </p>
            <p className="cat-today">
              Abschnitt des Tages: <Link to={to(dayPath(today.tag))}>{today.titel}</Link>
              <span className="muted"> · {today.minuten} Min.</span>
            </p>
          </>
        )}
        <div className="cat-actions dogmatik-actions">
          {s.on && today && (
            <Link className="btn primary" to={to(dayPath(today.tag))}>
              Heute lesen
            </Link>
          )}
          <Link className="btn" to={to(LOOKUP_PATH)}>
            Nachschlagen
          </Link>
        </div>
      </section>

      {recent.length > 0 && (
        <div className="dogmatik-recent">
          <h4>Zuletzt gelesen</h4>
          <ul className="dogmatik-list">
            {recent.map(({ day, date: when }) => (
              <li key={day.tag}>
                <Link className="dogmatik-row" to={to(dayPath(day.tag))}>
                  <span className="dogmatik-row-no">Tag {day.tag}</span>
                  <span className="dogmatik-row-title">{day.titel}</span>
                  <span className="dogmatik-row-meta">{formatShort(when)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="dogmatik-switch">
        <button
          type="button"
          className="pill"
          aria-pressed={inMorning}
          onClick={() => update((x) => ({ ...x, on: true, when: inMorning ? 'free' : 'morning' }))}
        >
          {inMorning ? '✓ In der Stillen Zeit lesen' : 'In der Stillen Zeit lesen'}
        </button>
        <p className="small muted">
          {inMorning
            ? 'Der Abschnitt steht in der Stillen Zeit nach dem Wort, vor dem Gebet.'
            : 'Eingeschaltet steht der Abschnitt in der Stillen Zeit nach dem Wort, vor dem Gebet.'}
        </p>
      </div>
    </>
  );
}
