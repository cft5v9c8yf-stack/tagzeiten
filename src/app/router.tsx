import { createBrowserRouter, createHashRouter, Navigate } from 'react-router';
import { ArenaPage } from '../features/arena/ArenaPage';
import { BiblePage } from '../features/bible/BiblePage';
import { CatechismPage } from '../features/catechism/CatechismPage';
import { ChurchYearPage } from '../features/churchyear/ChurchYearPage';
import { SearchPage } from '../features/search/SearchPage';
import { DevotionIndex, DevotionPage, DevotionRedirect } from '../features/devotion/DevotionPage';
import { EveningPage } from '../features/evening/EveningPage';
import { MorningPage } from '../features/morning/MorningPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { SundayPage } from '../features/sunday/SundayPage';
import { SundayGuidePage } from '../features/sunday/SundayGuidePage';
import { ScripturePrayerPage } from '../features/sunday/ScripturePrayerPage';
import { TodayPage } from '../features/today/TodayPage';
import { Layout } from './Layout';
import { NotFound } from './NotFound';

const IS_DEMO = import.meta.env.MODE === 'demo';
if (IS_DEMO && !location.hash) location.hash = '#/';

// The demo runs inside a frame without server-side routing, hence hash URLs.
// BASE_URL is "/" normally, or the sub-path from BASE_PATH.
export const router = (IS_DEMO ? createHashRouter : createBrowserRouter)([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: 'bibel', element: <BiblePage /> },
      {
        path: 'andacht',
        element: <DevotionPage />,
        children: [
          { index: true, element: <DevotionIndex /> },
          { path: 'morgen', element: <MorningPage /> },
          { path: 'abend', element: <EveningPage /> },
        ],
      },
      { path: 'morgen', element: <DevotionRedirect part="morgen" /> },
      { path: 'abend', element: <DevotionRedirect part="abend" /> },
      { path: 'sonntag', element: <SundayPage /> },
      { path: 'sonntag/hilfe', element: <SundayGuidePage /> },
      { path: 'sonntag/gebet', element: <ScripturePrayerPage /> },
      { path: 'katechismus', element: <CatechismPage /> },
      { path: 'katechismus/:teil', element: <CatechismPage /> },
      { path: 'arena', element: <ArenaPage /> },
      { path: 'arena/:eintrag', element: <ArenaPage /> },
      // The archive now stands under "Mehr" as "Rückblick".
      { path: 'archiv', element: <Navigate to="/mehr/rueckblick" replace /> },
      // The reading plan is set under "Wort" (an old address led to the overview of "Mehr").
      { path: 'mehr/leseplan', element: <Navigate to="/bibel" replace /> },
      { path: 'mehr', element: <SettingsPage /> },
      { path: 'mehr/:bereich', element: <SettingsPage /> },
      { path: 'kirchenjahr', element: <ChurchYearPage /> },
      { path: 'suche', element: <SearchPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], IS_DEMO ? undefined : { basename: import.meta.env.BASE_URL });
