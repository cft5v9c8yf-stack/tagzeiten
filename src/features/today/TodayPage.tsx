import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { getOrder } from '../../content/orders';
import { EVENING_PSALMS, MORNING_PSALMS } from '../../content/psalms';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { useDay, useProfile, useStore, useStoreVersion } from '../../data/hooks';
import { psalmRef, psalmUrl } from '../../domain/bibleRef';
import { catechismFor, memorizedCount, TOTAL_PIECES } from '../../domain/catechismDay';
import { weekdayOf } from '../../domain/dates';
import { THREE_KEYS, type Day } from '../../domain/model';
import { chaptersBefore, getPlan } from '../../domain/readingPlan';
import { MARK_LABEL, MARK_SYMBOL, THREE_LABEL } from '../../domain/review';
import { BibleLink } from '../../ui/BibleLink';
import { ReadCheckbox, ReadingRefs } from '../liturgy/MorningReading';
import { DayArc } from './DayArc';
import { HabitsWeek } from './HabitsWeek';
import { Lookback } from './Lookback';

/** On app start after 15:00 the evening is what is due; the prototype opened it directly. */
let startupHandled = false;

function useEveningOnStartup(isToday: boolean) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  useEffect(() => {
    if (startupHandled) return;
    startupHandled = true;
    if (isToday && !params.has('d') && new Date().getHours() >= 15) navigate('/abend', { replace: true });
  }, [isToday, navigate, params]);
}

function morningStatus(day: Day): string {
  if (day.morning.done) return 'abgeschlossen';
  const order = getOrder('morning', day.morning.form);
  const n = order.steps.filter((s) => day.morning.steps[s.id]).length;
  return n === 0 ? 'offen' : `${n} von ${order.steps.length} Schritten`;
}

function eveningStatus(day: Day): string {
  if (day.evening.complineDone) return day.evening.vespersDone ? 'abgeschlossen' : 'Nachtgebet gebetet';
  return day.evening.vespersDone ? 'Vesper gebetet' : 'offen';
}

function ReadingPanel({ date, isToday }: { date: string; isToday: boolean }) {
  const store = useStore();
  const profile = useProfile();
  useStoreVersion();
  const plan = getPlan(profile.plan.planId);
  const { reading } = store.readingFor(date);

  useEffect(() => {
    if (isToday) store.ensureTodayReading();
  }, [store, isToday]);

  return (
    <section aria-labelledby="reading-title">
      <h3 id="reading-title">
        {isToday ? 'Heute lesen' : 'Lesung'}
        {reading.done && <span className="title-state"> · gelesen</span>}
      </h3>
      <ReadingRefs date={date} />
      <ReadCheckbox date={date} />
      <div className="progress">
        {plan.tracks.map((t) => {
          const read = chaptersBefore(t, profile.plan.positions[t.def.id] ?? 0);
          return (
            <div key={t.def.id} className="progress-row">
              <span className="progress-label">{t.def.label}</span>
              <progress max={t.totalChapters} value={read} aria-label={`${t.def.label}: ${read} von ${t.totalChapters} Kapiteln gelesen`} />
              <span className="progress-value">
                {read} / {t.totalChapters}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ThreeThings({ day, date, isToday }: { day: Day; date: string; isToday: boolean }) {
  const any = THREE_KEYS.some((k) => day.morning.three[k]);
  return (
    <section aria-labelledby="three-title">
      <h3 id="three-title">Die drei Dinge</h3>
      <div className="panel three">
        {any ? (
          THREE_KEYS.map((k) => {
            const mark = day.evening.marks[k];
            return (
              <div key={k} className="three-row">
                <span className="three-key">{THREE_LABEL[k]}</span>
                <span>{day.morning.three[k] || <span className="muted">—</span>}</span>
                {mark && (
                  <span className={`mark ${mark}`} title={MARK_LABEL[mark]}>
                    {MARK_SYMBOL[mark]}
                    <span className="visually-hidden"> {MARK_LABEL[mark]}</span>
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <p className="muted three-empty">
            Werden in der Stille Zeit festgelegt, nach dem Wort.{' '}
            <Link to={withDate('/morgen', date, isToday)}>Zur Stille Zeit</Link>
          </p>
        )}
      </div>
    </section>
  );
}

function ThisWeek({ date, isToday }: { date: string; isToday: boolean }) {
  const profile = useProfile();
  const cat = catechismFor(date, profile.catechism.weekOffset);
  const wd = weekdayOf(date);
  const mp = MORNING_PSALMS[wd];
  const ep = EVENING_PSALMS[wd];
  return (
    <section aria-labelledby="week-title">
      <h3 id="week-title">Diese Woche</h3>
      <dl className="facts">
        <div>
          <dt>Katechismus</dt>
          <dd>
            {cat.chief.title} – heute: {cat.label}{' '}
            <Link to={withDate('/katechismus', date, isToday)} className="inline-link">
              lesen
            </Link>
          </dd>
        </div>
        <div>
          <dt>Auswendig</dt>
          <dd>
            {memorizedCount(profile.catechism.memorized)} von {TOTAL_PIECES} Stücken
          </dd>
        </div>
        <div>
          <dt>Psalm am Morgen</dt>
          <dd>
            <BibleLink reference={psalmRef(mp.psalm)} href={psalmUrl(mp.psalm)} />
          </dd>
        </div>
        <div>
          <dt>Psalm am Abend</dt>
          <dd>
            <BibleLink reference={psalmRef(ep.psalm)} href={psalmUrl(ep.psalm)} />
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function TodayPage() {
  const { date, isToday } = useSelectedDate();
  const day = useDay(date);
  const profile = useProfile();
  useEveningOnStartup(isToday);
  const s = profile.schedule;

  return (
    <>
      <h2 className="visually-hidden">{isToday ? 'Heute' : 'Tag'}</h2>
      <DayArc schedule={s} day={day} isToday={isToday} />
      <div className="tiles">
        <Link to={withDate('/morgen', date, isToday)} className={`tile${day.morning.done ? ' is-done' : ''}`}>
          <span className="tile-time">
            {s.stillTime} · {day.morning.form === 'short' ? '20' : '45'} Min.
          </span>
          <span className="tile-name">Stille Zeit</span>
          <span className="tile-state">{morningStatus(day)}</span>
        </Link>
        <Link
          to={withDate('/abend', date, isToday)}
          className={`tile${day.evening.vespersDone && day.evening.complineDone ? ' is-done' : ''}`}
        >
          <span className="tile-time">
            {s.vespers} · {s.compline}
          </span>
          <span className="tile-name">Vesper und Nachtgebet</span>
          <span className="tile-state">{eveningStatus(day)}</span>
        </Link>
      </div>

      <ReadingPanel date={date} isToday={isToday} />
      <ThreeThings day={day} date={date} isToday={isToday} />

      <section aria-labelledby="habits-title">
        <h3 id="habits-title">Gewohnheiten</h3>
        <HabitsWeek date={date} />
      </section>

      <section aria-labelledby="lookback-title">
        <h3 id="lookback-title">Rückblick</h3>
        <Lookback date={date} />
      </section>

      <ThisWeek date={date} isToday={isToday} />
    </>
  );
}
