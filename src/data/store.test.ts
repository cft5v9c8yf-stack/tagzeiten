import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { THREE_KEYS, WREATH_FIELDS, MORNING_TEXT_FIELDS, EVENING_TEXT_FIELDS, type Day } from '../domain/model';
import { TagzeitenDB } from './db';
import { memoryJournal } from './journal';
import { Store } from './store';

let n = 0;
const dbs: TagzeitenDB[] = [];

function freshStore(now = new Date(2026, 8, 25, 5, 0)) {
  const db = new TagzeitenDB(`test-${++n}`);
  dbs.push(db);
  const errors: unknown[] = [];
  const store = new Store({ db, debounceMs: 5, now: () => now, onError: (e) => errors.push(e) });
  return { db, store, errors };
}

afterEach(async () => {
  for (const db of dbs.splice(0)) {
    db.close();
    await db.delete();
  }
});

function fillDay(d: Day): Day {
  const x = structuredClone(d);
  MORNING_TEXT_FIELDS.forEach((f, i) => (x.morning[f] = `morgen-${f}-${i}`));
  WREATH_FIELDS.forEach((f) => (x.morning.wreath[f] = `kranz-${f}`));
  THREE_KEYS.forEach((k) => {
    x.morning.three[k] = `drei-${k}`;
    x.evening.marks[k] = 'minus';
    x.evening.carry[k] = 'again';
  });
  EVENING_TEXT_FIELDS.forEach((f) => (x.evening[f] = `abend-${f}`));
  x.evening.thanks = ['dank-1', 'dank-2', 'dank-3'];
  x.morning.done = true;
  x.habits = { tablePrayer: true };
  return x;
}

