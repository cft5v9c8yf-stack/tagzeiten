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
