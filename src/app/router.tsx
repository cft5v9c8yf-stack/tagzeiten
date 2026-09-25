import { createBrowserRouter } from 'react-router';
import { ArchivePage } from '../features/archive/ArchivePage';
import { CatechismPage } from '../features/catechism/CatechismPage';
import { EveningPage } from '../features/evening/EveningPage';
import { MorningPage } from '../features/morning/MorningPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { TodayPage } from '../features/today/TodayPage';
import { Layout } from './Layout';
import { NotFound } from './NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: 'morgen', element: <MorningPage /> },
      { path: 'abend', element: <EveningPage /> },
      { path: 'katechismus', element: <CatechismPage /> },
      { path: 'archiv', element: <ArchivePage /> },
      { path: 'mehr', element: <SettingsPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
