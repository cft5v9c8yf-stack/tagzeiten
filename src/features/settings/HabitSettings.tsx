import { useEffect, useId, useState, type CSSProperties, type HTMLAttributes } from 'react';
import { NO_SCORE_NOTE } from '../../content/about';
import { HABIT_NEEDS, RHYTHM_LABEL } from '../../content/habits';
import { NEED_NOTE } from '../../domain/house';
import { stageOf } from '../../domain/winterArc';
import { activeDesert } from '../../domain/desert';
import { DesertChoice } from '../desert/DesertChoice';
import { useToast } from '../../app/Toast';
import { useProfile, useStore } from '../../data/hooks';
import {
  addHabit,
  habitsOfRhythm,
  moveHabit,
  moveHabitTo,
  newHabitId,
  removeHabit,
  renameHabit,
  RHYTHM_ORDER,
  setHabitActive,
  setHabitDays,
  setHabitFocus,
  setHabitTimes,
  TIMES_PER_WEEK,
  WEEKDAY_ORDER,
  fitsHouse,
  hasDays,
  shownHabit,
} from '../../domain/habits';
import { WEEKDAY_LONG, WEEKDAY_SHORT, weekdayOf, type Weekday } from '../../domain/dates';
import { GripIcon, StarIcon } from '../../ui/Icons';
import { Section } from '../../ui/Section';
import { useSortable } from '../../ui/useSortable';
import type { Habit, Rhythm } from '../../domain/model';
import { ConfirmRow, ConfirmTrigger } from '../../ui/ConfirmRow';

const RHYTHMS = RHYTHM_ORDER;
const GROUP_TITLE: Record<Rhythm, string> = { daily: 'Täglich', weekly: 'Wöchentlich', monthly: 'Monatlich' };

const timesLabel = (n: number) => (n === 1 ? 'einmal die Woche' : `${n}-mal die Woche`);

/** How many days a week a weekly habit is meant for, or 0 for fixed weekdays. */
function TimesSelect({ value, onChange, label, id }: { value: number; onChange: (n: number) => void; label?: string; id?: string }) {
  return (
    <select id={id} className="habit-times" aria-label={label} value={value} onChange={(e) => onChange(Number(e.target.value))}>
      {TIMES_PER_WEEK.map((n) => (
        <option key={n} value={n}>
          {timesLabel(n)}
        </option>
      ))}
      <option value={0}>an bestimmten Tagen</option>
    </select>
  );
}

/** A daily habit: every day, or fixed weekdays (0 stands for fixed weekdays). */
function EveryDaySelect({ byDays, onChange, label, id }: { byDays: boolean; onChange: (byDays: boolean) => void; label?: string; id?: string }) {
  return (
    <select id={id} className="habit-times" aria-label={label} value={byDays ? 0 : 1} onChange={(e) => onChange(e.target.value === '0')}>
      <option value={1}>jeden Tag</option>
      <option value={0}>an bestimmten Tagen</option>
    </select>
  );
}

/** The seven weekdays to tick, all of one size. The last one cannot be taken off: then it is every day again. */
function DayChips({ value, onChange, label }: { value: readonly Weekday[]; onChange: (days: Weekday[]) => void; label: string }) {
  return (
    <div className="day-chips" role="group" aria-label={label}>
      {WEEKDAY_ORDER.map((d) => (
        <button
          key={d}
          type="button"
          className="day-chip"
          aria-pressed={value.includes(d)}
          aria-label={WEEKDAY_LONG[d]}
          onClick={() => onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d])}
        >
          {WEEKDAY_SHORT[d]}
        </button>
      ))}
    </div>
  );
}

