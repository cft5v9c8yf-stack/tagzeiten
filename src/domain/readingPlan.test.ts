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
  fixedAmounts,
  fixedPlanId,
  ownAmounts,
  ownPlanId,
  markRead,
  portionLabel,
  positionFor,
  isKnownPlan,
  sectionKind,
  sectionOf,
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

  it('labels portions', () => {
    expect(portionLabel(ot, ot.portions[0]!)).toBe('1. Mose 1–2');
    expect(portionLabel(nt, nt.portions[0]!)).toBe('Matthäus 1');
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

  it('encodes its amounts in the plan id and rejects unknown amounts', () => {
    expect(ownPlanId([{ unit: 'chapters', value: 3 }])).toBe('eigen-k3');
    expect(ownAmounts('eigen-m15')).toEqual([{ unit: 'minutes', value: 15 }]);
    expect(ownAmounts('eigen-k2.k1')).toEqual([
      { unit: 'chapters', value: 2 },
      { unit: 'chapters', value: 1 },
    ]);
    expect(ownAmounts('eigen-k7')).toBeUndefined();
    expect(ownAmounts('eigen-k1.k1.k1.k1.k1')).toBeUndefined();
    expect(ownAmounts('at2-nt1')).toBeUndefined();
    expect(getPlan('eigen-k99').def.id).toBe('at2-nt1');
  });

  it('reads several books side by side, each with its own chapters', () => {
    const p = getPlan('eigen-k2.k1');
    expect(p.tracks.map((t) => [t.def.id, t.def.label])).toEqual([
      ['bibel', '1. Lesung'],
      ['bibel2', '2. Lesung'],
    ]);
    expect(portionLabel(p.tracks[0]!, p.tracks[0]!.portions[0]!)).toBe('1. Mose 1–2');
    expect(portionLabel(p.tracks[1]!, p.tracks[1]!.portions[0]!)).toBe('1. Mose 1');
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

describe('Old and New Testament with other amounts', () => {
  it('keeps the base plan under its id and names other amounts', () => {
    expect(fixedPlanId({ at: 'base', nt: 1 })).toBe('at2-nt1');
    expect(fixedPlanId({ at: 3, nt: 2 })).toBe('atnt-3-2');
    expect(fixedAmounts('atnt-g-2')).toEqual({ at: 'base', nt: 2 });
    expect(fixedAmounts('atnt-7-1')).toBeUndefined();
  });

  it('reads so many chapters a day from each Testament', () => {
    const [at, nt] = getPlan('atnt-3-2').tracks;
    expect(portionLabel(at!, at!.portions[0]!)).toBe('1. Mose 1–3');
    expect(portionLabel(nt!, nt!.portions[0]!)).toBe('Matthäus 1–2');
    const [atBase] = getPlan('atnt-g-2').tracks;
    expect(atBase!.portions.slice(0, 2).map((p) => p.to - p.from + 1)).toEqual([2, 1]);
  });
});

describe('plans by sections (1.16)', () => {
  /** Every chapter of a track's sections in order, as "slug chapter"; parts of a chapter once. */
  const chapterList = (id: string) => {
    const t = getPlan(id).tracks[0]!;
    const out: string[] = [];
    for (const p of t.portions) {
      for (const q of [p, ...(p.more ?? [])]) {
        for (let c = q.from; c <= q.to; c++) {
          const key = `${t.def.books[q.book]!.slug} ${c}`;
          if (out[out.length - 1] !== key) out.push(key);
        }
      }
    }
    return out;
  };

  it('knows its ids and falls back for unknown ones', () => {
    expect(sectionKind('einsteiger')).toBe('beginner');
    expect(sectionKind('einsteiger-psalm')).toBe('beginner');
    expect(sectionKind('nt90')).toBe('nt90');
    expect(sectionKind('paulus-60')).toBe('paul');
    expect(sectionKind('paulus-9')).toBeUndefined();
    expect(sectionKind('paulus-116')).toBeUndefined();
    expect(sectionKind('johannes-offb')).toBe('john');
    expect(sectionKind('jahr')).toBe('year');
    expect(sectionKind('wueste-90')).toBe('desert');
    expect(sectionKind('wueste-366')).toBeUndefined();
    expect(isKnownPlan('wueste-7')).toBe(true);
    expect(isKnownPlan('paulus-200')).toBe(false);
    expect(getPlan('paulus-200').def.id).toBe('at2-nt1');
  });

  it('spreads the chapters evenly over the sections, in order, without gap', () => {
    const cases: [string, number, number][] = [
      ['einsteiger', 37, 37],
      ['nt90', 90, 260],
      ['johannes', 28, 28],
      ['johannes-offb', 50, 50],
      ['jahr', 365, 1189],
      ['paulus-40', 40, 115],
      ['paulus-60', 60, 115],
      ['paulus-115', 115, 115],
    ];
    for (const [id, sections, chapters] of cases) {
      const t = getPlan(id).tracks[0]!;
      expect(t.portions, id).toHaveLength(sections);
      expect(t.totalChapters, id).toBe(chapters);
      expect(chapterList(id), id).toHaveLength(chapters);
      const sizes = t.portions.map((p) => [p, ...(p.more ?? [])].reduce((s, q) => s + q.to - q.from + 1, 0));
      expect(Math.max(...sizes) - Math.min(...sizes), id).toBeLessThanOrEqual(1);
    }
    expect(chapterList('nt90')).toEqual(NT_BOOKS.flatMap((b) => Array.from({ length: b.chapters }, (_, i) => `${b.slug} ${i + 1}`)));
  });

  it('weaves the letters of Paul into Acts', () => {
    const books = chapterList('paulus-115').map((c) => c.replace(/ \d+$/, ''));
    const order = books.filter((b, i) => b !== books[i - 1]);
    expect(order).toEqual([
      'Apostelgeschichte', 'Galater', 'Apostelgeschichte', '1.Thessalonicher', '2.Thessalonicher', 'Apostelgeschichte',
      '1.Korinther', '2.Korinther', 'Römer', 'Apostelgeschichte', 'Epheser', 'Philipper', 'Kolosser', 'Philemon',
      '1.Timotheus', 'Titus', '2.Timotheus',
    ]);
    const list = chapterList('paulus-115');
    expect(list.indexOf('Apostelgeschichte 14') + 1).toBe(list.indexOf('Galater 1'));
    expect(list.indexOf('Galater 6') + 1).toBe(list.indexOf('Apostelgeschichte 15'));
    const t = getPlan('paulus-40').tracks[0]!;
    expect(portionLabel(t, t.portions[8]!)).toBe('Apostelgeschichte 18; 1. Thessalonicher 1');
  });

  it('adds a psalm a day to the beginners plan', () => {
    const p = getPlan('einsteiger-psalm');
    expect(p.tracks.map((t) => t.def.label)).toEqual(['Evangelium', 'Psalm']);
    expect(p.tracks[1]!.portions).toHaveLength(150);
    expect(getPlan('einsteiger').tracks).toHaveLength(1);
  });

  it('Bewährung und Nachfolge: temptation, Sermon on the Mount, John, James, 1 Peter, Hebrews', () => {
    const t = getPlan('wueste-40').tracks[0]!;
    expect(t.portions).toHaveLength(40);
    expect(chapterList('wueste-40')).toHaveLength(48);
    expect(portionLabel(t, t.portions[0]!)).toBe('Matthäus 4');
    expect(chapterList('wueste-40').slice(0, 5)).toEqual(['Matthäus 4', 'Matthäus 5', 'Matthäus 6', 'Matthäus 7', 'Johannes 1']);
    expect(chapterList('wueste-40').at(-1)).toBe('Hebräer 13');
    const order = [...new Set(chapterList('wueste-40').map((c) => c.replace(/ \d+$/, '')))];
    expect(order).toEqual(['Matthäus', 'Johannes', 'Jakobus', '1.Petrus', 'Hebräer']);
  });

  it('divides chapters by verses with more days than chapters, every verse once', () => {
    for (const days of [49, 90, 365]) {
      const t = getPlan(`wueste-${days}`).tracks[0]!;
      expect(t.portions).toHaveLength(days);
      expect(chapterList(`wueste-${days}`)).toHaveLength(48);
      // Parts of a chapter follow one another without gap or overlap.
      let last: { chapter: string; verse: number } | undefined;
      for (const p of t.portions) {
        const chapter = `${p.book} ${p.from}`;
        if (p.verses) {
          expect(p.verses[0]).toBe(last?.chapter === chapter ? last.verse + 1 : 1);
          expect(p.verses[1]).toBeGreaterThanOrEqual(p.verses[0]);
          last = { chapter, verse: p.verses[1] };
        } else last = undefined;
      }
    }
    const t = getPlan('wueste-90').tracks[0]!;
    expect(portionLabel(t, t.portions[0]!)).toBe('Matthäus 4,1–12');
    expect(portionLabel(t, t.portions[1]!)).toBe('Matthäus 4,13–25');
  });

  it('carries the place from 40 to 90 days of the Wüstenzeit', () => {
    const from = getPlan('wueste-40');
    const to = getPlan('wueste-90');
    const at = positionFor(from.tracks[0]!, 1, 3); // Johannes 3
    const pos = carryPositions(from, to, { wueste: at });
    expect(portionLabel(to.tracks[0]!, to.tracks[0]!.portions[pos.wueste!]!)).toBe('Johannes 3,1–18');
  });

  it('counts the section, and begins anew after the last', () => {
    const p = getPlan('johannes');
    const r = assignReading(p, { johannes: 27 });
    expect(sectionOf(p, r)).toEqual({ section: 28, sections: 28 });
    expect(markRead(p, r, { johannes: 27 }, true).positions.johannes).toBe(0);
    expect(sectionOf(getPlan('atnt-1-1'), assignReading(getPlan('atnt-1-1'), {}))).toBeUndefined();
  });
});
