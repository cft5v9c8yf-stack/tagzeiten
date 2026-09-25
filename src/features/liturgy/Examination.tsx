import { EXAMEN_INTRO, EXAMEN_NOTE, STATIONS, STATION_BY_WEEKDAY } from '../../content/examen';
import { weekdayOf, type DateKey } from '../../domain/dates';
import { BibleLink } from '../../ui/BibleLink';
import { Note } from '../../ui/PrayerText';

/**
 * Examination at the Decalogue in the station of the weekday.
 * No input field (rule 9); confession and absolution follow directly (rule 1).
 */
export function Examination({ date }: { date: DateKey }) {
  const station = STATIONS[STATION_BY_WEEKDAY[weekdayOf(date)]];
  return (
    <>
      <p className="small muted">{EXAMEN_INTRO}</p>
      <p className="station">{station.label ?? `Als ${station.title}`}:</p>
      <p className="examen-question">{station.question}</p>
      <p className="small">
        Haustafel:{' '}
        {station.refs.map((r, i) => (
          <span key={r}>
            {i > 0 && ' · '}
            <BibleLink reference={r} />
          </span>
        ))}
      </p>
      <Note>{EXAMEN_NOTE}</Note>
    </>
  );
}
