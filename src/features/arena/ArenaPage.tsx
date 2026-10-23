import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { BackLink } from '../../ui/BackLink';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { useToast } from '../../app/Toast';
import { useProfile, useStore } from '../../data/hooks';
import { byMeeting, entryTitle, forgeTitle, isEmptyEntry, isReference, pinnedFirst } from '../../domain/arena';
import type { ArenaEntry, ArenaPoint } from '../../domain/model';
import { BibleRef } from '../../ui/BibleRef';
import { Segmented } from '../../ui/Choice';
import { FlowIcon, type FlowIconName } from '../../ui/FlowIcon';
import { formatLong, isDateKey } from '../../domain/dates';
import { isDoneOn } from '../../domain/habits';
import { desertLine } from '../desert/DesertSettings';
import { arenaOffer } from '../../domain/seasons';
import { seasonTileLine } from '../desert/SeasonInvite';
import { SectionVerse } from '../../ui/SectionVerse';
import { activeRun } from '../../domain/winterArc';
import { WINTER_ARC_COMFORT } from '../../content/winterArc';
import { InkPad } from './InkPad';
import { EntryMenu } from '../../ui/EntryMenu';
import { Desert } from '../desert/Desert';
import { DesertExamen, EXAMEN_SLUG } from '../desert/DesertExamen';
import { DesertThanks, THANKS_SLUG } from '../desert/DesertThanks';
import { DaySheets } from '../desert/DesertJournal';
import { ICON_SIZE } from '../../ui/iconBase';
import { Chevron } from '../../ui/Chevron';
import { ConfirmRow } from '../../ui/ConfirmRow';
import { fieldKeys, focusSibling } from '../../ui/fieldNav';

