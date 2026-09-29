import { useId } from 'react';
import { useProfile, useStore } from '../../data/hooks';
import { WEEKDAY_LONG, WEEKDAY_SHORT } from '../../domain/dates';
import type { Profile, Schedule, ScheduleGroup, Theme } from '../../domain/model';
import { TileGroup } from '../../ui/TileGroup';
import { daysLabel, firstGroups, freeDays, moveDay, orderIssue, removeGroup, TIME_ORDER, WEEK } from '../../domain/schedule';
import { Segmented } from '../../ui/Choice';

const TIMES = TIME_ORDER;

const TIME_OK = /^\d{2}:\d{2}$/;

/** The five times of a day, as a grid of time fields. */
function TimesGrid({ times, onChange }: { times: Schedule; onChange: (key: keyof Schedule, v: string) => void }) {
  const base = useId();
  const issue = orderIssue(times);
  return (
    <>
      <div className="times-grid">
        {TIMES.map((t) => (
          <div className="field" key={t.key}>
            <label htmlFor={`${base}-${t.key}`}>{t.label}</label>
            <input
              id={`${base}-${t.key}`}
              type="time"
              value={times[t.key]}
              aria-invalid={issue?.key === t.key || undefined}
              aria-describedby={issue?.key === t.key ? `${base}-order` : undefined}
              onChange={(e) => TIME_OK.test(e.target.value) && onChange(t.key, e.target.value)}
            />
          </div>
        ))}
      </div>
      {issue && (
        <p id={`${base}-order`} className="time-order" role="status">
          {issue.message}
        </p>
      )}
    </>
  );
}

type Mode = 'same' | 'days';

/**
 * The times of the day: the same every day, or per weekday in groups (say,
 * Monday to Friday and the weekend). A day tapped in a group moves there.
 */
export function ScheduleSettings() {
  const store = useStore();
  const profile = useProfile();
  const byDay = profile.scheduleDays;
  const mode: Mode = byDay?.on ? 'days' : 'same';
  const groups = byDay?.groups ?? [];

  const setGroups = (next: ScheduleGroup[], immediate = true) =>
    store.updateProfile((p) => ({ ...p, scheduleDays: { on: true, groups: next } }), { immediate });
  const setMode = (m: Mode) =>
    store.updateProfile(
      (p) => ({
        ...p,
        scheduleDays: { on: m === 'days', groups: p.scheduleDays?.groups ?? firstGroups(p.schedule) },
      }),
      { immediate: true },
    );

  return (
    <>
      <Segmented<Mode>
        label="Zeiten"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'same', label: 'Alle Tage gleich' },
          { value: 'days', label: 'Tage unterschiedlich' },
        ]}
      />
      {mode === 'same' ? (
        <TimesGrid
          times={profile.schedule}
          onChange={(k, v) => store.updateProfile((p) => ({ ...p, schedule: { ...p.schedule, [k]: v } }))}
        />
      ) : (
        <>
          <p className="small muted">
            Tippe einen Tag an, um ihn diesen Zeiten zuzuordnen; noch einmal getippt, nimmst du ihn wieder heraus.
          </p>
          {groups.map((g, i) => (
            <fieldset key={i} className="schedule-group">
              <legend>{g.days.length > 0 ? daysLabel(g.days) : 'Noch keine Tage gewählt'}</legend>
              <div className="day-chips" role="group" aria-label={`Tage für ${i + 1}. Zeiten`}>
                {WEEK.map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={g.days.includes(d)}
                    aria-label={WEEKDAY_LONG[d]}
                    onClick={() => setGroups(moveDay(groups, d, i))}
                  >
                    {WEEKDAY_SHORT[d]}
                  </button>
                ))}
              </div>
              <TimesGrid
                times={g.times}
                onChange={(k, v) =>
                  setGroups(
                    groups.map((x, j) => (j === i ? { ...x, times: { ...x.times, [k]: v } } : x)),
                    false,
                  )
                }
              />
              {groups.length > 1 && (
                <button type="button" className="btn quiet" onClick={() => setGroups(removeGroup(groups, i))}>
                  Diese Zeiten entfernen
                </button>
              )}
            </fieldset>
          ))}
          {freeDays(groups).length > 0 && (
            <p className="small schedule-free">
              <b>{daysLabel(freeDays(groups))}:</b> ohne eigene Zeiten, es gelten die Zeiten für alle Tage (
              {profile.schedule.rise} Aufstehen, {profile.schedule.lightsOut} Licht aus).
            </p>
          )}
          {groups.length < 7 && (
            <button
              type="button"
              className="btn schedule-add"
              onClick={() => setGroups([...groups, { days: [], times: { ...(groups.at(-1)?.times ?? profile.schedule) } }])}
            >
              <span aria-hidden="true">+</span> Zeiten für weitere Tage
            </button>
          )}
        </>
      )}
    </>
  );
}

