// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { TagzeitenDB } from '../../data/db';
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
  if (path === '/mehr') openAllMore();
  const router = createMemoryRouter(
    [
      { path: path.split('?')[0]!, element },
      { path: '/', element: <p>Start</p> },
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
  it('starts folded, remembers what was opened and gathers the settings', async () => {
    const db = new TagzeitenDB(`m6-fold-${++n}`);
    const store = new Store({ db, journal: memoryJournal() });
    const router = createMemoryRouter([{ path: '/mehr', element: <SettingsPage /> }], { initialEntries: ['/mehr'] });
    const view = render(
      <ToastProvider>
        <StoreProvider store={store}>
          <RouterProvider router={router} />
        </StoreProvider>
      </ToastProvider>,
    );
    const top = await screen.findAllByRole('heading', { level: 2 });
    expect(top.map((h) => h.textContent).filter((t) => t !== 'Mehr')).toEqual(['Gewohnheiten', 'Gebetsübersicht', 'Leseplan', 'Zeiten', 'Einstellungen']);
    const habits = screen.getByRole('button', { name: 'Gewohnheiten' });
    expect(habits.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('switch', { name: 'Fasten' })).toBeNull();

    fireEvent.click(habits);
    await waitFor(() => expect(habits.getAttribute('aria-expanded')).toBe('true'));
    expect(screen.getByRole('switch', { name: 'Fasten' })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('tz:collapsed')!)).toMatchObject({ 'more.habits': true });

    // Darstellung, Deine Daten and Über sit under "Einstellungen".
    fireEvent.click(screen.getByRole('button', { name: 'Einstellungen' }));
    const sub = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(sub).toEqual(expect.arrayContaining(['Darstellung', 'Deine Daten', 'Über Tagzeiten']));

    // Remembered after leaving and coming back.
    view.unmount();
    render(
      <ToastProvider>
        <StoreProvider store={store}>
          <RouterProvider router={createMemoryRouter([{ path: '/mehr', element: <SettingsPage /> }], { initialEntries: ['/mehr'] })} />
        </StoreProvider>
      </ToastProvider>,
    );
    expect((await screen.findByRole('button', { name: 'Gewohnheiten' })).getAttribute('aria-expanded')).toBe('true');
  });

  it('shows a Bible verse, and the explanation behind the "i" in a bubble', async () => {
    await renderAt('/mehr', <SettingsPage />);
    const heading = await screen.findByRole('heading', { name: 'Leseplan' });
    const section = heading.closest('section')!;
    expect(section.querySelector('.section-verse blockquote')!.textContent).toBe(
      'Dein Wort ist meines Fußes Leuchte und ein Licht auf meinem Wege.',
    );
    const info = screen.getByRole('button', { name: 'Info zu Leseplan' });
    const bubble = document.getElementById(info.getAttribute('aria-controls')!)!;
    expect(bubble.hidden).toBe(true);
    fireEvent.click(info);
    expect(bubble.hidden).toBe(false);
    expect(bubble.textContent).toContain('nach Fortschritt, nicht nach Datum');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(bubble.hidden).toBe(true);
  });
});

describe('Mehr: Daten', () => {
  it('exports every entry as Markdown and as JSON', async () => {
    await renderAt('/mehr', <SettingsPage />, fill);
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
    const { db } = await renderAt('/mehr', <SettingsPage />, fill);
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

    const { store } = await renderAt('/mehr', <SettingsPage />);
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
    await renderAt('/mehr', <SettingsPage />);
    const input = (await screen.findByText('Datei wählen …')).querySelector('input')!;
    await act(async () => {
      fireEvent.change(input, { target: { files: [new File(['{"a":1}'], 'x.json')] } });
    });
    expect((await screen.findByRole('alert')).textContent).toBe('Das ist keine Sicherung aus Tagzeiten.');
  });
});

