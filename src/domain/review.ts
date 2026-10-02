/**
 * Evening review of the three things and its carry-over to the next morning.
 * The review asks "what happened?", never "where did I sin?" (rule 3): a mark
 * is a record, not a verdict, and nothing here touches the examination.
 */
import { addDays } from './dates';
import { THREE_KEYS, type Carry, type Day, type EveningEntry, type Mark, type ThreeKey } from './model';

export const MARK_SYMBOL: Record<Mark, string> = { plus: '+', tilde: '~', minus: '–' };
export const MARK_LABEL: Record<Mark, string> = {
  plus: 'geschehen',
  tilde: 'angefangen',
  minus: 'nicht geschehen',
};
export const CARRY_LABEL: Record<Carry, string> = { again: 'Morgen wieder', drop: 'Fallenlassen' };
export const THREE_LABEL: Record<ThreeKey, string> = { word: 'Wort', house: 'Haus', work: 'Werk' };
export const THREE_HINT: Record<ThreeKey, string> = {
  word: 'aus der Lesung',
  house: 'Frau und Kinder',
  work: 'was morgen noch zählt',
};

/** Only things that did not fully happen can be carried or dropped. */
export const canCarry = (mark: Mark | undefined): boolean => mark === 'tilde' || mark === 'minus';

/** Sets (or, when chosen again, clears) the mark. "+" removes any carry decision. */
export function setMark(evening: EveningEntry, key: ThreeKey, mark: Mark): EveningEntry {
  const marks = { ...evening.marks };
  const carry = { ...evening.carry };
  if (marks[key] === mark) delete marks[key];
  else marks[key] = mark;
  if (!canCarry(marks[key])) delete carry[key];
  return { ...evening, marks, carry };
}

/** Sets (or, when chosen again, clears) what happens with an unfinished thing. */
export function setCarry(evening: EveningEntry, key: ThreeKey, value: Carry): EveningEntry {
  if (!canCarry(evening.marks[key])) return evening;
  const carry = { ...evening.carry };
  if (carry[key] === value) delete carry[key];
  else carry[key] = value;
  return { ...evening, carry };
}

export interface Suggestion {
  key: ThreeKey;
  text: string;
  source: 'again' | 'arrow';
}

/**
 * Suggestions for the three things of `today`:
 * - everything marked "Morgen wieder" the evening before, in its own area;
 * - the → (application) from today's reading, for "Wort".
 * Suggestions matching what is already written are left out.
 */
export function suggestionsFor(today: Day, yesterday: Day | undefined): Suggestion[] {
  const out: Suggestion[] = [];
  if (yesterday && yesterday.date === addDays(today.date, -1)) {
    for (const key of THREE_KEYS) {
      const text = yesterday.morning.three[key]?.trim();
      if (text && yesterday.evening.carry[key] === 'again' && canCarry(yesterday.evening.marks[key])) {
        out.push({ key, text, source: 'again' });
      }
    }
  }
  const arrow = today.morning.application?.trim();
  if (arrow) out.push({ key: 'word', text: arrow, source: 'arrow' });
  return out.filter((s) => today.morning.three[s.key]?.trim() !== s.text);
}
