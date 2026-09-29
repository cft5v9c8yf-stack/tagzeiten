import { useEffect, useId, useState, type CSSProperties, type HTMLAttributes } from 'react';
import { useToast } from '../../app/Toast';
import { useProfile, useStore } from '../../data/hooks';
import {
  answerConcern,
  emptyChild,
  type ChildSex,
  type House,
  type HouseChild,
  type HousePerson,
} from '../../domain/house';
import { Segmented } from '../../ui/Choice';
import { GripIcon } from '../../ui/Icons';
import { Section } from '../../ui/Section';
import { useSortable } from '../../ui/useSortable';

export const HOUSE_INFO = (
  <>
    <p>
      Deine Frau und deine Kinder, mit Namen. In der Stillen Zeit betest du im Schritt „Die Antwort“ täglich für alle; einer
      steht jeden Tag im Mittelpunkt: montags deine Frau, dienstags bis freitags je ein Kind, samstags eure Ehe, sonntags
      das ganze Haus. Am Abend folgt nach Luthers Abendsegen der Segen über das Haus.
    </p>
    <p>
      Ein Anliegen, das Gott erhört hat, hältst du mit „Erhört“ fest. Es steht dann im Rückblick unter
      „Gebetserhörungen“. Alles bleibt auf diesem Gerät.
    </p>
  </>
);

/** The current concern of one person, with "Erhört" to keep it as answered. */
function ConcernField({
  label,
  person,
  onChange,
  onAnswered,
}: {
  label: string;
  person: HousePerson;
  onChange: (concern: string) => void;
  onAnswered: () => void;
}) {
  const id = useId();
  return (
    <div className="field house-concern">
      <label htmlFor={id}>{label}</label>
      <div className="house-concern-row">
        <input
          id={id}
          type="text"
          value={person.concern}
          placeholder="Aktuelles Anliegen"
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className="btn" disabled={!person.concern.trim()} onClick={onAnswered}>
          Erhört
        </button>
      </div>
    </div>
  );
}

function ChildRow({
  child,
  index,
  canRemove,
  handle,
  style,
  dragging,
  hintId,
  update,
  answer,
}: {
  child: HouseChild;
  index: number;
  canRemove: boolean;
  handle: HTMLAttributes<HTMLButtonElement>;
  style?: CSSProperties;
  dragging: boolean;
  hintId: string;
  update: (fn: (c: HouseChild) => HouseChild | null, immediate?: boolean) => void;
  answer: () => void;
}) {
  const nameId = useId();
  const label = child.name.trim() || `Kind ${index + 1}`;
  return (
    <li className={`house-child${dragging ? ' is-dragging' : ''}`} data-sort-id={child.id} style={style}>
      <button
        type="button"
        id={`sort-${child.id}`}
        className="icon-btn drag-handle"
        aria-label={`${label} verschieben`}
        aria-describedby={hintId}
        {...handle}
      >
        <GripIcon />
      </button>
      <div className="house-child-main">
        <div className="field">
          <label htmlFor={nameId}>{`Kind ${index + 1}`}</label>
          <input
            id={nameId}
            type="text"
            value={child.name}
            placeholder="Name"
            onChange={(e) => update((c) => ({ ...c, name: e.target.value }), false)}
          />
        </div>
        <Segmented<ChildSex | ''>
          label={`${label}: Sohn oder Tochter`}
          value={child.sex ?? ''}
          onChange={(sex) => update((c) => (sex ? { ...c, sex } : c))}
          options={[
            { value: 'son', label: 'Sohn' },
            { value: 'daughter', label: 'Tochter' },
          ]}
        />
        {child.name.trim() && !child.sex && (
          <p className="small muted house-required">Bitte wählen: Sohn oder Tochter. Davon hängt das Gebet an seinem Tag ab.</p>
        )}
        <ConcernField
          label={`Anliegen für ${label}`}
          person={child}
          onChange={(concern) => update((c) => ({ ...c, concern }), false)}
          onAnswered={answer}
        />
      </div>
      {canRemove && (
        <button
          type="button"
          className="arena-remove"
          aria-label={`${label} entfernen`}
          onClick={() => update(() => null)}
        >
          ×
        </button>
      )}
    </li>
  );
}

