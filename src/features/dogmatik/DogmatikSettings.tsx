import { parts, type DogmatikBook, type DogmatikSettings as Settings } from '../../domain/dogmatik';
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

/** "Leseplan einstellen": whether, when and in which order; what the reading day shows. */
export function DogmatikSettings({ book }: { book: DogmatikBook }) {
  const [s, update] = useDogmatikSettings();
  const set = (patch: Partial<Settings>) => update((x) => ({ ...x, ...patch }));
  const topics = parts(book);
  return (
    <div className="dogmatik-settings">
      <OnOff
        label="Leseplan verwenden"
        on={s.on}
        set={(on) => set({ on })}
        note="Ausgeschaltet bleibt das Buch zum Nachschlagen; was du gelesen hast, bleibt gespeichert."
      />
      {s.on && (
        <>
          <div className="dogmatik-setting">
            <h5>Wann lese ich</h5>
            <Segmented
              grid
              label="Wann lese ich"
              value={s.when}
              onChange={(when) => set({ when })}
              options={[
                { value: 'morning', label: 'In der Stillen Zeit' },
                { value: 'evening', label: 'In der Vesper' },
                { value: 'free', label: 'Frei' },
              ]}
            />
            <p className="small muted">
              {s.when === 'morning'
                ? 'Morgens nach dem Wort, vor dem Gebet, als eigener Schritt der ganzen Ordnung. Die Kurzform bleibt kurz.'
                : s.when === 'evening'
                  ? 'In der Vesper nach dem Wort, als eigene Seite.'
                  : 'Ohne feste Zeit: Du findest den Abschnitt unter „Wort“ › „Lehre“.'}
            </p>
          </div>
          <div className="dogmatik-setting">
            <h5>Reihenfolge</h5>
            <Segmented
              grid
              label="Reihenfolge"
              value={s.order}
              onChange={(order) => set(order === 'topic' ? { order, topic: s.topic ?? topics[0] } : { order })}
              options={[
                { value: 'book', label: 'Wie im Buch' },
                { value: 'topic', label: 'Nach Lehrstücken' },
              ]}
            />
            {s.order === 'topic' && (
              <label className="dogmatik-topic">
                <span>Lehrstück</span>
                <select value={s.topic ?? topics[0]} onChange={(e) => set({ topic: e.target.value })}>
                  {topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <p className="small muted">
              {s.order === 'book'
                ? `${book.buch.umfang} Abschnitte in der Reihenfolge des Buches.`
                : 'Erst das gewählte Lehrstück, danach der Rest des Buches.'}{' '}
              Der Plan geht nach deinem Lesestand, nicht nach dem Kalender.
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
