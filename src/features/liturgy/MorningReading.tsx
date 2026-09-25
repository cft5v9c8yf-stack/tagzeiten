import { useEffect, useId } from 'react';
import { FIELDS } from '../../content/fields';
import {
  COLOR_CODE,
  DOUBLE_QUESTION_NOTE,
  HARD_PASSAGES_NOTE,
  MARGIN_MARKS,
  METHOD_CREDIT,
  READING_PASSES,
  READING_RUBRICS,
  SALVATION_HISTORY_NOTE,
} from '../../content/method';
import type { Part } from '../../content/orders';
import { SEVEN_QUESTIONS } from '../../content/questions';
import { useDay, useStore, useStoreVersion } from '../../data/hooks';
import type { DateKey } from '../../domain/dates';
import { getPlan, portionLabel, portionUrl } from '../../domain/readingPlan';
import { DayField } from '../../ui/DayField';
import { Rubric } from '../../ui/PrayerText';
import type { PartContext } from './OrderPart';

/** Today's portions with links. Shared with the Today page. */
export function ReadingRefs({ date, large = true }: { date: DateKey; large?: boolean }) {
  const store = useStore();
  useStoreVersion();
  const { reading } = store.readingFor(date);
  const plan = getPlan(reading.planId);
  return (
    <div className={`reading-refs${large ? ' large' : ''}`}>
      {plan.tracks.map((t) => {
        const i = reading.portions[t.def.id];
        const p = i === undefined ? undefined : t.portions[i];
        return (
          <div key={t.def.id} className="ref">
            <span className="track">{t.def.label}</span>
            {p ? (
              <a href={portionUrl(t, p)} target="_blank" rel="noopener noreferrer">
                {portionLabel(t, p)}
              </a>
            ) : (
              '—'
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Checkbox that marks the reading as read and moves the plan on. */
export function ReadCheckbox({ date }: { date: DateKey }) {
  const store = useStore();
  useStoreVersion();
  const { reading, assigned } = store.readingFor(date);
  const isToday = date === store.today();
  if (!assigned && !isToday) return <p className="small muted">An diesem Tag wurde keine Lesung eingetragen.</p>;
  return (
    <label className="check">
      <input type="checkbox" checked={reading.done} onChange={(e) => store.setReadingDone(date, e.target.checked)} />
      Gelesen – Plan weiterrücken
    </label>
  );
}

function QuestionSelect({ date }: { date: DateKey }) {
  const store = useStore();
  const day = useDay(date);
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{FIELDS['morning.questionNo']?.label}</label>
      <select
        id={id}
        value={day.morning.questionNo ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          store.updateDay(date, (d) => {
            const morning = { ...d.morning };
            if (v === '') delete morning.questionNo;
            else morning.questionNo = Number(v);
            return { ...d, morning };
          }, { immediate: true });
        }}
      >
        <option value="">— eine wählen, je nach Text —</option>
        {SEVEN_QUESTIONS.map((q, i) => (
          <option key={i} value={i}>
            {i + 1}. {q}
          </option>
        ))}
      </select>
    </div>
  );
}

function MethodHelp() {
  return (
    <details className="fold">
      <summary>Dreimal lesen, Farbcode, Randzeichen</summary>
      <ol className="plain-list">
        {READING_PASSES.map(([t, d]) => (
          <li key={t}>
            <b>{t}:</b> {d}
          </li>
        ))}
      </ol>
      <table className="color-code">
        <tbody>
          {COLOR_CODE.map((c) => (
            <tr key={c.color}>
              <th scope="row">{c.color}</th>
              <td>{c.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="plain-list">
        {MARGIN_MARKS.map((m) => (
          <li key={m.mark}>
            <b className="mark-sign">{m.mark}</b> {m.meaning}
          </li>
        ))}
      </ul>
      <p className="small">{HARD_PASSAGES_NOTE}</p>
      <p className="small muted">{METHOD_CREDIT}</p>
    </details>
  );
}

export function MorningReading({ part, ctx }: { part: Part; ctx: PartContext }) {
  const store = useStore();
  const full = ctx.form === 'full';

  // Today receives its portion when the reading is first shown.
  useEffect(() => {
    if (ctx.date === store.today()) store.ensureTodayReading();
  }, [store, ctx.date]);

  return (
    <>
      <ReadingRefs date={ctx.date} />
      <Rubric>{full ? READING_RUBRICS.threeTimes : 'Einmal durchlesen, einen Vers auswählen, dann die Doppelfrage.'}</Rubric>
      <p className="small muted">{READING_RUBRICS.paper}</p>
      {full && <p className="small muted">{READING_RUBRICS.restart}</p>}
      <ReadCheckbox date={ctx.date} />
      {full && <MethodHelp />}
      {(part.fields ?? []).map((f) => {
        if (f === 'morning.questionNo') return <QuestionSelect key={f} date={ctx.date} />;
        const extra =
          f === 'morning.aboutGod' ? (
            <p key={`${f}-note`} className="small muted">
              {DOUBLE_QUESTION_NOTE}
            </p>
          ) : f === 'morning.salvationHistory' ? (
            <p key={`${f}-note`} className="small muted">
              {SALVATION_HISTORY_NOTE}
            </p>
          ) : null;
        return (
          <div key={f}>
            {extra}
            <DayField date={ctx.date} path={f} />
          </div>
        );
      })}
    </>
  );
}
