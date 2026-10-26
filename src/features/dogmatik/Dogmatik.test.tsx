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

describe('Dogmatik', { timeout: 20000 }, () => {
  it('shows the plan on "Lehre" and opens today\'s section', async () => {
    const { router } = await renderAt('/katechismus');
    const card = (await screen.findByText('Leseplan', {}, { timeout: 8000 })).closest('section') as HTMLElement;
    expect(within(card).getByText('Jahr 1 · Tag 1 von 365')).toBeTruthy();
    expect(within(card).getByRole('link', { name: /Die Verständigung über den Standpunkt/ })).toBeTruthy();
    fireEvent.click(within(card).getByRole('link', { name: 'Heute lesen' }));
    expect(router.state.location.pathname).toBe('/katechismus/dogmatik/1-1');
    // Day 1 is read against the print; day 54 not yet, and says so.
    await screen.findByRole('heading', { level: 2, name: 'Die Verständigung über den Standpunkt (1 von 3)' });
    expect(screen.queryByText(/Noch nicht durchgesehen/)).toBeNull();
  });

  it('says of a day not yet read against the print that it may hold slips', async () => {
    await renderAt('/katechismus/dogmatik/1-54');
    expect(await screen.findByText(/Noch nicht durchgesehen/, {}, { timeout: 8000 })).toBeTruthy();
  });

  it('gives as many sections as fit into the time chosen', async () => {
    await renderAt('/katechismus', (s) =>
      s.updateProfile((p) => ({ ...p, dogmatik: { ...p.dogmatik, minuten: 15 } }), { immediate: true }),
    );
    const card = (await screen.findByText('Leseplan', {}, { timeout: 8000 })).closest('section') as HTMLElement;
    expect(within(card).getByText('Band 1 · Tag 1 von 365')).toBeTruthy();
    expect(within(card).getAllByRole('listitem').length).toBeGreaterThan(1);
    expect(within(card).getByText(/Zusammen etwa \d+ Minuten/)).toBeTruthy();
  });

  it('reads a day: notes open under the paragraph, the translation on request, then "Gelesen"', async () => {
    const { store } = await renderAt('/katechismus/dogmatik/1-47');
    await screen.findByRole('heading', { level: 2, name: 'Was ist das Fundament des Glaubens?' }, { timeout: 8000 });
    expect(screen.queryByText(/Noch nicht durchgesehen/)).toBeNull();
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
    expect(store.getProfile().dogmatik.read).toEqual({ '1-47': '2026-10-16' });
    expect(screen.getByText(/Gelesen am/)).toBeTruthy();
  });

  it('writes the thought to the question into the Gebetskammer', async () => {
    const { store } = await renderAt('/katechismus/dogmatik/1-47');
    fireEvent.change(await screen.findByLabelText('Deine Gedanken zur Frage', {}, { timeout: 8000 }), { target: { value: 'Auf meine Werke.' } });
    fireEvent.click(screen.getByRole('button', { name: 'In die Gebetskammer schreiben' }));
    const entry = store.getProfile().arena[0]!;
    expect(entry.title).toBe('Dogmatik, Band 1, Tag 47: Was ist das Fundament des Glaubens?');
    expect(entry.verses).toEqual(['Epheser 2,20']);
    expect(entry.text).toMatch(/Auf meine Werke\.$/);
  });

  it('opens a link from before the three volumes in Band 1', async () => {
    await renderAt('/katechismus/dogmatik/47');
    expect(await screen.findByRole('heading', { level: 2, name: 'Was ist das Fundament des Glaubens?' }, { timeout: 8000 })).toBeTruthy();
  });

  it('searches all three volumes and shows the contents of each', async () => {
    await renderAt('/katechismus/dogmatik');
    fireEvent.change(await screen.findByLabelText('In allen drei Bänden suchen', {}, { timeout: 8000 }), { target: { value: 'subsistere' } });
    expect(await screen.findByRole('link', { name: /Was ist das Fundament/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Inhalt' }));
    expect(screen.getByRole('button', { name: /^Wesen und Begriff der Theologie/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Band 3' }));
    expect(screen.getByRole('button', { name: /^Die letzten Dinge/ })).toBeTruthy();
  });

  it('stands in the Stille Zeit after the Word when chosen', async () => {
    await renderAt('/andacht/morgen', (s) =>
      s.updateProfile((p) => ({ ...p, dogmatik: { ...p.dogmatik, stilleZeit: true } }), { immediate: true }),
    );
    expect(await screen.findByRole('button', { name: /Dogmatik/ }, { timeout: 8000 })).toBeTruthy();
  });
});
