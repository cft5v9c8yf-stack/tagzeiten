export type SectionIcon = 'bible' | 'today' | 'prayer' | 'sunday' | 'catechism' | 'archive' | 'more';

export interface Section {
  path: string;
  label: string;
  icon: SectionIcon;
}

/** The week comes from its Sunday: it stands in the middle, in Luther's rose. */
export const SUNDAY_PATH = '/sonntag';

export const SECTIONS: readonly Section[] = [
  { path: '/archiv', label: 'Archiv', icon: 'archive' },
  { path: '/andacht', label: 'Andacht', icon: 'prayer' },
  { path: '/', label: 'Heute', icon: 'today' },
  { path: SUNDAY_PATH, label: 'Sonntag', icon: 'sunday' },
  { path: '/bibel', label: 'Bibel', icon: 'bible' },
  { path: '/katechismus', label: 'Katechismus', icon: 'catechism' },
  { path: '/mehr', label: 'Mehr', icon: 'more' },
];
