/**
 * Draws the common page of printDoc as a PDF file with pdf-lib, on the device: a narrow
 * head with the mark of the app and the place, title and body, the word of comfort at the
 * foot of every page. A4, no ground colour, one gold. The library is part of the app and
 * loads nothing from outside (rule 10); the standard PDF fonts need no embedding.
 */
import {
  LineCapStyle,
  LineJoinStyle,
  PDFDocument,
  StandardFonts,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  setCharacterSpacing,
  setLineJoin,
  type PDFFont,
  type PDFPage,
  type RGB,
} from 'pdf-lib';
import { APP_SUBTITLE, type PrintDoc, type Run } from './printDoc';

const MM = 72 / 25.4;
const W = 210 * MM;
const H = 297 * MM;
const LEFT = 20 * MM;
const RIGHT = W - 20 * MM;
const WIDTH = RIGHT - LEFT;
/** Where the body starts and ends on every page: clear of the head and the foot. */
const TOP = H - 34 * MM;
const BOTTOM = 34 * MM;

const hex = (h: string): RGB => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const C = {
  ink: hex('#1d2330'),
  muted: hex('#636a76'),
  quiet: hex('#4a5160'),
  gold: hex('#7f6200'),
  goldLine: hex('#a78100'),
  sun: hex('#d4b13c'),
  arc: hex('#cfc8b8'),
  label: hex('#2e4057'),
  rule: hex('#ddd8ce'),
  box: hex('#8a8578'),
  done: hex('#4f7a17'),
};

interface Fonts {
  serif: PDFFont;
  serifBold: PDFFont;
  serifItalic: PDFFont;
  serifBoldItalic: PDFFont;
  sans: PDFFont;
  sansBold: PDFFont;
}

interface Seg {
  text: string;
  font: PDFFont;
}

/** Only what the standard fonts can write (WinAnsi); anything else becomes a plain stand-in. */
function encodable(font: PDFFont, text: string): string {
  const set = new Set(font.getCharacterSet());
  let out = '';
  for (const ch of text.replace(/\t/g, ' ')) {
    const cp = ch.codePointAt(0)!;
    if (set.has(cp)) out += ch;
    else if (ch === '→') out += '->';
    else if (ch === '✓') out += 'x';
    else if (/\s/.test(ch)) out += ' ';
    else if (cp > 0xffff || /\p{Extended_Pictographic}/u.test(ch)) continue;
    else out += '?';
  }
  return out;
}

const fontOf = (f: Fonts, r: Run, base: 'serif' | 'sans' = 'serif') =>
  base === 'sans' ? (r.bold ? f.sansBold : f.sans) : r.bold && r.italic ? f.serifBoldItalic : r.bold ? f.serifBold : r.italic ? f.serifItalic : f.serif;

/** Splits runs into lines no wider than `max`, word by word; a word longer than a line is cut. */
function wrap(runs: readonly Run[], fonts: Fonts, size: number, max: number, base: 'serif' | 'sans' = 'serif'): Seg[][] {
  const lines: Seg[][] = [];
  let line: Seg[] = [];
  let width = 0;
  const push = () => {
    lines.push(line);
    line = [];
    width = 0;
  };
  for (const r of runs) {
    const font = fontOf(fonts, r, base);
    const parts = encodable(font, r.text).split(/(\n| +)/);
    for (const part of parts) {
      if (part === '') continue;
      if (part === '\n') {
        push();
        continue;
      }
      const space = /^ +$/.test(part);
      if (space && width === 0) continue;
      let w = font.widthOfTextAtSize(part, size);
      if (!space && width + w > max && width > 0) push();
      let word = part;
      // A single word wider than the line is broken where it must.
      while (!space && w > max) {
        let n = word.length - 1;
        while (n > 1 && font.widthOfTextAtSize(word.slice(0, n), size) > max) n--;
        line.push({ text: word.slice(0, n), font });
        push();
        word = word.slice(n);
        w = font.widthOfTextAtSize(word, size);
      }
      line.push({ text: word, font });
      width += w;
    }
  }
  if (line.length) lines.push(line);
  // No trailing spaces at the end of a line.
  return lines.map((l) => {
    while (l.length && /^ +$/.test(l[l.length - 1]!.text)) l.pop();
    return l;
  });
}

