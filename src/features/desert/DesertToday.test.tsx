// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { DESERT_PACKS } from '../../content/desert';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { resetOpenState } from '../../ui/collapseState';
import { ArenaPage } from '../arena/ArenaPage';
import { TodayPage } from '../today/TodayPage';

beforeEach(() => {
  localStorage.clear();
  resetOpenState();
  Element.prototype.scrollIntoView = () => {};
});
afterEach(cleanup);

let n = 0;
// 26 September 2026 is a Saturday. "Heute" is the place where the habits of the Wüstenzeit are chosen and ticked;
// the pages of the thanks and of the examination lie in the Arena and lead back here.
async function renderToday(prepare?: (s: Store) => void, now = new Date(2026, 8, 26, 7)) {
  const store = new Store({
    db: new TagzeitenDB(`desert-today-${++n}`),
    journal: memoryJournal(),
    now: () => now,
  });
  await store.load();
  prepare?.(store);
  const router = createMemoryRouter(
    [
      { path: '/', element: <TodayPage /> },
      { path: '/arena', element: <ArenaPage /> },
      { path: '/arena/:eintrag', element: <ArenaPage /> },
    ],
    { initialEntries: ['/'] },
  );
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

const pack = (id: string) => DESERT_PACKS.find((p) => p.id === id)!;
/** A Wüstenzeit from Monday 14 September, 40 days, with the habits of Aufbruch and Friday fasting. */
const withDesert = (s: Store, start = '2026-09-14') => {
  s.startDesert(start, 40);
  const run = s.getProfile().winterArc.runs[0]!;
  s.chooseDesert(run.id, [...pack('aufbruch').habits, pack('wuestenweg').habits.find((h) => h.id === 'wz-freitagsfasten')!], true);
  return run.id;
};

describe('the habits of the Wüstenzeit under "Heute"', () => {
  it('ticks the day like under "Heute", each habit with its "i"; Friday fasting only on Fridays', async () => {
    const store = await renderToday((s) => withDesert(s));
    const day = document.querySelector('.desert-group') as HTMLElement;
    expect(within(day).queryByRole('checkbox', { name: 'Freitagsfasten' })).toBeNull();
    fireEvent.click(within(day).getByRole('checkbox', { name: 'Morgensegen' }));
    expect(store.getDay('2026-09-26').habits['wz-morgensegen']).toBe(true);
    fireEvent.click(within(day).getByRole('button', { name: 'Info zu Morgensegen' }));
    expect(within(day).getByRole('note').textContent).toContain('Beginne den Tag mit Luthers Morgensegen.');
    // The bubble hangs below its own line; another "i" closes it, so only one stands open.
    expect(within(day).getByRole('note').closest('.desert-line')!.textContent).toContain('Morgensegen');
    // The reading Henoch already has, under its name in Henoch.
    const next = within(day).getByRole('button', { name: 'Info zu Bibel lesen' });
    fireEvent.pointerDown(next);
    fireEvent.click(next);
    expect(within(day).getAllByRole('note')).toHaveLength(1);
    expect(within(day).getByRole('note').textContent).toContain('Lies täglich einen kurzen Abschnitt aus einem Evangelium.');
    expect(within(day).getByRole('note').textContent).toContain('„Bibel lesen“ nach deinem Leseplan');
    // Yesterday, a Friday, can still be filled in.
    fireEvent.click(screen.getByRole('button', { name: 'Freitag, 25. September' }));
    const friday = document.querySelector('.desert-group') as HTMLElement;
    fireEvent.click(within(friday).getByRole('checkbox', { name: 'Freitagsfasten' }));
    expect(store.getDay('2026-09-25').habits['wz-freitagsfasten']).toBe(true);
  });

  it('writes the thanks in the lines of the Nachtgebet: saved, ticked, and back in the list; on paper the tick alone does', async () => {
    const store = await renderToday((s) => withDesert(s));
    // Only the thanks can be written down, nothing else of the list.
    expect(screen.getAllByRole('button', { name: 'Aufschreiben' })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Aufschreiben' }));
    const page = (await screen.findByRole('heading', { level: 2, name: 'Dankbarkeit' })).closest('article') as HTMLElement;
    // The way back is named; without a word written, nothing is ticked.
    expect(within(page).getByRole('button', { name: 'Zurück zur Liste' })).toBeTruthy();
    fireEvent.change(within(page).getByLabelText('Ich danke dir, mein Gott, für …'), { target: { value: 'das Gespräch mit Anna' } });
    fireEvent.click(within(page).getByRole('button', { name: 'Sichern, abhaken und zurück' }));
    await screen.findByText('Die drei Dinge');
    // The same thanks as in the Nachtgebet, and the line written ticks it (0.40); no entry in the Gebetskammer.
    expect(store.getDay('2026-09-26').evening.thanks[0]).toBe('das Gespräch mit Anna');
    expect(store.getProfile().arena).toHaveLength(0);
    const day = within(document.querySelector('.desert-group') as HTMLElement);
    const thanks = day.getByRole('checkbox', { name: /^Dankbarkeit/ });
    expect(thanks.getAttribute('aria-checked')).toBe('true');
    expect(thanks.textContent).toContain('im Nachtgebet notiert');
    // On paper: the tick alone, as before.
    fireEvent.click(day.getByRole('checkbox', { name: 'Morgensegen' }));
    expect(store.getDay('2026-09-26').habits['wz-morgensegen']).toBe(true);
  });

  it('asks the journal of a round taken over for the sentence of the day too', async () => {
    const store = await renderToday((s) => {
      s.startDesert('2026-09-14', 40);
      s.updateProfile(
        (p) => ({
          ...p,
          habits: [
            ...p.habits,
            { id: 'wz-old-journal', name: 'Tagebuch und drei Dankpunkte', rhythm: 'daily', auto: null, active: false, preset: false, focus: false, desert: 'own' },
          ],
          winterArc: { ...p.winterArc, runs: p.winterArc.runs.map((r) => ({ ...r, habits: ['wz-old-journal'] })) },
        }),
        { immediate: true },
      );
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aufschreiben' }));
    const page = (await screen.findByRole('heading', { level: 2, name: 'Tagebuch und drei Dankpunkte' })).closest('article') as HTMLElement;
    fireEvent.change(within(page).getByLabelText('Der Satz, der mich trifft'), { target: { value: 'Seid stille und erkennet' } });
    fireEvent.click(within(page).getByRole('button', { name: 'Sichern, abhaken und zurück' }));
    await screen.findByText('Die drei Dinge');
    expect(store.getDay('2026-09-26').morning.verse).toBe('Seid stille und erkennet');
    expect(store.getDay('2026-09-26').habits['wz-old-journal']).toBe(true);
  });

  it('writes the journal of the 90-Tage-Standard with its sentence and thanks, and ticks it', async () => {
    const store = await renderToday((s) => {
      s.startDesert('2026-09-14', 90);
      const run = s.getProfile().winterArc.runs[0]!;
      s.chooseDesert(run.id, [pack('standard').habits.find((h) => h.id === 'wz-std-journal')!], true);
    });
    // Under the day, and behind "Aufschreiben", the same journal of the day.
    fireEvent.click(screen.getByRole('button', { name: 'Aufschreiben' }));
    const page = (await screen.findByRole('heading', { level: 2, name: 'Tagebuch und drei Dankpunkte' })).closest('article') as HTMLElement;
    fireEvent.change(within(within(page).getByRole('group', { name: 'Tagebuch' })).getByLabelText('Tagebuch'), {
      target: { value: 'Was mich heute trägt.' },
    });
    fireEvent.click(within(page).getByRole('button', { name: 'Sichern, abhaken und zurück' }));
    await screen.findByText('Die drei Dinge');
    expect(store.getDay('2026-09-26').evening.journal).toBe('Was mich heute trägt.');
    expect(store.getDay('2026-09-26').habits['wz-std-journal']).toBe(true);
  });

  it('lets the thanks be written freely in the Gebetskammer instead, ticked when saved', async () => {
    const store = await renderToday((s) => withDesert(s));
    fireEvent.click(screen.getByRole('button', { name: 'Aufschreiben' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Lieber frei in der Gebetskammer schreiben' }));
    fireEvent.change(await screen.findByLabelText('Was dich bewegt'), { target: { value: 'Für das Gespräch mit Anna' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abhaken und zurück' }));
    await screen.findByText('Die drei Dinge');
    expect(store.getDay('2026-09-26').habits['wz-dankbarkeit']).toBe(true);
    expect(store.getProfile().arena.map((e) => e.text)).toEqual(['Für das Gespräch mit Anna']);
  });

  it('prays the examination of conscience on a page of its own: Word first, no field, ending in the absolution', async () => {
    const store = await renderToday((s) => {
      const id = withDesert(s);
      s.chooseDesert(id, [pack('wuestenvaeter').habits.find((h) => h.id === 'wz-gewissen')!], true);
    });
    const before = JSON.stringify(store.getProfile().arena);
    fireEvent.click(screen.getByRole('button', { name: 'Beten' }));
    const page = (await screen.findByRole('heading', { level: 2, name: 'Gewissenserforschung' })).closest('article') as HTMLElement;
    // Word first (rule 2): Psalm 139 before the question of the day.
    expect(page.querySelector('.wa-verse')!.textContent).toContain('Erforsche mich, Gott, und erfahre mein Herz');
    expect(page.textContent).toContain('Wird gebetet, nicht notiert.');
    // Nowhere to write a sin (rule 9).
    expect(page.querySelectorAll('textarea, input[type="text"], [contenteditable]')).toHaveLength(0);
    // The absolution comes last (rule 1).
    const parts = [...page.querySelectorAll('.part')].map((p) => p.className);
    expect(parts.at(-1)).toContain('part-absolution');
    fireEvent.click(within(page).getByRole('button', { name: 'Gebetet, abhaken und zurück' }));
    await screen.findByText('Die drei Dinge');
    expect(store.getDay('2026-09-26').habits['wz-gewissen']).toBe(true);
    // Only the tick: no entry in the Gebetskammer.
    expect(JSON.stringify(store.getProfile().arena)).toBe(before);
  });
  it('combines with another package; a habit in both counts once', async () => {
    const store = await renderToday((s) => s.startDesert('2026-09-14', 40));
    fireEvent.click(within(screen.getByRole('region', { name: 'Wie die Wüstenväter' })).getByRole('button', { name: 'Paket übernehmen' }));
    const erbe = screen.getByRole('region', { name: 'Erbe' });
    expect(erbe.textContent).toContain('Was du nicht angehst, erben deine Kinder.');
    fireEvent.click(within(erbe).getByRole('button', { name: 'Paket übernehmen' }));
    const ids = store.getProfile().winterArc.runs[0]!.habits!;
    for (const id of ['wz-stille', 'wz-gewissen', 'wz-familienzeit', 'wz-kindzeit', 'brothers']) expect(ids, id).toContain(id);
    expect(ids.filter((id) => id === 'wz-gewissen')).toHaveLength(1);
    expect(within(erbe).getByRole('button', { name: 'Paket übernehmen' })).toHaveProperty('disabled', true);
  });
});
