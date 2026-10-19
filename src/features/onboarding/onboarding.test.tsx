// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { resetOpenState } from '../../ui/collapseState';
import { clearDevicePreferences } from '../../app/files';
import { SettingsPage } from '../settings/SettingsPage';
import { FirstStartGate } from './FirstStartGate';
import { OnboardingPage } from './OnboardingPage';
import { ONBOARDING_KEY, needsOnboarding, ONBOARDING_PATH } from './onboardingState';

beforeEach(() => {
  localStorage.clear();
  resetOpenState();
  Element.prototype.scrollIntoView = () => {};
  window.scrollTo = () => {};
});
afterEach(cleanup);

function Where() {
  const { pathname, search } = useLocation();
  return <p data-testid="where">{pathname + search}</p>;
}

let n = 0;
async function start(path: string, prepare?: (s: Store) => void, dbName = `ob-${++n}`) {
  const db = new TagzeitenDB(dbName);
  const store = new Store({ db, journal: memoryJournal(), now: () => new Date(2026, 9, 19, 9) });
  await store.load();
  prepare?.(store);
  await store.flush();
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <FirstStartGate>
            <Where />
            <p>Heute-Seite</p>
          </FirstStartGate>
        ),
      },
      { path: ONBOARDING_PATH, element: <OnboardingPage /> },
      { path: '/arena', element: <Where /> },
      { path: '/mehr', element: <SettingsPage /> },
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
  await waitFor(() => expect(document.querySelector('.loading')).toBeNull());
  return { store, router };
}

const heading = () => screen.getByRole('heading', { level: 2 }).textContent;
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const next = () => click('Weiter');

/** To the page "Mein Haus" on the way "Alltag". */
function toHouse() {
  next();
  fireEvent.click(screen.getByRole('button', { name: /^Alltag/ }));
  next();
}

describe('Einrichtung: wann sie erscheint', () => {
  it('opens on the first start, on an empty device', async () => {
    const { router } = await start('/');
    await waitFor(() => expect(router.state.location.pathname).toBe(ONBOARDING_PATH));
    expect((await screen.findByRole('heading', { level: 2 })).textContent).toBe('So beginnt der Tag');
  });

  it('never opens by itself for an existing user', async () => {
    // Anything entered counts: a day, a changed setting, an Arena entry.
    const days = await start('/', (s) => s.updateDay('2026-10-01', (d) => ({ ...d, morning: { ...d.morning, done: true } })));
    expect(await screen.findByText('Heute-Seite')).toBeTruthy();
    expect(days.router.state.location.pathname).toBe('/');
    cleanup();
    const profile = await start('/', (s) => s.updateProfile((p) => ({ ...p, armor: false })));
    expect(await screen.findByText('Heute-Seite')).toBeTruthy();
    expect(needsOnboarding(profile.store)).toBe(false);
  });

  it('does not open again once it was finished or put aside', async () => {
    localStorage.setItem(ONBOARDING_KEY, 'skipped');
    const { router } = await start('/');
    expect(await screen.findByText('Heute-Seite')).toBeTruthy();
    expect(router.state.location.pathname).toBe('/');
  });

  it('is part of the data that "Alles löschen" removes from the device', async () => {
    localStorage.setItem(ONBOARDING_KEY, 'done');
    clearDevicePreferences();
    expect(localStorage.getItem(ONBOARDING_KEY)).toBeNull();
  });
});

describe('Einrichtung: Wiederaufnahme', () => {
  it('comes back to the page where it was left, also with settings already changed', async () => {
    const first = await start(ONBOARDING_PATH, undefined, 'ob-resume');
    toHouse();
    fireEvent.click(screen.getByRole('switch', { name: /Ich habe eine Frau/ }));
    fireEvent.change(screen.getByLabelText('Name deiner Frau'), { target: { value: 'Anna' } });
    next();
    expect(heading()).toBe('Deine Zeiten');
    await first.store.flush();
    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('started');
    cleanup();
    // Reload: the profile holds changes now, and yet the setup opens again.
    const { router, store } = await start('/', undefined, 'ob-resume');
    expect(store.getProfile().updatedAt).toBeGreaterThan(0);
    await waitFor(() => expect(router.state.location.pathname).toBe(ONBOARDING_PATH));
    expect((await screen.findByRole('heading', { level: 2 })).textContent).toBe('Deine Zeiten');
    click('Zurück');
    expect((screen.getByLabelText('Name deiner Frau') as HTMLInputElement).value).toBe('Anna');
  });
});

