import { useState } from 'react';
import { getOrder, ORDER_MINUTES, RUBRICS } from '../../content/orders';
import { useToast } from '../../app/Toast';
import { useSelectedDate } from '../../app/useSelectedDate';
import { useDay, useStore } from '../../data/hooks';
import type { DateKey } from '../../domain/dates';
import type { EveningEntry, OrderForm } from '../../domain/model';
import { Segmented } from '../../ui/Choice';
import { Rubric } from '../../ui/PrayerText';
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
    <section className={`order vespers${family ? ' family' : ''}`} aria-labelledby="vespers-title">
      <h2 id="vespers-title">Vesper</h2>
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
        <OrderPart key={p.kind} part={p} ctx={{ order: 'vespers', form, date }} />
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
    </section>
  );
}

function Compline({ date }: { date: DateKey }) {
  const day = useDay(date);
  const form = day.evening.complineForm;
  const order = getOrder('compline', form);
  const setForm = useFormSetter(date, 'complineForm');
  const complete = useCompletion(date, 'complineDone', 'Tag abgeschlossen');

  return (
    <section className="order compline" aria-labelledby="compline-title">
      <h2 id="compline-title">Nachtgebet</h2>
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
            <h3>{step.title}</h3>
            {step.parts.map((p) => (
              <OrderPart
                key={p.kind}
                part={p}
                ctx={{ order: 'compline', form, date }}
                showTitle={step.parts.length > 1}
              />
            ))}
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
    </section>
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
