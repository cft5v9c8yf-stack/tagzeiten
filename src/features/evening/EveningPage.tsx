import { scheduleFor } from '../../domain/schedule';
import { useState } from 'react';
import { COMPLINE_ICONS, VESPERS_ICONS } from '../../content/flowIcons';
import { getOrder, ORDER_MINUTES, RUBRICS, WEEK_REVIEW_STEP, type OrderId, type Part, type Step as OrderStep } from '../../content/orders';
import { useToast } from '../../app/Toast';
import { useSelectedDate } from '../../app/useSelectedDate';
import { useDay, useProfile, useStore } from '../../data/hooks';
import { toMinutes } from '../../domain/dayArc';
import { weekdayOf, type DateKey } from '../../domain/dates';
import type { EveningEntry, OrderForm } from '../../domain/model';
import type { FlowIconName } from '../../ui/FlowIcon';
import { Segmented } from '../../ui/Choice';
import { StepFlow, type FlowStep } from '../../ui/StepFlow';
import { DonePanel, OrderHead } from '../liturgy/OrderHead';
import { OrderPart } from '../liturgy/OrderPart';

function useCompletion(date: DateKey, flag: 'vespersDone' | 'complineDone', doneMessage: string) {
  const store = useStore();
  const toast = useToast();
  return (value: boolean) => {
    store.updateDay(date, (d) => ({ ...d, evening: { ...d.evening, [flag]: value } }), { immediate: true });
    if (value) toast(doneMessage);
  };
}

function useFormSetter(date: DateKey, key: 'vespersForm' | 'complineForm') {
  const store = useStore();
  return (f: OrderForm) =>
    store.updateDay(date, (d) => ({ ...d, evening: { ...d.evening, [key]: f } as EveningEntry }), { immediate: true });
}

/** A page of the evening: one step of an order, with its parts. */
interface EveningPage {
  id: string;
  title: string;
  short: string;
  icon?: FlowIconName;
  sections: { id: string; title: string; order: OrderId; parts: readonly Part[] }[];
}

/** The short names under the marks of the row. */
const SHORT: Record<string, string> = {
  praise: 'Lob',
  word: 'Wort',
  prayer: 'Gebet',
  vespers: 'Vesper',
  sign: 'Glaube',
  review: 'Rückschau',
  examination: 'Prüfung',
  blessing: 'Segen',
  compline: 'Nachtgebet',
};

/** Sunday evening in the full form, unless switched off: the weekly review takes the day's thanks and review. */
const isWeekReview = (date: DateKey, form: OrderForm, on: boolean) => on && form === 'full' && weekdayOf(date) === 0;

/** The steps of the Nachtgebet, with the weekly review in place of thanks and review (still before the examination, rule 3). */
const withWeekReview = (steps: readonly OrderStep[], weekly: boolean): readonly OrderStep[] =>
  weekly ? steps.map((st) => (st.id === 'review' ? WEEK_REVIEW_STEP : st)) : steps;

const pageOf = (st: OrderStep, order: OrderId): EveningPage => ({
  id: order === 'vespers' ? st.id : `compline-${st.id}`,
  title: st.title,
  short: SHORT[st.id] ?? st.title,
  icon: (order === 'vespers' ? VESPERS_ICONS : COMPLINE_ICONS)[st.id],
  sections: [{ id: st.id, title: st.title, order, parts: st.parts }],
});

/**
 * The pages of the Vesper. Without the Nachtgebet, its thanks and review and –
 * in the full form – examination, confession and absolution follow at the end:
 * the review before the examination, never mixed (rule 3), the examination
 * always on one page with the word of forgiveness (rule 1).
 */
function vespersPages(form: OrderForm, withCompline: boolean, weekly: boolean): EveningPage[] {
  const pages = getOrder('vespers', form).steps.map((st) => pageOf(st, 'vespers'));
  if (withCompline) return pages;
  if (form === 'short') {
    const review = getOrder('compline', 'short').steps[0]!.parts.find((p) => p.kind === 'review')!;
    return [...pages, pageOf({ id: 'review', title: 'Rückschau', minutes: 0, parts: [review] }, 'compline')];
  }
  const taken = withWeekReview(getOrder('compline', 'full').steps, weekly).filter(
    (st) => st.id === 'review' || st.id === 'examination',
  );
  return [...pages, ...taken.map((st) => pageOf(st, 'compline'))];
}

