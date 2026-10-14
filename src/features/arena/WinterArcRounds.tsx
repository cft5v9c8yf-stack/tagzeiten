import { WINTER_ARC_COMFORT, WINTER_ARC_FOCUS, WINTER_ARC_REVIEW } from '../../content/winterArc';
import { useProfile } from '../../data/hooks';
import { desertWeeks, isDesert } from '../../domain/desert';
import { endDateOf, focusOf, hasReview, runName, totalWeeks, weekOf, type WinterArcRun } from '../../domain/winterArc';
import { formatFullDate } from '../desert/DesertSettings';

export const roundTitle = (run: WinterArcRun) =>
  `${runName(run)}: ${formatFullDate(run.startDate)} bis ${formatFullDate(endDateOf(run.startDate, run.durationDays))}`;

/** The weekly reviews of a round, to read again; at the end the word of comfort (rule 1). */
export function RoundReviews({ run }: { run: WinterArcRun }) {
  const profile = useProfile();
  // A Wüstenzeit counts calendar weeks; a round of the Streithalle before it counted from its start, by the focuses of the plan.
  const desert = isDesert(run);
  const W = desert ? desertWeeks(run).length : totalWeeks(run.durationDays);
  const weeks = Array.from({ length: W }, (_, i) => i + 1)
    .map((w) => ({ w, week: weekOf(profile.winterArc, run.id, w) }))
    .filter(({ week }) => hasReview(week));
  if (!weeks.length) return <p className="small muted">In dieser Wüstenzeit hast du keinen Wochenrückblick geschrieben.</p>;
  return (
    <div className="wa-reviews">
      {weeks.map(({ w, week }) => (
        <section key={w} className="wa-review wa-review-read">
          <h5>
            Woche {w}
            {!desert && ` · ${WINTER_ARC_FOCUS[focusOf(w, W) - 1]!.focus}`}
          </h5>
          {WINTER_ARC_REVIEW.filter((r) => week!.review[r.key].trim()).map((r) => (
            <div key={r.key} className="wa-review-line">
              <p className="wa-label">{r.label}</p>
              <p>{week!.review[r.key]}</p>
            </div>
          ))}
        </section>
      ))}
      <div className="arena-comfort wa-comfort">
        <p>„{WINTER_ARC_COMFORT.verse.text}“</p>
        <span className="bible-ref">{WINTER_ARC_COMFORT.verse.ref}</span>
      </div>
    </div>
  );
}
