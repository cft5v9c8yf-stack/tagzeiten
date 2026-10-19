import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { downloadText } from '../../app/files';
import { DESERT_GUIDE, type Run } from '../../content/desert';
import { WINTER_ARC_COMFORT, WINTER_ARC_FOCUS, WINTER_ARC_PHASES, WINTER_ARC_REVIEW } from '../../content/winterArc';
import { useDayLookup, useProfile, useStore, useToday } from '../../data/hooks';
import { addDays, formatLong, fromKey, mondayOf, weekdayOf, type DateKey } from '../../domain/dates';
import {
  desertWeekOf,
  desertWeeks,
  habitsOf,
  keptIn,
  keptLine,
  leadVerse,
  meantFor,
  tickedOn,
  usesStandard,
} from '../../domain/desert';
import { arenaOffer, seasonLinkOf } from '../../domain/seasons';
import { isDoneInPeriod, isDoneOn, isPerDay } from '../../domain/habits';
import { activeRun, endDateOf, focusOf, isInRun, phaseOf, positionOf, stageOf, weekOf, type WinterArcRun } from '../../domain/winterArc';
import { RoundReviews, roundTitle } from '../arena/WinterArcRounds';
import { WaVerse, WinterArcGuide } from '../arena/WinterArcGuide';
import { RoundJournal } from './DesertJournal';
import { DesertSettings, DesertStartPanel, formatFullDate } from './DesertSettings';
import { ArenaSeason, SeasonLink, seasonPreset } from './SeasonInvite';
import { Chevron } from '../../ui/Chevron';

const runs = (parts: readonly Run[]) =>
  parts.map((p, i) =>
    typeof p === 'string' ? p : 'em' in p ? <em key={i}>{p.em}</em> : <strong key={i}>{p.strong}</strong>,
  );

/**
 * The guide: the text of the Wüstenzeit (without its verse where the verse
 * stands above, at the way in). The 90-Tage-Standard is a package (0.40):
 * its guide stands with it in the choice, and here while a Wüstenzeit holds it.
 */
export function DesertGuide({ head = true, focus, link }: { head?: boolean; focus?: number; link?: string }) {
  return (
    <div className="desert-guide">
      {DESERT_GUIDE.paragraphs.map((p, i) => (
        <p key={i}>{runs(p)}</p>
      ))}
      {head && <WaVerse verse={DESERT_GUIDE.verse} />}
      {link && (
        <p>
          <SeasonLink href={link} />
        </p>
      )}
      {focus !== undefined && (
        <details className="wa-settings desert-standard">
          <summary>Der 90-Tage-Standard</summary>
          <WinterArcGuide currentFocus={focus} />
        </details>
      )}
    </div>
  );
}

/** With the 90-Tage-Standard: the week's focus, its verse first (rule 2), in its phase. */
function StandardFocus({ week, weeks }: { week: number; weeks: number }) {
  const n = focusOf(week, weeks);
  const f = WINTER_ARC_FOCUS[n - 1]!;
  const phase = WINTER_ARC_PHASES.phases.find((p) => p.name === phaseOf(n))!;
  return (
    <section className="panel desert-focus" aria-label="Schwerpunkt der Woche">
      <WaVerse verse={f.verse} />
      <p className="small muted">
        {phase.name} · {phase.question}
      </p>
      <p>
        <strong>{f.focus}.</strong> {f.task}
      </p>
    </section>
  );
}

