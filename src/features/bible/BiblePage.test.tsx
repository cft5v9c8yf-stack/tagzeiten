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
  await screen.findByRole('heading', { level: 2, name: 'Wort' });
  return store;
}

describe('Bibel', () => {
  it('shows the reading of the day and what follows, without counts or dates', async () => {
    const store = await renderBible();
    expect(document.querySelector('.section-verse blockquote')!.textContent).toContain('Dein Wort ist meines Fußes Leuchte');
    await waitFor(() => expect(document.querySelectorAll('.reading-refs .ref').length).toBe(2));
    const next = document.querySelector('.next-portions')!;
    expect(next.querySelectorAll('.next-track')).toHaveLength(2);
    expect(next.querySelectorAll('li').length).toBe(10);
    // No "0 / 929", no progress bars, no backlog (rules 4, 6).
    expect(document.querySelector('progress')).toBeNull();
    expect(document.body.textContent).not.toMatch(/\d+ \/ \d+|Rückstand|nachholen\b(?!, nichts)/);

    // The habit "Bibel lesen" (on Today) and the tick here mark the same reading.
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
    await waitFor(() => expect(document.querySelectorAll('.reading-refs .ref').length).toBe(2));
    fireEvent.click(screen.getByRole('button', { name: 'Leseplan einstellen' }));
    fireEvent.change(await screen.findByLabelText('Leseplan'), { target: { value: 'own' } });
    await waitFor(() => expect(document.querySelectorAll('.reading-refs .ref').length).toBe(1));

    fireEvent.change(screen.getByLabelText('Buch'), { target: { value: '42' } }); // Johannes
    await waitFor(() => expect(document.querySelector('.reading-refs .ref')!.textContent).toContain('Johannes 1–2'));
    fireEvent.change(screen.getByLabelText('Kapitel am Tag'), { target: { value: '3' } });
    await waitFor(() => expect(document.querySelector('.reading-refs .ref')!.textContent).toContain('Johannes 1–3'));

    fireEvent.click(screen.getByRole('button', { name: 'Zeit' }));
    fireEvent.change(await screen.findByLabelText('Minuten am Tag'), { target: { value: '10' } });
    // Johannes has about 42 verses a chapter: ten minutes are about one chapter.
    await waitFor(() => expect(document.querySelector('.reading-refs .ref')!.textContent).toBe('Etwa 10 MinutenJohannes 1'));
    expect(store.getProfile().plan.planId).toBe('eigen-m10');
    // Reading by time brings its own timer.
    expect(screen.getByRole('timer').textContent).toBe('10:00');
    expect(screen.getByRole('button', { name: 'Zeit starten' })).toBeTruthy();

    // Back to Old and New Testament: the view as before, the places kept.
    fireEvent.change(screen.getByLabelText('Leseplan'), { target: { value: 'fixed' } });
    await waitFor(() => expect(document.querySelectorAll('.reading-refs .ref').length).toBe(2));
    expect(screen.queryByRole('timer')).toBeNull();
    expect(screen.getAllByText(/Nächste Lesung/).length).toBe(2);
    expect(store.getProfile().plan.own).toBe('eigen-m10');
  });

  it('sets chapters a day for each Testament, and several books in a plan of one own', async () => {
    const store = await renderBible();
    await waitFor(() => expect(document.querySelectorAll('.reading-refs .ref').length).toBe(2));
    fireEvent.click(screen.getByRole('button', { name: 'Leseplan einstellen' }));
    fireEvent.change((await screen.findAllByLabelText('Kapitel am Tag'))[0]!, { target: { value: '3' } });
    await waitFor(() => expect(store.getProfile().plan.planId).toBe('atnt-3-1'));
    fireEvent.change(screen.getAllByLabelText('Kapitel am Tag')[1]!, { target: { value: '2' } });
    await waitFor(() => expect(document.querySelectorAll('.reading-refs .ref')[1]!.textContent).toContain('Matthäus 1–2'));
    expect(document.querySelectorAll('.reading-refs .ref')[0]!.textContent).toContain('1. Mose 1–3');

    fireEvent.change(screen.getByLabelText('Leseplan'), { target: { value: 'own' } });
    fireEvent.click(await screen.findByRole('button', { name: 'Mehrere Bücher' }));
    // The second book starts with the Gospel according to Matthew.
    await waitFor(() => expect(document.querySelectorAll('.reading-refs .ref').length).toBe(2));
    expect(document.querySelectorAll('.reading-refs .ref')[1]!.textContent).toBe('2. LesungMatthäus 1');
    fireEvent.click(screen.getByRole('button', { name: 'Weiteres Buch hinzufügen' }));
    await waitFor(() => expect(document.querySelectorAll('.reading-refs .ref').length).toBe(3));
    expect(document.querySelectorAll('.reading-refs .ref')[2]!.textContent).toBe('3. LesungPsalm 1');
    fireEvent.click(screen.getAllByRole('button', { name: 'Dieses Buch entfernen' })[1]!);
    await waitFor(() => expect(document.querySelectorAll('.reading-refs .ref').length).toBe(2));
    expect(document.querySelectorAll('.reading-refs .ref')[1]!.textContent).toBe('2. LesungPsalm 1');

    // Each book by chapters or by time; the timer runs over the books read by time.
    expect(screen.queryByRole('timer')).toBeNull();
    fireEvent.click(within(screen.getByRole('group', { name: 'Maß der täglichen Lesung, 2. Lesung' })).getByRole('button', { name: 'Zeit' }));
    await waitFor(() => expect(store.getProfile().plan.planId).toBe('eigen-k2.m15'));
    expect(document.querySelectorAll('.reading-refs .ref')[1]!.textContent).toBe('2. Lesung · 15 Min.Psalm 1–5');
    expect(screen.getByRole('timer').textContent).toBe('15:00');

    // Back to Old and New Testament, with the amounts left there.
    fireEvent.change(screen.getByLabelText('Leseplan'), { target: { value: 'fixed' } });
    await waitFor(() => expect(store.getProfile().plan.planId).toBe('atnt-3-2'));
    expect(screen.queryByRole('timer')).toBeNull();
  });

  it('offers plans by sections: the section of the day, its number, a tick; a psalm beside it', async () => {
    const store = await renderBible();
    fireEvent.click(screen.getByRole('button', { name: 'Leseplan einstellen' }));
    fireEvent.change(await screen.findByLabelText('Leseplan'), { target: { value: 'beginner' } });
    await waitFor(() => expect(document.querySelector('.reading-refs')!.textContent).toBe('LesungJohannes 1'));
    expect(screen.getByText('Christus finden · Abschnitt 1 von 59')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Mit einem Psalm' }));
    await waitFor(() => expect(document.querySelectorAll('.reading-refs .ref')).toHaveLength(2));
    expect(document.querySelectorAll('.reading-refs .ref')[1]!.textContent).toBe('PsalmPsalm 1');

    // Ticked here: read, and the plan moves on.
    fireEvent.click(screen.getByRole('checkbox', { name: 'Gelesen' }));
    await waitFor(() => expect(store.readingFor(store.today()).reading.done).toBe(true));
    expect(store.getProfile().plan.positions).toMatchObject({ einsteiger: 1, psalm: 1 });

    // Mit Paulus unterwegs: 40 days, or a duration of one's own; the place is chosen by section.
    fireEvent.change(screen.getByLabelText('Leseplan'), { target: { value: 'paul' } });
    await waitFor(() => expect(store.getProfile().plan.planId).toBe('paulus-40'));
    fireEvent.change(screen.getByLabelText('Dauer in Tagen'), { target: { value: '75' } });
    await waitFor(() => expect(store.getProfile().plan.planId).toBe('paulus-75'));
    fireEvent.change(screen.getByLabelText('Weiter mit'), { target: { value: '74' } });
    await waitFor(() => expect(store.getProfile().plan.positions.paulus).toBe(74));
    // The plan of the Wüstenzeit is offered only while one is under way.
    expect(within(screen.getByLabelText('Leseplan')).queryByText(/Bewährung/)).toBeNull();
  });
});
