import { Fragment, useId, useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useAllDays, useProfile } from '../../data/hooks';
import { entryTitle, forgeTitle, searchArena } from '../../domain/arena';
import { RoundReviews, roundTitle } from '../arena/WinterArcRounds';
import { Section } from '../../ui/Section';
import { byYearAndMonth } from '../../domain/byMonth';
import { formatLong, toKey, type DateKey } from '../../domain/dates';
import { dayEntries, prayedOrders, readingLabel, type DaySection } from '../../domain/exportMarkdown';
import type { ArenaEntry, Day, Habit } from '../../domain/model';
import { isEmptyDay } from '../../domain/normalizeDay';
import { searchDays } from '../../domain/search';
import { collectedVerses } from '../../domain/stats';
import { answeredNewestFirst, ROLE_LABEL, type AnsweredPrayer } from '../../domain/house';
import { Segmented } from '../../ui/Choice';
import { HabitHistory } from './HabitHistory';

type Tab = 'days' | 'verses' | 'arena' | 'answered' | 'streithalle';
const TAB_PARAM: Record<string, Tab> = { arena: 'arena', erhoerungen: 'answered', streithalle: 'streithalle' };
const PAGE = 40;

function prayed(d: Day): string {
  const parts: string[] = [];
  if (d.morning.done) parts.push('Stille Zeit');
  if (d.evening.vespersDone) parts.push('Vesper');
  if (d.evening.complineDone) parts.push('Nachtgebet');
  return parts.join(' · ');
}

const SECTIONS: readonly DaySection[] = ['Stille Zeit', 'Die drei Dinge', 'Abend', 'Gewohnheiten'];

