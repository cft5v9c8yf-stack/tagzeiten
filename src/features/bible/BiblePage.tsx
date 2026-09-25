import { useEffect } from 'react';
import { READING_RUBRICS } from '../../content/method';
import { useSelectedDate } from '../../app/useSelectedDate';
import { useProfile, useStore, useStoreVersion } from '../../data/hooks';
import { getPlan, portionLabel, portionUrl } from '../../domain/readingPlan';
import { Section } from '../../ui/Section';
import { SectionVerse } from '../../ui/SectionVerse';
import { MethodHelpBody, ReadCheckbox, ReadingRefs } from '../liturgy/MorningReading';
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
  useEffect(() => {
    if (isToday) store.ensureTodayReading();
  }, [store, isToday]);

  return (
    <div className="bible-page">
      <h2>Bibel</h2>
      <SectionVerse id="plan" />
      <Section id="bible.today" title={isToday ? 'Heute lesen' : 'Lesung'}>
        <ReadingRefs date={date} />
        <ReadCheckbox date={date} />
        <p className="small muted">{READING_RUBRICS.restart}</p>
      </Section>
      <Section id="bible.next" title="Danach">
        <NextPortions date={date} />
      </Section>
      <Section id="bible.method" title="So wird gelesen" defaultOpen={false}>
        <MethodHelpBody />
      </Section>
      <Section id="bible.plan" title="Leseplan einstellen" defaultOpen={false} info={<PlanInfo />}>
        <PlanSettings />
      </Section>
    </div>
  );
}
