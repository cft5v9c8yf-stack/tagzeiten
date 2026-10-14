/**
 * Read and immutably write values in a Day by path, e.g. "morning.verse",
 * "morning.wreath.thanks" or "evening.thanks.0". Paths come from the order
 * definitions (content/orders.ts).
 */
import type { Day } from './model';

type Container = Record<string, unknown> | unknown[];

export function getAt(day: Day, path: string): unknown {
  let cur: unknown = day;
  for (const key of path.split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

export function getText(day: Day, path: string): string {
  const v = getAt(day, path);
  return typeof v === 'string' ? v : '';
}

function setIn(obj: Container, keys: string[], value: unknown): Container {
  const [head, ...rest] = keys;
  if (head === undefined) return obj;
  const copy: Container = Array.isArray(obj) ? [...obj] : { ...obj };
  const index = Array.isArray(copy) ? Number(head) : head;
  const current = (copy as Record<string, unknown>)[index as string];
  let next: unknown;
  if (rest.length === 0) next = value;
  else {
    const child: Container =
      current && typeof current === 'object' ? (current as Container) : /^\d+$/.test(rest[0]!) ? [] : {};
    next = setIn(child, rest, value);
  }
  if (Array.isArray(copy)) {
    // Fill holes so the array stays dense (thanks: ["", "b"]).
    const i = index as number;
    for (let k = copy.length; k < i; k++) copy[k] = '';
    copy[i] = next;
  } else if (next === undefined || next === '') {
    delete (copy as Record<string, unknown>)[index as string];
  } else {
    (copy as Record<string, unknown>)[index as string] = next;
  }
  return copy;
}

/** Returns a new day with the value set. Empty strings remove object keys. */
export function setAt(day: Day, path: string, value: unknown): Day {
  return setIn(day as unknown as Container, path.split('.'), value) as unknown as Day;
}
