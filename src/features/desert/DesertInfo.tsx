import { useId, useState, type ReactNode } from 'react';
import type { Habit } from '../../domain/model';
import { infoOf } from '../../domain/desert';

/** The small "i" beside a habit; it opens or closes the bubble below. */
export function InfoButton({ name, open, onToggle, controls }: { name: string; open: boolean; onToggle: () => void; controls: string }) {
  return (
    <button
      type="button"
      className="info-btn"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={`Erklärung zu ${name}`}
      onClick={onToggle}
    >
      i
    </button>
  );
}

/** The bubble: the short description, then the background, if any. */
export function InfoBubble({ id, habit }: { id: string; habit: Pick<Habit, 'id' | 'note'> }) {
  const { note, about } = infoOf(habit);
  return (
    <div className="info-bubble" id={id} role="note">
      {note && <p>{note}</p>}
      {about && <p className="info-about">{about}</p>}
      {!note && !about && <p className="muted">Keine Beschreibung.</p>}
    </div>
  );
}

/**
 * A line with something to the left (a tick or a checkbox) and the "i" to the
 * right; the bubble opens below the line.
 */
export function WithInfo({ habit, children }: { habit: Pick<Habit, 'id' | 'name' | 'note'>; children: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const { note, about } = infoOf(habit);
  return (
    <div className="wa-row">
      <div className="wa-row-line">
        {children}
        {(note || about) && <InfoButton name={habit.name} open={open} onToggle={() => setOpen(!open)} controls={id} />}
      </div>
      {open && <InfoBubble id={id} habit={habit} />}
    </div>
  );
}