/** The strokes of an SVG the app drew (the mark, the handwriting), as pdf-lib can draw them. */
interface SvgPath {
  d: string;
  stroke?: string;
  fill?: string;
  width: number;
  opacity?: number;
}
function parseSvg(svg: string): { width: number; height: number; paths: SvgPath[] } {
  const box = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
  const paths: SvgPath[] = [];
  const groupStroke = /<g[^>]*stroke="(#[0-9a-fA-F]{6})"[^>]*>/.exec(svg)?.[1];
  for (const m of svg.matchAll(/<path ([^>]*?)\/?>/g)) {
    const attr = (name: string) => new RegExp(`${name}="([^"]+)"`).exec(m[1]!)?.[1];
    const d = attr('d');
    if (!d) continue;
    const fill = attr('fill');
    paths.push({
      d,
      stroke: attr('stroke') ?? (fill ? undefined : groupStroke),
      fill: fill && fill !== 'none' ? fill : undefined,
      width: Number(attr('stroke-width') ?? 1),
      opacity: attr('stroke-opacity') ? Number(attr('stroke-opacity')) : undefined,
    });
  }
  return { width: Number(box?.[1] ?? 1000), height: Number(box?.[2] ?? 1000), paths };
}

function drawPaths(page: PDFPage, paths: readonly SvgPath[], x: number, top: number, scale: number) {
  page.pushOperators(pushGraphicsState(), setLineJoin(LineJoinStyle.Round));
  for (const p of paths) {
    page.drawSvgPath(p.d, {
      x,
      y: top,
      scale,
      ...(p.fill ? { color: hex(p.fill) } : {}),
      ...(p.stroke ? { borderColor: hex(p.stroke), borderWidth: p.width, borderLineCap: LineCapStyle.Round } : {}),
      ...(p.opacity !== undefined ? { borderOpacity: p.opacity } : {}),
    });
  }
  page.pushOperators(popGraphicsState());
}

/** The mark of the app (printDoc's MARK), drawn in lines on a 60 by 40 box. */
const MARK: SvgPath[] = [
  { d: 'M10 24a20 20 0 0 1 40 0M16 24a14 14 0 0 1 28 0', stroke: '#cfc8b8', width: 1 },
  { d: 'M23 24a7 7 0 0 1 14 0z', fill: '#d4b13c', width: 0 },
  { d: 'M30 25C31 31 38 35 44 39M30 25C29 31 22 35 16 39', stroke: '#1d2330', width: 1.7 },
  { d: 'M2 24H58', stroke: '#1d2330', width: 1.7 },
];

