import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { SEASON_INFO, SUNDAY_INFO, trinityGroupOf } from '../../content/churchYearGuide';
import { DAY_GUIDE } from '../../content/dieffenbach';
import { EPISTLE_LECTIONS, FEAST_EPISTLE_LECTIONS, LECTIONS, type Lection } from '../../content/lections';
import { READING_SUMMARIES } from '../../content/readingSummaries';
import { WEEKLY_VERSES } from '../../content/weeklyVerses';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { churchDay, CIRCLE_LABEL, CIRCLES, nextWeekStart, previousWeekStart, SEASON_LABEL } from '../../domain/churchYear';
import { addDays, formatLong, formatShort, type DateKey } from '../../domain/dates';
import { composeVerse } from '../../domain/weeklyVerse';
import { BibleRef } from '../../ui/BibleRef';
import { LectionDialog } from './LectionDialog';
import { SundayChooser } from './SundayOverview';

const SUNDAY_PARAM = 's';

/** The fixed feasts with their own Epistle lesson that fall between `from` and the day before `until`. */
function feastsInWeek(from: DateKey, until: DateKey) {
  const found: { date: DateKey; feast: (typeof FEAST_EPISTLE_LECTIONS)[number] }[] = [];
  for (let d = from; d < until; d = addDays(d, 1)) {
    const feast = FEAST_EPISTLE_LECTIONS.find((f) => d.slice(5) === f.monthDay);
    if (feast) found.push({ date: d, feast });
  }
  return found;
}

/** Gospel or Epistle; where a book has a reading on it, the tile opens that reading. */
function ReadingTile({
  track,
  reference,
  summary,
  lection,
  onOpen,
}: {
  track: string;
  reference: string;
  summary?: string;
  lection?: Lection;
  onOpen: (l: Lection) => void;
}) {
  if (!lection) {
    return (
      <div className="sunday-reading">
        <span className="track">{track}</span>
        <BibleRef reference={reference} />
        {summary && <p className="sunday-summary">{summary}</p>}
      </div>
    );
  }
  return (
    <button type="button" className="sunday-reading sunday-reading-open" aria-haspopup="dialog" onClick={() => onOpen(lection)}>
      <span className="track">{track}</span>
      <BibleRef reference={reference} />
      {summary && <span className="sunday-summary">{summary}</span>}
      <span className="sunday-lection-hint">{lection.hint}</span>
    </button>
  );
}

/**
 * Which Sunday the tab shows (?s=, otherwise the one of the current week), and
 * links within the tab that keep the selected day (?d=).
 */
export function useSundayLinks() {
  const { search } = useLocation();
  const { date } = useSelectedDate();
  const current = churchDay(date).weekStart;
  const raw = new URLSearchParams(search).get(SUNDAY_PARAM);
  // Any date names its week; the page always shows the week's first day.
  const shown = raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? churchDay(raw).weekStart : current;
  const to = (path: string, sunday?: DateKey) => {
    const p = new URLSearchParams(search);
    if (sunday && sunday !== current) p.set(SUNDAY_PARAM, sunday);
    else p.delete(SUNDAY_PARAM);
    const q = p.toString();
    return q ? `${path}?${q}` : path;
  };
  return {
    current,
    shown,
    sunday: (d?: DateKey) => to('/sonntag', d),
  };
}

export function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={dir === 'left' ? 'm14.5 6-6 6 6 6' : 'm9.5 6 6 6-6 6'} />
    </svg>
  );
}

/**
 * The week comes from its Sunday: the Sunday with its verse, its meaning, its
 * place in the church year, and Gospel and Epistle – as references to read in
 * the Bible on paper (rule 13), each with a short summary in our own words.
 * The Sundays before and after are one tap away; the name opens a card with all.
 */