/**
 * The Vesper, one page at a time. With the Nachtgebet, the last mark of its row
 * leads there; without it, the Vesper closes the day.
 */
function VespersView({
  date,
  current,
  setCurrent,
  onOpenCompline,
}: {
  date: DateKey;
  current: number | null;
  setCurrent: (i: number | null) => void;
  onOpenCompline: () => void;
}) {
  const day = useDay(date);
  const profile = useProfile();
  const withCompline = profile.showCompline;
  const form = day.evening.vespersForm;
  const pages = vespersPages(form, withCompline, isWeekReview(date, form, profile.weekReview));
  const setForm = useFormSetter(date, 'vespersForm');
  const complete = useCompletion(date, 'vespersDone', withCompline ? 'Vesper gebetet' : 'Tag abgeschlossen');
  const done = day.evening.vespersDone;
  const steps: FlowStep[] = [
    ...pages.map((p) => ({ id: p.id, title: p.title, short: p.short, icon: p.icon, done })),
    ...(withCompline
      ? [{ id: 'compline', title: 'Nachtgebet', short: 'Nacht', icon: 'moon' as const, done: day.evening.complineDone }]
      : []),
  ];
  const page = current === null ? undefined : pages[current];
  const next = current === null ? undefined : pages[current + 1];

  const footer = next ? (
    <button type="button" className="btn primary" onClick={() => setCurrent(current! + 1)}>
      Weiter zu: {next.title}
    </button>
  ) : done ? (
    withCompline ? (
      <button type="button" className="btn primary" onClick={onOpenCompline}>
        Weiter zum Nachtgebet
      </button>
    ) : null
  ) : (
    <button
      type="button"
      className="btn primary"
      onClick={() => {
        complete(true);
        setCurrent(null);
        if (withCompline) onOpenCompline();
      }}
    >
      {withCompline ? 'Vesper abschließen' : 'Tag abschließen'}
    </button>
  );

  return (
    <div className="order vespers">
      <OrderHead
        title="Vesper"
        rubric={
          withCompline
            ? form === 'full'
              ? RUBRICS.vespers
              : RUBRICS.vespersShort
            : form === 'full'
              ? RUBRICS.vespersClosing
              : RUBRICS.vespersShortClosing
        }
      >
        <Segmented
          label="Form der Vesper"
          value={form}
          onChange={(f) => {
            setForm(f);
            setCurrent(0);
          }}
          options={[
            { value: 'full', label: `Vesper · ${ORDER_MINUTES.vespers.full} Min.` },
            { value: 'short', label: `Kurzform · ${ORDER_MINUTES.vespers.short} Min.` },
          ]}
        />
      </OrderHead>
      <StepFlow
        label="Vesper"
        steps={steps}
        current={current}
        onSelect={(i) => (i === pages.length ? onOpenCompline() : setCurrent(i))}
        footer={page && footer}
      >
        {page?.sections.map((sec, k) => (
          <div key={sec.id} className={`${sec.order === 'compline' ? 'compline-part ' : ''}step-${sec.id}`}>
            {k > 0 && <h4 className="flow-subtitle">{sec.title}</h4>}
            {sec.parts.map((p) => (
              <OrderPart
                key={p.kind}
                part={p}
                ctx={{ order: sec.order, form, date }}
                showTitle={sec.parts.length > 1}
                headingLevel={k > 0 ? 5 : 4}
              />
            ))}
          </div>
        ))}
      </StepFlow>
      {done && current === null && (
        <DonePanel
          note={withCompline ? 'Vesper gebetet.' : 'Tag abgeschlossen.'}
          next={withCompline ? { label: 'Weiter zum Nachtgebet', onClick: onOpenCompline } : undefined}
          onReopen={() => {
            complete(false);
            setCurrent(pages.length - 1);
          }}
        />
      )}
    </div>
  );
}

