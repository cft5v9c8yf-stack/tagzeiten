import type { SectionIcon as Name } from '../app/routes';
import { FLOW_PATHS } from './FlowIcon';
import { ICON_STROKE } from './iconBase';

const PATHS: Record<Name, JSX.Element> = {
  bible: FLOW_PATHS.bible,
  // The app's sign: the sun over the horizon, its light in rings, and the way that leads to it
  today: (
    <>
      <path d="M4 10a8 8 0 0 1 16 0M7 10a5 5 0 0 1 10 0" strokeWidth="1" opacity="0.45" />
      <path d="M9 10a3 3 0 0 1 6 0Z" fill="var(--icon-gold)" stroke="none" />
      <path d="M12 10.4c-.6 4.4-2.6 8.2-7.2 11.1h14.1c-1.5-4.9-6-7.3-6.9-11.1Z" fill="currentColor" opacity="0.14" stroke="none" />
      <path d="M1.5 10h21" />
      <path d="M12 10.4c-.6 4.4-2.6 8.2-7.2 11.1M12 10.4c.9 3.8 5.4 6.2 6.9 11.1" />
    </>
  ),
  prayer: FLOW_PATHS.foldedHands,
  // The Sunday is drawn as Luther's rose in the bar; this is the fallback.
  sunday: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M8.5 10.5h7" />
    </>
  ),
  catechism: FLOW_PATHS.cross,
  // A shield with the cross: the Arena, where the fight of faith is written down
  arena: (
    <>
      <path d="M12 3.2 19 6v5.2c0 4.6-3 8-7 9.6-4-1.6-7-5-7-9.6V6l7-2.8Z" />
      <path d="M12 8v8M9 11h6" />
    </>
  ),
  more: FLOW_PATHS.dots,
};

export function SectionIcon({ name, size = 22 }: { name: Name; size?: number }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
