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
  keyOf,
  neighbours,
  notesIn,
  pieces,
  readInThirtyDays,
  setNote,
  setRead,
  sourceLine,
  todaysPortion,
  weekOfPlan,
  type DogmatikDay,
  type DogmatikLibrary,
} from '../../domain/dogmatik';
import { BackLink } from '../../ui/BackLink';
import { LOOKUP_PATH, whereLine } from './DogmatikCard';
import { useDogmatikSettings } from './useDogmatik';
import { Chevron } from '../../ui/Chevron';
import { ICON_SIZE } from '../../ui/iconBase';

/** Where the reading was opened from, for the way back (?von=). */
const FROM: Record<string, { to: string; label: string }> = {
  'stille-zeit': { to: '/andacht/morgen', label: 'Stille Zeit' },
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
  lang,
}: {
  text: string;
  notes: Record<string, string>;
  open: ReadonlySet<string>;
  toggle: (n: string) => void;
  lang?: string;
}) {
  const shown = notesIn(text).filter((n) => open.has(n) && notes[n]);
  return (
    <>
      <p lang={lang}>
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
          ) : 'gap' in p ? (
            <span key={i} className="dogmatik-gap" title="Hebräischer Text, noch nicht übertragen">
              [hebräisch]
            </span>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
      </p>
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
  const note = s.notes[keyOf(day)] ?? '';
  const toJournal = () => {
    const id = store.addArenaEntry();
    store.updateArenaEntry(
      id,
      (e) => ({
        ...e,
        title: `Dogmatik, Band ${day.band}, Tag ${day.tag}: ${day.titel}`,
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
        onChange={(e) => update((x) => setNote(x, day, e.target.value), {})}
      />
      <button
        type="button"
        className="btn"
        disabled={!note.trim()}
        aria-describedby={note.trim() ? undefined : 'dogmatik-note-hint'}
        onClick={toJournal}
      >
        In die Gebetskammer schreiben
      </button>
      {!note.trim() && (
        <p id="dogmatik-note-hint" className="small muted">
          Schreibe zuerst deine Gedanken auf.
        </p>
      )}
    </section>
  );
}

/** One section of the plan: Bible word, the text with its notes, core sentence, question, and "gelesen". */
export function DogmatikDayPage({ lib, day }: { lib: DogmatikLibrary; day: DogmatikDay }) {
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
  const read = isRead(s, day);
  const portion = todaysPortion(lib, s, date);
  const inPortion = portion.some((d) => d.band === day.band && d.tag === day.tag);
  const nextInPortion = portion.find((d) => !isRead(s, d) && !(d.band === day.band && d.tag === day.tag));
  const { prev, next } = neighbours(lib, day);
  const font = (step: number) => update((x) => ({ ...x, fontStep: Math.min(FONT_STEPS.max, Math.max(FONT_STEPS.min, x.fontStep + step)) }));

  let ahead: ReactNode = null;
  if (s.on && portion[0] && !inPortion && !read) {
    ahead = (
      <p className="small muted dogmatik-ahead">
        Du liest vorab. Dein Plan steht bei <Link to={keep(dayPath(portion[0]))}>{whereLine(portion[0], s)}</Link>.
      </p>
    );
  }

  return (
    <article className="dogmatik-day" style={{ ['--dogmatik-size' as string]: `${1.08 + s.fontStep * 0.08}rem` }}>
      <div className="title-row">
        <BackLink to={withDate(back.to, date, isToday)}>{back.label}</BackLink>
        <h2 className="dogmatik-title">{day.titel}</h2>
      </div>
      <p className="dogmatik-meta">
        <span>
          Band {day.band} · Tag {day.tag}
        </span>
        <span>{day.minuten} Min.</span>
        <span>{sourceLine(day)}</span>
      </p>
      <p className="dogmatik-place">
        {day.teil}
        {day.kapitel && ` › ${day.kapitel}`}
        {day.abschnitt && ` › ${day.abschnitt}`}
      </p>
      {ahead}
      {!day.geprueft && (
        <p className="small muted dogmatik-unchecked">
          Noch nicht durchgesehen: Der Text folgt einer Abschrift des Frakturdrucks und kann Lesefehler enthalten.
        </p>
      )}

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
          b.kind === 'h' ? (
            <h3 key={`h${b.no}`} className="dogmatik-heading">
              {b.text}
            </h3>
          ) : b.kind === 'p' ? (
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
              <span className="dogmatik-done-mark">✓ Gelesen am {formatShort(s.read[keyOf(day)]!)}</span>
            </p>
            <p className="small muted">
              {s.minuten === 0 ? `Woche ${weekOfPlan(day.tag)} des ${day.band}. Jahres` : `Band ${day.band}, Tag ${day.tag} von 365`} ·{' '}
              {readInThirtyDays(s, date)} Abschnitte in den letzten 30 Tagen
            </p>
            {s.on && inPortion && nextInPortion && (
              <Link className="btn primary" to={keep(dayPath(nextInPortion))}>
                Weiterlesen: {nextInPortion.titel}
              </Link>
            )}
            {s.on && inPortion && !nextInPortion && <p className="dogmatik-done-line">Für heute gelesen.</p>}
            <button type="button" className="btn quiet" onClick={() => update((x) => setRead(x, day, null))}>
              Nicht gelesen
            </button>
          </>
        ) : (
          <button type="button" className="btn primary" onClick={() => update((x) => setRead(x, day, date))}>
            Gelesen
          </button>
        )}
      </div>

      <nav className="dogmatik-pager" aria-label="Andere Tage">
        {prev ? (
          <Link className="btn" to={keep(dayPath(prev))} aria-label={`Zurück zu Band ${prev.band}, Tag ${prev.tag}: ${prev.titel}`}>
            <Chevron dir="left" size={ICON_SIZE.s} /> {prev.band !== day.band ? `Band ${prev.band}, ` : ''}Tag {prev.tag}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link className="btn" to={keep(dayPath(next))} aria-label={`Weiter zu Band ${next.band}, Tag ${next.tag}: ${next.titel}`}>
            {next.band !== day.band ? `Band ${next.band}, ` : ''}Tag {next.tag} <Chevron dir="right" size={ICON_SIZE.s} />
          </Link>
        )}
      </nav>
    </article>
  );
}
