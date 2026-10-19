import { useDeferredValue, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { NotFound } from '../../app/NotFound';
import { formatShort } from '../../domain/dates';
import {
  contents,
  dayPath,
  findDay,
  isRead,
  keyOf,
  searchLibrary,
  todaysPortion,
  type DogmatikDay,
  type DogmatikLibrary,
} from '../../domain/dogmatik';
import { BackLink } from '../../ui/BackLink';
import { Segmented } from '../../ui/Choice';
import { Section } from '../../ui/Section';
import { DogmatikDayPage } from './DogmatikDayPage';
import { DogmatikSettings } from './DogmatikSettings';
import { useDogmatikLibrary, useDogmatikSettings } from './useDogmatik';

type View = 'plan' | 'contents' | 'hits';

/** How many sections the plan view shows from today on. */
const PLAN_AHEAD = 7;

/** A link to a day, opened from Nachschlagen (the way back leads here). */
function useDayLink() {
  const { date, isToday } = useSelectedDate();
  return (d: DogmatikDay | string) => {
    const to = withDate(typeof d === 'string' ? d : dayPath(d), date, isToday);
    return `${to}${to.includes('?') ? '&' : '?'}von=nachschlagen`;
  };
}

/** Leseplan: today's reading and what follows, as a line. Where one stands, not what is owed (rule 6). */
function PlanView({ lib }: { lib: DogmatikLibrary }) {
  const { date } = useSelectedDate();
  const [s] = useDogmatikSettings();
  const link = useDayLink();
  const portion = todaysPortion(lib, s, date);
  const start = Math.max(0, lib.tage.findIndex((d) => d === portion[0]));
  const shown = lib.tage.slice(start).filter((d) => portion.includes(d) || !isRead(s, d)).slice(0, PLAN_AHEAD);
  let after = 0;
  return (
    <>
      {!s.on && <p className="small muted">Der Leseplan ist ausgeschaltet. Das Buch bleibt zum Nachschlagen.</p>}
      <ol className="dogmatik-timeline">
        {shown.map((d) => {
          const today = s.on && portion.includes(d);
          const read = isRead(s, d);
          if (!today) after += 1;
          return (
            <li key={keyOf(d)} className={`timeline-item${today ? ' current' : ''}${read ? ' read' : ''}`}>
              <Link className="timeline-link" to={link(d)}>
                <span className="timeline-dot" aria-hidden="true">
                  {read ? '✓' : ''}
                </span>
                <span className="timeline-label">{today ? 'Heute' : after === 1 ? 'Danach' : `${after}. Abschnitt danach`}</span>
                <span className="timeline-title">{d.titel}</span>
                <span className="timeline-meta">
                  Band {d.band} · Tag {d.tag} · {d.minuten} Min.{read && ` · gelesen am ${formatShort(s.read[keyOf(d)]!)}`}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="small muted">Der Plan geht nach deinem Lesestand: Wer aussetzt, liest beim nächsten Abschnitt weiter.</p>
    </>
  );
}

/** Inhalt: one volume's contents, by doctrine and chapter, with the page; the doctrine of today open. */
function ContentsView({ lib }: { lib: DogmatikLibrary }) {
  const { date } = useSelectedDate();
  const [s] = useDogmatikSettings();
  const link = useDayLink();
  const portion = todaysPortion(lib, s, date);
  const here = portion[0];
  const [band, setBand] = useState(here?.band ?? 1);
  const book = lib.baende.find((b) => b.buch.band === band) ?? lib.baende[0]!;
  const parts = useMemo(() => contents(book), [book]);
  return (
    <div className="dogmatik-toc">
      <Segmented
        label="Band"
        value={`${band}`}
        onChange={(v) => setBand(Number(v))}
        options={lib.baende.map((b) => ({ value: `${b.buch.band}`, label: `Band ${b.buch.band}` }))}
      />
      {parts.map((part) => (
        <Section
          key={part.teil}
          id={`dogmatik.toc.${band}.${part.teil}`}
          title={part.teil}
          defaultOpen={here?.band === band && here.teil === part.teil}
          className="toc-part"
          titleClassName="toc-part-title"
          aside={<span className="toc-days">Tag {part.chapters[0]!.sections[0]!.tage[0]!.tag}</span>}
        >
          {part.chapters.map((ch) => (
            <div key={ch.kapitel ?? ''} className="toc-chapter">
              {ch.kapitel && <h4 className="toc-chapter-title">{ch.kapitel}</h4>}
              {ch.sections.map((sec) => (
                <div key={sec.abschnitt ?? ''} className="toc-section">
                  {sec.abschnitt && <h5 className="toc-section-title">{sec.abschnitt}</h5>}
                  <ol className="toc-list">
                    {sec.tage.map((d) => {
                      const current = s.on && portion.includes(d);
                      const read = isRead(s, d);
                      return (
                        <li key={d.tag} className={`toc-item${current ? ' current' : ''}${read ? ' read' : ''}`}>
                          <Link className="toc-row" to={link(d)}>
                            <span className="toc-no">{d.tag}</span>
                            <span className="toc-title">
                              {d.titel}
                              {current && <span className="ktag">heute</span>}
                              {read && (
                                <span className="toc-read" aria-label="gelesen">
                                  {' '}
                                  ✓
                                </span>
                              )}
                            </span>
                            <span className="toc-page">{d.seite ? `S. ${d.seite}` : ''}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>
          ))}
        </Section>
      ))}
      {book.buch.quelle && <p className="small muted dogmatik-source">{book.buch.quelle}</p>}
    </div>
  );
}

/** Nachschlagen: the plan from today on, the contents of each volume, and a search through all three. */
function Lookup({ lib }: { lib: DogmatikLibrary }) {
  const { date, isToday } = useSelectedDate();
  const [s] = useDogmatikSettings();
  const link = useDayLink();
  const [view, setView] = useState<View>('plan');
  const [query, setQuery] = useState('');
  const q = useDeferredValue(query);
  const hits = useMemo(() => (q.trim().length < 2 ? [] : searchLibrary(lib, q)), [lib, q]);
  const readCount = lib.tage.filter((d) => isRead(s, d)).length;
  const shown: View = query.trim() ? 'hits' : view;

  return (
    <div className="dogmatik-lookup">
      <div className="title-row">
        <BackLink to={withDate('/katechismus', date, isToday)}>Lehre</BackLink>
        <h2 className="cat-part-title">Dogmatik</h2>
      </div>
      <p className="book-source">
        Francis Pieper, Christliche Dogmatik, drei Bände (1917–1924). {readCount} von {lib.tage.length} Abschnitten gelesen.
      </p>

      <label className="visually-hidden" htmlFor="dogmatik-search">
        In allen drei Bänden suchen
      </label>
      <input
        id="dogmatik-search"
        type="search"
        className="dogmatik-search"
        placeholder="In allen drei Bänden suchen"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Segmented
        label="Ansicht"
        value={shown}
        onChange={(v) => {
          if (v !== 'hits') setQuery('');
          setView(v);
        }}
        options={[
          { value: 'plan', label: 'Leseplan' },
          { value: 'contents', label: 'Inhalt' },
          { value: 'hits', label: 'Treffer' },
        ]}
      />

      {shown === 'plan' && <PlanView lib={lib} />}
      {shown === 'contents' && <ContentsView lib={lib} />}
      {shown === 'hits' &&
        (q.trim().length < 2 ? (
          <p className="small muted">Ein Wort eingeben, z. B. „Rechtfertigung“ oder „Fundament“. Die Suche geht über Text, Fußnoten und Zitate aller drei Bände.</p>
        ) : hits.length === 0 ? (
          <p className="small muted">Nichts gefunden.</p>
        ) : (
          <ol className="dogmatik-hits">
            {hits.map((h) => (
              <li key={h.doc.to}>
                <Link className="hit-card" to={link(h.doc.to)}>
                  <span className="hit-area">{h.doc.area}</span>
                  <span className="hit-title">
                    {h.titleMarked.map((p, i) => (p.mark ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
                  </span>
                  <span className="hit-snippet">
                    {h.snippet.map((p, i) => (p.mark ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ))}

      <Section id="dogmatik.settings" title="Leseplan einstellen" defaultOpen={false} className="block block-quiet">
        <DogmatikSettings lib={lib} />
      </Section>
    </div>
  );
}

/** /katechismus/dogmatik (Nachschlagen) and /katechismus/dogmatik/:tag (a day, "2-100"). */
export function DogmatikPage() {
  const { tag } = useParams();
  const lib = useDogmatikLibrary();
  if (!lib) return <p className="small muted">Die Dogmatik wird geladen …</p>;
  if (!tag) return <Lookup lib={lib} />;
  const day = findDay(lib, tag);
  // A new day starts with its own notes folded and its own translation hidden.
  return day ? <DogmatikDayPage key={keyOf(day)} lib={lib} day={day} /> : <NotFound />;
}
