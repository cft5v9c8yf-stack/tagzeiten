import { Fragment } from 'react';
import { IMPRINT, IMPRINT_STAND, PRIVACY_NOTICE, type ImprintSection } from '../../content/impressum';

/** Shows "[…]" placeholders marked, so a missing entry is not overlooked. */
function WithPlaceholders({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/);
  return (
    <>
      {parts.map((p, i) =>
        /^\[.*\]$/.test(p) ? (
          <mark key={i} className="placeholder" title="Noch einzutragen">
            {p}
          </mark>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

function Sections({ sections, level }: { sections: readonly ImprintSection[]; level: 3 | 4 }) {
  const H = `h${level}` as 'h3' | 'h4';
  return (
    <>
      {sections.map((s) => (
        <section key={s.title} className="imprint-section">
          <H>{s.title}</H>
          {s.lines.map((l) => (
            <p key={l}>
              <WithPlaceholders text={l} />
            </p>
          ))}
        </section>
      ))}
    </>
  );
}

/** Impressum and privacy notice under "Mehr". */
export function Imprint() {
  return (
    <div className="imprint">
      <Sections sections={IMPRINT} level={3} />
      <h3>Datenschutz</h3>
      <Sections sections={PRIVACY_NOTICE} level={4} />
      <p className="small muted">{IMPRINT_STAND}</p>
    </div>
  );
}
