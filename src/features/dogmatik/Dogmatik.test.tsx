// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { resetOpenState } from '../../ui/collapseState';
import { CatechismPage } from '../catechism/CatechismPage';
import { MorningPage } from '../morning/MorningPage';
import { DogmatikPage } from './DogmatikPage';

let n = 0;
beforeEach(() => {
  localStorage.clear();
  resetOpenState();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

async function renderAt(path: string, prepare?: (s: Store) => void) {
  const store = new Store({ db: new TagzeitenDB(`dogmatik-${++n}`), journal: memoryJournal(), now: () => new Date(2026, 9, 16, 9) });
  await store.load();
  prepare?.(store);
  const router = createMemoryRouter(
    [
      { path: '/katechismus', element: <CatechismPage /> },
      { path: '/katechismus/dogmatik', element: <DogmatikPage /> },
      { path: '/katechismus/dogmatik/:tag', element: <DogmatikPage /> },
      { path: '/andacht/morgen', element: <MorningPage /> },
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
  return { store, router };
}

describe('Dogmatik', () => {
  it('shows the plan on "Lehre" and opens today\'s section', async () => {
    const { router } = await renderAt('/katechismus');
    const card = (await screen.findByText('Leseplan aktiv')).closest('section') as HTMLElement;
    expect(within(card).getByText('Tag 47 von 365')).toBeTruthy();
    expect(within(card).getByRole('link', { name: 'Was ist das Fundament des Glaubens?' })).toBeTruthy();
    fireEvent.click(within(card).getByRole('link', { name: 'Heute lesen' }));
    expect(router.state.location.pathname).toBe('/katechismus/dogmatik/47');
  });

  it('reads a day: notes open under the paragraph, the translation on request, then "Gelesen"', async () => {
    const { store } = await renderAt('/katechismus/dogmatik/47');
    await screen.findByRole('heading', { level: 2, name: 'Was ist das Fundament des Glaubens?' });
    expect(screen.getByText(/Erbaut auf den Grund/)).toBeTruthy();
    expect(screen.queryByText('Der Schriftbeweis², I, 9. 10.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Fußnote 313' }));
    expect(screen.getByText('Der Schriftbeweis², I, 9. 10.')).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: 'Übersetzung zeigen' })[0]!);
    expect(screen.getByText(/Dieser Artikel \[von der Rechtfertigung\]/)).toBeTruthy();
    // Bible word, translation, core sentence and question are marked as additions.
    expect(screen.getAllByText('Ergänzung')).toHaveLength(4);
    // Nothing that counts days in a row (rule 4).
    expect(document.body.textContent).not.toMatch(/in Folge|Serie/);
    fireEvent.click(screen.getByRole('button', { name: 'Gelesen' }));
    expect(store.getProfile().dogmatik.read).toEqual({ 47: '2026-10-16' });
    expect(screen.getByText(/Gelesen am/)).toBeTruthy();
    expect(screen.getByText(/Woche 7 des Plans/)).toBeTruthy();
  });

  it('writes the thought to the question into the Gebetskammer', async () => {
    const { store } = await renderAt('/katechismus/dogmatik/47');
    fireEvent.change(await screen.findByLabelText('Deine Gedanken zur Frage'), { target: { value: 'Auf meine Werke.' } });
    fireEvent.click(screen.getByRole('button', { name: 'In die Gebetskammer schreiben' }));
    const entry = store.getProfile().arena[0]!;
    expect(entry.title).toBe('Dogmatik, Tag 47: Was ist das Fundament des Glaubens?');
    expect(entry.verses).toEqual(['Epheser 2,20']);
    expect(entry.text).toMatch(/Auf meine Werke\.$/);
  });

  it('searches the whole book', async () => {
    await renderAt('/katechismus/dogmatik');
    fireEvent.change(await screen.findByLabelText('Im Buch suchen'), { target: { value: 'Schriftbeweis' } });
    expect(await screen.findByRole('link', { name: /Was ist das Fundament/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Inhalt' }));
    expect(screen.getByRole('heading', { level: 3, name: 'Wesen und Begriff der Theologie' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 4, name: '11. Einteilungen der Theologie, als Lehre gefaßt' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 5, name: 'Primäre und sekundäre Fundamentallehren' })).toBeTruthy();
  });

  it('stands in the Stille Zeit after the Word when chosen', async () => {
    await renderAt('/andacht/morgen', (s) =>
      s.updateProfile((p) => ({ ...p, dogmatik: { ...p.dogmatik, when: 'morning' } }), { immediate: true }),
    );
    expect(await screen.findByRole('button', { name: /Dogmatik/ })).toBeTruthy();
  });
});
