import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { activeRun } from '../domain/winterArc';
import { PROFILE_KEY, TagzeitenDB } from './db';
import { Store } from './store';

let n = 0;
const dbs: TagzeitenDB[] = [];
const names: string[] = [];

function freshStore(name = `wa-test-${++n}`, now = new Date(2026, 9, 5, 5, 0)) {
  const db = new TagzeitenDB(name);
  dbs.push(db);
  return { db, store: new Store({ db, debounceMs: 5, now: () => now }) };
}

afterEach(async () => {
  for (const db of dbs.splice(0)) {
    db.close();
    await db.delete();
  }
  for (const name of names.splice(0)) await Dexie.delete(name);
});

describe('the Wüstenzeit in the store', () => {
  it('turns a round of the Streithalle under way into a Wüstenzeit on loading, its ticks copied into the days', async () => {
    const name = `wa-convert-${++n}`;
    const { store } = freshStore(name);
    await store.load();
    store.startWinterArc('2026-09-28', 90, 'Herbst', [
      { id: 'pray', text: 'Psalm beten', rhythm: 'daily', block: 'morning', weekdays: [1, 2, 3, 4, 5, 6, 0] },
    ]);
    const old = activeRun(store.getProfile().winterArc)!;
    store.updateProfile(
      (p) => ({ ...p, winterArc: { ...p.winterArc, days: [{ runId: old.id, date: '2026-09-29', checks: { pray: true }, updatedAt: 1 }] } }),
      { immediate: true },
    );
    await store.flush();
    const again = new Store({ db: new TagzeitenDB(name), debounceMs: 5, now: () => new Date(2026, 9, 5, 5, 0) });
    await again.load();
    const run = activeRun(again.getProfile().winterArc)!;
    const id = `wz-${old.id}-pray`;
    expect(run.habits).toEqual([id]);
    expect(again.getProfile().habits.find((h) => h.id === id)).toMatchObject({ name: 'Psalm beten', desert: 'own' });
    expect(again.getDay('2026-09-29').habits[id]).toBe(true);
    await again.flush();
    // Stored: a third start finds the Wüstenzeit as it is, and turns nothing again.
    const third = new Store({ db: new TagzeitenDB(name), debounceMs: 5, now: () => new Date(2026, 9, 5, 5, 0) });
    await third.load();
    expect(activeRun(third.getProfile().winterArc)!.habits).toEqual([id]);
    expect(third.getProfile().habits.filter((h) => h.id === id)).toHaveLength(1);
    expect(third.getDay('2026-09-29').habits[id]).toBe(true);
  });
});

describe('Winter Arc in the store', () => {
  it('starts a round, ends it without deleting, and starts a new one', async () => {
    const { db, store } = freshStore();
    await store.load();
    store.startWinterArc('2026-10-05', 90);
    const first = activeRun(store.getProfile().winterArc)!;
    store.updateProfile(
      (p) => ({
        ...p,
        winterArc: {
          ...p.winterArc,
          days: [{ runId: first.id, date: '2026-10-05', checks: { wake: true }, updatedAt: 1 }],
          months: [{ runId: first.id, month: '2026-10', checks: { serve: true }, updatedAt: 1 }],
        },
      }),
      { immediate: true },
    );
    store.endWinterArc();
    await store.flush();
    expect(await db.winterArcRuns.get(first.id)).toMatchObject({ status: 'ended' });
    expect(await db.winterArcDays.count()).toBe(1);
    expect(await db.winterArcMonths.count()).toBe(1);

    store.startWinterArc('2027-01-04', 40);
    await store.flush();
    const runs = await db.winterArcRuns.toArray();
    expect(runs).toHaveLength(2);
    expect(runs.filter((r) => r.status === 'active').map((r) => r.durationDays)).toEqual([40]);
    expect(await db.winterArcDays.count()).toBe(1);
  });

  it('keeps the rounds out of the profile row and loads them again', async () => {
    const name = `wa-reload-${++n}`;
    const { db, store } = freshStore(name);
    await store.load();
    store.startWinterArc('2026-10-05', 60);
    await store.flush();
    expect(Object.keys((await db.profile.get(PROFILE_KEY))!)).not.toContain('winterArc');
    const again = new Store({ db, now: () => new Date(2026, 9, 6) });
    await again.load();
    expect(activeRun(again.getProfile().winterArc)).toMatchObject({ startDate: '2026-10-05', durationDays: 60 });
  });

  it('carries the rounds through backup and import, and deletes them with everything', async () => {
    const { db, store } = freshStore();
    await store.load();
    store.startWinterArc('2026-10-05', 90);
    const backup = JSON.stringify(await store.exportBackup());
    const { db: db2, store: other } = freshStore();
    await other.load();
    await other.importBackup(backup);
    expect(await db2.winterArcRuns.count()).toBe(1);
    expect(activeRun(other.getProfile().winterArc)?.durationDays).toBe(90);
    await store.deleteAll();
    expect(await db.winterArcRuns.count()).toBe(0);
  });

  it('upgrades a database of version 2 without touching what it holds', async () => {
    const name = `wa-upgrade-${++n}`;
    names.push(name);
    const old = new Dexie(name);
    old.version(2).stores({ profile: 'id', days: 'date, updatedAt', arena: 'id, updatedAt' });
    await old.table('profile').put({ id: PROFILE_KEY, armor: false, createdAt: '2026-01-01', updatedAt: 5 });
    await old.table('days').put({ date: '2026-09-01', updatedAt: 3, habits: { tablePrayer: true } });
    await old.table('arena').put({ id: 'e1', createdAt: 1, updatedAt: 1, verses: [''], concerns: [''], text: 'Kampf' });
    old.close();

    const db = new TagzeitenDB(name);
    expect(await db.profile.get(PROFILE_KEY)).toMatchObject({ armor: false, updatedAt: 5 });
    expect(await db.days.get('2026-09-01')).toMatchObject({ habits: { tablePrayer: true } });
    expect(await db.arena.get('e1')).toMatchObject({ text: 'Kampf' });
    expect(await db.winterArcRuns.count()).toBe(0);
    db.close();
  });
});
