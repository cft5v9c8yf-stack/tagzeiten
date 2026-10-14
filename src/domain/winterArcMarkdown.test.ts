import { describe, expect, it } from 'vitest';
import {
  defaultWinterArcSettings,
  emptyWinterArc,
  setReview,
  startRun,
  toggleCheck,
  toggleMonthly,
  toggleWeekly,
} from './winterArc';
import { winterArcToMarkdown } from './winterArcMarkdown';

describe('Winter Arc in the Markdown export', () => {
  it('writes every round with its ticks and reviews, and counts nothing', () => {
    let d = startRun(emptyWinterArc(), '2026-10-05', 90, 1, 'a');
    d = toggleCheck(d, 'a', '2026-10-05', 'wake', 2);
    d = toggleCheck(d, 'a', '2026-10-05', 'word', 2);
    d = toggleWeekly(d, 'a', 1, 'church', 2);
    d = toggleMonthly(d, 'a', '2026-10', 'serve', 2);
    d = setReview(d, 'a', 1, 'win', 'Jeden Morgen\num vier auf', 2);
    const md = winterArcToMarkdown(d, defaultWinterArcSettings()).join('\n');
    expect(md).toContain('# Wüstenzeit');
    expect(md).toContain('## Wüstenzeit · 5.10.2026 bis 2.1.2027 · 90 Tage · läuft');
    expect(md).toContain('### Woche 1 · Einfach da sein');
    expect(md).toContain('- Mo 5.10.: 04:00 auf, kein Handy, Morgenzeit im Wort und Gebet');
    expect(md).toContain('**Wochenstandard:** Gottesdienst und Sonntagsruhe');
    expect(md).toContain('**Gedient (einmal im Monat):** Oktober');
    expect(md).toContain('**Ein Sieg dieser Woche:** Jeden Morgen um vier auf');
    expect(md).toContain('> Die Güte des HERRN ist’s');
    // Weeks without anything are left out; nothing is summed up.
    expect(md).not.toContain('Woche 2');
    expect(md).not.toMatch(/%|von \d+ (Tagen|Haken)|in Folge/);
    expect(winterArcToMarkdown(emptyWinterArc(), defaultWinterArcSettings())).toEqual([]);
  });
});
