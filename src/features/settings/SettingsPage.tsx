import type { ReactNode } from 'react';
import { SETTINGS_VERSES, type SettingsSectionId } from '../../content/settingsVerses';
import { composeVerse } from '../../domain/weeklyVerse';
import { BibleLink } from '../../ui/BibleLink';
import { Section } from '../../ui/Section';
import { About, ABOUT_INFO } from './About';
import { DATA_INFO, DataSettings } from './DataSettings';
import { HABITS_INFO, HabitSettings } from './HabitSettings';
import { PlanInfo, PlanSettings } from './PlanSettings';
import { PRAYER_INFO, PrayerSettings } from './PrayerSettings';
import { DisplaySettings, ScheduleSettings } from './ScheduleSettings';

/** A Bible verse where the explanation used to be; the explanation sits behind the "i". */
function SectionVerse({ id }: { id: SettingsSectionId }) {
  const v = SETTINGS_VERSES[id];
  return (
    <figure className="section-verse">
      <blockquote>{composeVerse(v)}</blockquote>
      <figcaption>
        <BibleLink reference={v.ref} />
      </figcaption>
    </figure>
  );
}

function MoreSection({
  id,
  title,
  info,
  level,
  children,
}: {
  id: string;
  title: string;
  info: ReactNode;
  level: 2 | 3;
  children: ReactNode;
}) {
  // Under "Mehr" everything starts folded, so the page opens as an overview.
  return (
    <Section id={`more.${id}`} title={title} level={level} info={info} defaultOpen={false} className="more-section">
      {id in SETTINGS_VERSES && <SectionVerse id={id as SettingsSectionId} />}
      {children}
    </Section>
  );
}

export function SettingsPage() {
  return (
    <div className="settings">
      <h2 className="visually-hidden">Mehr</h2>
      <MoreSection id="habits" title="Gewohnheiten" level={2} info={HABITS_INFO}>
        <HabitSettings />
      </MoreSection>
      <MoreSection id="prayer" title="Gebetsübersicht" level={2} info={PRAYER_INFO}>
        <PrayerSettings />
      </MoreSection>
      <MoreSection id="plan" title="Leseplan" level={2} info={<PlanInfo />}>
        <PlanSettings />
      </MoreSection>
      <MoreSection
        id="times"
        title="Zeiten"
        level={2}
        info={<p>Für den Tagesbogen auf der Startseite. Nicht jeder steht um vier auf.</p>}
      >
        <ScheduleSettings />
      </MoreSection>
      <MoreSection
        id="settings"
        title="Einstellungen"
        level={2}
        info={<p>Darstellung, deine Daten und Angaben zur App.</p>}
      >
        <MoreSection
          id="display"
          title="Darstellung"
          level={3}
          info={
            <p>
              „System“ folgt der Einstellung deines Geräts. Die Fassung von Vaterunser und Glaubensbekenntnis gilt in
              allen Gebetsordnungen der App.
            </p>
          }
        >
          <DisplaySettings />
        </MoreSection>
        <MoreSection id="data" title="Deine Daten" level={3} info={DATA_INFO}>
          <DataSettings />
        </MoreSection>
        <MoreSection id="about" title="Über Tagzeiten" level={3} info={ABOUT_INFO}>
          <About />
        </MoreSection>
      </MoreSection>
    </div>
  );
}
