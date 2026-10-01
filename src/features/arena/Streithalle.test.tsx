// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
  const router = createMemoryRouter(
    [
      { path: '/arena', element: <ArenaPage /> },
      { path: '/arena/:eintrag', element: <ArenaPage /> },
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
  await screen.findAllByRole('heading', { level: 2 });
  return store;
}

const tab = (name: string) =>
  fireEvent.click(within(screen.getByRole('group', { name: 'Ansicht der Streithalle' })).getByRole('button', { name }));


describe('Streithalle', () => {
  it('stands in the Arena as a third place and invites to begin a round', async () => {
    const store = await renderArena('/arena');
    const tiles = [...document.querySelectorAll('.arena-place-title')].map((t) => t.textContent);
    expect(tiles).toEqual(['Gebetskammer', 'Eisenschmiede', 'Streithalle']);
    expect(screen.getByRole('link', { name: /^Streithalle/ }).textContent).toContain('Keine Runde – eine beginnen');
    fireEvent.click(screen.getByRole('link', { name: /^Streithalle/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Streithalle' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Runde beginnen' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Runde beginnen' }));
    expect(store.getProfile().winterArc.runs).toHaveLength(1);
    expect(document.querySelector('.wa-head')!.textContent).toContain('Tag 1 von 90');
  });

  it('shows the round on its tile, and the guide in the Streithalle', async () => {
    await renderArena('/arena', (s) => s.startWinterArc('2026-09-14', 90));
    // The Gebetskammer stays first.
    expect(document.querySelector('.arena-place-title')!.textContent).toBe('Gebetskammer');
    expect(screen.getByRole('link', { name: /^Streithalle/ }).textContent).toContain('Winter Arc · Tag 13 von 90');
    fireEvent.click(screen.getByRole('link', { name: /^Streithalle/ }));
    const hall = document.querySelector('.streithalle')!;
    // Word first: Psalm 144,1 above the plan.
    expect(hall.querySelector('.wa-verse')!.textContent).toContain('der meine Hände lehrt streiten');
    expect(hall.firstElementChild!.classList.contains('wa-verse')).toBe(true);
    tab('Anleitung');
    const parts = [...hall.querySelectorAll('.wa-guide .tile-card-title')].map((t) => t.textContent);
    expect(parts).toEqual([
      'Worum es geht',
      'Die vier Regeln',
      'Der Tagesstandard',
      'Der Wochenstandard',
      'Die drei Phasen',
      'Tag 90 – und danach',
    ]);
    fireEvent.click(screen.getByRole('button', { name: /^Die drei Phasen/ }));
    // 26 September is day 13 of a round from 14 September: week 2.
    const current = hall.querySelector('.wa-week[aria-current="true"]')!;
    expect(current.textContent).toContain('Woche 2');
    expect(current.textContent).toContain('Den Morgen gewinnen');
    expect(hall.querySelectorAll('.wa-week')).toHaveLength(13);
  });

  it('marks no week before the round has begun', async () => {
    await renderArena('/arena?bereich=streithalle', (s) => s.startWinterArc('2026-10-05', 90));
    // Before the start the guide stands open.
    fireEvent.click(screen.getByRole('button', { name: /^Die drei Phasen/ }));
    expect(document.querySelector('.wa-week[aria-current]')).toBeNull();
  });

  it('shows where the round stands, the verse before the task', async () => {
    await renderArena('/arena?bereich=streithalle', (s) => s.startWinterArc('2026-09-14', 90));
    const head = document.querySelector('.wa-head')!;
    expect(head.textContent).toContain('Tag 13 von 90');
    expect(head.textContent).toContain('Disziplin');
    expect(head.textContent).toContain('Woche 2 von 13');
    expect(head.textContent).toContain('Den Morgen gewinnen');
    const verse = head.querySelector('.wa-verse')!;
    const task = head.querySelector('.wa-head-task')!;
    expect(verse.textContent).toContain('HERR, frühe wollest du meine Stimme hören.');
    expect(task.textContent).toContain('Um 04:00 auf, ohne zu verhandeln.');
    expect(verse.compareDocumentPosition(task) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('ticks today by hand, and only hints at the morning prayer', async () => {
    const store = await renderArena('/arena?bereich=streithalle', (s) => {
      s.startWinterArc('2026-09-14', 90);
      s.updateDay(s.today(), (d) => ({ ...d, morning: { ...d.morning, done: true } }));
    });
    const run = store.getProfile().winterArc.runs[0]!;
    const today = within(document.querySelector('.wa-day') as HTMLElement);
    expect(today.getByText('Das Morgengebet hast du heute schon gebetet – abhaken?')).toBeTruthy();
    const word = today.getByRole('checkbox', { name: 'Morgenzeit im Wort und Gebet' });
    expect(word.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(word);
    expect(store.getProfile().winterArc.days[0]).toMatchObject({
      runId: run.id,
      date: '2026-09-26',
      checks: { word: true },
    });
    expect(today.queryByText('Das Morgengebet hast du heute schon gebetet – abhaken?')).toBeNull();
    fireEvent.click(today.getByRole('checkbox', { name: 'Morgenzeit im Wort und Gebet' }));
    expect(store.getProfile().winterArc.days[0]!.checks).toEqual({});
    // 26 September 2026 is a Saturday: rest from training, no work blocks.
    expect(today.queryByRole('checkbox', { name: 'Trainiert' })).toBeNull();
    expect(document.querySelector('.wa-day')!.textContent).toContain('RuheTrainiert');
    // Without a wife under "Mein Haus" the points about her wait.
    expect(document.querySelector('.wa-day')!.textContent).not.toContain('Eine Geste für meine Frau');
    // The work blocks of the tracker are left out.
    expect(document.querySelector('.wa-day')!.textContent).not.toContain('Fokusblock');
  });

  it('shows the week as a grid with the real weekdays; past days can be filled in', async () => {
    const store = await renderArena('/arena?bereich=streithalle', (s) => s.startWinterArc('2026-09-15', 90));
    tab('Woche');
    const grid = document.querySelector('.wa-grid')!;
    // The week runs from the start (a Tuesday), not from Monday.
    expect([...grid.querySelectorAll('thead th span:first-child')].map((t) => t.textContent)).toEqual([
      'Di',
      'Mi',
      'Do',
      'Fr',
      'Sa',
      'So',
      'Mo',
    ]);
    const past = screen.getByRole('button', { name: 'Trainiert, Dienstag, 22.9.' });
    fireEvent.click(past);
    expect(past.getAttribute('aria-pressed')).toBe('true');
    expect(store.getProfile().winterArc.days.find((d) => d.date === '2026-09-22')!.checks).toEqual({ train: true });
    expect(
      (screen.getByRole('button', { name: '04:00 auf, kein Handy, Sonntag, 27.9.' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('greys out the days after the end of a short round', async () => {
    // Nine days from 19 September: today (26th) is in week 2, which has two days in the round, five outside.
    await renderArena('/arena?bereich=streithalle', (s) => s.startWinterArc('2026-09-19', 9));
    tab('Woche');
    const outside = document.querySelectorAll('.wa-grid thead th.is-outside');
    expect(outside).toHaveLength(5);
    expect(document.querySelector('.wa-grid td.is-outside button')).toBeNull();
  });

  it('counts the monthly point for every week of the calendar month', async () => {
    const store = await renderArena('/arena?bereich=streithalle', (s) => s.startWinterArc('2026-09-14', 90));
    tab('Woche');
    const served = () => screen.getByRole('checkbox', { name: /^Gedient \(einmal im Monat\)\s*·\s*September$/ });
    fireEvent.click(served());
    expect(store.getProfile().winterArc.months).toMatchObject([{ month: '2026-09', served: true }]);
    fireEvent.click(screen.getByRole('button', { name: 'Frühere Woche' }));
    expect(screen.getByRole('heading', { name: /^Woche 1/ })).toBeTruthy();
    expect(served().getAttribute('aria-checked')).toBe('true');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Gottesdienst und Sonntagsruhe' }));
    expect(store.getProfile().winterArc.weeks).toMatchObject([{ week: 1, weeklyChecks: { church: true } }]);
  });

  it('asks for the weekly review on the last day of a week, ending in the word of comfort', async () => {
    const store = await renderArena('/arena?bereich=streithalle', (s) => s.startWinterArc('2026-09-14', 90));
    tab('Woche');
    // 26 September is the sixth day of week 2: no review yet.
    expect(document.querySelector('.wa-review')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Frühere Woche' }));
    const review = document.querySelector('.wa-review') as HTMLElement;
    fireEvent.change(within(review).getByLabelText('Ein Sieg dieser Woche'), { target: { value: 'Jeden Morgen auf' } });
    within(review).getByLabelText('Das Kästchen, das ich schleifen ließ');
    within(review).getByLabelText('Was Gott mich lehrt');
    expect(store.getProfile().winterArc.weeks[0]!.review.win).toBe('Jeden Morgen auf');
    expect(review.lastElementChild!.textContent).toContain('sie ist alle Morgen neu, und deine Treue ist groß.');
  });

  it('never marks anything in red or as a streak', async () => {
    await renderArena('/arena?bereich=streithalle', (s) => s.startWinterArc('2026-09-14', 90));
    const hall = document.querySelector('.streithalle')!;
    expect(hall.querySelector('[class*="danger"], [class*="rubric"], [class*="warn"]')).toBeNull();
    expect(hall.textContent).not.toMatch(/in Folge|Streak|%/i);
    const css = readFileSync(resolve(process.cwd(), 'src/styles/pages.css'), 'utf8');
    const waRules = css.slice(css.indexOf('Streithalle (Winter Arc)'));
    expect(waRules).not.toMatch(/rubric|danger|rose-red|warn|#[a-f0-9]{3,6}/i);
  });

  it('shows the closing page after the last day, with the reviews, a new round and the export', async () => {
    const store = await renderArena('/arena?bereich=streithalle', (s) => {
      s.startWinterArc('2026-06-01', 90);
      const run = s.getProfile().winterArc.runs[0]!;
      s.setWinterArcReview(run.id, 3, 'lesson', 'Er trägt mich.');
    });
    const closing = document.querySelector('.wa-closing') as HTMLElement;
    expect(closing.textContent).toContain('Vor 90 Tagen war das eine Liste.');
    expect(closing.textContent).toContain('Woche 3 · Die Arbeit schützen');
    expect(closing.textContent).toContain('Er trägt mich.');
    expect(closing.querySelector('.wa-reviews')!.lastElementChild!.textContent).toContain('alle Morgen neu');
    expect(document.querySelector('.wa-day')).toBeNull();
    expect(within(closing).getByRole('button', { name: 'Als Markdown exportieren' })).toBeTruthy();
    fireEvent.click(within(closing).getByRole('button', { name: 'Neue Runde starten' }));
    fireEvent.click(within(closing).getByRole('button', { name: 'Runde beginnen' }));
    expect(store.getProfile().winterArc.runs.map((r) => r.status)).toEqual(['ended', 'active']);
    expect(document.querySelector('.wa-closing')).toBeNull();
    expect(document.querySelector('.wa-head')!.textContent).toContain('Tag 1 von 90');
  });

  it('pages through the days of the round to fill in what was', async () => {
    const store = await renderArena('/arena?bereich=streithalle', (s) => s.startWinterArc('2026-09-24', 90));
    // Later days of the round can be seen, but are ticked only when they come.
    fireEvent.click(screen.getByRole('button', { name: 'Folgetag' }));
    expect(screen.getByRole('heading', { name: /^Sonntag, 27\. September/ })).toBeTruthy();
    expect(screen.getByText('Dieser Tag liegt noch vor dir. Abhaken kannst du erst an ihm.')).toBeTruthy();
    expect((screen.getByRole('checkbox', { name: '04:00 auf, kein Handy' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Zu heute' }));
    fireEvent.click(screen.getByRole('button', { name: 'Vortag' }));
    expect(screen.getByRole('heading', { name: /^Freitag, 25\. September/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox', { name: '04:00 auf, kein Handy' }));
    expect(store.getProfile().winterArc.days).toMatchObject([{ date: '2026-09-25', checks: { wake: true } }]);
    fireEvent.click(screen.getByRole('button', { name: 'Vortag' }));
    // The start is the first day there is.
    expect((screen.getByRole('button', { name: 'Vortag' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Zu heute' }));
    expect(screen.getByRole('heading', { name: /^Heute/ })).toBeTruthy();
  });

  it('lets the journal be written right there, or in the Gebetskammer', async () => {
    const store = await renderArena('/arena?bereich=streithalle', (s) => s.startWinterArc('2026-09-14', 90));
    fireEvent.click(screen.getByRole('button', { name: 'Aufschreiben' }));
    fireEvent.change(screen.getByLabelText('Der Satz, der mich trifft'), { target: { value: 'Seid stark' } });
    fireEvent.change(screen.getByLabelText('Ich danke dir, mein Gott, für …'), { target: { value: 'den Morgen' } });
    expect(store.getDay('2026-09-26').morning.verse).toBe('Seid stark');
    expect(store.getDay('2026-09-26').evening.thanks[0]).toBe('den Morgen');
    fireEvent.click(screen.getByRole('button', { name: 'Lieber in der Gebetskammer schreiben' }));
    expect(store.getProfile().arena).toHaveLength(1);
    expect(await screen.findByText(/Gebetskammer/)).toBeTruthy();
  });

  it('leaves out the points switched off', async () => {
    await renderArena('/arena?bereich=streithalle', (s) => {
      s.startWinterArc('2026-09-14', 90);
      s.updateProfile((p) => ({ ...p, winterArcSettings: { ...p.winterArcSettings, off: ['train', 'money', 'serve'] } }));
    });
    expect(screen.queryByRole('checkbox', { name: 'Trainiert' })).toBeNull();
    expect(document.querySelector('.wa-day')!.textContent).not.toContain('Trainiert');
    tab('Woche');
    expect(document.querySelector('.wa-grid')!.textContent).not.toContain('Trainiert');
    expect(screen.queryByRole('checkbox', { name: '15 Minuten Finanzen' })).toBeNull();
    expect(screen.queryByRole('checkbox', { name: /^Gedient/ })).toBeNull();
    expect(screen.getByRole('checkbox', { name: 'Gottesdienst und Sonntagsruhe' })).toBeTruthy();
  });
});
