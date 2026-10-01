import { useEffect, useId, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link, useParams, useSearchParams } from 'react-router';
import { CATECHISM, CATECHISM_SUBTITLE, TABLE_OF_DUTIES, TABLE_OF_DUTIES_SUBTITLE } from '../../content/catechism';
import { AUGSBURG_CONFESSION, AUGSBURG_SOURCE, type BookPart } from '../../content/augsburgConfession';
import { LARGE_CATECHISM, LARGE_CATECHISM_SOURCE } from '../../content/largeCatechism';
import { CONCORDIA_CONTENTS, CONCORDIA_INTRO, CONCORDIA_NOTE } from '../../content/concordia';
import { CREEDS } from '../../content/creeds';
import { CATECHISM_WITH_CHILDREN_HABIT } from '../../content/habits';
import { PRIVATE_CONFESSION, TABLE_PRAYER_AFTER, TABLE_PRAYER_BEFORE } from '../../content/liturgy';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { useDayLookup, useProfile, useStore } from '../../data/hooks';
import { catechismFor, offsetForChiefPart, pieceId } from '../../domain/catechismDay';
import { canToggle, isDoneInPeriod } from '../../domain/habits';
import { BibleRef } from '../../ui/BibleRef';
import { PrayerText, Rubric } from '../../ui/PrayerText';
import { Section } from '../../ui/Section';
import { setOpen } from '../../ui/collapseState';
import { DieffenbachBook } from '../churchyear/DieffenbachBook';
import { PieceText } from '../liturgy/CatechismOfDay';
import { APPENDICES, CatechismOverview } from './CatechismOverview';
import { HouseFatherMode } from './HouseFatherMode';

function TablePrayer({ id, title, prayer }: { id: string; title: string; prayer: typeof TABLE_PRAYER_BEFORE }) {
  return (
    <Section id={`cat.table.${id}`} title={title} level={3} titleClassName="cat-sub">
      <PrayerText text={prayer.verse} />
      <Rubric>{prayer.rubric}</Rubric>
      <PrayerText text={prayer.prayer} />
    </Section>
  );
}

function useMemorize() {
  const store = useStore();
  return (id: string) =>
    store.updateProfile(
      (p) => {
        const m = { ...p.catechism.memorized };
        if (m[id]) delete m[id];
        else m[id] = true;
        return { ...p, catechism: { ...p.catechism, memorized: m } };
      },
      { immediate: true },
    );
}

/** One chief part on its own page, piece by piece; ?stueck= jumps to a piece. */
function ChiefPart({ ci }: { ci: number }) {
  const { date } = useSelectedDate();
  const profile = useProfile();
  const [params] = useSearchParams();
  const day = catechismFor(date, profile.catechism.weekOffset);
  const memorized = profile.catechism.memorized;
  const toggleMemorized = useMemorize();
  const chief = CATECHISM[ci]!;
  const target = params.get('stueck');

  // Jump to the piece asked for (after the layout's reset to the top).
  useEffect(() => {
    if (!target) return;
    const t = setTimeout(() => {
      flushSync(() => setOpen(`cat.piece.${target}`, true));
      const el = document.getElementById(`piece-${target}`);
      el?.scrollIntoView?.({ block: 'start' });
      el?.focus({ preventScroll: true });
    }, 0);
    return () => clearTimeout(t);
  }, [target]);

  return (
    <>
      <h2 className="cat-part-title">
        <span className="no">{ci + 1}</span> {chief.title}
        {ci === day.chiefIndex && <span className="ktag">diese Woche</span>}
      </h2>
      <div className="cat-part">
        {chief.pieces.map((piece, pi) => {
          const id = pieceId(chief, pi);
          const today = ci === day.chiefIndex && day.pieceIndices.includes(pi);
          return (
            <article key={id} id={`piece-${id}`} tabIndex={-1} className={`kpiece${today ? ' today' : ''}`}>
              <Section
                id={`cat.piece.${id}`}
                title={
                  <>
                    {piece.title}
                    {today && <span className="ktag">heute</span>}
                  </>
                }
                level={3}
                titleClassName="kpiece-title"
              >
                <PieceText piece={piece} />
                <button type="button" className="pill" aria-pressed={!!memorized[id]} onClick={() => toggleMemorized(id)}>
                  {memorized[id] ? '✓ auswendig' : 'auswendig gelernt'}
                </button>
              </Section>
            </article>
          );
        })}
      </div>
    </>
  );
}

const CREED_IDS = CREEDS.map((c) => `creed.${c.id}`);

