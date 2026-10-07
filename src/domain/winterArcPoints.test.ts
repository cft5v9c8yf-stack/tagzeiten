import { describe, expect, it } from 'vitest';
import { emptyHouse } from './house';
import {
  addPoint,
  defaultWinterArcSettings,
  editPoint,
  emptyWinterArc,
  isTicked,
  movePoint,
  movePointTo,
  normalizeWinterArc,
  removePoint,
  restorePoint,
  setPoints,
  shownPoints,
  startRun,
  toggleCheck,
  toggleMonthly,
  type WinterArcPoint,
} from './winterArc';
import { winterArcToMarkdown } from './winterArcMarkdown';
import { planPoints, planSuggestions, pointsOf, startPoints } from './winterArcPoints';

const own = (id: string, text: string, extra: Partial<WinterArcPoint> = {}): WinterArcPoint => ({
  id,
  text,
  rhythm: 'daily',
  block: 'morning',
  weekdays: [1, 2, 3, 4, 5, 6, 0],
  ...extra,
});

describe('the plan as the template of a round', () => {
  it('gives the plan’s fifteen points, by blocks of the day, with their days and marks', () => {
    const plan = planPoints();
    expect(plan.map((p) => p.id)).toEqual([
      'wake',
      'word',
      'journal',
      'train',
      'cook',
      'dinner',
      'wife',
      'kitchen',
      'phone',
      'night',
      'church',
      'talk',
      'date',
      'money',
      'serve',
    ]);
    expect(plan[0]).toEqual(own('wake', '04:00 auf, kein Handy'));
    expect(plan.find((p) => p.id === 'train')).toMatchObject({ weekdays: [1, 2, 3, 4, 5], offMark: 'Ruhe' });
    expect(plan.find((p) => p.id === 'cook')!.block).toBe('house');
    expect(plan.find((p) => p.id === 'wife')!.needs).toBe('wife');
    expect(plan.at(-1)).toEqual({ id: 'serve', text: 'Gedient (einmal im Monat)', rhythm: 'monthly' });
  });

  it('gives a round from before its points as they were set: times, weekdays, switched off', () => {
    const settings = defaultWinterArcSettings();
    settings.times.wake = '05:30';
    settings.weekdays.train = [1, 3, 5];
    settings.off = ['kitchen', 'serve'];
    const run = startRun(emptyWinterArc(), '2026-09-21', 90, 1, 'a').runs[0]!;
    const points = pointsOf(run, settings);
    expect(points[0]!.text).toBe('05:30 auf, kein Handy');
    expect(points.find((p) => p.id === 'train')!.weekdays).toEqual([1, 3, 5]);
    expect(points.filter((p) => p.removed).map((p) => p.id)).toEqual(['kitchen', 'serve']);
    // A round with its own points keeps them.
    const mine = startRun(emptyWinterArc(), '2026-09-21', 90, 1, 'b', '', [own('own-1', 'Psalm beten')]).runs[0]!;
    expect(pointsOf(mine, settings)).toEqual([own('own-1', 'Psalm beten')]);
  });

  it('begins a new round with the list of the round before, the plan, or nothing', () => {
    let data = startRun(emptyWinterArc(), '2026-06-01', 40, 1, 'a', '', [
      own('own-1', 'Psalm beten'),
      own('own-2', 'Laufen', { removed: true }),
    ]);
    const settings = defaultWinterArcSettings();
    expect(startPoints('last', data, settings)).toEqual([own('own-1', 'Psalm beten')]);
    expect(startPoints('plan', data, settings)).toEqual(planPoints());
    expect(startPoints('empty', data, settings)).toEqual([]);
    data = startRun(data, '2026-09-21', 90, 2, 'b', '', startPoints('last', data, settings));
    expect(data.runs[1]!.points).toEqual([own('own-1', 'Psalm beten')]);
  });

  it('offers the plan’s points the list does not hold, those taken out in their own words', () => {
    const points = [own('wake', '05:30 auf, kein Handy', { removed: true }), own('word', 'Morgenzeit')];
    const offered = planSuggestions(points);
    expect(offered).toHaveLength(14);
    expect(offered[0]).toMatchObject({ id: 'wake', text: '05:30 auf, kein Handy' });
    expect(offered.some((p) => p.id === 'word')).toBe(false);
  });
});

