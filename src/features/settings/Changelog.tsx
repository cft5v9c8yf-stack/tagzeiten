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
const majorOf = (v: string) => v.split('.')[0]!;

interface Group {
  minor: string;
  releases: Release[];
}
const GROUPS: Group[] = [];
for (const r of CHANGELOG) {
  const last = GROUPS[GROUPS.length - 1];
  if (last && last.minor === minorOf(r.version)) last.releases.push(r);
  else GROUPS.push({ minor: minorOf(r.version), releases: [r] });
}

/** The numbers under their major number: the current one stands open, each earlier one folds together (1.2). */
const MAJORS: { major: string; groups: Group[] }[] = [];
for (const g of GROUPS) {
  const last = MAJORS[MAJORS.length - 1];
  if (last && last.major === majorOf(g.minor)) last.groups.push(g);
  else MAJORS.push({ major: majorOf(g.minor), groups: [g] });
}
const [CURRENT, ...EARLIER] = MAJORS;

const idOf = (g: Group) => `changelog.${g.minor}`;
const majorId = (major: string) => `changelog.v${major}`;
/** The entries on top, of which one is open at a time. */
const TOP = [...CURRENT!.groups.map(idOf), ...EARLIER.map((m) => majorId(m.major))];

/** "September bis Oktober 2026": the months of an earlier number. */
function span(groups: Group[]): string {
  const first = fromKey(groups.at(-1)!.releases.at(-1)!.date);
  const last = fromKey(groups[0]!.releases[0]!.date);
  const from = first.getFullYear() === last.getFullYear() ? MONTH_LONG[first.getMonth()] : `${MONTH_LONG[first.getMonth()]} ${first.getFullYear()}`;
  return from === MONTH_LONG[last.getMonth()] ? `${from} ${last.getFullYear()}` : `${from} bis ${MONTH_LONG[last.getMonth()]} ${last.getFullYear()}`;
}

function Entry({ g, group, level, open }: { g: Group; group: readonly string[]; level: 3 | 4; open: boolean }) {
  const Patch = level === 3 ? 'h4' : 'h5';
  return (
    <Section
      id={idOf(g)}
      group={group}
      level={level}
      defaultOpen={open}
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
            <Patch className="changelog-patch-head">
              {r.version} · {r.title}
            </Patch>
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
  );
}

/**
 * The versions of the app and what each brought, newest first, grouped under their number; the newest is
 * open. The versions of an earlier number (0.1 to 0.41) stand folded together.
 */
export function Changelog() {
  return (
    <>
      <p className="changelog-current">Du nutzt Version {__APP_VERSION__}.</p>
      {CURRENT!.groups.map((g, i) => (
        <Entry key={g.minor} g={g} group={TOP} level={3} open={i === 0} />
      ))}
      {EARLIER.map((m) => {
        const inner = m.groups.map(idOf);
        return (
          <Section
            key={m.major}
            id={majorId(m.major)}
            group={TOP}
            defaultOpen={false}
            className="changelog-release changelog-major"
            title={
              <span className="changelog-head">
                <span>
                  Versionen {m.groups.at(-1)!.minor} bis {m.groups[0]!.minor} <span className="changelog-date">{span(m.groups)}</span>
                </span>
                <span className="changelog-title">{m.major === '0' ? 'Der Aufbau bis Henoch 1.0' : `Henoch ${m.major}`}</span>
              </span>
            }
          >
            {m.groups.map((g) => (
              <Entry key={g.minor} g={g} group={inner} level={4} open={false} />
            ))}
          </Section>
        );
      })}
    </>
  );
}
