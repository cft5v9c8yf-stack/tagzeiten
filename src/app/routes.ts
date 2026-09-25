export type SectionIcon = 'bible' | 'today' | 'morning' | 'evening' | 'catechism' | 'archive' | 'more';

export interface Section {
  path: string;
  label: string;
  icon: SectionIcon;
}

export const SECTIONS: readonly Section[] = [
  { path: '/bibel', label: 'Bibel', icon: 'bible' },
  { path: '/morgen', label: 'Morgen', icon: 'morning' },
  { path: '/abend', label: 'Abend', icon: 'evening' },
  // Today sits in the middle of the bar, a little larger (see nav.tabs .tab-today).
  { path: '/', label: 'Heute', icon: 'today' },
  { path: '/katechismus', label: 'Katechismus', icon: 'catechism' },
  { path: '/archiv', label: 'Archiv', icon: 'archive' },
  { path: '/mehr', label: 'Mehr', icon: 'more' },
];
