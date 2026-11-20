import { describe, expect, it } from 'vitest';
import { newEntry } from './arena';
import { emptyDay, type Day, type Profile } from './model';
import { mergeStores } from './merge';
import { defaultProfile } from './profile';

const today = '2026-11-20';
const profile = (over: Partial<Profile> = {}): Profile => ({ ...defaultProfile(today), ...over });
const day = (date: string, updatedAt: number, note = ''): Day => ({
  ...emptyDay(date),
  evening: { ...emptyDay(date).evening, thanks: [note] },
  updatedAt,
});

describe('mergeStores', () => {
  it('keeps the days of both sides; on the same day the one changed last wins', () => {
    const r = mergeStores(
      { profile: profile(), days: [day('2026-11-01', 10, 'iPhone'), day('2026-11-02', 50, 'iPhone')] },
      { profile: profile(), days: [day('2026-11-02', 20, 'iPad'), day('2026-11-03', 30, 'iPad'), day('2026-11-01', 90, 'iPad')] },
      today,
    );
    expect(r.days.map((d) => [d.date, d.evening.thanks[0]])).toEqual([
      ['2026-11-01', 'iPad'],
      ['2026-11-02', 'iPhone'],
      ['2026-11-03', 'iPad'],
    ]);
    expect(r.count).toEqual({ added: 1, changed: 1, same: 1 });
  });

  it('keeps the local entry when both were changed at the same time', () => {
    const r = mergeStores(
      { profile: profile(), days: [day('2026-11-01', 10, 'hier')] },
      { profile: profile(), days: [day('2026-11-01', 10, 'dort')] },
      today,
    );
    expect(r.days[0]!.evening.thanks[0]).toBe('hier');
  });

  it('merges the Arena by entry, the one changed last wins', () => {
    const a = { ...newEntry(100, undefined, 'a'), text: 'alt' };
    const aNew = { ...a, text: 'neu', updatedAt: 200 };
    const b = { ...newEntry(150, undefined, 'b'), text: 'nur auf dem iPad' };
    const r = mergeStores({ profile: profile({ arena: [a] }), days: [] }, { profile: profile({ arena: [aNew, b] }), days: [] }, today);
    expect(Object.fromEntries(r.profile.arena.map((e) => [e.id, e.text]))).toEqual({ a: 'neu', b: 'nur auf dem iPad' });
  });

  it('takes the further position in each reading track, never a step back', () => {
    const p = profile();
    const [t1, t2] = Object.keys(p.plan.positions);
    const local = profile({ plan: { ...p.plan, positions: { ...p.plan.positions, [t1!]: 12, [t2!]: 3 } } });
    const other = profile({ plan: { ...p.plan, positions: { ...p.plan.positions, [t1!]: 7, [t2!]: 9 } }, updatedAt: 5 });
    const r = mergeStores({ profile: local, days: [] }, { profile: other, days: [] }, today);
    expect(r.profile.plan.positions[t1!]).toBe(12);
    expect(r.profile.plan.positions[t2!]).toBe(9);
  });

  it('takes the settings of the profile changed last and joins what was learned', () => {
    const local = profile({ updatedAt: 10, armor: false, catechism: { memorized: { a: true }, weekOffset: 0 } });
    const other = profile({ updatedAt: 20, armor: true, catechism: { memorized: { b: true }, weekOffset: 2 } });
    const r = mergeStores({ profile: local, days: [] }, { profile: other, days: [] }, today);
    expect(r.profile.armor).toBe(true);
    expect(r.profile.catechism).toEqual({ memorized: { a: true, b: true }, weekOffset: 2 });
    expect(r.profile.updatedAt).toBe(20);
  });

  it('keeps habits and answered prayers from both sides', () => {
    const base = profile();
    const own = { ...base.habits[0]!, id: 'own-x', name: 'Eigene', preset: false };
    const answered = { id: 'x', date: today, person: 'Anna', role: 'wife' as const, concern: 'Gesundheit' };
    const r = mergeStores({ profile: base, days: [] }, { profile: profile({ habits: [...base.habits, own], answered: [answered] }), days: [] }, today);
    expect(r.profile.habits.some((h) => h.id === 'own-x')).toBe(true);
    expect(r.profile.answered).toEqual([answered]);
  });

  it('keeps at most one Winter Arc round under way', () => {
    const run = (id: string, createdAt: number) => ({
      id,
      startDate: today,
      durationDays: 40,
      status: 'active' as const,
      createdAt,
      updatedAt: createdAt,
    });
    const wa = (r: ReturnType<typeof run>) => ({ ...defaultProfile(today).winterArc, runs: [r] });
    const r = mergeStores(
      { profile: profile({ winterArc: wa(run('a', 1)) }), days: [] },
      { profile: profile({ winterArc: wa(run('b', 2)) }), days: [] },
      today,
    );
    expect(r.profile.winterArc.runs.filter((x) => x.status === 'active').map((x) => x.id)).toEqual(['b']);
  });
});
