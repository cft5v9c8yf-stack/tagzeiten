/** A row of mutually exclusive buttons; choosing the selected one again clears it. */
export function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly { value: T; label: string; title?: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={`choice${className ? ` ${className}` : ''}`} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          data-v={o.value}
          aria-pressed={value === o.value}
          title={o.title}
          aria-label={o.title ? `${o.label} – ${o.title}` : undefined}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Segmented control for exclusive settings (never cleared). */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
