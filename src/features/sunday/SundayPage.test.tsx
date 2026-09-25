// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { SECTIONS } from '../../app/routes';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { SundayPage } from './SundayPage';

afterEach(cleanup);

let n = 0;
async function renderSunday(path: string) {
  const store = new Store({ db: new TagzeitenDB(`sunday-${++n}`), journal: memoryJournal(), now: () => new Date(2026, 8, 25, 9) });
  const router = createMemoryRouter([{ path: '/sonntag', element: <SundayPage /> }], { initialEntries: [path] });
  render(
    <ToastProvider>
      <StoreProvider store={store}>
        <RouterProvider router={router} />
      </StoreProvider>
    </ToastProvider>,
  );
  await screen.findByRole('heading', { level: 2 });
  return router;
}
const title = () => document.querySelector('.sunday-name')!.textContent;

describe('Sonntag', () => {
  it('stands in the middle of the bar, with Andacht for morning and evening', () => {
    expect(SECTIONS.map((s) => s.label)).toEqual(['Archiv', 'Andacht', 'Heute', 'Sonntag', 'Bibel', 'Katechismus', 'Mehr']);
  });

  it('shows the Sunday of the week with verse, meaning, readings and its place in the church year', async () => {
    await renderSunday('/sonntag?d=2026-09-24');
    expect(title()).toBe('16. Sonntag nach Trinitatis');
    expect(screen.getByText('Sonntag, 20. September 2026')).toBeTruthy();
    expect(document.querySelector('.sunday-verse blockquote')!.textContent).toMatch(/^Jetzt aber offenbart/);
    expect(screen.getByRole('heading', { name: 'Bedeutung' })).toBeTruthy();
    // Gospel and Epistle as references with links, not as full text (rule 13).
    const links = [...document.querySelectorAll('.sunday-readings a')].map((a) => a.textContent);
    expect(links).toEqual(['Johannes 11,1-3.17-27', '2. Timotheus 1,7-10']);
    expect(document.querySelector('.cy-circles [aria-current]')!.textContent).toBe('PfingstkreisTrinitatiszeit');
    // The Trinity group stands above the name of the Sunday.
    expect(document.querySelector('.sunday-group')!.textContent).toContain('Heiligung');
    // A short summary of each text, in our own words.
    expect([...document.querySelectorAll('.sunday-summary')].map((p) => p.textContent)).toHaveLength(2);
    expect(document.querySelector('.sunday-summary')!.textContent).toContain('Auferstehung und das Leben');
  });

  it('goes to the Sunday before and after, also across the turn of the church year', async () => {
    const router = await renderSunday('/sonntag?d=2026-09-24');
    fireEvent.click(screen.getByRole('link', { name: /^Letzter Sonntag/ }));
    await waitFor(() => expect(title()).toBe('15. Sonntag nach Trinitatis'));
    expect(new URLSearchParams(router.state.location.search).get('s')).toBe('2026-09-13');
    expect(screen.getByRole('link', { name: 'Zu dieser Woche' })).toBeTruthy();
    fireEvent.click(screen.getByRole('link', { name: /^Nächster Sonntag/ }));
    fireEvent.click(await screen.findByRole('link', { name: /^Nächster Sonntag: 17\./ }));
    await waitFor(() => expect(title()).toBe('17. Sonntag nach Trinitatis'));

    cleanup();
    await renderSunday('/sonntag?d=2026-09-24&s=2026-11-22');
    expect(title()).toMatch(/Ewigkeitssonntag/);
    fireEvent.click(screen.getByRole('link', { name: /^Nächster Sonntag/ }));
    await waitFor(() => expect(title()).toBe('1. Sonntag im Advent'));
  });

  it('opens all Sundays as a card from the name and shows the chosen one', async () => {
    const router = await renderSunday('/sonntag?d=2026-09-24');
    fireEvent.click(screen.getByRole('button', { name: /– alle Sonntage$/ }));
    const card = await screen.findByRole('dialog', { name: 'Alle Sonntage' });
    const shown = card.querySelector('.week-link[aria-current="true"]')!;
    expect(shown.textContent).toContain('16. Sonntag nach Trinitatis');
    expect(shown.textContent).toContain('diese Woche');
    // Escape closes the card without leaving the page.
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    fireEvent.click(screen.getByRole('button', { name: /– alle Sonntage$/ }));
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /Invokavit/ }));
    await waitFor(() => expect(title()).toBe('Invokavit'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(router.state.location.pathname).toBe('/sonntag');
  });

});
