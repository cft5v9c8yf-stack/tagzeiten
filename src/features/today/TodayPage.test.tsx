// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  it('heads the page with the date only; the week lives on "Sonntag"', async () => {
    await renderToday('2026-09-24');
    expect(document.querySelector('.church-year')!.textContent).toBe('Donnerstag, 24. September 2026');
    expect(screen.queryByRole('heading', { name: 'Diese Woche' })).toBeNull();
    expect(document.querySelector('.cy-verse, .cy-circles, .cy-readings')).toBeNull();
  });

  it('names the feast of the day under the date', async () => {
    await renderToday('2026-04-03');
    expect(document.querySelector('.cy-feast')!.textContent).toBe('Karfreitag');
  });

  it('shows the Vesper alone, closing the day, when the Nachtgebet is hidden', async () => {
    await renderToday('2026-09-24', (s) => {
      s.updateProfile((p) => ({ ...p, showCompline: false }), { immediate: true });
      s.updateDay('2026-09-24', (d) => ({ ...d, evening: { ...d.evening, vespersDone: true } }));
    });
    const tile = document.querySelectorAll('.tile')[1]!;
    expect(tile.querySelector('.tile-name')!.textContent).toBe('Vesper');
    expect(tile.querySelector('.tile-state')!.textContent).toBe('abgeschlossen');
    expect(tile.classList.contains('is-done')).toBe(true);
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

  it('marks the reading through the habit "Bibel lesen" and moves the plan on', async () => {
    const store = await renderToday('2026-09-25');
    expect(document.querySelector('input[type="checkbox"]')).toBeNull();
    const cell = screen.getByRole('button', { name: 'Bibel lesen, Fr 25.9.' });
    act(() => cell.click());
    await waitFor(() => expect(cell.getAttribute('aria-pressed')).toBe('true'));
    expect(store.getDay('2026-09-25').reading!.done).toBe(true);
    expect(Object.values(store.getProfile().plan.positions).every((p) => p > 0)).toBe(true);
    expect(screen.getByRole('heading', { name: /Heute lesen/ }).textContent).toContain('gelesen');
    // Yesterday had no portion: nothing to tick, nothing owed (rule 6).
    expect((screen.getByRole('button', { name: 'Bibel lesen, Do 24.9.' }) as HTMLButtonElement).disabled).toBe(true);
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

  it('shows a weekly habit meant for three days as days, with how often it is entered', async () => {
    await renderToday('2026-09-24', (s) => {
      s.updateProfile((p) => ({
        ...p,
        habits: [...p.habits, { id: 'own-sport', name: 'Sport', rhythm: 'weekly', auto: null, active: true, preset: false, focus: false, timesPerWeek: 3 }],
      }));
      s.updateDay('2026-09-21', (d) => ({ ...d, habits: { ...d.habits, 'own-sport': true } }));
    });
    const row = screen.getByText('Sport').closest('tr')!;
    expect(row.closest('tbody')!.classList.contains('habit-group-weekly')).toBe(true);
    expect(row.textContent).toMatch(/3-mal die Woche · 1\seingetragen/);
    const cells = row.querySelectorAll('button.cell');
    expect(cells).toHaveLength(7);
    expect(cells[0]!.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(cells[2]!);
    expect(await screen.findByText(/2 eingetragen/)).toBeTruthy();
    // Documented, not rated: nothing says what is missing.
    expect(row.textContent).not.toMatch(/fehlt|noch|offen/);
  });

  it('puts the starred habits on top under "Im Blick", then the rest by rhythm in the user\'s order', async () => {
    await renderToday('2026-09-24', (s) =>
      s.updateProfile((p) => {
        const habits = p.habits.map((h) => (h.id === 'blessChildren' ? { ...h, focus: true } : h));
        // Put "Familienandacht" before "Tischgebet mit der Familie".
        const i = habits.findIndex((h) => h.id === 'tablePrayer');
        const j = habits.findIndex((h) => h.id === 'familyDevotion');
        [habits[i], habits[j]] = [habits[j]!, habits[i]!];
        return { ...p, habits };
      }),
    );
    const groups = [...document.querySelectorAll('.habits .group-row th')].map((t) => t.textContent!.trim());
    expect(groups).toEqual(['Im Blick', 'Täglich', 'Wöchentlich', 'Monatlich']);
    const focus = [...document.querySelectorAll('.habit-group-focus th[scope=row]')].map((t) => t.textContent);
    expect(focus).toEqual(['Fokus: Die Kinder segnen']);
    const daily = [...document.querySelectorAll('.habit-group-daily th[scope=row]')].map((t) => t.textContent!);
    // Not twice: the starred habit stands only on top.
    expect(daily.some((t) => t.includes('Die Kinder segnen'))).toBe(false);
    expect(daily.findIndex((t) => t.includes('Familienandacht'))).toBeLessThan(daily.findIndex((t) => t.includes('Tischgebet')));
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

  it('shows the points of the Streithalle among the habits while the Winter Arc runs, with one tick for both', async () => {
    // 25 September 2026 is a Friday; the round began on Wednesday the 23rd.
    const store = await renderToday('2026-09-25', (s) => s.startWinterArc('2026-09-23', 90));
    const group = document.querySelector('.habit-group-streithalle') as HTMLElement;
    expect(group.querySelector('.group-row')!.textContent).toBe('Streithalle');
    // Monday and Tuesday lie before the round: neutral grey, nothing to tick.
    const wake = within(group).getByRole('row', { name: /04:00 auf, kein Handy/ });
    expect(wake.querySelectorAll('td.wa-outside')).toHaveLength(2);
    fireEvent.click(within(group).getByRole('button', { name: '04:00 auf, kein Handy, Fr 25.9.' }));
    const run = store.getProfile().winterArc.runs[0]!;
    expect(store.getProfile().winterArc.days).toMatchObject([{ runId: run.id, date: '2026-09-25', checks: { wake: true } }]);
    // Saturday: rest from training.
    expect(within(group).getByRole('row', { name: /Trainiert/ }).textContent).toContain('Ruhe');
    fireEvent.click(within(group).getByRole('button', { name: 'Gottesdienst und Sonntagsruhe, Woche 1 der Runde' }));
    expect(store.getProfile().winterArc.weeks).toMatchObject([{ week: 1, weeklyChecks: { church: true } }]);
  });

  it('has no Streithalle among the habits while the Winter Arc is off', async () => {
    await renderToday('2026-09-25');
    expect(document.querySelector('.habit-group-streithalle')).toBeNull();
  });
});
