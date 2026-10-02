import { CHANGELOG } from '../../content/changelog';
import { fromKey, MONTH_LONG } from '../../domain/dates';
import { Section } from '../../ui/Section';

const dateLabel = (k: string) => {
  const d = fromKey(k);
  return `${d.getDate()}. ${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`;
};

type Release = (typeof CHANGELOG)[number];

/** "0.30.1" → "0.30": releases are grouped under their number, patches with it. */
const minorOf = (v: string) => v.split('.').slice(0, 2).join('.');

const GROUPS: { minor: string; releases: Release[] }[] = [];
for (const r of CHANGELOG) {
  const last = GROUPS[GROUPS.length - 1];
  if (last && last.minor === minorOf(r.version)) last.releases.push(r);
  else GROUPS.push({ minor: minorOf(r.version), releases: [r] });
}

/** The groups as a list of folding entries, one open at a time. */
const IDS = GROUPS.map((g) => `changelog.${g.minor}`);

/** The versions of the app and what each brought, newest first, grouped under their number; the newest is open. */
export function Changelog() {
  return (
    <>
      <p className="changelog-current">Du nutzt Version {__APP_VERSION__}.</p>
      {GROUPS.map((g, i) => (
        <Section
          key={g.minor}
          id={IDS[i]!}
          group={IDS}
          defaultOpen={i === 0}
          className="changelog-release"
          title={
            <span className="changelog-head">
              <span>
                Version {g.minor} <span className="changelog-date">{dateLabel(g.releases[0]!.date)}</span>
              </span>
              <span className="changelog-title">{g.releases[0]!.title}</span>
            </span>
          }
        >
          {g.releases.map((r) => (
            <div key={r.version} className="changelog-patch">
              {g.releases.length > 1 && (
                <h4 className="changelog-patch-head">
                  {r.version} · {r.title}
                </h4>
              )}
              <dl className="changelog-changes">
                {r.changes.map((c, k) => (
                  <div key={k}>
                    <dt>{c.area}</dt>
                    <dd>{c.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </Section>
      ))}
    </>
  );
}
