import { useEffect } from 'react';

/** How long iOS takes to slide the keyboard or the time wheel away. */
const SETTLE_DELAYS_MS = [60, 400];

function isEditable(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

/** Scroll one pixel and back: WebKit then measures the screen again. */
export function settleViewport(win: Window = window): void {
  const { scrollX, scrollY } = win;
  win.scrollTo(scrollX, scrollY > 0 ? scrollY - 1 : 1);
  win.scrollTo(scrollX, scrollY);
}

/**
 * iOS home-screen apps can keep the short viewport of the open keyboard (or
 * time wheel) after it has closed. The fixed tab bar then hangs in the middle
 * of the screen until the page is scrolled. Once a field is left and no other
 * is entered, nudge the page so the bar falls back to the bottom edge.
 */
export function useSettledViewport(): void {
  useEffect(() => {
    let timers: number[] = [];
    const clear = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
    };
    const settleSoon = () => {
      clear();
      timers = SETTLE_DELAYS_MS.map((ms) =>
        window.setTimeout(() => {
          if (!isEditable(document.activeElement)) settleViewport();
        }, ms),
      );
    };
    const onFocusOut = (e: FocusEvent) => {
      if (isEditable(e.target as Element | null)) settleSoon();
    };
    document.addEventListener('focusout', onFocusOut);
    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', settleSoon);
    return () => {
      clear();
      document.removeEventListener('focusout', onFocusOut);
      viewport?.removeEventListener('resize', settleSoon);
    };
  }, []);
}
