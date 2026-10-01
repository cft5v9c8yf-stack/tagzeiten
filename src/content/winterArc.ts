/**
 * The Winter Arc ("Der 90-Tage-Standard"), word for word after
 * reference/winter-arc.md. Bible verses after Luther 1912, as given there.
 */
import type { WinterArcItemId, WinterArcTimes, WinterArcWeeklyId } from '../domain/winterArc';

export type WinterArcGroup = 'Morgen' | 'Arbeit' | 'Haus';

export interface WinterArcItem {
  id: WinterArcItemId;
  group: WinterArcGroup;
  /** The text as the tracker has it; the times come from "Meine Zeiten". */
  text: (t: WinterArcTimes) => string;
  /** What stands on days the point does not apply to ("Ruhe" for training, as in the tracker). */
  off: string;
}

/** The daily standard, in the order and groups of the tracker. */
export const WINTER_ARC_ITEMS: readonly WinterArcItem[] = [
  { id: 'wake', group: 'Morgen', text: (t) => `${t.wake} auf, kein Handy`, off: '–' },
  { id: 'word', group: 'Morgen', text: () => 'Morgenzeit im Wort und Gebet', off: '–' },
  { id: 'journal', group: 'Morgen', text: () => 'Tagebuch und drei Dankpunkte', off: '–' },
  { id: 'train', group: 'Morgen', text: () => 'Trainiert', off: 'Ruhe' },
  { id: 'focus1', group: 'Arbeit', text: (t) => `Fokusblock ${t.focus1}`, off: '–' },
  { id: 'focus2', group: 'Arbeit', text: (t) => `Block ${t.focus2}`, off: '–' },
  { id: 'cook', group: 'Haus', text: () => 'Zu Hause gekocht', off: '–' },
  { id: 'dinner', group: 'Haus', text: () => 'Abendessen ohne Handy', off: '–' },
  { id: 'wife', group: 'Haus', text: () => 'Eine Geste für meine Frau', off: '–' },
  { id: 'kitchen', group: 'Haus', text: (t) => `Küche um ${t.kitchen} zu`, off: '–' },
  { id: 'phone', group: 'Haus', text: () => 'Handy außerhalb des Schlafzimmers', off: '–' },
  { id: 'night', group: 'Haus', text: (t) => `Gebetet, ${t.night} Licht aus`, off: '–' },
];

export const WINTER_ARC_GROUPS: readonly WinterArcGroup[] = ['Morgen', 'Arbeit', 'Haus'];

/** The weekly standard, once in each week of the round. */
export const WINTER_ARC_WEEKLY: readonly { id: WinterArcWeeklyId; text: string }[] = [
  { id: 'church', text: 'Gottesdienst und Sonntagsruhe' },
  { id: 'talk', text: 'Sonntagsgespräch mit meiner Frau' },
  { id: 'date', text: 'Abend zu zweit, von mir geplant' },
  { id: 'money', text: '15 Minuten Finanzen' },
];

/** The monthly point; it counts for the calendar month. */
export const WINTER_ARC_MONTHLY = 'Gedient (einmal im Monat)';

/** "Meine Zeiten": what each time stands for. */
export const WINTER_ARC_TIME_LABELS: Record<keyof WinterArcTimes, string> = {
  wake: 'Aufstehen',
  focus1: 'Fokusblock',
  focus2: 'Zweiter Block',
  kitchen: 'Küche zu',
  night: 'Licht aus',
};
