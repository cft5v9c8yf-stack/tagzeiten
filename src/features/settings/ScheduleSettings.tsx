import { useId } from 'react';
import { useProfile, useStore } from '../../data/hooks';
import type { Schedule, TextVariant, Theme } from '../../domain/model';
import { Segmented } from '../../ui/Choice';
import { Section } from '../../ui/Section';

const TIMES: { key: keyof Schedule; label: string }[] = [
  { key: 'rise', label: 'Aufstehen' },
  { key: 'stillTime', label: 'Stille Zeit' },
  { key: 'vespers', label: 'Vesper' },
  { key: 'compline', label: 'Nachtgebet' },
  { key: 'lightsOut', label: 'Licht aus' },
];

export function ScheduleSettings() {
  const store = useStore();
  const profile = useProfile();
  const base = useId();
  return (
    <>
      <div className="times-grid">
        {TIMES.map((t) => (
          <div className="field" key={t.key}>
            <label htmlFor={`${base}-${t.key}`}>{t.label}</label>
            <input
              id={`${base}-${t.key}`}
              type="time"
              value={profile.schedule[t.key]}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d{2}:\d{2}$/.test(v)) {
                  store.updateProfile((p) => ({ ...p, schedule: { ...p.schedule, [t.key]: v } }));
                }
              }}
            />
          </div>
        ))}
      </div>
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
