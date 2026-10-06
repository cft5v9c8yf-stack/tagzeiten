import { Link } from 'react-router';
import { SUNDAY_INFO } from '../../content/churchYearGuide';
import { WEEKLY_VERSES } from '../../content/weeklyVerses';
import { churchDay } from '../../domain/churchYear';
import type { DateKey } from '../../domain/dates';
import { composeVerse } from '../../domain/weeklyVerse';
import { BibleRef } from '../../ui/BibleRef';
import { LutherRose } from '../../ui/LutherRose';

/**
 * Sunday rest on "Heute": in place of the habits the Sunday itself stands at
 * the top, with its verse, its theme, and Gospel and Epistle as references.
 */
export function SundayRest({ date, to }: { date: DateKey; to: string }) {
  const c = churchDay(date);
  const info = SUNDAY_INFO[c.weekKey];
  const verse = WEEKLY_VERSES[c.weekKey];
  return (
    <section className="sunday-rest" aria-labelledby="sunday-rest-title">
      <div className="sunday-rest-head">
        <span className="sunday-rest-rose" aria-hidden="true">
          <LutherRose size={52} />
        </span>
        <div>
          <p className="sunday-rest-kicker">Sonntagsruhe</p>
          <h3 id="sunday-rest-title">{c.week}</h3>
        </div>
      </div>
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
        <>
          <p className="sunday-theme">{info.theme}</p>
          <div className="sunday-readings">
            <div className="sunday-reading">
              <span className="track">Evangelium</span>
              <BibleRef reference={info.gospel} />
            </div>
            <div className="sunday-reading">
              <span className="track">Epistel</span>
              <BibleRef reference={info.epistle} />
            </div>
          </div>
        </>
      )}
      <Link className="btn primary sunday-rest-go" to={to}>
        Mehr zu diesem Sonntag
      </Link>
    </section>
  );
}
