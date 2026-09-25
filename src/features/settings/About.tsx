import { MOTTO, PRIVACY, SOURCES, THE_ARC } from '../../content/about';

export function About() {
  return (
    <section aria-labelledby="about">
      <h2 id="about">Über Tagzeiten</h2>
      <p>
        Eine Ordnung für Morgen und Abend. Sie ist kein weiterer Lebensbereich, der bedient werden will, sondern ordnet die,
        die schon da sind: Haus, Beruf, Gemeinde und den Nächsten.
      </p>
      {MOTTO.map((m) => (
        <blockquote key={m.ref} className="motto">
          {m.text} <span className="muted">({m.ref})</span>
        </blockquote>
      ))}
      <h3>Der Bogen</h3>
      <p className="arc-lines">
        {THE_ARC.morning.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </p>
      <p className="arc-lines">
        {THE_ARC.evening.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </p>
      <p>{THE_ARC.monthly}</p>
      <h3>Quellen</h3>
      <ul className="plain-list">
        {SOURCES.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <h3>Privatsphäre</h3>
      <ul className="plain-list">
        {PRIVACY.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p className="small muted">Version {__APP_VERSION__}</p>
    </section>
  );
}
