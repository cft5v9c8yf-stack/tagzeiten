import { useId, useState } from 'react';
import { WINTER_ARC_ITEMS, WINTER_ARC_TIME_LABELS } from '../../content/winterArc';
import { useProfile, useStore } from '../../data/hooks';
import {
  fromKey,
  isDateKey,
  MONTH_LONG,
  WEEKDAY_LONG,
  WEEKDAY_SHORT,
  type DateKey,
  type Weekday,
} from '../../domain/dates';
import type { Profile } from '../../domain/model';
import { WEEK } from '../../domain/schedule';
import {
  activeRun,
  DEFAULT_DURATION,
  DEFAULT_RUN_NAME,
  daysBetween,
  NAME_MAX,
  runName,
  endDateOf,
  isValidDuration,
  isValidTime,
  MAX_DURATION,
  MIN_DURATION,
  positionOf,
  QUICK_DURATIONS,
  stageOf,
  type WinterArcTimes,
} from '../../domain/winterArc';
import { Segmented } from '../../ui/Choice';

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
 * The start of a round in the Streithalle: a name, the start date, and the end
 * date or the duration in calendar days (each follows the other).
 */
export function WinterArcStartPanel({
  today,
  onStart,
  onCancel,
}: {
  today: DateKey;
  onStart: (startDate: DateKey, durationDays: number, name: string) => void;
  onCancel: () => void;
}) {
  const id = useId();
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
          {validStart ? `Die Dauer liegt zwischen ${MIN_DURATION} und ${MAX_DURATION} Tagen.` : 'Wähle ein Startdatum.'}
        </p>
      )}
      <div className="button-row">
        <button type="button" className="btn primary" disabled={!end} onClick={() => onStart(start, days, name)}>
          Runde beginnen
        </button>
        <button type="button" className="btn quiet" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}

/** A time of "Meine Zeiten": taken over once it is a valid time. */
function TimeField({ k, value, onSave }: { k: keyof WinterArcTimes; value: string; onSave: (v: string) => void }) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const valid = isValidTime(k, draft);
  return (
    <div className="field">
      <label htmlFor={id}>{WINTER_ARC_TIME_LABELS[k]}</label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={draft}
        aria-invalid={!valid}
        placeholder="04:00"
        onChange={(e) => {
          setDraft(e.target.value);
          if (isValidTime(k, e.target.value)) onSave(e.target.value);
        }}
        onBlur={() => !valid && setDraft(value)}
      />
    </div>
  );
}

/**
 * The Winter Arc in the settings: switched on with a start date and a
 * duration, switched off after asking; nothing of a round is ever deleted.
 */
export function WinterArcSettings() {
  const store = useStore();
  const profile = useProfile();
  const today = store.today();
  const run = activeRun(profile.winterArc);
  const [panel, setPanel] = useState<'start' | 'end' | null>(null);
  const settings = profile.winterArcSettings;
  const update = (fn: (p: Profile) => Profile) => store.updateProfile(fn, { immediate: true });

  const toggleDay = (item: (typeof WINTER_ARC_ITEMS)[number]['id'], d: Weekday) =>
    update((p) => {
      const cur = p.winterArcSettings.weekdays[item];
      const next = cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d];
      return {
        ...p,
        winterArcSettings: {
          ...p.winterArcSettings,
          weekdays: { ...p.winterArcSettings.weekdays, [item]: WEEK.filter((x) => next.includes(x)) },
        },
      };
    });

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
        Eine Runde mit festem Tagesstandard, für jeden Zeitraum, den du wählst, nach dem Plan des Winter Arc. Die
        Reihenfolge: Gott, Familie und Haus, Gemeinde, Arbeit, ich. Eingeschaltet steht die Streithalle in der Arena,
        ihre Gewohnheiten unter „Heute“. Unabhängig von der Waffenrüstung.
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
          onStart={(s, d, n) => {
            store.startWinterArc(s, d, n);
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
      {run && (
        <>
          <h5>Wochentage je Punkt</h5>
          <p className="small muted">An Tagen, für die ein Punkt nicht gilt, steht im Tracker „–“.</p>
          {WINTER_ARC_ITEMS.map((item) => (
            <fieldset key={item.id} className="schedule-group winter-arc-days">
              <legend>{item.text(settings.times)}</legend>
              <div className="day-chips" role="group" aria-label={`Tage für ${item.text(settings.times)}`}>
                {WEEK.map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={settings.weekdays[item.id].includes(d)}
                    aria-label={WEEKDAY_LONG[d]}
                    onClick={() => toggleDay(item.id, d)}
                  >
                    {WEEKDAY_SHORT[d]}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <h5>Meine Zeiten</h5>
          <p className="small muted">Die Uhrzeiten, wie sie im Tracker stehen. Die Anleitung bleibt, wie sie ist.</p>
          <div className="times-grid">
            {(Object.keys(WINTER_ARC_TIME_LABELS) as (keyof WinterArcTimes)[]).map((k) => (
              <TimeField
                key={k}
                k={k}
                value={settings.times[k]}
                onSave={(v) =>
                  update((p) => ({
                    ...p,
                    winterArcSettings: { ...p.winterArcSettings, times: { ...p.winterArcSettings.times, [k]: v } },
                  }))
                }
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
