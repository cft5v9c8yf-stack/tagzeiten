import { FlowIcon } from './FlowIcon';
import { ICON_SIZE } from './iconBase';

/** Focus star: outline when off, filled when on. */
export function StarIcon({ filled, size = ICON_SIZE.m }: { filled: boolean; size?: number }) {
  return <FlowIcon name="star" size={size} plain filled={filled} />;
}

/** Drag handle: two columns of dots. */
export function GripIcon() {
  return <FlowIcon name="grip" size={ICON_SIZE.m} plain />;
}
