import { useId, useState } from 'react';
import { Link } from 'react-router';
import { downloadText } from '../../app/files';
import { DESERT_GUIDE, type Run } from '../../content/desert';
import { WINTER_ARC_COMFORT, WINTER_ARC_REVIEW } from '../../content/winterArc';
import { useDayLookup, useProfile, useStore } from '../../data/hooks';
import { addDays, formatLong, fromKey, WEEKDAY_SHORT, type DateKey } from '../../domain/dates';
import {
  desertWeekOf,
  desertWeeks,
  habitsOf,
  keptIn,
  keptLine,
  leadVerse,
  meantFor,
  tickedOn,
} from '../../domain/desert';
import { canToggle, isDoneInPeriod, isDoneOn, isPerDay } from '../../domain/habits';
import { activeRun, endDateOf, isInRun, positionOf, stageOf, weekOf, type WinterArcRun } from '../../domain/winterArc';
import { Segmented } from '../../ui/Choice';
import { Tick } from '../../ui/Tick';
import { RoundReviews, roundTitle } from '../arena/WinterArcRounds';
import { WaVerse, WinterArcGuide } from '../arena/WinterArcGuide';
import { DesertChoice } from './DesertChoice';
import { DesertDay } from './DesertHabits';
import { DesertSettings, DesertStartPanel, formatFullDate } from './DesertSettings';
import { WithInfo } from './DesertInfo';

const dayLabel = (d: DateKey) => `${WEEKDAY_SHORT[fromKey(d).getDay()]} ${fromKey(d).getDate()}.${fromKey(d).getMonth() + 1}.`;

type View = 'day' | 'week' | 'guide';
const VIEW_KEY = 'tz:wuestenzeit-view';
/** The tab last chosen, on this device: a convenience only. */
const lastView = (): View => {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    return v === 'week' || v === 'guide' ? v : 'day';
  } catch {
    return 'day';
  }
};

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}

const runs = (parts: readonly Run[]) =>
  parts.map((p, i) =>
    typeof p === 'string' ? p : 'em' in p ? <em key={i}>{p.em}</em> : <strong key={i}>{p.strong}</strong>,
  );

