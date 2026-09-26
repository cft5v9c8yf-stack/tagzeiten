export type SectionIcon = 'bible' | 'today' | 'prayer' | 'sunday' | 'catechism' | 'arena' | 'more';

export interface Section {
  path: string;
  label: string;
  icon: SectionIcon;
}

/** The week comes from its Sunday: it stands in the middle, in Luther's rose. */
export const SUNDAY_PATH = '/sonntag';

export const SECTIONS: readonly Section[] = [
  { path: '/arena', label: 'Arena', icon: 'arena' },
  { path: '/andacht', label: 'Andacht', icon: 'prayer' },
  { path: '/', label: 'Heute', icon: 'today' },
  { path: SUNDAY_PATH, label: 'Sonntag', icon: 'sunday' },
  { path: '/bibel', label: 'Bibel', icon: 'bible' },
  { path: '/katechismus', label: 'Lehre', icon: 'catechism' },
  { path: '/mehr', label: 'Mehr', icon: 'more' },
];
