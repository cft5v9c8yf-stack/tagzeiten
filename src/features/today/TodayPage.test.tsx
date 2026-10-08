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
import { DESERT_HABITS } from '../../content/desert';
import { TodayPage } from './TodayPage';

afterEach(cleanup);

let n = 0;
/** A house with wife and child, so the habits about them appear. */
const withHouse = (s: Store) =>
  s.updateProfile((p) => ({
    ...p,
    house: { wife: { name: 'Anna', concern: '' }, children: [{ ...p.house.children[0]!, name: 'Paul' }] },
  }));

async function renderToday(date: string, prepare?: (s: Store) => void, now = new Date(2026, 8, 25, 9, 0)) {
  const store = new Store({
    db: new TagzeitenDB(`today-${++n}`),
    journal: memoryJournal(),
    now: () => now,
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
  it('moves on to the new day when the app stayed open over midnight, so nothing is ticked for yesterday', async () => {
    const clock = { now: new Date(2026, 8, 24, 23, 58) };
    const store = new Store({ db: new TagzeitenDB(`today-${++n}`), journal: memoryJournal(), now: () => clock.now });
    await store.load();
    store.updateProfile((p) => ({ ...p, house: { ...p.house, wife: { name: 'Anna', concern: '' } } }));
    const router = createMemoryRouter([{ path: '/', element: <TodayPage /> }], { initialEntries: ['/'] });
    render(
      <ToastProvider>
        <StoreProvider store={store}>
          <RouterProvider router={router} />
        </StoreProvider>
      </ToastProvider>,
    );
    await screen.findByText('Die drei Dinge');
    expect(document.querySelector('.church-year')!.textContent).toBe('Donnerstag, 24. September 2026');
    clock.now = new Date(2026, 8, 25, 6, 30);
    act(() => void store.checkDayChange());
    expect(document.querySelector('.church-year')!.textContent).toBe('Freitag, 25. September 2026');
    // The new day receives its portion of the reading plan, as on opening the app.
    await waitFor(() => expect(store.getDay('2026-09-25').reading).toBeDefined());
    fireEvent.click(screen.getByRole('checkbox', { name: 'Tischgebet mit der Familie' }));
    expect(store.getDay('2026-09-25').habits.tablePrayer).toBe(true);
    expect(store.getDay('2026-09-24').habits.tablePrayer).toBeUndefined();
  });

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
    const store = await renderToday('2026-09-24', withHouse);
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
    const row = within(document.querySelector('table.habits') as HTMLElement).getByText('Gottesdienst – den Feiertag heiligen').closest('tr')!;
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
    const row = within(document.querySelector('table.habits') as HTMLElement).getByText('Sport').closest('tr')!;
    expect(row.closest('tbody')!.classList.contains('habit-group-weekly')).toBe(true);
    expect(row.textContent).toMatch(/3-mal die Woche · 1\seingetragen/);
    const cells = row.querySelectorAll('button.cell');
    expect(cells).toHaveLength(7);
    expect(cells[0]!.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(cells[2]!);
    expect((await screen.findAllByText(/2 eingetragen/)).length).toBeGreaterThan(0);
    // Documented, not rated: nothing says what is missing.
    expect(row.textContent).not.toMatch(/fehlt|noch|offen/);
  });

  it('puts the starred habits on top under "Im Blick", then the rest by rhythm in the user\'s order', async () => {
    await renderToday('2026-09-24', (s) =>
      withHouse(s) &&
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

  it('shows the Wüstenzeit first among the habits, the usual ones below, with one tick for all', async () => {
    // 25 September 2026 is a Friday; the Wüstenzeit began on Wednesday the 23rd.
    const store = await renderToday('2026-09-25', (s) => {
      s.startDesert('2026-09-23', 40);
      const offers = ['wz-psalm', 'wz-freitagsfasten', 'wz-fasten-mi-fr', 'wz-bibelvers'].map(
        (id) => DESERT_HABITS.find((h) => h.id === id)!,
      );
      s.chooseDesert(s.getProfile().winterArc.runs[0]!.id, offers, true);
    });
    expect(document.querySelector('#today\\.habits, .fold-aside')!.textContent).toContain('Wüstenzeit · 23.9.–1.11.2026');
    const day = screen.getByRole('region', { name: /^Gewohnheiten, (Heute|Freitag)/ });
    expect([...day.querySelectorAll('.wa-group h5')].map((h) => h.textContent)).toEqual(['Wüstenzeit', 'Täglich', 'Wöchentlich', 'Monatlich']);
    const desert = within(day.querySelector('.desert-group') as HTMLElement);
    expect(desert.getAllByRole('checkbox').map((c) => c.textContent)).toEqual([
      'Psalm des Tages',
      'Freitagsfasten',
      'Fasten am Mittwoch und Freitag',
      'Bibelvers lernendiese Woche',
    ]);
    fireEvent.click(desert.getByRole('checkbox', { name: 'Psalm des Tages' }));
    expect(store.getDay('2026-09-25').habits['wz-psalm']).toBe(true);
    // The "i" opens the short description.
    fireEvent.click(desert.getByRole('button', { name: 'Info zu Fasten am Mittwoch und Freitag' }));
    expect(desert.getByRole('note').textContent).toContain('Halte die altkirchlichen Fastentage.');
    // Thursday: no fasting.
    fireEvent.click(screen.getByRole('button', { name: 'Donnerstag, 24. September' }));
    const thursday = screen.getByRole('region', { name: 'Gewohnheiten, Donnerstag, 24. September' });
    expect(within(thursday.querySelector('.desert-group') as HTMLElement).getAllByRole('checkbox').map((c) => c.textContent)).toEqual([
      'Psalm des Tages',
      'Bibelvers lernendiese Woche',
    ]);
    // The usual habits stay, below.
    expect(within(thursday).getByRole('checkbox', { name: /^Bibel lesen/ })).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/Streithalle|Winter Arc|Serie|verpasst/);
  });

  it('lets the day before be filled in on a Monday, from the week before', async () => {
    const store = await renderToday(
      '2026-09-28',
      (s) => {
        s.startDesert('2026-09-21', 40);
        s.chooseDesert(s.getProfile().winterArc.runs[0]!.id, [DESERT_HABITS.find((h) => h.id === 'wz-psalm')!], true);
      },
      new Date(2026, 8, 28, 7, 0),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Gestern nachtragen' }));
    const sunday = screen.getByRole('region', { name: 'Gewohnheiten, Sonntag, 27. September' });
    fireEvent.click(within(sunday).getByRole('checkbox', { name: 'Psalm des Tages' }));
    expect(store.getDay('2026-09-27').habits['wz-psalm']).toBe(true);
  });

  it('has no Wüstenzeit among the habits while it is off', async () => {
    await renderToday('2026-09-25');
    expect(document.querySelector('.habit-group-desert')).toBeNull();
  });

  it('shows habits about wife and children only once they are entered under "Mein Haus"', async () => {
    await renderToday('2026-09-24');
    expect(screen.queryByRole('button', { name: 'Tischgebet mit der Familie, Do 24.9.' })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Die Kinder segnen/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Stille Zeit, Do 24.9.' })).toBeTruthy();
    cleanup();
    await renderToday('2026-09-24', (s) =>
      s.updateProfile((p) => ({ ...p, house: { ...p.house, wife: { name: 'Anna', concern: '' } } })),
    );
    // With a wife: the family habits, but not yet those about children.
    expect(screen.getByRole('button', { name: 'Tischgebet mit der Familie, Do 24.9.' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Die Kinder segnen/ })).toBeNull();
  });

  it('keeps the usual habits in weeks the round does not touch', async () => {
    await renderToday('2026-09-25', (s) => s.startDesert('2026-10-05', 40));
    expect(document.querySelector('.habit-group-desert')).toBeNull();
    expect(screen.getByRole('button', { name: /^Gewohnheiten/ })).toBeTruthy();
  });

  it('lists the habits of the day to tick, above the week', async () => {
    const store = await renderToday('2026-09-24', (s) => {
      withHouse(s);
      s.updateDay('2026-09-21', (d) => ({ ...d, morning: { ...d.morning, done: true } }));
    });
    const day = within(screen.getByRole('region', { name: /^Gewohnheiten, Heute|^Gewohnheiten, Donnerstag/ }));
    const table = day.getByRole('checkbox', { name: 'Tischgebet mit der Familie' });
    expect(table.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(table);
    expect(store.getDay('2026-09-24').habits.tablePrayer).toBe(true);
    // From the orders: a tile above, not a second time in the list (0.40).
    expect(day.queryByRole('checkbox', { name: /^Stille Zeit/ })).toBeNull();
    expect(day.queryByRole('checkbox', { name: /^Vesper/ })).toBeNull();
    // The strip of the week chooses another day; its habits are listed in the same place.
    fireEvent.click(screen.getByRole('button', { name: 'Montag, 21. September' }));
    const monday = within(screen.getByRole('region', { name: 'Gewohnheiten, Montag, 21. September' }));
    // What was prayed that day shows in the grid of the week.
    expect(screen.getByRole('button', { name: 'Stille Zeit, Mo 21.9.' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(monday.getByRole('checkbox', { name: 'Tischgebet mit der Familie' }));
    expect(store.getDay('2026-09-21').habits.tablePrayer).toBe(true);
    // The grid of the week stays, folded away.
    expect(document.querySelector('details.habits-week')!.hasAttribute('open')).toBe(false);
  });

  it('leads from "Heute" to the Sunday of the week', async () => {
    await renderToday('2026-09-24');
    const link = screen.getByRole('link', { name: /Diese Woche/ });
    expect(link.textContent).toContain('16. Sonntag nach Trinitatis');
  });

  it('with Sunday rest shows the Sunday in place of the habits on a Sunday', async () => {
    await renderToday('2026-09-20', (s) => s.updateProfile((p) => ({ ...p, sundayRest: true })));
    const card = within(screen.getByRole('region', { name: /Sonntag nach Trinitatis/ }));
    expect(card.getByText('Sonntagsruhe')).toBeTruthy();
    expect(card.getByText('Evangelium')).toBeTruthy();
    expect(card.getByRole('link', { name: 'Mehr zu diesem Sonntag' })).toBeTruthy();
    expect(screen.queryByRole('region', { name: /^Gewohnheiten/ })).toBeNull();
    expect(document.querySelector('.sunday-link')).toBeNull();
  });

  it('with Sunday rest keeps the habits on weekdays, and lists none for the Sunday of the week', async () => {
    await renderToday('2026-09-24', (s) => s.updateProfile((p) => ({ ...p, sundayRest: true })));
    expect(document.querySelector('.sunday-rest')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Sonntag, 27. September' }));
    const sunday = within(screen.getByRole('region', { name: 'Gewohnheiten, Sonntag, 27. September' }));
    expect(sunday.getByText(/Sonntagsruhe/)).toBeTruthy();
    expect(sunday.queryAllByRole('checkbox')).toHaveLength(0);
    // The week grid has no cells to tick on Sunday.
    expect(screen.queryByRole('button', { name: /, So 27\.9\.$/ })).toBeNull();
  });

  it('without Sunday rest lists the habits on a Sunday as on any day', async () => {
    await renderToday('2026-09-20');
    expect(document.querySelector('.sunday-rest')).toBeNull();
    expect(screen.getByRole('region', { name: /^Gewohnheiten/ })).toBeTruthy();
  });
});