function HabitRow({
  habit,
  handle,
  style,
  dragging,
  hintId,
}: {
  habit: Habit;
  handle: HTMLAttributes<HTMLButtonElement>;
  style: CSSProperties | undefined;
  dragging: boolean;
  hintId: string;
}) {
  const store = useStore();
  const id = useId();
  const [confirming, setConfirming] = useState(false);
  const profile = useProfile();
  const update = (fn: (hs: Habit[]) => Habit[], immediate = true) =>
    store.updateProfile((p) => ({ ...p, habits: fn(p.habits) }), { immediate });

  return (
    <li
      className={`habit-edit${habit.focus ? ' is-focus' : ''}${dragging ? ' is-dragging' : ''}`}
      data-sort-id={habit.id}
      style={style}
    >
      <button
        type="button"
        id={`sort-${habit.id}`}
        className="icon-btn drag-handle"
        aria-label={`${habit.name} verschieben`}
        aria-describedby={hintId}
        {...handle}
      >
        <GripIcon />
      </button>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="switch"
        checked={habit.active}
        onChange={(e) => update((hs) => setHabitActive(hs, habit.id, e.target.checked))}
      />
      <div className="habit-edit-main">
        {habit.preset ? (
          <label htmlFor={id}>{habit.name}</label>
        ) : (
          <>
            <label htmlFor={id} className="visually-hidden">
              {habit.name}
            </label>
            <input
              type="text"
              aria-label={`Name der Gewohnheit ${habit.name}`}
              defaultValue={habit.name}
              onBlur={(e) => update((hs) => renameHabit(hs, habit.id, e.target.value))}
            />
          </>
        )}
        <span className="habit-meta">
          <span className="habit-kind">{habit.auto ? 'aus dem Ablauf' : habit.preset ? 'Vorlage' : habit.desert ? 'aus der Wüstenzeit' : 'eigene'}</span>
          {habit.active && !fitsHouse(habit, profile.house) && (
            <span className="habit-kind habit-waits">{NEED_NOTE[HABIT_NEEDS[habit.id]!]}</span>
          )}
          {habit.rhythm === 'daily' && !habit.auto && (
            <EveryDaySelect
              label={`Wie oft: ${habit.name}`}
              byDays={hasDays(habit)}
              onChange={(byDays) => update((hs) => setHabitDays(hs, habit.id, byDays ? [weekdayOf(store.today())] : []))}
            />
          )}
          {habit.rhythm === 'weekly' && !habit.auto && (
            <TimesSelect
              label={`Wie oft in der Woche: ${habit.name}`}
              value={hasDays(habit) ? 0 : (habit.timesPerWeek ?? 1)}
              onChange={(n) =>
                update((hs) => (n === 0 ? setHabitDays(hs, habit.id, [weekdayOf(store.today())]) : setHabitTimes(hs, habit.id, n)))
              }
            />
          )}
          {!habit.preset &&
            (confirming ? (
              <ConfirmRow
                label={`${habit.name} löschen?`}
                confirmLabel="Löschen"
                onConfirm={() => update((hs) => removeHabit(hs, habit.id))}
                onCancel={() => setConfirming(false)}
              />
            ) : (
              <ConfirmTrigger label={`${habit.name} löschen`} onClick={() => setConfirming(true)}>
                löschen …
              </ConfirmTrigger>
            ))}
        </span>
        {hasDays(habit) && (
          <DayChips
            label={`Tage: ${habit.name}`}
            value={habit.days!}
            onChange={(days) => update((hs) => setHabitDays(hs, habit.id, days))}
          />
        )}
      </div>
      <button
        type="button"
        className="icon-btn star-btn"
        aria-pressed={habit.focus}
        aria-label={`Fokus: ${habit.name}`}
        title={habit.focus ? 'Fokus – antippen zum Entfernen' : 'Als Fokus markieren'}
        onClick={() => update((hs) => setHabitFocus(hs, habit.id, !habit.focus))}
      >
        <StarIcon filled={habit.focus} />
      </button>
    </li>
  );
}

function HabitGroup({
  rhythm,
  habits,
  hintId,
  onMoved,
}: {
  rhythm: Rhythm;
  habits: Habit[];
  hintId: string;
  onMoved: (id: string, viaKeyboard: boolean) => void;
}) {
  const store = useStore();
  const ids = habits.map((h) => h.id);
  const { listRef, drag, handleProps, itemStyle } = useSortable({
    ids,
    onDrop: (id, index) => {
      store.updateProfile((p) => ({ ...p, habits: moveHabitTo(p.habits, id, index) }), { immediate: true });
      onMoved(id, false);
    },
    onKeyMove: (id, direction) => {
      store.updateProfile((p) => ({ ...p, habits: moveHabit(p.habits, id, direction) }), { immediate: true });
      onMoved(id, true);
    },
  });
  return (
    <Section
      id={`more.habits.${rhythm}`}
      title={GROUP_TITLE[rhythm]}
      level={3}
      className="habit-card"
      aside={`${habits.filter((h) => h.active).length} von ${habits.length} eingeschaltet`}
    >
      <ul className={`habit-list${drag ? ' sorting' : ''}`} ref={(el) => (listRef.current = el)}>
        {habits.map((h) => (
          <HabitRow
            key={h.id}
            habit={h}
            handle={handleProps(h.id)}
            style={itemStyle(h.id)}
            dragging={drag?.id === h.id}
            hintId={hintId}
          />
        ))}
      </ul>
    </Section>
  );
}

