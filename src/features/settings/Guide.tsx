import type { GuidePart } from '../../content/airplaneGuide';

/** A step-by-step guide under "Mehr": an intro, numbered parts, then notes. */
export function Guide({
  intro,
  parts,
  notes,
  level = 3,
}: {
  intro: string;
  parts: readonly GuidePart[];
  notes: readonly string[];
  level?: 3 | 4;
}) {
  const H = `h${level}` as 'h3' | 'h4';
  return (
    <div className="guide">
      <p>{intro}</p>
      {parts.map((part) => (
        <section key={part.title} className="guide-part">
          <H>{part.title}</H>
          {part.intro && <p>{part.intro}</p>}
          <ol className="guide-steps">
            {part.steps.map((s) => (
              <li key={s.text}>
                {s.text}
                {s.note && <span className="guide-note">{s.note}</span>}
              </li>
            ))}
          </ol>
        </section>
      ))}
      <section className="guide-part">
        <H>Gut zu wissen</H>
        <ul className="plain-list guide-notes">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
