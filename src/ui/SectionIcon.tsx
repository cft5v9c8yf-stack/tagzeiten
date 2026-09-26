import type { SectionIcon as Name } from '../app/routes';

const PATHS: Record<Name, JSX.Element> = {
  // A closed book with a cross on its cover
  bible: (
    <>
      <path d="M6 3.5h11a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1-1.5Z" />
      <path d="M11.5 7v7M9 9.5h5" />
    </>
  ),
  // A day arc over the horizon
  today: (
    <>
      <path d="M4 16a8 8 0 0 1 16 0" />
      <path d="M2 16h20" />
      <circle cx="12" cy="16" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  // Folded hands: Stille Zeit, Vesper and Nachtgebet
  prayer: <path d="M12 3c-1.6 2-2.5 5-2.5 8.5V16l-3.5 4.5M12 3c1.6 2 2.5 5 2.5 8.5V16l3.5 4.5M12 5v12" />,
  // The Sunday is drawn as Luther's rose in the bar; this is the fallback.
  sunday: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M8.5 10.5h7" />
    </>
  ),
  catechism: <path d="M12 3v18M7 8h10" />,
  // A shield with the cross: the Arena, where the fight of faith is written down
  arena: (
    <>
      <path d="M12 3.2 19 6v5.2c0 4.6-3 8-7 9.6-4-1.6-7-5-7-9.6V6l7-2.8Z" />
      <path d="M12 8v8M9 11h6" />
    </>
  ),
  more: (
    <>
      <circle cx="6" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
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
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
