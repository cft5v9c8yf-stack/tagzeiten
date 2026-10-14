/**
 * Which icon names a step in the row of marks above an order (ui/StepFlow):
 * bed, open hands, the Bible, folded hands … – what happens in that step.
 */
import type { FlowIconName } from '../ui/FlowIcon';

/** Stille Zeit (full and short form), by step id. */
export const MORNING_ICONS: Record<string, FlowIconName> = {
  atBed: 'bed',
  opening: 'openHands',
  word: 'bible',
  prayer: 'foldedHands',
  response: 'candle',
  lordsPrayer: 'foldedHands',
  alignment: 'compass',
  blessing: 'blessing',
};

/** In the short form the prayer step is the free prayer over the verse, from the heart. */
export function morningIcon(stepId: string, form: 'full' | 'short'): FlowIconName | undefined {
  if (form === 'short' && stepId === 'prayer') return 'heart';
  return MORNING_ICONS[stepId];
}

/** Nachtgebet, by page (step id). */
export const COMPLINE_ICONS: Record<string, FlowIconName> = {
  sign: 'cross',
  review: 'review',
  examination: 'tablets',
  blessing: 'moon',
  compline: 'moon',
};

/** Vesper, by page (step id). */
export const VESPERS_ICONS: Record<string, FlowIconName> = {
  praise: 'lyre',
  word: 'bible',
  prayer: 'foldedHands',
  vespers: 'sunset',
};
