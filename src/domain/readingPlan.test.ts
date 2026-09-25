import { describe, expect, it } from 'vitest';
import { ALL_BOOKS, NT_BOOKS, OT_BOOKS } from '../content/readingPlans';
import {
  assignReading,
  buildPortions,
  chaptersBefore,
  carryPositions,
  chaptersPerDay,
  getPlan,
  initialPositions,
  ownAmount,
  ownPlanId,
  markRead,
  portionLabel,
  portionUrl,
  positionFor,
} from './readingPlan';

const plan = getPlan('at2-nt1');
const [ot, nt] = plan.tracks;
if (!ot || !nt) throw new Error('plan must have two tracks');

describe('reading plan at2-nt1', () => {
  it('covers all 929 OT chapters in 745 portions', () => {
    expect(ot.totalChapters).toBe(929);
    expect(ot.portions).toHaveLength(745);
    expect(chaptersBefore(ot, ot.portions.length)).toBe(929);
  });

  it('covers all 260 NT chapters, one per portion', () => {
    expect(nt.totalChapters).toBe(260);
    expect(nt.portions).toHaveLength(260);
    expect(nt.portions.every((p) => p.from === p.to)).toBe(true);
  });

  it('never crosses a book boundary and leaves no gap', () => {
    for (const t of [ot, nt]) {
      const books = t.def.books;
      let expected = { book: 0, chapter: 1 };
      for (const p of t.portions) {
        const b = books[p.book];
        expect(b).toBeDefined();
        expect(p.from).toBeGreaterThanOrEqual(1);
        expect(p.to).toBeLessThanOrEqual(b!.chapters);
        expect(p.to).toBeGreaterThanOrEqual(p.from);
        expect({ book: p.book, chapter: p.from }).toEqual(expected);
        expected = p.to === b!.chapters ? { book: p.book + 1, chapter: 1 } : { book: p.book, chapter: p.to + 1 };
      }
      expect(expected).toEqual({ book: books.length, chapter: 1 });
    }
  });

  it('follows the 2-1-1-1 pattern within long books', () => {
    expect(ot.portions.slice(0, 5).map((p) => p.to - p.from + 1)).toEqual([2, 1, 1, 1, 2]);
  });

  it('shortens a portion at the end of a book instead of crossing it', () => {
    const lastOfGenesis = ot.portions.filter((p) => p.book === 0).at(-1)!;
    expect(lastOfGenesis.to).toBe(50);
    expect(ot.portions[ot.portions.indexOf(lastOfGenesis) + 1]).toMatchObject({ book: 1, from: 1 });
  });

  it('keeps Luther’s order of the NT books', () => {
    const names = NT_BOOKS.map((b) => b.name);
    expect(names.slice(-4)).toEqual(['Hebräer', 'Jakobus', 'Judas', 'Offenbarung']);
    expect(names.indexOf('3. Johannes')).toBeLessThan(names.indexOf('Hebräer'));
    expect(OT_BOOKS).toHaveLength(39);
    expect(NT_BOOKS).toHaveLength(27);
  });

  it('labels and links portions', () => {
    expect(portionLabel(ot, ot.portions[0]!)).toBe('1. Mose 1–2');
    expect(portionUrl(ot, ot.portions[0]!)).toBe('https://www.bibleserver.com/LUT/1.Mose1-2');
    expect(portionLabel(nt, nt.portions[0]!)).toBe('Matthäus 1');
    expect(portionUrl(nt, nt.portions[0]!)).toBe(`https://www.bibleserver.com/LUT/${encodeURIComponent('Matthäus')}1`);
  });

  it('finds the portion containing a chapter', () => {
    expect(positionFor(ot, 0, 1)).toBe(0);
    expect(positionFor(ot, 0, 2)).toBe(0);
    expect(positionFor(ot, 0, 3)).toBe(1);
    expect(positionFor(nt, 1, 1)).toBe(28);
  });

  it('only rebuilds a pattern from valid input', () => {
    expect(() => buildPortions(OT_BOOKS, [])).toThrow();
    expect(() => buildPortions(OT_BOOKS, [0])).toThrow();
  });
});

