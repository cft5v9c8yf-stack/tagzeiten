// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../app/Toast';
import { getOrder } from '../../content/orders';
import { TagzeitenDB } from '../../data/db';
import { memoryJournal } from '../../data/journal';
import { Store } from '../../data/store';
import { StoreProvider } from '../../data/StoreContext';
import type { House } from '../../domain/house';
import type { OrderForm } from '../../domain/model';
import { resetOpenState } from '../../ui/collapseState';
import { HouseBlessing, HouseIntercession } from './HouseParts';

beforeEach(() => {
  localStorage.clear();
  resetOpenState();
});
afterEach(cleanup);

const FAMILY: House = {
  wife: { name: 'Anna', concern: 'Kraft für die Nachtdienste' },
  children: [
    { id: 'p', name: 'Paul', sex: 'son', concern: 'Prüfung am Freitag' },
    { id: 'm', name: 'Marie', sex: 'daughter', concern: '' },
    { id: 'x', name: '', concern: '' },
    { id: 'y', name: '', concern: '' },
  ],
};

let n = 0;
async function renderPart(el: React.ReactNode, house: House) {
  const store = new Store({ db: new TagzeitenDB(`house-${++n}`), journal: memoryJournal() });
  await store.load();
  store.updateProfile((p) => ({ ...p, house }), { immediate: true });
  const router = createMemoryRouter([{ path: '/', element: <div className="part">{el}</div> }], { initialEntries: ['/'] });
  render(
    <ToastProvider>
      <StoreProvider store={store}>
        <RouterProvider router={router} />
      </StoreProvider>
    </ToastProvider>,
  );
  await screen.findAllByText(/Herr|Mein Haus/);
}

const morning = (date: string, form: OrderForm = 'full', house = FAMILY) =>
  renderPart(<HouseIntercession date={date} form={form} />, house);
const text = () => document.querySelector('.part')!.textContent!;
const titles = () => [...document.querySelectorAll('.house-focus-title')].map((h) => h.textContent);
const refs = () => [...document.querySelectorAll('.house-refs')].map((p) => p.textContent);
const rubrics = () => [...document.querySelectorAll('.rubric')].map((p) => p.textContent);

describe('Fürbitte für das Haus in the order', () => {
  it('stands in "Die Antwort" right after the Benedictus and before the intercession; in the short form before the Lord’s Prayer', () => {
    const full = getOrder('morning', 'full').steps.find((s) => s.id === 'response')!.parts.map((p) => p.kind);
    expect(full).toEqual(['canticle', 'house-intercession', 'intercession', 'lords-prayer']);
    const short = getOrder('morning', 'short').steps.flatMap((s) => s.parts.map((p) => p.kind));
    expect(short.indexOf('house-intercession')).toBe(short.indexOf('lords-prayer') - 1);
    for (const form of ['full', 'short'] as const) {
      const night = getOrder('compline', form).steps.flatMap((s) => s.parts.map((p) => p.kind));
      expect(night.slice(-2)).toEqual(['evening-blessing', 'house-blessing']);
    }
  });
});

