import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DEFAULT_TIMES } from '../domain/winterArc';
import * as W from './winterArc';

// The plan as the reference has it, without the bold marks of the markdown.
const md = readFileSync(fileURLToPath(new URL('../../reference/winter-arc.md', import.meta.url)), 'utf8').replace(
  /\*\*/g,
  '',
);
const quoted = (v: W.WinterArcVerse) => `„${v.text}“ (${v.ref})`;

describe('Winter Arc texts are word for word the plan', () => {
  const texts: string[] = [
    `# ${W.WINTER_ARC_TITLE}`,
    W.WINTER_ARC_LEAD,
    ...W.WINTER_ARC_ABOUT.paragraphs,
    ...W.WINTER_ARC_ABOUT.phases.map((r) => `| ${r.weeks} | ${r.phase} | ${r.question} |`),
    quoted(W.WINTER_ARC_ABOUT.verse),
    W.WINTER_ARC_RULES.lead,
    ...W.WINTER_ARC_RULES.rules.map((r, i) => `${i + 1}. ${r.title} ${r.text}`),
    W.WINTER_ARC_RULES.after,
    quoted(W.WINTER_ARC_RULES.verse),
    W.WINTER_ARC_DAY.lead,
    ...W.WINTER_ARC_DAY.schedule.map((r) => `| ${r.time} | ${r.block} | ${r.what} |`),
    W.WINTER_ARC_DAY.note,
    ...W.WINTER_ARC_DAY.blocks.flatMap((b) => [
      `### ${b.title}`,
      b.lead,
      ...b.items.map((it) => `- ${it.title} ${it.text}`),
      b.after,
      quoted(b.verse),
    ]),
    W.WINTER_ARC_WEEK.lead,
    ...W.WINTER_ARC_WEEK.rows.map((r) => `| ${r.when} | ${r.what} | ${r.how} |`),
    quoted(W.WINTER_ARC_WEEK.verse),
    W.WINTER_ARC_PHASES.lead,
    ...W.WINTER_ARC_PHASES.phases.map((p) => `${p.name} (${p.weeks}): ${p.question} ${p.text}`),
    ...W.WINTER_ARC_FOCUS.map((f) => `| ${f.week} | ${f.focus} | ${f.task} | ${quoted(f.verse)} |`),
    quoted(W.WINTER_ARC_PHASES.verse),
    W.WINTER_ARC_TRACKER_NOTE,
    ...W.WINTER_ARC_ITEMS.map((it) => `| ${it.text(DEFAULT_TIMES)} |`),
    ...W.WINTER_ARC_WEEKLY.map((it) => `- ${it.text}`),
    `- ${W.WINTER_ARC_MONTHLY}`,
    ...W.WINTER_ARC_REVIEW.map((r) => `- ${r.label}:`),
    `${W.WINTER_ARC_COMFORT.lead} ${quoted(W.WINTER_ARC_COMFORT.verse)}`,
    `## ${W.WINTER_ARC_END.title}`,
    ...W.WINTER_ARC_END.paragraphs,
    quoted(W.WINTER_ARC_END.verse),
  ];

  it.each(texts.map((t) => [t.slice(0, 60), t]))('%s', (_short, t) => {
    expect(md.includes(t), t).toBe(true);
  });

  it('has thirteen weeks and the three blocks', () => {
    expect(W.WINTER_ARC_FOCUS.map((f) => f.week)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    expect(W.WINTER_ARC_DAY.blocks).toHaveLength(3);
  });
});
