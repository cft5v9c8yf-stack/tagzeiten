import { useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useToast } from '../../app/Toast';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { useStore } from '../../data/hooks';
import { formatShort } from '../../domain/dates';
import {
  blocks,
  dayPath,
  FONT_STEPS,
  isRead,
  neighbours,
  notesIn,
  pieces,
  readInThirtyDays,
  setNote,
  setRead,
  sourceLine,
  todaysDay,
  weekOfPlan,
  type DogmatikBook,
  type DogmatikDay,
} from '../../domain/dogmatik';
import { BackLink } from '../../ui/BackLink';
import { LOOKUP_PATH } from './DogmatikCard';
import { useDogmatikSettings } from './useDogmatik';

/** Where the reading was opened from, for the way back (?von=). */
const FROM: Record<string, { to: string; label: string }> = {
  'stille-zeit': { to: '/andacht/morgen', label: 'Stille Zeit' },
  vesper: { to: '/andacht/abend', label: 'Vesper' },
  nachschlagen: { to: LOOKUP_PATH, label: 'Nachschlagen' },
};

/** Marks what is not the book's text: Bible word, translation, core sentence, question. */
export const Addition = () => <span className="dogmatik-addition">Ergänzung</span>;

/** A paragraph or quotation with tappable footnote numbers; the notes opened stand beneath it. */
function Annotated({
  text,
  notes,
  open,
  toggle,
  as = 'p',
  lang,
}: {
  text: string;
  notes: Record<string, string>;
  open: ReadonlySet<string>;
  toggle: (n: string) => void;
  as?: 'p' | 'span';
  lang?: string;
}) {
  const Tag = as;
  const shown = notesIn(text).filter((n) => open.has(n) && notes[n]);
  return (
    <>
      <Tag lang={lang}>
        {pieces(text).map((p, i) =>
          'note' in p ? (
            <button
              key={i}
              type="button"
              className="fn-mark"
              aria-expanded={open.has(p.note)}
              aria-label={`Fußnote ${p.note}`}
              onClick={() => toggle(p.note)}
            >
              {p.note}
            </button>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
      </Tag>
      {shown.length > 0 && (
        <div className="fn-notes">
          {shown.map((n) => (
            <p key={n} className="fn-note">
              <span className="fn-no">{n}</span> {notes[n]}
            </p>
          ))}
        </div>
      )}
    </>
  );
}

function Quote({ day, index, open, toggle }: { day: DogmatikDay; index: number; open: ReadonlySet<string>; toggle: (n: string) => void }) {
  const q = day.zitate[index]!;
  const [shown, setShown] = useState(false);
  return (
    <blockquote className="dogmatik-quote">
      <Annotated text={q.lat} notes={day.fussnoten} open={open} toggle={toggle} lang="la" />
      {q.de && (
        <>
          <button type="button" className="btn quiet dogmatik-translate" aria-expanded={shown} onClick={() => setShown(!shown)}>
            {shown ? 'Übersetzung verbergen' : 'Übersetzung zeigen'}
          </button>
          {shown && (
            <p className="dogmatik-translation">
              {q.de} <Addition />
            </p>
          )}
        </>
      )}
    </blockquote>
  );
}

function Question({ day }: { day: DogmatikDay }) {
  const store = useStore();
  const toast = useToast();
  const [s, update] = useDogmatikSettings();
  const note = s.notes[String(day.tag)] ?? '';
  const toJournal = () => {
    const id = store.addArenaEntry();
    store.updateArenaEntry(
      id,
      (e) => ({
        ...e,
        title: `Dogmatik, Tag ${day.tag}: ${day.titel}`,
        verses: day.bibelwort ? [day.bibelwort.stelle] : e.verses,
        text: `${day.frage}\n\n${note.trim()}`,
      }),
      { immediate: true },
    );
    toast('In der Gebetskammer gesichert');
  };
  return (
    <section className="dogmatik-box" aria-labelledby="dogmatik-question">
      <h3 id="dogmatik-question">
        Zum Nachdenken <Addition />
      </h3>
      <p className="dogmatik-box-text">{day.frage}</p>
      <label className="visually-hidden" htmlFor="dogmatik-note">
        Deine Gedanken zur Frage
      </label>
      <textarea
        id="dogmatik-note"
        rows={3}
        placeholder="Deine Gedanken, wenn du magst"
        value={note}
        onChange={(e) => update((x) => setNote(x, day.tag, e.target.value), {})}
      />
      <button type="button" className="btn" disabled={!note.trim()} onClick={toJournal}>
        In die Gebetskammer schreiben
      </button>
    </section>
  );
}

/** One day of the plan: Bible word, the text with its notes, core sentence, question, and "gelesen". */
export function DogmatikDayPage({ book, day }: { book: DogmatikBook; day: DogmatikDay }) {
  const { date, isToday } = useSelectedDate();
  const [params] = useSearchParams();
  const [s, update] = useDogmatikSettings();
  // Opened afresh with each day; "Fußnoten sofort zeigen" opens them all.
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set(s.footnotesOpen ? Object.keys(day.fussnoten) : []));
  const toggle = (n: string) =>
    setOpen((o) => {
      const next = new Set(o);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  const from = FROM[params.get('von') ?? ''];
  const back = from ?? { to: '/katechismus', label: 'Lehre' };
  const keep = (path: string) => {
    const url = withDate(path, date, isToday);
    return from ? `${url}${url.includes('?') ? '&' : '?'}von=${params.get('von')}` : url;
  };
  const read = isRead(s, day.tag);
  const today = todaysDay(book, s, date);
  const { prev, next } = neighbours(book, s, day.tag);
  const font = (step: number) => update((x) => ({ ...x, fontStep: Math.min(FONT_STEPS.max, Math.max(FONT_STEPS.min, x.fontStep + step)) }));

  let ahead: ReactNode = null;
  if (s.on && today && today.tag !== day.tag && !read) {
    ahead = (
      <p className="small muted dogmatik-ahead">
        Vorab gelesen. Dein Plan steht bei <Link to={keep(dayPath(today.tag))}>Tag {today.tag}</Link>.
      </p>
    );
  }

  return (
    <article className="dogmatik-day" style={{ ['--dogmatik-size' as string]: `${1.08 + s.fontStep * 0.08}rem` }}>
      <div className="title-row">
        <p className="back-link">
          <BackLink to={withDate(back.to, date, isToday)}>{back.label}</BackLink>
        </p>
        <h2 className="dogmatik-title">{day.titel}</h2>
      </div>
      <p className="dogmatik-meta">
        <span>Tag {day.tag}</span>
        <span>{day.minuten} Min.</span>
        <span>{sourceLine(book, day)}</span>
        <span>{day.abschnitt ?? day.kapitel ?? day.teil}</span>
      </p>
      {ahead}

      {s.showVerse && day.bibelwort && (
        <blockquote className="dogmatik-verse">
          <p>{day.bibelwort.text}</p>
          <footer>
            {day.bibelwort.stelle} <Addition />
          </footer>
        </blockquote>
      )}

      <div className="dogmatik-font" role="group" aria-label="Schriftgröße">
        <button type="button" className="btn quiet" disabled={s.fontStep <= FONT_STEPS.min} onClick={() => font(-1)} aria-label="Schrift kleiner">
          A−
        </button>
        <button type="button" className="btn quiet" disabled={s.fontStep >= FONT_STEPS.max} onClick={() => font(1)} aria-label="Schrift größer">
          A+
        </button>
      </div>

      <div className="dogmatik-text">
        {blocks(day).map((b) =>
          b.kind === 'p' ? (
            <Annotated key={`p${b.no}`} text={b.text} notes={day.fussnoten} open={open} toggle={toggle} />
          ) : (
            <Quote key={`q${b.no}`} day={day} index={b.no - 1} open={open} toggle={toggle} />
          ),
        )}
      </div>

      {s.showCore && day.kernsatz && (
        <section className="dogmatik-box dogmatik-core" aria-labelledby="dogmatik-core">
          <h3 id="dogmatik-core">
            Kernsatz des Tages <Addition />
          </h3>
          <p className="dogmatik-box-text">{day.kernsatz}</p>
        </section>
      )}
      {s.showCore && day.frage && <Question day={day} />}

      <div className="dogmatik-done">
        {read ? (
          <>
            <p className="dogmatik-done-line">
              <span className="dogmatik-done-mark">✓ Gelesen am {formatShort(s.read[String(day.tag)]!)}</span>
            </p>
            <p className="small muted">
              Woche {weekOfPlan(day.tag)} des Plans · {readInThirtyDays(s, date)} Abschnitte in den letzten 30 Tagen
            </p>
            <button type="button" className="btn quiet" onClick={() => update((x) => setRead(x, day.tag, null))}>
              Nicht gelesen
            </button>
          </>
        ) : (
          <button type="button" className="btn primary" onClick={() => update((x) => setRead(x, day.tag, date))}>
            Gelesen
          </button>
        )}
      </div>

      <nav className="dogmatik-pager" aria-label="Andere Tage">
        {prev ? (
          <Link className="btn" to={keep(dayPath(prev.tag))} aria-label={`Zurück zu Tag ${prev.tag}: ${prev.titel}`}>
            ‹ Tag {prev.tag}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link className="btn" to={keep(dayPath(next.tag))} aria-label={`Weiter zu Tag ${next.tag}: ${next.titel}`}>
            Tag {next.tag} ›
          </Link>
        )}
      </nav>
    </article>
  );
}
