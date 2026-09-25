import { useDayLookup, useProfile, useStore } from '../../data/hooks';
import { addDays, formatShort, mondayOf, WEEKDAY_SHORT, weekdayOf, type DateKey } from '../../domain/dates';
import { canToggle, habitsOfRhythm, isDoneInPeriod, isDoneOn, RHYTHM_ORDER, toggleHabit } from '../../domain/habits';
import type { Habit, Rhythm } from '../../domain/model';
import { StarIcon } from '../../ui/Icons';

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

/**
 * This week's habits: daily ones as seven dots Mo–So, weekly and monthly ones
 * as one mark for the period. No streaks, no counting (rule 4).
 */
export function HabitsWeek({ date }: { date: DateKey }) {
  const store = useStore();
  const profile = useProfile();
  const lookup = useDayLookup();
  const today = store.today();
  const week = Array.from({ length: 7 }, (_, i) => addDays(mondayOf(date), i));
  const active = profile.habits.filter((h) => h.active);

  const toggle = (h: Habit, k: DateKey) => store.updateDay(k, (d) => toggleHabit(d, h), { immediate: true });

  if (active.length === 0) {
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
        {RHYTHM_ORDER.map((rhythm) => {
          const group = habitsOfRhythm(active, rhythm);
          if (group.length === 0) return null;
          return (
            <tbody key={rhythm} className={`habit-group habit-group-${rhythm}`}>
              <tr className="group-row">
                <th scope="rowgroup" colSpan={8}>
                  {GROUP_TITLE[rhythm]}
                </th>
              </tr>
              {group.map((h) => {
                if (rhythm === 'daily') {
                  return (
                    <tr key={h.id}>
                      <HabitName habit={h} note={h.auto ? 'aus dem Ablauf' : undefined} />
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
                const period = rhythm === 'weekly' ? 'diese Woche' : 'diesen Monat';
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
              })}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}
