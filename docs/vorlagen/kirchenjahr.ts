import { churchDay } from '../../src/domain/churchYear';
import { SUNDAY_INFO } from '../../src/content/churchYearGuide';
import { WEEKLY_VERSES, FEAST_VERSES } from '../../src/content/weeklyVerses';
const YEAR = Number(process.argv[2] ?? 2027);
const out: any = { days: {}, weeks: {}, feastVerseKeys: Object.keys(FEAST_VERSES) };
for (let d = new Date(Date.UTC(YEAR, 0, 1)); d.getUTCFullYear() === YEAR; d.setUTCDate(d.getUTCDate() + 1)) {
  const key = d.toISOString().slice(0, 10);
  const c = churchDay(key as any);
  out.days[key] = { week: c.week, weekKey: c.weekKey, weekStart: c.weekStart, feast: c.feast, season: c.season };
  if (!out.weeks[c.weekKey]) out.weeks[c.weekKey] = { name: c.week, ...((SUNDAY_INFO as any)[c.weekKey] ?? {}), verse: (WEEKLY_VERSES as any)[c.weekKey] };
}
console.log(JSON.stringify(out));
