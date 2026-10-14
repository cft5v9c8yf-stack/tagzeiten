import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { useProfile } from '../../data/hooks';
import {
  hitStroke,
  MARKER_ALPHA,
  PAGE_WIDTH,
  pageHeight,
  strokeWidth,
  type InkColor,
  type InkStroke,
} from '../../domain/ink';

type Tool = 'pen' | 'marker' | 'eraser';

const TOOLS: { value: Tool; label: string }[] = [
  { value: 'pen', label: 'Stift' },
  { value: 'marker', label: 'Textmarker' },
  { value: 'eraser', label: 'Radierer' },
];

/** Colours of the app (red stays with the rubrics, rule 5). */
const COLORS: { value: InkColor; label: string; css: string }[] = [
  { value: 'ink', label: 'Tinte', css: '--ink' },
  { value: 'gold', label: 'Gold', css: '--rose-gold' },
  { value: 'sky', label: 'Blau', css: '--sky' },
];

/** Eraser radius on the page. */
const ERASER = 14;
const HISTORY = 50;
const PEN_KEY = 'tz:pen-seen';

const readPenSeen = () => {
  try {
    return localStorage.getItem(PEN_KEY) === '1';
  } catch {
    return false;
  }
};
const storePenSeen = () => {
  try {
    localStorage.setItem(PEN_KEY, '1');
  } catch {
    // Only a convenience: the next pencil stroke finds out again.
  }
};

