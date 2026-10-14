import { describe, expect, it } from 'vitest';
import { hitStroke, inkToSvg, MIN_PAGE_HEIGHT, normalizeInk, pageHeight, type InkStroke } from './ink';
import { toMarkdown } from './exportMarkdown';

const line: InkStroke = { tool: 'pen', color: 'ink', points: [100, 100, 50, 300, 100, 50] };

describe('ink', () => {
  it('grows the page below the lowest stroke', () => {
    expect(pageHeight([])).toBe(MIN_PAGE_HEIGHT);
    expect(pageHeight([{ ...line, points: [0, 1500, 50] }])).toBe(1900);
  });

  it('finds the stroke under the eraser, and only that one', () => {
    expect(hitStroke(line, 200, 105, 10)).toBe(true);
    expect(hitStroke(line, 200, 160, 10)).toBe(false);
  });

  it('cuts incomplete triples and keeps no red (rule 5)', () => {
    expect(normalizeInk([{ tool: 'pen', color: 'ink', points: [1, 2, 3, 4] }])).toEqual([{ tool: 'pen', color: 'ink', points: [1, 2, 3] }]);
    expect(normalizeInk([{ tool: 'pen', color: 'red', points: [1, 2, 3] }])).toEqual([]);
  });

  it('goes into the Markdown export as a picture (rule 11)', () => {
    expect(inkToSvg([line])).toContain('<path d="M100 100L300 100"');
    const md = toMarkdown([], [], new Date(2026, 8, 28), [
      { id: 'a', createdAt: 1, updatedAt: 1, verses: [], concerns: [], text: '', ink: [line] },
    ]);
    expect(md).toMatch(/!\[Handschrift\]\(data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+\)/);
  });
});
