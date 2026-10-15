import { useEffect, useId, useRef, useState } from 'react';

export interface EntryMenuItem {
  label: string;
  onSelect: () => void;
  /** Asked once more before it is done, e.g. "Ja, Eintrag löschen". */
  confirm?: string;
}

/**
 * The menu behind the three dots beside an entry: pin, archive, delete.
 * Closes on a tap outside and on Escape.
 */
export function EntryMenu({ label, items }: { label: string; items: readonly EntryMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const [asking, setAsking] = useState<EntryMenuItem | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = () => {
    setOpen(false);
    setAsking(null);
  };
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) close();
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  return (
    <div className="entry-menu" ref={box}>
      <button
        type="button"
        className="entry-menu-toggle"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span aria-hidden="true">⋯</span>
      </button>
      {open && (
        <div id={id} className="entry-menu-list" role="menu" aria-label={label}>
          {asking ? (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  asking.onSelect();
                }}
              >
                {asking.confirm}
              </button>
              <button type="button" role="menuitem" onClick={close}>
                Behalten
              </button>
            </>
          ) : (
            items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  if (item.confirm) setAsking(item);
                  else {
                    close();
                    item.onSelect();
                  }
                }}
              >
                {item.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
