import { useId, type KeyboardEvent } from 'react';
import { WEEK_PLACES, WEEK_REVIEW, WEEK_REVIEW_COMFORT, type WeekPlace } from '../../content/weekReview';
import { WINTER_ARC_REVIEW } from '../../content/winterArc';
import { useDayLookup, useProfile, useStore } from '../../data/hooks';
import { addDays, type DateKey } from '../../domain/dates';
import { childrenOf, houseHas, joinNames, wifeOf, type House } from '../../domain/house';
import type { Day } from '../../domain/model';
import { activeRun, isInRun, positionOf, weekOf, type WinterArcRun } from '../../domain/winterArc';
import { BibleRef } from '../../ui/BibleRef';
import { DayField, GrowingTextarea } from '../../ui/DayField';
import { Rubric } from '../../ui/PrayerText';

/** Wife and children appear under their names from "Mein Haus". */
function nameOf(place: WeekPlace, house: House): string | undefined {
  if (place.needs === 'wife') return wifeOf(house)?.name.trim();
  if (place.needs === 'children') return joinNames(childrenOf(house).map((c) => c.name.trim())) || undefined;
  return undefined;
}

/** What was written at the evening thanks on the six days before, oldest first. */
function thanksOfWeek(lookup: (date: DateKey) => Day | undefined, date: DateKey): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 1; i--) {
    for (const t of lookup(addDays(date, -i))?.evening.thanks ?? []) if (t.trim()) out.push(t.trim());
  }
  return out;
}

/** Enter moves on to the next field: one line is enough. */
function nextOnEnter(e: KeyboardEvent<HTMLDivElement>) {
  if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
  const field = e.target;
  if (!(field instanceof HTMLTextAreaElement)) return;
  e.preventDefault();
  const fields = Array.from(e.currentTarget.querySelectorAll('textarea'));
  const next = fields[fields.indexOf(field) + 1];
  if (next) next.focus();
  else field.blur();
}

/** The three questions of a round of the Streithalle: the same data as on its dashboard, never a second review. */
function HallQuestions({ run, date }: { run: WinterArcRun; date: DateKey }) {
  const store = useStore();
  const profile = useProfile();
  const id = useId();
  const { week } = positionOf(run, date);
  const review = weekOf(profile.winterArc, run.id, week)?.review;
  return (
    <>
      <h4 className="part-title">{WEEK_REVIEW.hall}</h4>
      {WINTER_ARC_REVIEW.map((r) => (
        <div key={r.key} className="field">
          <label htmlFor={`${id}-${r.key}`}>{r.label}</label>
          <GrowingTextarea
            id={`${id}-${r.key}`}
            value={review?.[r.key] ?? ''}
            enterKeyHint="next"
            onChange={(e) => store.setWinterArcReview(run.id, week, r.key, e.target.value)}
          />
        </div>
      ))}
    </>
  );
}

/**
 * The weekly review on Sunday evening: what was noted in the week, thanks for
 * the people and tasks of the week, the Streithalle's questions while a round
 * runs, at most one resolve, and the word of comfort at the end.
 */
export function WeekReview({ date }: { date: DateKey }) {
  const profile = useProfile();
  const lookup = useDayLookup();
  const noted = thanksOfWeek(lookup, date);
  const run = activeRun(profile.winterArc);
  const places = WEEK_PLACES.filter((p) => houseHas(profile.house, p.needs));
  return (
    <div className="week-review" onKeyDown={nextOnEnter}>
      <Rubric>{WEEK_REVIEW.rubric}</Rubric>
      {noted.length > 0 && (
        <>
          <h4 className="part-title">{WEEK_REVIEW.noted}</h4>
          <p className="week-noted">{noted.join(' · ')}</p>
        </>
      )}
      <h4 className="part-title">{WEEK_REVIEW.thanks}</h4>
      {places.map((p) => (
        <DayField
          key={p.field}
          date={date}
          path={`evening.${p.field}`}
          label={nameOf(p, profile.house)}
          aside={<BibleRef reference={p.ref} />}
          enterKeyHint="next"
        />
      ))}
      {run && isInRun(run, date) && <HallQuestions run={run} date={date} />}
      <h4 className="part-title">{WEEK_REVIEW.ahead}</h4>
      <DayField date={date} path="evening.weekResolve" enterKeyHint="done" />
      <div className="arena-comfort week-comfort">
        <p className="rubric">{WEEK_REVIEW_COMFORT.lead}</p>
        <p>{WEEK_REVIEW_COMFORT.text}</p>
      </div>
    </div>
  );
}
