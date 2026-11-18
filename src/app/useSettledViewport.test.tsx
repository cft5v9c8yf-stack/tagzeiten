// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettledViewport } from './useSettledViewport';

function Probe() {
  useSettledViewport();
  return (
    <>
      <input aria-label="a" />
      <input aria-label="b" />
    </>
  );
}

describe('useSettledViewport', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('nudges the page after a field is left, so the tab bar returns to the bottom', () => {
    const { getByLabelText } = render(<Probe />);
    const a = getByLabelText('a');
    a.focus();
    a.blur();
    expect(window.scrollTo).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(window.scrollTo).toHaveBeenCalled();
    expect(vi.mocked(window.scrollTo).mock.lastCall).toEqual([0, 0]);
  });

  it('leaves the page alone while the next field is being filled in', () => {
    const { getByLabelText } = render(<Probe />);
    getByLabelText('a').focus();
    getByLabelText('b').focus();
    vi.advanceTimersByTime(500);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
