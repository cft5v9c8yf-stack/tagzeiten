import { describe, expect, it } from 'vitest';
import band1 from '../../data/dogmatik/band-1.json';
import band2 from '../../data/dogmatik/band-2.json';
import band3 from '../../data/dogmatik/band-3.json';
import { getOrder, morningOrder } from '../content/orders';
import {
  blocks,
  bookProblems,
  contents,
  defaultDogmatik,
  findDay,
  library,
  neighbours,
  normalizeBook,
  normalizeDogmatik,
  pieces,
  planDays,
  planLength,
  recentlyRead,
  searchLibrary,
  setRead,
  todaysDay,
  todaysPortion,
  type DogmatikSettings,
} from './dogmatik';

const books = [band1, band2, band3].map((b, i) => normalizeBook(b, i + 1));
const lib = library(books);
const s0 = defaultDogmatik();
const day = (band: number, tag: number) => findDay(lib, `${band}-${tag}`)!;

describe('the files (data/dogmatik/band-1.json … band-3.json)', () => {
  it('hold three volumes of 365 days each, in order', () => {
    expect(books.map((b) => [b.buch.band, b.tage.length, b.buch.umfang])).toEqual([
      [1, 365, 365],
      [2, 365, 365],
      [3, 365, 365],
    ]);
    for (const b of books) expect(b.tage.map((d) => d.tag)).toEqual(Array.from({ length: 365 }, (_, i) => i + 1));
  });

  it('have a note for every marker and a marker for every note', () => {
    expect(books.flatMap(bookProblems)).toEqual([]);
  });

  it('give every day its doctrine, pages and reading time', () => {
    for (const d of lib.tage) {
      expect(d.teil, `${d.band}-${d.tag}`).not.toBe('Ohne Lehrstück');
      expect(d.seite, `${d.band}-${d.tag}`).toMatch(/^\d+( f\.|–\d+)?$/);
      expect(d.minuten).toBeGreaterThan(0);
      expect(d.minuten).toBeLessThan(12);
    }
  });

  it('keep the days read by hand, with their additions', () => {
    const checked = lib.tage.filter((d) => d.geprueft).map((d) => `${d.band}-${d.tag}`);
    expect(checked).toEqual(['1-1', '1-2', '1-3', '1-4', '1-5', '1-47', '1-48', '1-49', '1-50', '1-51', '1-52', '1-53']);
    expect(day(1, 47)).toMatchObject({ titel: 'Was ist das Fundament des Glaubens?', kernsatz: expect.any(String), frage: expect.any(String) });
  });

  it('keep no notes of the transcription and no broken Hebrew', () => {
    for (const d of lib.tage) {
      const all = [...d.absaetze, ...Object.values(d.fussnoten)].join(' ');
      expect(all, `${d.band}-${d.tag}`).not.toMatch(/\[English|HEBREW|BookOfConcord|[֐-׿]|­|\s\^(\s|$)/);
    }
  });
});

describe('import of a file', () => {
  it('takes any number of days, puts them in order and drops broken ones', () => {
    const many = Array.from({ length: 365 }, (_, i) => ({ tag: 365 - i, titel: `T${365 - i}`, teil: 'X', minuten: 3, absaetze: ['a'] }));
    const b = normalizeBook({ buch: { band: 2 }, tage: [...many, { tag: 5, titel: 'doppelt', absaetze: ['b'] }, { titel: 'ohne Nummer' }] });
    expect(b.tage).toHaveLength(365);
    expect(b.tage[0]).toMatchObject({ band: 2, tag: 1 });
    expect(b.tage[4]!.titel).toBe('T5');
  });
});

describe('text', () => {
  it('turns footnote markers and missing Hebrew into pieces', () => {
    expect(pieces('sei.[[313]] Dagegen ([hebräisch]) und')).toEqual([
      { text: 'sei.' },
      { note: '313' },
      { text: ' Dagegen (' },
      { gap: true },
      { text: ') und' },
    ]);
  });

  it('puts a quotation after its paragraph and keeps headings within a day', () => {
    expect(blocks(day(1, 47)).map((b) => `${b.kind}${b.no}`)).toEqual(['p1', 'p2', 'p3', 'q1', 'p4', 'q2', 'p5']);
    const withHeading = lib.tage.find((d) => d.absaetze.some((p) => p.startsWith('## ')))!;
    expect(blocks(withHeading).some((b) => b.kind === 'h')).toBe(true);
  });
});

describe('progress follows the reader, not the calendar (rule 6)', () => {
  it('starts with the first day and goes on where one left off', () => {
    expect(todaysPortion(lib, s0, '2026-10-16').map((d) => `${d.band}-${d.tag}`)).toEqual(['1-1']);
    const s = setRead(s0, day(1, 1), '2026-10-01');
    // Two weeks later nothing is behind: the next section waits.
    expect(todaysDay(lib, s, '2026-10-16')).toBe(day(1, 2));
  });

  it('keeps today on the section read today', () => {
    const s = setRead(s0, day(1, 1), '2026-10-16');
    expect(todaysPortion(lib, s, '2026-10-16')).toEqual([day(1, 1)]);
    expect(todaysPortion(lib, s, '2026-10-17')).toEqual([day(1, 2)]);
  });

  it('gives as many sections as fit into the time chosen', () => {
    const s: DogmatikSettings = { ...s0, minuten: 15 };
    const portion = todaysPortion(lib, s, '2026-10-16');
    const total = portion.reduce((a, d) => a + d.minuten, 0);
    expect(portion.length).toBeGreaterThan(1);
    expect(total - portion.at(-1)!.minuten).toBeLessThan(15);
    // Read part of it today: the rest stays today's, and "Heute lesen" opens the next.
    const after = setRead(s, portion[0]!, '2026-10-16');
    expect(todaysPortion(lib, after, '2026-10-16')).toEqual(portion);
    expect(todaysDay(lib, after, '2026-10-16')).toBe(portion[1]);
  });

  it('passes over sections read ahead and goes from one volume to the next', () => {
    let s = setRead(s0, day(1, 2), '2026-10-01');
    expect(todaysPortion(lib, s, '2026-10-16')).toEqual([day(1, 1)]);
    s = setRead(s, day(1, 1), '2026-10-15');
    expect(todaysPortion(lib, s, '2026-10-16')).toEqual([day(1, 3)]);
    expect(neighbours(lib, day(1, 365)).next).toBe(day(2, 1));
  });

  it('knows how long the plan takes', () => {
    expect(planLength(planDays(lib, 0))).toBe('drei Jahre');
    expect(planDays(lib, 10)).toBeGreaterThan(400);
    expect(planDays(lib, 10)).toBeLessThan(700);
  });

  it('lists the last read, newest first', () => {
    const s = setRead(setRead(s0, day(1, 47), '2026-10-10'), day(2, 5), '2026-10-12');
    expect(recentlyRead(lib, s).map((r) => `${r.day.band}-${r.day.tag}`)).toEqual(['2-5', '1-47']);
  });

  it('normalizes stored settings, also those of the preview', () => {
    const s = normalizeDogmatik({ when: 'morning', minuten: 10, fontStep: 9, read: { 47: '2026-10-01', '2-3': '2026-10-02', x: 'nein' }, notes: { 47: ' ' } });
    expect(s).toMatchObject({ on: true, stilleZeit: true, minuten: 10, fontStep: 3, read: { '1-47': '2026-10-01', '2-3': '2026-10-02' }, notes: {} });
    expect(normalizeDogmatik({ minuten: 7 }).minuten).toBe(0);
  });
});

describe('contents', () => {
  it('groups a volume by doctrine and chapter in the book\'s order', () => {
    expect(contents(books[0]!).map((p) => p.teil)).toEqual([
      'Wesen und Begriff der Theologie',
      'Die Heilige Schrift',
      'Die Lehre von Gott',
      'Die Schöpfung der Welt und des Menschen',
      'Die göttliche Vorsehung',
      'Die Engel',
      'Die Lehre vom Menschen',
    ]);
    expect(contents(books[2]!).at(-1)!.teil).toBe('Die letzten Dinge');
    expect(day(1, 47)).toMatchObject({ kapitel: '11. Einteilungen der Theologie, als Lehre gefaßt', abschnitt: '2. Fundamentale und nichtfundamentale Lehren' });
  });
});

describe('search', () => {
  it('finds words in text, notes and quotations of all three volumes', () => {
    expect(searchLibrary(lib, 'subsistere').map((h) => h.doc.to)).toContain('/katechismus/dogmatik/1-47');
    expect(searchLibrary(lib, 'Schriftbeweis').length).toBeGreaterThan(0);
    const bands = new Set(searchLibrary(lib, 'Rechtfertigung').map((h) => h.doc.area.slice(0, 6)));
    expect(bands.size).toBeGreaterThan(1);
  });

  it('stays quick over more than a thousand days', () => {
    searchLibrary(lib, 'Gnade');
    const t = performance.now();
    searchLibrary(lib, 'Abendmahl');
    expect(performance.now() - t).toBeLessThan(1500);
  });
});

describe('in the Stille Zeit', () => {
  it('stands after the Word and before the prayer (rule 2), only in the full form', () => {
    expect(morningOrder('full', true).steps.map((s) => s.id).slice(0, 4)).toEqual(['opening', 'word', 'dogmatik', 'prayer']);
    expect(morningOrder('full', false)).toBe(getOrder('morning', 'full'));
    expect(morningOrder('short', true)).toBe(getOrder('morning', 'short'));
  });
});
