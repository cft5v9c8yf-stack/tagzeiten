import { useEffect, useRef, useState } from 'react';
import { getOrder, ORDER_MINUTES, RUBRICS } from '../../content/orders';
import { useToast } from '../../app/Toast';
import { useSelectedDate } from '../../app/useSelectedDate';
import { useDay, useStore } from '../../data/hooks';
import type { OrderForm } from '../../domain/model';
import { Segmented } from '../../ui/Choice';
import { Rubric } from '../../ui/PrayerText';
import { Step } from '../../ui/Step';
import { Timer } from '../../ui/Timer';
import { OrderPart } from '../liturgy/OrderPart';

const FORMS: { value: OrderForm; label: string }[] = [
  { value: 'full', label: `Ganze Ordnung · ${ORDER_MINUTES.morning.full} Min.` },
  { value: 'short', label: `Kurzform · ${ORDER_MINUTES.morning.short} Min.` },
];

export function MorningPage() {
  const { date, isToday } = useSelectedDate();
  // A new day starts with fresh accordion state.
  return <MorningOrder key={date} date={date} isToday={isToday} />;
}

function MorningOrder({ date, isToday }: { date: string; isToday: boolean }) {
  const store = useStore();
  const toast = useToast();
  const day = useDay(date);
  const form = day.morning.form;
  const order = getOrder('morning', form);
  const atBed = getOrder('atBed', 'full');
  const firstOpen = order.steps.find((s) => !day.morning.steps[s.id]);

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(firstOpen ? [firstOpen.id] : []));
  const [atBedOpen, setAtBedOpen] = useState(!day.morning.atBed && !day.morning.done && isToday);
  const scrollTo = useRef<string | null>(null);

  // After completing a step, bring the next one into view.
  useEffect(() => {
    if (!scrollTo.current) return;
    const el = document.getElementById(`step-${scrollTo.current}`);
    scrollTo.current = null;
    el?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [expanded]);

  const toggle = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const setForm = (f: OrderForm) =>
    store.updateDay(date, (d) => ({ ...d, morning: { ...d.morning, form: f } }), { immediate: true });

  const completeStep = (index: number) => {
    const step = order.steps[index]!;
    const next = order.steps[index + 1];
    if (next) {
      store.updateDay(date, (d) => ({ ...d, morning: { ...d.morning, steps: { ...d.morning.steps, [step.id]: true } } }), {
        immediate: true,
      });
      scrollTo.current = next.id;
      setExpanded(new Set([next.id]));
    } else {
      // The last step closes the order – in the short form as fully as in the long one (rule 8).
      store.updateDay(
        date,
        (d) => ({
          ...d,
          morning: { ...d.morning, steps: Object.fromEntries(order.steps.map((s) => [s.id, true])), done: true },
        }),
        { immediate: true },
      );
      setExpanded(new Set());
      toast('Stille Zeit abgeschlossen');
    }
  };

  const reopenStep = (id: string) => {
    store.updateDay(
      date,
      (d) => {
        const steps = { ...d.morning.steps };
        delete steps[id];
        return { ...d, morning: { ...d.morning, steps, done: false } };
      },
      { immediate: true },
    );
    setExpanded(new Set([id]));
  };

  const reopenAll = () => {
    store.updateDay(date, (d) => ({ ...d, morning: { ...d.morning, done: false } }), { immediate: true });
    const last = order.steps.at(-1);
    if (last) reopenStep(last.id);
  };

  const hint = day.morning.done
    ? 'Stille Zeit abgeschlossen'
    : firstOpen
      ? `Jetzt: ${firstOpen.title}, ${firstOpen.minutes} Min.`
      : '';

  return (
    <>
      {isToday && <Timer totalMinutes={ORDER_MINUTES.morning[form]} hint={hint} />}

      <h2>Stille Zeit</h2>
      <Segmented label="Form der Stille Zeit" options={FORMS} value={form} onChange={setForm} />
      {form === 'short' && (
        <>
          <Rubric>{RUBRICS.morningShort}</Rubric>
          <p className="small muted">{RUBRICS.morningShortDrops}</p>
        </>
      )}

      <Step
        no="·"
        title="Am Bett"
        minutes={3}
        done={day.morning.atBed}
        expanded={atBedOpen}
        onToggle={() => setAtBedOpen((o) => !o)}
        footer={
          <label className="check">
            <input
              type="checkbox"
              checked={day.morning.atBed}
              onChange={(e) =>
                store.updateDay(date, (d) => ({ ...d, morning: { ...d.morning, atBed: e.target.checked } }), { immediate: true })
              }
            />
            Am Bett gebetet
          </label>
        }
      >
        <Rubric>{RUBRICS.atBed}</Rubric>
        {atBed.steps[0]!.parts.map((p) => (
          <OrderPart key={p.kind} part={p} ctx={{ order: 'atBed', form: 'full', date }} />
        ))}
        <p className="small muted">{RUBRICS.morningMinimal}</p>
      </Step>

      {order.steps.map((step, i) => {
        const done = !!day.morning.steps[step.id];
        const next = order.steps[i + 1];
        const single = step.parts.length === 1 && step.parts[0]!.title === step.title;
        return (
          <Step
            key={`${form}-${step.id}`}
            id={`step-${step.id}`}
            no={i + 1}
            title={step.title}
            minutes={step.minutes}
            done={done}
            expanded={expanded.has(step.id)}
            onToggle={() => toggle(step.id)}
            footer={
              done ? (
                <button type="button" className="btn quiet" onClick={() => reopenStep(step.id)}>
                  Schritt wieder öffnen
                </button>
              ) : (
                <button type="button" className="btn primary" onClick={() => completeStep(i)}>
                  {next ? `Weiter zu: ${next.title}` : 'Stille Zeit abschließen'}
                </button>
              )
            }
          >
            {step.parts.map((p) => (
              <OrderPart key={p.kind} part={p} ctx={{ order: 'morning', form, date }} showTitle={!single} />
            ))}
          </Step>
        );
      })}

      {day.morning.done && (
        <div className="panel done-panel">
          <p>
            <b>Stille Zeit abgeschlossen.</b> {RUBRICS.sendOff}
          </p>
          <button type="button" className="btn quiet" onClick={reopenAll}>
            Abschluss zurücknehmen
          </button>
        </div>
      )}
    </>
  );
}
