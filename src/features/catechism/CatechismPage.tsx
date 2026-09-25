import { useId, useState } from "react";
import { flushSync } from "react-dom";
import {
  CATECHISM,
  CATECHISM_SUBTITLE,
  TABLE_OF_DUTIES,
  TABLE_OF_DUTIES_SUBTITLE,
} from "../../content/catechism";
import { CATECHISM_WITH_CHILDREN_HABIT } from "../../content/habits";
import {
  PRIVATE_CONFESSION,
  TABLE_PRAYER_AFTER,
  TABLE_PRAYER_BEFORE,
} from "../../content/liturgy";
import { useSelectedDate } from "../../app/useSelectedDate";
import { useDayLookup, useProfile, useStore } from "../../data/hooks";
import {
  catechismFor,
  memorizedCount,
  offsetForChiefPart,
  pieceId,
  TOTAL_PIECES,
} from "../../domain/catechismDay";
import { canToggle, isDoneInPeriod, toggleHabit } from "../../domain/habits";
import { BibleLink } from "../../ui/BibleLink";
import { PrayerText, Rubric } from "../../ui/PrayerText";
import { Section } from "../../ui/Section";
import { setOpen } from "../../ui/collapseState";
import { PieceText } from "../liturgy/CatechismOfDay";
import { CatechismOverview } from "./CatechismOverview";
import { HouseFatherMode } from "./HouseFatherMode";

/** A chief part (or appendix) that folds away; its number stands in red like a rubric. */
function Chief({
  id,
  no,
  title,
  defaultOpen,
  children,
}: {
  id: string;
  no: string;
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  return (
    <Section
      id={`cat.${id}`}
      title={
        <>
          <span className="no" aria-hidden={no === '·' || undefined}>
            {no}
          </span>{' '}
          <span className="title">{title}</span>
        </>
      }
      level={3}
      defaultOpen={defaultOpen}
      className="chief"
    >
      <div className="chief-body">{children}</div>
    </Section>
  );
}

function TablePrayer({
  id,
  title,
  prayer,
}: {
  id: string;
  title: string;
  prayer: typeof TABLE_PRAYER_BEFORE;
}) {
  return (
    <Section
      id={`cat.table.${id}`}
      title={title}
      level={4}
      titleClassName="cat-sub"
    >
      <PrayerText text={prayer.verse} />
      <Rubric>{prayer.rubric}</Rubric>
      <PrayerText text={prayer.prayer} />
    </Section>
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

  const habit = profile.habits.find(
    (h) => h.id === CATECHISM_WITH_CHILDREN_HABIT,
  );
  const withChildren = habit ? isDoneInPeriod(habit, date, lookup) : false;

  const chooseChief = (i: number) =>
    store.updateProfile(
      (p) => ({
        ...p,
        catechism: { ...p.catechism, weekOffset: offsetForChiefPart(date, i) },
      }),
      { immediate: true },
    );

  const openPiece = (ci: number, pi: number) => {
    const chief = CATECHISM[ci]!;
    const id = pieceId(chief, pi);
    // Unfold the chief part and the piece first, so there is something to jump to.
    flushSync(() => {
      setOpen(`cat.chief.${chief.id}`, true);
      setOpen(`cat.piece.${id}`, true);
    });
    const piece = document.getElementById(`piece-${id}`);
    piece?.scrollIntoView({ block: "start" });
    piece?.focus({ preventScroll: true });
  };

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
          <select
            id={selectId}
            value={day.chiefIndex}
            onChange={(e) => chooseChief(Number(e.target.value))}
          >
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
          <progress
            max={TOTAL_PIECES}
            value={learned}
            aria-label={`${learned} von ${TOTAL_PIECES} Stücken auswendig`}
          />
          <span className="progress-value">
            {learned} / {TOTAL_PIECES}
          </span>
        </div>
        <div className="cat-actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => setHouseFather(true)}
          >
            Hausvater-Modus: am Tisch abfragen
          </button>
          {habit && (
            <button
              type="button"
              className="pill"
              aria-pressed={withChildren}
              disabled={!canToggle(habit, date, store.today(), lookup)}
              onClick={() =>
                store.updateDay(date, (d) => toggleHabit(d, habit), {
                  immediate: true,
                })
              }
            >
              {withChildren
                ? "✓ Diese Woche mit den Kindern gelernt"
                : "Mit den Kindern gelernt"}
            </button>
          )}
        </div>
      </div>

      <CatechismOverview
        memorized={memorized}
        currentChief={day.chiefIndex}
        onOpenPiece={openPiece}
      />

      {CATECHISM.map((chief, ci) => (
        <Chief
          key={chief.id}
          id={`chief.${chief.id}`}
          no={String(ci + 1)}
          title={chief.title}
          defaultOpen={ci === day.chiefIndex}
        >
          {chief.pieces.map((piece, pi) => {
            const id = pieceId(chief, pi);
            const today =
              ci === day.chiefIndex && day.pieceIndices.includes(pi);
            return (
              <article
                key={id}
                id={`piece-${id}`}
                tabIndex={-1}
                className={`kpiece${today ? " today" : ""}`}
              >
                <Section
                  id={`cat.piece.${id}`}
                  title={
                    <>
                      {piece.title}
                      {today && <span className="ktag">heute</span>}
                    </>
                  }
                  level={4}
                  titleClassName="kpiece-title"
                >
                  <PieceText piece={piece} />
                  <button
                    type="button"
                    className="pill"
                    aria-pressed={!!memorized[id]}
                    onClick={() => toggleMemorized(id)}
                  >
                    {memorized[id] ? "✓ auswendig" : "auswendig gelernt"}
                  </button>
                </Section>
              </article>
            );
          })}
        </Chief>
      ))}

      <Chief id="table" no="·" title="Tischgebete" defaultOpen={false}>
        <TablePrayer
          id="before"
          title="Vor dem Essen"
          prayer={TABLE_PRAYER_BEFORE}
        />
        <TablePrayer
          id="after"
          title="Nach dem Essen"
          prayer={TABLE_PRAYER_AFTER}
        />
      </Chief>

      <Chief id="duties" no="·" title="Die Haustafel" defaultOpen={false}>
        <Rubric>{TABLE_OF_DUTIES_SUBTITLE}</Rubric>
        <ul className="duties">
          {TABLE_OF_DUTIES.map((d) => (
            <li key={d.title}>
              <span>{d.title}</span>
              <span className="small">
                {d.refs.map((r, i) => (
                  <span key={r}>
                    {i > 0 && " · "}
                    <BibleLink reference={r} />
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </Chief>

      <Chief
        id="confession"
        no="·"
        title="Anhang: Privatbeichte"
        defaultOpen={false}
      >
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
        <Section
          id="cat.confession.request"
          title="Bitte"
          level={4}
          titleClassName="cat-sub"
        >
          <PrayerText text={PRIVATE_CONFESSION.request} />
        </Section>
        <Section
          id="cat.confession.confession"
          title="Bekenntnis"
          level={4}
          titleClassName="cat-sub"
        >
          <PrayerText text={PRIVATE_CONFESSION.confession} />
          <Rubric>{PRIVATE_CONFESSION.confessionRubric}</Rubric>
          <PrayerText text={PRIVATE_CONFESSION.confessionEnd} />
        </Section>
        {/* The absolution never folds away (rule 1). */}
        <h4 className="cat-sub">Zuspruch des Beichtvaters</h4>
        <PrayerText
          text={PRIVATE_CONFESSION.absolution}
          className="absolution"
        />
        <p className="small">{PRIVATE_CONFESSION.after}</p>
      </Chief>

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
