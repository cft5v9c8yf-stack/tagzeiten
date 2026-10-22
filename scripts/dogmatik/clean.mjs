/**
 * Careful clean-up of the transcription: only what is plainly not Pieper's
 * text or plainly typographical. Every removal of a bracket is logged.
 */

/** Notes of the transcriber in English ("[English ed. 81]", "[sic – p. 228, not 248]"). */
const TRANSCRIBER =
  /\[[^\[\]]*?(?:\b(?:English|transl(?:ation|ated)?|see|sic|missing|not|here|edition|ed\.|pgs?\.?|pp?\.|page|Note:|TOC|printed|book|Vol\.|vol\.|Google|Download|PDF|WorldCat|BookOfConcord|blog|Am\.? Ed|AE)\b|^\[Ed\b)[^\[\]]*\]/g;

const HEB = '\\u0590-\\u05FF\\uFB1D-\\uFB4F';

/**
 * Hebrew: the transcription has it as "[ נֵר HEBREW]" between direction marks,
 * the letters often doubled or out of order, or only as "XXX [HEBREW]". Each
 * place becomes "[hebräisch]", to be filled in from the print.
 */
function hebrew(t, log) {
  let out = t.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');
  // "XXX und XXXX" for two Hebrew words (Band 1, 1 Mos. 1, 26); "c. XXX", "Cap. XXXI" are Roman numbers.
  out = out.replace(/(?<!\b(?:c|Cap|cap|chap|Kap|p|S|sess|lib|Bd)\.\s)\bX{3,4}\b(?!\s*\[?\s*HEBREW)/g, '[hebräisch]');
  out = out.replace(new RegExp(`(?:X{2,}\\s*)?\\[?[\\s${HEB}׀]*HEBREW[^\\]]*\\]`, 'g'), (m) => {
    log?.push(m.trim());
    return '[hebräisch]';
  });
  out = out.replace(new RegExp(`[${HEB}][\\s${HEB}׀]*`, 'g'), (m) => {
    log?.push(m.trim());
    return '[hebräisch] ';
  });
  // "([ [hebräisch]" and doubled places: one place, in its parentheses.
  return out
    .replace(/\[\s*\)?\s*\[hebräisch\]/g, '[hebräisch]')
    .replace(/(\[hebräisch\]\s*)+/g, '[hebräisch] ')
    .replace(/\[hebräisch\] ([),.;:\]])/g, '[hebräisch]$1')
    .replace(/\[hebräisch\](,\s*\[hebräisch\])+/g, '[hebräisch]')
    .replace(/\(\s+\[hebräisch\]/g, '([hebräisch]');
}

/** English references of the transcriber ("[Isaiah 63:9]"): chapter and verse with a colon, not Pieper's comma. */
const ENGLISH_REF = /\s?\[[^\[\]]*\b\d+:\d+[^\[\]]*\]/g;

export function clean(text, log, fixes = []) {
  let t = text;
  for (const f of fixes) if (t.includes(f.from)) t = t.split(f.from).join(f.to);
  t = hebrew(t, log);
  t = t.replace(TRANSCRIBER, (m) => {
    log?.push(m);
    return '';
  });
  t = t.replace(ENGLISH_REF, (m) => {
    log?.push(m.trim());
    return '';
  });
  // Quotation marks: „…” of the transcription → „…“; straight quotes in pairs.
  t = t.replace(/”/g, '“');
  t = t.replace(/(^|[\s(\[—–-])"(?=\S)/g, '$1„').replace(/"/g, '“');
  // Dashes: ranges and the dash between words.
  t = t.replace(/(\d)\s?—\s?(\d)/g, '$1–$2').replace(/\s—\s/g, ' – ').replace(/—/g, '–');
  // Stray "^" of the transcription.
  t = t.replace(/\s*\^(?=\s|$)/g, '');
  // Greek: "ϑ" is the same letter as "θ"; "ΰ" in this transcription is a misread θ ("Κατηργήΰητε").
  t = t.replace(/ϑ/g, 'θ').replace(/(?<=\p{Script=Greek})ΰ|ΰ(?=\p{Script=Greek})/gu, 'θ');
  // Spaces: before punctuation, and doubled.
  t = t.replace(/(\p{L}) ([,;])/gu, '$1$2').replace(/ {2,}/g, ' ');
  return t.trim();
}
