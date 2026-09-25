export type SectionIcon = 'today' | 'morning' | 'evening' | 'catechism' | 'archive' | 'more';

export interface Section {
  path: string;
  label: string;
  icon: SectionIcon;
}

export const SECTIONS: readonly Section[] = [
  { path: '/', label: 'Heute', icon: 'today' },
  { path: '/morgen', label: 'Morgen', icon: 'morning' },
  { path: '/abend', label: 'Abend', icon: 'evening' },
  { path: '/katechismus', label: 'Katechismus', icon: 'catechism' },
  { path: '/archiv', label: 'Archiv', icon: 'archive' },
  { path: '/mehr', label: 'Mehr', icon: 'more' },
];
