// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { takesTyping, useTyping } from './useTyping';

function Probe() {
  useTyping();
  return (
    <>
      <textarea aria-label="Text" />
      <input aria-label="Titel" type="text" />
      <input aria-label="Gelesen" type="checkbox" />
    </>
  );
}

describe('useTyping', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('knows which fields bring up the keyboard', () => {
    const t = document.createElement('textarea');
    const box = document.createElement('input');
    box.type = 'checkbox';
    const date = document.createElement('input');
    date.type = 'date';
    expect(takesTyping(t)).toBe(true);
    expect(takesTyping(date)).toBe(true);
    expect(takesTyping(box)).toBe(false);
    expect(takesTyping(null)).toBe(false);
  });

  it('marks the page while a field is written in, and not for a checkbox', () => {
    vi.useFakeTimers();
    const { getByLabelText } = render(<Probe />);
    const root = document.documentElement;
    act(() => (getByLabelText('Text') as HTMLElement).focus());
    expect(root.classList.contains('is-typing')).toBe(true);
    // To the next field: the mark stays.
    act(() => {
      (getByLabelText('Titel') as HTMLElement).focus();
      vi.advanceTimersByTime(100);
    });
    expect(root.classList.contains('is-typing')).toBe(true);
    // To a checkbox: the keyboard goes, and so the mark.
    act(() => {
      (getByLabelText('Gelesen') as HTMLElement).focus();
      vi.advanceTimersByTime(100);
    });
    expect(root.classList.contains('is-typing')).toBe(false);
  });
});
