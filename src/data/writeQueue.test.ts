import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WriteQueue } from './writeQueue';

function deferredWriter() {
  const calls: { key: string; value: number; resolve: () => void }[] = [];
  let active = 0;
  let maxActive = 0;
  const writer = (key: string, value: number) =>
    new Promise<void>((resolve) => {
      active++;
      maxActive = Math.max(maxActive, active);
      calls.push({
        key,
        value,
        resolve: () => {
          active--;
          resolve();
        },
      });
    });
  return { writer, calls, maxActive: () => maxActive };
}

describe('WriteQueue', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('debounces and writes the latest value', async () => {
    const w = vi.fn(async () => {});
    const q = new WriteQueue<number>(w, 700);
    q.schedule('a', 1);
    q.schedule('a', 2);
    vi.advanceTimersByTime(699);
    expect(w).not.toHaveBeenCalled();
    q.schedule('a', 3);
    vi.advanceTimersByTime(700);
    await q.flush();
    expect(w).toHaveBeenCalledTimes(1);
    expect(w).toHaveBeenCalledWith('a', 3);
  });

  it('writes immediately when asked', async () => {
    const w = vi.fn(async () => {});
    const q = new WriteQueue<number>(w, 700);
    q.schedule('a', 1, true);
    await Promise.resolve();
    expect(w).toHaveBeenCalledWith('a', 1);
  });

  it('keeps one write per document in flight and coalesces the rest', async () => {
    const d = deferredWriter();
    const q = new WriteQueue<number>(d.writer, 0);
    q.schedule('a', 1, true);
    q.schedule('a', 2, true);
    q.schedule('a', 3, true);
    await Promise.resolve();
    expect(d.calls.map((c) => c.value)).toEqual([1]);
    d.calls[0]!.resolve();
    await vi.waitFor(() => expect(d.calls).toHaveLength(2));
    expect(d.calls[1]!.value).toBe(3); // 2 was superseded
    d.calls[1]!.resolve();
    await q.flush();
    expect(d.maxActive()).toBe(1);
    expect(q.pending).toBe(false);
  });

  it('writes different documents independently', async () => {
    const d = deferredWriter();
    const q = new WriteQueue<number>(d.writer, 0);
    q.schedule('a', 1, true);
    q.schedule('b', 1, true);
    await Promise.resolve();
    expect(d.calls.map((c) => c.key)).toEqual(['a', 'b']);
    d.calls.forEach((c) => c.resolve());
    await q.flush();
  });

  it('flush writes pending debounced values', async () => {
    const w = vi.fn(async () => {});
    const q = new WriteQueue<number>(w, 10_000);
    q.schedule('a', 1);
    q.schedule('b', 2);
    await q.flush();
    expect(w).toHaveBeenCalledTimes(2);
  });

  it('reports errors and carries on', async () => {
    const errors: string[] = [];
    let fail = true;
    const q = new WriteQueue<number>(
      async () => {
        if (fail) {
          fail = false;
          throw new Error('quota');
        }
      },
      0,
      (key) => errors.push(key),
    );
    q.schedule('a', 1, true);
    await q.flush();
    q.schedule('a', 2, true);
    await q.flush();
    expect(errors).toEqual(['a']);
  });

  it('cancelAll drops what has not started', async () => {
    const w = vi.fn(async () => {});
    const q = new WriteQueue<number>(w, 700);
    q.schedule('a', 1);
    await q.cancelAll();
    vi.advanceTimersByTime(1000);
    await q.flush();
    expect(w).not.toHaveBeenCalled();
  });
});
