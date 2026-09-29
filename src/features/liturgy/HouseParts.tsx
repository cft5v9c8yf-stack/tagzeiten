import { Link } from 'react-router';
import {
  daughterPrayer,
  HOUSE_BLESSING_RUBRIC,
  HOUSE_PRAYER,
  HOUSE_RUBRIC,
  houseBlessing,
  houseForAll,
  sonPrayer,
  WIFE_PRAYER_TITLE,
  wifePrayer,
  type FocusPrayer,
} from '../../content/house';
import { RUBRICS } from '../../content/orders';
import { HUSBAND_PRAYER, PARENTS_PRAYER, type TreasuryPrayer } from '../../content/prayerTreasury';
import { useProfile } from '../../data/hooks';
import { weekdayOf, type DateKey } from '../../domain/dates';
import { childrenOf, focusName, focusOf, hasHouse, type Focus } from '../../domain/house';
import type { OrderForm } from '../../domain/model';
import { BibleRef } from '../../ui/BibleRef';
import { PrayerText, Rubric } from '../../ui/PrayerText';

export const HOUSE_PATH = '/mehr/haus';

/** No names yet: where to enter them. */
function HouseHint({ children }: { children?: React.ReactNode }) {
  return (
    <p className="small muted house-hint">
      {children ?? 'Trage deine Frau und deine Kinder mit Namen ein, dann stehen sie hier im Gebet.'}{' '}
      <Link to={HOUSE_PATH}>Mehr → Mein Haus</Link>
    </p>
  );
}

export function Focused({ prayer }: { prayer: FocusPrayer }) {
  return (
    <>
      <PrayerText text={{ lines: prayer.lines }} />
      {prayer.refs && (
        <p className="attribution house-refs">
          {prayer.refs.map((r, i) => (
            <span key={r}>
              {i > 0 && ' · '}
              <BibleRef reference={r} />
            </span>
          ))}
        </p>
      )}
    </>
  );
}

function Treasury({ prayer }: { prayer: TreasuryPrayer }) {
  return (
    <>
      <h5 className="house-focus-title">{prayer.title}</h5>
      <PrayerText text={prayer.text} />
    </>
  );
}

/** The prayer for the one in the centre, with the concern as a rubric right above it. */
function FocusBody({ focus, withChildren }: { focus: Focus; withChildren: boolean }) {
  const concern = focus.kind === 'wife' || focus.kind === 'child' ? focus.person.concern.trim() : '';
  const concernRubric = concern && <Rubric>Anliegen: {concern}</Rubric>;
  switch (focus.kind) {
    case 'wife':
      return (
        <>
          <h5 className="house-focus-title">{WIFE_PRAYER_TITLE}</h5>
          {concernRubric}
          <Focused prayer={wifePrayer(focus.person.name.trim())} />
        </>
      );
    case 'child': {
      const name = focus.person.name.trim();
      if (!focus.person.sex) {
        return (
          <>
            <h5 className="house-focus-title">Für {name}</h5>
            <HouseHint>Bei {name} fehlt noch, ob Sohn oder Tochter. Ergänze es, dann steht hier das Gebet für diesen Tag.</HouseHint>
          </>
        );
      }
      return (
        <>
          <h5 className="house-focus-title">Für {name}</h5>
          {concernRubric}
          <Focused prayer={focus.person.sex === 'son' ? sonPrayer(name) : daughterPrayer(name)} />
        </>
      );
    }
    case 'marriage':
      return <Treasury prayer={HUSBAND_PRAYER} />;
    case 'house':
      return (
        <>
          <h5 className="house-focus-title">Für das ganze Haus</h5>
          <Focused prayer={HOUSE_PRAYER} />
          {withChildren && <Treasury prayer={PARENTS_PRAYER} />}
        </>
      );
  }
}

/**
 * Morning, "Die Antwort": all by name every day, then – in the full form – the
 * one who stands in the centre today, prayed for longer.
 */
export function HouseIntercession({ date, form }: { date: DateKey; form: OrderForm }) {
  const house = useProfile().house;
  if (!hasHouse(house)) return <HouseHint />;
  const focus = focusOf(house, date);
  const full = form === 'full';
  const concern = focus.kind === 'wife' || focus.kind === 'child' ? focus.person.concern.trim() : '';
  // The historic prayers belong to their own days only: Arndt's on Sunday.
  const sunday = weekdayOf(date) === 0;
  return (
    <>
      {full && (
        <div className="house-focus">
          <p>
            <b>Heute im Mittelpunkt:</b> {focusName(focus)}
          </p>
          {concern && <p className="small">Anliegen: {concern}</p>}
        </div>
      )}
      {full && <Rubric>{HOUSE_RUBRIC}</Rubric>}
      <PrayerText text={houseForAll(house)} />
      {full && <FocusBody focus={focus} withChildren={sunday && childrenOf(house).length > 0} />}
    </>
  );
}

/** Night, after Luther's evening blessing; then to sleep. */
export function HouseBlessing() {
  const house = useProfile().house;
  return (
    <>
      {hasHouse(house) ? (
        <>
          {childrenOf(house).length > 0 && <Rubric>{HOUSE_BLESSING_RUBRIC}</Rubric>}
          <PrayerText text={houseBlessing(house)} />
        </>
      ) : (
        <HouseHint />
      )}
      <p className="send-off">{RUBRICS.goodNight}</p>
    </>
  );
}
