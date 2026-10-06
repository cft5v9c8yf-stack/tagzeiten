import { useCallback, useId, useLayoutEffect, useRef, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { FIELDS } from '../content/fields';
import { useDay, useStore } from '../data/hooks';
import type { DateKey } from '../domain/dates';
import { getText, setAt } from '../domain/paths';

function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight + 2}px`;
}

/** A text area that grows with its text, so nothing is cut off. */
export function GrowingTextarea({ value, rows = 1, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => autosize(ref.current), [value]);
  return <textarea ref={ref} rows={rows} value={value} {...rest} />;
}

/**
 * A text field bound to a path of the day. Saves as you type (debounced).
 * `aside` stands to the right of the label (e.g. a Bible reference).
 */
export function DayField({
  date,
  path,
  label,
  aside,
  enterKeyHint,
}: {
  date: DateKey;
  path: string;
  label?: string;
  aside?: ReactNode;
  enterKeyHint?: 'next' | 'done';
}) {
  const store = useStore();
  const day = useDay(date);
  const id = useId();
  const meta = FIELDS[path] ?? { label: path };
  const value = getText(day, path);

  const onChange = useCallback(
    (v: string) => store.updateDay(date, (d) => setAt(d, path, v)),
    [store, date, path],
  );

  const labelEl = <label htmlFor={id}>{label ?? meta.label}</label>;
  return (
    <div className="field">
      {aside ? (
        <div className="field-head">
          {labelEl}
          {aside}
        </div>
      ) : (
        labelEl
      )}
      {meta.single ? (
        <input
          id={id}
          type="text"
          value={value}
          placeholder={meta.placeholder}
          autoComplete="off"
          enterKeyHint={enterKeyHint}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <GrowingTextarea
          id={id}
          rows={meta.rows ?? 1}
          value={value}
          placeholder={meta.placeholder}
          enterKeyHint={enterKeyHint}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
