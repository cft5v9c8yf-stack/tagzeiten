import { useId, useState } from 'react';
import { useToast } from '../../app/Toast';
import { WELL_COMFORT } from '../../content/well';
import { REFLECTION_CARDS, REFLECTION_VERSE, type ReflectionCard } from '../../content/reflection';
import { RHYTHM_LABEL } from '../../content/habits';
import { composeReflection, parseReflection } from '../../domain/reflection';
import { useStore } from '../../data/hooks';
import { addHabit, newHabitId, RHYTHM_ORDER } from '../../domain/habits';
import { BibleRef } from '../../ui/BibleRef';
import { Segmented } from '../../ui/Choice';
import type { InkStroke } from '../../domain/ink';
import { InkPad } from './InkPad';
import { lastWriting, rememberWriting, type Writing } from './writing';
import type { ArenaEntry, Rhythm } from '../../domain/model';

const SEEN_KEY = 'tz:reflexion-seen';
const ENTRY_TITLE = 'Reflexion';

interface Plan {
  name: string;
  rhythm: Rhythm;
}
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

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

/** One question: its title with the "i" that unfolds the question, and the field to write in, typed or with the pencil. */
function Question({
  card,
  value,
  ink,
  open,
  onToggle,
  onChange,
  onInk,
}: {
  card: ReflectionCard;
  value: string;
  ink: InkStroke[];
  open: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
  onInk: (s: InkStroke[]) => void;
}) {
  const fieldId = useId();
  const askId = useId();
  const hasText = !!value.trim();
  const hasInk = ink.length > 0;
  const [writing, setWriting] = useState<Writing>(() => (hasInk && !hasText ? 'ink' : hasText && !hasInk ? 'text' : lastWriting()));
  const choose = (w: Writing) => {
    setWriting(w);
    rememberWriting(w);
  };
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
      <Segmented<Writing>
        label={`Schreiben mit, ${card.title}`}
        value={writing}
        onChange={choose}
        options={[
          { value: 'text', label: 'Tastatur' },
          { value: 'ink', label: 'Handschrift' },
        ]}
      />
      {writing === 'text' ? (
        <div className="field">
          <label htmlFor={fieldId} className="visually-hidden">
            {card.title}
          </label>
          <textarea id={fieldId} rows={6} value={value} placeholder="Was ich dazu vor Gott sage …" onChange={(e) => onChange(e.target.value)} />
          {hasInk && <p className="small muted">Dazu gibt es auch Handgeschriebenes.</p>}
        </div>
      ) : (
        <>
          <InkPad strokes={ink} onChange={onInk} />
          {hasText && <p className="small muted">Dazu gibt es auch Getipptes.</p>}
        </>
      )}
    </section>
  );
}

/**
 * The Reflexion: the Word first, then the questions one under the other (the question itself unfolds
 * behind the "i"), the word of forgiveness, and the habits. What is written is kept in the open entry
 * at once. Sin and weakness may be written here, by exception to rule 9 (25.10.2026); the questions end
 * in the word of forgiveness (rule 1), and the resolve stands last (rule 2).
 */
export function Reflection({ entry }: { entry: ArenaEntry }) {
  const entryId = entry.id;
  const store = useStore();
  const toast = useToast();
  const nameId = useId();
  const rhythmId = useId();
  const [start] = useState(() => parseReflection(entry.text));
  const [answers, setAnswers] = useState<Record<string, string>>(start.answers);
  // The first question stands open the first time; afterwards all are folded.
  const [open, setOpen] = useState<Record<string, boolean>>(() => ({ [REFLECTION_CARDS[0]!.id]: !seenBefore() }));
  // Habits laid down at the end: planned in the list, then taken into the habits.
  const [plans, setPlans] = useState<Plan[]>([]);
  const [taken, setTaken] = useState<string[]>(start.taken);
  const [inks, setInks] = useState<Record<string, InkStroke[]>>(entry.inks ?? {});
  const [name, setName] = useState('');
  const [rhythm, setRhythm] = useState<Rhythm>('daily');

  // The entry is kept as it is written, like every entry; one left empty is cleared away.
  const keep = (a: Record<string, string>, t: readonly string[], i: Record<string, InkStroke[]>) => {
    const text = composeReflection(a, t);
    const written = !!text || Object.values(i).some((x) => x.length > 0);
    store.updateArenaEntry(entryId, (e) => {
      const { title: _, inks: __, ...rest } = e;
      const kept = Object.fromEntries(Object.entries(i).filter(([, x]) => x.length > 0));
      const withInks = Object.keys(kept).length ? { ...rest, inks: kept } : rest;
      return written ? { ...withInks, title: ENTRY_TITLE, text } : { ...withInks, text: '' };
    });
    if (written) markSeen();
  };
  const change = (id: string, v: string) => {
    const next = { ...answers, [id]: v };
    setAnswers(next);
    keep(next, taken, inks);
  };
  const draw = (id: string, strokes: InkStroke[]) => {
    const next = { ...inks, [id]: strokes };
    setInks(next);
    keep(answers, taken, next);
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
    const nextTaken = [...taken, ...plans.map((x) => `${x.name} (${RHYTHM_LABEL[x.rhythm]})`)];
    setTaken(nextTaken);
    keep(answers, nextTaken, inks);
    setPlans([]);
    toast(fresh.length === plans.length ? 'In die Gewohnheiten übernommen' : 'In die Gewohnheiten übernommen, schon vorhandene bleiben');
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
          ink={inks[card.id] ?? []}
          onInk={(strokes) => draw(card.id, strokes)}
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
    </div>
  );
}
