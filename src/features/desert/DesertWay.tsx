import { useId, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { WAY_DAYS, WAY_DAYS_TEXT, WAY_INTRO, WAY_NAME, WAY_WEEKS } from '../../content/husbandWay';
import type { Run } from '../../content/desert';
import { WELL_COMFORT } from '../../content/well';
import { useProfile, useStore } from '../../data/hooks';
import { isDateKey, type DateKey } from '../../domain/dates';
import { canTickStep, stepDone, wayDayOn, wayDayText, wayEntries, wayEntryOf, wayWeekText } from '../../domain/husbandWay';
import { inkToSvg } from '../../domain/ink';
import { endDateOf, type WinterArcRun } from '../../domain/winterArc';
import { formatFullDate } from './DesertSettings';
import { BibleRef } from '../../ui/BibleRef';
import { Tick } from '../../ui/Tick';

/** The parameter that opens a day of the plan in the Wüstenwanderung, to make up for it. */
export const WAY_DAY_PARAM = 'wegtag';

const runs = (parts: readonly Run[]) =>
  parts.map((p, i) => (typeof p === 'string' ? p : 'em' in p ? <em key={i}>{p.em}</em> : <strong key={i}>{p.strong}</strong>));

/** The introduction, word for word, with the table of the weeks. */
export function WayIntroText() {
  return (
    <div className="desert-guide desert-way-intro">
      {WAY_INTRO.map((b, i) =>
        'p' in b ? (
          <p key={i}>{runs(b.p)}</p>
        ) : 'list' in b ? (
          <ul key={i}>
            {b.list.map((item, j) => (
              <li key={j}>{runs(item)}</li>
            ))}
          </ul>
        ) : (
          <table key={i} className="desert-way-table">
            <thead>
              <tr>
                {b.table.head.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.table.rows.map((r) => (
                <tr key={r[0]}>
                  {r.map((c, j) => (
                    <td key={j}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ),
      )}
    </div>
  );
}

/**
 * The way in of its own, beside "Wüstenzeit beginnen": the introduction first,
 * then only the first day. The length and the Word of each day come with the
 * plan; the habits of its package come along (core and weekly ones).
 */
export function WayStartPanel({ onDone }: { onDone: () => void }) {
  const store = useStore();
  const id = useId();
  const [start, setStart] = useState<DateKey>(store.today());
  const valid = isDateKey(start);
  return (
    <div className="panel confirm-panel winter-arc-start desert-way-start" role="dialog" aria-labelledby={`${id}-title`}>
      <p id={`${id}-title`}>
        <strong>{WAY_NAME}</strong>
      </p>
      <WayIntroText />
      <div className="field">
        <label htmlFor={`${id}-start`}>Startdatum</label>
        <input id={`${id}-start`} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
      </div>
      {valid ? (
        <p>
          Bis <strong>{formatFullDate(endDateOf(start, WAY_DAYS))}</strong>
        </p>
      ) : (
        <p className="small muted" role="status">
          Wähle ein Startdatum.
        </p>
      )}
      <p className="small muted">
        Die fünf Kern-Gewohnheiten und die drei wöchentlichen sind schon gewählt. Danach kannst du bis zu zwei weitere dazunehmen.
      </p>
      <div className="button-row">
        <button
          type="button"
          className="btn primary"
          disabled={!valid}
          onClick={() => {
            store.startDesert(start, WAY_DAYS, [], '', 'none', 'husband');
            onDone();
          }}
        >
          Weg beginnen
        </button>
        <button type="button" className="btn quiet" onClick={onDone}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}

/** For a plan begun before its own way in (it showed the introduction on the first day): the introduction once. */
function WayIntroPanel({ run }: { run: WinterArcRun }) {
  const store = useStore();
  const id = useId();
  return (
    <section className="panel desert-way" aria-labelledby={`${id}-title`}>
      <h4 id={`${id}-title`}>{WAY_NAME}</h4>
      <WayIntroText />
      <button type="button" className="btn primary" onClick={() => store.markWayIntroSeen(run.id)}>
        Zum ersten Tag
      </button>
    </section>
  );
}

/**
 * One day of the plan, in the order given: title, theme, Scripture, thought,
 * step (to tick), question (to the journal), prayer. The references are named
 * only (rule 13).
 */
function WayDayPanel({ run, n, current }: { run: WinterArcRun; n: number; current: number }) {
  const store = useStore();
  const profile = useProfile();
  const navigate = useNavigate();
  const [, setParams] = useSearchParams();
  const id = useId();
  const day = wayDayText(n)!;
  const week = wayWeekText(day.woche)!;
  const entry = wayEntryOf(profile.arena, run.id, n);
  const done = stepDone(run, n);
  return (
    <section className="panel desert-way desert-way-day" id="desert-way-day" aria-labelledby={`${id}-title`}>
      <p className="small muted desert-way-place">
        Tag {n} von {WAY_DAYS} · Woche {week.nummer}: {week.wegstueck}
      </p>
      <h4 id={`${id}-title`}>{day.titel}</h4>
      <p className="desert-way-theme">{day.thema}</p>
      <h5>Schriftwort</h5>
      <p className="desert-reading-ref">
        {day.schriftwort.map((r, i) => (
          <span key={r}>
            {i > 0 && ' · '}
            <BibleRef reference={r} />
          </span>
        ))}
      </p>
      <h5>Gedanke</h5>
      <p>{day.gedanke}</p>
      <h5>Schritt</h5>
      <Tick checked={done} onToggle={() => store.toggleWayStep(run.id, n)}>
        {day.schritt}
      </Tick>
      <h5>Frage</h5>
      <p>{day.frage}</p>
      <button type="button" className="btn small-btn" onClick={() => navigate(`/arena/${store.openWayEntry(run.id, n)}`)}>
        {entry ? 'Eintrag im Tagebuch öffnen' : 'Ins Tagebuch schreiben'}
      </button>
      <p className="small muted">Hier darfst du auch Schuld und Schwäche aufschreiben. Der Eintrag bleibt auf diesem Gerät.</p>
      <h5>Gebet</h5>
      <p className="desert-way-prayer">{day.gebet}</p>
      {n !== current && (
        <button
          type="button"
          className="btn quiet small-btn"
          onClick={() =>
            setParams((p) => {
              p.delete(WAY_DAY_PARAM);
              return p;
            })
          }
        >
          Zurück zu Tag {current}
        </button>
      )}
    </section>
  );
}

/**
 * The plan of the day in the dashboard, beneath the reading: at the beginning
 * the introduction once, then the day of today, or an earlier one opened from
 * the overview to make up for it.
 */
export function WayToday({ run, today }: { run: WinterArcRun; today: DateKey }) {
  const [params] = useSearchParams();
  const current = wayDayOn(run, today);
  if (current === undefined) return null;
  if (!run.wayIntroSeen) return <WayIntroPanel run={run} />;
  const asked = Number(params.get(WAY_DAY_PARAM));
  const n = Number.isInteger(asked) && asked >= 1 && asked <= current ? asked : current;
  return <WayDayPanel key={n} run={run} n={n} current={current} />;
}

/**
 * The overview of the plan: the introduction to read again, the four weeks
 * with their titles and opening lines, and the 28 days. A day whose step is
 * ticked is marked; an open one stays plain (rule 5). Every day up to today
 * can be opened and made up for; nothing is owed (rule 6).
 */
export function WayOverview({ run, today }: { run: WinterArcRun; today: DateKey }) {
  const [, setParams] = useSearchParams();
  const current = wayDayOn(run, today) ?? 0;
  const open = (n: number) => {
    setParams((p) => {
      p.set(WAY_DAY_PARAM, String(n));
      return p;
    });
    requestAnimationFrame(() => document.getElementById('desert-way-day')?.scrollIntoView?.({ block: 'start' }));
  };
  return (
    <div className="desert-way-overview">
      <details className="wa-settings">
        <summary>Einführung</summary>
        <WayIntroText />
      </details>
      {WAY_WEEKS.map((w) => (
        <section key={w.nummer} className="desert-way-week" aria-label={`Woche ${w.nummer}`}>
          <h5>
            Woche {w.nummer} · {w.wegstueck}: {w.titel}
          </h5>
          <p className="small">{w.einleitung}</p>
          <ol className="desert-way-days">
            {WAY_DAYS_TEXT.filter((d) => d.woche === w.nummer).map((d) => {
              const done = stepDone(run, d.tag);
              const reachable = canTickStep(run, d.tag, today) && run.wayIntroSeen;
              const label = (
                <>
                  <span className="desert-way-num">{d.tag}</span>
                  <span className="desert-way-name">{d.titel}</span>
                  {done && <span className="desert-way-done">gegangen</span>}
                </>
              );
              return (
                <li key={d.tag} className={done ? 'is-done' : undefined}>
                  {reachable ? (
                    <button type="button" aria-current={d.tag === current ? 'step' : undefined} onClick={() => open(d.tag)}>
                      {label}
                    </button>
                  ) : (
                    <span className="desert-way-later">{label}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

/** After the last day: the days walked, and the own entries to read again, day by day. */
export function WayClosing({ run }: { run: WinterArcRun }) {
  const profile = useProfile();
  const entries = wayEntries(profile.arena, run.id);
  const walked = run.wayDone?.length ?? 0;
  return (
    <section className="desert-way-closing" aria-labelledby="desert-way-closing-title">
      <h5 id="desert-way-closing-title">Dein Weg</h5>
      <p>
        Die 28 Tage sind vorbei.{' '}
        {walked === 1 ? 'An einem Tag hast du den Schritt abgehakt.' : walked > 1 ? `An ${walked} Tagen hast du den Schritt abgehakt.` : ''}
      </p>
      <p>Hier steht, was du zu den Fragen aufgeschrieben hast. Lies es in Ruhe noch einmal.</p>
      {entries.length ? (
        <div className="desert-journal-read">
          {entries.map((e) => {
            const day = wayDayText(e.wayDay!);
            return (
              <section key={e.id} className="desert-journal-day">
                <h6>
                  <Link to={`/arena/${e.id}`}>
                    Tag {e.wayDay}
                    {day && ` · ${day.titel}`}
                  </Link>
                </h6>
                {day && <p className="small muted">{day.frage}</p>}
                {e.text.trim() && <p className="desert-journal-text">{e.text.trim()}</p>}
                {e.ink?.length ? (
                  <img
                    className="desert-journal-ink"
                    alt="Handschrift"
                    src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(inkToSvg(e.ink))}`}
                  />
                ) : null}
              </section>
            );
          })}
        </div>
      ) : (
        <p className="small muted">Zu den Fragen hast du nichts aufgeschrieben.</p>
      )}
      <div className="arena-comfort wa-comfort">
        <p>„{WELL_COMFORT.parts.join(' ')}“</p>
        <span className="bible-ref">{WELL_COMFORT.ref}</span>
      </div>
    </section>
  );
}