function paint(ctx: CanvasRenderingContext2D, s: InkStroke, scale: number, color: string) {
  const p = s.points;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = s.tool === 'marker' ? MARKER_ALPHA : 1;
  if (p.length === 3) {
    ctx.beginPath();
    ctx.arc(p[0]! * scale, p[1]! * scale, (strokeWidth(s.tool, p[2]!) * scale) / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (s.tool === 'marker') {
    // One path, so the translucent marker does not darken where it overlaps itself.
    ctx.lineWidth = strokeWidth('marker', 0) * scale;
    ctx.beginPath();
    ctx.moveTo(p[0]! * scale, p[1]! * scale);
    for (let i = 3; i < p.length; i += 3) ctx.lineTo(p[i]! * scale, p[i + 1]! * scale);
    ctx.stroke();
  } else {
    // Segment by segment, each as thick as the pressure there.
    for (let i = 3; i < p.length; i += 3) {
      ctx.lineWidth = strokeWidth('pen', (p[i - 1]! + p[i + 2]!) / 2) * scale;
      ctx.beginPath();
      ctx.moveTo(p[i - 3]! * scale, p[i - 2]! * scale);
      ctx.lineTo(p[i]! * scale, p[i + 1]! * scale);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * A page to write on by hand, as in a notebook. With the Apple Pencil, the pen
 * writes and the finger turns the page; without one, the finger writes.
 */
export function InkPad({ strokes, onChange }: { strokes: InkStroke[]; onChange: (s: InkStroke[]) => void }) {
  const theme = useProfile().theme;
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState<InkColor>('ink');
  const [history, setHistory] = useState<InkStroke[][]>([]);
  const [width, setWidth] = useState(0);
  const [penSeen, setPenSeen] = useState(readPenSeen);
  const [schemeTick, setSchemeTick] = useState(0);

  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;
  const live = useRef<InkStroke | null>(null);
  const erasing = useRef<InkStroke[] | null>(null);
  const pointer = useRef<number | null>(null);
  const lastType = useRef('');
  const frame = useRef(0);

  const scale = width / PAGE_WIDTH;
  const height = pageHeight(strokes);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Colours follow the scheme; repaint when the device switches.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const on = () => setSchemeTick((t) => t + 1);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !width) return;
    const dpr = window.devicePixelRatio || 1;
    const h = height * scale;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, h);
    const style = getComputedStyle(canvas);
    const css = Object.fromEntries(COLORS.map((c) => [c.value, style.getPropertyValue(c.css).trim() || '#1d2330']));
    const list = erasing.current ?? strokesRef.current;
    for (const s of list) paint(ctx, s, scale, css[s.color]!);
    if (live.current) paint(ctx, live.current, scale, css[live.current.color]!);
  }, [width, height, scale]);

  useEffect(draw, [draw, strokes, theme, schemeTick]);

  const schedule = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(draw);
  };

  // A pencil on the page must not scroll it; a finger scrolls once a pencil has been used here.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const block = (ev: TouchEvent) => {
      const t = ev.changedTouches[0] as (Touch & { touchType?: string }) | undefined;
      const stylus = t?.touchType === 'stylus' || lastType.current === 'pen';
      if (stylus || !penSeen) ev.preventDefault();
    };
    canvas.addEventListener('touchstart', block, { passive: false });
    canvas.addEventListener('touchmove', block, { passive: false });
    return () => {
      canvas.removeEventListener('touchstart', block);
      canvas.removeEventListener('touchmove', block);
    };
  }, [penSeen]);

  const toPage = (e: { clientX: number; clientY: number; pressure: number; pointerType: string }) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const x = Math.round((e.clientX - r.left) / scale);
    const y = Math.round((e.clientY - r.top) / scale);
    const p = e.pointerType === 'pen' ? Math.round(e.pressure * 100) : 50;
    return [x, y, p] as const;
  };

  const eraseAt = (x: number, y: number) => {
    const list = erasing.current!;
    const kept = list.filter((s) => !hitStroke(s, x, y, ERASER));
    if (kept.length !== list.length) erasing.current = kept;
  };

  const add = (e: { clientX: number; clientY: number; pressure: number; pointerType: string }) => {
    const [x, y, p] = toPage(e);
    if (erasing.current) return eraseAt(x, y);
    const s = live.current;
    if (!s) return;
    const n = s.points.length;
    if (Math.hypot(x - s.points[n - 3]!, y - s.points[n - 2]!) < 1.5) return;
    s.points.push(x, y, p);
  };

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    lastType.current = e.pointerType;
    if (e.pointerType === 'pen' && !penSeen) {
      setPenSeen(true);
      storePenSeen();
    }
    const writes = e.pointerType === 'pen' || e.pointerType === 'mouse' || (e.pointerType === 'touch' && !penSeen);
    if (!writes || pointer.current !== null || !width) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // The pointer is already gone; the stroke still ends on pointerup.
    }
    pointer.current = e.pointerId;
    const [x, y, p] = toPage(e);
    if (tool === 'eraser') {
      erasing.current = strokesRef.current;
      eraseAt(x, y);
    } else {
      live.current = { tool, color, points: [x, y, p] };
    }
    schedule();
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== pointer.current) return;
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [];
    for (const ev of events.length ? events : [e.nativeEvent]) add(ev);
    schedule();
  };

  const onPointerEnd = (e: PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== pointer.current) return;
    pointer.current = null;
    const before = strokesRef.current;
    if (live.current) {
      const s = live.current;
      live.current = null;
      setHistory((h) => [...h.slice(-HISTORY + 1), before]);
      onChange([...before, s]);
    } else if (erasing.current) {
      const kept = erasing.current;
      erasing.current = null;
      if (kept.length !== before.length) {
        setHistory((h) => [...h.slice(-HISTORY + 1), before]);
        onChange(kept);
      }
    }
    schedule();
  };

  const undo = () => {
    const prev = history.at(-1);
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    onChange(prev);
  };

  return (
    <div className="ink">
      <div className="ink-tools" role="toolbar" aria-label="Werkzeuge der Handschrift">
        <div className="seg" role="group" aria-label="Werkzeug">
          {TOOLS.map((t) => (
            <button key={t.value} type="button" aria-pressed={tool === t.value} onClick={() => setTool(t.value)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="ink-colors" role="group" aria-label="Farbe">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`ink-color ink-${c.value}`}
              aria-pressed={color === c.value}
              aria-label={c.label}
              title={c.label}
              disabled={tool === 'eraser'}
              onClick={() => setColor(c.value)}
            />
          ))}
        </div>
        <button type="button" className="btn quiet ink-undo" disabled={history.length === 0} onClick={undo}>
          Rückgängig
        </button>
      </div>
      <p className="small muted ink-hint">
        {penSeen
          ? 'Der Apple Pencil schreibt, der Finger blättert.'
          : 'Mit Stift oder Finger schreiben. Sobald du hier den Apple Pencil benutzt, blättert der Finger die Seite.'}
      </p>
      <div ref={wrapRef} className="ink-page">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={strokes.length ? `Handschrift, ${strokes.length} Striche` : 'Leere Seite für Handschrift'}
          style={{ height: `${height * scale}px` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        />
      </div>
    </div>
  );
}