/** Where the Wüstenzeit stands: the verse first (rule 2), then day and week, and a new beginning after an open day. */
function Head({ run, today }: { run: WinterArcRun; today: DateKey }) {
  const profile = useProfile();
  const lookup = useDayLookup();
  const stage = stageOf(run, today);
  const habits = habitsOf(run, profile);
  const yesterday = addDays(today, -1);
  const open = stage === 'during' && habits.length > 0 && isInRun(run, yesterday) && !tickedOn(habits, yesterday, lookup);
  const pos = positionOf(run, today);
  return (
    <div className="panel wa-head">
      <WaVerse verse={leadVerse(run)} />
      {stage === 'before' ? (
        <p className="wa-head-line">
          <strong>Die Wüstenzeit beginnt am {formatFullDate(run.startDate)}.</strong>
        </p>
      ) : (
        <p className="wa-head-line">
          <strong>
            Tag {pos.day} von {pos.days}
          </strong>
          <span className="wa-head-week">
            Woche {desertWeekOf(run, today)} von {desertWeeks(run).length}
          </span>
        </p>
      )}
      {open && <p className="wa-head-task">Heute neu anfangen.</p>}
    </div>
  );
}

/** "Sonntagabend": three lines, always ending in the word of comfort (rule 1). */
export function WeekReview({ run, week }: { run: WinterArcRun; week: number }) {
  const store = useStore();
  const profile = useProfile();
  const id = useId();
  const review = weekOf(profile.winterArc, run.id, week)?.review;
  return (
    <section className="panel wa-review" aria-labelledby={`${id}-title`}>
      <h5 id={`${id}-title`}>Wochenrückblick</h5>
      {WINTER_ARC_REVIEW.map((r) => (
        <div key={r.key} className="field">
          <label htmlFor={`${id}-${r.key}`}>{r.label}</label>
          <textarea
            id={`${id}-${r.key}`}
            rows={2}
            value={review?.[r.key] ?? ''}
            onChange={(e) => store.setWinterArcReview(run.id, week, r.key, e.target.value)}
          />
        </div>
      ))}
      <div className="arena-comfort wa-comfort">
        <p>„{WINTER_ARC_COMFORT.verse.text}“</p>
        <span className="bible-ref">{WINTER_ARC_COMFORT.verse.ref}</span>
      </div>
    </section>
  );
}

