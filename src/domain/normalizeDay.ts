/**
 * Rebuilds a Day from untrusted input (database, import file) by copying
 * known fields only. Anything else – including any field an older or foreign
 * file might carry for confessions – is dropped (rule 9).
 */
import { SEVEN_QUESTIONS } from '../content/questions';
import { isDateKey } from './dates';
import {
  emptyDay,
  EVENING_TEXT_FIELDS,
  MORNING_TEXT_FIELDS,
  THANKS_COUNT,
  THREE_KEYS,
  WREATH_FIELDS,
  type Carry,
  type Day,
  type Mark,
} from './model';

type Loose = Record<string, unknown>;

const obj = (v: unknown): Loose => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Loose) : {});
const str = (v: unknown): string | undefined => (typeof v === 'string' && v !== '' ? v : undefined);
const isMark = (v: unknown): v is Mark => v === 'plus' || v === 'tilde' || v === 'minus';
const isCarry = (v: unknown): v is Carry => v === 'again' || v === 'drop';

function trueRecord(v: unknown): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const [k, x] of Object.entries(obj(v))) if (x === true) out[k] = true;
  return out;
}

export function normalizeDay(raw: unknown): Day | null {
  const r = obj(raw);
  if (typeof r.date !== 'string' || !isDateKey(r.date)) return null;
  const d = emptyDay(r.date);

  const m = obj(r.morning);
  d.morning.form = m.form === 'short' ? 'short' : 'full';
  d.morning.steps = trueRecord(m.steps);
  d.morning.done = m.done === true;
  d.morning.atBed = m.atBed === true;
  if (typeof m.questionNo === 'number' && Number.isInteger(m.questionNo) && m.questionNo >= 0 && m.questionNo < SEVEN_QUESTIONS.length) {
    d.morning.questionNo = m.questionNo;
  }
  for (const f of MORNING_TEXT_FIELDS) {
    const v = str(m[f]);
    if (v !== undefined) d.morning[f] = v;
  }
  const wreath = obj(m.wreath);
  for (const f of WREATH_FIELDS) {
    const v = str(wreath[f]);
    if (v !== undefined) d.morning.wreath[f] = v;
  }
  const three = obj(m.three);
  for (const k of THREE_KEYS) {
    const v = str(three[k]);
    if (v !== undefined) d.morning.three[k] = v;
  }

  const e = obj(r.evening);
  d.evening.vespersDone = e.vespersDone === true;
  d.evening.vespersForm = e.vespersForm === 'short' ? 'short' : 'full';
  d.evening.complineDone = e.complineDone === true;
  d.evening.complineForm = e.complineForm === 'short' ? 'short' : 'full';
  d.evening.thanks = Array.isArray(e.thanks)
    ? e.thanks.slice(0, THANKS_COUNT).map((x) => (typeof x === 'string' ? x : ''))
    : [];
  for (const f of EVENING_TEXT_FIELDS) {
    const v = str(e[f]);
    if (v !== undefined) d.evening[f] = v;
  }
  const marks = obj(e.marks);
  const carry = obj(e.carry);
  for (const k of THREE_KEYS) {
    const mk = marks[k];
    if (isMark(mk)) {
      d.evening.marks[k] = mk;
      const c = carry[k];
      if (mk !== 'plus' && isCarry(c)) d.evening.carry[k] = c;
    }
  }

  const reading = obj(r.reading);
  if (typeof reading.planId === 'string') {
    const portions: Record<string, number> = {};
    for (const [k, v] of Object.entries(obj(reading.portions))) {
      if (typeof v === 'number' && Number.isInteger(v) && v >= 0) portions[k] = v;
    }
    d.reading = { planId: reading.planId, portions, done: reading.done === true };
  }

  d.habits = trueRecord(r.habits);
  d.updatedAt = typeof r.updatedAt === 'number' ? r.updatedAt : 0;
  return d;
}

/** Whether a day holds anything worth keeping. */
export function isEmptyDay(d: Day): boolean {
  const m = d.morning;
  const e = d.evening;
  return (
    !d.reading &&
    !m.done &&
    !m.atBed &&
    Object.keys(m.steps).length === 0 &&
    m.questionNo === undefined &&
    MORNING_TEXT_FIELDS.every((f) => !m[f]) &&
    Object.values(m.wreath).every((v) => !v) &&
    Object.values(m.three).every((v) => !v) &&
    !e.vespersDone &&
    !e.complineDone &&
    e.thanks.every((t) => !t) &&
    EVENING_TEXT_FIELDS.every((f) => !e[f]) &&
    Object.keys(e.marks).length === 0 &&
    Object.values(d.habits).every((v) => !v)
  );
}
