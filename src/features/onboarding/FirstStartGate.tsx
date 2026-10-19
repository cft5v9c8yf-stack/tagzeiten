import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useStore } from '../../data/hooks';
import { needsOnboarding, ONBOARDING_PATH } from './onboardingState';

/**
 * Around the pages with the tab bar: on the very first start the app opens the
 * setup instead of "Heute". Once the setup is finished or put aside (remembered
 * on the device), or anything is entered, this no longer applies.
 */
export function FirstStartGate({ enabled = true, children }: { enabled?: boolean; children: ReactNode }) {
  const store = useStore();
  const { pathname } = useLocation();
  if (enabled && pathname === '/' && needsOnboarding(store)) return <Navigate to={ONBOARDING_PATH} replace />;
  return <>{children}</>;
}
