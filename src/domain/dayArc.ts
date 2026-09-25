/**
 * Geometry of the day arc on the Today page: a line from rising to lights out
 * with the three prayer times on it. Times come from the settings, because not
 * everyone rises at four.
 */
import { ORDER_MINUTES } from '../content/orders';
import type { Day, Schedule } from './model';

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

export const fromMinutes = (min: number): string => {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

export type ArcBlockId = 'stillTime' | 'vespers' | 'compline';

export interface ArcBlock {
  id: ArcBlockId;
  label: string;
  start: number;
  end: number;
  done: boolean;
}

export interface Arc {
  /** Minutes since midnight. */
  start: number;
  end: number;
  blocks: ArcBlock[];
  /** Full hours to label. */
  ticks: number[];
}

export function buildArc(schedule: Schedule, day: Day): Arc {
  let start = Math.min(toMinutes(schedule.rise), toMinutes(schedule.stillTime));
  let end = Math.max(toMinutes(schedule.lightsOut), toMinutes(schedule.compline) + 10);
  if (end - start < 60) end = start + 60;
  start = Math.floor(start / 60) * 60;
  end = Math.ceil(end / 60) * 60;

  const morningMin = ORDER_MINUTES.morning[day.morning.form];
  const block = (id: ArcBlockId, label: string, at: string, minutes: number, done: boolean): ArcBlock => {
    const s = toMinutes(at);
    return { id, label, start: s, end: s + minutes, done };
  };
  const blocks = [
    block('stillTime', 'Stille Zeit', schedule.stillTime, morningMin, day.morning.done),
    block('vespers', 'Vesper', schedule.vespers, ORDER_MINUTES.vespers[day.evening.vespersForm], day.evening.vespersDone),
    block('compline', 'Nachtgebet', schedule.compline, ORDER_MINUTES.compline[day.evening.complineForm], day.evening.complineDone),
  ];

  const hours = (end - start) / 60;
  const step = hours <= 8 ? 2 : 4;
  const ticks: number[] = [];
  for (let h = start / 60; h <= end / 60; h += step) ticks.push(h * 60);
  // Always label the end; replace a tick that would crowd it.
  const last = ticks.at(-1)!;
  if (last !== end) {
    if (end - last < 120) ticks[ticks.length - 1] = end;
    else ticks.push(end);
  }
  return { start, end, blocks, ticks };
}

/** Position 0…1 on the arc; clamped. */
export function arcPosition(arc: Arc, minutes: number): number {
  return Math.min(1, Math.max(0, (minutes - arc.start) / (arc.end - arc.start)));
}
