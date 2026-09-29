import { TREASURY } from '../../content/prayerTreasury';
import { PrayerText } from '../../ui/PrayerText';
import { Section } from '../../ui/Section';

export const TREASURY_INFO = (
  <p>
    Gebete aus der lutherischen Überlieferung, wortgetreu, ohne Kürzung und ohne Modernisierung. Sie stehen auch in der
    Stillen Zeit: das Gebet eines Ehemannes am Samstag, das Gebet der Eltern für ihre Kinder am Sonntag.
  </p>
);

/** "Mehr → Gebetsschatz": title, author and text of each prayer, always at hand. */
export function PrayerTreasury() {
  return (
    <>
      {TREASURY.map((p) => (
        <Section key={p.id} id={`more.treasury.${p.id}`} title={p.title} level={3} defaultOpen={false}>
          <p className="small muted treasury-author">{p.author}</p>
          <PrayerText text={{ lines: p.text.lines }} />
        </Section>
      ))}
    </>
  );
}