describe('Store', () => {
  it('loads only once, so later loads do not discard changes', async () => {
    const { store } = freshStore();
    await store.load();
    store.updateDay('2026-09-25', (d) => ({ ...d, habits: { tablePrayer: true } }));
    await store.load();
    expect(store.getDay('2026-09-25').habits.tablePrayer).toBe(true);
    await store.flush();
  });

  it('creates a default profile on first load', async () => {
    const { db, store } = freshStore();
    await store.load();
    expect(store.getProfile().habits.length).toBeGreaterThan(0);
    expect(await db.profile.count()).toBe(1);
    expect(store.allDays()).toEqual([]);
  });

  it('persists a debounced update and reloads it', async () => {
    const { db, store } = freshStore();
    await store.load();
    store.updateDay('2026-09-25', (d) => ({ ...d, morning: { ...d.morning, verse: 'Sei stille' } }));
    expect(store.getDay('2026-09-25').morning.verse).toBe('Sei stille');
    await store.flush();
    const again = new Store({ db });
    await again.load();
    expect(again.getDay('2026-09-25').morning.verse).toBe('Sei stille');
  });

  it('notifies subscribers on change', async () => {
    const { store } = freshStore();
    await store.load();
    let calls = 0;
    const off = store.subscribe(() => calls++);
    const v = store.getVersion();
    store.updateDay('2026-09-25', (d) => ({ ...d, habits: { tablePrayer: true } }), { immediate: true });
    expect(calls).toBe(1);
    expect(store.getVersion()).toBe(v + 1);
    off();
    await store.flush();
  });

  it('does not store a day that became empty again', async () => {
    const { db, store } = freshStore();
    await store.load();
    store.updateDay('2026-09-25', (d) => ({ ...d, habits: { tablePrayer: true } }), { immediate: true });
    await store.flush();
    expect(await db.days.count()).toBe(1);
    store.updateDay('2026-09-25', (d) => ({ ...d, habits: {} }), { immediate: true });
    await store.flush();
    expect(await db.days.count()).toBe(0);
  });

  it('assigns today’s reading once and moves the plan when read', async () => {
    const { store } = freshStore();
    await store.load();
    store.ensureTodayReading();
    expect(store.getDay('2026-09-25').reading).toEqual({ planId: 'at2-nt1', portions: { at: 0, nt: 0 }, done: false });
    store.setReadingDone('2026-09-25', true);
    expect(store.getProfile().plan.positions).toEqual({ at: 1, nt: 1 });
    store.ensureTodayReading(); // keeps today's portion
    expect(store.getDay('2026-09-25').reading!.portions).toEqual({ at: 0, nt: 0 });
    store.setReadingDone('2026-09-25', false);
    expect(store.getProfile().plan.positions).toEqual({ at: 0, nt: 0 });
    await store.flush();
  });

  it('shows past days without a reading the current position, without assigning it', async () => {
    const { store } = freshStore();
    await store.load();
    const { assigned } = store.readingFor('2026-09-20');
    expect(assigned).toBe(false);
    expect(store.findDay('2026-09-20')).toBeUndefined();
  });

  it('moves an unread reading of today along when the plan position is set', async () => {
    const { store } = freshStore();
    await store.load();
    store.ensureTodayReading();
    store.setPlanPositions({ at: 10 });
    expect(store.getDay('2026-09-25').reading!.portions).toEqual({ at: 10, nt: 0 });
    await store.flush();
  });

  it('switches to a plan of one own and back, carrying the place and keeping the other', async () => {
    const { store } = freshStore();
    await store.load();
    store.ensureTodayReading();
    store.setPlanPositions({ at: 5, nt: 3 });
    store.setPlan('eigen-k2');
    expect(store.getDay('2026-09-25').reading).toEqual({ planId: 'eigen-k2', portions: { bibel: 0 }, done: false });
    // Johannes (book 42 of 66) at chapter 5, then three chapters a day: still at chapter 5.
    store.setPlanPositions({ bibel: 474 });
    const at = store.getProfile().plan.positions.bibel!;
    store.setPlan('eigen-k3');
    const p = store.getProfile().plan;
    expect(p.planId).toBe('eigen-k3');
    expect(p.positions).toMatchObject({ at: 5, nt: 3 });
    expect(p.positions.bibel).not.toBe(at);
    store.setReadingDone('2026-09-25', true);
    store.setPlan('at2-nt1');
    expect(store.getProfile().plan).toMatchObject({ planId: 'at2-nt1', own: 'eigen-k3' });
    expect(store.getProfile().plan.positions).toMatchObject({ at: 5, nt: 3 });
    // Today was read in the other plan and stays as it was.
    expect(store.getDay('2026-09-25').reading!.planId).toBe('eigen-k3');
    // Unmarking a reading of an earlier plan leaves the current plan where it is.
    store.setReadingDone('2026-09-25', false);
    expect(store.getProfile().plan.positions).toMatchObject({ at: 5, nt: 3 });
    await store.flush();
  });

  it('exports every entry and imports it back unchanged', async () => {
    const { store } = freshStore();
    await store.load();
    store.updateDay('2026-09-24', fillDay);
    store.updateDay('2026-09-25', fillDay);
    store.updateProfile((p) => ({ ...p, prayer: { daily: 'Haus', weekly: { 1: 'Mission' } } }));
    const backup = await store.exportBackup();
    expect(backup.days.map((d) => d.date)).toEqual(['2026-09-24', '2026-09-25']);
    expect(backup.days[1]).toEqual(store.getDay('2026-09-25'));

    const md = await store.exportMarkdown();
    const day = store.getDay('2026-09-25');
    const texts = [
      ...MORNING_TEXT_FIELDS.map((f) => day.morning[f]!),
      ...WREATH_FIELDS.map((f) => day.morning.wreath[f]!),
      ...THREE_KEYS.map((k) => day.morning.three[k]!),
      ...EVENING_TEXT_FIELDS.map((f) => day.evening[f]!),
      ...day.evening.thanks,
    ];
    for (const t of texts) expect(md).toContain(t);
    expect(md).toContain('Tischgebet mit der Familie');

    const other = freshStore().store;
    await other.load();
    const res = await other.importBackup(JSON.stringify(backup));
    expect(res.days).toBe(2);
    expect(other.getDay('2026-09-25')).toEqual(store.getDay('2026-09-25'));
    expect(other.getProfile().prayer).toEqual({ daily: 'Haus', weekly: { 1: 'Mission' } });
  });

  it('rejects files that are not a backup', async () => {
    const { store } = freshStore();
    await store.load();
    await expect(store.importBackup('nope')).rejects.toThrow('kein gültiges JSON');
    await expect(store.importBackup('{"format":"other"}')).rejects.toThrow('keine Sicherung');
    await expect(store.importBackup('{"format":"tagzeiten","version":99}')).rejects.toThrow('neueren Version');
  });

  it('stashes unsaved changes synchronously when suspended', async () => {
    const journal = memoryJournal();
    const db = new TagzeitenDB(`test-${++n}`);
    dbs.push(db);
    const store = new Store({ db, journal, debounceMs: 60_000 });
    await store.load();
    store.updateDay('2026-09-25', (d) => ({ ...d, morning: { ...d.morning, verse: 'Ps 37,7' } }));
    const done = store.suspend();
    // Before anything was awaited, the change is already in the journal.
    expect(journal.entries.map(([k]) => k)).toEqual(['day:2026-09-25']);
    await done;
    expect(journal.entries).toEqual([]);
    expect((await db.days.get('2026-09-25'))?.morning.verse).toBe('Ps 37,7');
  });

  it('recovers stashed changes on the next start, but never older ones', async () => {
    const journal = memoryJournal();
    const db = new TagzeitenDB(`test-${++n}`);
    dbs.push(db);
    const first = new Store({ db, journal });
    await first.load();
    first.updateDay('2026-09-24', (d) => ({ ...d, morning: { ...d.morning, verse: 'neu in der DB' } }), { immediate: true });
    await first.flush();
    const stored = (await db.days.get('2026-09-24'))!;

    const lost = { ...stored, date: '2026-09-25', morning: { ...stored.morning, verse: 'nur im Journal' }, updatedAt: stored.updatedAt + 1 };
    const stale = { ...stored, morning: { ...stored.morning, verse: 'veraltet' }, updatedAt: stored.updatedAt - 1 };
    journal.save([
      ['day:2026-09-25', lost],
      ['day:2026-09-24', stale],
    ]);

    const second = new Store({ db, journal });
    await second.load();
    expect(second.getDay('2026-09-25').morning.verse).toBe('nur im Journal');
    expect(second.getDay('2026-09-24').morning.verse).toBe('neu in der DB');
    expect((await db.days.get('2026-09-25'))?.morning.verse).toBe('nur im Journal');
    expect(journal.entries).toEqual([]);
  });

  it('leaves an empty database after “Alles löschen”', async () => {
    const { db, store } = freshStore();
    await store.load();
    store.updateDay('2026-09-25', fillDay);
    store.updateDay('2026-09-24', fillDay); // still debounced when deleting
    await store.flush();
    store.updateDay('2026-09-23', fillDay);
    await store.deleteAll();
    await new Promise((r) => setTimeout(r, 20)); // the debounce would have fired by now
    expect(await db.days.count()).toBe(0);
    expect(await db.profile.count()).toBe(0);
    expect(store.allDays()).toEqual([]);
  });
});
