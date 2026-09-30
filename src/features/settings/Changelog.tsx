import { CHANGELOG } from '../../content/changelog';
import { fromKey, MONTH_LONG } from '../../domain/dates';
import { Section } from '../../ui/Section';

const dateLabel = (k: string) => {
  const d = fromKey(k);
  return `${d.getDate()}. ${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`;
};

/** The versions as a list of folding entries, one open at a time. */
const IDS = CHANGELOG.map((r) => `changelog.${r.version}`);

/** The versions of the app and what each brought, newest first; the newest is open. */
export function Changelog() {
  return (
    <>
      <p className="changelog-current">Du nutzt Version {__APP_VERSION__}.</p>
      {CHANGELOG.map((r, i) => (
        <Section
          key={r.version}
          id={IDS[i]!}
          group={IDS}
          defaultOpen={i === 0}
          className="changelog-release"
          title={
            <span className="changelog-head">
              <span>
                Version {r.version} <span className="changelog-date">{dateLabel(r.date)}</span>
              </span>
              <span className="changelog-title">{r.title}</span>
            </span>
          }
        >
          <dl className="changelog-changes">
            {r.changes.map((c) => (
              <div key={c.area}>
                <dt>{c.area}</dt>
                <dd>{c.text}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ))}
    </>
  );
}