const THEME_LABEL: Record<Theme, string> = { system: 'System', light: 'Hell', dark: 'Dunkel' };

/** Show or hide a part of the orders, with a note on what that means. */
function ShowHide({ label, on, set, note }: { label: string; on: boolean; set: (on: boolean) => void; note: string }) {
  return (
    <>
      <Segmented
        label={label}
        value={on ? 'on' : 'off'}
        onChange={(v) => set(v === 'on')}
        options={[
          { value: 'on', label: 'Anzeigen' },
          { value: 'off', label: 'Ausblenden' },
        ]}
      />
      <p className="small muted">{note}</p>
    </>
  );
}

/** "Darstellung" as tiles: each setting with what is set now; it opens beneath. */
export function DisplaySettings() {
  const store = useStore();
  const profile = useProfile();
  const update = (fn: (p: Profile) => Profile) => store.updateProfile(fn, { immediate: true });
  const state = (on: boolean) => (on ? 'Anzeigen' : 'Ausblenden');
  return (
    <TileGroup
      level={4}
      label="Darstellung"
      items={[
        {
          id: 'more.display.theme',
          title: 'Farbschema',
          line: THEME_LABEL[profile.theme],
          icon: 'sunset',
          content: (
            <>
              <Segmented
                label="Farbschema"
                value={profile.theme}
                onChange={(v) => update((p) => ({ ...p, theme: v }))}
                options={[
                  { value: 'system', label: 'System' },
                  { value: 'light', label: 'Hell' },
                  { value: 'dark', label: 'Dunkel' },
                ]}
              />
              <p className="small muted">„System“ folgt der Einstellung deines Geräts.</p>
            </>
          ),
        },
        {
          id: 'more.display.habitHistory',
          title: 'Gewohnheiten im Rückblick',
          line: state(profile.showHabitHistory),
          icon: 'review',
          content: (
            <ShowHide
              label="Gewohnheiten im Rückblick"
              on={profile.showHabitHistory}
              set={(on) => update((p) => ({ ...p, showHabitHistory: on }))}
              note="Unten im Rückblick: jede Gewohnheit in den letzten acht Wochen. Nur festgehalten, nicht bewertet."
            />
          ),
        },
        {
          id: 'more.display.atBed',
          title: 'Am Bett am Morgen',
          line: state(profile.showAtBed),
          icon: 'bed',
          content: (
            <ShowHide
              label="Am Bett am Morgen"
              on={profile.showAtBed}
              set={(on) => update((p) => ({ ...p, showAtBed: on }))}
              note="Kreuzzeichen, Vaterunser, Taufgedächtnis und Morgensegen vor der Stillen Zeit. Ausgeblendet beginnt die Andacht gleich mit der Stillen Zeit."
            />
          ),
        },
        {
          id: 'more.display.compline',
          title: 'Nachtgebet am Bett',
          line: state(profile.showCompline),
          icon: 'moon',
          content: (
            <ShowHide
              label="Nachtgebet am Bett"
              on={profile.showCompline}
              set={(on) => update((p) => ({ ...p, showCompline: on }))}
              note="Ausgeblendet stehen Rückschau, Prüfung, Bekenntnis und Zuspruch am Ende der Vesper, und die Vesper schließt den Tag."
            />
          ),
        },
        {
          id: 'more.display.armor',
          title: 'Geistliche Waffenrüstung',
          line: state(profile.armor),
          icon: 'cross',
          content: (
            <ShowHide
              label="Geistliche Waffenrüstung"
              on={profile.armor}
              set={(on) => update((p) => ({ ...p, armor: on }))}
              note="Epheser 6,10–18: in der Stillen Zeit vor der Ausrichtung ein Stück für den Tag, im Nachtgebet 1. Petrus 5,8–9 zur Eröffnung und eine Frage in der Prüfung."
            />
          ),
        },
      ]}
    />
  );
}
