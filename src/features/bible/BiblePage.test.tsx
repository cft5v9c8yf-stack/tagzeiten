// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { resetOpenState } from '../../ui/collapseState';
import { BiblePage } from './BiblePage';

beforeEach(() => {
  localStorage.clear();
  resetOpenState();
});
afterEach(cleanup);

let n = 0;
async function renderBible() {
  const store = new Store({ db: new TagzeitenDB(`bible-${++n}`), journal: memoryJournal(), now: () => new Date(2026, 8, 25, 9) });
  const router = createMemoryRouter([{ path: '/bibel', element: <BiblePage /> }], { initialEntries: ['/bibel'] });
  render(
    <ToastProvider>
      <StoreProvider store={store}>
        <RouterProvider router={router} />
      </StoreProvider>
    </ToastProvider>,
  );
  await screen.findByRole('heading', { name: 'Bibel' });
  return store;
}

describe('Bibel', () => {
  it('shows the reading of the day and what follows, without counts or dates', async () => {
    const store = await renderBible();
    expect(document.querySelector('.section-verse blockquote')!.textContent).toContain('Dein Wort ist meines Fußes Leuchte');
    await waitFor(() => expect(document.querySelectorAll('.reading-refs a').length).toBe(2));
    const next = document.querySelector('.next-portions')!;
    expect(next.querySelectorAll('.next-track')).toHaveLength(2);
    expect(next.querySelectorAll('li').length).toBe(10);
    // No "0 / 929", no progress bars, no backlog (rules 4, 6).
    expect(document.querySelector('progress')).toBeNull();
    expect(document.body.textContent).not.toMatch(/\d+ \/ \d+|Rückstand|nachholen\b(?!, nichts)/);

    // No checkbox here: the habit "Bibel lesen" marks the reading (on Today).
    expect(document.querySelector('input[type="checkbox"]')).toBeNull();
    const before = next.querySelector('li')!.textContent;
    const habit = store.getProfile().habits.find((h) => h.id === 'bibleReading')!;
    act(() => store.toggleHabit(store.today(), habit));
    await waitFor(() => expect(document.querySelector('.block-hero .fold-title')!.textContent).toBe('Heute lesen · gelesen'));
    expect(store.readingFor(store.today()).reading.done).toBe(true);
    expect(next.querySelector('li')!.textContent).toBe(before);
  });

  it('keeps the plan settings and the method behind their headings', async () => {
    await renderBible();
    const method = screen.getByRole('button', { name: 'So wird gelesen' });
    expect(method.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(method);
    await waitFor(() => expect(method.getAttribute('aria-expanded')).toBe('true'));
    expect(screen.getByText(/Hanniel/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Leseplan einstellen' }));
    await waitFor(() => expect(screen.getAllByText(/Nächste Lesung/).length).toBe(2));
  });

  it('offers a plan of one own: a book, and chapters or time a day; today follows', async () => {
    const store = await renderBible();
    await waitFor(() => expect(document.querySelectorAll('.reading-refs a').length).toBe(2));
    fireEvent.click(screen.getByRole('button', { name: 'Leseplan einstellen' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Eigener Plan' }));
    await waitFor(() => expect(document.querySelectorAll('.reading-refs a').length).toBe(1));

    fireEvent.change(screen.getByLabelText('Buch'), { target: { value: '42' } }); // Johannes
    await waitFor(() => expect(document.querySelector('.reading-refs a')!.textContent).toContain('Johannes 1–2'));
    fireEvent.change(screen.getByLabelText('Kapitel am Tag'), { target: { value: '3' } });
    await waitFor(() => expect(document.querySelector('.reading-refs a')!.textContent).toContain('Johannes 1–3'));

    fireEvent.click(screen.getByRole('button', { name: 'Zeit' }));
    fireEvent.change(await screen.findByLabelText('Minuten am Tag'), { target: { value: '10' } });
    // Johannes has about 42 verses a chapter: ten minutes are about one chapter.
    await waitFor(() => expect(document.querySelector('.reading-refs a')!.textContent).toBe('Etwa 10 MinutenJohannes 1'));
    expect(store.getProfile().plan.planId).toBe('eigen-m10');
    // Reading by time brings its own timer.
    expect(screen.getByRole('timer').textContent).toBe('10:00');
    expect(screen.getByRole('button', { name: 'Zeit starten' })).toBeTruthy();

    // Back to Old and New Testament: the view as before, the places kept.
    fireEvent.click(screen.getByRole('button', { name: 'AT und NT' }));
    await waitFor(() => expect(document.querySelectorAll('.reading-refs a').length).toBe(2));
    expect(screen.queryByRole('timer')).toBeNull();
    expect(screen.getAllByText(/Nächste Lesung/).length).toBe(2);
    expect(store.getProfile().plan.own).toBe('eigen-m10');
  });

  it('sets chapters a day for each Testament, and several books in a plan of one own', async () => {
    const store = await renderBible();
    await waitFor(() => expect(document.querySelectorAll('.reading-refs a').length).toBe(2));
    fireEvent.click(screen.getByRole('button', { name: 'Leseplan einstellen' }));
    fireEvent.change((await screen.findAllByLabelText('Kapitel am Tag'))[0]!, { target: { value: '3' } });
    await waitFor(() => expect(store.getProfile().plan.planId).toBe('atnt-3-1'));
    fireEvent.change(screen.getAllByLabelText('Kapitel am Tag')[1]!, { target: { value: '2' } });
    await waitFor(() => expect(document.querySelectorAll('.reading-refs a')[1]!.textContent).toContain('Matthäus 1–2'));
    expect(document.querySelectorAll('.reading-refs a')[0]!.textContent).toContain('1. Mose 1–3');

    fireEvent.click(screen.getByRole('button', { name: 'Eigener Plan' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Mehrere Bücher' }));
    // The second book starts with the Gospel according to Matthew.
    await waitFor(() => expect(document.querySelectorAll('.reading-refs a').length).toBe(2));
    expect(document.querySelectorAll('.reading-refs a')[1]!.textContent).toBe('2. LesungMatthäus 1');
    fireEvent.click(screen.getByRole('button', { name: 'Weiteres Buch hinzufügen' }));
    await waitFor(() => expect(document.querySelectorAll('.reading-refs a').length).toBe(3));
    expect(document.querySelectorAll('.reading-refs a')[2]!.textContent).toBe('3. LesungPsalm 1');
    fireEvent.click(screen.getAllByRole('button', { name: 'Dieses Buch entfernen' })[1]!);
    await waitFor(() => expect(document.querySelectorAll('.reading-refs a').length).toBe(2));
    expect(document.querySelectorAll('.reading-refs a')[1]!.textContent).toBe('2. LesungPsalm 1');

    // Each book by chapters or by time; the timer runs over the books read by time.
    expect(screen.queryByRole('timer')).toBeNull();
    fireEvent.click(within(screen.getByRole('group', { name: 'Maß der täglichen Lesung, 2. Lesung' })).getByRole('button', { name: 'Zeit' }));
    await waitFor(() => expect(store.getProfile().plan.planId).toBe('eigen-k2.m15'));
    expect(document.querySelectorAll('.reading-refs a')[1]!.textContent).toBe('2. Lesung · 15 Min.Psalm 1–5');
    expect(screen.getByRole('timer').textContent).toBe('15:00');

    // Back to Old and New Testament, with the amounts left there.
    fireEvent.click(screen.getByRole('button', { name: 'AT und NT' }));
    await waitFor(() => expect(store.getProfile().plan.planId).toBe('atnt-3-2'));
    expect(screen.queryByRole('timer')).toBeNull();
  });
});
