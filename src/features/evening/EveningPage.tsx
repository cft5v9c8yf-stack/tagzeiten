import { useState } from 'react';
import { COMPLINE_ICONS, VESPERS_ICONS } from '../../content/flowIcons';
import { getOrder, ORDER_MINUTES, RUBRICS, type Step as OrderStep } from '../../content/orders';
import { useToast } from '../../app/Toast';
import { useSelectedDate } from '../../app/useSelectedDate';
import { useDay, useProfile, useStore } from '../../data/hooks';
import { toMinutes } from '../../domain/dayArc';
import type { DateKey } from '../../domain/dates';
import type { EveningEntry, OrderForm } from '../../domain/model';
import { Segmented } from '../../ui/Choice';
import { Rubric } from '../../ui/PrayerText';
import { StepFlow } from '../../ui/StepFlow';
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

/** Shown where an order ends once it is prayed. */
function OrderDone({ note, onReopen }: { note: string; onReopen: () => void }) {
  return (
    <div className="order-end">
      <p className="done-note">{note}</p>
      <button type="button" className="btn quiet" onClick={onReopen}>
        Abschluss zurücknehmen
      </button>
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

/** Nachtgebet with its form, one step at a time. */
function Compline({ date }: { date: DateKey }) {
  const day = useDay(date);
  const form = day.evening.complineForm;
  const setForm = useFormSetter(date, 'complineForm');
  const complete = useCompletion(date, 'complineDone', 'Tag abgeschlossen');
  return (
    <div className="order compline">
      <Segmented
        label="Form des Nachtgebets"
        value={form}
        onChange={setForm}
        options={[
          { value: 'full', label: `Nachtgebet · ${ORDER_MINUTES.compline.full} Min.` },
          { value: 'short', label: 'Kurzform für müde Tage' },
        ]}
      />
      <Rubric>{form === 'full' ? 'Gegen 20:45, am Bett.' : RUBRICS.complineShort}</Rubric>
      <ComplineFlow key={form} date={date} form={form} done={day.evening.complineDone} onComplete={complete} />
    </div>
  );
}

function ComplineFlow({
  date,
  form,
  done,
  onComplete,
}: {
  date: DateKey;
  form: OrderForm;
  done: boolean;
  onComplete: (value: boolean) => void;
}) {
  const pages = complinePages(getOrder('compline', form).steps);
  const [current, setCurrent] = useState<number | null>(done ? null : 0);
  const page = current === null ? undefined : pages[current];
  const next = current === null ? undefined : pages[current + 1];
  return (
    <>
      <StepFlow
        label="Nachtgebet"
        titleLevel={4}
        steps={pages.map((p, i) => ({ id: p.id, title: p.title, mark: i + 1, icon: COMPLINE_ICONS[p.id], done }))}
        current={current}
        onSelect={setCurrent}
        footer={
          next ? (
            <button type="button" className="btn primary" onClick={() => setCurrent(current! + 1)}>
              Weiter zu: {next.title}
            </button>
          ) : done ? null : (
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                onComplete(true);
                setCurrent(null);
              }}
            >
              Tag abschließen
            </button>
          )
        }
      >
        {page?.steps.map((step, k) => (
          <div key={step.id} className={`compline-part step-${step.id}`}>
            {k > 0 && <h5 className="flow-subtitle">{step.title}</h5>}
            {step.parts.map((p) => (
              <OrderPart
                key={p.kind}
                part={p}
                ctx={{ order: 'compline', form, date }}
                showTitle={step.parts.length > 1}
                headingLevel={5}
              />
            ))}
          </div>
        ))}
      </StepFlow>
      {done && (
        <OrderDone
          note="Tag abgeschlossen."
          onReopen={() => {
            onComplete(false);
            setCurrent(pages.length - 1);
          }}
        />
      )}
    </>
  );
}

const COMPLINE_MARK = 'compline';

/**
 * The evening as one row: the parts of the Vesper, and as the last mark the
 * Nachtgebet, which has its own steps. Opens at the Nachtgebet once the Vesper
 * is prayed or its hour is near.
 */
function Evening({ date, isToday }: { date: DateKey; isToday: boolean }) {
  const day = useDay(date);
  const profile = useProfile();
  const form = day.evening.vespersForm;
  const parts = getOrder('vespers', form).steps[0]!.parts;
  const last = parts.length; // index of the Nachtgebet mark
  const setForm = useFormSetter(date, 'vespersForm');
  const complete = useCompletion(date, 'vespersDone', 'Vesper gebetet');
  const [family, setFamily] = useState(readFamilyMode);

  const [current, setCurrent] = useState<number>(() => {
    const now = new Date();
    const lateEnough =
      isToday && now.getHours() * 60 + now.getMinutes() >= toMinutes(profile.schedule.compline) - 30;
    return day.evening.vespersDone || day.evening.complineDone || lateEnough ? last : 0;
  });

  const toggleFamily = () => {
    setFamily((f) => {
      try {
        localStorage.setItem(FAMILY_KEY, f ? '0' : '1');
      } catch {
        // per-device preference only
      }
      return !f;
    });
  };

  const steps = [
    ...parts.map((p, i) => ({
      id: p.kind,
      title: p.title,
      mark: i + 1,
      icon: VESPERS_ICONS[p.kind],
      done: day.evening.vespersDone,
    })),
    // Unnumbered, like "Am Bett" at the start of the morning: an order of its own.
    { id: COMPLINE_MARK, title: 'Nachtgebet', mark: '·', icon: 'moon' as const, done: day.evening.complineDone },
  ];

  const part = current < last ? parts[current] : undefined;
  const next = current < last - 1 ? parts[current + 1] : undefined;

  let footer = null;
  if (part) {
    footer = next ? (
      <button type="button" className="btn primary" onClick={() => setCurrent(current + 1)}>
        Weiter zu: {next.title}
      </button>
    ) : day.evening.vespersDone ? (
      <>
        <OrderDone note="Vesper gebetet." onReopen={() => complete(false)} />
        <button type="button" className="btn primary" onClick={() => setCurrent(last)}>
          Weiter zum Nachtgebet
        </button>
      </>
    ) : (
      <button
        type="button"
        className="btn primary"
        onClick={() => {
          complete(true);
          setCurrent(last);
        }}
      >
        Vesper abschließen
      </button>
    );
  }

  return (
    <div className={`order vespers${family && part ? ' family' : ''}`}>
      <h2>Vesper und Nachtgebet</h2>
      {part && (
        <>
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
          <p>
            <button type="button" className="btn quiet" aria-pressed={family} onClick={toggleFamily}>
              {family ? 'Familienmodus ausschalten' : 'Familienmodus: große Schrift, V und A im Wechsel'}
            </button>
          </p>
          <Rubric>{form === 'full' ? RUBRICS.vespers : RUBRICS.vespersShort}</Rubric>
        </>
      )}
      <StepFlow label="Vesper und Nachtgebet" steps={steps} current={current} onSelect={setCurrent} footer={footer}>
        {part ? <OrderPart part={part} ctx={{ order: 'vespers', form, date }} showTitle={false} /> : <Compline date={date} />}
      </StepFlow>
    </div>
  );
}

export function EveningPage() {
  const { date, isToday } = useSelectedDate();
  return <Evening key={date} date={date} isToday={isToday} />;
}
