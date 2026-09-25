import { useEffect, useId, useState, type CSSProperties, type HTMLAttributes } from 'react';
import { RHYTHM_LABEL } from '../../content/habits';
import { NO_SCORE_NOTE } from '../../content/about';
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
  setHabitFocus,
} from '../../domain/habits';
import { GripIcon, StarIcon } from '../../ui/Icons';
import { useSortable } from '../../ui/useSortable';
import type { Habit, Rhythm } from '../../domain/model';

const RHYTHMS = RHYTHM_ORDER;
const GROUP_TITLE: Record<Rhythm, string> = { daily: 'Täglich', weekly: 'Wöchentlich', monthly: 'Monatlich' };

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
          {habit.auto ? 'aus dem Ablauf' : habit.preset ? 'Vorlage' : 'eigene'}
          {!habit.preset &&
            (confirming ? (
              <span className="confirm-inline">
                <button type="button" className="btn danger small-btn" onClick={() => update((hs) => removeHabit(hs, habit.id))}>
                  Löschen
                </button>
                <button type="button" className="btn quiet small-btn" onClick={() => setConfirming(false)}>
                  Behalten
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="link-btn"
                onClick={() => setConfirming(true)}
                aria-label={`${habit.name} löschen`}
              >
                löschen …
              </button>
            ))}
        </span>
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
    <div>
      <h3>{GROUP_TITLE[rhythm]}</h3>
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
    </div>
  );
}

export function HabitSettings() {
  const store = useStore();
  const toast = useToast();
  const profile = useProfile();
  const nameId = useId();
  const rhythmId = useId();
  const [name, setName] = useState('');
  const [rhythm, setRhythm] = useState<Rhythm>('daily');
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

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    store.updateProfile((p) => ({ ...p, habits: addHabit(p.habits, name, rhythm, newHabitId()) }), { immediate: true });
    setName('');
    toast('Gewohnheit angelegt');
  };

  return (
    <section aria-labelledby="habits-settings">
      <h2 id="habits-settings">Gewohnheiten</h2>
      <p className="small muted">
        {NO_SCORE_NOTE} Eingeschaltete Gewohnheiten erscheinen auf der Startseite, in der Reihenfolge von hier. Zum
        Sortieren am Griff ziehen. Mit dem Stern markierst du, worauf du gerade achten willst.
      </p>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      <p id={hintId} className="visually-hidden">
        Zum Verschieben ziehen oder mit den Pfeiltasten nach oben und unten bewegen.
      </p>
      {RHYTHMS.map((r) => (
        <HabitGroup key={r} rhythm={r} habits={habitsOfRhythm(profile.habits, r)} hintId={hintId} onMoved={moved} />
      ))}
      <h3>Eigene anlegen</h3>
      <form className="add-habit" onSubmit={add}>
        <div className="field">
          <label htmlFor={nameId}>Name</label>
          <input id={nameId} type="text" value={name} placeholder="z. B. Psalm mit den Kindern" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={rhythmId}>Rhythmus</label>
          <select id={rhythmId} value={rhythm} onChange={(e) => setRhythm(e.target.value as Rhythm)}>
            {RHYTHMS.map((r) => (
              <option key={r} value={r}>
                {RHYTHM_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn primary" disabled={!name.trim()}>
          Gewohnheit anlegen
        </button>
      </form>
    </section>
  );
}
