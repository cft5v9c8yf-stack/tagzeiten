import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '../../ui/PageHeader';
import { DoneStep, HabitsStep, HouseStep, OrderStep, PlanStep, PrivacyStep, TimesStep, WayStep, type Way } from './OnboardingSteps';
import { ONBOARDING_PATH, readOnboardingMark, writeOnboardingMark } from './onboardingState';

type StepId = 'order' | 'way' | 'house' | 'times' | 'habits' | 'plan' | 'privacy' | 'done';

interface Step {
  id: StepId;
  title: string;
  /** Steps that can be put aside; the settings stay as they are. */
  skippable: boolean;
}

/** The way "Alltag". The way "Wüstenwanderung" leaves the setup at the choice (see below). */
const STEPS: readonly Step[] = [
  { id: 'order', title: 'So beginnt der Tag', skippable: false },
  { id: 'way', title: 'Wofür möchtest du Henoch nutzen?', skippable: false },
  { id: 'house', title: 'Mein Haus', skippable: true },
  { id: 'times', title: 'Deine Zeiten', skippable: true },
  { id: 'habits', title: 'Deine Gewohnheiten', skippable: true },
  { id: 'plan', title: 'Dein Leseplan', skippable: true },
  { id: 'privacy', title: 'Was auf deinem Gerät bleibt', skippable: false },
  { id: 'done', title: 'Das ist eingerichtet', skippable: false },
];

/** Where the Arena opens the start of the Wüstenzeit. */
const DESERT_PATH = '/arena?bereich=wuestenwanderung';

/**
 * The setup at the first start, also reopened from "Mehr, Anleitung". A screen of
 * its own, without the tab bar. Every control writes straight into the app's
 * settings, so a run changes only what the person changes.
 */
export function OnboardingPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [way, setWay] = useState<Way | null>(null);
  // Reopened later (the setup was finished or put aside before): leaving goes back to "Mehr".
  const [reopened] = useState(() => readOnboardingMark() !== null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const step = STEPS[index]!;
  const last = index === STEPS.length - 1;

  // A new page: back to the top, and the focus on its heading, so keyboard and screen reader begin there.
  useEffect(() => {
    window.scrollTo(0, 0);
    titleRef.current?.focus({ preventScroll: true });
  }, [index]);

  const leave = () => {
    if (!reopened) writeOnboardingMark('skipped');
    navigate(reopened ? '/mehr/anleitung' : '/', { replace: true });
  };
  const finish = () => {
    writeOnboardingMark('done');
    navigate('/', { replace: true });
  };
  const next = () => {
    if (step.id === 'way' && way === 'desert') {
      // The way "Wüstenwanderung" has no pages here (yet): the setup ends, the Arena opens its start.
      writeOnboardingMark('done');
      navigate(DESERT_PATH, { replace: true });
      return;
    }
    setIndex(index + 1);
  };

  const body: Record<StepId, ReactNode> = {
    order: <OrderStep />,
    way: <WayStep way={way} onChoose={setWay} />,
    house: <HouseStep />,
    times: <TimesStep />,
    habits: <HabitsStep />,
    plan: <PlanStep />,
    privacy: <PrivacyStep />,
    done: <DoneStep />,
  };
  const needsChoice = step.id === 'way' && !way;
  const nextLabel = last ? 'Zu Heute' : step.id === 'way' && way === 'desert' ? 'Zur Wüstenwanderung' : 'Weiter';

  return (
    <>
      <a className="skip-link" href="#main">
        Zum Inhalt
      </a>
      <div className="wrap ob-wrap" data-path={ONBOARDING_PATH}>
        <PageHeader
          title="Einrichtung"
          backRef={() => {}}
          action={
            !last && (
              <button type="button" className="btn quiet ob-leave" onClick={leave}>
                {reopened ? 'Schließen' : 'Später ansehen'}
              </button>
            )
          }
        />
        <main id="main" className="ob">
          <h2 ref={titleRef} tabIndex={-1} className="ob-title">
            {step.title}
          </h2>
          {body[step.id]}
          <div className="ob-foot">
            <button type="button" className="btn primary" disabled={needsChoice} onClick={last ? finish : next}>
              {nextLabel}
            </button>
            {index > 0 && (
              <button type="button" className="btn quiet" onClick={() => setIndex(index - 1)}>
                Zurück
              </button>
            )}
            {step.skippable && (
              <button type="button" className="btn quiet" onClick={() => setIndex(index + 1)}>
                Überspringen
              </button>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
