/**
 * Every rule in the style sheets is closed: one brace left open (e.g. after a merge)
 * silently drops all the styles that come after it.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const dir = fileURLToPath(new URL('.', import.meta.url));
const sheets = readdirSync(dir).filter((f) => f.endsWith('.css'));

describe('style sheets', () => {
  it.each(sheets)('%s has every brace closed', (file) => {
    const css = readFileSync(join(dir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    let depth = 0;
    for (const ch of css) {
      if (ch === '{') depth++;
      if (ch === '}') depth--;
      expect(depth).toBeGreaterThanOrEqual(0);
    }
    expect(depth).toBe(0);
  });
});
