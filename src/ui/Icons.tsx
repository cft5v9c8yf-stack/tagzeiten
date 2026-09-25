const base = {
  viewBox: '0 0 24 24',
  width: 20,
  height: 20,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

/** Focus star: outline when off, filled when on. */
export function StarIcon({ filled, size = 20 }: { filled: boolean; size?: number }) {
  return (
    <svg {...base} width={size} height={size} fill={filled ? 'currentColor' : 'none'} className="icon-star">
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
    </svg>
  );
}

export function ChevronIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg {...base} fill="none">
      <path d={direction === 'up' ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
    </svg>
  );
}
