/**
 * What the search reads: the texts of the app, each with the page that shows it.
 * Built once on first use; Sundays link to their next date from `today`.
 */
import { churchDay, nextWeekStart } from '../domain/churchYear';
import { addDays, type DateKey } from '../domain/dates';
import { formatLong } from '../domain/dates';
import { EVENING_TEXT_FIELDS, MORNING_TEXT_FIELDS, THREE_KEYS, WREATH_FIELDS, type ArenaEntry, type Day } from '../domain/model';
import { isEmptyDay } from '../domain/normalizeDay';
import type { SearchDoc } from '../domain/fulltext';
import { composeVerse } from '../domain/weeklyVerse';
import { ARMOR_WEEK } from './armor';
import { AUGSBURG_CONFESSION, type BookPart } from './augsburgConfession';
import { LARGE_CATECHISM } from './largeCatechism';
import { SMALCALD_ARTICLES } from './smalcaldArticles';
import { TRACTATUS } from './tractatus';
import { CATECHISM, TABLE_OF_DUTIES } from './catechism';
import { CHURCH_YEAR_INTRO } from './churchYearIntro';
import { SUNDAY_INFO } from './churchYearGuide';
import { CREEDS } from './creeds';
import { DAY_GUIDE } from './dieffenbach';
import { EPISTLE_LECTIONS, FEAST_EPISTLE_LECTIONS, LECTIONS } from './lections';
import * as L from './liturgy';
import { TREASURY } from './prayerTreasury';
import { READING_SUMMARIES } from './readingSummaries';
import type { Text } from './types';
import { WEEKLY_VERSES } from './weeklyVerses';

const lines = (t: Text) => t.lines.join(' ');

/** The next date (from `today`) of every week key within a year. */
function weekDates(today: DateKey): Map<string, DateKey> {
  const out = new Map<string, DateKey>();
  let s = churchDay(today).weekStart;
  for (let i = 0; i < 60; i++) {
    const key = churchDay(s).weekKey;
    if (!out.has(key)) out.set(key, s);
    s = nextWeekStart(s);
  }
  return out;
}

/** The next date of a fixed feast ("12-26") from `today`. */
function nextFeast(today: DateKey, monthDay: string): DateKey {
  for (let d = today, i = 0; i < 370; i++, d = addDays(d, 1)) if (d.slice(5) === monthDay) return d;
  return today;
}

/** One search entry per section of a book of the Book of Concord. */
function bookDocs(parts: readonly BookPart[], area: string, to: string): SearchDoc[] {
  return parts.flatMap((part) => part.sections.map((s) => ({ area, title: `${s.title} ${s.sub}`.trim(), text: s.paragraphs.join(' '), to })));
}

/** The long books, loaded apart from the app so that it starts quickly. */
export async function lazyBookDocs(): Promise<SearchDoc[]> {
  const { APOLOGY } = await import('./apology');
  return bookDocs(APOLOGY, 'Lehre · Apologie', '/katechismus/apologie');
}

