// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMedia, useWide, WIDE_QUERY } from './useMedia';

function fakeMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  const list = {
    get matches() {
      return matches;
    },
    addEventListener: (_: string, l: () => void) => listeners.add(l),
    removeEventListener: (_: string, l: () => void) => listeners.delete(l),
  };
  const spy = vi.fn(() => list);
  vi.stubGlobal('matchMedia', spy);
  return {
    spy,
    turn(next: boolean) {
      matches = next;
      listeners.forEach((l) => l());
    },
  };
}

describe('useMedia', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('is false where the browser cannot tell', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { result } = renderHook(() => useWide());
    expect(result.current).toBe(false);
  });

  it('asks for the iPad lying on its side', () => {
    const media = fakeMatchMedia(true);
    const { result } = renderHook(() => useWide());
    expect(result.current).toBe(true);
    expect(media.spy).toHaveBeenCalledWith(WIDE_QUERY);
  });

  it('follows the screen when it is turned', () => {
    const media = fakeMatchMedia(false);
    const { result } = renderHook(() => useMedia('(orientation: landscape)'));
    expect(result.current).toBe(false);
    act(() => media.turn(true));
    expect(result.current).toBe(true);
  });
});