type Kind = 'journal' | 'forge' | 'desert';
const kindOf = (e: ArenaEntry): Kind => (e.kind === 'forge' ? 'forge' : e.kind === 'desert' ? 'desert' : 'journal');
const FORGE_PARAM = 'bereich';
const FORGE_SLUG = 'eisenschmiede';
/** The Wüstenwanderung, the Arena's place of the Wüstenzeit; the addresses of 0.39.0 and of the Streithalle lead there too. */
const HALL_SLUG = 'wuestenwanderung';
const OLD_HALL_SLUGS = ['wuestenzeit', 'streithalle'];
type Place = 'journal' | 'forge' | 'hall';

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
  // The journal of the Wüstenwanderung: written like the Gebetskammer's, kept apart from it.
  desert: {
    title: 'Wüstenwanderung',
    verse: 'arena',
    note: 'Hier schreibst du auf, was dich in dieser Zeit bewegt und was Gott dir zeigt. Sünde wird gebetet, nicht notiert – dafür ist die Beichte im Nachtgebet.',
    add: 'Neuen Eintrag schreiben',
    textLabel: 'Was dich in dieser Zeit bewegt',
    textHint: 'Was dich in dieser Zeit bewegt, womit du ringst, was Gott dir zeigt …',
    concernHint: 'Wofür du betest',
    comfort: [{ text: WINTER_ARC_COMFORT.verse.text, ref: WINTER_ARC_COMFORT.verse.ref }],
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
  const place = PLACES[kindOf(entry) === 'desert' ? 'desert' : 'journal'];
  const textId = useId();
  const hasText = !!entry.text.trim();
  const hasInk = !!entry.ink?.length;
  const [writing, setWriting] = useState<Writing>(() =>
    hasInk && !hasText ? 'ink' : hasText && !hasInk ? 'text' : lastWriting(),
  );
  // The field grows with the text, so the page scrolls and not a small window inside it.
  const area = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const fit = () => {
      const el = area.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight + 2}px`;
    };
    fit();
    // Turned, the iPad is wider or narrower, and the text needs another height.
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [entry.text, writing]);
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
      <legend>{place.textLabel}</legend>
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
            {place.textLabel}
          </label>
          <textarea
            id={textId}
            ref={area}
            rows={14}
            value={entry.text}
            placeholder={place.textHint}
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
const SLUG: Record<Place | 'desert', string> = { journal: JOURNAL_SLUG, forge: FORGE_SLUG, hall: HALL_SLUG, desert: HALL_SLUG };
const arenaPath = (k: Place | 'desert') => `/arena?${FORGE_PARAM}=${SLUG[k]}`;

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
  // Enter makes a new line below and moves into it; Backspace on an empty line takes it out (as in the points list).
  const refs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [focusNext, setFocusNext] = useState<number | null>(null);
  useEffect(() => {
    if (focusNext === null) return;
    refs.current[focusNext]?.focus();
    setFocusNext(null);
  }, [focusNext]);
  const insertAfter = (i: number) => {
    onChange([...list.slice(0, i + 1), '', ...list.slice(i + 1)]);
    setFocusNext(i + 1);
  };
  const removeAt = (i: number) => {
    onChange(list.filter((_, k) => k !== i));
    setFocusNext(Math.max(0, i - 1));
  };
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
              ref={(el) => {
                refs.current[i] = el;
              }}
              enterKeyHint="next"
              value={v}
              placeholder={placeholder}
              onFocus={() => setFocused(i)}
              onBlur={() => setFocused((f) => (f === i ? null : f))}
              onValue={(x) => set(i, x)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // An empty line adds no further empty line: Enter there goes on to the next field.
                  if (v.trim()) insertAfter(i);
                  else focusSibling(e.currentTarget);
                } else if (e.key === 'Backspace' && v === '' && list.length > 1) {
                  e.preventDefault();
                  removeAt(i);
                }
              }}
            />
            {list.length > 1 && (
              <button
                type="button"
                className="arena-remove"
                aria-label={`${label} ${i + 1} entfernen`}
                onClick={() => removeAt(i)}
              >
                <FlowIcon name="close" size={ICON_SIZE.m} plain />
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
        <FlowIcon name="plus" size={ICON_SIZE.m} plain />
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
                <FlowIcon name="close" size={ICON_SIZE.m} plain />
              </button>
            )}
          </li>
        ))}
      </ul>
      <button type="button" className="concern-add arena-add" aria-label="Weiteren Punkt hinzufügen" onClick={() => insertAfter(list.length - 1)}>
        <FlowIcon name="plus" size={ICON_SIZE.m} plain />
      </button>
    </fieldset>
  );
}

/** Marks an entry pinned to the top of its place. */
const PinTag = ({ entry }: { entry: ArenaEntry }) =>
  entry.pinnedAt !== undefined ? <span className="ktag">Angeheftet</span> : null;

/** A Gebetskammer entry as a card: date, title (or first line), verses. */
function ArenaCard({ entry: e }: { entry: ArenaEntry }) {
  return (
    <Link className="arena-card" to={`/arena/${e.id}`}>
      <span className="arena-card-date">
        {dateOf(e.createdAt)}
        <PinTag entry={e} />
      </span>
      <span className="arena-card-title">{entryTitle(e)}</span>
      {e.verses.some((v) => v.trim()) && (
        <span className="arena-card-verses">{e.verses.filter((v) => v.trim()).join(' · ')}</span>
      )}
    </Link>
  );
}

/** A small round button with a Henoch icon; the label is read out and shown on hover. */
function IconButton({
  icon,
  label,
  onClick,
  pressed,
}: {
  icon: FlowIconName;
  label: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button type="button" className="entry-icon" aria-label={label} title={label} aria-pressed={pressed} onClick={onClick}>
      <FlowIcon name={icon} size={20} />
    </button>
  );
}

/** Pins an entry or takes the pin off, and says so; a full place is named, not filled. */
function usePin() {
  const store = useStore();
  const toast = useToast();
  return (entry: ArenaEntry) => {
    const pin = entry.pinnedAt === undefined;
    if (store.pinArenaEntry(entry.id, pin)) toast(pin ? `Steht jetzt oben in der ${PLACES[kindOf(entry)].title}` : 'Nicht mehr angeheftet');
    else toast('Oben stehen schon drei Einträge. Löse zuerst einen davon.');
  };
}

/** An entry in the list: its card, and beside it the three dots for pinning, archiving and deleting. */
function ListItem({ entry, children }: { entry: ArenaEntry; children: React.ReactNode }) {
  const store = useStore();
  const toast = useToast();
  const pin = usePin();
  const forge = kindOf(entry) === 'forge';
  const name = forge ? entry.title?.trim() || forgeTitle(entry) : entryTitle(entry);
  return (
    <li className="arena-item">
      {children}
      <EntryMenu
        label={`Aktionen für „${name}“`}
        items={[
          { label: entry.pinnedAt === undefined ? 'Oben anheften' : 'Nicht mehr anheften', onSelect: () => pin(entry) },
          {
            label: forge ? 'Besprochen – archivieren' : 'Eintrag archivieren',
            onSelect: () => {
              store.archiveArenaEntry(entry.id, true);
              toast(
                forge
                  ? 'Besprochen und archiviert – zu finden unter Mehr, Rückblick'
                  : 'Eintrag archiviert – zu finden unter Mehr, Rückblick',
              );
            },
          },
          {
            label: 'Eintrag löschen',
            confirm: 'Ja, Eintrag löschen',
            onSelect: () => {
              store.deleteArenaEntry(entry.id);
              toast('Eintrag gelöscht');
            },
          },
        ]}
      />
    </li>
  );
}

function EntryEditor({ entry }: { entry: ArenaEntry }) {
  const store = useStore();
  const profile = useProfile();
  const navigate = useNavigate();
  // Written for a habit of the Wüstenzeit: saved, it is ticked for its day, and the way leads back to the list.
  const [params] = useSearchParams();
  const back = params.get('zurueck');
  const day = params.get('tag');
  const habit =
    back && /^\/(?!\/)/.test(back) && day && isDateKey(day)
      ? profile.habits.find((h) => h.id === params.get('gewohnheit'))
      : undefined;
  const dateId = useId();
  const titleId = useId();
  const toast = useToast();
  const pin = usePin();
  // Deleting is asked right under the icons at the top.
  const [confirm, setConfirm] = useState(false);
  const update = (fn: (e: ArenaEntry) => ArenaEntry) => store.updateArenaEntry(entry.id, fn);
  const archived = entry.archivedAt !== undefined;
  const kind = kindOf(entry);
  const place = PLACES[kind];
  const home = habit ? back! : archived ? REVIEW_PATH : arenaPath(kind);
  const finish = () => {
    if (habit && !isEmptyEntry(entry) && !isDoneOn(habit, store.getDay(day!))) store.toggleHabit(day!, habit);
    navigate(home);
  };
  const archive = () => {
    store.archiveArenaEntry(entry.id, true);
    toast(
      kind === 'forge'
        ? 'Besprochen und archiviert – zu finden unter Mehr, Rückblick'
        : 'Eintrag archiviert – zu finden unter Mehr, Rückblick',
    );
    navigate(arenaPath(kind));
  };
  const restore = () => {
    store.archiveArenaEntry(entry.id, false);
    toast(`Eintrag steht wieder in der ${place.title}`);
    navigate(arenaPath(kind));
  };
  const remove = () => {
    store.deleteArenaEntry(entry.id);
    navigate(home);
  };

  return (
    <article className="arena-entry" data-fields onKeyDown={fieldKeys}>
      {/* The way back, and beside it small icons for the actions, as on the iPhone. */}
      <div className="entry-bar">
        <BackLink to={home}>{habit ? 'Zurück zur Liste' : archived ? 'Rückblick' : place.title}</BackLink>
        <div className="entry-bar-icons" role="toolbar" aria-label="Eintrag">
          <IconButton icon="check" label={habit && !isEmptyEntry(entry) ? 'Abhaken und zurück' : 'Sichern und zurück'} onClick={finish} />
          {!archived && (
            <IconButton
              icon="pin"
              label={entry.pinnedAt === undefined ? 'Anheften' : 'Lösen'}
              pressed={entry.pinnedAt !== undefined}
              onClick={() => pin(entry)}
            />
          )}
          {archived ? (
            <IconButton icon="unarchive" label="Zurückholen" onClick={restore} />
          ) : (
            <IconButton icon="archive" label="Archivieren" onClick={archive} />
          )}
          <IconButton icon="trash" label="Löschen" onClick={() => setConfirm(true)} />
        </div>
      </div>
      {confirm && (
        <ConfirmRow label="Eintrag löschen?" showLabel confirmLabel="Ja, Eintrag löschen" onConfirm={remove} onCancel={() => setConfirm(false)} />
      )}
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

      <div className="field arena-title">
        <label htmlFor={titleId}>Titel</label>
        <input
          id={titleId}
          type="text"
          data-enter="next"
          enterKeyHint="next"
          value={entry.title ?? ''}
          placeholder="Wie der Eintrag in der Übersicht heißen soll"
          onChange={(e) => {
            const v = e.target.value;
            update((x) => {
              const { title: _, ...rest } = x;
              return v ? { ...rest, title: v } : rest;
            });
          }}
        />
      </div>

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
    </article>
  );
}

/**
 * The journal of the Wüstenwanderung: entries one under the other, newest first (pinned ones on top),
 * written and kept like those of the Gebetskammer, but apart from them. The old sheets of single days
 * stand folded below, to be read as they were written.
 */
function DesertEntries() {
  const store = useStore();
  const profile = useProfile();
  const navigate = useNavigate();
  const place = PLACES.desert;
  const shown = profile.arena.filter((e) => entryTitle(e) && e.archivedAt === undefined && kindOf(e) === 'desert');
  const archivedCount = profile.arena.filter((e) => e.archivedAt !== undefined && kindOf(e) === 'desert').length;
  return (
    <section className="desert-entries" aria-labelledby="desert-entries-title">
      <h3 id="desert-entries-title">Tagebuch</h3>
      <p className="arena-note">{place.note}</p>
      <button type="button" className="btn primary arena-new" onClick={() => navigate(`/arena/${store.addArenaEntry('desert')}`)}>
        {place.add}
      </button>
      {shown.length > 0 && (
        <ul className="arena-list">
          {pinnedFirst(shown).map((e) => (
            <ListItem key={e.id} entry={e}>
              <ArenaCard entry={e} />
            </ListItem>
          ))}
        </ul>
      )}
      {archivedCount > 0 && (
        <p className="small arena-archived">
          <Link to={REVIEW_PATH}>Archivierte Einträge im Rückblick</Link>
        </p>
      )}
      <DaySheets />
    </section>
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

  if (eintrag === EXAMEN_SLUG) return <DesertExamen />;
  if (eintrag === THANKS_SLUG) return <DesertThanks />;
  if (eintrag) {
    const entry = entries.find((e) => e.id === eintrag);
    if (entry) return <EntryEditor entry={entry} />;
    return (
      <>
        <div className="title-row">
          <BackLink to="/arena">Arena</BackLink>
          <p className="title-row-text">Diesen Eintrag gibt es nicht mehr.</p>
        </div>
      </>
    );
  }

  const param = params.get(FORGE_PARAM);
  const shownPlace: Place | undefined =
    param === FORGE_SLUG
      ? 'forge'
      : param === HALL_SLUG || OLD_HALL_SLUGS.includes(param ?? '')
        ? 'hall'
        : param === JOURNAL_SLUG
          ? 'journal'
          : undefined;
  if (!shownPlace) return <ArenaHome />;
  if (shownPlace === 'hall') {
    return (
      <div className="arena arena-place">
        <PlaceHead title="Wüstenwanderung" />
        <Desert journal={<DesertEntries />} />
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
          {pinnedFirst(shown).map((e) => (
            <ListItem key={e.id} entry={e}>
              <ArenaCard entry={e} />
            </ListItem>
          ))}
        </ul>
      )}
      {kind === 'forge' && shown.length > 0 && (
        // Named by the title, else by the meeting; pinned first, then the earliest meeting, entries without a date last.
        <ul className="arena-list">
          {pinnedFirst(byMeeting(shown).flatMap((g) => g.entries)).map((e) => (
            <ListItem key={e.id} entry={e}>
              <Link className="arena-card" to={`/arena/${e.id}`}>
                {e.title?.trim() ? (
                  <>
                    <span className="arena-card-date">
                      {forgeTitle(e)}
                      <PinTag entry={e} />
                    </span>
                    <span className="arena-card-title">{e.title.trim()}</span>
                  </>
                ) : (
                  <span className="arena-card-title">
                    {forgeTitle(e)}
                    <PinTag entry={e} />
                  </span>
                )}
              </Link>
            </ListItem>
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
      <div className="title-row">
        <BackLink to="/arena">Arena</BackLink>
        <h2 className="place-title">
          {title}
          {sub && <span className="place-sub">{sub}</span>}
        </h2>
      </div>
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
  const offer = arenaOffer(profile, today);
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
      title: 'Wüstenwanderung',
      icon: 'sunrise',
      line: offer ? seasonTileLine(offer) : run ? desertLine(profile, today) : 'Weniger Ablenkung. Mehr Raum für Gott.',
    },
  ];
  return (
    <div className="arena arena-home">
      <h2 className="visually-hidden">Arena</h2>
      <SectionVerse id="arena" />
      <ul className="arena-places">
        {places.map((p) => (
          <li key={p.place}>
            <Link className={`arena-place-tile arena-place-${p.place}`} to={arenaPath(p.place)}>
              <span className="arena-place-icon" aria-hidden="true">
                <FlowIcon name={p.icon} size={22} />
              </span>
              <span className="arena-place-text">
                <span className="arena-place-title">{p.title}</span>
                <span className="arena-place-line">{p.line}</span>
              </span>
              <span className="arena-place-go" aria-hidden="true">
                <Chevron dir="right" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