describe('Einrichtung: Überspringen', () => {
  it('"Später ansehen" puts it aside, remembers that, and leads to Heute', async () => {
    const { router, store } = await start('/');
    await screen.findByText('So beginnt der Tag');
    click('Später ansehen');
    expect(await screen.findByText('Heute-Seite')).toBeTruthy();
    expect(router.state.location.pathname).toBe('/');
    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('skipped');
    // Nothing was written into the profile.
    expect(store.getProfile().updatedAt).toBe(0);
    // Back on Heute later: it does not come again.
    await act(() => router.navigate('/'));
    expect(router.state.location.pathname).toBe('/');
  });

  it('skips a page without changing what it sets', async () => {
    const { store } = await start(ONBOARDING_PATH);
    toHouse();
    expect(heading()).toBe('Mein Haus');
    click('Überspringen');
    expect(heading()).toBe('Deine Zeiten');
    click('Überspringen');
    expect(heading()).toBe('Deine Gewohnheiten');
    expect(store.getProfile().updatedAt).toBe(0);
  });
});

describe('Einrichtung: der Weg Alltag', () => {
  it('writes names, times, habits and plan into the app’s own settings', async () => {
    const { store, router } = await start(ONBOARDING_PATH);
    expect(heading()).toBe('So beginnt der Tag');
    // Matthäus 6,33 in the text of Luther 1912, word for word.
    expect(document.body.textContent).toContain(
      '„Trachtet am ersten nach dem Reich Gottes und nach seiner Gerechtigkeit, so wird euch solches alles zufallen.“',
    );
    expect(document.body.textContent).toContain('Die Stille Zeit dauert etwa 45 Minuten.');

    // The way must be chosen before it goes on.
    next();
    expect(heading()).toBe('Wofür möchtest du Henoch nutzen?');
    expect((screen.getByRole('button', { name: 'Weiter' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /^Alltag/ }));
    next();

    // Mein Haus: a wife and two children.
    expect(heading()).toBe('Mein Haus');
    fireEvent.click(screen.getByRole('switch', { name: /Ich habe eine Frau/ }));
    fireEvent.change(screen.getByLabelText('Name deiner Frau'), { target: { value: 'Anna' } });
    fireEvent.click(screen.getByRole('switch', { name: /Ich habe Kinder/ }));
    fireEvent.change(screen.getByLabelText('Name des Kindes'), { target: { value: 'Paul' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sohn' }));
    click('Weiteres Kind hinzufügen');
    fireEvent.change(screen.getByLabelText('2. Kind'), { target: { value: 'Marie' } });
    expect(screen.getByText(/Gebetsübersicht/)).toBeTruthy();
    next();
    const house = store.getProfile().house;
    expect(house.wife.name).toBe('Anna');
    expect(house.children.map((c) => c.name).slice(0, 2)).toEqual(['Paul', 'Marie']);
    expect(house.children[0]!.sex).toBe('son');

    // Deine Zeiten: three of them.
    expect(heading()).toBe('Deine Zeiten');
    expect(screen.queryByLabelText('Aufstehen')).toBeNull();
    fireEvent.change(screen.getByLabelText('Stille Zeit'), { target: { value: '05:30' } });
    fireEvent.change(screen.getByLabelText('Vesper'), { target: { value: '18:00' } });
    fireEvent.change(screen.getByLabelText('Nachtgebet'), { target: { value: '21:15' } });
    next();
    expect(store.getProfile().schedule).toMatchObject({ stillTime: '05:30', vespers: '18:00', compline: '21:15' });

    // Deine Gewohnheiten: the habits of wife and children are there now.
    expect(heading()).toBe('Deine Gewohnheiten');
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Täglich', 'Wöchentlich', 'Monatlich']);
    fireEvent.click(screen.getByRole('switch', { name: /Mit meiner Frau beten/ }));
    fireEvent.click(screen.getByRole('switch', { name: /Die Kinder segnen/ }));
    next();
    const habits = store.getProfile().habits;
    expect(habits.find((h) => h.id === 'prayWithWife')!.active).toBe(true);
    expect(habits.find((h) => h.id === 'blessChildren')!.active).toBe(false);

    // Dein Leseplan: two chapters of the Old Testament a day.
    expect(heading()).toBe('Dein Leseplan');
    expect(document.body.textContent).toContain('nach Fortschritt, nicht nach Datum');
    fireEvent.change(screen.getAllByLabelText('Kapitel am Tag')[0]!, { target: { value: '2' } });
    expect(store.getProfile().plan.planId).toBe('atnt-2-1');
    // Only start and amount: no plan of one's own here.
    expect(screen.queryByRole('button', { name: 'Eigener Plan' })).toBeNull();
    next();

    expect(heading()).toBe('Was auf deinem Gerät bleibt');
    expect(document.body.textContent).toContain('Wird gebetet, nicht notiert.');
    // The word of forgiveness follows, the same text as in the evening order.
    expect(document.querySelector('.absolution')!.textContent).toContain('so ist er treu und gerecht');
    expect(document.querySelector('.absolution')!.textContent).toContain('1. Johannes 1,9');
    next();

    // The summary is a quiet list; its button leads to Heute.
    expect(heading()).toBe('Das ist eingerichtet');
    const text = document.querySelector('.ob-sum')!.textContent!;
    expect(text).toContain('Anna, Paul und Marie');
    expect(text).toContain('Stille Zeit 05:30');
    expect(text).toContain('Mit meiner Frau beten');
    expect(text).not.toContain('Die Kinder segnen');
    click('Zu Heute');
    expect(await screen.findByText('Heute-Seite')).toBeTruthy();
    expect(router.state.location.pathname).toBe('/');
    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('done');
  });

  it('shows habits for wife and children only when the house has them', async () => {
    await start(ONBOARDING_PATH);
    toHouse();
    click('Überspringen');
    click('Überspringen');
    expect(heading()).toBe('Deine Gewohnheiten');
    expect(screen.queryByRole('switch', { name: /Mit meiner Frau beten/ })).toBeNull();
    expect(screen.queryByRole('switch', { name: /Die Kinder segnen/ })).toBeNull();
    expect(screen.getByRole('switch', { name: /Stille Zeit/ })).toBeTruthy();
  });

  it('goes back without losing what was entered', async () => {
    const { store } = await start(ONBOARDING_PATH);
    toHouse();
    fireEvent.click(screen.getByRole('switch', { name: /Ich habe eine Frau/ }));
    fireEvent.change(screen.getByLabelText('Name deiner Frau'), { target: { value: 'Anna' } });
    next();
    click('Zurück');
    expect(heading()).toBe('Mein Haus');
    expect((screen.getByLabelText('Name deiner Frau') as HTMLInputElement).value).toBe('Anna');
    expect(store.getProfile().house.wife.name).toBe('Anna');
  });
});

/** To the first page of the way "Wüstenwanderung". */
function toDesert() {
  next();
  fireEvent.click(screen.getByRole('button', { name: /^Wüstenwanderung/ }));
  next();
}

describe('Einrichtung: der Weg Wüstenwanderung', () => {
  it('goes its own way, and the Wüstenzeit begins only with the last button', async () => {
    const { router, store } = await start(ONBOARDING_PATH);
    toDesert();
    expect(heading()).toBe('Wüstenwanderung beginnen');
    expect(document.body.textContent).toContain('übe dich selbst aber in der Gottseligkeit.');
    expect(document.body.textContent).toContain('1. Timotheus 4,7');
    fireEvent.click(screen.getByRole('button', { name: '90 Tage' }));
    fireEvent.click(screen.getByRole('button', { name: 'Morgen' }));
    expect(document.body.textContent).toContain('Dienstag, 20. Oktober 2026');
    next();

    expect(heading()).toBe('Gewohnheiten für diese Zeit');
    fireEvent.click(screen.getByRole('switch', { name: 'Morgensegen' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Handy später' }));
    expect(document.body.textContent).toContain('Eigene Gewohnheiten legst du später in der Arena an.');
    // Back and forth and skipping start nothing.
    click('Zurück');
    next();
    click('Überspringen');
    expect(heading()).toBe('Deine Zeiten');
    expect(store.getProfile().winterArc.runs).toHaveLength(0);
    // No page of the way "Alltag".
    expect(screen.queryByLabelText('Name deiner Frau')).toBeNull();
    next();
    expect(heading()).toBe('Was auf deinem Gerät bleibt');
    next();

    expect(heading()).toBe('Das ist eingerichtet');
    const text = document.querySelector('.ob-sum')!.textContent!;
    expect(text).toContain('Wüstenwanderung');
    expect(text).toContain('90 Tage');
    expect(text).toContain('Morgensegen, Handy später');
    expect(store.getProfile().winterArc.runs).toHaveLength(0);
    click('Zur Wüstenwanderung');
    await waitFor(() => expect(router.state.location.pathname).toBe('/arena'));
    expect(router.state.location.search).toBe('?bereich=wuestenwanderung');
    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('done');
    const run = store.getProfile().winterArc.runs[0]!;
    expect(run).toMatchObject({ startDate: '2026-10-20', durationDays: 90 });
    expect(run.habits).toEqual(['wz-morgensegen', 'wz-handy-spaeter']);
  });

  it('asks for a valid own length and start before it goes on', async () => {
    await start(ONBOARDING_PATH);
    toDesert();
    fireEvent.click(screen.getByRole('button', { name: 'Eigene Dauer' }));
    expect((screen.getByRole('button', { name: 'Weiter' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('Dauer in Kalendertagen'), { target: { value: '21' } });
    fireEvent.click(screen.getByRole('button', { name: 'Anderer Tag' }));
    expect((screen.getByRole('button', { name: 'Weiter' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('Startdatum'), { target: { value: '2026-11-01' } });
    expect((screen.getByRole('button', { name: 'Weiter' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('goes on after a reload on the same way, with what was entered', async () => {
    const first = await start(ONBOARDING_PATH, undefined, 'ob-desert-resume');
    toDesert();
    fireEvent.click(screen.getByRole('button', { name: '90 Tage' }));
    next();
    fireEvent.click(screen.getByRole('switch', { name: 'Morgensegen' }));
    await first.store.flush();
    cleanup();
    const { router } = await start('/', undefined, 'ob-desert-resume');
    await waitFor(() => expect(router.state.location.pathname).toBe(ONBOARDING_PATH));
    expect((await screen.findByRole('heading', { level: 2 })).textContent).toBe('Gewohnheiten für diese Zeit');
    expect((screen.getByRole('switch', { name: 'Morgensegen' }) as HTMLInputElement).checked).toBe(true);
    click('Zurück');
    expect(screen.getByRole('button', { name: '90 Tage' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('keeps the entries of the other way when the way is changed', async () => {
    const { store } = await start(ONBOARDING_PATH);
    toHouse();
    fireEvent.click(screen.getByRole('switch', { name: /Ich habe eine Frau/ }));
    fireEvent.change(screen.getByLabelText('Name deiner Frau'), { target: { value: 'Anna' } });
    click('Zurück');
    fireEvent.click(screen.getByRole('button', { name: /^Wüstenwanderung/ }));
    next();
    fireEvent.click(screen.getByRole('button', { name: '90 Tage' }));
    click('Zurück');
    fireEvent.click(screen.getByRole('button', { name: /^Alltag/ }));
    next();
    expect((screen.getByLabelText('Name deiner Frau') as HTMLInputElement).value).toBe('Anna');
    expect(store.getProfile().winterArc.runs).toHaveLength(0);
    click('Zurück');
    fireEvent.click(screen.getByRole('button', { name: /^Wüstenwanderung/ }));
    next();
    expect(screen.getByRole('button', { name: '90 Tage' }).getAttribute('aria-pressed')).toBe('true');
    expect(store.getProfile().house.wife.name).toBe('Anna');
  });
});

describe('Einrichtung: Aufbau', () => {
  it('has no progress bar, no count of steps, no tab bar', async () => {
    await start(ONBOARDING_PATH);
    for (let i = 0; i < 3; i++) {
      expect(document.querySelector('progress, [role="progressbar"], nav.tabs')).toBeNull();
      expect(document.body.textContent).not.toMatch(/Schritt \d|\d von \d|\d\s*\/\s*\d/);
      if (i === 1) fireEvent.click(screen.getByRole('button', { name: /^Alltag/ }));
      next();
    }
  });

  it('puts the focus on the heading of each page', async () => {
    await start(ONBOARDING_PATH);
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2 }));
    next();
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2, name: 'Wofür möchtest du Henoch nutzen?' }));
  });

  it('heads the page like the rest of the app', async () => {
    await start(ONBOARDING_PATH);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Einrichtung');
    expect(document.querySelector('header.top')).not.toBeNull();
  });
});

describe('Mehr, Anleitung', () => {
  it('reopens the setup; a run changes only what is changed', async () => {
    localStorage.setItem(ONBOARDING_KEY, 'done');
    const { store, router } = await start('/mehr', (s) =>
      s.updateProfile((p) => ({ ...p, house: { ...p.house, wife: { name: 'Anna', concern: '' } }, schedule: { ...p.schedule, stillTime: '05:00' } })),
    );
    fireEvent.click(await screen.findByRole('link', { name: /^Anleitung/ }));
    fireEvent.click(await screen.findByRole('link', { name: 'Einrichtung ansehen' }));
    expect(router.state.location.pathname).toBe(ONBOARDING_PATH);
    const before = store.getProfile();
    next();
    fireEvent.click(screen.getByRole('button', { name: /^Alltag/ }));
    next();
    // What was entered is there, and clicking through leaves it.
    expect((screen.getByLabelText('Name deiner Frau') as HTMLInputElement).value).toBe('Anna');
    next();
    expect((screen.getByLabelText('Stille Zeit') as HTMLInputElement).value).toBe('05:00');
    next();
    next();
    next();
    next();
    expect(heading()).toBe('Das ist eingerichtet');
    expect(store.getProfile()).toBe(before);
    click('Zu Heute');
    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('done');
  });

  it('closes back to the Anleitung when it was opened from there', async () => {
    localStorage.setItem(ONBOARDING_KEY, 'done');
    const { router } = await start(ONBOARDING_PATH);
    click('Schließen');
    await waitFor(() => expect(router.state.location.pathname).toBe('/mehr/anleitung'));
    expect(await screen.findByRole('link', { name: 'Einrichtung ansehen' })).toBeTruthy();
  });
});
