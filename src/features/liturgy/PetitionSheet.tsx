/**
 * "Bitte und Fürbitte": the whole prayer on one sheet, to be taken in at a
 * glance and then prayed with the phone laid aside. Word first (rule 2), then
 * the house, the concerns carried every day and those of the weekday, in that
 * order (rule 18), thanks, Lord's Prayer and blessing. Nothing to fill in.
 */
import { useEffect } from 'react';
import { BENEDICAMUS, BLESSING, IN_THE_NAME, LORDS_PRAYER_LUTHER, SIGN_OF_THE_CROSS } from '../../content/liturgy';
import { EVENING_PSALMS, MORNING_PSALMS } from '../../content/psalms';
import { useProfile, useStore, useStoreVersion } from '../../data/hooks';
import { psalmRef } from '../../domain/bibleRef';
import { WEEKDAY_LONG, weekdayOf, type DateKey } from '../../domain/dates';
import { childrenOf, wifeOf } from '../../domain/house';
import { getPlan, portionLabel } from '../../domain/readingPlan';
import { BibleRef } from '../../ui/BibleRef';
import { PrayerText, VersicleView } from '../../ui/PrayerText';

/** The day's portions of the reading plan, "1. Mose 1 · Matthäus 1". */
function useReadingLine(date: DateKey): string {
  const store = useStore();
  useStoreVersion();
  // Today receives its portion when the reading is first shown.
  useEffect(() => {
    if (date === store.today()) store.ensureTodayReading();
  }, [store, date]);
  const { reading } = store.readingFor(date);
  const plan = getPlan(reading.planId);
  return plan.tracks
    .map((t) => {
      const i = reading.portions[t.def.id];
      const p = i === undefined ? undefined : t.portions[i];
      return p ? portionLabel(t, p) : '';
    })
    .filter(Boolean)
    .join(' · ');
}

function Concern({ name, concern }: { name: string; concern?: string }) {
  const c = concern?.trim();
  return (
    <div>
      {name}
      {c && <span className="ps-sub"> – {c}</span>}
    </div>
  );
}

export function PetitionSheet({ date, order }: { date: DateKey; order: 'morning' | 'vespers' }) {
  const profile = useProfile();
  const wd = weekdayOf(date);
  const ps = (order === 'morning' ? MORNING_PSALMS : EVENING_PSALMS)[wd];
  const reading = useReadingLine(date);
  const wife = wifeOf(profile.house);
  const children = childrenOf(profile.house);
  const daily = profile.prayer.daily;
  const weekly = profile.prayer.weekly[wd] ?? [];
  const house = !!wife || children.length > 0;
  const any = house || daily.length > 0 || weekly.length > 0;

  return (
    <div className="ps">
      <p className="ps-line">{IN_THE_NAME}</p>
      <hr className="ps-rule" />

      <p className="ps-label">Das Wort</p>
      <p className="ps-psalm">
        <BibleRef reference={psalmRef(ps.psalm)} />
      </p>
      <p className="ps-antiphon">{ps.antiphon}</p>
      {reading && <p className="ps-reading">{reading}</p>}
      <hr className="ps-rule" />

      <p className="ps-label">Bitte und Fürbitte</p>
      {any ? (
        <dl className="ps-rows">
          {house && (
            <>
              <dt>Mein Haus</dt>
              <dd>
                {wife && <Concern name={wife.name} concern={wife.concern} />}
                {children.map((c) => (
                  <Concern key={c.id} name={c.name} concern={c.concern} />
                ))}
              </dd>
            </>
          )}
          {daily.length > 0 && (
            <>
              <dt>Ich trage</dt>
              <dd>
                {daily.map((c) => (
                  <div key={c}>{c}</div>
                ))}
              </dd>
            </>
          )}
          {weekly.length > 0 && (
            <>
              <dt>{WEEKDAY_LONG[wd]}</dt>
              <dd>
                {weekly.map((c) => (
                  <div key={c}>{c}</div>
                ))}
              </dd>
            </>
          )}
        </dl>
      ) : (
        <p className="small muted">Deine Anliegen trägst du unter Mehr → Gebet ein, Frau und Kinder unter „Mein Haus“.</p>
      )}
      <hr className="ps-rule" />

      <p className="ps-label">Dank</p>
      <p className="ps-question">Wofür dankst du heute?</p>
      <hr className="ps-rule" />

      <details className="ps-texts">
        <summary>
          <span className="ps-label">Vaterunser · Segen</span>
          <span className="ps-more">Texte</span>
        </summary>
        <PrayerText text={LORDS_PRAYER_LUTHER} />
        <VersicleView items={[BENEDICAMUS, BLESSING]} />
      </details>
      <hr className="ps-rule" />
      <p className="ps-line">{SIGN_OF_THE_CROSS.lines.join(' ')}</p>
    </div>
  );
}
