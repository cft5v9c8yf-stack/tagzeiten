// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { normalizeArena } from '../../domain/arena';
import { resetOpenState } from '../../ui/collapseState';
import { SettingsPage } from '../settings/SettingsPage';
import { ArenaPage } from './ArenaPage';

beforeEach(() => {
  localStorage.clear();
  resetOpenState();
});
afterEach(cleanup);

let n = 0;

/** From a place back to the Arena's entrance, and into another place. */
function goTo(place: string) {
  fireEvent.click(screen.getByRole('link', { name: 'Zurück: Arena' }));
  fireEvent.click(screen.getByRole('link', { name: new RegExp(`^${place}`) }));
}
async function renderArena() {
  const store = new Store({ db: new TagzeitenDB(`arena-${++n}`), journal: memoryJournal(), now: () => new Date(2026, 8, 26, 7) });
  await store.load();
  const router = createMemoryRouter(
    [
      { path: '/arena', element: <ArenaPage /> },
      { path: '/arena/:eintrag', element: <ArenaPage /> },
      { path: '/mehr/:bereich', element: <SettingsPage /> },
    ],
    { initialEntries: ['/arena?bereich=gebetskammer'] },
  );
  render(
    <ToastProvider>
      <StoreProvider store={store}>
        <RouterProvider router={router} />
      </StoreProvider>
    </ToastProvider>,
  );
  await screen.findAllByRole('heading', { level: 2 });
  return store;
}

