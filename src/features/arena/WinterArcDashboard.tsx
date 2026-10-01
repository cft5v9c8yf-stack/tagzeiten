import { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  WINTER_ARC_COMFORT,
  WINTER_ARC_FOCUS,
  WINTER_ARC_GROUPS,
  WINTER_ARC_ITEMS,
  WINTER_ARC_MONTHLY,
  WINTER_ARC_REVIEW,
  WINTER_ARC_TRACKER_NOTE,
  WINTER_ARC_WEEKLY,
} from '../../content/winterArc';
import { useDay, useProfile, useStore } from '../../data/hooks';
import {
  addDays,
  formatLong,
  fromKey,
  MONTH_LONG,
  WEEKDAY_LONG,
  WEEKDAY_SHORT,
  type DateKey,
} from '../../domain/dates';
import { houseHas } from '../../domain/house';
import {
  appliesOn,
  isOn,
  dayOf,
  endDateOf,
  focusOf,
  isInRun,
  lastDayOfWeek,
  monthsOfWeek,
  phaseOf,
  positionOf,
  servedIn,
  stageOf,
  totalWeeks,
  weekDates,
  weekOf,
  type WinterArcRun,
} from '../../domain/winterArc';
import { DayField } from '../../ui/DayField';
import { Tick } from '../../ui/Tick';
import { Segmented } from '../../ui/Choice';
import { formatFullDate } from '../settings/WinterArcSettings';
import { WaVerse, WinterArcGuide } from './WinterArcGuide';

const monthName = (month: string) => MONTH_LONG[Number(month.slice(5, 7)) - 1];
const dayLabel = (d: DateKey) =>
  `${WEEKDAY_LONG[fromKey(d).getDay()]}, ${fromKey(d).getDate()}.${fromKey(d).getMonth() + 1}.`;

type View = 'day' | 'week' | 'guide';
const VIEW_KEY = 'tz:streithalle-view';
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

/** Where the round stands: day, phase, week, focus; the verse of the week before its task (Word first, rule 2). */
function Head({ run, today }: { run: WinterArcRun; today: DateKey }) {
  const pos = positionOf(run, today);
  const focus = WINTER_ARC_FOCUS[pos.focus - 1]!;
  return (
    <div className="panel wa-head">
      <p className="wa-head-line">
        <strong>
          Tag {pos.day} von {pos.days}
        </strong>
        <span className="wa-chip">{pos.phase}</span>
        <span className="wa-head-week">
          Woche {pos.week} von {pos.weeks}
        </span>
      </p>
      <p className="wa-head-focus">
        <span className="wa-label">Schwerpunkt</span>
        <strong>{focus.focus}</strong>
      </p>
      <WaVerse verse={focus.verse} />
      <p className="wa-head-task">
        <span className="wa-label">Auftrag der Woche</span> {focus.task}
      </p>
    </div>
  );
}

/**
 * The journal point: write the marked sentence and three thanks right here (the
 * same fields as in the Andacht), or go to the Gebetskammer and write there.
 */
export function JournalEntry({ date }: { date: DateKey }) {
  const store = useStore();
  const navigate = useNavigate();
  return (
    <div className="wa-journal">
      <DayField date={date} path="morning.verse" label="Der Satz, der mich trifft" />
      <DayField date={date} path="evening.thanks.0" label="Ich danke dir, mein Gott, für …" />
      <DayField date={date} path="evening.thanks.1" />
      <DayField date={date} path="evening.thanks.2" />
      <p className="small muted">
        Der Satz erscheint auch in der Andacht und in der Versesammlung, der Dank im Nachtgebet.
      </p>
      <button type="button" className="btn quiet" onClick={() => navigate(`/arena/${store.addArenaEntry()}`)}>
        Lieber in der Gebetskammer schreiben
      </button>
    </div>
  );
}

/**
 * One day's checklist by Morgen and Haus, with a pager through the whole round:
 * earlier days can be filled in, later ones are shown but ticked only when they come.
 */
