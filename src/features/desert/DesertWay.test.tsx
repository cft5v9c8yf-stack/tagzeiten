// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { HUSBAND_PACK } from '../../content/desert';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { listedOn } from '../../domain/desert';
import { WAY_START_HABITS } from '../../domain/husbandWay';
import { activeRun } from '../../domain/winterArc';
import { resetOpenState } from '../../ui/collapseState';
import { ArenaPage } from '../arena/ArenaPage';
import { DesertChoice } from './DesertChoice';

beforeEach(() => {
  localStorage.clear();
  resetOpenState();
});
afterEach(cleanup);

const HALL = '/arena?bereich=wuestenwanderung';
let n = 0;
// Wednesday, 14 October 2026: no invitation of Advent yet.
let clock = new Date(2026, 9, 14, 7);

async function makeStore(wife = true) {
  const store = new Store({ db: new TagzeitenDB(`way-${++n}`), journal: memoryJournal(), now: () => clock });
  await store.load();
  if (wife) store.updateProfile((p) => ({ ...p, house: { ...p.house, wife: { name: 'Anna', concern: '' } } }), { immediate: true });
  return store;
}

async function renderArena(store: Store, path = HALL) {
  const router = createMemoryRouter(
    [
      { path: '/arena', element: <ArenaPage /> },
      { path: '/arena/:eintrag', element: <ArenaPage /> },
    ],
    { initialEntries: [path] },
  );
  render(
    <ToastProvider>
      <StoreProvider store={store}>
        <RouterProvider router={router} />
      </StoreProvider>
    </ToastProvider>,
  );
  await screen.findAllByRole('heading', { level: 2 });
  return router;
}

