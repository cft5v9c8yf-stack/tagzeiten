import { CATECHISM } from '../../content/catechism';
import { pieceId } from '../../domain/catechismDay';

/**
 * Where do I stand? One line per chief part with its pieces learned by heart.
 * Orientation only: no dates, nothing that lapses or breaks off (rule 4).
 */
export function CatechismOverview({
  memorized,
  currentChief,
  onOpenPiece,
}: {
  memorized: Record<string, boolean>;
  currentChief: number;
  onOpenPiece: (chiefIndex: number, pieceIndex: number) => void;
}) {
  return (
    <section className="cat-overview" aria-labelledby="cat-overview-title">
      <h3 id="cat-overview-title">Übersicht</h3>
      <p className="small muted">
        Welche Stücke du schon auswendig kannst. Was gelernt ist, bleibt hier stehen – es verfällt nichts, und es fehlt
        nichts, wenn eine Woche anders lief.
      </p>
      <ol className="overview-list">
        {CATECHISM.map((chief, ci) => {
          const known = chief.pieces.filter((_, pi) => memorized[pieceId(chief, pi)]).length;
          return (
            <li key={chief.id} className="overview-row">
              <div className="overview-head">
                <span className="overview-no">{ci + 1}</span>
                <span className="overview-title">{chief.title}</span>
                {ci === currentChief && <span className="ktag">diese Woche</span>}
              </div>
              <div className="overview-pieces">
                {chief.pieces.map((piece, pi) => {
                  const on = !!memorized[pieceId(chief, pi)];
                  return (
                    <button
                      key={pi}
                      type="button"
                      className={`piece-mark${on ? ' known' : ''}`}
                      title={piece.title}
                      aria-label={`${piece.title}${on ? ', auswendig' : ''} – zum Stück`}
                      onClick={() => onOpenPiece(ci, pi)}
                    />
                  );
                })}
              </div>
              <span className="overview-count">
                {known} von {chief.pieces.length} Stücken auswendig
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
