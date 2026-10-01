import { Link } from 'react-router';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { CATECHISM } from '../../content/catechism';
import { memorizedCount, pieceId, TOTAL_PIECES } from '../../domain/catechismDay';

/** The appendices, opened like the chief parts. `book`: part of the Book of Concord, listed there. */
export const APPENDICES = [
  { slug: 'konkordienbuch', title: 'Das Konkordienbuch', line: 'Die Bekenntnisse der lutherischen Kirche, 1580: altkirchliche Bekenntnisse, Augsburgische Konfession, Kleiner und Großer Katechismus' },
  { slug: 'kirchenjahr', title: 'Das Kirchenjahr', line: 'Nach Dieffenbachs Haus-Agende (1853)' },
  { slug: 'haustafel', title: 'Die Haustafel', line: 'Für jeden Stand ein Wort' },
  { slug: 'tischgebete', title: 'Tischgebete', line: 'Vor und nach dem Essen' },
  { slug: 'privatbeichte', title: 'Privatbeichte', line: 'Bitte, Bekenntnis, Zuspruch' },
  { slug: 'bekenntnisse', title: 'Die drei Bekenntnisse', line: 'Apostolikum, Nizänum, Athanasianum', book: true },
  { slug: 'augsburgische-konfession', title: 'Die Augsburgische Konfession', line: 'Das Bekenntnis von 1530', book: true },
  { slug: 'grosser-katechismus', title: 'Der Große Katechismus', line: 'Luthers Auslegung der Hauptstücke', book: true },
] as const;

/**
 * The chief parts as tiles, two side by side, like "Mehr": number, title, the
 * pieces learned by heart. Orientation only: no dates, nothing that lapses or
 * breaks off (rule 4). A tile opens its chief part.
 */
export function CatechismOverview({
  memorized,
  currentChief,
}: {
  memorized: Record<string, boolean>;
  currentChief: number;
}) {
  const { date, isToday } = useSelectedDate();
  const to = (slug: string) => withDate(`/katechismus/${slug}`, date, isToday);
  return (
    <>
      <section className="cat-overview" aria-labelledby="cat-parts">
        <div className="cat-overview-head">
          <h4 id="cat-parts">Hauptstücke</h4>
          <span className="overview-total">
            {memorizedCount(memorized)} von {TOTAL_PIECES} Stücken auswendig
          </span>
        </div>
        <ol className="overview-list">
          {CATECHISM.map((chief, ci) => {
            const known = chief.pieces.filter((_, pi) => memorized[pieceId(chief, pi)]).length;
            return (
              <li key={chief.id} className={`overview-row${ci === currentChief ? ' current' : ''}`}>
                <Link className="overview-link" to={to(chief.id)}>
                  <span className="overview-no">{ci + 1}</span>
                  <span className="overview-title">{chief.title}</span>
                  {ci === currentChief && <span className="ktag">diese Woche</span>}
                  <span className="overview-pieces" aria-hidden="true">
                    {chief.pieces.map((_, pi) => (
                      <span key={pi} className={`piece-mark${memorized[pieceId(chief, pi)] ? ' known' : ''}`} />
                    ))}
                  </span>
                  <span className="overview-count">
                    {known} von {chief.pieces.length} Stücken auswendig
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}

/**
 * What is read rather than learned: the Book of Concord across the whole
 * width, then the books for the house.
 */
export function ReadingOverview() {
  const { date, isToday } = useSelectedDate();
  const to = (slug: string) => withDate(`/katechismus/${slug}`, date, isToday);
  const rows = APPENDICES.filter((a) => !('book' in a));
  return (
    <ul className="overview-list">
      {rows.map((a) => (
        <li key={a.slug} className={`overview-row${a.slug === 'konkordienbuch' ? ' wide' : ''}`}>
          <Link className="overview-link" to={to(a.slug)}>
            <span className="overview-title">{a.title}</span>
            <span className="overview-count">{a.line}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
