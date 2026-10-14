import { useEffect, useRef, useState } from 'react';
import type { ChiefPart } from '../../content/catechism';
import { isQuestion, loeheForPiece } from '../../content/loeheCatechism';

/** One question to ask: Luther's own, or one of Löhe's with its number and notes. */
interface Ask {
  q: string;
  a: string;
  loehe?: number;
  notes?: readonly string[];
}

function asksFor(chief: ChiefPart, pieceIndex: number): Ask[] {
  const piece = chief.pieces[pieceIndex]!;
  const luther = piece.qa.map(([q, a]) => ({ q, a }));
  const loehe = loeheForPiece(chief.id, pieceIndex).flatMap((l) =>
    l.items.filter(isQuestion).map((x) => ({
      q: x.q,
      a: x.a,
      loehe: x.no,
      notes: [...(x.quote ? [x.quote] : []), ...(x.note ? [x.note] : []), ...(x.footnotes ?? []).map((f, i) => `${'*'.repeat(i + 1)}) ${f}`)],
    })),
  );
  return [...luther, ...loehe];
}

/**
 * One piece large on the screen for asking at the table: question first,
 * the answer only after a tap. After Luther's questions follow Löhe's on the
 * same piece; "Nächstes Stück" skips them.
 */
export function HouseFatherMode({
  chief,
  startIndex,
  onClose,
}: {
  chief: ChiefPart;
  startIndex: number;
  onClose: () => void;
}) {
  const [pieceIndex, setPieceIndex] = useState(startIndex);
  const [qaIndex, setQaIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const piece = chief.pieces[pieceIndex]!;
  const asks = asksFor(chief, pieceIndex);
  const ask = asks[qaIndex]!;

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
    setPieceIndex(i);
    setQaIndex(0);
    setRevealed(false);
  };
  const nextQuestion = () => {
    setQaIndex((i) => i + 1);
    setRevealed(false);
  };

  return (
    <div className="housefather" role="dialog" aria-modal="true" aria-labelledby="hf-title" ref={dialogRef}>
      <div className="hf-top">
        <span className="hf-chief">{chief.title}</span>
        <button type="button" className="btn quiet" ref={closeRef} onClick={onClose}>
          Hausvater-Modus beenden
        </button>
      </div>
      <div className="hf-body">
        <h2 id="hf-title">{piece.title}</h2>
        {piece.words && <p className="hf-words">{piece.words}</p>}
        {ask.loehe && <p className="hf-source">Wilhelm Löhe, Frage {ask.loehe}</p>}
        {ask.q !== piece.title && <p className="hf-question">{ask.q}</p>}
        {revealed ? (
          <>
            <p className="hf-answer" aria-live="polite">
              {ask.a.split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
            {ask.notes?.map((n) => (
              <p key={n.slice(0, 30)} className="hf-note">
                {n}
              </p>
            ))}
          </>
        ) : (
          <button type="button" className="hf-reveal" onClick={() => setRevealed(true)}>
            Antwort zeigen
          </button>
        )}
        {revealed && qaIndex < asks.length - 1 && (
          <button type="button" className="btn" onClick={nextQuestion}>
            Nächste Frage
          </button>
        )}
      </div>
      <div className="hf-nav">
        <button type="button" className="btn" disabled={pieceIndex === 0} onClick={() => goPiece(pieceIndex - 1)}>
          Voriges Stück
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
          Nächstes Stück
        </button>
      </div>
    </div>
  );
}
