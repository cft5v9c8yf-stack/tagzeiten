import { AIRPLANE_GUIDE, AIRPLANE_INTRO, AIRPLANE_NOTES } from '../../content/airplaneGuide';

/** Step-by-step guide: airplane mode while Tagzeiten is open (iPhone, Kurzbefehle). */
export function AirplaneGuide() {
  return (
    <div className="guide">
      <p>{AIRPLANE_INTRO}</p>
      {AIRPLANE_GUIDE.map((part) => (
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
          {AIRPLANE_NOTES.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
