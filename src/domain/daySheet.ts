/**
 * The Tagesblatt of the printed order ("Tagesblatt – zum Kopieren"), made by the app
 * with the date and the day's reading already filled in, to be printed and written on
 * by hand (1.41). Nothing of it is stored: the thoughts stay on the paper.
 */
import { formatLong, type DateKey } from './dates';
import type { PrintDoc } from './printDoc';

export const DAY_SHEET_COMFORT = [{ text: 'Dein Wort ist meines Fußes Leuchte und ein Licht auf meinem Wege.', ref: 'Psalm 119,105' }] as const;

/** `reading`: the day's portions as text, e.g. "AT 1. Mose 3 · NT Matthäus 2". */
export function daySheetDoc(date: DateKey, reading: string): PrintDoc {
  return {
    place: 'Tagesblatt',
    title: 'Tagesblatt',
    subtitle: `${formatLong(date)} ${date.slice(0, 4)}`,
    verses: reading || undefined,
    blocks: [
      { kind: 'label', text: 'Ein Vers, den ich mitnehme' },
      { kind: 'write', lines: 2 },
      { kind: 'label', text: 'Was ich über Gott lerne' },
      { kind: 'write', lines: 3 },
      { kind: 'label', text: 'Was ich über den Menschen lerne' },
      { kind: 'write', lines: 3 },
      { kind: 'label', text: 'Die drei Dinge' },
      { kind: 'write', lines: 3, marks: ['Wort', 'Haus', 'Werk'] },
      { kind: 'para', runs: [{ text: 'Abends: + geschehen · ~ angefangen · – nicht geschehen. Ein Zeichen, kein Kommentar.', italic: true }] },
      { kind: 'label', text: 'Wem ich es weitergegeben habe' },
      { kind: 'write', lines: 2 },
    ],
    comfort: DAY_SHEET_COMFORT,
  };
}
