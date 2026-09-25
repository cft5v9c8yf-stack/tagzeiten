import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { CIRCLE_INFO, LECTIONARY_NOTE, SEASON_INFO, SUNDAY_INFO } from '../../content/churchYearGuide';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { churchDay, churchYearOutline, CIRCLES, SEASON_LABEL, type Circle } from '../../domain/churchYear';
import { fromKey, MONTH_LONG, formatShort, type DateKey } from '../../domain/dates';
import { BibleLink } from '../../ui/BibleLink';
import { Segmented } from '../../ui/Choice';

const dayMonth = (k: DateKey) => {
  const d = fromKey(k);
  return `${d.getDate()}. ${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`;
};

const isCircle = (s: string | null): s is Circle => s === 'christmas' || s === 'easter' || s === 'pentecost';

/**
 * One festal circle of the current church year: what it means, its seasons,
 * and every Sunday and major feast with Gospel and Epistle (references only).
 */
export function ChurchYearPage() {
  const { date, isToday } = useSelectedDate();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const today = churchDay(date);
  const kreis = params.get('kreis');
  const circle: Circle = isCircle(kreis) ? kreis : today.circle;
  const focus = params.get('woche');
  const outline = churchYearOutline(date);
  const seasons = outline.seasons.filter((s) => s.circle === circle);

  // Jump to a Sunday when coming from the week on the Today page.
  useEffect(() => {
    if (!focus) return;
    // Wait for the layout, which resets scroll and focus on every page change.
    const id = setTimeout(() => {
      const el = document.getElementById(`entry-${focus}`);
      el?.scrollIntoView({ block: 'start' });
      el?.focus({ preventScroll: true });
    }, 0);
    return () => clearTimeout(id);
  }, [focus, circle]);

  const setCircle = (c: Circle) => {
    const next = new URLSearchParams(params);
    next.set('kreis', c);
    next.delete('woche');
    navigate({ search: next.toString() }, { replace: true });
  };

  return (
    <div className="church-year-page">
      <p className="back-link">
        <Link to={withDate('/', date, isToday)}>‹ Zurück zu Heute</Link>
      </p>
      <h2>Das Kirchenjahr {outline.churchYear}/{String(outline.churchYear + 1).slice(2)}</h2>
      <Segmented
        label="Festkreis"
        value={circle}
        onChange={setCircle}
        options={CIRCLES.map((c) => ({ value: c, label: CIRCLE_INFO[c].title }))}
      />
      <p className="cy-intro">{CIRCLE_INFO[circle].intro}</p>

      {seasons.map((s) => {
        const entries = outline.entries.filter((e) => e.season === s.season);
        return (
          <section key={s.season} className="cy-phase" aria-labelledby={`phase-${s.season}`}>
            <h3 id={`phase-${s.season}`}>{SEASON_LABEL[s.season]}</h3>
            <p className="cy-phase-dates">
              {dayMonth(s.from)} – {dayMonth(s.to)}
            </p>
            <p>{SEASON_INFO[s.season]}</p>
            <ol className="cy-entries">
              {entries.map((e) => {
                const info = SUNDAY_INFO[e.key];
                const current = e.key === today.weekKey || (e.kind === 'feast' && e.date === date);
                return (
                  <li
                    key={e.key}
                    id={`entry-${e.key}`}
                    tabIndex={-1}
                    className={`cy-entry${current ? ' current' : ''}${e.kind === 'feast' ? ' feast' : ''}`}
                  >
                    <div className="cy-entry-head">
                      <span className="cy-entry-date">{formatShort(e.date)}</span>
                      <h4>{e.name}</h4>
                      {current && <span className="ktag">{e.kind === 'feast' && e.date === date ? 'heute' : 'diese Woche'}</span>}
                    </div>
                    {info?.meaning && <p className="cy-meaning">{info.meaning}</p>}
                    {info && <p className="cy-theme">{info.theme}</p>}
                    {info && (
                      <dl className="cy-readings">
                        <div>
                          <dt>Evangelium</dt>
                          <dd>
                            <BibleLink reference={info.gospel} />
                          </dd>
                        </div>
                        <div>
                          <dt>Epistel</dt>
                          <dd>
                            <BibleLink reference={info.epistle} />
                          </dd>
                        </div>
                      </dl>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
      <p className="small muted">{LECTIONARY_NOTE}</p>
    </div>
  );
}
