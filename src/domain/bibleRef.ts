import { BIBLE_BASE_URL } from '../content/readingPlans';

/**
 * Link to bibleserver.com (Luther) for a reference like "1. Petrus 3,7" or
 * "Epheser 6,5-8". The Bible text itself is never embedded (rule 13).
 */
export function refUrl(ref: string): string {
  const m = /^(.*\D)\s(\d.*)$/.exec(ref.trim());
  if (!m) return BIBLE_BASE_URL;
  const book = (m[1] ?? '').replace(/\.\s+/g, '.');
  const passage = (m[2] ?? '').replace(/–/g, '-');
  return BIBLE_BASE_URL + encodeURIComponent(book) + passage;
}

export const psalmRef = (n: number) => `Psalm ${n}`;
export const psalmUrl = (n: number) => refUrl(psalmRef(n));
