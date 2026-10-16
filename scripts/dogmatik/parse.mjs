/**
 * Reads the transcription of Pieper's Christliche Dogmatik (reference/pieper,
 * see README there) into a stream of headings and paragraphs, each paragraph
 * with its page and its footnotes.
 *
 * The transcription is a text dump (pdftotext -layout) of BackToLuther's
 * edition: a page starts with "90 >  Running head [English ed. 81]", the
 * footnotes stand below a line of dashes, paragraphs are indented, headings
 * end with "^" (a link back to the contents in the original).
 */
import { readFileSync } from 'node:fs';

// "90 >  Running head [English ed. 81]"; once (Band 1, page 262) without the ">".
const PAGE = /^\s*(\d+)\\?(?: >|\s{2,}(?=[^\d\s].*\[English))/;
const RULE = /^\s*[-—–_]{5,}\s*$/;
const DOTS = /^\s*\.\s*$/;
const NOTE_START = /(?:^|\s{2,})(\d{1,4})\)\s/g;
const NOTE_WEAK = /(?<=[.;:\]“”"]) (\d{1,4})\)\s/g;

/** The pages of a file: number, body lines, footnote lines. Pages before page 1 (preface, contents) are left out. */
export function pages(text) {
  const out = [];
  let page = null;
  let inNotes = false;
  // "[English ed." in a page head, closed on the next line ("pgs. 467-468]").
  let openHead = false;
  for (const raw of text.split('\n')) {
    let line = raw.replace(/\s+$/, '');
    if (openHead && line.trim()) {
      // Only a short tail closes it ("pgs. 467-468]"); a bracket never closed (page 331) is left alone.
      openHead = false;
      const tail = /^\s*[^\[\]]{0,40}\]/.exec(line);
      if (tail && !/[a-zäöüß]{4,}\s+[a-zäöüß]{4,}/.test(tail[0])) {
        line = line.slice(tail[0].length);
        if (!line.trim()) continue;
      }
    }
    // The end of the first file of a volume: "=====", "Part 2 – pages 334-690 may be found here."
    if (/^\s*=+\s*$/.test(line) || /may be found here/.test(line)) continue;
    const m = PAGE.exec(line);
    if (m) {
      const no = Number(m[1]);
      // The same page again: a page split between two files (Band 2, page 358).
      if (page && page.no === no) {
        inNotes = false;
        page.split = true;
        openHead = /\[[^\]]*$/.test(line);
        continue;
      }
      page = { no, body: [], notes: [] };
      out.push(page);
      inNotes = false;
      openHead = /\[[^\]]*$/.test(line);
      continue;
    }
    if (!page) continue;
    if (RULE.test(line)) {
      inNotes = true;
      continue;
    }
    if (DOTS.test(line)) continue;
    (inNotes ? page.notes : page.body).push(line);
  }
  // Twice (Band 1, pages 192 and 532) the notes stand without the line above them.
  for (const p of out) {
    if (p.notes.length) continue;
    const at = p.body.findIndex((l, i) => i >= p.body.length - 8 && /^\s{2,}\d{1,4}\)\s/.test(l));
    if (at > 0) p.notes = p.body.splice(at);
  }
  return out;
}

/**
 * Footnotes of a page: number → text; text before the first number continues
 * the last note of the page before.
 *
 * The notes are numbered through the volume (Band 2 afresh from "Die Lehre von
 * Christo" on), so a page holds the run of numbers after the last one of the
 * page before. First the run is found among the numbers standing at the start
 * of a line or a column; the lines may be out of turn (two columns). A number
 * missing from the run may be taken by one slipped in the transcription
 * ("1170)" for 1179), but only if the run goes on after it. A number given
 * twice with the same text (Band 2, page 358 in both files) is left out.
 * Anything else ("S. 127)" in a note) is part of the text.
 */
