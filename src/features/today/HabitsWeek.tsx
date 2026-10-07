import { useState } from 'react';
import { useDayLookup, useProfile, useStore } from '../../data/hooks';
import { addDays, formatLong, formatShort, fromKey, mondayOf, WEEKDAY_SHORT, weekdayOf, type DateKey } from '../../domain/dates';
import { canToggle, fitsHouse, daysDoneInWeek, habitsOfRhythm, isDoneInPeriod, isDoneOn, isPerDay, RHYTHM_ORDER } from '../../domain/habits';
import { READING_HABIT } from '../../content/habits';
import type { Habit, Rhythm } from '../../domain/model';
import { activeRun, hallModeIn, isInRun } from '../../domain/winterArc';
import { StarIcon } from '../../ui/Icons';
import { DesertDay, DesertWeekRows } from '../desert/DesertHabits';
import { Tick } from '../../ui/Tick';

const GROUP_TITLE: Record<Rhythm, string> = { daily: 'Täglich', weekly: 'Wöchentlich', monthly: 'Monatlich' };

function HabitName({ habit, note }: { habit: Habit; note?: string }) {
  return (
    <th scope="row">
      <span className="habit-name">
        {habit.focus && (
          <span className="focus-star" title="Fokus">
            <StarIcon filled size={14} />
            <span className="visually-hidden">Fokus: </span>
          </span>
        )}
        {habit.name}
      </span>
      {note && <span className="auto">{note}</span>}
    </th>
  );
}

/** The quiet line under a habit's name: where it comes from, or how often it is meant. */
function noteOf(h: Habit, date: DateKey, lookup: ReturnType<typeof useDayLookup>): string | undefined {
  if (h.auto) return 'aus dem Ablauf';
  if (h.id === READING_HABIT) return 'nach dem Leseplan';
  // Documented, not rated: how many days are entered, never what is "missing" (rules 3–5).
  if (h.rhythm === 'weekly' && h.timesPerWeek) return `${h.timesPerWeek}-mal die Woche · ${daysDoneInWeek(h, date, lookup)}\u00a0eingetragen`;
  return undefined;
}

/**
 * This week's habits: daily ones (and weekly ones meant for several days) as
 * seven dots Mo–So, the other weekly and monthly ones as one mark for the
 * period. No streaks, no score (rule 4).
 */
