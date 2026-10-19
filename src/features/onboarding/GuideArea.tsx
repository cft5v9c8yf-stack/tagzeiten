import { Link } from 'react-router';
import { METHOD_CREDIT } from '../../content/method';
import { ONBOARDING_PATH } from './onboardingState';

export const GUIDE_INFO = (
  <p>
    Die Einrichtung vom ersten Start noch einmal durchgehen. Sie ändert nur, was du änderst, und lässt alles andere,
    wie es ist.
  </p>
);

/** "Mehr, Anleitung": reopens the setup, and names the source of the reading method. */
export function GuideArea() {
  return (
    <>
      <Link className="btn primary" to={ONBOARDING_PATH}>
        Einrichtung ansehen
      </Link>
      <h3 className="ob-guide-head">Lesemethode</h3>
      <p className="ob-placeholder">[TEXT VON ANDREAS: Kurzbeschreibung der Lesemethode in eigenen Worten]</p>
      <p className="small muted">{METHOD_CREDIT}</p>
    </>
  );
}
