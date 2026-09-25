import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { SETTINGS_VERSES, type SettingsSectionId } from '../../content/settingsVerses';
import { FlowIcon, type FlowIconName } from '../../ui/FlowIcon';
import { InfoToggle, Section } from '../../ui/Section';
import { SectionVerse } from '../../ui/SectionVerse';
import { About, ABOUT_INFO } from './About';
import { DATA_INFO, DataSettings } from './DataSettings';
import { HABITS_INFO, HabitSettings } from './HabitSettings';
import { PRAYER_INFO, PrayerSettings } from './PrayerSettings';
import { DisplaySettings, ScheduleSettings } from './ScheduleSettings';

interface Area {
  slug: string;
  id: SettingsSectionId | 'settings';
  title: string;
  /** One line on the tile: what can be set there. */
  line: string;
  icon: FlowIconName;
  info: ReactNode;
  body: () => ReactNode;
}

function Sub({ id, title, info, children }: { id: string; title: string; info: ReactNode; children: ReactNode }) {
  // Within "Einstellungen" the parts start folded, so the page opens as an overview.
  return (
    <Section id={`more.${id}`} title={title} level={3} info={info} defaultOpen={false} className="more-section">
      {children}
    </Section>
  );
}

const AREAS: readonly Area[] = [
  {
    slug: 'gewohnheiten',
    id: 'habits',
    title: 'Gewohnheiten',
    line: 'Täglich, wöchentlich, monatlich',
    icon: 'check',
    info: HABITS_INFO,
    body: () => <HabitSettings />,
  },
  {
    slug: 'gebet',
    id: 'prayer',
    title: 'Gebetsübersicht',
    line: 'Anliegen für jeden Wochentag',
    icon: 'people',
    info: PRAYER_INFO,
    body: () => <PrayerSettings />,
  },
  {
    slug: 'zeiten',
    id: 'times',
    title: 'Zeiten',
    line: 'Aufstehen, Stille Zeit, Abend',
    icon: 'clock',
    info: <p>Für den Tagesbogen auf der Startseite. Nicht jeder steht um vier auf.</p>,
    body: () => <ScheduleSettings />,
  },
  {
    slug: 'einstellungen',
    id: 'settings',
    title: 'Einstellungen',
    line: 'Darstellung, Daten, über die App',
    icon: 'sliders',
    info: <p>Darstellung, deine Daten und Angaben zur App.</p>,
    body: () => (
      <>
        <Sub
          id="display"
          title="Darstellung"
          info={
            <p>
              „System“ folgt der Einstellung deines Geräts. Die Fassung von Vaterunser und Glaubensbekenntnis gilt in
              allen Gebetsordnungen der App.
            </p>
          }
        >
          <DisplaySettings />
        </Sub>
        <Sub id="data" title="Deine Daten" info={DATA_INFO}>
          <DataSettings />
        </Sub>
        <Sub id="about" title="Über Tagzeiten" info={ABOUT_INFO}>
          <About />
        </Sub>
      </>
    ),
  },
];

/** "Mehr": the areas as tiles, two side by side; a tile opens what can be set there. */
export function SettingsPage() {
  const { bereich } = useParams();
  const { date, isToday } = useSelectedDate();
  const area = AREAS.find((a) => a.slug === bereich);

  if (!area) {
    return (
      <div className="settings">
        <h2>Mehr</h2>
        <ul className="more-tiles">
          {AREAS.map((a) => (
            <li key={a.slug}>
              <Link className="more-tile" to={withDate(`/mehr/${a.slug}`, date, isToday)}>
                <FlowIcon name={a.icon} size={26} />
                <span className="more-tile-title">{a.title}</span>
                <span className="more-tile-line">{a.line}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="settings more-area">
      <p className="back-link">
        <Link to={withDate('/mehr', date, isToday)}>‹ Mehr</Link>
      </p>
      <div className="fold-head more-area-head">
        <h2>
          <FlowIcon name={area.icon} size={24} />
          {area.title}
        </h2>
        <InfoToggle title={area.title}>{area.info}</InfoToggle>
      </div>
      {area.id in SETTINGS_VERSES && <SectionVerse id={area.id as SettingsSectionId} />}
      {area.body()}
    </div>
  );
}
