import { useState } from 'react';
import { morningIcon } from '../../content/flowIcons';
import { getOrder, ORDER_MINUTES, RUBRICS } from '../../content/orders';
import { useToast } from '../../app/Toast';
import { useSelectedDate } from '../../app/useSelectedDate';
import { useDay, useStore } from '../../data/hooks';
import type { MorningEntry, OrderForm } from '../../domain/model';
import { Segmented } from '../../ui/Choice';
import { Rubric } from '../../ui/PrayerText';
import { StepFlow, type FlowStep } from '../../ui/StepFlow';
import { Timer } from '../../ui/Timer';
import { DonePanel, OrderHead } from '../liturgy/OrderHead';
import { OrderPart } from '../liturgy/OrderPart';

const FORMS: { value: OrderForm; label: string }[] = [
  { value: 'full', label: `Ganze Ordnung · ${ORDER_MINUTES.morning.full} Min.` },
  { value: 'short', label: `Kurzform · ${ORDER_MINUTES.morning.short} Min.` },
];

export function MorningPage() {
  const { date, isToday } = useSelectedDate();
  // A new day starts at its own first open step.
  return <MorningOrder key={date} date={date} isToday={isToday} />;
}

function MorningOrder({ date, isToday }: { date: string; isToday: boolean }) {
  const store = useStore();
  const day = useDay(date);
  const form = day.morning.form;
  const order = getOrder('morning', form);
  const firstOpen = order.steps.find((s) => !day.morning.steps[s.id]);

  const setForm = (f: OrderForm) =>
    store.updateDay(date, (d) => ({ ...d, morning: { ...d.morning, form: f } }), { immediate: true });

  const hint = day.morning.done
    ? 'Stille Zeit abgeschlossen'
    : firstOpen
      ? `Jetzt: ${firstOpen.title}, ${firstOpen.minutes} Min.`
      : '';

  return (
    <>
      {isToday && <Timer totalMinutes={ORDER_MINUTES.morning[form]} hint={hint} />}

      <OrderHead title="Stille Zeit" rubric={form === 'short' ? RUBRICS.morningShort : undefined}>
        <Segmented label="Form der Stille Zeit" options={FORMS} value={form} onChange={setForm} />
      </OrderHead>
      {form === 'short' && <p className="small muted">{RUBRICS.morningShortDrops}</p>}
      {/* The other form has other steps: it starts afresh. */}
      <MorningFlow key={form} date={date} isToday={isToday} form={form} />
    </>
  );
}

/** "Am Bett" and the steps of the order, one at a time (ui/StepFlow). */
function MorningFlow({ date, isToday, form }: { date: string; isToday: boolean; form: OrderForm }) {
  const store = useStore();
  const toast = useToast();
  const day = useDay(date);
  const order = getOrder('morning', form);
  const atBed = getOrder('atBed', 'full');

  const flow: FlowStep[] = [
    { id: 'atBed', title: 'Am Bett', mark: '·', icon: 'bed', done: day.morning.atBed },
    ...order.steps.map((s, i) => ({
      id: s.id,
      title: s.title,
      mark: i + 1,
      icon: morningIcon(s.id, form),
      done: !!day.morning.steps[s.id],
    })),
  ];

  const [current, setCurrent] = useState<number | null>(() => {
    if (day.morning.done) return null;
    const started = day.morning.atBed || order.steps.some((s) => day.morning.steps[s.id]);
    if (isToday && !started) return 0;
    const k = order.steps.findIndex((s) => !day.morning.steps[s.id]);
    return k < 0 ? null : k + 1;
  });

  const update = (fn: (m: MorningEntry) => MorningEntry) =>
    store.updateDay(date, (d) => ({ ...d, morning: fn(d.morning) }), { immediate: true });

  const leaveBed = () => {
    update((m) => ({ ...m, atBed: true }));
    setCurrent(1);
  };

  const completeStep = (index: number) => {
    const step = order.steps[index]!;
    if (index + 1 < order.steps.length) {
      update((m) => ({ ...m, steps: { ...m.steps, [step.id]: true } }));
      setCurrent(index + 2);
    } else {
      // The last step closes the order – in the short form as fully as in the long one (rule 8).
      update((m) => ({ ...m, steps: Object.fromEntries(order.steps.map((s) => [s.id, true])), done: true }));
      setCurrent(null);
      toast('Stille Zeit abgeschlossen');
    }
  };

  const reopen = () => {
    const last = order.steps.at(-1)!;
    update((m) => {
      const steps = { ...m.steps };
      delete steps[last.id];
      return { ...m, steps, done: false };
    });
    setCurrent(order.steps.length);
  };

  let content: React.ReactNode = null;
  let footer: React.ReactNode = null;
  if (current === 0) {
    content = (
      <>
        <Rubric>{RUBRICS.atBed}</Rubric>
        {atBed.steps[0]!.parts.map((p) => (
          <OrderPart key={p.kind} part={p} ctx={{ order: 'atBed', form: 'full', date }} />
        ))}
        <p className="small muted">{RUBRICS.morningMinimal}</p>
      </>
    );
    footer = (
      <button type="button" className="btn primary" onClick={leaveBed}>
        Weiter zu: {order.steps[0]!.title}
      </button>
    );
  } else if (current !== null) {
    const i = current - 1;
    const step = order.steps[i]!;
    const next = order.steps[i + 1];
    const single = step.parts.length === 1 && step.parts[0]!.title === step.title;
    content = step.parts.map((p) => (
      <OrderPart key={p.kind} part={p} ctx={{ order: 'morning', form, date }} showTitle={!single} />
    ));
    footer =
      day.morning.done && !next ? null : (
        <button type="button" className="btn primary" onClick={() => completeStep(i)}>
          {next ? `Weiter zu: ${next.title}` : 'Stille Zeit abschließen'}
        </button>
      );
  }

  return (
    <>
      <StepFlow label="Stille Zeit" steps={flow} current={current} onSelect={setCurrent} footer={footer}>
        {content}
      </StepFlow>
      {day.morning.done && current === null && (
        <DonePanel note="Stille Zeit abgeschlossen." onReopen={reopen}>
          {RUBRICS.sendOff}
        </DonePanel>
      )}
    </>
  );
}
