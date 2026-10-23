// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { printHtml, printPageHtml } from './printDoc';

describe('printing', () => {
  it('writes the page and opens the print dialog in the same tap, named like the file', () => {
    const seen: { title: string; text: string }[] = [];
    const append = HTMLElement.prototype.appendChild;
    vi.spyOn(document.body, 'appendChild').mockImplementation(function (this: HTMLElement, node) {
      const r = append.call(this, node);
      if (node instanceof HTMLIFrameElement) {
        const win = node.contentWindow!;
        win.print = () => seen.push({ title: win.document.title, text: win.document.body.textContent ?? '' });
      }
      return r;
    });
    printHtml(printPageHtml({ place: 'Gebetskammer', title: 'Für die Kinder', body: '<p>Amen</p>' }), '261023_Für die Kinder');
    vi.restoreAllMocks();
    // Synchronously, before anything has loaded: Safari ignores a later print.
    expect(seen).toHaveLength(1);
    expect(seen[0]!.title).toBe('261023_Für die Kinder');
    expect(seen[0]!.text).toContain('Amen');
  });
});