export function HabitSettings() {
  const store = useStore();
  const toast = useToast();
  const profile = useProfile();
  // Habits taken in only for the Wüstenzeit stand here once they are taken over into everyday life.
  const everyday = profile.habits.filter((h) => (!h.desert || h.active) && shownHabit(h, profile.well.on));
  const nameId = useId();
  const rhythmId = useId();
  const [name, setName] = useState('');
  const [rhythm, setRhythm] = useState<Rhythm>('daily');
  const [times, setTimes] = useState(1);
  const [byDays, setByDays] = useState(false);
  const [days, setDays] = useState<Weekday[]>([]);
  const timesId = useId();
  const [announcement, setAnnouncement] = useState('');
  const [refocus, setRefocus] = useState<string | null>(null);
  const hintId = useId();

  // After moving by keyboard, keep the focus on the handle so it can be moved again.
  useEffect(() => {
    if (!refocus) return;
    document.getElementById(`sort-${refocus}`)?.focus();
    setRefocus(null);
  }, [refocus]);

  const moved = (id: string, viaKeyboard: boolean) => {
    const habits = store.getProfile().habits;
    const h = habits.find((x) => x.id === id)!;
    const group = habitsOfRhythm(habits, h.rhythm);
    setAnnouncement(`${h.name}: Platz ${group.findIndex((x) => x.id === id) + 1} von ${group.length}`);
    if (viaKeyboard) setRefocus(id);
  };

  // Choosing fixed weekdays starts with today's weekday, so there is always one.
  const chooseDays = (on: boolean) => {
    setByDays(on);
    setDays(on ? [weekdayOf(store.today())] : []);
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const chosen = rhythm !== 'monthly' && byDays ? days : [];
    store.updateProfile((p) => ({ ...p, habits: addHabit(p.habits, name, rhythm, newHabitId(), times, chosen) }), { immediate: true });
    setName('');
    setTimes(1);
    setByDays(false);
    setDays([]);
    toast('Gewohnheit angelegt');
  };

  return (
    <>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      <p id={hintId} className="visually-hidden">
        Zum Verschieben ziehen oder mit den Pfeiltasten nach oben und unten bewegen.
      </p>
      {RHYTHMS.map((r) => (
        <HabitGroup key={r} rhythm={r} habits={habitsOfRhythm(everyday, r)} hintId={hintId} onMoved={moved} />
      ))}
      <DesertGroup />
      <Section id="more.habits.add" title="Eigene anlegen" level={3} className="habit-card">
      <form className="add-habit" onSubmit={add}>
        <div className="field">
          <label htmlFor={nameId}>Name</label>
          <input id={nameId} type="text" value={name} placeholder="z. B. Psalm mit den Kindern" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={rhythmId}>Rhythmus</label>
          <select
            id={rhythmId}
            value={rhythm}
            onChange={(e) => {
              setRhythm(e.target.value as Rhythm);
              chooseDays(false);
            }}
          >
            {RHYTHMS.map((r) => (
              <option key={r} value={r}>
                {RHYTHM_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
        {rhythm === 'weekly' && (
          <div className="field">
            <label htmlFor={timesId}>Wie oft in der Woche</label>
            <TimesSelect id={timesId} value={byDays ? 0 : times} onChange={(n) => (n === 0 ? chooseDays(true) : (chooseDays(false), setTimes(n)))} />
          </div>
        )}
        {rhythm === 'daily' && (
          <div className="field">
            <label htmlFor={timesId}>Wie oft</label>
            <EveryDaySelect id={timesId} byDays={byDays} onChange={chooseDays} />
          </div>
        )}
        {byDays && (
          <div className="field">
            <span id={`${timesId}-days`}>Tage</span>
            <DayChips label="Tage" value={days} onChange={(d) => (d.length > 0 ? setDays(d) : chooseDays(false))} />
          </div>
        )}
        <button type="submit" className="btn primary" disabled={!name.trim()} aria-describedby={name.trim() ? undefined : `${timesId}-hint`}>
          Gewohnheit anlegen
        </button>
        {!name.trim() && (
          <p id={`${timesId}-hint`} className="small muted">
            Gib der Gewohnheit zuerst einen Namen.
          </p>
        )}
      </form>
      </Section>
    </>
  );
}

/** While a Wüstenzeit runs, its habits are chosen here too, as under Tag und Woche and in the Arena. */
function DesertGroup() {
  const profile = useProfile();
  const store = useStore();
  const run = activeDesert(profile.winterArc);
  if (!run || stageOf(run, store.today()) === 'after') return null;
  return (
    <Section id="more.habits.desert" title="Wüstenzeit" level={3} className="habit-card">
      <p className="small muted">
        Solange die Wüstenzeit läuft, stehen ihre Gewohnheiten unter „Heute“ zuerst, als eigene Gruppe. Ein Haken gilt
        überall. Was du abwählst, verschwindet aus der Gruppe; seine Haken bleiben erhalten.
      </p>
      <DesertChoice run={run} level={4} />
    </Section>
  );
}

export const HABITS_INFO = (
  <>
    <p>{NO_SCORE_NOTE}</p>
    <p>
      Eingeschaltete Gewohnheiten erscheinen auf der Startseite, in der Reihenfolge von hier. Zum Sortieren am Griff
      ziehen. Mit dem Stern markierst du, worauf du gerade achten willst.
    </p>
    <p>
      Bei wöchentlichen Gewohnheiten legst du fest, wie oft in der Woche, etwa Sport dreimal. Dann trägst du sie Tag für
      Tag ein, und unter „Heute“ steht, wie oft sie diese Woche eingetragen ist. Eine Woche mit weniger ist kein Versäumnis.
    </p>
    <p>
      Eine Gewohnheit kannst du auch an feste Wochentage binden, etwa den Long Run am Samstag oder die Bibelstunde am
      Montag. Unter „Heute“ steht sie dann nur an diesen Tagen. An den anderen Tagen ist sie nicht fällig, das ist kein
      Versäumnis; wer sie einmal verschiebt, trägt sie in der Wochenübersicht am anderen Tag ein.
    </p>
  </>
);
