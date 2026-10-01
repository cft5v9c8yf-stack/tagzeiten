import { STREITHALLE_VERSE, WINTER_ARC_LEAD, WINTER_ARC_TITLE } from '../../content/winterArc';
import { useProfile, useStore } from '../../data/hooks';
import { activeRun, positionOf, stageOf } from '../../domain/winterArc';
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
  const focus = stage === 'during' ? positionOf(run, today).focus : undefined;
  return (
    <div className="streithalle">
      <WaVerse verse={STREITHALLE_VERSE} />
      <h3 className="wa-title">{WINTER_ARC_TITLE}</h3>
      <p className="arena-note">{WINTER_ARC_LEAD}</p>
      {stage === 'after' ? <WinterArcClosing run={run} /> : <WinterArcDashboard key={run.id} run={run} />}
      <h4 className="wa-heading">Anleitung</h4>
      <WinterArcGuide currentFocus={focus} />
    </div>
  );
}
