import { describe, expect, it } from 'vitest';
import { DESERT_HABITS, DESERT_MORE, DESERT_PACKS, DESERT_VERSE } from '../content/desert';
import { HABIT_PRESETS } from '../content/habits';
import { firstAdvent } from './churchYear';
import {
  addOwn,
  adopt,
  canExamine,
  canWrite,
  choose,
  desertWeekOf,
  desertWeeks,
  fromRound,
  habitsOf,
  inAdvent,
  infoOf,
  keptIn,
  keptLine,
  leadVerse,
  listedOn,
  meantFor,
  relink,
  removeOwn,
  startDesert,
  usesStandard,
} from './desert';
import type { DateKey } from './dates';
import { canToggle, isDoneOn, keptByOrder } from './habits';
import { emptyDay, type Day, type Habit, type Profile } from './model';
import { defaultProfile } from './profile';
import { startRun, toggleCheck, toggleWeekly } from './winterArc';

const pack = (id: string) => DESERT_PACKS.find((p) => p.id === id)!;
const offer = (id: string) => DESERT_HABITS.find((h) => h.id === id)!;

function withDesert(habits: string[] = [], start = '2026-10-05', days = 40): Profile {
  const p = defaultProfile('2026-10-05');
  return { ...p, winterArc: startDesert(p.winterArc, start, days, 1, habits, 'w') };
}

const habit = (id: string, extra: Partial<Habit> = {}): Habit => ({
  id,
  name: id,
  rhythm: 'daily',
  auto: null,
  active: false,
  preset: false,
  focus: false,
  ...extra,
});

function lookupOf(ticks: Record<DateKey, string[]>) {
  return (date: DateKey): Day | undefined => {
    const ids = ticks[date];
    return ids ? { ...emptyDay(date), habits: Object.fromEntries(ids.map((id) => [id, true])) } : undefined;
  };
}

