import { Link, useParams } from 'react-router';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { CATECHISM, WEEKDAY_PIECES, type ChiefPart } from '../../content/catechism';
import {
  LOEHE_HOME,
  LOEHE_PLACES,
  LOEHE_SOURCE,
  isQuestion,
  loeheBetween,
  loeheForChiefPart,
  type LoeheLesson,
  type LoeheQuestion,
} from '../../content/loeheCatechism';
import { useProfile } from '../../data/hooks';
import { mondayIndex } from '../../domain/dates';
import { catechismFor } from '../../domain/catechismDay';
import { Section } from '../../ui/Section';

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((l, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {l}
        </span>
      ))}
    </>
  );
}

/** Löhe's "Anm.", footnotes and quoted passages, shown small after the answer. */
function Notes({ q }: { q: LoeheQuestion }) {
  const notes = [...(q.quote ? [q.quote] : []), ...(q.note ? [q.note] : []), ...(q.footnotes ?? []).map((f, i) => `${'*'.repeat(i + 1)}) ${f}`)];
  return (
    <>
      {notes.map((n) => (
        <p key={n.slice(0, 30)} className="li-note">
          {n}
        </p>
      ))}
    </>
  );
}

/**
 * Löhe's questions on one place of the catechism under its title: number in
 * the margin, question, answer, his notes small after it. Nothing to tap.
 */
function LoeheBlock({ title, lessons, showTitle = true }: { title: string; lessons: readonly LoeheLesson[]; showTitle?: boolean }) {
  const marks = lessons.flatMap((l) => l.items.filter((i) => !isQuestion(i))).length;
  if (!lessons.some((l) => l.items.some(isQuestion))) return null;
  return (
    <section className="li" aria-label={title}>
      {showTitle && <h4 className="li-label">{title}</h4>}
      {lessons.map((l, li) => (
        <div key={li}>
          {l.items.map((item, i) =>
            isQuestion(item) ? (
              <div key={item.no} className="li-qa">
                <p className="li-q">
                  <span className="li-no">{item.no}</span>
                  {item.q}
                </p>
                <p className="li-a">
                  <Lines text={item.a} />
                </p>
                <Notes q={item} />
              </div>
            ) : marks > 1 ? (
              <p key={`m${i}`} className="li-mark">
                Zum {item.mark} Gebot
              </p>
            ) : null,
          )}
        </div>
      ))}
    </section>
  );
}

type Range = readonly [number, number];
const headingOf = (r?: Range) => (r ? loeheBetween(r).find((l) => l.heading)?.heading : undefined);
const questionsIn = (r: Range) => loeheBetween(r).flatMap((l) => l.items.filter(isQuestion));
const span = (qs: readonly LoeheQuestion[]) => `Fragen ${qs[0]!.no}–${qs.at(-1)!.no}`;
const HOME = 'ganzer-katechismus';
const BOOK_TITLE = 'Fragen und Antworten zum Katechismus';

/** The places of a chief part in Löhe's book: introduction, each piece, transition. */
function placesOf(chief: ChiefPart): { key: string; title: string; range: Range; piece?: number }[] {
  const p = LOEHE_PLACES[chief.id];
  return [
    ...(p.intro
      ? [{ key: 'intro', title: chief.id === 'lordsPrayer' ? 'Einleitende Fragen' : (headingOf(p.intro) ?? 'Einleitende Fragen'), range: p.intro }]
      : []),
    ...chief.pieces.map((piece, pi) => ({ key: `${pi}`, title: piece.title, range: p.pieces[pi]!, piece: pi })),
    ...(p.outro ? [{ key: 'outro', title: headingOf(p.outro) ?? 'Zum Übergang', range: p.outro }] : []),
  ];
}

/**
 * Appendix "Fragen und Antworten zum Katechismus" (/katechismus/loehe): the
 * chief parts as tiles, as on the overview of the teaching. A tile opens the
 * chief part (/katechismus/loehe/:hauptstueck) with a card for each piece,
 * one open at a time; inside, Löhe's questions on that piece.
 */
