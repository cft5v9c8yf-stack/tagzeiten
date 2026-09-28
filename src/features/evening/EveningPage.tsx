import { scheduleFor } from '../../domain/schedule';
import { useState } from 'react';
import { COMPLINE_ICONS, VESPERS_ICONS } from '../../content/flowIcons';
import { getOrder, ORDER_MINUTES, RUBRICS, type OrderId, type Part, type Step as OrderStep } from '../../content/orders';
import { useToast } from '../../app/Toast';
import { useSelectedDate } from '../../app/useSelectedDate';
import { useDay, useProfile, useStore } from '../../data/hooks';
import { toMinutes } from '../../domain/dayArc';
import type { DateKey } from '../../domain/dates';
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

interface ComplinePage {
  id: string;
  title: string;
  steps: OrderStep[];
}

/**
 * The pages of the Nachtgebet. Examination and confession with absolution stand
 * on one page: the examination never ends without the word of forgiveness (rule 1).
 */
function complinePages(steps: readonly OrderStep[]): ComplinePage[] {
  const pages: ComplinePage[] = [];
  for (const step of steps) {
    const prev = pages.at(-1);
    if (prev && prev.steps.at(-1)!.id === 'examination' && step.id === 'confession') {
      prev.steps.push(step);
      prev.title = 'Prüfung, Bekenntnis und Zuspruch';
    } else {
      pages.push({ id: step.id, title: step.title, steps: [step] });
    }
  }
  return pages;
}

/** A page of the Vesper: one part, or the steps taken over from the Nachtgebet. */
interface VespersPage {
  id: string;
  title: string;
  icon?: FlowIconName;
  sections: { id: string; title: string; order: OrderId; parts: readonly Part[] }[];
}

/**
 * The pages of the Vesper. Without the Nachtgebet, its review and – in the full
 * form – examination, confession and absolution follow at the end: the review
 * before the examination, never mixed (rule 3), and the examination always on
 * one page with the word of forgiveness (rule 1).
 */
function vespersPages(form: OrderForm, withCompline: boolean): VespersPage[] {
  const pages: VespersPage[] = getOrder('vespers', form).steps[0]!.parts.map((p) => ({
    id: p.kind,
    title: p.title,
    icon: VESPERS_ICONS[p.kind],
    sections: [{ id: p.kind, title: p.title, order: 'vespers', parts: [p] }],
  }));
  if (withCompline) return pages;
  const taken = getOrder('compline', form).steps.filter((st) => ['review', 'examination', 'confession'].includes(st.id));
  for (const page of complinePages(taken)) {
    pages.push({
      id: `compline-${page.id}`,
      title: page.title,
      icon: COMPLINE_ICONS[page.id],
      sections: page.steps.map((st) => ({ id: st.id, title: st.title, order: 'compline', parts: st.parts })),
    });
  }
  return pages;
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
  const withCompline = useProfile().showCompline;
  const form = day.evening.vespersForm;
  const pages = vespersPages(form, withCompline);
  const setForm = useFormSetter(date, 'vespersForm');
  const complete = useCompletion(date, 'vespersDone', withCompline ? 'Vesper gebetet' : 'Tag abgeschlossen');
  const done = day.evening.vespersDone;
  const steps: FlowStep[] = [
    ...pages.map((p) => ({ id: p.id, title: p.title, icon: p.icon, done })),
    ...(withCompline ? [{ id: 'compline', title: 'Nachtgebet', icon: 'moon' as const, done: day.evening.complineDone }] : []),
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
  const form = day.evening.complineForm;
  const pages = complinePages(getOrder('compline', form).steps);
  const setForm = useFormSetter(date, 'complineForm');
  const complete = useCompletion(date, 'complineDone', 'Tag abgeschlossen');
  const done = day.evening.complineDone;

  const steps: FlowStep[] = [
    { id: 'vespers', title: 'Vesper', icon: 'sunset', done: day.evening.vespersDone },
    ...pages.map((p) => ({ id: p.id, title: p.title, icon: COMPLINE_ICONS[p.id], done })),
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
        {page?.steps.map((step, k) => (
          <div key={step.id} className={`compline-part step-${step.id}`}>
            {k > 0 && <h4 className="flow-subtitle">{step.title}</h4>}
            {step.parts.map((p) => (
              <OrderPart
                key={p.kind}
                part={p}
                ctx={{ order: 'compline', form, date }}
                showTitle={step.parts.length > 1}
                headingLevel={k > 0 ? 5 : 4}
              />
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
