import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

/**
 * A row that is swiped sideways: to the left it stays open and shows buttons
 * behind it (`width` wide); to the right, far enough, it calls `onSwipeRight`
 * and slides back. Only a sideways move counts, so the page still scrolls.
 * After a swipe the tap that follows is swallowed, and a tap on an open row
 * closes it.
 */
export function useSwipeActions({
  revealed,
  onReveal,
  onSwipeRight,
  width,
  rightWidth = 88,
}: {
  revealed: boolean;
  onReveal: (on: boolean) => void;
  onSwipeRight?: () => void;
  width: number;
  rightWidth?: number;
}) {
  const [live, setLive] = useState<number | null>(null);
  const liveRef = useRef<number | null>(null);
  const start = useRef<{ x: number; y: number; base: number; id: number; active: boolean } | null>(null);
  const swiped = useRef(false);
  const rest = revealed ? -width : 0;
  const max = onSwipeRight ? rightWidth : 0;
  const set = (v: number | null) => {
    liveRef.current = v;
    setLive(v);
  };
  const handlers = {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      start.current = { x: e.clientX, y: e.clientY, base: rest, id: e.pointerId, active: false };
      swiped.current = false;
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      const s = start.current;
      if (!s || e.pointerId !== s.id) return;
      const dx = e.clientX - s.x;
      if (!s.active) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - s.y) * 1.5) return;
        s.active = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }
      swiped.current = true;
      set(Math.max(-width, Math.min(max, s.base + dx)));
    },
    onPointerUp: () => {
      const s = start.current;
      start.current = null;
      if (!s?.active) return;
      const at = liveRef.current ?? s.base;
      if (onSwipeRight && at > rightWidth * 0.6) {
        onReveal(false);
        onSwipeRight();
      } else onReveal(at < -width / 2);
      set(null);
    },
    onPointerCancel: () => {
      start.current = null;
      set(null);
    },
    onClickCapture: (e: React.MouseEvent) => {
      if (swiped.current) {
        swiped.current = false;
        e.preventDefault();
        e.stopPropagation();
      } else if (revealed) {
        e.preventDefault();
        e.stopPropagation();
        onReveal(false);
      }
    },
  };
  const offset = live ?? rest;
  return { offset, dragging: live !== null, handlers };
}
