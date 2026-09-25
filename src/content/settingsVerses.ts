/**
 * A Bible verse above each section under "Mehr". Verbatim Luther 1912
 * excerpts, checked like the weekly verses (weeklyVerses.source.test.ts).
 */
import type { WeeklyVerse } from './weeklyVerses';

export type SettingsSectionId = 'habits' | 'prayer' | 'plan' | 'times' | 'settings' | 'display' | 'data' | 'about';

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
  settings: { ref: '1. Korinther 14,40', source: '1Kor 14,40', parts: ['Lasset alles ehrbar und ordentlich zugehen.'] },
  display: {
    ref: 'Psalm 139,12',
    source: 'Ps 139,12',
    parts: ['Denn auch Finsternis ist nicht finster bei dir, und die Nacht leuchtet wie der Tag, Finsternis ist wie das Licht.'],
  },
  data: {
    ref: 'Lukas 2,19',
    source: 'Lk 2,19',
    parts: ['Maria aber behielt alle diese Worte und bewegte sie in ihrem Herzen.'],
  },
  about: {
    ref: 'Markus 1,35',
    source: 'Mk 1,35',
    parts: ['des Morgens vor Tage stand er auf und ging hinaus. Und Jesus ging in eine wüste Stätte und betete daselbst.'],
  },
};
