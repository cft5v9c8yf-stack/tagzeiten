/**
 * Debounced, per-document write queue.
 *
 * - Changes are debounced (text input) or written immediately (toggles).
 * - At most one write per document is in flight; changes arriving meanwhile
 *   are coalesced and written right after, with the latest value.
 * - flush() writes everything pending now, e.g. when the page is hidden.
 */

export type Writer<T> = (key: string, value: T) => Promise<void>;

interface Slot<T> {
  value: T;
  hasValue: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  running: Promise<void> | null;
}

export class WriteQueue<T> {
  private slots = new Map<string, Slot<T>>();

  constructor(
    private readonly writer: Writer<T>,
    private readonly delayMs = 700,
    private readonly onError: (key: string, error: unknown) => void = () => {},
  ) {}

  /** Queue the latest value of a document. */
  schedule(key: string, value: T, immediate = false): void {
    const slot = this.slot(key);
    slot.value = value;
    slot.hasValue = true;
    if (slot.timer) clearTimeout(slot.timer);
    slot.timer = null;
    if (immediate) void this.run(key);
    else slot.timer = setTimeout(() => void this.run(key), this.delayMs);
  }

  /** Whether anything is waiting or being written. */
  get pending(): boolean {
    for (const s of this.slots.values()) if (s.hasValue || s.running) return true;
    return false;
  }

  /** Write all pending documents now and wait until everything is stored. */
  async flush(): Promise<void> {
    const keys = [...this.slots.keys()];
    await Promise.all(keys.map((k) => this.run(k)));
    // A write may have been queued while flushing.
    if ([...this.slots.values()].some((s) => s.hasValue)) await this.flush();
  }

  /** Drop everything that has not started yet (used before wiping all data). */
  async cancelAll(): Promise<void> {
    for (const s of this.slots.values()) {
      if (s.timer) clearTimeout(s.timer);
      s.timer = null;
      s.hasValue = false;
    }
    await Promise.all([...this.slots.values()].map((s) => s.running).filter(Boolean));
  }

  private slot(key: string): Slot<T> {
    let s = this.slots.get(key);
    if (!s) {
      s = { value: undefined as T, hasValue: false, timer: null, running: null };
      this.slots.set(key, s);
    }
    return s;
  }

  private run(key: string): Promise<void> {
    const slot = this.slot(key);
    if (slot.timer) clearTimeout(slot.timer);
    slot.timer = null;
    if (slot.running) return slot.running; // the loop below picks up the new value
    if (!slot.hasValue) return Promise.resolve();

    const loop = async () => {
      while (slot.hasValue) {
        const value = slot.value;
        slot.hasValue = false;
        try {
          await this.writer(key, value);
        } catch (e) {
          this.onError(key, e);
        }
      }
    };
    slot.running = loop().finally(() => {
      slot.running = null;
    });
    return slot.running;
  }
}
