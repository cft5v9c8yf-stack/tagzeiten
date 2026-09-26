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

/** Drag handle: two columns of dots. */
export function GripIcon() {
  return (
    <svg {...base} fill="currentColor" stroke="none">
      {[6, 12, 18].map((y) => (
        <g key={y}>
          <circle cx={9} cy={y} r={1.6} />
          <circle cx={15} cy={y} r={1.6} />
        </g>
      ))}
    </svg>
  );
}
