import { useLayoutEffect, type RefObject } from 'react';

/**
 * The desk of an entry on the iPad lying (Beten and Wachen): it takes exactly the
 * rest of the screen, so both boxes end on one line; what grows inside a box
 * scrolls there. Measured when opened and again when the iPad is turned.
 */
export function useDeskHeight(ref: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const desk = ref.current;
    if (!desk) return;
    const fit = () => {
      const top = desk.getBoundingClientRect().top + window.scrollY;
      desk.style.setProperty('--desk-height', `${Math.max(420, window.innerHeight - top - 20)}px`);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  });
}
