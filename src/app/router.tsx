import { createBrowserRouter, createHashRouter } from 'react-router';
import { ArchivePage } from '../features/archive/ArchivePage';
import { BiblePage } from '../features/bible/BiblePage';
import { CatechismPage } from '../features/catechism/CatechismPage';
import { ChurchYearPage } from '../features/churchyear/ChurchYearPage';
import { DevotionIndex, DevotionPage, DevotionRedirect } from '../features/devotion/DevotionPage';
import { EveningPage } from '../features/evening/EveningPage';
import { MorningPage } from '../features/morning/MorningPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { SundayPage } from '../features/sunday/SundayPage';
import { TodayPage } from '../features/today/TodayPage';
import { Layout } from './Layout';
import { NotFound } from './NotFound';

const IS_DEMO = import.meta.env.MODE === 'demo';
if (IS_DEMO && !location.hash) location.hash = '#/';

// The demo runs inside a frame without server-side routing, hence hash URLs.
// BASE_URL is "/" normally and e.g. "/tagzeiten/" on GitHub Pages.
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
      { path: 'katechismus', element: <CatechismPage /> },
      { path: 'archiv', element: <ArchivePage /> },
      { path: 'mehr', element: <SettingsPage /> },
      { path: 'kirchenjahr', element: <ChurchYearPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], IS_DEMO ? undefined : { basename: import.meta.env.BASE_URL });
