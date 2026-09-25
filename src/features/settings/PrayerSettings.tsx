import { useId, useState } from 'react';
import { useProfile, useStore } from '../../data/hooks';
import { WEEKDAY_LONG } from '../../domain/dates';
import type { Prayer } from '../../domain/model';
import { addConcern, concernsOn, removeConcern, type PrayerDay } from '../../domain/prayer';
import { WEEK } from '../../domain/schedule';

const DAYS: PrayerDay[] = ['daily', ...WEEK];
const dayName = (d: PrayerDay) => (d === 'daily' ? 'Täglich' : WEEKDAY_LONG[d]);

/** A text field for a concern, with the concerns already written to choose from. */
function ConcernInput({
  label,
  button,
  suggestions,
  onAdd,
  autoFocus,
}: {
  label: string;
  button: string;
  suggestions: string[];
  onAdd: (text: string) => void;
  autoFocus?: boolean;
}) {
  const id = useId();
  const [text, setText] = useState('');
  const submit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText('');
  };
  return (
    <form
      className="concern-input"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <input
        id={id}
        type="text"
        list={`${id}-list`}
        value={text}
        autoFocus={autoFocus}
        placeholder={label}
        onChange={(e) => setText(e.target.value)}
      />
      <datalist id={`${id}-list`}>
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <button type="submit" className="btn">
        {button}
      </button>
    </form>
  );
}

/** One day: the concerns set on it, and "+" to set another. */
function PrayerDayRow({ day, prayer, update }: { day: PrayerDay; prayer: Prayer; update: (f: (p: Prayer) => Prayer) => void }) {
  const [adding, setAdding] = useState(false);
  const on = concernsOn(prayer, day);
  const name = dayName(day);
  return (
    <div className="prayer-day">
      <h4 className="prayer-day-name">{name}</h4>
      <ul className="concern-chips">
        {on.map((c) => (
          <li key={c} className="concern-chip">
            <span>{c}</span>
            <button
              type="button"
              aria-label={`„${c}“ ${day === 'daily' ? 'aus Täglich' : `am ${name}`} entfernen`}
              onClick={() => update((p) => removeConcern(p, c, day))}
            >
              ×
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="concern-add"
            aria-expanded={adding}
            aria-label={`Anliegen ${day === 'daily' ? 'für jeden Tag' : `am ${name}`} hinzufügen`}
            onClick={() => setAdding((a) => !a)}
          >
            +
          </button>
        </li>
      </ul>
      {adding && (
        <ConcernInput
          autoFocus
          label="Anliegen wählen oder neu"
          button="Hinzufügen"
          suggestions={prayer.concerns.filter((c) => !on.includes(c))}
          onAdd={(t) => {
            update((p) => addConcern(p, t, day));
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

/**
 * The prayer list: concerns written once as tags, then set on the days they
 * are prayed for. Every day can carry several.
 */
export function PrayerSettings() {
  const store = useStore();
  const profile = useProfile();
  const prayer = profile.prayer;
  const update = (f: (p: Prayer) => Prayer) =>
    store.updateProfile((p) => ({ ...p, prayer: f(p.prayer) }), { immediate: true });

  return (
    <>
      <section className="concerns" aria-labelledby="concerns-title">
        <h3 id="concerns-title">Deine Anliegen</h3>
        {prayer.concerns.length > 0 && (
          <ul className="concern-chips">
            {prayer.concerns.map((c) => (
              <li key={c} className="concern-chip">
                <span>{c}</span>
                <button type="button" aria-label={`„${c}“ ganz entfernen`} onClick={() => update((p) => removeConcern(p, c))}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <ConcernInput
          label="Neues Anliegen"
          button="Anliegen anlegen"
          suggestions={[]}
          onAdd={(t) => update((p) => addConcern(p, t))}
        />
      </section>
      <section className="prayer-days" aria-labelledby="prayer-days-title">
        <h3 id="prayer-days-title">Nach Tagen</h3>
        {DAYS.map((d) => (
          <PrayerDayRow key={d} day={d} prayer={prayer} update={update} />
        ))}
      </section>
    </>
  );
}

export const PRAYER_INFO = (
  <>
    <p>
      Erscheint in der Stille Zeit bei der Fürbitte. Schreibe deine Anliegen einmal auf und lege sie auf die Tage, an
      denen du für sie betest; ein Tag kann mehrere tragen.
    </p>
    <p>Zum Beispiel: verfolgte Kirche, Missionare, Obrigkeit, Nachbarn, Ungläubige im Bekanntenkreis, Kranke, Patenkinder.</p>
  </>
);
