// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { SearchPage } from './SearchPage';

afterEach(cleanup);

let n = 0;
async function renderSearch(path = '/suche') {
  const store = new Store({ db: new TagzeitenDB(`search-${++n}`), journal: memoryJournal(), now: () => new Date(2026, 8, 25, 9) });
  const router = createMemoryRouter(
    [
      { path: '/suche', element: <SearchPage /> },
      { path: '/katechismus/:teil', element: <p>Lehre</p> },
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
  await screen.findByRole('heading', { level: 2, name: 'Suchen' });
  return { router, store };
}

describe('Suchen', () => {
  it('finds an article, marks the word and opens its page', async () => {
    const { router } = await renderSearch();
    fireEvent.change(screen.getByLabelText('Suchbegriff'), { target: { value: 'Rechtfertigung' } });
    const hit = await screen.findByRole('link', { name: /Der IV\. Artikel/ });
    expect(hit.querySelector('mark')).not.toBeNull();
    expect(router.state.location.search).toBe('?q=Rechtfertigung');
    fireEvent.click(hit);
    expect(router.state.location.pathname).toBe('/katechismus/augsburgische-konfession');
  });

  it('keeps the query in the address and says when nothing is found', async () => {
    await renderSearch('/suche?q=Xylophonkonzert');
    expect(await screen.findByText('Nichts gefunden.')).toBeTruthy();
  });
});
