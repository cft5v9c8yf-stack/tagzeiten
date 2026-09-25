// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { ArchivePage } from '../archive/ArchivePage';
import { CatechismPage } from '../catechism/CatechismPage';
import { SettingsPage } from './SettingsPage';

let blobs: Blob[] = [];
beforeEach(() => {
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
      fireEvent.click(screen.getByRole('button', { name: 'Sicherung einspielen' }));
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

describe('Mehr: Reihenfolge und Fokus', () => {
  const dailyIds = (s: Store) => s.getProfile().habits.filter((h) => h.rhythm === 'daily').map((h) => h.id);

  it('moves a habit within its group and keeps the focus on the button', async () => {
    const { store } = await renderAt('/mehr', <SettingsPage />);
    const before = dailyIds(store);
    const up = await screen.findByRole('button', { name: 'Tischgebet mit der Familie nach oben' });
    up.focus();
    fireEvent.click(up);
    const after = dailyIds(store);
    expect(after.indexOf('tablePrayer')).toBe(before.indexOf('tablePrayer') - 1);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Tischgebet mit der Familie nach oben' })),
    );
    expect(screen.getByText(/Tischgebet mit der Familie: Platz \d von \d/)).toBeTruthy();
  });

  it('cannot move the first habit of a group further up', async () => {
    await renderAt('/mehr', <SettingsPage />);
    const first = (await screen.findByRole('button', { name: 'Stille Zeit nach oben' })) as HTMLButtonElement;
    expect(first.disabled).toBe(true);
    const firstWeekly = screen.getByRole('button', { name: 'Gottesdienst – den Feiertag heiligen nach oben' }) as HTMLButtonElement;
    expect(firstWeekly.disabled).toBe(true);
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
