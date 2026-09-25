import { useId } from 'react';
import { useToast } from '../../app/Toast';
import { useProfile, useStore } from '../../data/hooks';
import { CHAPTER_CHOICES, DEFAULT_PLAN_ID, MINUTE_CHOICES, OT_BOOKS } from '../../content/readingPlans';
import {
  getPlan,
  isOwnPlan,
  ownAmount,
  ownPlanId,
  portionLabel,
  positionFor,
  type Amount,
  type Track,
} from '../../domain/readingPlan';
import { Segmented } from '../../ui/Choice';

function bookOptions(track: Track, from: number, to: number) {
  return track.def.books.slice(from, to).map((b, i) => (
    <option key={b.slug} value={from + i}>
      {b.name}
    </option>
  ));
}

function TrackPosition({ track, position, single }: { track: Track; position: number; single?: boolean }) {
  const store = useStore();
  const toast = useToast();
  const bookId = useId();
  const chapterId = useId();
  const current = track.portions[position] ?? track.portions[0]!;
  const book = track.def.books[current.book]!;

  const set = (b: number, chapter: number) => {
    store.setPlanPositions({ [track.def.id]: positionFor(track, b, chapter) });
    toast('Leseplan angepasst');
  };

  return (
    <fieldset className="plan-track">
      <legend>
        Nächste Lesung{single ? '' : ` ${track.def.label}`}: <b>{portionLabel(track, current)}</b>
      </legend>
      <div className="grid2">
        <div className="field">
          <label htmlFor={bookId}>Buch</label>
          <select id={bookId} value={current.book} onChange={(e) => set(Number(e.target.value), 1)}>
            {single ? (
              <>
                <optgroup label="Altes Testament">{bookOptions(track, 0, OT_BOOKS.length)}</optgroup>
                <optgroup label="Neues Testament">
                  {bookOptions(track, OT_BOOKS.length, track.def.books.length)}
                </optgroup>
              </>
            ) : (
              bookOptions(track, 0, track.def.books.length)
            )}
          </select>
        </div>
        <div className="field">
          <label htmlFor={chapterId}>Kapitel</label>
          <select id={chapterId} value={current.from} onChange={(e) => set(current.book, Number(e.target.value))}>
            {Array.from({ length: book.chapters }, (_, i) => (
              <option key={i} value={i + 1}>
                Kapitel {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
    </fieldset>
  );
}

type Kind = 'fixed' | 'own';

/** The daily amount of a plan of one's own: chapters or time, and how many. */
function OwnAmount({ amount }: { amount: Amount }) {
  const store = useStore();
  const toast = useToast();
  const id = useId();
  const set = (a: Amount) => {
    store.setPlan(ownPlanId(a));
    toast('Leseplan angepasst');
  };
  const choices = amount.unit === 'chapters' ? CHAPTER_CHOICES : MINUTE_CHOICES;
  return (
    <fieldset className="plan-track">
      <legend>Täglich lesen</legend>
      <Segmented<Amount['unit']>
        label="Maß der täglichen Lesung"
        options={[
          { value: 'chapters', label: 'Kapitel' },
          { value: 'minutes', label: 'Zeit' },
        ]}
        value={amount.unit}
        onChange={(unit) => unit !== amount.unit && set(unit === 'chapters' ? { unit, value: 2 } : { unit, value: 15 })}
      />
      <div className="field">
        <label htmlFor={id}>{amount.unit === 'chapters' ? 'Kapitel am Tag' : 'Minuten am Tag'}</label>
        <select id={id} value={amount.value} onChange={(e) => set({ unit: amount.unit, value: Number(e.target.value) })}>
          {choices.map((n) => (
            <option key={n} value={n}>
              {amount.unit === 'chapters' ? (n === 1 ? '1 Kapitel' : `${n} Kapitel`) : `etwa ${n} Minuten`}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}

export function PlanSettings() {
  const store = useStore();
  const toast = useToast();
  const profile = useProfile();
  const plan = getPlan(profile.plan.planId);
  const amount = ownAmount(plan.def.id);
  const choose = (kind: Kind) => {
    if ((kind === 'own') === Boolean(amount)) return;
    store.setPlan(kind === 'own' ? (profile.plan.own ?? ownPlanId({ unit: 'chapters', value: 2 })) : DEFAULT_PLAN_ID);
    toast('Leseplan angepasst');
  };
  return (
    <>
      <Segmented<Kind>
        label="Leseplan"
        options={[
          { value: 'fixed', label: 'AT und NT' },
          { value: 'own', label: 'Eigener Plan' },
        ]}
        value={amount ? 'own' : 'fixed'}
        onChange={choose}
      />
      {plan.tracks.map((t) => (
        <TrackPosition
          key={`${plan.def.id}-${t.def.id}`}
          track={t}
          position={profile.plan.positions[t.def.id] ?? 0}
          single={isOwnPlan(plan.def.id)}
        />
      ))}
      {amount && <OwnAmount amount={amount} />}
    </>
  );
}

export function PlanInfo() {
  const profile = useProfile();
  return (
    <>
      <p>{getPlan(profile.plan.planId).def.description}</p>
      <p>Die heutige Lesung folgt der neuen Stelle, solange sie noch nicht als gelesen markiert ist.</p>
    </>
  );
}
