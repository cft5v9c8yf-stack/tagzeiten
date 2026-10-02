import { describe, expect, it } from 'vitest';
import { addDays } from './dates';
import { churchDay, easter, firstAdvent, isPassiontide } from './churchYear';

describe('anchors', () => {
  it('computes Easter', () => {
    expect(easter(2008)).toBe('2008-03-23');
    expect(easter(2024)).toBe('2024-03-31');
    expect(easter(2025)).toBe('2025-04-20');
    expect(easter(2026)).toBe('2026-04-05');
    expect(easter(2027)).toBe('2027-03-28');
    expect(easter(2038)).toBe('2038-04-25');
    expect(easter(2285)).toBe('2285-03-22');
  });

  it('computes the first Sunday of Advent', () => {
    expect(firstAdvent(2025)).toBe('2025-11-30');
    expect(firstAdvent(2026)).toBe('2026-11-29');
    expect(firstAdvent(2022)).toBe('2022-11-27'); // Christmas Eve on a Saturday
    expect(firstAdvent(2023)).toBe('2023-12-03'); // 4th Advent = Christmas Eve
  });
});

describe('weeks of the church year', () => {
  const week = (d: string) => churchDay(d).week;

  it('names the week after the last Sunday', () => {
    expect(week('2026-09-20')).toBe('16. Sonntag nach Trinitatis');
    expect(week('2026-09-25')).toBe('16. Sonntag nach Trinitatis');
    expect(churchDay('2026-09-25').weekNumber).toBe(43);
    expect(churchDay('2025-11-30').weekNumber).toBe(1);
  });

  it('runs through Advent and Christmas', () => {
    expect(week('2025-11-30')).toBe('1. Sonntag im Advent');
    expect(week('2025-12-21')).toBe('4. Sonntag im Advent');
    expect(week('2025-12-24')).toBe('4. Sonntag im Advent');
    expect(week('2025-12-25')).toBe('Christfest');
    expect(week('2025-12-28')).toBe('1. Sonntag nach dem Christfest');
    expect(week('2026-01-04')).toBe('2. Sonntag nach dem Christfest');
    expect(week('2026-01-06')).toBe('Epiphanias');
    expect(week('2026-01-11')).toBe('1. Sonntag nach Epiphanias');
  });

  it('places the last Sunday after Epiphany before Septuagesimae', () => {
    // Easter 2026-04-05 → Septuagesimae 2026-02-01
    expect(week('2026-01-25')).toBe('Letzter Sonntag nach Epiphanias');
    expect(week('2026-01-18')).toBe('2. Sonntag nach Epiphanias');
    expect(week('2026-02-01')).toBe('Septuagesimae');
  });

  it('runs through Lent, Easter and Pentecost', () => {
    expect(week('2026-02-22')).toBe('Invokavit');
    expect(week('2026-03-15')).toBe('Lätare');
    expect(week('2026-03-29')).toBe('Palmsonntag (Palmarum)');
    expect(week('2026-04-05')).toBe('Ostersonntag');
    expect(week('2026-04-12')).toBe('Quasimodogeniti');
    expect(week('2026-04-19')).toBe('Miserikordias Domini');
    expect(week('2026-05-17')).toBe('Exaudi');
    expect(week('2026-05-24')).toBe('Pfingstsonntag');
    expect(week('2026-05-31')).toBe('Trinitatis');
    expect(week('2026-06-07')).toBe('1. Sonntag nach Trinitatis');
  });

  it('ends with the last three Sundays of the church year', () => {
    expect(week('2026-11-08')).toBe('Drittletzter Sonntag des Kirchenjahres');
    expect(week('2026-11-15')).toBe('Vorletzter Sonntag des Kirchenjahres');
    expect(week('2026-11-22')).toBe('Letzter Sonntag des Kirchenjahres (Ewigkeitssonntag)');
    expect(week('2026-11-01')).toBe('22. Sonntag nach Trinitatis');
    expect(week('2026-11-29')).toBe('1. Sonntag im Advent');
  });

  it('gives every day of several years a name and counts weeks without gaps', () => {
    for (let d = '2024-12-01'; d < '2030-12-01'; d = addDays(d, 1)) {
      const c = churchDay(d);
      expect(c.week).not.toBe('');
      expect(c.weekNumber).toBeGreaterThanOrEqual(1);
      expect(c.weekNumber).toBeLessThanOrEqual(53);
      const next = churchDay(addDays(d, 1));
      if (next.churchYear === c.churchYear) expect(next.weekNumber - c.weekNumber).toBeLessThanOrEqual(1);
      else expect(next.weekNumber).toBe(1);
    }
  });
});

