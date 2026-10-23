import { describe, expect, it } from 'vitest';
import { markdownToBlocks, shortDate } from './printDoc';
import { meetingBasename, meetingToMarkdown, meetingToPrintDoc } from './wellExport';
import { newMeeting } from './well';
import { meetingsToMarkdown, meetingsToPrintDoc } from './wellExport';
import { entriesBasename, entriesToMarkdown, entriesToPrintDoc } from './entryExport';
import { newEntry } from './arena';

describe('common print page', () => {
  it('turns the Markdown of the app into blocks, without the front matter', () => {
    const svg = '<svg viewBox="0 0 10 10"><path d="M1 1L5 5" stroke="#1d2330" stroke-width="2"/></svg>';
    const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(svg)));
    const blocks = markdownToBlocks(`---\ntitle: "x"\n---\n\n# Arena\n\n**Titel:** A *leise*\n\n- [x] fertig\n- [ ] offen\n- frei\n\n> Zuspruch\n\n![Handschrift](data:image/svg+xml;base64,${b64})\n`);
    expect(blocks).toEqual([
      { kind: 'heading', level: 1, text: 'Arena', runs: [{ text: 'Arena', bold: true }] },
      { kind: 'para', runs: [{ text: 'Titel:', bold: true }, { text: ' A ' }, { text: 'leise', italic: true }] },
      { kind: 'list', items: [{ runs: [{ text: 'fertig' }], check: true }, { runs: [{ text: 'offen' }], check: false }, { runs: [{ text: 'frei' }] }] },
      { kind: 'quote', runs: [{ text: 'Zuspruch' }] },
      { kind: 'svg', svg },
    ]);
  });

  it('names by JJMMTT', () => expect(shortDate('2026-10-23')).toBe('261023'));
});

describe('meeting export', () => {
  const m = { ...newMeeting('2026-10-26', 'x'), title: 'Ein erster Aufschlag', resolution: 'Mehr zuhören', resolutionDone: true, herWish: 'Zeit', myConcern: 'Geduld' };
  it('writes Markdown and a print page without empty fields', () => {
    const md = meetingToMarkdown(m);
    expect(md).toContain('ort: Treffen am Abendbrunnen');
    expect(md).toContain('Mehr zuhören (umgesetzt)');
    expect(md).not.toContain('Gebetsanliegen von ihr');
    expect(meetingToPrintDoc(m).blocks).toContainEqual({ kind: 'para', runs: [{ text: 'Geduld' }] });
    expect(meetingBasename(m)).toBe('261026_Ein erster Aufschlag');
  });
});

describe('all entries of a place', () => {
  const entry = (at: string, title: string, text: string) => ({ ...newEntry(new Date(`${at}T09:00:00`).getTime(), 'desert', at), title, text });
  const list = [entry('2026-10-22', 'Zweiter', 'B'), entry('2026-10-20', 'Erster', 'A'), newEntry(1, 'desert', 'leer')];

  it('writes one Markdown file, oldest first, without empty entries', () => {
    const md = entriesToMarkdown(list, 'Wüstenwanderung', '2026-10-23');
    expect(md).toContain('eintraege: 2');
    expect(md.indexOf('## Erster')).toBeLessThan(md.indexOf('## Zweiter'));
    expect(md).not.toContain('leer');
  });
  it('builds one print document with a section per entry and names the file by day and place', () => {
    const doc = entriesToPrintDoc(list, 'Wüstenwanderung', '2026-10-23');
    expect(doc.subtitle).toContain('2 Einträge');
    expect(doc.blocks.filter((b) => b.kind === 'entry')).toHaveLength(2);
    expect(entriesBasename('Wüstenwanderung', '2026-10-23')).toBe('261023_Wüstenwanderung');
  });
  it('does the same for the meetings at the Abendbrunnen', () => {
    const a = { ...newMeeting('2026-10-26', 'a'), resolution: 'Zuhören' };
    const b = { ...newMeeting('2026-10-19', 'b'), resolution: 'Beten' };
    const md = meetingsToMarkdown([a, b, newMeeting('2026-10-01', 'c')], '2026-10-23');
    expect(md).toContain('treffen: 2');
    expect(md.indexOf('Beten')).toBeLessThan(md.indexOf('Zuhören'));
    expect(meetingsToPrintDoc([a, b], '2026-10-23').blocks.filter((b) => b.kind === 'entry')).toHaveLength(2);
  });
});

