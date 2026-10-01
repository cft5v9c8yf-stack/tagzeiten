import { useState } from 'react';
import { Link } from 'react-router';
import { STREITHALLE_VERSE } from '../../content/winterArc';
import { useProfile, useStore } from '../../data/hooks';
import { activeRun, stageOf } from '../../domain/winterArc';
import { WinterArcSettings, WinterArcStartPanel } from '../settings/WinterArcSettings';
import { WinterArcDashboard } from './WinterArcDashboard';
import { WinterArcClosing } from './WinterArcRounds';
import { WaVerse, WinterArcGuide } from './WinterArcGuide';

/** No round under way: what the Streithalle is, a round to begin, and the guide to read first. */
function HallStart() {
  const store = useStore();
  const profile = useProfile();
  const [starting, setStarting] = useState(false);
  return (
    <>
      <div className="panel wa-head wa-invite">
        <p>
          In der Streithalle hältst du für einen Zeitraum deiner Wahl einen festen Tagesstandard, nach dem Plan des
          Winter Arc. Ihre Gewohnheiten stehen während der Runde unter „Heute“.
        </p>
        {!starting && (
          <button type="button" className="btn primary" onClick={() => setStarting(true)}>
            Runde beginnen
          </button>
        )}
        {starting && (
          <WinterArcStartPanel
            today={store.today()}
            onCancel={() => setStarting(false)}
            onStart={(s, d, n) => {
              store.startWinterArc(s, d, n);
              setStarting(false);
            }}
          />
        )}
        {profile.winterArc.runs.length > 0 && (
          <p className="small">
            <Link to="/mehr/rueckblick?ansicht=streithalle">Frühere Runden im Rückblick</Link>
          </p>
        )}
      </div>
      <h4 className="wa-heading">Anleitung</h4>
      <WinterArcGuide />
    </>
  );
}

/**
 * The Streithalle: a round of a fixed daily standard, after the plan of the
 * Winter Arc. Word first (Ps 144,1), then the round.
 */
export function Streithalle() {
  const store = useStore();
  const profile = useProfile();
  const run = activeRun(profile.winterArc);
  const today = store.today();
  if (!run) {
    return (
      <div className="streithalle">
        <WaVerse verse={STREITHALLE_VERSE} />
        <HallStart />
      </div>
    );
  }
  const stage = stageOf(run, today);
  return (
    <div className="streithalle">
      <WaVerse verse={STREITHALLE_VERSE} />
      {stage === 'after' ? (
        <>
          <WinterArcClosing run={run} />
          <h4 className="wa-heading">Anleitung</h4>
          <WinterArcGuide />
        </>
      ) : (
        <WinterArcDashboard key={run.id} run={run} />
      )}
      {/* Everything to set for the Streithalle, in one place where it is used. */}
      <details className="wa-settings">
        <summary>Einstellungen der Streithalle</summary>
        <WinterArcSettings />
      </details>
    </div>
  );
}
