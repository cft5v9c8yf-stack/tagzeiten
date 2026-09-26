import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CHANGELOG } from './changelog';

describe('changelog', () => {
  it('starts with the version in package.json', () => {
    const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string };
    expect(CHANGELOG[0]!.version).toBe(pkg.version);
  });

  it('lists every version once, newest first', () => {
    const versions = CHANGELOG.map((r) => r.version);
    expect(new Set(versions).size).toBe(versions.length);
    const n = (v: string) => v.split('.').map(Number).reduce((a, b) => a * 1000 + b, 0);
    expect(versions.map(n)).toEqual([...versions.map(n)].sort((a, b) => b - a));
    for (const r of CHANGELOG) expect(r.changes.length).toBeGreaterThan(0);
  });
});
