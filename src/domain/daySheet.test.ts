import { describe, expect, it } from 'vitest';
import { daySheetDoc } from './daySheet';
import { renderPdf } from './pdfRender';

describe('daySheetDoc', () => {
  it('fills in date and reading and leaves the thoughts to the paper', () => {
    const doc = daySheetDoc('2026-11-13', 'AT 1. Mose 3 · NT Matthäus 2');
    expect(doc.subtitle).toBe('Freitag, 13. November 2026');
    expect(doc.verses).toBe('AT 1. Mose 3 · NT Matthäus 2');
    const labels = doc.blocks.filter((b) => b.kind === 'label').map((b) => (b as { text: string }).text);
    expect(labels).toEqual(['Ein Vers, den ich mitnehme', 'Was ich über Gott lerne', 'Was ich über den Menschen lerne', 'Die drei Dinge', 'Wem ich es weitergegeben habe']);
  });

  it('fits on one page', async () => {
    const bytes = await renderPdf(daySheetDoc('2026-11-13', 'AT 1. Mose 3 · NT Matthäus 2'));
    const { PDFDocument } = await import('pdf-lib');
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
  });
});
