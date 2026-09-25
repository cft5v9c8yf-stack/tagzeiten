import { useEffect } from 'react';
import { useSelectedDate } from '../../app/useSelectedDate';
import { useProfile, useStore, useStoreVersion } from '../../data/hooks';
import { getPlan, ownAmounts, portionLabel, portionUrl } from '../../domain/readingPlan';
import { Section } from '../../ui/Section';
import { SectionVerse } from '../../ui/SectionVerse';
import { Timer } from '../../ui/Timer';
import { readingTimer } from '../../ui/timerState';
import { MethodHelpBody, ReadingRefs } from '../liturgy/MorningReading';
import { PlanInfo, PlanSettings } from '../settings/PlanSettings';

const AHEAD = 5;

/**
 * What comes after today's portion, for orientation. The plan runs by progress,
 * not by date (rule 6), so there are no dates and nothing to catch up.
 */
function NextPortions({ date }: { date: string }) {
  const store = useStore();
  const profile = useProfile();
  useStoreVersion();
  const plan = getPlan(profile.plan.planId);
  const { reading } = store.readingFor(date);
  return (
    <div className="next-portions">
      {plan.tracks.map((t) => {
        const today = reading.portions[t.def.id];
        const from = reading.done || today === undefined ? (profile.plan.positions[t.def.id] ?? 0) : today + 1;
        const next = t.portions.slice(from, from + AHEAD);
        return (
          <div key={t.def.id} className="next-track">
            <h4 className="next-track-title">{t.def.label}</h4>
            <ol className="next-list">
              {next.map((p, i) => (
                <li key={i}>
                  <a href={portionUrl(t, p)} target="_blank" rel="noopener noreferrer">
                    {portionLabel(t, p)}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  );
}

export function BiblePage() {
  const { date, isToday } = useSelectedDate();
  const store = useStore();
  useStoreVersion();
  const { reading } = store.readingFor(date);
  const read = reading.done;
  // Reading by time: a timer of its own for today's reading, over all books read by time.
  const minutes = (ownAmounts(reading.planId) ?? []).reduce((s, a) => s + (a.unit === 'minutes' ? a.value : 0), 0);
  useEffect(() => {
    if (isToday) store.ensureTodayReading();
  }, [store, isToday]);

  return (
    <div className="bible-page">
      <h2>Bibel</h2>
      <SectionVerse id="plan" />
      {/* Marked as read through the habit "Bibel lesen" on Today. */}
      <Section
        id="bible.today"
        title={
          <>
            {isToday ? 'Heute lesen' : 'Lesung'}
            {read && <span className="title-state"> · gelesen</span>}
          </>
        }
        className="block block-hero"
      >
        <ReadingRefs date={date} />
        {isToday && minutes > 0 && (
          <Timer timer={readingTimer} totalMinutes={minutes} hint="Lesezeit" className="timer-inline" />
        )}
      </Section>
      <Section id="bible.next" title="Danach" className="block block-plain">
        <NextPortions date={date} />
      </Section>
      <Section id="bible.method" title="So wird gelesen" defaultOpen={false} className="block block-warm">
        <MethodHelpBody />
      </Section>
      <Section
        id="bible.plan"
        title="Leseplan einstellen"
        defaultOpen={false}
        info={<PlanInfo />}
        className="block block-quiet"
      >
        <PlanSettings />
      </Section>
    </div>
  );
}
