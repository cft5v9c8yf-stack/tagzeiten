import { About } from './About';
import { DataSettings } from './DataSettings';
import { HabitSettings } from './HabitSettings';
import { PlanSettings } from './PlanSettings';
import { PrayerSettings } from './PrayerSettings';
import { DisplaySettings, ScheduleSettings } from './ScheduleSettings';

const SECTIONS = [
  ['habits-settings', 'Gewohnheiten'],
  ['prayer-settings', 'Gebetsübersicht'],
  ['plan-settings', 'Leseplan'],
  ['schedule-settings', 'Zeiten'],
  ['display-settings', 'Darstellung'],
  ['data-settings', 'Daten'],
  ['about', 'Über'],
] as const;

export function SettingsPage() {
  return (
    <div className="settings">
      <h2 className="visually-hidden">Mehr</h2>
      <nav aria-label="Abschnitte" className="settings-toc">
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={(e) => {
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView({ block: 'start' });
          }}>
            {label}
          </a>
        ))}
      </nav>
      <HabitSettings />
      <PrayerSettings />
      <PlanSettings />
      <ScheduleSettings />
      <DisplaySettings />
      <DataSettings />
      <About />
    </div>
  );
}
