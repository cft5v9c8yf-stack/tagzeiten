// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { TagzeitenDB } from '../../data/db';
import { scheduleFor } from '../../domain/schedule';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { ArchivePage } from '../archive/ArchivePage';
import { CatechismPage } from '../catechism/CatechismPage';
import { resetOpenState, setOpen } from '../../ui/collapseState';
import { SettingsPage } from './SettingsPage';

/** Under "Mehr" everything starts folded; most tests work inside the sections. */
function openAllMore() {
  for (const id of ['habits', 'prayer', 'plan', 'times', 'settings', 'display', 'data', 'about']) setOpen(`more.${id}`, true);
}

let blobs: Blob[] = [];
beforeEach(() => {
  localStorage.clear();
  resetOpenState();
  blobs = [];
  URL.createObjectURL = vi.fn((b: Blob) => {
    blobs.push(b);
    return 'blob:test';
  });
  URL.revokeObjectURL = vi.fn();
  HTMLAnchorElement.prototype.click = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

let n = 0;
async function renderAt(path: string, element: React.ReactNode, prepare?: (s: Store) => void) {
  const db = new TagzeitenDB(`m6-${++n}`);
  const store = new Store({ db, journal: memoryJournal(), now: () => new Date(2026, 8, 25, 9) });
  await store.load();
  prepare?.(store);
  await store.flush();
  if (path.startsWith('/mehr')) openAllMore();
  const base = ['/mehr', '/katechismus'].find((b) => path.startsWith(b));
  const routes = base
    ? [
        { path: base, element },
        { path: `${base}/:${base === '/mehr' ? 'bereich' : 'teil'}`, element },
      ]
    : [{ path: path.split('?')[0]!, element }];
  const router = createMemoryRouter(
    [...routes, { path: '/', element: <p>Start</p> }],
    { initialEntries: [path] },
  );
  render(
    <ToastProvider>
      <StoreProvider store={store}>
        <RouterProvider router={router} />
      </StoreProvider>
    </ToastProvider>,
  );
  return { store, db };
}

const fill = (s: Store) => {
  s.updateDay('2026-09-24', (d) => ({
    ...d,
    morning: { ...d.morning, done: true, verse: 'Sei stille dem HERRN', verseRef: 'Psalm 37,7', three: { house: 'Mit Anna spazieren' } },
    evening: { ...d.evening, thanks: ['das Gespräch mit Paul'] },
  }));
  s.updateDay('2026-09-23', (d) => ({ ...d, morning: { ...d.morning, mainPoint: 'Gott hält Wort' } }));
};

describe('Mehr: Aufbau', () => {
  it('shows the areas as tiles, two side by side, and opens one with its settings', async () => {
    await renderAt('/mehr', <SettingsPage />);
    expect((await screen.findByRole('heading', { level: 2 })).textContent).toBe('Mehr');
    const tiles = [...document.querySelectorAll('.more-tile')].map((t) => t.querySelector('.more-tile-title')!.textContent);
    expect(tiles).toEqual(['Gewohnheiten', 'Gebetsübersicht', 'Zeiten', 'Einstellungen']);
    expect(screen.queryByRole('switch', { name: 'Fasten' })).toBeNull();

    fireEvent.click(screen.getByRole('link', { name: /^Gewohnheiten/ }));
    expect((await screen.findByRole('heading', { level: 2 })).textContent).toBe('Gewohnheiten');
    expect(screen.getByRole('switch', { name: 'Fasten' })).toBeTruthy();

    fireEvent.click(screen.getByRole('link', { name: '‹ Mehr' }));
    await waitFor(() => expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Mehr'));
  });

  it('gathers Darstellung, Deine Daten and Über under "Einstellungen", folded and remembered', async () => {
    resetOpenState();
    const db = new TagzeitenDB(`m6-fold-${++n}`);
    const store = new Store({ db, journal: memoryJournal() });
    const page = () => (
      <ToastProvider>
        <StoreProvider store={store}>
          <RouterProvider
            router={createMemoryRouter([{ path: '/mehr/:bereich', element: <SettingsPage /> }], {
              initialEntries: ['/mehr/einstellungen'],
            })}
          />
        </StoreProvider>
      </ToastProvider>
    );
    const view = render(page());
    await screen.findByRole('heading', { level: 2, name: /Einstellungen/ });
    const sub = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(sub).toEqual(['Darstellung', 'Deine Daten', 'Über Tagzeiten']);
    // No verse above the settings, only their explanations.
    expect(document.querySelector('.section-verse')).toBeNull();
    expect(screen.getByRole('button', { name: 'Info zu Darstellung' })).toBeTruthy();
    const display = screen.getByRole('button', { name: 'Darstellung' });
    expect(display.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(display);
    await waitFor(() => expect(display.getAttribute('aria-expanded')).toBe('true'));
    view.unmount();
    render(page());
    expect((await screen.findByRole('button', { name: 'Darstellung' })).getAttribute('aria-expanded')).toBe('true');
  });

  it('shows a Bible verse, and the explanation behind the "i" in a bubble', async () => {
    await renderAt('/mehr/zeiten', <SettingsPage />);
    await screen.findByRole('heading', { level: 2, name: /Zeiten/ });
    expect(document.querySelector('.section-verse blockquote')!.textContent).toBe('Meine Zeit steht in deinen Händen.');
    const info = screen.getByRole('button', { name: 'Info zu Zeiten' });
    const bubble = document.getElementById(info.getAttribute('aria-controls')!)!;
    expect(bubble.hidden).toBe(true);
    fireEvent.click(info);
    expect(bubble.hidden).toBe(false);
    expect(bubble.textContent).toContain('Nicht jeder steht um vier auf.');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(bubble.hidden).toBe(true);
  });
});

describe('Mehr: Daten', () => {
  it('exports every entry as Markdown and as JSON', async () => {
    await renderAt('/mehr/einstellungen', <SettingsPage />, fill);
    fireEvent.click(await screen.findByText('Als Text exportieren (Markdown)'));
    await waitFor(() => expect(blobs).toHaveLength(1));
    const md = await blobs[0]!.text();
    for (const t of ['Sei stille dem HERRN', 'Psalm 37,7', 'Mit Anna spazieren', 'das Gespräch mit Paul', 'Gott hält Wort']) {
      expect(md).toContain(t);
    }
    fireEvent.click(screen.getByText('Sicherung exportieren (JSON)'));
    await waitFor(() => expect(blobs).toHaveLength(2));
    const json = JSON.parse(await blobs[1]!.text());
    expect(json.days.map((d: { date: string }) => d.date)).toEqual(['2026-09-23', '2026-09-24']);
  });

  it('asks on the page before deleting, then leaves the database empty', async () => {
    const { db } = await renderAt('/mehr/einstellungen', <SettingsPage />, fill);
    expect(await db.days.count()).toBe(2);
    fireEvent.click(await screen.findByText('Alle Einträge löschen …'));
    expect(screen.getByText(/lässt sich nicht rückgängig machen/)).toBeTruthy();
    fireEvent.click(screen.getByText('Abbrechen'));
    expect(await db.days.count()).toBe(2);

    fireEvent.click(screen.getByText('Alle Einträge löschen …'));
    fireEvent.click(screen.getByText('Endgültig löschen'));
    await screen.findByText('Start');
    expect(await db.days.count()).toBe(0);
    expect(await db.profile.count()).toBe(0);
  });

  it('shows what an import will replace before replacing it', async () => {
    const source = new Store({ db: new TagzeitenDB(`m6-src-${++n}`), journal: memoryJournal() });
    await source.load();
    fill(source);
    const backup = JSON.stringify(await source.exportBackup());

    const { store } = await renderAt('/mehr/einstellungen', <SettingsPage />);
    const input = (await screen.findByText('Datei wählen …')).querySelector('input')!;
    const file = new File([backup], 'sicherung.json', { type: 'application/json' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    await screen.findByText(/enthält 2 Tage/);
    expect(store.allDays()).toHaveLength(0);
    await act(async () => {
      const confirm = screen.getByText(/enthält 2 Tage/).closest('.confirm-panel') as HTMLElement;
      fireEvent.click(within(confirm).getByRole('button', { name: 'Sicherung einspielen' }));
    });
    await waitFor(() => expect(store.allDays()).toHaveLength(2));
    expect(store.getDay('2026-09-24').morning.verse).toBe('Sei stille dem HERRN');
  });

  it('rejects a file that is not a backup', async () => {
    await renderAt('/mehr/einstellungen', <SettingsPage />);
    const input = (await screen.findByText('Datei wählen …')).querySelector('input')!;
    await act(async () => {
      fireEvent.change(input, { target: { files: [new File(['{"a":1}'], 'x.json')] } });
    });
    expect((await screen.findByRole('alert')).textContent).toBe('Das ist keine Sicherung aus Tagzeiten.');
  });
});

describe('Mehr: Gewohnheiten', () => {
  it('adds, switches and deletes an own habit', async () => {
    const { store } = await renderAt('/mehr/gewohnheiten', <SettingsPage />);
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Psalm mit den Kindern' } });
    fireEvent.click(screen.getByText('Gewohnheit anlegen'));
    const own = store.getProfile().habits.find((h) => h.name === 'Psalm mit den Kindern')!;
    expect(own).toMatchObject({ rhythm: 'daily', active: true, preset: false });

    fireEvent.click(screen.getByRole('button', { name: 'Psalm mit den Kindern löschen' }));
    fireEvent.click(screen.getByText('Löschen'));
    expect(store.getProfile().habits.some((h) => h.id === own.id)).toBe(false);
  });

  it('offers no way to delete a preset, only to switch it off', async () => {
    const { store } = await renderAt('/mehr/gewohnheiten', <SettingsPage />);
    const sw = await screen.findByRole('switch', { name: 'Fasten' });
    expect(screen.queryByRole('button', { name: 'Fasten löschen' })).toBeNull();
    fireEvent.click(sw);
    expect(store.getProfile().habits.find((h) => h.id === 'fasting')!.active).toBe(true);
  });
});

describe('Mehr: Reihenfolge per Ziehen und Fokus', () => {
  const dailyIds = (s: Store) => s.getProfile().habits.filter((h) => h.rhythm === 'daily').map((h) => h.id);

  /** jsdom has no layout: give every row of a list a 60px slot. */
  function fakeLayout() {
    document.querySelectorAll('.habit-list').forEach((list) => {
      list.querySelectorAll<HTMLElement>('[data-sort-id]').forEach((row, i) => {
        row.getBoundingClientRect = () => ({ top: i * 60, height: 60, bottom: i * 60 + 60, left: 0, right: 300, width: 300, x: 0, y: i * 60, toJSON: () => ({}) });
      });
    });
  }

  it('reorders a habit by dragging its handle', async () => {
    const { store } = await renderAt('/mehr/gewohnheiten', <SettingsPage />);
    const before = dailyIds(store);
    const handle = await screen.findByRole('button', { name: 'Tischgebet mit der Familie verschieben' });
    fakeLayout();
    const from = before.indexOf('tablePrayer');
    const y = from * 60 + 30;
    fireEvent.pointerDown(handle, { pointerId: 1, pointerType: 'touch', clientY: y });
    fireEvent.pointerMove(handle, { pointerId: 1, pointerType: 'touch', clientY: y + 70 });
    fireEvent.pointerMove(handle, { pointerId: 1, pointerType: 'touch', clientY: y + 130 });
    // While dragging, nothing is saved yet and the row follows the finger.
    expect(dailyIds(store)).toEqual(before);
    expect(handle.closest('li')!.style.transform).toBe('translateY(130px)');
    fireEvent.pointerUp(handle, { pointerId: 1, pointerType: 'touch', clientY: y + 130 });
    const after = dailyIds(store);
    expect(after.indexOf('tablePrayer')).toBe(from + 2);
    expect(after.slice().sort()).toEqual(before.slice().sort());
    expect(screen.getByText(new RegExp(`Tischgebet mit der Familie: Platz ${from + 3} von`))).toBeTruthy();
  });

  it('keeps the order when a drag is cancelled', async () => {
    const { store } = await renderAt('/mehr/gewohnheiten', <SettingsPage />);
    const before = dailyIds(store);
    const handle = await screen.findByRole('button', { name: 'Die Kinder segnen verschieben' });
    fakeLayout();
    fireEvent.pointerDown(handle, { pointerId: 1, pointerType: 'mouse', button: 0, clientY: 250 });
    fireEvent.pointerMove(handle, { pointerId: 1, pointerType: 'mouse', clientY: 20 });
    fireEvent.pointerCancel(handle, { pointerId: 1 });
    expect(dailyIds(store)).toEqual(before);
  });

  it('moves with the arrow keys on the handle and keeps the focus there', async () => {
    const { store } = await renderAt('/mehr/gewohnheiten', <SettingsPage />);
    const before = dailyIds(store);
    const handle = await screen.findByRole('button', { name: 'Tischgebet mit der Familie verschieben' });
    handle.focus();
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(dailyIds(store).indexOf('tablePrayer')).toBe(before.indexOf('tablePrayer') - 1);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Tischgebet mit der Familie verschieben' })),
    );
    // The first habit of a group stays first.
    const first = screen.getByRole('button', { name: 'Stille Zeit verschieben' });
    fireEvent.keyDown(first, { key: 'ArrowUp' });
    expect(dailyIds(store)[0]).toBe('stillTime');
  });

  it('marks a habit as focus with a star', async () => {
    const { store } = await renderAt('/mehr/gewohnheiten', <SettingsPage />);
    const star = await screen.findByRole('button', { name: 'Fokus: Die Kinder segnen' });
    expect(star.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(star);
    expect(star.getAttribute('aria-pressed')).toBe('true');
    expect(store.getProfile().habits.find((h) => h.id === 'blessChildren')!.focus).toBe(true);
  });
});

describe('Katechismus', () => {
  it('shows the answer in the house father mode only after a tap', async () => {
    await renderAt('/katechismus', <CatechismPage />);
    fireEvent.click(await screen.findByText('Hausvater-Modus: am Tisch abfragen'));
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('.hf-answer')).toBeNull();
    fireEvent.click(screen.getByText('Antwort zeigen'));
    expect(dialog.querySelector('.hf-answer')!.textContent!.length).toBeGreaterThan(10);
    fireEvent.click(screen.getByText('Hausvater-Modus beenden'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('marks pieces as learned by heart on the page of the chief part', async () => {
    const { store } = await renderAt('/katechismus/confession', <CatechismPage />);
    expect((await screen.findByRole('heading', { level: 2 })).textContent).toContain('Die Beichte');
    fireEvent.click(screen.getAllByText('auswendig gelernt')[0]!);
    expect(Object.keys(store.getProfile().catechism.memorized)).toHaveLength(1);
    expect(document.querySelector('progress')).toBeNull();
    fireEvent.click(screen.getByRole('link', { name: '‹ Katechismus' }));
    await screen.findByRole('heading', { name: 'Hauptstücke' });
    expect(document.querySelector('.overview-total')!.textContent).toContain('1 von 35 Stücken auswendig');
  });

  it('shows the chief parts as tiles, two side by side, each opening its part', async () => {
    await renderAt('/katechismus', <CatechismPage />);
    await screen.findByRole('heading', { name: 'Hauptstücke' });
    const tiles = [...document.querySelectorAll('#cat-parts ~ .overview-list .overview-row, .cat-overview .overview-row')];
    expect(document.querySelectorAll('.overview-row')).toHaveLength(9); // 6 chief parts, 3 appendices
    expect(tiles[0]!.textContent).toContain('0 von 11 Stücken auswendig');
    expect(document.querySelector('.overview-row.current')!.textContent).toContain('diese Woche');
    // Orientation, no tracker: no dates, no streaks.
    expect(document.querySelector('.cat-overview')!.textContent).not.toMatch(/\d{1,2}\.\d{1,2}\.|zuletzt|Serie|in Folge|verpasst/);

    fireEvent.click(screen.getByRole('link', { name: /Das Sakrament des Altars/ }));
    expect((await screen.findByRole('heading', { level: 2 })).textContent).toContain('Das Sakrament des Altars');
    expect(screen.getAllByText('auswendig gelernt').length).toBeGreaterThan(0);
  });

  it('jumps from today\'s piece to it on the page of the chief part', async () => {
    await renderAt('/katechismus', <CatechismPage />);
    const today = await screen.findByText(/Heute:/);
    fireEvent.click(within(today).getByRole('link'));
    await waitFor(() => expect(document.activeElement!.id).toMatch(/^piece-confession\./));
  });

  it('lets the chief part of the week be chosen', async () => {
    await renderAt('/katechismus', <CatechismPage />);
    fireEvent.change(await screen.findByLabelText('Anderes Hauptstück für diese Woche'), { target: { value: '2' } });
    expect(screen.getByText(/Heute:/).textContent).toMatch(/Bitte|Anrede|Beschluß/);
    expect(document.querySelector('.cat-week-title')!.textContent).toContain('Das Vaterunser');
  });
});

describe('Archiv', () => {
  it('lists days and verses and searches everything', async () => {
    await renderAt('/archiv', <ArchivePage />, fill);
    expect(await screen.findByText('2 Tage mit Einträgen')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Archiv durchsuchen'), { target: { value: 'anna' } });
    expect(screen.getByText('1 Treffer')).toBeTruthy();
    fireEvent.click(screen.getByText('Versesammlung'));
    expect(screen.getByText('Sei stille dem HERRN')).toBeTruthy();
  });

  it('sets times per weekday: working days and weekend, and further days with +', async () => {
    const { store } = await renderAt('/mehr/zeiten', <SettingsPage />);
    await screen.findByRole('heading', { level: 2, name: /Zeiten/ });
    expect(screen.getAllByLabelText('Aufstehen')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Tage unterschiedlich' }));
    await waitFor(() => expect(screen.getAllByLabelText('Aufstehen')).toHaveLength(2));
    expect([...document.querySelectorAll('.schedule-group legend')].map((l) => l.textContent)).toEqual([
      'Mo – Fr',
      'Sa, So',
    ]);
    fireEvent.change(screen.getAllByLabelText('Aufstehen')[1]!, { target: { value: '07:00' } });
    await waitFor(() => expect(scheduleFor(store.getProfile(), '2026-09-26').rise).toBe('07:00'));
    expect(scheduleFor(store.getProfile(), '2026-09-25').rise).toBe('04:00');

    fireEvent.click(screen.getByRole('button', { name: /Zeiten für weitere Tage/ }));
    await waitFor(() => expect(document.querySelectorAll('.schedule-group')).toHaveLength(3));
    const third = document.querySelectorAll('.schedule-group')[2]!;
    fireEvent.click(within(third as HTMLElement).getByRole('button', { name: 'Sonntag' }));
    await waitFor(() =>
      expect([...document.querySelectorAll('.schedule-group legend')].map((l) => l.textContent)).toEqual([
        'Mo – Fr',
        'Sa',
        'So',
      ]),
    );

    // Back to the same times every day; the groups wait for a return.
    fireEvent.click(screen.getByRole('button', { name: 'Alle Tage gleich' }));
    await waitFor(() => expect(scheduleFor(store.getProfile(), '2026-09-26').rise).toBe('04:00'));
    expect(store.getProfile().scheduleDays!.groups).toHaveLength(3);
  });

  it('writes concerns as tags and sets them on days, several a day', async () => {
    const { store } = await renderAt('/mehr/gebet', <SettingsPage />);
    await screen.findByRole('heading', { level: 2, name: /Gebetsübersicht/ });
    fireEvent.change(screen.getByLabelText('Neues Anliegen'), { target: { value: 'Verfolgte Kirche' } });
    fireEvent.click(screen.getByRole('button', { name: 'Anliegen anlegen' }));
    await waitFor(() => expect(store.getProfile().prayer.concerns).toEqual(['Verfolgte Kirche']));

    fireEvent.click(screen.getByRole('button', { name: 'Anliegen am Montag hinzufügen' }));
    fireEvent.change(screen.getByLabelText('Anliegen wählen oder neu'), { target: { value: 'Verfolgte Kirche' } });
    fireEvent.click(screen.getByRole('button', { name: 'Hinzufügen' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Anliegen am Montag hinzufügen' }));
    fireEvent.change(screen.getByLabelText('Anliegen wählen oder neu'), { target: { value: 'Missionare' } });
    fireEvent.click(screen.getByRole('button', { name: 'Hinzufügen' }));
    await waitFor(() => expect(store.getProfile().prayer.weekly[1]).toEqual(['Verfolgte Kirche', 'Missionare']));
    expect(store.getProfile().prayer.concerns).toEqual(['Verfolgte Kirche', 'Missionare']);

    fireEvent.click(screen.getByRole('button', { name: '„Missionare“ am Montag entfernen' }));
    await waitFor(() => expect(store.getProfile().prayer.weekly[1]).toEqual(['Verfolgte Kirche']));
    fireEvent.click(screen.getByRole('button', { name: '„Verfolgte Kirche“ ganz entfernen' }));
    await waitFor(() => expect(store.getProfile().prayer.weekly[1]).toBeUndefined());
  });
});
