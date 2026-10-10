/**
 * A Wüstenzeit in the church year (1.1): from the third Sunday before Advent
 * through its first week, Henoch invites to a Wüstenzeit until Christmas Eve.
 * The dates are reckoned here, without the network. The invitation reminds of
 * a time, never of something missed (rule 7).
 */
import { ADVENT_INVITE } from '../content/desert';
import { firstAdvent } from './churchYear';
import { addDays, type DateKey } from './dates';
import type { Profile } from './model';
import { activeRun, daysBetween, stageOf, type WinterArcRun } from './winterArc';

/** The invitation shows from the third Sunday before the first Sunday in Advent … */
export const INVITE_LEAD = 21;
/** … through the first week of Advent. */
export const INVITE_TAIL = 6;

export interface SeasonOffer {
  /** "advent-2026": what "Diesmal nicht" remembers. */
  key: string;
  /** The name the Wüstenzeit is given, "Advent 2026". */
  name: string;
  /** The first Sunday in Advent and Christmas Eve. */
  begin: DateKey;
  end: DateKey;
  /** Once Advent has begun, a Wüstenzeit begins today. */
  begun: boolean;
  start: DateKey;
  days: number;
  /** The article on the homepage, if there is one for the year. */
  link?: string;
}

const christmasEve = (year: number): DateKey => `${year}-12-24`;

/** The Advent of a date's year, while the invitation stands. */
export function seasonOffer(today: DateKey): SeasonOffer | undefined {
  const year = Number(today.slice(0, 4));
  const begin = firstAdvent(year);
  if (today < addDays(begin, -INVITE_LEAD) || today > addDays(begin, INVITE_TAIL)) return undefined;
  const end = christmasEve(year);
  const begun = today >= begin;
  const start = begun ? today : begin;
  const offer: SeasonOffer = { key: `advent-${year}`, name: `Advent ${year}`, begin, end, begun, start, days: daysBetween(start, end) + 1 };
  const link = ADVENT_INVITE.links[year];
  if (link) offer.link = link;
  return offer;
}

/** A Wüstenzeit under way or planned; one past its last day does not count. */
function planned(p: Pick<Profile, 'winterArc'>, today: DateKey): boolean {
  const run = activeRun(p.winterArc);
  return !!run && stageOf(run, today) !== 'after';
}

/** In the Arena: while no Wüstenzeit is under way or planned. */
export function arenaOffer(p: Pick<Profile, 'winterArc'>, today: DateKey): SeasonOffer | undefined {
  return planned(p, today) ? undefined : seasonOffer(today);
}

/** On "Heute": the same, until the brother has said "Diesmal nicht". */
export function todayOffer(p: Pick<Profile, 'winterArc' | 'seasonsDeclined'>, today: DateKey): SeasonOffer | undefined {
  const offer = arenaOffer(p, today);
  return offer && !p.seasonsDeclined?.includes(offer.key) ? offer : undefined;
}

/** The article for a Wüstenzeit that falls in Advent, for its guide. */
export function seasonLinkOf(run: Pick<WinterArcRun, 'startDate' | 'durationDays'>): string | undefined {
  const year = Number(run.startDate.slice(0, 4));
  const last = addDays(run.startDate, run.durationDays - 1);
  return run.startDate <= christmasEve(year) && last >= firstAdvent(year) ? ADVENT_INVITE.links[year] : undefined;
}

const KEY_RE = /^[a-z]+-\d{4}$/;

/** Keeps the well-formed keys of "Diesmal nicht", each once. */
export function normalizeDeclined(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((k): k is string => typeof k === 'string' && KEY_RE.test(k)))];
}
