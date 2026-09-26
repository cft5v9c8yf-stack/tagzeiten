import { useId, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { useToast } from '../../app/Toast';
import { useProfile, useStore } from '../../data/hooks';
import { byMeeting, entryTitle, isReference, meetingLabel } from '../../domain/arena';
import type { ArenaEntry } from '../../domain/model';
import { BibleLink } from '../../ui/BibleLink';
import { Segmented } from '../../ui/Choice';
import { SectionVerse } from '../../ui/SectionVerse';

type Kind = 'journal' | 'forge';
const kindOf = (e: ArenaEntry): Kind => (e.kind === 'forge' ? 'forge' : 'journal');
const FORGE_PARAM = 'bereich';
const FORGE_SLUG = 'eisenschmiede';

/** The two places of the Arena: the journal, and the Eisenschmiede for the brothers. */
const PLACES = {
  journal: {
    title: 'Tagebuch',
    verse: 'arena',
    // What the journal is for, and what it is not (rule 9).
    note: 'Hier schreibst du auf, was dich belastet und womit du ringst. Sünde wird gebetet, nicht notiert – dafür ist die Beichte im Nachtgebet.',
    add: 'Neuen Eintrag schreiben',
    textLabel: 'Was dich bewegt',
    textHint: 'Was dich belastet, womit du ringst, was Gott dir heute gezeigt hat …',
    concernHint: 'Wofür du betest',
    // Luther 1912.
    comfort: [
      {
        text: 'Gott ist getreu, der euch nicht läßt versuchen über euer Vermögen, sondern macht, daß die Versuchung so ein Ende gewinne, daß ihr’s könnet ertragen.',
        ref: '1. Korinther 10,13',
      },
      { text: 'Aber in dem allem überwinden wir weit um deswillen, der uns geliebt hat.', ref: 'Römer 8,37' },
    ],
  },
  forge: {
    title: 'Eisenschmiede',
    verse: 'forge',
    note: 'Was du zum nächsten Treffen mit deinen Brüdern mitbringst: was ihr besprechen und wofür ihr miteinander beten sollt. Was ihr einander bekennt, bleibt im Gespräch und wird hier nicht notiert.',
    add: 'Anliegen fürs Treffen aufschreiben',
    textLabel: 'Was du mit den Brüdern besprechen willst',
    textHint: 'Was dich umtreibt, wo du Rat brauchst, wofür die Brüder mit dir beten sollen …',
    concernHint: 'Wofür ihr gemeinsam betet',
    comfort: [
      { text: 'Einer trage des andern Last, so werdet ihr das Gesetz Christi erfüllen.', ref: 'Galater 6,2' },
      {
        text: 'Denn wo zwei oder drei versammelt sind in meinem Namen, da bin ich mitten unter ihnen.',
        ref: 'Matthäus 18,20',
      },
    ],
  },
} as const;

const arenaPath = (k: Kind) => (k === 'forge' ? `/arena?${FORGE_PARAM}=${FORGE_SLUG}` : '/arena');

/** Archived entries stand in the Rückblick under "Mehr". */
export const REVIEW_PATH = '/mehr/rueckblick?ansicht=arena';

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

/** An entry as a card: date, first line, verses. Used in the Arena and in the Rückblick. */
export function ArenaCard({
  entry: e,
  showKind = true,
  showMeeting = true,
}: {
  entry: ArenaEntry;
  showKind?: boolean;
  showMeeting?: boolean;
}) {
  return (
    <Link className="arena-card" to={`/arena/${e.id}`}>
      <span className="arena-card-date">
        {dateOf(e.createdAt)}
        {showKind && e.kind === 'forge' && <span className="ktag">Eisenschmiede</span>}
      </span>
      <span className="arena-card-title">{entryTitle(e)}</span>
      {showMeeting && e.meetingDate && <span className="arena-card-meeting">{meetingLabel(e.meetingDate)}</span>}
      {e.verses.some((v) => v.trim()) && (
        <span className="arena-card-verses">{e.verses.filter((v) => v.trim()).join(' · ')}</span>
      )}
    </Link>
  );
}

function EntryEditor({ entry }: { entry: ArenaEntry }) {
  const store = useStore();
  const profile = useProfile();
  const navigate = useNavigate();
  const textId = useId();
  const dateId = useId();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const update = (fn: (e: ArenaEntry) => ArenaEntry) => store.updateArenaEntry(entry.id, fn);
  const archived = entry.archivedAt !== undefined;
  const kind = kindOf(entry);
  const place = PLACES[kind];
  const home = archived ? REVIEW_PATH : arenaPath(kind);

  return (
    <article className="arena-entry">
      <p className="back-link">
        <Link to={home}>{archived ? '‹ Rückblick' : `‹ ${place.title}`}</Link>
      </p>
      {kind === 'forge' && <p className="arena-entry-kind">Eisenschmiede · fürs Treffen mit den Brüdern</p>}
      <h2 className="arena-entry-date">{dateOf(entry.createdAt)}</h2>
      {archived && <p className="small muted">Archiviert am {dateOf(entry.archivedAt!)}. Steht im Rückblick.</p>}

      {kind === 'forge' && (
        <div className="field arena-meeting">
          <label htmlFor={dateId}>Für das Treffen am</label>
          <input
            id={dateId}
            type="date"
            value={entry.meetingDate ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              update((x) => {
                const { meetingDate: _, ...rest } = x;
                return /^\d{4}-\d{2}-\d{2}$/.test(v) ? { ...rest, meetingDate: v } : rest;
              });
            }}
          />
        </div>
      )}

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
        placeholder={place.concernHint}
        values={entry.concerns}
        onChange={(concerns) => update((e) => ({ ...e, concerns }))}
        suggestions={profile.prayer.concerns}
      />

      <div className="field arena-text">
        <label htmlFor={textId}>{place.textLabel}</label>
        <textarea
          id={textId}
          rows={14}
          value={entry.text}
          placeholder={place.textHint}
          onChange={(e) => update((x) => ({ ...x, text: e.target.value }))}
        />
      </div>

      <aside className="arena-comfort" aria-label="Zuspruch">
        {place.comfort.map((c) => (
          <p key={c.ref}>
            {c.text} <BibleLink reference={c.ref} />
          </p>
        ))}
      </aside>

      <div className="arena-actions">
        <button type="button" className="btn primary" onClick={() => navigate(home)}>
          Eintrag sichern und zurück
        </button>
        {archived ? (
          <button
            type="button"
            className="btn"
            onClick={() => {
              store.archiveArenaEntry(entry.id, false);
              toast(`Eintrag steht wieder in der ${kind === 'forge' ? 'Eisenschmiede' : 'Arena'}`);
              navigate(arenaPath(kind));
            }}
          >
            {kind === 'forge' ? 'Zurück in die Eisenschmiede holen' : 'Zurück in die Arena holen'}
          </button>
        ) : (
          <button
            type="button"
            className="btn"
            onClick={() => {
              store.archiveArenaEntry(entry.id, true);
              toast(
                kind === 'forge'
                  ? 'Besprochen und archiviert – zu finden unter Mehr, Rückblick'
                  : 'Eintrag archiviert – zu finden unter Mehr, Rückblick',
              );
              navigate(arenaPath(kind));
            }}
          >
            {kind === 'forge' ? 'Besprochen – archivieren' : 'Eintrag archivieren'}
          </button>
        )}
        {confirm ? (
          <>
            <button
              type="button"
              className="btn"
              onClick={() => {
                store.deleteArenaEntry(entry.id);
                navigate(home);
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
  const [params] = useSearchParams();
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

  const kind: Kind = params.get(FORGE_PARAM) === FORGE_SLUG ? 'forge' : 'journal';
  const place = PLACES[kind];
  const shown = entries.filter((e) => entryTitle(e) && e.archivedAt === undefined && kindOf(e) === kind);
  const archivedCount = entries.filter((e) => e.archivedAt !== undefined).length;
  return (
    <div className="arena">
      <h2>Arena</h2>
      <Segmented<Kind>
        label="Bereich der Arena"
        value={kind}
        onChange={(k) => navigate(arenaPath(k), { replace: true })}
        options={[
          { value: 'journal', label: PLACES.journal.title },
          { value: 'forge', label: PLACES.forge.title },
        ]}
      />
      <SectionVerse id={place.verse} />
      <p className="arena-note">{place.note}</p>
      <button
        type="button"
        className="btn primary arena-new"
        onClick={() => navigate(`/arena/${store.addArenaEntry(kind === 'forge' ? 'forge' : undefined)}`)}
      >
        {place.add}
      </button>
      {kind === 'journal' && shown.length > 0 && (
        <ul className="arena-list">
          {shown.map((e) => (
            <li key={e.id}>
              <ArenaCard entry={e} showKind={false} />
            </li>
          ))}
        </ul>
      )}
      {kind === 'forge' &&
        byMeeting(shown).map((g) => (
          <section key={g.date ?? 'none'} className="arena-meeting-group" aria-label={g.date ? meetingLabel(g.date) : 'Ohne Treffen'}>
            <h3 className="arena-meeting-title">{g.date ? meetingLabel(g.date) : 'Noch keinem Treffen zugeordnet'}</h3>
            <ul className="arena-list">
              {g.entries.map((e) => (
                <li key={e.id}>
                  <ArenaCard entry={e} showKind={false} showMeeting={false} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      {archivedCount > 0 && (
        <p className="small arena-archived">
          <Link to={REVIEW_PATH}>Archivierte Einträge im Rückblick</Link>
        </p>
      )}
    </div>
  );
}
