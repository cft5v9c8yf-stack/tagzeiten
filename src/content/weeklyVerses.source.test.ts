/**
 * Verifies every weekly verse (and the verses under "Mehr") against the Luther 1912 source (Zefania XML,
 * CC0, npm package "xmlbible-lut1912"). Runs only when the source is present:
 *
 *   npm pack xmlbible-lut1912 && tar xzf xmlbible-lut1912-*.tgz
 *   LUT1912_DIR=package/text npx vitest run src/content/weeklyVerses.source.test.ts
 *
 * The build on GitHub (.github/workflows/pages.yml) downloads the source and runs it every time.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MOTTO } from './about';
import { ARMOR_CALL, ARMOR_EVENING, ARMOR_WEEK } from './armor';
import * as L from './liturgy';
import { EVENING_PSALMS, MORNING_PSALMS } from './psalms';
import { SETTINGS_VERSES } from './settingsVerses';
import { WINTER_ARC_VERSES } from './winterArc';
import { DESERT_VERSES } from './desert';
import { CORRECTIONS, FEAST_VERSES, WEEKLY_VERSES } from './weeklyVerses';

const dir = process.env.LUT1912_DIR;
const available = !!dir && existsSync(dir);
// On the build server the source must be there: a missing download must not pass as "skipped".
if (process.env.CI && !available) throw new Error(`Luther 1912 source not found (LUT1912_DIR=${dir ?? ''})`);

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
  const entries = [
    ...Object.entries({ ...WEEKLY_VERSES, ...FEAST_VERSES }),
    ...Object.entries(SETTINGS_VERSES).map(([k, v]) => [`settings.${k}`, v] as const),
  ];

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

/** "Ps 103,10.12" or "Lk 1,68-79" → book, chapter and verse numbers. */
function verseList(source: string): [string, string, string[]] {
  const [book, cv] = source.split(' ') as [string, string];
  const [chapter, vs] = cv.split(',') as [string, string];
  const verses = vs.split('.').flatMap((part) => {
    const [a, z] = part.split('-').map(Number) as [number, number | undefined];
    return Array.from({ length: (z ?? a) - a + 1 }, (_, i) => String(a + i));
  });
  return [book, chapter, verses];
}

const lines = (t: { lines: readonly string[] }) => t.lines.join(' ');
const versicle = (v: { v: string; a: string }) => `${v.v} ${v.a}`;

/**
 * Every other Bible text shown in full: liturgy, antiphons, armour, the Gebetskammer
 * and the motto. Word for word; an excerpt may begin with a capital and end with a
 * full stop, and "…" or " – " join excerpts.
 */
const SCRIPTURE: readonly (readonly [string, string])[] = [
  ['Ps 51,17', versicle(L.VERSICLE_OPEN_LIPS)],
  ['Ps 70,2', versicle(L.VERSICLE_HELP)],
  ['Lk 1,68', L.BENEDICTUS_ANTIPHON],
  ['Lk 1,68-79', lines(L.BENEDICTUS)],
  ['Lk 1,46', L.MAGNIFICAT_ANTIPHON],
  ['Lk 1,46-55', lines(L.MAGNIFICAT)],
  ['Lk 2,29-32', lines(L.NUNC_DIMITTIS)],
  ['Ps 119,18', lines(L.PRAYER_BEFORE_READING)],
  ['Ps 37,7', lines(L.SILENCE)],
  ['1Jo 1,9', lines(L.ABSOLUTION_EVENING)],
  ['Ps 103,10.12', lines(L.ABSOLUTION_WREATH)],
  ['Ps 145,15-16', lines(L.TABLE_PRAYER_BEFORE.verse)],
  ['Ps 106,1', lines(L.TABLE_PRAYER_AFTER.verse)],
  ['Ps 63,2', MORNING_PSALMS[1].antiphon],
  ['Ps 5,4', MORNING_PSALMS[2].antiphon],
  ['Ps 36,10', MORNING_PSALMS[3].antiphon],
  ['Ps 57,9', MORNING_PSALMS[4].antiphon],
  ['Ps 51,12', MORNING_PSALMS[5].antiphon],
  ['Ps 92,3', MORNING_PSALMS[6].antiphon],
  ['Ps 118,24', MORNING_PSALMS[0].antiphon],
  ['Ps 141,2', EVENING_PSALMS[1].antiphon],
  ['Ps 121,2', EVENING_PSALMS[2].antiphon],
  ['Ps 130,7', EVENING_PSALMS[3].antiphon],
  ['Ps 23,1', EVENING_PSALMS[4].antiphon],
  ['Ps 51,12', EVENING_PSALMS[5].antiphon],
  ['Ps 84,2', EVENING_PSALMS[6].antiphon],
  ['Ps 103,2', EVENING_PSALMS[0].antiphon],
  ['Eph 6,10-11', ARMOR_CALL.text],
  ['1Petr 5,8-9', ARMOR_EVENING.text],
  ['Eph 6,14 Joh 14,6', ARMOR_WEEK[0]!.word],
  ['Eph 6,14 2Kor 5,21', ARMOR_WEEK[1]!.word],
  ['Eph 6,15 Röm 5,1', ARMOR_WEEK[2]!.word],
  ['Eph 6,16 1Jo 5,4', ARMOR_WEEK[3]!.word],
  ['Eph 6,17 1Thes 5,8', ARMOR_WEEK[4]!.word],
  ['Eph 6,17 Hebr 4,12', ARMOR_WEEK[5]!.word],
  ['Eph 6,18', ARMOR_WEEK[6]!.word],
  ['Mk 1,35', MOTTO[0].text],
  ['Ps 119,105', MOTTO[1].text],
  // The 90-Tage-Standard, and the Wüstenzeit.
  ...WINTER_ARC_VERSES.map((v) => [v.source, v.text] as const),
  ...DESERT_VERSES.map((v) => [v.source, v.text] as const),
];

describe.skipIf(!available)('other Bible texts against Luther 1912', () => {
  const books = available ? loadBible(dir!) : {};
  const sourceText = (source: string) => {
    // "Eph 6,14 Joh 14,6": two references side by side.
    const refs = source.match(/\S+ \d+,[\d.-]+/g)!;
    return refs
      .map((ref) => {
        const [book, chapter, verses] = verseList(ref);
        let text = verses.map((n) => books[book]?.[chapter]?.[n] ?? '').join(' ');
        for (const c of CORRECTIONS) if (verses.some((n) => c.source === `${book} ${chapter},${n}`)) text = text.replace(c.from, c.to);
        return text;
      })
      .join(' ');
  };

  it.each(SCRIPTURE)('%s is word for word', (source, shown) => {
    const text = sourceText(source).replace(/'/g, '’');
    expect(text.trim(), `source ${source} not found`).not.toBe('');
    const excerpts = shown
      .split(/…| – /)
      .map((e) => e.trim())
      .filter(Boolean);
    for (const e of excerpts) {
      const bare = e.replace(/\.$/, '');
      const variants = [e, bare].flatMap((p) => [p, p[0]!.toUpperCase() + p.slice(1), p[0]!.toLowerCase() + p.slice(1)]);
      expect(variants.some((p) => text.includes(p)), e).toBe(true);
    }
  });
});