export function footnotes(lines, last = 0, known = {}) {
  const notes = [];
  let lead = '';
  const rejected = [];
  const fixed = [];
  const gaps = [];
  const starts = [];
  lines.forEach((line, li) => {
    for (const m of line.matchAll(NOTE_START)) starts.push({ li, m, n: Number(m[1]) });
    // "355) St. L. XVI, 2230. 356) St. L. XVI, 2238.": one space only, after the end of the note before.
    for (const m of line.matchAll(NOTE_WEAK)) starts.push({ li, m, n: Number(m[1]), weak: true });
  });
  starts.sort((a, b) => a.li - b.li || a.m.index - b.m.index);
  const textAfter = (x) => lines[x.li].slice(x.m.index + x.m[0].length).trim();
  const atLineStart = (x) => !lines[x.li].slice(0, x.m.index).trim();

  // Band 2 counts afresh: "1)" at the start of a line where the next number is missing.
  let base = last;
  if (!starts.some((x) => x.n === base + 1) && starts.some((x) => x.n === 1 && atLineStart(x)) && base > 1) base = 0;

  // The run of numbers on this page, each with the place it stands (strong before weak).
  const byNo = new Map();
  for (const x of starts) {
    const prev = byNo.get(x.n);
    if (!prev || (prev.weak && !x.weak)) byNo.set(x.n, x);
  }
  const chosen = new Map(); // index in starts → number given
  const used = new Set();
  let e = base + 1;
  for (;;) {
    const x = byNo.get(e);
    if (x && !used.has(x)) {
      chosen.set(starts.indexOf(x), e);
      used.add(x);
      e += 1;
      continue;
    }
    // A slip for e: a strong number, same length, at most two digits off, not one of the run that
    // follows right after e (that one is needed itself); the run must go on after e.
    const se = String(e);
    const run = new Set();
    for (let r = e + 1; byNo.has(r); r++) run.add(r);
    const diff = (y) => [...String(y.n)].filter((c, i) => c !== se[i]).length;
    const slip = starts
      .filter((y) => !y.weak && !used.has(y) && !run.has(y.n) && y.n !== e && String(y.n).length === se.length && diff(y) <= 2)
      .sort((a, b) => diff(a) - diff(b))[0];
    if (slip && run.size > 0) {
      chosen.set(starts.indexOf(slip), e);
      used.add(slip);
      fixed.push(`${slip.n} → ${e}`);
      e += 1;
      continue;
    }
    // A number missing in the transcription (page 17: 49, 50, 51, 53): go on with the next one there,
    // if it stands at the start of a line and is not far off.
    const next = starts.filter((y) => !y.weak && !used.has(y) && y.n > e && y.n <= e + 30).sort((a, b) => a.n - b.n)[0];
    if (next && !chosen.size && next.n > e + 3) {
      // Nothing of the run yet and a big step: only with a second number after it.
      if (!byNo.has(next.n + 1)) break;
    }
    if (next) {
      for (let g = e; g < next.n; g++) gaps.push(String(g));
      e = next.n;
      continue;
    }
    break;
  }
  const lastOfPage = e - 1;

  // Anything not chosen: a repeated note is left out, else it is text.
  const kind = new Map();
  starts.forEach((x, k) => {
    if (chosen.has(k)) kind.set(k, { as: String(chosen.get(k)) });
    else if (x.weak) return;
    else if (x.n <= lastOfPage && (known[x.n] ?? '').slice(0, 12) === textAfter(x).slice(0, 12) && known[x.n] !== undefined) {
      kind.set(k, { skip: true });
      rejected.push(`${x.n} doppelt`);
    } else {
      const twice = starts.find((y, j) => j !== k && chosen.get(j) === x.n);
      if (twice && textAfter(twice).slice(0, 12) === textAfter(x).slice(0, 12)) {
        kind.set(k, { skip: true });
        rejected.push(`${x.n} doppelt`);
      } else rejected.push(String(x.n));
    }
  });

  lines.forEach((line, li) => {
    if (!line.trim()) return;
    const here = starts.map((x, k) => ({ ...x, k })).filter((x) => x.li === li && kind.has(x.k));
    let at = 0;
    let target = notes.at(-1) ?? null;
    let skipping = false;
    const put = (text) => {
      if (!text || skipping) return;
      if (target) target.text = joinLine(target.text, text);
      else lead = joinLine(lead, text);
    };
    for (const x of here) {
      put(line.slice(at, x.m.index).trim());
      const kd = kind.get(x.k);
      skipping = !!kd.skip;
      if (!skipping) {
        target = { no: kd.as, text: '' };
        notes.push(target);
      }
      at = x.m.index + x.m[0].length;
    }
    put(line.slice(at).trim());
  });
  notes.sort((a, b) => Number(a.no) - Number(b.no));
  return { lead, notes, last: Math.max(lastOfPage, base === 0 ? lastOfPage : last), rejected, fixed, gaps };
}

