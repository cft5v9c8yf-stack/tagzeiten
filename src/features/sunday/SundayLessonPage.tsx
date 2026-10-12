import { Link, Navigate, useParams } from 'react-router';
import { LESSON_SOURCE, lessonById, SUNDAY_LESSONS, type LessonPart } from '../../content/adventLessons';
import { LESSON_PATH } from './SundayHelps';
import { useSundayLinks } from './SundayPage';

/** A hymn verse, its lines as Dieffenbach set them (" / "). */
function Hymn({ text }: { text: string }) {
  const lines = text.split(' / ');
  return (
    <blockquote className="lesson-hymn">
      {lines.map((l, i) => (
        <span key={i} className="line">
          {l}
        </span>
      ))}
    </blockquote>
  );
}

function Part({ part }: { part: LessonPart }) {
  return 'zitat' in part ? <Hymn text={part.zitat} /> : <p>{part.text}</p>;
}

/**
 * The Bible lesson of a Sunday after Dieffenbach's Haus-Agende: a quiet page to
 * read. The lesson itself stands as a reference, to be read in the Bible on paper
 * (rule 13); the exposition follows in its numbered paragraphs, word for word.
 */
export function SundayLessonPage() {
  const links = useSundayLinks();
  const { sonntag } = useParams();
  const lesson = lessonById(sonntag);
  if (!lesson) return <Navigate to={links.sunday()} replace />;
  return (
    <article className="sunday-guide sunday-lesson" lang="de">
      <p className="back-link">
        <Link to={links.sunday()}>‹ Sonntag</Link>
      </p>
      <p className="sunday-kicker">{lesson.name}</p>
      <h2>{lesson.titel}</h2>
      {lesson.zusatz && <p className="lesson-addition">{lesson.zusatz}</p>}
      {lesson.leitworte.map((l) => (
        <figure key={l.bibelstelle} className="sunday-verse lesson-motto">
          <blockquote>{l.text}</blockquote>
          <p className="cy-verse-ref">
            <span className="bible-ref">{l.bibelstelle}</span>
          </p>
        </figure>
      ))}
      <p className="lesson-ref">
        <span className="lesson-ref-label">Bibellektion</span> <span className="bible-ref">{lesson.bibelstelle}</span>
      </p>
      <ol className="lesson-paragraphs">
        {lesson.absaetze.map((a) => (
          <li key={a.nr} value={a.nr}>
            <span className="lesson-nr" aria-hidden="true">
              {a.nr}
            </span>
            <div className="lesson-body">
              {a.teile.map((t, i) => (
                <Part key={i} part={t} />
              ))}
            </div>
          </li>
        ))}
      </ol>
      <p className="small muted lesson-source">{LESSON_SOURCE}</p>
      <nav className="lesson-nav" aria-label="Die Adventssonntage">
        {SUNDAY_LESSONS.map((l) => (
          <Link key={l.sonntag} to={links.page(LESSON_PATH(l.sonntag))} aria-current={l === lesson ? 'page' : undefined}>
            {l.sonntag.replace(/^advent-(\d)$/, '$1. Advent')}
          </Link>
        ))}
      </nav>
    </article>
  );
}
