import { useId, useState } from 'react';
import { useToast } from '../../app/Toast';
import { WELL_COMFORT } from '../../content/well';
import { REFLECTION_CARDS, REFLECTION_VERSE } from '../../content/reflection';
import { RHYTHM_LABEL } from '../../content/habits';
import { useStore } from '../../data/hooks';
import { addHabit, newHabitId, RHYTHM_ORDER } from '../../domain/habits';
import type { Rhythm } from '../../domain/model';
import { BibleRef } from '../../ui/BibleRef';

const draftKey = (id: string) => `tz:reflexion:${id}`;
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

function Comfort() {
  return (
    <aside className="arena-comfort" aria-label="Zuspruch">
      <p>
        {WELL_COMFORT.parts.join(' ')} <BibleRef reference={WELL_COMFORT.ref} />
      </p>
    </aside>
  );
}

/**
 * The Reflexion, step by step: one question after the other, then an overview that is laid down in
 * the Gebetskammer as the entry that is open. Sin and weakness may be written here, by exception to rule 9
 * (25.10.2026); the question about sin, and the overview, end in the word of forgiveness (rule 1).
 */
export function Reflection({ entryId }: { entryId: string }) {
  const store = useStore();
  const toast = useToast();
  const fieldId = useId();
  const nameId = useId();
  const rhythmId = useId();
  const [step, setStep] = useState(0);
  // Habits laid down at the end: planned in the list, then taken into the habits (this round).
  const [plans, setPlans] = useState<Plan[]>([]);
  const [taken, setTaken] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [rhythm, setRhythm] = useState<Rhythm>('daily');
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(REFLECTION_CARDS.map((c) => [c.id, readDraft(c.id)])),
  );
  const last = REFLECTION_CARDS.length - 1;
  const overview = step > last;
  const card = REFLECTION_CARDS[Math.min(step, last)]!;
  const answered = REFLECTION_CARDS.filter((c) => answers[c.id]!.trim());

  const change = (id: string, v: string) => {
    setAnswers((a) => ({ ...a, [id]: v }));
    writeDraft(id, v);
  };
  const save = () => {
    // The resolve stands last: the Word and the prayer first, then the orientation (rule 2).
    const parts = answered.map((c) => `${c.title}\n${answers[c.id]!.trim()}`);
    if (taken.length) parts.push(`Gewohnheiten\n${taken.join('\n')}`);
    const text = parts.join('\n\n');
    store.updateArenaEntry(entryId, (e) => ({ ...e, title: ENTRY_TITLE, text }), { immediate: true });
    for (const c of REFLECTION_CARDS) writeDraft(c.id, '');
    setAnswers(Object.fromEntries(REFLECTION_CARDS.map((c) => [c.id, ''])));
    setStep(0);
    setTaken([]);
    setPlans([]);
    toast('Reflexion als Eintrag abgelegt');
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

  if (overview) {
    return (
      <section className="reflection reflection-card" aria-labelledby="refl-overview">
        <h3 id="refl-overview">Übersicht</h3>
        {REFLECTION_CARDS.map((c) => (
          <div key={c.id} className="reflection-answer">
            <h4>{c.title}</h4>
            {answers[c.id]!.trim() ? <p className="reflection-text">{answers[c.id]!.trim()}</p> : <p className="muted">Nichts aufgeschrieben.</p>}
          </div>
        ))}
        <Comfort />
        <div className="reflection-habits">
          <h4>Gewohnheiten festlegen</h4>
          <p className="small muted">Was ich mir aus dieser Reflexion vornehme; es kommt in deine Gewohnheiten (Mehr, Gewohnheiten). Du kannst den Eintrag auch ohne Gewohnheit ablegen.</p>
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
        </div>
        <div className="reflection-nav">
          <button type="button" className="btn" onClick={() => setStep(last)}>
            Zurück zur letzten Frage
          </button>
          <button type="button" className="btn primary" disabled={answered.length === 0 && taken.length === 0} onClick={save}>
            In der Gebetskammer ablegen
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="reflection reflection-card" aria-labelledby={`refl-${card.id}`}>
      {step === 0 && (
        <figure className="section-verse">
          <blockquote>{REFLECTION_VERSE.text}</blockquote>
          <figcaption>
            <BibleRef reference={REFLECTION_VERSE.ref} />
          </figcaption>
        </figure>
      )}
      <p className="small muted reflection-step">
        Frage {step + 1} von {REFLECTION_CARDS.length}
      </p>
      <h3 id={`refl-${card.id}`}>{card.title}</h3>
      {card.paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <div className="field">
        <label htmlFor={fieldId} className="visually-hidden">
          {card.title}
        </label>
        <textarea
          id={fieldId}
          key={card.id}
          rows={9}
          value={answers[card.id]}
          placeholder="Was ich dazu vor Gott sage …"
          onChange={(e) => change(card.id, e.target.value)}
        />
      </div>
      {card.comfort && <Comfort />}
      <div className="reflection-nav">
        {step > 0 && (
          <button type="button" className="btn" onClick={() => setStep(step - 1)}>
            Zurück zur vorigen Frage
          </button>
        )}
        <button type="button" className="btn primary" onClick={() => setStep(step + 1)}>
          {step === last ? 'Weiter zur Übersicht' : 'Weiter zur nächsten Frage'}
        </button>
      </div>
    </section>
  );
}