export async function renderPdf(doc: PrintDoc): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(doc.title);
  pdf.setCreator('Henoch');
  pdf.setProducer('Henoch');
  const fonts: Fonts = {
    serif: await pdf.embedFont(StandardFonts.TimesRoman),
    serifBold: await pdf.embedFont(StandardFonts.TimesRomanBold),
    serifItalic: await pdf.embedFont(StandardFonts.TimesRomanItalic),
    serifBoldItalic: await pdf.embedFont(StandardFonts.TimesRomanBoldItalic),
    sans: await pdf.embedFont(StandardFonts.Helvetica),
    sansBold: await pdf.embedFont(StandardFonts.HelveticaBold),
  };

  let page!: PDFPage;
  let y = TOP;

  /** Text with letter spacing, as the small capitals of the labels. */
  const spaced = (text: string, x: number, at: number, size: number, font: PDFFont, color: RGB, spacing: number) => {
    page.pushOperators(pushGraphicsState(), setCharacterSpacing(spacing));
    page.drawText(encodable(font, text), { x, y: at, size, font, color });
    page.pushOperators(setCharacterSpacing(0), popGraphicsState());
  };
  const spacedWidth = (text: string, size: number, font: PDFFont, spacing: number) =>
    font.widthOfTextAtSize(encodable(font, text), size) + spacing * Math.max(0, [...text].length - 1);

  const headAndFoot = () => {
    // Head: the mark, "Henoch" and the subtitle on the left, the place on the right, a gold rule under it.
    const markW = 16 * MM;
    const markTop = H - 12 * MM;
    drawPaths(page, MARK, LEFT, markTop, markW / 60);
    const tx = LEFT + markW + 3.2 * MM;
    page.drawText('Henoch', { x: tx, y: markTop - 5.2 * MM, size: 13, font: fonts.serifBold, color: C.ink });
    spaced(APP_SUBTITLE.toUpperCase(), tx, markTop - 8.8 * MM, 6.5, fonts.sansBold, C.muted, 1.3);
    const place = doc.place.toUpperCase();
    spaced(place, RIGHT - spacedWidth(place, 7, fonts.sansBold, 1.54), markTop - 8.8 * MM, 7, fonts.sansBold, C.gold, 1.54);
    const ruleY = markTop - 11.6 * MM;
    page.drawLine({ start: { x: LEFT, y: ruleY }, end: { x: RIGHT, y: ruleY }, thickness: 0.25 * MM, color: C.goldLine });

    // Foot: a short gold line, the word of comfort centred under it.
    const comfort = doc.comfort ?? [];
    if (!comfort.length) return;
    const size = 8.5;
    const lead = size * 1.4;
    const max = W - 60 * MM;
    const lines = comfort.flatMap((c) => wrap([{ text: `${c.text} `, italic: true }, { text: c.ref, bold: true }], fonts, size, max));
    let fy = 11 * MM + lead * (lines.length - 1);
    page.drawLine({ start: { x: W / 2 - 6 * MM, y: fy + lead + 1.5 * MM }, end: { x: W / 2 + 6 * MM, y: fy + lead + 1.5 * MM }, thickness: 0.25 * MM, color: C.goldLine });
    for (const line of lines) {
      const segs = line.map((s) => ({ ...s, size: s.font === fonts.serifBold ? 7.5 : size }));
      const lw = segs.reduce((a, s) => a + s.font.widthOfTextAtSize(s.text, s.size), 0);
      let x = W / 2 - lw / 2;
      for (const s of segs) {
        const bold = s.font === fonts.serifBold;
        page.drawText(s.text, { x, y: fy, size: s.size, font: bold ? fonts.sansBold : fonts.serifItalic, color: bold ? C.gold : C.quiet });
        x += (bold ? fonts.sansBold : fonts.serifItalic).widthOfTextAtSize(s.text, s.size);
      }
      fy -= lead;
    }
  };

  const newPage = () => {
    page = pdf.addPage([W, H]);
    y = TOP;
    headAndFoot();
  };
  /** Room for `h` more on this page, else on to the next. */
  const need = (h: number) => {
    if (y - h < BOTTOM) newPage();
  };

  const lines = (runs: readonly Run[], size: number, color: RGB, opts: { indent?: number; lead?: number; base?: 'serif' | 'sans'; keep?: number } = {}) => {
    const indent = opts.indent ?? 0;
    const lead = opts.lead ?? size * 1.55;
    const wrapped = wrap(runs, fonts, size, WIDTH - indent, opts.base);
    wrapped.forEach((line, i) => {
      need(i === 0 ? lead * Math.min(wrapped.length, opts.keep ?? 1) : lead);
      y -= lead;
      let x = LEFT + indent;
      for (const s of line) {
        page.drawText(s.text, { x, y: y + lead - size * 1.05, size, font: s.font, color });
        x += s.font.widthOfTextAtSize(s.text, size);
      }
    });
  };

  const label = (text: string, gapBefore: number) => {
    // A label never stands alone at the foot of a page.
    need(gapBefore + 8.5 + 3 * MM + 2 * 17.8);
    y -= gapBefore + 8.5;
    spaced(text.toUpperCase(), LEFT, y, 8.5, fonts.sansBold, C.label, 1.53);
    y -= 3 * MM;
  };

  /** The drawing cut to what is drawn on it: the page of the handwriting grows downwards, mostly empty. */
  const svgSize = (svg: string) => {
    const { width, height, paths } = parseSvg(svg);
    let low = 0;
    for (const p of paths) for (const m of p.d.matchAll(/[ML]\s*[\d.-]+[ ,]([\d.-]+)/g)) low = Math.max(low, Number(m[1]) + p.width);
    const used = paths.length ? Math.min(height, Math.max(width * 0.3, low + 60)) : height;
    const scale = Math.min(WIDTH / width, (180 * MM) / used);
    return { width, height: used, paths, scale, h: used * scale };
  };

  const drawSvg = (svg: string) => {
    const { width, paths, scale, h } = svgSize(svg);
    const w = width * scale;
    need(h + 4 * MM);
    const x = LEFT + (WIDTH - w) / 2;
    page.drawRectangle({ x: LEFT, y: y - h, width: WIDTH, height: h, borderColor: C.rule, borderWidth: 0.2 * MM });
    drawPaths(page, paths, x, y, scale);
    y -= h + 4 * MM;
  };

  newPage();
  // Title, date, verses.
  lines([{ text: doc.title, bold: true }], 16, C.ink, { lead: 16 * 1.22 });
  if (doc.subtitle) {
    y -= 1.5 * MM;
    lines([{ text: doc.subtitle, italic: true }], 9.5, C.muted, { lead: 9.5 * 1.4 });
  }
  if (doc.verses) {
    y -= 3 * MM;
    lines([{ text: doc.verses, italic: true }], 11.5, C.gold);
  }
  y -= 5 * MM;

  let first = true;
  doc.blocks.forEach((b, i) => {
    switch (b.kind) {
      case 'label': {
        // A label over a drawing goes with it to the next page.
        const next = doc.blocks[i + 1];
        if (next?.kind === 'svg') need((first ? 0 : 6 * MM) + 8.5 + 3 * MM + svgSize(next.svg).h + 4 * MM);
        label(b.text, first ? 0 : 6 * MM);
        break;
      }
      case 'heading': {
        if (b.level === 1) {
          need(14 * MM + 3 * 17.8);
          y -= 10 * MM;
          page.drawLine({ start: { x: LEFT, y }, end: { x: RIGHT, y }, thickness: 0.2 * MM, color: C.rule });
          label(b.text, 3 * MM);
        } else {
          y -= b.level === 2 ? 5 * MM : 3 * MM;
          const size = b.level === 2 ? 12 : 10.5;
          lines(b.runs, size, C.ink, { lead: size * 1.3, base: b.level === 2 ? 'serif' : 'sans', keep: 3 });
          y -= 1.5 * MM;
        }
        break;
      }
      case 'entry': {
        if (!first) {
          need(16 * MM + 3 * 17.8);
          y -= 6 * MM;
          page.drawLine({ start: { x: LEFT, y }, end: { x: RIGHT, y }, thickness: 0.2 * MM, color: C.rule });
          y -= 5 * MM;
        }
        lines([{ text: b.title, bold: true }], 13, C.ink, { lead: 13 * 1.3, keep: 4 });
        if (b.date) lines([{ text: b.date, italic: true }], 9.5, C.muted, { lead: 9.5 * 1.45 });
        if (b.verses) {
          y -= 1 * MM;
          lines([{ text: b.verses, italic: true }], 11.5, C.gold);
        }
        y -= 2 * MM;
        break;
      }
      case 'para':
        lines(b.runs, 11.5, C.ink);
        y -= 3 * MM;
        break;
      case 'list':
        for (const it of b.items) {
          const lead = 11.5 * 1.55;
          need(lead);
          if (it.check === undefined) {
            page.drawText('•', { x: LEFT + 1 * MM, y: y - 11.5 * 1.05 + 0.3, size: 11.5, font: fonts.serif, color: C.ink });
          } else {
            const s = 3.6 * MM;
            const bx = LEFT;
            const by = y - lead + (lead - s) / 2 + 0.6;
            page.drawRectangle({ x: bx, y: by, width: s, height: s, borderColor: it.check ? C.done : C.box, borderWidth: 0.3 * MM });
            if (it.check) {
              page.drawLine({ start: { x: bx + s * 0.22, y: by + s * 0.5 }, end: { x: bx + s * 0.42, y: by + s * 0.28 }, thickness: 0.35 * MM, color: C.done });
              page.drawLine({ start: { x: bx + s * 0.42, y: by + s * 0.28 }, end: { x: bx + s * 0.8, y: by + s * 0.75 }, thickness: 0.35 * MM, color: C.done });
            }
          }
          lines(it.runs, 11.5, C.ink, { indent: it.check === undefined ? 5 * MM : 6.1 * MM });
          y -= 1.5 * MM;
        }
        y -= 2.5 * MM;
        break;
      case 'quote': {
        const top = y;
        y -= 1.5 * MM;
        lines(b.runs.map((r) => ({ ...r, italic: true })), 11.5, C.quiet, { indent: 4 * MM });
        if (top - y < 200) page.drawLine({ start: { x: LEFT + 0.25 * MM, y: top - 2 * MM }, end: { x: LEFT + 0.25 * MM, y: y + 1 * MM }, thickness: 0.5 * MM, color: C.goldLine });
        y -= 3 * MM;
        break;
      }
      case 'svg':
        drawSvg(b.svg);
        break;
    }
    first = false;
  });

  return pdf.save({ objectsPerTick: Infinity });
}
