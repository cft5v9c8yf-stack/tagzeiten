import { useId } from 'react';

/**
 * The sign of Henoch as on the homepage (logo.svg there): the sun over the
 * horizon, its light in rings, and a way that leads to it. Drawn in the colours
 * of the app, so it follows the light and the dark design.
 */
export function HenochLogo({ size = 72 }: { size?: number }) {
  // Cut close above the rings and where the way fades: the sign without its empty margin, 700 by 500.
  const id = useId();
  return (
    <svg className="henoch-logo" viewBox="236 200 700 500" width={(size * 7) / 5} height={size} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-way`} x1="0" y1="455" x2="0" y2="850" gradientUnits="userSpaceOnUse">
          <stop offset="0.55" stopColor="var(--warm-soft)" />
          <stop offset="1" stopColor="var(--warm-soft)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="455" x2="0" y2="850" gradientUnits="userSpaceOnUse">
          <stop offset="0.6" stopColor="var(--ink)" />
          <stop offset="1" stopColor="var(--ink)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g fill="none" strokeWidth="3" stroke="var(--rule)">
        <path d="M443 455a143 143 0 0 1 286 0M390 455a196 196 0 0 1 392 0M336 455a250 250 0 0 1 500 0" />
        <path d="M236 475H936M236 507H936M236 557H936M236 636H936M236 750H936" />
      </g>
      <path fill="var(--icon-gold)" d="M500 455a86 86 0 0 1 172 0Z" />
      <path
        d="M586 455C560 540 530 610 440 680C370 735 270 790 195 850H905C870 760 820 700 740 630C660 560 600 520 586 455Z"
        fill={`url(#${id}-way)`}
      />
      <path
        d="M195 850C270 790 370 735 440 680C530 610 560 540 586 455C600 520 660 560 740 630C820 700 870 760 905 850"
        fill="none"
        stroke={`url(#${id}-edge)`}
        strokeWidth="4"
      />
      <path stroke="var(--ink)" d="M236 455H936" strokeWidth="4" />
    </svg>
  );
}
