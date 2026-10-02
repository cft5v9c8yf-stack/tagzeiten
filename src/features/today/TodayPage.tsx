import { scheduleFor } from '../../domain/schedule';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { getOrder } from '../../content/orders';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { useDay, useProfile, useStore, useStoreVersion } from '../../data/hooks';
import { THREE_KEYS, type Day } from '../../domain/model';
import { MARK_LABEL, MARK_SYMBOL, THREE_LABEL } from '../../domain/review';
import { Section } from '../../ui/Section';
import { ReadingRefs } from '../liturgy/MorningReading';
import { DayHeader } from './DayHeader';
import { DayArc } from './DayArc';
import { HabitsWeek } from './HabitsWeek';
import { Lookback } from './Lookback';
import { eveningClosed } from '../../domain/stats';
import { churchDay } from '../../domain/churchYear';
import { LutherRose } from '../../ui/LutherRose';
import { activeRun, hallModeIn, runName, shortSpan } from '../../domain/winterArc';

function morningStatus(day: Day): string {
  if (day.morning.done) return 'abgeschlossen';
  const order = getOrder('morning', day.morning.form);
  const n = order.steps.filter((s) => day.morning.steps[s.id]).length;
  return n === 0 ? 'offen' : `${n} von ${order.steps.length} Schritten`;
}

function eveningStatus(day: Day, withCompline: boolean): string {
  if (!withCompline) return day.evening.vespersDone ? 'abgeschlossen' : 'offen';
  if (day.evening.complineDone) return day.evening.vespersDone ? 'abgeschlossen' : 'Nachtgebet gebetet';
  return day.evening.vespersDone ? 'Vesper gebetet' : 'offen';
}

function ReadingPanel({ date, isToday }: { date: string; isToday: boolean }) {
  const store = useStore();
  useStoreVersion();
  const { reading } = store.readingFor(date);

  useEffect(() => {
    if (isToday) store.ensureTodayReading();
  }, [store, isToday]);

  return (
    <Section id="today.reading" title={
      <>
        {isToday ? 'Heute lesen' : 'Lesung'}
        {reading.done && <span className="title-state"> · gelesen</span>}
      </>
    }>
      <ReadingRefs date={date} />
    </Section>
  );
}

function ThreeThings({ day, date, isToday }: { day: Day; date: string; isToday: boolean }) {
  const any = THREE_KEYS.some((k) => day.morning.three[k]);
  return (
    <Section id="today.three" title="Die drei Dinge">
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
            Sie werden in der Stillen Zeit festgelegt, nach dem Wort.{' '}
            <Link to={withDate('/andacht/morgen', date, isToday)}>Zur Stillen Zeit</Link>
          </p>
        )}
      </div>
    </Section>
  );
}

export function TodayPage() {
  const { date, isToday } = useSelectedDate();
  const day = useDay(date);
  const profile = useProfile();
  const s = scheduleFor(profile, date);
  const hallMode = hallModeIn(profile.winterArc, date);
  const church = churchDay(date);
  const hallRun = hallMode ? activeRun(profile.winterArc) : undefined;

  return (
    <>
      <h2 className="visually-hidden">{isToday ? 'Heute' : 'Tag'}</h2>
      <DayHeader date={date} />
      <DayArc schedule={s} day={day} isToday={isToday} />
      <div className="tiles">
        <Link to={withDate('/andacht/morgen', date, isToday)} className={`tile${day.morning.done ? ' is-done' : ''}`}>
          <span className="tile-time">
            {s.stillTime} · {day.morning.form === 'short' ? '20' : '45'} Min.
          </span>
          <span className="tile-name">Stille Zeit</span>
          <span className="tile-state">{morningStatus(day)}</span>
        </Link>
        <Link
          to={withDate('/andacht/abend', date, isToday)}
          className={`tile${day.evening.vespersDone && eveningClosed(day, profile.showCompline) ? ' is-done' : ''}`}
        >
          <span className="tile-time">
            {profile.showCompline ? `${s.vespers} · ${s.compline}` : s.vespers}
          </span>
          <span className="tile-name">{profile.showCompline ? 'Vesper und Nachtgebet' : 'Vesper'}</span>
          <span className="tile-state">{eveningStatus(day, profile.showCompline)}</span>
        </Link>
      </div>

      <Link
        className="sunday-link"
        to={isToday ? '/sonntag' : `/sonntag?s=${church.weekStart}`}
      >
        <span className="sunday-link-rose" aria-hidden="true">
          <LutherRose size={30} />
        </span>
        <span className="sunday-link-text">
          <span className="sunday-link-label">Diese Woche</span>
          <span className="sunday-link-week">{church.week}</span>
        </span>
        <span className="sunday-link-go" aria-hidden="true">
          ›
        </span>
      </Link>

      <ReadingPanel date={date} isToday={isToday} />
      <ThreeThings day={day} date={date} isToday={isToday} />

      <Section
        id="today.habits"
        title={hallMode ? 'Streithalle' : 'Gewohnheiten'}
        aside={hallRun ? `${runName(hallRun)} · ${shortSpan(hallRun)}` : undefined}
      >
        <HabitsWeek date={date} />
        {hallMode && (
          <p className="small muted habits-mode-note">
            Während der Runde stehen hier die Gewohnheiten der Streithalle.{' '}
            <Link to="/arena?bereich=streithalle">Zur Streithalle</Link>
          </p>
        )}
      </Section>

      <Section id="today.lookback" title="Rückblick">
        <Lookback date={date} />
      </Section>

    </>
  );
}