describe('advancing and resetting', () => {
  it('assigns the current position to a new day', () => {
    const r = assignReading(plan, { at: 5, nt: 7 });
    expect(r).toEqual({ planId: 'at2-nt1', portions: { at: 5, nt: 7 }, done: false });
  });

  it('moves on when read and back when unmarked', () => {
    const start = initialPositions(plan);
    const reading = assignReading(plan, start);
    const read = markRead(plan, reading, start, true);
    expect(read.positions).toEqual({ at: 1, nt: 1 });
    expect(read.reading.done).toBe(true);
    const unread = markRead(plan, read.reading, read.positions, false);
    expect(unread.positions).toEqual({ at: 0, nt: 0 });
    expect(unread.reading.done).toBe(false);
  });

  it('is idempotent', () => {
    const reading = assignReading(plan, { at: 3, nt: 3 });
    const once = markRead(plan, reading, { at: 3, nt: 3 }, true);
    const twice = markRead(plan, once.reading, once.positions, true);
    expect(twice.positions).toEqual({ at: 4, nt: 4 });
  });

  it('does not move back past a later day that was read', () => {
    const day1 = markRead(plan, assignReading(plan, { at: 0, nt: 0 }), { at: 0, nt: 0 }, true);
    const day2 = markRead(plan, assignReading(plan, day1.positions), day1.positions, true);
    expect(day2.positions).toEqual({ at: 2, nt: 2 });
    const undoDay1 = markRead(plan, day1.reading, day2.positions, false);
    expect(undoDay1.positions).toEqual({ at: 2, nt: 2 });
  });

  it('knows no backlog: skipped days simply continue at the next portion', () => {
    // Read on day 1, nothing for three days, then day 5 gets portion 1.
    const day1 = markRead(plan, assignReading(plan, { at: 0, nt: 0 }), { at: 0, nt: 0 }, true);
    const day5 = assignReading(plan, day1.positions);
    expect(day5.portions).toEqual({ at: 1, nt: 1 });
  });

  it('starts a new round after the last portion', () => {
    const last = { at: ot.portions.length - 1, nt: nt.portions.length - 1 };
    const r = markRead(plan, assignReading(plan, last), last, true);
    expect(r.positions).toEqual({ at: 0, nt: 0 });
    const back = markRead(plan, r.reading, r.positions, false);
    expect(back.positions).toEqual(last);
  });
});

describe('a plan of one own', () => {
  const book = (name: string) => ALL_BOOKS.find((b) => b.name === name)!;

  it('encodes its amount in the plan id and rejects unknown amounts', () => {
    expect(ownPlanId({ unit: 'chapters', value: 3 })).toBe('eigen-k3');
    expect(ownAmount('eigen-m15')).toEqual({ unit: 'minutes', value: 15 });
    expect(ownAmount('eigen-k7')).toBeUndefined();
    expect(ownAmount('at2-nt1')).toBeUndefined();
    expect(getPlan('eigen-k99').def.id).toBe('at2-nt1');
  });

  it('walks the whole Bible in chapters a day, never across a book', () => {
    const t = getPlan('eigen-k3').tracks[0]!;
    expect(t.totalChapters).toBe(1189);
    expect(portionLabel(t, t.portions[0]!)).toBe('1. Mose 1–3');
    expect(t.portions.every((p) => p.to - p.from < 3)).toBe(true);
    expect(portionLabel(t, t.portions.at(-1)!)).toBe('Offenbarung 22');
  });

  it('turns time into chapters by the length of the chapters in each book', () => {
    const a = { unit: 'minutes', value: 15 } as const;
    expect(chaptersPerDay(book('Psalm'), a)).toBeGreaterThan(chaptersPerDay(book('1. Mose'), a));
    expect(chaptersPerDay(book('Obadja'), { unit: 'minutes', value: 5 })).toBe(1);
    const t = getPlan('eigen-m15').tracks[0]!;
    expect(portionLabel(t, t.portions[0]!)).toBe('1. Mose 1–2');
  });

  it('carries the place to another amount and keeps the positions of the fixed plan', () => {
    const from = getPlan('eigen-k1');
    const to = getPlan('eigen-k2');
    const i = positionFor(from.tracks[0]!, 42, 5);
    const out = carryPositions(from, to, { at: 7, bibel: i });
    expect(out.at).toBe(7);
    expect(portionLabel(to.tracks[0]!, to.tracks[0]!.portions[out.bibel!]!)).toBe('Johannes 5–6');
  });
});
