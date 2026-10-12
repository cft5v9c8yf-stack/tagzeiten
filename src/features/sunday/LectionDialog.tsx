import { useEffect, useRef } from 'react';
import type { LessonPart } from '../../content/adventLessons';
import type { Lection } from '../../content/lections';

/** A hymn verse set off, its lines as printed (" / "). */
function Hymn({ text }: { text: string }) {
  return (
    <blockquote className="lesson-hymn">
      {text.split(' / ').map((l, i) => (
        <span key={i} className="line">
          {l}
        </span>
      ))}
    </blockquote>
  );
}

const Part = ({ part }: { part: LessonPart }) => ('zitat' in part ? <Hymn text={part.zitat} /> : <p>{part.text}</p>);

/** A reading on the Sunday's Gospel or Epistle, over the page, to be read through. */
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
          {lection.addition && <p className="lesson-addition">{lection.addition}</p>}
          {lection.motto?.map((m) => (
            <figure key={m.ref} className="sunday-verse lesson-motto">
              <blockquote>{m.text}</blockquote>
              <p className="cy-verse-ref">
                <span className="bible-ref">{m.ref}</span>
              </p>
            </figure>
          ))}
          {lection.sections ? (
            // Like the other readings, without the numbers of the paragraphs; hymn verses set off.
            <div className="lection-paragraphs">
              {lection.sections.flatMap((s) => s.parts.map((p, i) => <Part key={`${s.nr}-${i}`} part={p} />))}
            </div>
          ) : (
            <div className="lection-paragraphs">
              {lection.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          <p className="small muted lection-source">
            {lection.source} In der Rechtschreibung des Originals.
          </p>
        </div>
        <div className="chooser-foot">
          <button type="button" className="btn quiet" ref={closeRef} onClick={onClose}>
            {lection.kind} schließen
          </button>
        </div>
      </div>
    </div>
  );
}
