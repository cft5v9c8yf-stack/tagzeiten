import { describe, expect, it } from 'vitest';
import { entryToMarkdown, entryToPrintDoc, exportFilename } from './entryExport';
import { renderPdf } from './pdfRender';
import { newEntry } from './arena';
import type { ArenaEntry } from './model';

const entry = (over: Partial<ArenaEntry> = {}): ArenaEntry => ({
  ...newEntry(new Date('2026-10-23T09:00:00').getTime()),
  title: 'Für die Kinder',
  verses: ['Römer 8,37', ' '],
  concerns: ['Glaube', ''],
  text: 'Herr, <hilf>.\n\nAmen.',
  ink: [{ tool: 'pen', color: 'ink', points: [10, 10, 50, 20, 20, 50] }],
  ...over,
});

describe('single-entry export', () => {
  it('writes Markdown with front matter, text and the handwriting as an image', () => {
    const md = entryToMarkdown(entry());
    expect(md).toMatch(/^---\ntitle: "Für die Kinder"\ndate: 2026-10-23\nort: Gebetskammer/);
    expect(md).toContain('- Glaube');
    expect(md).toContain('**Bibelstellen:** Römer 8,37');
    expect(md).toContain('![Handschrift](data:image/svg+xml;base64,');
  });

  it('describes the page: place, title, verses, concerns, text and the handwriting as a drawing', () => {
    const doc = entryToPrintDoc(entry(), [{ text: 'Trost', ref: 'Röm 8,37' }]);
    expect(doc.place).toBe('Gebetskammer');
    expect(doc.verses).toBe('Römer 8,37');
    expect(doc.blocks.map((b) => b.kind)).toEqual(['label', 'list', 'para', 'para', 'label', 'svg']);
    expect(doc.blocks[2]).toEqual({ kind: 'para', runs: [{ text: 'Herr, <hilf>.' }] });
  });

  it('draws it as a PDF file on the device', async () => {
    const bytes = await renderPdf(entryToPrintDoc(entry({ text: 'Mit Umlauten äöü ß, „Anführung“ – und 🙏.' }), [{ text: 'Trost', ref: 'Röm 8,37' }]));
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
    expect(bytes.length).toBeGreaterThan(2000);
  });

  it('names files by date as JJMMTT and the title, without forbidden characters', () => {
    expect(exportFilename(entry({ title: 'Wer: ich/du?' }), 'pdf')).toBe('261023_Wer ich du.pdf');
    expect(exportFilename(entry(), 'md')).toBe('261023_Für die Kinder.md');
  });
});
