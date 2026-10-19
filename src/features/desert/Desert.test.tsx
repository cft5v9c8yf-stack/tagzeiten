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
    // The habits are no longer chosen here: the Arena points to "Heute", where they are chosen and ticked.
    expect(screen.queryByRole('heading', { name: 'Gewohnheiten wählen' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Paket übernehmen' })).toBeNull();
    expect(screen.getByText('Du hast noch keine Gewohnheiten gewählt.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Heute' }).getAttribute('href')).toBe('/');
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

  it('keeps a journal under the day, not in the Gebetskammer; the days ahead have none yet', async () => {
    const store = await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s));
    tab('Tagebuch');
    const journal = screen.getByRole('group', { name: 'Tagebuch' });
    expect(journal.textContent).toContain('Sünde wird gebetet, nicht notiert');
    fireEvent.change(within(journal).getByLabelText('Tagebuch'), { target: { value: 'Heute war es still.\nZweite Zeile.' } });
    expect(store.getDay('2026-09-26').evening.journal).toBe('Heute war es still.\nZweite Zeile.');
    expect(store.getProfile().arena).toEqual([]);
    // The day before has its own page of the journal.
    fireEvent.click(screen.getByRole('button', { name: 'Vortag' }));
    expect((within(screen.getByRole('group', { name: 'Tagebuch' })).getByLabelText('Tagebuch') as HTMLTextAreaElement).value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Zu heute' }));
    fireEvent.click(screen.getByRole('button', { name: 'Folgetag' }));
    expect(screen.queryByRole('group', { name: 'Tagebuch' })).toBeNull();
  });

  it('carries the phases and weekly focuses of the 90-Tage-Standard when its points are chosen, the verse first', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', (s) => {
      s.startDesert('2026-09-14', 40);
      s.chooseDesert(s.getProfile().winterArc.runs[0]!.id, pack('standard').habits, true);
    });
    tab('Rückblick');
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
    tab('Rückblick');
    expect(screen.queryByRole('region', { name: 'Schwerpunkt der Woche' })).toBeNull();
    tab('Anleitung');
    expect(within(document.querySelector('.desert-guide') as HTMLElement).queryByText('Der 90-Tage-Standard')).toBeNull();
  });

  it('shows the course as calendar weeks, what was kept so far, and the review at the end of a week', async () => {
    const store = await renderArena('/arena?bereich=wuestenwanderung', (s) => {
      withDesert(s);
      const h = s.getProfile().habits.find((x) => x.id === 'wz-handy-spaeter')!;
      s.toggleHabit('2026-09-15', h);
      s.toggleHabit('2026-09-22', h);
    });
    // The course is the first view: a table of days, the ones with a tick filled, the others grey, those to come outlined.
    const grid = document.querySelector('.wa-course-grid') as HTMLElement;
    expect([...grid.querySelectorAll('thead th')].slice(1).map((t) => t.textContent)).toEqual(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
    expect(grid.querySelectorAll('tbody tr')).toHaveLength(6);
    expect(grid.querySelectorAll('.is-ticked')).toHaveLength(2);
    expect(grid.querySelector('td[aria-label$="mit Haken"]')).not.toBeNull();
    expect(grid.querySelectorAll('td[aria-label$="mit Haken"]')).toHaveLength(2);
    expect(grid.querySelector('td[aria-label^="Mittwoch, 16. September: ohne Haken"] .is-open')).not.toBeNull();
    expect(grid.querySelector('td[aria-label^="Sonntag, 27. September: liegt noch vor dir"] .is-future')).not.toBeNull();
    // Nothing to tick here.
    expect(grid.querySelectorAll('button, input')).toHaveLength(0);
    expect(document.querySelector('.desert-kept')!.textContent).toContain('Handy späteran 2 Tagen gehalten');
    // The review: the week before has ended; its three lines end in the word of comfort (rule 1).
    tab('Rückblick');
    expect(document.querySelector('.wa-review')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Frühere Woche' }));
    const review = document.querySelector('.wa-review') as HTMLElement;
    fireEvent.change(within(review).getByLabelText('Ein Sieg dieser Woche'), { target: { value: 'Jeden Morgen gelesen' } });
    expect(store.getProfile().winterArc.weeks[0]).toMatchObject({ week: 1, review: { win: 'Jeden Morgen gelesen' } });
    expect(review.lastElementChild!.textContent).toContain('alle Morgen neu');
  });

  it('has nothing to tick or to choose: the habits are kept under "Heute"', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s));
    for (const view of ['Verlauf', 'Tagebuch', 'Rückblick', 'Anleitung']) {
      tab(view);
      expect(screen.queryAllByRole('checkbox'), view).toHaveLength(0);
      expect(screen.queryByRole('button', { name: 'Paket übernehmen' }), view).toBeNull();
    }
    expect(screen.getByRole('link', { name: 'Heute' }).getAttribute('href')).toBe('/');
    expect(document.body.textContent).toContain('Die Gewohnheiten pflegst und hakst du unter Heute ab.');
    // What stays: the way to start and to end it, in the settings.
    expect(screen.getByText('Einstellungen der Wüstenzeit')).toBeTruthy();
  });

  it('never marks anything in red, as a streak or as a rate', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s));
    tab('Verlauf');
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

  it('gives the journal of a closed Wüstenzeit to read again, day by day', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', (s) => {
      withDesert(s, '2026-08-01');
      s.updateDay('2026-08-02', (d) => ({ ...d, evening: { ...d.evening, journal: 'Der zweite Tag.' } }));
      s.updateDay('2026-08-05', (d) => ({ ...d, evening: { ...d.evening, journal: 'Der fünfte Tag.' } }));
      // Outside the Wüstenzeit: not part of its journal.
      s.updateDay('2026-07-30', (d) => ({ ...d, evening: { ...d.evening, journal: 'Davor.' } }));
    });
    const read = document.querySelector('.desert-journal-read')!;
    expect([...read.querySelectorAll('.desert-journal-text')].map((x) => x.textContent)).toEqual(['Der zweite Tag.', 'Der fünfte Tag.']);
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
