import { FlowIcon } from './FlowIcon';
import { ICON_SIZE } from './iconBase';

/** Beside a link that opens in the browser: the arrow points out of the app. */
export function OutArrow() {
  return (
    <span className="out-arrow" aria-hidden="true">
      <FlowIcon name="out" size={ICON_SIZE.s} plain />
    </span>
  );
}
