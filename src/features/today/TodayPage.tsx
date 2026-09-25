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
            Werden in der Stille Zeit festgelegt, nach dem Wort.{' '}
            <Link to={withDate('/andacht/morgen', date, isToday)}>Zur Stille Zeit</Link>
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
  const s = profile.schedule;

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

      <Section id="today.habits" title="Gewohnheiten">
        <HabitsWeek date={date} />
      </Section>

      <Section id="today.lookback" title="Rückblick">
        <Lookback date={date} />
      </Section>

    </>
  );
}