describe('a round’s own list', () => {
  it('adds a point in the user’s words at the end; without words nothing', () => {
    const points = addPoint([], { text: '  Mittagsgebet  ', rhythm: 'daily', block: 'work', weekdays: [1, 2, 3, 4, 5] }, 'own-1');
    expect(points).toEqual([{ id: 'own-1', text: 'Mittagsgebet', rhythm: 'daily', block: 'work', weekdays: [1, 2, 3, 4, 5] }]);
    expect(addPoint(points, { text: '   ', rhythm: 'weekly' }, 'own-2')).toEqual(points);
    // Weekly and monthly points have no block and no days.
    expect(addPoint([], { text: 'Brief an einen Bruder', rhythm: 'weekly', block: 'work' }, 'own-3')).toEqual([
      { id: 'own-3', text: 'Brief an einen Bruder', rhythm: 'weekly' },
    ]);
  });

  it('changes words, block and days; an emptied text keeps the old words', () => {
    let points = [own('a', 'Psalm beten')];
    points = editPoint(points, 'a', { text: 'Psalm 23 beten', block: 'house', weekdays: [6, 0] });
    expect(points[0]).toEqual(own('a', 'Psalm 23 beten', { block: 'house', weekdays: [6, 0] }));
    expect(editPoint(points, 'a', { text: '  ' })[0]!.text).toBe('Psalm 23 beten');
  });

  it('takes a point out for good if never ticked, otherwise out of sight with its ticks', () => {
    let data = startRun(emptyWinterArc(), '2026-09-21', 90, 1, 'r', '', [own('a', 'Psalm'), own('b', 'Laufen')]);
    data = toggleCheck(data, 'r', '2026-09-22', 'a', 2);
    const points = data.runs[0]!.points!;
    const ticked = isTicked(data, 'r', points[0]!);
    expect(ticked).toBe(true);
    expect(isTicked(data, 'r', points[1]!)).toBe(false);
    let next = removePoint(points, 'a', ticked);
    next = removePoint(next, 'b', false);
    expect(next).toEqual([own('a', 'Psalm', { removed: true })]);
    expect(shownPoints(next, emptyHouse())).toEqual([]);
    // Taken up again: back with its ticks, at the end of its group.
    data = setPoints(data, 'r', [...restorePoint(next, next[0]!), own('c', 'Lesen')], 3);
    expect(data.runs[0]!.points!.map((p) => [p.id, !!p.removed])).toEqual([
      ['a', false],
      ['c', false],
    ]);
    expect(data.days[0]!.checks).toEqual({ a: true });
  });

  it('sorts within the block or rhythm, past points taken out', () => {
    const points = [
      own('a', 'A'),
      own('x', 'X', { block: 'house' }),
      own('b', 'B', { removed: true }),
      own('c', 'C'),
      { id: 'w', text: 'W', rhythm: 'weekly' as const },
    ];
    expect(movePoint(points, 'c', 'up').map((p) => p.id)).toEqual(['c', 'x', 'b', 'a', 'w']);
    expect(movePoint(points, 'a', 'up')).toEqual(points);
    expect(movePointTo(points, 'a', 5).map((p) => p.id)).toEqual(['c', 'x', 'b', 'a', 'w']);
    expect(movePoint(points, 'w', 'down')).toEqual(points);
  });

  it('shows points about wife or children only once "Mein Haus" holds them', () => {
    const points = [own('a', 'Eine Geste für meine Frau', { needs: 'wife' }), own('b', 'Psalm')];
    expect(shownPoints(points, emptyHouse()).map((p) => p.id)).toEqual(['b']);
    const house = { ...emptyHouse(), wife: { ...emptyHouse().wife, name: 'Anna' } };
    expect(shownPoints(points, house).map((p) => p.id)).toEqual(['a', 'b']);
  });
});

describe('stored and imported rounds with their own lists', () => {
  it('keeps the points and the ticks that belong to them', () => {
    const data = normalizeWinterArc({
      runs: [
        {
          id: 'r',
          startDate: '2026-09-21',
          durationDays: 90,
          status: 'active',
          createdAt: 1,
          updatedAt: 1,
          points: [
            own('own-1', ' Psalm   beten '),
            { id: 'own-2', text: '', rhythm: 'daily' },
            { id: 'own-3', text: 'Fasten', rhythm: 'yearly' },
            { id: 'bad id', text: 'X', rhythm: 'weekly' },
            { id: 'own-4', text: 'Fastentag', rhythm: 'monthly' },
            { id: 'own-1', text: 'Doppelt', rhythm: 'weekly' },
          ] as never,
        },
        { id: 'old', startDate: '2026-06-01', durationDays: 40, status: 'ended', createdAt: 0, updatedAt: 0 },
      ],
      days: [
        { runId: 'r', date: '2026-09-22', checks: { 'own-1': true, wake: true }, updatedAt: 1 },
        { runId: 'old', date: '2026-06-02', checks: { wake: true, 'own-1': true }, updatedAt: 1 },
      ],
      weeks: [],
      months: [
        { runId: 'r', month: '2026-09', checks: { 'own-4': true, serve: true }, updatedAt: 1 },
        // Before 0.38 the monthly point was stored as served.
        { runId: 'old', month: '2026-06', served: true, updatedAt: 1 } as never,
      ],
    });
    expect(data.runs[0]!.points).toEqual([
      own('own-1', 'Psalm beten'),
      { id: 'own-4', text: 'Fastentag', rhythm: 'monthly' },
    ]);
    expect(data.runs[1]!.points).toBeUndefined();
    expect(data.days.map((d) => d.checks)).toEqual([{ 'own-1': true }, { wake: true }]);
    expect(data.months.map((m) => m.checks)).toEqual([{ 'own-4': true }, { serve: true }]);
  });

  it('writes every tick into the Markdown export, of points taken out too', () => {
    let data = startRun(emptyWinterArc(), '2026-10-05', 90, 1, 'r', 'Herbst', [
      own('own-1', 'Psalm beten'),
      own('own-2', 'Laufen'),
      { id: 'own-3', text: 'Fastentag', rhythm: 'monthly' },
      { id: 'own-4', text: 'Opfer', rhythm: 'monthly' },
    ]);
    data = toggleCheck(data, 'r', '2026-10-05', 'own-1', 2);
    data = toggleCheck(data, 'r', '2026-10-05', 'own-2', 2);
    data = toggleMonthly(data, 'r', '2026-10', 'own-3', 2);
    data = toggleMonthly(data, 'r', '2026-10', 'own-4', 2);
    data = setPoints(data, 'r', removePoint(data.runs[0]!.points!, 'own-2', true), 3);
    const md = winterArcToMarkdown(data, defaultWinterArcSettings()).join('\n');
    expect(md).toContain('## Herbst · 5.10.2026');
    expect(md).toContain('- Mo 5.10.: Psalm beten, Laufen');
    expect(md).toContain('**Fastentag:** Oktober');
    expect(md).toContain('**Opfer:** Oktober');
    expect(md.match(/Fastentag/g)).toHaveLength(1);
  });
});
