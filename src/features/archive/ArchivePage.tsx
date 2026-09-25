import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useAllDays } from '../../data/hooks';
import { formatLong, formatShort } from '../../domain/dates';
import { readingLabel } from '../../domain/exportMarkdown';
import type { Day } from '../../domain/model';
import { isEmptyDay } from '../../domain/normalizeDay';
import { searchDays } from '../../domain/search';
import { collectedVerses } from '../../domain/stats';
import { Segmented } from '../../ui/Choice';

type Tab = 'days' | 'verses';
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
        {formatLong(d.date)} {d.date.slice(0, 4)}
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

export function ArchivePage() {
  const all = useAllDays();
  const [tab, setTab] = useState<Tab>('days');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const searchId = useId();

  const days = useMemo(() => all.filter((d) => !isEmptyDay(d)), [all]);
  const found = useMemo(() => searchDays(days, query), [days, query]);
  const verses = useMemo(() => collectedVerses(found), [found]);
  const count = tab === 'days' ? found.length : verses.length;

  return (
    <>
      <h2>Archiv</h2>
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
        ]}
      />
      <div className="field search-field">
        <label htmlFor={searchId} className="visually-hidden">
          Archiv durchsuchen
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
            : `${count} ${count === 1 ? 'Vers' : 'Verse'}`}
      </p>

      {tab === 'days' &&
        (found.length ? (
          <ul className="archive-list">
            {found.slice(0, limit).map((d) => (
              <DayItem key={d.date} d={d} />
            ))}
          </ul>
        ) : (
          <p className="empty">
            {query.trim() ? 'Nichts gefunden.' : 'Noch keine Einträge. Der erste entsteht mit der ersten Stille Zeit.'}
          </p>
        ))}

      {tab === 'verses' &&
        (verses.length ? (
          <ul className="archive-list">
            {verses.slice(0, limit).map((v) => (
              <li key={v.date} className="archive-item">
                <blockquote className="archive-verse">{v.verse}</blockquote>
                <div className="archive-date">
                  {v.ref && <>{v.ref} · </>}
                  <Link to={`/andacht/morgen?d=${v.date}`}>{formatShort(v.date)}</Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">
            {query.trim() ? 'Nichts gefunden.' : 'Noch keine Verse. Sie kommen aus dem Feld „Vers, den ich mitnehme“.'}
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
