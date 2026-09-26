import { useSearchParams } from 'react-router';
import { useStore } from '../data/hooks';
import { isDateKey, type DateKey } from '../domain/dates';

export const DATE_PARAM = 'd';

/**
 * The day being viewed. Defaults to today; past days are addressed with ?d=YYYY-MM-DD.
 * Future dates are not allowed and fall back to today. "Today" comes from the
 * store's clock, the same one that assigns readings and marks days.
 */
export function useSelectedDate(): { date: DateKey; isToday: boolean } {
  const [params] = useSearchParams();
  const today = useStore().today();
  const raw = params.get(DATE_PARAM);
  const date = isDateKey(raw) && raw <= today ? raw : today;
  return { date, isToday: date === today };
}

/** Builds a link to a section that keeps the selected day. */
export function withDate(path: string, date: DateKey, isToday: boolean): string {
  return isToday ? path : `${path}?${DATE_PARAM}=${date}`;
}
