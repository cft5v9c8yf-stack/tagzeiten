import {
  WINTER_ARC_ABOUT,
  WINTER_ARC_DAY,
  WINTER_ARC_END,
  WINTER_ARC_FOCUS,
  WINTER_ARC_LEAD,
  WINTER_ARC_PHASES,
  WINTER_ARC_RULES,
  WINTER_ARC_WEEK,
  type WinterArcVerse,
} from '../../content/winterArc';
import { TileGroup } from '../../ui/TileGroup';

/** A verse of the plan: the text, then where it stands (as text only, rule 13). */
export function WaVerse({ verse }: { verse: WinterArcVerse }) {
  return (
    <figure className="section-verse wa-verse">
      <blockquote>„{verse.text}“</blockquote>
      <figcaption>{verse.ref}</figcaption>
    </figure>
  );
}

/** The table of the thirteen weeks; the week of the round under way is marked. */
export function FocusWeeks({ current }: { current?: number }) {
  return (
    <ol className="wa-weeks">
      {WINTER_ARC_FOCUS.map((f) => (
        <li
          key={f.week}
          className={f.week === current ? 'wa-week is-current' : 'wa-week'}
          aria-current={f.week === current ? 'true' : undefined}
        >
          <p className="wa-week-head">
            <span className="wa-week-no">Woche {f.week}</span> <strong>{f.focus}</strong>
            {f.week === current && <span className="wa-week-now"> · diese Woche</span>}
          </p>
          <p>{f.task}</p>
          <p className="wa-week-verse">
            „{f.verse.text}“ ({f.verse.ref})
          </p>
        </li>
      ))}
    </ol>
  );
}

/**
 * The guide of the Winter Arc, word for word after reference/winter-arc.md,
 * in its own order: what it is about, the rules, the day, the week, the phases
 * with the thirteen weeks, and day 90.
 */
export function WinterArcGuide({ currentFocus }: { currentFocus?: number }) {
  return (
    <div className="wa-guide">
      <p className="arena-note wa-lead">{WINTER_ARC_LEAD}</p>
      <TileGroup
        level={4}
        label="Anleitung"
        items={[
          {
            id: 'arena.wa.guide.about',
            title: WINTER_ARC_ABOUT.title,
            line: 'Phasen und Leitfragen',
            icon: 'compass',
            content: (
              <>
                {WINTER_ARC_ABOUT.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                <table className="wa-table">
                  <thead>
                    <tr>
                      <th scope="col">Wochen</th>
                      <th scope="col">Phase</th>
                      <th scope="col">Leitfrage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WINTER_ARC_ABOUT.phases.map((r) => (
                      <tr key={r.phase}>
                        <td>{r.weeks}</td>
                        <td>{r.phase}</td>
                        <td>{r.question}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <WaVerse verse={WINTER_ARC_ABOUT.verse} />
              </>
            ),
          },
          {
            id: 'arena.wa.guide.rules',
            title: WINTER_ARC_RULES.title,
            line: 'Was die 90 Tage trägt',
            icon: 'tablets',
            content: (
              <>
                <p>{WINTER_ARC_RULES.lead}</p>
                <ol className="wa-list">
                  {WINTER_ARC_RULES.rules.map((r) => (
                    <li key={r.title}>
                      <strong>{r.title}</strong> {r.text}
                    </li>
                  ))}
                </ol>
                <p>{WINTER_ARC_RULES.after}</p>
                <WaVerse verse={WINTER_ARC_RULES.verse} />
              </>
            ),
          },
          {
            id: 'arena.wa.guide.day',
            title: WINTER_ARC_DAY.title,
            line: 'Drei Blöcke, jeden Tag',
            icon: 'sunrise',
            content: (
              <>
                <p>{WINTER_ARC_DAY.lead}</p>
                <table className="wa-table">
                  <thead>
                    <tr>
                      <th scope="col">Zeit</th>
                      <th scope="col">Block</th>
                      <th scope="col">Was</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WINTER_ARC_DAY.schedule.map((r) => (
                      <tr key={r.time}>
                        <td className="wa-nowrap">{r.time}</td>
                        <td>{r.block}</td>
                        <td>{r.what}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p>{WINTER_ARC_DAY.note}</p>
                {WINTER_ARC_DAY.blocks.map((b) => (
                  <section key={b.title} className="wa-block">
                    <h5>{b.title}</h5>
                    <p>{b.lead}</p>
                    <ul className="wa-list">
                      {b.items.map((it) => (
                        <li key={it.title}>
                          <strong>{it.title}</strong> {it.text}
                        </li>
                      ))}
                    </ul>
                    <p>{b.after}</p>
                    <WaVerse verse={b.verse} />
                  </section>
                ))}
              </>
            ),
          },
          {
            id: 'arena.wa.guide.week',
            title: WINTER_ARC_WEEK.title,
            line: 'Sonntag, Woche, Monat',
            icon: 'clock',
            content: (
              <>
                <p>{WINTER_ARC_WEEK.lead}</p>
                <dl className="wa-rows">
                  {WINTER_ARC_WEEK.rows.map((r) => (
                    <div key={r.what}>
                      <dt>
                        <span className="wa-when">{r.when}</span> {r.what}
                      </dt>
                      <dd>{r.how}</dd>
                    </div>
                  ))}
                </dl>
                <WaVerse verse={WINTER_ARC_WEEK.verse} />
              </>
            ),
          },
          {
            id: 'arena.wa.guide.phases',
            title: WINTER_ARC_PHASES.title,
            line: 'Die 13 Wochen',
            icon: 'star',
            content: (
              <>
                <p>{WINTER_ARC_PHASES.lead}</p>
                {WINTER_ARC_PHASES.phases.map((ph) => (
                  <p key={ph.name}>
                    <strong>
                      {ph.name} ({ph.weeks}): {ph.question}
                    </strong>{' '}
                    {ph.text}
                  </p>
                ))}
                <FocusWeeks current={currentFocus} />
                <WaVerse verse={WINTER_ARC_PHASES.verse} />
              </>
            ),
          },
          {
            id: 'arena.wa.guide.end',
            title: WINTER_ARC_END.title,
            line: 'Nach der Runde',
            icon: 'check',
            content: (
              <>
                <EndText />
              </>
            ),
          },
        ]}
      />
    </div>
  );
}

/** "Tag 90 – und danach": in the guide, and on the closing page. */
export function EndText() {
  return (
    <>
      {WINTER_ARC_END.paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <WaVerse verse={WINTER_ARC_END.verse} />
    </>
  );
}
