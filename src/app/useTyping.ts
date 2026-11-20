import { useEffect } from 'react';

const NOT_TYPED = new Set(['checkbox', 'radio', 'range', 'button', 'submit', 'reset', 'color', 'file', 'image']);

/** Whether the element takes typed text (and so brings up the keyboard). */
export function takesTyping(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
  return el instanceof HTMLInputElement && !NOT_TYPED.has(el.type);
}

/**
 * While a field is being written in, the bar of the five sections steps aside:
 * on the phone it would otherwise float above the keyboard over the text. The
 * class "is-typing" on <html> says so; it goes when the field is left and no
 * other is entered.
 */
export function useTyping(): void {
  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;
    const onIn = (e: FocusEvent) => {
      if (!takesTyping(e.target as Element | null)) return;
      window.clearTimeout(timer);
      root.classList.add('is-typing');
    };
    const onOut = () => {
      window.clearTimeout(timer);
      // From one field to the next the bar stays away.
      timer = window.setTimeout(() => {
        if (!takesTyping(document.activeElement)) root.classList.remove('is-typing');
      }, 80);
    };
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
      root.classList.remove('is-typing');
    };
  }, []);
}