const openTile = (title: string) => fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${title}`) }));
const run = (s: Store) => activeRun(s.getProfile().winterArc)!;

describe('28 Tage für Ehemänner in the Wüstenwanderung', () => {
  beforeEach(() => {
    clock = new Date(2026, 9, 14, 7);
  });

  it('is not offered without a wife in "Mein Haus": neither the plan nor its package', async () => {
    const store = await makeStore(false);
    await renderArena(store);
    expect(screen.getByRole('button', { name: 'Wüstenzeit beginnen' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Einführung lesen und beginnen' })).toBeNull();
    cleanup();
    store.startDesert('2026-10-14', 40);
    render(
      <StoreProvider store={store}>
        <DesertChoice run={run(store)} />
      </StoreProvider>,
    );
    expect(await screen.findByRole('region', { name: 'Aufbruch' })).toBeTruthy();
    expect(screen.queryByRole('region', { name: '28 Tage für Ehemänner' })).toBeNull();
  });

  it('begins on any weekday by its own way in: the introduction, the first day, then the day of the plan', async () => {
    const store = await makeStore();
    await renderArena(store);
    expect(screen.getByRole('button', { name: 'Wüstenzeit beginnen' })).toBeTruthy();
    const invite = within(screen.getByRole('region', { name: '28 Tage für Ehemänner' }));
    expect(invite.getByText('Auszug · Manna · Sinai · Jordan')).toBeTruthy();
    fireEvent.click(invite.getByRole('button', { name: 'Einführung lesen und beginnen' }));
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByText(/Bruder, schön, dass du losgehst/)).toBeTruthy();
    expect(dialog.getByText('Dranbleiben bis ans Ziel')).toBeTruthy();
    // The plan brings its own days and its own Word: no length, no last day, no reading plan to choose.
    expect(dialog.queryByLabelText('Dauer in Kalendertagen')).toBeNull();
    expect(dialog.queryByLabelText('Letzter Tag')).toBeNull();
    expect(dialog.queryByRole('group', { name: 'Leseplan der Wüstenzeit' })).toBeNull();
    expect(dialog.getByText(/^Bis/).textContent).toBe('Bis Dienstag, 10. November 2026');
    fireEvent.click(dialog.getByRole('button', { name: 'Weg beginnen' }));
    const r = run(store);
    expect(r).toMatchObject({ way: 'husband', durationDays: 28, startDate: '2026-10-14', name: '28 Tage für Ehemänner', reading: 'none', wayIntroSeen: true });
    expect([...WAY_START_HABITS].every((id) => r.habits!.includes(id))).toBe(true);
    expect(r.habits!.filter((id) => HUSBAND_PACK.habits.find((h) => h.id === id)?.art === 'wahl')).toEqual([]);
    const day = within(await screen.findByRole('region', { name: 'Raus aus der Trägheit' }));
    const headings = day.getAllByRole('heading').map((h) => h.textContent);
    expect(headings).toEqual(['Raus aus der Trägheit', 'Schriftwort', 'Gedanke', 'Schritt', 'Frage', 'Gebet']);
    expect(day.getByText('1. Mo 3,6')).toBeTruthy();
    expect(day.queryByRole('link')).toBeNull(); // rule 13: references only
  });

  it('ticks the step, opens a journal entry from the question, and makes up for a missed day', async () => {
    const store = await makeStore();
    store.startDesert('2026-10-12', 40, [], '', 'none', 'husband');
    store.markWayIntroSeen(run(store).id);
    // Wednesday is day 3.
    const router = await renderArena(store);
    const day = () => within(document.getElementById('desert-way-day')!);
    expect(day().getByRole('heading', { name: 'Du bist der Mann' })).toBeTruthy();
    fireEvent.click(day().getByRole('checkbox'));
    expect(run(store).wayDone).toEqual([3]);

    // Day 1 was missed: it stays open in the overview, plain, and can be opened and ticked.
    openTile('28 Tage für Ehemänner');
    const days = screen.getAllByRole('listitem').filter((li) => li.closest('.desert-way-days'));
    expect(days).toHaveLength(28);
    expect(days.filter((li) => li.classList.contains('is-done'))).toHaveLength(1);
    expect(within(days[3]!).queryByRole('button')).toBeNull(); // day 4 lies ahead
    fireEvent.click(within(days[0]!).getByRole('button'));
    expect(day().getByRole('heading', { name: 'Raus aus der Trägheit' })).toBeTruthy();
    fireEvent.click(day().getByRole('checkbox'));
    expect(run(store).wayDone).toEqual([1, 3]);
    expect(store.getProfile().winterArc.runs[0]!.status).toBe('active');

    // The question opens an entry of the journal, kept with the day.
    fireEvent.click(day().getByRole('button', { name: 'Ins Tagebuch schreiben' }));
    const entry = store.getProfile().arena[0]!;
    expect(entry).toMatchObject({ kind: 'desert', wayRun: run(store).id, wayDay: 1 });
    expect(router.state.location.pathname).toBe(`/arena/${entry.id}`);
    expect(await screen.findByText('Wo schaue ich in unserer Ehe nur zu?')).toBeTruthy();
    expect(screen.getByText(/So wir aber unsre Sünden bekennen/)).toBeTruthy();
    // The same day opens the same entry again.
    expect(store.openWayEntry(run(store).id, 1)).toBe(entry.id);
  });

  it('chooses at most two of those "zur Wahl"', async () => {
    const store = await makeStore();
    store.startDesert('2026-10-14', 28, [], '', 'none', 'husband');
    render(
      <StoreProvider store={store}>
        <DesertChoice run={run(store)} />
      </StoreProvider>,
    );
    const pack = within(await screen.findByRole('region', { name: '28 Tage für Ehemänner' }));
    const box = (name: string) => pack.getByRole('checkbox', { name }) as HTMLInputElement;
    expect(box('Morgensegen gebetet').checked).toBe(true);
    expect(box('Hausandacht gehalten').checked).toBe(true);
    fireEvent.click(box('Augen und Gedanken gehütet'));
    cleanup();
    render(
      <StoreProvider store={store}>
        <DesertChoice run={run(store)} />
      </StoreProvider>,
    );
    fireEvent.click(within(await screen.findByRole('region', { name: '28 Tage für Ehemänner' })).getByRole('checkbox', { name: 'Hausandacht gehalten' }));
    cleanup();
    store.chooseDesert(run(store).id, [HUSBAND_PACK.habits.find((h) => h.name === 'Hausandacht gehalten')!], true);
    store.chooseDesert(run(store).id, [HUSBAND_PACK.habits.find((h) => h.name === 'Zärtlich gewesen, ohne etwas zu erwarten')!], true);
    render(
      <StoreProvider store={store}>
        <DesertChoice run={run(store)} />
      </StoreProvider>,
    );
    const again = within(await screen.findByRole('region', { name: '28 Tage für Ehemänner' }));
    expect((again.getByRole('checkbox', { name: 'Eine Aufgabe im Haus ungefragt übernommen' }) as HTMLInputElement).disabled).toBe(true);
    expect((again.getByRole('checkbox', { name: 'Augen und Gedanken gehütet' }) as HTMLInputElement).disabled).toBe(false);
  });

  it('shows only its own package, and ends the choice with a button', async () => {
    const store = await makeStore();
    store.startDesert('2026-10-14', 28, [], '', 'none', 'husband');
    let done = 0;
    render(
      <StoreProvider store={store}>
        <DesertChoice run={run(store)} onDone={() => done++} />
      </StoreProvider>,
    );
    const regions = (await screen.findAllByRole('region')).map((r) => r.getAttribute('aria-label'));
    expect(regions).toEqual(['28 Tage für Ehemänner']);
    expect(screen.queryByText(/Wähle ein Paket als Startpunkt/)).toBeNull();
    // Open, for its habits are chosen; the line beside the name says how many.
    expect(screen.getByRole('button', { name: /^28 Tage für Ehemänner/ }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/8 gewählt/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Auswahl abschließen' }));
    expect(done).toBe(1);
  });

  it('ticks daily habits each day and weekly ones once a week', async () => {
    const store = await makeStore();
    store.startDesert('2026-10-12', 28, [], '', 'none', 'husband');
    const habit = (name: string) => store.getProfile().habits.find((h) => h.name === name)!;
    const lookup = (d: string) => store.getDay(d);
    store.toggleHabit('2026-10-14', habit('Morgensegen gebetet'));
    expect(listedOn(habit('Morgensegen gebetet'), '2026-10-15', lookup)).toBe(true);
    store.toggleHabit('2026-10-14', habit('Hausandacht gehalten'));
    // Ticked on Wednesday: the weekly one stands no more on Thursday, but again next week.
    expect(listedOn(habit('Hausandacht gehalten'), '2026-10-15', lookup)).toBe(false);
    expect(listedOn(habit('Hausandacht gehalten'), '2026-10-19', lookup)).toBe(true);
  });

  it('after day 28 closes simply, with the own entries to read again', async () => {
    const store = await makeStore();
    store.startDesert('2026-09-16', 28, [], '', 'none', 'husband');
    const id = run(store).id;
    store.markWayIntroSeen(id);
    store.toggleWayStep(id, 2);
    const e = store.openWayEntry(id, 16);
    store.updateArenaEntry(e, (x) => ({ ...x, text: 'Was ich lieber erkläre.' }));
    // 14 October is the day after the last (13 October).
    await renderArena(store);
    expect(screen.getByRole('heading', { name: 'Die Wüstenzeit ist zu Ende' })).toBeTruthy();
    const closing = within(screen.getByRole('region', { name: 'Dein Weg' }));
    expect(closing.getByText('Die 28 Tage sind vorbei. An einem Tag hast du den Schritt abgehakt.')).toBeTruthy();
    expect(closing.getByRole('link', { name: 'Tag 16 · Bekennen' })).toBeTruthy();
    expect(closing.getByText('Was ich lieber erkläre.')).toBeTruthy();
    expect(closing.getByText(/So wir aber unsre Sünden bekennen/)).toBeTruthy();
  });

  it('keeps everything on the device: the plan comes back after a reload', async () => {
    const db = `way-reload-${++n}`;
    const first = new Store({ db: new TagzeitenDB(db), journal: memoryJournal(), now: () => clock });
    await first.load();
    first.startDesert('2026-10-14', 28, [], '', 'none', 'husband');
    first.toggleWayStep(run(first).id, 1);
    first.openWayEntry(run(first).id, 1);
    first.updateArenaEntry(first.getProfile().arena[0]!.id, (x) => ({ ...x, text: 'Notiz' }));
    await act(() => first.flush());
    const second = new Store({ db: new TagzeitenDB(db), journal: memoryJournal(), now: () => clock });
    await second.load();
    expect(run(second)).toMatchObject({ way: 'husband', wayDone: [1] });
    expect(second.getProfile().arena[0]).toMatchObject({ wayDay: 1, text: 'Notiz' });
  });
});
