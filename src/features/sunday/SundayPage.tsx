import { Link } from 'react-router';
import { SEASON_INFO, SUNDAY_INFO, trinityGroupOf } from '../../content/churchYearGuide';
import { READING_SUMMARIES } from '../../content/readingSummaries';
import { WEEKLY_VERSES } from '../../content/weeklyVerses';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { churchDay, churchYearOutline, CIRCLE_LABEL, CIRCLES, SEASON_LABEL } from '../../domain/churchYear';
import { fromKey, MONTH_LONG, type DateKey } from '../../domain/dates';
import { composeVerse } from '../../domain/weeklyVerse';
import { BibleLink } from '../../ui/BibleLink';

const longDate = (k: DateKey) => {
  const d = fromKey(k);
  return `${d.getDate()}. ${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * The week comes from its Sunday: the Sunday of the current week with its verse,
 * its meaning, its place in the church year, and Gospel and Epistle – as
 * references to read in the Bible on paper (rule 13).
 */
export function SundayPage() {
  const { date, isToday } = useSelectedDate();
  const c = churchDay(date);
  const outline = churchYearOutline(date);
  const entry = outline.entries.find((e) => e.key === c.weekKey);
  const info = SUNDAY_INFO[c.weekKey];
  const verse = WEEKLY_VERSES[c.weekKey];
  const group = trinityGroupOf(c.weekKey);
  const summary = READING_SUMMARIES[c.weekKey];
  const toChurchYear = (circle: string, week?: string) =>
    withDate('/kirchenjahr', date, isToday) + (isToday ? '?' : '&') + `kreis=${circle}${week ? `&woche=${week}` : ''}`;

  return (
    <div className="sunday-page">
      <p className="sunday-kicker">{entry ? `Sonntag, ${longDate(entry.date)}` : 'Diese Woche'}</p>
      {group && (
        <p className="sunday-group">
          {group.title} <span className="muted">({group.range})</span>
        </p>
      )}
      <h2 className="sunday-name">{c.week}</h2>
      <p className="sunday-week">{c.weekNumber}. Woche im Kirchenjahr</p>

      {verse && (
        <figure className="sunday-verse">
          <figcaption>Wochenspruch</figcaption>
          <blockquote>{composeVerse(verse)}</blockquote>
          <p className="cy-verse-ref">
            <BibleLink reference={verse.ref} />
          </p>
        </figure>
      )}

      {info && (
        <section className="block block-plain" aria-labelledby="sunday-meaning">
          <h3 id="sunday-meaning">Bedeutung</h3>
          {info.meaning && <p className="cy-meaning">{info.meaning}</p>}
          <p className="sunday-theme">{info.theme}</p>
        </section>
      )}

      {info && (
        <section className="block block-hero" aria-labelledby="sunday-readings">
          <h3 id="sunday-readings">Evangelium und Epistel</h3>
          <div className="sunday-readings">
            <div className="sunday-reading">
              <span className="track">Evangelium</span>
              <BibleLink reference={info.gospel} />
              {summary && <p className="sunday-summary">{summary.gospel}</p>}
            </div>
            <div className="sunday-reading">
              <span className="track">Epistel</span>
              <BibleLink reference={info.epistle} />
              {summary && <p className="sunday-summary">{summary.epistle}</p>}
            </div>
          </div>
          <p className="small muted">In der Bibel lesen, auf Papier; der Link öffnet die Lutherbibel.</p>
        </section>
      )}

      <section className="block block-warm" aria-labelledby="sunday-place">
        <h3 id="sunday-place">Im Kirchenjahr</h3>
        <ol className="cy-circles" aria-label="Festkreise des Kirchenjahres">
          {CIRCLES.map((circle) => (
            <li
              key={circle}
              className={circle === c.circle ? 'current' : undefined}
              aria-current={circle === c.circle ? 'true' : undefined}
            >
              <Link to={toChurchYear(circle)}>
                <span className="cy-circle-name">{CIRCLE_LABEL[circle]}</span>
                {circle === c.circle && <span className="cy-season">{SEASON_LABEL[c.season]}</span>}
              </Link>
            </li>
          ))}
        </ol>
        <p>{SEASON_INFO[c.season]}</p>
      </section>
    </div>
  );
}
