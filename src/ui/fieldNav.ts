/**
 * Moving between the fields of an entry with the keyboard (iPad with keyboard, desktop):
 * Tab and Shift+Tab go to the next and the previous field, Enter in a field marked
 * `data-enter="next"` (title, one-line notes) goes to the next one. Buttons are skipped, as
 * Safari does by default; the fields keep their natural order.
 */
import type { KeyboardEvent } from 'react';

const FIELDS = 'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([disabled]), textarea:not([disabled])';

/** The next (or previous) field of `root` after `from`, or null at the ends. */
export function siblingField(root: HTMLElement, from: Element, back = false): HTMLElement | null {
  const all = Array.from(root.querySelectorAll<HTMLElement>(FIELDS)).filter((el) => !el.closest('[hidden], [inert]'));
  const i = all.indexOf(from as HTMLElement);
  return i < 0 ? null : (all[i + (back ? -1 : 1)] ?? null);
}

/** Moves the focus on, from a field of the entry; false if there is no field to go to. */
export function focusSibling(from: Element, back = false): boolean {
  const root = from.closest<HTMLElement>('[data-fields]');
  const next = root ? siblingField(root, from, back) : null;
  next?.focus();
  return !!next;
}

/** Key handler for the entry's article (`data-fields`): Tab and the marked Enter. */
export function fieldKeys(e: KeyboardEvent<HTMLElement>): void {
  const target = e.target as HTMLElement;
  if (!target.matches(FIELDS) || e.altKey || e.ctrlKey || e.metaKey || e.nativeEvent.isComposing) return;
  const enter = e.key === 'Enter' && target.dataset.enter === 'next';
  if (e.key !== 'Tab' && !enter) return;
  if (focusSibling(target, e.key === 'Tab' && e.shiftKey)) e.preventDefault();
}
