import { useCallback, useEffect, useState, type RefObject } from 'react';
import { FlowIcon } from '../../ui/FlowIcon';

/**
 * The field to write in, enlarged: the rest of the entry steps back (the class
 * "write-focus" on <html>), the actions of the entry stay at the top left, and the
 * page takes the width of the screen. Escape, or the arrows again, return to the
 * entry. Nothing is kept: an entry always opens as is.
 */
export function useEnlarged(_field?: RefObject<HTMLElement | null>): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const toggle = useCallback(() => setOn((x) => !x), []);
  useEffect(() => {
    if (!on) return;
    const root = document.documentElement;
    root.classList.add('write-focus');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOn(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      root.classList.remove('write-focus');
      document.removeEventListener('keydown', onKey);
    };
  }, [on]);
  return [on, toggle];
}

/** The arrows: out to enlarge, in to return. Named for VoiceOver, without a word on screen. */
export function EnlargeButton({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const label = on ? 'Verkleinern' : 'Vergrößern';
  return (
    <button type="button" className="write-enlarge" aria-pressed={on} aria-label={label} title={label} onClick={onToggle}>
      <FlowIcon name={on ? 'collapse' : 'expand'} size={18} />
    </button>
  );
}

/** Under the enlarged page: where the rest went. */
export function EnlargedNote() {
  return <p className="write-focus-note">Alles andere wartet, bis du verkleinerst.</p>;
}
