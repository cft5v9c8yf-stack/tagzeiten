import { useEffect, useId, useState } from 'react';
import { RHYTHM_LABEL } from '../../content/habits';
import { NO_SCORE_NOTE } from '../../content/about';
import { useToast } from '../../app/Toast';
import { useProfile, useStore } from '../../data/hooks';
import {
  addHabit,
  canMoveHabit,
  habitsOfRhythm,
  moveHabit,
  newHabitId,
  removeHabit,
  renameHabit,
  RHYTHM_ORDER,
  setHabitActive,
  setHabitFocus,
} from '../../domain/habits';
import { ChevronIcon, StarIcon } from '../../ui/Icons';
import type { Habit, Rhythm } from '../../domain/model';

const RHYTHMS = RHYTHM_ORDER;
type Direction = 'up' | 'down';
const GROUP_TITLE: Record<Rhythm, string> = { daily: 'Täglich', weekly: 'Wöchentlich', monthly: 'Monatlich' };

function HabitRow({
  habit,
  canUp,
  canDown,
  onMove,
}: {
  habit: Habit;
  canUp: boolean;
  canDown: boolean;
  onMove: (id: string, direction: Direction) => void;
}) {
  const store = useStore();
  const id = useId();
  const [confirming, setConfirming] = useState(false);
  const update = (fn: (hs: Habit[]) => Habit[], immediate = true) =>
    store.updateProfile((p) => ({ ...p, habits: fn(p.habits) }), { immediate });

  return (
    <li className={`habit-edit${habit.focus ? ' is-focus' : ''}`}>
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
      <span className="move-btns">
        <button
          type="button"
          id={`move-up-${habit.id}`}
          className="icon-btn"
          disabled={!canUp}
          aria-label={`${habit.name} nach oben`}
          onClick={() => onMove(habit.id, 'up')}
        >
          <ChevronIcon direction="up" />
        </button>
        <button
          type="button"
          id={`move-down-${habit.id}`}
          className="icon-btn"
          disabled={!canDown}
          aria-label={`${habit.name} nach unten`}
          onClick={() => onMove(habit.id, 'down')}
        >
          <ChevronIcon direction="down" />
        </button>
      </span>
    </li>
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
  const [refocus, setRefocus] = useState<{ id: string; direction: Direction } | null>(null);

  // Keep the keyboard focus on the moved habit's button, so it can be moved again.
  useEffect(() => {
    if (!refocus) return;
    const same = document.getElementById(`move-${refocus.direction}-${refocus.id}`) as HTMLButtonElement | null;
    const other = document.getElementById(
      `move-${refocus.direction === 'up' ? 'down' : 'up'}-${refocus.id}`,
    ) as HTMLButtonElement | null;
    (same && !same.disabled ? same : other)?.focus();
    setRefocus(null);
  }, [refocus]);

  const move = (id: string, direction: Direction) => {
    const next = store.updateProfile((p) => ({ ...p, habits: moveHabit(p.habits, id, direction) }), { immediate: true });
    const h = next.habits.find((x) => x.id === id)!;
    const group = habitsOfRhythm(next.habits, h.rhythm);
    setAnnouncement(`${h.name}: Platz ${group.findIndex((x) => x.id === id) + 1} von ${group.length}`);
    setRefocus({ id, direction });
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
        {NO_SCORE_NOTE} Eingeschaltete Gewohnheiten erscheinen auf der Startseite, in der Reihenfolge von hier. Mit dem
        Stern markierst du, worauf du gerade achten willst.
      </p>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      {RHYTHMS.map((r) => (
        <div key={r}>
          <h3>{GROUP_TITLE[r]}</h3>
          <ul className="habit-list">
            {habitsOfRhythm(profile.habits, r).map((h) => (
              <HabitRow
                key={h.id}
                habit={h}
                canUp={canMoveHabit(profile.habits, h.id, 'up')}
                canDown={canMoveHabit(profile.habits, h.id, 'down')}
                onMove={move}
              />
            ))}
          </ul>
        </div>
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
