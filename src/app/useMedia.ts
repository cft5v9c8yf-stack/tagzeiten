import { useSyncExternalStore } from 'react';

/**
 * The iPad (or any screen as large) lying on its side: room for two columns.
 * The same query stands in src/styles/tablet.css; keep both alike.
 */
export const WIDE_QUERY = '(orientation: landscape) and (min-width: 1000px) and (min-height: 600px)';

function mediaList(query: string): MediaQueryList | undefined {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(query) : undefined;
}

/** Whether a media query holds now; follows the screen when it is turned. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = mediaList(query);
      list?.addEventListener('change', onChange);
      return () => list?.removeEventListener('change', onChange);
    },
    () => mediaList(query)?.matches ?? false,
    () => false,
  );
}

/** Two columns where the page offers them (Wort, Gebetskammer, Mehr). */
export function useWide(): boolean {
  return useMedia(WIDE_QUERY);
}
