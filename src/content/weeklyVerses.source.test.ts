/**
 * Verifies every weekly verse against the Luther 1912 source (Zefania XML,
 * CC0, npm package "xmlbible-lut1912"). Runs only when the source is present:
 *
 *   npm pack xmlbible-lut1912 && tar xzf xmlbible-lut1912-*.tgz
 *   LUT1912_DIR=package/text npx vitest run src/content/weeklyVerses.source.test.ts
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CORRECTIONS, FEAST_VERSES, WEEKLY_VERSES } from './weeklyVerses';

const dir = process.env.LUT1912_DIR;
const available = !!dir && existsSync(dir);

function loadBible(path: string): Record<string, Record<string, Record<string, string>>> {
  const books: Record<string, Record<string, Record<string, string>>> = {};
  for (const f of readdirSync(path)) {
    const s = readFileSync(join(path, f), 'utf8');
    const name = /bsname="([^"]+)"/.exec(s)?.[1];
    if (!name) continue;
    const chapters: Record<string, Record<string, string>> = {};
    for (const [, c, body] of s.matchAll(/<CHAPTER cnumber="(\d+)">([\s\S]*?)<\/CHAPTER>/g)) {
      const verses: Record<string, string> = {};
      for (const [, v, t] of body!.matchAll(/<VERS vnumber="(\d+)">([\s\S]*?)<\/VERS>/g)) {
        verses[v!] = t!.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').trim();
      }
      chapters[c!] = verses;
    }
    books[name] = chapters;
  }
  return books;
}

describe.skipIf(!available)('weekly verses against Luther 1912', () => {
  // The describe body runs even when skipped, so load the source only when present.
  const books = available ? loadBible(dir!) : {};
  const entries = Object.entries({ ...WEEKLY_VERSES, ...FEAST_VERSES });

  it.each(entries)('%s is verbatim Luther 1912', (_key, verse) => {
    const [book, cv] = verse.source.split(' ') as [string, string];
    const [chapter, vs] = cv.split(',') as [string, string];
    let text = vs
      .split('.')
      .map((n) => books[book]?.[chapter]?.[n] ?? '')
      .join(' ');
    // Apply corrections listed for this book and chapter.
    for (const c of CORRECTIONS) if (c.source.split(',')[0] === `${book} ${chapter}`) text = text.replace(c.from, c.to);
    expect(text, `source ${verse.source} not found`).not.toBe('');
    for (const part of verse.parts) {
      const variants = [part, part[0]!.toUpperCase() + part.slice(1), part[0]!.toLowerCase() + part.slice(1)];
      expect(variants.some((p) => text.includes(p)), part).toBe(true);
    }
  });
});
