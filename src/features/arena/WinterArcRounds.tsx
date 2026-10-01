import { useState } from 'react';
import { downloadText } from '../../app/files';
import { WINTER_ARC_COMFORT, WINTER_ARC_FOCUS, WINTER_ARC_REVIEW } from '../../content/winterArc';
import { useProfile, useStore } from '../../data/hooks';
import { endDateOf, focusOf, hasReview, runName, totalWeeks, weekOf, type WinterArcRun } from '../../domain/winterArc';
import { formatFullDate, WinterArcStartPanel } from '../settings/WinterArcSettings';
import { EndText } from './WinterArcGuide';

export const roundTitle = (run: WinterArcRun) =>
  `${runName(run)}: ${formatFullDate(run.startDate)} bis ${formatFullDate(endDateOf(run.startDate, run.durationDays))}`;

/** The weekly reviews of a round, to read again; at the end the word of comfort (rule 1). */
export function RoundReviews({ run }: { run: WinterArcRun }) {
  const profile = useProfile();
  const W = totalWeeks(run.durationDays);
  const weeks = Array.from({ length: W }, (_, i) => i + 1)
    .map((w) => ({ w, week: weekOf(profile.winterArc, run.id, w) }))
    .filter(({ week }) => hasReview(week));
  if (!weeks.length) return <p className="small muted">In dieser Runde ist kein Wochenrückblick geschrieben.</p>;
  return (
    <div className="wa-reviews">
      {weeks.map(({ w, week }) => (
        <section key={w} className="wa-review wa-review-read">
          <h5>
            Woche {w} · {WINTER_ARC_FOCUS[focusOf(w, W) - 1]!.focus}
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

/** From the day after the last day: "Tag 90 – und danach", the reviews, a new round or the export. */
export function WinterArcClosing({ run }: { run: WinterArcRun }) {
  const store = useStore();
  const [starting, setStarting] = useState(false);
  const exportMarkdown = async () => {
    downloadText(`henoch-${store.today()}.md`, await store.exportMarkdown(), 'text/markdown');
  };
  return (
    <div className="wa-closing">
      <h4>Tag 90 – und danach</h4>
      <p className="small muted">{roundTitle(run)}</p>
      <EndText />
      <h4>Die Wochenrückblicke dieser Runde</h4>
      <RoundReviews run={run} />
      <div className="button-row">
        <button type="button" className="btn primary" onClick={() => setStarting(true)}>
          Neue Runde starten
        </button>
        <button type="button" className="btn" onClick={() => void exportMarkdown()}>
          Als Markdown exportieren
        </button>
      </div>
      {starting && (
        <WinterArcStartPanel
          today={store.today()}
          onCancel={() => setStarting(false)}
          onStart={(s, d, n) => {
            store.startWinterArc(s, d, n);
            setStarting(false);
          }}
        />
      )}
    </div>
  );
}
