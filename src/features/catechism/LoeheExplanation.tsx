import { isQuestion, type LoeheLesson, type LoeheQuestion } from '../../content/loeheCatechism';

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((l, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {l}
        </span>
      ))}
    </>
  );
}

/** Löhe's "Anm.", footnotes and quoted passages, shown small after the answer. */
function Notes({ q }: { q: LoeheQuestion }) {
  const notes = [...(q.quote ? [q.quote] : []), ...(q.note ? [q.note] : []), ...(q.footnotes ?? []).map((f, i) => `${'*'.repeat(i + 1)}) ${f}`)];
  return (
    <>
      {notes.map((n) => (
        <p key={n.slice(0, 30)} className="li-note">
          {n}
        </p>
      ))}
    </>
  );
}

/**
 * Löhe's questions straight under Luther's, in the same order of question and
 * answer, only quieter: no red, his number in the margin. Nothing to tap.
 */
export function LoeheInline({ lessons, label = 'Wilhelm Löhe' }: { lessons: readonly LoeheLesson[]; label?: string }) {
  const marks = lessons.flatMap((l) => l.items.filter((i) => !isQuestion(i))).length;
  if (!lessons.some((l) => l.items.some(isQuestion))) return null;
  return (
    <section className="li" aria-label={label}>
      <p className="li-label">{label}</p>
      {lessons.map((l, li) => (
        <div key={li}>
          {l.items.map((item, i) =>
            isQuestion(item) ? (
              <div key={item.no} className="li-qa">
                <p className="li-q">
                  <span className="li-no">{item.no}</span>
                  {item.q}
                </p>
                <p className="li-a">
                  <Lines text={item.a} />
                </p>
                <Notes q={item} />
              </div>
            ) : marks > 1 ? (
              <p key={`m${i}`} className="li-mark">
                Zum {item.mark} Gebot
              </p>
            ) : null,
          )}
        </div>
      ))}
    </section>
  );
}
