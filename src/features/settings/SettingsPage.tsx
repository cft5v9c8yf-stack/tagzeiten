import { useTheme } from '../../app/ThemeContext';
import type { Theme } from '../../app/theme';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <h2>Mehr</h2>
      <h3>Farbschema</h3>
      <div className="seg" role="group" aria-label="Farbschema">
        {THEMES.map((t) => (
          <button
            key={t.value}
            type="button"
            aria-pressed={theme === t.value}
            onClick={() => setTheme(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="empty">Gewohnheiten, Gebetsübersicht, Leseplan, Zeiten und Daten folgen in Meilenstein 6.</p>
    </>
  );
}
