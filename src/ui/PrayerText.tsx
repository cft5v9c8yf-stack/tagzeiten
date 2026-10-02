import type { Text, Versicle } from '../content/types';
import type { ReactNode } from 'react';
import { BibleRef } from './BibleRef';

/** A prayed text, line by line; an empty line separates stanzas. */
export function PrayerText({ text, className }: { text: Text; className?: string }) {
  const stanzas: string[][] = [[]];
  for (const l of text.lines) {
    if (l === '') stanzas.push([]);
    else stanzas[stanzas.length - 1]!.push(l);
  }
  return (
    <div className={`pray${className ? ` ${className}` : ''}`}>
      {stanzas.map((s, i) => (
        <p key={i}>
          {s.map((l, j) => (
            <span key={j} className="line">
              {l}
            </span>
          ))}
        </p>
      ))}
      {(text.ref || text.source) && (
        <p className="attribution">
          {text.ref && (/^nach /.test(text.ref) ? text.ref : <BibleRef reference={text.ref} />)}
          {text.ref && text.source && ' · '}
          {text.source}
        </p>
      )}
    </div>
  );
}

/** Versicle and response. */
export function VersicleView({ items }: { items: readonly Versicle[] }) {
  return (
    <div className="pray versicles">
      {items.map((x, i) => (
        <div key={i}>
          <div className="vr">
            <b aria-label="Vorbeter">V</b>
            <span>{x.v}</span>
          </div>
          <div className="vr">
            <b aria-label="Alle">A</b>
            <span>{x.a}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Rubric({ children }: { children: ReactNode }) {
  return <p className="rubric">{children}</p>;
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="note">{children}</p>;
}
