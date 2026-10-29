import { useEffect, useId, useState, type CSSProperties, type HTMLAttributes } from 'react';
import { NO_SCORE_NOTE } from '../../content/about';
import { HABIT_NEEDS, READING_HABIT } from '../../content/habits';
import { NEED_NOTE } from '../../domain/house';
import { stageOf } from '../../domain/winterArc';
import { activeDesert } from '../../domain/desert';
import { DesertChoice } from '../desert/DesertChoice';
import { useToast } from '../../app/Toast';
import { useProfile, useStore } from '../../data/hooks';
import {
  addHabit,
  newHabitId,
  placeHabit,
  removeHabit,
  renameHabit,
  setHabitActive,
  setHabitDays,
  setHabitFocus,
  setHabitWhen,
  TIMES_PER_WEEK,
  WEEKDAY_ORDER,
  fitsHouse,
  hasDays,
  shownHabit,
  whenOf,
  whenParts,
  type When,
} from '../../domain/habits';
import { WEEKDAY_LONG, WEEKDAY_SHORT, weekdayOf, type Weekday } from '../../domain/dates';
import { GripIcon, StarIcon } from '../../ui/Icons';
import { Section } from '../../ui/Section';
import { useSortable } from '../../ui/useSortable';
import type { Habit } from '../../domain/model';
import { ConfirmRow, ConfirmTrigger } from '../../ui/ConfirmRow';

const timesLabel = (n: number) => (n === 1 ? 'einmal die Woche' : `${n}-mal die Woche`);

