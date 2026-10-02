/**
 * The Lutheran church year (traditional order of Sundays, as used e.g. by the
 * SELK): which Sunday names the week, which feast falls on the day, and in
 * which festal circle and season the day lies.
 *
 * The week is named after the most recent Sunday; Christmas Day and Epiphany
 * also open a week of their own.
 */
import { addDays, fromKey, toKey, type DateKey } from './dates';

export type Circle = 'christmas' | 'easter' | 'pentecost';

/**
 * The seasons after the order of the Hausagende: three in each festal circle.
 * Christmas circle (God the Father): Advent, Christfest, Darstellung.
 * Easter circle (God the Son): Epiphanien (prophet), Fasten (high priest), Freuden (king).
 * Pentecost circle (God the Holy Spirit): Warte-, Pfingstfest-, Trinitatiszeit.
 */
export type Season =
  | 'advent'
  | 'christmastide'
  | 'presentation'
  | 'epiphany'
  | 'lent'
  | 'eastertide'
  | 'waiting'
  | 'pentecost'
  | 'trinity';

export const CIRCLE_LABEL: Record<Circle, string> = {
  christmas: 'Weihnachtskreis',
  easter: 'Osterkreis',
  pentecost: 'Pfingstkreis',
};
export const CIRCLES: readonly Circle[] = ['christmas', 'easter', 'pentecost'];

export const SEASON_LABEL: Record<Season, string> = {
  advent: 'Adventszeit',
  christmastide: 'Christfestzeit',
  presentation: 'Darstellungszeit',
  epiphany: 'Epiphanienzeit',
  lent: 'Fastenzeit',
  eastertide: 'Freudenzeit',
  waiting: 'Wartezeit',
  pentecost: 'Pfingstfestzeit',
  trinity: 'Trinitatiszeit',
};

export const SEASON_CIRCLE: Record<Season, Circle> = {
  advent: 'christmas',
  christmastide: 'christmas',
  presentation: 'christmas',
  epiphany: 'easter',
  lent: 'easter',
  eastertide: 'easter',
  waiting: 'pentecost',
  pentecost: 'pentecost',
  trinity: 'pentecost',
};

/* ------------------------------------------------------------ anchors */

/** Easter Sunday (Gregorian computus, Meeus/Jones/Butcher). */
export function easter(year: number): DateKey {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return toKey(new Date(year, month - 1, day));
}

/** First Sunday of Advent: four Sundays before Christmas. */
export function firstAdvent(year: number): DateKey {
  const christmasEve = toKey(new Date(year, 11, 24));
  const fourth = addDays(christmasEve, -fromKey(christmasEve).getDay());
  return addDays(fourth, -21);
}

const sundayOnOrBefore = (k: DateKey) => addDays(k, -fromKey(k).getDay());
const daysBetween = (a: DateKey, b: DateKey) =>
  Math.round((Date.UTC(...ymd(b)) - Date.UTC(...ymd(a))) / 864e5);
function ymd(k: DateKey): [number, number, number] {
  const [y, m, d] = k.split('-').map(Number);
  return [y!, m! - 1, d!];
}
const md = (y: number, month: number, day: number) => toKey(new Date(y, month - 1, day));

/* ------------------------------------------------------------ the year's calendar */

interface Marker {
  date: DateKey;
  name: string;
  /** Stable id of the week, e.g. "advent1", "epiphany3", "trinity16". */
  key: string;
}

interface ChurchYearCalendar {
  start: DateKey;
  end: DateKey; // day before the next first Advent
  easter: DateKey;
  /** Sundays and the feasts that open a week, sorted. */
  weekMarkers: Marker[];
  /** Feasts and holy days by date. */
  feasts: Map<DateKey, string>;
  /** Weekday feasts with their own readings (Good Friday, Ascension …). */
  majorFeasts: Marker[];
  seasons: { from: DateKey; season: Season }[];
}

const ordinal = (n: number) => `${n}.`;
const cache = new Map<number, ChurchYearCalendar>();

