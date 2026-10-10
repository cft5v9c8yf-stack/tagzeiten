import { describe, expect, it } from 'vitest';
import { emptyDay, type Day } from './model';
import { setCarry, setMark, suggestionsFor } from './review';

function yesterdayWith(three: Day['morning']['three'], ev: Partial<Day['evening']>): Day {
  const d = emptyDay('2026-09-24');
  d.morning.three = three;
  d.evening = { ...d.evening, ...ev };
  return d;
}

describe('marks and carry', () => {
  it('sets and clears a mark', () => {
    const ev = emptyDay('2026-09-25').evening;
    const a = setMark(ev, 'word', 'tilde');
    expect(a.marks.word).toBe('tilde');
    expect(setMark(a, 'word', 'tilde').marks.word).toBeUndefined();
  });

  it('offers carry only for ~ and –', () => {
    let ev = setMark(emptyDay('2026-09-25').evening, 'house', 'plus');
    ev = setCarry(ev, 'house', 'again');
    expect(ev.carry.house).toBeUndefined();
    ev = setMark(ev, 'house', 'minus');
    ev = setCarry(ev, 'house', 'again');
    expect(ev.carry.house).toBe('again');
  });

  it('drops the carry decision when the mark turns into +', () => {
    let ev = setMark(emptyDay('2026-09-25').evening, 'work', 'minus');
    ev = setCarry(ev, 'work', 'drop');
    ev = setMark(ev, 'work', 'plus');
    expect(ev.carry.work).toBeUndefined();
  });
});

describe('“Morgen wieder” becomes a suggestion the next day', () => {
  const today = emptyDay('2026-09-25');

  it('suggests what was marked “again”', () => {
    const y = yesterdayWith(
      { word: 'Paul anrufen', house: 'Mit Anna spazieren', work: 'Angebot fertig' },
      { marks: { word: 'minus', house: 'tilde', work: 'plus' }, carry: { word: 'again', house: 'drop' } },
    );
    expect(suggestionsFor(today, y)).toEqual([{ key: 'word', text: 'Paul anrufen', source: 'again' }]);
  });

  it('does not suggest dropped or completed things', () => {
    const y = yesterdayWith({ word: 'a', house: 'b' }, { marks: { word: 'plus', house: 'minus' }, carry: { house: 'drop' } });
    expect(suggestionsFor(today, y)).toEqual([]);
  });

  it('only looks at the day directly before', () => {
    const older = yesterdayWith({ word: 'a' }, { marks: { word: 'minus' }, carry: { word: 'again' } });
    older.date = '2026-09-23';
    expect(suggestionsFor(today, older)).toEqual([]);
  });

  it('adds the → of today’s reading for “Wort”', () => {
    const t = emptyDay('2026-09-25');
    t.morning.application = 'Dem Nachbarn danken';
    expect(suggestionsFor(t, undefined)).toEqual([{ key: 'word', text: 'Dem Nachbarn danken', source: 'arrow' }]);
  });

  it('hides a suggestion once it has been taken over', () => {
    const y = yesterdayWith({ house: 'Vorlesen' }, { marks: { house: 'tilde' }, carry: { house: 'again' } });
    const t = emptyDay('2026-09-25');
    t.morning.three.house = 'Vorlesen';
    expect(suggestionsFor(t, y)).toEqual([]);
  });
});
