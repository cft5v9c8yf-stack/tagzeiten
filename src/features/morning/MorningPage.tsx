import { useState } from 'react';
import { morningIcon } from '../../content/flowIcons';
import { getOrder, morningOrder, ORDER_MINUTES, PETITION_MORNING, RUBRICS, type Step as OrderStepDef } from '../../content/orders';
import { useToast } from '../../app/Toast';
import { useSelectedDate } from '../../app/useSelectedDate';
import { useDay, useProfile, useStore, useToday } from '../../data/hooks';
import type { MorningEntry, OrderForm } from '../../domain/model';
import { Segmented } from '../../ui/Choice';
import { Rubric } from '../../ui/PrayerText';
import { StepFlow, type FlowStep } from '../../ui/StepFlow';
import { Timer, TimerStart } from '../../ui/Timer';
import { DonePanel, OrderHead } from '../liturgy/OrderHead';
import { OrderPart } from '../liturgy/OrderPart';
import { PetitionSheet } from '../liturgy/PetitionSheet';

const FORMS: { value: OrderForm; label: string }[] = [
  { value: 'full', label: `Ganze Ordnung · ${ORDER_MINUTES.morning.full} Min.` },
  { value: 'short', label: `Kurzform · ${ORDER_MINUTES.morning.short} Min.` },
];

/** The Dogmatik is read in the Stille Zeit. */
function useDogmatikInMorning(): boolean {
  const d = useProfile().dogmatik;
  return __DOGMATIK__ && d.on && d.stilleZeit;
}

/** The names under the marks (short: the long titles would not fit under seven marks). */
const MORNING_SHORT: Record<string, string> = {
  opening: 'Eröffnung',
  word: 'Wort',
  prayer: 'Gebet',
  response: 'Antwort',
  lordsPrayer: 'Vaterunser',
  alignment: 'Ausrichtung',
  blessing: 'Segen',
};

export function MorningPage() {
  // Left open overnight, the Stille Zeit moves on to the new day (the evening keeps its own until left).
  useToday();
  const { date, isToday } = useSelectedDate();
  // A new day starts at its own first open step.
  return <MorningOrder key={date} date={date} isToday={isToday} />;
}

function MorningOrder({ date, isToday }: { date: string; isToday: boolean }) {
  // "Freies Gebet" (chosen under Mehr): one sheet instead of the steps.
  return useProfile().petition.morning ? (
    <PetitionMorning date={date} isToday={isToday} />
  ) : (
    <MorningSteps date={date} isToday={isToday} />
  );
}

/**
 * "Freies Gebet" in the morning, the Morgengebet: the whole prayer on one sheet,
 * read at a glance and prayed with the phone laid aside, then the three things
 * for the day – the counterpart of the evening's review. No bedside prayer, no
 * minutes; closing it fulfils the Stille Zeit as fully as the order (rule 8).
 */
function PetitionMorning({ date, isToday }: { date: string; isToday: boolean }) {
  const store = useStore();
  const toast = useToast();
  const day = useDay(date);
  const done = day.morning.done;
  const [sheet, three] = PETITION_MORNING.steps as [OrderStepDef, OrderStepDef];
  const [current, setCurrent] = useState<number | null>(() => (done ? null : day.morning.steps[sheet.id] ? 1 : 0));
  const update = (fn: (m: MorningEntry) => MorningEntry) =>
    store.updateDay(date, (d) => ({ ...d, morning: fn(d.morning) }), { immediate: true });

  const leaveSheet = () => {
    // The sheet names the day's portion: it keeps the reading, as the Word does in the order.
    if (isToday || day.reading) store.setReadingDone(date, true);
    update((m) => ({ ...m, steps: { ...m.steps, [sheet.id]: true } }));
    setCurrent(1);
  };
  const close = () => {
    update((m) => ({ ...m, steps: { ...m.steps, [sheet.id]: true, [three.id]: true }, done: true }));
    setCurrent(null);
    toast('Morgengebet abgeschlossen');
  };
  const reopen = () => {
    update((m) => {
      const steps = { ...m.steps };
      delete steps[three.id];
      return { ...m, steps, done: false };
    });
    setCurrent(1);
  };

  const flow: FlowStep[] = [
    { id: sheet.id, title: sheet.title, short: sheet.title, icon: 'sunrise', done: !!day.morning.steps[sheet.id] },
    { id: three.id, title: three.title, short: three.title, icon: 'compass', done: !!day.morning.steps[three.id] },
  ];
  const footer =
    current === 0 ? (
      <button type="button" className="btn primary" onClick={leaveSheet}>
        Weiter zu: {three.title}
      </button>
    ) : current === 1 && !done ? (
      <button type="button" className="btn primary" onClick={close}>
        Morgengebet abschließen
      </button>
    ) : null;

  return (
    <>
      <OrderHead title="Morgengebet" />
      <StepFlow label="Morgengebet" steps={flow} current={current} onSelect={setCurrent} footer={footer}>
        {current === 0 && <PetitionSheet date={date} order="morning" />}
        {current === 1 && <OrderPart part={three.parts[0]!} ctx={{ order: 'morning', form: 'full', date }} showTitle={false} />}
      </StepFlow>
      {done && current === null && (
        <DonePanel note="Morgengebet gebetet." onReopen={reopen}>
          {RUBRICS.sendOff}
        </DonePanel>
      )}
    </>
  );
}