/** The three creeds of the early church: one card each, one open at a time. */
function Creeds() {
  return (
    <>
      <p className="book-source">Die drei altkirchlichen Bekenntnisse, wie sie am Anfang des lutherischen Konkordienbuchs stehen.</p>
      {CREEDS.map((c) => (
        <Section key={c.id} id={`creed.${c.id}`} group={CREED_IDS} defaultOpen={false} className="book-card creed-card" title={
          <span className="book-card-text">
            <span className="book-card-title">{c.title}</span>
            <span className="book-card-sub">{c.line}</span>
          </span>
        }>
          {c.text && <PrayerText text={c.text} />}
          <h4>Zur Erklärung</h4>
          {c.explanation.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </Section>
      ))}
    </>
  );
}

/** A book of parts and sections: each section a card, one open at a time. */
function BookParts({ parts, prefix }: { parts: readonly BookPart[]; prefix: string }) {
  const ids = parts.flatMap((p) => p.sections.map((s) => `${prefix}.${s.id}`));
  return (
    <>
      {parts.map((part, i) => (
        <div key={part.heading ?? i}>
          {part.heading && <h3 className="book-circle">{part.heading}</h3>}
          {part.sections.map((s) => (
            <Section key={s.id} id={`${prefix}.${s.id}`} group={ids} defaultOpen={false} className="book-card creed-card" title={
              <span className="book-card-text">
                <span className="book-card-title">{s.title}</span>
                {s.sub && <span className="book-card-sub">{s.sub}</span>}
              </span>
            }>
              {s.paragraphs.map((p, k) => (
                <p key={k}>{p}</p>
              ))}
            </Section>
          ))}
        </div>
      ))}
    </>
  );
}

/** The Augsburg Confession: preface and articles as cards. */
function AugsburgConfession() {
  return (
    <>
      <p className="book-source">
        Übergeben dem Kaiser Karl V. auf dem Reichstag zu Augsburg am 25. Juni 1530. Wortgetreu in der Rechtschreibung der
        Ausgabe.
      </p>
      <BookParts parts={AUGSBURG_CONFESSION} prefix="ca" />
      <p className="small muted">
        Der XXVIII. Artikel „Von der Bischöfe Gewalt“ und der Beschluss folgen.
      </p>
      <p className="small muted">{AUGSBURG_SOURCE}</p>
    </>
  );
}

/** Luther's Large Catechism: prefaces, the five chief parts and their exposition. */
function LargeCatechism() {
  return (
    <>
      <p className="book-source">
        Luthers Auslegung der Hauptstücke für Pfarrherren und Hausväter, 1529. Wortgetreu in der Rechtschreibung der Ausgabe.
      </p>
      <BookParts parts={LARGE_CATECHISM} prefix="gk" />
      <p className="small muted">{LARGE_CATECHISM_SOURCE}</p>
    </>
  );
}

/** The Book of Concord: what it is, and its contents; parts at hand open their page. */
function Concordia() {
  const { date, isToday } = useSelectedDate();
  return (
    <>
      {CONCORDIA_INTRO.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
      {CONCORDIA_CONTENTS.map((g) => (
        <section key={g.heading} className="cat-overview" aria-label={g.heading}>
          <h3 className="book-circle">{g.heading}</h3>
          <ul className="overview-list">
            {g.parts.map((p) => (
              <li key={p.title} className={`overview-row${p.to ? '' : ' pending'}`}>
                {p.to ? (
                  <Link className="overview-link" to={withDate(p.to, date, isToday)}>
                    <span className="overview-title">{p.title}</span>
                    <span className="overview-count">{p.line}</span>
                  </Link>
                ) : (
                  <span className="overview-link">
                    <span className="overview-title">{p.title}</span>
                    <span className="overview-count">{p.line} · folgt</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="small muted">{CONCORDIA_NOTE}</p>
    </>
  );
}

function Appendix({ slug }: { slug: (typeof APPENDICES)[number]['slug'] }) {
  const title = APPENDICES.find((a) => a.slug === slug)!.title;
  return (
    <>
      <h2 className="cat-part-title">{title}</h2>
      <div className={slug === 'kirchenjahr' ? undefined : slug === 'bekenntnisse' || slug === 'augsburgische-konfession' || slug === 'grosser-katechismus' || slug === 'konkordienbuch' ? 'dieffenbach-book' : 'cat-part'}>
        {slug === 'kirchenjahr' && <DieffenbachBook />}
        {slug === 'konkordienbuch' && <Concordia />}
        {slug === 'augsburgische-konfession' && <AugsburgConfession />}
        {slug === 'grosser-katechismus' && <LargeCatechism />}
        {slug === 'bekenntnisse' && <Creeds />}
        {slug === 'tischgebete' && (
          <>
            <TablePrayer id="before" title="Vor dem Essen" prayer={TABLE_PRAYER_BEFORE} />
            <TablePrayer id="after" title="Nach dem Essen" prayer={TABLE_PRAYER_AFTER} />
          </>
        )}
        {slug === 'haustafel' && (
          <>
            <Rubric>{TABLE_OF_DUTIES_SUBTITLE}</Rubric>
            <ul className="duties">
              {TABLE_OF_DUTIES.map((d) => (
                <li key={d.title}>
                  <span>{d.title}</span>
                  <span className="small">
                    {d.refs.map((r, i) => (
                      <span key={r}>
                        {i > 0 && ' · '}
                        <BibleRef reference={r} />
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        {slug === 'privatbeichte' && (
          <>
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
            <Section id="cat.confession.request" title="Bitte" level={3} titleClassName="cat-sub">
              <PrayerText text={PRIVATE_CONFESSION.request} />
            </Section>
            <Section id="cat.confession.confession" title="Bekenntnis" level={3} titleClassName="cat-sub">
              <PrayerText text={PRIVATE_CONFESSION.confession} />
              <Rubric>{PRIVATE_CONFESSION.confessionRubric}</Rubric>
              <PrayerText text={PRIVATE_CONFESSION.confessionEnd} />
            </Section>
            {/* The absolution never folds away (rule 1). */}
            <h3 className="cat-sub">Zuspruch des Beichtvaters</h3>
            <PrayerText text={PRIVATE_CONFESSION.absolution} className="absolution" />
            <p className="small">{PRIVATE_CONFESSION.after}</p>
          </>
        )}
      </div>
    </>
  );
}

/** Katechismus: this week in gold, the chief parts as tiles; a tile opens its part (/katechismus/:teil). */
export function CatechismPage() {
  const { teil } = useParams();
  const { date, isToday } = useSelectedDate();
  const ci = CATECHISM.findIndex((c) => c.id === teil);
  const appendix = APPENDICES.find((a) => a.slug === teil);
  if (ci >= 0 || appendix) {
    return (
      <div className="cat-page">
        <p className="back-link">
          {appendix && 'book' in appendix ? (
            <Link to={withDate('/katechismus/konkordienbuch', date, isToday)}>‹ Konkordienbuch</Link>
          ) : (
            <Link to={withDate('/katechismus', date, isToday)}>‹ Lehre</Link>
          )}
        </p>
        {ci >= 0 ? <ChiefPart ci={ci} /> : <Appendix slug={appendix!.slug} />}
      </div>
    );
  }
  return <CatechismHome />;
}

function CatechismHome() {
  const { date, isToday } = useSelectedDate();
  const store = useStore();
  const profile = useProfile();
  const lookup = useDayLookup();
  const selectId = useId();
  const day = catechismFor(date, profile.catechism.weekOffset);
  const memorized = profile.catechism.memorized;
  const [houseFather, setHouseFather] = useState(false);

  const habit = profile.habits.find((h) => h.id === CATECHISM_WITH_CHILDREN_HABIT);
  const withChildren = habit ? isDoneInPeriod(habit, date, lookup) : false;
  const todayPiece = pieceId(day.chief, day.pieceIndices[0] ?? 0);
  const partLink = withDate(`/katechismus/${day.chief.id}`, date, isToday);

  const chooseChief = (i: number) =>
    store.updateProfile(
      (p) => ({
        ...p,
        catechism: { ...p.catechism, weekOffset: offsetForChiefPart(date, i) },
      }),
      { immediate: true },
    );

  return (
    <>
      <h2>Der Kleine Katechismus</h2>
      <Rubric>{CATECHISM_SUBTITLE}</Rubric>

      {/* This week's chief part: what is learned today, and the table. */}
      <section className="block block-hero cat-week" aria-labelledby="cat-week-title">
        <p className="cat-week-kicker">Diese Woche</p>
        <h3 id="cat-week-title" className="cat-week-title">
          <Link to={partLink}>
            <span className="no">{day.chiefIndex + 1}</span> {day.chief.title}
          </Link>
        </h3>
        <p className="cat-today">
          Heute:{' '}
          <Link to={`${partLink}${partLink.includes('?') ? '&' : '?'}stueck=${todayPiece}`}>{day.label}</Link>
        </p>
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
              onClick={() => store.toggleHabit(date, habit)}
            >
              {withChildren ? '✓ Diese Woche mit den Kindern gelernt' : 'Mit den Kindern gelernt'}
            </button>
          )}
        </div>
        <div className="field cat-choose">
          <label htmlFor={selectId}>Anderes Hauptstück für diese Woche</label>
          <select id={selectId} value={day.chiefIndex} onChange={(e) => chooseChief(Number(e.target.value))}>
            {CATECHISM.map((c, i) => (
              <option key={c.id} value={i}>
                {i + 1}. {c.title}
              </option>
            ))}
          </select>
        </div>
      </section>

      <CatechismOverview memorized={memorized} currentChief={day.chiefIndex} />

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
