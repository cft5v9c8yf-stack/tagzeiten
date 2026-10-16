import { useDeferredValue, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { NotFound } from '../../app/NotFound';
import { formatShort } from '../../domain/dates';
import { dayPath, isRead, parts, searchBook, sequence, sourceLine, todaysDay, type DogmatikBook } from '../../domain/dogmatik';
import { BackLink } from '../../ui/BackLink';
import { Segmented } from '../../ui/Choice';
import { Section } from '../../ui/Section';
import { DogmatikDayPage } from './DogmatikDayPage';
import { DogmatikSettings } from './DogmatikSettings';
import { useDogmatikBook, useDogmatikSettings } from './useDogmatik';

type View = 'plan' | 'contents' | 'hits';

/** How many sections the plan view shows from today on. */
const PLAN_AHEAD = 7;

function Row({ book, tag, current, read, date, isToday }: { book: DogmatikBook; tag: number; current: boolean; read: string | undefined; date: string; isToday: boolean }) {
  const day = book.tage.find((d) => d.tag === tag)!;
  const to = withDate(dayPath(tag), date, isToday);
  return (
    <li className={`dogmatik-item${current ? ' current' : ''}${read ? ' read' : ''}`}>
      <Link className="dogmatik-row" to={`${to}${to.includes('?') ? '&' : '?'}von=nachschlagen`}>
        <span className="dogmatik-row-no">Tag {tag}</span>
        <span className="dogmatik-row-title">{day.titel}</span>
        <span className="dogmatik-row-meta">
          {current && <span className="ktag">heute</span>} {sourceLine(book, day)} · {day.minuten} Min.
          {read && <span className="dogmatik-row-read"> · ✓ {formatShort(read)}</span>}
        </span>
      </Link>
    </li>
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
  const seq = sequence(book, s);
  const from = Math.max(0, seq.findIndex((d) => d.tag === today?.tag));
  const readCount = book.tage.filter((d) => isRead(s, d.tag)).length;
  const row = (tag: number) => (
    <Row key={tag} book={book} tag={tag} current={s.on && tag === today?.tag} read={s.read[String(tag)]} date={date} isToday={isToday} />
  );
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

      {shown === 'plan' && (
        <>
          {!s.on && <p className="small muted">Der Leseplan ist ausgeschaltet. Das Buch bleibt zum Nachschlagen.</p>}
          <ol className="dogmatik-list">{seq.slice(from, from + PLAN_AHEAD).map((d) => row(d.tag))}</ol>
          <p className="small muted">Der Plan geht nach deinem Lesestand: Wer aussetzt, liest beim nächsten Abschnitt weiter.</p>
        </>
      )}
      {shown === 'contents' &&
        parts(book).map((p) => (
          <section key={p} className="dogmatik-part" aria-label={p}>
            <h3 className="book-circle">{p}</h3>
            <ol className="dogmatik-list">{book.tage.filter((d) => d.teil === p).map((d) => row(d.tag))}</ol>
          </section>
        ))}
      {shown === 'hits' &&
        (q.trim().length < 2 ? (
          <p className="small muted">Ein Wort eingeben, z. B. „Rechtfertigung“ oder „Fundament“. Die Suche geht über Text, Fußnoten und Zitate.</p>
        ) : hits.length === 0 ? (
          <p className="small muted">Nichts gefunden.</p>
        ) : (
          <ol className="dogmatik-list dogmatik-hits">
            {hits.map((h) => {
              const to = withDate(h.doc.to, date, isToday);
              return (
                <li key={h.doc.to}>
                  <Link className="dogmatik-row" to={`${to}${to.includes('?') ? '&' : '?'}von=nachschlagen`}>
                    <span className="dogmatik-row-no">{h.doc.area}</span>
                    <span className="dogmatik-row-title">
                      {h.titleMarked.map((p, i) => (p.mark ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
                    </span>
                    <span className="dogmatik-row-snippet">
                      {h.snippet.map((p, i) => (p.mark ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        ))}

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
