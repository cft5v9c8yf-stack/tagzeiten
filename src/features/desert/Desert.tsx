import { useId, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { downloadText } from '../../app/files';
import { DESERT_GUIDE, type Run } from '../../content/desert';
import { WINTER_ARC_COMFORT, WINTER_ARC_FOCUS, WINTER_ARC_PHASES, WINTER_ARC_REVIEW } from '../../content/winterArc';
import { useDayLookup, useProfile, useStore, useToday } from '../../data/hooks';
import { addDays, formatLong, fromKey, WEEKDAY_SHORT, type DateKey } from '../../domain/dates';
import {
  desertWeekOf,
  desertWeeks,
  habitsOf,
  keptIn,
  keptLine,
  leadVerse,
  tickedOn,
  usesStandard,
} from '../../domain/desert';
import { arenaOffer, seasonLinkOf } from '../../domain/seasons';
import { activeRun, endDateOf, focusOf, isInRun, phaseOf, positionOf, stageOf, weekOf, type WinterArcRun } from '../../domain/winterArc';
import { Segmented } from '../../ui/Choice';
import { RoundReviews, roundTitle } from '../arena/WinterArcRounds';
import { WaVerse, WinterArcGuide } from '../arena/WinterArcGuide';
import { DesertJournal, RoundJournal } from './DesertJournal';
import { DesertSettings, DesertStartPanel, formatFullDate } from './DesertSettings';
import { ArenaSeason, SeasonLink, seasonPreset } from './SeasonInvite';
import { Chevron } from '../../ui/Chevron';

type View = 'course' | 'journal' | 'review' | 'guide';
const VIEW_KEY = 'tz:wuestenzeit-view';
/** The tab last chosen, on this device: a convenience only. */
const lastView = (): View => {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    return v === 'journal' || v === 'review' || v === 'guide' ? v : 'course';
  } catch {
    return 'course';
  }
};

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

/** The journal, day by day, with a pager through the whole Wüstenzeit; a later day is written when it comes. */
function JournalView({ run, today }: { run: WinterArcRun; today: DateKey }) {
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
          {date === today ? 'Heute' : formatLong(date)}
          <span className="wa-pager-sub">
            {date === today ? `${formatLong(date)} · ` : ''}Tag {positionOf(run, date).day}
          </span>
        </h4>
        <button type="button" className="icon-btn wa-pager-btn" aria-label="Folgetag" disabled={date >= end} onClick={() => setShown(addDays(date, 1))}>
          <Chevron dir="right" />
        </button>
      </div>
      {date > today && <p className="small muted wa-back">Dieser Tag liegt noch vor dir. Schreiben kannst du erst an ihm.</p>}
      {date !== today && (
        <p className="wa-back">
          <button type="button" className="link-btn" onClick={() => setShown(today)}>
            Zu heute
          </button>
        </p>
      )}
      {date <= today && <DesertJournal key={date} date={date} />}
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

/**
 * The course of the Wüstenzeit: its days in calendar weeks, Monday to Sunday. A day with a tick is filled,
 * a day without one stays grey, a day to come is only outlined. A record, never a rating (rules 4 and 5).
 */
function Course({ run, today }: { run: WinterArcRun; today: DateKey }) {
  const profile = useProfile();
  const lookup = useDayLookup();
  const habits = habitsOf(run, profile);
  return (
    <section className="panel wa-course" aria-labelledby="desert-course-title">
      <h4 id="desert-course-title">Verlauf</h4>
      <table className="wa-course-grid">
        <caption className="visually-hidden">Die Tage der Wüstenzeit, Woche für Woche</caption>
        <thead>
          <tr>
            <th scope="col">
              <span className="visually-hidden">Woche</span>
            </th>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <th key={d} scope="col">
                {WEEKDAY_SHORT[d]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {desertWeeks(run).map((monday, i) => (
            <tr key={monday}>
              <th scope="row">
                <span>Woche {i + 1}</span>
                <span className="wa-course-date">
                  {fromKey(monday).getDate()}.{fromKey(monday).getMonth() + 1}.
                </span>
              </th>
              {Array.from({ length: 7 }, (_, k) => addDays(monday, k)).map((d) => {
                if (!isInRun(run, d))
                  return (
                    <td key={d} aria-label="außerhalb der Wüstenzeit">
                      <span className="wa-course-cell is-outside" aria-hidden="true" />
                    </td>
                  );
                const future = d > today;
                const ticked = !future && tickedOn(habits, d, lookup);
                const state = future ? 'liegt noch vor dir' : ticked ? 'mit Haken' : 'ohne Haken';
                return (
                  <td key={d} aria-label={`${formatLong(d)}: ${state}`}>
                    <span
                      className={`wa-course-cell${future ? ' is-future' : ticked ? ' is-ticked' : ' is-open'}${d === today ? ' is-today' : ''}`}
                      aria-hidden="true"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small muted">Gefüllt ist ein Tag mit mindestens einem Haken. Ein grauer Tag ist kein Urteil, nur eine ehrliche Auskunft.</p>
      <h5>Bisher</h5>
      <Kept run={run} today={today} />
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

/** The dashboard: where the Wüstenzeit stands, then four tabs – the course, the journal, the review, the guide. */
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
      {none && <p className="wa-to-today">Du hast noch keine Gewohnheiten gewählt.</p>}
      <ToToday />
      <Segmented<View>
        grid
        label="Ansicht der Wüstenzeit"
        value={view}
        onChange={choose}
        options={[
          { value: 'course', label: 'Verlauf' },
          { value: 'journal', label: 'Tagebuch' },
          { value: 'review', label: 'Rückblick' },
          { value: 'guide', label: 'Anleitung' },
        ]}
      />
      {view === 'course' && <Course run={run} today={today} />}
      {view === 'journal' && <JournalView run={run} today={today} />}
      {view === 'review' && <ReviewView run={run} today={today} />}
      {view === 'guide' && (
        <DesertGuide
          focus={usesStandard(run) ? focusOf(Math.min(desertWeekOf(run, today), desertWeeks(run).length), desertWeeks(run).length) : undefined}
          link={seasonLinkOf(run)}
        />
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
    </div>
  );
}

/** No Wüstenzeit under way: the Word, the way in, then the guide (0.40: the way in no longer below it). */
function Start() {
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
    </>
  );
}

/**
 * The Wüstenwanderung, the Wüstenzeit's place in the Arena: the guide and the way in; while one runs, the
 * dashboard; after its last day, the close. Everything else to set below.
 */
export function Desert() {
  useToday();
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
