// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { resetOpenState, setOpen } from '../../ui/collapseState';
import { TodayPage } from '../today/TodayPage';
import { ChurchYearPage } from './ChurchYearPage';

beforeEach(() => {
  localStorage.clear();
  resetOpenState();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

let n = 0;
async function renderAt(path: string) {
  const store = new Store({ db: new TagzeitenDB(`cy-${++n}`), journal: memoryJournal(), now: () => new Date(2026, 8, 25, 9) });
  const router = createMemoryRouter(
    [
      { path: '/', element: <TodayPage /> },
      { path: '/kirchenjahr', element: <ChurchYearPage /> },
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
  return router;
}

describe('Kirchenjahr', () => {
  it('opens the circle from Today', async () => {
    const router = await renderAt('/?d=2026-09-24');
    fireEvent.click(await screen.findByRole('link', { name: /Osterkreis/ }));
    expect(router.state.location.pathname).toBe('/kirchenjahr');
    expect(new URLSearchParams(router.state.location.search).get('kreis')).toBe('easter');
    expect(await screen.findByRole('heading', { name: 'Passionszeit' })).toBeTruthy();
  });

  it('explains the seasons of a circle and lists every Sunday with Gospel and Epistle', async () => {
    await renderAt('/kirchenjahr?d=2026-09-24&kreis=easter');
    await screen.findByRole('heading', { name: 'Passionszeit' });
    const phases = [...document.querySelectorAll('.cy-phase h3')].map((h) => h.textContent);
    expect(phases).toEqual(['Vorpassionszeit', 'Passionszeit', 'Karwoche', 'Osterzeit']);
    const invokavit = document.getElementById('entry-invokavit')!;
    expect(invokavit.textContent).toContain('Invokavit');
    expect(invokavit.textContent).toContain('„Er ruft mich an, so will ich ihn erhören“');
    const links = [...invokavit.querySelectorAll('a')].map((a) => a.textContent);
    expect(links).toEqual(['Matthäus 4,1-11', 'Hebräer 4,14-16']);
    expect(document.getElementById('entry-goodFriday')!.textContent).toContain('Johannes 19,16-30');
  });

  it('marks the current week and jumps to it from the week name', async () => {
    const router = await renderAt('/?d=2026-09-24');
    fireEvent.click(await screen.findByRole('link', { name: '16. Sonntag nach Trinitatis' }));
    const params = new URLSearchParams(router.state.location.search);
    expect(params.get('kreis')).toBe('pentecost');
    expect(params.get('woche')).toBe('trinity16');
    const entry = await screen.findByText('16. Sonntag nach Trinitatis', { selector: 'h5' });
    const li = entry.closest('li')!;
    expect(li.classList.contains('current')).toBe(true);
    expect(li.textContent).toContain('diese Woche');
    expect(li.textContent).toContain('Johannes 11,1-3.17-27');
    expect(document.querySelectorAll('.cy-entry.current')).toHaveLength(1);
    await waitFor(() => expect(document.activeElement).toBe(li));
  });

  it('unfolds a folded phase and group before jumping to the week', async () => {
    setOpen('cy.phase.trinity', false);
    setOpen('cy.group.Bekehrung', false);
    await renderAt('/kirchenjahr?d=2026-09-24&kreis=pentecost&woche=trinity16');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Trinitatiszeit' }).getAttribute('aria-expanded')).toBe('true'),
    );
    const li = document.getElementById('entry-trinity16')!;
    expect(li.closest('[hidden]')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(li));
  });

  it('groups the Trinity season by theme', async () => {
    await renderAt('/kirchenjahr?d=2026-09-24&kreis=pentecost');
    await screen.findByRole('heading', { name: 'Trinitatiszeit' });
    const groups = [...document.querySelectorAll('.cy-group-title')].map((h) => h.querySelector('.fold-text')!.firstChild!.textContent!.trim());
    expect(groups).toEqual(['Berufung und Sammlung', 'Buße und Erleuchtung', 'Bekehrung', 'Heiligung', 'Vollendung']);
    const inGroup = (title: string) =>
      [...document.querySelectorAll('.cy-group')]
        .find((g) => g.querySelector('.cy-group-title')!.textContent!.startsWith(title))!
        .querySelectorAll('.cy-entry h5');
    expect([...inGroup('Berufung und Sammlung')].map((h) => h.textContent)).toEqual([
      'Trinitatis',
      '1. Sonntag nach Trinitatis',
      '2. Sonntag nach Trinitatis',
      '3. Sonntag nach Trinitatis',
      '4. Sonntag nach Trinitatis',
      '5. Sonntag nach Trinitatis',
    ]);
    expect([...inGroup('Heiligung')].at(-1)!.textContent).toBe('22. Sonntag nach Trinitatis');
    expect([...inGroup('Vollendung')].map((h) => h.textContent)).toEqual([
      'Drittletzter Sonntag des Kirchenjahres',
      'Vorletzter Sonntag des Kirchenjahres',
      'Letzter Sonntag des Kirchenjahres (Ewigkeitssonntag)',
    ]);
  });

  it('switches between the circles', async () => {
    await renderAt('/kirchenjahr?d=2026-09-24&kreis=pentecost');
    fireEvent.click(await screen.findByRole('button', { name: 'Weihnachtskreis' }));
    expect(await screen.findByRole('heading', { name: 'Adventszeit' })).toBeTruthy();
    expect(document.getElementById('entry-advent1')!.textContent).toContain('Matthäus 21,1-9');
  });
});