export function HabitsWeek({ date }: { date: DateKey }) {
  const store = useStore();
  const profile = useProfile();
  const lookup = useDayLookup();
  const today = store.today();
  const week = Array.from({ length: 7 }, (_, i) => addDays(mondayOf(date), i));
  // While a Wüstenzeit runs in this week, its habits stand first, as a group of their own;
  // the usual ones follow (without those chosen for it, so nothing stands twice).
  const hallMode = hallModeIn(profile.winterArc, date);
  const run = activeRun(profile.winterArc);
  const desertIds = new Set(hallMode ? (run?.habits ?? []) : []);
  const active = profile.habits.filter((h) => h.active && fitsHouse(h, profile.house) && !desertIds.has(h.id));
  // Sunday rest: no usual habits on Sundays; what was ticked before stays stored. The Wüstenzeit keeps its days.
  const resting = (k: DateKey) => profile.sundayRest && weekdayOf(k) === 0;

  const toggle = (h: Habit, k: DateKey) => store.toggleHabit(k, h);
  const [picked, setPicked] = useState<DateKey | null>(null);

  // The starred habits stand on their own at the top, and not again in their group.
  const focus = active.filter((h) => h.focus);
  const rest = active.filter((h) => !h.focus);

  const row = (h: Habit) => {
    if (isPerDay(h)) {
      return (
        <tr key={h.id}>
          <HabitName habit={h} note={noteOf(h, date, lookup)} />
          {week.map((k) => {
            if (resting(k)) return <td key={k} className="rest-cell" />;
            const on = isDoneOn(h, lookup(k));
            const enabled = canToggle(h, k, today, lookup);
            return (
              <td key={k}>
                <button
                  type="button"
                  className={`cell${k === today ? ' today' : ''}${k > today ? ' future' : ''}`}
                  aria-pressed={on}
                  disabled={!enabled}
                  aria-label={`${h.name}, ${formatShort(k)}`}
                  onClick={() => toggle(h, k)}
                />
              </td>
            );
          })}
        </tr>
      );
    }
    const on = isDoneInPeriod(h, date, lookup);
    const period = h.rhythm === 'weekly' ? 'diese Woche' : 'diesen Monat';
    return (
      <tr key={h.id}>
        <HabitName habit={h} />
        <td colSpan={7} className="period-cell">
          <button
            type="button"
            className="pill"
            aria-pressed={on}
            aria-label={`${h.name}, ${period}`}
            disabled={!canToggle(h, date, today, lookup)}
            onClick={() => toggle(h, date)}
          >
            {on ? `✓ ${period}` : period}
          </button>
        </td>
      </tr>
    );
  };

  if (active.length === 0 && !hallMode) {
    return <p className="empty">Keine Gewohnheiten ausgewählt. Unter „Mehr“ kannst du welche wählen oder anlegen.</p>;
  }

  // The day whose habits are listed: chosen in the strip of the week, at first the day shown.
  // On a Monday the day before lies in the week before; it can still be filled in.
  const yesterday = addDays(today, -1);
  const sel = picked && (week.includes(picked) || picked === yesterday) ? picked : date;
  const lateEntry = date === today && !week.includes(yesterday) && sel !== yesterday;
  const dayTitle = sel === today ? 'Heute' : formatLong(sel);
  // Those from the orders (Stille Zeit, Vesper, Nachtgebet) stand above as tiles, and in the
  // grid of the week; here only what is ticked by hand (0.40). Weekly and monthly ones already kept move to the end.
  const byHand = (list: Habit[]) => list.filter((h) => !h.auto);
  const listed = byHand(rest);
  const keptLast = (list: Habit[]) => [
    ...list.filter((h) => !isDoneInPeriod(h, sel, lookup)),
    ...list.filter((h) => isDoneInPeriod(h, sel, lookup)),
  ];
  const perDay = listed.filter(isPerDay);
  const weekly = keptLast(listed.filter((h) => !isPerDay(h) && h.rhythm === 'weekly'));
  const monthly = keptLast(listed.filter((h) => !isPerDay(h) && h.rhythm === 'monthly'));
  const tick = (h: Habit) => {
    const per = isPerDay(h);
    return (
      <Tick
        key={h.id}
        checked={per ? isDoneOn(h, lookup(sel)) : isDoneInPeriod(h, sel, lookup)}
        disabled={!canToggle(h, sel, today, lookup)}
        note={per ? noteOf(h, sel, lookup) : h.rhythm === 'weekly' ? 'diese Woche' : 'diesen Monat'}
        onToggle={() => toggle(h, sel)}
      >
        {h.name}
      </Tick>
    );
  };
  const groups: [string, Habit[]][] = [
    ['Im Blick', byHand(focus)],
    ['Täglich', perDay],
    ['Wöchentlich', weekly],
    ['Monatlich', monthly],
  ];

  return (
    <>
    <section className="panel habits-day" aria-label={`Gewohnheiten, ${dayTitle}`}>
      <div className="day-strip" role="group" aria-label="Tag der Woche wählen">
        {week.map((k) => (
          <button
            key={k}
            type="button"
            className={`day-strip-day${k === today ? ' is-today' : ''}`}
            aria-pressed={k === sel}
            aria-label={formatLong(k)}
            onClick={() => setPicked(k)}
          >
            <span className="day-strip-wd">{WEEKDAY_SHORT[weekdayOf(k)]}</span>
            <span className="day-strip-d">{fromKey(k).getDate()}</span>
          </button>
        ))}
      </div>
      <h4 className="habits-day-title">{dayTitle}</h4>
      {lateEntry && (
        <p className="habits-late">
          <button type="button" className="link-btn" onClick={() => setPicked(yesterday)}>
            Gestern nachtragen
          </button>
        </p>
      )}
      {hallMode && run && (
        <div className="wa-group desert-group">
          <h5>Wüstenzeit</h5>
          <DesertDay key={sel} run={run} date={sel} />
        </div>
      )}
      {byHand(active).length === 0 ? (
        !hallMode && <p className="small muted">Die Gebetszeiten stehen oben. Weitere Gewohnheiten wählst du unter „Mehr“.</p>
      ) : resting(sel) ? (
        <p className="small muted habits-rest">
          {hallMode
            ? 'Sonntagsruhe. Die übrigen Gewohnheiten ruhen am Sonntag.'
            : 'Sonntagsruhe. Am Sonntag stehen keine Gewohnheiten an.'}
        </p>
      ) : (
        groups
          .filter(([, list]) => list.length > 0)
          .map(([title, list]) => (
            <div key={title} className="wa-group">
              <h5>{title}</h5>
              {list.map(tick)}
            </div>
          ))
      )}
    </section>
    <details className="habits-week">
    <summary className="habits-week-title">Wochenübersicht</summary>
    <div className="panel habits-panel">
      <table className="habits">
        <thead>
          <tr>
            <th scope="col">
              <span className="visually-hidden">Gewohnheit</span>
            </th>
            {week.map((k) => (
              <th
                key={k}
                scope="col"
                className={
                  [
                    k === today ? 'is-today' : '',
                    hallMode && run && !isInRun(run, k) && active.length === 0 ? 'is-outside' : '',
                    resting(k) ? 'is-rest' : '',
                  ]
                    .join(' ')
                    .trim() || undefined
                }
              >
                {WEEKDAY_SHORT[weekdayOf(k)]}
              </th>
            ))}
          </tr>
        </thead>
        {hallMode && run && <DesertWeekRows run={run} week={week} date={date} />}
        {focus.length > 0 && (
          <tbody className="habit-group habit-group-focus">
            <tr className="group-row">
              <th scope="rowgroup" colSpan={8}>
                <span className="focus-group-title">
                  <StarIcon filled size={14} /> Im Blick
                </span>
              </th>
            </tr>
            {focus.map(row)}
          </tbody>
        )}
        {RHYTHM_ORDER.map((rhythm) => {
          const group = habitsOfRhythm(rest, rhythm);
          if (group.length === 0) return null;
          return (
            <tbody key={rhythm} className={`habit-group habit-group-${rhythm}`}>
              <tr className="group-row">
                <th scope="rowgroup" colSpan={8}>
                  {GROUP_TITLE[rhythm]}
                </th>
              </tr>
              {group.map(row)}
            </tbody>
          );
        })}
      </table>
    </div>
    </details>
    </>
  );
}
