import { churchDay } from '../../domain/churchYear';
import { formatLong, type DateKey } from '../../domain/dates';

/** The date at the top of the Today page, and the feast if the day has one. The week lives on "Sonntag". */
export function DayHeader({ date }: { date: DateKey }) {
  const { feast } = churchDay(date);
  return (
    <header className="church-year">
      <p className="cy-date">
        {formatLong(date)} {date.slice(0, 4)}
      </p>
      {feast && <p className="cy-feast">{feast}</p>}
    </header>
  );
}
