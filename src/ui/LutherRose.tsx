/**
 * Luther's seal, drawn for the app (the seal itself is from 1530): a black-lined
 * cross in a red heart, set in a white rose on a sky-blue field in a golden ring.
 * Colours: the --rose-* tokens (tokens.css).
 */
const PETALS = [0, 1, 2, 3, 4].map((i) => -90 + i * 72);
const LEAVES = PETALS.map((a) => a + 36);

export function LutherRose({ size = 44 }: { size?: number }) {
  return (
    <svg
      className="luther-rose"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      strokeLinejoin="round"
    >
      <circle cx="24" cy="24" r="23" fill="var(--rose-gold)" stroke="var(--rose-line)" strokeWidth="1" />
      <circle cx="24" cy="24" r="20.2" fill="var(--rose-sky)" stroke="var(--rose-line)" strokeWidth="0.9" />
      {LEAVES.map((a) => (
        <path
          key={a}
          transform={`rotate(${a + 90} 24 24)`}
          d="M24 4.6 C25.8 8 25.9 11 24 14 C22.1 11 22.2 8 24 4.6 Z"
          fill="var(--rose-green)"
          stroke="var(--rose-line)"
          strokeWidth="0.8"
        />
      ))}
      {PETALS.map((a) => (
        <g key={a} transform={`rotate(${a + 90} 24 24)`}>
          <path
            d="M24 3.6 C29.5 6.5 32.8 10.5 31.2 15.6 C29.9 19.4 26.4 21 24 21.5 C21.6 21 18.1 19.4 16.8 15.6 C15.2 10.5 18.5 6.5 24 3.6 Z"
            fill="var(--rose-white)"
            stroke="var(--rose-line)"
            strokeWidth="0.9"
          />
          <path d="M24 9 C26.6 10.2 27.4 12.6 26.4 15 C25.6 16.6 24.6 17.4 24 17.8 C23.4 17.4 22.4 16.6 21.6 15 C20.6 12.6 21.4 10.2 24 9 Z" fill="var(--rose-grey)" />
        </g>
      ))}
      <path
        d="M24 33.4 C19.2 30 15.6 26.8 15.6 22.8 C15.6 20.2 17.5 18.4 19.8 18.4 C21.6 18.4 23 19.4 24 20.8 C25 19.4 26.4 18.4 28.2 18.4 C30.5 18.4 32.4 20.2 32.4 22.8 C32.4 26.8 28.8 30 24 33.4 Z"
        fill="var(--rose-red)"
        stroke="var(--rose-line)"
        strokeWidth="0.9"
      />
      <path
        d="M23 20.4 h2 v3 h3 v2 h-3 v6.4 h-2 v-6.4 h-3 v-2 h3 Z"
        fill="var(--rose-white)"
        stroke="var(--rose-line)"
        strokeWidth="0.7"
      />
    </svg>
  );
}
