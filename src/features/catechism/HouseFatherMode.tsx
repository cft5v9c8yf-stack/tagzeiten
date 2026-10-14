import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { WEEKDAY_PIECES, type ChiefPart } from '../../content/catechism';
import { loeheForPieceOnDay } from '../../content/loeheCatechism';

const DAY_NAMES = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

/** The learning day of a piece: today if it is learned today, else the first day it is learned on. */
function dayOfPiece(chief: ChiefPart, pieceIndex: number, today: number): number {
  const days = WEEKDAY_PIECES[chief.id];
  if (days[today]?.includes(pieceIndex)) return today;
  return Math.max(0, days.findIndex((d) => d.includes(pieceIndex)));
}

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((l, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {l}
        </span>
      ))}
    </>
  );
}

/**
 * At the table with the children. The piece stays on the left (on a phone:
 * above), to be said and learned; Luther's answer only after a tap. On the
 * right, all of Wilhelm Löhe's questions on the piece for the day at once, with their
 * answers in view for the one who asks: read on by scrolling, nothing to
 * tap. A sideways swipe turns to the next or previous piece.
 */
export function HouseFatherMode({
  chief,
  startIndex,
  dayIndex,
  onClose,
}: {
  chief: ChiefPart;
  startIndex: number;
  /** Today's learning day, 0 = Monday. */
  dayIndex: number;
  onClose: () => void;
}) {
  const [pieceIndex, setPieceIndex] = useState(startIndex);
  const [revealed, setRevealed] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const loeheRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const piece = chief.pieces[pieceIndex]!;
  const day = dayOfPiece(chief, pieceIndex, dayIndex);
  const loehe = loeheForPieceOnDay(chief.id, pieceIndex, day);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'Tab' && dialogRef.current) {
        // Keep focus inside the dialog.
        const f = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled])');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
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

  const goPiece = (i: number) => {
    if (i < 0 || i >= chief.pieces.length) return;
    setPieceIndex(i);
    setRevealed(false);
    bodyRef.current?.scrollTo?.({ top: 0 });
    loeheRef.current?.scrollTo?.({ top: 0 });
  };
  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]!;
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0]!;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy)) goPiece(pieceIndex + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="housefather" role="dialog" aria-modal="true" aria-labelledby="hf-title" ref={dialogRef}>
      <div className="hf-top">
        <span className="hf-chief">{chief.title}</span>
        <button type="button" className="btn quiet" ref={closeRef} onClick={onClose}>
          Hausvater-Modus beenden
        </button>
      </div>
      <div className="hf-body hf-two" ref={bodyRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="hf-piece">
          <h2 id="hf-title">{piece.title}</h2>
          {piece.words && <p className="hf-words">{piece.words}</p>}
          {piece.qa.map(([question, answer]) => (
            <div key={question}>
              {question !== piece.title && <p className="hf-question">{question}</p>}
              {revealed && (
                <p className="hf-answer" aria-live="polite">
                  {answer}
                </p>
              )}
            </div>
          ))}
          {!revealed && (
            <button type="button" className="hf-reveal" onClick={() => setRevealed(true)}>
              Antwort zeigen
            </button>
          )}
        </div>
        {loehe.length > 0 && (
          <div className="hf-loehe" ref={loeheRef}>
            <p className="hf-loehe-label">
              Zum Verstehen · Wilhelm Löhe · {day === dayIndex ? 'heute' : DAY_NAMES[day]}, Fragen {loehe[0]!.no}–
              {loehe.at(-1)!.no}
            </p>
            {loehe.map((q) => (
              <div key={q.no} className="hf-lqa">
                <p className="hf-lq">
                  <span className="hf-lno">{q.no}</span>
                  {q.q}
                </p>
                <p className="hf-la">
                  <Lines text={q.a} />
                </p>
                {[...(q.quote ? [q.quote] : []), ...(q.note ? [q.note] : []), ...(q.footnotes ?? []).map((f, i) => `${'*'.repeat(i + 1)}) ${f}`)].map(
                  (n) => (
                    <p key={n.slice(0, 30)} className="hf-note">
                      {n}
                    </p>
                  ),
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="hf-nav">
        <button type="button" className="btn" disabled={pieceIndex === 0} onClick={() => goPiece(pieceIndex - 1)}>
          ‹ Voriges Stück
        </button>
        <span className="hf-pos">
          {pieceIndex + 1} / {chief.pieces.length}
        </span>
        <button
          type="button"
          className="btn"
          disabled={pieceIndex === chief.pieces.length - 1}
          onClick={() => goPiece(pieceIndex + 1)}
        >
          Nächstes Stück ›
        </button>
      </div>
    </div>
  );
}
