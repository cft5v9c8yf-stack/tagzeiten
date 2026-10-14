import type { BookPart } from '../../content/augsburgConfession';
import { Section } from '../../ui/Section';

/** A book of parts and sections: each section a card, one open at a time. */
export function BookParts({ parts, prefix }: { parts: readonly BookPart[]; prefix: string }) {
  const ids = parts.flatMap((p) => p.sections.map((s) => `${prefix}.${s.id}`));
  return (
    <>
      {parts.map((part, i) => (
        <div key={part.heading ?? i}>
          {part.heading && <h3 className="book-circle">{part.heading}</h3>}
          {part.sections.map((s) => (
            <Section key={s.id} id={`${prefix}.${s.id}`} group={ids} defaultOpen={false} className="book-card creed-card" title={
              <span className="book-card-text">
                <span className="book-card-title">{s.title}</span>
                {s.sub && <span className="book-card-sub">{s.sub}</span>}
              </span>
            }>
              {s.paragraphs.map((p, k) => (
                <p key={k}>{p}</p>
              ))}
            </Section>
          ))}
        </div>
      ))}
    </>
  );
}
