import type { ChiefPartId } from '../../content/catechism';
import {
  LOEHE_BY_CHIEF_PART,
  LOEHE_OVERVIEW,
  LOEHE_SOURCE,
  isQuestion,
  lessonTitle,
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

function Question({ q }: { q: LoeheQuestion }) {
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
 * Löhe's questions and answers on one chief part, folded under the pieces
 * (on the overview: those on the catechism as a whole). Folded by default:
 * an explanation for the teacher, not a step in learning by heart.
 */
export function LoeheExplanation({ chief }: { chief?: ChiefPartId }) {
  const chapters = chief ? [LOEHE_BY_CHIEF_PART[chief]] : LOEHE_OVERVIEW;
  const id = `cat.loehe.${chief ?? 'overview'}`;
  return (
    <Section id={id} title="Erklärung von Wilhelm Löhe" level={3} defaultOpen={false} className="loehe" titleClassName="cat-sub">
      <p className="book-source">
        {chief
          ? 'Fragen und Antworten zum Verständnis, in Lektionen eingeteilt, wie Löhe sie für Haus, Schule und Kirche geschrieben hat.'
          : 'Fragen zum ganzen Katechismus und zu den Gnadenmitteln. Die Fragen zu den einzelnen Hauptstücken stehen auf deren Seiten.'}{' '}
        Wortgetreu in der Rechtschreibung der Ausgabe.
      </p>
      {chapters.map((c, i) => (
        <Chapter key={i} chapter={c} prefix={`${id}.${i}`} />
      ))}
      <p className="small muted">
        {LOEHE_SOURCE}, {chapters.map((c) => c.pages).join(' und ')}.
      </p>
    </Section>
  );
}