describe('Mehr: Gewohnheiten', () => {
  it('adds, switches and deletes an own habit', async () => {
    const { store } = await renderAt('/mehr', <SettingsPage />);
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Psalm mit den Kindern' } });
    fireEvent.click(screen.getByText('Gewohnheit anlegen'));
    const own = store.getProfile().habits.find((h) => h.name === 'Psalm mit den Kindern')!;
    expect(own).toMatchObject({ rhythm: 'daily', active: true, preset: false });

    fireEvent.click(screen.getByRole('button', { name: 'Psalm mit den Kindern löschen' }));
    fireEvent.click(screen.getByText('Löschen'));
    expect(store.getProfile().habits.some((h) => h.id === own.id)).toBe(false);
  });

  it('offers no way to delete a preset, only to switch it off', async () => {
    const { store } = await renderAt('/mehr', <SettingsPage />);
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
    const { store } = await renderAt('/mehr', <SettingsPage />);
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
    const { store } = await renderAt('/mehr', <SettingsPage />);
    const before = dailyIds(store);
    const handle = await screen.findByRole('button', { name: 'Die Kinder segnen verschieben' });
    fakeLayout();
    fireEvent.pointerDown(handle, { pointerId: 1, pointerType: 'mouse', button: 0, clientY: 250 });
    fireEvent.pointerMove(handle, { pointerId: 1, pointerType: 'mouse', clientY: 20 });
    fireEvent.pointerCancel(handle, { pointerId: 1 });
    expect(dailyIds(store)).toEqual(before);
  });

  it('moves with the arrow keys on the handle and keeps the focus there', async () => {
    const { store } = await renderAt('/mehr', <SettingsPage />);
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
    const { store } = await renderAt('/mehr', <SettingsPage />);
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

  it('marks pieces as learned by heart and counts them', async () => {
    const { store } = await renderAt('/katechismus', <CatechismPage />);
    const buttons = await screen.findAllByText('auswendig gelernt');
    fireEvent.click(buttons[0]!);
    expect(Object.keys(store.getProfile().catechism.memorized)).toHaveLength(1);
    expect(screen.getByText('1 / 35')).toBeTruthy();
  });

  it('shows an overview of the chief parts for orientation', async () => {
    const { store } = await renderAt('/katechismus', <CatechismPage />);
    const toggle = await screen.findByRole('button', { name: 'Übersicht' });
    const overview = toggle.closest('section')!;
    const head = overview.querySelector('.fold-head')!;
    // Closed by default, with the total next to the heading.
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(head.textContent).toContain('0 von 35 Stücken auswendig');
    fireEvent.click(toggle);
    await waitFor(() => expect(toggle.getAttribute('aria-expanded')).toBe('true'));
    expect(JSON.parse(localStorage.getItem('tz:collapsed')!)).toMatchObject({ 'cat.overview': true });
    const rows = overview.querySelectorAll('.overview-row');
    expect(rows).toHaveLength(6);
    expect(rows[0]!.textContent).toContain('0 von 11 Stücken auswendig');

    fireEvent.click(screen.getAllByText('auswendig gelernt')[0]!); // first piece of this week's chief part
    expect(Object.keys(store.getProfile().catechism.memorized)).toHaveLength(1);
    const known = overview.querySelectorAll('.piece-mark.known');
    expect(known).toHaveLength(1);
    expect(overview.textContent).toMatch(/1 von \d+ Stücken auswendig/);
    expect(head.textContent).toContain('1 von 35 Stücken auswendig');

    // Tapping a mark opens its chief part and jumps to the piece.
    const mark = overview.querySelectorAll<HTMLButtonElement>('.overview-row')[5]!.querySelector('.piece-mark')!;
    fireEvent.click(mark);
    expect(screen.getByRole('button', { name: '6 Das Sakrament des Altars' }).getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement!.id).toBe('piece-lordsSupper.0');

    // Orientation, no tracker: no dates, no streaks.
    expect(overview.textContent).not.toMatch(/\d{1,2}\.\d{1,2}\.|zuletzt|Serie|in Folge|verpasst/);
  });

  it('lets the chief part of the week be chosen', async () => {
    await renderAt('/katechismus', <CatechismPage />);
    fireEvent.change(await screen.findByLabelText('Hauptstück dieser Woche'), { target: { value: '2' } });
    expect(screen.getByText(/Heute:/).textContent).toMatch(/Bitte|Anrede|Beschluß/);
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
});
