import { useEffect } from 'react';
import { START_PLAN_ID } from '../../content/readingPlans';
import { useProfile, useStore, useStoreVersion } from '../../data/hooks';
import type { DateKey } from '../../domain/dates';
import { desertReadingOf, type DesertReading } from '../../domain/desert';
import { getPlan, portionLabel, sectionKind, sectionOf } from '../../domain/readingPlan';
import { isInRun, stageOf, type WinterArcRun } from '../../domain/winterArc';
import { Segmented } from '../../ui/Choice';

/**
 * The day's section in the Wüstenzeit, to read only: as everything of the
 * Wüstenzeit since 1.19, it is ticked under "Heute" ("Bibel lesen") or under
 * "Wort". The Word stands first (rule 2). Past days show the section they had,
 * later ones none: the plan runs by progress, nothing is owed (rule 6).
 */
export function DesertReadingDay({ run, date }: { run: WinterArcRun; date: DateKey }) {
  const store = useStore();
  useStoreVersion();
  const today = store.today();
  const shown = run.reading !== 'none' && isInRun(run, date) && date <= today;
  useEffect(() => {
    if (shown && date === today) store.ensureTodayReading();
  }, [store, shown, date, today]);
  if (!shown) return null;
  const { reading, assigned } = store.readingFor(date);
  if (date !== today && !assigned) return null;
  const plan = getPlan(reading.planId);
  const labels = plan.tracks
    .map((t) => {
      const i = reading.portions[t.def.id];
      const p = i === undefined ? undefined : t.portions[i];
      return p ? portionLabel(t, p) : '';
    })
    .filter(Boolean);
  const section = sectionOf(plan, reading);
  return (
    <section className="panel wa-group desert-reading" aria-labelledby="desert-reading-title">
      <h5 id="desert-reading-title">
        Lesung
        {reading.done && <span className="title-state"> · gelesen</span>}
      </h5>
      <p className="desert-reading-ref">{labels.join(' · ')}</p>
      <p className="small muted">
        {section ? `${plan.def.name} · Abschnitt ${section.section} von ${section.sections}` : plan.def.name}
      </p>
      {date === today && (
        <p className="small muted">
          Abgehakt wird mit „Bibel lesen“ unter „Heute“.
        </p>
      )}
    </section>
  );
}

/** What each choice of reading means, beside the choice. */
function readingNote(value: DesertReading, days: number, bibleName: string): string {
  if (value === 'desert')
    return `Die Versuchung Jesu (Matthäus 4), die Bergpredigt (Matthäus 5–7), das Evangelium nach Johannes, der Jakobusbrief, der 1. Petrusbrief und der Hebräerbrief, gleichmäßig auf ${days === 1 ? 'einen Tag' : `${days} Tage`} verteilt. Vom ersten bis zum letzten Tag der Wüstenzeit steht der Abschnitt des Tages oben in der Wüstenwanderung und unter „Wort“. Dein Plan „${bibleName}“ ruht so lange und geht danach von selbst dort weiter, wo du aufgehört hast.`;
  if (value === 'bible')
    return `Du liest weiter nach deinem Plan „${bibleName}“. Der Abschnitt des Tages steht oben in der Wüstenwanderung. Einen anderen Plan wählst du unter „Wort“, Bibel.`;
  return 'Die Wüstenwanderung zeigt keine Lesung. Dein Leseplan unter „Wort“ bleibt, wie er ist.';
}

/** The choice of reading for a Wüstenzeit, before it begins or while it runs. */
export function DesertReadingChoice({
  value,
  days,
  onChange,
}: {
  value: DesertReading;
  days: number;
  onChange: (v: DesertReading) => void;
}) {
  const profile = useProfile();
  const current = profile.plan.planId;
  const bible = getPlan(sectionKind(current) === 'desert' ? (profile.plan.beforeDesert ?? START_PLAN_ID) : current);
  return (
    <div className="field desert-reading-choice">
      <span className="field-label">Leseplan</span>
      <Segmented<DesertReading>
        label="Leseplan der Wüstenzeit"
        grid
        options={[
          { value: 'desert', label: 'Bewährung und Nachfolge' },
          { value: 'bible', label: 'Mein Leseplan' },
          { value: 'none', label: 'Ohne Lesung' },
        ]}
        value={value}
        onChange={onChange}
      />
      <p className="small muted">{readingNote(value, days, bible.def.name)}</p>
    </div>
  );
}

/** The reading of a Wüstenzeit under way, to change at any time. */
export function DesertReadingSettings({ run }: { run: WinterArcRun }) {
  const store = useStore();
  if (stageOf(run, store.today()) === 'after') return null;
  return (
    <DesertReadingChoice
      value={desertReadingOf(run)}
      days={run.durationDays}
      onChange={(v) => store.setDesertReading(run.id, v)}
    />
  );
}
