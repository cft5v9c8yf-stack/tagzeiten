import { CIRCLE_LABEL, CIRCLES, churchDay, SEASON_LABEL } from '../../domain/churchYear';
import { formatLong, type DateKey } from '../../domain/dates';

/** Date, week of the church year and festal circle at the top of the Today page. */
export function ChurchYearHeader({ date }: { date: DateKey }) {
  const c = churchDay(date);
  return (
    <header className="church-year" aria-labelledby="cy-date">
      <p id="cy-date" className="cy-date">
        {formatLong(date)} {date.slice(0, 4)}
      </p>
      <p className="cy-week">
        <span className="cy-week-name">{c.week}</span>
        <span className="cy-week-no">{c.weekNumber}. Woche im Kirchenjahr</span>
      </p>
      {c.feast && <p className="cy-feast">{c.feast}</p>}
      <ol className="cy-circles" aria-label="Festkreise des Kirchenjahres">
        {CIRCLES.map((circle) => (
          <li key={circle} className={circle === c.circle ? 'current' : undefined} aria-current={circle === c.circle ? 'true' : undefined}>
            <span className="cy-circle-name">{CIRCLE_LABEL[circle]}</span>
            {circle === c.circle && <span className="cy-season">{SEASON_LABEL[c.season]}</span>}
          </li>
        ))}
      </ol>
    </header>
  );
}
