// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { SCRIPTURE_PRAYER } from '../../content/scripturePrayer';
import { SUNDAY_GUIDE } from '../../content/sundayGuide';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { ScripturePrayerPage } from './ScripturePrayerPage';
import { SundayGuidePage } from './SundayGuidePage';
import { SundayPage } from './SundayPage';

afterEach(cleanup);

let n = 0;
async function renderAt(path: string, now = new Date(2026, 8, 25, 9)) {
  const store = new Store({ db: new TagzeitenDB(`helps-${++n}`), journal: memoryJournal(), now: () => now });
  await store.load();
  const router = createMemoryRouter(
    [
      { path: '/sonntag', element: <SundayPage /> },
      { path: '/sonntag/hilfe', element: <SundayGuidePage /> },
      { path: '/sonntag/gebet', element: <ScripturePrayerPage /> },
      { path: '/arena/:eintrag', element: <p>Gebetskammer</p> },
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
  await screen.findByRole('heading', { level: 2 });
  return { store, router };
}

const tileOrder = () => {
  const helps = document.querySelector('.sunday-helps')!;
  const verse = document.querySelector('.sunday-verse')!;
  return helps.compareDocumentPosition(verse) & Node.DOCUMENT_POSITION_FOLLOWING ? 'above' : 'below';
};

describe('Sunday: guide and prayer walk', () => {
  it('stands at the top of the Sunday area on a Sunday, at the end on other days', async () => {
    await renderAt('/sonntag?d=2026-09-20');
    expect(screen.getByRole('link', { name: /Der Sonntag/ }).getAttribute('href')).toBe('/sonntag/hilfe?d=2026-09-20');
    expect(screen.getByRole('link', { name: /Mit der Schrift beten/ })).toBeTruthy();
    expect(tileOrder()).toBe('above');
    cleanup();
    await renderAt('/sonntag');
    expect(tileOrder()).toBe('below');
  });

  it('points to the preparation from Saturday 18:00, not before', async () => {
    await renderAt('/sonntag', new Date(2026, 8, 26, 17, 59));
    expect(document.querySelector('.preparation-hint')).toBeNull();
    cleanup();
    await renderAt('/sonntag', new Date(2026, 8, 26, 18, 0));
    expect(screen.getByRole('link', { name: /Vorbereitung am Samstagabend/ }).getAttribute('href')).toBe('/sonntag/hilfe#vorbereitung');
  });

  it('shows the guide with its headings, the quotation, the rubrics and the sources', async () => {
    await renderAt('/sonntag/hilfe#vorbereitung');
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Der Sonntag – eine Hilfe für das Haus');
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([...SUNDAY_GUIDE.map((s) => s.title), 'Quellen']);
    expect(document.querySelector('.guide-quote blockquote')!.textContent).toMatch(/^„Der Sonntag macht die Woche“/);
    expect(document.getElementById('vorbereitung')!.querySelector('.rubric-inline')!.textContent).toBe('Samstagabend: die Vorbereitung.');
    expect(document.querySelectorAll('.guide-sources li')).toHaveLength(7);
    // A page to read: nothing to tick.
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('leads through the eight steps, LORD in small capitals, the pause set apart', async () => {
    await renderAt('/sonntag/gebet');
    expect(document.querySelector('.walk-count')!.textContent).toBe('1 / 8');
    expect(screen.getByRole('heading', { level: 3, name: 'Anbetung' })).toBeTruthy();
    expect(document.querySelector('.lord')!.textContent).toBe('Herrn');
    expect(document.querySelector('.walk-line.is-indented')!.textContent).toBe('„Groß und wundersam sind deine Werke,');
    expect(document.querySelector('.walk-pause')!.textContent).toContain('❧');
    fireEvent.click(screen.getByRole('button', { name: 'Weiter zu: Danksagung' }));
    expect(document.querySelector('.walk-count')!.textContent).toBe('2 / 8');
    fireEvent.click(screen.getByRole('button', { name: 'Zurück zu: Anbetung' }));
    expect(document.querySelector('.walk-count')!.textContent).toBe('1 / 8');
  });

  it('follows the confession with the word of forgiveness (rule 1), and ends with the journal', async () => {
    const { store, router } = await renderAt('/sonntag/gebet');
    fireEvent.click(screen.getByRole('button', { name: 'Weiter zu: Danksagung' }));
    fireEvent.click(screen.getByRole('button', { name: 'Weiter zu: Sündenbekenntnis' }));
    expect(document.querySelector('.pray.absolution')!.textContent).toContain('so ist er treu und gerecht');
    for (const t of ['Vertrauen', 'Gebet des Herrn', 'Bitte', 'Fürbitte', 'Segen']) {
      fireEvent.click(screen.getByRole('button', { name: `Weiter zu: ${t}` }));
    }
    expect(document.querySelector('.walk-count')!.textContent).toBe('8 / 8');
    expect(document.querySelector('.walk-pause')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Gedanken in der Gebetskammer aufschreiben' }));
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/arena\//));
    expect(store.getProfile().arena[0]!.text).toBe('Sonntagsgebet, Freitag, 25. September 2026\n\n');
  });

  it('keeps the walks by weekday in one shape, with a pause after every step but the last', () => {
    const walk = SCRIPTURE_PRAYER[0]!;
    expect(walk.steps.map((s) => s.title)).toEqual([
      'Anbetung', 'Danksagung', 'Sündenbekenntnis', 'Vertrauen', 'Gebet des Herrn', 'Bitte', 'Fürbitte', 'Segen',
    ]);
    expect(walk.steps.slice(0, -1).every((s) => !!s.pause)).toBe(true);
    expect(walk.steps.at(-1)!.pause).toBeUndefined();
    // Every step that asks for confession has its word of forgiveness (rule 1).
    for (const s of walk.steps) if (/bekenne/i.test(s.pause ?? '')) expect(s.comfort).toBeDefined();
  });
});
