/**
 * The Winter Arc in the Markdown export (rule 11): every round with its ticks,
 * weekly standard, monthly point and reviews. Recorded, never counted.
 */
import {
  WINTER_ARC_COMFORT,
  WINTER_ARC_FOCUS,
  WINTER_ARC_ITEMS,
  WINTER_ARC_MONTHLY,
  WINTER_ARC_REVIEW,
  WINTER_ARC_WEEKLY,
} from '../content/winterArc';
import { fromKey, MONTH_LONG, WEEKDAY_SHORT, type DateKey } from './dates';
import {
  dayOf,
  endDateOf,
  focusOf,
  isInRun,
  monthsOfWeek,
  servedIn,
  totalWeeks,
  weekDates,
  weekOf,
  type WinterArcData,
  type WinterArcRun,
  type WinterArcSettings,
} from './winterArc';

const de = (k: DateKey) => fromKey(k).toLocaleDateString('de-DE');
const short = (k: DateKey) =>
  `${WEEKDAY_SHORT[fromKey(k).getDay()]} ${fromKey(k).getDate()}.${fromKey(k).getMonth() + 1}.`;

export function runToMarkdown(run: WinterArcRun, data: WinterArcData, settings: WinterArcSettings): string[] {
  const W = totalWeeks(run.durationDays);
  const out = [
    `## Runde vom ${de(run.startDate)} bis ${de(endDateOf(run.startDate, run.durationDays))} · ${run.durationDays} Tage · ${run.status === 'active' ? 'läuft' : 'beendet'}`,
    '',
  ];
  // The monthly point stands once, in the first week of its month that is written out.
  const told = new Set<string>();
  for (let w = 1; w <= W; w++) {
    const focus = WINTER_ARC_FOCUS[focusOf(w, W) - 1]!;
    const week = weekOf(data, run.id, w);
    const lines: string[] = [];
    for (const d of weekDates(run.startDate, w).filter((x) => isInRun(run, x))) {
      const checks = dayOf(data, run.id, d)?.checks ?? {};
      const done = WINTER_ARC_ITEMS.filter((it) => checks[it.id]).map((it) => it.text(settings.times));
      if (done.length) lines.push(`- ${short(d)}: ${done.join(', ')}`);
    }
    const weekly = WINTER_ARC_WEEKLY.filter((it) => week?.weeklyChecks[it.id]).map((it) => it.text);
    const served = monthsOfWeek(run, w).filter((m) => servedIn(data, run.id, m) && !told.has(m));
    const review = WINTER_ARC_REVIEW.filter((r) => week?.review[r.key].trim());
    if (!lines.length && !weekly.length && !served.length && !review.length) continue;
    served.forEach((m) => told.add(m));
    out.push(`### Woche ${w} · ${focus.focus}`, '');
    if (lines.length) out.push(...lines, '');
    if (weekly.length) out.push(`**Wochenstandard:** ${weekly.join(', ')}`, '');
    for (const m of served) out.push(`**${WINTER_ARC_MONTHLY}:** ${MONTH_LONG[Number(m.slice(5)) - 1]}`, '');
    if (review.length) {
      for (const r of review) out.push(`**${r.label}:** ${week!.review[r.key].trim().replace(/\s*\n\s*/g, ' ')}`);
      out.push('', `> ${WINTER_ARC_COMFORT.verse.text} (${WINTER_ARC_COMFORT.verse.ref})`, '');
    }
  }
  return out;
}

export function winterArcToMarkdown(data: WinterArcData, settings: WinterArcSettings): string[] {
  if (!data.runs.length) return [];
  const runs = [...data.runs].sort((a, b) => a.createdAt - b.createdAt);
  return ['', '# Winter Arc (Streithalle)', '', ...runs.flatMap((r) => runToMarkdown(r, data, settings))];
}