function MorningSteps({ date, isToday }: { date: string; isToday: boolean }) {
  const store = useStore();
  const day = useDay(date);
  const form = day.morning.form;
  const order = morningOrder(form, useDogmatikInMorning());
  const firstOpen = order.steps.find((s) => !day.morning.steps[s.id]);

  const setForm = (f: OrderForm) =>
    store.updateDay(date, (d) => ({ ...d, morning: { ...d.morning, form: f } }), { immediate: true });

  // "Am Bett" is the first mark of the row while it is prayed and not yet done.
  const atBedOpen = useProfile().showAtBed && !day.morning.atBed && !order.steps.some((s) => day.morning.steps[s.id]);
  const hint = day.morning.done
    ? 'Stille Zeit abgeschlossen'
    : atBedOpen
      ? 'Jetzt: Am Bett'
      : firstOpen
        ? `Jetzt: ${firstOpen.title}, ${firstOpen.minutes} Min.`
        : '';

  return (
    <>
      {isToday && <Timer totalMinutes={ORDER_MINUTES.morning[form]} hint={hint} quietUntilStarted />}

      <OrderHead
        title="Stille Zeit"
        rubric={form === 'short' ? RUBRICS.morningShort : undefined}
        aside={isToday ? <TimerStart totalMinutes={ORDER_MINUTES.morning[form]} /> : undefined}
      >
        <Segmented label="Form der Stillen Zeit" options={FORMS} value={form} onChange={setForm} />
      </OrderHead>
      {form === 'short' && <p className="small muted">{RUBRICS.morningShortDrops}</p>}
      {/* The other form has other steps: it starts afresh. */}
      <MorningFlow key={form} date={date} isToday={isToday} form={form} />
    </>
  );
}

/**
 * "Am Bett" (unless switched off under Tag und Woche) and the steps of the order,
 * one at a time (ui/StepFlow). `current` counts the marks of the row.
 */
function MorningFlow({ date, isToday, form }: { date: string; isToday: boolean; form: OrderForm }) {
  const store = useStore();
  const toast = useToast();
  const day = useDay(date);
  const order = morningOrder(form, useDogmatikInMorning());
  const atBed = getOrder('atBed', 'full');
  // One mark before the steps of the order when "Am Bett" is prayed.
  const bed = useProfile().showAtBed ? 1 : 0;

  const flow: FlowStep[] = [
    ...(bed ? [{ id: 'atBed', title: 'Am Bett', short: 'Am Bett', mark: '·', icon: 'bed' as const, done: day.morning.atBed }] : []),
    ...order.steps.map((s, i) => ({
      id: s.id,
      title: s.title,
      short: MORNING_SHORT[s.id] ?? s.title,
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
    return k < 0 ? null : k + bed;
  });

  const update = (fn: (m: MorningEntry) => MorningEntry) =>
    store.updateDay(date, (d) => ({ ...d, morning: fn(d.morning) }), { immediate: true });

  const leaveBed = () => {
    update((m) => ({ ...m, atBed: true }));
    setCurrent(1);
  };

  const completeStep = (index: number) => {
    const step = order.steps[index]!;
    // Reading the day's portion keeps the habit "Bibel lesen" and moves the plan on. A past day
    // without a portion owes nothing (rule 6).
    if (step.id === 'word' && (isToday || day.reading)) store.setReadingDone(date, true);
    if (index + 1 < order.steps.length) {
      update((m) => ({ ...m, steps: { ...m.steps, [step.id]: true } }));
      setCurrent(index + 1 + bed);
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
    setCurrent(order.steps.length - 1 + bed);
  };

  let content: React.ReactNode = null;
  let footer: React.ReactNode = null;
  if (bed && current === 0) {
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
    const i = current - bed;
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
