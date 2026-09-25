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
async function renderEvening(date: string) {
  const store = new Store({ db: new TagzeitenDB(`evening-${date}-${++n}`), journal: memoryJournal() });
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
  await screen.findByText('Nachtgebet');
  return store;
}

const chainOf = (name: string) => screen.getByRole('navigation', { name: `Ablauf: ${name}` });
const openPage = async (order: string, title: RegExp | string) => {
  fireEvent.click(within(chainOf(order)).getByRole('button', { name: title }));
  await screen.findByRole('heading', { name: title, level: 3 });
};

describe('Nachtgebet', () => {
  it('runs review before examination, with confession and absolution on the examination page (rules 1, 3)', async () => {
    await renderEvening('2026-09-24');
    const names = within(chainOf('Nachtgebet'))
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label'));
    expect(names.indexOf('Rückschau')).toBeLessThan(names.indexOf('Prüfung, Bekenntnis und Zuspruch'));
    expect(names).not.toContain('Bekenntnis und Zuspruch');

    await openPage('Nachtgebet', 'Prüfung, Bekenntnis und Zuspruch');
    const page = document.querySelector('.compline .flow-step')!;
    expect(page.querySelectorAll('input, textarea, select')).toHaveLength(0);
    expect(page.textContent).toContain('Wird gebetet, nicht notiert.');
    expect(page.textContent).toContain('1. Johannes 1,9');
    // The absolution never folds away (rule 1).
    expect(screen.queryByRole('button', { name: 'Zuspruch' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Zuspruch' })).toBeTruthy();
  });

  it('shows one step at a time and moves on step by step to the end', async () => {
    const store = await renderEvening('2026-09-24');
    const flow = () => document.querySelector('.compline .flow-step')!;
    expect(document.querySelectorAll('.compline .flow-step')).toHaveLength(1);
    expect(flow().querySelector('h3')!.textContent).toBe('Kreuzzeichen');
    fireEvent.click(screen.getByRole('button', { name: 'Weiter zu: Glaubensbekenntnis' }));
    await waitFor(() => expect(flow().querySelector('h3')!.textContent).toBe('Glaubensbekenntnis'));
    const current = within(chainOf('Nachtgebet')).getByRole('button', { name: 'Glaubensbekenntnis' });
    expect(current.getAttribute('aria-current')).toBe('step');
    // No times and no "gebetet" labels in the row.
    expect(chainOf('Nachtgebet').textContent).not.toMatch(/Min\.|gebetet/);

    await openPage('Nachtgebet', 'Abendsegen');
    fireEvent.click(screen.getByRole('button', { name: 'Tag abschließen' }));
    await waitFor(() => expect(store.getDay('2026-09-24').evening.complineDone).toBe(true));
    expect(screen.getByText('Tag abgeschlossen.')).toBeTruthy();
  });

  it('keeps the whole Nachtgebet foldable under its heading', async () => {
    await renderEvening('2026-09-24');
    fireEvent.click(screen.getByRole('button', { name: 'Nachtgebet' }));
    await waitFor(() => expect(document.querySelector('.compline .flow')!.closest('[hidden]')).not.toBeNull());
    expect(JSON.parse(localStorage.getItem('tz:collapsed')!)).toMatchObject({ 'evening.compline': false });
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
    await openPage('Nachtgebet', 'Prüfung, Bekenntnis und Zuspruch');
    expect(screen.getByText('Als Prediger und Bruder in der Gemeinde:')).toBeTruthy();
    cleanup();
    await renderEvening('2026-09-25'); // Friday
    await openPage('Nachtgebet', 'Prüfung, Bekenntnis und Zuspruch');
    expect(screen.getByText('Gegenüber dem Nächsten:')).toBeTruthy();
    expect(screen.getByText('Wem bin ich heute die Liebe schuldig geblieben?')).toBeTruthy();
  });

  it('never calls a missed resolution sin in the review', async () => {
    await renderEvening('2026-09-23');
    await openPage('Nachtgebet', 'Rückschau');
    const review = document.querySelector('.compline .flow-step .part-review')!;
    expect(review.textContent).toContain('Ein nicht erreichtes Ziel ist keine Sünde.');
    expect(review.textContent).not.toMatch(/bekenn|schuldig/i);
  });
});

describe('Vesper', () => {
  it('goes through its parts one at a time and closes on the last', async () => {
    const store = await renderEvening('2026-09-24');
    const names = within(chainOf('Vesper')).getAllByRole('button');
    expect(names.length).toBeGreaterThan(5);
    fireEvent.click(names.at(-1)!);
    fireEvent.click(await screen.findByRole('button', { name: 'Vesper abschließen' }));
    await waitFor(() => expect(store.getDay('2026-09-24').evening.vespersDone).toBe(true));
    expect(screen.getByText('Vesper gebetet.')).toBeTruthy();
  });
});
