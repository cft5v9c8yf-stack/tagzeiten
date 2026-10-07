// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { resetOpenState } from '../../ui/collapseState';
import { EveningPage } from './EveningPage';

beforeEach(() => {
  localStorage.clear();
  resetOpenState();
});
afterEach(cleanup);

let n = 0;
async function renderEvening(date: string, prepare?: (s: Store) => void) {
  const store = new Store({ db: new TagzeitenDB(`evening-${date}-${++n}`), journal: memoryJournal() });
  if (prepare) {
    await store.load();
    prepare(store);
    await store.flush();
  }
  const router = createMemoryRouter([{ path: '/abend', element: <EveningPage /> }], {
    initialEntries: [`/abend?d=${date}`],
  });
  render(
    <ToastProvider>
      <StoreProvider store={store}>
        <RouterProvider router={router} />
      </StoreProvider>
    </ToastProvider>,
  );
  await screen.findByRole('heading', { level: 2, name: /^(Vesper|Nachtgebet)$/ });
  return store;
}

const chainOf = (name: string) => screen.getByRole('navigation', { name: `Ablauf: ${name}` });
/** One row at a time: the Vesper's row ends with the Nachtgebet, the Nachtgebet's begins with the Vesper. */
const openCompline = async () => {
  if (screen.queryByRole('navigation', { name: 'Ablauf: Nachtgebet' })) return;
  fireEvent.click(within(chainOf('Vesper')).getByRole('button', { name: /^Nachtgebet/ }));
  await screen.findByRole('navigation', { name: 'Ablauf: Nachtgebet' });
};
const openVespers = async () => {
  if (screen.queryByRole('navigation', { name: 'Ablauf: Vesper' })) return;
  fireEvent.click(within(chainOf('Nachtgebet')).getByRole('button', { name: /^Vesper/ }));
  await screen.findByRole('navigation', { name: 'Ablauf: Vesper' });
};
const openPage = async (order: string, title: RegExp | string) => {
  await (order === 'Nachtgebet' ? openCompline() : openVespers());
  fireEvent.click(within(chainOf(order)).getByRole('button', { name: title }));
  await screen.findByRole('heading', { name: title, level: 3 });
};

