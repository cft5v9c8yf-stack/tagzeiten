import { CATECHISM } from '../../content/catechism';
import { memorizedCount, pieceId, TOTAL_PIECES } from '../../domain/catechismDay';
import { Section } from '../../ui/Section';

const OPEN_KEY = 'tz:catOverview';

/** The overview's earlier, separate setting; used once as the default. */
function readLegacyOpen(): boolean {
  try {
    return localStorage.getItem(OPEN_KEY) === '1';
  } catch {
    return false;
  }
}

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
  // Open or closed is remembered per device like every heading (was tz:catOverview before).
  return (
    <Section
      id="cat.overview"
      title="Übersicht"
      level={3}
      defaultOpen={readLegacyOpen()}
      className="cat-overview"
      aside={
        <span className="overview-total">
          {memorizedCount(memorized)} von {TOTAL_PIECES} Stücken auswendig
        </span>
      }
    >
      <p className="small muted">
        Welche Stücke du schon auswendig kannst. Was gelernt ist, bleibt hier stehen – es verfällt nichts, und es fehlt
        nichts, wenn eine Woche anders lief.
      </p>
      <ol className="overview-list">
        {CATECHISM.map((chief, ci) => {
          const known = chief.pieces.filter((_, pi) => memorized[pieceId(chief, pi)]).length;
          return (
            <li key={chief.id} className={`overview-row${ci === currentChief ? ' current' : ''}`}>
              <button type="button" className="overview-head" onClick={() => onOpenPiece(ci, 0)}>
                <span className="overview-no">{ci + 1}</span>
                <span className="overview-title">{chief.title}</span>
              </button>
              {ci === currentChief && <span className="ktag">diese Woche</span>}
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
    </Section>
  );
}