/** The church year that begins on the first Advent of `year`. */
function calendar(year: number): ChurchYearCalendar {
  const hit = cache.get(year);
  if (hit) return hit;
  const start = firstAdvent(year);
  const nextStart = firstAdvent(year + 1);
  const end = addDays(nextStart, -1);
  const E = easter(year + 1);
  const e = (n: number) => addDays(E, n);
  const y2 = year + 1;

  const markers: Marker[] = [];
  const sunday = (date: DateKey, name: string, key: string) => markers.push({ date, name, key });

  // Advent
  for (let i = 0; i < 4; i++) sunday(addDays(start, 7 * i), `${ordinal(i + 1)} Sonntag im Advent`, `advent${i + 1}`);
  // Christmas
  const christmas = md(year, 12, 25);
  markers.push({ date: christmas, name: 'Christfest', key: 'christmas' });
  let s = addDays(sundayOnOrBefore(christmas), 7);
  if (fromKey(christmas).getDay() === 0) s = addDays(christmas, 7);
  for (let n = 1; s < md(y2, 1, 6); n++, s = addDays(s, 7)) {
    sunday(s, `${ordinal(n)} Sonntag nach dem Christfest`, `christmas${n}`);
  }
  // Epiphany and the Sundays after it
  const epiphany = md(y2, 1, 6);
  markers.push({ date: epiphany, name: 'Epiphanias', key: 'epiphany' });
  const lastAfterEpiphany = e(-70);
  s = addDays(sundayOnOrBefore(epiphany), 7);
  for (let n = 1; s < lastAfterEpiphany; n++, s = addDays(s, 7)) {
    sunday(s, `${ordinal(n)} Sonntag nach Epiphanias`, `epiphany${n}`);
  }
  sunday(lastAfterEpiphany, 'Letzter Sonntag nach Epiphanias', 'epiphanyLast');
  // Pre-Lent, Lent, Holy Week
  const lentSundays: [number, string, string][] = [
    [-63, 'Septuagesimae', 'septuagesimae'],
    [-56, 'Sexagesimae', 'sexagesimae'],
    [-49, 'Estomihi', 'estomihi'],
    [-42, 'Invokavit', 'invokavit'],
    [-35, 'Reminiszere', 'reminiszere'],
    [-28, 'Okuli', 'okuli'],
    [-21, 'Lätare', 'laetare'],
    [-14, 'Judika', 'judika'],
    [-7, 'Palmsonntag (Palmarum)', 'palmarum'],
  ];
  for (const [d, n, k] of lentSundays) sunday(e(d), n, k);
  // Easter to Trinity
  const easterSundays: [number, string, string][] = [
    [0, 'Ostersonntag', 'easter'],
    [7, 'Quasimodogeniti', 'quasimodogeniti'],
    [14, 'Miserikordias Domini', 'misericordias'],
    [21, 'Jubilate', 'jubilate'],
    [28, 'Kantate', 'kantate'],
    [35, 'Rogate', 'rogate'],
    [42, 'Exaudi', 'exaudi'],
    [49, 'Pfingstsonntag', 'pentecost'],
    [56, 'Trinitatis', 'trinity'],
  ];
  for (const [d, n, k] of easterSundays) sunday(e(d), n, k);
  // Sundays after Trinity, then the last three Sundays of the church year
  const eternity = addDays(nextStart, -7);
  const thirdLast = addDays(eternity, -14);
  s = e(63);
  for (let n = 1; s < thirdLast; n++, s = addDays(s, 7)) sunday(s, `${ordinal(n)} Sonntag nach Trinitatis`, `trinity${n}`);
  sunday(thirdLast, 'Drittletzter Sonntag des Kirchenjahres', 'thirdLast');
  sunday(addDays(eternity, -7), 'Vorletzter Sonntag des Kirchenjahres', 'secondLast');
  sunday(eternity, 'Letzter Sonntag des Kirchenjahres (Ewigkeitssonntag)', 'eternity');
  markers.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const feasts = new Map<DateKey, string>();
  const feast = (date: DateKey, name: string) => {
    if (date >= start && date <= end) feasts.set(date, name);
  };
  for (const y of [year, y2]) {
    feast(md(y, 12, 24), 'Heiligabend');
    feast(md(y, 12, 25), 'Christfest – Geburt des Herrn');
    feast(md(y, 12, 26), '2. Christtag');
    feast(md(y, 12, 31), 'Altjahrsabend');
    feast(md(y, 1, 1), 'Neujahrstag – Namensgebung Jesu');
    feast(md(y, 1, 6), 'Epiphanias – Fest der Erscheinung des Herrn');
    feast(md(y, 2, 2), 'Tag der Darstellung des Herrn (Lichtmess)');
    feast(md(y, 3, 25), 'Tag der Ankündigung der Geburt des Herrn');
    feast(md(y, 6, 24), 'Tag der Geburt Johannes des Täufers');
    feast(md(y, 6, 29), 'Tag der Apostel Petrus und Paulus');
    feast(md(y, 9, 29), 'Tag des Erzengels Michael und aller Engel (Michaelis)');
    feast(md(y, 10, 31), 'Gedenktag der Reformation');
    feast(md(y, 11, 1), 'Gedenktag der Heiligen (Allerheiligen)');
  }
  feast(e(-46), 'Aschermittwoch');
  feast(e(-3), 'Gründonnerstag');
  feast(e(-2), 'Karfreitag');
  feast(e(-1), 'Karsamstag');
  feast(E, 'Ostersonntag – Auferstehung des Herrn');
  feast(e(1), 'Ostermontag');
  feast(e(39), 'Christi Himmelfahrt');
  feast(e(49), 'Pfingstsonntag – Ausgießung des Heiligen Geistes');
  feast(e(50), 'Pfingstmontag');
  feast(e(56), 'Trinitatis – Fest der Heiligen Dreifaltigkeit');
  // Harvest thanksgiving: first Sunday in October
  const oct1 = md(year + 1, 10, 1);
  feast(fromKey(oct1).getDay() === 0 ? oct1 : addDays(sundayOnOrBefore(oct1), 7), 'Erntedankfest');
  feast(addDays(eternity, -4), 'Buß- und Bettag');

  // Hausagende: Christfestzeit from Christmas Day to the following Saturday, Darstellungszeit
  // from the Sunday after Christmas to the Saturday after Epiphany; Fastenzeit from Ash
  // Wednesday; Freudenzeit from Easter to Ascension; Wartezeit from the Friday before Exaudi.
  const seasons: { from: DateKey; season: Season }[] = [
    { from: start, season: 'advent' },
    { from: christmas, season: 'christmastide' },
    { from: addDays(sundayOnOrBefore(christmas), 7), season: 'presentation' },
    { from: addDays(sundayOnOrBefore(epiphany), 7), season: 'epiphany' },
    { from: e(-46), season: 'lent' },
    { from: E, season: 'eastertide' },
    { from: e(40), season: 'waiting' },
    { from: e(49), season: 'pentecost' },
    { from: e(56), season: 'trinity' },
  ];

  const majorFeasts: Marker[] = [
    { date: e(-3), name: 'Gründonnerstag', key: 'maundyThursday' },
    { date: e(-2), name: 'Karfreitag', key: 'goodFriday' },
    { date: e(1), name: 'Ostermontag', key: 'easterMonday' },
    { date: e(39), name: 'Christi Himmelfahrt', key: 'ascension' },
    { date: e(50), name: 'Pfingstmontag', key: 'pentecostMonday' },
  ];

  const cal = { start, end, easter: E, weekMarkers: markers, feasts, majorFeasts, seasons };
  cache.set(year, cal);
  return cal;
}

