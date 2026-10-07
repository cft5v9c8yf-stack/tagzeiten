import { Link, useNavigate, useSearchParams } from 'react-router';
import { useDay, useProfile, useStore } from '../../data/hooks';
import { formatLong, isDateKey } from '../../domain/dates';
import { isDoneOn } from '../../domain/habits';
import { DayField } from '../../ui/DayField';

/** The address of the page, below the Arena like an entry of the Gebetskammer. */
export const THANKS_SLUG = 'dank';

/**
 * The thanks of the Wüstenzeit on a page of its own: the three lines of the
 * Nachtgebet's thanks for that day, so they stand there and in the weekly
 * review too; for the journal of a round taken over, the sentence of the day
 * before them. Written, the habit is ticked and the way leads back to the
 * list. Who would rather write freely goes on to the Gebetskammer.
 */
export function DesertThanks() {
  const store = useStore();
  const profile = useProfile();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const back = params.get('zurueck');
  const day = params.get('tag');
  const date = day && isDateKey(day) && day <= store.today() ? day : store.today();
  const home = back && /^\/(?!\/)/.test(back) ? back : '/arena';
  const habit = profile.habits.find((h) => h.id === params.get('gewohnheit'));
  const journal = !!habit && /^wz-.+-journal$/.test(habit.id);
  const d = useDay(date);
  const written = d.evening.thanks.some((t) => t.trim()) || (journal && !!d.morning.verse?.trim());
  const freely = () => {
    navigate(`/arena/${store.addArenaEntry()}?${params}`, { replace: true });
  };
  return (
    <article className="arena-entry desert-thanks">
      <p className="back-link">
        <Link to={home}>‹ Zurück zur Liste</Link>
      </p>
      <h2>{habit?.name ?? 'Dank'}</h2>
      <p className="small muted">{formatLong(date)}</p>
      {journal && <DayField date={date} path="morning.verse" label="Der Satz, der mich trifft" />}
      <DayField date={date} path="evening.thanks.0" />
      <DayField date={date} path="evening.thanks.1" />
      <DayField date={date} path="evening.thanks.2" />
      <p className="small muted">
        {journal
          ? 'Der Satz steht auch in der Andacht und in der Versesammlung, der Dank im Nachtgebet und im Wochenrückblick.'
          : 'Der Dank steht auch im Nachtgebet und im Wochenrückblick.'}
      </p>
      <div className="arena-actions">
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            if (habit && written && !isDoneOn(habit, store.getDay(date))) store.toggleHabit(date, habit);
            navigate(home);
          }}
        >
          {written ? 'Sichern, abhaken und zurück' : 'Zurück zur Liste'}
        </button>
        <button type="button" className="btn" onClick={freely}>
          Lieber frei in der Gebetskammer schreiben
        </button>
      </div>
    </article>
  );
}
