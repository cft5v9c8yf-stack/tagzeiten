import { useId, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useProfile, useStore } from '../../data/hooks';
import { entryTitle, isReference } from '../../domain/arena';
import type { ArenaEntry } from '../../domain/model';
import { BibleLink } from '../../ui/BibleLink';
import { SectionVerse } from '../../ui/SectionVerse';

/** What the Arena is for, and what it is not (rule 9). */
const ARENA_NOTE =
  'Hier schreibst du auf, was dich belastet und womit du ringst. Sünde wird gebetet, nicht notiert – dafür ist die Beichte im Nachtgebet.';

/** The word of comfort under every entry (1. Korinther 10,13b; Römer 8,37 – Luther 1912). */
const COMFORT = [
  {
    text: 'Gott ist getreu, der euch nicht läßt versuchen über euer Vermögen, sondern macht, daß die Versuchung so ein Ende gewinne, daß ihr’s könnet ertragen.',
    ref: '1. Korinther 10,13',
  },
  { text: 'Aber in dem allem überwinden wir weit um deswillen, der uns geliebt hat.', ref: 'Römer 8,37' },
];

const dateOf = (ms: number) =>
  new Date(ms).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/** A list of short lines (verses, concerns) with "+" for one more and "×" to take one out. */
function LineList({
  label,
  addLabel,
  placeholder,
  values,
  onChange,
  suggestions = [],
  render,
}: {
  label: string;
  addLabel: string;
  placeholder: string;
  values: string[];
  onChange: (v: string[]) => void;
  suggestions?: string[];
  render?: (v: string) => React.ReactNode;
}) {
  const id = useId();
  const list = values.length ? values : [''];
  const set = (i: number, v: string) => onChange(list.map((x, k) => (k === i ? v : x)));
  return (
    <fieldset className="arena-lines">
      <legend>{label}</legend>
      {list.map((v, i) => (
        <div key={i} className="arena-line">
          <div className="arena-line-input">
            <label htmlFor={`${id}-${i}`} className="visually-hidden">
              {`${label} ${i + 1}`}
            </label>
            <input
              id={`${id}-${i}`}
              type="text"
              value={v}
              placeholder={placeholder}
              list={suggestions.length ? `${id}-list` : undefined}
              onChange={(e) => set(i, e.target.value)}
            />
            {list.length > 1 && (
              <button
                type="button"
                className="arena-remove"
                aria-label={`${label} ${i + 1} entfernen`}
                onClick={() => onChange(list.filter((_, k) => k !== i))}
              >
                ×
              </button>
            )}
          </div>
          {render && v.trim() && <div className="arena-line-view">{render(v)}</div>}
        </div>
      ))}
      {suggestions.length > 0 && (
        <datalist id={`${id}-list`}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
      <button type="button" className="concern-add arena-add" aria-label={addLabel} onClick={() => onChange([...list, ''])}>
        +
      </button>
    </fieldset>
  );
}

function EntryEditor({ entry }: { entry: ArenaEntry }) {
  const store = useStore();
  const profile = useProfile();
  const navigate = useNavigate();
  const textId = useId();
  const [confirm, setConfirm] = useState(false);
  const update = (fn: (e: ArenaEntry) => ArenaEntry) => store.updateArenaEntry(entry.id, fn);

  return (
    <article className="arena-entry">
      <p className="back-link">
        <Link to="/arena">‹ Arena</Link>
      </p>
      <h2 className="arena-entry-date">{dateOf(entry.createdAt)}</h2>

      <LineList
        label="Bibelstelle"
        addLabel="Weitere Bibelstelle hinzufügen"
        placeholder="z. B. Römer 8,37"
        values={entry.verses}
        onChange={(verses) => update((e) => ({ ...e, verses }))}
        render={(v) => (isReference(v) ? <BibleLink reference={v.trim()} /> : null)}
      />
      <LineList
        label="Gebetsanliegen"
        addLabel="Weiteres Gebetsanliegen hinzufügen"
        placeholder="Wofür du betest"
        values={entry.concerns}
        onChange={(concerns) => update((e) => ({ ...e, concerns }))}
        suggestions={profile.prayer.concerns}
      />

      <div className="field arena-text">
        <label htmlFor={textId}>Was dich bewegt</label>
        <textarea
          id={textId}
          rows={14}
          value={entry.text}
          placeholder="Was dich belastet, womit du ringst, was Gott dir heute gezeigt hat …"
          onChange={(e) => update((x) => ({ ...x, text: e.target.value }))}
        />
      </div>

      <aside className="arena-comfort" aria-label="Zuspruch">
        {COMFORT.map((c) => (
          <p key={c.ref}>
            {c.text} <BibleLink reference={c.ref} />
          </p>
        ))}
      </aside>

      <div className="arena-actions">
        <button type="button" className="btn primary" onClick={() => navigate('/arena')}>
          Eintrag sichern und zurück
        </button>
        {confirm ? (
          <>
            <button
              type="button"
              className="btn"
              onClick={() => {
                store.deleteArenaEntry(entry.id);
                navigate('/arena');
              }}
            >
              Ja, Eintrag löschen
            </button>
            <button type="button" className="btn quiet" onClick={() => setConfirm(false)}>
              Behalten
            </button>
          </>
        ) : (
          <button type="button" className="btn quiet" onClick={() => setConfirm(true)}>
            Eintrag löschen
          </button>
        )}
      </div>
    </article>
  );
}

/**
 * The Arena: a journal of the fight of faith. Every entry has Bible verses and
 * prayer concerns at the top, then a large text; under it a word of comfort.
 * Everything stays on the device (rule 10) and is part of export and deletion (rule 11).
 */
export function ArenaPage() {
  const { eintrag } = useParams();
  const store = useStore();
  const profile = useProfile();
  const navigate = useNavigate();
  const entries = profile.arena;

  if (eintrag) {
    const entry = entries.find((e) => e.id === eintrag);
    if (entry) return <EntryEditor entry={entry} />;
    return (
      <>
        <p className="back-link">
          <Link to="/arena">‹ Arena</Link>
        </p>
        <p>Diesen Eintrag gibt es nicht mehr.</p>
      </>
    );
  }

  const shown = entries.filter((e) => entryTitle(e));
  return (
    <div className="arena">
      <h2>Arena</h2>
      <SectionVerse id="arena" />
      <p className="arena-note">{ARENA_NOTE}</p>
      <button type="button" className="btn primary arena-new" onClick={() => navigate(`/arena/${store.addArenaEntry()}`)}>
        Neuen Eintrag schreiben
      </button>
      {shown.length > 0 && (
        <ul className="arena-list">
          {shown.map((e) => (
            <li key={e.id}>
              <Link className="arena-card" to={`/arena/${e.id}`}>
                <span className="arena-card-date">{dateOf(e.createdAt)}</span>
                <span className="arena-card-title">{entryTitle(e)}</span>
                {e.verses.some((v) => v.trim()) && (
                  <span className="arena-card-verses">{e.verses.filter((v) => v.trim()).join(' · ')}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
