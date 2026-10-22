import { useId, useState } from 'react';
import { useToast } from '../../app/Toast';
import { useProfile, useStore } from '../../data/hooks';
import {
  WELL_COMFORT,
  WELL_CONFESSION_NOTE,
  WELL_FRAME,
  WELL_INTRO,
  WELL_NOTES,
  WELL_POSTURE,
  WELL_STEPS,
  WELL_VERSES,
} from '../../content/well';
import type { WeeklyVerse } from '../../content/weeklyVerses';
import { addDays, formatLong, isDateKey } from '../../domain/dates';
import { composeVerse } from '../../domain/weeklyVerse';
import { meetingOfWeek, pastMeetings, previousResolution, wifeName, type WellMeeting } from '../../domain/well';
import { BibleRef } from '../../ui/BibleRef';
import { EntryMenu } from '../../ui/EntryMenu';
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

/** A few lines of free text; the field grows with a taller rows count only when the text is long. */
function NoteField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="field well-note">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} rows={Math.max(2, Math.min(8, value.split('\n').length + 1))} value={value} onChange={(e) => onChange(e.target.value)} />
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

/** The notes of one meeting; typed text is kept as it is typed. */
function Notes({ meeting }: { meeting: WellMeeting }) {
  const store = useStore();
  const nextId = useId();
  const set = (patch: Partial<WellMeeting>) => store.updateWellMeeting(meeting.id, (m) => ({ ...m, ...patch }));
  return (
    <div className="well-notes">
      <h4 className="well-date">Treffen am {dateLabel(meeting.date)}</h4>
      <NoteField label={WELL_NOTES.resolution} value={meeting.resolution} onChange={(resolution) => set({ resolution })} />
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
            store.updateWellMeeting(meeting.id, (m) => {
              const { next: _, ...rest } = m;
              return isDateKey(e.target.value) ? { ...rest, next: e.target.value } : rest;
            })
          }
        />
      </div>
      <p className="small muted">{WELL_CONFESSION_NOTE}</p>
    </div>
  );
}

/** A past meeting for reading: folded, with its date; the three dots delete it. */
function PastMeeting({ meeting: m }: { meeting: WellMeeting }) {
  const store = useStore();
  const toast = useToast();
  const rows: [string, string][] = [
    [WELL_NOTES.resolution, m.resolution],
    [WELL_NOTES.herWish, m.herWish],
    [WELL_NOTES.herConcern, m.herConcern],
    [WELL_NOTES.myConcern, m.myConcern],
    [WELL_NOTES.next, m.next ? dateLabel(m.next) : ''],
  ];
  return (
    <li className="arena-item">
      <details className="arena-card well-past">
        <summary>
          <span className="arena-card-title">{dateLabel(m.date)}</span>
          {m.resolution.trim() && (
            <span className="arena-card-date">
              {m.resolution.trim()}
              {m.resolutionDone && ' · umgesetzt'}
            </span>
          )}
        </summary>
        <dl>
          {rows
            .filter(([, v]) => v.trim())
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
      </details>
      <EntryMenu
        label={`Aktionen für das Treffen am ${dateLabel(m.date)}`}
        items={[
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
 * The Treffen am Abendbrunnen, a place of the Arena: the verses and the guide
 * for the weekly evening with the wife, then the notes of the week and the
 * list of past meetings. Everything stays on the device (rule 10).
 */
export function WellPage() {
  const store = useStore();
  const profile = useProfile();
  const name = wifeName(profile.house.wife.name);
  const today = store.today();
  const well = profile.well;
  const current = meetingOfWeek(well, today);
  const last = previousResolution(well, current ?? { id: '', date: addDays(today, 1) });
  const past = pastMeetings(well, current?.id);
  return (
    <>
      {WELL_VERSES.map((v) => (
        <Verse key={v.ref} verse={v} />
      ))}
      <p className="arena-note">{WELL_INTRO}</p>

      <section className="well-section" aria-labelledby="well-frame">
        <h3 id="well-frame">Rahmen</h3>
        <p>{WELL_FRAME.intro}</p>
        <ul className="well-list">
          {WELL_FRAME.points.map((p) => (
            <li key={p.label}>
              <strong>{p.label}:</strong> {p.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="well-section" aria-labelledby="well-steps">
        <h3 id="well-steps">Ablauf in sechs Schritten</h3>
        <Steps name={name} />
      </section>

      <section className="well-section" aria-labelledby="well-posture">
        <h3 id="well-posture">Haltung im Gespräch</h3>
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
      </section>

      <section className="well-section" aria-labelledby="well-notes">
        <h3 id="well-notes">Notizen</h3>
        {last && <LastResolution meeting={last} />}
        {current ? (
          <Notes meeting={current} />
        ) : (
          <button type="button" className="btn primary arena-new" onClick={() => store.addWellMeeting()}>
            Treffen dieser Woche beginnen
          </button>
        )}
      </section>

      {past.length > 0 && (
        <section className="well-section" aria-labelledby="well-past">
          <h3 id="well-past">Vergangene Treffen</h3>
          <ul className="arena-list">
            {past.map((m) => (
              <PastMeeting key={m.id} meeting={m} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
