import { SETTINGS_VERSES, type SettingsSectionId } from '../content/settingsVerses';
import { composeVerse } from '../domain/weeklyVerse';
import { BibleLink } from './BibleLink';

/** A Bible verse heading a section, where an explanation would otherwise stand. */
export function SectionVerse({ id }: { id: SettingsSectionId }) {
  const v = SETTINGS_VERSES[id];
  return (
    <figure className="section-verse">
      <blockquote>{composeVerse(v)}</blockquote>
      <figcaption>
        <BibleLink reference={v.ref} />
      </figcaption>
    </figure>
  );
}
