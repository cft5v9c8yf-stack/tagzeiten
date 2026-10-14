import { afterEach, describe, expect, it, vi } from 'vitest';
import { persistence, requestPersistence } from './persistence';

const original = Object.getOwnPropertyDescriptor(globalThis.navigator, 'storage');
function fake(storage: unknown) {
  Object.defineProperty(globalThis.navigator, 'storage', { value: storage, configurable: true });
}
afterEach(() => {
  if (original) Object.defineProperty(globalThis.navigator, 'storage', original);
  else delete (globalThis.navigator as { storage?: unknown }).storage;
});

describe('persistence', () => {
  it('asks the browser to keep the data when it does not yet', async () => {
    const persist = vi.fn().mockResolvedValue(true);
    fake({ persisted: vi.fn().mockResolvedValue(false), persist });
    expect(await persistence()).toBe('best-effort');
    expect(await requestPersistence()).toBe('persisted');
    expect(persist).toHaveBeenCalledOnce();
  });

  it('does not ask again once granted', async () => {
    const persist = vi.fn();
    fake({ persisted: vi.fn().mockResolvedValue(true), persist });
    expect(await requestPersistence()).toBe('persisted');
    expect(persist).not.toHaveBeenCalled();
  });

  it('stays best effort when the browser declines, and knows when it cannot ask', async () => {
    fake({ persisted: vi.fn().mockResolvedValue(false), persist: vi.fn().mockResolvedValue(false) });
    expect(await requestPersistence()).toBe('best-effort');
    fake(undefined);
    expect(await persistence()).toBe('unsupported');
    expect(await requestPersistence()).toBe('unsupported');
  });
});