function DayView({ run, today }: { run: WinterArcRun; today: DateKey }) {
  const store = useStore();
  const profile = useProfile();
  const end = endDateOf(run.startDate, run.durationDays);
  const [shown, setShown] = useState<DateKey>(end < today ? end : today);
  const date = shown < run.startDate ? run.startDate : shown > end ? end : shown;
  const future = date > today;
  const day = useDay(date);
  const [writing, setWriting] = useState(false);
  const checks = dayOf(profile.winterArc, run.id, date)?.checks ?? {};
  const settings = profile.winterArcSettings;
  return (
    <section className="panel wa-day" aria-labelledby="wa-day-title">
      <div className="wa-pager">
        <button
          type="button"
          className="icon-btn wa-pager-btn"
          aria-label="Vortag"
          disabled={date <= run.startDate}
          onClick={() => setShown(addDays(date, -1))}
        >
          <Chevron dir="left" />
        </button>
        <h4 id="wa-day-title">
          {date === today ? (
            <Link to="/" className="wa-today-link">
              Heute
            </Link>
          ) : (
            formatLong(date)
          )}
          <span className="wa-pager-sub">Tag {positionOf(run, date).day}</span>
        </h4>
        <button
          type="button"
          className="icon-btn wa-pager-btn"
          aria-label="Folgetag"
          disabled={date >= end}
          onClick={() => setShown(addDays(date, 1))}
        >
          <Chevron dir="right" />
        </button>
      </div>
      {future && <p className="small muted wa-back">Dieser Tag liegt noch vor dir. Abhaken kannst du erst an ihm.</p>}
      {date !== today && (
        <p className="wa-back">
          <button type="button" className="link-btn" onClick={() => setShown(today)}>
            Zu heute
          </button>
        </p>
      )}
      {WINTER_ARC_GROUPS.map((g) => (
        <div key={g} className="wa-group">
          <h5>{g}</h5>
          {WINTER_ARC_ITEMS.filter(
            (it) => it.group === g && houseHas(profile.house, it.needs) && isOn(profile.winterArcSettings, it.id),
          ).map((it) => {
            const text = it.text(settings.times);
            if (!appliesOn(settings, it.id, date)) {
              return (
                <p key={it.id} className="wa-tick is-off">
                  <span className="wa-off-mark">{it.off}</span>
                  <span className="wa-tick-text">{text}</span>
                </p>
              );
            }
            return (
              <div key={it.id} className="wa-row">
                <div className="wa-row-line">
                  <Tick
                    checked={!!checks[it.id]}
                    disabled={future}
                    onToggle={() => store.toggleWinterArcCheck(run.id, date, it.id)}
                  >
                    {text}
                  </Tick>
                  {it.id === 'journal' && !future && (
                    <button
                      type="button"
                      className="wa-row-action"
                      aria-expanded={writing}
                      onClick={() => setWriting(!writing)}
                    >
                      {writing ? 'Schließen' : 'Aufschreiben'}
                    </button>
                  )}
                </div>
                {/* A hint only: the tick is always set by hand. */}
                {it.id === 'word' && day.morning.done && !checks.word && (
                  <p className="wa-hint">Das Morgengebet hast du heute schon gebetet – abhaken?</p>
                )}
                {it.id === 'journal' && writing && !future && <JournalEntry date={date} />}
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}

/** Seven days by the points of the checklist. Done is a filled dot, open a plain outline; past days may be filled in. */
function WeekGrid({ run, week, today }: { run: WinterArcRun; week: number; today: DateKey }) {
  const store = useStore();
  const profile = useProfile();
  const settings = profile.winterArcSettings;
  const dates = weekDates(run.startDate, week);
  return (
    <table className="wa-grid">
      <thead>
        <tr>
          <th scope="col" className="visually-hidden">
            Punkt
          </th>
          {dates.map((d) => (
            <th
              key={d}
              scope="col"
              className={
                [isInRun(run, d) ? '' : 'is-outside', d === today ? 'is-today' : ''].join(' ').trim() || undefined
              }
              title={formatFullDate(d)}
            >
              <span>{WEEKDAY_SHORT[fromKey(d).getDay()]}</span>
              <span className="wa-grid-date">{fromKey(d).getDate()}.</span>
            </th>
          ))}
        </tr>
      </thead>
      {WINTER_ARC_GROUPS.map((g) => (
        <tbody key={g}>
          <tr className="wa-grid-group">
            <th scope="rowgroup" colSpan={8}>
              {g}
            </th>
          </tr>
          {WINTER_ARC_ITEMS.filter(
            (it) => it.group === g && houseHas(profile.house, it.needs) && isOn(profile.winterArcSettings, it.id),
          ).map((it) => {
            const text = it.text(settings.times);
            return (
              <tr key={it.id}>
                <th scope="row">{text}</th>
                {dates.map((d) => {
                  if (!isInRun(run, d))
                    return (
                      <td key={d} className="is-outside" aria-label="außerhalb der Runde">
                        <span className="wa-void" aria-hidden="true" />
                      </td>
                    );
                  if (!appliesOn(settings, it.id, d))
                    return (
                      <td key={d} className="wa-off">
                        {it.off}
                      </td>
                    );
                  const done = !!dayOf(profile.winterArc, run.id, d)?.checks[it.id];
                  return (
                    <td key={d}>
                      <button
                        type="button"
                        className={done ? 'wa-dot is-done' : 'wa-dot'}
                        aria-pressed={done}
                        disabled={d > today}
                        aria-label={`${text}, ${dayLabel(d)}`}
                        onClick={() => store.toggleWinterArcCheck(run.id, d, it.id)}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      ))}
    </table>
  );
}

/** The weekly standard of the week shown, and the monthly point for each calendar month it touches. */
function WeeklyStandard({ run, week }: { run: WinterArcRun; week: number }) {
  const store = useStore();
  const profile = useProfile();
  const checks = weekOf(profile.winterArc, run.id, week)?.weeklyChecks ?? {};
  const months = monthsOfWeek(run, week);
  return (
    <section className="panel wa-weekly" aria-labelledby="wa-weekly-title">
      <h5 id="wa-weekly-title">Wochenstandard</h5>
      {WINTER_ARC_WEEKLY.filter(
        (it) => houseHas(profile.house, it.needs) && isOn(profile.winterArcSettings, it.id),
      ).map((it) => (
        <Tick key={it.id} checked={!!checks[it.id]} onToggle={() => store.toggleWinterArcWeekly(run.id, week, it.id)}>
          {it.text}
        </Tick>
      ))}
      {isOn(profile.winterArcSettings, 'serve') &&
        months.map((m) => (
          <Tick
            key={m}
            checked={servedIn(profile.winterArc, run.id, m)}
            onToggle={() => store.toggleWinterArcServed(run.id, m)}
          >
            {WINTER_ARC_MONTHLY}
            <span className="muted"> · {monthName(m)}</span>
          </Tick>
        ))}
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

/** One week of the round: the grid, the weekly standard and, from its last day on, the review. */
function WeekView({ run, today, current }: { run: WinterArcRun; today: DateKey; current: number }) {
  const [shown, setShown] = useState(current);
  const week = Math.min(Math.max(shown, 1), current);
  const W = totalWeeks(run.durationDays);
  const focus = WINTER_ARC_FOCUS[focusOf(week, W) - 1]!;
  return (
    <>
      <section className="panel wa-week-view" aria-labelledby="wa-week-title">
        <div className="wa-pager">
          <button
            type="button"
            className="icon-btn wa-pager-btn"
            aria-label="Frühere Woche"
            disabled={week <= 1}
            onClick={() => setShown(week - 1)}
          >
            <Chevron dir="left" />
          </button>
          <h4 id="wa-week-title">
            {week === current ? 'Diese Woche' : `Woche ${week}`}
            <span className="wa-pager-sub">
              Woche {week} von {W} · {focus.focus}
            </span>
          </h4>
          <button
            type="button"
            className="icon-btn wa-pager-btn"
            aria-label="Spätere Woche"
            disabled={week >= current}
            onClick={() => setShown(week + 1)}
          >
            <Chevron dir="right" />
          </button>
        </div>
        <div className="wa-grid-wrap">
          <WeekGrid run={run} week={week} today={today} />
        </div>
        <p className="small muted">{WINTER_ARC_TRACKER_NOTE}</p>
      </section>
      <WeeklyStandard run={run} week={week} />
      {today >= lastDayOfWeek(run, week) && <WeekReview key={week} run={run} week={week} />}
    </>
  );
}

/**
 * The dashboard of the Winter Arc: where the round stands, then three tabs –
 * the day with its checklist, the week as a grid with its standard and review,
 * and the guide. Nothing is counted, nothing is rated (rules 4–6).
 */
export function WinterArcDashboard({ run }: { run: WinterArcRun }) {
  const store = useStore();
  const today = store.today();
  const stage = stageOf(run, today);
  const W = totalWeeks(run.durationDays);
  const current = stage === 'during' ? positionOf(run, today).week : stage === 'after' ? W : 1;
  const [view, setView] = useState<View>(lastView);
  const choose = (v: View) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // Only a convenience.
    }
  };
  const first = WINTER_ARC_FOCUS[focusOf(1, W) - 1]!;
  const shown: View = stage === 'before' ? 'guide' : view;

  return (
    <div className="wa-dashboard">
      {stage === 'before' ? (
        <div className="panel wa-head">
          <p className="wa-head-line">
            <strong>Die Runde beginnt am {formatFullDate(run.startDate)}.</strong>
          </p>
          <p className="wa-head-focus">
            <span className="wa-label">Erste Woche · {phaseOf(first.week)}</span>
            <strong>{first.focus}</strong>
          </p>
          <WaVerse verse={first.verse} />
          <p className="wa-head-task">
            <span className="wa-label">Auftrag der Woche</span> {first.task}
          </p>
        </div>
      ) : (
        <Head run={run} today={today} />
      )}
      {stage !== 'before' && (
        <Segmented<View>
          label="Ansicht der Streithalle"
          value={shown}
          onChange={choose}
          options={[
            { value: 'day', label: 'Tag' },
            { value: 'week', label: 'Woche' },
            { value: 'guide', label: 'Anleitung' },
          ]}
        />
      )}
      {shown === 'day' && <DayView run={run} today={today} />}
      {shown === 'week' && <WeekView run={run} today={today} current={current} />}
      {shown === 'guide' && (
        <WinterArcGuide currentFocus={stage === 'during' ? positionOf(run, today).focus : undefined} />
      )}
    </div>
  );
}
