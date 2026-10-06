import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { SUNDAY_GUIDE, SUNDAY_GUIDE_SOURCES, SUNDAY_GUIDE_TITLE, type GuideBlock } from '../../content/sundayGuide';
import { useSundayLinks } from './SundayPage';

function Block({ block }: { block: GuideBlock }) {
  switch (block.kind) {
    case 'quote':
      return (
        <figure className="sunday-verse guide-quote">
          <blockquote>{block.text}</blockquote>
          <figcaption className="guide-quote-source">{block.source}</figcaption>
        </figure>
      );
    case 'rubric':
      return (
        <p id={block.id} className="guide-entry">
          <span className="rubric-inline">{block.lead}</span> {block.text}
        </p>
      );
    default:
      return <p>{block.text}</p>;
  }
}

/** "Der Sonntag – eine Hilfe für das Haus": a quiet page to read; nothing to tick (rule 4). */
export function SundayGuidePage() {
  const links = useSundayLinks();
  const { hash } = useLocation();
  // A link to a section (e.g. #vorbereitung on Saturday evening) opens there.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView?.({ block: 'start' });
  }, [hash]);
  return (
    <article className="sunday-guide">
      <p className="back-link">
        <Link to={links.sunday()}>‹ Sonntag</Link>
      </p>
      <h2>{SUNDAY_GUIDE_TITLE}</h2>
      {SUNDAY_GUIDE.map((s) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
          <h3 id={`${s.id}-h`}>{s.title}</h3>
          {s.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </section>
      ))}
      <section className="guide-sources" aria-labelledby="guide-sources-h">
        <h3 id="guide-sources-h">Quellen</h3>
        <ul>
          {SUNDAY_GUIDE_SOURCES.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
