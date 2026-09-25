/**
 * Psalm of the weekday with its antiphon. Only reference and antiphon are
 * shown; the psalm itself is read from the Bible (rule 13).
 * Keys follow Date.getDay(): 0 = Sunday.
 */
import type { Weekday } from '../domain/dates';

export interface WeekdayPsalm {
  psalm: number;
  antiphon: string;
}

export const MORNING_PSALMS: Record<Weekday, WeekdayPsalm> = {
  1: { psalm: 63, antiphon: 'Gott, du bist mein Gott; frühe suche ich dich.' },
  2: { psalm: 5, antiphon: 'HERR, frühe wollest du meine Stimme hören.' },
  3: { psalm: 36, antiphon: 'Bei dir ist die Quelle des Lebens, und in deinem Licht sehen wir das Licht.' },
  4: { psalm: 57, antiphon: 'Wache auf, meine Ehre, wache auf, Psalter und Harfe!' },
  5: { psalm: 51, antiphon: 'Schaffe in mir, Gott, ein reines Herz.' },
  6: { psalm: 92, antiphon: 'Des Morgens deine Gnade und des Nachts deine Wahrheit verkündigen.' },
  0: { psalm: 118, antiphon: 'Dies ist der Tag, den der HERR macht; laßt uns freuen und fröhlich darin sein.' },
};

export const EVENING_PSALMS: Record<Weekday, WeekdayPsalm> = {
  1: { psalm: 141, antiphon: 'Mein Gebet steige vor dir auf wie ein Räuchopfer.' },
  2: { psalm: 121, antiphon: 'Meine Hilfe kommt vom HERRN, der Himmel und Erde gemacht hat.' },
  3: { psalm: 130, antiphon: 'Bei dem HERRN ist die Gnade und viel Erlösung bei ihm.' },
  4: { psalm: 23, antiphon: 'Der HERR ist mein Hirte, mir wird nichts mangeln.' },
  5: { psalm: 51, antiphon: 'Schaffe in mir, Gott, ein reines Herz.' },
  6: { psalm: 84, antiphon: 'Wie lieblich sind deine Wohnungen, HERR Zebaoth.' },
  0: { psalm: 103, antiphon: 'Lobe den HERRN, meine Seele, und vergiß nicht, was er dir Gutes getan hat.' },
};

export const PSALM_RUBRIC_MORNING =
  'Der Psalm des Wochentages, mit seiner Antiphon. Er gehört nicht zur Bibellese und wird nicht ausgelegt – er wird gebetet.';
export const PSALM_RUBRIC_ANTIPHON = 'Die Antiphon wird wiederholt.';
