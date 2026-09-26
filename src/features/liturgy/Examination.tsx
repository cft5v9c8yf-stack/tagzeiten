import { armorOf } from '../../content/armor';
import { useProfile } from '../../data/hooks';
import { EXAMEN_INTRO, EXAMEN_NOTE, STATIONS, STATION_BY_WEEKDAY } from '../../content/examen';
import { weekdayOf, type DateKey } from '../../domain/dates';
import { BibleRef } from '../../ui/BibleRef';
import { Note } from '../../ui/PrayerText';

/**
 * Examination at the Decalogue in the station of the weekday.
 * No input field (rule 9); confession and absolution follow directly (rule 1).
 */
export function Examination({ date }: { date: DateKey }) {
  const station = STATIONS[STATION_BY_WEEKDAY[weekdayOf(date)]];
  const profile = useProfile();
  const armor = armorOf(weekdayOf(date));
  return (
    <>
      {profile.armor && (
        <p className="armor-question">
          <span className="station">{armor.title}:</span> {armor.question}
        </p>
      )}
      <p className="small muted">{EXAMEN_INTRO}</p>
      <p className="station">{station.label ?? `Als ${station.title}`}:</p>
      <p className="examen-question">{station.question}</p>
      <p className="small">
        Haustafel:{' '}
        {station.refs.map((r, i) => (
          <span key={r}>
            {i > 0 && ' · '}
            <BibleRef reference={r} />
          </span>
        ))}
      </p>
      <Note>{EXAMEN_NOTE}</Note>
    </>
  );
}
