export type SectionIcon = 'bible' | 'today' | 'prayer' | 'sunday' | 'catechism' | 'arena' | 'more';

export interface Section {
  path: string;
  label: string;
  icon: SectionIcon;
  /** Further paths that belong to this section (its tab is marked there too). */
  also?: readonly string[];
}

/** The week comes from its Sunday: the app opens on it, and it belongs to "Heute". */
export const SUNDAY_PATH = '/sonntag';

/** Five tabs: the day, the order of prayer, the Word (Bible and teaching), the Arena, and more. */
export const SECTIONS: readonly Section[] = [
  { path: '/', label: 'Heute', icon: 'today', also: [SUNDAY_PATH] },
  { path: '/andacht', label: 'Andacht', icon: 'prayer' },
  { path: '/bibel', label: 'Wort', icon: 'bible', also: ['/katechismus'] },
  { path: '/arena', label: 'Arena', icon: 'arena' },
  { path: '/mehr', label: 'Mehr', icon: 'more' },
];

/** Whether a path belongs to a section. */
export const inSection = (s: Section, pathname: string): boolean =>
  (s.path === '/' ? pathname === '/' : pathname === s.path || pathname.startsWith(`${s.path}/`)) ||
  (s.also ?? []).some((p) => pathname === p || pathname.startsWith(`${p}/`));
