import { describe, expect, it } from 'vitest';
import data from '../../data/dogmatik.json';
import { getOrder, morningOrder } from '../content/orders';
import {
  blocks,
  bookProblems,
  defaultDogmatik,
  neighbours,
  normalizeBook,
  normalizeDogmatik,
  pieces,
  recentlyRead,
  searchBook,
  sequence,
  setRead,
  todaysDay,
  type DogmatikSettings,
} from './dogmatik';

const book = normalizeBook(data);
const s0 = defaultDogmatik();

describe('the Dogmatik file (data/dogmatik.json)', () => {
  it('loads with every day well formed', () => {
    expect(book.tage.length).toBe((data as { tage: unknown[] }).tage.length);
    expect(book.buch).toMatchObject({ autor: 'Francis Pieper', titel: 'Christliche Dogmatik', band: 1, umfang: 365 });
  });

  it('has a note for every marker and a marker for every note', () => {
    expect(bookProblems(book)).toEqual([]);
  });

  it('keeps Latin quotations out of the paragraphs', () => {
    for (const d of book.tage) for (const p of d.absaetze) expect(p).not.toMatch(/ecclesia Dei/);
  });
});

describe('import of a longer file', () => {
  it('takes any number of days, puts them in order and drops broken ones', () => {
    const many = Array.from({ length: 365 }, (_, i) => ({ tag: 365 - i, titel: `T${365 - i}`, teil: 'X', minuten: 3, absaetze: ['a'] }));
    const b = normalizeBook({ buch: {}, tage: [...many, { tag: 5, titel: 'doppelt', absaetze: ['b'] }, { titel: 'ohne Nummer' }] });
    expect(b.tage).toHaveLength(365);
    expect(b.tage[0]!.tag).toBe(1);
    expect(b.tage[4]!.titel).toBe('T5');
    expect(b.buch.umfang).toBe(365);
  });

  it('searches 365 long days quickly', () => {
    const text = 'Wenn wir hier den Begriff Fundamentallehren im Unterschied von nichtfundamentalen Lehren bestimmen wollen. '.repeat(30);
    const b = normalizeBook({ tage: Array.from({ length: 365 }, (_, i) => ({ tag: i + 1, titel: `Tag ${i + 1}`, absaetze: [text, text] })) });
    searchBook(b, 'Lehre');
    const t = performance.now();
    expect(searchBook(b, 'Begriff').length).toBe(50);
    expect(performance.now() - t).toBeLessThan(1000);
  });
});

describe('text', () => {
  it('turns footnote markers into notes', () => {
    expect(pieces('sei.[[313]] Dagegen')).toEqual([{ text: 'sei.' }, { note: '313' }, { text: ' Dagegen' }]);
  });

  it('puts a quotation after its paragraph', () => {
    const d = book.tage.find((x) => x.tag === 47)!;
    expect(blocks(d).map((b) => `${b.kind}${b.no}`)).toEqual(['p1', 'p2', 'p3', 'q1']);
  });
});

describe('progress follows the reader, not the calendar (rule 6)', () => {
  it('starts with the first day and goes on where one left off', () => {
    expect(todaysDay(book, s0, '2026-10-16')!.tag).toBe(47);
    const s = setRead(s0, 47, '2026-10-01');
    // Two weeks later nothing is behind: the next section waits.
    expect(todaysDay(book, s, '2026-10-16')!.tag).toBe(48);
  });

  it('keeps today on the section read today', () => {
    const s = setRead(s0, 47, '2026-10-16');
    expect(todaysDay(book, s, '2026-10-16')!.tag).toBe(47);
    expect(todaysDay(book, s, '2026-10-17')!.tag).toBe(48);
  });

  it('reads a chosen doctrine first', () => {
    const s: DogmatikSettings = { ...s0, order: 'topic', topic: book.tage.find((d) => d.tag === 49)!.teil };
    expect(sequence(book, s).map((d) => d.tag)).toEqual([49, 47, 48]);
    expect(todaysDay(book, s, '2026-10-16')!.tag).toBe(49);
    expect(neighbours(book, s, 49)).toMatchObject({ next: { tag: 47 } });
  });

  it('lists the last read, newest first', () => {
    const s = setRead(setRead(s0, 47, '2026-10-10'), 48, '2026-10-12');
    expect(recentlyRead(book, s).map((r) => r.day.tag)).toEqual([48, 47]);
  });

  it('normalizes stored settings', () => {
    const s = normalizeDogmatik({ when: 'evening', fontStep: 9, read: { 47: '2026-10-01', x: 'nein' }, notes: { 47: ' ' } });
    expect(s).toMatchObject({ on: true, when: 'evening', fontStep: 3, read: { 47: '2026-10-01' }, notes: {} });
  });
});

describe('search', () => {
  it('finds words in text, notes and quotations', () => {
    expect(searchBook(book, 'Fundament').map((h) => h.doc.to)).toContain('/katechismus/dogmatik/47');
    expect(searchBook(book, 'Schriftbeweis')).toHaveLength(1);
    expect(searchBook(book, 'ecclesia')).toHaveLength(1);
  });
});

describe('in the Stille Zeit', () => {
  it('stands after the Word and before the prayer (rule 2), only in the full form', () => {
    expect(morningOrder('full', true).steps.map((s) => s.id).slice(0, 4)).toEqual(['opening', 'word', 'dogmatik', 'prayer']);
    expect(morningOrder('full', false)).toBe(getOrder('morning', 'full'));
    expect(morningOrder('short', true)).toBe(getOrder('morning', 'short'));
  });
});
