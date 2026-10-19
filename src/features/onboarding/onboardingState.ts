import type { Store } from '../../data/store';

/** Device convenience (like the other "tz:" keys): the setup was finished or put aside. */
export const ONBOARDING_KEY = 'tz:onboarding';

/** Where the setup lives; it has no tab bar. */
export const ONBOARDING_PATH = '/einrichtung';

export type OnboardingMark = 'done' | 'skipped';

export function readOnboardingMark(): OnboardingMark | null {
  try {
    const v = localStorage.getItem(ONBOARDING_KEY);
    return v === 'done' || v === 'skipped' ? v : null;
  } catch {
    return null;
  }
}

export function writeOnboardingMark(mark: OnboardingMark): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, mark);
  } catch {
    // Only a convenience: without storage the setup may show again next time.
  }
}

/**
 * Whether this is the very first start: a device without entries or settings
 * (nothing was ever changed in the profile, no day, no Arena entry) on which the
 * setup was neither finished nor put aside. Existing users never see it by themselves.
 */
export function needsOnboarding(store: Store): boolean {
  if (readOnboardingMark()) return false;
  const profile = store.getProfile();
  return profile.updatedAt === 0 && profile.arena.length === 0 && store.allDays().length === 0;
}
