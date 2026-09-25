import { useEffect, useRef, useState } from 'react';
import { trinityGroupOf } from '../../content/churchYearGuide';
import { churchDay, churchYearOutline, SEASON_LABEL, type OutlineEntry } from '../../domain/churchYear';
import { addDays, formatShort, type DateKey } from '../../domain/dates';
import { Chevron } from './SundayPage';

/** Splits the weeks of a season into the Trinity groups, where there are any. */
function groupsOf(weeks: OutlineEntry[]) {
  const groups: { title?: string; weeks: OutlineEntry[] }[] = [];
  for (const w of weeks) {
    const title = trinityGroupOf(w.key)?.title;
    const last = groups.at(-1);
    if (last && last.title === title) last.weeks.push(w);
    else groups.push({ title, weeks: [w] });
  }
  return groups;
}

/**
 * All Sundays of a church year (and Christmas Day and Epiphany, which open a
 * week too) as a card over the Sunday page; choosing one shows it there.
 */
export function SundayChooser({
  shown,
  current,
  onChoose,
  onClose,
}: {
  /** The Sunday on the page (marked in gold). */
  shown: DateKey;
  /** The Sunday of the current week ("diese Woche"). */
  current: DateKey;
  onChoose: (sunday: DateKey) => void;
  onClose: () => void;
}) {
  const [anchor, setAnchor] = useState(shown);
  const outline = churchYearOutline(anchor);
  const weeks = outline.entries.filter((e) => e.opensWeek);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // A dialog: focus inside, Escape closes, the page behind does not scroll.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'Tab' && cardRef.current) {
        const f = cardRef.current.querySelectorAll<HTMLElement>('button:not([disabled])');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      previous?.focus();
    };
  }, []);

  // Open at the Sunday on the page.
  useEffect(() => {
    cardRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView?.({ block: 'center' });
  }, [anchor]);

  return (
    <div className="chooser-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="chooser" role="dialog" aria-modal="true" aria-labelledby="chooser-title" ref={cardRef}>
        <div className="chooser-head">
          <button
            type="button"
            className="chooser-year"
            aria-label="Voriges Kirchenjahr"
            onClick={() => setAnchor(churchDay(addDays(outline.start, -1)).weekStart)}
          >
            <Chevron dir="left" />
          </button>
          <div className="chooser-title">
            <h2 id="chooser-title">Alle Sonntage</h2>
            <p>
              Kirchenjahr {outline.churchYear}/{String(outline.churchYear + 1).slice(2)}
            </p>
          </div>
          <button
            type="button"
            className="chooser-year"
            aria-label="Nächstes Kirchenjahr"
            onClick={() => setAnchor(churchDay(addDays(outline.end, 1)).weekStart)}
          >
            <Chevron dir="right" />
          </button>
        </div>
        <div className="chooser-list">
          {outline.seasons.map((season) => {
            const inSeason = weeks.filter((w) => w.season === season.season);
            if (inSeason.length === 0) return null;
            return (
              <section key={season.season} className="week-season" aria-labelledby={`season-${season.season}`}>
                <h3 id={`season-${season.season}`}>{SEASON_LABEL[season.season]}</h3>
                {groupsOf(inSeason).map((g) => (
                  <div key={g.title ?? season.season} className="week-group">
                    {g.title && <p className="week-group-title">{g.title}</p>}
                    <ul className="week-list">
                      {g.weeks.map((w) => (
                        <li key={w.date}>
                          <button
                            type="button"
                            className="week-link"
                            aria-current={w.date === shown ? 'true' : undefined}
                            onClick={() => onChoose(w.date)}
                          >
                            <span className="week-date">{formatShort(w.date)}</span>
                            <span className="week-name">{w.name}</span>
                            {w.date === current && <span className="ktag">diese Woche</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            );
          })}
        </div>
        <div className="chooser-foot">
          <button type="button" className="btn quiet" ref={closeRef} onClick={onClose}>
            Übersicht schließen
          </button>
        </div>
      </div>
    </div>
  );
}
