import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { FlowIcon } from './FlowIcon';
import { ICON_SIZE } from './iconBase';

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
  const list = useRef<HTMLDivElement>(null);
  const id = useId();
  // Near the bottom of the screen the menu opens upwards, so the tab bar does not cover it.
  const [up, setUp] = useState(false);
  useLayoutEffect(() => {
    if (!open) return setUp(false);
    const el = list.current;
    if (!el) return;
    const navTop = document.querySelector('nav.tabs')?.getBoundingClientRect().top ?? window.innerHeight;
    if (el.getBoundingClientRect().bottom > navTop - 8) setUp(true);
  }, [open]);
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
        <FlowIcon name="dots" size={ICON_SIZE.m} plain />
      </button>
      {open && (
        <div id={id} ref={list} className={`entry-menu-list${up ? ' up' : ''}`} role="menu" aria-label={label}>
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
