/** A prayer or canticle, one entry per line as printed in the booklet. */
export interface Text {
  lines: readonly string[];
  /** Scripture reference, e.g. "Psalm 119,18" */
  ref?: string;
  /** Author or origin, e.g. "Nikolaus Herman, 1560" */
  source?: string;
}

/** Versicle and response. */
export interface Versicle {
  v: string;
  a: string;
}

export const text = (lines: readonly string[], extra: Omit<Text, 'lines'> = {}): Text => ({
  lines,
  ...extra,
});
