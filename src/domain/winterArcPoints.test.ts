import { describe, expect, it } from 'vitest';
import {
  defaultWinterArcSettings,
  emptyWinterArc,
  normalizeWinterArc,
  startRun,
  toggleCheck,
  toggleMonthly,
  type WinterArcPoint,
} from './winterArc';
import { winterArcToMarkdown } from './winterArcMarkdown';
import { planPoints, pointsOf } from './winterArcPoints';

const own = (id: string, text: string, extra: Partial<WinterArcPoint> = {}): WinterArcPoint => ({
  id,
  text,
  rhythm: 'daily',
  block: 'morning',
  weekdays: [1, 2, 3, 4, 5, 6, 0],
  ...extra,
});

describe('the points of the rounds of the Streithalle (0.38)', () => {
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
    data = normalizeWinterArc({
      ...data,
      runs: data.runs.map((r) => ({ ...r, points: r.points!.map((p) => (p.id === 'own-2' ? { ...p, removed: true as const } : p)) })),
    });
    const md = winterArcToMarkdown(data, defaultWinterArcSettings()).join('\n');
    expect(md).toContain('## Herbst · 5.10.2026');
    expect(md).toContain('- Mo 5.10.: Psalm beten, Laufen');
    expect(md).toContain('**Fastentag:** Oktober');
    expect(md).toContain('**Opfer:** Oktober');
    expect(md.match(/Fastentag/g)).toHaveLength(1);
  });

  it('gives a Wüstenzeit no points of its own: its habits are the profile’s', () => {
    const run = { ...startRun(emptyWinterArc(), '2026-10-05', 40, 1, 'w').runs[0]!, habits: ['wz-psalm'] };
    expect(pointsOf(run, defaultWinterArcSettings())).toEqual([]);
  });
});
