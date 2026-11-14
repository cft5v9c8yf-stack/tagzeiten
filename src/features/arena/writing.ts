export type Writing = 'text' | 'ink';
const WRITING_KEY = 'tz:arena-writing';

/** How the last entry was written, on this device: a convenience only. */
export const lastWriting = (): Writing => {
  try {
    return localStorage.getItem(WRITING_KEY) === 'ink' ? 'ink' : 'text';
  } catch {
    return 'text';
  }
};

export const rememberWriting = (w: Writing) => {
  try {
    localStorage.setItem(WRITING_KEY, w);
  } catch {
    // Only a convenience.
  }
};

export type Paper = 'blank' | 'lined' | 'grid' | 'dotted';
const PAPER_KEY = 'tz:ink-paper';
const PAPERS: readonly Paper[] = ['blank', 'lined', 'grid', 'dotted'];

/** The paper of the handwriting page, on this device: a convenience only. */
export const lastPaper = (): Paper => {
  try {
    const v = localStorage.getItem(PAPER_KEY) as Paper | null;
    return v && PAPERS.includes(v) ? v : 'blank';
  } catch {
    return 'blank';
  }
};

export const rememberPaper = (p: Paper) => {
  try {
    localStorage.setItem(PAPER_KEY, p);
  } catch {
    // Only a convenience.
  }
};
