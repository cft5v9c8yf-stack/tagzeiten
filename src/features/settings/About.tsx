import { MOTTO, PRIVACY, SOURCES, THE_ARC } from '../../content/about';
import { TileGroup } from '../../ui/TileGroup';

export function About() {
  return (
    <>
      {MOTTO.map((m) => (
        <blockquote key={m.ref} className="motto">
          {m.text} <span className="muted">({m.ref})</span>
        </blockquote>
      ))}
      <TileGroup
        level={4}
        label="Über Henoch"
        items={[
        {
          id: 'more.about.arc',
          title: 'Der Bogen',
          line: 'Morgen und Abend',
          icon: 'sunrise',
          content: (
            <>
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
            </>
          ),
        },
        {
          id: 'more.about.sources',
          title: 'Quellen',
          line: 'Texte und Methode',
          icon: 'bible',
          content: (
            <>
      <ul className="plain-list">
        {SOURCES.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
            </>
          ),
        },
        {
          id: 'more.about.privacy',
          title: 'Privatsphäre',
          line: 'Alles auf dem Gerät',
          icon: 'check',
          content: (
            <>
      <ul className="plain-list">
        {PRIVACY.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
            </>
          ),
        },
        ]}
      />
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
