/**
 * Which icon names a step in the row of marks above an order (ui/StepFlow):
 * bed, open hands, the Bible, folded hands … – what happens in that step.
 */
import type { PartKind } from './orders';
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

/** Nachtgebet, by step id (examination and confession share one page). */
export const COMPLINE_ICONS: Record<string, FlowIconName> = {
  sign: 'cross',
  creed: 'scroll',
  lordsPrayer: 'foldedHands',
  thanks: 'heart',
  review: 'review',
  examination: 'tablets',
  baptism: 'drop',
  intercession: 'people',
  nunc: 'candle',
  blessing: 'moon',
};

/** Vesper, by part. */
export const VESPERS_ICONS: Partial<Record<PartKind, FlowIconName>> = {
  versicles: 'openHands',
  hymn: 'song',
  psalm: 'lyre',
  reading: 'bible',
  canticle: 'star',
  intercession: 'people',
  'lords-prayer': 'foldedHands',
  collect: 'cross',
  blessing: 'blessing',
};
