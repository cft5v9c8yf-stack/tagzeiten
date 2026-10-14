import { describe, expect, it } from 'vitest';
import { houseBlessing, houseForAll } from '../content/house';
import {
  answerConcern,
  emptyHouse,
  focusName,
  focusOf,
  joinNames,
  normalizeAnswered,
  normalizeHouse,
  type House,
  type HouseChild,
} from './house';
import { defaultProfile, normalizeProfile } from './profile';

const child = (name: string, sex?: 'son' | 'daughter', concern = ''): HouseChild => ({ id: name, name, concern, sex });
const house = (wife: string, children: HouseChild[]): House => ({ wife: { name: wife, concern: '' }, children });

// Monday 28 September to Sunday 4 October 2026.
const WEEK = ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'];

describe('Mein Haus', () => {
  it('starts with a wife and four empty fields for children', () => {
    const h = defaultProfile('2026-09-29').house;
    expect(h.wife).toEqual({ name: '', concern: '' });
    expect(h.children).toHaveLength(4);
    expect(normalizeProfile({}, '2026-09-29').house.children).toHaveLength(4);
  });

  it('keeps the order of the children and drops an unknown choice of son or daughter', () => {
    const h = normalizeHouse({ wife: { name: 'Anna' }, children: [{ id: 'b', name: 'Paul', sex: 'x' }, { id: 'a', name: 'Marie', sex: 'daughter' }] });
    expect(h.children.map((c) => [c.name, c.sex])).toEqual([
      ['Paul', undefined],
      ['Marie', 'daughter'],
    ]);
    expect(h.wife.concern).toBe('');
  });

  it('puts the wife, each child, the marriage and the house in the centre through the week', () => {
    const h = house('Anna', [child('Paul', 'son'), child('Marie', 'daughter')]);
    expect(WEEK.map((d) => focusName(focusOf(h, d)))).toEqual([
      'Anna',
      'Paul',
      'Marie',
      'Paul',
      'Marie',
      'unsere Ehe',
      'das ganze Haus',
    ]);
  });

  it('keeps four children on their fixed day, and lets three run on across the weeks', () => {
    const four = house('Anna', ['A', 'B', 'C', 'D'].map((n) => child(n, 'son')));
    const days = (h: House, week: number) =>
      WEEK.slice(1, 5).map((d) => {
        const date = new Date(`${d}T12:00:00`);
        date.setDate(date.getDate() + 7 * week);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return focusName(focusOf(h, key));
      });
    expect(days(four, 0)).toEqual(['A', 'B', 'C', 'D']);
    expect(days(four, 1)).toEqual(['A', 'B', 'C', 'D']);
    const three = house('Anna', ['A', 'B', 'C'].map((n) => child(n, 'son')));
    const w0 = days(three, 0);
    const w1 = days(three, 1);
    // Four days, three children: the order runs on where the last week stopped.
    expect(w1[0]).toBe(three.children[(three.children.findIndex((c) => c.name === w0[3]) + 1) % 3]!.name);
    expect(new Set([...w0, ...w1]).size).toBe(3);
  });

  it('gives days without the fitting person to the whole house', () => {
    const onlyChildren = house('', [child('Paul', 'son')]);
    expect(focusOf(onlyChildren, WEEK[0]!).kind).toBe('house');
    expect(focusOf(onlyChildren, WEEK[5]!).kind).toBe('house');
    const onlyWife = house('Anna', []);
    expect(WEEK.slice(1, 5).map((d) => focusOf(onlyWife, d).kind)).toEqual(['house', 'house', 'house', 'house']);
    expect(focusOf(onlyWife, WEEK[5]!).kind).toBe('marriage');
  });

  it('names everyone in the prayer for all, leaving out what is missing', () => {
    const full = houseForAll(house('Anna', [child('Paul', 'son'), child('Marie', 'daughter'), child('Jonas', 'son')])).lines;
    expect(full[0]).toBe(
      'Herr, ich befehle dir meine liebe Frau Anna. Du hast sie mir gegeben. Lass mich sie heute lieben, wie Christus die Gemeinde geliebt hat, stärke sie in ihrem Tagewerk und behüte sie vor allem Übel.',
    );
    expect(full[2]).toBe(
      'Ich bringe dir Paul, Marie und Jonas. Du hast sie in der Taufe zu deinen Kindern gemacht; erhalte sie darin bis ans Ende. Und mir gib, dass ich sie nicht zum Zorn reize, sondern aufziehe in der Zucht und Vermahnung zum Herrn. Amen.',
    );
    expect(houseForAll(house('Anna', [])).lines).toEqual([expect.stringMatching(/vor allem Übel\. Amen\.$/)]);
    expect(houseForAll(house('', [child('Paul', 'son')])).lines[0]).toMatch(/^Herr, ich bringe dir Paul\. Du hast ihn in der Taufe zu deinem Kind gemacht/);
    expect(joinNames(['A', 'B'])).toBe('A und B');
  });

  it('blesses the house at night with the people there are', () => {
    expect(houseBlessing(house('Anna', [child('Paul', 'son')])).lines[0]).toBe(
      'Behüte, Herr, meine Frau und meine Kinder in dieser Nacht. Was ich heute an ihnen versäumt habe, das decke du zu. Amen.',
    );
    expect(houseBlessing(house('Anna', [])).lines[0]).toMatch(/^Behüte, Herr, meine Frau in dieser Nacht\. Was ich heute an ihr/);
  });

  it('keeps an answered concern with date and person, and empties the field', () => {
    const h = house('Anna', [child('Marie', 'daughter', 'Freundin in der neuen Klasse')]);
    const r = answerConcern(h, [], 'Marie', '2026-09-29', 'x1');
    expect(r.answered).toEqual([
      { id: 'x1', date: '2026-09-29', person: 'Marie', role: 'daughter', concern: 'Freundin in der neuen Klasse' },
    ]);
    expect(r.house.children[0]!.concern).toBe('');
    // Nothing to keep without a concern.
    expect(answerConcern(emptyHouse(), [], 'wife', '2026-09-29').answered).toEqual([]);
    expect(normalizeAnswered([{ id: 'a', date: 'gestern', person: 'X', role: 'wife', concern: 'y' }])).toEqual([]);
  });
});
