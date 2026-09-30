import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { arenaDocs, contentDocs, dayDocs } from '../../content/searchIndex';
import { todayKey } from '../../domain/dates';
import { prepare, search, type SearchHit } from '../../domain/fulltext';
import { useAllDays, useProfile } from '../../data/hooks';

const QUERY_PARAM = 'q';
const LIMIT = 60;

/** The texts of the app are the same all session; built once, on first search. */
let contentIndex: ReturnType<typeof prepare> | null = null;
const content = () => (contentIndex ??= prepare(contentDocs(todayKey())));

function Marked({ parts }: { parts: SearchHit['snippet'] }) {
  return (
    <>
      {parts.map((p, i) => (p.mark ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
    </>
  );
}

/**
 * Search through everything: catechism, confessions, Sundays and lessons,
 * prayers, and the user's own entries – on the device only (rule 10). The
 * old spelling of the texts and a slip of the finger are forgiven.
 */
export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get(QUERY_PARAM) ?? '');
  const deferred = useDeferredValue(query);
  const days = useAllDays();
  const profile = useProfile();
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => input.current?.focus(), []);

  const own = useMemo(() => prepare([...dayDocs(days), ...arenaDocs(profile.arena)]), [days, profile.arena]);
  const hits = useMemo(
    () => (deferred.trim() ? search([...content(), ...own], deferred, LIMIT) : []),
    [deferred, own],
  );

  return (
    <div className="search-page">
      <h2>Suchen</h2>
      <form
        role="search"
        className="field search-field"
        onSubmit={(e) => {
          e.preventDefault();
          input.current?.blur();
        }}
      >
        <label htmlFor={inputId} className="visually-hidden">
          Suchbegriff
        </label>
        <input
          ref={input}
          id={inputId}
          type="search"
          value={query}
          placeholder="Wort, Name, Bibelstelle …"
          enterKeyHint="search"
          onChange={(e) => {
            setQuery(e.target.value);
            setParams(e.target.value ? { [QUERY_PARAM]: e.target.value } : {}, { replace: true });
          }}
        />
      </form>
      {!deferred.trim() && (
        <p className="small muted">
          Durchsucht Katechismus, Bekenntnisse, Sonntage, Betrachtungen, Gebete und deine eigenen Einträge. Alte
          Schreibweisen werden mitgefunden: „Teil“ findet „Theil“, „Sakrament“ findet „Sacrament“. Die Suche bleibt auf
          deinem Gerät.
        </p>
      )}
      {deferred.trim() && (
        <p className="small muted" aria-live="polite">
          {hits.length === 0 ? 'Nichts gefunden.' : hits.length >= LIMIT ? `Die ersten ${LIMIT} Treffer` : hits.length === 1 ? '1 Treffer' : `${hits.length} Treffer`}
        </p>
      )}
      <ol className="search-hits">
        {hits.map((h) => (
          <li key={`${h.doc.to}|${h.doc.title}|${h.doc.area}`}>
            <Link to={h.doc.to} className="search-hit">
              <span className="search-area">{h.doc.area}</span>
              <span className="search-title">
                <Marked parts={h.titleMarked} />
              </span>
              <span className="search-snippet">
                <Marked parts={h.snippet} />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
