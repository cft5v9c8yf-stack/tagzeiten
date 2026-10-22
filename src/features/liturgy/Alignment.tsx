import type { Part } from '../../content/orders';
import { RUBRICS } from '../../content/orders';
import { useDay, useProfile, useStore } from '../../data/hooks';
import { THREE_LABEL, suggestionsFor } from '../../domain/review';
import { weekIntent } from '../../domain/well';
import { Rubric } from '../../ui/PrayerText';
import type { PartContext } from './OrderPart';
import { PartFields } from './PartFields';

/** The three things: Wort, Haus, Werk – with suggestions from yesterday and from the reading. */
export function Alignment({ part, ctx }: { part: Part; ctx: PartContext }) {
  const store = useStore();
  const day = useDay(ctx.date);
  const suggestions = suggestionsFor(day, store.dayBefore(ctx.date));
  // From the Treffen am Abendbrunnen, if it is switched on: the resolution and the wish of the week.
  const intent = weekIntent(useProfile().well, ctx.date);

  return (
    <>
      <Rubric>{RUBRICS.alignment}</Rubric>
      {intent && (
        <div className="well-intent">
          <p className="small muted">Vom letzten Treffen am Abendbrunnen</p>
          {intent.resolution && <p>Dein Vorsatz für diese Woche: {intent.resolution}</p>}
          {intent.wish && <p>Ihr Wunsch an dich: {intent.wish}</p>}
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="suggestions">
          <p className="small muted">Vorschläge – antippen zum Übernehmen:</p>
          <div className="chips">
            {suggestions.map((s) => (
              <button
                key={`${s.source}-${s.key}`}
                type="button"
                className="chip"
                onClick={() =>
                  store.updateDay(ctx.date, (d) => ({ ...d, morning: { ...d.morning, three: { ...d.morning.three, [s.key]: s.text } } }), {
                    immediate: true,
                  })
                }
              >
                <span className="chip-source">{s.source === 'again' ? `${THREE_LABEL[s.key]}, von gestern` : 'aus dem →'}:</span>{' '}
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}
      <PartFields part={part} date={ctx.date} />
      <p className="small muted">{RUBRICS.alignmentNotAVow}</p>
    </>
  );
}