/* ------------------------------------------------------------ public */

export interface ChurchDay {
  /** Name of the week: the most recent Sunday (or Christmas Day / Epiphany). */
  week: string;
  /** Stable id of the week, e.g. "trinity16". */
  weekKey: string;
  /** The day the week begins: its Sunday (or Christmas Day / Epiphany). */
  weekStart: DateKey;
  /** Number of the week within the church year, starting with 1 at the first Advent. */
  weekNumber: number;
  /** Feast or holy day falling on this date, if any. */
  feast?: string;
  circle: Circle;
  season: Season;
  /** Calendar year in which this church year began (first Advent). */
  churchYear: number;
}

export function churchDay(date: DateKey): ChurchDay {
  const y = fromKey(date).getFullYear();
  const cal = date >= firstAdvent(y) ? calendar(y) : calendar(y - 1);
  let marker = cal.weekMarkers[0]!;
  for (const m of cal.weekMarkers) {
    if (m.date <= date) marker = m;
    else break;
  }
  let season: Season = 'advent';
  for (const s of cal.seasons) {
    if (s.from <= date) season = s.season;
    else break;
  }
  return {
    week: marker.name,
    weekKey: marker.key,
    weekStart: marker.date,
    weekNumber: Math.floor(daysBetween(cal.start, sundayOnOrBefore(date)) / 7) + 1,
    feast: cal.feasts.get(date),
    circle: SEASON_CIRCLE[season],
    season,
    churchYear: fromKey(cal.start).getFullYear(),
  };
}