/** The Nachtgebet, one step at a time; the first mark of its row leads back to the Vesper. */
function ComplineView({
  date,
  current,
  setCurrent,
  onOpenVespers,
}: {
  date: DateKey;
  current: number | null;
  setCurrent: (i: number | null) => void;
  onOpenVespers: () => void;
}) {
  const day = useDay(date);
  const profile = useProfile();
  const form = day.evening.complineForm;
  const pages = withWeekReview(getOrder('compline', form).steps, isWeekReview(date, form, profile.weekReview)).map((st) =>
    pageOf(st, 'compline'),
  );
  const setForm = useFormSetter(date, 'complineForm');
  const complete = useCompletion(date, 'complineDone', 'Tag abgeschlossen');
  const done = day.evening.complineDone;

  const steps: FlowStep[] = [
    { id: 'vespers', title: 'Vesper', short: 'Vesper', icon: 'sunset', done: day.evening.vespersDone },
    ...pages.map((p) => ({ id: p.id, title: p.title, short: p.short, icon: p.icon, done })),
  ];
  const page = current === null ? undefined : pages[current];
  const next = current === null ? undefined : pages[current + 1];

  const footer = next ? (
    <button type="button" className="btn primary" onClick={() => setCurrent(current! + 1)}>
      Weiter zu: {next.title}
    </button>
  ) : done ? null : (
    <button
      type="button"
      className="btn primary"
      onClick={() => {
        complete(true);
        setCurrent(null);
      }}
    >
      Tag abschließen
    </button>
  );

  return (
    <div className="order compline">
      <OrderHead title="Nachtgebet" rubric={form === 'full' ? 'Gegen 20:45, am Bett.' : RUBRICS.complineShort}>
        <Segmented
          label="Form des Nachtgebets"
          value={form}
          onChange={(f) => {
            setForm(f);
            setCurrent(0);
          }}
          options={[
            { value: 'full', label: `Nachtgebet · ${ORDER_MINUTES.compline.full} Min.` },
            { value: 'short', label: 'Kurzform für müde Tage' },
          ]}
        />
      </OrderHead>
      <StepFlow
        label="Nachtgebet"
        steps={steps}
        current={current === null ? null : current + 1}
        onSelect={(i) => (i === 0 ? onOpenVespers() : setCurrent(i - 1))}
        footer={page && footer}
      >
        {page?.sections.map((sec) => (
          <div key={sec.id} className={`compline-part step-${sec.id}`}>
            {sec.parts.map((p) => (
              <OrderPart key={p.kind} part={p} ctx={{ order: 'compline', form, date }} showTitle={sec.parts.length > 1} />
            ))}
          </div>
        ))}
      </StepFlow>
      {done && current === null && (
        <DonePanel
          note="Tag abgeschlossen."
          onReopen={() => {
            complete(false);
            setCurrent(pages.length - 1);
          }}
        />
      )}
    </div>
  );
}

/**
 * The evening: Vesper, then Nachtgebet – always one row of marks. The Vesper's
 * row ends with the Nachtgebet, the Nachtgebet's row begins with the Vesper.
 * Opens at the Nachtgebet once the Vesper is prayed or its hour is near.
 */
function Evening({ date, isToday }: { date: DateKey; isToday: boolean }) {
  const day = useDay(date);
  const profile = useProfile();
  const [view, setView] = useState<'vespers' | 'compline'>(() => {
    if (!profile.showCompline) return 'vespers';
    const now = new Date();
    const lateEnough = isToday && now.getHours() * 60 + now.getMinutes() >= toMinutes(scheduleFor(profile, date).compline) - 30;
    return day.evening.vespersDone || day.evening.complineDone || lateEnough ? 'compline' : 'vespers';
  });
  const [vespersStep, setVespersStep] = useState<number | null>(day.evening.vespersDone ? null : 0);
  const [complineStep, setComplineStep] = useState<number | null>(day.evening.complineDone ? null : 0);

  return view === 'vespers' || !profile.showCompline ? (
    <VespersView
      date={date}
      current={vespersStep}
      setCurrent={setVespersStep}
      onOpenCompline={() => setView('compline')}
    />
  ) : (
    <ComplineView
      date={date}
      current={complineStep}
      setCurrent={setComplineStep}
      onOpenVespers={() => setView('vespers')}
    />
  );
}

export function EveningPage() {
  const { date, isToday } = useSelectedDate();
  return <Evening key={date} date={date} isToday={isToday} />;
}
