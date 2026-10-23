/**
 * The common page for everything Henoch exports as PDF: a narrow head with the mark of
 * the app, the place on the right and a thin gold rule; the title, date and body; at the
 * foot a word of comfort. A4, no ground colour, one gold. The page is described here as
 * blocks and drawn as a PDF file on the device (pdfRender.ts); the file goes to the share
 * sheet, so it works in Safari and in the installed app alike (rule 10: nothing leaves
 * the device unless you share it).
 */
export const APP_SUBTITLE = 'Mit Gott unterwegs';

/** A piece of text with its emphasis. */
export interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export type Block =
  /** A small label in capitals over a part ("Gebetsanliegen"). */
  | { kind: 'label'; text: string }
  /** Markdown headings: 1 a part with a rule above, 2 and 3 smaller headings. */
  | { kind: 'heading'; level: 1 | 2 | 3; text: string; runs: Run[] }
  /** The start of one entry among several: rule, title, date, verses. */
  | { kind: 'entry'; title: string; date?: string; verses?: string }
  | { kind: 'para'; runs: Run[] }
  /** A list; `check` makes a box, ticked or not. */
  | { kind: 'list'; items: { runs: Run[]; check?: boolean }[] }
  | { kind: 'quote'; runs: Run[] }
  /** Handwriting (or another drawing of the app) as SVG. */
  | { kind: 'svg'; svg: string };

export interface PrintDoc {
  /** The place shown at the top right: "Gebetskammer", "Treffen am Abendbrunnen", … */
  place: string;
  title: string;
  /** Under the title, e.g. "Freitag, 23. Oktober 2026". */
  subtitle?: string;
  /** Bible references under the date, in gold. */
  verses?: string;
  blocks: Block[];
  /** Word of comfort for the foot of every page (Luther 1912). */
  comfort?: readonly { text: string; ref: string }[];
}

/** A plain text as paragraphs, line breaks kept. */
export const paragraphs = (text: string): Block[] =>
  text
    .trim()
    .split(/\n{2,}/)
    .map((p) => ({ kind: 'para' as const, runs: [{ text: p }] }));

/** Bold and italic of a line of Markdown as runs. */
export function runsOf(s: string): Run[] {
  const out: Run[] = [];
  const re = /\*\*(.+?)\*\*|(?<![*\w])\*(?!\s)(.+?)\*(?!\*)/g;
  let at = 0;
  for (const m of s.matchAll(re)) {
    if (m.index! > at) out.push({ text: s.slice(at, m.index) });
    out.push(m[1] !== undefined ? { text: m[1], bold: true } : { text: m[2]!, italic: true });
    at = m.index! + m[0].length;
  }
  if (at < s.length) out.push({ text: s.slice(at) });
  return out.map((r) => ({ ...r, text: r.text.replace(/`/g, '') }));
}

const plain = (runs: readonly Run[]) => runs.map((r) => r.text).join('');

/** Base64 of UTF-8 back to text. */
const fromBase64 = (b64: string) => new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));

/**
 * The Markdown the app writes (headings, bold, lists with ticks, quotes, images,
 * a front matter block) as blocks for the page. A front matter block between two
 * `---` lines is left out.
 */
export function markdownToBlocks(md: string): Block[] {
  const lines = md.replace(/\r/g, '').split('\n');
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) lines.splice(0, end + 1);
  }
  const out: Block[] = [];
  let list: { runs: Run[]; check?: boolean }[] = [];
  let para: string[] = [];
  const flushList = () => {
    if (list.length) out.push({ kind: 'list', items: list });
    list = [];
  };
  const flushPara = () => {
    if (para.length) out.push({ kind: 'para', runs: runsOf(para.join('\n')) });
    para = [];
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    const li = /^\s*-\s+(?:\[([ x])\]\s+)?(.*)$/.exec(line);
    const img = /^!\[.*?\]\(data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)\)$/.exec(line);
    if (h) {
      flushList();
      flushPara();
      const runs = runsOf(h[2]!);
      out.push({ kind: 'heading', level: h[1]!.length as 1 | 2 | 3, text: plain(runs), runs: runs.map((r) => ({ ...r, bold: true })) });
    } else if (li) {
      flushPara();
      list.push({ runs: runsOf(li[2]!), ...(li[1] === undefined ? {} : { check: li[1] === 'x' }) });
    } else if (img) {
      flushList();
      flushPara();
      out.push({ kind: 'svg', svg: fromBase64(img[1]!) });
    } else if (line.startsWith('> ')) {
      flushList();
      flushPara();
      out.push({ kind: 'quote', runs: runsOf(line.slice(2)) });
    } else if (line.trim() === '') {
      flushList();
      flushPara();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushList();
  flushPara();
  return out;
}

/** A file name without characters a file system dislikes. */
export const safeName = (s: string) =>
  s
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
    .trim();

/** The date as JJMMTT, the way the files are named. */
export const shortDate = (isoDate: string) => isoDate.slice(2, 10).replace(/-/g, '');

/**
 * Hands a file to the share sheet (iPhone, iPad, Android: "In Dateien sichern", Notizen,
 * Obsidian, …), or downloads it where there is none (desktop). A share cancelled by the
 * user is fine and says nothing.
 */
export async function shareFile(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, { type: blob.type });
  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename.replace(/\.[a-z]+$/, '') });
      return;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      // Not allowed here (no tap left, a browser without it): download instead.
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Draws the page as a PDF and hands it on; `basename` names the file (".pdf" is added). */
export async function savePdf(doc: PrintDoc, basename: string): Promise<void> {
  // pdf-lib is loaded only when a PDF is made, so the app starts as fast as before; it is cached for offline use.
  const { renderPdf } = await import('./pdfRender');
  const bytes = await renderPdf(doc);
  await shareFile(new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }), `${basename}.pdf`);
}

export interface PdfMarkdownOptions {
  place: string;
  title: string;
  subtitle?: string;
  comfort?: PrintDoc['comfort'];
}

/** Markdown the app wrote (a whole export, a Wüstenzeit) on the common page as PDF. */
export const saveMarkdownPdf = (md: string, { place, title, subtitle, comfort }: PdfMarkdownOptions, basename: string) =>
  savePdf({ place, title, subtitle, blocks: markdownToBlocks(md), comfort }, basename);
