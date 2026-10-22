import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { THREE_KEYS, WREATH_FIELDS, MORNING_TEXT_FIELDS, EVENING_TEXT_FIELDS, emptyDay, type ArenaEntry, type Day } from '../domain/model';
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
    expect(store.getDay('2026-09-25').reading).toEqual({ planId: 'atnt-1-1', portions: { at: 0, nt: 0 }, done: false });
    store.setReadingDone('2026-09-25', true);
    expect(store.getProfile().plan.positions).toEqual({ at: 1, nt: 1 });
    store.ensureTodayReading(); // keeps today's portion
    expect(store.getDay('2026-09-25').reading!.portions).toEqual({ at: 0, nt: 0 });
    store.setReadingDone('2026-09-25', false);
    expect(store.getProfile().plan.positions).toEqual({ at: 0, nt: 0 });
    await store.flush();
  });

  it('lets an unread reading of today follow the plan when "2, 1, 1, 1 im Wechsel" becomes one chapter a day', async () => {
    const { db, store } = freshStore();
    await store.load();
    // As stored before 0.37.4: the alternation at 1. Mose 6–7, today's portion not yet read.
    store.setPlan('at2-nt1');
    store.setPlanPositions({ at: 4, nt: 7 });
    store.ensureTodayReading();
    await store.flush();
    const again = new Store({ db, debounceMs: 5, now: () => new Date(2026, 8, 25, 5, 0) });
    await again.load();
    expect(again.getProfile().plan).toMatchObject({ planId: 'atnt-1-1', positions: { at: 5, nt: 7 } });
    expect(again.getDay('2026-09-25').reading).toEqual({ planId: 'atnt-1-1', portions: { at: 5, nt: 7 }, done: false });
    await again.flush();
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
    store.updateProfile((p) => ({ ...p, prayer: { concerns: ['Haus', 'Mission'], daily: ['Haus'], weekly: { 1: ['Mission'] } } }));
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
    expect(other.getProfile().prayer).toEqual({ concerns: ['Haus', 'Mission'], daily: ['Haus'], weekly: { 1: ['Mission'] } });
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

describe('a new day while the app stays open', () => {
  it('redraws once when the date has changed, so Heute is today and not yesterday', async () => {
    let now = new Date(2026, 8, 25, 22, 0);
    const db = new TagzeitenDB(`test-${++n}`);
    dbs.push(db);
    const store = new Store({ db, journal: memoryJournal(), now: () => now });
    await store.load();
    let emitted = 0;
    store.subscribe(() => emitted++);
    expect(store.checkDayChange()).toBe(false);
    now = new Date(2026, 8, 26, 4, 10);
    expect(store.checkDayChange()).toBe(true);
    expect(store.today()).toBe('2026-09-26');
    expect(store.checkDayChange()).toBe(false);
    expect(emitted).toBe(1);
  });
});

describe('the Arena in its own table (v2)', () => {
  const entry = (id: string, createdAt: number, text: string): ArenaEntry => ({
    id,
    createdAt,
    updatedAt: createdAt,
    verses: [''],
    concerns: ['Geduld'],
    text,
    ink: [{ tool: 'pen', color: 'ink', points: [10, 10, 50, 20, 20, 60] }],
  });

  it('moves the entries of an older database out of the profile, keeping everything else', async () => {
    const name = `test-${++n}`;
    // A database as version 0.7 left it: the entries inside the profile.
    const old = new Dexie(name);
    old.version(1).stores({ profile: 'id', days: 'date, updatedAt' });
    await old.open();
    const profile = { ...(await (async () => {
      const s = new Store({ db: new TagzeitenDB(`seed-${n}`), journal: memoryJournal() });
      await s.load();
      s.db.close();
      return s.getProfile();
    })()), arena: [entry('a', 1000, 'älter'), entry('b', 2000, 'neuer')], armor: false };
    await old.table('profile').put({ ...profile, id: 'me' });
    await old.table('days').put({ ...fillDay(emptyDay('2026-09-24')) });
    old.close();

    const db = new TagzeitenDB(name);
    dbs.push(db);
    const store = new Store({ db, journal: memoryJournal() });
    await store.load();
    expect(store.getProfile().arena.map((e) => e.text)).toEqual(['neuer', 'älter']);
    expect(store.getProfile().arena[0]!.ink).toHaveLength(1);
    expect(store.getProfile().armor).toBe(false);
    expect(store.findDay('2026-09-24')).toBeDefined();
    expect(await db.arena.count()).toBe(2);
    expect('arena' in (await db.profile.get('me'))!).toBe(false);
  });

  it('writes only the entry that changed, not the profile, and removes deleted and empty entries', async () => {
    const { db, store } = freshStore();
    await store.load();
    const id = store.addArenaEntry();
    store.updateArenaEntry(id, (e) => ({ ...e, text: 'Was mich bewegt' }), { immediate: true });
    await store.flush();
    const profileRow = await db.profile.get('me');
    expect('arena' in profileRow!).toBe(false);
    expect((await db.arena.get(id))!.text).toBe('Was mich bewegt');

    const stamp = profileRow!.updatedAt;
    store.updateArenaEntry(id, (e) => ({ ...e, text: 'Weiter' }), { immediate: true });
    await store.flush();
    expect((await db.profile.get('me'))!.updatedAt).toBe(stamp);
    expect((await db.arena.get(id))!.text).toBe('Weiter');

    // A new entry left empty is not kept.
    const empty = store.addArenaEntry();
    await store.flush();
    expect(await db.arena.get(empty)).toBeUndefined();

    store.deleteArenaEntry(id);
    await store.flush();
    expect(await db.arena.count()).toBe(0);
  });

  it('recovers an unsaved entry from the journal', async () => {
    const { db } = freshStore();
    const journal = memoryJournal();
    journal.save([['arena:x', entry('x', 5000, 'noch nicht gespeichert')]]);
    const store = new Store({ db, journal });
    await store.load();
    expect(store.getProfile().arena.map((e) => e.id)).toEqual(['x']);
    expect((await db.arena.get('x'))!.text).toBe('noch nicht gespeichert');
  });

  it('keeps the entries through export, import and deleting everything', async () => {
    const { store } = freshStore();
    await store.load();
    store.updateProfile((p) => ({ ...p, arena: [entry('k', 3000, 'Gebetskammer')] }), { immediate: true });
    const backup = await store.exportBackup();
    expect(backup.profile.arena.map((e) => e.id)).toEqual(['k']);

    const { db: otherDb, store: other } = freshStore();
    await other.load();
    await other.importBackup(JSON.stringify(backup));
    expect(await otherDb.arena.count()).toBe(1);
    expect('arena' in (await otherDb.profile.get('me'))!).toBe(false);
    expect(other.getProfile().arena[0]!.text).toBe('Gebetskammer');

    await other.deleteAll();
    expect(await otherDb.arena.count()).toBe(0);
    expect(other.getProfile().arena).toEqual([]);
  });

  it('keeps the entries of the Wüstenwanderung through export, import and deleting, with their kind and pin', async () => {
    const { store } = freshStore();
    await store.load();
    const id = store.addArenaEntry('desert');
    store.updateArenaEntry(id, (e) => ({ ...e, title: 'Still', text: 'Aus der Wüste' }), { immediate: true });
    store.pinArenaEntry(id, true);
    const own = store.addArenaEntry();
    store.updateArenaEntry(own, (e) => ({ ...e, text: 'Gebetskammer' }), { immediate: true });
    const json = JSON.stringify(await store.exportBackup());
    expect(JSON.parse(json).format).toBe('tagzeiten');

    const { db: otherDb, store: other } = freshStore();
    await other.load();
    await other.importBackup(json);
    const kinds = other.getProfile().arena.map((e) => [e.text, e.kind]);
    expect(kinds).toContainEqual(['Aus der Wüste', 'desert']);
    expect(kinds).toContainEqual(['Gebetskammer', undefined]);
    expect(other.getProfile().arena.find((e) => e.kind === 'desert')!.pinnedAt).toBeDefined();
    expect(await otherDb.arena.count()).toBe(2);
    // Also in the Markdown export.
    expect(await other.exportMarkdown()).toContain(' · Wüstenwanderung');

    await other.deleteAll();
    expect(await otherDb.arena.count()).toBe(0);
  });

  it('loads a backup from before the entries of the Wüstenwanderung: entries without a kind stay the Gebetskammer\'s', async () => {
    const { store } = freshStore();
    await store.load();
    store.updateProfile((p) => ({ ...p, arena: [entry('k', 3000, 'alt')] }), { immediate: true });
    const backup = JSON.parse(JSON.stringify(await store.exportBackup()));
    for (const e of backup.profile.arena) delete e.kind;
    const { store: other } = freshStore();
    await other.load();
    await other.importBackup(JSON.stringify(backup));
    expect(other.getProfile().arena.map((e) => [e.id, e.kind])).toEqual([['k', undefined]]);
  });
});

describe('the reading of the Wüstenzeit (1.16)', () => {
  /** A store whose clock can be moved on. */
  async function clockStore(start: Date) {
    let now = start;
    const db = new TagzeitenDB(`test-${++n}`);
    dbs.push(db);
    const store = new Store({ db, journal: memoryJournal(), now: () => now });
    await store.load();
    return { store, db, set: (d: Date) => (now = d) };
  }

  it('rests the plan on the days of the Wüstenzeit only, and takes it up again where it stood', async () => {
    const { store, set } = await clockStore(new Date(2026, 8, 25, 5));
    store.setPlan('jahr');
    store.setPlanPositions({ jahr: 5, wueste: 12 });
    // Set up for Monday: the plan goes on until then.
    store.startDesert('2026-09-28', 3, []);
    expect(store.getProfile().plan.planId).toBe('jahr');
    set(new Date(2026, 8, 27, 5));
    store.checkDayChange();
    expect(store.getProfile().plan.planId).toBe('jahr');

    // The first day: "Bewährung und Nachfolge" from its first section; the plan before rests.
    set(new Date(2026, 8, 28, 5));
    store.checkDayChange();
    expect(store.getProfile().plan).toMatchObject({ planId: 'wueste-3', beforeDesert: 'jahr' });
    expect(store.getProfile().plan.positions).toMatchObject({ wueste: 0, jahr: 5 });
    store.ensureTodayReading();
    store.setReadingDone('2026-09-28', true);
    expect(store.getProfile().plan.positions.wueste).toBe(1);

    // The day after the last: back by itself, at the place it stood.
    set(new Date(2026, 9, 1, 5));
    store.checkDayChange();
    expect(store.getProfile().plan.planId).toBe('jahr');
    expect(store.getProfile().plan.positions.jahr).toBe(5);
    store.ensureTodayReading();
    expect(store.readingFor('2026-10-01').reading.planId).toBe('jahr');
  });

  it('follows the choice of reading at any time; another plan chosen under "Wort" becomes it', async () => {
    const { store } = await clockStore(new Date(2026, 8, 25, 5));
    store.setPlan('paulus-60');
    store.startDesert('2026-09-25', 40, []);
    const run = () => store.getProfile().winterArc.runs.at(-1)!;
    expect(store.getProfile().plan.planId).toBe('wueste-40');
    store.ensureTodayReading();
    store.setReadingDone('2026-09-25', true);

    store.setDesertReading(run().id, 'bible');
    expect(run().reading).toBe('bible');
    expect(store.getProfile().plan.planId).toBe('paulus-60');
    // Taken up again, it goes on where it stood in this Wüstenzeit.
    store.setDesertReading(run().id, 'desert');
    expect(run().reading).toBeUndefined();
    expect(store.getProfile().plan).toMatchObject({ planId: 'wueste-40', positions: { wueste: 1 } });
    store.setDesertReading(run().id, 'none');
    expect(run().reading).toBe('none');
    expect(store.getProfile().plan.planId).toBe('paulus-60');

    // Under "Wort": the plan of the Wüstenzeit, or another one, which becomes its reading.
    store.setPlan('wueste-40');
    expect(run().reading).toBeUndefined();
    store.setPlan('jahr');
    expect(run().reading).toBe('bible');
    expect(store.getProfile().plan.planId).toBe('jahr');

    // A new Wüstenzeit begins at the first section.
    store.startDesert('2026-09-25', 40, []);
    expect(store.getProfile().plan).toMatchObject({ planId: 'wueste-40', beforeDesert: 'jahr', positions: { wueste: 0 } });
    // Ended early: back by itself.
    store.endWinterArc();
    expect(store.getProfile().plan.planId).toBe('jahr');
  });

  it('keeps the plan of the Bible area, or shows no reading, if so chosen', async () => {
    const { store } = freshStore();
    await store.load();
    const before = store.getProfile().plan.planId;
    store.startDesert('2026-09-25', 40, [], '', 'bible');
    expect(store.getProfile().plan.planId).toBe(before);
    expect(store.getProfile().winterArc.runs[0]!.reading).toBe('bible');
    store.startDesert('2026-09-25', 40, [], '', 'none');
    expect(store.getProfile().plan.planId).toBe(before);
    expect(store.getProfile().winterArc.runs.at(-1)!.reading).toBe('none');
  });

  it('takes the plan up on load when the Wüstenzeit began while the app was closed', async () => {
    const { store, db, set } = await clockStore(new Date(2026, 8, 25, 5));
    store.startDesert('2026-09-27', 40, []);
    expect(store.getProfile().plan.planId).toBe('atnt-1-1');
    await store.flush();
    set(new Date(2026, 8, 27, 5));
    const again = new Store({ db, journal: memoryJournal(), now: () => new Date(2026, 8, 27, 5) });
    await again.load();
    expect(again.getProfile().plan).toMatchObject({ planId: 'wueste-40', beforeDesert: 'atnt-1-1' });
  });
});
