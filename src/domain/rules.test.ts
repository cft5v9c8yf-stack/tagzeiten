/**
 * Tests for the permanent rules in CLAUDE.md that can be checked against
 * the data model, the order definitions and the source text.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ORDERS, orderMinutes, ORDER_MINUTES, type Order, type PartKind } from '../content/orders';
import {
  emptyDay,
  EVENING_TEXT_FIELDS,
  MORNING_TEXT_FIELDS,
  THANKS_COUNT,
  THREE_KEYS,
  WREATH_FIELDS,
  type Day,
} from './model';

/* ------------------------------------------------------------ helpers */

/** A day with every field of the schema filled in. */
function fullDay(): Day {
  const d = emptyDay('2026-09-25');
  for (const f of MORNING_TEXT_FIELDS) d.morning[f] = 'x';
  for (const f of WREATH_FIELDS) d.morning.wreath[f] = 'x';
  for (const k of THREE_KEYS) {
    d.morning.three[k] = 'x';
    d.evening.marks[k] = 'minus';
    d.evening.carry[k] = 'again';
  }
  d.morning.questionNo = 0;
  d.morning.steps = { opening: true };
  for (const f of EVENING_TEXT_FIELDS) d.evening[f] = 'x';
  d.evening.thanks = Array.from({ length: THANKS_COUNT }, () => 'x');
  d.reading = { planId: 'p', portions: { at: 0 }, done: true };
  d.habits = { tablePrayer: true };
  return d;
}

/** All object keys, recursively, with their path. */
function keyPaths(o: unknown, prefix = ''): string[] {
  if (!o || typeof o !== 'object') return [];
  return Object.entries(o).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return [path, ...keyPaths(v, path)];
  });
}

const FORBIDDEN_KEY = /confess|beicht|bekenn|s[uü]e?nde|\bsins?\b|guilt|schuld/i;
const partsOf = (o: Order) => o.steps.flatMap((s) => s.parts.map((p) => ({ ...p, step: s.id })));
const indexOf = (o: Order, kind: PartKind) => partsOf(o).findIndex((p) => p.kind === kind);

/* ------------------------------------------------------------ rule 9 */

describe('rule 9: sins are never stored', () => {
  it('the day schema has no field for confessing sins', () => {
    const paths = keyPaths(fullDay());
    const lastSegments = paths.map((p) => p.split('.').at(-1)!);
    expect(lastSegments.filter((k) => FORBIDDEN_KEY.test(k))).toEqual([]);
    for (const list of [MORNING_TEXT_FIELDS, WREATH_FIELDS, EVENING_TEXT_FIELDS, THREE_KEYS]) {
      expect(list.filter((k) => FORBIDDEN_KEY.test(k))).toEqual([]);
    }
  });

  it('the wreath stores instruction, thanks and petition only', () => {
    expect([...WREATH_FIELDS]).toEqual(['instruction', 'thanks', 'petition']);
    const d = emptyDay('2026-09-25');
    // @ts-expect-error – there is no confession field in the wreath
    d.morning.wreath.confession = 'x';
  });

  it('confession and examination offer no input field', () => {
    for (const o of ORDERS) {
      for (const p of partsOf(o)) {
        if (p.kind === 'confession' || p.kind === 'examination') expect(p.fields ?? []).toEqual([]);
      }
    }
  });

  it('every field an order offers exists in the schema', () => {
    const known = new Set(keyPaths(fullDay()));
    for (const o of ORDERS) {
      for (const p of partsOf(o)) {
        for (const f of p.fields ?? []) expect(known.has(f), `${o.id}/${o.form}: ${f}`).toBe(true);
      }
    }
  });
});

/* ------------------------------------------------------------ rule 1 */

describe('rule 1: every examination ends in absolution', () => {
  it('each confession is immediately followed by absolution', () => {
    for (const o of ORDERS) {
      const parts = partsOf(o);
      parts.forEach((p, i) => {
        if (p.kind === 'confession') expect(parts[i + 1]?.kind, `${o.id}/${o.form}`).toBe('absolution');
      });
    }
  });

  it('each examination is followed by confession and absolution', () => {
    for (const o of ORDERS) {
      const parts = partsOf(o);
      parts.forEach((p, i) => {
        if (p.kind === 'examination') {
          expect(parts[i + 1]?.kind).toBe('confession');
          expect(parts[i + 2]?.kind).toBe('absolution');
        }
      });
    }
  });

  it('the morning wreath contains confession and therefore absolution', () => {
    const full = ORDERS.find((o) => o.id === 'morning' && o.form === 'full')!;
    expect(indexOf(full, 'absolution')).toBe(indexOf(full, 'confession') + 1);
  });
});

