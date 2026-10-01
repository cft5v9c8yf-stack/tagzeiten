import { WINTER_ARC_ITEMS, WINTER_ARC_MONTHLY, WINTER_ARC_WEEKLY } from '../../content/winterArc';
import { useProfile, useStore } from '../../data/hooks';
import { houseHas } from '../../domain/house';
import { formatShort, type DateKey } from '../../domain/dates';
import { activeRun, appliesOn, dayOf, isInRun, isOn, monthOf, positionOf, servedIn, weekOf } from '../../domain/winterArc';

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
  const settings = profile.winterArcSettings;
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
            Streithalle
          </th>
        </tr>
        {WINTER_ARC_ITEMS.filter(
          (it) => houseHas(profile.house, it.needs) && isOn(profile.winterArcSettings, it.id),
        ).map((it) => {
          const text = it.text(settings.times);
          return (
            <tr key={it.id}>
              {name(text)}
              {week.map((k) => {
                // Before the start or after the end: a quiet dot in the width of a day, nothing to tick.
                if (!isInRun(run, k))
                  return (
                    <td key={k} className="wa-outside" aria-label="außerhalb der Runde">
                      <span className="cell-void" aria-hidden="true" />
                    </td>
                  );
                if (!appliesOn(settings, it.id, k))
                  return (
                    <td key={k} className="wa-off">
                      {it.off}
                    </td>
                  );
                const on = !!dayOf(profile.winterArc, run.id, k)?.checks[it.id];
                return (
                  <td key={k}>
                    <button
                      type="button"
                      className={`cell${k === today ? ' today' : ''}${k > today ? ' future' : ''}`}
                      aria-pressed={on}
                      disabled={k > today}
                      aria-label={`${text}, ${formatShort(k)}`}
                      onClick={() => store.toggleWinterArcCheck(run.id, k, it.id)}
                    />
                  </td>
                );
              })}
            </tr>
          );
        })}
        {roundWeek &&
          WINTER_ARC_WEEKLY.filter(
            (it) => houseHas(profile.house, it.needs) && isOn(profile.winterArcSettings, it.id),
          ).map((it) => {
            const on = !!weekly[it.id];
            return (
              <tr key={it.id}>
                {name(it.text)}
                <td colSpan={7} className="period-cell">
                  <button
                    type="button"
                    className="pill"
                    aria-pressed={on}
                    aria-label={`${it.text}, Woche ${roundWeek} der Runde`}
                    onClick={() => store.toggleWinterArcWeekly(run.id, roundWeek, it.id)}
                  >
                    {on ? `✓ Woche ${roundWeek}` : `Woche ${roundWeek}`}
                  </button>
                </td>
              </tr>
            );
          })}
        {inRun && isOn(settings, 'serve') && (
          <tr>
            {name(WINTER_ARC_MONTHLY)}
            <td colSpan={7} className="period-cell">
              <button
                type="button"
                className="pill"
                aria-pressed={servedIn(profile.winterArc, run.id, month)}
                aria-label={`${WINTER_ARC_MONTHLY}, diesen Monat`}
                onClick={() => store.toggleWinterArcServed(run.id, month)}
              >
                {servedIn(profile.winterArc, run.id, month) ? '✓ diesen Monat' : 'diesen Monat'}
              </button>
            </td>
          </tr>
        )}
      </tbody>
    </>
  );
}
