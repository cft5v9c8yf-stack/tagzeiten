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

function Vespers({ date }: { date: DateKey }) {
  const day = useDay(date);
  const form = day.evening.vespersForm;
  const order = getOrder('vespers', form);
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
      {order.steps[0]!.parts.map((p) => (
        <OrderPart key={p.kind} part={p} ctx={{ order: 'vespers', form, date }} headingLevel={3} />
      ))}
      <div className="order-end">
        {day.evening.vespersDone ? (
          <>
            <p className="done-note">Vesper gebetet.</p>
            <button type="button" className="btn quiet" onClick={() => complete(false)}>
              Abschluss zurücknehmen
            </button>
          </>
        ) : (
          <button type="button" className="btn primary" onClick={() => complete(true)}>
            Vesper abschließen
          </button>
        )}
      </div>
    </Section>
  );
}

function ComplineStep({ step, form, date }: { step: OrderStep; form: OrderForm; date: DateKey }) {
  const parts = step.parts.map((p) => (
    <OrderPart key={p.kind} part={p} ctx={{ order: 'compline', form, date }} showTitle={step.parts.length > 1} />
  ));
  // Confession and absolution stay open: the examination always ends in the word of forgiveness (rule 1).
  if (step.parts.some((p) => p.kind === 'absolution')) {
    return (
      <>
        <h3 className="compline-step-title">{step.title}</h3>
        {parts}
      </>
    );
  }
  return (
    <Section id={`part.compline.step.${step.id}`} title={step.title} level={3}>
      {parts}
    </Section>
  );
}

function Compline({ date }: { date: DateKey }) {
  const day = useDay(date);
  const form = day.evening.complineForm;
  const order = getOrder('compline', form);
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
      <ol className="compline-steps">
        {order.steps.map((step) => (
          <li key={step.id} className={`compline-step step-${step.id}`}>
            <ComplineStep step={step} form={form} date={date} />
          </li>
        ))}
      </ol>
      <div className="order-end">
        {day.evening.complineDone ? (
          <>
            <p className="done-note">Tag abgeschlossen.</p>
            <button type="button" className="btn quiet" onClick={() => complete(false)}>
              Abschluss zurücknehmen
            </button>
          </>
        ) : (
          <button type="button" className="btn primary" onClick={() => complete(true)}>
            Tag abschließen
          </button>
        )}
      </div>
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
