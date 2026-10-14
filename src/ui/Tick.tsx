import type { ReactNode } from 'react';

/**
 * A point to tick: the whole row is the target; open is a plain ring, done a
 * filled one with a check. Never red (rule 5).
 */
export function Tick({
  checked,
  onToggle,
  disabled = false,
  note,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  /** A quiet second line, e.g. where the tick comes from. */
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className="wa-tick"
      disabled={disabled}
      onClick={onToggle}
    >
      <span className="wa-ring" aria-hidden="true" />
      <span className="wa-tick-text">
        {children}
        {note && <span className="wa-tick-note">{note}</span>}
      </span>
    </button>
  );
}
