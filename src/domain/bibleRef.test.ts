import { describe, expect, it } from 'vitest';
import { psalmUrl, refUrl } from './bibleRef';

describe('bible links', () => {
  it('builds bibleserver links', () => {
    expect(refUrl('1. Petrus 3,7')).toBe('https://www.bibleserver.com/LUT/1.Petrus3,7');
    expect(refUrl('Epheser 6,5-8')).toBe('https://www.bibleserver.com/LUT/Epheser6,5-8');
    expect(refUrl('1. Petrus 5,8–9a')).toBe('https://www.bibleserver.com/LUT/1.Petrus5,8-9');
    expect(refUrl('Psalm 145,15–16')).toBe('https://www.bibleserver.com/LUT/Psalm145,15-16');
    expect(refUrl('Römer 13,9')).toBe(`https://www.bibleserver.com/LUT/${encodeURIComponent('Römer')}13,9`);
    expect(psalmUrl(63)).toBe('https://www.bibleserver.com/LUT/Psalm63');
  });

  it('falls back to the base url for nonsense', () => {
    expect(refUrl('irgendwas')).toBe('https://www.bibleserver.com/LUT/');
  });
});
