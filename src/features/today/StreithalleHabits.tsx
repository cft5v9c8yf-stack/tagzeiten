import { useState } from 'react';
import { JournalEntry } from '../arena/WinterArcDashboard';
import { WINTER_ARC_BLOCK_LABEL } from '../../content/winterArc';
import { Tick } from '../../ui/Tick';
import { useProfile, useStore } from '../../data/hooks';
import { formatShort, type DateKey } from '../../domain/dates';
import {
  activeRun,
  BLOCKS,
  dayOf,
  isInRun,
  monthlyDone,
  monthOf,
  pointApplies,
  positionOf,
  shownPoints,
  weekOf,
} from '../../domain/winterArc';
import { pointsOf } from '../../domain/winterArcPoints';

/**
 * The points of the Streithalle (Winter Arc) among the habits of "Heute", while
 * a round is under way. One tick only: it is the same as in the Streithalle.
 */
export function StreithalleHabits({ week, date }: { week: readonly DateKey[]; date: DateKey }) {
  const store = useStore();
  const profile = useProfile();
  const run = activeRun(profile.winterArc);
  if (!run || !week.some((d) => isInRun(run, d))) return null;
  const today = store.today();
  const points = shownPoints(pointsOf(run, profile.winterArcSettings), profile.house);
  // The weekly standard belongs to the week of the round the shown day lies in.
  const inRun = isInRun(run, date);
  const roundWeek = inRun ? positionOf(run, date).week : undefined;
  const weekly = roundWeek ? (weekOf(profile.winterArc, run.id, roundWeek)?.weeklyChecks ?? {}) : {};
  const month = monthOf(date);
  const name = (text: string) => (
    <th scope="row">
      <span className="habit-name">{text}</span>
    </th>
  );
  return (
    <>
      <tbody className="habit-group habit-group-streithalle">
        <tr className="group-row">
          <th scope="rowgroup" colSpan={8}>
            Täglich
          </th>
        </tr>
        {points
          .filter((p) => p.rhythm === 'daily')
          .map((p) => (
            <tr key={p.id}>
              {name(p.text)}
              {week.map((k) => {
                // Before the start or after the end: a quiet dot in the width of a day, nothing to tick.
                if (!isInRun(run, k))
                  return (
                    <td key={k} className="wa-outside" aria-label="außerhalb der Runde">
                      <span className="cell-void" aria-hidden="true" />
                    </td>
                  );
                if (!pointApplies(p, k))
                  return (
                    <td key={k} className="wa-off">
                      {p.offMark ?? '–'}
                    </td>
                  );
                const on = !!dayOf(profile.winterArc, run.id, k)?.checks[p.id];
                return (
                  <td key={k}>
                    <button
                      type="button"
                      className={`cell${k === today ? ' today' : ''}${k > today ? ' future' : ''}`}
                      aria-pressed={on}
                      disabled={k > today}
                      aria-label={`${p.text}, ${formatShort(k)}`}
                      onClick={() => store.toggleWinterArcCheck(run.id, k, p.id)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
      </tbody>
      <tbody className="habit-group habit-group-streithalle">
        <tr className="group-row">
          <th scope="rowgroup" colSpan={8}>
            Woche und Monat
          </th>
        </tr>
        {roundWeek &&
          points
            .filter((p) => p.rhythm === 'weekly')
            .map((p) => {
              const on = !!weekly[p.id];
              return (
                <tr key={p.id}>
                  {name(p.text)}
                  <td colSpan={7} className="period-cell">
                    <button
                      type="button"
                      className="pill"
                      aria-pressed={on}
                      aria-label={`${p.text}, Woche ${roundWeek} der Runde`}
                      onClick={() => store.toggleWinterArcWeekly(run.id, roundWeek, p.id)}
                    >
                      {on ? `✓ Woche ${roundWeek}` : `Woche ${roundWeek}`}
                    </button>
                  </td>
                </tr>
              );
            })}
        {inRun &&
          points
            .filter((p) => p.rhythm === 'monthly')
            .map((p) => {
              const on = monthlyDone(profile.winterArc, run.id, month, p.id);
              return (
                <tr key={p.id}>
                  {name(p.text)}
                  <td colSpan={7} className="period-cell">
                    <button
                      type="button"
                      className="pill"
                      aria-pressed={on}
                      aria-label={`${p.text}, diesen Monat`}
                      onClick={() => store.toggleWinterArcMonthly(run.id, month, p.id)}
                    >
                      {on ? '✓ diesen Monat' : 'diesen Monat'}
                    </button>
                  </td>
                </tr>
              );
            })}
      </tbody>
    </>
  );
}

/**
 * The day's points of the Streithalle as a list to tick, for "Heute" in its mode:
 * the daily ones by the blocks of the day, then the week of the round and the month.
 */
export function StreithalleDay({ date }: { date: DateKey }) {
  const store = useStore();
  const [writing, setWriting] = useState(false);
  const profile = useProfile();
  const run = activeRun(profile.winterArc);
  if (!run) return null;
  const today = store.today();
  const points = shownPoints(pointsOf(run, profile.winterArcSettings), profile.house);
  const inRun = isInRun(run, date);
  const checks = dayOf(profile.winterArc, run.id, date)?.checks ?? {};
  const roundWeek = inRun ? positionOf(run, date).week : undefined;
  const weekly = roundWeek ? (weekOf(profile.winterArc, run.id, roundWeek)?.weeklyChecks ?? {}) : {};
  const month = monthOf(date);
  if (!inRun) return <p className="small muted">An diesem Tag läuft keine Runde.</p>;
  const periodic = points.filter((p) => p.rhythm !== 'daily');
  return (
    <>
      {BLOCKS.map((b) => {
        const list = points.filter((p) => p.rhythm === 'daily' && (p.block ?? 'morning') === b);
        if (!list.length) return null;
        return (
          <div key={b} className="wa-group">
            <h5>{WINTER_ARC_BLOCK_LABEL[b]}</h5>
            {list.map((p) =>
              pointApplies(p, date) ? (
                <div key={p.id} className="wa-row">
                  <div className="wa-row-line">
                    <Tick
                      checked={!!checks[p.id]}
                      disabled={date > today}
                      onToggle={() => store.toggleWinterArcCheck(run.id, date, p.id)}
                    >
                      {p.text}
                    </Tick>
                    {p.id === 'journal' && date <= today && (
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
                  {p.id === 'journal' && writing && date <= today && <JournalEntry date={date} />}
                </div>
              ) : (
                <p key={p.id} className="wa-tick is-off">
                  <span className="wa-off-mark">{p.offMark ?? '–'}</span>
                  <span className="wa-tick-text">{p.text}</span>
                </p>
              ),
            )}
          </div>
        );
      })}
      {periodic.length > 0 && (
        <div className="wa-group">
          <h5>Woche und Monat</h5>
          {periodic.map((p) =>
            p.rhythm === 'weekly' ? (
              <Tick
                key={p.id}
                checked={!!weekly[p.id]}
                note={`Woche ${roundWeek} der Runde`}
                onToggle={() => store.toggleWinterArcWeekly(run.id, roundWeek!, p.id)}
              >
                {p.text}
              </Tick>
            ) : (
              <Tick
                key={p.id}
                checked={monthlyDone(profile.winterArc, run.id, month, p.id)}
                note="diesen Monat"
                onToggle={() => store.toggleWinterArcMonthly(run.id, month, p.id)}
              >
                {p.text}
              </Tick>
            ),
          )}
        </div>
      )}
      {!points.length && <p className="small muted">In der Liste der Runde steht noch keine Gewohnheit.</p>}
    </>
  );
}
