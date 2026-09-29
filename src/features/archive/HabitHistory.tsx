import { useDayLookup, useProfile, useStore } from '../../data/hooks';
import { addDays, formatShort, mondayOf, MONTH_LONG } from '../../domain/dates';
import { habitMonths, habitWeeks, HISTORY_WEEKS } from '../../domain/habitHistory';
import { habitsOfRhythm, RHYTHM_ORDER } from '../../domain/habits';
import type { Habit, Rhythm } from '../../domain/model';
import { Section } from '../../ui/Section';

const GROUP_TITLE: Record<Rhythm, string> = { daily: 'Täglich', weekly: 'Wöchentlich', monthly: 'Monatlich' };

const CHART_W = 176;
const CHART_H = 34;
const PAD = 3;

/**
 * A daily habit: its course over the last completed weeks as a line, 7 days at
 * the top, 0 at the bottom, without numbers or scale. The running week is left out, so
 * a week just begun does not look like a drop.
 */
function DailyRow({ habit, today }: { habit: Habit; today: string }) {
  const weeks = habitWeeks(habit, addDays(mondayOf(today), -1), useDayLookup());
  const step = (CHART_W - 2 * PAD) / (weeks.length - 1);
  const pts = weeks.map((w, i) => [PAD + i * step, PAD + (1 - w.done / 7) * (CHART_H - 2 * PAD)] as const);
  const line = (list: readonly (readonly [number, number])[]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [lx, ly] = pts.at(-1)!;
  return (
    <li className="hh-row">
      <span className="hh-name">{habit.name}</span>
      <span className="hh-chart">
        <svg width={CHART_W} height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`} aria-hidden="true">
          <line className="hh-guide" x1={0} x2={CHART_W} y1={PAD} y2={PAD} />
          <line className="hh-guide" x1={0} x2={CHART_W} y1={CHART_H - PAD} y2={CHART_H - PAD} />
          <polyline className="hh-line" points={line(pts)} />
          <circle className="hh-dot" cx={lx} cy={ly} r={2.5} />
        </svg>
      </span>
      <ol className="visually-hidden" aria-label={`${habit.name}, die letzten ${HISTORY_WEEKS} Wochen`}>
        {weeks.map((w) => (
          <li key={w.monday}>
            Woche ab {formatShort(w.monday)}: an {w.done} von 7 Tagen
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
        Die letzten {HISTORY_WEEKS} Wochen, die neueste rechts. Täglich als Verlauf über die abgeschlossenen Wochen: oben alle sieben Tage, unten keiner. Festgehalten, nicht bewertet.
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
