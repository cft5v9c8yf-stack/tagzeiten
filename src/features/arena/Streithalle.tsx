import { STREITHALLE_VERSE, WINTER_ARC_LEAD } from '../../content/winterArc';
import { useProfile, useStore } from '../../data/hooks';
import { activeRun, runName, stageOf } from '../../domain/winterArc';
import { WinterArcDashboard } from './WinterArcDashboard';
import { WinterArcClosing } from './WinterArcRounds';
import { WaVerse, WinterArcGuide } from './WinterArcGuide';

/**
 * The Streithalle: the Winter Arc in the Arena, only while it is switched on.
 * Word first (Ps 144,1), then the plan.
 */
export function Streithalle() {
  const store = useStore();
  const profile = useProfile();
  const run = activeRun(profile.winterArc);
  if (!run) return null;
  const today = store.today();
  const stage = stageOf(run, today);
  return (
    <div className="streithalle">
      <WaVerse verse={STREITHALLE_VERSE} />
      <h3 className="wa-title">{runName(run)}</h3>
      <p className="arena-note">{WINTER_ARC_LEAD}</p>
      {stage === 'after' ? (
        <>
          <WinterArcClosing run={run} />
          <h4 className="wa-heading">Anleitung</h4>
          <WinterArcGuide />
        </>
      ) : (
        <WinterArcDashboard key={run.id} run={run} />
      )}
    </div>
  );
}
