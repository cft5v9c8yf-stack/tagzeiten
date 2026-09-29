import { WIFE_PRAYER_TITLE, wifePrayer } from '../../content/house';
import { TREASURY } from '../../content/prayerTreasury';
import { useProfile } from '../../data/hooks';
import { PrayerText } from '../../ui/PrayerText';
import { Section } from '../../ui/Section';
import { Focused } from '../liturgy/HouseParts';

export const TREASURY_INFO = (
  <p>
    Gebete für das Haus, jederzeit zur Hand: das Gebet für deine Frau, das am Montag in der Stillen Zeit steht, und zwei
    Gebete aus der lutherischen Überlieferung, wortgetreu, ohne Kürzung und ohne Modernisierung – das Gebet eines
    Ehemannes am Samstag, das Gebet der Eltern für ihre Kinder am Sonntag.
  </p>
);

/** "Mehr → Gebetsschatz": title, author and text of each prayer, always at hand. */
export function PrayerTreasury() {
  // The name comes from "Mein Haus"; without one, "N." as in the old prayer books.
  const wife = useProfile().house.wife.name.trim() || 'N.';
  return (
    <>
      <Section id="more.treasury.ehefrau" title={WIFE_PRAYER_TITLE} level={3} defaultOpen={false}>
        <Focused prayer={wifePrayer(wife)} />
      </Section>
      {TREASURY.map((p) => (
        <Section key={p.id} id={`more.treasury.${p.id}`} title={p.title} level={3} defaultOpen={false}>
          <p className="small muted treasury-author">{p.author}</p>
          <PrayerText text={{ lines: p.text.lines }} />
        </Section>
      ))}
    </>
  );
}
