// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { resetOpenState } from '../../ui/collapseState';
import { MorningPage } from './MorningPage';

beforeEach(() => {
  localStorage.clear();
  resetOpenState();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

let n = 0;
async function renderMorning() {
  const store = new Store({ db: new TagzeitenDB(`morning-${++n}`), journal: memoryJournal(), now: () => new Date(2026, 8, 25, 5) });
  const router = createMemoryRouter([{ path: '/morgen', element: <MorningPage /> }], { initialEntries: ['/morgen'] });
  render(
    <ToastProvider>
      <StoreProvider store={store}>
        <RouterProvider router={router} />
      </StoreProvider>
    </ToastProvider>,
  );
  await screen.findByRole('heading', { name: 'Stille Zeit', level: 2 });
  return store;
}

const chain = () => screen.getByRole('navigation', { name: 'Ablauf: Stille Zeit' });
const title = () => document.querySelector('.flow-step h3')!.textContent;

describe('Stille Zeit as a flow', () => {
  it('shows one step at a time, starting at the bed, without times or labels in the row', async () => {
    const store = await renderMorning();
    expect(title()).toBe('Am Bett');
    expect(document.querySelectorAll('.flow-step')).toHaveLength(1);
    expect(chain().textContent).not.toMatch(/Min\.|gebetet/);

    fireEvent.click(screen.getByRole('button', { name: 'Weiter zu: Eröffnung' }));
    await waitFor(() => expect(title()).toBe('Eröffnung'));
    expect(store.getDay(store.today()).morning.atBed).toBe(true);
    expect(within(chain()).getByRole('button', { name: 'Am Bett, gebetet' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Weiter zu: Das Wort' }));
    await waitFor(() => expect(title()).toBe('Das Wort'));
    expect(store.getDay(store.today()).morning.steps.opening).toBe(true);
  });

  it('lets any step be opened from the row and closes the order on the last one (rule 8)', async () => {
    const store = await renderMorning();
    fireEvent.click(screen.getByRole('button', { name: /^Kurzform/ }));
    await waitFor(() => expect(store.getDay(store.today()).morning.form).toBe('short'));
    const buttons = within(chain()).getAllByRole('button');
    fireEvent.click(buttons.at(-1)!);
    fireEvent.click(await screen.findByRole('button', { name: 'Stille Zeit abschließen' }));
    await waitFor(() => expect(store.getDay(store.today()).morning.done).toBe(true));
    expect(screen.getByText('Stille Zeit abgeschlossen.')).toBeTruthy();
    expect(document.querySelector('.flow-step')).toBeNull();
  });

  it('puts on the armour of the day after the morning blessing, unless switched off', async () => {
    const store = await renderMorning();
    const step = () => document.querySelector('.flow-step')!;
    const parts = [...step().querySelectorAll('.part-title')].map((h) => h.textContent);
    expect(parts.slice(-2)).toEqual(['Morgensegen', 'Die geistliche Waffenrüstung']);
    // 25 September 2026 is a Friday.
    expect(step().textContent).toContain('Freitag: Der Helm des Heils');
    expect(step().textContent).toContain('Ziehet an den Harnisch Gottes');
    store.updateProfile((p) => ({ ...p, armor: false }));
    await waitFor(() => expect(step().textContent).not.toContain('Harnisch'));
  });
});
