/**
 * A Bible verse above each top section under "Mehr" (not above the settings). Verbatim Luther 1912
 * excerpts, checked like the weekly verses (weeklyVerses.source.test.ts).
 */
import type { WeeklyVerse } from './weeklyVerses';

export type SettingsSectionId = 'habits' | 'prayer' | 'plan' | 'times';

export const SETTINGS_VERSES: Record<SettingsSectionId, WeeklyVerse> = {
  habits: {
    ref: 'Daniel 6,11',
    source: 'Dan 6,11',
    parts: ['er fiel des Tages dreimal auf seine Kniee, betete, lobte und dankte seinem Gott, wie er denn bisher zu tun pflegte.'],
  },
  prayer: {
    ref: '1. Timotheus 2,1',
    source: '1Tim 2,1',
    parts: ['So ermahne ich euch nun, daß man vor allen Dingen zuerst tue Bitte, Gebet, Fürbitte und Danksagung für alle Menschen'],
  },
  plan: {
    ref: 'Psalm 119,105',
    source: 'Ps 119,105',
    parts: ['Dein Wort ist meines Fußes Leuchte und ein Licht auf meinem Wege.'],
  },
  times: { ref: 'Psalm 31,16', source: 'Ps 31,16', parts: ['Meine Zeit steht in deinen Händen.'] },
};
