import type { ReactNode } from 'react';
import { refUrl } from '../domain/bibleRef';

/** Link to the passage on bibleserver.com; the text itself is never embedded (rule 13). */
export function BibleLink({ reference, href, children }: { reference: string; href?: string; children?: ReactNode }) {
  return (
    <a className="bible-link" href={href ?? refUrl(reference)} target="_blank" rel="noopener noreferrer">
      {children ?? reference}
    </a>
  );
}
