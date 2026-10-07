import { useEffect, useId, useState, type CSSProperties, type FormEvent, type HTMLAttributes } from 'react';
import { RHYTHM_LABEL } from '../../content/habits';
import { WINTER_ARC_BLOCK_LABEL } from '../../content/winterArc';
import { useProfile, useStore } from '../../data/hooks';
import { WEEKDAY_LONG, WEEKDAY_SHORT, type Weekday } from '../../domain/dates';
import { houseHas, NEED_NOTE } from '../../domain/house';
import type { Rhythm } from '../../domain/model';
import { WEEK } from '../../domain/schedule';
import {
  addPoint,
  BLOCKS,
  editPoint,
  groupOf,
  isTicked,
  movePoint,
  movePointTo,
  newPointId,
  POINT_GROUPS,
  POINT_TEXT_MAX,
  removePoint,
  restorePoint,
  type DayBlock,
  type PointGroup,
  type WinterArcPoint,
  type WinterArcRun,
} from '../../domain/winterArc';
import { planSuggestions, pointsOf } from '../../domain/winterArcPoints';
import { Segmented } from '../../ui/Choice';
import { GripIcon } from '../../ui/Icons';
import { useSortable } from '../../ui/useSortable';

const GROUP_TITLE: Record<PointGroup, string> = {
  ...WINTER_ARC_BLOCK_LABEL,
  weekly: 'Wöchentlich',
  monthly: 'Monatlich',
};

const RHYTHMS: readonly Rhythm[] = ['daily', 'weekly', 'monthly'];

/** Headings one level below where the list stands. */
type Heading = 'h4' | 'h5' | 'h6';

/** "jeden Tag", "Mo–Fr", "Mo, Mi, Fr": the days of a daily point, short. */
export function daysLine(days: readonly Weekday[]): string {
  const on = WEEK.filter((d) => days.includes(d));
  if (on.length === 7) return 'jeden Tag';
  if (!on.length) return 'an keinem Tag';
  const from = WEEK.indexOf(on[0]!);
  const run = on.length >= 3 && on.every((d, i) => WEEK.indexOf(d) === from + i);
  return run ? `${WEEKDAY_SHORT[on[0]!]}–${WEEKDAY_SHORT[on[on.length - 1]!]}` : on.map((d) => WEEKDAY_SHORT[d]).join(', ');
}

const metaOf = (p: WinterArcPoint) => (p.rhythm === 'daily' ? `täglich · ${daysLine(p.weekdays ?? [])}` : RHYTHM_LABEL[p.rhythm]);

