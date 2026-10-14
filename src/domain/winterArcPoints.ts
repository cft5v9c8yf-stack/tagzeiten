/**
 * The points of a round of the Streithalle (0.38): its own list, or for a round
 * from before the plan with the settings of then. Kept to read and export
 * those rounds, and to carry a round still under way into the Wüstenzeit (0.39).
 */
import { WINTER_ARC_ITEMS, WINTER_ARC_MONTHLY, WINTER_ARC_WEEKLY } from '../content/winterArc';
import {
  defaultWinterArcSettings,
  isOn,
  normalizePoints,
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

/**
 * The standard of a round: its own points, or for a round from before 0.38 the
 * plan as it was set. A Wüstenzeit has none: its habits are the profile's.
 */
export const pointsOf = (run: WinterArcRun, settings: WinterArcSettings): WinterArcPoint[] =>
  run.points ?? (run.habits ? [] : planPoints(settings));
