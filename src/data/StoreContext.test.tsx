// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeSync, useTheme } from '../app/ThemeContext';
import { TagzeitenDB } from './db';
import { useDay, useProfile } from './hooks';
import { Store } from './store';
import { StoreProvider, useStore } from './StoreContext';

afterEach(cleanup);

function Verse({ date }: { date: string }) {
  const day = useDay(date);
  const store = useStore();
  return (
    <>
      <p data-testid="verse">{day.morning.verse ?? '—'}</p>
      <button
        onClick={() => store.updateDay(date, (d) => ({ ...d, morning: { ...d.morning, verse: 'Ps 37,7' } }))}
      >
        Vers setzen
      </button>
    </>
  );
}

function ThemeButton() {
  const { setTheme } = useTheme();
  const { theme } = useProfile();
  return <button onClick={() => setTheme('dark')}>{theme}</button>;
}

describe('StoreProvider', () => {
  it('loads, re-renders on change and saves when the page is hidden', async () => {
    const db = new TagzeitenDB('ctx-1');
    const store = new Store({ db, debounceMs: 60_000 });
    render(
      <StoreProvider store={store}>
        <Verse date="2026-09-25" />
      </StoreProvider>,
    );
    expect(screen.getByText('Einen Moment …')).toBeTruthy();
    await screen.findByTestId('verse');
    // Let React run its effects, so the component subscribes to the store before the click.
    await act(async () => {});
    expect(screen.getByTestId('verse').textContent).toBe('—');

    act(() => screen.getByText('Vers setzen').click());
    expect(screen.getByTestId('verse').textContent).toBe('Ps 37,7');
    expect(await db.days.count()).toBe(0); // still debounced

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await waitFor(async () => expect(await db.days.count()).toBe(1), { timeout: 5000 });
    db.close();
    await db.delete();
  });

  it('applies the theme stored in the profile', async () => {
    const db = new TagzeitenDB('ctx-2');
    const store = new Store({ db });
    render(
      <StoreProvider store={store}>
        <ThemeSync />
        <ThemeButton />
      </StoreProvider>,
    );
    const btn = await screen.findByText('system');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    act(() => btn.click());
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('tz:theme')).toBe('dark');
    await store.flush();
    expect((await db.profile.get('me'))?.theme).toBe('dark');
    db.close();
    await db.delete();
  });
});
