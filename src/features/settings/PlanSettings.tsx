import { useId } from 'react';
import { useToast } from '../../app/Toast';
import { useProfile, useStore } from '../../data/hooks';
import { getPlan, portionLabel, positionFor, type Track } from '../../domain/readingPlan';

function TrackPosition({ track, position }: { track: Track; position: number }) {
  const store = useStore();
  const toast = useToast();
  const bookId = useId();
  const chapterId = useId();
  const current = track.portions[position] ?? track.portions[0]!;
  const book = track.def.books[current.book]!;

  const set = (b: number, chapter: number) => {
    store.setPlanPositions({ [track.def.id]: positionFor(track, b, chapter) });
    toast('Leseplan angepasst');
  };

  return (
    <fieldset className="plan-track">
      <legend>
        Nächste Lesung {track.def.label}: <b>{portionLabel(track, current)}</b>
      </legend>
      <div className="grid2">
        <div className="field">
          <label htmlFor={bookId}>Buch</label>
          <select id={bookId} value={current.book} onChange={(e) => set(Number(e.target.value), 1)}>
            {track.def.books.map((b, i) => (
              <option key={b.slug} value={i}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={chapterId}>Kapitel</label>
          <select id={chapterId} value={current.from} onChange={(e) => set(current.book, Number(e.target.value))}>
            {Array.from({ length: book.chapters }, (_, i) => (
              <option key={i} value={i + 1}>
                Kapitel {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
    </fieldset>
  );
}

export function PlanSettings() {
  const profile = useProfile();
  const plan = getPlan(profile.plan.planId);
  return (
    <section aria-labelledby="plan-settings">
      <h2 id="plan-settings">Leseplan</h2>
      <p className="small muted">{plan.def.description}</p>
      {plan.tracks.map((t) => (
        <TrackPosition key={t.def.id} track={t} position={profile.plan.positions[t.def.id] ?? 0} />
      ))}
      <p className="small muted">
        Die heutige Lesung folgt der neuen Stelle, solange sie noch nicht als gelesen markiert ist.
      </p>
    </section>
  );
}
