import { describe, expect, it } from 'vitest';
import { eachCurve, hitStroke, inkToSvg, smoothPressure, MIN_PAGE_HEIGHT, normalizeInk, pageHeight, type InkStroke } from './ink';
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
    expect(inkToSvg([line])).toContain('<path d="M100 100Q200 100 300 100"');
    const md = toMarkdown([], [], new Date(2026, 8, 28), [
      { id: 'a', createdAt: 1, updatedAt: 1, verses: [], concerns: [], text: '', ink: [line] },
    ]);
    expect(md).toMatch(/!\[Handschrift\]\(data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+\)/);
  });
});

describe('a stroke as soft curves', () => {
  it('runs from the middle of one piece to the next, from the first point to the last', () => {
    const pieces: number[][] = [];
    eachCurve([0, 0, 50, 10, 0, 50, 20, 10, 50, 30, 0, 50], (...a) => pieces.push(a));
    expect(pieces).toEqual([
      [0, 0, 10, 0, 15, 5, 1],
      [15, 5, 20, 10, 30, 0, 2],
    ]);
  });

  it('calms the pressure from point to point', () => {
    const p = smoothPressure([0, 0, 20, 1, 0, 100, 2, 0, 20]);
    expect(p[0]).toBe(20);
    expect(p[1]).toBeCloseTo(52);
    expect(p[2]).toBeCloseTo(39.2);
  });
});
