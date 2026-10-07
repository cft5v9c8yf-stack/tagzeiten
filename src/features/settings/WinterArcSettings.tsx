import { useId, useState } from 'react';
import { useProfile, useStore } from '../../data/hooks';
import { fromKey, isDateKey, MONTH_LONG, WEEKDAY_LONG, type DateKey } from '../../domain/dates';
import type { Profile } from '../../domain/model';
import {
  activeRun,
  DEFAULT_DURATION,
  DEFAULT_RUN_NAME,
  daysBetween,
  NAME_MAX,
  runName,
  endDateOf,
  isValidDuration,
  MAX_DURATION,
  MIN_DURATION,
  positionOf,
  QUICK_DURATIONS,
  stageOf,
  type WinterArcPoint,
} from '../../domain/winterArc';
import { lastRun, startPoints, type StandardStart } from '../../domain/winterArcPoints';
import { Segmented } from '../../ui/Choice';
import { WinterArcStandard } from './WinterArcStandard';

/** "Samstag, 2. Januar 2027" */
export function formatFullDate(k: DateKey): string {
  const d = fromKey(k);
  return `${WEEKDAY_LONG[d.getDay()]}, ${d.getDate()}. ${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/** What the settings tile says about the Winter Arc now. */
export function winterArcLine(profile: Profile, today: DateKey): string {
  const run = activeRun(profile.winterArc);
  if (!run) return 'Aus';
  const stage = stageOf(run, today);
  if (stage === 'before') return `Beginnt am ${formatFullDate(run.startDate)}`;
  if (stage === 'after') return 'Runde abgeschlossen';
  const { day, days } = positionOf(run, today);
  return `Tag ${day} von ${days}`;
}

/**
 * The start of a round in the Streithalle: a name, the start date, the end date
 * or the duration in calendar days (each follows the other), and the habits it
 * begins with.
 */
export function WinterArcStartPanel({
  today,
  onStart,
  onCancel,
}: {
  today: DateKey;
  onStart: (startDate: DateKey, durationDays: number, name: string, points: WinterArcPoint[]) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const profile = useProfile();
  const last = lastRun(profile.winterArc);
  const [standard, setStandard] = useState<StandardStart>(last ? 'last' : 'plan');
  const [name, setName] = useState(DEFAULT_RUN_NAME);
  const [start, setStart] = useState<DateKey>(today);
  const [duration, setDuration] = useState(String(DEFAULT_DURATION));
  const days = Number(duration);
  const validDays = duration.trim() !== '' && isValidDuration(days);
  const validStart = isDateKey(start);
  const end = validDays && validStart ? endDateOf(start, days) : '';
  return (
    <div className="panel confirm-panel winter-arc-start" role="dialog" aria-labelledby={`${id}-title`}>
      <p id={`${id}-title`}>
        <strong>Neue Runde in der Streithalle</strong>
      </p>
      <div className="field">
        <label htmlFor={`${id}-name`}>Name der Runde</label>
        <input
          id={`${id}-name`}
          type="text"
          maxLength={NAME_MAX}
          value={name}
          placeholder={DEFAULT_RUN_NAME}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor={`${id}-start`}>Startdatum</label>
        <input id={`${id}-start`} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <p className="small muted">Ein Start an einem Montag passt am besten zum Wochen-Tracker.</p>
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
      <div className="field">
        <label htmlFor={`${id}-days`}>Dauer in Kalendertagen</label>
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
        <div className="day-chips winter-arc-quick" role="group" aria-label="Schnellwahl der Dauer">
          {QUICK_DURATIONS.map((n) => (
            <button key={n} type="button" aria-pressed={days === n} onClick={() => setDuration(String(n))}>
              {n}
            </button>
          ))}
        </div>
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
      <div className="field">
        <p className="wa-point-label">Gewohnheiten</p>
        <Segmented<StandardStart>
          label="Womit die Runde beginnt"
          value={standard}
          onChange={setStandard}
          options={[
            ...(last ? [{ value: 'last' as const, label: 'Wie zuletzt' }] : []),
            { value: 'plan', label: 'Winter Arc' },
            { value: 'empty', label: 'Leer' },
          ]}
        />
        <p className="small muted">
          {standard === 'last' && last
            ? `Die Gewohnheiten der letzten Runde („${runName(last)}“). `
            : standard === 'plan'
              ? 'Die Liste aus dem Plan des Winter Arc. '
              : 'Du legst deine Gewohnheiten selbst an. '}
          Ändern kannst du sie jederzeit unter „Meine Gewohnheiten“.
        </p>
      </div>
      <div className="button-row">
        <button
          type="button"
          className="btn primary"
          disabled={!end}
          onClick={() => onStart(start, days, name, startPoints(standard, profile.winterArc, profile.winterArcSettings))}
        >
          Runde beginnen
        </button>
        <button type="button" className="btn quiet" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}

/**
 * The Winter Arc in the settings: switched on with a start date and a
 * duration, switched off after asking; nothing of a round is ever deleted.
 * While a round runs, its habits can be changed here too, unless the page
 * shows them on their own (the Streithalle does).
 */
export function WinterArcSettings({ withStandard = true }: { withStandard?: boolean }) {
  const store = useStore();
  const profile = useProfile();
  const today = store.today();
  const run = activeRun(profile.winterArc);
  const [panel, setPanel] = useState<'start' | 'end' | null>(null);

  return (
    <>
      <Segmented
        label="Streithalle"
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
        In der Streithalle hältst du für einen Zeitraum deiner Wahl einen festen Tagesstandard. Die Gewohnheiten legst
        du selbst fest; der Winter Arc dient als Vorlage. Die Reihenfolge ist: Gott, Familie und Haus, Gemeinde, Arbeit,
        ich. Eingeschaltet findest du die Streithalle in der Arena und ihre Gewohnheiten unter „Heute“. Die
        Waffenrüstung bleibt davon unberührt.
      </p>
      {run && !panel && (
        <p>
          {runName(run)}: {formatFullDate(run.startDate)} bis{' '}
          {formatFullDate(endDateOf(run.startDate, run.durationDays))}
        </p>
      )}
      {panel === 'start' && (
        <WinterArcStartPanel
          today={today}
          onCancel={() => setPanel(null)}
          onStart={(s, d, n, pts) => {
            store.startWinterArc(s, d, n, pts);
            setPanel(null);
          }}
        />
      )}
      {panel === 'end' && (
        <div className="panel confirm-panel" role="alertdialog" aria-labelledby="winter-arc-end">
          <p id="winter-arc-end">
            Die Runde wird beendet. Alle Haken und Rückblicke bleiben gespeichert und lassen sich weiter nachlesen.
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
              Runde beenden
            </button>
            <button type="button" className="btn quiet" onClick={() => setPanel(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
      {run && withStandard && (
        <>
          <h5>Meine Gewohnheiten</h5>
          <WinterArcStandard run={run} />
        </>
      )}
    </>
  );
}
