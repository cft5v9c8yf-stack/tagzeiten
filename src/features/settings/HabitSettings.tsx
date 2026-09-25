import { useId, useState } from 'react';
import { RHYTHM_LABEL } from '../../content/habits';
import { NO_SCORE_NOTE } from '../../content/about';
import { useToast } from '../../app/Toast';
import { useProfile, useStore } from '../../data/hooks';
import { addHabit, newHabitId, removeHabit, renameHabit, setHabitActive } from '../../domain/habits';
import type { Habit, Rhythm } from '../../domain/model';

const RHYTHMS: Rhythm[] = ['daily', 'weekly', 'monthly'];
const GROUP_TITLE: Record<Rhythm, string> = { daily: 'Täglich', weekly: 'Wöchentlich', monthly: 'Monatlich' };

function HabitRow({ habit }: { habit: Habit }) {
  const store = useStore();
  const id = useId();
  const [confirming, setConfirming] = useState(false);
  const update = (fn: (hs: Habit[]) => Habit[], immediate = true) =>
    store.updateProfile((p) => ({ ...p, habits: fn(p.habits) }), { immediate });

  return (
    <li className="habit-edit">
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
              {habit.name} anzeigen
            </label>
            <input
              type="text"
              aria-label="Name der Gewohnheit"
              defaultValue={habit.name}
              onBlur={(e) => update((hs) => renameHabit(hs, habit.id, e.target.value))}
            />
          </>
        )}
        <span className="habit-meta">
          {RHYTHM_LABEL[habit.rhythm]}
          {habit.auto && ' · aus dem Ablauf'}
          {!habit.preset && ' · eigene'}
        </span>
      </div>
      {!habit.preset &&
        (confirming ? (
          <span className="confirm-inline">
            <button type="button" className="btn danger" onClick={() => update((hs) => removeHabit(hs, habit.id))}>
              Löschen
            </button>
            <button type="button" className="btn quiet" onClick={() => setConfirming(false)}>
              Behalten
            </button>
          </span>
        ) : (
          <button type="button" className="btn quiet" onClick={() => setConfirming(true)} aria-label={`${habit.name} löschen`}>
            Löschen …
          </button>
        ))}
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
      <p className="small muted">{NO_SCORE_NOTE} Eingeschaltete Gewohnheiten erscheinen auf der Startseite.</p>
      {RHYTHMS.map((r) => (
        <div key={r}>
          <h3>{GROUP_TITLE[r]}</h3>
          <ul className="habit-list">
            {profile.habits
              .filter((h) => h.rhythm === r)
              .map((h) => (
                <HabitRow key={h.id} habit={h} />
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
