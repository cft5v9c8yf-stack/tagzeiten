import { REFLECTION_CARDS } from '../content/reflection';

/** The title of the habits in the text of a Reflexion entry. */
export const HABITS_TITLE = 'Gewohnheiten';

/** The text of the entry: each answered question under its title, the habits taken in last (rule 2). */
export function composeReflection(answers: Record<string, string>, taken: readonly string[]): string {
  const parts = REFLECTION_CARDS.filter((c) => answers[c.id]?.trim()).map((c) => `${c.title}\n${answers[c.id]!.trim()}`);
  if (taken.length) parts.push(`${HABITS_TITLE}\n${taken.join('\n')}`);
  return parts.join('\n\n');
}

const titles = [...REFLECTION_CARDS.map((c) => c.title), HABITS_TITLE];
const escape = (t: string) => t.replace(/[?.]/g, '\\$&');
const alternatives = titles.map(escape).join('|');

/** Whether a text was written by composeReflection: it begins with the title of a question. */
export const isReflectionText = (text: string) => new RegExp(`^(?:${alternatives})\\n`).test(text);

/** The way back: the answers and the habits out of the text of an entry written by composeReflection. */
export function parseReflection(text: string): { answers: Record<string, string>; taken: string[] } {
  const answers: Record<string, string> = Object.fromEntries(REFLECTION_CARDS.map((c) => [c.id, '']));
  let taken: string[] = [];
  const marks = [...text.matchAll(new RegExp(`(?:^|\\n\\n)(${alternatives})\\n`, 'g'))];
  marks.forEach((m, i) => {
    const body = text.slice(m.index! + m[0].length, marks[i + 1]?.index ?? text.length);
    if (m[1] === HABITS_TITLE) taken = body.split('\n').filter(Boolean);
    else answers[REFLECTION_CARDS.find((c) => c.title === m[1])!.id] = body;
  });
  return { answers, taken };
}
