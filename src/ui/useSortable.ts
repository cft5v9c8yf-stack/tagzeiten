import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';

/**
 * Drag-and-drop sorting for one list, built on pointer events so that mouse,
 * finger and pen behave the same (HTML5 drag and drop does not work with touch
 * on the iPhone). Dragging starts only on the handle; the page scrolls
 * normally everywhere else. Arrow keys on the handle move by one place.
 */

interface Drag {
  id: string;
  from: number;
  over: number;
  dy: number;
}

interface Measure {
  /** Row centres in page coordinates, in list order. */
  centres: number[];
  height: number;
  startPageY: number;
  clientY: number;
  pointerId: number;
}

const EDGE_TOP = 90;
const EDGE_BOTTOM = 150; // leaves room for the bottom navigation
const SCROLL_STEP = 10;

export function useSortable({
  ids,
  onDrop,
  onKeyMove,
}: {
  ids: readonly string[];
  /** Called once when a drag ends at a new place. */
  onDrop: (id: string, toIndex: number) => void;
  onKeyMove: (id: string, direction: 'up' | 'down') => void;
}) {
  const listRef = useRef<HTMLElement | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const measure = useRef<Measure | null>(null);
  const frame = useRef<number>(0);

  const update = useCallback(() => {
    const m = measure.current;
    const d = dragRef.current;
    if (!m || !d) return;
    const dy = m.clientY + window.scrollY - m.startPageY;
    const centre = m.centres[d.from]! + dy;
    const over = m.centres.filter((c, i) => i !== d.from && c < centre).length;
    const next = { ...d, dy, over };
    dragRef.current = next;
    setDrag(next);
  }, []);

  // While dragging near the top or bottom edge, scroll the page along.
  const autoScroll = useCallback(() => {
    const m = measure.current;
    if (!m || !dragRef.current) return;
    let step = 0;
    if (m.clientY < EDGE_TOP) step = -SCROLL_STEP;
    else if (m.clientY > window.innerHeight - EDGE_BOTTOM) step = SCROLL_STEP;
    if (step) {
      window.scrollBy(0, step);
      update();
    }
    frame.current = requestAnimationFrame(autoScroll);
  }, [update]);

  const end = useCallback(
    (commit: boolean) => {
      const d = dragRef.current;
      cancelAnimationFrame(frame.current);
      dragRef.current = null;
      measure.current = null;
      setDrag(null);
      document.body.classList.remove('is-sorting');
      if (commit && d && d.over !== d.from) onDrop(d.id, d.over);
    },
    [onDrop],
  );

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const handleProps = (id: string) => ({
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const list = listRef.current;
      if (!list) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const rows = [...list.querySelectorAll<HTMLElement>('[data-sort-id]')];
      const from = rows.findIndex((r) => r.dataset.sortId === id);
      if (from < 0) return;
      const rects = rows.map((r) => r.getBoundingClientRect());
      measure.current = {
        centres: rects.map((r) => r.top + window.scrollY + r.height / 2),
        height: rects[from]!.height,
        startPageY: e.clientY + window.scrollY,
        clientY: e.clientY,
        pointerId: e.pointerId,
      };
      const d = { id, from, over: from, dy: 0 };
      dragRef.current = d;
      setDrag(d);
      document.body.classList.add('is-sorting');
      frame.current = requestAnimationFrame(autoScroll);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const m = measure.current;
      if (!m || e.pointerId !== m.pointerId) return;
      m.clientY = e.clientY;
      update();
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      if (measure.current?.pointerId === e.pointerId) end(true);
    },
    onPointerCancel: () => end(false),
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        onKeyMove(id, e.key === 'ArrowUp' ? 'up' : 'down');
      } else if (e.key === 'Escape' && dragRef.current) {
        end(false);
      }
    },
  });

  /** Inline style for a row: the dragged one follows the pointer, the others make room. */
  const itemStyle = (id: string): CSSProperties | undefined => {
    const m = measure.current;
    if (!drag || !m) return undefined;
    const i = ids.indexOf(id);
    if (id === drag.id) return { transform: `translateY(${drag.dy}px)` };
    let shift = 0;
    if (drag.from < drag.over && i > drag.from && i <= drag.over) shift = -m.height;
    if (drag.from > drag.over && i >= drag.over && i < drag.from) shift = m.height;
    return shift ? { transform: `translateY(${shift}px)` } : undefined;
  };

  return { listRef, drag, handleProps, itemStyle };
}
