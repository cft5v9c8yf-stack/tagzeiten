// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

async function renderEvening(date: string) {
  const store = new Store({ db: new TagzeitenDB(`evening-${date}`), journal: memoryJournal() });
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

describe('Nachtgebet', () => {
  it('runs review → examination → confession → absolution, without a field in the examination', async () => {
    await renderEvening('2026-09-24');
    const steps = [...document.querySelectorAll('.compline-step')];
    const ids = steps.map((s) => [...s.classList].find((c) => c.startsWith('step-')));
    expect(ids.indexOf('step-review')).toBeLessThan(ids.indexOf('step-examination'));
    expect(ids[ids.indexOf('step-examination') + 1]).toBe('step-confession');

    const exam = document.querySelector('.step-examination')!;
    expect(exam.querySelectorAll('input, textarea, select')).toHaveLength(0);
    expect(exam.textContent).toContain('Wird gebetet, nicht notiert.');

    const confession = document.querySelector('.step-confession')!;
    expect(confession.querySelectorAll('input, textarea, select')).toHaveLength(0);
    expect(confession.textContent).toContain('1. Johannes 1,9');
  });

  it('folds headings and remembers it, but never folds away the absolution (rule 1)', async () => {
    await renderEvening('2026-09-24');
    const exam = screen.getByRole('button', { name: 'Prüfung am Dekalog in deinem Stand' });
    fireEvent.click(exam);
    await waitFor(() => expect(exam.getAttribute('aria-expanded')).toBe('false'));
    expect(JSON.parse(localStorage.getItem('tz:collapsed')!)).toMatchObject({ 'part.compline.step.examination': false });

    // Confession and absolution stand as plain headings, always open.
    expect(screen.queryByRole('button', { name: 'Bekenntnis und Zuspruch' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Zuspruch' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Zuspruch' })).toBeTruthy();

    // Folding the whole Nachtgebet hides examination and absolution together.
    fireEvent.click(screen.getByRole('button', { name: 'Nachtgebet' }));
    await waitFor(() => expect(document.querySelector('.step-confession')!.closest('[hidden]')).not.toBeNull());
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
    expect(screen.getByText('Als Prediger und Bruder in der Gemeinde:')).toBeTruthy();
  });

  it('never calls a missed resolution sin in the review', async () => {
    await renderEvening('2026-09-23');
    const review = document.querySelector('.step-review')!;
    expect(review.textContent).toContain('Ein nicht erreichtes Ziel ist keine Sünde.');
    expect(review.textContent).not.toMatch(/bekenn|schuldig/i);
  });
});
