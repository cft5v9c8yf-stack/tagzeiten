import { useEffect, useState } from 'react';
import { useProfile } from '../../data/hooks';
import { DEFAULT_DESERT_DAYS, isDesert, QUICK_DESERT_DAYS } from '../../domain/desert';
import { addDays, isDateKey, type DateKey } from '../../domain/dates';
import { isValidDuration } from '../../domain/winterArc';
import { ONBOARDING_DESERT_KEY } from './onboardingState';

/**
 * What was chosen for the Wüstenwanderung in the setup. The Wüstenzeit itself
 * begins only at the last page (Store.startDesert), so until then the choice is a
 * draft on the device; going back or skipping starts nothing.
 */
export interface DesertDraft {
  /** "40", "90" or "own". */
  length: string;
  ownDays: string;
  when: 'today' | 'tomorrow' | 'other';
  other: string;
  habits: string[];
}

const LENGTHS: readonly string[] = [...QUICK_DESERT_DAYS.map(String), 'own'];

function readDraft(): Partial<DesertDraft> | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_DESERT_KEY);
    return raw ? (JSON.parse(raw) as Partial<DesertDraft>) : null;
  } catch {
    return null;
  }
}

/** The draft, kept on the device while the setup is under way; the habits of the last Wüstenzeit are chosen at first. */
export function useDesertDraft(): [DesertDraft, (patch: Partial<DesertDraft>) => void] {
  const profile = useProfile();
  const [draft, setDraft] = useState<DesertDraft>(() => {
    const saved = readDraft();
    const last = [...profile.winterArc.runs].filter(isDesert).sort((a, b) => b.createdAt - a.createdAt)[0];
    return {
      length: saved?.length && LENGTHS.includes(saved.length) ? saved.length : String(DEFAULT_DESERT_DAYS),
      ownDays: typeof saved?.ownDays === 'string' ? saved.ownDays : '',
      when: saved?.when === 'tomorrow' || saved?.when === 'other' ? saved.when : 'today',
      other: typeof saved?.other === 'string' ? saved.other : '',
      habits: Array.isArray(saved?.habits) ? saved.habits.filter((h): h is string => typeof h === 'string') : [...(last?.habits ?? [])],
    };
  });
  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_DESERT_KEY, JSON.stringify(draft));
    } catch {
      // Only a convenience.
    }
  }, [draft]);
  return [draft, (patch) => setDraft((d) => ({ ...d, ...patch }))];
}

/** The length in days, or undefined while it is not valid. */
export function draftDays(d: DesertDraft): number | undefined {
  const n = d.length === 'own' ? Number(d.ownDays) : Number(d.length);
  return (d.length !== 'own' || d.ownDays.trim() !== '') && isValidDuration(n) ? n : undefined;
}

/** The first day, or undefined while it is not valid. A day of one's own is today or later, never in the past. */
export function draftStart(d: DesertDraft, today: DateKey): DateKey | undefined {
  if (d.when === 'today') return today;
  if (d.when === 'tomorrow') return addDays(today, 1);
  return isDateKey(d.other) && d.other >= today ? d.other : undefined;
}
