import { useId, useState } from 'react';
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
import { houseHas } from '../../domain/house';
import { useDay, useProfile, useStore } from '../../data/hooks';
import { fromKey, MONTH_LONG, WEEKDAY_LONG, WEEKDAY_SHORT, type DateKey } from '../../domain/dates';
import {
  appliesOn,
  dayOf,
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
import { formatFullDate } from '../settings/WinterArcSettings';
import { WaVerse } from './WinterArcGuide';

const monthName = (month: string) => MONTH_LONG[Number(month.slice(5, 7)) - 1];
const dayLabel = (d: DateKey) =>
  `${WEEKDAY_LONG[fromKey(d).getDay()]}, ${fromKey(d).getDate()}.${fromKey(d).getMonth() + 1}.`;

/** Day, phase, week and focus; the verse of the week before its task (Word first, rule 2). */
function Head({ run, today }: { run: WinterArcRun; today: DateKey }) {
  const pos = positionOf(run, today);
  const focus = WINTER_ARC_FOCUS[pos.focus - 1]!;
  return (
    <div className="wa-head">
      <p className="wa-head-line">
        <strong>
          Tag {pos.day} von {pos.days}
        </strong>{' '}
        · {pos.phase} · Woche {pos.week} von {pos.weeks}
      </p>
      <p className="wa-head-focus">
        Schwerpunkt: <strong>{focus.focus}</strong>
      </p>
      <WaVerse verse={focus.verse} />
      <p className="wa-head-task">
        <span className="wa-label">Auftrag der Woche</span> {focus.task}
      </p>
    </div>
  );
}

/** "Heute": the checklist of the day by Morgen, Arbeit, Haus. A tap sets or takes away the tick. */
function Today({ run, today }: { run: WinterArcRun; today: DateKey }) {
  const store = useStore();
  const profile = useProfile();
  const day = useDay(today);
  const checks = dayOf(profile.winterArc, run.id, today)?.checks ?? {};
  const settings = profile.winterArcSettings;
  return (
    <section className="wa-today" aria-labelledby="wa-today-title">
      <h4 id="wa-today-title">Heute</h4>
      {WINTER_ARC_GROUPS.map((g) => (
        <div key={g} className="wa-group">
          <h5>{g}</h5>
          <ul className="wa-checks">
            {WINTER_ARC_ITEMS.filter((it) => it.group === g && houseHas(profile.house, it.needs)).map((it) => {
              const text = it.text(settings.times);
              if (!appliesOn(settings, it.id, today)) {
                return (
                  <li key={it.id} className="wa-check is-off">
                    <span className="wa-off">{it.off}</span> {text}
                  </li>
                );
              }
              return (
                <li key={it.id} className="wa-check">
                  <label>
                    <input
                      type="checkbox"
                      checked={!!checks[it.id]}
                      onChange={() => store.toggleWinterArcCheck(run.id, today, it.id)}
                    />{' '}
                    {text}
                  </label>
                  {/* A hint only: the tick is always set by hand. */}
                  {it.id === 'word' && day.morning.done && !checks.word && (
                    <p className="small muted wa-hint">Morgengebet heute gebetet – abhaken?</p>
                  )}
                </li>
              );
            })}
          </ul>
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
            <th key={d} scope="col" className={isInRun(run, d) ? undefined : 'is-outside'} title={formatFullDate(d)}>
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
          {WINTER_ARC_ITEMS.filter((it) => it.group === g && houseHas(profile.house, it.needs)).map((it) => {
            const text = it.text(settings.times);
            return (
              <tr key={it.id}>
                <th scope="row">{text}</th>
                {dates.map((d) => {
                  if (!isInRun(run, d)) return <td key={d} className="is-outside" aria-label="außerhalb der Runde" />;
                  if (!appliesOn(settings, it.id, d))
                    return (
                      <td key={d} className="wa-off">
                        {it.off}
                      </td>
                    );
                  const done = !!dayOf(profile.winterArc, run.id, d)?.checks[it.id];
                  const future = d > today;
                  return (
                    <td key={d}>
                      <button
                        type="button"
                        className={done ? 'wa-dot is-done' : 'wa-dot'}
                        aria-pressed={done}
                        disabled={future}
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
    <section className="wa-weekly" aria-labelledby="wa-weekly-title">
      <h5 id="wa-weekly-title">Wochenstandard</h5>
      <ul className="wa-checks">
        {WINTER_ARC_WEEKLY.filter((it) => houseHas(profile.house, it.needs)).map((it) => (
          <li key={it.id} className="wa-check">
            <label>
              <input
                type="checkbox"
                checked={!!checks[it.id]}
                onChange={() => store.toggleWinterArcWeekly(run.id, week, it.id)}
              />{' '}
              {it.text}
            </label>
          </li>
        ))}
        {months.map((m) => (
          <li key={m} className="wa-check">
            <label>
              <input
                type="checkbox"
                checked={servedIn(profile.winterArc, run.id, m)}
                onChange={() => store.toggleWinterArcServed(run.id, m)}
              />{' '}
              {WINTER_ARC_MONTHLY}
              <span className="muted"> · {monthName(m)}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "Sonntagabend": three lines, always ending in the word of comfort (rule 1). */
export function WeekReview({ run, week, readOnly = false }: { run: WinterArcRun; week: number; readOnly?: boolean }) {
  const store = useStore();
  const profile = useProfile();
  const id = useId();
  const review = weekOf(profile.winterArc, run.id, week)?.review;
  return (
    <section className="wa-review" aria-labelledby={`${id}-title`}>
      <h5 id={`${id}-title`}>Wochenrückblick</h5>
      {WINTER_ARC_REVIEW.map((r) =>
        readOnly ? (
          <div key={r.key} className="wa-review-line">
            <p className="wa-label">{r.label}</p>
            <p>{review?.[r.key]?.trim() || '–'}</p>
          </div>
        ) : (
          <div key={r.key} className="field">
            <label htmlFor={`${id}-${r.key}`}>{r.label}</label>
            <textarea
              id={`${id}-${r.key}`}
              rows={2}
              value={review?.[r.key] ?? ''}
              onChange={(e) => store.setWinterArcReview(run.id, week, r.key, e.target.value)}
            />
          </div>
        ),
      )}
      <div className="arena-comfort wa-comfort">
        <p>„{WINTER_ARC_COMFORT.verse.text}“</p>
        <span className="bible-ref">{WINTER_ARC_COMFORT.verse.ref}</span>
      </div>
    </section>
  );
}

/**
 * The dashboard of the Winter Arc: where the round stands, today's checklist,
 * the week as a grid with its weekly standard, and the review on the last day
 * of each week. Nothing is counted, nothing is rated (rules 4–6).
 */
export function WinterArcDashboard({ run }: { run: WinterArcRun }) {
  const store = useStore();
  const today = store.today();
  const stage = stageOf(run, today);
  const W = totalWeeks(run.durationDays);
  const current = stage === 'during' ? positionOf(run, today).week : stage === 'after' ? W : 1;
  const [shown, setShown] = useState(current);
  const week = Math.min(Math.max(shown, 1), current);

  if (stage === 'before') {
    const first = WINTER_ARC_FOCUS[focusOf(1, W) - 1]!;
    return (
      <div className="wa-dashboard">
        <p className="wa-head-line">
          <strong>Die Runde beginnt am {formatFullDate(run.startDate)}.</strong>
        </p>
        <p className="wa-head-focus">
          Erste Woche: {phaseOf(first.week)} · Schwerpunkt: <strong>{first.focus}</strong>
        </p>
        <WaVerse verse={first.verse} />
        <p className="wa-head-task">
          <span className="wa-label">Auftrag der Woche</span> {first.task}
        </p>
      </div>
    );
  }

  const focus = WINTER_ARC_FOCUS[focusOf(week, W) - 1]!;
  return (
    <div className="wa-dashboard">
      <Head run={run} today={today} />
      <Today run={run} today={today} />
      <section className="wa-week-view" aria-labelledby="wa-week-title">
        <h4 id="wa-week-title">{week === current ? 'Diese Woche' : `Woche ${week}`}</h4>
        <div className="wa-week-nav">
          <button type="button" className="btn quiet" disabled={week <= 1} onClick={() => setShown(week - 1)}>
            ‹ Frühere Woche
          </button>
          <button type="button" className="btn quiet" disabled={week >= current} onClick={() => setShown(week + 1)}>
            Spätere Woche ›
          </button>
        </div>
        <p className="small muted">
          Woche {week} von {W} · Schwerpunkt: {focus.focus} · Woche vom{' '}
          {formatFullDate(weekDates(run.startDate, week)[0]!)}
        </p>
        <p className="small muted">{WINTER_ARC_TRACKER_NOTE}</p>
        <div className="wa-grid-wrap">
          <WeekGrid run={run} week={week} today={today} />
        </div>
        <WeeklyStandard run={run} week={week} />
        {today >= lastDayOfWeek(run, week) && <WeekReview run={run} week={week} />}
      </section>
    </div>
  );
}
