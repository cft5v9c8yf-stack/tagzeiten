import { useEffect, useRef } from 'react';
import { DIEFFENBACH_SOURCE } from '../../content/dieffenbach';
import type { Lection } from '../../content/lections';

/** The Sunday's lesson from the Haus-Agende, over the page, to be read through. */
export function LectionDialog({ lection, onClose }: { lection: Lection; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // A dialog: focus inside, Escape closes, the page behind does not scroll.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'Tab') {
        // Only one button: keep the focus on it.
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      previous?.focus();
    };
  }, []);

  return (
    <div className="chooser-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="chooser lection" role="dialog" aria-modal="true" aria-labelledby="lection-title" ref={cardRef}>
        <div className="chooser-head lection-head">
          <div className="chooser-title">
            <h2 id="lection-title">{lection.title}</h2>
            <p>{lection.ref}</p>
          </div>
        </div>
        <div className="chooser-list lection-body">
          <div className="lection-paragraphs">
            {lection.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <p className="small muted lection-source">
            {DIEFFENBACH_SOURCE} {lection.page} In der Rechtschreibung des Originals.
          </p>
        </div>
        <div className="chooser-foot">
          <button type="button" className="btn quiet" ref={closeRef} onClick={onClose}>
            Andacht schließen
          </button>
        </div>
      </div>
    </div>
  );
}
