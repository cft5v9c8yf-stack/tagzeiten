import { Link, useNavigate, useSearchParams } from 'react-router';
import { DESERT_EXAMEN_VERSE } from '../../content/desert';
import { ORDERS } from '../../content/orders';
import { useProfile, useStore } from '../../data/hooks';
import { formatLong, isDateKey } from '../../domain/dates';
import { isDoneOn } from '../../domain/habits';
import { WaVerse } from '../arena/WinterArcGuide';
import { OrderPart } from '../liturgy/OrderPart';

/** The address of the page, below the Arena like an entry of the Gebetskammer. */
export const EXAMEN_SLUG = 'pruefung';

/** The examination of the Nachtgebet: its question of the day, the confession and the absolution. */
const EXAMEN_STEP = ORDERS.find((o) => o.id === 'compline' && o.form === 'full')!.steps.find((s) => s.id === 'examination')!;

/**
 * The examination of conscience of the Wüstenzeit on a page of its own: the
 * Word first (rule 2), then the parts of the Nachtgebet's examination, ending
 * in the absolution (rule 1). There is no field: sins are prayed, not written
 * down (rule 9). Only the tick is kept, and the way leads back to the list.
 */
export function DesertExamen() {
  const store = useStore();
  const profile = useProfile();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const back = params.get('zurueck');
  const day = params.get('tag');
  const date = day && isDateKey(day) && day <= store.today() ? day : store.today();
  const home = back && /^\/(?!\/)/.test(back) ? back : '/arena';
  const habit = profile.habits.find((h) => h.id === params.get('gewohnheit'));
  return (
    <article className="arena-entry desert-examen">
      <p className="back-link">
        <Link to={home}>‹ Zurück zur Liste</Link>
      </p>
      <h2>Gewissenserforschung</h2>
      <p className="small muted">{formatLong(date)}</p>
      <WaVerse verse={DESERT_EXAMEN_VERSE} />
      {EXAMEN_STEP.parts.map((part) => (
        <OrderPart key={part.kind} part={part} ctx={{ order: 'compline', form: 'full', date }} headingLevel={3} />
      ))}
      <div className="arena-actions">
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            if (habit && !isDoneOn(habit, store.getDay(date))) store.toggleHabit(date, habit);
            navigate(home);
          }}
        >
          {habit ? 'Gebetet, abhaken und zurück' : 'Zurück'}
        </button>
      </div>
    </article>
  );
}