/** "Mein Haus": the wife and the children, sortable, each with a current concern. */
export function HouseSettings() {
  const store = useStore();
  const toast = useToast();
  const house = useProfile().house;
  const wifeId = useId();
  const hintId = useId();
  const [announcement, setAnnouncement] = useState('');
  const [refocus, setRefocus] = useState<string | null>(null);

  const setHouse = (fn: (h: House) => House, immediate = true) =>
    store.updateProfile((p) => ({ ...p, house: fn(p.house) }), { immediate });

  const answer = (who: 'wife' | string) => {
    store.updateProfile(
      (p) => {
        const r = answerConcern(p.house, p.answered, who, store.today());
        return { ...p, house: r.house, answered: r.answered };
      },
      { immediate: true },
    );
    toast('Als erhört festgehalten – im Rückblick unter „Gebetserhörungen“');
  };

  const move = (id: string, to: number) =>
    setHouse((h) => {
      const list = [...h.children];
      const from = list.findIndex((c) => c.id === id);
      if (from < 0) return h;
      const [c] = list.splice(from, 1);
      list.splice(Math.max(0, Math.min(to, list.length)), 0, c!);
      return { ...h, children: list };
    });

  const moved = (id: string, viaKeyboard: boolean) => {
    const list = store.getProfile().house.children;
    const i = list.findIndex((c) => c.id === id);
    setAnnouncement(`${list[i]?.name.trim() || `Kind ${i + 1}`}: Platz ${i + 1} von ${list.length}`);
    if (viaKeyboard) setRefocus(id);
  };

  useEffect(() => {
    if (!refocus) return;
    document.getElementById(`sort-${refocus}`)?.focus();
    setRefocus(null);
  }, [refocus]);

  const { listRef, drag, handleProps, itemStyle } = useSortable({
    ids: house.children.map((c) => c.id),
    onDrop: (id, index) => {
      move(id, index);
      moved(id, false);
    },
    onKeyMove: (id, direction) => {
      const i = store.getProfile().house.children.findIndex((c) => c.id === id);
      move(id, direction === 'up' ? i - 1 : i + 1);
      moved(id, true);
    },
  });

  return (
    <>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      <p id={hintId} className="visually-hidden">
        Zum Verschieben ziehen oder mit den Pfeiltasten nach oben und unten bewegen.
      </p>
      <Section id="more.house.wife" title="Ehefrau" level={3}>
        <div className="field">
          <label htmlFor={wifeId}>Name</label>
          <input
            id={wifeId}
            type="text"
            value={house.wife.name}
            placeholder="Name"
            onChange={(e) => setHouse((h) => ({ ...h, wife: { ...h.wife, name: e.target.value } }), false)}
          />
        </div>
        <ConcernField
          label={`Anliegen für ${house.wife.name.trim() || 'deine Frau'}`}
          person={house.wife}
          onChange={(concern) => setHouse((h) => ({ ...h, wife: { ...h.wife, concern } }), false)}
          onAnswered={() => answer('wife')}
        />
      </Section>
      <Section id="more.house.children" title="Kinder" level={3}>
        <p className="small muted">
          In dieser Reihenfolge stehen sie dienstags bis freitags im Mittelpunkt. Zum Sortieren am Griff ziehen.
        </p>
        <ul className={`house-children${drag ? ' sorting' : ''}`} ref={(el) => (listRef.current = el)}>
          {house.children.map((c, i) => (
            <ChildRow
              key={c.id}
              child={c}
              index={i}
              canRemove={house.children.length > 1}
              handle={handleProps(c.id)}
              style={itemStyle(c.id)}
              dragging={drag?.id === c.id}
              hintId={hintId}
              answer={() => answer(c.id)}
              update={(fn, immediate = true) =>
                setHouse(
                  (h) => ({
                    ...h,
                    children: h.children.flatMap((x) => {
                      if (x.id !== c.id) return [x];
                      const next = fn(x);
                      return next ? [next] : [];
                    }),
                  }),
                  immediate,
                )
              }
            />
          ))}
        </ul>
        <button
          type="button"
          className="concern-add arena-add"
          aria-label="Weiteres Kind hinzufügen"
          onClick={() => setHouse((h) => ({ ...h, children: [...h.children, emptyChild()] }))}
        >
          +
        </button>
      </Section>
    </>
  );
}
