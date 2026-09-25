import { useId } from 'react';
import { useProfile, useStore } from '../../data/hooks';
import { WEEKDAY_LONG, WEEKDAY_SHORT } from '../../domain/dates';
import type { Schedule, ScheduleGroup, TextVariant, Theme } from '../../domain/model';
import { daysLabel, firstGroups, moveDay, removeGroup, WEEK } from '../../domain/schedule';
import { Segmented } from '../../ui/Choice';
import { Section } from '../../ui/Section';

const TIMES: { key: keyof Schedule; label: string }[] = [
  { key: 'rise', label: 'Aufstehen' },
  { key: 'stillTime', label: 'Stille Zeit' },
  { key: 'vespers', label: 'Vesper' },
  { key: 'compline', label: 'Nachtgebet' },
  { key: 'lightsOut', label: 'Licht aus' },
];

const TIME_OK = /^\d{2}:\d{2}$/;

/** The five times of a day, as a grid of time fields. */
function TimesGrid({ times, onChange }: { times: Schedule; onChange: (key: keyof Schedule, v: string) => void }) {
  const base = useId();
  return (
    <div className="times-grid">
      {TIMES.map((t) => (
        <div className="field" key={t.key}>
          <label htmlFor={`${base}-${t.key}`}>{t.label}</label>
          <input
            id={`${base}-${t.key}`}
            type="time"
            value={times[t.key]}
            onChange={(e) => TIME_OK.test(e.target.value) && onChange(t.key, e.target.value)}
          />
        </div>
      ))}
    </div>
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
          <p className="small muted">Tippe einen Tag an, um ihn diesen Zeiten zuzuordnen.</p>
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

export function DisplaySettings() {
  const store = useStore();
  const profile = useProfile();
  const set = <K extends 'theme' | 'texts'>(k: K, v: K extends 'theme' ? Theme : TextVariant) =>
    store.updateProfile((p) => ({ ...p, [k]: v }), { immediate: true });
  return (
    <>
      <Section id="more.display.theme" title="Farbschema" level={4}>
      <Segmented
        label="Farbschema"
        value={profile.theme}
        onChange={(v) => set('theme', v)}
        options={[
          { value: 'system', label: 'System' },
          { value: 'light', label: 'Hell' },
          { value: 'dark', label: 'Dunkel' },
        ]}
      />
      </Section>
      <Section id="more.display.texts" title="Vaterunser und Glaubensbekenntnis" level={4}>
      <Segmented
        label="Fassung von Vaterunser und Glaubensbekenntnis"
        value={profile.texts}
        onChange={(v) => set('texts', v)}
        options={[
          { value: 'ecumenical', label: 'Wie in der Gemeinde' },
          { value: 'luther', label: 'Nach Luthers Katechismus' },
        ]}
      />
      <p className="small muted">
        {profile.texts === 'luther'
          ? '„Vater unser, der du bist im Himmel … erlöse uns von dem Übel.“ – „… niedergefahren zur Hölle …“'
          : '„Vater unser im Himmel … erlöse uns von dem Bösen.“ – „… hinabgestiegen in das Reich des Todes …“'}
      </p>
      </Section>
    </>
  );
}
