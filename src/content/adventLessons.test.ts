import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { churchDay } from '../domain/churchYear';
import { lessonOfWeek, SUNDAY_LESSONS } from './adventLessons';

const squeeze = (s: string) => s.replace(/\s+/g, ' ').trim();

describe('the Bible lessons of the Sundays in Advent (Dieffenbach)', () => {
  it('keep the wording of the source, word for word', () => {
    const source = readFileSync(resolve(__dirname, '../../reference/dieffenbach-advent.txt'), 'utf8')
      .split('\n')
      .filter((l) => !l.startsWith('#'))
      .join('\n');
    const rebuilt = SUNDAY_LESSONS.flatMap((s) => [
      s.name,
      s.zusatz ? `${s.titel} ${s.zusatz}` : s.titel,
      ...s.leitworte.map((l) => `${l.bibelstelle}. ${l.text}`),
      `V. Bibellektion: ${s.bibelstelle}`,
      ...s.absaetze.map((a) => `${a.nr}. ${a.teile.map((t) => ('zitat' in t ? t.zitat : t.text)).join(' ')}`),
    ]).join(' ');
    expect(squeeze(rebuilt)).toBe(squeeze(source));
  });

  it('have four Sundays with their titles, references and numbered paragraphs', () => {
    expect(SUNDAY_LESSONS.map((s) => [s.sonntag, s.bibelstelle, s.absaetze.length])).toEqual([
      ['advent-1', 'Matth. 21, 1–9', 7],
      ['advent-2', 'Luc. 21, 25–36', 5],
      ['advent-3', 'Matth. 11, 2–10 (V. 6)', 4],
      ['advent-4', 'Joh. 1, 19–28', 6],
    ]);
    for (const s of SUNDAY_LESSONS) expect(s.absaetze.map((a) => a.nr)).toEqual(s.absaetze.map((_, i) => i + 1));
  });

  it('set the hymn verses off as quotations, with the quotation marks and umlauts of the source', () => {
    const verses = SUNDAY_LESSONS.flatMap((s) => s.absaetze.flatMap((a) => a.teile.filter((t) => 'zitat' in t)));
    expect(verses).toHaveLength(6);
    for (const v of verses) expect('zitat' in v && /^„[^„]+“$/.test(v.zitat)).toBe(true);
    const all = JSON.stringify(SUNDAY_LESSONS);
    for (const s of ['„Dein König kommt!“', 'Thüren', 'sanftmüthig', 'begegn\' ich', 'Zeugniß', 'Hülfe']) expect(all).toContain(s);
  });

  it('belong to the Sunday by the church year: the fourth is the last Sunday before 25 December', () => {
    const at = (d: string) => lessonOfWeek(churchDay(d).weekKey)?.sonntag;
    // 2026: Christmas Eve on a Thursday.
    expect(at('2026-11-29')).toBe('advent-1');
    expect(at('2026-12-02')).toBe('advent-1');
    expect(at('2026-12-06')).toBe('advent-2');
    expect(at('2026-12-13')).toBe('advent-3');
    expect(at('2026-12-20')).toBe('advent-4');
    // 2023: Christmas Eve on a Sunday is itself the fourth Sunday in Advent.
    expect(at('2023-12-03')).toBe('advent-1');
    expect(at('2023-12-24')).toBe('advent-4');
    // 2028: the shortest Advent, from 3 December.
    expect(at('2028-12-03')).toBe('advent-1');
    expect(at('2028-12-24')).toBe('advent-4');
    // Before and after Advent: none.
    expect(at('2026-11-22')).toBeUndefined();
    expect(at('2026-12-27')).toBeUndefined();
    expect(at('2027-06-06')).toBeUndefined();
  });
});
