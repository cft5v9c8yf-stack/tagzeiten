import { useState } from 'react';
import { getOrder, ORDER_MINUTES, RUBRICS, type Step as OrderStep } from '../../content/orders';
import { useToast } from '../../app/Toast';
import { useSelectedDate } from '../../app/useSelectedDate';
import { useDay, useStore } from '../../data/hooks';
import type { DateKey } from '../../domain/dates';
import type { EveningEntry, OrderForm } from '../../domain/model';
import { Segmented } from '../../ui/Choice';
import { Rubric } from '../../ui/PrayerText';
import { Section } from '../../ui/Section';
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

/** Shown under an order once it is prayed; the flow above stays open to look back. */
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

/** Vesper, one part at a time. */
function VespersFlow({
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
  const parts = getOrder('vespers', form).steps[0]!.parts;
  const [current, setCurrent] = useState<number | null>(done ? null : 0);
  const part = current === null ? undefined : parts[current];
  const next = current === null ? undefined : parts[current + 1];
  return (
    <>
      <StepFlow
        label="Vesper"
        steps={parts.map((p) => ({ id: p.kind, title: p.title, done }))}
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
              Vesper abschließen
            </button>
          )
        }
      >
        {part && <OrderPart part={part} ctx={{ order: 'vespers', form, date }} showTitle={false} />}
      </StepFlow>
      {done && (
        <OrderDone
          note="Vesper gebetet."
          onReopen={() => {
            onComplete(false);
            setCurrent(parts.length - 1);
          }}
        />
      )}
    </>
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
      prev.id = 'examination';
    } else {
      pages.push({ id: step.id, title: step.title, steps: [step] });
    }
  }
  return pages;
}

/** Nachtgebet, one step at a time. */
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
        steps={pages.map((p, i) => ({ id: p.id, title: p.title, mark: i + 1, done }))}
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
            {k > 0 && <h4 className="flow-subtitle">{step.title}</h4>}
            {step.parts.map((p) => (
              <OrderPart
                key={p.kind}
                part={p}
                ctx={{ order: 'compline', form, date }}
                showTitle={step.parts.length > 1}
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

function Vespers({ date }: { date: DateKey }) {
  const day = useDay(date);
  const form = day.evening.vespersForm;
  const setForm = useFormSetter(date, 'vespersForm');
  const complete = useCompletion(date, 'vespersDone', 'Vesper gebetet');
  const [family, setFamily] = useState(readFamilyMode);

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

  return (
    <Section id="evening.vespers" title="Vesper" level={2} className={`order vespers${family ? ' family' : ''}`}>
      <Segmented
        label="Form der Vesper"
        value={form}
        onChange={setForm}
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
      <VespersFlow key={form} date={date} form={form} done={day.evening.vespersDone} onComplete={complete} />
    </Section>
  );
}

function Compline({ date }: { date: DateKey }) {
  const day = useDay(date);
  const form = day.evening.complineForm;
  const setForm = useFormSetter(date, 'complineForm');
  const complete = useCompletion(date, 'complineDone', 'Tag abgeschlossen');

  return (
    <Section id="evening.compline" title="Nachtgebet" level={2} className="order compline">
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
    </Section>
  );
}

export function EveningPage() {
  const { date } = useSelectedDate();
  return (
    <>
      <Vespers key={`v-${date}`} date={date} />
      <Compline key={`c-${date}`} date={date} />
    </>
  );
}
