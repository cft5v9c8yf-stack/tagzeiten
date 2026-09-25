import type { SectionIcon as Name } from '../app/routes';

const PATHS: Record<Name, JSX.Element> = {
  // A day arc over the horizon
  today: (
    <>
      <path d="M4 16a8 8 0 0 1 16 0" />
      <path d="M2 16h20" />
      <circle cx="12" cy="16" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  // Sunrise
  morning: (
    <>
      <path d="M7 17a5 5 0 0 1 10 0" />
      <path d="M2 17h20M12 5v3M5.2 9.2l1.8 1.8M18.8 9.2 17 11" />
    </>
  ),
  // Crescent moon
  evening: <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" />,
  catechism: <path d="M12 3v18M7 8h10" />,
  // An open book
  archive: (
    <>
      <path d="M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5Z" />
      <path d="M12 6v13" />
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
