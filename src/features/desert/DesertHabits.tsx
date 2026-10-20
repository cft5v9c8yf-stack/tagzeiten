import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useDayLookup, useProfile, useStore } from '../../data/hooks';
import { formatShort, type DateKey } from '../../domain/dates';
import { canExamine, canWrite, habitsOf, listedOn, meantFor } from '../../domain/desert';
import { EXAMEN_SLUG } from './DesertExamen';
import { THANKS_SLUG } from './DesertThanks';
import { canToggle, followOf, isDoneInPeriod, isDoneOn, isPerDay, keptByOrder } from '../../domain/habits';
import { READING_HABIT } from '../../content/habits';
import type { Habit } from '../../domain/model';
import { isInRun, type WinterArcRun } from '../../domain/winterArc';
import { Tick } from '../../ui/Tick';
import { DesertChoice } from './DesertChoice';
import { WithInfo } from './DesertInfo';

const periodNote = (h: Habit) => (h.rhythm === 'weekly' ? 'diese Woche' : h.rhythm === 'monthly' ? 'diesen Monat' : undefined);

/** The quiet line under a habit of the day: its period, the reading plan, or that the orders kept it. */
function noteOf(h: Habit, date: DateKey, lookup: ReturnType<typeof useDayLookup>): string | undefined {
  if (h.id === READING_HABIT) return 'nach dem Leseplan';
  if (keptByOrder(h, lookup(date))) return followOf(h) === 'thanks' ? 'im Nachtgebet notiert' : 'aus dem Ablauf';
  return periodNote(h);
}

/**
 * The habits of the Wüstenzeit to tick on one day: daily ones on their days
 * (Advent ones in Advent), weekly ones all week until ticked. Each with the "i";
 * the thanks can also be written down in the Gebetskammer, or on paper.
 */
export function DesertDay({ run, date }: { run: WinterArcRun; date: DateKey }) {
  const store = useStore();
  const profile = useProfile();
  const lookup = useDayLookup();
  const navigate = useNavigate();
  const location = useLocation();
  const today = store.today();
  // The page of the thanks or of the examination; done, it ticks the habit and leads back here.
  const open = (h: Habit, page: string) => {
    const query = new URLSearchParams({ gewohnheit: h.id, tag: date, zurueck: location.pathname + location.search });
    navigate(`/arena/${page}?${query}`);
  };
  if (!isInRun(run, date)) return <p className="small muted">An diesem Tag läuft keine Wüstenzeit.</p>;
  const habits = habitsOf(run, profile);
  const listed = habits.filter((h) => listedOn(h, date, lookup));
  if (!habits.length) return <p className="small muted">Noch keine Gewohnheit gewählt.</p>;
  if (!listed.length) return <p className="small muted">An diesem Tag steht nichts an.</p>;
  return (
    <>
      {listed.map((h) => (
        <WithInfo key={h.id} habit={h}>
          <Tick
            checked={isPerDay(h) ? isDoneOn(h, lookup(date)) : isDoneInPeriod(h, date, lookup)}
            disabled={!canToggle(h, date, today, lookup)}
            note={noteOf(h, date, lookup)}
            onToggle={() => store.toggleHabit(date, h)}
          >
            {h.name}
          </Tick>
          {canWrite(h) && date <= today && (
            <button type="button" className="wa-row-action" onClick={() => open(h, THANKS_SLUG)}>
              Aufschreiben
            </button>
          )}
          {canExamine(h) && date <= today && (
            <button type="button" className="wa-row-action" onClick={() => open(h, EXAMEN_SLUG)}>
              Beten
            </button>
          )}
        </WithInfo>
      ))}
    </>
  );
}

/**
 * The habits of the Wüstenzeit in the grid of the week under "Heute": the same ticks as everywhere.
 * `readOnly` shows the same marks to read only (the overview in the Arena): nothing to tap.
 */
export function DesertWeekRows({
  run,
  week,
  date,
  readOnly = false,
}: {
  run: WinterArcRun;
  week: readonly DateKey[];
  date: DateKey;
  readOnly?: boolean;
}) {
  const store = useStore();
  const profile = useProfile();
  const lookup = useDayLookup();
  const today = store.today();
  const habits = habitsOf(run, profile);
  if (!habits.length) return null;
  const name = (h: Habit) => (
    <th scope="row">
      <span className="habit-name">{h.name}</span>
    </th>
  );
  return (
    <tbody className="habit-group habit-group-desert">
      <tr className="group-row">
        <th scope="rowgroup" colSpan={8}>
          Wüstenzeit
        </th>
      </tr>
      {habits.map((h) => {
        if (isPerDay(h)) {
          return (
            <tr key={h.id}>
              {name(h)}
              {week.map((k) => {
                // Outside the Wüstenzeit: a quiet dot in the width of a day, nothing to tick.
                if (!isInRun(run, k))
                  return (
                    <td key={k} className="wa-outside" aria-label="außerhalb der Wüstenzeit">
                      <span className="cell-void" aria-hidden="true" />
                    </td>
                  );
                if (!meantFor(h, k))
                  return (
                    <td key={k} className="wa-off">
                      –
                    </td>
                  );
                const on = isDoneOn(h, lookup(k));
                if (readOnly)
                  return (
                    <td key={k}>
                      <span
                        role="img"
                        className={`cell${k === today ? ' today' : ''}${k > today ? ' future' : ''}${on ? ' is-on' : ''}`}
                        aria-label={`${h.name}, ${formatShort(k)}: ${on ? 'abgehakt' : k > today ? 'liegt noch vor dir' : 'nicht abgehakt'}`}
                      />
                    </td>
                  );
                return (
                  <td key={k}>
                    <button
                      type="button"
                      className={`cell${k === today ? ' today' : ''}${k > today ? ' future' : ''}`}
                      aria-pressed={on}
                      disabled={!canToggle(h, k, today, lookup)}
                      aria-label={`${h.name}, ${formatShort(k)}`}
                      onClick={() => store.toggleHabit(k, h)}
                    />
                  </td>
                );
              })}
            </tr>
          );
        }
        const on = isDoneInPeriod(h, date, lookup);
        const period = periodNote(h)!;
        return (
          <tr key={h.id}>
            {name(h)}
            <td colSpan={7} className="period-cell">
              {readOnly ? (
                <span
                  role="img"
                  className={`pill${on ? ' is-on' : ''}`}
                  aria-label={`${h.name}, ${period}: ${on ? 'abgehakt' : 'nicht abgehakt'}`}
                >
                  {on ? `✓ ${period}` : period}
                </span>
              ) : (
              <button
                type="button"
                className="pill"
                aria-pressed={on}
                aria-label={`${h.name}, ${period}`}
                disabled={!isInRun(run, date) || !canToggle(h, date, today, lookup)}
                onClick={() => store.toggleHabit(date, h)}
              >
                {on ? `✓ ${period}` : period}
              </button>
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}

/**
 * Under "Heute": the habits of the Wüstenzeit are chosen here, folded, with the choice of the packages,
 * the further ones and the user's own (the same as under "Mehr"). Open while none is chosen yet.
 */
export function DesertCare({ run }: { run: WinterArcRun }) {
  // Open at first while nothing is chosen; it stays as the person leaves it.
  const [open, setOpen] = useState(() => !(run.habits ?? []).length);
  return (
    <details className="wa-settings desert-care" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>Gewohnheiten dieser Wüstenzeit anpassen</summary>
      <DesertChoice run={run} level={6} />
    </details>
  );
}
