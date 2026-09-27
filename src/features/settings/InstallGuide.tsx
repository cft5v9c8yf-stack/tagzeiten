import { INSTALL_GUIDE, INSTALL_INTRO, INSTALL_NOTES } from '../../content/installGuide';
import { Guide } from './Guide';

/** Step-by-step guide: Tagzeiten on the home screen (Android and iPhone). */
export function InstallGuide() {
  return <Guide intro={INSTALL_INTRO} parts={INSTALL_GUIDE} notes={INSTALL_NOTES} />;
}
