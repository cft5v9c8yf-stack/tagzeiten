import { useId, useState } from 'react';
import { useToast } from '../../app/Toast';
import { WELL_COMFORT } from '../../content/well';
import { REFLECTION_CARDS, type ReflectionCard } from '../../content/reflection';
import { useStore } from '../../data/hooks';
import { BibleRef } from '../../ui/BibleRef';

const draftKey = (id: string) => `tz:reflexion:${id}`;

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

/** One question: a field to write in, and a button that puts the answer into the Gebetskammer as an entry. */
function WritingCard({ card }: { card: ReflectionCard }) {
  const store = useStore();
  const toast = useToast();
  const fieldId = useId();
  const [text, setText] = useState(() => readDraft(card.id));
  const change = (v: string) => {
    setText(v);
    writeDraft(card.id, v);
  };
  const save = () => {
    const id = store.addArenaEntry();
    store.updateArenaEntry(id, (e) => ({ ...e, title: card.title, text: text.trim() }), { immediate: true });
    change('');
    toast('In der Gebetskammer abgelegt – zu finden in der klassischen Ansicht');
  };
  return (
    <>
      <div className="field">
        <label htmlFor={fieldId} className="visually-hidden">
          {card.title}
        </label>
        <textarea
          id={fieldId}
          rows={7}
          value={text}
          placeholder="Was ich dazu vor Gott sage …"
          onChange={(e) => change(e.target.value)}
        />
      </div>
      <button type="button" className="btn" disabled={!text.trim()} onClick={save}>
        In der Gebetskammer ablegen
      </button>
    </>
  );
}

/**
 * The Reflexion: the questions for one's own review, set before the prayer. A question about sin
 * has no field (rule 9) and ends in the word of forgiveness (rule 1).
 */
export function Reflection() {
  return (
    <div className="reflection">
      {REFLECTION_CARDS.map((card) => (
        <section key={card.id} className="reflection-card" aria-labelledby={`refl-${card.id}`}>
          <h3 id={`refl-${card.id}`}>{card.title}</h3>
          {card.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {card.field ? (
            <WritingCard card={card} />
          ) : (
            <>
              <p className="reflection-prayed">Wird gebetet, nicht notiert.</p>
              <aside className="arena-comfort" aria-label="Zuspruch">
                <p>
                  {WELL_COMFORT.parts.join(' ')} <BibleRef reference={WELL_COMFORT.ref} />
                </p>
              </aside>
            </>
          )}
        </section>
      ))}
    </div>
  );
}
