export type Theme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'tz:theme';

/**
 * The profile (IndexedDB) is the source of truth for the theme once the data
 * layer exists; localStorage only mirrors it so index.html can apply the
 * scheme before first paint.
 */
export function readStoredTheme(): Theme {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    return t === 'light' || t === 'dark' ? t : 'system';
  } catch {
    return 'system';
  }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  try {
    if (theme === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the scheme still applies for this session.
  }
}
