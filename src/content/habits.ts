/**
 * Habit templates: Lutheran, for the man as head of the house, husband, brother.
 * No streaks and no chains (rule 4) – a habit is only ever "done" for a day,
 * a week or a month.
 */
import type { AutoSource, Rhythm } from '../domain/model';

export interface HabitPreset {
  id: string;
  name: string;
  rhythm: Rhythm;
  auto: AutoSource | null;
  /** Active on first start. */
  active: boolean;
  /** Also switched on for existing users when an update brings it (it replaces an earlier control). */
  activeOnUpdate?: boolean;
}

export const HABIT_PRESETS: readonly HabitPreset[] = [
  { id: 'stillTime', name: 'Stille Zeit', rhythm: 'daily', auto: 'morning', active: true },
  // Ticking it marks the day's portion as read and moves the reading plan on.
  { id: 'bibleReading', name: 'Bibel lesen', rhythm: 'daily', auto: null, active: true, activeOnUpdate: true },
  // The Vesper is the personal close of the day; with the family there is the Familienandacht.
  { id: 'vespers', name: 'Vesper', rhythm: 'daily', auto: 'vespers', active: true },
  { id: 'compline', name: 'Nachtgebet', rhythm: 'daily', auto: 'compline', active: true },
  { id: 'tablePrayer', name: 'Tischgebet mit der Familie', rhythm: 'daily', auto: null, active: true },
  { id: 'familyDevotion', name: 'Familienandacht', rhythm: 'daily', auto: null, active: true, activeOnUpdate: true },
  { id: 'blessChildren', name: 'Die Kinder segnen', rhythm: 'daily', auto: null, active: true },
  { id: 'prayWithWife', name: 'Mit meiner Frau beten', rhythm: 'daily', auto: null, active: false },
  { id: 'memoryVerse', name: 'Vers auswendig wiederholen', rhythm: 'daily', auto: null, active: false },
  { id: 'exercise', name: 'Leibliche Übung', rhythm: 'daily', auto: null, active: false },
  { id: 'worship', name: 'Gottesdienst – den Feiertag heiligen', rhythm: 'weekly', auto: null, active: true },
  { id: 'catechismChildren', name: 'Katechismus mit den Kindern', rhythm: 'weekly', auto: null, active: true },
  { id: 'fasting', name: 'Fasten', rhythm: 'weekly', auto: null, active: false },
  { id: 'brothers', name: 'Gemeinschaft mit Brüdern', rhythm: 'weekly', auto: null, active: false },
  { id: 'timeWithWife', name: 'Zeit allein mit meiner Frau', rhythm: 'weekly', auto: null, active: false },
  { id: 'privateConfession', name: 'Privatbeichte', rhythm: 'monthly', auto: null, active: true },
  { id: 'lordsSupper', name: 'Abendmahl', rhythm: 'monthly', auto: null, active: true },
  { id: 'offering', name: 'Opfer und Gaben', rhythm: 'monthly', auto: null, active: false },
  { id: 'mercy', name: 'Werk der Barmherzigkeit', rhythm: 'monthly', auto: null, active: false },
];

/** Preset names that changed; a habit still carrying the old name gets the new one. */
export const RENAMED_PRESETS: Readonly<Record<string, { from: string; to: string }>> = {
  vespers: { from: 'Vesper mit der Familie', to: 'Vesper' },
};

/** The habit that stands for the day's reading of the plan (see domain/habits.ts). */
export const READING_HABIT = 'bibleReading';

/** Habit toggled by "Mit den Kindern gelernt" on the catechism page. */
export const CATECHISM_WITH_CHILDREN_HABIT = 'catechismChildren';

export const RHYTHM_LABEL: Record<Rhythm, string> = {
  daily: 'täglich',
  weekly: 'wöchentlich',
  monthly: 'monatlich',
};
