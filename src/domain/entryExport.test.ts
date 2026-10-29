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

  it('sets a Reflexion with "Was dich bewegt" over its questions and the habits as sub-headings', () => {
    const text = 'Zum Ende der Woche\nEine schwere Woche.\n\nBestandsaufnahme\nDie Lesungen klappen.\n\nGewohnheiten\nPsalm mit den Kindern (täglich)';
    const e = entry({ title: 'Reflexion', text, concerns: [''], ink: undefined, inks: { ground: [{ tool: 'pen', color: 'ink', points: [1, 2, 3] }] } });
    const md = entryToMarkdown(e);
    expect(md).toContain('## Was dich bewegt\n\n### Zum Ende der Woche\n\nEine schwere Woche.\n\n### Bestandsaufnahme\n\nDie Lesungen klappen.');
    expect(md).toContain('### Wo hat der Feind an Boden gewonnen?\n\n![Handschrift]');
    expect(md).toContain('### Gewohnheiten\n\n- Psalm mit den Kindern (täglich)');
    expect(md).not.toContain('## Text');
    const blocks = entryToPrintDoc(e).blocks;
    expect(blocks.filter((b) => b.kind === 'heading').map((b) => (b as { text: string }).text)).toEqual([
      'Zum Ende der Woche',
      'Bestandsaufnahme',
      'Wo hat der Feind an Boden gewonnen?',
      'Gewohnheiten',
    ]);
    expect(blocks.find((b) => b.kind === 'label')).toMatchObject({ text: 'Was dich bewegt' });
    expect(blocks.some((b) => b.kind === 'svg')).toBe(true);
  });
});
