/**
 * Handwriting in the Gebetskammer: strokes as drawn with the Apple Pencil (or
 * finger, or mouse), kept on the device like everything else (rule 10).
 *
 * Coordinates live on a page 1000 units wide, so a page looks the same on the
 * phone and on the iPad; it grows downwards as you write.
 */

export type InkTool = 'pen' | 'marker';
export type InkColor = 'ink' | 'gold' | 'sky';

export interface InkStroke {
  tool: InkTool;
  color: InkColor;
  /** x, y, pressure (0–100) triples on the page. */
  points: number[];
}

export const PAGE_WIDTH = 1000;
export const MIN_PAGE_HEIGHT = 1300;
/** Room left below the lowest stroke, so there is always space to write on. */
const PAGE_ROOM = 400;
export const MARKER_WIDTH = 26;
export const MARKER_ALPHA = 0.35;

const TOOLS: readonly InkTool[] = ['pen', 'marker'];
const COLORS: readonly InkColor[] = ['ink', 'gold', 'sky'];

/** Line width of a pen at a pressure (0–100); the marker is always broad. */
export const strokeWidth = (tool: InkTool, pressure: number) =>
  tool === 'marker' ? MARKER_WIDTH : 1.6 + (Math.min(100, Math.max(0, pressure)) / 100) * 4.4;

/** Keeps well-formed strokes: known tool and colour, whole triples of finite numbers. */
export function normalizeInk(raw: unknown): InkStroke[] {
  if (!Array.isArray(raw)) return [];
  const out: InkStroke[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const x = r as Partial<InkStroke>;
    if (!TOOLS.includes(x.tool as InkTool) || !COLORS.includes(x.color as InkColor)) continue;
    if (!Array.isArray(x.points)) continue;
    const n = x.points.length - (x.points.length % 3);
    const points = x.points.slice(0, n);
    if (n === 0 || !points.every((v) => typeof v === 'number' && Number.isFinite(v))) continue;
    out.push({ tool: x.tool as InkTool, color: x.color as InkColor, points });
  }
  return out;
}

/** Height of the page: at least MIN_PAGE_HEIGHT, and always room below the writing. */
export function pageHeight(strokes: readonly InkStroke[]): number {
  let max = 0;
  for (const s of strokes) for (let i = 1; i < s.points.length; i += 3) max = Math.max(max, s.points[i]!);
  return Math.max(MIN_PAGE_HEIGHT, Math.ceil(max + PAGE_ROOM));
}

const distToSegment = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
  const dx = bx - ax;
  const dy = by - ay;
  const len = dx * dx + dy * dy;
  const t = len === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

/** Whether the eraser at (x, y) with radius r touches the stroke. */
export function hitStroke(s: InkStroke, x: number, y: number, r: number): boolean {
  const p = s.points;
  const reach = r + strokeWidth(s.tool, 100) / 2;
  if (p.length === 3) return Math.hypot(x - p[0]!, y - p[1]!) <= reach;
  for (let i = 3; i < p.length; i += 3) {
    if (distToSegment(x, y, p[i - 3]!, p[i - 2]!, p[i]!, p[i + 1]!) <= reach) return true;
  }
  return false;
}

/** Colours for the export: the light scheme of the app. */
const SVG_COLOR: Record<InkColor, string> = { ink: '#1d2330', gold: '#b08800', sky: '#0a7fae' };

/** The page as an SVG image, for the Markdown export (rule 11). */
export function inkToSvg(strokes: readonly InkStroke[]): string {
  const h = pageHeight(strokes);
  const paths = strokes.map((s) => {
    const p = s.points;
    let d = `M${p[0]} ${p[1]}`;
    if (p.length === 3) d += 'l0 0.01';
    for (let i = 3; i < p.length; i += 3) d += `L${p[i]} ${p[i + 1]}`;
    let avg = 0;
    for (let i = 2; i < p.length; i += 3) avg += p[i]!;
    avg /= p.length / 3;
    const w = Math.round(strokeWidth(s.tool, avg) * 10) / 10;
    const alpha = s.tool === 'marker' ? ` stroke-opacity="${MARKER_ALPHA}"` : '';
    return `<path d="${d}" stroke="${SVG_COLOR[s.color]}" stroke-width="${w}"${alpha}/>`;
  });
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PAGE_WIDTH} ${h}" width="${PAGE_WIDTH / 2}" height="${h / 2}">` +
    `<rect width="100%" height="100%" fill="#ffffff"/>` +
    `<g fill="none" stroke-linecap="round" stroke-linejoin="round">${paths.join('')}</g></svg>`
  );
}