describe('Nachtgebet', () => {
  it('runs review before examination, with confession and absolution on the examination page (rules 1, 3)', async () => {
    await renderEvening('2026-09-24');
    await openCompline();
    const names = within(chainOf('Nachtgebet'))
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label'));
    // Four pages after the Vesper: few marks, review before examination (rule 3).
    expect(names).toEqual(['Vesper', 'Kreuz, Glaube, Vaterunser', 'Dank und Rückschau', 'Prüfung und Zuspruch', 'Abendsegen']);

    await openPage('Nachtgebet', 'Prüfung und Zuspruch');
    const page = document.querySelector('.compline .flow-step')!;
    expect(page.querySelectorAll('input, textarea, select')).toHaveLength(0);
    expect(page.textContent).toContain('Wird gebetet, nicht notiert.');
    expect(page.textContent).toContain('1. Johannes 1,9');
    // The question of the armour is prayed here, before confession and absolution (rules 1–3).
    expect(page.textContent).toContain('Der Schild des Glaubens:');
    // The absolution never folds away (rule 1).
    expect(screen.queryByRole('button', { name: 'Zuspruch' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Zuspruch' })).toBeTruthy();
  });

  it('shows one step at a time and moves on step by step to the end', async () => {
    const store = await renderEvening('2026-09-24');
    await openCompline();
    const flow = () => document.querySelector('.compline .flow-step')!;
    expect(document.querySelectorAll('.compline .flow-step')).toHaveLength(1);
    expect(flow().querySelector('h3')!.textContent).toBe('Kreuz, Glaube, Vaterunser');
    expect(flow().textContent).toContain('Seid nüchtern und wachet');
    expect(flow().textContent).toContain('Glaubensbekenntnis');
    fireEvent.click(screen.getByRole('button', { name: 'Weiter zu: Dank und Rückschau' }));
    await waitFor(() => expect(flow().querySelector('h3')!.textContent).toBe('Dank und Rückschau'));
    const current = within(chainOf('Nachtgebet')).getByRole('button', { name: 'Dank und Rückschau' });
    expect(current.getAttribute('aria-current')).toBe('step');
    // No times and no "gebetet" labels in the row.
    expect(chainOf('Nachtgebet').textContent).not.toMatch(/Min\.|gebetet/);

    await openPage('Nachtgebet', 'Abendsegen');
    fireEvent.click(screen.getByRole('button', { name: 'Tag abschließen' }));
    await waitFor(() => expect(store.getDay('2026-09-24').evening.complineDone).toBe(true));
    expect(screen.getByText('Tag abgeschlossen.')).toBeTruthy();
  });

  it('omits the Halleluja in Passiontide only', async () => {
    await renderEvening('2026-03-10');
    const vespers = document.querySelector('.vespers')!;
    expect(vespers.textContent).not.toContain('Halleluja.');
    expect(vespers.textContent).toContain('Passionszeit: Das Halleluja entfällt.');
    cleanup();
    await renderEvening('2026-06-10');
    expect(document.querySelector('.vespers')!.textContent).toContain('Halleluja.');
  });

  it('asks the station of the weekday', async () => {
    await renderEvening('2026-09-24'); // Thursday
    await openPage('Nachtgebet', 'Prüfung und Zuspruch');
    expect(screen.getByText('Als Prediger und Bruder in der Gemeinde:')).toBeTruthy();
    cleanup();
    await renderEvening('2026-09-25'); // Friday
    await openPage('Nachtgebet', 'Prüfung und Zuspruch');
    expect(screen.getByText('Gegenüber dem Nächsten:')).toBeTruthy();
    expect(screen.getByText('Wem bin ich heute die Liebe schuldig geblieben?')).toBeTruthy();
  });

  it('never calls a missed resolution sin in the review', async () => {
    await renderEvening('2026-09-23');
    await openPage('Nachtgebet', 'Dank und Rückschau');
    const review = document.querySelector('.compline .flow-step .part-review')!;
    expect(review.textContent).toContain('Ein nicht erreichtes Ziel ist keine Sünde.');
    expect(review.textContent).not.toMatch(/bekenn|schuldig/i);
    // The longer writing of the day belongs in the Gebetskammer.
    expect(screen.getByRole('button', { name: 'In der Gebetskammer weiterschreiben' })).toBeTruthy();
  });
});

describe('Vesper', () => {
  it('goes through its parts one at a time and leads on to the Nachtgebet as the last mark', async () => {
    const store = await renderEvening('2026-09-24');
    await openVespers();
    const buttons = within(chainOf('Vesper')).getAllByRole('button');
    expect(buttons.at(-1)!.getAttribute('aria-label')).toBe('Nachtgebet');
    // Three pages: praise, Word, prayer – then the Nachtgebet.
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['Lob', 'Wort', 'Gebet', 'Nachtgebet']);
    fireEvent.click(buttons[0]!);
    expect(document.querySelector('.flow-step h3')!.textContent).toBe('Lob');
    expect(document.querySelector('.flow-step')!.textContent).toContain('Eröffnung');
    fireEvent.click(buttons.at(-2)!);
    fireEvent.click(await screen.findByRole('button', { name: 'Vesper abschließen' }));
    await waitFor(() => expect(store.getDay('2026-09-24').evening.vespersDone).toBe(true));
    // On to the Nachtgebet: its row begins with the Vesper, now prayed.
    await screen.findByRole('navigation', { name: 'Ablauf: Nachtgebet' });
    expect(screen.queryByRole('navigation', { name: 'Ablauf: Vesper' })).toBeNull();
    expect(within(chainOf('Nachtgebet')).getAllByRole('button')[0]!.getAttribute('aria-label')).toBe('Vesper, gebetet');
  });

  it('writes the names of the day once: in the Nachtgebet, not also in the Vesper', async () => {
    await renderEvening('2026-09-24');
    await openPage('Vesper', 'Gebet');
    expect(screen.queryByLabelText('Fürbitte')).toBeNull();
    expect(document.querySelector('.flow-step')!.textContent).toContain('Die Namen des Tages notierst du im Nachtgebet.');
    cleanup();
    // Without the Nachtgebet, the Vesper keeps its field.
    await renderEvening('2026-09-24', (s) => s.updateProfile((p) => ({ ...p, showCompline: false }), { immediate: true }));
    await openPage('Vesper', 'Gebet');
    expect(screen.getByLabelText('Fürbitte')).toBeTruthy();
  });

  it('is the personal close of the day, without a family mode', async () => {
    await renderEvening('2026-09-24');
    await openVespers();
    expect(screen.queryByRole('switch')).toBeNull();
    expect(document.querySelector('.vespers')!.textContent).toContain('für dich allein');
  });
});

describe('Evening without the Nachtgebet', () => {
  const noCompline = (s: Store) => s.updateProfile((p) => ({ ...p, showCompline: false }), { immediate: true });

  it('ends the Vesper with review, then examination with confession and absolution, and closes the day (rules 1, 3)', async () => {
    const store = await renderEvening('2026-09-24', noCompline);
    const names = within(chainOf('Vesper'))
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label') ?? b.textContent);
    expect(names.join(' | ')).not.toMatch(/Nachtgebet/);
    const review = names.findIndex((x) => /Rückschau/.test(x!));
    const exam = names.findIndex((x) => /Prüfung und Zuspruch/.test(x!));
    expect(review).toBeGreaterThan(0);
    expect(exam).toBe(names.length - 1);
    expect(review).toBeLessThan(exam);

    fireEvent.click(within(chainOf('Vesper')).getByRole('button', { name: /Prüfung und Zuspruch/ }));
    await screen.findByRole('heading', { name: 'Prüfung und Zuspruch', level: 3 });
    expect(screen.getByText('Wird gebetet, nicht notiert.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Tag abschließen' }));
    await waitFor(() => expect(store.getDay('2026-09-24').evening.vespersDone).toBe(true));
    expect(screen.queryByRole('button', { name: /Weiter zum Nachtgebet/ })).toBeNull();
  });

  it('reads a devotion instead of the reading, with a growing field for what became important', async () => {
    localStorage.clear();
    const store = await renderEvening('2026-09-24');
    await openPage('Vesper', 'Wort');
    const choice = within(screen.getByRole('group', { name: 'Was du liest' }));
    fireEvent.click(choice.getByRole('button', { name: 'Andacht' }));
    fireEvent.change(screen.getByLabelText('Welche Andacht?'), { target: { value: 'Walther, Licht des Lebens' } });
    const notes = screen.getByLabelText('Was mir wichtig geworden ist') as HTMLTextAreaElement;
    expect(notes.rows).toBe(4);
    fireEvent.change(notes, { target: { value: 'Seine Gnade ist alle Morgen neu.' } });
    await waitFor(() => expect(store.getDay('2026-09-24').evening.devotionNotes).toBe('Seine Gnade ist alle Morgen neu.'));
    expect(store.getDay('2026-09-24').evening.devotion).toBe('Walther, Licht des Lebens');
    // The reading of Scripture stays one tap away.
    fireEvent.click(choice.getByRole('button', { name: 'Lesung' }));
    expect(screen.getByLabelText('Lesung – wenige Verse, ohne Auslegung')).toBeTruthy();
  });
});
