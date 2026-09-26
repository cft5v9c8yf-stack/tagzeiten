import { RUBRICS } from '../../content/orders';
import { useDay, useStore } from '../../data/hooks';
import type { DateKey } from '../../domain/dates';
import { THREE_KEYS, type Carry, type Mark } from '../../domain/model';
import { CARRY_LABEL, MARK_LABEL, MARK_SYMBOL, THREE_LABEL, canCarry, setCarry, setMark } from '../../domain/review';
import { Choice } from '../../ui/Choice';
import { Note, Rubric } from '../../ui/PrayerText';

const MARKS: Mark[] = ['plus', 'tilde', 'minus'];
const CARRIES: Carry[] = ['again', 'drop'];

/**
 * Evening review of the three things: one sign each, no comment.
 * Accountability, not confession (rule 3) – the examination follows separately.
 */
export function Review({ date }: { date: DateKey }) {
  const store = useStore();
  const day = useDay(date);
  const any = THREE_KEYS.some((k) => day.morning.three[k]);

  return (
    <>
      <Rubric>{RUBRICS.review}</Rubric>
      {!any && <p className="muted">Heute morgen wurden keine drei Dinge festgelegt. Dann gibt es hier nichts abzulegen.</p>}
      {any && (
        <>
          <p className="small muted">{RUBRICS.reviewMarks}</p>
          <div className="review">
            {THREE_KEYS.map((k) => {
              const text = day.morning.three[k];
              const mark = day.evening.marks[k];
              return (
                <div key={k} className="review-item">
                  <div className="review-key">{THREE_LABEL[k]}</div>
                  <div className="review-text">{text || <span className="muted">heute morgen nicht festgelegt</span>}</div>
                  {text && (
                    <Choice
                      label={`Rückschau ${THREE_LABEL[k]}`}
                      className="marks"
                      value={mark}
                      options={MARKS.map((m) => ({ value: m, label: MARK_SYMBOL[m], title: MARK_LABEL[m] }))}
                      onChange={(m) => store.updateDay(date, (d) => ({ ...d, evening: setMark(d.evening, k, m) }), { immediate: true })}
                    />
                  )}
                  {text && canCarry(mark) && (
                    <Choice
                      label={`Was mit ${THREE_LABEL[k]} geschieht`}
                      className="carry"
                      value={day.evening.carry[k]}
                      options={CARRIES.map((c) => ({ value: c, label: CARRY_LABEL[c] }))}
                      onChange={(c) =>
                        store.updateDay(date, (d) => ({ ...d, evening: setCarry(d.evening, k, c) }), { immediate: true })
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
          <Note>{RUBRICS.reviewCarry}</Note>
        </>
      )}
      <p className="small">{RUBRICS.reviewNotSin}</p>
    </>
  );
}
