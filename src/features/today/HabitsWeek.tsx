import { useState } from 'react';
import { useDayLookup, useProfile, useStore } from '../../data/hooks';
import { addDays, formatLong, formatShort, fromKey, mondayOf, WEEKDAY_SHORT, weekdayOf, type DateKey } from '../../domain/dates';
import { canToggle, fitsHouse, daysDoneInWeek, habitsOfRhythm, isDoneInPeriod, isDoneOn, isPerDay, RHYTHM_ORDER } from '../../domain/habits';
import { READING_HABIT } from '../../content/habits';
import type { Habit, Rhythm } from '../../domain/model';
import { activeRun, hallModeIn, isInRun } from '../../domain/winterArc';
import { StarIcon } from '../../ui/Icons';
import { StreithalleDay, StreithalleHabits } from './StreithalleHabits';
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
  // While a round of the Winter Arc runs in this week, "Heute" is in its mode: its habits
  // stand in place of the usual ones, which keep their ticks and come back afterwards.
  const hallMode = hallModeIn(profile.winterArc, date);
  const run = activeRun(profile.winterArc);
  const active = hallMode ? [] : profile.habits.filter((h) => h.active && fitsHouse(h, profile.house));

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
  const sel = picked && week.includes(picked) ? picked : date;
  const dayTitle = sel === today ? 'Heute' : formatLong(sel);
  // Those from the order (Stille Zeit, Vesper, Nachtgebet) stand above as its tiles; the list
  // keeps what is ticked by hand. Weekly and monthly ones already kept move to the end.
  const listed = rest.filter((h) => !h.auto);
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
    ['Im Blick', focus],
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
      {hallMode ? (
        <StreithalleDay key={sel} date={sel} />
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
                  [k === today ? 'is-today' : '', hallMode && run && !isInRun(run, k) ? 'is-outside' : '']
                    .join(' ')
                    .trim() || undefined
                }
              >
                {WEEKDAY_SHORT[weekdayOf(k)]}
              </th>
            ))}
          </tr>
        </thead>
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
        <StreithalleHabits week={week} date={date} />
      </table>
    </div>
    </details>
    </>
  );
}
