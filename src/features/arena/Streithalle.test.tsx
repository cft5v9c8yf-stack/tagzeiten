// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { resetOpenState } from '../../ui/collapseState';
import { ArenaPage } from './ArenaPage';

beforeEach(() => {
  localStorage.clear();
  resetOpenState();
});
afterEach(cleanup);

let n = 0;
async function renderArena(path: string, prepare?: (s: Store) => void) {
  const store = new Store({
    db: new TagzeitenDB(`hall-${++n}`),
    journal: memoryJournal(),
    now: () => new Date(2026, 8, 26, 7),
  });
  await store.load();
  prepare?.(store);
  const router = createMemoryRouter([{ path: '/arena', element: <ArenaPage /> }], { initialEntries: [path] });
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

const places = () =>
  within(screen.getByRole('group', { name: 'Bereich der Arena' }))
    .getAllByRole('button')
    .map((b) => b.textContent);

describe('Streithalle', () => {
  it('is not there while the Winter Arc is off', async () => {
    await renderArena('/arena?bereich=streithalle');
    expect(places()).toEqual(['Gebetskammer', 'Eisenschmiede']);
    // The old Arena stands as it was.
    expect(document.querySelector('.arena-note')!.textContent).toContain('Sünde wird gebetet, nicht notiert');
    expect(document.querySelector('.streithalle')).toBeNull();
  });

  it('stands third in the Arena while the Winter Arc is on, with the guide', async () => {
    await renderArena('/arena', (s) => s.startWinterArc('2026-09-14', 90));
    expect(places()).toEqual(['Gebetskammer', 'Eisenschmiede', 'Streithalle']);
    // The Gebetskammer stays first and unchanged.
    expect(within(screen.getByRole('group', { name: 'Bereich der Arena' })).getByRole('button', { name: 'Gebetskammer' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Streithalle' }));
    const hall = document.querySelector('.streithalle')!;
    // Word first: Psalm 144,1 above the plan.
    expect(hall.querySelector('.wa-verse')!.textContent).toContain('der meine Hände lehrt streiten');
    expect(hall.firstElementChild!.classList.contains('wa-verse')).toBe(true);
    const parts = [...hall.querySelectorAll('.wa-guide-part .fold-title')].map((t) => t.textContent);
    expect(parts).toEqual([
      'Worum es geht',
      'Die vier Regeln',
      'Der Tagesstandard',
      'Der Wochenstandard',
      'Die drei Phasen',
      'Tag 90 – und danach',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Die drei Phasen' }));
    // 26 September is day 13 of a round from 14 September: week 2.
    const current = hall.querySelector('.wa-week[aria-current="true"]')!;
    expect(current.textContent).toContain('Woche 2');
    expect(current.textContent).toContain('Den Morgen gewinnen');
    expect(hall.querySelectorAll('.wa-week')).toHaveLength(13);
  });

  it('marks no week before the round has begun', async () => {
    await renderArena('/arena?bereich=streithalle', (s) => s.startWinterArc('2026-10-05', 90));
    fireEvent.click(screen.getByRole('button', { name: 'Die drei Phasen' }));
    expect(document.querySelector('.wa-week[aria-current]')).toBeNull();
  });
});
