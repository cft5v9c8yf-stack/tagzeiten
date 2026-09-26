// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
async function renderArena() {
  const store = new Store({ db: new TagzeitenDB(`arena-${++n}`), journal: memoryJournal(), now: () => new Date(2026, 8, 26, 7) });
  await store.load();
  const router = createMemoryRouter(
    [
      { path: '/arena', element: <ArenaPage /> },
      { path: '/arena/:eintrag', element: <ArenaPage /> },
      { path: '/mehr/:bereich', element: <SettingsPage /> },
    ],
    { initialEntries: ['/arena'] },
  );
  render(
    <ToastProvider>
      <StoreProvider store={store}>
        <RouterProvider router={router} />
      </StoreProvider>
    </ToastProvider>,
  );
  await screen.findByRole('heading', { level: 2, name: 'Arena' });
  return store;
}

describe('Arena', () => {
  it('says what it is for: struggle, not confession (rule 9)', async () => {
    await renderArena();
    expect(document.querySelector('.section-verse blockquote')!.textContent).toContain('Kampf des Glaubens');
    expect(document.querySelector('.arena-note')!.textContent).toContain('Sünde wird gebetet, nicht notiert');
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
    expect(screen.getAllByRole('link', { name: 'Römer 8,37' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('complementary', { name: 'Zuspruch' }).textContent).toContain('Gott ist getreu');

    fireEvent.click(screen.getByRole('button', { name: 'Bibelstelle 2 entfernen' }));
    await waitFor(() => expect(store.getProfile().arena[0]!.verses).toEqual(['Römer 8,37']));

    fireEvent.click(screen.getByRole('button', { name: 'Eintrag sichern und zurück' }));
    const card = await screen.findByRole('link', { name: /Müde und gereizt\./ });
    expect(card.textContent).toContain('Römer 8,37');
  });

  it('deletes an entry after asking, and clears away entries left empty', async () => {
    const store = await renderArena();
    fireEvent.click(screen.getByRole('button', { name: 'Neuen Eintrag schreiben' }));
    fireEvent.change(await screen.findByLabelText('Was dich bewegt'), { target: { value: 'Etwas' } });
    fireEvent.click(screen.getByRole('button', { name: 'Eintrag löschen' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ja, Eintrag löschen' }));
    await screen.findByRole('heading', { level: 2, name: 'Arena' });
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
    fireEvent.click(screen.getByRole('button', { name: 'Eintrag archivieren' }));
    await screen.findByRole('heading', { level: 2, name: 'Arena' });
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
    fireEvent.click(screen.getByRole('button', { name: 'Zurück in die Arena holen' }));
    await screen.findByRole('heading', { level: 2, name: 'Arena' });
    expect(store.getProfile().arena[0]!.archivedAt).toBeUndefined();
    expect(screen.getByRole('link', { name: /Ein alter Kampf/ })).toBeTruthy();
  });

  it('has the Eisenschmiede: concerns for the meeting with the brothers, apart from the journal', async () => {
    const store = await renderArena();
    fireEvent.click(screen.getByRole('button', { name: 'Eisenschmiede' }));
    expect(await screen.findByText(/Ein Messer wetzt das andere/)).toBeTruthy();
    expect(document.querySelector('.arena-note')!.textContent).toContain('Treffen mit deinen Brüdern');
    fireEvent.click(screen.getByRole('button', { name: 'Anliegen fürs Treffen aufschreiben' }));
    fireEvent.change(await screen.findByLabelText('Punkt 1'), { target: { value: 'Entscheidung im Beruf' } });
    fireEvent.change(screen.getByLabelText('Gebetsanliegen 1'), { target: { value: 'Weisheit' } });
    expect(screen.getByRole('complementary', { name: 'Zuspruch' }).textContent).toContain('Einer trage des andern Last');
    await waitFor(() => expect(store.getProfile().arena[0]).toMatchObject({ kind: 'forge', points: [{ text: 'Entscheidung im Beruf', done: false }] }));

    fireEvent.click(screen.getByRole('link', { name: '‹ Eisenschmiede' }));
    expect(await screen.findByRole('link', { name: /Entscheidung im Beruf/ })).toBeTruthy();
    // The journal does not show it.
    fireEvent.click(screen.getByRole('button', { name: 'Gebetskammer' }));
    await waitFor(() => expect(screen.queryByRole('link', { name: /Entscheidung im Beruf/ })).toBeNull());

    // After the meeting: discussed and archived.
    fireEvent.click(screen.getByRole('button', { name: 'Eisenschmiede' }));
    fireEvent.click(await screen.findByRole('link', { name: /Entscheidung im Beruf/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Besprochen – archivieren' }));
    await waitFor(() => expect(store.getProfile().arena[0]!.archivedAt).toBeTypeOf('number'));
  });

  it('assigns concerns to a meeting, groups them by meeting, and suggests the next one', async () => {
    const store = await renderArena();
    fireEvent.click(screen.getByRole('button', { name: 'Eisenschmiede' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Anliegen fürs Treffen aufschreiben' }));
    fireEvent.change(await screen.findByLabelText('Für das Treffen am'), { target: { value: '2026-10-01' } });
    fireEvent.change(screen.getByLabelText('Punkt 1'), { target: { value: 'Erstes' } });
    await waitFor(() => expect(store.getProfile().arena[0]).toMatchObject({ meetingDate: '2026-10-01', points: [{ text: 'Erstes', done: false }] }));

    // The next concern belongs to the same meeting without asking.
    fireEvent.click(screen.getByRole('link', { name: '‹ Eisenschmiede' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Anliegen fürs Treffen aufschreiben' }));
    expect(((await screen.findByLabelText('Für das Treffen am')) as HTMLInputElement).value).toBe('2026-10-01');
    fireEvent.change(screen.getByLabelText('Punkt 1'), { target: { value: 'Zweites' } });
    fireEvent.click(screen.getByRole('link', { name: '‹ Eisenschmiede' }));

    const group = await screen.findByRole('region', { name: 'Treffen am Donnerstag, 1. Oktober' });
    expect(group.querySelectorAll('.arena-card')).toHaveLength(2);
  });

  it('keeps the points for the meeting as a list: Enter or + for the next, a tick when spoken of', async () => {
    const store = await renderArena();
    fireEvent.click(screen.getByRole('button', { name: 'Eisenschmiede' }));
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
