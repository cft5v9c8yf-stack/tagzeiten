import { useEffect, useState, type CSSProperties } from 'react';
import { arcPosition, buildArc, fromMinutes } from '../../domain/dayArc';
import type { Day, Schedule } from '../../domain/model';

const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

const pct = (v: number) => `${(v * 100).toFixed(2)}%`;

/**
 * The day from rising to lights out: a thin line with the three prayer times.
 * Prayed times are filled; open ones stay neutral – never red (rule 5).
 */
export function DayArc({ schedule, day, isToday }: { schedule: Schedule; day: Day; isToday: boolean }) {
  const arc = buildArc(schedule, day);
  const [now, setNow] = useState(nowMinutes);
  useEffect(() => {
    if (!isToday) return;
    const id = setInterval(() => setNow(nowMinutes()), 60_000);
    return () => clearInterval(id);
  }, [isToday]);

  const showNow = isToday && now >= arc.start && now <= arc.end;
  const summary = arc.blocks
    .map((b) => `${b.label} ${fromMinutes(b.start)}${b.done ? ', gebetet' : ''}`)
    .join('; ');

  return (
    <figure
      className="day-arc"
      role="img"
      aria-label={`Tagesbogen von ${fromMinutes(arc.start)} bis ${fromMinutes(arc.end)}: ${summary}`}
    >
      <div className="arc-track" aria-hidden="true">
        {showNow && <span className="arc-elapsed" style={{ width: pct(arcPosition(arc, now)) }} />}
        {arc.blocks.map((b) => (
          <span
            key={b.id}
            className={`arc-dot${b.done ? ' done' : ''}`}
            style={{ '--x': pct(arcPosition(arc, b.start)) } as CSSProperties}
          />
        ))}
        {showNow && <span className="arc-now" style={{ '--x': pct(arcPosition(arc, now)) } as CSSProperties} />}
      </div>
      <div className="arc-labels" aria-hidden="true">
        {arc.blocks.map((b) => {
          const p = arcPosition(arc, b.start);
          const align = p < 0.08 ? ' start' : p > 0.92 ? ' end' : '';
          return (
            <span key={b.id} className={`arc-label${align}`} style={{ '--x': pct(p) } as CSSProperties}>
              {fromMinutes(b.start)}
            </span>
          );
        })}
      </div>
    </figure>
  );
}
