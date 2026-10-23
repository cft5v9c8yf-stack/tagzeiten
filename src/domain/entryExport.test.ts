import { describe, expect, it } from 'vitest';
import { entryToMarkdown, entryToPrintHtml, exportFilename } from './entryExport';
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

  it('builds a print page that escapes text and carries the handwriting as SVG', () => {
    const html = entryToPrintHtml(entry());
    expect(html).toContain('Herr, &lt;hilf&gt;.');
    expect(html).toContain('<svg');
    expect(html).toContain('Gebetskammer');
  });

  it('names files by date as JJMMTT and the title, without forbidden characters', () => {
    expect(exportFilename(entry({ title: 'Wer: ich/du?' }), 'pdf')).toBe('261023_Wer ich du.pdf');
    expect(exportFilename(entry(), 'md')).toBe('261023_Für die Kinder.md');
  });
});
