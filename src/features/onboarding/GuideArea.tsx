import { Link } from 'react-router';
import { ONBOARDING_PATH } from './onboardingState';

export const GUIDE_INFO = (
  <p>
    Die Einrichtung vom ersten Start noch einmal durchgehen. Sie ändert nur, was du änderst, und lässt alles andere,
    wie es ist.
  </p>
);

/** "Mehr, Anleitung": reopens the setup. */
export function GuideArea() {
  return (
    <Link className="btn primary" to={ONBOARDING_PATH}>
      Einrichtung ansehen
    </Link>
  );
}
