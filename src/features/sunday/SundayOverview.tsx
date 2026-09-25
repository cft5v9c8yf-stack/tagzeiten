import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { trinityGroupOf } from '../../content/churchYearGuide';
import { churchDay, churchYearOutline, SEASON_LABEL, type OutlineEntry } from '../../domain/churchYear';
import { addDays, formatShort } from '../../domain/dates';
import { Section } from '../../ui/Section';
import { Chevron, useSundayLinks } from './SundayPage';

/** Splits the weeks of a season into the Trinity groups, where there are any. */
function groupsOf(weeks: OutlineEntry[]) {
  const groups: { title?: string; weeks: OutlineEntry[] }[] = [];
  for (const w of weeks) {
    const title = trinityGroupOf(w.key)?.title;
    const last = groups.at(-1);
    if (last && last.title === title) last.weeks.push(w);
    else groups.push({ title, weeks: [w] });
  }
  return groups;
}

/**
 * All Sundays of the church year (and Christmas Day and Epiphany, which open a
 * week too), to choose one; the chosen one opens on the Sunday page.
 */
export function SundayOverview() {
  const links = useSundayLinks();
  const outline = churchYearOutline(links.shown);
  const weeks = outline.entries.filter((e) => e.opensWeek);
  const prevYear = churchDay(addDays(outline.start, -1)).weekStart;
  const nextYear = churchDay(addDays(outline.end, 1)).weekStart;
  const listRef = useRef<HTMLDivElement>(null);

  // Bring the Sunday one came from into view (after the layout's reset to the top).
  useEffect(() => {
    const id = setTimeout(() => {
      listRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView?.({ block: 'center' });
    }, 0);
    return () => clearTimeout(id);
  }, [links.shown]);

  return (
    <div className="sunday-page sunday-overview">
      <header className="sunday-head">
        <Link className="sunday-step" to={links.overview(prevYear)} aria-label="Voriges Kirchenjahr">
          <span className="sunday-step-circle">
            <Chevron dir="left" />
          </span>
          <span className="sunday-step-label" aria-hidden="true">
            Voriges Jahr
          </span>
        </Link>
        <div className="sunday-center">
          <p className="sunday-kicker">
            Kirchenjahr {outline.churchYear}/{String(outline.churchYear + 1).slice(2)}
          </p>
          <h2 className="sunday-name">Alle Sonntage</h2>
          <p className="sunday-week">
            <Link className="sunday-back" to={links.sunday(links.shown)}>
              Zurück zum Sonntag
            </Link>
          </p>
        </div>
        <Link className="sunday-step" to={links.overview(nextYear)} aria-label="Nächstes Kirchenjahr">
          <span className="sunday-step-circle">
            <Chevron dir="right" />
          </span>
          <span className="sunday-step-label" aria-hidden="true">
            Nächstes Jahr
          </span>
        </Link>
      </header>

      <div ref={listRef}>
        {outline.seasons.map((season) => {
          const inSeason = weeks.filter((w) => w.season === season.season);
          if (inSeason.length === 0) return null;
          return (
            <Section key={season.season} id={`sunday.all.${season.season}`} title={SEASON_LABEL[season.season]} className="week-season">
              {groupsOf(inSeason).map((g) => (
                <div key={g.title ?? season.season} className="week-group">
                  {g.title && <p className="week-group-title">{g.title}</p>}
                  <ol className="week-list">
                    {g.weeks.map((w) => (
                      <li key={w.date}>
                        <Link
                          to={links.sunday(w.date)}
                          aria-current={w.date === links.shown ? 'page' : undefined}
                          className={`week-link${w.date === links.current ? ' is-current-week' : ''}`}
                        >
                          <span className="week-date">{formatShort(w.date)}</span>
                          <span className="week-name">{w.name}</span>
                          {w.date === links.current && <span className="ktag">diese Woche</span>}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </Section>
          );
        })}
      </div>
    </div>
  );
}
