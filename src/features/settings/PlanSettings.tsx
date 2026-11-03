import { useId, useState, type ReactNode } from 'react';
import { RefLabel } from '../../ui/RefLabel';
import { useToast } from '../../app/Toast';
import {
  CHAPTER_CHOICES,
  MINUTE_CHOICES,
  OT_BOOKS,
  PAUL_DAYS,
  PAUL_MAX_DAYS,
  PAUL_MIN_DAYS,
  SECTION_PLANS,
  START_PLAN_ID,
} from '../../content/readingPlans';
import { useProfile, useStore } from '../../data/hooks';
import { activeDesert } from '../../domain/desert';
import { isInRun } from '../../domain/winterArc';
import {
  fixedAmounts,
  fixedPlanId,
  getPlan,
  MAX_OWN_TRACKS,
  ownAmounts,
  ownPlanId,
  ownTrackId,
  paulPlanId,
  portionLabel,
  positionFor,
  PSALM_TRACK,
  sectionDays,
  sectionKind,
  desertPlanId,
  type SectionKind,
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
        {legend}:{' '}
        <b>
          <RefLabel text={portionLabel(track, current)} />
        </b>
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

/** A select for chapters a day. */
function ChaptersADay({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>Kapitel am Tag</label>
      <select id={id} value={String(value)} onChange={(e) => onChange(Number(e.target.value))}>
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
export function FixedPlan({ amounts }: { amounts: FixedAmounts }) {
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
            <ChaptersADay value={amounts.at === 'base' ? 1 : amounts.at} onChange={(at) => set({ ...amounts, at })} />
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
    else add([amounts[0]!, { unit: 'chapters', value: 1 }]);
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
            <OneBookAmount amount={a} onChange={(x) => setAt(i, x)} label={single ? undefined : `${i + 1}. Lesung`} />
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

/** For a book: chapters a day, or time a day. */
function OneBookAmount({ amount, onChange, label }: { amount: Amount; onChange: (a: Amount) => void; label?: string }) {
  const id = useId();
  const choices = amount.unit === 'chapters' ? CHAPTER_CHOICES : MINUTE_CHOICES;
  return (
    <>
      <Segmented<Amount['unit']>
        label={label ? `Maß der täglichen Lesung, ${label}` : 'Maß der täglichen Lesung'}
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

/** Where a plan by sections goes on: any of its sections, by number and passage. */
function SectionPosition({ track, position }: { track: Track; position: number }) {
  const store = useStore();
  const toast = useToast();
  const id = useId();
  const i = position < track.portions.length ? position : 0;
  return (
    <fieldset className="plan-track">
      <legend>
        Nächster Abschnitt:{' '}
        <b>
          <RefLabel text={portionLabel(track, track.portions[i]!)} />
        </b>
      </legend>
      <div className="field">
        <label htmlFor={id}>Weiter mit</label>
        <select
          id={id}
          value={i}
          onChange={(e) => {
            store.setPlanPositions({ [track.def.id]: Number(e.target.value) });
            toast('Leseplan angepasst');
          }}
        >
          {track.portions.map((p, k) => (
            <option key={k} value={k}>
              Abschnitt {k + 1}: <RefLabel text={portionLabel(track, p)} />
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}

/** "Mit Paulus unterwegs": 40 or 60 days, or a number of one's own. */
function PaulDays({ days, onChange }: { days: number; onChange: (d: number) => void }) {
  const id = useId();
  const [text, setText] = useState(String(days));
  const n = Number(text);
  const valid = Number.isInteger(n) && n >= PAUL_MIN_DAYS && n <= PAUL_MAX_DAYS;
  return (
    <div className="field">
      <label htmlFor={id}>Dauer in Tagen</label>
      <div className="day-chips winter-arc-quick" role="group" aria-label="Vorschläge für die Dauer">
        {PAUL_DAYS.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={days === d}
            onClick={() => {
              setText(String(d));
              onChange(d);
            }}
          >
            {d}
          </button>
        ))}
      </div>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={PAUL_MIN_DAYS}
        max={PAUL_MAX_DAYS}
        step={1}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const d = Number(e.target.value);
          if (Number.isInteger(d) && d >= PAUL_MIN_DAYS && d <= PAUL_MAX_DAYS) onChange(d);
        }}
      />
      {!valid && (
        <p className="small muted" role="status">
          Wähle eine Dauer von {PAUL_MIN_DAYS} bis {PAUL_MAX_DAYS} Tagen.
        </p>
      )}
    </div>
  );
}

/** A plan by sections: what can be chosen for it, and where it goes on. */
function SectionPlan({ kind }: { kind: SectionKind }) {
  const store = useStore();
  const toast = useToast();
  const profile = useProfile();
  const plan = getPlan(profile.plan.planId);
  const planId = plan.def.id;
  const positions = profile.plan.positions;
  const set = (id: string) => {
    store.setPlan(id);
    toast('Leseplan angepasst');
  };
  const [main, ...rest] = plan.tracks;
  return (
    <>
      {kind === 'beginner' && (
        <Segmented<'without' | 'with'>
          label="Psalm dazu"
          options={[
            { value: 'without', label: 'Ohne Psalm' },
            { value: 'with', label: 'Mit einem Psalm' },
          ]}
          value={planId === 'einsteiger-psalm' ? 'with' : 'without'}
          onChange={(v) => set(v === 'with' ? 'einsteiger-psalm' : 'einsteiger')}
        />
      )}
      {kind === 'paul' && <PaulDays days={sectionDays(planId) ?? PAUL_DAYS[0]} onChange={(d) => set(paulPlanId(d))} />}
      {kind === 'desert' && (
        <p className="small muted">
          Verteilt auf die {sectionDays(planId)} Tage der Wüstenzeit. Dein Plan „
          {getPlan(profile.plan.beforeDesert ?? START_PLAN_ID).def.name}“ ruht so lange und geht danach von selbst dort
          weiter, wo du aufgehört hast.
        </p>
      )}
      {main && <SectionPosition track={main} position={positions[main.def.id] ?? 0} />}
      {rest.map((t) =>
        t.def.id === PSALM_TRACK ? (
          <TrackPosition key={t.def.id} track={t} position={positions[t.def.id] ?? 0} legend="Nächster Psalm" />
        ) : null,
      )}
    </>
  );
}

type Kind = 'fixed' | 'own' | SectionKind;

const KIND_LABEL: Record<Kind, string> = {
  fixed: 'Altes und Neues Testament',
  own: 'Eigener Plan',
  beginner: SECTION_PLANS.beginner.name,
  paul: SECTION_PLANS.paul.name,
  year: SECTION_PLANS.year.name,
  desert: `${SECTION_PLANS.desert.name} (Wüstenzeit)`,
};

const SECTION_START: Record<Exclude<SectionKind, 'desert'>, string> = {
  beginner: 'einsteiger',
  paul: paulPlanId(PAUL_DAYS[0]),
  year: 'jahr',
};

export function PlanSettings() {
  const store = useStore();
  const toast = useToast();
  const profile = useProfile();
  const id = useId();
  const planId = getPlan(profile.plan.planId).def.id;
  const own = ownAmounts(planId);
  const section = sectionKind(planId);
  const fixed = fixedAmounts(planId) ?? { at: 'base', nt: 1 };
  const kind: Kind = own ? 'own' : (section ?? 'fixed');
  // The plan of the Wüstenzeit only on its days.
  const desert = activeDesert(profile.winterArc);
  const desertNow = desert && isInRun(desert, store.today()) ? desert : undefined;
  const kinds = (Object.keys(KIND_LABEL) as Kind[]).filter((k) => k !== 'desert' || desertNow || kind === 'desert');
  const choose = (next: Kind) => {
    if (next === kind) return;
    if (next === 'desert') {
      if (desertNow) store.setPlan(desertPlanId(desertNow.durationDays));
    } else if (next === 'own' || next === 'fixed') {
      // Each kind comes back as it was left.
      const back = next === 'own' ? (profile.plan.own ?? ownPlanId([{ unit: 'chapters', value: 2 }])) : profile.plan.fixed;
      store.setPlan(back ?? fixedPlanId({ at: 'base', nt: 1 }));
    } else store.setPlan(SECTION_START[next]);
    toast('Leseplan angepasst');
  };
  return (
    <>
      <div className="field">
        <label htmlFor={id}>Leseplan</label>
        <select id={id} value={kind} onChange={(e) => choose(e.target.value as Kind)}>
          {kinds.map((k) => (
            <option key={k} value={k}>
              {KIND_LABEL[k]}
            </option>
          ))}
        </select>
      </div>
      {own ? <OwnPlan amounts={own} /> : section ? <SectionPlan key={planId} kind={section} /> : <FixedPlan amounts={fixed} />}
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