/* ------------------------------------------------------------ rule 2 */

describe('rule 2: Word first, resolutions last', () => {
  const late: PartKind[] = ['alignment', 'review', 'examination', 'confession'];

  it('no order begins with goals, plans or self-examination', () => {
    for (const o of ORDERS) expect(late).not.toContain(partsOf(o)[0]!.kind);
  });

  it('the morning runs Word → prayer → alignment', () => {
    for (const o of ORDERS.filter((x) => x.id === 'morning')) {
      const word = indexOf(o, 'reading');
      const prayer = indexOf(o, 'free-prayer');
      const alignment = indexOf(o, 'alignment');
      expect(word).toBeGreaterThanOrEqual(0);
      expect(word).toBeLessThan(prayer);
      expect(prayer).toBeLessThan(alignment);
      expect(partsOf(o).findIndex((p) => late.includes(p.kind) && p.kind !== 'confession')).toBe(alignment);
    }
  });

  it('compline puts creed and Lord’s Prayer before the review', () => {
    const o = ORDERS.find((x) => x.id === 'compline' && x.form === 'full')!;
    expect(indexOf(o, 'creed')).toBeLessThan(indexOf(o, 'review'));
    expect(indexOf(o, 'lords-prayer')).toBeLessThan(indexOf(o, 'review'));
  });

  it('the short compline (booklet order) holds no examination at all', () => {
    const o = ORDERS.find((x) => x.id === 'compline' && x.form === 'short')!;
    expect(partsOf(o).map((p) => p.kind)).toEqual(['sign-of-cross', 'review', 'lords-prayer', 'evening-blessing']);
  });
});

/* ------------------------------------------------------------ rule 3 */

describe('rule 3: review is not confession', () => {
  it('review comes before examination, in separate steps', () => {
    const o = ORDERS.find((x) => x.id === 'compline' && x.form === 'full')!;
    const parts = partsOf(o);
    const review = parts.find((p) => p.kind === 'review')!;
    const exam = parts.find((p) => p.kind === 'examination')!;
    expect(indexOf(o, 'review')).toBeLessThan(indexOf(o, 'examination'));
    expect(review.step).not.toBe(exam.step);
  });

  it('the review stores marks and carry only', () => {
    for (const o of ORDERS) {
      for (const p of partsOf(o)) {
        if (p.kind === 'review') expect(p.fields).toEqual(['evening.marks', 'evening.carry']);
      }
    }
  });
});

/* ------------------------------------------------------------ rule 8 */

describe('rule 8: every order has a short form', () => {
  it('there is a full and a short form of each order', () => {
    for (const id of new Set(ORDERS.map((o) => o.id))) {
      expect(ORDERS.filter((o) => o.id === id).map((o) => o.form).sort()).toEqual(['full', 'short']);
    }
  });

  it('the morning takes 45 minutes, its short form 20', () => {
    for (const o of ORDERS.filter((x) => x.id === 'morning')) expect(orderMinutes(o)).toBe(ORDER_MINUTES.morning[o.form]);
  });
});

/* ------------------------------------------------------------ rules 4, 6, 16 */

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return sourceFiles(p);
    return /\.(ts|tsx)$/.test(f) && !/\.test\.tsx?$/.test(f) ? [p] : [];
  });
}

describe('rules 4, 6 and 16: no performance language, no emojis', () => {
  const files = sourceFiles(fileURLToPath(new URL('..', import.meta.url)));
  // Comments may name what is excluded; only code and strings are checked.
  const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  const sources = files.map((f) => ({ f, s: stripComments(readFileSync(f, 'utf8')) }));

  it.each([
    ['streaks', /streak|serie in folge|tage in folge/i],
    ['badges and points', /abzeichen|badge|punkte|\bscore\b|rangliste|leaderboard/i],
    ['backlog', /rückstand|im verzug|nachholen müssen|hinterher/i],
    ['motivational phrases', /du schaffst das|level up|weiter so|super gemacht|fertig!/i],
  ])('no %s', (_name, re) => {
    for (const { f, s } of sources) expect(s.match(re), f).toBeNull();
  });

  it('no emojis', () => {
    const emoji = /\p{Extended_Pictographic}/u;
    for (const { f, s } of sources) expect(s.match(emoji), f).toBeNull();
  });
});