/** Everything written on a day, listed under the part of the day it belongs to. */
function DaySummary({ d, habits }: { d: Day; habits: readonly Habit[] }) {
  const entries = dayEntries(d, habits, 'word');
  const done = prayedOrders(d);
  return (
    <div className="archive-summary">
      {done.length > 0 && <p className="small">Gebetet: {done.join(', ')}</p>}
      {SECTIONS.map((sec) => {
        const rows = entries.filter((x) => x.section === sec);
        if (!rows.length) return null;
        return (
          <section key={sec}>
            <h5>{sec}</h5>
            <dl>
              {rows.map((x, i) => (
                <div key={`${x.label}-${i}`}>
                  <dt>{x.label}</dt>
                  <dd>{x.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
      {entries.length === 0 && <p className="small muted">An diesem Tag ist nichts eingetragen.</p>}
    </div>
  );
}

function DayItem({ d, habits }: { d: Day; habits: readonly Habit[] }) {
  const [open, setOpen] = useState(false);
  const summaryId = useId();
  const reading = readingLabel(d);
  const status = prayed(d);
  return (
    <li className={`archive-item${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="archive-toggle"
        aria-expanded={open}
        aria-controls={summaryId}
        onClick={() => setOpen(!open)}
      >
        <span className="archive-date">
          {formatLong(d.date)}
          {status && <span className="archive-status"> · {status}</span>}
        </span>
        {reading && <span className="archive-reading">{reading}</span>}
        {d.morning.verse && (
          <span className="archive-verse">
            {d.morning.verse}
            {d.morning.verseRef && <span className="muted"> ({d.morning.verseRef})</span>}
          </span>
        )}
        {d.morning.mainPoint && <span className="small muted archive-main">{d.morning.mainPoint}</span>}
        <span className="archive-more">{open ? 'Eingaben ausblenden' : 'Alle Eingaben anzeigen'}</span>
      </button>
      <div id={summaryId} hidden={!open}>
        {open && <DaySummary d={d} habits={habits} />}
      </div>
      <div className="archive-links">
        <Link to={`/andacht/morgen?d=${d.date}`}>Morgen öffnen</Link>
        <Link to={`/andacht/abend?d=${d.date}`}>Abend öffnen</Link>
        <Link to={`/?d=${d.date}`}>Tagesübersicht</Link>
      </div>
    </li>
  );
}

function ArenaItem({ e }: { e: ArenaEntry }) {
  const verses = e.verses.filter((v) => v.trim());
  return (
    <li className="archive-item">
      <div className="archive-date">
        {formatLong(toKey(new Date(e.createdAt)))}
        {e.kind === 'forge' && <> · Eisenschmiede</>}
      </div>
      <Link className="archive-title" to={`/arena/${e.id}`}>
        {e.kind === 'forge' ? forgeTitle(e) : entryTitle(e)}
      </Link>
      {verses.length > 0 && <p className="small muted">{verses.join(' · ')}</p>}
    </li>
  );
}

function AnsweredItem({ a }: { a: AnsweredPrayer }) {
  return (
    <li className="archive-item">
      <div className="archive-date">
        {formatLong(a.date)} · {a.person ? `${a.person} (${ROLE_LABEL[a.role]})` : ROLE_LABEL[a.role]}
      </div>
      <p className="archive-answered">{a.concern}</p>
    </li>
  );
}

/** Answered concerns whose person or concern contain every word of the query. */
function searchAnswered(list: readonly AnsweredPrayer[], query: string): AnsweredPrayer[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter((a) => {
    const hay = `${a.person} ${ROLE_LABEL[a.role]} ${a.concern} ${formatLong(a.date)}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/** A list under headings for year and month, newest first. */
function MonthList<T>({
  items,
  dateOf,
  keyOf,
  render,
}: {
  items: readonly T[];
  dateOf: (t: T) => DateKey;
  keyOf: (t: T) => string;
  render: (t: T) => ReactNode;
}) {
  return (
    <>
      {byYearAndMonth(items, dateOf).map((y) => (
        <section key={y.year} className="archive-year" aria-labelledby={`rb-${y.year}`}>
          <h3 id={`rb-${y.year}`}>{y.year}</h3>
          {y.months.map((m) => (
            <section key={m.key} aria-labelledby={`rb-${m.key}`}>
              <h4 id={`rb-${m.key}`} className="archive-month">
                {m.month}
              </h4>
              <ul className="archive-list">
                {m.items.map((t) => (
                  <Fragment key={keyOf(t)}>{render(t)}</Fragment>
                ))}
              </ul>
            </section>
          ))}
        </section>
      ))}
    </>
  );
}

/** Past days and collected verses; under "Mehr" as "Rückblick" (embedded: without its own heading). */
export function ArchivePage({ embedded = false }: { embedded?: boolean }) {
  const all = useAllDays();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>(TAB_PARAM[params.get('ansicht') ?? ''] ?? 'days');
  const profile = useProfile();
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const searchId = useId();

  const days = useMemo(() => all.filter((d) => !isEmptyDay(d)), [all]);
  const found = useMemo(() => searchDays(days, query).sort((a, b) => (a.date < b.date ? 1 : -1)), [days, query]);
  const verses = useMemo(() => collectedVerses(found), [found]);
  const archived = useMemo(
    () =>
      searchArena(
        profile.arena.filter((e) => e.archivedAt !== undefined),
        query,
      ).sort((a, b) => b.createdAt - a.createdAt),
    [profile.arena, query],
  );
  const answered = useMemo(
    () => searchAnswered(answeredNewestFirst(profile.answered), query),
    [profile.answered, query],
  );
  // Every round of the Winter Arc, newest first; searched in its weekly reviews.
  const rounds = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...profile.winterArc.runs]
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter(
        (r) =>
          !q ||
          profile.winterArc.weeks.some(
            (w) =>
              w.runId === r.id &&
              [w.review.win, w.review.slipped, w.review.lesson].some((t) => t.toLowerCase().includes(q)),
          ),
      );
  }, [profile.winterArc, query]);
  const count =
    tab === 'days'
      ? found.length
      : tab === 'verses'
        ? verses.length
        : tab === 'arena'
          ? archived.length
          : tab === 'streithalle'
            ? rounds.length
            : answered.length;

  return (
    <>
      {!embedded && <h2>Rückblick</h2>}
      <Segmented
        grid
        label="Ansicht"
        value={tab}
        onChange={(t) => {
          setTab(t);
          setLimit(PAGE);
        }}
        options={[
          { value: 'days', label: 'Tage' },
          { value: 'verses', label: 'Versesammlung' },
          { value: 'arena', label: 'Arena' },
          { value: 'answered', label: 'Gebetserhörungen' },
          ...(profile.winterArc.runs.length ? [{ value: 'streithalle' as const, label: 'Streithalle' }] : []),
        ]}
      />
      <div className="field search-field">
        <label htmlFor={searchId} className="visually-hidden">
          Rückblick durchsuchen
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          placeholder="Durchsuchen: Vers, Name, Buch, Wochentag …"
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(PAGE);
          }}
        />
      </div>
      <p className="small muted" aria-live="polite">
        {query.trim()
          ? `${count} Treffer`
          : tab === 'days'
            ? `${count} ${count === 1 ? 'Tag' : 'Tage'} mit Einträgen`
            : tab === 'verses'
              ? `${count} ${count === 1 ? 'Vers' : 'Verse'}`
              : tab === 'arena'
                ? `${count} ${count === 1 ? 'archivierter Eintrag' : 'archivierte Einträge'}`
                : tab === 'streithalle'
                  ? `${count} ${count === 1 ? 'Runde der Streithalle' : 'Runden der Streithalle'}`
                : `${count} ${count === 1 ? 'Gebetserhörung' : 'Gebetserhörungen'}`}
      </p>

      {tab === 'days' &&
        (found.length ? (
          <MonthList
            items={found.slice(0, limit)}
            dateOf={(d) => d.date}
            keyOf={(d) => d.date}
            render={(d) => <DayItem d={d} habits={profile.habits} />}
          />
        ) : (
          <p className="empty">
            {query.trim() ? 'Nichts gefunden.' : 'Noch keine Einträge. Der erste entsteht mit der ersten Stille Zeit.'}
          </p>
        ))}

      {tab === 'verses' &&
        (verses.length ? (
          <MonthList
            items={verses.slice(0, limit)}
            dateOf={(v) => v.date}
            keyOf={(v) => v.date}
            render={(v) => (
              <li className="archive-item">
                <blockquote className="archive-verse">{v.verse}</blockquote>
                <div className="archive-date">
                  {v.ref && <>{v.ref} · </>}
                  <Link to={`/andacht/morgen?d=${v.date}`}>{formatLong(v.date)}</Link>
                </div>
              </li>
            )}
          />
        ) : (
          <p className="empty">
            {query.trim() ? 'Nichts gefunden.' : 'Noch keine Verse. Sie kommen aus dem Feld „Vers, den ich mitnehme“.'}
          </p>
        ))}

      {tab === 'arena' &&
        (archived.length ? (
          <MonthList
            items={archived.slice(0, limit)}
            dateOf={(e) => toKey(new Date(e.createdAt))}
            keyOf={(e) => e.id}
            render={(e) => <ArenaItem e={e} />}
          />
        ) : (
          <p className="empty">
            {query.trim()
              ? 'Nichts gefunden.'
              : 'Noch nichts archiviert. Einträge der Arena legst du im Eintrag hierher.'}
          </p>
        ))}

      {tab === 'streithalle' &&
        (rounds.length ? (
          <ul className="archive-list wa-rounds">
            {rounds.map((r) => (
              <li key={r.id} className="archive-item">
                <Section
                  id={`archive.wa.${r.id}`}
                  title={roundTitle(r)}
                  level={4}
                  defaultOpen={false}
                  className="book-card"
                  aside={r.status === 'active' ? 'läuft' : 'beendet'}
                >
                  <RoundReviews run={r} />
                </Section>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">Nichts gefunden.</p>
        ))}

      {tab === 'answered' &&
        (answered.length ? (
          <MonthList
            items={answered.slice(0, limit)}
            dateOf={(a) => a.date}
            keyOf={(a) => a.id}
            render={(a) => <AnsweredItem a={a} />}
          />
        ) : (
          <p className="empty">
            {query.trim()
              ? 'Nichts gefunden.'
              : 'Noch keine. Ein Anliegen aus „Mein Haus“, das Gott erhört hat, hältst du dort mit „Erhört“ fest.'}
          </p>
        ))}

      {count > limit && (
        <button type="button" className="btn" onClick={() => setLimit((l) => l + PAGE)}>
          Weitere {Math.min(PAGE, count - limit)} anzeigen
        </button>
      )}
      {profile.showHabitHistory && (
        <div className="review-habits">
          <HabitHistory />
        </div>
      )}
    </>
  );
}
