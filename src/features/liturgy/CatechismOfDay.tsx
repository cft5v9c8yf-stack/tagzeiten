import type { CatechismPiece } from '../../content/catechism';
import { useProfile } from '../../data/hooks';
import { catechismFor } from '../../domain/catechismDay';
import type { DateKey } from '../../domain/dates';

export function PieceText({ piece }: { piece: CatechismPiece }) {
  return (
    <>
      {piece.words && <p className="cat-words">{piece.words}</p>}
      {piece.qa.map(([q, a], i) => (
        <div key={i}>
          <p className="cat-q">{q}</p>
          <p className="cat-a">{a}</p>
        </div>
      ))}
    </>
  );
}

/** The catechism piece(s) of the day, folded. */
export function CatechismOfDay({ date }: { date: DateKey }) {
  const profile = useProfile();
  const day = catechismFor(date, profile.catechism.weekOffset);
  return (
    <details className="fold catechism-of-day">
      <summary>
        {day.chief.title}: {day.label}
      </summary>
      {day.pieceIndices.map((i) => {
        const piece = day.chief.pieces[i];
        return piece ? (
          <div key={i} className="cat-piece">
            <h5>{piece.title}</h5>
            <PieceText piece={piece} />
          </div>
        ) : null;
      })}
    </details>
  );
}
