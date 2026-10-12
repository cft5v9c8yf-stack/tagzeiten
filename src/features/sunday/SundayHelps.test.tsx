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
import { SundayLessonPage } from './SundayLessonPage';
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
      { path: '/sonntag/lektion/:sonntag', element: <SundayLessonPage /> },
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

describe('Sunday: the Bible lessons of Advent after Dieffenbach (1.5)', () => {
  it('stand as a tile in each week of Advent, the right one by the date', async () => {
    await renderAt('/sonntag', new Date(2026, 10, 29, 9));
    const tile = screen.getByRole('link', { name: /Bibellektion · Matth\. 21, 1–9/ });
    expect(tile.textContent).toContain('Der Herr kommt zur Erlösung.');
    expect(tile.getAttribute('href')).toBe('/sonntag/lektion/advent-1');
    cleanup();
    await renderAt('/sonntag', new Date(2026, 11, 16, 9));
    expect(screen.getByRole('link', { name: /Bibellektion · Matth\. 11, 2–10/ }).getAttribute('href')).toBe('/sonntag/lektion/advent-3');
    expect(screen.queryByRole('link', { name: /Die Bibellektionen der Adventssonntage/ })).toBeNull();
  });

  it('are reached outside Advent by a link in the Sunday area', async () => {
    const { router } = await renderAt('/sonntag');
    expect(screen.queryByRole('link', { name: /^Bibellektion ·/ })).toBeNull();
    fireEvent.click(screen.getByRole('link', { name: /Die Bibellektionen der Adventssonntage/ }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Der Herr kommt zur Erlösung.' })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/sonntag/lektion/advent-1');
  });

  it('show title, guiding words, the reference and the numbered paragraphs, hymn verses set off', async () => {
    await renderAt('/sonntag/lektion/advent-3');
    const page = document.querySelector('.sunday-lesson')!;
    expect(page.querySelector('.sunday-kicker')!.textContent).toBe('Dritter Advent – Sonntag');
    expect(page.querySelector('.lesson-motto')!.textContent).toContain('Alle Gottes-Verheißungen sind Ja in Ihm');
    expect(page.querySelector('.lesson-ref')!.textContent).toBe('Bibellektion Matth. 11, 2–10 (V. 6)');
    // The Bible text itself is not given, only its reference (rule 13).
    expect(page.textContent).not.toContain('Gehet hin und saget Johannes wieder');
    expect([...page.querySelectorAll('.lesson-paragraphs > li')].map((li) => li.getAttribute('value'))).toEqual(['1', '2', '3', '4']);
    const hymns = [...page.querySelectorAll('.lesson-hymn')];
    expect(hymns).toHaveLength(2);
    expect([...hymns[0]!.querySelectorAll('.line')].map((l) => l.textContent)).toEqual([
      '„Was der alten Väter Chor',
      'Höchster Wunsch und Sehnen war,',
      'Und was sie geprophezeit,',
      'Ist erfüllt nach Herrlichkeit!“',
    ]);
    // On to the other Sundays of Advent.
    fireEvent.click(screen.getByRole('link', { name: '4. Advent' }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Der Herr kommt! – Richtet den Weg des Herrn!' })).toBeTruthy();
  });
});

