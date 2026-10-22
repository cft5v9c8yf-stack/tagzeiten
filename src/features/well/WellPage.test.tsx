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
import { resetOpenState, setOpen } from '../../ui/collapseState';
import { ArenaPage } from '../arena/ArenaPage';
import { SettingsPage } from '../settings/SettingsPage';

beforeEach(() => {
  localStorage.clear();
  resetOpenState();
});
afterEach(cleanup);

let n = 0;
const NAME = 'Treffen am Abendbrunnen';

async function mount(path: string, setup?: (s: Store) => void, db = `well-${++n}`, now = new Date(2026, 9, 22, 20)) {
  const store = new Store({ db: new TagzeitenDB(db), journal: memoryJournal(), now: () => now });
  await store.load();
  setup?.(store);
  const router = createMemoryRouter(
    [
      { path: '/arena', element: <ArenaPage /> },
      { path: '/arena/:eintrag', element: <ArenaPage /> },
      { path: '/mehr/:bereich', element: <SettingsPage /> },
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
  return { store, router };
}

const switchOn = (s: Store, name = '') =>
  s.updateProfile((p) => ({ ...p, well: { ...p.well, on: true }, house: { ...p.house, wife: { ...p.house.wife, name } } }), { immediate: true });

describe('Treffen am Abendbrunnen', () => {
  it('is invisible while off: no tile, no page, no word of it', async () => {
    await mount('/arena');
    expect(screen.queryByText(NAME)).toBeNull();
    cleanup();
    await mount('/arena?bereich=abendbrunnen');
    // The address leads to the Arena's entrance.
    expect(screen.queryByText(NAME)).toBeNull();
    expect(screen.queryByText('Rahmen')).toBeNull();
    expect(document.querySelector('.arena-place-tile')).not.toBeNull();
  });

  it('shows its tile once switched on, between the Gebetskammer and the Eisenschmiede (rule 18)', async () => {
    await mount('/arena', (s) => switchOn(s));
    const titles = [...document.querySelectorAll('.arena-place-title')].map((x) => x.textContent);
    expect(titles).toEqual(['Gebetskammer', NAME, 'Eisenschmiede', 'Wüstenwanderung']);
    expect(screen.getByText('Der wöchentliche Ehe-Check-in')).toBeTruthy();
  });

  it('is switched on in the settings, with the wife\'s name from "Mein Haus"', async () => {
    setOpen('more.display.well', true);
    const { store } = await mount('/mehr/darstellung');
    expect(store.getProfile().well.on).toBe(false);
    const group = await screen.findByRole('group', { name: 'Ich bin verheiratet – Abendbrunnen anzeigen' });
    fireEvent.click(within(group).getByRole('button', { name: 'Anzeigen' }));
    expect(store.getProfile().well.on).toBe(true);
    fireEvent.change(screen.getByLabelText('Name meiner Frau (freiwillig)'), { target: { value: 'Anna' } });
    expect(store.getProfile().house.wife.name).toBe('Anna');
  });

  it('shows the two verses in Luther 1912, the introduction and the guide', async () => {
    await mount('/arena?bereich=abendbrunnen', (s) => switchOn(s));
    const verses = [...document.querySelectorAll('.section-verse blockquote')].map((x) => x.textContent);
    expect(verses[0]).toBe(
      'Da ließ er die Kamele sich lagern draußen vor der Stadt bei einem Wasserbrunnen, des Abends um die Zeit, wo die Weiber pflegten herauszugehen und Wasser zu schöpfen.',
    );
    expect(verses[1]).toBe('Einer mag überwältigt werden, aber zwei mögen widerstehen; und eine dreifältige Schnur reißt nicht leicht entzwei.');
    expect(document.querySelector('.section-verse figcaption')!.textContent).toBe('1. Mose 24,11');
    expect(document.querySelector('.arena-note')!.textContent).toContain('Rebekka und der Knecht Abrahams (1. Mo 24)');
    expect(screen.getByText(/Einmal pro Woche 20 bis 30 Minuten/)).toBeTruthy();
    expect(screen.getByText(/Zuhören vor Lösen/)).toBeTruthy();
    // Bible references are text, not links (rule 13).
    expect(document.querySelector('.arena-well a[href*="bibel"]')).toBeNull();
  });

  it('walks the six steps and puts the name only where the question is one\'s own', async () => {
    await mount('/arena?bereich=abendbrunnen', (s) => switchOn(s, 'Anna'));
    expect(screen.getByText('Was habe ich diese Woche an Anna besonders geschätzt?')).toBeTruthy();
    expect(screen.getByText('1. Thess 5,18 · Spr 31,28')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Weiter zu: Befinden' }));
    expect(screen.getByText('Wie geht es dir wirklich: körperlich, seelisch, geistlich?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Beziehung' }));
    expect(screen.getByText('Wo habe ich Anna verletzt oder übersehen? (Zuerst selbst benennen.)')).toBeTruthy();
    expect(screen.getByText('Gibt es etwas, das du bisher nicht gesagt hast?')).toBeTruthy();
    // The self-examination ends in a word of forgiveness (rule 1); nothing confessed is noted (rule 9).
    expect(screen.getByRole('complementary', { name: 'Zuspruch' }).textContent).toContain('so ist er treu und gerecht');
    expect(screen.getByText(/bleibt im Gespräch und wird hier nicht notiert/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Ausblick' }));
    expect(screen.getByText('Wie kann ich Anna in der kommenden Woche dienen?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Gebet' }));
    expect(screen.getByText('1. Petr 3,7')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Weiter zu/ })).toBeNull();
  });

  it('uses "dir" without a name', async () => {
    await mount('/arena?bereich=abendbrunnen', (s) => switchOn(s));
    expect(screen.getByText('Was habe ich diese Woche an dir besonders geschätzt?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Beziehung' }));
    expect(screen.getByText('Wo habe ich dich verletzt oder übersehen? (Zuerst selbst benennen.)')).toBeTruthy();
  });

  it('keeps the notes of the week with their date across a reload', async () => {
    const db = `well-keep-${++n}`;
    const first = await mount('/arena?bereich=abendbrunnen', (s) => switchOn(s), db);
    fireEvent.click(screen.getByRole('button', { name: 'Treffen dieser Woche beginnen' }));
    fireEvent.change(await screen.findByLabelText('Mein Vorsatz für diese Woche'), { target: { value: 'Jeden Abend zehn Minuten zuhören' } });
    fireEvent.change(screen.getByLabelText('Gebetsanliegen von ihr'), { target: { value: 'Kraft für die Woche' } });
    fireEvent.change(screen.getByLabelText('Nächstes Treffen am Abendbrunnen'), { target: { value: '2026-10-29' } });
    await first.store.flush();
    expect(first.store.getProfile().well.meetings[0]).toMatchObject({ date: '2026-10-22', resolution: 'Jeden Abend zehn Minuten zuhören', next: '2026-10-29' });
    cleanup();
    await mount('/arena?bereich=abendbrunnen', undefined, db);
    expect((screen.getByLabelText('Mein Vorsatz für diese Woche') as HTMLTextAreaElement).value).toBe('Jeden Abend zehn Minuten zuhören');
    expect((screen.getByLabelText('Gebetsanliegen von ihr') as HTMLTextAreaElement).value).toBe('Kraft für die Woche');
  });

  it('asks about last week\'s resolution, lets it be ticked, and lists past meetings', async () => {
    const { store } = await mount('/arena?bereich=abendbrunnen', (s) =>
      s.updateProfile(
        (p) => ({
          ...p,
          well: {
            on: true,
            meetings: [
              { id: 'a', date: '2026-10-15', resolution: 'Handy weglegen', resolutionDone: false, herWish: 'Mehr Zeit zu zweit', herConcern: '', myConcern: '' },
            ],
          },
        }),
        { immediate: true },
      ),
    );
    expect(document.querySelector('.well-last-text')!.textContent).toBe('Handy weglegen');
    // Past meetings are read in a plain list.
    expect(screen.getByText('Vergangene Treffen')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Umgesetzt?'));
    await waitFor(() => expect(store.getProfile().well.meetings[0]!.resolutionDone).toBe(true));
    fireEvent.click(screen.getByRole('button', { name: 'Treffen dieser Woche beginnen' }));
    expect(store.getProfile().well.meetings).toHaveLength(2);
  });

  it('is in the Markdown export and gone with the deletion', async () => {
    const { store } = await mount('/arena?bereich=abendbrunnen', (s) =>
      s.updateProfile((p) => ({ ...p, well: { on: true, meetings: [{ id: 'a', date: '2026-10-15', resolution: 'Zuhören', resolutionDone: true, herWish: '', herConcern: '', myConcern: '' }] } }), {
        immediate: true,
      }),
    );
    expect(await store.exportMarkdown()).toContain('**Mein Vorsatz:** Zuhören (umgesetzt)');
    await store.deleteAll();
    expect(store.getProfile().well).toEqual({ on: false, meetings: [] });
  });
});
