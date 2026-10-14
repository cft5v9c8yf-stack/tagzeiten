import { CIRCLE_INFO, SEASON_THEME, TRINITY_GROUPS, trinityGroupOf } from '../../content/churchYearGuide';
import {
  CHURCH_YEAR_INTRO,
  CHURCH_YEAR_INTRO_GLORIA,
  CHURCH_YEAR_INTRO_TITLE,
} from '../../content/churchYearIntro';
import { BOOK_ORDER, bookDayText, CIRCLE_GUIDE, DIEFFENBACH_SOURCE, GROUP_REFS, SEASON_GUIDE, type BookDay } from '../../content/dieffenbach';
import { CIRCLES, SEASON_CIRCLE, SEASON_LABEL, type Circle, type Season } from '../../domain/churchYear';
import { BibleRef } from '../../ui/BibleRef';
import type { ReactNode } from 'react';
import { FlowIcon } from '../../ui/FlowIcon';
import { Section } from '../../ui/Section';

/** The heading of a card: a mark (numeral or icon), the title, and a quiet line under it. */
/** The cards of the book: one open at a time. */
const BOOK_CARDS = ['book.intro', ...CIRCLES.map((c) => `book.${c}`)];

/** Title of a card, with one or more quiet lines beneath (each on its own line). */
function CardTitle({ mark, title, sub }: { mark: ReactNode; title: string; sub: readonly string[] }) {
  return (
    <>
      <span className="book-card-mark" aria-hidden="true">
        {mark}
      </span>
      <span className="book-card-text">
        <span className="book-card-title">{title}</span>
        {sub.map((line) => (
          <span key={line} className="book-card-sub">
            {line}
          </span>
        ))}
      </span>
    </>
  );
}

const SEASONS = Object.keys(SEASON_CIRCLE) as Season[];
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

function Days({ season, days }: { season: Season; days: readonly BookDay[] }) {
  return (
    <dl className="book-days">
      {days.map((d, i) => (
        <div key={d.label}>
          <dt>
            {i + 1}. {d.label}
          </dt>
          <dd>{bookDayText(season, d)}</dd>
        </div>
      ))}
    </dl>
  );
}

function SeasonText({ season, n }: { season: Season; n: number }) {
  const guide = SEASON_GUIDE[season];
  const days = BOOK_ORDER[season];
  return (
    <section className="book-season" aria-labelledby={`book-${season}`}>
      <h4 id={`book-${season}`}>
        {['I', 'II', 'III'][n]}. Die {SEASON_LABEL[season]}
      </h4>
      <p className="cy-season-theme">{SEASON_THEME[season]}</p>
      {guide?.intro && <p>{guide.intro}</p>}
      {season === 'trinity' ? (
        TRINITY_GROUPS.map((g, gi) => (
          <section key={g.title} className="book-group" aria-labelledby={`book-group-${gi}`}>
            <h5 id={`book-group-${gi}`}>
              {LETTERS[gi]}. Die {g.title}
            </h5>
            <p className="cy-group-refs">
              {g.range}
              {(GROUP_REFS[g.title] ?? []).map((r) => (
                <BibleRef key={r} reference={r} />
              ))}
            </p>
            <Days season={season} days={days.filter((d) => trinityGroupOf(d.key ?? '')?.title === g.title)} />
          </section>
        ))
      ) : (
        <Days season={season} days={days} />
      )}
      {guide?.note && (
        <p className="cy-note">
          <span className="cy-note-label">Anmerkung.</span>{' '}
          {guide.note}
        </p>
      )}
    </section>
  );
}

function CircleText({ circle, n }: { circle: Circle; n: number }) {
  const guide = CIRCLE_GUIDE[circle];
  const info = CIRCLE_INFO[circle];
  const seasons = SEASONS.filter((s) => SEASON_CIRCLE[s] === circle);
  return (
    <Section
      id={`book.${circle}`}
      title={<CardTitle mark={['I', 'II', 'III'][n]} title={`Der heilige ${info.title}`} sub={[info.of, info.range]} />}
      defaultOpen={false}
      group={BOOK_CARDS}
      className="book-card"
    >
      {guide.motto && (
        <blockquote className="cy-motto">
          <p>{guide.motto.text}</p>
          <footer>
            <BibleRef reference={guide.motto.ref} />
          </footer>
        </blockquote>
      )}
      <h4>Zur Erklärung</h4>
      {guide.explanation.map((p) => (
        <p key={p.slice(0, 48)}>{p}</p>
      ))}
      <p className="book-lead">Die einzelnen Sonn- und Festtage entfalten diesen Kreis in folgender Weise:</p>
      {seasons.map((s, i) => (
        <SeasonText key={s} season={s} n={i} />
      ))}
      <div className="cy-closing">
        {guide.closing.map((p, i) => (
          <p key={p.slice(0, 48)} className={i === guide.closing.length - 1 ? 'cy-intro-gloria' : undefined}>
            {p}
          </p>
        ))}
      </div>
    </Section>
  );
}

/**
 * The whole description of the church year from Dieffenbach's Haus-Agende
 * (1853), to be read straight through: introduction, then each circle with its
 * explanation and every Sunday and feast in the order of the book.
 */
export function DieffenbachBook() {
  return (
    <div className="dieffenbach-book">
      <p className="book-source">{DIEFFENBACH_SOURCE} In der Rechtschreibung des Originals.</p>
      <Section
        id="book.intro"
        title={
          <CardTitle
            mark={<FlowIcon name="scroll" size={18} />}
            title="Einleitung"
            sub={[CHURCH_YEAR_INTRO_TITLE]}
          />
        }
        defaultOpen={false}
        group={BOOK_CARDS}
        className="book-card"
      >
        {CHURCH_YEAR_INTRO.map((part) => (
          <section key={part.heading} className="cy-intro-part">
            <h4>{part.heading}</h4>
            {part.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </section>
        ))}
        <p className="cy-intro-gloria">{CHURCH_YEAR_INTRO_GLORIA}</p>
      </Section>
      {CIRCLES.map((c, i) => (
        <CircleText key={c} circle={c} n={i} />
      ))}
    </div>
  );
}
