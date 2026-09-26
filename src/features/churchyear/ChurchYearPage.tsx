import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { CIRCLE_INFO, LECTIONARY_NOTE, SEASON_INFO, SEASON_THEME, SUNDAY_INFO, trinityGroupOf } from '../../content/churchYearGuide';
import {
  CHURCH_YEAR_INTRO,
  CHURCH_YEAR_INTRO_GLORIA,
  CHURCH_YEAR_INTRO_SOURCE,
  CHURCH_YEAR_INTRO_TITLE,
} from '../../content/churchYearIntro';
import { CIRCLE_GUIDE, DAY_GUIDE, EXTRA_DAYS, GROUP_REFS, optionalDays, SEASON_GUIDE } from '../../content/dieffenbach';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { churchDay, churchYearOutline, CIRCLES, SEASON_LABEL, type Circle, type OutlineEntry, type Season } from '../../domain/churchYear';
import { fromKey, MONTH_LONG, formatShort, type DateKey } from '../../domain/dates';
import { BibleRef } from '../../ui/BibleRef';
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
            {DAY_GUIDE[e.key] && <p className="cy-hausagende">{DAY_GUIDE[e.key]}</p>}
            {info && (
              <dl className="cy-readings">
                <div>
                  <dt>Evangelium</dt>
                  <dd>
                    <BibleRef reference={info.gospel} />
                  </dd>
                </div>
                <div>
                  <dt>Epistel</dt>
                  <dd>
                    <BibleRef reference={info.epistle} />
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

/** Days of the book without an entry of their own this year, by title and text. */
function MoreDays({ title, days }: { title: string; days: readonly { label: string; text: string }[] }) {
  if (days.length === 0) return null;
  return (
    <div className="cy-more-days">
      <p className="cy-more-title">{title}</p>
      <dl>
        {days.map((d) => (
          <div key={d.label}>
            <dt>{d.label}</dt>
            <dd className="cy-hausagende">{d.text}</dd>
          </div>
        ))}
      </dl>
    </div>
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
  const guide = CIRCLE_GUIDE[circle];
  const present = new Set(outline.entries.map((e) => e.key));
  const missing = (season: Season, keys?: (k: string) => boolean) =>
    optionalDays()
      .filter((d) => d.season === season && !present.has(d.key) && (!keys || keys(d.key)))
      .map((d) => ({ label: d.label, text: DAY_GUIDE[d.key]! }));

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
      <Section id="cy.intro" title="Einleitung" defaultOpen={false} className="cy-dieffenbach">
        <p className="cy-intro-title">{CHURCH_YEAR_INTRO_TITLE}</p>
        {CHURCH_YEAR_INTRO.map((part) => (
          <section key={part.heading} className="cy-intro-part">
            <h4>{part.heading}</h4>
            {part.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </section>
        ))}
        <p className="cy-intro-gloria">{CHURCH_YEAR_INTRO_GLORIA}</p>
        <p className="small muted">{CHURCH_YEAR_INTRO_SOURCE} In der Rechtschreibung des Originals.</p>
      </Section>
      <Segmented
        label="Festkreis"
        value={circle}
        onChange={setCircle}
        options={CIRCLES.map((c) => ({ value: c, label: CIRCLE_INFO[c].title }))}
      />
      <p className="cy-circle-of">
        {CIRCLE_INFO[circle].of} <span className="muted">· {CIRCLE_INFO[circle].range}</span>
      </p>
      <p className="cy-intro">{CIRCLE_INFO[circle].intro}</p>
      <Section id={`cy.explain.${circle}`} title="Zur Erklärung" defaultOpen={false} className="cy-dieffenbach">
        {guide.motto && (
          <blockquote className="cy-motto">
            <p>{guide.motto.text}</p>
            <footer>
              <BibleRef reference={guide.motto.ref} />
            </footer>
          </blockquote>
        )}
        {guide.explanation.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
        <p className="small muted">{CHURCH_YEAR_INTRO_SOURCE} In der Rechtschreibung des Originals.</p>
      </Section>

      {seasons.map((s) => {
        const entries = outline.entries.filter((e) => e.season === s.season);
        return (
          <Section key={s.season} id={`cy.phase.${s.season}`} title={SEASON_LABEL[s.season]} className="cy-phase">
            <p className="cy-phase-dates">
              {dayMonth(s.from)} – {dayMonth(s.to)}
            </p>
            <p className="cy-season-theme">{SEASON_THEME[s.season]}</p>
            <p>{SEASON_INFO[s.season]}</p>
            {SEASON_GUIDE[s.season]?.intro && <p className="cy-hausagende">{SEASON_GUIDE[s.season]!.intro}</p>}
            {s.season === 'trinity' ? (
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
                  {GROUP_REFS[g.title] && (
                    <p className="cy-group-refs">
                      {GROUP_REFS[g.title]!.map((r) => (
                        <BibleRef key={r} reference={r} />
                      ))}
                    </p>
                  )}
                  <EntryList entries={g.entries} date={date} weekKey={today.weekKey} level={5} />
                  <MoreDays
                    title="In diesem Jahr ohne eigenen Sonntag"
                    days={missing('trinity', (k) => trinityGroupOf(k)?.title === g.title)}
                  />
                </Section>
              ))
            ) : (
              <>
                <EntryList entries={entries} date={date} weekKey={today.weekKey} level={4} />
                <MoreDays title="In diesem Jahr ohne eigenen Sonntag" days={missing(s.season)} />
              </>
            )}
            <MoreDays title="Weitere Tage" days={EXTRA_DAYS[s.season] ?? []} />
            {SEASON_GUIDE[s.season]?.note && (
              <p className="cy-note">
                <span className="cy-note-label">Anmerkung.</span> {SEASON_GUIDE[s.season]!.note}
              </p>
            )}
          </Section>
        );
      })}
      <section className="cy-closing" aria-label={`Beschluss des ${CIRCLE_INFO[circle].title}es`}>
        {guide.closing.map((p, i) => (
          <p key={p.slice(0, 48)} className={i === guide.closing.length - 1 ? 'cy-intro-gloria' : undefined}>
            {p}
          </p>
        ))}
      </section>
      <p className="small muted">
        Die Deutung der Sonn- und Festtage, die Erklärungen und Anmerkungen stammen aus: {CHURCH_YEAR_INTRO_SOURCE}
      </p>
      <p className="small muted">{LECTIONARY_NOTE}</p>
    </div>
  );
}
