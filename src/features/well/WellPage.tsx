import { useId, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { TileGroup } from '../../ui/TileGroup';
import { useToast } from '../../app/Toast';
import { downloadText } from '../../app/files';
import { fieldKeys } from '../../ui/fieldNav';
import { meetingFilename, meetingsBasename, meetingsToMarkdown, meetingToMarkdown, saveMeetingPdf, saveMeetingsPdf } from '../../domain/wellExport';
import { usePdf } from '../../app/usePdf';
import { ExportAll } from '../../ui/ExportAll';
import { useProfile, useStore } from '../../data/hooks';
import {
  WELL_COMFORT,
  WELL_CONFESSION_NOTE,
  WELL_FRAME,
  WELL_INTRO,
  WELL_NOTES,
  WELL_POSTURE,
  WELL_STEPS,
  WELL_TITLE,
  WELL_VERSES,
} from '../../content/well';
import type { WeeklyVerse } from '../../content/weeklyVerses';
import { formatLong, isDateKey, toKey } from '../../domain/dates';
import { composeVerse } from '../../domain/weeklyVerse';
import { REVIEW_PATH } from '../../domain/arena';
import { isEmptyMeeting, meetingTitle, pinnedFirstMeetings, previousResolution, wifeName, type WellMeeting } from '../../domain/well';
import { BibleRef } from '../../ui/BibleRef';
import { BackLink } from '../../ui/BackLink';
import { ConfirmRow } from '../../ui/ConfirmRow';
import { EntryMenu } from '../../ui/EntryMenu';
import { FlowIcon, type FlowIconName } from '../../ui/FlowIcon';
import { StepFlow } from '../../ui/StepFlow';

/** The address of the place in the Arena. */
export const WELL_SLUG = 'abendbrunnen';

const dateLabel = (k: string) => `${formatLong(k)} ${k.slice(0, 4)}`;

/** A Bible verse with its place, as heading a section under "Mehr". */
function Verse({ verse }: { verse: WeeklyVerse }) {
  return (
    <figure className="section-verse">
      <blockquote>{composeVerse(verse)}</blockquote>
      <figcaption>
        <BibleRef reference={verse.ref} />
      </figcaption>
    </figure>
  );
}

/** A few lines of free text; the field grows with the text, so the page scrolls and not a small window inside it. */
function NoteField({
  label,
  value,
  onChange,
  placeholder,
  single = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** One sentence: it wraps, but Enter adds no line break. */
  single?: boolean;
}) {
  const id = useId();
  const area = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const fit = () => {
      const el = area.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight + 2}px`;
    };
    fit();
    // Turned, the phone is wider or narrower, and the text needs another height.
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [value]);
  return (
    <div className="field well-note">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        ref={area}
        className="grow-field"
        rows={1}
        data-enter={single ? 'next' : undefined}
        enterKeyHint={single ? 'next' : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(single ? e.target.value.replace(/\n/g, ' ') : e.target.value)}
        onKeyDown={(e) => {
          if (single && e.key === 'Enter' && !e.nativeEvent.isComposing) e.preventDefault();
        }}
      />
    </div>
  );
}

/** The six steps of the evening, one at a time. */
function Steps({ name }: { name: string }) {
  const [current, setCurrent] = useState(0);
  const step = WELL_STEPS[current]!;
  const next = WELL_STEPS[current + 1];
  return (
    <StepFlow
      label="Treffen am Abendbrunnen"
      steps={WELL_STEPS.map((s, i) => ({ id: s.id, title: s.title, mark: i + 1, short: s.title }))}
      current={current}
      onSelect={setCurrent}
      footer={
        next && (
          <button type="button" className="btn primary" onClick={() => setCurrent(current + 1)}>
            Weiter zu: {next.title}
          </button>
        )
      }
    >
      {step.questions(name).map((q) => (
        <p key={q} className="well-question">
          {q}
        </p>
      ))}
      <p className="small muted well-refs">
        <BibleRef reference={step.refs} />
      </p>
      {step.id === 'beziehung' && (
        <>
          <p className="arena-note">{WELL_CONFESSION_NOTE}</p>
          <aside className="arena-comfort" aria-label="Zuspruch">
            <p>
              {composeVerse(WELL_COMFORT)} <BibleRef reference={WELL_COMFORT.ref} />
            </p>
          </aside>
        </>
      )}
    </StepFlow>
  );
}

/** The address of one meeting's page: "/arena/treffen-<id>". */
export const meetingPath = (id: string) => `/arena/${MEETING_PREFIX}${id}`;
export const MEETING_PREFIX = 'treffen-';

/** The resolution of the last meeting, asked about at this one. */
function LastResolution({ meeting }: { meeting: WellMeeting }) {
  const store = useStore();
  const id = useId();
  return (
    <div className="well-last">
      <p className="small muted">Dein Vorsatz vom Treffen am {dateLabel(meeting.date)}</p>
      <p className="well-last-text">{meeting.resolution}</p>
      <label htmlFor={id} className="well-last-check">
        <input
          id={id}
          type="checkbox"
          checked={meeting.resolutionDone}
          onChange={(e) => store.updateWellMeeting(meeting.id, (m) => ({ ...m, resolutionDone: e.target.checked }))}
        />
        <span>Umgesetzt?</span>
      </label>
    </div>
  );
}

/** The meeting as a Markdown file; the toast says so. */
function useMarkdownExport() {
  const toast = useToast();
  return (m: WellMeeting) => {
    downloadText(meetingFilename(m, 'md'), meetingToMarkdown(m), 'text/markdown');
    toast('Treffen als Markdown erstellt');
  };
}

/** A small round button with an icon, as in the entries of the Arena. */
function IconButton({ icon, label, onClick, pressed }: { icon: FlowIconName; label: string; onClick: () => void; pressed?: boolean }) {
  return (
    <button type="button" className="entry-icon" aria-label={label} title={label} aria-pressed={pressed} onClick={onClick}>
      <FlowIcon name={icon} size={20} />
    </button>
  );
}

/** Pins a meeting or takes the pin off, and says so; a full list is named, not filled. */
function usePin() {
  const store = useStore();
  const toast = useToast();
  return (m: WellMeeting) => {
    const pin = m.pinnedAt === undefined;
    if (store.pinWellMeeting(m.id, pin)) toast(pin ? `Steht jetzt oben im ${WELL_TITLE}` : 'Nicht mehr angeheftet');
    else toast('Oben stehen schon drei Einträge. Löse zuerst einen davon.');
  };
}

/** One meeting on a page of its own: the resolution of the last one on top, then the notes of this one. */
export function WellMeetingPage({ id }: { id: string }) {
  const store = useStore();
  const profile = useProfile();
  const navigate = useNavigate();
  const dateId = useId();
  const titleId = useId();
  const nextId = useId();
  const toast = useToast();
  const pin = usePin();
  const [confirm, setConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const pdf = usePdf();
  const exportMarkdown = useMarkdownExport();
  const meeting = profile.well.meetings.find((m) => m.id === id);
  const place = `/arena?bereich=${WELL_SLUG}`;
  const archived = meeting?.archivedAt !== undefined;
  const home = archived ? REVIEW_PATH : place;
  if (!meeting) {
    return (
      <div className="title-row">
        <BackLink to={place}>{WELL_TITLE}</BackLink>
        <p className="title-row-text">Dieses Treffen gibt es nicht mehr.</p>
      </div>
    );
  }
  const last = previousResolution(profile.well, meeting);
  const set = (patch: Partial<WellMeeting>) => store.updateWellMeeting(id, (m) => ({ ...m, ...patch }));
  const remove = () => {
    store.updateProfile((p) => ({ ...p, well: { ...p.well, meetings: p.well.meetings.filter((m) => m.id !== id) } }), { immediate: true });
    navigate(home);
  };
  const archive = () => {
    store.archiveWellMeeting(id, true);
    toast('Treffen archiviert – zu finden unter Mehr, Rückblick');
    navigate(place);
  };
  const restore = () => {
    store.archiveWellMeeting(id, false);
    toast(`Treffen steht wieder im ${WELL_TITLE}`);
    navigate(place);
  };
  return (
    <article className="arena-entry" data-fields onKeyDown={fieldKeys}>
      <div className="entry-bar">
        <BackLink to={home}>{archived ? 'Rückblick' : WELL_TITLE}</BackLink>
        <div className="entry-bar-icons" role="toolbar" aria-label="Treffen">
          <IconButton icon="check" label="Sichern und zurück" onClick={() => navigate(home)} />
          {!archived && (
            <IconButton icon="pin" label={meeting.pinnedAt === undefined ? 'Anheften' : 'Lösen'} pressed={meeting.pinnedAt !== undefined} onClick={() => pin(meeting)} />
          )}
          {archived ? (
            <IconButton icon="unarchive" label="Zurückholen" onClick={restore} />
          ) : (
            <IconButton icon="archive" label="Archivieren" onClick={archive} />
          )}
          <IconButton icon="export" label="Exportieren" pressed={exporting} onClick={() => setExporting((x) => !x)} />
          <IconButton icon="trash" label="Löschen" onClick={() => setConfirm(true)} />
        </div>
      </div>
      {exporting && (
        <div className="entry-export" role="group" aria-label="Treffen exportieren">
          <button type="button" className="btn" onClick={() => exportMarkdown(meeting)}>
            Als Text exportieren (Markdown)
          </button>
          <button type="button" className="btn" onClick={() => pdf(() => saveMeetingPdf(meeting))}>
            Als PDF sichern
          </button>
        </div>
      )}
      {confirm && (
        <ConfirmRow label="Treffen löschen?" showLabel confirmLabel="Ja, Treffen löschen" onConfirm={remove} onCancel={() => setConfirm(false)} />
      )}
      <h2 className="arena-entry-date">Treffen am {dateLabel(meeting.date)}</h2>
      {archived && <p className="small muted">Archiviert am {dateLabel(toKey(new Date(meeting.archivedAt!)))}. Steht im Rückblick.</p>}
      {last && <LastResolution meeting={last} />}
      <div className="field arena-meeting">
        <label htmlFor={dateId}>Treffen am</label>
        <input
          id={dateId}
          type="date"
          value={meeting.date}
          onChange={(e) => isDateKey(e.target.value) && set({ date: e.target.value })}
        />
      </div>
      <div className="field arena-title">
        <label htmlFor={titleId}>Titel</label>
        <input
          id={titleId}
          type="text"
          data-enter="next"
          enterKeyHint="next"
          value={meeting.title ?? ''}
          placeholder="Wie das Treffen in der Übersicht heißen soll"
          onChange={(e) => {
            const v = e.target.value;
            store.updateWellMeeting(id, (m) => {
              const { title: _, ...rest } = m;
              return v ? { ...rest, title: v } : rest;
            });
          }}
        />
      </div>
      <NoteField
        single
        label={WELL_NOTES.resolution}
        value={meeting.resolution}
        placeholder="Ein Satz, den du bis zum nächsten Treffen umsetzt"
        onChange={(resolution) => set({ resolution })}
      />
      <NoteField label={WELL_NOTES.herWish} value={meeting.herWish} onChange={(herWish) => set({ herWish })} />
      <NoteField label={WELL_NOTES.herConcern} value={meeting.herConcern} onChange={(herConcern) => set({ herConcern })} />
      <NoteField label={WELL_NOTES.myConcern} value={meeting.myConcern} onChange={(myConcern) => set({ myConcern })} />
      <div className="field arena-meeting">
        <label htmlFor={nextId}>{WELL_NOTES.next}</label>
        <input
          id={nextId}
          type="date"
          value={meeting.next ?? ''}
          onChange={(e) =>
            store.updateWellMeeting(id, (m) => {
              const { next: _, ...rest } = m;
              return isDateKey(e.target.value) ? { ...rest, next: e.target.value } : rest;
            })
          }
        />
      </div>
      <p className="arena-note">{WELL_CONFESSION_NOTE}</p>
    </article>
  );
}

/** A meeting in the list: its card, and beside it the three dots for deleting. */
function ListItem({ meeting: m }: { meeting: WellMeeting }) {
  const store = useStore();
  const toast = useToast();
  const pin = usePin();
  const exportMarkdown = useMarkdownExport();
  const pdf = usePdf();
  return (
    <li className="arena-item">
      <Link className="arena-card" to={meetingPath(m.id)}>
        <span className="arena-card-date">
          {dateLabel(m.date)}
          {m.pinnedAt !== undefined && <span className="ktag">Angeheftet</span>}
        </span>
        <span className="arena-card-title">{meetingTitle(m)}</span>
        {m.resolutionDone && <span className="arena-card-verses">Vorsatz umgesetzt</span>}
      </Link>
      <EntryMenu
        label={`Aktionen für das Treffen am ${dateLabel(m.date)}`}
        items={[
          { label: m.pinnedAt === undefined ? 'Oben anheften' : 'Nicht mehr anheften', onSelect: () => pin(m) },
          { label: 'Als Text exportieren (Markdown)', onSelect: () => exportMarkdown(m) },
          { label: 'Als PDF sichern', onSelect: () => pdf(() => saveMeetingPdf(m)) },
          {
            label: 'Besprochen – archivieren',
            onSelect: () => {
              store.archiveWellMeeting(m.id, true);
              toast('Treffen archiviert – zu finden unter Mehr, Rückblick');
            },
          },
          {
            label: 'Treffen löschen',
            confirm: 'Ja, Treffen löschen',
            onSelect: () => {
              store.updateProfile((p) => ({ ...p, well: { ...p.well, meetings: p.well.meetings.filter((x) => x.id !== m.id) } }), { immediate: true });
              toast('Treffen gelöscht');
            },
          },
        ]}
      />
    </li>
  );
}

/**
 * The Treffen am Abendbrunnen, a place of the Arena, built like the Eisenschmiede:
 * the verses and the guide on the title page, then the meetings as a list, each
 * on a page of its own. Everything stays on the device (rule 10).
 */
export function WellPage() {
  const store = useStore();
  const toast = useToast();
  const pdf = usePdf();
  const profile = useProfile();
  const navigate = useNavigate();
  const name = wifeName(profile.house.wife.name);
  const shown = pinnedFirstMeetings(profile.well.meetings.filter((m) => !isEmptyMeeting(m) && m.archivedAt === undefined));
  const archivedCount = profile.well.meetings.filter((m) => m.archivedAt !== undefined).length;
  return (
    <>
      {WELL_VERSES.map((v) => (
        <Verse key={v.ref} verse={v} />
      ))}
      <p className="arena-note">{WELL_INTRO}</p>

      <section className="well-section" aria-labelledby="well-steps">
        <h3 id="well-steps">Ablauf in sechs Schritten</h3>
        <Steps name={name} />
      </section>

      <TileGroup
        level={4}
        label="Anleitung"
        items={[
          {
            id: 'well.frame',
            title: 'Rahmen',
            line: '20 bis 30 Minuten am Abend',
            icon: 'clock',
            content: (
              <>
                <p>{WELL_FRAME.intro}</p>
                <ul className="well-list">
                  {WELL_FRAME.points.map((p) => (
                    <li key={p.label}>
                      <strong>{p.label}:</strong> {p.text}
                    </li>
                  ))}
                </ul>
              </>
            ),
          },
          {
            id: 'well.posture',
            title: 'Haltung',
            line: 'Sechs Hinweise fürs Gespräch',
            icon: 'heart',
            content: (
              <ul className="well-list">
                {WELL_POSTURE.map((p) => (
                  <li key={p.label}>
                    <strong>{p.label}:</strong> {p.text}
                    {p.ref && (
                      <>
                        {' '}
                        <BibleRef reference={p.ref} />
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ),
          },
        ]}
      />

      <section className="well-section" aria-labelledby="well-meetings">
        <div className="list-head">
          <h3 id="well-meetings">Treffen</h3>
          {profile.well.meetings.some((m) => !isEmptyMeeting(m)) && (
            <ExportAll
              label="Alle Treffen exportieren"
              onMarkdown={() => {
                downloadText(`${meetingsBasename(store.today())}.md`, meetingsToMarkdown(profile.well.meetings, store.today()), 'text/markdown');
                toast('Treffen als Markdown erstellt');
              }}
              onPdf={() => pdf(() => saveMeetingsPdf(profile.well.meetings, store.today()))}
            />
          )}
        </div>
        <button type="button" className="btn primary arena-new" onClick={() => navigate(meetingPath(store.addWellMeeting()))}>
          Treffen aufschreiben
        </button>
        {shown.length > 0 && (
          <ul className="arena-list">
            {shown.map((m) => (
              <ListItem key={m.id} meeting={m} />
            ))}
          </ul>
        )}
        {archivedCount > 0 && (
          <p className="small arena-archived">
            <Link to={REVIEW_PATH}>Archivierte Einträge im Rückblick</Link>
          </p>
        )}
      </section>
    </>
  );
}
