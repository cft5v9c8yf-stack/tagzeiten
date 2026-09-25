import { describe, expect, it } from 'vitest';
import { WEEKLY_VERSES } from '../content/weeklyVerses';
import { churchDay } from './churchYear';
import { addDays } from './dates';
import { composeVerse, verseOfDay } from './weeklyVerse';

describe('weekly verse', () => {
  it('composes excerpts into a sentence', () => {
    expect(composeVerse(WEEKLY_VERSES.advent1!)).toBe('Siehe, dein König kommt zu dir, ein Gerechter und ein Helfer.');
    expect(composeVerse(WEEKLY_VERSES.advent4!)).toBe(
      'Freuet euch in dem HERRN allewege! Und abermals sage ich: Freuet euch! Der HERR ist nahe!',
    );
    expect(composeVerse(WEEKLY_VERSES.advent3!)).toBe('Bereitet dem HERRN den Weg, denn siehe, der Herr, HERR kommt gewaltig.');
    expect(composeVerse(WEEKLY_VERSES.easter!)).toMatch(/^Ich war tot/);
    expect(composeVerse(WEEKLY_VERSES.trinity14!)).toBe(
      'Lobe den HERRN, meine Seele, und vergiß nicht, was er dir Gutes getan hat.',
    );
  });

  it('gives the verse of the week', () => {
    expect(verseOfDay('2026-09-25')).toEqual({
      text: 'Jetzt aber offenbart durch die Erscheinung unsers Heilandes Jesu Christi, der dem Tode die Macht hat genommen und das Leben und ein unvergänglich Wesen ans Licht gebracht durch das Evangelium.',
      ref: '2. Timotheus 1,10',
      kind: 'week',
    });
    expect(verseOfDay('2025-11-30')!.ref).toBe('Sacharja 9,9');
  });

  it('gives feasts their own verse', () => {
    expect(verseOfDay('2026-04-03')).toMatchObject({ ref: 'Johannes 3,16', kind: 'feast' });
    expect(verseOfDay('2026-04-02')).toMatchObject({ ref: 'Johannes 3,14.15', kind: 'week' });
  });

  it('has a verse for every week of several church years, except rare late Sundays after Trinity', () => {
    const missing = new Set<string>();
    for (let d = '2024-12-01'; d < '2034-12-01'; d = addDays(d, 1)) {
      if (!verseOfDay(d)) missing.add(churchDay(d).weekKey);
    }
    expect([...missing].every((k) => /^trinity(2[4-9])$/.test(k))).toBe(true);
  });
});