describe('Fürbitte für das Haus through the week, with a son and a daughter', () => {
  it('Monday: Anna in the centre, with her concern above her prayer', async () => {
    await morning('2026-09-28');
    expect(document.querySelector('.house-focus')!.textContent).toBe('Heute im Mittelpunkt: AnnaAnliegen: Kraft für die Nachtdienste');
    expect(rubrics()).toEqual([
      'Bete für alle mit Namen. Für den, der heute im Mittelpunkt steht, bete länger und mit seinem Anliegen.',
      'Anliegen: Kraft für die Nachtdienste',
    ]);
    expect(text()).toContain('Herr, ich befehle dir meine liebe Frau Anna.');
    expect(text()).toContain('Ich bringe dir Paul und Marie. Du hast sie in der Taufe zu deinen Kindern gemacht');
    expect(titles()).toEqual(['Gebet für meine Frau']);
    expect(text()).toContain('Herr, himmlischer Vater, ich danke dir für meine liebe Frau Anna. Du hast sie mir geschenkt');
    expect(text()).not.toContain('heute bringe ich dir besonders');
    // Three paragraphs as given, the reference under them.
    expect(document.querySelectorAll('.pray')[1]!.querySelectorAll('p')).toHaveLength(3);
    expect(refs()).toEqual(['Epheser 5,25']);
    // The concern stands as a rubric right above the text.
    expect(document.querySelector('.house-focus-title')!.nextElementSibling!.textContent).toBe('Anliegen: Kraft für die Nachtdienste');
  });

  it('Tuesday: Paul, the son, with his concern and references', async () => {
    await morning('2026-09-29');
    expect(document.querySelector('.house-focus')!.textContent).toContain('Heute im Mittelpunkt: Paul');
    expect(titles()).toEqual(['Für Paul']);
    expect(rubrics()).toContain('Anliegen: Prüfung am Freitag');
    expect(text()).toContain('im Namen Jesu bringe ich dir meinen Sohn Paul.');
    expect(refs()).toEqual(['Hebräer 12,24 · Galater 3,13']);
  });

  it('Wednesday: Marie, the daughter, without a concern', async () => {
    await morning('2026-09-30');
    expect(document.querySelector('.house-focus')!.textContent).toBe('Heute im Mittelpunkt: Marie');
    expect(rubrics().some((r) => r.startsWith('Anliegen'))).toBe(false);
    expect(text()).toContain('im Namen Jesu bringe ich dir heute meine Tochter Marie.');
    expect(refs()).toEqual(['1. Petrus 1,19 · Hesekiel 22,30']);
    // Paragraphs as given.
    expect(document.querySelectorAll('.pray')[1]!.querySelectorAll('p')).toHaveLength(4);
  });

  it('Thursday and Friday: the two children again, in their order', async () => {
    await morning('2026-10-01');
    expect(titles()).toEqual(['Für Paul']);
    cleanup();
    await morning('2026-10-02');
    expect(titles()).toEqual(['Für Marie']);
  });

  it('Saturday: our marriage, with Habermann’s prayer of a husband word for word', async () => {
    await morning('2026-10-03');
    expect(document.querySelector('.house-focus')!.textContent).toBe('Heute im Mittelpunkt: unsere Ehe');
    expect(titles()).toEqual(['Gebet eines Ehemannes']);
    expect(text()).toContain('Allmächtiger, gütiger Gott, der du den heiligen Ehestand selbst eingesetzt');
    expect(text()).toContain('bei meinem Weibe, als dem schwächsten Werkzeug, wohne');
    expect(text()).toContain('ohn’ anderer Leute Schaden und Nachteil gemehrt werde');
    expect(text()).toContain('von Ewigkeit zu Ewigkeit. Amen.Johann Habermann († 1590)');
    expect(text()).not.toContain('Herr, du hast uns zusammengefügt');
  });

  it('Sunday: the whole house, then Arndt’s prayer of the parents for their children', async () => {
    await morning('2026-10-04');
    expect(document.querySelector('.house-focus')!.textContent).toBe('Heute im Mittelpunkt: das ganze Haus');
    expect(titles()).toEqual(['Für das ganze Haus', 'Gebet der Eltern für ihre Kinder']);
    expect(text()).toContain('ich komme zu dir als Hausvater');
    expect(refs()).toEqual(['Jesaja 54,17']);
    expect(text()).toContain('wer darnach tut, deß Lob bleibet ewiglich');
    expect(text()).toContain('durch Jesum Christum, unsern Herrn. Amen.Johann Arndt († 1621)');
  });

  it('the short form prays only the prayer for all, without the centre and without the old prayers', async () => {
    for (const date of ['2026-10-03', '2026-10-04']) {
      await morning(date, 'short');
      expect(document.querySelector('.house-focus')).toBeNull();
      expect(titles()).toEqual([]);
      expect(text()).toContain('Herr, ich befehle dir meine liebe Frau Anna.');
      expect(text()).not.toMatch(/Habermann|Arndt|Hausvater/);
      cleanup();
    }
  });
});

describe('Fürbitte für das Haus without names', () => {
  it('points to "Mein Haus" when nobody is entered', async () => {
    await morning('2026-09-28', 'full', { wife: { name: '', concern: '' }, children: [] });
    expect(screen.getByRole('link', { name: 'Mehr → Mein Haus' }).getAttribute('href')).toBe('/mehr/haus');
    expect(document.querySelector('.pray')).toBeNull();
  });

  it('asks for son or daughter instead of the prayer for a child without it', async () => {
    await morning('2026-09-29', 'full', { wife: { name: 'Anna', concern: '' }, children: [{ id: 'p', name: 'Paul', concern: '' }] });
    expect(text()).toContain('Bei Paul fehlt noch, ob Sohn oder Tochter.');
    expect(text()).not.toContain('meinen Sohn');
  });

  it('gives the house prayer to Monday and Saturday without a wife, and leaves out her sentence', async () => {
    const children: House = { wife: { name: '', concern: '' }, children: [{ id: 'p', name: 'Paul', sex: 'son', concern: '' }] };
    await morning('2026-09-28', 'full', children);
    expect(titles()).toEqual(['Für das ganze Haus']);
    expect(text()).not.toContain('meine liebe Frau');
    cleanup();
    await morning('2026-10-03', 'full', children);
    expect(titles()).toEqual(['Für das ganze Haus']);
  });
});

describe('Segen über das Haus', () => {
  it('follows the evening blessing with the rubric on the children, then the good night', async () => {
    await renderPart(<HouseBlessing />, FAMILY);
    expect(rubrics()).toEqual(['Wenn es passt, segne die Kinder vorher am Bett mit dem Kreuzzeichen.']);
    expect(text()).toContain('Behüte, Herr, meine Frau und meine Kinder in dieser Nacht.');
    expect(document.querySelector('.send-off')).not.toBeNull();
  });
});
