import { useLayoutEffect, type ReactNode } from 'react';
import { BackLink } from '../../ui/BackLink';
import { OutArrow } from '../../ui/OutArrow';
import { Link, useParams } from 'react-router';
import { useProfile } from '../../data/hooks';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { SETTINGS_VERSES, type SettingsSectionId } from '../../content/settingsVerses';
import { FlowIcon, type FlowIconName } from '../../ui/FlowIcon';
import { setOpen } from '../../ui/collapseState';
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
  id: SettingsSectionId | 'display' | 'data' | 'about' | 'review' | 'imprint' | 'changelog';
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
/** The tiles under "Gebet", in order; one of them is open at a time. */
const PRAYER_TILES = ['more.house', 'more.prayerlist', 'more.treasury'] as const;

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
          icon: 'candle',
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
    icon: 'habits',
    info: HABITS_INFO,
    body: () => <HabitSettings />,
  },
  {
    slug: 'gebet',
    id: 'prayer',
    title: 'Gebet',
    line: 'Mein Haus, Übersicht, Gebetsschatz',
    icon: 'foldedHands',
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
    slug: 'darstellung',
    id: 'display',
    title: 'Darstellung',
    line: 'Farben und Teile der Andacht',
    icon: 'sliders',
    info: <p>Das Farbschema und welche Teile der Andacht erscheinen.</p>,
    body: () => <DisplaySettings />,
  },
  {
    slug: 'daten',
    id: 'data',
    title: 'Deine Daten',
    line: 'Sichern, einspielen, löschen',
    icon: 'archive',
    info: DATA_INFO,
    body: () => <DataSettings />,
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
          Darunter auf Wunsch deine Gewohnheiten der letzten acht Wochen. Ein- und ausschalten unter „Darstellung“ ›
          „Gewohnheiten im Rückblick“.
        </p>
      </>
    ),
    body: () => <ArchivePage embedded />,
  },
  {
    slug: 'ueber',
    id: 'about',
    title: 'Über Henoch',
    line: 'Quellen, Installation, Flugmodus',
    icon: 'info',
    info: ABOUT_INFO,
    body: () => (
      <>
        <About />
        <TileGroup
          label="Installation und Flugmodus"
          items={[
            {
              id: 'more.install',
              title: 'App installieren',
              line: 'Android und iPhone',
              icon: 'phone',
              info: <p>Wie Henoch als App auf den Startbildschirm kommt, auf Android und auf dem iPhone, ohne Store.</p>,
              content: <InstallGuide level={4} />,
            },
            {
              id: 'more.airplane',
              title: 'Flugmodus beim Beten',
              line: 'Stille ohne Störung',
              icon: 'airplane',
              info: <p>Wie du das Telefon in den Flugmodus schaltest, solange Henoch offen ist, und danach wieder zurück.</p>,
              content: <AirplaneGuide level={4} />,
            },
          ]}
        />
      </>
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

/** The news on the homepage; the only tile that leaves the app. */
const NEWS_URL = 'https://henoch.app/neuigkeiten/';

/** "Mehr": the areas as tiles, two side by side; a tile opens what can be set there. */
export function SettingsPage() {
  const { bereich } = useParams();
  const { date, isToday } = useSelectedDate();
  const alias = bereich ? ALIASES[bereich] : undefined;
  const area = AREAS.find((a) => a.slug === (alias?.slug ?? bereich));
  useLayoutEffect(() => {
    if (!alias) return;
    for (const id of PRAYER_TILES) setOpen(id, id === alias.open);
  }, [alias]);

  if (!area) {
    return (
      <div className="settings">
        <h2 className="visually-hidden">Mehr</h2>
        <ul className="more-tiles">
          {AREAS.filter((a) => a.slug !== 'impressum').map((a) => (
            <li key={a.slug}>
              <Link className="more-tile" to={withDate(`/mehr/${a.slug}`, date, isToday)}>
                <FlowIcon name={a.icon} size={22} />
                <span className="more-tile-title">{a.title}</span>
                <span className="more-tile-line">{a.line}</span>
              </Link>
            </li>
          ))}
          <li className="more-tile-wide">
            <a className="more-tile" href={NEWS_URL} target="_blank" rel="noopener noreferrer">
              <FlowIcon name="scroll" size={22} />
              <span className="more-tile-title">
                Neuigkeiten<OutArrow />
              </span>
              <span className="more-tile-line">Neues auf henoch.app</span>
            </a>
          </li>
        </ul>
        <p className="more-imprint">
          <Link to={withDate('/mehr/impressum', date, isToday)}>Impressum · Anbieter und Datenschutz</Link>
        </p>
        <p className="more-version small muted">Henoch {__APP_VERSION__}</p>
      </div>
    );
  }

  return (
    <div className="settings more-area">
      <div className="title-row">
        <BackLink to={withDate('/mehr', date, isToday)}>Mehr</BackLink>
        {/* Only the arrow and the title; the area's icon stays on its tile. */}
        <h2>{area.title}</h2>
      </div>
      <div className="more-area-info">{area.info}</div>
      {area.id in SETTINGS_VERSES && <SectionVerse id={area.id as SettingsSectionId} />}
      {area.body()}
    </div>
  );
}
