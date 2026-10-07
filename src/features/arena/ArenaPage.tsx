import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { useToast } from '../../app/Toast';
import { useProfile, useStore } from '../../data/hooks';
import { byMeeting, entryTitle, forgeTitle, isReference } from '../../domain/arena';
import type { ArenaEntry, ArenaPoint } from '../../domain/model';
import { BibleRef } from '../../ui/BibleRef';
import { Segmented } from '../../ui/Choice';
import { FlowIcon, type FlowIconName } from '../../ui/FlowIcon';
import { formatLong } from '../../domain/dates';
import { desertLine } from '../desert/DesertSettings';
import { SectionVerse } from '../../ui/SectionVerse';
import { activeRun, runName, shortSpan } from '../../domain/winterArc';
import { InkPad } from './InkPad';
import { Desert } from '../desert/Desert';

type Kind = 'journal' | 'forge';
const kindOf = (e: ArenaEntry): Kind => (e.kind === 'forge' ? 'forge' : 'journal');
const FORGE_PARAM = 'bereich';
const FORGE_SLUG = 'eisenschmiede';
/** The Wüstenzeit's place in the Arena; links to the Streithalle (before 0.39) lead there too. */
const HALL_SLUG = 'wuestenzeit';
const OLD_HALL_SLUG = 'streithalle';
type Place = Kind | 'hall';