/** Joins two lines of running text, undoing the hyphenation at the end of the first. */
export function joinLine(a, b) {
  if (!a) return b;
  if (!b) return a;
  // Band 2 marks the break of a word with "–" as well as with "-".
  const hy = /(\p{L})[-–]$/u.exec(a);
  if (hy) {
    const next = /^\p{L}+/u.exec(b)?.[0] ?? '';
    const stem = a.slice(0, -1);
    // "Tauf- und Abendmahl": a hyphen before a conjunction stays, with its space.
    if (/^(und|oder|sowie|bzw|noch|wie|als|bis|resp)$/.test(next)) return `${stem}- ${b}`;
    // "Los-von-der-Schrift": before a capital the hyphen is part of the word.
    if (/^\p{Lu}/u.test(next)) return `${stem}-${b}`;
    // "christ-lichen" or "kirchlich-dogmatisch": decided later, from the whole volume (see build.mjs).
    if (next) return `${stem}\u00AD${b}`;
    return `${a} ${b}`;
  }
  return `${a} ${b}`;
}

const indent = (line) => /^\s*/.exec(line)[0].length;

/**
 * A heading ends with " ^" (or "^" alone on a line, under a heading broken over
 * two lines). Returns the heading's text and how many lines before belong to it.
 * A "^" at the end of a line of running text ("… nämlich die ^") is a slip of
 * the transcription, not a heading.
 */
function headingAt(lines, i) {
  const line = lines[i];
  if (!/(^|\s)\^$/.test(line)) return null;
  let text = line.replace(/\s*\^$/, '').trim();
  let from = i;
  // Paragraphs are indented 3 to 5 spaces; a heading's second line stands further in.
  const centred = indent(line) >= 6;
  if (i > 0) {
    const prev = lines[i - 1];
    const p = prev.trim();
    const enumerated = /^(\d+|[A-Za-z]|[IVX]+)\.\s/.test(p);
    const unfinished = !/[.;:!?)”"]$/.test(p);
    // "oder inspiriert ist. ^", "Neuzeit. ^", "^": the rest of a heading begun on the line before.
    // A lower-case rest stands centred under its start; "zusprechen, wiewohl … verwerfen. ^" at the margin is running text.
    const rest = !text || (centred && (/^\p{Ll}/u.test(text) || (unfinished && (enumerated || indent(prev) >= 1))));
    if (rest && p && !/\^$/.test(prev) && p.length < 90 && (enumerated || unfinished || !text)) {
      text = text ? `${p} ${text}` : p;
      from = i - 1;
    }
  }
  text = text.replace(/^\d+\s*>\s*/, '').replace(/\s+/g, ' ').trim();
  if (!text) return null;
  const enumerated = /^(\d+|[A-Za-z]|[IVX]+)\.\s/.test(text);
  const ends = /[.)]\s*(\d+\))?$/.test(text);
  const heading = /^[\p{Lu}\d(]/u.test(text) && text.length < 160 && (ends || centred || enumerated) && !/[,:;]$/.test(text) && (ends || text.length < 75);
  return heading ? { text, from } : { stray: true };
}

