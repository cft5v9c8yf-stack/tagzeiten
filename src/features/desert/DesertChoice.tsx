import { useId, useState, type FormEvent } from 'react';
import { DESERT_CHOICE_LEAD, DESERT_MORE, DESERT_MORE_TITLE, DESERT_PACKS, type DesertHabit } from '../../content/desert';
import { HABIT_NEEDS, RHYTHM_LABEL } from '../../content/habits';
import { useProfile, useStore } from '../../data/hooks';
import { OWN_NOTE_MAX } from '../../domain/desert';
import { houseHas, NEED_NOTE, type HouseNeed } from '../../domain/house';
import type { Habit, Rhythm } from '../../domain/model';
import type { WinterArcRun } from '../../domain/winterArc';
import { WaVerse } from '../arena/WinterArcGuide';
import { WithInfo } from './DesertInfo';

type Heading = 'h4' | 'h5' | 'h6';
const RHYTHMS: readonly Rhythm[] = ['daily', 'weekly', 'monthly'];

/** One habit to choose: a checkbox with its name, the "i" beside it. */
function ChoiceRow({
  habit,
  chosen,
  onChange,
  waits,
  remove,
}: {
  habit: Pick<Habit, 'id' | 'name' | 'note'>;
  chosen: boolean;
  onChange: (on: boolean) => void;
  waits?: string;
  remove?: () => void;
}) {
  const id = useId();
  const [confirming, setConfirming] = useState(false);
  return (
    <li className="desert-item">
      <WithInfo habit={habit}>
        <label className="desert-check" htmlFor={id}>
          <input id={id} type="checkbox" checked={chosen} onChange={(e) => onChange(e.target.checked)} />
          <span>
            {habit.name}
            {waits && <span className="desert-waits">{waits}</span>}
          </span>
        </label>
      </WithInfo>
      {remove &&
        (confirming ? (
          <span className="confirm-inline">
            <button type="button" className="btn small-btn" onClick={remove}>
              Löschen
            </button>
            <button type="button" className="btn quiet small-btn" onClick={() => setConfirming(false)}>
              Behalten
            </button>
          </span>
        ) : (
          <button type="button" className="link-btn desert-remove" aria-label={`${habit.name} löschen`} onClick={() => setConfirming(true)}>
            löschen …
          </button>
        ))}
    </li>
  );
}

/** A habit of the user's own: a title and, if wanted, a description. */
function AddOwn({ run, H }: { run: WinterArcRun; H: Heading }) {
  const store = useStore();
  const id = useId();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [rhythm, setRhythm] = useState<Rhythm>('daily');
  const [added, setAdded] = useState('');
  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    store.addOwnDesert(run.id, { name, note, rhythm });
    setAdded(name.trim());
    setName('');
    setNote('');
  };
  return (
    <form className="desert-add" onSubmit={add} aria-labelledby={`${id}-title`}>
      <H id={`${id}-title`} className="visually-hidden">
        Eigene Gewohnheit hinzufügen
      </H>
      <div className="field">
        <label htmlFor={`${id}-name`}>Titel</label>
        <input id={`${id}-name`} type="text" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor={`${id}-note`}>Beschreibung (wenn du willst)</label>
        <textarea id={`${id}-note`} rows={2} maxLength={OWN_NOTE_MAX} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor={`${id}-rhythm`}>Rhythmus</label>
        <select id={`${id}-rhythm`} value={rhythm} onChange={(e) => setRhythm(e.target.value as Rhythm)}>
          {RHYTHMS.map((r) => (
            <option key={r} value={r}>
              {RHYTHM_LABEL[r]}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn primary" disabled={!name.trim()}>
        Gewohnheit hinzufügen
      </button>
      <p className="visually-hidden" aria-live="polite">
        {added && `${added} ist gewählt.`}
      </p>
    </form>
  );
}

/**
 * The choice of habits for a Wüstenzeit: the four packages with their
 * description and verse, each with "Paket übernehmen"; the further habits; and
 * the user's own. Every habit can be chosen on its own, across the packages.
 */
export function DesertChoice({ run, level = 6 }: { run: WinterArcRun; level?: 4 | 5 | 6 }) {
  const store = useStore();
  const profile = useProfile();
  const H = `h${level}` as Heading;
  const chosen = new Set(run.habits ?? []);
  const waits = (o: DesertHabit) => {
    const need: HouseNeed | undefined = o.needs ?? HABIT_NEEDS[o.id];
    return need && !houseHas(profile.house, need) ? NEED_NOTE[need] : undefined;
  };
  const row = (o: DesertHabit) => (
    <ChoiceRow
      key={o.id}
      habit={o}
      chosen={chosen.has(o.id)}
      waits={waits(o)}
      onChange={(on) => store.chooseDesert(run.id, [o], on)}
    />
  );
  const own = profile.habits.filter((h) => h.desert === 'own');
  return (
    <div className="desert-choice">
      <p className="desert-lead">{DESERT_CHOICE_LEAD}</p>
      {DESERT_PACKS.map((pack) => (
        <section key={pack.id} className="desert-pack" aria-label={pack.name}>
          <H>{pack.name}</H>
          <p className="desert-tagline">{pack.tagline}</p>
          <p>{pack.description}</p>
          <WaVerse verse={pack.verse} />
          <button
            type="button"
            className="btn small-btn desert-take"
            disabled={pack.habits.every((o) => chosen.has(o.id))}
            onClick={() => store.chooseDesert(run.id, pack.habits, true)}
          >
            Paket übernehmen
          </button>
          <ul className="desert-list">{pack.habits.map(row)}</ul>
        </section>
      ))}
      <section className="desert-pack" aria-label={DESERT_MORE_TITLE}>
        <H>{DESERT_MORE_TITLE}</H>
        <ul className="desert-list">{DESERT_MORE.map(row)}</ul>
      </section>
      <section className="desert-pack" aria-label="Eigene Gewohnheiten">
        <H>Eigene Gewohnheiten</H>
        {own.length > 0 && (
          <ul className="desert-list">
            {own.map((h) => (
              <ChoiceRow
                key={h.id}
                habit={h}
                chosen={chosen.has(h.id)}
                onChange={(on) => store.chooseOwnDesert(run.id, h.id, on)}
                remove={() => store.deleteOwnDesert(h.id)}
              />
            ))}
          </ul>
        )}
        <AddOwn run={run} H={H} />
      </section>
    </div>
  );
}
