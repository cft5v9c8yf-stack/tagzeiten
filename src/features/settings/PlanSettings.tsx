import { useId, type ReactNode } from 'react';
import { useToast } from '../../app/Toast';
import { CHAPTER_CHOICES, MINUTE_CHOICES, OT_BOOKS } from '../../content/readingPlans';
import { useProfile, useStore } from '../../data/hooks';
import {
  fixedAmounts,
  fixedPlanId,
  getPlan,
  MAX_OWN_TRACKS,
  ownAmounts,
  ownPlanId,
  ownTrackId,
  portionLabel,
  positionFor,
  type Amount,
  type FixedAmounts,
  type Track,
} from '../../domain/readingPlan';
import { Segmented } from '../../ui/Choice';

const chapterLabel = (n: number) => (n === 1 ? '1 Kapitel' : `${n} Kapitel`);

function bookOptions(track: Track, from: number, to: number) {
  return track.def.books.slice(from, to).map((b, i) => (
    <option key={b.slug} value={from + i}>
      {b.name}
    </option>
  ));
}

/** Where a track stands: book and chapter, and below it what is read of it a day. */
function TrackPosition({
  track,
  position,
  legend,
  children,
}: {
  track: Track;
  position: number;
  legend: string;
  children?: ReactNode;
}) {
  const store = useStore();
  const toast = useToast();
  const bookId = useId();
  const chapterId = useId();
  const current = track.portions[position] ?? track.portions[0]!;
  const book = track.def.books[current.book]!;
  const wholeBible = track.def.books.length > OT_BOOKS.length;

  const set = (b: number, chapter: number) => {
    store.setPlanPositions({ [track.def.id]: positionFor(track, b, chapter) });
    toast('Leseplan angepasst');
  };

  return (
    <fieldset className="plan-track">
      <legend>
        {legend}: <b>{portionLabel(track, current)}</b>
      </legend>
      <div className="grid2">
        <div className="field">
          <label htmlFor={bookId}>Buch</label>
          <select id={bookId} value={current.book} onChange={(e) => set(Number(e.target.value), 1)}>
            {wholeBible ? (
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
      {children}
    </fieldset>
  );
}

/** A select for chapters a day (and, where offered, the 2-1-1-1 base pattern). */
function ChaptersADay<T extends number | 'base'>({
  value,
  onChange,
  base,
}: {
  value: T;
  onChange: (v: T) => void;
  base?: boolean;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>Kapitel am Tag</label>
      <select
        id={id}
        value={String(value)}
        onChange={(e) => onChange((e.target.value === 'base' ? 'base' : Number(e.target.value)) as T)}
      >
        {base && <option value="base">2, 1, 1, 1 im Wechsel</option>}
        {CHAPTER_CHOICES.map((n) => (
          <option key={n} value={n}>
            {chapterLabel(n)}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Old and New Testament side by side, each with its own amount a day. */
function FixedPlan({ amounts }: { amounts: FixedAmounts }) {
  const store = useStore();
  const toast = useToast();
  const profile = useProfile();
  const plan = getPlan(profile.plan.planId);
  const set = (a: FixedAmounts) => {
    store.setPlan(fixedPlanId(a));
    toast('Leseplan angepasst');
  };
  return (
    <>
      {plan.tracks.map((t) => (
        <TrackPosition
          key={t.def.id}
          track={t}
          position={profile.plan.positions[t.def.id] ?? 0}
          legend={`Nächste Lesung ${t.def.label}`}
        >
          {t.def.id === 'at' ? (
            <ChaptersADay base value={amounts.at} onChange={(at) => set({ ...amounts, at })} />
          ) : (
            <ChaptersADay value={amounts.nt} onChange={(nt) => set({ ...amounts, nt })} />
          )}
        </TrackPosition>
      ))}
    </>
  );
}

type Shape = 'one' | 'several';

/** Books a further track may start with, the first not yet read in another track. */
const START_BOOKS = [39, 18, 19, 44, 22];

/** One book (by chapters or by time), or several books side by side, each with its chapters. */
function OwnPlan({ amounts }: { amounts: Amount[] }) {
  const store = useStore();
  const toast = useToast();
  const profile = useProfile();
  const plan = getPlan(profile.plan.planId);
  const positions = profile.plan.positions;
  const bookOf = (t: Track) => t.portions[positions[t.def.id] ?? 0]?.book ?? 0;

  const apply = (next: Amount[], starts: Record<string, number> = {}) => {
    store.setPlan(ownPlanId(next), starts);
    toast('Leseplan angepasst');
  };
  /** A new track at the first chapter of a book not yet read in another track. */
  const add = (next: Amount[]) => {
    const to = getPlan(ownPlanId(next));
    const i = next.length - 1;
    const used = plan.tracks.map(bookOf);
    const book = START_BOOKS.find((b) => !used.includes(b)) ?? 0;
    apply(next, { [ownTrackId(i)]: positionFor(to.tracks[i]!, book, 1) });
  };
  const remove = (j: number) => {
    const next = amounts.filter((_, i) => i !== j);
    // The tracks after it move up one place and keep where they stand.
    const starts: Record<string, number> = {};
    for (let k = j; k < next.length; k++) starts[ownTrackId(k)] = positions[ownTrackId(k + 1)] ?? 0;
    apply(next, starts);
  };
  const setShape = (shape: Shape) => {
    if (shape === 'one') apply([amounts[0]!]);
    else add([{ unit: 'chapters', value: amounts[0]!.unit === 'chapters' ? amounts[0]!.value : 1 }, { unit: 'chapters', value: 1 }]);
  };
  const setAt = (i: number, a: Amount) => apply(amounts.map((x, k) => (k === i ? a : x)));
  const single = amounts.length === 1;

  return (
    <>
      <Segmented<Shape>
        label="Aus wie vielen Büchern"
        options={[
          { value: 'one', label: 'Ein Buch' },
          { value: 'several', label: 'Mehrere Bücher' },
        ]}
        value={single ? 'one' : 'several'}
        onChange={(s) => s !== (single ? 'one' : 'several') && setShape(s)}
      />
      {plan.tracks.map((t, i) => {
        const a = amounts[i]!;
        return (
          <TrackPosition
            key={t.def.id}
            track={t}
            position={positions[t.def.id] ?? 0}
            legend={single ? 'Nächste Lesung' : `${i + 1}. Lesung`}
          >
            {single ? (
              <OneBookAmount amount={a} onChange={(x) => setAt(0, x)} />
            ) : (
              <ChaptersADay value={a.value} onChange={(value) => setAt(i, { unit: 'chapters', value })} />
            )}
            {amounts.length > 2 && (
              <button type="button" className="btn quiet plan-remove" onClick={() => remove(i)}>
                Dieses Buch entfernen
              </button>
            )}
          </TrackPosition>
        );
      })}
      {!single && amounts.length < MAX_OWN_TRACKS && (
        <button type="button" className="btn plan-add" onClick={() => add([...amounts, { unit: 'chapters', value: 1 }])}>
          Weiteres Buch hinzufügen
        </button>
      )}
    </>
  );
}

/** For one book: chapters a day, or time a day. */
function OneBookAmount({ amount, onChange }: { amount: Amount; onChange: (a: Amount) => void }) {
  const id = useId();
  const choices = amount.unit === 'chapters' ? CHAPTER_CHOICES : MINUTE_CHOICES;
  return (
    <>
      <Segmented<Amount['unit']>
        label="Maß der täglichen Lesung"
        options={[
          { value: 'chapters', label: 'Kapitel' },
          { value: 'minutes', label: 'Zeit' },
        ]}
        value={amount.unit}
        onChange={(unit) =>
          unit !== amount.unit && onChange(unit === 'chapters' ? { unit, value: 2 } : { unit, value: 15 })
        }
      />
      <div className="field">
        <label htmlFor={id}>{amount.unit === 'chapters' ? 'Kapitel am Tag' : 'Minuten am Tag'}</label>
        <select id={id} value={amount.value} onChange={(e) => onChange({ ...amount, value: Number(e.target.value) })}>
          {choices.map((n) => (
            <option key={n} value={n}>
              {amount.unit === 'chapters' ? chapterLabel(n) : `etwa ${n} Minuten`}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

type Kind = 'fixed' | 'own';

export function PlanSettings() {
  const store = useStore();
  const toast = useToast();
  const profile = useProfile();
  const planId = getPlan(profile.plan.planId).def.id;
  const own = ownAmounts(planId);
  const fixed = fixedAmounts(planId) ?? { at: 'base', nt: 1 };
  const choose = (kind: Kind) => {
    if ((kind === 'own') === Boolean(own)) return;
    // Each kind comes back as it was left.
    const back = kind === 'own' ? (profile.plan.own ?? ownPlanId([{ unit: 'chapters', value: 2 }])) : profile.plan.fixed;
    store.setPlan(back ?? fixedPlanId({ at: 'base', nt: 1 }));
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
        value={own ? 'own' : 'fixed'}
        onChange={choose}
      />
      {own ? <OwnPlan amounts={own} /> : <FixedPlan amounts={fixed} />}
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
