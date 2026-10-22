import { FlowIcon } from './FlowIcon';
import { ICON_SIZE } from './iconBase';

/** The one chevron: to the sides (back and forth), down (opens) or right (goes on). */
export function Chevron({ dir, size = ICON_SIZE.m }: { dir: 'left' | 'right' | 'down'; size?: number }) {
  const name = dir === 'left' ? 'chevronLeft' : dir === 'right' ? 'chevronRight' : 'chevronDown';
  return <FlowIcon name={name} size={size} plain />;
}
