/**
 * Data model for profile and days.
 *
 * Every free-text field is declared in one of the runtime lists below and the
 * TypeScript types are derived from them. This lets tests inspect the complete
 * schema at runtime (rule 9: there is no field for confessing sins, anywhere).
 */
import type { DateKey, Weekday } from './dates';

/* ---------------------------------------------------------------- fields */

/** Free-text fields of the morning order. */
export const MORNING_TEXT_FIELDS = [
  'mainPoint', // Hauptaussage
  'verseRef', // Stelle des Verses
  'verse', // Vers, den ich mitnehme
  'aboutGod', // Was lerne ich über Gott?
  'aboutMan', // Was lerne ich über den Menschen?
  'questionAnswer', // Antwort auf die Frage des Tages
  'salvationHistory', // Heilsgeschichte
  'unclear', // ? Unklar
  'challenge', // ! Fordert mich heraus
  'application', // → Umsetzung
  'onMyHeart', // Was mich bewegt (freies Gebet)
  'forMyself', // Bitte für mich
  'peopleToday', // Menschen, denen ich heute begegne
] as const;

/**
 * Written parts of the fourfold wreath. Confession is deliberately absent:
 * it is prayed, not recorded (rule 9).
 */
export const WREATH_FIELDS = ['instruction', 'thanks', 'petition'] as const;

/** The three things of the day: Wort, Haus, Werk. */
export const THREE_KEYS = ['word', 'house', 'work'] as const;

/** Free-text fields of the evening (vespers and compline). */
export const EVENING_TEXT_FIELDS = [
  'reading', // Vesper: Lesung
  'intercession', // Vesper: Fürbitte
  'people', // Nachtgebet: Menschen des Tages
  'passedOnTo', // Nachtgebet: Weitergegeben an
] as const;

/** Number of thanksgiving lines in compline. */
export const THANKS_COUNT = 3;

export type MorningTextField = (typeof MORNING_TEXT_FIELDS)[number];
export type WreathField = (typeof WREATH_FIELDS)[number];
export type ThreeKey = (typeof THREE_KEYS)[number];
export type EveningTextField = (typeof EVENING_TEXT_FIELDS)[number];

/** Evening review of each of the three things: + ~ – */
export type Mark = 'plus' | 'tilde' | 'minus';
/** What happens with a thing that did not (fully) happen. */
export type Carry = 'again' | 'drop';

/** Every order has a short form, and it counts in full (rule 8). */
export type OrderForm = 'full' | 'short';

/* ---------------------------------------------------------------- day */

export interface DayReading {
  planId: string;
  /** Portion index per track of the plan, e.g. { at: 12, nt: 40 }. */
  portions: Record<string, number>;
  done: boolean;
}

export type MorningEntry = {
  form: OrderForm;
  /** Completed steps, by step id of the chosen form. */
  steps: Record<string, boolean>;
  done: boolean;
  atBed: boolean;
  /** Index into the seven questions, if one was chosen. */
  questionNo?: number;
  wreath: Partial<Record<WreathField, string>>;
  three: Partial<Record<ThreeKey, string>>;
} & Partial<Record<MorningTextField, string>>;

export type EveningEntry = {
  vespersDone: boolean;
  vespersForm: OrderForm;
  complineDone: boolean;
  complineForm: OrderForm;
  thanks: string[];
  marks: Partial<Record<ThreeKey, Mark>>;
  carry: Partial<Record<ThreeKey, Carry>>;
} & Partial<Record<EveningTextField, string>>;

export interface Day {
  date: DateKey;
  reading?: DayReading;
  morning: MorningEntry;
  evening: EveningEntry;
  /** Manually recorded habits of this day, by habit id. */
  habits: Record<string, boolean>;
  updatedAt: number;
}

export function emptyDay(date: DateKey): Day {
  return {
    date,
    morning: { form: 'full', steps: {}, done: false, atBed: false, wreath: {}, three: {} },
    evening: {
      vespersDone: false,
      vespersForm: 'full',
      complineDone: false,
      complineForm: 'full',
      thanks: [],
      marks: {},
      carry: {},
    },
    habits: {},
    updatedAt: 0,
  };
}

/* ---------------------------------------------------------------- profile */

export type Rhythm = 'daily' | 'weekly' | 'monthly';
/** Habits derived from the orders; they cannot be toggled by hand. */
export type AutoSource = 'morning' | 'vespers' | 'compline';

export interface Habit {
  id: string;
  name: string;
  rhythm: Rhythm;
  auto: AutoSource | null;
  active: boolean;
  preset: boolean;
  /** Marked with a star by the user as a current focus. A bookmark, not an award. */
  focus: boolean;
}

export type Theme = 'system' | 'light' | 'dark';
/** Wording of Lord's Prayer and Creed in the orders. */
export type TextVariant = 'ecumenical' | 'luther';

export interface Schedule {
  /** "HH:MM" */
  rise: string;
  stillTime: string;
  vespers: string;
  compline: string;
  lightsOut: string;
}

export interface Profile {
  plan: {
    planId: string;
    /** Portion index per track, of the current plan and of earlier ones, kept for a return. */
    positions: Record<string, number>;
    /** The last plan of one's own (e.g. "eigen-k3"), remembered while the fixed plan is chosen. */
    own?: string;
    /** The last amounts of the fixed plan (e.g. "atnt-3-1"), remembered while a plan of one's own is chosen. */
    fixed?: string;
  };
  habits: Habit[];
  prayer: { daily: string; weekly: Partial<Record<Weekday, string>> };
  catechism: { memorized: Record<string, boolean>; weekOffset: number };
  schedule: Schedule;
  theme: Theme;
  texts: TextVariant;
  createdAt: DateKey;
  updatedAt: number;
}

export const DEFAULT_SCHEDULE: Schedule = {
  rise: '04:00',
  stillTime: '04:15',
  vespers: '18:30',
  compline: '20:45',
  lightsOut: '21:00',
};