/** When a habit is meant: one answer instead of rhythm and how often. Reading follows the plan, so it is a matter of days only. */
function WhenSelect({
  value,
  onChange,
  label,
  id,
  daysOnly = false,
}: {
  value: When;
  onChange: (when: When) => void;
  label?: string;
  id?: string;
  daysOnly?: boolean;
}) {
  return (
    <select id={id} className="habit-times" aria-label={label} value={value} onChange={(e) => onChange(e.target.value as When)}>
      <option value="daily">jeden Tag</option>
      <option value="days">an bestimmten Tagen</option>
      {!daysOnly && (
        <>
          {TIMES_PER_WEEK.map((n) => (
            <option key={n} value={`week-${n}`}>
              {timesLabel(n)}
            </option>
          ))}
          <option value="month">einmal im Monat</option>
        </>
      )}
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
          {!habit.auto && (
            <WhenSelect
              label={`Wann: ${habit.name}`}
              value={whenOf(habit)}
              daysOnly={habit.id === READING_HABIT}
              onChange={(when) => update((hs) => setHabitWhen(hs, habit.id, when, [weekdayOf(store.today())]))}
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

function HabitList({
  habits,
  hintId,
  onMoved,
}: {
  /** The habits listed: all, or only the switched-on ones. */
  habits: Habit[];
  hintId: string;
  onMoved: (id: string, viaKeyboard: boolean) => void;
}) {
  const store = useStore();
  const ids = habits.map((h) => h.id);
  // The place is meant among the habits listed; unlisted ones keep theirs around it.
  const place = (id: string, index: number) =>
    store.updateProfile(
      (p) => ({ ...p, habits: placeHabit(p.habits, id, habits.filter((x) => x.id !== id)[index]?.id ?? null) }),
      { immediate: true },
    );
  const { listRef, drag, handleProps, itemStyle } = useSortable({
    ids,
    onDrop: (id, index) => {
      place(id, index);
      onMoved(id, false);
    },
    onKeyMove: (id, direction) => {
      const to = ids.indexOf(id) + (direction === 'up' ? -1 : 1);
      if (to >= 0 && to < ids.length) place(id, to);
      onMoved(id, true);
    },
  });
  return (
    <Section id="more.habits.list" title="Meine Gewohnheiten" level={3} className="habit-card">
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
  const everydayOf = (p: typeof profile) => p.habits.filter((h) => (!h.desert || h.active) && shownHabit(h, p.well.on));
  const everyday = everydayOf(profile);
  // With "only switched on", a habit switched off in this visit stays listed, so it can be switched on again.
  const [kept, setKept] = useState(() => new Set(everyday.filter((h) => h.active).map((h) => h.id)));
  const onlyOn = profile.onlyActiveHabits;
  const listedOf = (p: typeof profile) => (p.onlyActiveHabits ? everydayOf(p).filter((h) => h.active || kept.has(h.id)) : everydayOf(p));
  const listed = listedOf(profile);
  const nameId = useId();
  const whenId = useId();
  const [name, setName] = useState('');
  const [when, setWhen] = useState<When>('daily');
  const [days, setDays] = useState<Weekday[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const [refocus, setRefocus] = useState<string | null>(null);
  const hintId = useId();
  const filterId = useId();

  // After moving by keyboard, keep the focus on the handle so it can be moved again.
  useEffect(() => {
    if (!refocus) return;
    document.getElementById(`sort-${refocus}`)?.focus();
    setRefocus(null);
  }, [refocus]);

  const moved = (id: string, viaKeyboard: boolean) => {
    const now = listedOf(store.getProfile());
    const h = now.find((x) => x.id === id)!;
    setAnnouncement(`${h.name}: Platz ${now.findIndex((x) => x.id === id) + 1} von ${now.length}`);
    if (viaKeyboard) setRefocus(id);
  };

  // Choosing fixed weekdays starts with today's weekday, so there is always one.
  const choose = (w: When) => {
    setWhen(w);
    setDays(w === 'days' ? [weekdayOf(store.today())] : []);
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { rhythm, timesPerWeek, byDays } = whenParts(when);
    store.updateProfile((p) => ({ ...p, habits: addHabit(p.habits, name, rhythm, newHabitId(), timesPerWeek, byDays ? days : []) }), { immediate: true });
    setName('');
    choose('daily');
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
      <div className="habit-filter">
        <input
          id={filterId}
          type="checkbox"
          role="switch"
          className="switch"
          checked={onlyOn}
          onChange={(e) => {
            setKept(new Set(everyday.filter((h) => h.active).map((h) => h.id)));
            store.updateProfile((p) => ({ ...p, onlyActiveHabits: e.target.checked }), { immediate: true });
          }}
        />
        <label htmlFor={filterId}>Nur eingeschaltete zeigen</label>
      </div>
      <HabitList habits={listed} hintId={hintId} onMoved={moved} />
      <DesertGroup />
      <Section id="more.habits.add" title="Eigene anlegen" level={3} className="habit-card">
      <form className="add-habit" onSubmit={add}>
        <div className="field">
          <label htmlFor={nameId}>Name</label>
          <input id={nameId} type="text" value={name} placeholder="z. B. Psalm mit den Kindern" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={whenId}>Wann</label>
          <WhenSelect id={whenId} value={when} onChange={choose} />
        </div>
        {when === 'days' && (
          <div className="field">
            <span>Tage</span>
            <DayChips label="Tage" value={days} onChange={(d) => (d.length > 0 ? setDays(d) : choose('daily'))} />
          </div>
        )}
        <button type="submit" className="btn primary" disabled={!name.trim()} aria-describedby={name.trim() ? undefined : `${whenId}-hint`}>
          Gewohnheit anlegen
        </button>
        {!name.trim() && (
          <p id={`${whenId}-hint`} className="small muted">
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
      Eingeschaltete Gewohnheiten stehen auf der Startseite, in der Reihenfolge dieser Liste. Zum Sortieren ziehst du am
      Griff, der Stern markiert, worauf du gerade achtest.
    </p>
    <p>
      Bei jeder Gewohnheit wählst du, wann sie dran ist: jeden Tag, an bestimmten Tagen, einmal oder mehrmals in der
      Woche, einmal im Monat. Was an bestimmten Tagen dran ist, steht nur an diesen Tagen unter „Heute“, an den anderen
      ruht es. Hast du etwas verschoben, trägst du es in der Wochenübersicht ein. Eine Woche mit weniger ist kein
      Versäumnis.
    </p>
  </>
);
