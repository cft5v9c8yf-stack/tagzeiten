import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { CIRCLE_INFO, LECTIONARY_NOTE, SEASON_INFO, SUNDAY_INFO, trinityGroupOf } from '../../content/churchYearGuide';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { churchDay, churchYearOutline, CIRCLES, SEASON_LABEL, type Circle, type OutlineEntry } from '../../domain/churchYear';
import { fromKey, MONTH_LONG, formatShort, type DateKey } from '../../domain/dates';
import { BibleLink } from '../../ui/BibleLink';
import { Segmented } from '../../ui/Choice';
import { Section } from '../../ui/Section';
import { setOpen } from '../../ui/collapseState';

const dayMonth = (k: DateKey) => {
  const d = fromKey(k);
  return `${d.getDate()}. ${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`;
};

/** Splits Trinity-season entries into their thematic groups, in order. */
function groupsOf(entries: OutlineEntry[]) {
  const groups: { title: string; range: string; entries: OutlineEntry[] }[] = [];
  for (const e of entries) {
    const g = trinityGroupOf(e.key);
    const title = g?.title ?? '';
    let last = groups[groups.length - 1];
    if (!last || last.title !== title) {
      last = { title, range: g?.range ?? '', entries: [] };
      groups.push(last);
    }
    last.entries.push(e);
  }
  return groups;
}

function EntryList({
  entries,
  date,
  weekKey,
  level,
}: {
  entries: OutlineEntry[];
  date: DateKey;
  weekKey: string;
  level: 4 | 5;
}) {
  const Title = level === 4 ? 'h4' : 'h5';
  return (
    <ol className="cy-entries">
      {entries.map((e) => {
        const info = SUNDAY_INFO[e.key];
        const isFeastToday = e.kind === 'feast' && e.date === date;
        const current = e.key === weekKey || isFeastToday;
        return (
          <li
            key={e.key}
            id={`entry-${e.key}`}
            tabIndex={-1}
            className={`cy-entry${current ? ' current' : ''}${e.kind === 'feast' ? ' feast' : ''}`}
          >
            <div className="cy-entry-head">
              <span className="cy-entry-date">{formatShort(e.date)}</span>
              <Title>{e.name}</Title>
              {current && <span className="ktag">{isFeastToday ? 'heute' : 'diese Woche'}</span>}
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
  );
}

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
      // Unfold the phase and group that hold the Sunday, whatever was folded before.
      const entry = outline.entries.find((e) => e.key === focus);
      if (entry) {
        flushSync(() => {
          setOpen(`cy.phase.${entry.season}`, true);
          const group = trinityGroupOf(entry.key);
          if (group) setOpen(`cy.group.${group.title}`, true);
        });
      }
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
          <Section key={s.season} id={`cy.phase.${s.season}`} title={SEASON_LABEL[s.season]} className="cy-phase">
            <p className="cy-phase-dates">
              {dayMonth(s.from)} – {dayMonth(s.to)}
            </p>
            <p>{SEASON_INFO[s.season]}</p>
            {s.season === 'trinity' || s.season === 'endOfYear' ? (
              groupsOf(entries).map((g) => (
                <Section
                  key={g.title}
                  id={`cy.group.${g.title}`}
                  title={
                    <>
                      {g.title} <span className="cy-group-range">{g.range}</span>
                    </>
                  }
                  level={4}
                  className="cy-group"
                  titleClassName="cy-group-title"
                >
                  <EntryList entries={g.entries} date={date} weekKey={today.weekKey} level={5} />
                </Section>
              ))
            ) : (
              <EntryList entries={entries} date={date} weekKey={today.weekKey} level={4} />
            )}
          </Section>
        );
      })}
      <p className="small muted">{LECTIONARY_NOTE}</p>
    </div>
  );
}
