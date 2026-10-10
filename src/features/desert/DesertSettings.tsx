import { useId, useState } from 'react';
import { useProfile, useStore } from '../../data/hooks';
import { activeDesert, DEFAULT_DESERT_DAYS, isDesert, QUICK_DESERT_DAYS } from '../../domain/desert';
import { fromKey, isDateKey, MONTH_LONG, WEEKDAY_LONG, type DateKey } from '../../domain/dates';
import type { Profile } from '../../domain/model';
import {
  activeRun,
  daysBetween,
  endDateOf,
  isValidDuration,
  MAX_DURATION,
  MIN_DURATION,
  positionOf,
  stageOf,
} from '../../domain/winterArc';
import { Segmented } from '../../ui/Choice';
import { DesertChoice } from './DesertChoice';

/** "Samstag, 2. Januar 2027" */
export function formatFullDate(k: DateKey): string {
  const d = fromKey(k);
  return `${WEEKDAY_LONG[d.getDay()]}, ${d.getDate()}. ${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/** What the settings and the Arena say about the Wüstenzeit now. */
export function desertLine(profile: Profile, today: DateKey): string {
  const run = activeRun(profile.winterArc);
  if (!run) return 'Aus';
  const stage = stageOf(run, today);
  if (stage === 'before') return `Beginnt am ${formatFullDate(run.startDate)}`;
  if (stage === 'after') return 'Abgeschlossen';
  const { day, days } = positionOf(run, today);
  return `Tag ${day} von ${days}`;
}

/** A start filled in beforehand, as by the invitation in Advent. */
export interface StartPreset {
  start: DateKey;
  days: number;
  name: string;
  title: string;
  /** Beside the length while it is the one proposed. */
  note: string;
}

/**
 * The start of a Wüstenzeit: the span in calendar days (40, 90 or any) and the
 * first day (today unless chosen). The habits of the last Wüstenzeit come along.
 */
export function DesertStartPanel({ onDone, preset }: { onDone: () => void; preset?: StartPreset }) {
  const store = useStore();
  const profile = useProfile();
  const id = useId();
  const today = store.today();
  const [start, setStart] = useState<DateKey>(preset?.start ?? today);
  const [duration, setDuration] = useState(String(preset?.days ?? DEFAULT_DESERT_DAYS));
  const quick = preset && !(QUICK_DESERT_DAYS as readonly number[]).includes(preset.days) ? [preset.days, ...QUICK_DESERT_DAYS] : QUICK_DESERT_DAYS;
  const days = Number(duration);
  const validDays = duration.trim() !== '' && isValidDuration(days);
  const validStart = isDateKey(start);
  const end = validDays && validStart ? endDateOf(start, days) : '';
  const last = [...profile.winterArc.runs].filter(isDesert).sort((a, b) => b.createdAt - a.createdAt)[0];
  return (
    <div className="panel confirm-panel winter-arc-start" role="dialog" aria-labelledby={`${id}-title`}>
      <p id={`${id}-title`}>
        <strong>{preset?.title ?? 'Neue Wüstenzeit'}</strong>
      </p>
      <div className="field">
        <label htmlFor={`${id}-days`}>Dauer in Kalendertagen</label>
        <div className="day-chips winter-arc-quick" role="group" aria-label="Vorschläge für die Dauer">
          {quick.map((n) => (
            <button key={n} type="button" aria-pressed={days === n} onClick={() => setDuration(String(n))}>
              {n}
            </button>
          ))}
        </div>
        {preset && days === preset.days && start === preset.start && <p className="small muted">{preset.note}</p>}
        <input
          id={`${id}-days`}
          type="number"
          inputMode="numeric"
          min={MIN_DURATION}
          max={MAX_DURATION}
          step={1}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor={`${id}-start`}>Startdatum</label>
        <input id={`${id}-start`} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor={`${id}-end`}>Letzter Tag</label>
        <input
          id={`${id}-end`}
          type="date"
          value={end}
          min={validStart ? start : undefined}
          onChange={(e) => {
            if (validStart && isDateKey(e.target.value)) setDuration(String(daysBetween(start, e.target.value) + 1));
          }}
        />
      </div>
      {end ? (
        <p>
          Bis <strong>{formatFullDate(end)}</strong>
        </p>
      ) : (
        <p className="small muted" role="status">
          {validStart ? `Wähle eine Dauer von ${MIN_DURATION} bis ${MAX_DURATION} Tagen.` : 'Wähle ein Startdatum.'}
        </p>
      )}
      <p className="small muted">
        {last?.habits?.length
          ? 'Die Gewohnheiten der letzten Wüstenzeit sind schon gewählt. Danach kannst du sie ändern.'
          : 'Danach wählst du die Gewohnheiten.'}
      </p>
      <div className="button-row">
        <button
          type="button"
          className="btn primary"
          disabled={!end}
          onClick={() => {
            store.startDesert(start, days, last?.habits ?? [], preset?.name);
            onDone();
          }}
        >
          Wüstenzeit beginnen
        </button>
        <button type="button" className="btn quiet" onClick={onDone}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}

/**
 * The Wüstenzeit under "Darstellung", beside the Waffenrüstung: switched on
 * with a span and a start, switched off after asking; nothing is ever deleted.
 * While it runs, its habits are chosen here too, unless the page shows the
 * choice on its own (the Arena does).
 */
export function DesertSettings({ withChoice = true }: { withChoice?: boolean }) {
  const store = useStore();
  const profile = useProfile();
  const today = store.today();
  const run = activeRun(profile.winterArc);
  const desert = activeDesert(profile.winterArc);
  const [panel, setPanel] = useState<'start' | 'end' | null>(null);
  return (
    <>
      <Segmented
        label="Wüstenzeit"
        value={run ? 'on' : 'off'}
        onChange={(v) => {
          if (v === 'on' && !run) setPanel('start');
          if (v === 'off' && run) setPanel('end');
        }}
        options={[
          { value: 'on', label: 'Ein' },
          { value: 'off', label: 'Aus' },
        ]}
      />
      <p className="small muted">
        In der Wüstenzeit hältst du für einen festen Zeitraum Gewohnheiten, die du selbst wählst: aus fünf Paketen, aus
        weiteren Vorschlägen oder eigene. Abgehakt wird unter „Heute“; in der Arena unter „Wüstenwanderung“ stehen
        Anleitung und Überblick.
      </p>
      {run && !panel && (
        <p>
          {formatFullDate(run.startDate)} bis {formatFullDate(endDateOf(run.startDate, run.durationDays))}
        </p>
      )}
      {panel === 'start' && <DesertStartPanel onDone={() => setPanel(null)} />}
      {panel === 'end' && (
        <div className="panel confirm-panel" role="alertdialog" aria-labelledby="desert-end">
          <p id="desert-end">
            Die Wüstenzeit wird beendet. Alle Haken und Rückblicke bleiben gespeichert und lassen sich weiter nachlesen.
          </p>
          <div className="button-row">
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                store.endWinterArc();
                setPanel(null);
              }}
            >
              Wüstenzeit beenden
            </button>
            <button type="button" className="btn quiet" onClick={() => setPanel(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
      {desert && withChoice && stageOf(desert, today) !== 'after' && (
        <>
          <h5>Gewohnheiten der Wüstenzeit</h5>
          <DesertChoice run={desert} />
        </>
      )}
    </>
  );
}
