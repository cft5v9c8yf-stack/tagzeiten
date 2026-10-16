import { useDeferredValue, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { NotFound } from '../../app/NotFound';
import { formatShort } from '../../domain/dates';
import { contents, dayPath, isRead, searchBook, sequence, todaysDay, type DogmatikBook, type DogmatikDay } from '../../domain/dogmatik';
import { BackLink } from '../../ui/BackLink';
import { Segmented } from '../../ui/Choice';
import { Section } from '../../ui/Section';
import { DogmatikDayPage } from './DogmatikDayPage';
import { DogmatikSettings } from './DogmatikSettings';
import { useDogmatikBook, useDogmatikSettings } from './useDogmatik';

type View = 'plan' | 'contents' | 'hits';

/** How many sections the plan view shows from today on. */
const PLAN_AHEAD = 7;

/** A link to a day, opened from Nachschlagen (the way back leads here). */
function useDayLink() {
  const { date, isToday } = useSelectedDate();
  return (tag: number) => {
    const to = withDate(dayPath(tag), date, isToday);
    return `${to}${to.includes('?') ? '&' : '?'}von=nachschlagen`;
  };
}

/** Leseplan: the next sections as a line, today on top. Where one stands, not what is owed (rule 6). */
function PlanView({ book, today }: { book: DogmatikBook; today?: DogmatikDay }) {
  const [s] = useDogmatikSettings();
  const link = useDayLink();
  const seq = sequence(book, s);
  const from = Math.max(0, seq.findIndex((d) => d.tag === today?.tag));
  return (
    <>
      {!s.on && <p className="small muted">Der Leseplan ist ausgeschaltet. Das Buch bleibt zum Nachschlagen.</p>}
      <ol className="dogmatik-timeline">
        {seq.slice(from, from + PLAN_AHEAD).map((d, i) => {
          const current = s.on && d.tag === today?.tag;
          const read = isRead(s, d.tag);
          return (
            <li key={d.tag} className={`timeline-item${current ? ' current' : ''}${read ? ' read' : ''}`}>
              <Link className="timeline-link" to={link(d.tag)}>
                <span className="timeline-dot" aria-hidden="true">
                  {read ? '✓' : ''}
                </span>
                <span className="timeline-label">
                  {current ? 'Heute' : i === 1 ? 'Danach' : `${i}. Abschnitt danach`}
                </span>
                <span className="timeline-title">{d.titel}</span>
                <span className="timeline-meta">
                  Tag {d.tag} · {d.minuten} Min.{read && ` · gelesen am ${formatShort(s.read[String(d.tag)]!)}`}
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

/** Inhalt: the book's table of contents, by doctrine and chapter, with the page. */
function ContentsView({ book, today }: { book: DogmatikBook; today?: DogmatikDay }) {
  const [s] = useDogmatikSettings();
  const link = useDayLink();
  return (
    <div className="dogmatik-toc">
      {contents(book).map((part) => (
        <section key={part.teil} className="toc-part" aria-label={part.teil}>
          <h3 className="toc-part-title">{part.teil}</h3>
          {part.chapters.map((ch) => (
            <div key={ch.kapitel ?? ''} className="toc-chapter">
              {ch.kapitel && <h4 className="toc-chapter-title">{ch.kapitel}</h4>}
              {ch.sections.map((sec) => (
                <div key={sec.abschnitt ?? ''} className="toc-section">
                  {sec.abschnitt && <h5 className="toc-section-title">{sec.abschnitt}</h5>}
                  <ol className="toc-list">
                    {sec.tage.map((d) => {
                      const current = s.on && d.tag === today?.tag;
                      const read = isRead(s, d.tag);
                      return (
                        <li key={d.tag} className={`toc-item${current ? ' current' : ''}${read ? ' read' : ''}`}>
                          <Link className="toc-row" to={link(d.tag)}>
                            <span className="toc-no">{d.tag}</span>
                            <span className="toc-title">
                              {d.titel}
                              {current && <span className="ktag">heute</span>}
                              {read && <span className="toc-read" aria-label="gelesen"> ✓</span>}
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
        </section>
      ))}
    </div>
  );
}

/** Nachschlagen: the plan from today on, the book's contents by doctrine, and a search through all of it. */
function Lookup({ book }: { book: DogmatikBook }) {
  const { date, isToday } = useSelectedDate();
  const [s] = useDogmatikSettings();
  const [view, setView] = useState<View>('plan');
  const [query, setQuery] = useState('');
  const q = useDeferredValue(query);
  const hits = useMemo(() => searchBook(book, q), [book, q]);
  const today = todaysDay(book, s, date);
  const readCount = book.tage.filter((d) => isRead(s, d.tag)).length;
  const shown: View = query.trim() ? 'hits' : view;

  return (
    <div className="dogmatik-lookup">
      <div className="title-row">
        <p className="back-link">
          <BackLink to={withDate('/katechismus', date, isToday)}>Lehre</BackLink>
        </p>
        <h2 className="cat-part-title">Dogmatik</h2>
      </div>
      <p className="book-source">
        {book.buch.autor}, {book.buch.titel}, Band {book.buch.band}. {readCount} von {book.buch.umfang} Abschnitten gelesen.
      </p>

      <label className="visually-hidden" htmlFor="dogmatik-search">
        Im Buch suchen
      </label>
      <input
        id="dogmatik-search"
        type="search"
        className="dogmatik-search"
        placeholder="Im ganzen Buch suchen"
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

      {shown === 'plan' && <PlanView book={book} today={today} />}
      {shown === 'contents' && <ContentsView book={book} today={today} />}
      {shown === 'hits' &&
        (q.trim().length < 2 ? (
          <p className="small muted">Ein Wort eingeben, z. B. „Rechtfertigung“ oder „Fundament“. Die Suche geht über Text, Fußnoten und Zitate.</p>
        ) : hits.length === 0 ? (
          <p className="small muted">Nichts gefunden.</p>
        ) : (
          <ol className="dogmatik-hits">
            {hits.map((h) => {
              const to = withDate(h.doc.to, date, isToday);
              return (
                <li key={h.doc.to}>
                  <Link className="hit-card" to={`${to}${to.includes('?') ? '&' : '?'}von=nachschlagen`}>
                    <span className="hit-area">{h.doc.area}</span>
                    <span className="hit-title">
                      {h.titleMarked.map((p, i) => (p.mark ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
                    </span>
                    <span className="hit-snippet">
                      {h.snippet.map((p, i) => (p.mark ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        ))}

      {book.buch.quelle && <p className="small muted dogmatik-source">{book.buch.quelle}</p>}

      <Section id="dogmatik.settings" title="Leseplan einstellen" defaultOpen={false} className="block block-quiet">
        <DogmatikSettings book={book} />
      </Section>
    </div>
  );
}

/** /katechismus/dogmatik (Nachschlagen) and /katechismus/dogmatik/:tag (a day). */
export function DogmatikPage() {
  const { tag } = useParams();
  const book = useDogmatikBook();
  if (!book) return <p className="small muted">Die Dogmatik wird geladen …</p>;
  if (!tag) return <Lookup book={book} />;
  const day = book.tage.find((d) => String(d.tag) === tag);
  // A new day starts with its own notes folded and its own translation hidden.
  return day ? <DogmatikDayPage key={day.tag} book={book} day={day} /> : <NotFound />;
}
