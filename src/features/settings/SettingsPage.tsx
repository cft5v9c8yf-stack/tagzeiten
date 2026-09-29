import { useLayoutEffect, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { useProfile } from '../../data/hooks';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { SETTINGS_VERSES, type SettingsSectionId } from '../../content/settingsVerses';
import { FlowIcon, type FlowIconName } from '../../ui/FlowIcon';
import { setOpen } from '../../ui/collapseState';
import { InfoToggle } from '../../ui/Section';
import { TileGroup } from '../../ui/TileGroup';
import { SectionVerse } from '../../ui/SectionVerse';
import { ArchivePage } from '../archive/ArchivePage';
import { About, ABOUT_INFO } from './About';
import { AirplaneGuide } from './AirplaneGuide';
import { Imprint } from './Imprint';
import { Changelog } from './Changelog';
import { InstallGuide } from './InstallGuide';
import { DATA_INFO, DataSettings } from './DataSettings';
import { HABITS_INFO, HabitSettings } from './HabitSettings';
import { HOUSE_INFO, HouseSettings } from './HouseSettings';
import { PRAYER_INFO, PrayerSettings } from './PrayerSettings';
import { PrayerTreasury, TREASURY_INFO } from './PrayerTreasury';
import { DisplaySettings, ScheduleSettings } from './ScheduleSettings';

interface Area {
  slug: string;
  id: SettingsSectionId | 'settings' | 'review' | 'imprint' | 'changelog';
  title: string;
  /** One line on the tile: what can be set there. */
  line: string;
  icon: FlowIconName;
  info: ReactNode;
  body: () => ReactNode;
}

/**
 * Former areas, now parts of another: "/mehr/haus" opens "Gebet" with
 * "Mein Haus" unfolded, so links from the prayers keep working.
 */
const ALIASES: Record<string, { slug: string; open: string }> = {
  haus: { slug: 'gebet', open: 'more.house' },
  gebetsschatz: { slug: 'gebet', open: 'more.treasury' },
};

/** "Gebet": Mein Haus, the prayer list and the treasury of prayers as tiles. */
function PrayerTiles() {
  const house = useProfile().house;
  const names = [house.wife.name, ...house.children.map((c) => c.name)].map((n) => n.trim()).filter(Boolean);
  return (
    <TileGroup
      label="Gebet"
      items={[
        {
          id: 'more.house',
          title: 'Mein Haus',
          line: names.length ? names.join(', ') : 'Frau und Kinder',
          icon: 'house',
          info: HOUSE_INFO,
          content: <HouseSettings />,
        },
        {
          id: 'more.prayerlist',
          title: 'Gebetsübersicht',
          line: 'Anliegen nach Tagen',
          icon: 'people',
          info: PRAYER_INFO,
          content: <PrayerSettings />,
        },
        {
          id: 'more.treasury',
          title: 'Gebetsschatz',
          line: 'Gebete der Väter',
          icon: 'foldedHands',
          info: TREASURY_INFO,
          content: <PrayerTreasury />,
        },
      ]}
    />
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
    title: 'Gebet',
    line: 'Mein Haus, Übersicht, Gebetsschatz',
    icon: 'people',
    info: (
      <p>
        Alles, was in der Stillen Zeit gebetet wird und von dir kommt: deine Frau und deine Kinder mit Namen, deine
        Anliegen nach Tagen, und die Gebete, die du immer zur Hand haben willst.
      </p>
    ),
    body: () => <PrayerTiles />,
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
    slug: 'rueckblick',
    id: 'review',
    title: 'Rückblick',
    line: 'Tage, Verse, Arena, Erhörungen',
    icon: 'review',
    info: (
      <>
        <p>
          Alle Tage mit Einträgen, die Verse, die du dir notiert hast, die archivierten Einträge der Arena und die
          Gebetserhörungen aus „Mein Haus“ – alles durchsuchbar.
        </p>
        <p>
          Darunter auf Wunsch deine Gewohnheiten der letzten acht Wochen. Ein- und ausschalten unter „Einstellungen“ ›
          „Darstellung“ › „Gewohnheiten im Rückblick“.
        </p>
      </>
    ),
    body: () => <ArchivePage embedded />,
  },
  {
    slug: 'einstellungen',
    id: 'settings',
    title: 'Einstellungen',
    line: 'Darstellung, Daten, Installation, Flugmodus',
    icon: 'sliders',
    info: <p>Darstellung, deine Daten, Installation und Flugmodus, Angaben zur App.</p>,
    body: () => (
      <TileGroup
        label="Einstellungen"
        items={[
          {
            id: 'more.display',
            title: 'Darstellung',
            line: 'Farben und Teile der Andacht',
            icon: 'sliders',
            info: <p>Das Farbschema und welche Teile der Andacht erscheinen.</p>,
            content: <DisplaySettings />,
          },
          {
            id: 'more.data',
            title: 'Deine Daten',
            line: 'Sichern, einspielen, löschen',
            icon: 'changes',
            info: DATA_INFO,
            content: <DataSettings />,
          },
          {
            id: 'more.install',
            title: 'App installieren',
            line: 'Android und iPhone',
            icon: 'check',
            info: <p>Wie Henoch als App auf den Startbildschirm kommt, auf Android und auf dem iPhone, ohne Store.</p>,
            content: <InstallGuide level={4} />,
          },
          {
            id: 'more.airplane',
            title: 'Flugmodus beim Beten',
            line: 'Stille ohne Störung',
            icon: 'moon',
            info: <p>Wie das Telefon den Flugmodus einschaltet, solange Henoch offen ist, und danach wieder aus.</p>,
            content: <AirplaneGuide level={4} />,
          },
          {
            id: 'more.about',
            title: 'Über Henoch',
            line: 'Bogen, Quellen, Privatsphäre',
            icon: 'cross',
            info: ABOUT_INFO,
            content: <About />,
          },
        ]}
      />
    ),
  },


  {
    slug: 'versionen',
    id: 'changelog',
    title: 'Versionen',
    line: 'Was sich geändert hat',
    icon: 'changes',
    info: <p>Jede Version der App mit dem, was sie Neues gebracht hat. Die neueste steht oben.</p>,
    body: () => <Changelog />,
  },
  {
    slug: 'impressum',
    id: 'imprint',
    title: 'Impressum',
    line: 'Anbieter und Datenschutz',
    icon: 'scroll',
    info: <p>Wer hinter der App steht, woher die Texte kommen und was mit deinen Daten geschieht.</p>,
    body: () => <Imprint />,
  },
];

/** "Mehr": the areas as tiles, two side by side; a tile opens what can be set there. */
export function SettingsPage() {
  const { bereich } = useParams();
  const { date, isToday } = useSelectedDate();
  const alias = bereich ? ALIASES[bereich] : undefined;
  const area = AREAS.find((a) => a.slug === (alias?.slug ?? bereich));
  useLayoutEffect(() => {
    if (alias) setOpen(alias.open, true);
  }, [alias]);

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
