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
    // The journal stands on the page, as entries.
    expect(screen.getByRole('button', { name: 'Neuen Eintrag schreiben' })).toBeTruthy();
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

  it('keeps the journal as entries of its own, apart from the Gebetskammer: made, changed, pinned, archived, deleted', async () => {
    const store = await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s));
    expect(document.body.textContent).toContain('Sünde wird gebetet, nicht notiert');
    fireEvent.click(screen.getByRole('button', { name: 'Neuen Eintrag schreiben' }));
    const article = (await screen.findByRole('article')) as HTMLElement;
    fireEvent.change(within(article).getByLabelText('Titel'), { target: { value: 'Stille am Morgen' } });
    fireEvent.change(within(article).getByLabelText('Bibelstelle 1'), { target: { value: 'Psalm 62,2' } });
    fireEvent.change(within(article).getByLabelText('Was dich in dieser Zeit bewegt'), { target: { value: 'Heute war es still.' } });
    // Its own kind: not in the Gebetskammer; the word of comfort of the Wüstenzeit stands under it.
    expect(store.getProfile().arena).toHaveLength(1);
    expect(store.getProfile().arena[0]).toMatchObject({ kind: 'desert', title: 'Stille am Morgen', text: 'Heute war es still.' });
    expect(within(article).getByLabelText('Zuspruch').textContent).toContain('alle Morgen neu');
    fireEvent.click(within(article).getByRole('button', { name: 'Anheften' }));
    expect(store.getProfile().arena[0]!.pinnedAt).toBeDefined();
    // Back to the page of the Wüstenwanderung: the entry stands there as a card.
    fireEvent.click(within(article).getByRole('link', { name: 'Zurück: Wüstenwanderung' }));
    expect((await screen.findByRole('heading', { level: 2, name: 'Wüstenwanderung' })).textContent).toBe('Wüstenwanderung');
    const card = screen.getByRole('link', { name: /Stille am Morgen/ });
    expect(card.textContent).toContain('Angeheftet');
    // The three dots: archive. It leaves the list and stands in the Rückblick.
    fireEvent.click(screen.getByRole('button', { name: 'Aktionen für „Stille am Morgen“' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Eintrag archivieren' }));
    expect(store.getProfile().arena[0]!.archivedAt).toBeDefined();
    expect(screen.queryByRole('link', { name: /Stille am Morgen/ })).toBeNull();
    expect(screen.getByRole('link', { name: 'Archivierte Einträge im Rückblick' })).toBeTruthy();
    // Brought back and deleted from its page.
    store.archiveArenaEntry(store.getProfile().arena[0]!.id, false);
    fireEvent.click(await screen.findByRole('link', { name: /Stille am Morgen/ }));
    const again = (await screen.findByRole('article')) as HTMLElement;
    fireEvent.click(within(again).getByRole('button', { name: 'Löschen' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ja, Eintrag löschen' }));
    expect(store.getProfile().arena).toEqual([]);
  });

  it('keeps the entries of the Wüstenwanderung out of the Gebetskammer, and the entries of the Gebetskammer out of it', async () => {
    const store = await renderArena('/arena?bereich=wuestenwanderung', (s) => {
      const id = s.addArenaEntry();
      s.updateArenaEntry(id, (e) => ({ ...e, title: 'Aus der Gebetskammer', text: 'Etwas anderes.' }));
      const d = s.addArenaEntry('desert');
      s.updateArenaEntry(d, (e) => ({ ...e, title: 'Aus der Wüste', text: 'Still.' }));
    });
    expect(screen.getByRole('link', { name: /Aus der Wüste/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Aus der Gebetskammer/ })).toBeNull();
    cleanup();
    await renderArena('/arena?bereich=gebetskammer', (s) => {
      const d = s.addArenaEntry('desert');
      s.updateArenaEntry(d, (e) => ({ ...e, title: 'Aus der Wüste', text: 'Still.' }));
    });
    expect(screen.queryByRole('link', { name: /Aus der Wüste/ })).toBeNull();
    expect(store.getProfile().arena).toHaveLength(2);
  });

  it('keeps the old sheets of single days readable, folded, and does not rewrite them', async () => {
    const store = await renderArena('/arena?bereich=wuestenwanderung', (s) => {
      withDesert(s);
      s.updateDay('2026-09-20', (d) => ({ ...d, evening: { ...d.evening, journal: 'Der alte Tag.' } }));
    });
    const sheets = document.querySelector('.desert-sheets') as HTMLElement;
    expect(sheets.querySelector('summary')!.textContent).toBe('Aus den Tagesblättern');
    expect(sheets.textContent).toContain('Der alte Tag.');
    expect(store.getDay('2026-09-20').evening.journal).toBe('Der alte Tag.');
    expect(store.getProfile().arena).toEqual([]);
  });

  it('carries the phases and weekly focuses of the 90-Tage-Standard when its points are chosen, the verse first', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', (s) => {
      s.startDesert('2026-09-14', 40);
      s.chooseDesert(s.getProfile().winterArc.runs[0]!.id, pack('standard').habits, true);
    });
    const focus = screen.getByRole('region', { name: 'Schwerpunkt der Woche' });
    // Week 2 of 6: the thirteen focuses spread over the weeks.
    expect(focus.firstElementChild!.className).toContain('wa-verse');
    expect(focus.textContent).toContain('Disziplin · Kann ich es halten?');
    expect(focus.textContent).toContain('Die Arbeit schützen.');
    fireEvent.click(screen.getByRole('button', { name: 'Frühere Woche' }));
    expect(screen.getByRole('region', { name: 'Schwerpunkt der Woche' }).textContent).toContain('Einfach da sein.');
    expect(within(document.querySelector('.desert-guide') as HTMLElement).getByText('Der 90-Tage-Standard')).toBeTruthy();
  });

  it('has no weekly focus without the points of the standard', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s));
    expect(screen.queryByRole('region', { name: 'Schwerpunkt der Woche' })).toBeNull();
    expect(within(document.querySelector('.desert-guide') as HTMLElement).queryByText('Der 90-Tage-Standard')).toBeNull();
  });

  it('shows the overview as the week grid of "Heute", one week at a time, to read only', async () => {
    const store = await renderArena('/arena?bereich=wuestenwanderung', (s) => {
      withDesert(s);
      const h = s.getProfile().habits.find((x) => x.id === 'wz-handy-spaeter')!;
      s.toggleHabit('2026-09-15', h);
      s.toggleHabit('2026-09-22', h);
      s.toggleHabit('2026-09-25', s.getProfile().habits.find((x) => x.id === 'wz-freitagsfasten')!);
    });
    const overview = document.querySelector('.wa-overview') as HTMLElement;
    // On top of the page, above the journal; the table is the one of "Heute" (class "habits").
    expect(overview.compareDocumentPosition(document.querySelector('.desert-entries')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const table = overview.querySelector('table.habits') as HTMLElement;
    expect([...table.querySelectorAll('thead th')].slice(1).map((t) => t.textContent)).toEqual(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
    expect(table.querySelector('thead th.is-today')!.textContent).toBe('Sa');
    expect(table.querySelector('.group-row')!.textContent).toBe('Wüstenzeit');
    // Starts in this week (week 2 of 6), with the habits of the Wüstenzeit only.
    expect(overview.querySelector('h4')!.textContent).toBe('Diese WocheWoche 2 von 6');
    expect([...table.querySelectorAll('tbody th[scope="row"]')].map((t) => t.textContent)).toEqual([
      'Morgensegen',
      'Bibel lesen',
      'Handy später',
      'Dankbarkeit',
      'Freitagsfasten',
    ]);
    const mark = (label: string) => within(table).getByRole('img', { name: label });
    expect(mark('Handy später, Di 22.9.: abgehakt').className).toContain('is-on');
    expect(mark('Handy später, Mi 23.9.: nicht abgehakt').className).not.toContain('is-on');
    expect(mark('Handy später, Sa 26.9.: nicht abgehakt').className).toContain('today');
    expect(mark('Handy später, So 27.9.: liegt noch vor dir').className).toContain('future');
    // Friday fasting: meant for Fridays only, the other days a dash.
    expect(mark('Freitagsfasten, Fr 25.9.: abgehakt').className).toContain('is-on');
    expect(table.querySelectorAll('td.wa-off')).toHaveLength(6);
    // Nothing to tap, and no count.
    expect(table.querySelectorAll('button, input, a')).toHaveLength(0);
    expect(overview.textContent).not.toMatch(/\d+\s*%|in Folge|Streak|Serie/);
    // The week before, with its ticks; the arrows stop at the first and the last week.
    fireEvent.click(within(overview).getByRole('button', { name: 'Vorwoche' }));
    expect(overview.querySelector('h4')!.textContent).toBe('Woche 1Woche 1 von 6');
    expect(mark('Handy später, Di 15.9.: abgehakt').className).toContain('is-on');
    expect(within(overview).getByRole('button', { name: 'Vorwoche' })).toHaveProperty('disabled', true);
    for (let i = 0; i < 5; i++) fireEvent.click(within(overview).getByRole('button', { name: 'Folgewoche' }));
    expect(overview.querySelector('h4')!.textContent).toBe('Woche 6Woche 6 von 6');
    expect(within(overview).getByRole('button', { name: 'Folgewoche' })).toHaveProperty('disabled', true);
    // The review: the week before has ended; its three lines end in the word of comfort (rule 1).
    expect(document.querySelector('.wa-review')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Frühere Woche' }));
    const review = document.querySelector('.wa-review') as HTMLElement;
    fireEvent.change(within(review).getByLabelText('Ein Sieg dieser Woche'), { target: { value: 'Jeden Morgen gelesen' } });
    expect(store.getProfile().winterArc.weeks[0]).toMatchObject({ week: 1, review: { win: 'Jeden Morgen gelesen' } });
    expect(review.lastElementChild!.textContent).toContain('alle Morgen neu');
    expect(document.querySelector('.desert-kept')!.textContent).toContain('Handy späteran 2 Tagen gehalten');
  });

  it('shows weekly and monthly habits as the pill of "Heute", to read only', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', (s) => {
      s.startDesert('2026-09-14', 40);
      const run = s.getProfile().winterArc.runs[0]!;
      s.chooseDesert(run.id, [pack('wuestenweg').habits.find((h) => h.id === 'wz-freitagsfasten')!], true);
      s.updateProfile((p) => ({
        ...p,
        habits: [
          ...p.habits,
          { id: 'x-weekly', name: 'Wochenwerk', rhythm: 'weekly', auto: null, active: false, preset: false, focus: false, desert: 'own' },
          { id: 'x-monthly', name: 'Monatswerk', rhythm: 'monthly', auto: null, active: false, preset: false, focus: false, desert: 'own' },
        ],
        winterArc: { ...p.winterArc, runs: p.winterArc.runs.map((r) => ({ ...r, habits: [...(r.habits ?? []), 'x-weekly', 'x-monthly'] })) },
      }));
      const get = (id: string) => s.getProfile().habits.find((h) => h.id === id)!;
      // A Wednesday of the first week, and a day of September.
      s.toggleHabit('2026-09-16', get('x-weekly'));
      s.toggleHabit('2026-09-18', get('x-monthly'));
    });
    const overview = document.querySelector('.wa-overview') as HTMLElement;
    const pill = (name: string) => within(overview).getByRole('img', { name: new RegExp(`^${name},`) });
    // Week 2: this week not yet ticked; September is.
    expect(pill('Wochenwerk').textContent).toBe('diese Woche');
    expect(pill('Wochenwerk').className).not.toContain('is-on');
    expect(pill('Monatswerk').textContent).toBe('✓ diesen Monat');
    expect(pill('Monatswerk').className).toContain('is-on');
    fireEvent.click(within(overview).getByRole('button', { name: 'Vorwoche' }));
    expect(pill('Wochenwerk').textContent).toBe('✓ diese Woche');
    // The last week lies in October: not ticked there.
    for (let i = 0; i < 5; i++) fireEvent.click(within(overview).getByRole('button', { name: 'Folgewoche' }));
    expect(pill('Monatswerk').textContent).toBe('diesen Monat');
    expect(overview.querySelectorAll('button:not(.wa-pager-btn)')).toHaveLength(0);
  });

  it('opens on the first week before the beginning, and on the last after the end', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s), new Date(2026, 8, 1, 7));
    expect(document.querySelector('.wa-overview h4')!.textContent).toBe('Woche 1Woche 1 von 6');
    cleanup();
    // After the last day (23 October) the close stands in the Arena; nothing of the overview is left to tick there.
    await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s), new Date(2026, 9, 24, 7));
    expect(screen.getByRole('heading', { name: 'Die Wüstenzeit ist zu Ende' })).toBeTruthy();
    expect(document.querySelector('.wa-overview')).toBeNull();
  });

  it('has nothing to tick or to choose: the habits are kept under "Heute"', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s));
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Paket übernehmen' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Heute' }).getAttribute('href')).toBe('/');
    expect(document.body.textContent).toContain('Die Gewohnheiten pflegst und hakst du unter Heute ab.');
    // No title line under the head, like the other places; no more days or weeks to page through.
    expect(document.querySelector('.place-sub')).toBeNull();
    expect(screen.queryByRole('group', { name: 'Ansicht der Wüstenzeit' })).toBeNull();
    // Review and guide stay, folded; and the way to end it.
    expect(screen.getByText('Rückblick', { selector: 'summary' })).toBeTruthy();
    expect(screen.getByText('Anleitung', { selector: 'summary' })).toBeTruthy();
    expect(screen.getByText('Einstellungen der Wüstenzeit')).toBeTruthy();
  });

  it('never marks anything in red, as a streak or as a rate', async () => {
    await renderArena('/arena?bereich=wuestenwanderung', (s) => withDesert(s));
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
