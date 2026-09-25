/** Small line icons naming the steps of an order (under the marks of ui/StepFlow). */
export type FlowIconName =
  | 'bed'
  | 'openHands'
  | 'bible'
  | 'foldedHands'
  | 'candle'
  | 'compass'
  | 'blessing'
  | 'moon'
  | 'people'
  | 'cross'
  | 'scroll'
  | 'heart'
  | 'review'
  | 'tablets'
  | 'drop'
  | 'song'
  | 'lyre'
  | 'star'
  | 'sunrise'
  | 'sunset';

const PATHS: Record<FlowIconName, JSX.Element> = {
  bed: <path d="M3 7v11M21 13v5M3 16h18M3 13h18M6.5 13a2 2 0 0 1 0-4h2.5a1.5 1.5 0 0 1 1.5 1.5V13" />,
  // Hands open to receive
  openHands: (
    <path d="M3 10.5l2.5 5c1 2 3 3 6.5 3s5.5-1 6.5-3l2.5-5M3 10.5c.9-.5 1.9-.2 2.4.6L7.5 14M21 10.5c-.9-.5-1.9-.2-2.4.6L16.5 14M7.5 14h9" />
  ),
  bible: (
    <>
      <path d="M6 3.5h11a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1-1.5Z" />
      <path d="M11.5 7v7M9 9.5h5" />
    </>
  ),
  foldedHands: <path d="M12 3c-1.6 2-2.5 5-2.5 8.5V16l-3.5 4.5M12 3c1.6 2 2.5 5 2.5 8.5V16l3.5 4.5M12 5v12" />,
  candle: (
    <path d="M9 11h6v10H9zM12 11V8.5M12 3.5c1.3 1.5 1.7 2.6 1 3.6a1.2 1.2 0 0 1-2 0c-.7-1 0-2.1 1-3.6Z" />
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5Z" />
    </>
  ),
  // A hand raised in blessing
  blessing: (
    <path d="M8 21v-5.5L5.6 12a1.4 1.4 0 0 1 2.2-1.8L9 11.6V5a1.5 1.5 0 0 1 3 0v5.5M12 10.5V3.8a1.5 1.5 0 0 1 3 0v6.7M15 10.5V5.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6H8" />
  ),
  moon: <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" />,
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="16.5" cy="9" r="2.5" />
      <path d="M15 13.6a4.5 4.5 0 0 1 6 4.4" />
    </>
  ),
  cross: <path d="M12 3v18M7 8h10" />,
  // The creed, a written confession
  scroll: (
    <path d="M7 4h11v13a3 3 0 0 1-3 3H6a2 2 0 0 1-2-2v-1h9v1a2 2 0 0 0 2 2M7 4a2 2 0 0 0-2 2v11M10 8h5M10 11h5" />
  ),
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
  // Looking back over the day
  review: <path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4M12 8v4l3 2" />,
  // The two tables of the law
  tablets: <path d="M3.5 20V9a4 4 0 0 1 8 0v11ZM12.5 20V9a4 4 0 0 1 8 0v11ZM6 12h3M6 15h3M15 12h3M15 15h3" />,
  drop: <path d="M12 3.5c3 4 5.5 7 5.5 10a5.5 5.5 0 0 1-11 0c0-3 2.5-6 5.5-10Z" />,
  song: (
    <>
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
      <path d="M9 18V6l10-2v12" />
    </>
  ),
  lyre: <path d="M7 4c-2 4-2 9 0 13h10c2-4 2-9 0-13M7 17l1 3h8l1-3M10 7v10M12 6v11M14 7v10" />,
  star: <path d="m12 3.5 2.5 5.5 6 .6-4.5 4 1.3 5.9-5.3-2.9-5.3 2.9L8 13.6l-4.5-4 6-.6Z" />,
  sunrise: <path d="M7 17a5 5 0 0 1 10 0M2 17h20M12 4v4M9.5 6.5 12 4l2.5 2.5M4.5 10.5l1.6 1.2M19.5 10.5l-1.6 1.2" />,
  // The sun going down: the Vesper
  sunset: <path d="M7 17a5 5 0 0 1 10 0M2 17h20M12 4v5M9.5 6.5 12 9l2.5-2.5M4.5 10.5l1.6 1.2M19.5 10.5l-1.6 1.2" />,
};

export function FlowIcon({ name, size = 16 }: { name: FlowIconName; size?: number }) {
  return (
    <svg
      className="flow-icon"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
