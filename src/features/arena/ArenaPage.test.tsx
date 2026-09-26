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
});
