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
import { CatechismPage } from '../catechism/CatechismPage';
import { resetOpenState, setOpen } from '../../ui/collapseState';
import { SettingsPage } from './SettingsPage';

/** Under "Mehr" everything starts folded; most tests work inside the sections. */
function openAllMore() {
  for (const id of ['habits', 'prayer', 'plan', 'times', 'settings', 'display', 'data', 'install', 'airplane', 'about', 'prayerlist', 'house', 'treasury', 'treasury.ehefrau', 'treasury.ehemann', 'treasury.eltern', 'display.theme', 'display.habitHistory', 'display.atBed', 'display.compline', 'display.armor', 'display.winterArc', 'data.keep', 'data.export', 'data.import', 'data.delete', 'about.arc', 'about.sources', 'about.privacy']) setOpen(`more.${id}`, true);
}

/** Tiles open one at a time within their group; these are the groups. */
const TILE_GROUPS = [
  ['display', 'data', 'install', 'airplane', 'about'],
  ['house', 'prayerlist', 'treasury'],
  ['display.theme', 'display.habitHistory', 'display.atBed', 'display.compline', 'display.armor', 'display.winterArc'],
  ['data.keep', 'data.export', 'data.import', 'data.delete'],
  ['about.arc', 'about.sources', 'about.privacy'],
].map((g) => g.map((id) => `more.${id}`));

