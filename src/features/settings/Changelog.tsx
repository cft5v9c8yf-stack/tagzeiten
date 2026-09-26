import { CHANGELOG } from '../../content/changelog';
import { fromKey, MONTH_LONG } from '../../domain/dates';

const dateLabel = (k: string) => {
  const d = fromKey(k);
  return `${d.getDate()}. ${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`;
};

/** The versions of the app and what each brought, newest first. */
export function Changelog() {
  return (
    <>
      <p className="changelog-current">Du nutzt Version {__APP_VERSION__}.</p>
      {CHANGELOG.map((r) => (
        <section key={r.version} className="changelog-release" aria-labelledby={`v-${r.version}`}>
          <h3 id={`v-${r.version}`}>
            Version {r.version} <span className="changelog-date">{dateLabel(r.date)}</span>
          </h3>
          <p className="changelog-title">{r.title}</p>
          <dl className="changelog-changes">
            {r.changes.map((c) => (
              <div key={c.area}>
                <dt>{c.area}</dt>
                <dd>{c.text}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </>
  );
}
