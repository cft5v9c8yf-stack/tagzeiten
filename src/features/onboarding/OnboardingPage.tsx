import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '../../ui/PageHeader';
import { useStore } from '../../data/hooks';
import { draftDays, draftStart, useDesertDraft } from './desertDraft';
import {
  DesertDoneStep,
  DesertHabitsStep,
  DesertStartStep,
  DoneStep,
  HabitsStep,
  HouseStep,
  OrderStep,
  PlanStep,
  PrayerWayStep,
  PrivacyStep,
  TimesStep,
  WayStep,
  type Way,
} from './OnboardingSteps';
import {
  ONBOARDING_PATH,
  readOnboardingMark,
  readOnboardingStep,
  readOnboardingWay,
  writeOnboardingMark,
  writeOnboardingStep,
  writeOnboardingWay,
} from './onboardingState';

type StepId = 'order' | 'way' | 'prayer' | 'house' | 'times' | 'habits' | 'plan' | 'privacy' | 'done' | 'dstart' | 'dhabits' | 'ddone';

interface Step {
  id: StepId;
  title: string;
  /** Steps that can be put aside; the settings stay as they are. */
  skippable: boolean;
}

const STEP_LIST: Record<StepId, Step> = {
  order: { id: 'order', title: 'So beginnt der Tag', skippable: false },
  way: { id: 'way', title: 'Wofür möchtest du Henoch nutzen?', skippable: false },
  prayer: { id: 'prayer', title: 'Wie du betest', skippable: true },
  house: { id: 'house', title: 'Mein Haus', skippable: true },
  times: { id: 'times', title: 'Deine Zeiten', skippable: true },
  habits: { id: 'habits', title: 'Deine Gewohnheiten', skippable: true },
  plan: { id: 'plan', title: 'Dein Leseplan', skippable: true },
  privacy: { id: 'privacy', title: 'Was auf deinem Gerät bleibt', skippable: false },
  done: { id: 'done', title: 'Das ist eingerichtet', skippable: false },
  dstart: { id: 'dstart', title: 'Wüstenwanderung beginnen', skippable: false },
  dhabits: { id: 'dhabits', title: 'Gewohnheiten für diese Zeit', skippable: true },
  ddone: { id: 'ddone', title: 'Das ist eingerichtet', skippable: false },
};

/** The two pages every way begins with, then the pages of the way chosen. */
const BASE: readonly StepId[] = ['order', 'way'];
const WAYS: Record<Way, readonly StepId[]> = {
  everyday: ['prayer', 'house', 'times', 'habits', 'plan', 'privacy', 'done'],
  desert: ['dstart', 'dhabits', 'times', 'privacy', 'ddone'],
};
const stepsOf = (way: Way | null): readonly Step[] => [...BASE, ...(way ? WAYS[way] : [])].map((id) => STEP_LIST[id]);

/** Where the Arena opens the Wüstenzeit. */
const DESERT_PATH = '/arena?bereich=wuestenwanderung';

/**
 * The setup at the first start, also reopened from "Mehr, Anleitung". A screen of
 * its own, without the tab bar. On the way "Alltag" every control writes straight
 * into the app's settings, so a run changes only what the person changes. On the
 * way "Wüstenwanderung" the Wüstenzeit begins only at the last page.
 */
export function OnboardingPage() {
  const navigate = useNavigate();
  const store = useStore();
  const [mark] = useState(readOnboardingMark);
  // Reopened later (the setup was finished or put aside before): leaving goes back to "Mehr".
  const reopened = mark === 'done' || mark === 'skipped';
  // Reloaded midway: back to the page where it was, on the way chosen.
  const [way, setWay] = useState<Way | null>(() => (mark === 'started' ? readOnboardingWay() : null));
  const [index, setIndex] = useState(() =>
    mark === 'started' ? Math.min(readOnboardingStep(), stepsOf(readOnboardingWay()).length - 1) : 0,
  );
  const [draft, setDraft] = useDesertDraft();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const steps = stepsOf(way);
  const step = steps[index]!;
  const last = !!way && index === steps.length - 1;

  // A new page: back to the top, and the focus on its heading, so keyboard and screen reader begin there.
  useEffect(() => {
    // The first start is remembered as begun, and the page it has reached.
    if (!reopened) {
      writeOnboardingMark('started');
      writeOnboardingStep(index);
      if (way) writeOnboardingWay(way);
    }
    window.scrollTo(0, 0);
    titleRef.current?.focus({ preventScroll: true });
  }, [index, reopened, way]);

  const leave = () => {
    if (!reopened) writeOnboardingMark('skipped');
    navigate(reopened ? '/mehr/anleitung' : '/', { replace: true });
  };
  const finish = () => {
    writeOnboardingMark('done');
    navigate('/', { replace: true });
  };
  const next = () => setIndex(index + 1);
  const days = draftDays(draft);
  const start = draftStart(draft, store.today());
  // The Wüstenzeit begins here and nowhere before: going back or skipping starts nothing.
  const beginDesert = () => {
    if (!days || !start) return;
    store.startDesert(start, days, draft.habits);
    writeOnboardingMark('done');
    navigate(DESERT_PATH, { replace: true });
  };

  const body: Record<StepId, ReactNode> = {
    order: <OrderStep />,
    way: <WayStep way={way} onChoose={setWay} />,
    prayer: <PrayerWayStep />,
    house: <HouseStep />,
    times: <TimesStep />,
    habits: <HabitsStep />,
    plan: <PlanStep />,
    privacy: <PrivacyStep />,
    done: <DoneStep />,
    dstart: <DesertStartStep draft={draft} set={setDraft} />,
    dhabits: <DesertHabitsStep draft={draft} set={setDraft} />,
    ddone: <DesertDoneStep draft={draft} />,
  };
  const blocked = (step.id === 'way' && !way) || ((step.id === 'dstart' || step.id === 'ddone') && !(days && start));
  const nextLabel = last ? (way === 'desert' ? 'Zur Wüstenwanderung' : 'Zu Heute') : 'Weiter';

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
            <button type="button" className="btn primary" disabled={blocked} onClick={last ? (way === 'desert' ? beginDesert : finish) : next}>
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
