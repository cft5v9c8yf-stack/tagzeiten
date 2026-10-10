// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

beforeEach(() => {
  localStorage.clear();
  resetOpenState();
});
afterEach(cleanup);

let n = 0;
// 26 September 2026 is a Saturday.
async function renderArena(path: string, prepare?: (s: Store) => void, now = new Date(2026, 8, 26, 7)) {
  const store = new Store({
    db: new TagzeitenDB(`desert-${++n}`),
    journal: memoryJournal(),
    now: () => now,
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

const pack = (id: string) => DESERT_PACKS.find((p) => p.id === id)!;
/** A Wüstenzeit from Monday 14 September, 40 days, with the habits of Aufbruch and Friday fasting. */
const withDesert = (s: Store, start = '2026-09-14') => {
  s.startDesert(start, 40);
  const run = s.getProfile().winterArc.runs[0]!;
  s.chooseDesert(run.id, [...pack('aufbruch').habits, pack('wuestenweg').habits.find((h) => h.id === 'wz-freitagsfasten')!], true);
  return run.id;
};
const tab = (name: string) =>
  fireEvent.click(within(screen.getByRole('group', { name: 'Ansicht der Wüstenzeit' })).getByRole('button', { name }));

describe('the Wüstenwanderung in the Arena', () => {
  it('stands in the Arena as the third place, with the guide and the way in', async () => {
    const store = await renderArena('/arena');
    expect([...document.querySelectorAll('.arena-place-title')].map((t) => t.textContent)).toEqual([
      'Gebetskammer',
      'Eisenschmiede',
      'Wüstenwanderung',
    ]);
    const tile = screen.getByRole('link', { name: /^Wüstenwanderung/ });
    expect(tile.textContent).toContain('Weniger Ablenkung. Mehr Raum für Gott.');
    fireEvent.click(tile);
    expect(screen.getByRole('heading', { level: 2, name: 'Wüstenwanderung' })).toBeTruthy();
    // The Word first, then the way in, then the guide (0.40).
    const [head, guide] = [...document.querySelectorAll('.desert-guide')] as [HTMLElement, HTMLElement];
    expect(head.textContent).toContain('„Übe dich selbst aber in der Gottseligkeit.“');
    const order = [head, screen.getByRole('button', { name: 'Wüstenzeit beginnen' }), guide];
    expect(order.every((el, i) => i === 0 || order[i - 1]!.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(guide.textContent).toContain('In der Bibel ist die Wüste kein leerer Ort, sondern ein Ort der Begegnung.');
    expect(guide.textContent).toContain('„Ich will sie locken und will sie in die Wüste führen und freundlich mit ihr reden.“ (Hos 2,16)');
    expect([...document.querySelectorAll('.desert-guide em')].map((e) => e.textContent)).toEqual([
      'Weniger Ablenkung. Mehr Raum für Gott.',
      'Askese',
      'für',
      'aus',
    ]);
    // The 90-Tage-Standard is a package now, no longer a second guide here.
    expect(within(guide).queryByText('Der 90-Tage-Standard')).toBeNull();
    expect(document.body.textContent).not.toMatch(/Winter Arc|Streithalle/);

    fireEvent.click(screen.getByRole('button', { name: 'Wüstenzeit beginnen' }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Neue Wüstenzeit' })).getByRole('button', { name: 'Wüstenzeit beginnen' }));
    expect(store.getProfile().winterArc.runs[0]).toMatchObject({ startDate: '2026-09-26', durationDays: 40, habits: [] });
    // Then the choice, right there; the 90-Tage-Standard among the packages, with its guide.
    expect(screen.getByRole('heading', { name: 'Gewohnheiten wählen' })).toBeTruthy();
    const std = screen.getByRole('region', { name: 'Der 90-Tage-Standard' });
    expect(within(std).getByText('Anleitung zum 90-Tage-Standard')).toBeTruthy();
    fireEvent.click(within(screen.getByRole('region', { name: 'Aufbruch' })).getByRole('button', { name: 'Paket übernehmen' }));
    expect(store.getProfile().winterArc.runs[0]!.habits).toHaveLength(4);
    expect(screen.getByRole('group', { name: 'Ansicht der Wüstenzeit' })).toBeTruthy();
  });

  it('opens from the old addresses of the Streithalle and of 0.39.0', async () => {
    await renderArena('/arena?bereich=streithalle');
    expect(screen.getByRole('heading', { level: 2, name: 'Wüstenwanderung' })).toBeTruthy();
    cleanup();
    await renderArena('/arena?bereich=wuestenzeit');
    expect(screen.getByRole('heading', { level: 2, name: 'Wüstenwanderung' })).toBeTruthy();
  });

  it('shows where it stands: the verse of the package first, day and week, and a new beginning after an open day', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s));
    const head = document.querySelector('.wa-head') as HTMLElement;
    // Word first (rule 2): Aufbruch's verse, since most habits come from it.
    expect(head.firstElementChild!.textContent).toContain('Wer im Geringsten treu ist, der ist auch im Großen treu.');
    expect(head.textContent).toContain('Tag 13 von 40');
    expect(head.textContent).toContain('Woche 2 von 6');
    // Nothing ticked yesterday: an encouragement, no warning.
    expect(head.textContent).toContain('Heute neu anfangen.');
    expect(head.textContent).not.toMatch(/verpasst|Streak|Serie/i);
  });

  it('ticks the day like under "Heute", each habit with its "i"; Friday fasting only on Fridays', async () => {
    const store = await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s));
    tab('Tag');
    const day = document.querySelector('.wa-day') as HTMLElement;
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
    fireEvent.click(within(day).getByRole('button', { name: 'Vortag' }));
    fireEvent.click(within(day).getByRole('checkbox', { name: 'Freitagsfasten' }));
    expect(store.getDay('2026-09-25').habits['wz-freitagsfasten']).toBe(true);
  });

  it('writes the thanks in the lines of the Nachtgebet: saved, ticked, and back in the list; on paper the tick alone does', async () => {
    const store = await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s));
    tab('Tag');
    // Only the thanks can be written down, nothing else of the list.
    expect(screen.getAllByRole('button', { name: 'Aufschreiben' })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Aufschreiben' }));
    const page = (await screen.findByRole('heading', { level: 2, name: 'Dankbarkeit' })).closest('article') as HTMLElement;
    // The way back is named; without a word written, nothing is ticked.
    expect(within(page).getByRole('button', { name: 'Zurück zur Liste' })).toBeTruthy();
    fireEvent.change(within(page).getByLabelText('Ich danke dir, mein Gott, für …'), { target: { value: 'das Gespräch mit Anna' } });
    fireEvent.click(within(page).getByRole('button', { name: 'Sichern, abhaken und zurück' }));
    expect(await screen.findByRole('heading', { level: 2, name: /^Wüstenwanderung/ })).toBeTruthy();
    // The same thanks as in the Nachtgebet, and the line written ticks it (0.40); no entry in the Gebetskammer.
    expect(store.getDay('2026-09-26').evening.thanks[0]).toBe('das Gespräch mit Anna');
    expect(store.getProfile().arena).toHaveLength(0);
    const day = within(document.querySelector('.wa-day') as HTMLElement);
    const thanks = day.getByRole('checkbox', { name: /^Dankbarkeit/ });
    expect(thanks.getAttribute('aria-checked')).toBe('true');
    expect(thanks.textContent).toContain('im Nachtgebet notiert');
    // On paper: the tick alone, as before.
    fireEvent.click(day.getByRole('checkbox', { name: 'Morgensegen' }));
    expect(store.getDay('2026-09-26').habits['wz-morgensegen']).toBe(true);
  });

  it('asks the journal of a round taken over for the sentence of the day too', async () => {
    const store = await renderArena('/arena?bereich=wuestenwanderung', (s) => {
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
    tab('Tag');
    fireEvent.click(screen.getByRole('button', { name: 'Aufschreiben' }));
    const page = (await screen.findByRole('heading', { level: 2, name: 'Tagebuch und drei Dankpunkte' })).closest('article') as HTMLElement;
    fireEvent.change(within(page).getByLabelText('Der Satz, der mich trifft'), { target: { value: 'Seid stille und erkennet' } });
    fireEvent.click(within(page).getByRole('button', { name: 'Sichern, abhaken und zurück' }));
    await screen.findByRole('heading', { level: 2, name: /^Wüstenwanderung/ });
    expect(store.getDay('2026-09-26').morning.verse).toBe('Seid stille und erkennet');
    expect(store.getDay('2026-09-26').habits['wz-old-journal']).toBe(true);
  });

  it('lets the thanks be written freely in the Gebetskammer instead, ticked when saved', async () => {
    const store = await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s));
    tab('Tag');
    fireEvent.click(screen.getByRole('button', { name: 'Aufschreiben' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Lieber frei in der Gebetskammer schreiben' }));
    fireEvent.change(await screen.findByLabelText('Was dich bewegt'), { target: { value: 'Für das Gespräch mit Anna' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sichern, abhaken und zurück' }));
    expect(await screen.findByRole('heading', { level: 2, name: /^Wüstenwanderung/ })).toBeTruthy();
    expect(store.getDay('2026-09-26').habits['wz-dankbarkeit']).toBe(true);
    expect(store.getProfile().arena.map((e) => e.text)).toEqual(['Für das Gespräch mit Anna']);
  });

  it('prays the examination of conscience on a page of its own: Word first, no field, ending in the absolution', async () => {
    const store = await renderArena('/arena?bereich=wuestenwanderung', (s) => {
      const id = withDesert(s);
      s.chooseDesert(id, [pack('wuestenvaeter').habits.find((h) => h.id === 'wz-gewissen')!], true);
    });
    tab('Tag');
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
    expect(await screen.findByRole('heading', { level: 2, name: /^Wüstenwanderung/ })).toBeTruthy();
    expect(store.getDay('2026-09-26').habits['wz-gewissen']).toBe(true);
    // Only the tick: no entry in the Gebetskammer.
    expect(JSON.stringify(store.getProfile().arena)).toBe(before);
  });

  it('carries the phases and weekly focuses of the 90-Tage-Standard when its points are chosen, the verse first', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', (s) => {
      s.startDesert('2026-09-14', 40);
      s.chooseDesert(s.getProfile().winterArc.runs[0]!.id, pack('standard').habits, true);
    });
    tab('Woche');
    const focus = screen.getByRole('region', { name: 'Schwerpunkt der Woche' });
    // Week 2 of 6: the thirteen focuses spread over the weeks.
    expect(focus.firstElementChild!.className).toContain('wa-verse');
    expect(focus.textContent).toContain('Disziplin · Kann ich es halten?');
    expect(focus.textContent).toContain('Die Arbeit schützen.');
    fireEvent.click(screen.getByRole('button', { name: 'Frühere Woche' }));
    expect(screen.getByRole('region', { name: 'Schwerpunkt der Woche' }).textContent).toContain('Einfach da sein.');
    tab('Anleitung');
    expect(within(document.querySelector('.desert-guide') as HTMLElement).getByText('Der 90-Tage-Standard')).toBeTruthy();
  });

  it('has no weekly focus without the points of the standard', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s));
    tab('Woche');
    expect(screen.queryByRole('region', { name: 'Schwerpunkt der Woche' })).toBeNull();
    tab('Anleitung');
    expect(within(document.querySelector('.desert-guide') as HTMLElement).queryByText('Der 90-Tage-Standard')).toBeNull();
  });

  it('shows the week as a grid of calendar weeks, what was kept so far, and the review at its end', async () => {
    const store = await renderArena('/arena?bereich=wuestenwanderung', (s) => {
      withDesert(s);
      const h = s.getProfile().habits.find((x) => x.id === 'wz-handy-spaeter')!;
      s.toggleHabit('2026-09-15', h);
      s.toggleHabit('2026-09-22', h);
    });
    tab('Woche');
    const grid = document.querySelector('.wa-grid') as HTMLElement;
    expect([...grid.querySelectorAll('thead th span:first-child')].map((t) => t.textContent)).toEqual(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
    // Friday fasting: a quiet dash on the other days.
    const fasting = within(grid).getByRole('row', { name: /Freitagsfasten/ });
    expect(fasting.querySelectorAll('td.wa-off')).toHaveLength(6);
    expect(document.querySelector('.desert-kept')!.textContent).toContain('Handy späteran 2 Tagen gehalten');
    // The week before has ended: its review, ending in the word of comfort (rule 1).
    expect(document.querySelector('.wa-review')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Frühere Woche' }));
    const review = document.querySelector('.wa-review') as HTMLElement;
    fireEvent.change(within(review).getByLabelText('Ein Sieg dieser Woche'), { target: { value: 'Jeden Morgen gelesen' } });
    expect(store.getProfile().winterArc.weeks[0]).toMatchObject({ week: 1, review: { win: 'Jeden Morgen gelesen' } });
    expect(review.lastElementChild!.textContent).toContain('alle Morgen neu');
  });

  it('never marks anything in red, as a streak or as a rate', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s));
    tab('Woche');
    const desert = document.querySelector('.desert')!;
    expect(desert.querySelector('[class*="danger"], [class*="rubric"], [class*="warn"]')).toBeNull();
    expect(desert.textContent).not.toMatch(/in Folge|Streak|%|Quote/i);
    const css = readFileSync(resolve(process.cwd(), 'src/styles/pages.css'), 'utf8');
    const rules = css.slice(css.indexOf('Wüstenzeit (the Streithalle before 0.39)'));
    expect(rules).not.toMatch(/rubric|danger|rose-red|warn|#[a-f0-9]{3,6}/i);
  });

  it('closes after the last day: the days, what was kept, taking habits into everyday life, a new Wüstenzeit', async () => {
    const store = await renderArena('/arena?bereich=wuestenwanderung', (s) => {
      withDesert(s, '2026-08-01');
      const h = s.getProfile().habits.find((x) => x.id === 'wz-dankbarkeit')!;
      s.toggleHabit('2026-08-03', h);
    });
    expect(screen.getByRole('heading', { name: 'Die Wüstenzeit ist zu Ende' })).toBeTruthy();
    expect(document.body.textContent).toContain('40 Tage in der Wüste.');
    expect(document.querySelector('.desert-kept')!.textContent).toContain('Dankbarkeitan einem Tag gehalten');
    const adopt = screen.getByRole('region', { name: 'In den Alltag übernehmen' });
    fireEvent.click(within(adopt).getByLabelText('Dankbarkeit'));
    fireEvent.click(within(adopt).getByRole('button', { name: 'Gewohnheiten übernehmen' }));
    expect(store.getProfile().habits.find((h) => h.id === 'wz-dankbarkeit')!.active).toBe(true);
    expect(screen.getByText(/^Übernommen\./)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Neue Wüstenzeit beginnen' }));
    expect(screen.getByRole('dialog', { name: 'Neue Wüstenzeit' }).textContent).toContain('Die Gewohnheiten der letzten Wüstenzeit sind schon gewählt.');
  });
});

describe('a Wüstenzeit in Advent', () => {
  // Monday, 16 November 2026: thirteen days before the first Sunday in Advent.
  const nov16 = new Date(2026, 10, 16, 7);

  it('stands in the Wüstenwanderung with the verse, the dates and the article', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', undefined, nov16);
    const card = screen.getByRole('region', { name: 'Eine Wüstenzeit im Advent' });
    expect(card.textContent).toContain('Bereitet dem HERRN den Weg');
    expect(card.textContent).toContain('Sonntag, 29. November bis Donnerstag, 24. Dezember');
    expect(within(card).getByRole('link', { name: /Mehr dazu auf henoch\.app/ }).getAttribute('href')).toBe(
      'https://henoch.app/neuigkeiten/advent-2026/',
    );
    expect(screen.queryByRole('button', { name: 'Wüstenzeit beginnen' })).toBeNull();
  });

  it('opens the start filled in from "Heute" and begins on the first Sunday in Advent, named for it', async () => {
    const store = await renderArena('/arena?bereich=wuestenwanderung&vorbereiten=1', undefined, nov16);
    const dialog = screen.getByRole('dialog', { name: 'Wüstenzeit im Advent' });
    expect((within(dialog).getByLabelText('Startdatum') as HTMLInputElement).value).toBe('2026-11-29');
    expect((within(dialog).getByLabelText('Letzter Tag') as HTMLInputElement).value).toBe('2026-12-24');
    expect(dialog.textContent).toContain('26 Tage: vom 1. Advent bis Heiligabend');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Wüstenzeit beginnen' }));
    const run = store.getProfile().winterArc.runs[0]!;
    expect(run).toMatchObject({ name: 'Advent 2026', startDate: '2026-11-29', durationDays: 26 });
    expect(screen.queryByRole('region', { name: 'Eine Wüstenzeit im Advent' })).toBeNull();
  });

  it('opens an empty start for another span', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', undefined, nov16);
    fireEvent.click(screen.getByRole('button', { name: 'Anderen Zeitraum wählen' }));
    const dialog = screen.getByRole('dialog', { name: 'Neue Wüstenzeit' });
    expect((within(dialog).getByLabelText('Startdatum') as HTMLInputElement).value).toBe('2026-11-16');
  });

  it('names the Advent on the Arena tile', async () => {
    await renderArena('/arena', undefined, nov16);
    expect(screen.getByText('Im Advent, ab 29. November')).toBeTruthy();
  });
});