/** The two places of the Arena: the Gebetskammer (journal), and the Eisenschmiede for the brothers. */
const PLACES = {
  journal: {
    title: 'Gebetskammer',
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

type Writing = 'text' | 'ink';
const WRITING_KEY = 'tz:arena-writing';

/** How the last entry was written, on this device: a convenience only. */
const lastWriting = (): Writing => {
  try {
    return localStorage.getItem(WRITING_KEY) === 'ink' ? 'ink' : 'text';
  } catch {
    return 'text';
  }
};

/** Typed text or handwriting: an entry may hold both; one is shown at a time. */
function JournalText({ entry, update }: { entry: ArenaEntry; update: (fn: (e: ArenaEntry) => ArenaEntry) => void }) {
  const textId = useId();
  const hasText = !!entry.text.trim();
  const hasInk = !!entry.ink?.length;
  const [writing, setWriting] = useState<Writing>(() =>
    hasInk && !hasText ? 'ink' : hasText && !hasInk ? 'text' : lastWriting(),
  );
  const choose = (w: Writing) => {
    setWriting(w);
    try {
      localStorage.setItem(WRITING_KEY, w);
    } catch {
      // Only a convenience.
    }
  };
  return (
    <fieldset className="arena-lines arena-text">
      <legend>{PLACES.journal.textLabel}</legend>
      <Segmented<Writing>
        label="Schreiben mit"
        value={writing}
        onChange={choose}
        options={[
          { value: 'text', label: 'Tastatur' },
          { value: 'ink', label: 'Handschrift' },
        ]}
      />
      {writing === 'text' ? (
        <div className="field">
          <label htmlFor={textId} className="visually-hidden">
            {PLACES.journal.textLabel}
          </label>
          <textarea
            id={textId}
            rows={14}
            value={entry.text}
            placeholder={PLACES.journal.textHint}
            onChange={(e) => update((x) => ({ ...x, text: e.target.value }))}
          />
          {hasInk && <p className="small muted">Dazu gibt es auch Handgeschriebenes.</p>}
        </div>
      ) : (
        <>
          <InkPad
            strokes={entry.ink ?? []}
            onChange={(ink) =>
              update((x) => {
                const { ink: _, ...rest } = x;
                return ink.length ? { ...rest, ink } : rest;
              })
            }
          />
          {hasText && <p className="small muted">Dazu gibt es auch Getipptes.</p>}
        </>
      )}
    </fieldset>
  );
}

const JOURNAL_SLUG = 'gebetskammer';
const SLUG: Record<Place, string> = { journal: JOURNAL_SLUG, forge: FORGE_SLUG, hall: HALL_SLUG };
const arenaPath = (k: Place) => `/arena?${FORGE_PARAM}=${SLUG[k]}`;

/** Archived entries stand in the Rückblick under "Mehr". */
export const REVIEW_PATH = '/mehr/rueckblick?ansicht=arena';

const dateOf = (ms: number) =>
  new Date(ms).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/** A one-line field that wraps and grows when the text reaches its end; Enter adds no line break. */
const GrowField = forwardRef<
  HTMLTextAreaElement,
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & { value: string; onValue: (v: string) => void }
>(function GrowField({ value, onValue, onKeyDown, className, ...rest }, outer) {
  const inner = useRef<HTMLTextAreaElement | null>(null);
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea
      {...rest}
      ref={(el) => {
        inner.current = el;
        if (typeof outer === 'function') outer(el);
        else if (outer) outer.current = el;
      }}
      rows={1}
      className={className ? `grow-field ${className}` : 'grow-field'}
      value={value}
      onChange={(e) => onValue(e.target.value.replace(/\n/g, ' '))}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.nativeEvent.isComposing) e.preventDefault();
        onKeyDown?.(e);
      }}
    />
  );
});

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
  const [focused, setFocused] = useState<number | null>(null);
  // Known concerns that fit what is typed, as taps instead of a list the phone hides.
  const matches = (v: string) => {
    const q = v.trim().toLocaleLowerCase('de');
    return suggestions.filter((s) => s.toLocaleLowerCase('de') !== q && s.toLocaleLowerCase('de').includes(q) && !list.includes(s)).slice(0, 5);
  };
  return (
    <fieldset className="arena-lines">
      <legend>{label}</legend>
      {list.map((v, i) => (
        <div key={i} className="arena-line">
          <div className="arena-line-input">
            <label htmlFor={`${id}-${i}`} className="visually-hidden">
              {`${label} ${i + 1}`}
            </label>
            <GrowField
              id={`${id}-${i}`}
              value={v}
              placeholder={placeholder}
              onFocus={() => setFocused(i)}
              onBlur={() => setFocused((f) => (f === i ? null : f))}
              onValue={(x) => set(i, x)}
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
          {focused === i && matches(v).length > 0 && (
            <div className="arena-suggest" role="group" aria-label="Vorschläge">
              {matches(v).map((m) => (
                <button
                  key={m}
                  type="button"
                  className="chip"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => set(i, m)}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
          {render && v.trim() && <div className="arena-line-view">{render(v)}</div>}
        </div>
      ))}
      <button type="button" className="concern-add arena-add" aria-label={addLabel} onClick={() => onChange([...list, ''])}>
        +
      </button>
    </fieldset>
  );
}

/**
 * The Eisenschmiede's reminder list: one point per line, ticked off when it
 * has been spoken of. Enter makes a new point below; Backspace on an empty
 * point takes it out.
 */
function PointList({ values, onChange }: { values: ArenaPoint[]; onChange: (v: ArenaPoint[]) => void }) {
  const id = useId();
  const refs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [focus, setFocus] = useState<number | null>(null);
  const list = values.length ? values : [{ text: '', done: false }];
  useEffect(() => {
    if (focus === null) return;
    refs.current[focus]?.focus();
    setFocus(null);
  }, [focus]);
  const set = (i: number, p: ArenaPoint) => onChange(list.map((x, k) => (k === i ? p : x)));
  const insertAfter = (i: number) => {
    onChange([...list.slice(0, i + 1), { text: '', done: false }, ...list.slice(i + 1)]);
    setFocus(i + 1);
  };
  const remove = (i: number) => {
    onChange(list.filter((_, k) => k !== i));
    setFocus(Math.max(0, i - 1));
  };
  return (
    <fieldset className="arena-lines arena-points">
      <legend>Was du mit den Brüdern besprechen willst</legend>
      <ul>
        {list.map((p, i) => (
          <li key={i} className={`arena-point${p.done ? ' done' : ''}`}>
            <input
              type="checkbox"
              checked={p.done}
              aria-label={`Punkt ${i + 1} besprochen`}
              onChange={(e) => set(i, { ...p, done: e.target.checked })}
            />
            <label htmlFor={`${id}-${i}`} className="visually-hidden">{`Punkt ${i + 1}`}</label>
            <GrowField
              id={`${id}-${i}`}
              ref={(el) => {
                refs.current[i] = el;
              }}
              enterKeyHint="next"
              value={p.text}
              placeholder={i === 0 ? 'Was dich umtreibt, wo du Rat brauchst …' : 'Weiterer Punkt'}
              onValue={(x) => set(i, { ...p, text: x })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  insertAfter(i);
                } else if (e.key === 'Backspace' && p.text === '' && list.length > 1) {
                  e.preventDefault();
                  remove(i);
                }
              }}
            />
            {list.length > 1 && (
              <button type="button" className="arena-remove" aria-label={`Punkt ${i + 1} entfernen`} onClick={() => remove(i)}>
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
      <button type="button" className="concern-add arena-add" aria-label="Weiteren Punkt hinzufügen" onClick={() => insertAfter(list.length - 1)}>
        +
      </button>
    </fieldset>
  );
}

/** A Gebetskammer entry as a card: date, first line, verses. */
function ArenaCard({ entry: e }: { entry: ArenaEntry }) {
  return (
    <Link className="arena-card" to={`/arena/${e.id}`}>
      <span className="arena-card-date">{dateOf(e.createdAt)}</span>
      <span className="arena-card-title">{entryTitle(e)}</span>
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
      <h2 className="arena-entry-date">{kind === 'forge' ? forgeTitle(entry) : dateOf(entry.createdAt)}</h2>
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
        render={(v) => (isReference(v) ? <BibleRef reference={v.trim()} /> : null)}
      />
      <LineList
        label="Gebetsanliegen"
        addLabel="Weiteres Gebetsanliegen hinzufügen"
        placeholder={place.concernHint}
        values={entry.concerns}
        onChange={(concerns) => update((e) => ({ ...e, concerns }))}
        suggestions={profile.prayer.concerns}
      />

      {kind === 'forge' ? (
        <PointList values={entry.points ?? []} onChange={(points) => update((x) => ({ ...x, points }))} />
      ) : (
        <JournalText entry={entry} update={update} />
      )}

      <aside className="arena-comfort" aria-label="Zuspruch">
        {place.comfort.map((c) => (
          <p key={c.ref}>
            {c.text} <BibleRef reference={c.ref} />
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
              toast(`Eintrag steht wieder in der ${place.title}`);
              navigate(arenaPath(kind));
            }}
          >
            {`Zurück in die ${place.title} holen`}
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

  const param = params.get(FORGE_PARAM);
  const shownPlace: Place | undefined =
    param === FORGE_SLUG
      ? 'forge'
      : param === HALL_SLUG || param === OLD_HALL_SLUG
        ? 'hall'
        : param === JOURNAL_SLUG
          ? 'journal'
          : undefined;
  if (!shownPlace) return <ArenaHome />;
  if (shownPlace === 'hall') {
    const hallRun = activeRun(profile.winterArc);
    return (
      <div className="arena arena-place">
        <PlaceHead title="Wüstenzeit" sub={hallRun ? `${runName(hallRun)} · ${shortSpan(hallRun)}` : undefined} />
        <Desert />
      </div>
    );
  }
  const kind: Kind = shownPlace;
  const place = PLACES[kind];
  const shown = entries.filter((e) => entryTitle(e) && e.archivedAt === undefined && kindOf(e) === kind);
  const archivedCount = entries.filter((e) => e.archivedAt !== undefined).length;
  return (
    <div className="arena arena-place">
      <PlaceHead title={place.title} />
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
              <ArenaCard entry={e} />
            </li>
          ))}
        </ul>
      )}
      {kind === 'forge' && shown.length > 0 && (
        // Named by the meeting only; the earliest meeting first, entries without a date last.
        <ul className="arena-list">
          {byMeeting(shown)
            .flatMap((g) => g.entries)
            .map((e) => (
              <li key={e.id}>
                <Link className="arena-card" to={`/arena/${e.id}`}>
                  <span className="arena-card-title">{forgeTitle(e)}</span>
                </Link>
              </li>
            ))}
        </ul>
      )}
      {archivedCount > 0 && (
        <p className="small arena-archived">
          <Link to={REVIEW_PATH}>Archivierte Einträge im Rückblick</Link>
        </p>
      )}
    </div>
  );
}

/** The head of a place: the way back to the Arena, and the place's name. */
function PlaceHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <>
      <p className="back-link">
        <Link to="/arena">‹ Arena</Link>
      </p>
      <h2 className="place-title">
        {title}
        {sub && <span className="place-sub">{sub}</span>}
      </h2>
    </>
  );
}

/**
 * The Arena's entrance: three places as tiles, each with what stands there now.
 * A tap opens the place on a page of its own.
 */
function ArenaHome() {
  const store = useStore();
  const profile = useProfile();
  const today = store.today();
  const live = profile.arena.filter((e) => entryTitle(e) && e.archivedAt === undefined);
  const lastJournal = live.filter((e) => kindOf(e) === 'journal').sort((a, b) => b.createdAt - a.createdAt)[0];
  const forge = live.filter((e) => kindOf(e) === 'forge');
  const meeting = byMeeting(forge).find((g) => g.date && g.date >= today)?.date;
  const run = activeRun(profile.winterArc);
  const places: { place: Place; title: string; icon: FlowIconName; line: string }[] = [
    {
      place: 'journal',
      title: PLACES.journal.title,
      icon: 'candle',
      line: lastJournal ? `Zuletzt: ${entryTitle(lastJournal)}` : 'Was dich belastet und womit du ringst',
    },
    {
      place: 'forge',
      title: PLACES.forge.title,
      icon: 'people',
      line: meeting
        ? `Treffen am ${formatLong(meeting)}`
        : forge.length
          ? 'Anliegen fürs nächste Treffen'
          : 'Für das Treffen mit deinen Brüdern',
    },
    {
      place: 'hall',
      title: 'Wüstenzeit',
      icon: 'sunrise',
      line: run ? desertLine(profile, today) : 'Weniger Ablenkung. Mehr Raum für Gott.',
    },
  ];
  return (
    <div className="arena arena-home">
      <h2>Arena</h2>
      <SectionVerse id="arena" />
      <ul className="arena-places">
        {places.map((p) => (
          <li key={p.place}>
            <Link className={`arena-place-tile arena-place-${p.place}`} to={arenaPath(p.place)}>
              <span className="arena-place-icon" aria-hidden="true">
                <FlowIcon name={p.icon} size={26} />
              </span>
              <span className="arena-place-text">
                <span className="arena-place-title">{p.title}</span>
                <span className="arena-place-line">{p.line}</span>
              </span>
              <span className="arena-place-go" aria-hidden="true">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
