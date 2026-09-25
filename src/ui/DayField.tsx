import { useCallback, useId, useLayoutEffect, useRef } from 'react';
import { FIELDS } from '../content/fields';
import { useDay, useStore } from '../data/hooks';
import type { DateKey } from '../domain/dates';
import { getText, setAt } from '../domain/paths';

function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight + 2}px`;
}

/** A text field bound to a path of the day. Saves as you type (debounced). */
export function DayField({ date, path, label }: { date: DateKey; path: string; label?: string }) {
  const store = useStore();
  const day = useDay(date);
  const id = useId();
  const meta = FIELDS[path] ?? { label: path };
  const value = getText(day, path);
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => autosize(ref.current), [value]);

  const onChange = useCallback(
    (v: string) => store.updateDay(date, (d) => setAt(d, path, v)),
    [store, date, path],
  );

  return (
    <div className="field">
      <label htmlFor={id}>{label ?? meta.label}</label>
      {meta.single ? (
        <input
          id={id}
          type="text"
          value={value}
          placeholder={meta.placeholder}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <textarea
          id={id}
          ref={ref}
          rows={1}
          value={value}
          placeholder={meta.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
