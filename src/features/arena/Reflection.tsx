import { useId, useState } from 'react';
import { useToast } from '../../app/Toast';
import { WELL_COMFORT } from '../../content/well';
import { REFLECTION_CARDS, REFLECTION_VERSE, type ReflectionCard } from '../../content/reflection';
import { RHYTHM_LABEL } from '../../content/habits';
import { useStore } from '../../data/hooks';
import { addHabit, newHabitId, RHYTHM_ORDER } from '../../domain/habits';
import type { Rhythm } from '../../domain/model';
import { BibleRef } from '../../ui/BibleRef';

const draftKey = (id: string) => `tz:reflexion:${id}`;
const SEEN_KEY = 'tz:reflexion-seen';
const ENTRY_TITLE = 'Reflexion';

interface Plan {
  name: string;
  rhythm: Rhythm;
}
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** An unsent text, kept on the device only (a convenience; it goes with "tz:" when everything is deleted). */
function readDraft(id: string): string {
  try {
    return localStorage.getItem(draftKey(id)) ?? '';
  } catch {
    return '';
  }
}

function writeDraft(id: string, text: string) {
  try {
    if (text) localStorage.setItem(draftKey(id), text);
    else localStorage.removeItem(draftKey(id));
  } catch {
    // Only a convenience.
  }
}

/** Whether a Reflexion was laid down on this device before: then the questions start folded. */
function seenBefore(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Only a convenience.
  }
}

