import { Link } from 'react-router';
import { PREPARATION_ANCHOR, SUNDAY_GUIDE_TITLE } from '../../content/sundayGuide';
import { SCRIPTURE_PRAYER } from '../../content/scripturePrayer';

export const GUIDE_PATH = '/sonntag/hilfe';
export const WALK_PATH = '/sonntag/gebet';

/** The guide for the house and the prayer walk, as two tiles. */
export function SundayHelps({ page }: { page: (path: string) => string }) {
  const [title, sub] = SUNDAY_GUIDE_TITLE.split(' – ');
  const walk = SCRIPTURE_PRAYER[0]!;
  return (
    <div className="tiles sunday-helps">
      <Link className="tile" to={page(GUIDE_PATH)}>
        <span className="tile-time">Zum Lesen</span>
        <span className="tile-name">{title}</span>
        <span className="tile-state">{sub}</span>
      </Link>
      <Link className="tile" to={page(WALK_PATH)}>
        <span className="tile-time">{walk.steps.length} Schritte</span>
        <span className="tile-name">Mit der Schrift beten</span>
        <span className="tile-state">Gebetsgang zum Sonntag</span>
      </Link>
    </div>
  );
}

/** From Saturday 18:00: a quiet hint to the preparation on Saturday evening. */
export function PreparationHint({ page }: { page: (path: string) => string }) {
  return (
    <Link className="preparation-hint" to={`${page(GUIDE_PATH)}#${PREPARATION_ANCHOR}`}>
      Morgen ist Sonntag. Zur Vorbereitung am Samstagabend <span aria-hidden="true">›</span>
    </Link>
  );
}
