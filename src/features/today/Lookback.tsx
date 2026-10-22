import { useAllDays, useDayLookup, useProfile } from '../../data/hooks';
import { formatShort, type DateKey } from '../../domain/dates';
import { MARK_LABEL, MARK_SYMBOL } from '../../domain/review';
import { collectedVerses, lookback, markCounts, stillTimesIn } from '../../domain/stats';

const STATE_LABEL = { none: 'nichts eingetragen', one: 'Morgen oder Abend gebetet', both: 'Morgen und Abend gebetet' } as const;

/** What the row of dots shows, in words; empty days are not counted (rule 5). */
export function lookbackSummary(dots: readonly { state: keyof typeof STATE_LABEL }[]): string {
  const both = dots.filter((d) => d.state === 'both').length;
  const one = dots.filter((d) => d.state === 'one').length;
  const days = (n: number) => `${n} ${n === 1 ? 'Tag' : 'Tagen'}`;
  return `Die letzten ${dots.length} Tage: an ${days(both)} Morgen und Abend gebetet, an ${days(one)} eines von beiden.`;
}

/**
 * The last four weeks as a neutral row of dots, and three plain numbers.
 * Documentation, not assessment: empty days are grey (rules 4 and 5).
 */
export function Lookback({ date }: { date: DateKey }) {
  const lookup = useDayLookup();
  const days = useAllDays();
  const profile = useProfile();
  const dots = lookback(lookup, date, 28, profile.showCompline);
  const marks = markCounts(lookup, date, 30);

  return (
    <div className="panel">
      {/* One sentence for screen readers instead of 28 single announcements. */}
      <p className="visually-hidden">{lookbackSummary(dots)}</p>
      <ol className="dots" aria-hidden="true">
        {dots.map((d) => (
          <li key={d.date} className={`dot ${d.state}`} title={`${formatShort(d.date)}: ${STATE_LABEL[d.state]}`} />
        ))}
      </ol>
      <p className="dots-legend">
        <span className="legend-item">
          <span className="dot both" aria-hidden="true" /> Morgen und Abend
        </span>
        <span className="legend-item">
          <span className="dot one" aria-hidden="true" /> eines von beiden
        </span>
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
        <div className="stats-three">
          <dt>Drei Dinge in 30 Tagen</dt>
          <dd className="marks-dist">
            {(['plus', 'tilde', 'minus'] as const).map((m) => (
              <span key={m} title={MARK_LABEL[m]}>
                <span className={`mark ${m}`} aria-hidden="true">
                  {MARK_SYMBOL[m]}
                </span>{' '}
                {marks[m]} <span className="marks-word">{MARK_LABEL[m]}</span>
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </div>
  );
}
