import { churchDay } from '../../domain/churchYear';
import { formatLong, type DateKey } from '../../domain/dates';
import { houseDays } from '../../domain/house';
import { useProfile } from '../../data/hooks';

/** The date at the top of the Today page, and the feast if the day has one. The week lives on "Sonntag". */
export function DayHeader({ date }: { date: DateKey }) {
  const { feast } = churchDay(date);
  // A birthday in the house or the wedding day: named on its day, nothing more.
  const days = houseDays(useProfile().house, date);
  return (
    <header className="church-year">
      <p className="cy-date">
        {formatLong(date)} {date.slice(0, 4)}
      </p>
      {feast && <p className="cy-feast">{feast}</p>}
      {days.map((d) => (
        <p key={d} className="cy-house">
          {d}
        </p>
      ))}
    </header>
  );
}