/** The week before: its first day (also across the turn of the church year). */
export function previousWeekStart(weekStart: DateKey): DateKey {
  return churchDay(addDays(weekStart, -1)).weekStart;
}

/** The week after: its first day (a Sunday, or Christmas Day / Epiphany). */
export function nextWeekStart(weekStart: DateKey): DateKey {
  for (let i = 1; i <= 7; i++) {
    const d = addDays(weekStart, i);
    if (churchDay(d).weekStart === d) return d;
  }
  return addDays(weekStart, 7);
}

/** Ash Wednesday to Holy Saturday: the Halleluja is not sung. */
export function isPassiontide(date: DateKey): boolean {
  const s = churchDay(date).season;
  return s === 'lent';
}

export interface OutlineEntry {
  date: DateKey;
  name: string;
  /** Week key for Sundays (and Christmas Day, Epiphany), feast key for weekday feasts. */
  key: string;
  kind: 'sunday' | 'feast';
  /** Whether a week begins here (Sundays, Christmas Day, Epiphany) – not so for weekday feasts. */
  opensWeek: boolean;
  season: Season;
  circle: Circle;
}

export interface SeasonSpan {
  season: Season;
  circle: Circle;
  from: DateKey;
  to: DateKey;
}

export interface ChurchYearOutline {
  /** Calendar year of the first Advent. */
  churchYear: number;
  start: DateKey;
  end: DateKey;
  seasons: SeasonSpan[];
  /** All Sundays and major feasts in date order. */
  entries: OutlineEntry[];
}

/** Every Sunday and major feast of the church year that contains `date`. */
export function churchYearOutline(date: DateKey): ChurchYearOutline {
  const y = fromKey(date).getFullYear();
  const cal = date >= firstAdvent(y) ? calendar(y) : calendar(y - 1);
  const seasons: SeasonSpan[] = cal.seasons.map((s, i) => ({
    season: s.season,
    circle: SEASON_CIRCLE[s.season],
    from: s.from,
    to: i + 1 < cal.seasons.length ? addDays(cal.seasons[i + 1]!.from, -1) : cal.end,
  }));
  const seasonOf = (d: DateKey) => [...seasons].reverse().find((s) => s.from <= d)!.season;
  const entries: OutlineEntry[] = [
    ...cal.weekMarkers.map((m) => ({
      ...m,
      kind: (m.key === 'christmas' || m.key === 'epiphany' ? 'feast' : 'sunday') as OutlineEntry['kind'],
      opensWeek: true,
    })),
    ...cal.majorFeasts.map((m) => ({ ...m, kind: 'feast' as const, opensWeek: false })),
  ]
    .map((m) => {
      const season = seasonOf(m.date);
      return { ...m, season, circle: SEASON_CIRCLE[season] };
    })
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { churchYear: fromKey(cal.start).getFullYear(), start: cal.start, end: cal.end, seasons, entries };
}