/** One question: its title with the "i" that unfolds the question, and the field to write in. */
function Question({
  card,
  value,
  open,
  onToggle,
  onChange,
}: {
  card: ReflectionCard;
  value: string;
  open: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
}) {
  const fieldId = useId();
  const askId = useId();
  return (
    <section className="reflection-card" aria-labelledby={`refl-${card.id}`}>
      <div className="reflection-head">
        <h3 id={`refl-${card.id}`}>{card.title}</h3>
        <button
          type="button"
          className="reflection-i"
          aria-expanded={open}
          aria-controls={askId}
          aria-label={`Frage zu „${card.title}“ ${open ? 'zuklappen' : 'aufklappen'}`}
          onClick={onToggle}
        >
          i
        </button>
      </div>
      {open && (
        <div id={askId} className="reflection-ask">
          {card.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      )}
      <div className="field">
        <label htmlFor={fieldId} className="visually-hidden">
          {card.title}
        </label>
        <textarea id={fieldId} rows={6} value={value} placeholder="Was ich dazu vor Gott sage …" onChange={(e) => onChange(e.target.value)} />
      </div>
    </section>
  );
}

/**
 * The Reflexion: the Word first, then the questions one under the other (the question itself unfolds
 * behind the "i"), the word of forgiveness, the habits, and the button that lays it down as the open
 * entry. Sin and weakness may be written here, by exception to rule 9 (25.10.2026); the questions end
 * in the word of forgiveness (rule 1), and the resolve stands last (rule 2).
 */
export function Reflection({ entryId }: { entryId: string }) {
  const store = useStore();
  const toast = useToast();
  const nameId = useId();
  const rhythmId = useId();
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(REFLECTION_CARDS.map((c) => [c.id, readDraft(c.id)])),
  );
  // The first question stands open the first time; afterwards all are folded.
  const [open, setOpen] = useState<Record<string, boolean>>(() => ({ [REFLECTION_CARDS[0]!.id]: !seenBefore() }));
  // Habits laid down at the end: planned in the list, then taken into the habits.
  const [plans, setPlans] = useState<Plan[]>([]);
  const [taken, setTaken] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [rhythm, setRhythm] = useState<Rhythm>('daily');
  const answered = REFLECTION_CARDS.filter((c) => answers[c.id]!.trim());

  const change = (id: string, v: string) => {
    setAnswers((a) => ({ ...a, [id]: v }));
    writeDraft(id, v);
  };
  const plan = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n || plans.some((x) => same(x.name, n))) return;
    setPlans([...plans, { name: n, rhythm }]);
    setName('');
  };
  const adopt = () => {
    const known = store.getProfile().habits.map((h) => h.name);
    const fresh = plans.filter((x) => !known.some((k) => same(k, x.name)));
    store.updateProfile((p) => ({ ...p, habits: fresh.reduce((hs, x) => addHabit(hs, x.name, x.rhythm, newHabitId()), p.habits) }), { immediate: true });
    setTaken([...taken, ...plans.map((x) => `${x.name} (${RHYTHM_LABEL[x.rhythm]})`)]);
    setPlans([]);
    toast(fresh.length === plans.length ? 'In die Gewohnheiten übernommen' : 'In die Gewohnheiten übernommen, schon vorhandene bleiben');
  };
  const save = () => {
    // The resolve stands last: the Word and the prayer first, then the orientation (rule 2).
    const parts = answered.map((c) => `${c.title}\n${answers[c.id]!.trim()}`);
    if (taken.length) parts.push(`Gewohnheiten\n${taken.join('\n')}`);
    store.updateArenaEntry(entryId, (e) => ({ ...e, title: ENTRY_TITLE, text: parts.join('\n\n') }), { immediate: true });
    for (const c of REFLECTION_CARDS) writeDraft(c.id, '');
    markSeen();
    toast('Reflexion als Eintrag abgelegt');
  };

  return (
    <div className="reflection">
      <figure className="section-verse">
        <blockquote>{REFLECTION_VERSE.text}</blockquote>
        <figcaption>
          <BibleRef reference={REFLECTION_VERSE.ref} />
        </figcaption>
      </figure>
      {REFLECTION_CARDS.map((card) => (
        <Question
          key={card.id}
          card={card}
          value={answers[card.id]!}
          open={!!open[card.id]}
          onToggle={() => setOpen((o) => ({ ...o, [card.id]: !o[card.id] }))}
          onChange={(v) => change(card.id, v)}
        />
      ))}
      <aside className="arena-comfort" aria-label="Zuspruch">
        <p>
          {WELL_COMFORT.parts.join(' ')} <BibleRef reference={WELL_COMFORT.ref} />
        </p>
      </aside>
      <section className="reflection-card reflection-habits" aria-labelledby="refl-habits">
        <h3 id="refl-habits">Gewohnheiten festlegen</h3>
        <p className="small muted">
          Was ich mir aus dieser Reflexion vornehme; es kommt in deine Gewohnheiten (Mehr, Gewohnheiten). Du kannst den Eintrag auch ohne Gewohnheit ablegen.
        </p>
        <form className="add-habit" onSubmit={plan}>
          <div className="field">
            <label htmlFor={nameId}>Name</label>
            <input id={nameId} type="text" value={name} placeholder="z. B. Psalm mit den Kindern" onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor={rhythmId}>Rhythmus</label>
            <select id={rhythmId} value={rhythm} onChange={(e) => setRhythm(e.target.value as Rhythm)}>
              {RHYTHM_ORDER.map((r) => (
                <option key={r} value={r}>
                  {RHYTHM_LABEL[r]}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn" disabled={!name.trim()}>
            Zur Liste hinzufügen
          </button>
        </form>
        {plans.length > 0 && (
          <>
            <ul className="reflection-plans">
              {plans.map((x) => (
                <li key={x.name}>
                  {x.name} ({RHYTHM_LABEL[x.rhythm]}){' '}
                  <button type="button" className="btn link" aria-label={`„${x.name}“ von der Liste nehmen`} onClick={() => setPlans(plans.filter((y) => y !== x))}>
                    Entfernen
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="btn" onClick={adopt}>
              In die Gewohnheiten übernehmen
            </button>
          </>
        )}
        {taken.length > 0 && <p className="small">Übernommen: {taken.join(', ')}</p>}
      </section>
      <button type="button" className="btn primary" disabled={answered.length === 0 && taken.length === 0} onClick={save}>
        In der Gebetskammer ablegen
      </button>
    </div>
  );
}
