import { useId, useState } from 'react';
import {
  CATECHISM,
  CATECHISM_SUBTITLE,
  TABLE_OF_DUTIES,
  TABLE_OF_DUTIES_SUBTITLE,
} from '../../content/catechism';
import { CATECHISM_WITH_CHILDREN_HABIT } from '../../content/habits';
import { PRIVATE_CONFESSION, TABLE_PRAYER_AFTER, TABLE_PRAYER_BEFORE } from '../../content/liturgy';
import { useSelectedDate } from '../../app/useSelectedDate';
import { useDayLookup, useProfile, useStore } from '../../data/hooks';
import { catechismFor, memorizedCount, offsetForChiefPart, pieceId, TOTAL_PIECES } from '../../domain/catechismDay';
import { canToggle, isDoneInPeriod, toggleHabit } from '../../domain/habits';
import { BibleLink } from '../../ui/BibleLink';
import { PrayerText, Rubric } from '../../ui/PrayerText';
import { PieceText } from '../liturgy/CatechismOfDay';
import { HouseFatherMode } from './HouseFatherMode';

function TablePrayer({ title, prayer }: { title: string; prayer: typeof TABLE_PRAYER_BEFORE }) {
  return (
    <>
      <h4 className="cat-sub">{title}</h4>
      <PrayerText text={prayer.verse} />
      <Rubric>{prayer.rubric}</Rubric>
      <PrayerText text={prayer.prayer} />
    </>
  );
}

export function CatechismPage() {
  const { date } = useSelectedDate();
  const store = useStore();
  const profile = useProfile();
  const lookup = useDayLookup();
  const selectId = useId();
  const day = catechismFor(date, profile.catechism.weekOffset);
  const memorized = profile.catechism.memorized;
  const learned = memorizedCount(memorized);
  const [houseFather, setHouseFather] = useState(false);

  const habit = profile.habits.find((h) => h.id === CATECHISM_WITH_CHILDREN_HABIT);
  const withChildren = habit ? isDoneInPeriod(habit, date, lookup) : false;

  const chooseChief = (i: number) =>
    store.updateProfile(
      (p) => ({ ...p, catechism: { ...p.catechism, weekOffset: offsetForChiefPart(date, i) } }),
      { immediate: true },
    );

  const toggleMemorized = (id: string) =>
    store.updateProfile(
      (p) => {
        const m = { ...p.catechism.memorized };
        if (m[id]) delete m[id];
        else m[id] = true;
        return { ...p, catechism: { ...p.catechism, memorized: m } };
      },
      { immediate: true },
    );

  return (
    <>
      <h2>Der Kleine Katechismus</h2>
      <Rubric>{CATECHISM_SUBTITLE}</Rubric>

      <div className="panel cat-panel">
        <div className="field">
          <label htmlFor={selectId}>Hauptstück dieser Woche</label>
          <select id={selectId} value={day.chiefIndex} onChange={(e) => chooseChief(Number(e.target.value))}>
            {CATECHISM.map((c, i) => (
              <option key={c.id} value={i}>
                {i + 1}. {c.title}
              </option>
            ))}
          </select>
        </div>
        <p className="small">
          Heute: <b>{day.label}</b>
        </p>
        <div className="progress-row">
          <span className="progress-label">Auswendig</span>
          <progress max={TOTAL_PIECES} value={learned} aria-label={`${learned} von ${TOTAL_PIECES} Stücken auswendig`} />
          <span className="progress-value">
            {learned} / {TOTAL_PIECES}
          </span>
        </div>
        <div className="cat-actions">
          <button type="button" className="btn primary" onClick={() => setHouseFather(true)}>
            Hausvater-Modus: am Tisch abfragen
          </button>
          {habit && (
            <button
              type="button"
              className="pill"
              aria-pressed={withChildren}
              disabled={!canToggle(habit, date, store.today(), lookup)}
              onClick={() => store.updateDay(date, (d) => toggleHabit(d, habit), { immediate: true })}
            >
              {withChildren ? '✓ Diese Woche mit den Kindern gelernt' : 'Mit den Kindern gelernt'}
            </button>
          )}
        </div>
      </div>

      {CATECHISM.map((chief, ci) => (
        <details key={chief.id} className="chief" open={ci === day.chiefIndex}>
          <summary>
            <span className="no">{ci + 1}</span>
            <span className="title">{chief.title}</span>
          </summary>
          <div className="chief-body">
            {chief.pieces.map((piece, pi) => {
              const id = pieceId(chief, pi);
              const today = ci === day.chiefIndex && day.pieceIndices.includes(pi);
              return (
                <article key={id} className={`kpiece${today ? ' today' : ''}`}>
                  <h3 className="kpiece-title">
                    {piece.title}
                    {today && <span className="ktag">heute</span>}
                  </h3>
                  <PieceText piece={piece} />
                  <button type="button" className="pill" aria-pressed={!!memorized[id]} onClick={() => toggleMemorized(id)}>
                    {memorized[id] ? '✓ auswendig' : 'auswendig gelernt'}
                  </button>
                </article>
              );
            })}
          </div>
        </details>
      ))}

      <details className="chief">
        <summary>
          <span className="no">·</span>
          <span className="title">Tischgebete</span>
        </summary>
        <div className="chief-body">
          <TablePrayer title="Vor dem Essen" prayer={TABLE_PRAYER_BEFORE} />
          <TablePrayer title="Nach dem Essen" prayer={TABLE_PRAYER_AFTER} />
        </div>
      </details>

      <details className="chief">
        <summary>
          <span className="no">·</span>
          <span className="title">Die Haustafel</span>
        </summary>
        <div className="chief-body">
          <Rubric>{TABLE_OF_DUTIES_SUBTITLE}</Rubric>
          <ul className="duties">
            {TABLE_OF_DUTIES.map((d) => (
              <li key={d.title}>
                <span>{d.title}</span>
                <span className="small">
                  {d.refs.map((r, i) => (
                    <span key={r}>
                      {i > 0 && ' · '}
                      <BibleLink reference={r} />
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </details>

      <details className="chief">
        <summary>
          <span className="no">·</span>
          <span className="title">Anhang: Privatbeichte</span>
        </summary>
        <div className="chief-body">
          {PRIVATE_CONFESSION.intro.map((t) => (
            <p key={t}>{t}</p>
          ))}
          <dl className="facts">
            {PRIVATE_CONFESSION.order.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <h4 className="cat-sub">Bitte</h4>
          <PrayerText text={PRIVATE_CONFESSION.request} />
          <h4 className="cat-sub">Bekenntnis</h4>
          <PrayerText text={PRIVATE_CONFESSION.confession} />
          <Rubric>{PRIVATE_CONFESSION.confessionRubric}</Rubric>
          <PrayerText text={PRIVATE_CONFESSION.confessionEnd} />
          <h4 className="cat-sub">Zuspruch des Beichtvaters</h4>
          <PrayerText text={PRIVATE_CONFESSION.absolution} className="absolution" />
          <p className="small">{PRIVATE_CONFESSION.after}</p>
        </div>
      </details>

      {houseFather && (
        <HouseFatherMode
          chief={day.chief}
          startIndex={day.pieceIndices[0] ?? 0}
          onClose={() => setHouseFather(false)}
        />
      )}
    </>
  );
}
