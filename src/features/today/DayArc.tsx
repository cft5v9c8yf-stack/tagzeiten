import { useEffect, useState } from 'react';
import { arcPosition, buildArc, fromMinutes } from '../../domain/dayArc';
import type { Day, Schedule } from '../../domain/model';

// Drawn at roughly phone width so that labels keep a readable size.
const W = 340;
const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

/**
 * The day from rising to lights out. Prayed times are green; open ones are
 * neutral – never red (rule 5).
 */
export function DayArc({ schedule, day, isToday }: { schedule: Schedule; day: Day; isToday: boolean }) {
  const arc = buildArc(schedule, day);
  const [now, setNow] = useState(nowMinutes);
  useEffect(() => {
    if (!isToday) return;
    const id = setInterval(() => setNow(nowMinutes()), 60_000);
    return () => clearInterval(id);
  }, [isToday]);

  const x = (m: number) => arcPosition(arc, m) * W;
  const summary = arc.blocks
    .map((b) => `${b.label} ${fromMinutes(b.start)}${b.done ? ', gebetet' : ''}`)
    .join('; ');

  return (
    <figure className="day-arc">
      <svg viewBox={`-2 0 ${W + 4} 58`} role="img" aria-label={`Tagesbogen von ${fromMinutes(arc.start)} bis ${fromMinutes(arc.end)}: ${summary}`}>
        <line x1={0} y1={26} x2={W} y2={26} className="arc-line" />
        {arc.blocks.map((b) => (
          <rect
            key={b.id}
            x={x(b.start)}
            y={17}
            width={Math.max(x(b.end) - x(b.start), 8)}
            height={18}
            rx={3}
            className={b.done ? 'arc-block done' : 'arc-block'}
          />
        ))}
        {isToday && now >= arc.start && now <= arc.end && (
          <g className="arc-now">
            <line x1={x(now)} y1={8} x2={x(now)} y2={40} />
            <circle cx={x(now)} cy={8} r={3} />
          </g>
        )}
        {arc.ticks.map((t, i) => (
          <text
            key={t}
            x={x(t)}
            y={54}
            textAnchor={i === 0 ? 'start' : i === arc.ticks.length - 1 ? 'end' : 'middle'}
            className="arc-tick"
          >
            {fromMinutes(t)}
          </text>
        ))}
      </svg>
    </figure>
  );
}