/** What was kept so far, habit by habit: documented, never rated (rule 4). */
function Kept({ run, today }: { run: WinterArcRun; today: DateKey }) {
  const profile = useProfile();
  const lookup = useDayLookup();
  const habits = habitsOf(run, profile);
  if (!habits.length) return null;
  return (
    <ul className="desert-kept">
      {habits.map((h) => (
        <li key={h.id}>
          <span>{h.name}</span>
          <span className="muted">{keptLine(h, keptIn(h, run, lookup, today))}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The course of the Wüstenzeit as an overview, to read only: one row for each habit, one box for each day
 * (grouped by calendar weeks); weekly habits have one box for each week, monthly ones one for each month,
 * with the same ticks as under "Heute". Ticked is filled, not ticked stays grey (never red, rule 5),
 * a day to come is only outlined. No count, no chain, no rate (rule 4).
 */
function Chart({ run, today }: { run: WinterArcRun; today: DateKey }) {
  const profile = useProfile();
  const lookup = useDayLookup();
  const habits = habitsOf(run, profile);
  const wrap = useRef<HTMLDivElement>(null);
  const end = endDateOf(run.startDate, run.durationDays);
  const days: DateKey[] = [];
  for (let d = run.startDate; d <= end; d = addDays(d, 1)) days.push(d);
  const weekStart = (d: DateKey) => weekdayOf(d) === 1 || d === run.startDate;
  // The chart opens where today is, not at the first day.
  useEffect(() => {
    const el = wrap.current;
    const mark = el?.querySelector<HTMLElement>('th.is-today');
    if (el && mark) el.scrollLeft = Math.max(0, mark.offsetLeft - el.clientWidth / 2);
  }, []);
  if (!habits.length) return null;

  // The boxes of a weekly or monthly habit: one for each stretch of days in its period.
  const stretches = (rhythm: 'weekly' | 'monthly') => {
    const out: { from: DateKey; span: number }[] = [];
    const key = (d: DateKey) => (rhythm === 'weekly' ? mondayOf(d) : d.slice(0, 7));
    for (const d of days) {
      const last = out[out.length - 1];
      if (last && key(last.from) === key(d)) last.span++;
      else out.push({ from: d, span: 1 });
    }
    return out;
  };
  const box = (state: 'ticked' | 'open' | 'future') => <span className={`wa-box is-${state}`} aria-hidden="true" />;
  return (
    <section className="panel wa-chart" aria-labelledby="desert-chart-title">
      <h4 id="desert-chart-title">Überblick</h4>
      <div className="wa-chart-wrap" ref={wrap} tabIndex={0} role="region" aria-label="Überblick über die Gewohnheiten, nach rechts zu scrollen">
        <table className="wa-chart-table">
          <caption className="visually-hidden">Die abgehakten Gewohnheiten der Wüstenzeit, Tag für Tag, nach Wochen geordnet</caption>
          <thead>
            <tr>
              <th scope="col" className="wa-chart-name">
                <span className="visually-hidden">Gewohnheit</span>
              </th>
              {days.map((d) => (
                <th
                  key={d}
                  scope="col"
                  className={`${weekStart(d) ? 'is-week-start' : ''}${d === today ? ' is-today' : ''}`.trim() || undefined}
                  aria-current={d === today ? 'date' : undefined}
                  title={formatLong(d)}
                >
                  {fromKey(d).getDate()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((h) => (
              <tr key={h.id}>
                <th scope="row" className="wa-chart-name">
                  {h.name}
                </th>
                {isPerDay(h)
                  ? days.map((d) => {
                      const edge = weekStart(d) ? 'is-week-start' : undefined;
                      if (!meantFor(h, d))
                        return (
                          <td key={d} className={edge} aria-label={`${formatLong(d)}: nicht vorgesehen`}>
                            <span className="wa-box is-off" aria-hidden="true" />
                          </td>
                        );
                      const state = d > today ? 'future' : isDoneOn(h, lookup(d)) ? 'ticked' : 'open';
                      return (
                        <td key={d} className={edge} aria-label={`${formatLong(d)}: ${state === 'ticked' ? 'abgehakt' : state === 'open' ? 'nicht abgehakt' : 'liegt noch vor dir'}`}>
                          {box(state)}
                        </td>
                      );
                    })
                  : stretches(h.rhythm === 'weekly' ? 'weekly' : 'monthly').map((st) => {
                      const state = st.from > today ? 'future' : isDoneInPeriod(h, st.from, lookup) ? 'ticked' : 'open';
                      const what = h.rhythm === 'weekly' ? 'Woche' : 'Monat';
                      return (
                        <td
                          key={st.from}
                          colSpan={st.span}
                          className={weekStart(st.from) ? 'is-week-start' : undefined}
                          aria-label={`${what} ab ${formatLong(st.from)}: ${state === 'ticked' ? 'abgehakt' : state === 'open' ? 'nicht abgehakt' : 'liegt noch vor dir'}`}
                        >
                          {box(state)}
                        </td>
                      );
                    })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted">Gefüllt ist abgehakt. Grau ist kein Urteil, nur eine ehrliche Auskunft.</p>
    </section>
  );
}

/** The review, week by week: the week's focus (with the 90-Tage-Standard), and the Sunday evening's three lines. */
function ReviewView({ run, today }: { run: WinterArcRun; today: DateKey }) {
  const weeks = desertWeeks(run);
  const current = Math.min(desertWeekOf(run, today), weeks.length);
  const [shown, setShown] = useState(current);
  const week = Math.min(Math.max(shown, 1), current);
  const monday = weeks[week - 1]!;
  const lastDay = Array.from({ length: 7 }, (_, i) => addDays(monday, i)).filter((d) => isInRun(run, d)).pop()!;
  return (
    <>
      {usesStandard(run) && <StandardFocus week={week} weeks={weeks.length} />}
      <section className="panel wa-week-view" aria-labelledby="desert-week-title">
        <div className="wa-pager">
          <button type="button" className="icon-btn wa-pager-btn" aria-label="Frühere Woche" disabled={week <= 1} onClick={() => setShown(week - 1)}>
            <Chevron dir="left" />
          </button>
          <h4 id="desert-week-title">
            {week === current ? 'Diese Woche' : `Woche ${week}`}
            <span className="wa-pager-sub">
              Woche {week} von {weeks.length}
            </span>
          </h4>
          <button type="button" className="icon-btn wa-pager-btn" aria-label="Spätere Woche" disabled={week >= current} onClick={() => setShown(week + 1)}>
            <Chevron dir="right" />
          </button>
        </div>
        {today < lastDay && <p className="small muted">Der Wochenrückblick steht am letzten Tag der Woche bereit.</p>}
      </section>
      {today >= lastDay && <WeekReview key={week} run={run} week={week} />}
    </>
  );
}

/** What the habits of the Wüstenzeit have not moved here: they are chosen and ticked under "Heute". */
function ToToday() {
  return (
    <p className="small muted wa-to-today">
      Die Gewohnheiten pflegst und hakst du unter <Link to="/">Heute</Link> ab.
    </p>
  );
}

/** The dashboard: where the Wüstenzeit stands, the overview of the habits, then the journal, the review and the guide. */
function Dashboard({ run, journal }: { run: WinterArcRun; journal: ReactNode }) {
  const store = useStore();
  const today = store.today();
  const none = !(run.habits ?? []).length;
  return (
    <div className="wa-dashboard">
      <Head run={run} today={today} />
      <Chart run={run} today={today} />
      {none && <p className="wa-to-today">Du hast noch keine Gewohnheiten gewählt.</p>}
      <ToToday />
      {journal}
      <details className="wa-settings">
        <summary>Rückblick</summary>
        <section className="panel wa-weekly" aria-labelledby="desert-kept-title">
          <h5 id="desert-kept-title">Bisher</h5>
          <Kept run={run} today={today} />
        </section>
        <ReviewView run={run} today={today} />
      </details>
      <details className="wa-settings">
        <summary>Anleitung</summary>
        <DesertGuide
          focus={usesStandard(run) ? focusOf(Math.min(desertWeekOf(run, today), desertWeeks(run).length), desertWeeks(run).length) : undefined}
          link={seasonLinkOf(run)}
        />
      </details>
    </div>
  );
}

/** After the last day: the days, what was kept, taking habits into everyday life, the reviews, a new Wüstenzeit. */
function Closing({ run, journal }: { run: WinterArcRun; journal: ReactNode }) {
  const store = useStore();
  const profile = useProfile();
  const lookup = useDayLookup();
  const today = store.today();
  const [starting, setStarting] = useState(false);
  const [taken, setTaken] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const habits = habitsOf(run, profile);
  const open = habits.filter((h) => !h.active);
  const exportMarkdown = async () => {
    downloadText(`henoch-${store.today()}.md`, await store.exportMarkdown(), 'text/markdown');
  };
  return (
    <div className="wa-closing">
      <h4>Die Wüstenzeit ist zu Ende</h4>
      <p className="small muted">{roundTitle(run)}</p>
      <p>{run.durationDays === 1 ? 'Ein Tag' : `${run.durationDays} Tage`} in der Wüste.</p>
      {habits.length > 0 && (
        <ul className="desert-kept">
          {habits.map((h) => (
            <li key={h.id}>
              <span>{h.name}</span>
              <span className="muted">{keptLine(h, keptIn(h, run, lookup, today))}</span>
            </li>
          ))}
        </ul>
      )}
      {open.length > 0 && !done && (
        <section className="desert-adopt" aria-labelledby="desert-adopt-title">
          <h5 id="desert-adopt-title">In den Alltag übernehmen</h5>
          <p className="small muted">Was du ankreuzt, steht danach bei deinen Gewohnheiten unter „Heute“.</p>
          <ul className="desert-list">
            {open.map((h) => (
              <li key={h.id} className="desert-item">
                <label className="desert-check">
                  <input
                    type="checkbox"
                    checked={taken.includes(h.id)}
                    onChange={(e) => setTaken(e.target.checked ? [...taken, h.id] : taken.filter((x) => x !== h.id))}
                  />
                  <span>{h.name}</span>
                </label>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn primary"
            disabled={!taken.length}
            onClick={() => {
              store.adoptHabits(taken);
              setDone(true);
            }}
          >
            Gewohnheiten übernehmen
          </button>
        </section>
      )}
      {done && <p role="status">Übernommen. Du findest sie unter „Heute“ und unter „Mehr → Gewohnheiten“.</p>}
      <h5>Das Tagebuch</h5>
      <RoundJournal run={run} />
      <h5>Die Wochenrückblicke</h5>
      <RoundReviews run={run} />
      <div className="button-row">
        <button type="button" className="btn primary" onClick={() => setStarting(true)}>
          Neue Wüstenzeit beginnen
        </button>
        <button type="button" className="btn" onClick={() => void exportMarkdown()}>
          Als Markdown exportieren
        </button>
      </div>
      {starting && <DesertStartPanel onDone={() => setStarting(false)} />}
      {journal}
    </div>
  );
}

/** No Wüstenzeit under way: the Word, the way in, then the guide (0.40: the way in no longer below it). */
function Start({ journal }: { journal: ReactNode }) {
  const store = useStore();
  const profile = useProfile();
  // In Advent the invitation stands above; "Wüstenzeit vorbereiten" on "Heute" opens its start at once.
  const offer = arenaOffer(profile, store.today());
  const [params] = useSearchParams();
  const [starting, setStarting] = useState<'season' | 'free' | false>(offer && params.get('vorbereiten') ? 'season' : false);
  const earlier = profile.winterArc.runs.length > 0;
  return (
    <>
      <div className="desert-guide">
        <WaVerse verse={DESERT_GUIDE.verse} />
      </div>
      {offer && !starting && <ArenaSeason offer={offer} onPrepare={() => setStarting('season')} onOther={() => setStarting('free')} />}
      {(!offer || starting || earlier) && (
        <div className="panel wa-head wa-invite">
          {!starting && !offer && (
            <button type="button" className="btn primary" onClick={() => setStarting('free')}>
              Wüstenzeit beginnen
            </button>
          )}
          {starting && (
            <DesertStartPanel
              key={starting}
              preset={starting === 'season' && offer ? seasonPreset(offer) : undefined}
              onDone={() => setStarting(false)}
            />
          )}
          {earlier && (
            <p className="small">
              <Link to="/mehr/rueckblick?ansicht=wuestenwanderung">Frühere Wüstenzeiten im Rückblick</Link>
            </p>
          )}
        </div>
      )}
      <DesertGuide head={false} />
      {journal}
    </>
  );
}

/**
 * The Wüstenwanderung, the Wüstenzeit's place in the Arena: the guide and the way in; while one runs, the
 * dashboard; after its last day, the close. Everything else to set below.
 */
export function Desert({ journal = null }: { journal?: ReactNode }) {
  useToday();
  const store = useStore();
  const profile = useProfile();
  const run = activeRun(profile.winterArc);
  if (!run) {
    return (
      <div className="desert">
        <Start journal={journal} />
      </div>
    );
  }
  const stage = stageOf(run, store.today());
  return (
    <div className="desert">
      {stage === 'after' ? <Closing run={run} journal={journal} /> : <Dashboard run={run} journal={journal} />}
      <details className="wa-settings">
        <summary>Einstellungen der Wüstenzeit</summary>
        <DesertSettings withChoice={false} />
      </details>
    </div>
  );
}
