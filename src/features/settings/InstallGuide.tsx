import { INSTALL_GUIDE, INSTALL_INTRO, INSTALL_NOTES } from '../../content/installGuide';
import { Guide } from './Guide';

/** Step-by-step guide: Henoch on the home screen (Android and iPhone). */
export function InstallGuide({ level }: { level?: 3 | 4 }) {
  return <Guide intro={INSTALL_INTRO} parts={INSTALL_GUIDE} notes={INSTALL_NOTES} level={level} />;
}
