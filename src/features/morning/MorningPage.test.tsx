// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import { resetOpenState } from '../../ui/collapseState';
import { timer } from '../../ui/timerState';
import { MorningPage } from './MorningPage';

beforeEach(() => {
  localStorage.clear();
  resetOpenState();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

let n = 0;
async function renderMorning(prepare?: (s: Store) => void) {
  const store = new Store({ db: new TagzeitenDB(`morning-${++n}`), journal: memoryJournal(), now: () => new Date(2026, 8, 25, 5) });
  if (prepare) {
    await store.load();
    prepare(store);
    await store.flush();
  }
  const router = createMemoryRouter([{ path: '/morgen', element: <MorningPage /> }], { initialEntries: ['/morgen'] });
  render(
    <ToastProvider>
      <StoreProvider store={store}>
        <RouterProvider router={router} />
      </StoreProvider>
    </ToastProvider>,
  );
  await screen.findByRole('heading', { name: /^(Stille Zeit|Morgengebet)$/, level: 2 });
  return store;
}

const chain = () => screen.getByRole('navigation', { name: 'Ablauf: Stille Zeit' });
const title = () => document.querySelector('.flow-step h3')!.textContent;

describe('Stille Zeit as a flow', () => {
  it('shows one step at a time, starting at the bed, without times or labels in the row', async () => {
    const store = await renderMorning();
    expect(title()).toBe('Am Bett');
    expect(document.querySelectorAll('.flow-step')).toHaveLength(1);
    expect(chain().textContent).not.toMatch(/Min\.|gebetet/);

    fireEvent.click(screen.getByRole('button', { name: 'Weiter zu: Eröffnung' }));
    await waitFor(() => expect(title()).toBe('Eröffnung'));
    expect(store.getDay(store.today()).morning.atBed).toBe(true);
    expect(within(chain()).getByRole('button', { name: 'Am Bett, gebetet' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Weiter zu: Das Wort' }));
    await waitFor(() => expect(title()).toBe('Das Wort'));
    expect(store.getDay(store.today()).morning.steps.opening).toBe(true);
  });

  it('lets any step be opened from the row and closes the order on the last one (rule 8)', async () => {
    const store = await renderMorning();
    fireEvent.click(screen.getByRole('button', { name: /^Kurzform/ }));
    await waitFor(() => expect(store.getDay(store.today()).morning.form).toBe('short'));
    const buttons = within(chain()).getAllByRole('button');
    fireEvent.click(buttons.at(-1)!);
    fireEvent.click(await screen.findByRole('button', { name: 'Stille Zeit abschließen' }));
    await waitFor(() => expect(store.getDay(store.today()).morning.done).toBe(true));
    expect(screen.getByText('Stille Zeit abgeschlossen.')).toBeTruthy();
    expect(document.querySelector('.flow-step')).toBeNull();
  });

  it('puts on the armour of the day in the Stille Zeit before the alignment, not at the bed, unless switched off', async () => {
    const store = await renderMorning();
    const step = () => document.querySelector('.flow-step')!;
    const titles = () => [...step().querySelectorAll('.part-title')].map((h) => h.textContent);
    // At the bed: the morning blessing closes it, without the armour.
    expect(titles().at(-1)).toBe('Morgensegen');
    expect(step().textContent).not.toContain('Harnisch');
    // In the Stille Zeit: the step "Die Ausrichtung" opens with it, before the three things.
    fireEvent.click(within(chain()).getAllByRole('button').at(-2)!);
    await waitFor(() => expect(titles()).toEqual(['Die geistliche Waffenrüstung', 'Die drei Dinge']));
    // 25 September 2026 is a Friday.
    expect(step().textContent).toContain('Freitag: Der Helm des Heils');
    expect(step().textContent).toContain('Ziehet an den Harnisch Gottes');
    store.updateProfile((p) => ({ ...p, armor: false }));
    await waitFor(() => expect(step().textContent).not.toContain('Harnisch'));
  });

});

describe('Stille Zeit and the Abendbrunnen', () => {
  const meeting = { id: 'a', date: '2026-09-22', resolution: 'Abends zuhören', resolutionDone: false, herWish: 'Ein Abend ohne Termine', herConcern: '', myConcern: '' };
  const alignment = async (on: boolean) => {
    await renderMorning((s) => s.updateProfile((p) => ({ ...p, well: { on, meetings: [meeting] } }), { immediate: true }));
    fireEvent.click(within(chain()).getAllByRole('button').at(-2)!);
    await waitFor(() => expect(document.querySelector('.flow-step .part-alignment')).not.toBeNull());
    return document.querySelector('.flow-step')!.textContent!;
  };

  it('shows the resolution and the wish of the week in the alignment, when the Abendbrunnen is on', async () => {
    const text = await alignment(true);
    expect(text).toContain('Dein Vorsatz für diese Woche: Abends zuhören');
    expect(text).toContain('Ihr Wunsch an dich: Ein Abend ohne Termine');
  });

  it('shows nothing of it while the Abendbrunnen is off', async () => {
    expect(await alignment(false)).not.toContain('Abendbrunnen');
  });
});

describe('Stille Zeit and the reading habit', () => {
  it('marks the day\'s reading as read when the step "Das Wort" is left, and moves the plan on', async () => {
    const store = await renderMorning((s) => s.updateProfile((p) => ({ ...p, showAtBed: false }), { immediate: true }));
    fireEvent.click(within(chain()).getByRole('button', { name: /^Das Wort/ }));
    await waitFor(() => expect(title()).toBe('Das Wort'));
    await waitFor(() => expect(store.getDay(store.today()).reading).toBeTruthy());
    const before = JSON.stringify(store.getProfile().plan.positions);
    expect(store.getDay(store.today()).reading!.done).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: /^Weiter zu: / }));
    await waitFor(() => expect(store.getDay(store.today()).reading!.done).toBe(true));
    expect(JSON.stringify(store.getProfile().plan.positions)).not.toBe(before);
  });
});

describe('Stille Zeit without the bed', () => {
  it('shows the verse and the double question in the reading, the rest folded until something is written in it', async () => {
    await renderMorning();
    fireEvent.click(within(chain()).getByRole('button', { name: /^Das Wort/ }));
    await waitFor(() => expect(title()).toBe('Das Wort'));
    const fold = [...document.querySelectorAll('details.fold')].find((d) => d.querySelector('summary')!.textContent === 'Mehr notieren')!;
    expect(fold.hasAttribute('open')).toBe(false);
    const inView = [...document.querySelectorAll('.flow-step label')].filter((l) => !fold.contains(l)).map((l) => l.textContent);
    expect(inView).toEqual(['Stelle des Verses', 'Vers, den ich mitnehme', 'Was lerne ich über Gott?', 'Was lerne ich über den Menschen?']);
    expect(within(fold as HTMLElement).getByLabelText('Hauptaussage')).toBeTruthy();
    expect(within(fold as HTMLElement).getByLabelText('→ Umsetzung')).toBeTruthy();
    cleanup();
    await renderMorning((s) => s.updateDay(s.today(), (d) => ({ ...d, morning: { ...d.morning, unclear: 'Wer ist hier gemeint?' } })));
    fireEvent.click(within(chain()).getByRole('button', { name: /^Das Wort/ }));
    await waitFor(() => expect(title()).toBe('Das Wort'));
    const open = [...document.querySelectorAll('details.fold')].find((d) => d.querySelector('summary')!.textContent === 'Mehr notieren')!;
    expect(open.hasAttribute('open')).toBe(true);
  });

  it('begins with the opening when Am Bett is hidden', async () => {
    await renderMorning((s) => s.updateProfile((p) => ({ ...p, showAtBed: false }), { immediate: true }));
    expect(title()).toBe('Eröffnung');
    expect(within(chain()).queryByRole('button', { name: /Am Bett/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /^Weiter zu: / }));
    await waitFor(() => expect(title()).not.toBe('Eröffnung'));
  });

  it('names the step in view under its mark and the timer agrees with the bed', async () => {
    await renderMorning();
    // The strip with the time shows only once the time is started.
    expect(screen.queryByText(/Jetzt: Am Bett/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Zeit starten' }));
    expect(screen.getByText(/Jetzt: Am Bett/)).toBeTruthy();
    // Every mark carries its name; the one in view stands first.
    expect(chain().querySelector('.flow-short')!.textContent).toBe('Am Bett');
    timer.reset(45 * 60);
  });
});

describe('Morgengebet (free prayer)', () => {
  it('is the sheet, then the three things – no bedside prayer, no form switch, no minutes', async () => {
    const store = await renderMorning((st) =>
      st.updateProfile((p) => ({
        ...p,
        petition: { morning: true, evening: false },
        house: { ...p.house, wife: { ...p.house.wife, name: 'Maria', concern: 'Kraft für die Woche' } },
        prayer: { concerns: ['Die Kranken'], daily: ['Die Kranken'], weekly: {} },
      })),
    );
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Morgengebet');
    const marks = within(screen.getByRole('navigation', { name: 'Ablauf: Morgengebet' }))
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label'));
    expect(marks).toEqual(['Morgengebet', 'Die drei Dinge']);
    const sheet = document.querySelector('.ps')!.textContent!;
    const at = (t: string) => sheet.indexOf(t);
    expect(at('Im Namen Gottes')).toBe(0);
    expect(at('Psalm')).toBeGreaterThan(at('Das Wort'));
    expect(at('Mein Haus')).toBeGreaterThan(at('Psalm'));
    expect(at('Maria – Kraft für die Woche')).toBeGreaterThan(0);
    expect(at('Ich trage')).toBeGreaterThan(at('Mein Haus'));
    expect(at('Dank')).toBeGreaterThan(at('Ich trage'));
    expect(sheet.trim().endsWith('Das walte Gott Vater, Sohn und Heiliger Geist. Amen.')).toBe(true);
    expect(document.querySelectorAll('.ps input, .ps textarea')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /^Kurzform/ })).toBeNull();
    expect(document.body.textContent).not.toMatch(/Min\.|Am Bett/);

    fireEvent.click(screen.getByRole('button', { name: 'Weiter zu: Die drei Dinge' }));
    await waitFor(() => expect(document.querySelectorAll('.flow-step input, .flow-step textarea')).toHaveLength(3));
    fireEvent.click(screen.getByRole('button', { name: 'Morgengebet abschließen' }));
    await waitFor(() => expect(store.getDay(store.today()).morning.done).toBe(true));
  });
});
