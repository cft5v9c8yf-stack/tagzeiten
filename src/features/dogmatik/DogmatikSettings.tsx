import { planDays, planLength, type DailyMinutes, type DogmatikLibrary, type DogmatikSettings as Settings } from '../../domain/dogmatik';
import { Segmented } from '../../ui/Choice';
import { useDogmatikSettings } from './useDogmatik';

function OnOff({ label, on, set, note }: { label: string; on: boolean; set: (on: boolean) => void; note?: string }) {
  return (
    <div className="dogmatik-setting">
      <h5>{label}</h5>
      <Segmented
        label={label}
        value={on ? 'on' : 'off'}
        onChange={(v) => set(v === 'on')}
        options={[
          { value: 'on', label: 'Ein' },
          { value: 'off', label: 'Aus' },
        ]}
      />
      {note && <p className="small muted">{note}</p>}
    </div>
  );
}

const TIME_OPTIONS: { value: `${DailyMinutes}`; label: string }[] = [
  { value: '0', label: 'Ein Abschnitt' },
  { value: '5', label: '5 Min.' },
  { value: '10', label: '10 Min.' },
  { value: '15', label: '15 Min.' },
  { value: '20', label: '20 Min.' },
];

/** "Leseplan einstellen": plan or reference only, the Stille Zeit, the time a day, what the reading shows. */
export function DogmatikSettings({ lib }: { lib: DogmatikLibrary }) {
  const [s, update] = useDogmatikSettings();
  const set = (patch: Partial<Settings>) => update((x) => ({ ...x, ...patch }));
  return (
    <div className="dogmatik-settings">
      <div className="dogmatik-setting">
        <h5>Leseplan</h5>
        <Segmented
          grid
          label="Leseplan"
          value={s.on ? 'plan' : 'book'}
          onChange={(v) => set({ on: v === 'plan' })}
          options={[
            { value: 'plan', label: 'Durch alle drei Bände' },
            { value: 'book', label: 'Nur nachschlagen' },
          ]}
        />
        <p className="small muted">
          {s.on
            ? 'Ein Band im Jahr, Tag für Tag. Der Plan geht nach deinem Lesestand, nicht nach dem Kalender: Wer aussetzt, liest beim nächsten Abschnitt weiter.'
            : 'Ohne Leseplan bleibt das Buch zum Nachschlagen. Was du gelesen hast, bleibt gespeichert.'}
        </p>
      </div>
      {s.on && (
        <>
          <OnOff
            label="In der Stillen Zeit lesen"
            on={s.stilleZeit}
            set={(stilleZeit) => set({ stilleZeit })}
            note="Als eigener Schritt nach dem Wort, vor dem Gebet. Die Kurzform bleibt kurz."
          />
          <div className="dogmatik-setting">
            <h5>Lesezeit am Tag</h5>
            <Segmented
              grid
              label="Lesezeit am Tag"
              value={`${s.minuten}`}
              onChange={(v) => set({ minuten: Number(v) as DailyMinutes })}
              options={TIME_OPTIONS}
            />
            <p className="small muted">
              {s.minuten === 0
                ? 'Ein Abschnitt am Tag, etwa fünf Minuten: drei Jahre für die drei Bände.'
                : `So viele Abschnitte, wie in ${s.minuten} Minuten passen: alle drei Bände in ${planLength(planDays(lib, s.minuten))}.`}
            </p>
          </div>
        </>
      )}
      <h5 className="dogmatik-setting-group">Anzeige</h5>
      <OnOff label="Bibelwort zum Einstieg" on={s.showVerse} set={(showVerse) => set({ showVerse })} />
      <OnOff label="Kernsatz und Frage zum Nachdenken" on={s.showCore} set={(showCore) => set({ showCore })} />
      <OnOff
        label="Fußnoten sofort zeigen"
        on={s.footnotesOpen}
        set={(footnotesOpen) => set({ footnotesOpen })}
        note="Aus: Die Ziffer im Text antippen, dann klappt die Fußnote unter dem Absatz auf."
      />
    </div>
  );
}
