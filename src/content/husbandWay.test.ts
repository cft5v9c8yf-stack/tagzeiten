import { describe, expect, it } from 'vitest';
import { HUSBAND_PACK } from './desert';
import { WAY_DAYS, WAY_DAYS_TEXT, WAY_HABITS, WAY_HABITS_LEAD, WAY_INTRO, WAY_WEEKS } from './husbandWay';

describe('28 Tage für Ehemänner', () => {
  it('has four weeks of seven days, each day with every part', () => {
    expect(WAY_WEEKS.map((w) => w.wegstueck)).toEqual(['Auszug', 'Manna', 'Sinai', 'Jordan']);
    expect(WAY_DAYS_TEXT).toHaveLength(WAY_DAYS);
    WAY_DAYS_TEXT.forEach((d, i) => {
      expect(d.tag).toBe(i + 1);
      expect(d.woche).toBe(Math.ceil((i + 1) / 7));
      for (const k of ['titel', 'thema', 'gedanke', 'schritt', 'frage', 'gebet'] as const) expect(d[k].trim(), `${d.tag} ${k}`).not.toBe('');
      expect(d.schriftwort.length).toBeGreaterThan(0);
      expect(d.schriftwort.every((r) => r && !r.includes('·'))).toBe(true);
      expect(d.gebet.endsWith('Amen.')).toBe(true);
    });
  });

  it('keeps the words as given (five days, checked by hand against the text)', () => {
    const day = (n: number) => WAY_DAYS_TEXT[n - 1]!;
    expect(day(1)).toMatchObject({
      titel: 'Raus aus der Trägheit',
      thema: 'Nicht mehr danebenstehen',
      schriftwort: ['1. Mo 3,6', 'Röm 6,3–4'],
      frage: 'Wo schaue ich in unserer Ehe nur zu?',
      gebet: 'Herr Jesus, Du bist für mich eingetreten. Weck mich auf. Amen.',
    });
    expect(day(8).schriftwort).toEqual(['4. Mo 13,30–14,9', 'Mt 5,23–24']);
    expect(day(8).schritt).toBe('Sprich das Thema heute an. Bete vorher. Bleib ruhig. Ihr müsst es heute nicht lösen.');
    expect(day(13).schriftwort).toEqual(['Mt 5,37', 'Eph 4,15.29']);
    expect(day(13).gedanke).toBe(
      'Gott redet klar mit uns. Wir Männer oft nicht. Wir deuten an, schweigen beleidigt oder erwarten, dass sie unsere Gedanken errät. Das ist nicht fair. Das achte Gebot gilt auch zu Hause: ehrlich reden und vom anderen das Beste denken.',
    );
    expect(day(21)).toMatchObject({
      titel: 'Die erlassene Schuld',
      thema: 'Vergeben und loslassen',
      frage: 'Welche alte Geschichte hole ich im Streit immer wieder hervor?',
      gebet: 'Vater, vergib mir meine Schuld, wie auch ich meiner Frau vergebe. Amen.',
    });
    expect(day(27).gebet).toBe('Heiliger Geist, tu in mir, was ich allein nicht schaffe. Amen.');
    expect(day(27).schriftwort).toEqual(['Gal 5,22–24', 'Tit 2,11–12', '1. Kor 9,25–27']);
  });

  it('keeps the capitals of the pronouns for God', () => {
    expect(WAY_DAYS_TEXT[1]!.gedanke).toContain('Jesus sagt von Sich: Ich bin nicht gekommen, um Mich bedienen zu lassen.');
    expect(WAY_DAYS_TEXT[23]!.gedanke).toContain('mit Sich selbst bekleidet');
    expect(JSON.stringify(WAY_INTRO)).toContain('Sein Volk prüft');
  });

  it('has the table of the weeks in the introduction', () => {
    const table = WAY_INTRO.find((b) => 'table' in b);
    expect(table && 'table' in table && table.table.rows.map((r) => r[1])).toEqual(['Auszug', 'Manna', 'Sinai', 'Jordan']);
  });

  it('has the habits as in the table: five core ones, five to choose, three weekly', () => {
    expect(WAY_HABITS_LEAD).toHaveLength(2);
    expect(WAY_HABITS.filter((h) => h.art === 'kern')).toHaveLength(5);
    expect(WAY_HABITS.filter((h) => h.art === 'wahl')).toHaveLength(5);
    expect(WAY_HABITS.filter((h) => h.rhythmus === 'wöchentlich').map((h) => h.art)).toEqual(['fest', 'fest', 'fest']);
    expect(HUSBAND_PACK.habits.map((h) => h.name)).toEqual(WAY_HABITS.map((h) => h.name));
    expect(HUSBAND_PACK.habits.every((h) => h.needs === 'wife')).toBe(true);
    expect(HUSBAND_PACK.habits.filter((h) => h.rhythm === 'weekly')).toHaveLength(3);
  });
});
