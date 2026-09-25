import { useId, useState } from 'react';
import { COMPLINE_ICONS, VESPERS_ICONS } from '../../content/flowIcons';
import { getOrder, ORDER_MINUTES, RUBRICS, type Step as OrderStep } from '../../content/orders';
import { useToast } from '../../app/Toast';
import { useSelectedDate } from '../../app/useSelectedDate';
import { useDay, useProfile, useStore } from '../../data/hooks';
import { toMinutes } from '../../domain/dayArc';
import type { DateKey } from '../../domain/dates';
import type { EveningEntry, OrderForm } from '../../domain/model';
import { Segmented } from '../../ui/Choice';
import { StepFlow, type FlowStep } from '../../ui/StepFlow';
import { DonePanel, OrderHead } from '../liturgy/OrderHead';
import { OrderPart } from '../liturgy/OrderPart';

const FAMILY_KEY = 'tz:family';

function readFamilyMode(): boolean {
  try {
    return localStorage.getItem(FAMILY_KEY) === '1';
  } catch {
    return false;
  }
}

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

/** Large type for praying with the children; a per-device preference. */
function FamilySwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <div className="family-switch">
      <input id={id} type="checkbox" role="switch" className="switch" checked={on} onChange={onToggle} aria-describedby={`${id}-d`} />
      <label htmlFor={id}>
        <b>Familienmodus</b>
        <span id={`${id}-d`}>Große Schrift, V und A im Wechsel</span>
      </label>
    </div>
  );
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

/** The Vesper, one part at a time; the last mark of its row leads to the Nachtgebet. */
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
  const form = day.evening.vespersForm;
  const parts = getOrder('vespers', form).steps[0]!.parts;
  const setForm = useFormSetter(date, 'vespersForm');
  const complete = useCompletion(date, 'vespersDone', 'Vesper gebetet');
  const done = day.evening.vespersDone;
  const [family, setFamily] = useState(readFamilyMode);

  const toggleFamily = () =>
    setFamily((f) => {
      try {
        localStorage.setItem(FAMILY_KEY, f ? '0' : '1');
      } catch {
        // per-device preference only
      }
      return !f;
    });

  const steps: FlowStep[] = [
    ...parts.map((p) => ({ id: p.kind, title: p.title, icon: VESPERS_ICONS[p.kind], done })),
    { id: 'compline', title: 'Nachtgebet', icon: 'moon', done: day.evening.complineDone },
  ];
  const part = current === null ? undefined : parts[current];
  const next = current === null ? undefined : parts[current + 1];

  const footer = next ? (
    <button type="button" className="btn primary" onClick={() => setCurrent(current! + 1)}>
      Weiter zu: {next.title}
    </button>
  ) : done ? (
    <button type="button" className="btn primary" onClick={onOpenCompline}>
      Weiter zum Nachtgebet
    </button>
  ) : (
    <button
      type="button"
      className="btn primary"
      onClick={() => {
        complete(true);
        setCurrent(null);
        onOpenCompline();
      }}
    >
      Vesper abschließen
    </button>
  );

  return (
    <div className={`order vespers${family ? ' family' : ''}`}>
      <OrderHead title="Vesper" rubric={form === 'full' ? RUBRICS.vespers : RUBRICS.vespersShort}>
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
        <FamilySwitch on={family} onToggle={toggleFamily} />
      </OrderHead>
      <StepFlow
        label="Vesper"
        steps={steps}
        current={current}
        onSelect={(i) => (i === parts.length ? onOpenCompline() : setCurrent(i))}
        footer={part && footer}
      >
        {part && <OrderPart part={part} ctx={{ order: 'vespers', form, date }} showTitle={false} />}
      </StepFlow>
      {done && current === null && (
        <DonePanel
          note="Vesper gebetet."
          next={{ label: 'Weiter zum Nachtgebet', onClick: onOpenCompline }}
          onReopen={() => {
            complete(false);
            setCurrent(parts.length - 1);
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
    const now = new Date();
    const lateEnough = isToday && now.getHours() * 60 + now.getMinutes() >= toMinutes(profile.schedule.compline) - 30;
    return day.evening.vespersDone || day.evening.complineDone || lateEnough ? 'compline' : 'vespers';
  });
  const [vespersStep, setVespersStep] = useState<number | null>(day.evening.vespersDone ? null : 0);
  const [complineStep, setComplineStep] = useState<number | null>(day.evening.complineDone ? null : 0);

  return view === 'vespers' ? (
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
