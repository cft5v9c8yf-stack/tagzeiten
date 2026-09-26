import { MOTTO, PRIVACY, SOURCES, THE_ARC } from '../../content/about';
import { Section } from '../../ui/Section';

export function About() {
  return (
    <>
      {MOTTO.map((m) => (
        <blockquote key={m.ref} className="motto">
          {m.text} <span className="muted">({m.ref})</span>
        </blockquote>
      ))}
      <Section id="more.about.arc" title="Der Bogen" level={4}>
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
      </Section>
      <Section id="more.about.sources" title="Quellen" level={4}>
      <ul className="plain-list">
        {SOURCES.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      </Section>
      <Section id="more.about.privacy" title="Privatsphäre" level={4}>
      <ul className="plain-list">
        {PRIVACY.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      </Section>
      <p className="small muted">Version {__APP_VERSION__}</p>
    </>
  );
}

export const ABOUT_INFO = (
  <p>
    Eine Ordnung für Morgen und Abend. Sie ist kein weiterer Lebensbereich, der bedient werden will, sondern ordnet die,
    die schon da sind: Haus, Beruf, Gemeinde und den Nächsten.
  </p>
);
