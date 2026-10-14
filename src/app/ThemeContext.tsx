import { useCallback, useEffect } from 'react';
import { useProfile, useStore } from '../data/hooks';
import { applyTheme, type Theme } from './theme';

/** Applies the colour scheme stored in the profile. */
export function ThemeSync() {
  const { theme } = useProfile();
  useEffect(() => applyTheme(theme), [theme]);
  return null;
}

export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void } {
  const store = useStore();
  const { theme } = useProfile();
  const setTheme = useCallback(
    (t: Theme) => store.updateProfile((p) => ({ ...p, theme: t }), { immediate: true }),
    [store],
  );
  return { theme, setTheme };
}