describe('feasts', () => {
  it('knows fixed and movable feasts', () => {
    expect(churchDay('2026-09-29').feast).toMatch(/Michaelis/);
    expect(churchDay('2026-10-31').feast).toBe('Gedenktag der Reformation');
    expect(churchDay('2026-02-18').feast).toBe('Aschermittwoch');
    expect(churchDay('2026-04-03').feast).toBe('Karfreitag');
    expect(churchDay('2026-05-14').feast).toBe('Christi Himmelfahrt');
    expect(churchDay('2026-11-18').feast).toBe('Buß- und Bettag');
    expect(churchDay('2026-10-04').feast).toBe('Erntedankfest');
    expect(churchDay('2026-09-25').feast).toBeUndefined();
  });
});

describe('festal circles and seasons', () => {
  const at = (d: string) => [churchDay(d).circle, churchDay(d).season];

  it('divides the year into the circles of Father, Son and Holy Spirit, after Dieffenbach', () => {
    // Christmas circle: 1st Advent to the Saturday after Epiphany.
    expect(at('2025-12-01')).toEqual(['christmas', 'advent']);
    expect(at('2025-12-24')).toEqual(['christmas', 'advent']);
    expect(at('2025-12-25')).toEqual(['christmas', 'christmastide']); // Thursday
    expect(at('2025-12-27')).toEqual(['christmas', 'christmastide']); // the following Saturday
    expect(at('2025-12-28')).toEqual(['christmas', 'presentation']); // Sunday after Christmas
    expect(at('2026-01-06')).toEqual(['christmas', 'presentation']);
    expect(at('2026-01-10')).toEqual(['christmas', 'presentation']); // Saturday after Epiphany
    // Easter circle: 1st Sunday after Epiphany to Ascension.
    expect(at('2026-01-11')).toEqual(['easter', 'epiphany']);
    expect(at('2026-02-01')).toEqual(['easter', 'epiphany']); // Septuagesimae
    expect(at('2026-02-17')).toEqual(['easter', 'epiphany']); // Fastnacht
    expect(at('2026-02-18')).toEqual(['easter', 'lent']); // Ash Wednesday
    expect(at('2026-04-04')).toEqual(['easter', 'lent']); // Holy Saturday
    expect(at('2026-04-05')).toEqual(['easter', 'eastertide']);
    expect(at('2026-05-14')).toEqual(['easter', 'eastertide']); // Ascension
    // Pentecost circle: from the Friday before Exaudi.
    expect(at('2026-05-15')).toEqual(['pentecost', 'waiting']);
    expect(at('2026-05-23')).toEqual(['pentecost', 'waiting']);
    expect(at('2026-05-24')).toEqual(['pentecost', 'pentecost']);
    expect(at('2026-05-31')).toEqual(['pentecost', 'trinity']);
    expect(at('2026-11-10')).toEqual(['pentecost', 'trinity']);
    expect(at('2026-11-29')).toEqual(['christmas', 'advent']);
  });

  it('marks the Passiontide for the Halleluja', () => {
    expect(isPassiontide('2026-02-17')).toBe(false);
    expect(isPassiontide('2026-02-18')).toBe(true);
    expect(isPassiontide('2026-04-04')).toBe(true);
    expect(isPassiontide('2026-04-05')).toBe(false);
  });
});