/** Open these tiles (e.g. "more.data", "more.data.export"), closing the others in their groups. */
function openTiles(ids: readonly string[]) {
  for (const id of ids) for (const other of TILE_GROUPS.find((g) => g.includes(id)) ?? [id]) setOpen(other, other === id);
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
async function renderAt(path: string, element: React.ReactNode, prepare?: (s: Store) => void, tiles: readonly string[] = []) {
  const db = new TagzeitenDB(`m6-${++n}`);
  const store = new Store({ db, journal: memoryJournal(), now: () => new Date(2026, 8, 25, 9) });
  await store.load();
  prepare?.(store);
  await store.flush();
  if (path.startsWith('/mehr')) openAllMore();
  openTiles(tiles);
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
    expect(tiles).toEqual(['Gewohnheiten', 'Gebet', 'Zeiten', 'Rückblick', 'Einstellungen', 'Versionen', 'Impressum']);
    expect(screen.queryByRole('switch', { name: 'Fasten' })).toBeNull();

    fireEvent.click(screen.getByRole('link', { name: /^Gewohnheiten/ }));
    expect((await screen.findByRole('heading', { level: 2 })).textContent).toBe('Gewohnheiten');
    expect(screen.getByRole('switch', { name: 'Fasten' })).toBeTruthy();

    fireEvent.click(screen.getByRole('link', { name: '‹ Mehr' }));
    await waitFor(() => expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Mehr'));
  });

  it('gathers Mein Haus, Gebetsübersicht and Gebetsschatz under "Gebet"; the old address opens Mein Haus', async () => {
    resetOpenState();
    const store = new Store({ db: new TagzeitenDB(`m6-prayer-${++n}`), journal: memoryJournal() });
    render(
      <ToastProvider>
        <StoreProvider store={store}>
          <RouterProvider
            router={createMemoryRouter([{ path: '/mehr/:bereich', element: <SettingsPage /> }], { initialEntries: ['/mehr/haus'] })}
          />
        </StoreProvider>
      </ToastProvider>,
    );
    await screen.findByRole('heading', { level: 2, name: /Gebet/ });
    const tiles = [...document.querySelectorAll('.tile-group > .tile-card .tile-card-title')].map((t) => t.textContent);
    expect(tiles.slice(0, 3)).toEqual(['Mein Haus', 'Gebetsübersicht', 'Gebetsschatz']);
    expect(screen.getByRole('button', { name: /^Gebetsübersicht/ }).getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole('button', { name: /^Mein Haus/ }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: /^Gebetsschatz/ }).getAttribute('aria-expanded')).toBe('false');
    // The opened tile shows its content beneath, under its own heading.
    expect(screen.getByRole('heading', { level: 3, name: 'Mein Haus' })).toBeTruthy();
  });

  it('gathers Darstellung, Deine Daten, the two guides and Über under "Einstellungen", folded and remembered', async () => {
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
    const tiles = [...document.querySelectorAll('.tile-card-title')].map((t) => t.textContent);
    expect(tiles).toEqual(['Darstellung', 'Deine Daten', 'App installieren', 'Flugmodus beim Beten', 'Über Henoch']);
    // No verse above the settings, only their explanations.
    expect(document.querySelector('.section-verse')).toBeNull();
    const display = screen.getByRole('button', { name: /^Darstellung/ });
    expect(display.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(display);
    await waitFor(() => expect(display.getAttribute('aria-expanded')).toBe('true'));
    expect(screen.getByRole('button', { name: 'Info zu Darstellung' })).toBeTruthy();
    // Inside: the settings as tiles with what is set now; no choice of wording for Lord's Prayer and Creed.
    const inner = [...document.querySelectorAll('.tile-panel .tile-card')].map((t) => t.textContent);
    expect(inner).toEqual([
      'FarbschemaSystem',
      'Gewohnheiten im RückblickAusblenden',
      'Am Bett am MorgenAnzeigen',
      'Nachtgebet am BettAnzeigen',
      'Geistliche WaffenrüstungAnzeigen',
      'Winter ArcAus',
    ]);
    view.unmount();
    render(page());
    expect((await screen.findByRole('button', { name: /^Darstellung/ })).getAttribute('aria-expanded')).toBe('true');
  });

  it('switches the Winter Arc on with start and duration, and off without deleting', async () => {
    const { store, db } = await renderAt('/mehr/einstellungen', <SettingsPage />, undefined, ['more.display.winterArc']);
    const toggle = await screen.findByRole('group', { name: 'Winter Arc' });
    expect(within(toggle).getByRole('button', { name: 'Aus' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(within(toggle).getByRole('button', { name: 'Ein' }));
    const dialog = screen.getByRole('dialog', { name: 'Neue Runde des Winter Arc' });
    expect(within(dialog).getByText('Ein Start an einem Montag passt am besten zum Wochen-Tracker.')).toBeTruthy();
    expect((within(dialog).getByLabelText('Startdatum') as HTMLInputElement).value).toBe('2026-09-25');
    expect((within(dialog).getByLabelText('Dauer in Kalendertagen') as HTMLInputElement).value).toBe('90');
    expect(dialog.textContent).toContain('Letzter Tag: Mittwoch, 23. Dezember 2026');
    fireEvent.change(within(dialog).getByLabelText('Startdatum'), { target: { value: '2026-10-05' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '40' }));
    expect(dialog.textContent).toContain('Letzter Tag: Freitag, 13. November 2026');
    fireEvent.change(within(dialog).getByLabelText('Dauer in Kalendertagen'), { target: { value: '400' } });
    expect((within(dialog).getByRole('button', { name: 'Winter Arc beginnen' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(within(dialog).getByLabelText('Dauer in Kalendertagen'), { target: { value: '90' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Winter Arc beginnen' }));
    await waitFor(() => expect(store.getProfile().winterArc.runs).toHaveLength(1));
    expect(store.getProfile().winterArc.runs[0]).toMatchObject({ startDate: '2026-10-05', durationDays: 90, status: 'active' });
    expect(screen.getByText(/Beginnt am Montag, 5\. Oktober 2026/)).toBeTruthy();

    // Weekdays per point and "Meine Zeiten" appear while it is on.
    const train = screen.getByRole('group', { name: 'Tage für Trainiert' });
    fireEvent.click(within(train).getByRole('button', { name: 'Samstag' }));
    expect(store.getProfile().winterArcSettings.weekdays.train).toEqual([1, 2, 3, 4, 5, 6]);
    fireEvent.change(screen.getByLabelText('Aufstehen'), { target: { value: '05:00' } });
    expect(store.getProfile().winterArcSettings.times.wake).toBe('05:00');
    expect(screen.getByRole('group', { name: 'Tage für 05:00 auf, kein Handy' })).toBeTruthy();

    // Off: asked first, the round stays as ended.
    fireEvent.click(within(screen.getByRole('group', { name: 'Winter Arc' })).getByRole('button', { name: 'Aus' }));
    fireEvent.click(screen.getByRole('button', { name: 'Winter Arc beenden' }));
    await waitFor(() => expect(store.getProfile().winterArc.runs[0]!.status).toBe('ended'));
    await store.flush();
    expect(await db.winterArcRuns.count()).toBe(1);

    // On again: a new round.
    fireEvent.click(within(screen.getByRole('group', { name: 'Winter Arc' })).getByRole('button', { name: 'Ein' }));
    fireEvent.click(screen.getByRole('button', { name: 'Winter Arc beginnen' }));
    await waitFor(() => expect(store.getProfile().winterArc.runs).toHaveLength(2));
    expect(store.getProfile().winterArc.runs.map((r) => r.status)).toEqual(['ended', 'active']);
  });

  it('lists the points of the Streithalle among the habits while the Winter Arc runs', async () => {
    await renderAt('/mehr/gewohnheiten', <SettingsPage />, (s) => s.startWinterArc('2026-09-21', 90), ['more.habits.streithalle']);
    const group = (await screen.findByRole('button', { name: /^Streithalle/ })).closest('section') as HTMLElement;
    expect(group.textContent).toContain('04:00 auf, kein Handy');
    expect(group.textContent).toContain('täglich · Streithalle');
    expect(group.textContent).toContain('Gedient (einmal im Monat)');
  });

  it('keeps every round of the Winter Arc readable in the Rückblick', async () => {
    const { ArchivePage } = await import('../archive/ArchivePage');
    await renderAt('/rueckblick?ansicht=streithalle', <ArchivePage />, (s) => {
      s.startWinterArc('2026-06-01', 40);
      const first = s.getProfile().winterArc.runs[0]!;
      s.setWinterArcReview(first.id, 2, 'win', 'Morgens zuerst das Wort');
      s.endWinterArc();
      s.startWinterArc('2026-09-21', 90);
    });
    expect(await screen.findByText('2 Runden des Winter Arc')).toBeTruthy();
    const old = screen.getByRole('button', { name: /^Runde vom Montag, 1\. Juni 2026 bis Freitag, 10\. Juli 2026/ });
    fireEvent.click(old);
    expect(screen.getByText('Morgens zuerst das Wort')).toBeTruthy();
    expect(screen.getByText(/alle Morgen neu/)).toBeTruthy();
  });

  it('lets Am Bett and the Nachtgebet be hidden under Darstellung', async () => {
    const { store } = await renderAt('/mehr/einstellungen', <SettingsPage />, undefined, ['more.display.atBed']);
    const bed = await screen.findByRole('group', { name: 'Am Bett am Morgen' });
    expect(within(bed).getByRole('button', { name: 'Anzeigen' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(within(bed).getByRole('button', { name: 'Ausblenden' }));
    // One tile at a time: opening the Nachtgebet closes Am Bett.
    fireEvent.click(screen.getByRole('button', { name: /^Nachtgebet am Bett/ }));
    expect(screen.queryByRole('group', { name: 'Am Bett am Morgen' })).toBeNull();
    const night = screen.getByRole('group', { name: 'Nachtgebet am Bett' });
    fireEvent.click(within(night).getByRole('button', { name: 'Ausblenden' }));
    await waitFor(() => expect(store.getProfile().showAtBed).toBe(false));
    expect(store.getProfile().showCompline).toBe(false);
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
  it('says whether the browser keeps the entries, and asks it again on request', async () => {
    let granted = false;
    let allow = false;
    const persist = vi.fn(() => Promise.resolve((granted = allow)));
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: { persisted: () => Promise.resolve(granted), persist },
    });
    try {
      await renderAt('/mehr/einstellungen', <SettingsPage />, undefined, ['more.data']);
      // Asked once on start; the browser declined.
      await waitFor(() => expect(persist).toHaveBeenCalledOnce());
      expect(await screen.findByText(/noch nicht zugesagt/)).toBeTruthy();
      allow = true;
      fireEvent.click(screen.getByText('Dauerhafte Speicherung erbitten'));
      expect(await screen.findByText(/Dein Browser behält die Einträge dauerhaft/)).toBeTruthy();
      expect(screen.queryByText('Dauerhafte Speicherung erbitten')).toBeNull();
    } finally {
      delete (navigator as { storage?: unknown }).storage;
    }
  });

  it('exports every entry as Markdown and as JSON', async () => {
    await renderAt('/mehr/einstellungen', <SettingsPage />, fill, ['more.data', 'more.data.export']);
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
    const { db } = await renderAt('/mehr/einstellungen', <SettingsPage />, fill, ['more.data', 'more.data.delete']);
    expect(await db.days.count()).toBe(2);
    fireEvent.click(await screen.findByText('Alle Einträge löschen …'));
    expect(screen.getByText(/lässt sich nicht rückgängig machen/)).toBeTruthy();
    fireEvent.click(screen.getByText('Abbrechen'));
    expect(await db.days.count()).toBe(2);

    // Device conveniences go too, also those not listed anywhere (rule 11).
    localStorage.setItem('tz:pen-seen', '1');
    localStorage.setItem('tz:arena-writing', 'ink');
    sessionStorage.setItem('tz:timer', '{}');
    localStorage.setItem('other-app', 'stays');
    fireEvent.click(screen.getByText('Alle Einträge löschen …'));
    fireEvent.click(screen.getByText('Endgültig löschen'));
    await screen.findByText('Start');
    expect(await db.days.count()).toBe(0);
    expect(await db.profile.count()).toBe(0);
    expect(Object.keys(localStorage).filter((k) => k.startsWith('tz:'))).toEqual([]);
    expect(sessionStorage.getItem('tz:timer')).toBeNull();
    expect(localStorage.getItem('other-app')).toBe('stays');
  });

  it('shows what an import will replace before replacing it', async () => {
    const source = new Store({ db: new TagzeitenDB(`m6-src-${++n}`), journal: memoryJournal() });
    await source.load();
    fill(source);
    const backup = JSON.stringify(await source.exportBackup());

    const { store } = await renderAt('/mehr/einstellungen', <SettingsPage />, undefined, ['more.data', 'more.data.import']);
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
    await renderAt('/mehr/einstellungen', <SettingsPage />, undefined, ['more.data', 'more.data.import']);
    const input = (await screen.findByText('Datei wählen …')).querySelector('input')!;
    await act(async () => {
      fireEvent.change(input, { target: { files: [new File(['{"a":1}'], 'x.json')] } });
    });
    expect((await screen.findByRole('alert')).textContent).toBe('Das ist keine Sicherung aus Henoch.');
  });
});

describe('Mehr: Gewohnheiten', () => {
  it('sets how often in the week a weekly habit is meant, when adding and afterwards', async () => {
    const { store } = await renderAt('/mehr/gewohnheiten', <SettingsPage />);
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: 'Sport' } });
    expect(screen.queryByLabelText('Wie oft in der Woche')).toBeNull();
    fireEvent.change(screen.getByLabelText('Rhythmus'), { target: { value: 'weekly' } });
    fireEvent.change(screen.getByLabelText('Wie oft in der Woche'), { target: { value: '3' } });
    fireEvent.click(screen.getByText('Gewohnheit anlegen'));
    const sport = () => store.getProfile().habits.find((h) => h.name === 'Sport')!;
    expect(sport()).toMatchObject({ rhythm: 'weekly', timesPerWeek: 3 });
    const select = await screen.findByLabelText('Wie oft in der Woche: Sport');
    expect((select as HTMLSelectElement).value).toBe('3');
    fireEvent.change(select, { target: { value: '1' } });
    await waitFor(() => expect(sport().timesPerWeek).toBeUndefined());
  });

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
  it('keeps the three creeds in the appendix, one card open at a time', async () => {
    await renderAt('/katechismus/bekenntnisse', <CatechismPage />);
    await screen.findByRole('heading', { level: 2, name: 'Die drei Bekenntnisse' });
    const card = (name: RegExp) => screen.getByRole('button', { name });
    fireEvent.click(card(/^Das Nizänische Glaubensbekenntnis/));
    expect(document.body.textContent).toContain('wahrer Gott vom wahren Gott');
    expect(document.body.textContent).toContain('filioque');
    fireEvent.click(card(/^Das Apostolische Glaubensbekenntnis/));
    expect(card(/^Das Nizänische/).getAttribute('aria-expanded')).toBe('false');
    expect(document.body.textContent).toContain('Ich glaube an Gott, den Vater, den Allmächtigen,');
    fireEvent.click(card(/^Das Athanasianische Glaubensbekenntnis/));
    expect(document.body.textContent).toContain('Wer da will selig werden, der muß vor allen Dingen den rechten christlichen Glauben haben.');
    expect(document.body.textContent).toContain('der kann nicht selig werden.');
    expect(document.body.textContent).toContain('Concordienbuch');
  });

  it('keeps the Augsburg Confession in the appendix, article by article', async () => {
    await renderAt('/katechismus/augsburgische-konfession', <CatechismPage />);
    await screen.findByRole('heading', { level: 2, name: 'Die Augsburgische Konfession' });
    const card = (name: RegExp) => screen.getByRole('button', { name });
    fireEvent.click(card(/^Der IV\. Artikel/));
    expect(document.body.textContent).toContain('aus Gnaden um Christus willen durch den Glauben');
    fireEvent.click(card(/^Der VII\. Artikel/));
    expect(card(/^Der IV\. Artikel/).getAttribute('aria-expanded')).toBe('false');
    expect(document.body.textContent).toContain('Eine heilige christliche Kirche sein und bleiben');
    expect(screen.getAllByRole('button', { name: /^Der [IVX]+\. Artikel/ })).toHaveLength(28);
    fireEvent.click(card(/^Der XXVIII\. Artikel/));
    expect(document.body.textContent).toContain('Mein Reich ist nicht von dieser Welt');
    fireEvent.click(card(/^Beschluß/));
    expect(document.body.textContent).toContain('Die Stadt Reutlingen.');
  });

  it('loads the Apology when it is opened, article by article', async () => {
    await renderAt('/katechismus/apologie', <CatechismPage />);
    await screen.findByRole('heading', { level: 2, name: 'Die Apologie der Augsburgischen Konfession' });
    fireEvent.click(await screen.findByRole('button', { name: /^Artikel IV\. \(II\.\)/ }));
    expect(document.body.textContent).toContain('Wie man vor Gott fromm und gerecht wird');
    fireEvent.click(screen.getByRole('button', { name: /^Artikel XXVIII\. \(XIV\.\)/ }));
    expect(document.body.textContent).toContain('von allen Artikeln weiter Bericht zu thun.');
    expect(screen.getAllByRole('button', { name: /^(Art\.|Artikel|\(Artikel)/ }).length).toBeGreaterThanOrEqual(25);
  });

  it('keeps the treatise on the power of the pope next to the Smalcald Articles', async () => {
    await renderAt('/katechismus/traktat', <CatechismPage />);
    await screen.findByRole('heading', { level: 2, name: 'Von der Gewalt und Oberkeit des Pabsts' });
    fireEvent.click(screen.getByRole('button', { name: /^Von der Bischöfe Gewalt und Jurisdiction/ }));
    expect(document.body.textContent).toContain('daß sie auch für diesen Raub Gott müssen Rechenschaft geben.');
  });

  it('keeps the Smalcald Articles in the appendix, part by part', async () => {
    await renderAt('/katechismus/schmalkaldische-artikel', <CatechismPage />);
    await screen.findByRole('heading', { level: 2, name: 'Die Schmalkaldischen Artikel' });
    expect(document.body.textContent).toContain('Durch D. Martin Luther geschrieben Anno 1537.');
    fireEvent.click(screen.getByRole('button', { name: /^Das andere Theil\./ }));
    expect(document.body.textContent).toContain('Von diesem Artikel kann man nichts weichen oder nachgeben, es falle Himmel und Erde');
    fireEvent.click(screen.getByRole('button', { name: /^VIII\.\s*Von der Beichte/ }));
    expect(document.body.textContent).toContain('so soll man die Beichte oder Absolution bei Leibe nicht lassen abkommen in der Kirche');
    expect(screen.getAllByRole('button', { name: /^[IVX]+\.\s*Vo/ }).length).toBeGreaterThanOrEqual(14);
  });

  it('gathers the confessions under the Book of Concord, with what it is and what is in it', async () => {
    await renderAt('/katechismus', <CatechismPage />);
    fireEvent.click(await screen.findByRole('link', { name: /^Das Konkordienbuch/ }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Das Konkordienbuch' })).toBeTruthy();
    expect(document.body.textContent).toContain('25. Juni 1580 in Dresden');
    expect(document.body.textContent).toContain('Die Konkordienformel');
    fireEvent.click(screen.getByRole('link', { name: /^Die Schmalkaldischen Artikel/ }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Die Schmalkaldischen Artikel' })).toBeTruthy();
    fireEvent.click(screen.getByRole('link', { name: '‹ Konkordienbuch' }));
    await screen.findByRole('heading', { level: 2, name: 'Das Konkordienbuch' });
    fireEvent.click(screen.getByRole('link', { name: /^Der Große Katechismus/ }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Der Große Katechismus' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '‹ Konkordienbuch' })).toBeTruthy();
  });

  it('keeps the Large Catechism in the appendix, word for word after 1580', async () => {
    await renderAt('/katechismus/grosser-katechismus', <CatechismPage />);
    await screen.findByRole('heading', { level: 2, name: 'Der Große Katechismus' });
    fireEvent.click(screen.getByRole('button', { name: /^Das I\. Gebot/ }));
    expect(document.body.textContent).toContain('Worauf du nun (sage ich) dein Herz hängest und verlässest, das ist eigentlich dein Gott.');
    fireEvent.click(screen.getByRole('button', { name: /^Von dem Sacrament des Altars/ }));
    expect(document.body.textContent).toContain('beten und wider den Teufel fechten.');
    expect(screen.getAllByRole('button', { name: /Bitte\./ })).toHaveLength(7);
  });

  it('shows the answer in the house father mode only after a tap', async () => {
    await renderAt('/katechismus', <CatechismPage />);
    fireEvent.click(await screen.findByText('Am Tisch abfragen'));
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('.hf-answer')).toBeNull();
    fireEvent.click(screen.getByText('Antwort zeigen'));
    expect(dialog.querySelector('.hf-answer')!.textContent!.length).toBeGreaterThan(10);
    fireEvent.click(screen.getByText('Hausvater-Modus beenden'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('has the church year after Dieffenbach in the appendix, to be read straight through', async () => {
    await renderAt('/katechismus', <CatechismPage />);
    fireEvent.click(await screen.findByRole('link', { name: /Das Kirchenjahr/ }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Das Kirchenjahr' })).toBeTruthy();
    const text = document.querySelector('.dieffenbach-book')!.textContent!;
    expect(text).toContain('Georg Christian Dieffenbach');
    // Introduction, the three circles, and every day in the order of the book.
    for (const t of ['Einleitung', 'Der heilige Weihnachtskreis', 'Der heilige Osterkreis', 'Der heilige Pfingstkreis']) {
      expect(screen.getByRole('button', { name: new RegExp(`^${t}`) })).toBeTruthy();
    }
    for (const t of ['Des Herrn Einzug in Jerusalem', 'Christi Höllenfahrt', 'Wache und bete!', '27. Woche nach Trinitatis']) {
      expect(text).toContain(t);
    }
    const labels = [...document.querySelectorAll('#book-lent ~ .book-days dt')].map((d) => d.textContent);
    expect(labels[0]).toBe('1. Aschermittwoch');
    expect(labels.at(-1)).toBe('10. Ostersonnabend');
    expect([...document.querySelectorAll('.book-days dd')].every((d) => d.textContent!.trim().length > 20)).toBe(true);
  });

  it('marks pieces as learned by heart on the page of the chief part', async () => {
    const { store } = await renderAt('/katechismus/confession', <CatechismPage />);
    expect((await screen.findByRole('heading', { level: 2 })).textContent).toContain('Die Beichte');
    fireEvent.click(screen.getAllByText('auswendig gelernt')[0]!);
    expect(Object.keys(store.getProfile().catechism.memorized)).toHaveLength(1);
    expect(document.querySelector('progress')).toBeNull();
    fireEvent.click(screen.getByRole('link', { name: '‹ Lehre' }));
    await screen.findByRole('heading', { name: 'Hauptstücke' });
    expect(document.querySelector('.overview-total')!.textContent).toContain('1 von 35 Stücken auswendig');
  });

  it('shows the chief parts as tiles, two side by side, each opening its part', async () => {
    await renderAt('/katechismus', <CatechismPage />);
    await screen.findByRole('heading', { name: 'Hauptstücke' });
    const tiles = [...document.querySelectorAll('#cat-parts ~ .overview-list .overview-row, .cat-overview .overview-row')];
    expect(document.querySelectorAll('.overview-row')).toHaveLength(11); // the Book of Concord, 6 chief parts, 4 appendices
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

  it('lets the chief part of the week be chosen on its own page', async () => {
    const store = await renderAt('/katechismus/lordsPrayer', <CatechismPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Für diese Woche nehmen' }));
    await waitFor(() => expect(document.querySelector('.cat-part-title')!.textContent).toContain('diese Woche'));
    expect(screen.queryByRole('button', { name: 'Für diese Woche nehmen' })).toBeNull();
    expect(store).toBeTruthy();
  });

  it('parts the page into Lernen and Lesen', async () => {
    await renderAt('/katechismus', <CatechismPage />);
    expect(await screen.findByRole('heading', { level: 2, name: 'Lehre' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Lernen' })).toBeTruthy();
    const read = screen.getByRole('region', { name: 'Lesen' });
    expect(read.querySelector('.overview-row.wide')!.textContent).toContain('Das Konkordienbuch');
  });
});

describe('Rückblick', () => {
  it('lists days and verses and searches everything', async () => {
    await renderAt('/mehr/rueckblick', <SettingsPage />, fill);
    expect(await screen.findByText('2 Tage mit Einträgen')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: /Rückblick/ })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Rückblick durchsuchen'), { target: { value: 'anna' } });
    expect(screen.getByText('1 Treffer')).toBeTruthy();
    fireEvent.click(screen.getByText('Versesammlung'));
    expect(screen.getByText('Sei stille dem HERRN')).toBeTruthy();
  });

  it('opens a day in the Rückblick to a list of everything written that day', async () => {
    await renderAt('/mehr/rueckblick', <SettingsPage />, fill);
    const day = await screen.findByRole('button', { name: /24\. September/ });
    expect(day.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(day);
    expect(day.getAttribute('aria-expanded')).toBe('true');
    const summary = document.getElementById(day.getAttribute('aria-controls')!)!;
    expect(summary.textContent).toContain('Gebetet: Stille Zeit');
    const sections = [...summary.querySelectorAll('h5')].map((h) => h.textContent);
    expect(sections).toEqual(['Stille Zeit', 'Die drei Dinge', 'Abend']);
    const rows = [...summary.querySelectorAll('dt')].map((dt) => `${dt.textContent}: ${dt.nextElementSibling!.textContent}`);
    expect(rows).toEqual([
      'Stelle: Psalm 37,7',
      'Vers, den ich mitnehme: Sei stille dem HERRN',
      'Haus: Mit Anna spazieren',
      'Dank: das Gespräch mit Paul',
    ]);
    fireEvent.click(day);
    expect(summary.hidden).toBe(true);
  });

  it('keeps wife and children in "Mein Haus", and an answered concern in the Rückblick', async () => {
    const { store } = await renderAt('/mehr/haus', <SettingsPage />);
    await screen.findByRole('heading', { level: 2, name: /Gebet/ });
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Anna' } });
    // One tile at a time: the children replace the wife.
    fireEvent.click(screen.getByRole('button', { name: /^Kinder/ }));
    expect(screen.queryByLabelText('Name')).toBeNull();
    expect(screen.getAllByLabelText(/^Kind \d$/)).toHaveLength(4);
    fireEvent.change(screen.getByLabelText('Kind 1'), { target: { value: 'Marie' } });
    // Son or daughter is required: until chosen, a note asks for it.
    expect(await screen.findByText(/Bitte wählen: Sohn oder Tochter/)).toBeTruthy();
    fireEvent.click(within(screen.getByRole('group', { name: 'Marie: Sohn oder Tochter' })).getByRole('button', { name: 'Tochter' }));
    await waitFor(() => expect(screen.queryByText(/Bitte wählen: Sohn oder Tochter/)).toBeNull());
    fireEvent.change(screen.getByLabelText('Anliegen für Marie'), { target: { value: 'Freundin in der neuen Klasse' } });
    const answered = within(screen.getByLabelText('Anliegen für Marie').closest('.house-concern')! as HTMLElement).getByRole('button', {
      name: 'Erhört',
    });
    fireEvent.click(answered);
    await waitFor(() => expect(store.getProfile().answered).toHaveLength(1));
    expect(store.getProfile().answered[0]).toMatchObject({ date: '2026-09-25', person: 'Marie', role: 'daughter', concern: 'Freundin in der neuen Klasse' });
    expect((screen.getByLabelText('Anliegen für Marie') as HTMLInputElement).value).toBe('');
    expect(store.getProfile().house.wife.name).toBe('Anna');
    fireEvent.click(screen.getByRole('button', { name: 'Weiteres Kind hinzufügen' }));
    expect(await screen.findByLabelText('Kind 5')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Kind 5 entfernen' }));
    await waitFor(() => expect(screen.queryByLabelText('Kind 5')).toBeNull());

    cleanup();
    await renderAt('/mehr/rueckblick?ansicht=erhoerungen', <SettingsPage />, (s) =>
      s.updateProfile((p) => ({ ...p, answered: store.getProfile().answered }), { immediate: true }),
    );
    expect(await screen.findByText('Freundin in der neuen Klasse')).toBeTruthy();
    expect(screen.getByText(/Marie \(Tochter\)/)).toBeTruthy();
  });

  it('shows the habits of the last weeks in the Rückblick only when switched on, counted, not rated', async () => {
    const { store } = await renderAt('/mehr/rueckblick', <SettingsPage />, (s) =>
      s.updateDay('2026-09-24', (d) => ({ ...d, habits: { ...d.habits, tablePrayer: true } })),
    );
    await screen.findAllByText(/mit Einträgen/);
    expect(screen.queryByRole('heading', { name: 'Gewohnheiten' })).toBeNull();
    cleanup();

    await renderAt('/mehr/einstellungen', <SettingsPage />, undefined, ['more.display.habitHistory']);
    const group = await screen.findByRole('group', { name: 'Gewohnheiten im Rückblick' });
    expect(within(group).getByRole('button', { name: 'Ausblenden' }).getAttribute('aria-pressed')).toBe('true');
    cleanup();

    await renderAt('/mehr/rueckblick', <SettingsPage />, (s) => {
      // Table prayer with the family: shown once the family is entered under "Mein Haus".
      s.updateProfile(
        (p) => ({ ...p, showHabitHistory: true, house: { ...p.house, wife: { name: 'Anna', concern: '' } } }),
        { immediate: true },
      );
      s.updateDay('2026-09-17', (d) => ({ ...d, habits: { ...d.habits, tablePrayer: true } }));
    });
    await screen.findByRole('heading', { name: 'Gewohnheiten' });
    const row = screen.getByRole('list', { name: 'Tischgebet mit der Familie, die letzten 8 Wochen' });
    expect(within(row).getAllByRole('listitem')).toHaveLength(8);
    expect(row.textContent).toContain('Woche ab Mo 14.9.: an 1 von 7 Tagen');
    // The running week (from Monday 21) is not part of the course yet.
    expect(row.textContent).not.toContain('21.9.');
    // Documentation only: no percentages, no trend (rule 4).
    expect(document.querySelector('.hh-list')!.textContent).not.toMatch(/%|besser|schlechter|Serie/);
    void store;
  });

  it('keeps the two old prayers in the Gebetsschatz, with title and author', async () => {
    await renderAt('/mehr/gebetsschatz', <SettingsPage />);
    expect(await screen.findByRole('button', { name: /^Gebet für meine Frau/ })).toBeTruthy();
    expect(screen.getByText(/ich danke dir für meine liebe Frau N\./)).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Gebet eines Ehemannes/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Gebet der Eltern für ihre Kinder/ })).toBeTruthy();
    expect(screen.getByText('Johann Habermann († 1590)')).toBeTruthy();
    expect(screen.getByText('Johann Arndt († 1621)')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Gebet eines Ehemannes/ }));
    expect(screen.getByText(/Wehre dem Eheteufel/)).toBeTruthy();
    // One prayer open at a time.
    expect(screen.queryByText(/ich danke dir für meine liebe Frau N\./)).toBeNull();
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

    // Tapped again, a day leaves its group and keeps the times for all days.
    const first = document.querySelectorAll('.schedule-group')[0]!;
    fireEvent.click(within(first as HTMLElement).getByRole('button', { name: 'Mittwoch' }));
    await waitFor(() => expect(document.querySelector('.schedule-group legend')!.textContent).toBe('Mo, Di, Do, Fr'));
    expect(document.querySelector('.schedule-free')!.textContent).toContain('Mi:');

    // Back to the same times every day; the groups wait for a return.
    fireEvent.click(screen.getByRole('button', { name: 'Alle Tage gleich' }));
    await waitFor(() => expect(scheduleFor(store.getProfile(), '2026-09-26').rise).toBe('04:00'));
    expect(store.getProfile().scheduleDays!.groups).toHaveLength(3);
  });

  it('writes concerns as tags and sets them on days, several a day', async () => {
    const { store } = await renderAt('/mehr/gebet', <SettingsPage />, undefined, ['more.prayerlist']);
    await screen.findByRole('heading', { level: 2, name: /Gebet/ });
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

  it('lists the versions, newest first, and names the one in use', async () => {
    await renderAt('/mehr/versionen', <SettingsPage />);
    await screen.findByRole('heading', { level: 2, name: /Versionen/ });
    const versions = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(versions[0]).toMatch(/^Version 0\.25\.1/);
    expect(versions.at(-1)).toMatch(/^Version 0\.1\.0/);
    expect(document.body.textContent).toContain(`Du nutzt Version ${__APP_VERSION__}.`);
    // A list that folds: the newest is open, opening another closes it.
    const toggle = (v: RegExp) => screen.getByRole('button', { name: v });
    expect(toggle(/^Version 0\.25\.1/).getAttribute('aria-expanded')).toBe('true');
    expect(toggle(/^Version 0\.1\.0/).getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggle(/^Version 0\.1\.0/));
    expect(toggle(/^Version 0\.1\.0/).getAttribute('aria-expanded')).toBe('true');
    expect(toggle(/^Version 0\.25\.1/).getAttribute('aria-expanded')).toBe('false');
  });

  it('shows the Impressum with its placeholders marked and a privacy notice', async () => {
    await renderAt('/mehr/impressum', <SettingsPage />);
    await screen.findByRole('heading', { level: 2, name: /Impressum/ });
    expect(screen.getByRole('heading', { level: 3, name: 'Angaben gemäß § 5 DDG' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Datenschutz' })).toBeTruthy();
    expect([...document.querySelectorAll('mark.placeholder')].map((m) => m.textContent)).toEqual(expect.arrayContaining(['[Straße und Hausnummer]', '[E-Mail-Adresse]']));
    expect(document.body.textContent).toContain('Andreas Dykau');
    expect(document.body.textContent).toContain('bleibt auf deinem Gerät');
  });

  it('explains how to install the app on Android and on the iPhone', async () => {
    await renderAt('/mehr/einstellungen', <SettingsPage />, undefined, ['more.install']);
    await screen.findByRole('heading', { level: 3, name: /App installieren/ });
    for (const t of ['Android mit Chrome', 'Android mit Samsung Internet', 'iPhone mit Safari']) {
      expect(screen.getByRole('heading', { level: 4, name: t })).toBeTruthy();
    }
    const text = document.body.textContent!;
    expect(text).toContain('„App installieren“');
    expect(text).toContain('https://cft5v9c8yf-stack.github.io/tagzeiten/');
  });

  it('explains, under Einstellungen, how the iPhone and Android phones switch airplane mode while the app is open', async () => {
    await renderAt('/mehr/einstellungen', <SettingsPage />, undefined, ['more.airplane']);
    await screen.findByRole('heading', { level: 3, name: /Flugmodus beim Beten/ });
    const text = document.body.textContent!;
    expect(text).toContain('„Wird geöffnet“');
    expect(text).toContain('„Wird geschlossen“');
    expect(text).toContain('Flugmodus festlegen');
    expect(screen.getByRole('heading', { level: 4, name: 'iPhone: Wenn Henoch nicht in der Liste steht' })).toBeTruthy();
    // Android: Samsung routine on opening the app, and the nearest thing elsewhere.
    expect(screen.getByRole('heading', { level: 4, name: 'Android (Samsung): Flugmodus, solange Henoch offen ist' })).toBeTruthy();
    expect(text).toContain('„Modi und Routinen“');
    expect(text).toContain('„App geöffnet“');
    expect(screen.getByRole('heading', { level: 4, name: 'Andere Android-Geräte (z. B. Pixel)' })).toBeTruthy();
  });
});
