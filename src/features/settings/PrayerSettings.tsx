import { useId } from 'react';
import { useProfile, useStore } from '../../data/hooks';
import { WEEKDAY_LONG, type Weekday } from '../../domain/dates';

const ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export function PrayerSettings() {
  const store = useStore();
  const profile = useProfile();
  const dailyId = useId();
  const baseId = useId();

  const setDaily = (v: string) => store.updateProfile((p) => ({ ...p, prayer: { ...p.prayer, daily: v } }));
  const setWeekly = (d: Weekday, v: string) =>
    store.updateProfile((p) => {
      const weekly = { ...p.prayer.weekly };
      if (v) weekly[d] = v;
      else delete weekly[d];
      return { ...p, prayer: { ...p.prayer, weekly } };
    });

  return (
    <section aria-labelledby="prayer-settings">
      <h2 id="prayer-settings">Gebetsübersicht</h2>
      <p className="small muted">
        Erscheint in der Stille Zeit bei der Fürbitte. Ein Anliegen je Wochentag, damit nichts liegenbleibt.
      </p>
      <div className="field">
        <label htmlFor={dailyId}>Täglich</label>
        <textarea
          id={dailyId}
          rows={2}
          value={profile.prayer.daily}
          placeholder="Haus: Frau, Kinder · Gemeinde · Arbeit: Kollegen"
          onChange={(e) => setDaily(e.target.value)}
        />
      </div>
      <div className="weekly-grid">
        {ORDER.map((d) => (
          <div className="field" key={d}>
            <label htmlFor={`${baseId}-${d}`}>{WEEKDAY_LONG[d]}</label>
            <input
              id={`${baseId}-${d}`}
              type="text"
              value={profile.prayer.weekly[d] ?? ''}
              onChange={(e) => setWeekly(d, e.target.value)}
            />
          </div>
        ))}
      </div>
      <p className="small muted">
        Zum Beispiel: verfolgte Kirche, Missionare, Obrigkeit, Nachbarn, Ungläubige im Bekanntenkreis, Kranke, Patenkinder.
      </p>
    </section>
  );
}
