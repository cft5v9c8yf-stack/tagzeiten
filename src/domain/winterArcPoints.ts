/**
 * The standard of a round (since 0.38): its own points, begun from the plan of
 * the Winter Arc, from the round before, or from nothing.
 */
import { WINTER_ARC_ITEMS, WINTER_ARC_MONTHLY, WINTER_ARC_WEEKLY } from '../content/winterArc';
import {
  defaultWinterArcSettings,
  isOn,
  normalizePoints,
  type WinterArcData,
  type WinterArcPoint,
  type WinterArcPointId,
  type WinterArcRun,
  type WinterArcSettings,
} from './winterArc';

/**
 * The plan's points with the weekdays, times and switches of the settings: the
 * template for a new round (with the plan's defaults), and the standard of a
 * round from before 0.38 (with the settings as they were).
 */
export function planPoints(settings: WinterArcSettings = defaultWinterArcSettings()): WinterArcPoint[] {
  const removed = (id: WinterArcPointId) => (isOn(settings, id) ? {} : { removed: true as const });
  return normalizePoints([
    ...WINTER_ARC_ITEMS.map((it) => ({
      id: it.id,
      text: it.text(settings.times),
      rhythm: 'daily',
      block: it.block,
      weekdays: settings.weekdays[it.id],
      offMark: it.off === '–' ? undefined : it.off,
      needs: it.needs,
      ...removed(it.id),
    })),
    ...WINTER_ARC_WEEKLY.map((it) => ({ id: it.id, text: it.text, rhythm: 'weekly', needs: it.needs, ...removed(it.id) })),
    { id: 'serve', text: WINTER_ARC_MONTHLY, rhythm: 'monthly', ...removed('serve') },
  ]);
}

/** The standard of a round: its own points, or for a round from before 0.38 the plan as it was set. */
export const pointsOf = (run: WinterArcRun, settings: WinterArcSettings): WinterArcPoint[] =>
  run.points ?? planPoints(settings);

/** The round begun last, under way or ended. */
export function lastRun(data: WinterArcData): WinterArcRun | undefined {
  return [...data.runs].sort((a, b) => b.createdAt - a.createdAt)[0];
}

/** What a new round begins with: the standard of the round before, the plan, or nothing. */
export type StandardStart = 'last' | 'plan' | 'empty';

export function startPoints(start: StandardStart, data: WinterArcData, settings: WinterArcSettings): WinterArcPoint[] {
  const last = lastRun(data);
  if (start === 'empty') return [];
  if (start === 'last' && last) return pointsOf(last, settings).filter((p) => !p.removed);
  return planPoints();
}

/** The plan's points a round does not hold, or holds taken out (then in its own words), to take up again. */
export function planSuggestions(points: readonly WinterArcPoint[]): WinterArcPoint[] {
  const held = new Map(points.map((p) => [p.id, p]));
  return planPoints()
    .map((p) => held.get(p.id) ?? p)
    .filter((p) => !held.has(p.id) || p.removed);
}