describe('the offer of the Wüstenzeit', () => {
  it('has the four packages and the 90-Tage-Standard with their habits, and the further ones from the collection', () => {
    expect(DESERT_PACKS.map((p) => p.name)).toEqual(['Aufbruch', 'Wüstenweg', 'Wie die Wüstenväter', 'Hauskirche', 'Der 90-Tage-Standard']);
    expect(DESERT_PACKS.map((p) => p.habits.length)).toEqual([4, 5, 7, 9, 15]);
    expect(DESERT_MORE.map((h) => h.name)).toEqual([
      'Fürbittliste',
      'Katechismus',
      'Losung lesen',
      'Verzicht auf etwas Bestimmtes',
      'Sabbatruhe',
      'Gottesdienst',
      'Eine gute Tat am Tag',
      'Geben',
      'Geistlicher Begleiter',
    ]);
    // Each habit once, but for the reading of the plan in two packages;
    // those Henoch already has under their ids, so nothing stands twice (0.40).
    expect(DESERT_HABITS.filter((h) => h.id === 'bibleReading').map((h) => h.name)).toEqual(['Bibellese', 'Bibel nach Plan']);
    const twice = ['bibleReading', 'exercise', 'worship'];
    expect(new Set(DESERT_HABITS.map((h) => h.id)).size).toBe(DESERT_HABITS.length - twice.length);
    expect(DESERT_HABITS.map((h) => h.id).filter((id) => !id.startsWith('wz-'))).toEqual([
      'bibleReading',
      'bibleReading',
      'exercise',
      'tablePrayer',
      'blessChildren',
      'familyDevotion',
      'catechismChildren',
      'exercise',
      'worship',
      'timeWithWife',
      'mercy',
      'worship',
      'offering',
      'brothers',
    ]);
    for (const o of DESERT_HABITS.filter((h) => !h.id.startsWith('wz-'))) {
      expect(HABIT_PRESETS.find((p) => p.id === o.id)?.rhythm, o.id).toBe(o.rhythm);
    }
  });

  it('shows no marks of the rhythm and no emojis in the names', () => {
    for (const h of DESERT_HABITS) expect(h.name).not.toMatch(/\(nur|wöchentlich\)|\p{Extended_Pictographic}/u);
    for (const p of DESERT_PACKS) expect(p.name).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it('tells what a habit is in the "i": the short description, then the background', () => {
    expect(infoOf({ id: 'wz-vaterunser' })).toEqual({
      note: 'Bete es morgens, mittags und abends, wie es die frühen Christen taten.',
      about: 'Die Didache (um 100 n. Chr.) empfiehlt, es dreimal am Tag zu beten.',
    });
    expect(infoOf({ id: 'own-1', note: 'Mein Text' })).toEqual({ note: 'Mein Text' });
    // The examination of conscience points to the Nachtgebet, where it ends in the word of comfort (rule 1).
    expect(infoOf({ id: 'wz-gewissen' }).about).toContain('Prüfung und Zuspruch');
  });
});

describe('days of the Wüstenzeit', () => {
  it('reckons the first Sunday of Advent, not a fixed date', () => {
    expect(firstAdvent(2026)).toBe('2026-11-29');
    expect(firstAdvent(2027)).toBe('2027-11-28');
    expect(inAdvent('2026-11-28')).toBe(false);
    expect(inAdvent('2026-11-29')).toBe(true);
    expect(inAdvent('2026-12-24')).toBe(true);
    expect(inAdvent('2026-12-25')).toBe(false);
  });

  it('lists habits only on their days: Fridays, Wednesdays and Fridays, Advent', () => {
    const friday = habit('f', { days: [5] });
    const fast = habit('m', { days: [3, 5] });
    const advent = habit('a', { advent: true });
    expect(meantFor(friday, '2026-10-09')).toBe(true); // a Friday
    expect(meantFor(friday, '2026-10-08')).toBe(false);
    expect(meantFor(fast, '2026-10-07')).toBe(true); // a Wednesday
    expect(meantFor(advent, '2026-10-07')).toBe(false);
    expect(meantFor(advent, '2026-12-01')).toBe(true);
  });

  it('keeps a weekly habit in the list all week until ticked, then on the day it was ticked', () => {
    const verse = habit('v', { rhythm: 'weekly' });
    const lookup = lookupOf({ '2026-10-07': ['v'] });
    expect(listedOn(verse, '2026-10-05', lookupOf({}))).toBe(true);
    expect(listedOn(verse, '2026-10-07', lookup)).toBe(true);
    expect(listedOn(verse, '2026-10-08', lookup)).toBe(false);
    // The next week it stands again.
    expect(listedOn(verse, '2026-10-12', lookup)).toBe(true);
  });

  it('counts calendar weeks, Monday to Sunday, as under "Heute"', () => {
    // From Wednesday 7 October for 40 days: to Sunday 15 November.
    const run = { startDate: '2026-10-07', durationDays: 40 };
    expect(desertWeeks(run)).toHaveLength(6);
    expect(desertWeeks(run)[0]).toBe('2026-10-05');
    expect(desertWeekOf(run, '2026-10-11')).toBe(1);
    expect(desertWeekOf(run, '2026-10-12')).toBe(2);
  });

  it('documents what was kept, in days or weeks, never as a rate (rule 4)', () => {
    const p = withDesert(['wz-psalm', 'wz-bibelvers', 'wz-freitagsfasten']);
    const run = p.winterArc.runs[0]!;
    const lookup = lookupOf({
      '2026-10-05': ['wz-psalm', 'wz-bibelvers'],
      '2026-10-06': ['wz-psalm'],
      '2026-10-08': ['wz-freitagsfasten'], // a Thursday: not a day of it
      '2026-10-09': ['wz-freitagsfasten'],
      '2026-10-14': ['wz-bibelvers'],
    });
    const h = (id: string) => ({ ...habit(id), ...offer(id) }) as Habit;
    expect(keptIn(h('wz-psalm'), run, lookup, '2026-10-20')).toBe(2);
    expect(keptIn(h('wz-freitagsfasten'), run, lookup, '2026-10-20')).toBe(1);
    expect(keptIn(h('wz-bibelvers'), run, lookup, '2026-10-20')).toBe(2);
    expect(keptLine(h('wz-psalm'), 2)).toBe('an 2 Tagen gehalten');
    expect(keptLine(h('wz-psalm'), 1)).toBe('an einem Tag gehalten');
    expect(keptLine(h('wz-bibelvers'), 2)).toBe('in 2 Wochen gehalten');
    expect([keptLine(h('wz-psalm'), 0), keptLine(h('wz-bibelvers'), 3)].join()).not.toMatch(/%|von \d+|Quote|Serie/);
  });
});

describe('writing down', () => {
  it('lets the thanks be written in the Gebetskammer, never the examination of conscience (rule 9)', () => {
    expect(canWrite({ id: 'wz-dankbarkeit' })).toBe(true);
    expect(canWrite({ id: 'wz-1abc-journal' })).toBe(true);
    expect(canWrite({ id: 'wz-gewissen' })).toBe(false);
    expect(canWrite({ id: 'wz-psalm' })).toBe(false);
    // The examination is prayed on a page of its own, without a field.
    expect(canExamine({ id: 'wz-gewissen' })).toBe(true);
    expect(canExamine({ id: 'wz-dankbarkeit' })).toBe(false);
  });
});

describe('choosing the habits', () => {
  it('takes a package at once, single habits across packages, and adds what Henoch lacks, off in everyday life', () => {
    let p = withDesert();
    p = choose(p, 'w', pack('aufbruch').habits, true, 2);
    p = choose(p, 'w', [offer('wz-psalm'), offer('tablePrayer')], true, 2);
    p = choose(p, 'w', [offer('wz-handy-spaeter')], false, 3);
    expect(p.winterArc.runs[0]!.habits).toEqual(['wz-morgensegen', 'bibleReading', 'wz-dankbarkeit', 'wz-psalm', 'tablePrayer']);
    // The reading of the plan Henoch already has: no second one.
    expect(p.habits.filter((h) => h.id === 'bibleReading')).toHaveLength(1);
    const psalm = p.habits.find((h) => h.id === 'wz-psalm')!;
    expect(psalm).toMatchObject({ name: 'Psalm des Tages', rhythm: 'daily', active: false, desert: 'wuestenweg' });
    // The table prayer Henoch already has: no second one.
    expect(p.habits.filter((h) => h.id === 'tablePrayer')).toHaveLength(1);
    // Taken out again, the habit stays in the profile, with its ticks.
    expect(p.habits.some((h) => h.id === 'wz-handy-spaeter')).toBe(true);
  });

  it('keeps the rhythm of a habit: Friday fasting on Fridays, Advent ones in Advent', () => {
    let p = withDesert();
    p = choose(p, 'w', [offer('wz-freitagsfasten'), offer('wz-adventskranz')], true, 2);
    expect(p.habits.find((h) => h.id === 'wz-freitagsfasten')!.days).toEqual([5]);
    expect(p.habits.find((h) => h.id === 'wz-adventskranz')).toMatchObject({ advent: true, needs: 'family' });
  });

  it('adds own habits with a description, deletes them, and takes chosen ones into everyday life', () => {
    let p = withDesert();
    p = addOwn(p, 'w', { name: '  Brief an einen Bruder ', note: 'Jede Woche einer.', rhythm: 'weekly' }, 'own-1', 2);
    expect(p.habits.at(-1)).toMatchObject({ id: 'own-1', name: 'Brief an einen Bruder', note: 'Jede Woche einer.', desert: 'own' });
    expect(p.winterArc.runs[0]!.habits).toEqual(['own-1']);
    expect(addOwn(p, 'w', { name: '  ', rhythm: 'daily' }, 'own-2', 3)).toBe(p);
    p = adopt(p, ['own-1']);
    expect(p.habits.find((h) => h.id === 'own-1')!.active).toBe(true);
    p = removeOwn(p, 'own-1', 4);
    expect(p.habits.some((h) => h.id === 'own-1')).toBe(false);
    expect(p.winterArc.runs[0]!.habits).toEqual([]);
    // Only own ones can be deleted this way.
    expect(removeOwn(p, 'tablePrayer', 5)).toBe(p);
  });

  it('lists the chosen habits in the order of the offer, those about the family once "Mein Haus" holds it', () => {
    let p = withDesert();
    p = choose(p, 'w', [offer('wz-gewissen'), offer('wz-morgensegen'), offer('wz-singen')], true, 2);
    p = addOwn(p, 'w', { name: 'Eigenes', rhythm: 'daily' }, 'own-1', 3);
    expect(habitsOf(p.winterArc.runs[0]!, p).map((h) => h.id)).toEqual(['wz-morgensegen', 'wz-gewissen', 'own-1']);
    const house = { ...p.house, wife: { ...p.house.wife, name: 'Anna' } };
    expect(habitsOf(p.winterArc.runs[0]!, { ...p, house }).map((h) => h.id)).toEqual([
      'wz-morgensegen',
      'wz-gewissen',
      'wz-singen',
      'own-1',
    ]);
  });

  it('sets the verse of the package most habits come from; with mostly own ones 1 Tim 4,7', () => {
    const run = (habits: string[]) => withDesert(habits).winterArc.runs[0]!;
    expect(leadVerse(run(['wz-morgensegen', 'bibleReading', 'wz-handy-spaeter', 'wz-psalm'])).ref).toBe('Lk 16,10');
    expect(leadVerse(run(['wz-segen', 'bibleReading', 'own-1'])).ref).toBe('1 Tim 4,7');
    expect(leadVerse(run(['tablePrayer', 'familyDevotion'])).ref).toBe('Jos 24,15');
    expect(leadVerse(run(['wz-psalm', 'own-1', 'own-2']))).toEqual(DESERT_VERSE);
    expect(leadVerse(run([]))).toEqual(DESERT_VERSE);
    expect(DESERT_VERSE.text).toBe('Übe dich selbst aber in der Gottseligkeit.');
  });
});

describe('a round of the Streithalle under way becomes a Wüstenzeit (0.39)', () => {
  it('turns its points into own habits and copies their ticks into the days; nothing is lost', () => {
    let p = defaultProfile('2026-10-05');
    let data = startRun(p.winterArc, '2026-09-28', 90, 1, 'old', 'Fastenzeit', [
      { id: 'pray', text: 'Psalm beten', rhythm: 'daily', block: 'morning', weekdays: [1, 2, 3, 4, 5, 6, 0] },
      { id: 'run', text: 'Laufen', rhythm: 'daily', block: 'morning', weekdays: [1, 3, 5] },
      { id: 'gone', text: 'Weg', rhythm: 'daily', block: 'house', weekdays: [1], removed: true },
      { id: 'letter', text: 'Brief', rhythm: 'weekly' },
    ]);
    data = toggleCheck(data, 'old', '2026-09-29', 'pray', 2);
    data = toggleCheck(data, 'old', '2026-09-30', 'run', 2);
    data = toggleWeekly(data, 'old', 1, 'letter', 2);
    p = { ...p, winterArc: data };
    const conv = fromRound(p, '2026-10-05', 3)!;
    const run = conv.profile.winterArc.runs[0]!;
    expect(run.habits).toEqual(['wz-old-pray', 'wz-old-run', 'wz-old-letter']);
    expect(run.name).toBe('Fastenzeit');
    expect(conv.profile.habits.find((h) => h.id === 'wz-old-run')).toMatchObject({ name: 'Laufen', days: [1, 3, 5], desert: 'own' });
    expect(conv.ticks).toEqual([
      { date: '2026-09-29', id: 'wz-old-pray' },
      { date: '2026-09-30', id: 'wz-old-run' },
      // The weekly tick on the last day of its week of the round.
      { date: '2026-10-04', id: 'wz-old-letter' },
    ]);
    // The old ticks stay with the round.
    expect(conv.profile.winterArc.days).toHaveLength(2);
    // Once a Wüstenzeit, it is not turned again.
    expect(fromRound(conv.profile, '2026-10-05', 4)).toBeUndefined();
  });
});

describe('what the orders already hold (0.40)', () => {
  const day = (fn: (d: Day) => void): Day => {
    const d = emptyDay('2026-10-07');
    fn(d);
    return d;
  };

  it('ticks the Morgensegen, the psalm, the blessings, the examination and the thanks with the orders', () => {
    const bed = day((d) => (d.morning.atBed = true));
    const vespers = day((d) => (d.evening.vespersDone = true));
    const both = day((d) => {
      d.morning.done = true;
      d.evening.complineDone = true;
    });
    const short = day((d) => {
      d.evening.complineDone = true;
      d.evening.complineForm = 'short';
    });
    const thanks = day((d) => (d.evening.thanks = ['', 'den Regen']));
    expect(keptByOrder({ id: 'wz-morgensegen' }, bed)).toBe(true);
    expect(keptByOrder({ id: 'wz-psalm' }, bed)).toBe(false);
    expect(keptByOrder({ id: 'wz-psalm' }, vespers)).toBe(true);
    expect(keptByOrder({ id: 'wz-segen' }, bed)).toBe(false);
    expect(keptByOrder({ id: 'wz-segen' }, both)).toBe(true);
    expect(keptByOrder({ id: 'wz-gewissen' }, both)).toBe(true);
    // The short Nachtgebet has no examination.
    expect(keptByOrder({ id: 'wz-gewissen' }, short)).toBe(false);
    expect(keptByOrder({ id: 'wz-dankbarkeit' }, thanks)).toBe(true);
    expect(keptByOrder({ id: 'wz-dankbarkeit' }, day((d) => (d.evening.thanks = ['  '])))).toBe(false);
    expect(keptByOrder({ id: 'wz-handy-spaeter' }, both)).toBe(false);
  });

  it('counts such a day as kept, without a second tap; other days are ticked by hand', () => {
    const h = habit('wz-morgensegen');
    const bed = day((d) => (d.morning.atBed = true));
    expect(isDoneOn(h, bed)).toBe(true);
    expect(canToggle(h, '2026-10-07', '2026-10-07', () => bed)).toBe(false);
    const open = emptyDay('2026-10-07');
    expect(isDoneOn(h, open)).toBe(false);
    expect(canToggle(h, '2026-10-07', '2026-10-07', () => open)).toBe(true);
    expect(isDoneOn(h, { ...open, habits: { 'wz-morgensegen': true } })).toBe(true);
  });

  it('says under the "i" where Henoch holds a habit', () => {
    expect(infoOf({ id: 'wz-morgensegen' }).henoch).toMatch(/„Am Bett“ oder die Stille Zeit abschließt\. An anderen Tagen hakst du von Hand ab\./);
    expect(infoOf({ id: 'bibleReading' }).henoch).toMatch(/Leseplan.*„Wort“/);
    expect(infoOf({ id: 'exercise' }).henoch).toBe('In Henoch heißt sie „Leibliche Übung“.');
    expect(infoOf({ id: 'familyDevotion' }).henoch).toBeUndefined();
    expect(infoOf({ id: 'wz-handy-spaeter' }).henoch).toBeUndefined();
  });
});

describe('the habits Henoch already had become its own (0.40)', () => {
  it('takes their place in every round, copies their ticks, and switches one taken into everyday life on', () => {
    let p = withDesert();
    p = {
      ...p,
      habits: [
        ...p.habits,
        habit('wz-bewegung', { name: 'Bewegung', desert: 'wuestenweg', active: true }),
        habit('wz-bibellese', { name: 'Bibellese', desert: 'aufbruch' }),
        habit('wz-geben', { name: 'Geben', rhythm: 'weekly', desert: 'more' }),
      ],
      winterArc: { ...p.winterArc, runs: p.winterArc.runs.map((r) => ({ ...r, habits: ['wz-bewegung', 'wz-bibellese', 'wz-geben', 'wz-psalm'] })) },
    };
    const d = (date: DateKey, ids: string[]): Day => ({ ...emptyDay(date), habits: Object.fromEntries(ids.map((id) => [id, true])) });
    const days = [d('2026-10-05', ['wz-bewegung', 'wz-bibellese']), d('2026-10-06', ['wz-geben', 'exercise', 'wz-bewegung'])];
    const out = relink(p, days, 9)!;
    expect(out.profile.winterArc.runs[0]!.habits).toEqual(['exercise', 'bibleReading', 'offering', 'wz-psalm']);
    expect(out.profile.habits.some((h) => ['wz-bewegung', 'wz-bibellese', 'wz-geben'].includes(h.id))).toBe(false);
    expect(out.profile.habits.find((h) => h.id === 'exercise')!.active).toBe(true);
    expect(out.profile.habits.find((h) => h.id === 'offering')!.active).toBe(false);
    // The reading keeps its own record with the plan; a tick already there is not written twice.
    expect(out.ticks).toEqual([
      { date: '2026-10-05', id: 'exercise' },
      { date: '2026-10-06', id: 'offering' },
    ]);
    expect(relink(out.profile, days, 10)).toBeUndefined();
  });
});

describe('the 90-Tage-Standard as a package (0.40)', () => {
  it('has the points of the plan with their notes, the times as the plan sets them', () => {
    const std = pack('standard');
    expect(std.verse.ref).toBe('Matthäus 6,33');
    expect(std.habits.slice(0, 3).map((h) => h.name)).toEqual(['04:00 auf, kein Handy', 'Morgenzeit im Wort und Gebet', 'Tagebuch und drei Dankpunkte']);
    expect(offer('wz-std-wake').note).toBe('Der Wecker steht außer Reichweite. Das Handy hat über Nacht außerhalb des Schlafzimmers geladen.');
    // The journal can be written down; the morning in the Word is kept with the Stille Zeit.
    expect(canWrite({ id: 'wz-std-journal' })).toBe(true);
    expect(keptByOrder({ id: 'wz-std-word' }, { ...emptyDay('2026-10-07'), morning: { ...emptyDay('2026-10-07').morning, done: true } })).toBe(true);
    // Its phases and focuses go with a Wüstenzeit that holds its points.
    expect(usesStandard({ habits: ['wz-std-wake', 'wz-psalm'] })).toBe(true);
    expect(usesStandard({ habits: ['exercise', 'worship'] })).toBe(false);
  });
});