export function SundayPage() {
  const { date, isToday } = useSelectedDate();
  const links = useSundayLinks();
  const navigate = useNavigate();
  const [choosing, setChoosing] = useState(false);
  const [reading, setReading] = useState<Lection | null>(null);
  const s = links.shown;
  const c = churchDay(s);
  const prev = previousWeekStart(s);
  const next = nextWeekStart(s);
  const info = SUNDAY_INFO[c.weekKey];
  const verse = WEEKLY_VERSES[c.weekKey];
  const group = trinityGroupOf(c.weekKey);
  const summary = READING_SUMMARIES[c.weekKey];
  const feasts = feastsInWeek(s, next);
  const toChurchYear = (circle: string) =>
    withDate('/kirchenjahr', date, isToday) + (isToday ? '?' : '&') + `kreis=${circle}&woche=${c.weekKey}`;

  return (
    <div className="sunday-page">
      <header className="sunday-head">
        <Link className="sunday-step" to={links.sunday(prev)} aria-label={`Letzter Sonntag: ${churchDay(prev).week}`}>
          <span className="sunday-step-circle">
            <Chevron dir="left" />
          </span>
          <span className="sunday-step-label" aria-hidden="true">
            Letzter Sonntag
          </span>
        </Link>
        <div className="sunday-center">
          <p className="sunday-kicker">
            {formatLong(s)} {s.slice(0, 4)}
          </p>
          {group && (
            <p className="sunday-group">
              {group.title} <span className="muted">({group.range})</span>
            </p>
          )}
          <h2 className="sunday-name">
            <button type="button" onClick={() => setChoosing(true)} aria-haspopup="dialog" aria-label={`${c.week} – alle Sonntage`}>
              {c.week}
            </button>
          </h2>
          <p className="sunday-week">
            {c.weekNumber}. Woche im Kirchenjahr
            {s === links.current ? (
              <span className="ktag">diese Woche</span>
            ) : (
              <Link className="sunday-back" to={links.sunday()}>
                Zu dieser Woche
              </Link>
            )}
          </p>
        </div>
        <Link className="sunday-step" to={links.sunday(next)} aria-label={`Nächster Sonntag: ${churchDay(next).week}`}>
          <span className="sunday-step-circle">
            <Chevron dir="right" />
          </span>
          <span className="sunday-step-label" aria-hidden="true">
            Nächster Sonntag
          </span>
        </Link>
      </header>

      {verse && (
        <figure className="sunday-verse">
          <figcaption>Wochenspruch</figcaption>
          <blockquote>{composeVerse(verse)}</blockquote>
          <p className="cy-verse-ref">
            <BibleRef reference={verse.ref} />
          </p>
        </figure>
      )}

      {info && (
        <section className="block block-plain" aria-labelledby="sunday-meaning">
          <h3 id="sunday-meaning">Bedeutung</h3>
          {info.meaning && <p className="cy-meaning">{info.meaning}</p>}
          <p className="sunday-theme">{info.theme}</p>
          {DAY_GUIDE[c.weekKey] && (
            <>
              <p className="cy-hausagende">{DAY_GUIDE[c.weekKey]}</p>
              <p className="small muted">Dieffenbach, Evangelische Haus-Agende, 1853</p>
            </>
          )}
        </section>
      )}

      {info && (
        <section className="block block-hero" aria-labelledby="sunday-readings">
          <h3 id="sunday-readings">Evangelium und Epistel</h3>
          <div className="sunday-readings">
            <ReadingTile track="Evangelium" reference={info.gospel} summary={summary?.gospel} lection={LECTIONS[c.weekKey]} onOpen={setReading} />
            <ReadingTile track="Epistel" reference={info.epistle} summary={summary?.epistle} lection={EPISTLE_LECTIONS[c.weekKey]} onOpen={setReading} />
            {feasts.map(({ date: d, feast }) => (
              <ReadingTile
                key={d}
                track={`Epistel am ${feast.name}, ${formatShort(d)}`}
                reference={feast.epistle}
                summary={feast.summary}
                lection={feast.lection}
                onOpen={setReading}
              />
            ))}
          </div>
        </section>
      )}

      {reading && <LectionDialog lection={reading} onClose={() => setReading(null)} />}

      {choosing && (
        <SundayChooser
          shown={s}
          current={links.current}
          onClose={() => setChoosing(false)}
          onChoose={(d) => {
            setChoosing(false);
            navigate(links.sunday(d));
          }}
        />
      )}

      <section className="block block-warm" aria-labelledby="sunday-place">
        <h3 id="sunday-place">Im Kirchenjahr</h3>
        <ol className="cy-circles" aria-label="Festkreise des Kirchenjahres">
          {CIRCLES.map((circle) => (
            <li
              key={circle}
              className={circle === c.circle ? 'current' : undefined}
              aria-current={circle === c.circle ? 'true' : undefined}
            >
              <Link to={toChurchYear(circle)}>
                <span className="cy-circle-name">{CIRCLE_LABEL[circle]}</span>
                {circle === c.circle && <span className="cy-season">{SEASON_LABEL[c.season]}</span>}
              </Link>
            </li>
          ))}
        </ol>
        <p>{SEASON_INFO[c.season]}</p>
      </section>
    </div>
  );
}
