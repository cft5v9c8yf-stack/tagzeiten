/**
 * The one way to ask "really?" before something is deleted: the question, the
 * answer that does it, and "Behalten" beside it. The way in is a quiet button
 * with dots ("löschen …", see `ConfirmTrigger`).
 */
export function ConfirmRow({
  label,
  confirmLabel,
  cancelLabel = 'Behalten',
  onConfirm,
  onCancel,
  busy,
  showLabel,
}: {
  /** The question, for screen readers ("Eintrag löschen?"). */
  label: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  /** Also shows the question as text before the answers. */
  showLabel?: boolean;
}) {
  return (
    <div className="confirm-row" role="group" aria-label={label}>
      {showLabel && <span className="confirm-question">{label}</span>}
      <button type="button" className="btn danger" onClick={onConfirm} disabled={busy} aria-busy={busy}>
        {confirmLabel}
      </button>
      <button type="button" className="btn quiet" onClick={onCancel}>
        {cancelLabel}
      </button>
    </div>
  );
}

/** The quiet button that starts a deletion; its text ends in dots, as it asks once more. */
export function ConfirmTrigger({ children, label, onClick }: { children: string; label?: string; onClick: () => void }) {
  return (
    <button type="button" className="btn quiet confirm-trigger" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}
