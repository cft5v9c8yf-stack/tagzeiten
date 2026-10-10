import { Link } from 'react-router';
import { ADVENT_INVITE } from '../../content/desert';
import { useStore } from '../../data/hooks';
import { formatLong, fromKey, MONTH_LONG } from '../../domain/dates';
import type { SeasonOffer } from '../../domain/seasons';
import { FlowIcon } from '../../ui/FlowIcon';
import { WaVerse } from '../arena/WinterArcGuide';

/** Where "Wüstenzeit vorbereiten" on "Heute" leads: the Wüstenwanderung, the start already filled in. */
export const PREPARE_PATH = '/arena?bereich=wuestenwanderung&vorbereiten=1';

const dayMonth = (k: string) => `${fromKey(k).getDate()}. ${MONTH_LONG[fromKey(k).getMonth()]}`;
const kicker = (o: SeasonOffer) => (o.begun ? 'Der Advent hat begonnen' : `Ab ${dayMonth(o.begin)}`);
const from = (o: SeasonOffer) => (o.begun ? 'von heute bis Heiligabend' : 'vom 1. Advent bis Heiligabend');

/** The line of the Arena tile while the invitation stands. */
export const seasonTileLine = (o: SeasonOffer) => (o.begun ? 'Im Advent, bis Heiligabend' : `Im Advent, ab ${dayMonth(o.begin)}`);

/** What the start of a Wüstenzeit is filled in with. */
export const seasonPreset = (o: SeasonOffer) => ({
  start: o.start,
  days: o.days,
  name: o.name,
  title: 'Wüstenzeit im Advent',
  note: `${o.days} Tage: ${from(o)}`,
});

/** The article on the homepage; it opens in the browser, so the arrow points out of the app. */
export function SeasonLink({ href }: { href: string }) {
  return (
    <a className="season-link" href={href} target="_blank" rel="noopener noreferrer">
      Mehr dazu auf henoch.app
      <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 11L11 5M6 5h5v5" />
      </svg>
    </a>
  );
}

function Head({ offer, id }: { offer: SeasonOffer; id: string }) {
  return (
    <div className="season-head">
      <span className="season-icon" aria-hidden="true">
        <FlowIcon name="sunrise" size={22} />
      </span>
      <div>
        <p className="season-kicker">{kicker(offer)}</p>
        <h3 id={id}>{ADVENT_INVITE.title}</h3>
      </div>
    </div>
  );
}

/** On "Heute": the invitation and the decision. After "Diesmal nicht" it stands only in the Arena. */
export function TodaySeason({ offer }: { offer: SeasonOffer }) {
  const store = useStore();
  return (
    <section className="season-invite" aria-labelledby="season-today">
      <Head offer={offer} id="season-today" />
      <p className="season-span">
        {from(offer)[0]!.toUpperCase() + from(offer).slice(1)}, {offer.days} Tage mit wenigen festen Gewohnheiten.
      </p>
      <div className="season-decide">
        <Link className="btn primary" to={PREPARE_PATH}>
          Wüstenzeit vorbereiten
        </Link>
        <button type="button" className="btn" onClick={() => store.declineSeason(offer.key)}>
          Diesmal nicht
        </button>
      </div>
      {offer.link && <SeasonLink href={offer.link} />}
      <p className="season-note">Bei „Diesmal nicht“ steht der Hinweis nur noch in der Arena.</p>
    </section>
  );
}

/** In the Wüstenwanderung, while no Wüstenzeit is under way: the verse, the dates and the way in. */
export function ArenaSeason({ offer, onPrepare, onOther }: { offer: SeasonOffer; onPrepare: () => void; onOther: () => void }) {
  return (
    <section className="season-invite season-arena" aria-labelledby="season-arena">
      <Head offer={offer} id="season-arena" />
      <WaVerse verse={ADVENT_INVITE.verse} />
      <p className="season-dates">
        {formatLong(offer.start)} bis {formatLong(offer.end)}
      </p>
      <p className="season-span">
        {offer.days} Tage, {from(offer)}. Die Daten trägt Henoch für dich ein, die Gewohnheiten wählst du danach.
      </p>
      <div className="season-actions">
        <button type="button" className="btn primary" onClick={onPrepare}>
          Wüstenzeit im Advent vorbereiten
        </button>
        <button type="button" className="btn" onClick={onOther}>
          Anderen Zeitraum wählen
        </button>
      </div>
      {offer.link && <SeasonLink href={offer.link} />}
    </section>
  );
}
