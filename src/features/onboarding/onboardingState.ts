import type { Store } from '../../data/store';

/** Device convenience (like the other "tz:" keys): the setup was finished or put aside. */
export const ONBOARDING_KEY = 'tz:onboarding';

/** Where the setup lives; it has no tab bar. */
export const ONBOARDING_PATH = '/einrichtung';

/** Mid-setup: whoever reloads then comes back into it, at the page where they were. */
export const ONBOARDING_STEP_KEY = 'tz:onboarding-step';

export type OnboardingMark = 'done' | 'skipped' | 'started';

export function readOnboardingMark(): OnboardingMark | null {
  try {
    const v = localStorage.getItem(ONBOARDING_KEY);
    return v === 'done' || v === 'skipped' || v === 'started' ? v : null;
  } catch {
    return null;
  }
}

export function writeOnboardingMark(mark: OnboardingMark): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, mark);
    if (mark !== 'started') localStorage.removeItem(ONBOARDING_STEP_KEY);
  } catch {
    // Only a convenience: without storage the setup may show again next time.
  }
}

export function readOnboardingStep(): number {
  try {
    const n = Number(localStorage.getItem(ONBOARDING_STEP_KEY));
    return Number.isInteger(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function writeOnboardingStep(index: number): void {
  try {
    localStorage.setItem(ONBOARDING_STEP_KEY, String(index));
  } catch {
    // Only a convenience.
  }
}

/**
 * Whether this is the very first start: a device without entries or settings
 * (nothing was ever changed in the profile, no day, no Arena entry) on which the
 * setup was neither finished nor put aside (or one that began it and stopped midway). Existing users never see it by themselves.
 */
export function needsOnboarding(store: Store): boolean {
  const mark = readOnboardingMark();
  if (mark === 'started') return true;
  if (mark) return false;
  const profile = store.getProfile();
  return profile.updatedAt === 0 && profile.arena.length === 0 && store.allDays().length === 0;
}