function DayChips({ label, days, onToggle }: { label: string; days: readonly Weekday[]; onToggle: (d: Weekday) => void }) {
  return (
    <fieldset className="wa-point-days">
      <legend>An welchen Tagen</legend>
      <div className="day-chips" role="group" aria-label={label}>
        {WEEK.map((d) => (
          <button key={d} type="button" aria-pressed={days.includes(d)} aria-label={WEEKDAY_LONG[d]} onClick={() => onToggle(d)}>
            {WEEKDAY_SHORT[d]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

const toggled = (days: readonly Weekday[], d: Weekday) =>
  WEEK.filter((x) => (x === d ? !days.includes(d) : days.includes(x)));

/** One point: its words and kind; opened, everything about it can be changed. */
function PointRow({
  run,
  point,
  handle,
  style,
  dragging,
  hintId,
}: {
  run: WinterArcRun;
  point: WinterArcPoint;
  handle: HTMLAttributes<HTMLButtonElement>;
  style: CSSProperties | undefined;
  dragging: boolean;
  hintId: string;
}) {
  const store = useStore();
  const profile = useProfile();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(point.text);
  const [confirming, setConfirming] = useState(false);
  useEffect(() => setDraft(point.text), [point.text]);
  const change = (fn: (ps: WinterArcPoint[]) => WinterArcPoint[]) => store.setWinterArcPoints(run.id, fn);
  const commit = () => {
    if (draft.trim() && draft !== point.text) change((ps) => editPoint(ps, point.id, { text: draft }));
    else setDraft(point.text);
  };
  const ticked = isTicked(profile.winterArc, run.id, point);
  return (
    <li className={`habit-edit wa-point${dragging ? ' is-dragging' : ''}`} data-sort-id={point.id} style={style}>
      <button
        type="button"
        id={`sort-${point.id}`}
        className="icon-btn drag-handle"
        aria-label={`${point.text} verschieben`}
        aria-describedby={hintId}
        {...handle}
      >
        <GripIcon />
      </button>
      <div className="habit-edit-main">
        <span className="wa-point-text">{point.text}</span>
        <span className="habit-meta">
          <span className="habit-kind">{metaOf(point)}</span>
          {!houseHas(profile.house, point.needs) && <span className="habit-kind habit-waits">{NEED_NOTE[point.needs!]}</span>}
        </span>
      </div>
      <button
        type="button"
        className="link-btn"
        aria-expanded={open}
        aria-controls={`${id}-edit`}
        aria-label={`${point.text} ${open ? 'schließen' : 'ändern'}`}
        onClick={() => setOpen(!open)}
      >
        {open ? 'Schließen' : 'Ändern'}
      </button>
      {open && (
        <div className="wa-point-edit" id={`${id}-edit`}>
          <div className="field">
            <label htmlFor={`${id}-text`}>Wortlaut</label>
            <input
              id={`${id}-text`}
              type="text"
              maxLength={POINT_TEXT_MAX}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          </div>
          {point.rhythm === 'daily' && (
            <>
              <p className="wa-point-label">Block</p>
              <Segmented<DayBlock>
                label={`Block für ${point.text}`}
                value={point.block ?? 'morning'}
                onChange={(block) => change((ps) => editPoint(ps, point.id, { block }))}
                options={BLOCKS.map((b) => ({ value: b, label: WINTER_ARC_BLOCK_LABEL[b] }))}
              />
              <DayChips
                label={`Tage für ${point.text}`}
                days={point.weekdays ?? []}
                onToggle={(d) => change((ps) => editPoint(ps, point.id, { weekdays: toggled(point.weekdays ?? [], d) }))}
              />
            </>
          )}
          {confirming ? (
            <div className="wa-point-remove">
              <p className="small">
                {ticked
                  ? 'Die Gewohnheit verschwindet aus der Liste. Ihre Haken bleiben gespeichert, und du kannst sie unten wieder aufnehmen.'
                  : 'Die Gewohnheit verschwindet aus der Liste.'}
              </p>
              <span className="confirm-inline">
                <button type="button" className="btn small-btn" onClick={() => change((ps) => removePoint(ps, point.id, ticked))}>
                  Entfernen
                </button>
                <button type="button" className="btn quiet small-btn" onClick={() => setConfirming(false)}>
                  Behalten
                </button>
              </span>
            </div>
          ) : (
            <button type="button" className="link-btn wa-point-remove" onClick={() => setConfirming(true)}>
              Aus der Liste nehmen …
            </button>
          )}
        </div>
      )}
    </li>
  );
}

/** The points of one block or rhythm, sorted by dragging the handle or with the arrow keys. */
function PointList({
  run,
  group,
  points,
  hintId,
  onMoved,
  H,
}: {
  run: WinterArcRun;
  group: PointGroup;
  points: WinterArcPoint[];
  hintId: string;
  onMoved: (id: string, viaKeyboard: boolean) => void;
  H: Heading;
}) {
  const store = useStore();
  const { listRef, drag, handleProps, itemStyle } = useSortable({
    ids: points.map((p) => p.id),
    onDrop: (id, index) => {
      store.setWinterArcPoints(run.id, (ps) => movePointTo(ps, id, index));
      onMoved(id, false);
    },
    onKeyMove: (id, direction) => {
      store.setWinterArcPoints(run.id, (ps) => movePoint(ps, id, direction));
      onMoved(id, true);
    },
  });
  return (
    <section className="wa-standard-group" aria-label={GROUP_TITLE[group]}>
      <H>{GROUP_TITLE[group]}</H>
      <ul className={`habit-list${drag ? ' sorting' : ''}`} ref={(el) => (listRef.current = el)}>
        {points.map((p) => (
          <PointRow
            key={p.id}
            run={run}
            point={p}
            handle={handleProps(p.id)}
            style={itemStyle(p.id)}
            dragging={drag?.id === p.id}
            hintId={hintId}
          />
        ))}
      </ul>
    </section>
  );
}

/** A new point in the user's own words. */
function AddPoint({ run, H }: { run: WinterArcRun; H: Heading }) {
  const store = useStore();
  const id = useId();
  const [text, setText] = useState('');
  const [rhythm, setRhythm] = useState<Rhythm>('daily');
  const [block, setBlock] = useState<DayBlock>('morning');
  const [days, setDays] = useState<readonly Weekday[]>(WEEK);
  const [added, setAdded] = useState('');
  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    store.setWinterArcPoints(run.id, (ps) =>
      addPoint(ps, { text, rhythm, ...(rhythm === 'daily' ? { block, weekdays: days } : {}) }, newPointId(Date.now())),
    );
    setAdded(text.trim());
    setText('');
    setDays(WEEK);
  };
  return (
    <form className="wa-add" onSubmit={add} aria-labelledby={`${id}-title`}>
      <H id={`${id}-title`}>Neue Gewohnheit</H>
      <div className="field">
        <label htmlFor={`${id}-text`}>Wortlaut</label>
        <input
          id={`${id}-text`}
          type="text"
          maxLength={POINT_TEXT_MAX}
          value={text}
          placeholder="z. B. Mittagsgebet"
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor={`${id}-rhythm`}>Rhythmus</label>
        <select id={`${id}-rhythm`} value={rhythm} onChange={(e) => setRhythm(e.target.value as Rhythm)}>
          {RHYTHMS.map((r) => (
            <option key={r} value={r}>
              {RHYTHM_LABEL[r]}
            </option>
          ))}
        </select>
      </div>
      {rhythm === 'daily' && (
        <>
          <div className="field">
            <label htmlFor={`${id}-block`}>Block</label>
            <select id={`${id}-block`} value={block} onChange={(e) => setBlock(e.target.value as DayBlock)}>
              {BLOCKS.map((b) => (
                <option key={b} value={b}>
                  {WINTER_ARC_BLOCK_LABEL[b]}
                </option>
              ))}
            </select>
          </div>
          <DayChips label="Tage der neuen Gewohnheit" days={days} onToggle={(d) => setDays(toggled(days, d))} />
        </>
      )}
      <button type="submit" className="btn primary" disabled={!text.trim()}>
        Gewohnheit hinzufügen
      </button>
      <p className="visually-hidden" aria-live="polite">
        {added && `${added} steht jetzt in der Liste.`}
      </p>
    </form>
  );
}

/** Where "Meine Gewohnheiten" stands in the Streithalle, to be opened from the day's list. */
export const STANDARD_ID = 'wa-standard';

/** Opens "Meine Gewohnheiten" in the Streithalle and brings it into view. */
export function openStandard() {
  const el = document.getElementById(STANDARD_ID);
  if (!(el instanceof HTMLDetailsElement)) return;
  el.open = true;
  el.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
}

/**
 * "Meine Gewohnheiten": the standard of a round in the user's own words, by the
 * blocks of the day (Morgen, Haus, Arbeit), then week and month. Anything can
 * be added, changed, sorted and taken out; the plan of the Winter Arc offers
 * what the list does not hold.
 */
export function WinterArcStandard({ run, level = 6 }: { run: WinterArcRun; level?: 4 | 5 | 6 }) {
  const H: Heading = `h${level}`;
  const store = useStore();
  const profile = useProfile();
  const hintId = useId();
  const [announcement, setAnnouncement] = useState('');
  const [refocus, setRefocus] = useState<string | null>(null);
  const points = pointsOf(run, profile.winterArcSettings);
  const shown = points.filter((p) => !p.removed);
  const fromPlan = planSuggestions(points);
  const planIds = new Set(fromPlan.map((p) => p.id));
  const ownRemoved = points.filter((p) => p.removed && !planIds.has(p.id));

  // After moving by keyboard, keep the focus on the handle so it can be moved again.
  useEffect(() => {
    if (!refocus) return;
    document.getElementById(`sort-${refocus}`)?.focus();
    setRefocus(null);
  }, [refocus]);

  const moved = (id: string, viaKeyboard: boolean) => {
    const current = store.getProfile().winterArc.runs.find((r) => r.id === run.id);
    const list = current ? pointsOf(current, store.getProfile().winterArcSettings).filter((p) => !p.removed) : [];
    const p = list.find((x) => x.id === id);
    if (p) {
      const group = list.filter((x) => groupOf(x) === groupOf(p));
      setAnnouncement(`${p.text}: Platz ${group.indexOf(p) + 1} von ${group.length}`);
    }
    if (viaKeyboard) setRefocus(id);
  };
  const takeUp = (p: WinterArcPoint) => store.setWinterArcPoints(run.id, (ps) => restorePoint(ps, p));

  return (
    <div className="wa-standard">
      <p className="small muted">
        Was du in dieser Runde hältst, in deinen eigenen Worten. Tippe auf „Ändern“, um den Wortlaut, den Block oder die
        Tage anzupassen. Zum Sortieren am Griff ziehen.
      </p>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      <p id={hintId} className="visually-hidden">
        Zum Verschieben ziehen oder mit den Pfeiltasten nach oben und unten bewegen.
      </p>
      {shown.length === 0 && <p className="empty">Noch keine Gewohnheit in der Liste. Lege unten die erste an.</p>}
      {POINT_GROUPS.map((g) => {
        const list = shown.filter((p) => groupOf(p) === g);
        return list.length ? (
          <PointList key={g} run={run} group={g} points={list} hintId={hintId} onMoved={moved} H={H} />
        ) : null;
      })}
      <AddPoint run={run} H={H} />
      {fromPlan.length > 0 && (
        <section className="wa-standard-suggest" aria-label="Aus dem Winter Arc">
          <H>Aus dem Winter Arc</H>
          <div className="chips">
            {fromPlan.map((p) => (
              <button key={p.id} type="button" className="chip" onClick={() => takeUp(p)}>
                {p.text}{' '}
                <span className="chip-source">· {GROUP_TITLE[groupOf(p)]}</span>
              </button>
            ))}
          </div>
        </section>
      )}
      {ownRemoved.length > 0 && (
        <section className="wa-standard-suggest" aria-label="Aus der Liste genommen">
          <H>Aus der Liste genommen</H>
          <div className="chips">
            {ownRemoved.map((p) => (
              <button key={p.id} type="button" className="chip" onClick={() => takeUp(p)}>
                {p.text}{' '}
                <span className="chip-source">· wieder aufnehmen</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
