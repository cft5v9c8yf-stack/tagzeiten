import { useLayoutEffect, type ReactNode } from 'react';
import { BackLink } from '../../ui/BackLink';
import { OutArrow } from '../../ui/OutArrow';
import { Link, useParams } from 'react-router';
import { useProfile } from '../../data/hooks';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { SETTINGS_VERSES, type SettingsSectionId } from '../../content/settingsVerses';
import { FlowIcon, type FlowIconName } from '../../ui/FlowIcon';
import { setOpen } from '../../ui/collapseState';
import { TileGroup, type TileItem } from '../../ui/TileGroup';
import { SectionVerse } from '../../ui/SectionVerse';
import { ArchivePage } from '../archive/ArchivePage';
import { About, ABOUT_INFO } from './About';
import { AirplaneGuide } from './AirplaneGuide';
import { GUIDE_INFO, GuideArea } from '../onboarding/GuideArea';
import { Imprint } from './Imprint';
import { Changelog } from './Changelog';
import { InstallGuide } from './InstallGuide';
import { DATA_INFO, DataSettings } from './DataSettings';
import { HABITS_INFO, HabitSettings } from './HabitSettings';
import { HOUSE_INFO, HouseSettings } from './HouseSettings';
import { PRAYER_INFO, PrayerSettings } from './PrayerSettings';
import { PrayerTreasury, TREASURY_INFO } from './PrayerTreasury';
import { HabitHistorySwitch, ScheduleSettings, tilesOf, useDisplayTiles } from './ScheduleSettings';

interface Area {
  slug: string;
  id: SettingsSectionId | 'data' | 'about' | 'review' | 'imprint';
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

/** The tiles an old address can open, by group. */
const OPEN_GROUPS: readonly (readonly string[])[] = [
  PRAYER_TILES,
  ['more.times.schedule', 'more.display.atBed', 'more.display.compline', 'more.display.armor'],
  ['more.display.theme', 'more.install', 'more.airplane'],
  ['more.guide', 'more.changelog'],
];

const ALIASES: Record<string, { slug: string; open?: string }> = {
  haus: { slug: 'gebet', open: 'more.house' },
  gebetsschatz: { slug: 'gebet', open: 'more.treasury' },
  // Areas of before 1.34, now parts of another.
  zeiten: { slug: 'tag-und-woche', open: 'more.times.schedule' },
  andacht: { slug: 'tag-und-woche' },
  arena: { slug: 'tag-und-woche' },
  darstellung: { slug: 'app-und-daten', open: 'more.display.theme' },
  daten: { slug: 'app-und-daten' },
  anleitung: { slug: 'ueber', open: 'more.guide' },
  versionen: { slug: 'ueber', open: 'more.changelog' },
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

/** "Tag und Woche": the day, the week and the special times, each a group of tiles. */
function DayAndWeek() {
  const all = useDisplayTiles();
  const times: TileItem = {
    id: 'more.times.schedule',
    title: 'Zeiten',
    line: 'Aufstehen, Stille Zeit, Abend',
    icon: 'clock',
    info: <p>Für den Tagesbogen auf der Startseite. Nicht jeder steht um vier auf.</p>,
    content: <ScheduleSettings />,
  };
  return (
    <>
      <p className="more-group-title">Der Tag</p>
      <TileGroup level={4} label="Der Tag" items={[times, ...tilesOf(all, ['atBed', 'compline', 'armor'])]} />
      <p className="more-group-title">Die Woche</p>
      <TileGroup level={4} label="Die Woche" items={tilesOf(all, ['weekReview', 'sundayRest', 'well'])} />
      <p className="more-group-title">Besondere Zeiten</p>
      <TileGroup level={4} label="Besondere Zeiten" items={tilesOf(all, ['desert'])} />
    </>
  );
}

/** "App und Daten": how the app looks and where it lives, then your data. */
function AppAndData() {
  const all = useDisplayTiles();
  return (
    <>
      <p className="more-group-title">Die App</p>
      <TileGroup
        label="Die App"
        items={[
          all.theme!,
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
      <p className="more-group-title">Deine Daten</p>
      <DataSettings />
    </>
  );
}

/** "Über Henoch": what it is and where it comes from, the guide, the versions, the news. */
function AboutHenoch() {
  return (
    <>
      <About />
      <TileGroup
        level={4}
        label="Anleitung und Versionen"
        items={[
          {
            id: 'more.guide',
            title: 'Anleitung',
            line: 'Einrichtung noch einmal ansehen',
            icon: 'compass',
            info: GUIDE_INFO,
            content: <GuideArea />,
          },
          {
            id: 'more.changelog',
            title: 'Versionen',
            line: 'Was sich geändert hat',
            icon: 'changes',
            info: <p>Jede Version der App mit dem, was sie Neues gebracht hat. Die neueste steht oben.</p>,
            content: <Changelog />,
          },
        ]}
      />
      <p className="more-news">
        <a href={NEWS_URL} target="_blank" rel="noopener noreferrer" aria-label="Neuigkeiten, Neues auf henoch.app, öffnet im Browser">
          Neuigkeiten auf henoch.app
          <OutArrow />
        </a>
      </p>
    </>
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
    slug: 'tag-und-woche',
    id: 'times',
    title: 'Tag und Woche',
    line: 'Zeiten, Andacht, Sonntag, Wüstenzeit',
    icon: 'clock',
    info: (
      <p>
        Wie dein Tag und deine Woche laufen: die Zeiten für den Tagesbogen, welche Teile die Andacht hat, der Sonntag,
        das Treffen am Abendbrunnen und die Wüstenzeit.
      </p>
    ),
    body: () => <DayAndWeek />,
  },
  {
    slug: 'rueckblick',
    id: 'review',
    title: 'Rückblick',
    line: 'Tage, Verse, Arena',
    icon: 'review',
    info: (
      <p>
        Alle Tage mit Einträgen, die Verse, die du dir notiert hast, und die archivierten Einträge der Arena – alles
        durchsuchbar. Ganz unten schaltest du ein, ob auch deine Gewohnheiten
        der letzten acht Wochen hier stehen.
      </p>
    ),
    body: () => (
      <>
        <ArchivePage embedded />
        <HabitHistorySwitch />
      </>
    ),
  },
  {
    slug: 'app-und-daten',
    id: 'data',
    title: 'App und Daten',
    line: 'Farbschema, Sichern, Installation',
    icon: 'archive',
    info: DATA_INFO,
    body: () => <AppAndData />,
  },
  {
    slug: 'ueber',
    id: 'about',
    title: 'Über Henoch',
    line: 'Quellen, Anleitung, Versionen',
    icon: 'info',
    info: ABOUT_INFO,
    body: () => <AboutHenoch />,
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
    const open = alias?.open;
    if (!open) return;
    // The tile asked for opens; the others of its group close (one is open at a time).
    for (const id of OPEN_GROUPS.find((g) => g.includes(open)) ?? [open]) setOpen(id, id === open);
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
