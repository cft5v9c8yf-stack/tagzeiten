// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { TodayPage } from './TodayPage';

afterEach(cleanup);

let n = 0;
async function renderToday(date: string, prepare?: (s: Store) => void) {
  const store = new Store({
    db: new TagzeitenDB(`today-${++n}`),
    journal: memoryJournal(),
    now: () => new Date(2026, 8, 25, 9, 0),
  });
  await store.load();
  prepare?.(store);
  const router = createMemoryRouter([{ path: '/', element: <TodayPage /> }], { initialEntries: [`/?d=${date}`] });
  render(
    <ToastProvider>
      <StoreProvider store={store}>
        <RouterProvider router={router} />
      </StoreProvider>
    </ToastProvider>,
  );
  await screen.findByText('Die drei Dinge');
  return store;
}

describe('Today', () => {
  it('heads the page with the date and keeps the church year under "Diese Woche"', async () => {
    await renderToday('2026-09-24');
    const top = document.querySelector('.church-year')!;
    expect(top.textContent).toBe('Donnerstag, 24. September 2026');
    const h = screen.getByRole('heading', { name: 'Diese Woche' }).closest('section')!;
    // Catechism and psalms are no longer part of the week on Today.
    expect(h.textContent).not.toMatch(/Katechismus|Auswendig|Psalm am/);
    expect(h.querySelector('.cy-week-name')!.textContent).toBe('16. Sonntag nach Trinitatis');
    expect(h.querySelector('.cy-week-no')!.textContent).toBe('43. Woche im Kirchenjahr');
    const current = h.querySelector('.cy-circles [aria-current]')!;
    expect(current.textContent).toBe('PfingstkreisTrinitatiszeit');
    expect([...h.querySelectorAll('.cy-circles li')].map((l) => l.querySelector('.cy-circle-name')!.textContent)).toEqual([
      'Weihnachtskreis',
      'Osterkreis',
      'Pfingstkreis',
    ]);
  });

  it('shows the weekly verse with a link to the passage', async () => {
    await renderToday('2026-09-24');
    const v = document.querySelector('.cy-verse')!;
    expect(v.querySelector('figcaption')!.textContent).toBe('Wochenspruch');
    expect(v.querySelector('blockquote')!.textContent).toMatch(/^Jetzt aber offenbart .* durch das Evangelium\.$/);
    expect(v.querySelector('a')!.getAttribute('href')).toBe('https://www.bibleserver.com/LUT/2.Timotheus1,10');
    const readings = document.querySelector('.cy-today-readings')!;
    expect(readings.getAttribute('aria-label')).toBe('Lesungen der Woche');
    expect([...readings.querySelectorAll('a')].map((a) => a.textContent)).toEqual(['Johannes 11,1-3.17-27', '2. Timotheus 1,7-10']);
  });

  it('names the feast of the day', async () => {
    await renderToday('2026-04-03');
    expect(document.querySelector('.cy-feast')!.textContent).toBe('Karfreitag');
    expect(document.querySelector('.cy-verse figcaption')!.textContent).toBe('Spruch des Tages');
    expect(document.querySelector('.cy-today-readings')!.getAttribute('aria-label')).toBe('Lesungen des Tages');
    expect(document.querySelector('.cy-today-readings a')!.textContent).toBe('Johannes 19,16-30');
    expect(document.querySelector('.cy-circles [aria-current]')!.textContent).toBe('OsterkreisKarwoche');
  });

  it('shows the orders as tiles with their state', async () => {
    await renderToday('2026-09-24', (s) =>
      s.updateDay('2026-09-24', (d) => ({
        ...d,
        morning: { ...d.morning, form: 'short', done: true },
        evening: { ...d.evening, vespersDone: true },
      })),
    );
    const tiles = [...document.querySelectorAll('.tile')].map((t) => t.textContent);
    expect(tiles[0]).toContain('abgeschlossen'); // the short form counts in full (rule 8)
    expect(tiles[0]).not.toMatch(/teilweise|Kurzform/);
    expect(tiles[1]).toContain('Vesper gebetet');
  });

  it('shows the three things with their evening marks', async () => {
    await renderToday('2026-09-24', (s) =>
      s.updateDay('2026-09-24', (d) => ({
        ...d,
        morning: { ...d.morning, three: { word: 'Paul anrufen', house: 'Vorlesen' } },
        evening: { ...d.evening, marks: { word: 'minus' } },
      })),
    );
    const panel = document.querySelector('.three')!;
    expect(panel.textContent).toContain('Paul anrufen');
    expect(panel.querySelector('.mark.minus')).not.toBeNull();
  });

  it('does not let derived habits be toggled, but manual ones', async () => {
    const store = await renderToday('2026-09-24');
    const still = screen.getByRole('button', { name: 'Stille Zeit, Do 24.9.' });
    expect((still as HTMLButtonElement).disabled).toBe(true);
    const table = screen.getByRole('button', { name: 'Tischgebet mit der Familie, Do 24.9.' });
    expect(table.getAttribute('aria-pressed')).toBe('false');
    act(() => table.click());
    await waitFor(() => expect(table.getAttribute('aria-pressed')).toBe('true'));
    expect(store.getDay('2026-09-24').habits.tablePrayer).toBe(true);
    // future days cannot be recorded
    expect((screen.getByRole('button', { name: 'Tischgebet mit der Familie, Sa 26.9.' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows weekly habits once for the week', async () => {
    await renderToday('2026-09-24', (s) =>
      s.updateDay('2026-09-21', (d) => ({ ...d, habits: { worship: true } })),
    );
    const row = screen.getByText('Gottesdienst – den Feiertag heiligen').closest('tr')!;
    const pill = row.querySelector('button')!;
    expect(pill.textContent).toBe('✓ diese Woche');
    expect(pill.disabled).toBe(true); // recorded on Monday, toggled there
  });

  it('groups habits by rhythm in the user\'s order and stars focus habits', async () => {
    await renderToday('2026-09-24', (s) =>
      s.updateProfile((p) => {
        const habits = p.habits.map((h) => (h.id === 'blessChildren' ? { ...h, focus: true } : h));
        // Put "Die Kinder segnen" before "Tischgebet mit der Familie".
        const i = habits.findIndex((h) => h.id === 'tablePrayer');
        const j = habits.findIndex((h) => h.id === 'blessChildren');
        [habits[i], habits[j]] = [habits[j]!, habits[i]!];
        return { ...p, habits };
      }),
    );
    const groups = [...document.querySelectorAll('.habits .group-row th')].map((t) => t.textContent);
    expect(groups).toEqual(['Täglich', 'Wöchentlich', 'Monatlich']);
    const daily = [...document.querySelectorAll('.habit-group-daily th[scope=row]')].map((t) => t.textContent);
    expect(daily.findIndex((t) => t!.includes('Die Kinder segnen'))).toBeLessThan(
      daily.findIndex((t) => t!.includes('Tischgebet')),
    );
    const star = [...document.querySelectorAll('.focus-star')];
    expect(star).toHaveLength(1);
    expect(star[0]!.closest('th')!.textContent).toBe('Fokus: Die Kinder segnen');
  });

  it('keeps missed days neutral and counts nothing as a streak (rules 4, 5)', async () => {
    await renderToday('2026-09-24', (s) =>
      s.updateDay('2026-09-20', (d) => ({
        ...d,
        morning: { ...d.morning, done: true },
        evening: { ...d.evening, complineDone: true },
      })),
    );
    const dots = [...document.querySelectorAll('.dots .dot')];
    expect(dots).toHaveLength(28);
    expect(dots.filter((d) => d.classList.contains('both'))).toHaveLength(1);
    expect(dots.filter((d) => d.classList.contains('none'))).toHaveLength(27);
    expect(document.body.textContent).not.toMatch(/Serie|in Folge|verpasst|versäumt|Rückstand/i);
  });
});
