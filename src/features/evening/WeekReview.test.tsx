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
import { dayEntries } from '../../domain/exportMarkdown';
import { activeRun, weekOf } from '../../domain/winterArc';
import { resetOpenState } from '../../ui/collapseState';
import { EveningPage } from './EveningPage';

beforeEach(() => {
  localStorage.clear();
  resetOpenState();
});
afterEach(cleanup);

// Past days: the app never opens a day in the future.
const SUNDAY = '2026-10-04';
const SATURDAY = '2026-10-03';

let n = 0;
async function renderEvening(date: string, prepare?: (s: Store) => void) {
  const store = new Store({ db: new TagzeitenDB(`week-review-${date}-${++n}`), journal: memoryJournal() });
  await store.load();
  prepare?.(store);
  await store.flush();
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

const withHouse = (s: Store) =>
  s.updateProfile(
    (p) => ({
      ...p,
      house: {
        ...p.house,
        wife: { ...p.house.wife, name: 'Anna' },
        children: [
          { id: 'c1', name: 'Paul', sex: 'son', concern: '' },
          { id: 'c2', name: 'Marie', sex: 'daughter', concern: '' },
        ],
      },
    }),
    { immediate: true },
  );

const chain = () => screen.getByRole('navigation', { name: 'Ablauf: Nachtgebet' });
const openCompline = async () => {
  if (screen.queryByRole('navigation', { name: 'Ablauf: Nachtgebet' })) return;
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Ablauf: Vesper' })).getByRole('button', { name: /^Nachtgebet/ }));
  await screen.findByRole('navigation', { name: 'Ablauf: Nachtgebet' });
};
const pageNames = () => within(chain()).getAllByRole('button').map((b) => b.getAttribute('aria-label'));
const openReview = async (title: string) => {
  await openCompline();
  fireEvent.click(within(chain()).getByRole('button', { name: title }));
  await screen.findByRole('heading', { name: title, level: 3 });
};

describe('Wochenrückblick', () => {
  it('takes the place of thanks and review on Sunday evening, still before the examination (rule 3)', async () => {
    const store = await renderEvening(SUNDAY, (s) => {
      withHouse(s);
      s.updateDay('2026-09-28', (d) => ({ ...d, evening: { ...d.evening, thanks: ['das Gespräch beim Abendessen'] } }), {
        immediate: true,
      });
      s.updateDay('2026-10-01', (d) => ({ ...d, evening: { ...d.evening, thanks: ['Maries Lied', ''] } }), { immediate: true });
    });
    await openCompline();
    expect(pageNames()).toEqual(['Vesper', 'Kreuz, Glaube, Vaterunser', 'Wochenrückblick', 'Prüfung und Zuspruch', 'Abendsegen']);

    await openReview('Wochenrückblick');
    const page = document.querySelector('.compline .flow-step') as HTMLElement;
    // Wife and children under their names from "Mein Haus", then church, work, neighbours, country (rule 18).
    expect([...page.querySelectorAll('.week-review .field label')].map((l) => l.textContent)).toEqual([
      'Anna',
      'Paul und Marie',
      'Meine Gemeinde',
      'Meine Arbeit',
      'Meine Nächsten',
      'Unser Land',
      'Ein Vorsatz',
    ]);
    expect(page.textContent).toContain('1. Timotheus 2,1-2');
    // What was noted in the week's evenings, as a reminder.
    expect(page.textContent).toContain('das Gespräch beim Abendessen · Maries Lied');
    // Not the day's thanks; the review ends in the word of comfort.
    expect(screen.queryByLabelText('Ich danke dir, mein Gott, für …')).toBeNull();
    // The same word of comfort as the Streithalle's weekly review.
    const comfort = page.querySelector('.week-comfort')!.textContent;
    expect(comfort).toContain('Zum Schluss der Zuspruch:');
    expect(comfort).toContain('Klagelieder 3,22–23');
    expect(comfort).not.toContain('TEXT VON ANDREAS');
    // No examination here: that is the next page (rule 3).
    expect(page.textContent).not.toContain('Wird gebetet, nicht notiert.');

    fireEvent.change(screen.getByLabelText('Unser Land'), { target: { value: 'Frieden im Land' } });
    fireEvent.change(screen.getByLabelText('Ein Vorsatz'), { target: { value: 'Mittwochs das Hauptstück üben' } });
    await store.flush();
    expect(store.getDay(SUNDAY).evening.weekCountry).toBe('Frieden im Land');
    expect(store.getDay(SUNDAY).evening.weekResolve).toBe('Mittwochs das Hauptstück üben');
    // Kept in the export like every other entry (rule 11).
    expect(dayEntries(store.getDay(SUNDAY), []).map((e) => e.label)).toContain('Wochenrückblick: Dank für unser Land');
  });

  it('asks about wife and children only when "Mein Haus" holds them', async () => {
    await renderEvening(SUNDAY);
    await openReview('Wochenrückblick');
    const labels = [...document.querySelectorAll('.week-review .field label')].map((l) => l.textContent);
    expect(labels).toEqual(['Meine Gemeinde', 'Meine Arbeit', 'Meine Nächsten', 'Unser Land', 'Ein Vorsatz']);
    // Nothing noted in the week: no empty reminder.
    expect(screen.queryByText('Diese Woche abends notiert')).toBeNull();
  });

  it('moves on to the next field with Enter: one line is enough', async () => {
    await renderEvening(SUNDAY);
    await openReview('Wochenrückblick');
    const church = screen.getByLabelText('Meine Gemeinde');
    church.focus();
    fireEvent.keyDown(church, { key: 'Enter' });
    expect(document.activeElement).toBe(screen.getByLabelText('Meine Arbeit'));
  });

  it('keeps the day’s thanks and review on weekdays, in the short form and when switched off; nothing is lost', async () => {
    await renderEvening(SATURDAY);
    await openCompline();
    expect(pageNames()).toContain('Dank und Rückschau');
    cleanup();

    const store = await renderEvening(SUNDAY, (s) => {
      s.updateDay(SUNDAY, (d) => ({ ...d, evening: { ...d.evening, weekWork: 'Das Angebot ist fertig.' } }), { immediate: true });
      s.updateProfile((p) => ({ ...p, weekReview: false }), { immediate: true });
    });
    await openCompline();
    expect(pageNames()).toContain('Dank und Rückschau');
    expect(pageNames()).not.toContain('Wochenrückblick');
    // Switched off, the entry is still there.
    expect(store.getDay(SUNDAY).evening.weekWork).toBe('Das Angebot ist fertig.');
    cleanup();

    await renderEvening(SUNDAY, (s) =>
      s.updateDay(SUNDAY, (d) => ({ ...d, evening: { ...d.evening, complineForm: 'short' } }), { immediate: true }),
    );
    await openCompline();
    expect(screen.queryByLabelText('Unser Land')).toBeNull();
  });

  it('takes the Wüstenzeit’s three questions into the same review, with the same data', async () => {
    // A Wüstenzeit from Monday 28 September: the Sunday 4 October ends its first calendar week.
    const store = await renderEvening(SUNDAY, (s) => s.startDesert('2026-09-28', 40));
    await openReview('Wochenrückblick');
    expect(screen.getByText('Aus der Wüstenzeit')).toBeTruthy();
    // One review, one word of comfort.
    expect(document.querySelectorAll('.compline .flow-step .arena-comfort')).toHaveLength(1);
    fireEvent.change(screen.getByLabelText('Ein Sieg dieser Woche'), { target: { value: 'Jeden Morgen gelesen' } });
    await store.flush();
    await waitFor(() => {
      const data = store.getProfile().winterArc;
      expect(weekOf(data, activeRun(data)!.id, 1)?.review.win).toBe('Jeden Morgen gelesen');
    });
  });

});