export function contentDocs(today: DateKey): SearchDoc[] {
  const docs: SearchDoc[] = [];
  const add = (area: string, title: string, text: string, to: string) => docs.push({ area, title, text, to });

  // Lehre
  for (const part of CATECHISM) {
    for (const piece of part.pieces) {
      add(`Lehre · ${part.title}`, piece.title, [piece.words, ...piece.qa.flat()].join(' '), `/katechismus/${part.id}`);
    }
  }
  for (const c of CREEDS) {
    add('Lehre · Die drei Bekenntnisse', c.title, [c.text ? lines(c.text) : '', ...c.explanation].join(' '), '/katechismus/bekenntnisse');
  }
  for (const part of AUGSBURG_CONFESSION) {
    for (const s of part.sections) {
      add('Lehre · Augsburgische Konfession', `${s.title} ${s.sub}`.trim(), s.paragraphs.join(' '), '/katechismus/augsburgische-konfession');
    }
  }
  for (const part of SMALCALD_ARTICLES) {
    for (const s of part.sections) {
      add('Lehre · Schmalkaldische Artikel', `${s.title} ${s.sub}`.trim(), s.paragraphs.join(' '), '/katechismus/schmalkaldische-artikel');
    }
  }
  docs.push(...bookDocs(TRACTATUS, 'Lehre · Von der Gewalt des Pabsts', '/katechismus/traktat'));
  for (const part of LARGE_CATECHISM) {
    for (const s of part.sections) {
      add('Lehre · Großer Katechismus', `${s.title} ${s.sub}`.trim(), s.paragraphs.join(' '), '/katechismus/grosser-katechismus');
    }
  }
  add('Lehre · Haustafel', 'Die Haustafel', TABLE_OF_DUTIES.map((d) => `${d.title}: ${d.refs.join(', ')}`).join(' · '), '/katechismus/haustafel');
  add('Lehre · Tischgebete', 'Vor dem Essen', [lines(L.TABLE_PRAYER_BEFORE.verse), lines(L.TABLE_PRAYER_BEFORE.prayer)].join(' '), '/katechismus/tischgebete');
  add('Lehre · Tischgebete', 'Nach dem Essen', [lines(L.TABLE_PRAYER_AFTER.verse), lines(L.TABLE_PRAYER_AFTER.prayer)].join(' '), '/katechismus/tischgebete');
  add(
    'Lehre · Privatbeichte',
    'Privatbeichte',
    [...L.PRIVATE_CONFESSION.intro, lines(L.PRIVATE_CONFESSION.request), lines(L.PRIVATE_CONFESSION.confession), lines(L.PRIVATE_CONFESSION.absolution)].join(' '),
    '/katechismus/privatbeichte',
  );
  for (const part of CHURCH_YEAR_INTRO) add('Lehre · Das Kirchenjahr', part.heading, part.paragraphs.join(' '), '/katechismus/kirchenjahr');

  // Sonntag
  const dates = weekDates(today);
  for (const [key, info] of Object.entries(SUNDAY_INFO)) {
    const d = dates.get(key);
    if (!d) continue;
    const name = churchDay(d).week;
    const to = `/sonntag?s=${d}`;
    const verse = WEEKLY_VERSES[key];
    const sum = READING_SUMMARIES[key];
    add(
      'Sonntag',
      name,
      [verse ? `${composeVerse(verse)} (${verse.ref})` : '', info.meaning ?? '', info.theme, `Evangelium ${info.gospel}`, sum?.gospel ?? '', `Epistel ${info.epistle}`, sum?.epistle ?? '', DAY_GUIDE[key] ?? '']
        .filter(Boolean)
        .join(' '),
      to,
    );
    for (const l of [LECTIONS[key], EPISTLE_LECTIONS[key]]) {
      if (l) add(`Sonntag · ${name} · ${l.kind}`, l.title, `${l.ref} ${l.paragraphs.join(' ')}`, to);
    }
  }
  for (const f of FEAST_EPISTLE_LECTIONS) {
    add(`Sonntag · ${f.name} · ${f.lection.kind}`, f.lection.title, `${f.lection.ref} ${f.lection.paragraphs.join(' ')}`, `/sonntag?s=${nextFeast(today, f.monthDay)}`);
  }

  // Andacht
  const prayers: [string, Text, string][] = [
    ['Vaterunser', L.LORDS_PRAYER_LUTHER, '/andacht/morgen'],
    ['Das Glaubensbekenntnis', L.CREED_LUTHER, '/andacht/morgen'],
    ['Luthers Morgensegen', L.MORNING_BLESSING, '/andacht/morgen'],
    ['Luthers Abendsegen', L.EVENING_BLESSING, '/andacht/abend'],
    ['Taufgedächtnis', L.BAPTISM_REMEMBRANCE, '/andacht/morgen'],
    ['Morgenlied', L.HYMN_MORNING, '/andacht/morgen'],
    ['Abendlied', L.HYMN_EVENING, '/andacht/abend'],
    ['Benedictus', L.BENEDICTUS, '/andacht/morgen'],
    ['Magnificat', L.MAGNIFICAT, '/andacht/abend'],
    ['Nunc dimittis', L.NUNC_DIMITTIS, '/andacht/abend'],
    ['Kollekte am Morgen', L.COLLECT_MORNING, '/andacht/morgen'],
    ['Kollekte am Abend', L.COLLECT_EVENING, '/andacht/abend'],
    ['Gebet vor dem Lesen', L.PRAYER_BEFORE_READING, '/andacht/morgen'],
    ['Gebet nach dem Lesen', L.PRAYER_AFTER_READING, '/andacht/morgen'],
    ['Allgemeines Sündenbekenntnis', L.GENERAL_CONFESSION, '/andacht/abend'],
    ['Zuspruch der Vergebung', L.ABSOLUTION_EVENING, '/andacht/abend'],
  ];
  for (const [title, t, to] of prayers) add('Andacht', title, lines(t), to);
  for (const a of ARMOR_WEEK) {
    add(`Andacht · Waffenrüstung · ${a.day}`, a.title, [a.word, `(${a.ref})`, a.meaning, a.prayer, a.question].join(' '), '/andacht/morgen');
  }
  for (const p of TREASURY) add('Mehr · Gebetsschatz', p.title, `${lines(p.text)} ${p.author}`, '/mehr/gebetsschatz');

  return docs;
}

/** The user's own Arena entries: searched on the device, like everything else. */
export function arenaDocs(entries: readonly ArenaEntry[]): SearchDoc[] {
  return entries.map((e) => ({
    area: e.kind === 'forge' ? 'Arena · Eisenschmiede' : 'Arena · Tagebuch',
    title: e.text.split('\n')[0]!.slice(0, 80) || e.verses[0] || 'Eintrag',
    text: [e.text, ...e.verses, ...e.concerns, ...(e.points ?? []).map((p) => p.text)].join(' '),
    to: `/arena/${e.id}`,
  }));
}

/** The user's own days: what was written in the Stille Zeit and in the evening. */
export function dayDocs(days: readonly Day[]): SearchDoc[] {
  return days
    .filter((d) => !isEmptyDay(d))
    .map((d) => ({
      area: 'Eigene Einträge',
      title: `${formatLong(d.date)} ${d.date.slice(0, 4)}`,
      text: [
        ...MORNING_TEXT_FIELDS.map((f) => d.morning[f] ?? ''),
        ...WREATH_FIELDS.map((f) => d.morning.wreath[f] ?? ''),
        ...THREE_KEYS.map((k) => d.morning.three[k] ?? ''),
        ...EVENING_TEXT_FIELDS.map((f) => d.evening[f] ?? ''),
        ...d.evening.thanks,
      ]
        .filter(Boolean)
        .join(' · '),
      to: `/?d=${d.date}`,
    }))
    .filter((doc) => doc.text);
}
