/**
 * Labels for the input fields the orders offer. Every field is optional:
 * a whole day can be prayed without touching the keyboard.
 */
import type { FieldPath } from './orders';

export interface FieldMeta {
  label: string;
  placeholder?: string;
  /** One line instead of a growing text area. */
  single?: boolean;
}

export const FIELDS: Record<FieldPath, FieldMeta> = {
  'morning.mainPoint': { label: 'Hauptaussage' },
  'morning.verseRef': { label: 'Stelle des Verses', placeholder: 'z. B. Markus 4,39', single: true },
  'morning.verse': { label: 'Vers, den ich mitnehme' },
  'morning.aboutGod': { label: 'Was lerne ich über Gott?' },
  'morning.aboutMan': { label: 'Was lerne ich über den Menschen?' },
  'morning.questionNo': { label: 'Frage des Tages' },
  'morning.questionAnswer': { label: 'Antwort' },
  'morning.salvationHistory': {
    label: 'Heilsgeschichte',
    placeholder: 'Schöpfung, Fall, Erlösung, Vollendung – wo steht der Text?',
  },
  'morning.unclear': { label: '? Unklar' },
  'morning.challenge': { label: '! Fordert mich heraus' },
  'morning.application': { label: '→ Umsetzung' },
  'morning.wreath.instruction': { label: 'Unterricht – Was sagst du mir hier?', placeholder: 'Herr, du sagst mir in diesem Wort …' },
  'morning.wreath.thanks': { label: 'Danksagung – Welche Gabe steckt darin?', placeholder: 'Ich danke dir, daß …' },
  'morning.wreath.petition': { label: 'Bitte – Was folgt daraus?', placeholder: 'Darum bitte ich dich …' },
  'morning.onMyHeart': { label: 'Was mich bewegt' },
  'morning.forMyself': { label: 'Bitte für mich' },
  'morning.peopleToday': { label: 'Menschen, denen ich heute begegne' },
  'morning.three.word': { label: 'Wort – aus der Lesung', single: true },
  'morning.three.house': { label: 'Haus – Frau und Kinder', single: true },
  'morning.three.work': { label: 'Werk – was morgen noch zählt', single: true },
  'evening.reading': { label: 'Lesung – wenige Verse, ohne Auslegung', placeholder: 'z. B. Lukas 24,13-35', single: true },
  'evening.intercession': { label: 'Fürbitte' },
  'evening.thanks.0': { label: 'Ich danke dir, mein Gott, für …', single: true },
  'evening.thanks.1': { label: 'und für …', single: true },
  'evening.thanks.2': { label: 'und für …', single: true },
  'evening.people': { label: 'Menschen des Tages', single: true },
  'evening.passedOnTo': { label: 'Weitergegeben an', placeholder: 'Wem habe ich das Gelesene weitergegeben?', single: true },
};

/** Fields with their own control instead of a text input. */
export const SPECIAL_FIELDS: ReadonlySet<FieldPath> = new Set(['morning.questionNo', 'evening.marks', 'evening.carry']);
