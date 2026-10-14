import type { ChiefPartId } from '../../content/catechism';
import {
  LOEHE_OVERVIEW,
  LOEHE_SOURCE,
  isQuestion,
  lessonTitle,
  loeheForPiece,
  pieceRangeLabel,
  type LoeheChapter,
  type LoeheQuestion,
} from '../../content/loeheCatechism';
import { Section } from '../../ui/Section';

function Lines({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((l, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {l}
        </span>
      ))}
    </>
  );
}

export function Question({ q }: { q: LoeheQuestion }) {
  return (
    <div className="loehe-qa">
      <p className="cat-q">
        <span className="loehe-no">{q.no}.</span> {q.q}
      </p>
      <p className="cat-a">
        <Lines text={q.a} />
      </p>
      {q.quote && <blockquote className="loehe-quote">{q.quote}</blockquote>}
      {q.note && <p className="loehe-note">{q.note}</p>}
      {q.footnotes?.map((f, i) => (
        <p key={i} className="loehe-foot">
          {'*'.repeat(i + 1)}) {f}
        </p>
      ))}
    </div>
  );
}

function Chapter({ chapter, prefix }: { chapter: LoeheChapter; prefix: string }) {
  return (
    <>
      {chapter.lessons.map((lesson, li) => (
        <Section key={li} id={`${prefix}.${li}`} title={lessonTitle(lesson)} level={4} defaultOpen={false} titleClassName="loehe-lesson">
          {lesson.items.map((item, i) =>
            isQuestion(item) ? <Question key={item.no} q={item} /> : <p key={`m${i}`} className="loehe-mark">{item.mark}</p>,
          )}
        </Section>
      ))}
    </>
  );
}

/**
 * Löhe's questions on one piece, folded under it: his lessons as small
 * headings, the questions in his numbering.
 */
export function LoehePiece({ chief, pieceIndex }: { chief: ChiefPartId; pieceIndex: number }) {
  const lessons = loeheForPiece(chief, pieceIndex);
  if (!lessons.length) return null;
  return (
    <Section
      id={`cat.loehe.${chief}.${pieceIndex}`}
      title="Fragen von Wilhelm Löhe"
      aside={pieceRangeLabel(chief, pieceIndex)}
      level={4}
      defaultOpen={false}
      className="loehe loehe-piece"
      titleClassName="cat-sub"
    >
      {lessons.map((lesson, li) => (
        <div key={li}>
          <h5 className="loehe-lesson">{lessonTitle(lesson)}</h5>
          {lesson.items.map((item, i) =>
            isQuestion(item) ? <Question key={item.no} q={item} /> : <p key={`m${i}`} className="loehe-mark">{item.mark}</p>,
          )}
        </div>
      ))}
      <p className="small muted">{LOEHE_SOURCE}.</p>
    </Section>
  );
}

/**
 * Löhe's questions on the catechism as a whole and on the means of grace, on
 * the overview. Folded by default: an explanation for the teacher, not a
 * step in learning by heart.
 */
export function LoeheExplanation() {
  const id = 'cat.loehe.overview';
  return (
    <Section id={id} title="Erklärung von Wilhelm Löhe" level={3} defaultOpen={false} className="loehe" titleClassName="cat-sub">
      <p className="book-source">
        Fragen zum ganzen Katechismus und zu den Gnadenmitteln. Die Fragen zu den einzelnen Stücken stehen unter jedem Stück
        und im Hausvater-Modus. Wortgetreu in der Rechtschreibung der Ausgabe.
      </p>
      {LOEHE_OVERVIEW.map((c, i) => (
        <Chapter key={i} chapter={c} prefix={`${id}.${i}`} />
      ))}
      <p className="small muted">
        {LOEHE_SOURCE}, {LOEHE_OVERVIEW.map((c) => c.pages).join(' und ')}.
      </p>
    </Section>
  );
}
