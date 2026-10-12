import { Link } from 'react-router';
import { PREPARATION_ANCHOR, SUNDAY_GUIDE_TITLE } from '../../content/sundayGuide';
import { SCRIPTURE_PRAYER } from '../../content/scripturePrayer';
import { lessonOfWeek, SUNDAY_LESSONS } from '../../content/adventLessons';

export const GUIDE_PATH = '/sonntag/hilfe';
export const WALK_PATH = '/sonntag/gebet';
export const LESSON_PATH = (sonntag: string) => `/sonntag/lektion/${sonntag}`;

/**
 * The guide for the house and the prayer walk, as two tiles. In the weeks of
 * Advent the Bible lesson of the Sunday after Dieffenbach stands above them;
 * outside Advent a quiet link leads to the four, where the page asks for it.
 */
export function SundayHelps({
  page,
  weekKey,
  withLessons = false,
}: {
  page: (path: string) => string;
  weekKey?: string;
  withLessons?: boolean;
}) {
  const [title, sub] = SUNDAY_GUIDE_TITLE.split(' – ');
  const walk = SCRIPTURE_PRAYER[0]!;
  const lesson = weekKey ? lessonOfWeek(weekKey) : undefined;
  return (
    <>
      <div className="tiles sunday-helps">
        {lesson && (
          <Link className="tile tile-wide" to={page(LESSON_PATH(lesson.sonntag))}>
            <span className="tile-time">Bibellektion · {lesson.bibelstelle}</span>
            <span className="tile-name">{lesson.titel}</span>
            <span className="tile-state">Nach Dieffenbachs Haus-Agende</span>
          </Link>
        )}
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
      {!lesson && withLessons && (
        <p className="sunday-lessons-link">
          <Link to={page(LESSON_PATH(SUNDAY_LESSONS[0]!.sonntag))}>
            Die Bibellektionen der Adventssonntage <span aria-hidden="true">›</span>
          </Link>
        </p>
      )}
    </>
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
