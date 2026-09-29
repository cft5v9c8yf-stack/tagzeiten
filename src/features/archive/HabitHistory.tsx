import { useDayLookup, useProfile, useStore } from '../../data/hooks';
import { formatShort, MONTH_LONG } from '../../domain/dates';
import { habitMonths, habitWeeks, HISTORY_WEEKS } from '../../domain/habitHistory';
import { habitsOfRhythm, RHYTHM_ORDER } from '../../domain/habits';
import type { Habit, Rhythm } from '../../domain/model';
import { Section } from '../../ui/Section';

const GROUP_TITLE: Record<Rhythm, string> = { daily: 'Täglich', weekly: 'Wöchentlich', monthly: 'Monatlich' };

/** A daily habit: one small bar per week, as high as the days it was kept, with the count under it. */
function DailyRow({ habit, today }: { habit: Habit; today: string }) {
  const weeks = habitWeeks(habit, today, useDayLookup());
  return (
    <li className="hh-row">
      <span className="hh-name">{habit.name}</span>
      <ol className="hh-cells" aria-label={`${habit.name}, die letzten ${HISTORY_WEEKS} Wochen`}>
        {weeks.map((w) => (
          <li key={w.monday} className="hh-cell">
            <span className="hh-bar" aria-hidden="true">
              <span className="hh-fill" style={{ height: `${(w.done / 7) * 100}%` }} />
            </span>
            <span className="hh-count" aria-hidden="true">
              {w.done}
            </span>
            <span className="visually-hidden">
              Woche ab {formatShort(w.monday)}: an {w.done} von {w.days} Tagen
              {w.days < 7 ? ' bisher' : ''}
            </span>
          </li>
        ))}
      </ol>
    </li>
  );
}

/** A weekly habit: one mark per week, filled when it was kept that week. */
function WeeklyRow({ habit, today }: { habit: Habit; today: string }) {
  const weeks = habitWeeks(habit, today, useDayLookup());
  return (
    <li className="hh-row">
      <span className="hh-name">{habit.name}</span>
      <ol className="hh-cells" aria-label={`${habit.name}, die letzten ${HISTORY_WEEKS} Wochen`}>
        {weeks.map((w) => (
          <li key={w.monday} className="hh-cell">
            <span className={`hh-mark${w.done ? ' is-done' : ''}`} aria-hidden="true" />
            <span className="visually-hidden">
              Woche ab {formatShort(w.monday)}: {w.done ? 'gehalten' : 'nicht eingetragen'}
            </span>
          </li>
        ))}
      </ol>
    </li>
  );
}

/** A monthly habit: this month and the two before. */
function MonthlyRow({ habit, today }: { habit: Habit; today: string }) {
  const months = habitMonths(habit, today, useDayLookup());
  return (
    <li className="hh-row">
      <span className="hh-name">{habit.name}</span>
      <ol className="hh-cells hh-months" aria-label={`${habit.name}, die letzten drei Monate`}>
        {months.map((m) => {
          const name = MONTH_LONG[Number(m.month.slice(5, 7)) - 1]!;
          return (
            <li key={m.month} className="hh-cell">
              <span className={`hh-mark${m.done ? ' is-done' : ''}`} aria-hidden="true" />
              <span className="hh-count" aria-hidden="true">
                {name.slice(0, 3)}
              </span>
              <span className="visually-hidden">
                {name}: {m.done ? 'gehalten' : 'nicht eingetragen'}
              </span>
            </li>
          );
        })}
      </ol>
    </li>
  );
}

const ROW: Record<Rhythm, typeof DailyRow> = { daily: DailyRow, weekly: WeeklyRow, monthly: MonthlyRow };

/**
 * How the habits were kept in the last eight weeks: counts per week, neutral
 * colours, empty weeks grey. Documented, not assessed – no percentages, no
 * trend, no streak (rules 4 and 5). Switched on under Darstellung.
 */
export function HabitHistory() {
  const store = useStore();
  const profile = useProfile();
  const today = store.today();
  const active = profile.habits.filter((h) => h.active);
  return (
    <Section id="review.habits" title="Gewohnheiten" level={3}>
      <p className="small muted hh-note">
        Die letzten {HISTORY_WEEKS} Wochen, die neueste rechts. Festgehalten, nicht bewertet.
      </p>
      {active.length === 0 ? (
        <p className="small muted">Keine Gewohnheit eingeschaltet.</p>
      ) : (
        RHYTHM_ORDER.map((r) => {
          const list = habitsOfRhythm(active, r);
          if (!list.length) return null;
          const Row = ROW[r];
          return (
            <div key={r} className="hh-group">
              <h4 className="hh-group-title">{GROUP_TITLE[r]}</h4>
              <ul className="hh-list">
                {list.map((h) => (
                  <Row key={h.id} habit={h} today={today} />
                ))}
              </ul>
            </div>
          );
        })
      )}
    </Section>
  );
}
