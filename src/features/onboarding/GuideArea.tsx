import { Link } from 'react-router';
import { COLOR_CODE, METHOD_CREDIT, READING_PASSES, READING_RUBRICS } from '../../content/method';
import { ONBOARDING_PATH } from './onboardingState';

export const GUIDE_INFO = (
  <p>
    Die Einrichtung vom ersten Start noch einmal durchgehen. Sie ändert nur, was du änderst, und lässt alles andere,
    wie es ist.
  </p>
);

/** "Mehr, Anleitung": reopens the setup, and describes the reading method in the app's own words with its source (rule 14). */
export function GuideArea() {
  return (
    <>
      <Link className="btn primary" to={ONBOARDING_PATH}>
        Einrichtung ansehen
      </Link>
      <h3 className="ob-guide-head">Lesemethode</h3>
      <p className="ob-text">{READING_RUBRICS.paper}</p>
      <ol className="ob-passes">
        {READING_PASSES.map(([name, line]) => (
          <li key={name}>
            <b>{name}</b>
            <span>{line}</span>
          </li>
        ))}
      </ol>
      <h4 className="ob-guide-sub">Farbcode</h4>
      <ul className="ob-colors">
        {COLOR_CODE.map((c) => (
          <li key={c.color}>
            <i aria-hidden="true" style={{ background: c.hex }} />
            <span>
              <b>{c.color}:</b> {c.meaning}
            </span>
          </li>
        ))}
      </ul>
      <p className="small muted">{METHOD_CREDIT}</p>
    </>
  );
}
