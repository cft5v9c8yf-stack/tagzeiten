import { useDayLookup, useAllDays } from '../../data/hooks';
import { formatShort, type DateKey } from '../../domain/dates';
import { MARK_SYMBOL } from '../../domain/review';
import { collectedVerses, lookback, markCounts, stillTimesIn } from '../../domain/stats';

const STATE_LABEL = { none: 'nichts eingetragen', one: 'Morgen oder Abend gebetet', both: 'Morgen und Abend gebetet' } as const;

/**
 * The last four weeks as a neutral row of dots, and three plain numbers.
 * Documentation, not assessment: empty days are grey (rules 4 and 5).
 */
export function Lookback({ date }: { date: DateKey }) {
  const lookup = useDayLookup();
  const days = useAllDays();
  const dots = lookback(lookup, date, 28);
  const marks = markCounts(lookup, date, 30);

  return (
    <div className="panel">
      <p className="panel-label">Die letzten vier Wochen</p>
      <ol className="dots" aria-label="Die letzten 28 Tage">
        {dots.map((d) => (
          <li key={d.date} className={`dot ${d.state}`} title={`${formatShort(d.date)}: ${STATE_LABEL[d.state]}`}>
            <span className="visually-hidden">
              {formatShort(d.date)}: {STATE_LABEL[d.state]}
            </span>
          </li>
        ))}
      </ol>
      <p className="dots-legend">
        <span className="dot both" aria-hidden="true" /> Morgen und Abend <span className="dot one" aria-hidden="true" /> eines von beiden
      </p>
      <dl className="stats">
        <div>
          <dt>Stille Zeiten in 30 Tagen</dt>
          <dd>{stillTimesIn(lookup, date, 30)}</dd>
        </div>
        <div>
          <dt>Verse gesammelt</dt>
          <dd>{collectedVerses(days).length}</dd>
        </div>
        <div>
          <dt>Drei Dinge in 30 Tagen</dt>
          <dd className="marks-dist">
            {(['plus', 'tilde', 'minus'] as const).map((m) => (
              <span key={m}>
                <span className={`mark ${m}`}>{MARK_SYMBOL[m]}</span> {marks[m]}
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </div>
  );
}