export function LoeheBook() {
  const { hauptstueck } = useParams();
  const { date, isToday } = useSelectedDate();
  const profile = useProfile();
  const week = catechismFor(date, profile.catechism.weekOffset);
  const to = (path: string) => withDate(path, date, isToday);
  const ci = CATECHISM.findIndex((c) => c.id === hauptstueck);

  if (hauptstueck === HOME) {
    const home = loeheBetween(LOEHE_HOME);
    return (
      <>
        <p className="back-link">
          <Link to={to('/katechismus/loehe')}>‹ {BOOK_TITLE}</Link>
        </p>
        <h2 className="cat-part-title">Zum ganzen Katechismus</h2>
        <p className="book-source">Wilhelm Löhe · {span(questionsIn(LOEHE_HOME))}</p>
        <div className="dieffenbach-book">
          <LoeheBlock title={home[0]?.heading ?? 'Einleitende Fragen'} lessons={home} />
        </div>
      </>
    );
  }

  if (ci >= 0) {
    const chief = CATECHISM[ci]!;
    const places = placesOf(chief);
    const ids = places.map((pl) => `loehe.${chief.id}.${pl.key}`);
    const todays = ci === week.chiefIndex ? (WEEKDAY_PIECES[chief.id][mondayIndex(date)] ?? []) : [];
    return (
      <>
        <p className="back-link">
          <Link to={to('/katechismus/loehe')}>‹ {BOOK_TITLE}</Link>
        </p>
        <h2 className="cat-part-title">
          <span className="no">{ci + 1}</span> {chief.title}
          {ci === week.chiefIndex && <span className="ktag">diese Woche</span>}
        </h2>
        <p className="book-source">Wilhelm Löhe · {span(loeheForChiefPart(chief.id))}</p>
        <div className="dieffenbach-book">
          {places.map((pl, i) => {
            const today = pl.piece !== undefined && todays.includes(pl.piece);
            return (
              <Section
                key={pl.key}
                id={ids[i]!}
                group={ids}
                defaultOpen={today && pl.piece === todays[0]}
                className="book-card"
                title={
                  <span className="book-card-text">
                    <span className="book-card-title">{pl.title}</span>
                    <span className="book-card-sub">
                      {span(questionsIn(pl.range))}
                      {today && ' · heute'}
                    </span>
                  </span>
                }
              >
                <LoeheBlock title={pl.title} lessons={loeheBetween(pl.range)} showTitle={false} />
              </Section>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <>
      <p className="back-link">
        <Link to={to('/katechismus')}>‹ Lehre</Link>
      </p>
      <h2 className="cat-part-title">{BOOK_TITLE}</h2>
      <p className="book-source">
        Wilhelm Löhe, lutherischer Pfarrer in Neuendettelsau, hat zu jedem Stück des Kleinen Katechismus Fragen und
        Antworten geschrieben, damit Kinder verstehen, was sie auswendig lernen. Wortgetreu in der Rechtschreibung der
        Ausgabe. Am Tisch stehen die Fragen des Tages neben dem Stück: „Am Tisch abfragen“ auf der Übersicht.
      </p>
      <ul className="overview-list loehe-tiles">
        <li className="overview-row wide">
          <Link className="overview-link" to={to(`/katechismus/loehe/${HOME}`)}>
            <span className="overview-title">Zum ganzen Katechismus</span>
            <span className="overview-count">{span(questionsIn(LOEHE_HOME))}</span>
          </Link>
        </li>
        {CATECHISM.map((chief, i) => (
          <li key={chief.id} className={`overview-row${i === week.chiefIndex ? ' current' : ''}`}>
            <Link className="overview-link" to={to(`/katechismus/loehe/${chief.id}`)}>
              <span className="overview-no">{i + 1}</span>
              <span className="overview-title">{chief.title}</span>
              {i === week.chiefIndex && <span className="ktag">diese Woche</span>}
              <span className="overview-count">{span(loeheForChiefPart(chief.id))}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="book-source loehe-source">{LOEHE_SOURCE}</p>
    </>
  );
}