/** The guide: the text of the Wüstenzeit, then the 90-Tage-Standard, folded. */
export function DesertGuide() {
  return (
    <div className="desert-guide">
      <h4>{DESERT_GUIDE.title}</h4>
      <p className="desert-tagline">
        <em>{DESERT_GUIDE.tagline}</em>
      </p>
      {DESERT_GUIDE.paragraphs.map((p, i) => (
        <p key={i}>{runs(p)}</p>
      ))}
      <WaVerse verse={DESERT_GUIDE.verse} />
      <details className="wa-settings desert-standard">
        <summary>Der 90-Tage-Standard</summary>
        <WinterArcGuide />
      </details>
    </div>
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

/** One day's list to tick, with a pager through the whole Wüstenzeit; later days are ticked only when they come. */
function DayView({ run, today }: { run: WinterArcRun; today: DateKey }) {
  const end = endDateOf(run.startDate, run.durationDays);
  const [shown, setShown] = useState<DateKey>(end < today ? end : today);
  const date = shown < run.startDate ? run.startDate : shown > end ? end : shown;
  return (
    <section className="panel wa-day" aria-labelledby="desert-day-title">
      <div className="wa-pager">
        <button type="button" className="icon-btn wa-pager-btn" aria-label="Vortag" disabled={date <= run.startDate} onClick={() => setShown(addDays(date, -1))}>
          <Chevron dir="left" />
        </button>
        <h4 id="desert-day-title">
          {date === today ? (
            <Link to="/" className="wa-today-link">
              Heute
            </Link>
          ) : (
            formatLong(date)
          )}
          <span className="wa-pager-sub">
            {date === today ? `${formatLong(date)} · ` : ''}Tag {positionOf(run, date).day}
          </span>
        </h4>
        <button type="button" className="icon-btn wa-pager-btn" aria-label="Folgetag" disabled={date >= end} onClick={() => setShown(addDays(date, 1))}>
          <Chevron dir="right" />
        </button>
      </div>
      {date > today && <p className="small muted wa-back">Dieser Tag liegt noch vor dir. Abhaken kannst du erst an ihm.</p>}
      {date !== today && (
        <p className="wa-back">
          <button type="button" className="link-btn" onClick={() => setShown(today)}>
            Zu heute
          </button>
        </p>
      )}
      <div className="wa-group">
        <DesertDay run={run} date={date} />
      </div>
    </section>
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

/** One calendar week: the grid of the daily habits, the weekly ones, what was kept so far, and the review. */
function WeekView({ run, today }: { run: WinterArcRun; today: DateKey }) {
  const store = useStore();
  const profile = useProfile();
  const lookup = useDayLookup();
  const weeks = desertWeeks(run);
  const current = Math.min(desertWeekOf(run, today), weeks.length);
  const [shown, setShown] = useState(current);
  const week = Math.min(Math.max(shown, 1), current);
  const monday = weeks[week - 1]!;
  const dates = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const habits = habitsOf(run, profile);
  const perDay = habits.filter(isPerDay);
  const periodic = habits.filter((h) => !isPerDay(h) && dates.some((d) => isInRun(run, d) && meantFor(h, d)));
  // The day the week's weekly ones are ticked on: today in this week, else its last day in the Wüstenzeit.
  const inWeek = dates.filter((d) => isInRun(run, d) && d <= today);
  const tickDay = inWeek.includes(today) ? today : inWeek[inWeek.length - 1];
  const lastDay = dates.filter((d) => isInRun(run, d)).pop()!;
  return (
    <>
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
        {perDay.length > 0 && (
          <div className="wa-grid-wrap">
            <table className="wa-grid">
              <thead>
                <tr>
                  <th scope="col" className="visually-hidden">
                    Gewohnheit
                  </th>
                  {dates.map((d) => (
                    <th key={d} scope="col" className={[isInRun(run, d) ? '' : 'is-outside', d === today ? 'is-today' : ''].join(' ').trim() || undefined} title={formatFullDate(d)}>
                      <span>{WEEKDAY_SHORT[fromKey(d).getDay()]}</span>
                      <span className="wa-grid-date">{fromKey(d).getDate()}.</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {perDay.map((h) => (
                  <tr key={h.id}>
                    <th scope="row">{h.name}</th>
                    {dates.map((d) => {
                      if (!isInRun(run, d))
                        return (
                          <td key={d} className="is-outside" aria-label="außerhalb der Wüstenzeit">
                            <span className="wa-void" aria-hidden="true" />
                          </td>
                        );
                      if (!meantFor(h, d))
                        return (
                          <td key={d} className="wa-off">
                            –
                          </td>
                        );
                      const done = isDoneOn(h, lookup(d));
                      return (
                        <td key={d}>
                          <button
                            type="button"
                            className={done ? 'wa-dot is-done' : 'wa-dot'}
                            aria-pressed={done}
                            disabled={!canToggle(h, d, today, lookup)}
                            aria-label={`${h.name}, ${dayLabel(d)}`}
                            onClick={() => store.toggleHabit(d, h)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="small muted">Ein leeres Kästchen ist kein Urteil, nur eine ehrliche Auskunft.</p>
      </section>
      {periodic.length > 0 && tickDay && (
        <section className="panel wa-weekly" aria-labelledby="desert-weekly-title">
          <h5 id="desert-weekly-title">Woche und Monat</h5>
          {periodic.map((h) => (
            <WithInfo key={h.id} habit={h}>
              <Tick
                checked={isDoneInPeriod(h, tickDay, lookup)}
                disabled={!canToggle(h, tickDay, today, lookup)}
                note={h.rhythm === 'weekly' ? 'diese Woche' : 'diesen Monat'}
                onToggle={() => store.toggleHabit(tickDay, h)}
              >
                {h.name}
              </Tick>
            </WithInfo>
          ))}
        </section>
      )}
      <section className="panel wa-weekly" aria-labelledby="desert-kept-title">
        <h5 id="desert-kept-title">Bisher</h5>
        <Kept run={run} today={today} />
      </section>
      {today >= lastDay && <WeekReview key={week} run={run} week={week} />}
    </>
  );
}

/** The dashboard: where the Wüstenzeit stands, then three tabs – the day, the week, the guide. */
function Dashboard({ run }: { run: WinterArcRun }) {
  const store = useStore();
  const today = store.today();
  const [view, setView] = useState<View>(lastView);
  const choose = (v: View) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // Only a convenience.
    }
  };
  const none = !(run.habits ?? []).length;
  return (
    <div className="wa-dashboard">
      <Head run={run} today={today} />
      {none ? (
        <section className="panel desert-first" aria-label="Gewohnheiten wählen">
          <h4>Gewohnheiten wählen</h4>
          <DesertChoice run={run} level={5} />
        </section>
      ) : (
        <>
          <Segmented<View>
            label="Ansicht der Wüstenzeit"
            value={view}
            onChange={choose}
            options={[
              { value: 'day', label: 'Tag' },
              { value: 'week', label: 'Woche' },
              { value: 'guide', label: 'Anleitung' },
            ]}
          />
          {view === 'day' && <DayView run={run} today={today} />}
          {view === 'week' && <WeekView run={run} today={today} />}
          {view === 'guide' && <DesertGuide />}
          <details className="wa-settings">
            <summary>Gewohnheiten wählen</summary>
            <DesertChoice run={run} level={5} />
          </details>
        </>
      )}
    </div>
  );
}

/** After the last day: the days, what was kept, taking habits into everyday life, the reviews, a new Wüstenzeit. */
function Closing({ run }: { run: WinterArcRun }) {
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
    </div>
  );
}

/** No Wüstenzeit under way: the guide, and the way in. */
function Start() {
  const profile = useProfile();
  const [starting, setStarting] = useState(false);
  return (
    <>
      <DesertGuide />
      <div className="panel wa-head wa-invite">
        {!starting && (
          <button type="button" className="btn primary" onClick={() => setStarting(true)}>
            Wüstenzeit beginnen
          </button>
        )}
        {starting && <DesertStartPanel onDone={() => setStarting(false)} />}
        {profile.winterArc.runs.length > 0 && (
          <p className="small">
            <Link to="/mehr/rueckblick?ansicht=wuestenzeit">Frühere Wüstenzeiten im Rückblick</Link>
          </p>
        )}
      </div>
    </>
  );
}

/**
 * The Wüstenzeit in the Arena: the guide and the way in; while it runs, the
 * dashboard; after its last day, the close. Everything else to set below.
 */
export function Desert() {
  const store = useStore();
  const profile = useProfile();
  const run = activeRun(profile.winterArc);
  if (!run) {
    return (
      <div className="desert">
        <Start />
      </div>
    );
  }
  const stage = stageOf(run, store.today());
  return (
    <div className="desert">
      {stage === 'after' ? <Closing run={run} /> : <Dashboard run={run} />}
      <details className="wa-settings">
        <summary>Einstellungen der Wüstenzeit</summary>
        <DesertSettings withChoice={false} />
      </details>
    </div>
  );
}