/**
 * The stream of a volume: headings ({ kind: 'h', text, page }) and paragraphs
 * ({ kind: 'p', text, page, endPage, notes: { no: text } }), with footnote
 * markers turned into "[[no]]".
 */
export function stream(files, { titles = [], rawFixes = [] } = {}) {
  // Titles to find as whole lines, e.g. "Die Heilige Schrift."; slips of the source mended word for word first.
  const read = (f) => rawFixes.reduce((t, x) => t.split(x.from).join(x.to), readFileSync(f, 'utf8'));
  const all = files.flatMap((f) => pages(read(f)));
  // Pages split between two files (Band 2, 358) stand twice: join them.
  const byNo = [];
  for (const p of all) {
    const last = byNo.at(-1);
    if (last && last.no === p.no) {
      last.body.push(...p.body);
      last.notes.push(...p.notes);
    } else byNo.push(p);
  }
  const items = [];
  let para = null;
  const unplaced = [];
  const fixedMarks = [];
  const titleSet = new Map(titles.map((t) => [norm(t), t]));
  let lastNo = 0;
  const outOfTurn = [];
  const fixedNos = [];
  const missingNos = [];
  const known = {};
  for (const page of byNo) {
    const { lead, notes: found, last, rejected, fixed, gaps } = footnotes(page.notes, lastNo, known);
    lastNo = last;
    for (const g of gaps) missingNos.push(`S. ${page.no}: ${g}`);
    // A note whose text the transcription lacks: its number in the text still becomes a note, saying so.
    const notes = [...found, ...gaps.map((g) => ({ no: g, text: '[Der Text dieser Fußnote fehlt in der Abschrift.]', missing: true }))].sort(
      (a, b) => Number(a.no) - Number(b.no),
    );
    for (const n of notes) known[n.no] = n.text;
    for (const r of rejected) outOfTurn.push(`S. ${page.no}: ${r}`);
    for (const r of fixed) fixedNos.push(`S. ${page.no}: ${r}`);
    // A note running over from the page before.
    if (lead) {
      const prevNote = lastNote(items, para);
      if (prevNote) prevNote.ref[prevNote.no] = joinLine(prevNote.ref[prevNote.no], lead);
    }
    const lines = page.body;
    const heads = new Map();
    for (let i = 0; i < lines.length; i++) {
      const h = headingAt(lines, i);
      if (h?.stray) lines[i] = lines[i].replace(/\s*\^$/, '');
      else if (h) heads.set(h.from, { ...h, to: i });
    }
    let pageParas = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const h = heads.get(i);
      if (h) {
        para = null;
        items.push({ kind: 'h', text: h.text, page: page.no });
        i = h.to;
        continue;
      }
      if (!line.trim()) continue;
      // Titles set in the middle of the line without "^" ("Die Lehre von Gott."), named per volume.
      const title = titleSet.get(norm(line));
      if (title && indent(line) >= 8) {
        para = null;
        items.push({ kind: 'h', text: title, page: page.no });
        continue;
      }
      // Under a heading, centred: its Latin name ("(De Deo.)", "De fide salvifica.") or its end ("(genus maiestaticum).").
      if (indent(line) >= 8 && items.at(-1)?.kind === 'h' && line.trim().length < 80) {
        const t = line.trim();
        const h = items.at(-1);
        if (/^\(.*\)\.?$/.test(t) || /^De [a-z]/.test(t) || /^\('?Η /.test(t)) {
          h.sub = h.sub ? `${h.sub} ${t}` : t;
          continue;
        }
      }
      const startsNew = indent(line) >= 3 || !para;
      if (startsNew) {
        para = { kind: 'p', text: line.trim(), page: page.no, endPage: page.no, notes: {} };
        items.push(para);
        pageParas.push(para);
      } else {
        para.text = joinLine(para.text, line.trim());
        para.endPage = page.no;
        if (!pageParas.includes(para)) pageParas.push(para);
      }
    }
    // Footnote markers: the numbers of this page's notes, in their order, each after the one before.
    // A number slipped in the transcription ("auszuschließen.198)" for 193) stands for the note
    // missing at its place, if it lies before the next note's marker and is not itself a note here.
    const own = new Set(notes.map((n) => n.no));
    const markerRe = (no) => new RegExp(`(?<!\\d)(?<!\\d,\\s?)(?<=[\\p{L}\\p{P}\\s])\\s?${no}\\)`, 'gu');
    const STRAY = /(?<!\d)(?<!\d,\s?)(?<=[\p{L}\p{P}])\s?(\d{1,4})\)/gu;
    let cp = 0;
    let co = 0;
    const findFrom = (re, pi0, off0) => {
      for (let pi = pi0; pi < pageParas.length; pi++) {
        re.lastIndex = pi === pi0 ? off0 : 0;
        const m = re.exec(pageParas[pi].text);
        if (m) return { pi, m };
      }
      return null;
    };
    const place = (hit, no, text) => {
      const p = pageParas[hit.pi];
      const marker = `[[${no}]]`;
      p.text = p.text.slice(0, hit.m.index) + marker + p.text.slice(hit.m.index + hit.m[0].length);
      p.notes[no] = text;
      cp = hit.pi;
      co = hit.m.index + marker.length;
    };
    notes.forEach((n, k) => {
      const hit = findFrom(markerRe(n.no), cp, co);
      if (hit) {
        place(hit, n.no, n.text);
        return;
      }
      // The next note found sets the end of the stretch to look in.
      let end = null;
      for (const later of notes.slice(k + 1)) {
        end = findFrom(markerRe(later.no), cp, co);
        if (end) break;
      }
      const stray = findFrom(new RegExp(STRAY.source, 'gu'), cp, co);
      const before = stray && (!end || stray.pi < end.pi || (stray.pi === end.pi && stray.m.index < end.m.index));
      const close = stray && stray.m[1].length === n.no.length && [...stray.m[1]].filter((c, i) => c !== n.no[i]).length <= 2;
      const again = stray && own.has(stray.m[1]) && findFrom(markerRe(stray.m[1]), stray.pi, stray.m.index + stray.m[0].length);
      if (before && close && (!own.has(stray.m[1]) || again)) {
        place(stray, n.no, n.text);
        fixedMarks.push(`S. ${page.no}: ${stray.m[1]}) → ${n.no}`);
        return;
      }
      if (n.missing) return;
      // The marker is missing in the transcription: the note goes to the end of
      // the paragraph (not of the page, which may end mid-word), and on the list.
      const host = pageParas[cp] ?? pageParas.at(-1) ?? lastPara(items);
      if (host) {
        host.notes[n.no] = n.text;
        (host.pending ??= []).push(n.no);
      }
      unplaced.push(`S. ${page.no}: ${n.no})`);
    });
  }
  for (const p of items) {
    if (!p.pending) continue;
    p.text += p.pending.map((no) => `[[${no}]]`).join('');
    delete p.pending;
  }
  return { items, unplaced, outOfTurn, fixedNos, fixedMarks, missingNos, pages: byNo.length };
}

const norm = (s) => s.replace(/[\s.^]+/g, ' ').trim().toLowerCase();

function lastPara(items) {
  for (let i = items.length - 1; i >= 0; i--) if (items[i].kind === 'p') return items[i];
  return null;
}

function lastNote(items) {
  for (let i = items.length - 1; i >= 0; i--) {
    const p = items[i];
    if (p.kind !== 'p') continue;
    const keys = Object.keys(p.notes);
    if (keys.length) return { ref: p.notes, no: keys.at(-1) };
  }
  return null;
}
