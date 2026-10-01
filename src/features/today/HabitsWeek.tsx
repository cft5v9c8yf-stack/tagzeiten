import { useDayLookup, useProfile, useStore } from '../../data/hooks';
import { addDays, formatShort, mondayOf, WEEKDAY_SHORT, weekdayOf, type DateKey } from '../../domain/dates';
import { canToggle, fitsHouse, daysDoneInWeek, habitsOfRhythm, isDoneInPeriod, isDoneOn, isPerDay, RHYTHM_ORDER } from '../../domain/habits';
import { READING_HABIT } from '../../content/habits';
import type { Habit, Rhythm } from '../../domain/model';
import { activeRun } from '../../domain/winterArc';
import { StarIcon } from '../../ui/Icons';
import { StreithalleHabits } from './StreithalleHabits';

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
  const active = profile.habits.filter((h) => h.active && fitsHouse(h, profile.house));

  const toggle = (h: Habit, k: DateKey) => store.toggleHabit(k, h);

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

  if (active.length === 0 && !activeRun(profile.winterArc)) {
    return <p className="empty">Keine Gewohnheiten ausgewählt. Unter „Mehr“ kannst du welche wählen oder anlegen.</p>;
  }

  return (
    <div className="panel habits-panel">
      <table className="habits">
        <thead>
          <tr>
            <th scope="col">
              <span className="visually-hidden">Gewohnheit</span>
            </th>
            {week.map((k) => (
              <th key={k} scope="col" className={k === today ? 'is-today' : undefined}>
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
  );
}
