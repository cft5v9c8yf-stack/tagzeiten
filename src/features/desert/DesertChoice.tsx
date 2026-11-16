import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { DESERT_CHOICE_LEAD, DESERT_MORE, DESERT_MORE_TITLE, DESERT_PACKS, HUSBAND_PACK, type DesertHabit, type DesertPack } from '../../content/desert';
import { WAY_CHOICE_MAX } from '../../content/husbandWay';
import { HABIT_NEEDS, RHYTHM_LABEL } from '../../content/habits';
import { useProfile, useStore } from '../../data/hooks';
import { OWN_NOTE_MAX } from '../../domain/desert';
import { isWayRun } from '../../domain/husbandWay';
import { houseHas, NEED_NOTE, type HouseNeed } from '../../domain/house';
import type { Habit, Rhythm } from '../../domain/model';
import type { WinterArcRun } from '../../domain/winterArc';
import { WaVerse, WinterArcGuide } from '../arena/WinterArcGuide';
import { WithInfo } from './DesertInfo';
import { ConfirmRow, ConfirmTrigger } from '../../ui/ConfirmRow';

type Heading = 'h4' | 'h5' | 'h6';
const RHYTHMS: readonly Rhythm[] = ['daily', 'weekly', 'monthly'];

/** One habit to choose: a checkbox with its name, the "i" beside it. */
function ChoiceRow({
  habit,
  chosen,
  onChange,
  waits,
  remove,
  locked = false,
}: {
  habit: Pick<Habit, 'id' | 'name' | 'note'>;
  chosen: boolean;
  onChange: (on: boolean) => void;
  waits?: string;
  remove?: () => void;
  locked?: boolean;
}) {
  const id = useId();
  const [confirming, setConfirming] = useState(false);
  return (
    <li className="desert-item">
      <WithInfo habit={habit}>
        <label className="desert-check" htmlFor={id}>
          <input id={id} type="checkbox" checked={chosen} disabled={locked} onChange={(e) => onChange(e.target.checked)} />
          <span>
            {habit.name}
            {waits && <span className="desert-waits">{waits}</span>}
          </span>
        </label>
      </WithInfo>
      {remove &&
        (confirming ? (
          <ConfirmRow label={`${habit.name} löschen?`} confirmLabel="Löschen" onConfirm={remove} onCancel={() => setConfirming(false)} />
        ) : (
          <ConfirmTrigger label={`${habit.name} löschen`} onClick={() => setConfirming(true)}>
            löschen …
          </ConfirmTrigger>
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
      <button type="submit" className="btn primary" disabled={!name.trim()} aria-describedby={name.trim() ? undefined : `${id}-hint`}>
        Gewohnheit hinzufügen
      </button>
      {!name.trim() && (
        <p id={`${id}-hint`} className="small muted">
          Gib der Gewohnheit zuerst einen Namen.
        </p>
      )}
      <p className="visually-hidden" aria-live="polite">
        {added && `${added} ist gewählt.`}
      </p>
    </form>
  );
}

/**
 * A package, or the further and the own habits, folded under its name (1.43.1): open while
 * something of it is chosen, else closed, so the choice stays short; it stays as the person leaves it.
 */
function Fold({
  name,
  tagline,
  chosenCount,
  H,
  children,
}: {
  name: string;
  tagline?: string;
  chosenCount: number;
  H: Heading;
  children: ReactNode;
}) {
  const id = useId();
  const [open, setOpen] = useState(chosenCount > 0);
  return (
    <section className={`desert-pack${open ? ' is-open' : ''}`} aria-label={name}>
      <H className="desert-pack-title">
        <button type="button" className="desert-pack-head" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          <span className="desert-pack-name">{name}</span>
          <span className="desert-tagline">
            {tagline}
            {tagline && chosenCount > 0 && ' · '}
            {chosenCount > 0 && `${chosenCount} gewählt`}
          </span>
        </button>
      </H>
      <div id={id} hidden={!open}>
        {open && children}
      </div>
    </section>
  );
}

/**
 * The choice of habits for a Wüstenzeit: the packages with their description
 * and verse, each with "Paket übernehmen", which adds to what is chosen, so
 * packages combine; the further habits; and the user's own. Every habit can be
 * chosen on its own, across the packages. "28 Tage für Ehemänner" shows its own
 * package only. At the end, where given, a button to finish the choice.
 */
export function DesertChoice({ run, level = 6, onDone }: { run: WinterArcRun; level?: 4 | 5 | 6; onDone?: () => void }) {
  const store = useStore();
  const profile = useProfile();
  const H = `h${level}` as Heading;
  const chosen = new Set(run.habits ?? []);
  const waits = (o: DesertHabit) => {
    const need: HouseNeed | undefined = o.needs ?? HABIT_NEEDS[o.id];
    return need && !houseHas(profile.house, need) ? NEED_NOTE[need] : undefined;
  };
  // "28 Tage für Ehemänner": at most two of those "zur Wahl" beside the core.
  const choiceFull = (pack: DesertPack) => pack.habits.filter((h) => h.art === 'wahl' && chosen.has(h.id)).length >= WAY_CHOICE_MAX;
  const row = (o: DesertHabit, pack?: DesertPack) => (
    <ChoiceRow
      key={o.id}
      habit={o}
      chosen={chosen.has(o.id)}
      waits={waits(o)}
      locked={o.art === 'wahl' && !chosen.has(o.id) && !!pack && choiceFull(pack)}
      onChange={(on) => store.chooseDesert(run.id, [o], on)}
    />
  );
  const taken = (pack: DesertPack) => pack.habits.filter((h) => h.art !== 'wahl');
  const count = (list: readonly { id: string }[]) => list.filter((h) => chosen.has(h.id)).length;
  const own = profile.habits.filter((h) => h.desert === 'own');
  const walking = isWayRun(run);
  const packs = walking ? [HUSBAND_PACK] : DESERT_PACKS.filter((pack) => !pack.needs || houseHas(profile.house, pack.needs));
  return (
    <div className="desert-choice">
      {!walking && <p className="desert-lead">{DESERT_CHOICE_LEAD}</p>}
      {packs.map((pack) => (
        <Fold key={pack.id} name={pack.name} tagline={pack.tagline} chosenCount={count(pack.habits)} H={H}>
          {pack.lead ? pack.lead.map((l) => <p key={l}>{l}</p>) : <p>{pack.description}</p>}
          <WaVerse verse={pack.verse} />
          <button
            type="button"
            className="btn small-btn desert-take"
            disabled={taken(pack).every((o) => chosen.has(o.id))}
            onClick={() => store.chooseDesert(run.id, taken(pack), true)}
          >
            Paket übernehmen
          </button>
          {pack.habits.some((h) => h.art) ? (
            <>
              <p className="small muted">Kern und wöchentlich</p>
              <ul className="desert-list">{pack.habits.filter((h) => h.art !== 'wahl').map((h) => row(h, pack))}</ul>
              <p className="small muted">Zur Wahl, höchstens {WAY_CHOICE_MAX}</p>
              <ul className="desert-list">{pack.habits.filter((h) => h.art === 'wahl').map((h) => row(h, pack))}</ul>
            </>
          ) : (
            <ul className="desert-list">{pack.habits.map((h) => row(h))}</ul>
          )}
          {pack.id === 'standard' && (
            <details className="wa-settings desert-standard">
              <summary>Anleitung zum 90-Tage-Standard</summary>
              <WinterArcGuide />
            </details>
          )}
        </Fold>
      ))}
      {!walking && (
        <>
          <Fold name={DESERT_MORE_TITLE} chosenCount={count(DESERT_MORE)} H={H}>
            <ul className="desert-list">{DESERT_MORE.map((h) => row(h))}</ul>
          </Fold>
          <Fold name="Eigene Gewohnheiten" chosenCount={count(own)} H={H}>
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
          </Fold>
        </>
      )}
      {onDone && (
        <button type="button" className="btn primary desert-choice-done" onClick={onDone}>
          Auswahl abschließen
        </button>
      )}
    </div>
  );
}
