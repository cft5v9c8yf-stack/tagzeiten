import type { GuidePart } from '../../content/airplaneGuide';

/** A step-by-step guide under "Mehr": an intro, numbered parts, then notes. */
export function Guide({ intro, parts, notes }: { intro: string; parts: readonly GuidePart[]; notes: readonly string[] }) {
  return (
    <div className="guide">
      <p>{intro}</p>
      {parts.map((part) => (
        <section key={part.title} className="guide-part">
          <h3>{part.title}</h3>
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
        <h3>Gut zu wissen</h3>
        <ul className="plain-list guide-notes">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
