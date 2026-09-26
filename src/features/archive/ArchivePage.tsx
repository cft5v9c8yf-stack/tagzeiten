import { Fragment, useId, useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useAllDays, useProfile } from '../../data/hooks';
import { entryTitle, meetingLabel, searchArena } from '../../domain/arena';
import { byYearAndMonth } from '../../domain/byMonth';
import { formatLong, toKey, type DateKey } from '../../domain/dates';
import { readingLabel } from '../../domain/exportMarkdown';
import type { ArenaEntry, Day } from '../../domain/model';
import { isEmptyDay } from '../../domain/normalizeDay';
import { searchDays } from '../../domain/search';
import { collectedVerses } from '../../domain/stats';
import { Segmented } from '../../ui/Choice';

type Tab = 'days' | 'verses' | 'arena';
const PAGE = 40;

function prayed(d: Day): string {
  const parts: string[] = [];
  if (d.morning.done) parts.push('Stille Zeit');
  if (d.evening.vespersDone) parts.push('Vesper');
  if (d.evening.complineDone) parts.push('Nachtgebet');
  return parts.join(' · ');
}

function DayItem({ d }: { d: Day }) {
  const reading = readingLabel(d);
  const status = prayed(d);
  return (
    <li className="archive-item">
      <div className="archive-date">
        {formatLong(d.date)}
        {status && <span className="archive-status"> · {status}</span>}
      </div>
      {reading && <div className="archive-reading">{reading}</div>}
      {d.morning.verse && (
        <blockquote className="archive-verse">
          {d.morning.verse}
          {d.morning.verseRef && <span className="muted"> ({d.morning.verseRef})</span>}
        </blockquote>
      )}
      {d.morning.mainPoint && <p className="small muted">{d.morning.mainPoint}</p>}
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
        {e.meetingDate && <> · {meetingLabel(e.meetingDate)}</>}
      </div>
      <Link className="archive-title" to={`/arena/${e.id}`}>
        {entryTitle(e)}
      </Link>
      {verses.length > 0 && <p className="small muted">{verses.join(' · ')}</p>}
    </li>
  );
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
  const [tab, setTab] = useState<Tab>(params.get('ansicht') === 'arena' ? 'arena' : 'days');
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
  const count = tab === 'days' ? found.length : tab === 'verses' ? verses.length : archived.length;

  return (
    <>
      {!embedded && <h2>Rückblick</h2>}
      <Segmented
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
              : `${count} ${count === 1 ? 'archivierter Eintrag' : 'archivierte Einträge'}`}
      </p>

      {tab === 'days' &&
        (found.length ? (
          <MonthList
            items={found.slice(0, limit)}
            dateOf={(d) => d.date}
            keyOf={(d) => d.date}
            render={(d) => <DayItem d={d} />}
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

      {count > limit && (
        <button type="button" className="btn" onClick={() => setLimit((l) => l + PAGE)}>
          Weitere {Math.min(PAGE, count - limit)} anzeigen
        </button>
      )}
    </>
  );
}