describe('Arena', () => {
  it('says what it is for: struggle, not confession (rule 9)', async () => {
    await renderArena();
    expect(document.querySelector('.section-verse blockquote')!.textContent).toContain('Kampf des Glaubens');
    expect(document.querySelector('.arena-note')!.textContent).toContain('Sünde wird gebetet, nicht notiert');
  });

  it('moves between the fields with Tab and Shift+Tab, and with Enter in the title and in an empty line', async () => {
    await renderArena();
    fireEvent.click(screen.getByRole('button', { name: 'Neuen Eintrag schreiben' }));
    const title = await screen.findByLabelText('Titel');
    const verse = screen.getByLabelText('Bibelstelle 1');
    const concern = screen.getByLabelText('Gebetsanliegen 1');
    title.focus();
    fireEvent.keyDown(title, { key: 'Enter' });
    expect(document.activeElement).toBe(verse);
    fireEvent.keyDown(verse, { key: 'Tab' });
    expect(document.activeElement).toBe(concern);
    fireEvent.keyDown(concern, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(verse);
    // Enter in an empty line goes on to the next field.
    fireEvent.keyDown(verse, { key: 'Enter' });
    expect(document.activeElement).toBe(concern);
  });

  it('makes a new line with Enter in the verses and concerns, and takes an empty one out with Backspace', async () => {
    const store = await renderArena();
    fireEvent.click(screen.getByRole('button', { name: 'Neuen Eintrag schreiben' }));
    const first = await screen.findByLabelText('Gebetsanliegen 1');
    // An empty line adds nothing.
    fireEvent.keyDown(first, { key: 'Enter' });
    expect(screen.queryByLabelText('Gebetsanliegen 2')).toBeNull();
    fireEvent.change(first, { target: { value: 'Geduld' } });
    fireEvent.keyDown(first, { key: 'Enter' });
    const second = await screen.findByLabelText('Gebetsanliegen 2');
    await waitFor(() => expect(document.activeElement).toBe(second));
    fireEvent.keyDown(second, { key: 'Backspace' });
    await waitFor(() => expect(screen.queryByLabelText('Gebetsanliegen 2')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Gebetsanliegen 1')));
    await waitFor(() => expect(store.getProfile().arena[0]!.concerns).toEqual(['Geduld']));
  });

  it('writes an entry with several verses and concerns and a long text, under a word of comfort', async () => {
    const store = await renderArena();
    fireEvent.click(screen.getByRole('button', { name: 'Neuen Eintrag schreiben' }));
    const verse = await screen.findByLabelText('Bibelstelle 1');
    fireEvent.change(verse, { target: { value: 'Römer 8,37' } });
    fireEvent.click(screen.getByRole('button', { name: 'Weitere Bibelstelle hinzufügen' }));
    fireEvent.change(await screen.findByLabelText('Bibelstelle 2'), { target: { value: '1. Korinther 10,13' } });
    fireEvent.change(screen.getByLabelText('Gebetsanliegen 1'), { target: { value: 'Geduld mit den Kindern' } });
    fireEvent.click(screen.getByRole('button', { name: 'Weiteres Gebetsanliegen hinzufügen' }));
    fireEvent.change(await screen.findByLabelText('Gebetsanliegen 2'), { target: { value: 'Arbeit' } });
    fireEvent.change(screen.getByLabelText('Was dich bewegt'), { target: { value: 'Müde und gereizt.\nZweite Zeile.' } });
    await waitFor(() => expect(store.getProfile().arena[0]!.text).toBe('Müde und gereizt.\nZweite Zeile.'));
    const entry = store.getProfile().arena[0]!;
    expect(entry.verses).toEqual(['Römer 8,37', '1. Korinther 10,13']);
    expect(entry.concerns).toEqual(['Geduld mit den Kindern', 'Arbeit']);
    // References become links to the Bible (rule 13), and a word of comfort stands underneath.
    expect(screen.getAllByText('Römer 8,37').length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Römer 8,37' })).toBeNull();
    expect(screen.getByRole('complementary', { name: 'Zuspruch' }).textContent).toContain('Gott ist getreu');

    fireEvent.click(screen.getByRole('button', { name: 'Bibelstelle 2 entfernen' }));
    await waitFor(() => expect(store.getProfile().arena[0]!.verses).toEqual(['Römer 8,37']));

    fireEvent.click(screen.getByRole('button', { name: 'Sichern und zurück' }));
    const card = await screen.findByRole('link', { name: /Müde und gereizt\./ });
    expect(card.textContent).toContain('Römer 8,37');
  });

  it('deletes an entry after asking, and clears away entries left empty', async () => {
    const store = await renderArena();
    fireEvent.click(screen.getByRole('button', { name: 'Neuen Eintrag schreiben' }));
    fireEvent.change(await screen.findByLabelText('Was dich bewegt'), { target: { value: 'Etwas' } });
    fireEvent.click(screen.getByRole('button', { name: 'Löschen' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ja, Eintrag löschen' }));
    await screen.findByRole('heading', { level: 2, name: 'Gebetskammer' });
    expect(store.getProfile().arena).toEqual([]);

    store.addArenaEntry();
    store.addArenaEntry();
    expect(store.getProfile().arena).toHaveLength(1);
    expect(normalizeArena(store.getProfile().arena)).toEqual([]);
  });

  it('archives an entry into the Rückblick and brings it back', async () => {
    const store = await renderArena();
    fireEvent.click(screen.getByRole('button', { name: 'Neuen Eintrag schreiben' }));
    fireEvent.change(await screen.findByLabelText('Was dich bewegt'), { target: { value: 'Ein alter Kampf' } });
    fireEvent.click(screen.getByRole('button', { name: 'Archivieren' }));
    await screen.findByRole('heading', { level: 2, name: 'Gebetskammer' });
    expect(store.getProfile().arena[0]!.archivedAt).toBeTypeOf('number');
    expect(screen.queryByRole('link', { name: /Ein alter Kampf/ })).toBeNull();

    fireEvent.click(screen.getByRole('link', { name: 'Archivierte Einträge im Rückblick' }));
    await screen.findByRole('heading', { level: 2, name: /Rückblick/ });
    expect(screen.getByRole('button', { name: 'Arena' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('1 archivierter Eintrag')).toBeTruthy();
    // A list like the days, under the month it was written in, not a tile.
    const link = screen.getByRole('link', { name: /Ein alter Kampf/ });
    expect(link.closest('li.archive-item')).toBeTruthy();
    expect(document.querySelector('.arena-card')).toBeNull();
    const month = link.closest('section')!.querySelector('h4')!.textContent!;
    expect(month).toMatch(/^[A-ZÄ][a-zä]+$/);
    fireEvent.click(link);

    expect(await screen.findByText(/Steht im Rückblick/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Zurückholen' }));
    await screen.findByRole('heading', { level: 2, name: 'Gebetskammer' });
    expect(store.getProfile().arena[0]!.archivedAt).toBeUndefined();
    expect(screen.getByRole('link', { name: /Ein alter Kampf/ })).toBeTruthy();
  });

  it('has the Eisenschmiede: concerns for the meeting with the brothers, apart from the journal', async () => {
    const store = await renderArena();
    goTo('Eisenschmiede');
    expect(await screen.findByText(/Ein Messer wetzt das andere/)).toBeTruthy();
    expect(document.querySelector('.arena-note')!.textContent).toContain('Treffen mit deinen Brüdern');
    fireEvent.click(screen.getByRole('button', { name: 'Anliegen fürs Treffen aufschreiben' }));
    fireEvent.change(await screen.findByLabelText('Punkt 1'), { target: { value: 'Entscheidung im Beruf' } });
    fireEvent.change(screen.getByLabelText('Gebetsanliegen 1'), { target: { value: 'Weisheit' } });
    // Long concerns and points wrap and grow instead of running out of the field.
    expect(screen.getByLabelText('Gebetsanliegen 1').tagName).toBe('TEXTAREA');
    expect(screen.getByLabelText('Punkt 1').tagName).toBe('TEXTAREA');
    expect(screen.getByRole('complementary', { name: 'Zuspruch' }).textContent).toContain('Einer trage des andern Last');
    await waitFor(() => expect(store.getProfile().arena[0]).toMatchObject({ kind: 'forge', points: [{ text: 'Entscheidung im Beruf', done: false }] }));

    fireEvent.click(screen.getByRole('link', { name: 'Zurück: Eisenschmiede' }));
    // Named by its meeting only; this one has no date yet.
    expect(await screen.findByRole('link', { name: 'Treffen noch ohne Termin' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Entscheidung im Beruf/ })).toBeNull();
    // The journal does not show it.
    goTo('Gebetskammer');
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Treffen noch ohne Termin' })).toBeNull());

    // After the meeting: discussed and archived.
    goTo('Eisenschmiede');
    fireEvent.click(await screen.findByRole('link', { name: 'Treffen noch ohne Termin' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Archivieren' }));
    await waitFor(() => expect(store.getProfile().arena[0]!.archivedAt).toBeTypeOf('number'));
  });

  it('assigns concerns to a meeting, names them by it, and suggests the next one', async () => {
    const store = await renderArena();
    goTo('Eisenschmiede');
    fireEvent.click(await screen.findByRole('button', { name: 'Anliegen fürs Treffen aufschreiben' }));
    fireEvent.change(await screen.findByLabelText('Für das Treffen am'), { target: { value: '2026-10-01' } });
    fireEvent.change(screen.getByLabelText('Punkt 1'), { target: { value: 'Erstes' } });
    await waitFor(() => expect(store.getProfile().arena[0]).toMatchObject({ meetingDate: '2026-10-01', points: [{ text: 'Erstes', done: false }] }));

    // The next concern belongs to the same meeting without asking.
    fireEvent.click(screen.getByRole('link', { name: 'Zurück: Eisenschmiede' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Anliegen fürs Treffen aufschreiben' }));
    expect(((await screen.findByLabelText('Für das Treffen am')) as HTMLInputElement).value).toBe('2026-10-01');
    fireEvent.change(screen.getByLabelText('Punkt 1'), { target: { value: 'Zweites' } });
    fireEvent.click(screen.getByRole('link', { name: 'Zurück: Eisenschmiede' }));

    expect(await screen.findAllByRole('link', { name: 'Treffen am Donnerstag, 1. Oktober' })).toHaveLength(2);
    fireEvent.click(screen.getAllByRole('link', { name: 'Treffen am Donnerstag, 1. Oktober' })[0]!);
    expect(await screen.findByRole('heading', { level: 2, name: 'Treffen am Donnerstag, 1. Oktober' })).toBeTruthy();
  });

  it('keeps the points for the meeting as a list: Enter or + for the next, a tick when spoken of', async () => {
    const store = await renderArena();
    goTo('Eisenschmiede');
    fireEvent.click(await screen.findByRole('button', { name: 'Anliegen fürs Treffen aufschreiben' }));
    const first = await screen.findByLabelText('Punkt 1');
    fireEvent.change(first, { target: { value: 'Beruf' } });
    fireEvent.keyDown(first, { key: 'Enter' });
    const second = await screen.findByLabelText('Punkt 2');
    await waitFor(() => expect(document.activeElement).toBe(second));
    fireEvent.change(second, { target: { value: 'Ehe' } });
    fireEvent.click(screen.getByRole('button', { name: 'Weiteren Punkt hinzufügen' }));
    fireEvent.change(await screen.findByLabelText('Punkt 3'), { target: { value: 'Gemeinde' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Punkt 1 besprochen' }));
    await waitFor(() =>
      expect(store.getProfile().arena[0]!.points).toEqual([
        { text: 'Beruf', done: true },
        { text: 'Ehe', done: false },
        { text: 'Gemeinde', done: false },
      ]),
    );
    // Backspace on an empty point takes it out again.
    fireEvent.keyDown(screen.getByLabelText('Punkt 3'), { key: 'Enter' });
    fireEvent.keyDown(await screen.findByLabelText('Punkt 4'), { key: 'Backspace' });
    await waitFor(() => expect(screen.queryByLabelText('Punkt 4')).toBeNull());
    // The journal keeps its free text.
    expect(screen.queryByLabelText('Was dich bewegt')).toBeNull();
  });
});

describe('Titles and pinned entries', () => {
  it('names an entry by its title in the list instead of the first line', async () => {
    const store = await renderArena();
    fireEvent.click(screen.getByRole('button', { name: 'Neuen Eintrag schreiben' }));
    fireEvent.change(await screen.findByLabelText('Titel'), { target: { value: 'Geduld' } });
    fireEvent.change(screen.getByLabelText('Was dich bewegt'), { target: { value: 'Müde und gereizt.' } });
    await waitFor(() => expect(store.getProfile().arena[0]!.title).toBe('Geduld'));
    fireEvent.click(screen.getByRole('button', { name: 'Sichern und zurück' }));
    expect(await screen.findByRole('link', { name: /Geduld/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Müde und gereizt/ })).toBeNull();

    // In the Eisenschmiede the title stands over the meeting.
    goTo('Eisenschmiede');
    fireEvent.click(await screen.findByRole('button', { name: 'Anliegen fürs Treffen aufschreiben' }));
    fireEvent.change(await screen.findByLabelText('Titel'), { target: { value: 'Beruf' } });
    fireEvent.click(screen.getByRole('link', { name: 'Zurück: Eisenschmiede' }));
    const card = await screen.findByRole('link', { name: /Beruf/ });
    expect(card.textContent).toContain('Treffen noch ohne Termin');
  });

  it('pins up to three entries of a place to the top; archiving takes the pin off', async () => {
    const store = await renderArena();
    for (const t of ['Eins', 'Zwei', 'Drei', 'Vier', 'Fünf']) {
      const id = store.addArenaEntry();
      store.updateArenaEntry(id, (e) => ({ ...e, text: t }));
    }
    // Newest first, until pinned.
    const titles = () => [...document.querySelectorAll('.arena-list .arena-card-title')].map((x) => x.textContent);
    await waitFor(() => expect(titles()).toEqual(['Fünf', 'Vier', 'Drei', 'Zwei', 'Eins']));

    const pin = async (t: string) => {
      fireEvent.click(screen.getByRole('link', { name: new RegExp(t) }));
      fireEvent.click(await screen.findByRole('button', { name: 'Anheften' }));
      fireEvent.click(screen.getByRole('link', { name: 'Zurück: Gebetskammer' }));
      await screen.findByRole('heading', { level: 2, name: 'Gebetskammer' });
    };
    await pin('Eins');
    await pin('Drei');
    await pin('Zwei');
    expect(titles()).toEqual(['Eins', 'Drei', 'Zwei', 'Fünf', 'Vier']);
    expect(document.querySelectorAll('.arena-list .ktag')).toHaveLength(3);

    // A fourth is not pinned; the place is full.
    fireEvent.click(screen.getByRole('link', { name: /Vier/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Anheften' }));
    expect(await screen.findByText('Oben stehen schon drei Einträge. Löse zuerst einen davon.')).toBeTruthy();
    expect(store.getProfile().arena.filter((e) => e.pinnedAt !== undefined)).toHaveLength(3);
    // The Eisenschmiede counts for itself.
    const forge = store.addArenaEntry('forge');
    store.updateArenaEntry(forge, (e) => ({ ...e, points: [{ text: 'Beruf', done: false }] }));
    expect(store.pinArenaEntry(forge, true)).toBe(true);

    // Taken off, it goes back among the others.
    fireEvent.click(screen.getByRole('link', { name: 'Zurück: Gebetskammer' }));
    fireEvent.click(await screen.findByRole('link', { name: /Drei/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Lösen' }));
    fireEvent.click(screen.getByRole('link', { name: 'Zurück: Gebetskammer' }));
    await waitFor(() => expect(titles()).toEqual(['Eins', 'Zwei', 'Fünf', 'Vier', 'Drei']));

    // Archived, it is no longer pinned, and stays so when brought back.
    const eins = store.getProfile().arena.find((e) => e.text === 'Eins')!;
    store.archiveArenaEntry(eins.id, true);
    expect(store.getProfile().arena.find((e) => e.id === eins.id)!.pinnedAt).toBeUndefined();
    store.archiveArenaEntry(eins.id, false);
    expect(store.getProfile().arena.find((e) => e.id === eins.id)!.pinnedAt).toBeUndefined();
  });

  it('pins, archives and deletes from the three dots beside an entry', async () => {
    const store = await renderArena();
    for (const t of ['Eins', 'Zwei']) {
      const id = store.addArenaEntry();
      store.updateArenaEntry(id, (e) => ({ ...e, text: t }));
    }
    const menu = async (t: string, item: string) => {
      fireEvent.click(await screen.findByRole('button', { name: `Aktionen für „${t}“` }));
      fireEvent.click(within(await screen.findByRole('menu')).getByRole('menuitem', { name: item }));
    };
    const titles = () => [...document.querySelectorAll('.arena-list .arena-card-title')].map((x) => x.textContent);
    await waitFor(() => expect(titles()).toEqual(['Zwei', 'Eins']));

    await menu('Eins', 'Oben anheften');
    await waitFor(() => expect(titles()).toEqual(['Eins', 'Zwei']));
    expect(await screen.findByText('Steht jetzt oben in der Gebetskammer')).toBeTruthy();
    expect(screen.queryByRole('menu')).toBeNull();

    // Escape closes the menu without doing anything.
    fireEvent.click(screen.getByRole('button', { name: 'Aktionen für „Eins“' }));
    expect(within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Nicht mehr anheften' })).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();

    await menu('Eins', 'Eintrag archivieren');
    await waitFor(() => expect(titles()).toEqual(['Zwei']));
    expect(store.getProfile().arena.find((e) => e.text === 'Eins')!.archivedAt).toBeTypeOf('number');

    // Deleting asks once more; "Behalten" keeps it.
    await menu('Zwei', 'Eintrag löschen');
    fireEvent.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Behalten' }));
    expect(screen.queryByRole('menu')).toBeNull();
    expect(titles()).toEqual(['Zwei']);
    await menu('Zwei', 'Eintrag löschen');
    fireEvent.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Ja, Eintrag löschen' }));
    await waitFor(() => expect(titles()).toEqual([]));
    expect(store.getProfile().arena.map((e) => e.text)).toEqual(['Eins']);

    // The Eisenschmiede has the same menu.
    const forge = store.addArenaEntry('forge');
    store.updateArenaEntry(forge, (e) => ({ ...e, points: [{ text: 'Beruf', done: false }] }));
    goTo('Eisenschmiede');
    await screen.findByRole('heading', { level: 2, name: 'Eisenschmiede' });
    await menu('Treffen noch ohne Termin', 'Besprochen – archivieren');
    await waitFor(() => expect(store.getProfile().arena.find((e) => e.id === forge)!.archivedAt).toBeTypeOf('number'));
  });

  it('has small icons at the top of an entry and no buttons with words below', async () => {
    const store = await renderArena();
    fireEvent.click(screen.getByRole('button', { name: 'Neuen Eintrag schreiben' }));
    fireEvent.change(await screen.findByLabelText('Was dich bewegt'), { target: { value: 'Oben' } });
    const bar = screen.getByRole('toolbar', { name: 'Eintrag' });
    expect(bar.querySelectorAll('svg')).toHaveLength(4);
    expect(document.querySelector('.arena-actions')).toBeNull();
    fireEvent.click(within(bar).getByRole('button', { name: 'Anheften' }));
    await waitFor(() => expect(within(bar).getByRole('button', { name: 'Lösen' }).getAttribute('aria-pressed')).toBe('true'));

    // Deleting asks right under the icons; "Behalten" keeps it.
    fireEvent.click(within(bar).getByRole('button', { name: 'Löschen' }));
    const ask = screen.getByRole('group', { name: 'Eintrag löschen?' });
    fireEvent.click(within(ask).getByRole('button', { name: 'Behalten' }));
    expect(screen.queryByRole('group', { name: 'Eintrag löschen?' })).toBeNull();

    fireEvent.click(within(bar).getByRole('button', { name: 'Sichern und zurück' }));
    fireEvent.click(await screen.findByRole('link', { name: /Oben/ }));
    const bar2 = await screen.findByRole('toolbar', { name: 'Eintrag' });
    fireEvent.click(within(bar2).getByRole('button', { name: 'Archivieren' }));
    await waitFor(() => expect(store.getProfile().arena[0]!.archivedAt).toBeTypeOf('number'));

    fireEvent.click(await screen.findByRole('link', { name: 'Archivierte Einträge im Rückblick' }));
    fireEvent.click(await screen.findByRole('link', { name: /Oben/ }));
    const bar3 = await screen.findByRole('toolbar', { name: 'Eintrag' });
    expect(within(bar3).queryByRole('button', { name: 'Anheften' })).toBeNull();
    fireEvent.click(within(bar3).getByRole('button', { name: 'Löschen' }));
    fireEvent.click(within(screen.getByRole('group', { name: 'Eintrag löschen?' })).getByRole('button', { name: 'Ja, Eintrag löschen' }));
    await waitFor(() => expect(store.getProfile().arena).toEqual([]));
  });

  it('keeps title and pin through a backup', () => {
    const [e] = normalizeArena([{ id: 'a', createdAt: 1, verses: [], concerns: [], text: '', title: 'Nur ein Titel', pinnedAt: 5 }]);
    expect(e).toMatchObject({ title: 'Nur ein Titel', pinnedAt: 5 });
    // A backup with more than three pins keeps the three pinned first.
    const many = normalizeArena(
      [1, 2, 3, 4].map((k) => ({ id: `p${k}`, createdAt: k, verses: [], concerns: [], text: 'x', pinnedAt: 10 - k })),
    );
    expect(many.filter((x) => x.pinnedAt !== undefined).map((x) => x.id).sort()).toEqual(['p2', 'p3', 'p4']);
    const [archived] = normalizeArena([{ id: 'b', createdAt: 1, verses: [], concerns: [], text: 'x', pinnedAt: 5, archivedAt: 6 }]);
    expect(archived!.pinnedAt).toBeUndefined();
  });
});

describe('Handwriting in the Gebetskammer', () => {
  it('switches to a page for the pencil and keeps strokes, pen and marker, with undo and eraser', async () => {
    const width = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 500 });
    try {
      const store = await renderArena();
      fireEvent.click(screen.getByRole('button', { name: 'Neuen Eintrag schreiben' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Handschrift' }));
      const page = await screen.findByRole('img', { name: 'Leere Seite für Handschrift' });
      // No red among the colours (rule 5).
      const colours = within(screen.getByRole('group', { name: 'Farbe' }))
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label'));
      expect(colours).toEqual(['Tinte', 'Gold', 'Blau']);

      const stroke = (x0: number, x1: number, y: number) => {
        fireEvent.pointerDown(page, { pointerId: 1, pointerType: 'pen', clientX: x0, clientY: y, pressure: 0.5 });
        fireEvent.pointerMove(page, { pointerId: 1, pointerType: 'pen', clientX: x1, clientY: y, pressure: 0.8 });
        fireEvent.pointerUp(page, { pointerId: 1, pointerType: 'pen', clientX: x1, clientY: y });
      };
      stroke(10, 100, 50);
      await waitFor(() => expect(store.getProfile().arena[0]!.ink).toHaveLength(1));
      const first = store.getProfile().arena[0]!.ink![0]!;
      expect(first.tool).toBe('pen');
      expect(first.color).toBe('ink');
      // On a page 1000 units wide, shown 500 px wide.
      expect(first.points.slice(0, 2)).toEqual([20, 100]);

      fireEvent.click(screen.getByRole('button', { name: 'Textmarker' }));
      fireEvent.click(screen.getByRole('button', { name: 'Gold' }));
      stroke(10, 100, 150);
      await waitFor(() => expect(store.getProfile().arena[0]!.ink).toHaveLength(2));
      expect(store.getProfile().arena[0]!.ink![1]).toMatchObject({ tool: 'marker', color: 'gold' });

      fireEvent.click(screen.getByRole('button', { name: 'Rückgängig' }));
      await waitFor(() => expect(store.getProfile().arena[0]!.ink).toHaveLength(1));

      fireEvent.click(screen.getByRole('button', { name: 'Radierer' }));
      stroke(50, 55, 50);
      await waitFor(() => expect(store.getProfile().arena[0]!.ink).toBeUndefined());

      stroke(10, 100, 50);
      await waitFor(() => expect(store.getProfile().arena[0]!.ink).toBeUndefined()); // the eraser still in hand
      fireEvent.click(screen.getByRole('button', { name: 'Stift' }));
      stroke(10, 100, 50);
      await waitFor(() => expect(store.getProfile().arena[0]!.ink).toHaveLength(1));
      fireEvent.click(screen.getByRole('button', { name: 'Sichern und zurück' }));
      expect(await screen.findByRole('link', { name: /Handschrift/ })).toBeTruthy();
    } finally {
      if (width) Object.defineProperty(HTMLElement.prototype, 'clientWidth', width);
    }
  });
});
