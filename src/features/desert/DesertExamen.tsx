import { Link, useNavigate, useSearchParams } from 'react-router';
import { conscienceWords, DESERT_CONSCIENCE } from '../../content/desert';
import { EXAMEN_NOTE } from '../../content/examen';
import { ORDERS } from '../../content/orders';
import { useProfile, useStore } from '../../data/hooks';
import { formatLong, isDateKey, weekdayOf } from '../../domain/dates';
import { isDoneOn } from '../../domain/habits';
import { activeRun, isInRun } from '../../domain/winterArc';
import { OrderPart } from '../liturgy/OrderPart';

/** The address of the page, below the Arena like an entry of the Gebetskammer. */
export const EXAMEN_SLUG = 'pruefung';

/** The way there from the Gebetskammer. */
export const GEBETSKAMMER = '/arena?bereich=gebetskammer';

/** The confession of the Nachtgebet, as it is prayed there. */
const CONFESSION = ORDERS.find((o) => o.id === 'compline' && o.form === 'full')!
  .steps.find((s) => s.id === 'examination')!
  .parts.find((p) => p.kind === 'confession')!;

function Word({ verse, className = 'pray' }: { verse: { text: string; ref: string }; className?: string }) {
  return (
    <div className={className}>
      <p>{verse.text}</p>
      <p className="attribution">
        <span className="bible-ref">{verse.ref}</span>
      </p>
    </div>
  );
}

/**
 * The examination of conscience on a page of its own (1.4): Baptism and Psalm 139
 * first (rule 2), six questions to pray, the confession of the Nachtgebet, and the
 * absolution with a word of forgiveness every day (rule 1). There is no field:
 * sins are prayed, not written down (rule 9). Only the tick is kept.
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
  // From the list of the Wüstenzeit the habit comes along; from the Gebetskammer, the one of the Wüstenzeit under way.
  const run = activeRun(profile.winterArc);
  const fallback = run && isInRun(run, date) && run.habits?.includes('wz-gewissen') ? 'wz-gewissen' : undefined;
  const habit = profile.habits.find((h) => h.id === (params.get('gewohnheit') ?? fallback));
  const c = DESERT_CONSCIENCE;
  return (
    <article className="arena-entry desert-examen">
      <p className="back-link">
        <Link to={home}>{home === GEBETSKAMMER ? '‹ Gebetskammer' : '‹ Zurück zur Liste'}</Link>
      </p>
      <h2>Gewissenserforschung</h2>
      <p className="small muted">{formatLong(date)}</p>
      <figure className="section-verse wa-verse">
        <blockquote>„{c.lead.text}“</blockquote>
        <figcaption>{c.lead.ref}</figcaption>
      </figure>
      <Word verse={c.prayer} />
      <section className="part part-examination">
        <h3 className="part-title">Erforschung</h3>
        <ul className="examen-questions">
          {c.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
        <p className="note">{EXAMEN_NOTE}</p>
      </section>
      <OrderPart part={CONFESSION} ctx={{ order: 'compline', form: 'full', date }} headingLevel={3} />
      <section className="part part-absolution">
        <h3 className="part-title">Zuspruch</h3>
        {conscienceWords(weekdayOf(date)).map((v) => (
          <Word key={v.ref} verse={v} className="pray absolution" />
        ))}
        <p className="examen-sending">{c.sending}</p>
      </section>
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
