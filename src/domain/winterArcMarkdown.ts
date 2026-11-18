/**
 * The Winter Arc in the Markdown export (rule 11): every round with its ticks,
 * weekly standard, monthly point and reviews. Recorded, never counted.
 */
import { WINTER_ARC_COMFORT, WINTER_ARC_FOCUS, WINTER_ARC_REVIEW } from '../content/winterArc';
import { addDays, fromKey, MONTH_LONG, WEEKDAY_SHORT, type DateKey } from './dates';
import {
  dayOf,
  endDateOf,
  focusOf,
  isInRun,
  monthlyDone,
  monthOf,
  totalWeeks,
  weekDates,
  weekOf,
  runName,
  type WinterArcData,
  type WinterArcRun,
  type WinterArcSettings,
} from './winterArc';
import { pointsOf } from './winterArcPoints';
import { desertWeeks, isDesert } from './desert';

const de = (k: DateKey) => fromKey(k).toLocaleDateString('de-DE');
const short = (k: DateKey) =>
  `${WEEKDAY_SHORT[fromKey(k).getDay()]} ${fromKey(k).getDate()}.${fromKey(k).getMonth() + 1}.`;

export function runToMarkdown(run: WinterArcRun, data: WinterArcData, settings: WinterArcSettings): string[] {
  // A Wüstenzeit counts calendar weeks (its ticks stand with the days); a round before it counted from its start.
  const desert = isDesert(run);
  const mondays = desert ? desertWeeks(run) : [];
  const W = desert ? mondays.length : totalWeeks(run.durationDays);
  const datesOf = (w: number) =>
    desert ? Array.from({ length: 7 }, (_, i) => addDays(mondays[w - 1]!, i)) : weekDates(run.startDate, w);
  const out = [
    `## ${runName(run)} · ${de(run.startDate)} bis ${de(endDateOf(run.startDate, run.durationDays))} · ${run.durationDays} Tage · ${run.status === 'active' ? 'läuft' : 'beendet'}`,
    '',
  ];
  // Every tick is written, also of points taken out later (rule 11).
  const points = pointsOf(run, settings);
  const daily = points.filter((p) => p.rhythm === 'daily');
  const weeklyPoints = points.filter((p) => p.rhythm === 'weekly');
  const monthlyPoints = points.filter((p) => p.rhythm === 'monthly');
  // A monthly point stands once, in the first week of its month that is written out.
  const told = new Set<string>();
  for (let w = 1; w <= W; w++) {
    const focus = WINTER_ARC_FOCUS[focusOf(w, W) - 1]!;
    const week = weekOf(data, run.id, w);
    const lines: string[] = [];
    const dates = datesOf(w).filter((x) => isInRun(run, x));
    for (const d of dates) {
      const checks = dayOf(data, run.id, d)?.checks ?? {};
      const done = daily.filter((p) => checks[p.id]).map((p) => p.text);
      if (done.length) lines.push(`- ${short(d)}: ${done.join(', ')}`);
    }
    const weekly = weeklyPoints.filter((p) => week?.weeklyChecks[p.id]).map((p) => p.text);
    const monthly = [...new Set(dates.map(monthOf))]
      .filter((m) => !told.has(m))
      .flatMap((m) => monthlyPoints.filter((p) => monthlyDone(data, run.id, m, p.id)).map((p) => ({ m, p })));
    const review = WINTER_ARC_REVIEW.filter((r) => week?.review[r.key].trim());
    if (!lines.length && !weekly.length && !monthly.length && !review.length) continue;
    monthly.forEach(({ m }) => told.add(m));
    out.push(desert ? `### Woche ${w}` : `### Woche ${w} · ${focus.focus}`, '');
    if (lines.length) out.push(...lines, '');
    if (weekly.length) out.push(`**Wochenstandard:** ${weekly.join(', ')}`, '');
    for (const { m, p } of monthly) out.push(`**${p.text}:** ${MONTH_LONG[Number(m.slice(5)) - 1]}`, '');
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
  return ['', '# Wüstenzeit', '', ...runs.flatMap((r) => runToMarkdown(r, data, settings))];
}
