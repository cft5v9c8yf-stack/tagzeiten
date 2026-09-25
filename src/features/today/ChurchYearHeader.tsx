import { Link } from 'react-router';
import { withDate } from '../../app/useSelectedDate';
import { CIRCLE_LABEL, CIRCLES, churchDay, SEASON_LABEL } from '../../domain/churchYear';
import { formatLong, type DateKey } from '../../domain/dates';
import { readingsOfDay, verseOfDay } from '../../domain/weeklyVerse';
import { BibleLink } from '../../ui/BibleLink';

/** Date, week of the church year and festal circle at the top of the Today page. */
export function ChurchYearHeader({ date, isToday }: { date: DateKey; isToday: boolean }) {
  const c = churchDay(date);
  const verse = verseOfDay(date);
  const readings = readingsOfDay(date);
  const link = (circle: string, week?: string) =>
    withDate('/kirchenjahr', date, isToday) +
    (isToday ? '?' : '&') +
    `kreis=${circle}${week ? `&woche=${week}` : ''}`;
  return (
    <header className="church-year" aria-labelledby="cy-date">
      <p id="cy-date" className="cy-date">
        {formatLong(date)} {date.slice(0, 4)}
      </p>
      <p className="cy-week">
        <Link className="cy-week-name" to={link(c.circle, c.weekKey)}>
          {c.week}
        </Link>
        <span className="cy-week-no">{c.weekNumber}. Woche im Kirchenjahr</span>
      </p>
      {c.feast && <p className="cy-feast">{c.feast}</p>}
      {verse && (
        <figure className="cy-verse">
          <figcaption>{verse.kind === 'feast' ? 'Spruch des Tages' : 'Wochenspruch'}</figcaption>
          <blockquote>{verse.text}</blockquote>
          <p className="cy-verse-ref">
            <BibleLink reference={verse.ref} />
          </p>
        </figure>
      )}
      {readings && (
        <dl className="cy-readings cy-today-readings" aria-label={readings.kind === 'feast' ? 'Lesungen des Tages' : 'Lesungen der Woche'}>
          <div>
            <dt>Evangelium</dt>
            <dd>
              <BibleLink reference={readings.gospel} />
            </dd>
          </div>
          <div>
            <dt>Epistel</dt>
            <dd>
              <BibleLink reference={readings.epistle} />
            </dd>
          </div>
        </dl>
      )}
      <ol className="cy-circles" aria-label="Festkreise des Kirchenjahres">
        {CIRCLES.map((circle) => (
          <li key={circle} className={circle === c.circle ? 'current' : undefined} aria-current={circle === c.circle ? 'true' : undefined}>
            <Link to={link(circle)}>
              <span className="cy-circle-name">{CIRCLE_LABEL[circle]}</span>
              {circle === c.circle && <span className="cy-season">{SEASON_LABEL[c.season]}</span>}
            </Link>
          </li>
        ))}
      </ol>
    </header>
  );
}
