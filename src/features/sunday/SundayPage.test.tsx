// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { SECTIONS } from '../../app/routes';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { SundayPage } from './SundayPage';

afterEach(cleanup);

let n = 0;
async function renderSunday(path: string) {
  const store = new Store({ db: new TagzeitenDB(`sunday-${++n}`), journal: memoryJournal(), now: () => new Date(2026, 8, 25, 9) });
  const router = createMemoryRouter([{ path: '/sonntag', element: <SundayPage /> }], { initialEntries: [path] });
  render(
    <ToastProvider>
      <StoreProvider store={store}>
        <RouterProvider router={router} />
      </StoreProvider>
    </ToastProvider>,
  );
  await screen.findByRole('heading', { level: 2 });
  return router;
}
const title = () => document.querySelector('.sunday-name')!.textContent;

describe('Sonntag', () => {
  it('stands in the middle of the bar, with Andacht for morning and evening', () => {
    expect(SECTIONS.map((s) => s.label)).toEqual(['Arena', 'Andacht', 'Heute', 'Sonntag', 'Bibel', 'Lehre', 'Mehr']);
  });

  it('opens Löhe’s meditation from the Epistle on the 17th and 18th Sunday after Trinity', async () => {
    await renderSunday('/sonntag?s=2026-09-27');
    fireEvent.click(screen.getByRole('button', { name: /Epheser 4,1-6/ }));
    let dialog = screen.getByRole('dialog', { name: 'Am siebzehnten Sonntage nach Trinitatis.' });
    expect(dialog.textContent).toContain('Ein Leib und Ein Geist!');
    expect(dialog.textContent).toContain('Wilhelm Löhe');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Betrachtung schließen' }));
    cleanup();
    await renderSunday('/sonntag?s=2026-10-04');
    fireEvent.click(screen.getByRole('button', { name: /1\. Korinther 1,4-9/ }));
    dialog = screen.getByRole('dialog', { name: 'Am achtzehnten Sonntage nach Trinitatis.' });
    expect(dialog.querySelectorAll('.lection-paragraphs p')).toHaveLength(2);
    expect(dialog.textContent).toContain('wie sie St. Paulus in seinen Briefen behandelt!');
  });

  it('opens the lesson of the Haus-Agende from the Gospel, where the book has one', async () => {
    await renderSunday('/sonntag?s=2026-10-04');
    expect(title()).toContain('18. Sonntag nach Trinitatis');
    const gospel = screen.getByRole('button', { name: /Matthäus 22,34-46/ });
    fireEvent.click(gospel);
    const dialog = screen.getByRole('dialog', { name: 'Des Gesetzes und des Evangeliums Summe.' });
    // Word for word, in the spelling of 1853, and it ends in the Gospel (rule 1).
    expect(dialog.textContent).toContain('Meister, welches ist das vornehmste Gebot?');
    expect(dialog.textContent).toContain('O Herr Jesu nimm uns auf in Gnaden! Amen.');
    // Seven paragraphs, without the book's numbers.
    expect(dialog.querySelectorAll('.lection-paragraphs p')).toHaveLength(7);
    expect(within(dialog).queryByRole('list')).toBeNull();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Andacht schließen' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    // A Sunday without a lesson keeps the plain tile.
    cleanup();
    await renderSunday('/sonntag?d=2026-09-24');
    expect(screen.queryByRole('button', { name: /Lukas 7,11-17/ })).toBeNull();
  });

  it('shows the Sunday of the week with verse, meaning, readings and its place in the church year', async () => {
    await renderSunday('/sonntag?d=2026-09-24');
    expect(title()).toBe('16. Sonntag nach Trinitatis');
    expect(screen.getByText('Sonntag, 20. September 2026')).toBeTruthy();
    expect(document.querySelector('.sunday-verse blockquote')!.textContent).toMatch(/^Jetzt aber offenbart/);
    expect(screen.getByRole('heading', { name: 'Bedeutung' })).toBeTruthy();
    // Gospel and Epistle as references only: no full text, no links (rule 13).
    const refs = [...document.querySelectorAll('.sunday-readings .bible-ref')].map((r) => r.textContent);
    expect(refs).toEqual(['Lukas 7,11-17', 'Epheser 3,13-21']);
    expect(document.querySelector('.sunday-readings a')).toBeNull();
    expect(document.querySelector('.cy-circles [aria-current]')!.textContent).toBe('PfingstkreisTrinitatiszeit');
    // The Trinity group stands above the name of the Sunday.
    expect(document.querySelector('.sunday-group')!.textContent).toContain('Heiligung');
    // A short summary of each text, in our own words.
    expect([...document.querySelectorAll('.sunday-summary')].map((p) => p.textContent)).toHaveLength(2);
    expect(document.querySelector('.sunday-summary')!.textContent).toContain('Nain');
  });

  it('goes to the Sunday before and after, also across the turn of the church year', async () => {
    const router = await renderSunday('/sonntag?d=2026-09-24');
    fireEvent.click(screen.getByRole('link', { name: /^Letzter Sonntag/ }));
    await waitFor(() => expect(title()).toBe('15. Sonntag nach Trinitatis'));
    expect(new URLSearchParams(router.state.location.search).get('s')).toBe('2026-09-13');
    expect(screen.getByRole('link', { name: 'Zu dieser Woche' })).toBeTruthy();
    fireEvent.click(screen.getByRole('link', { name: /^Nächster Sonntag/ }));
    fireEvent.click(await screen.findByRole('link', { name: /^Nächster Sonntag: 17\./ }));
    await waitFor(() => expect(title()).toBe('17. Sonntag nach Trinitatis'));

    cleanup();
    await renderSunday('/sonntag?d=2026-09-24&s=2026-11-22');
    expect(title()).toMatch(/Ewigkeitssonntag/);
    fireEvent.click(screen.getByRole('link', { name: /^Nächster Sonntag/ }));
    await waitFor(() => expect(title()).toBe('1. Sonntag im Advent'));
  });

  it('opens all Sundays as a card from the name and shows the chosen one', async () => {
    const router = await renderSunday('/sonntag?d=2026-09-24');
    fireEvent.click(screen.getByRole('button', { name: /– alle Sonntage$/ }));
    const card = await screen.findByRole('dialog', { name: 'Alle Sonntage' });
    const shown = card.querySelector('.week-link[aria-current="true"]')!;
    expect(shown.textContent).toContain('16. Sonntag nach Trinitatis');
    expect(shown.textContent).toContain('diese Woche');
    // Escape closes the card without leaving the page.
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    fireEvent.click(screen.getByRole('button', { name: /– alle Sonntage$/ }));
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /Invokavit/ }));
    await waitFor(() => expect(title()).toBe('Invokavit'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(router.state.location.pathname).toBe('/sonntag');
  });

});
