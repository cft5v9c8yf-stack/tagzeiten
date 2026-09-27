import { AIRPLANE_GUIDE, AIRPLANE_INTRO, AIRPLANE_NOTES } from '../../content/airplaneGuide';
import { Guide } from './Guide';

/** Step-by-step guide: airplane mode while Tagzeiten is open (iPhone, Kurzbefehle). */
export function AirplaneGuide() {
  return <Guide intro={AIRPLANE_INTRO} parts={AIRPLANE_GUIDE} notes={AIRPLANE_NOTES} />;
}
