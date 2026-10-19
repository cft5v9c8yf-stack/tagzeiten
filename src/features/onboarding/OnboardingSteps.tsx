import { useId, useState, type ReactNode } from 'react';
import { DESERT_MORE, DESERT_PACKS, type DesertHabit } from '../../content/desert';
import { HABIT_NEEDS } from '../../content/habits';
import { QUICK_DESERT_DAYS } from '../../domain/desert';
import { endDateOf, isValidDuration, MAX_DURATION, MIN_DURATION, activeRun } from '../../domain/winterArc';
import { houseHas, NEED_NOTE, type HouseNeed } from '../../domain/house';
import { formatFullDate } from '../desert/DesertSettings';
import { draftDays, draftStart, type DesertDraft } from './desertDraft';
import { ABSOLUTION_EVENING } from '../../content/liturgy';
import { BibleRef } from '../../ui/BibleRef';
import { PrayerText } from '../../ui/PrayerText';
import { Segmented } from '../../ui/Choice';
import { fixedAmounts, getPlan, ownPlanId, portionLabel, positionFor } from '../../domain/readingPlan';
import { useToast } from '../../app/Toast';
import {
  changeScope,
  scopeOf,
  singleChapters,
  singlePlace,
  SINGLE_CHOICES,
  TESTAMENT_BOOKS,
  TESTAMENT_OFFSET,
  type Scope,
} from './planScope';
import { useProfile, useStore } from '../../data/hooks';
import { fitsHouse, habitsOfRhythm, RHYTHM_ORDER, setHabitActive } from '../../domain/habits';
import {
  childrenOf,
  emptyChild,
  hasChildren,
  hasWife,
  joinNames,
  wifeOf,
  type ChildSex,
  type House,
} from '../../domain/house';
import type { Rhythm } from '../../domain/model';
import { FixedPlan } from '../settings/PlanSettings';
import { TimesGrid } from '../settings/ScheduleSettings';

export type Way = 'everyday' | 'desert';

/** Everything below writes straight into the app's own stores (profile: house, schedule, habits, plan); nothing is kept twice. */

/** A row with a name, a short line and a switch; the whole row is the tap area. */
function SwitchRow({
  label,
  line,
  checked,
  onChange,
}: {
  label: string;
  line?: string;
  checked: boolean;
  onChange: (on: boolean) => void;
}) {
  const id = useId();
  return (
    <label className="ob-row" htmlFor={id}>
      <span className="ob-row-text">
        <b>{label}</b>
        {line && <span>{line}</span>}
      </span>
      <input id={id} type="checkbox" role="switch" className="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

/* ------------------------------------------------------------ 1 */

export function OrderStep() {
  return (
    <>
      <blockquote className="ob-verse">
        <p>
          „Trachtet am ersten nach dem Reich Gottes und nach seiner Gerechtigkeit, so wird euch solches alles zufallen.“
        </p>
        <cite>
          <BibleRef reference="Matthäus 6,33" />
        </cite>
      </blockquote>
      <ol className="ob-order">
        <li>
          <span className="ob-order-tag">Zuerst</span>
          <b>Das Wort</b>
          <span>Du liest, bevor du planst.</span>
        </li>
        <li>
          <span className="ob-order-tag">Dann</span>
          <b>Das Gebet</b>
          <span>Du betest, was du gelesen hast.</span>
        </li>
        <li>
          <span className="ob-order-tag">Zuletzt</span>
          <b>Die Ausrichtung</b>
          <span>Du legst den Tag vor Gott hin.</span>
        </li>
      </ol>
      <p className="ob-text">
        Die Stille Zeit dauert etwa 45 Minuten. Hast du weniger Zeit, betest du die Kurzform. Sie gilt genauso.
      </p>
    </>
  );
}

/* ------------------------------------------------------------ 2 */

export function WayStep({ way, onChoose }: { way: Way | null; onChoose: (w: Way) => void }) {
  // The explanation comes after the choice, right under the chosen card.
  const card = (w: Way, title: string, line: string, info: string) => (
    <>
      <button type="button" className="ob-choice" aria-pressed={way === w} onClick={() => onChoose(w)}>
        <b>{title}</b>
        <span>{line}</span>
      </button>
      {way === w && (
        <p className="ob-text" role="status">
          {info}
        </p>
      )}
    </>
  );
  return (
    <>
      <p className="ob-lead">Du kannst das später ändern. Die andere Möglichkeit bleibt in der App erhalten.</p>
      <div className="ob-choices" role="group" aria-label="Wofür möchtest du Henoch nutzen?">
        {card(
          'everyday',
          'Alltag',
          'Stille Zeit, Bibel lesen, Vesper und Nachtgebet, dazu dein Haus.',
          'Der Alltag ist der tägliche Rhythmus, den du danach beibehältst oder in dem du von Anfang an lebst.',
        )}
        {card(
          'desert',
          'Wüstenwanderung',
          'Weniger Ablenkung. Mehr Raum für Gott.',
          'Die Wüstenwanderung ist eine begrenzte Zeit, in der du Ablenkungen beiseitelegst und Gottes Wort mehr Raum gibst.',
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------ 3 */

export function HouseStep() {
  const store = useStore();
  const house = useProfile().house;
  const wifeId = useId();
  const [wife, setWife] = useState(() => hasWife(house));
  const [kids, setKids] = useState(() => hasChildren(house));
  const [shown, setShown] = useState(() => Math.max(1, house.children.reduce((n, c, i) => (c.name.trim() ? i + 1 : n), 0)));
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  const setHouse = (fn: (h: House) => House, immediate = true) =>
    store.updateProfile((p) => ({ ...p, house: fn(p.house) }), { immediate });

  const toggleWife = (on: boolean) => {
    setWife(on);
    if (!on) setHouse((h) => ({ ...h, wife: { ...h.wife, name: '' } }));
  };
  const toggleKids = (on: boolean) => {
    setKids(on);
    if (!on) setHouse((h) => ({ ...h, children: h.children.map((c) => ({ ...c, name: '' })) }));
  };
  const addChild = () => {
    setHouse((h) => (h.children.length > shown ? h : { ...h, children: [...h.children, emptyChild()] }));
    setFocusIndex(shown);
    setShown(shown + 1);
  };
  const updateChild = (i: number, fn: (c: House['children'][number]) => House['children'][number], immediate = false) =>
    setHouse((h) => ({ ...h, children: h.children.map((c, j) => (j === i ? fn(c) : c)) }), immediate);

  // The settings keep four empty fields; the setup shows as many as are used, and one more on request.
  const children = house.children.slice(0, shown);

  return (
    <>
      <p className="ob-lead">Davon hängen die Gewohnheiten für Frau und Kinder ab. Die Namen sind freiwillig.</p>
      <SwitchRow label="Ich habe eine Frau" line="Gewohnheiten wie „Mit meiner Frau beten“ erscheinen" checked={wife} onChange={toggleWife} />
      {wife && (
        <div className="field">
          <label htmlFor={wifeId}>Name deiner Frau</label>
          <input
            id={wifeId}
            type="text"
            autoComplete="off"
            value={house.wife.name}
            onChange={(e) => setHouse((h) => ({ ...h, wife: { ...h.wife, name: e.target.value } }), false)}
          />
        </div>
      )}
      <SwitchRow label="Ich habe Kinder" line="Gewohnheiten wie „Die Kinder segnen“ erscheinen" checked={kids} onChange={toggleKids} />
      {kids && (
        <>
          {children.map((c, i) => (
            <ChildFields
              key={c.id}
              index={i}
              several={shown > 1}
              child={c}
              autoFocus={focusIndex === i}
              onName={(name) => updateChild(i, (x) => ({ ...x, name }))}
              onSex={(sex) => updateChild(i, (x) => ({ ...x, sex }), true)}
            />
          ))}
          <button type="button" className="btn ob-add" onClick={addChild}>
            Weiteres Kind hinzufügen
          </button>
        </>
      )}
      <p className="ob-hint">
        Gebetsanliegen für deine Familie trägst du später unter „Mehr, Gebet, Gebetsübersicht“ ein. Hier brauchst du nur die
        Namen.
      </p>
    </>
  );
}

function ChildFields({
  index,
  several,
  child,
  autoFocus,
  onName,
  onSex,
}: {
  index: number;
  several: boolean;
  child: House['children'][number];
  autoFocus: boolean;
  onName: (name: string) => void;
  onSex: (sex: ChildSex) => void;
}) {
  const id = useId();
  const label = several ? `${index + 1}. Kind` : 'Name des Kindes';
  return (
    <div className="ob-child">
      <div className="field">
        <label htmlFor={id}>{label}</label>
        <input id={id} type="text" autoComplete="off" autoFocus={autoFocus} value={child.name} onChange={(e) => onName(e.target.value)} />
      </div>
      {child.name.trim() && (
        <>
          <Segmented<ChildSex | ''>
            grid
            label={`${child.name.trim()}: Sohn oder Tochter`}
            value={child.sex ?? ''}
            onChange={(sex) => sex && onSex(sex)}
            options={[
              { value: 'son', label: 'Sohn' },
              { value: 'daughter', label: 'Tochter' },
            ]}
          />
          {!child.sex && <p className="ob-hint">Bitte wählen. Davon hängt das Gebet an seinem Tag ab.</p>}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ 4 */

export function TimesStep() {
  const store = useStore();
  const profile = useProfile();
  return (
    <>
      <p className="ob-lead">Das sind Vorschläge, keine Vorgabe. Du kannst sie jederzeit ändern.</p>
      {profile.scheduleDays?.on ? (
        <p className="ob-hint">Für jeden Wochentag gelten eigene Zeiten. Du änderst sie unter „Mehr, Zeiten“.</p>
      ) : (
        <TimesGrid
          keys={['stillTime', 'vespers', 'compline']}
          times={profile.schedule}
          onChange={(k, v) => store.updateProfile((p) => ({ ...p, schedule: { ...p.schedule, [k]: v } }))}
        />
      )}
      <p className="ob-text">Die Zeit erinnert dich an die Stunde. Verpasst du sie, fragt dich die App nicht danach.</p>
    </>
  );
}

/* ------------------------------------------------------------ 5 */

const RHYTHM_TITLE: Record<Rhythm, string> = { daily: 'Täglich', weekly: 'Wöchentlich', monthly: 'Monatlich' };

export function HabitsStep() {
  const store = useStore();
  const profile = useProfile();
  const presets = profile.habits.filter((h) => h.preset && !h.desert);
  const waiting = presets.some((h) => !fitsHouse(h, profile.house));
  return (
    <>
      <p className="ob-lead">Vorlagen für den Hausvater. Schalte aus, was du nicht willst, und lege später eigene an.</p>
      {RHYTHM_ORDER.map((r) => {
        const list = habitsOfRhythm(presets, r).filter((h) => fitsHouse(h, profile.house));
        if (!list.length) return null;
        return (
          <section key={r} className="ob-group" aria-labelledby={`ob-habits-${r}`}>
            <h3 id={`ob-habits-${r}`}>{RHYTHM_TITLE[r]}</h3>
            {list.map((h) => (
              <SwitchRow
                key={h.id}
                label={h.name}
                line={h.auto ? 'aus dem Ablauf' : h.id === 'bibleReading' ? 'rückt den Leseplan weiter' : undefined}
                checked={h.active}
                onChange={(on) => store.updateProfile((p) => ({ ...p, habits: setHabitActive(p.habits, h.id, on) }), { immediate: true })}
              />
            ))}
          </section>
        );
      })}
      {waiting && (
        <p className="ob-hint">
          Weitere Gewohnheiten für Frau und Kinder erscheinen, sobald unter „Mein Haus“ ein Name steht.
        </p>
      )}
      <p className="ob-hint">
        Eigene Gewohnheiten legst du später unter „Mehr, Gewohnheiten“ an. Eine Gewohnheit gilt für einen Tag, eine Woche oder
        einen Monat. Es gibt keine Kette und keinen Zähler.
      </p>
    </>
  );
}

/* ------------------------------------------------------------ 6 */

const SCOPE_CARDS: readonly [Scope, string][] = [
  ['both', 'Altes und Neues Testament'],
  ['nt', 'Nur das Neue Testament'],
  ['at', 'Nur das Alte Testament'],
];

/** One Testament alone: where to begin (book and chapter) and how many chapters a day. */
function SingleTestament({ scope }: { scope: 'at' | 'nt' }) {
  const store = useStore();
  const toast = useToast();
  const profile = useProfile();
  const bookId = useId();
  const chapterId = useId();
  const amountId = useId();
  const plan = getPlan(profile.plan.planId);
  const track = plan.tracks[0]!;
  const place = singlePlace(profile) ?? { book: TESTAMENT_OFFSET[scope], chapter: 1 };
  const books = TESTAMENT_BOOKS[scope];
  const offset = TESTAMENT_OFFSET[scope];
  const book = track.def.books[place.book]!;
  const set = (b: number, chapter: number) => {
    store.setPlanPositions({ [track.def.id]: positionFor(track, b, chapter) });
    toast('Leseplan angepasst');
  };
  return (
    <>
      <div className="grid2">
        <div className="field">
          <label htmlFor={bookId}>Anfangen bei</label>
          <select id={bookId} value={place.book} onChange={(e) => set(Number(e.target.value), 1)}>
            {books.map((b, i) => (
              <option key={b.slug} value={offset + i}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={chapterId}>Kapitel</label>
          <select id={chapterId} value={place.chapter} onChange={(e) => set(place.book, Number(e.target.value))}>
            {Array.from({ length: book.chapters }, (_, i) => (
              <option key={i} value={i + 1}>
                Kapitel {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor={amountId}>Kapitel am Tag</label>
        <select
          id={amountId}
          value={singleChapters(profile)}
          onChange={(e) => {
            store.setPlan(ownPlanId([{ unit: 'chapters', value: Number(e.target.value) }]));
            toast('Leseplan angepasst');
          }}
        >
          {SINGLE_CHOICES.map((n) => (
            <option key={n} value={n}>
              {n === 1 ? '1 Kapitel' : `${n} Kapitel`}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

export function PlanStep() {
  const store = useStore();
  const toast = useToast();
  const profile = useProfile();
  const amounts = fixedAmounts(profile.plan.planId);
  const scope = scopeOf(profile);
  const choose = (to: Scope) => {
    if (!scope || to === scope) return;
    const { planId, starts } = changeScope(profile, scope, to);
    store.setPlan(planId, starts);
    toast('Leseplan angepasst');
  };
  return (
    <>
      <p className="ob-lead">Du liest auf Papier. Die App merkt sich nur, wo du stehst.</p>
      {scope ? (
        <>
          <p id="ob-scope" className="ob-label">
            Was liest du?
          </p>
          <div className="ob-choices" role="group" aria-labelledby="ob-scope">
            {SCOPE_CARDS.map(([value, label]) => (
              <button key={value} type="button" className="ob-choice ob-choice-short" aria-pressed={scope === value} onClick={() => choose(value)}>
                <b>{label}</b>
              </button>
            ))}
          </div>
          {scope === 'both' && amounts ? <FixedPlan amounts={amounts} /> : <SingleTestament scope={scope as 'at' | 'nt'} />}
        </>
      ) : (
        <p className="ob-hint">Du liest nach einem eigenen Plan. Den änderst du unter „Wort“.</p>
      )}
      <p className="ob-hint">
        Der Plan läuft nach Fortschritt, nicht nach Datum. Wer drei Tage aussetzt, liest beim nächsten Abschnitt weiter.
        Einen eigenen Plan stellst du später unter „Wort“ ein.
      </p>
    </>
  );
}

/* ------------------------------------------------------------ 7 */

export function PrivacyStep() {
  return (
    <>
      <ul className="ob-facts">
        <li>
          <b>Alles bleibt bei dir.</b>
          <span>Einträge liegen nur auf diesem Gerät. Du kannst sie jederzeit exportieren oder löschen.</span>
        </li>
        <li>
          <b>Wird gebetet, nicht notiert.</b>
          <span>Für Schuld gibt es kein Eingabefeld. Sie wird vor Gott ausgesprochen.</span>
        </li>
      </ul>
      <PrayerText text={ABSOLUTION_EVENING} className="absolution" />
    </>
  );
}

/* ------------------------------------------------------------ 8 */

function Fact({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div>
      <dt>{name}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** A quiet list of what is set now. No rating, no count of steps. */
export function DoneStep() {
  const profile = useProfile();
  const house = profile.house;
  const names = [wifeOf(house)?.name.trim(), ...childrenOf(house).map((c) => c.name.trim())].filter((n): n is string => !!n);
  const on = profile.habits.filter((h) => h.preset && !h.desert && h.active && fitsHouse(h, house));
  const plan = getPlan(profile.plan.planId);
  const reading = plan.tracks.map((t) => portionLabel(t, t.portions[profile.plan.positions[t.def.id] ?? 0] ?? t.portions[0]!));
  const s = profile.schedule;
  return (
    <>
      <dl className="ob-sum">
        <Fact name="Weg">Alltag</Fact>
        <Fact name="Haus">{names.length ? joinNames(names) : 'noch leer'}</Fact>
        <Fact name="Zeiten">
          {profile.scheduleDays?.on ? 'je Wochentag' : `Stille Zeit ${s.stillTime} · Vesper ${s.vespers} · Nachtgebet ${s.compline}`}
        </Fact>
        <Fact name="Gewohnheiten">{on.length ? on.map((h) => h.name).join(', ') : 'keine eingeschaltet'}</Fact>
        <Fact name="Nächste Lesung">{reading.join(' · ')}</Fact>
      </dl>
      <p className="ob-hint">Alles lässt sich unter „Mehr“ ändern. Diese Anleitung bleibt unter „Mehr, Anleitung“.</p>
    </>
  );
}

/* ------------------------------------------------------------ the way "Wüstenwanderung" */

type SetDraft = (patch: Partial<DesertDraft>) => void;

export function DesertStartStep({ draft, set }: { draft: DesertDraft; set: SetDraft }) {
  const store = useStore();
  const profile = useProfile();
  const id = useId();
  const today = store.today();
  const days = draftDays(draft);
  const start = draftStart(draft, today);
  const running = activeRun(profile.winterArc);
  const seg = (label: string, value: string, options: [string, string][], onChange: (v: string) => void) => (
    <Segmented<string> grid label={label} value={value} onChange={onChange} options={options.map(([v, l]) => ({ value: v, label: l }))} />
  );
  return (
    <>
      <blockquote className="ob-verse">
        <p>„… übe dich selbst aber in der Gottseligkeit.“</p>
        <cite>
          <BibleRef reference="1. Timotheus 4,7" />
        </cite>
      </blockquote>
      <fieldset className="ob-fieldset">
        <legend>Wie lange?</legend>
        {seg(
          'Wie lange?',
          draft.length,
          [...QUICK_DESERT_DAYS.map((n): [string, string] => [String(n), `${n} Tage`]), ['own', 'Eigene Dauer']],
          (length) => set({ length }),
        )}
        {draft.length === 'own' && (
          <div className="field">
            <label htmlFor={`${id}-days`}>Dauer in Kalendertagen</label>
            <input
              id={`${id}-days`}
              type="number"
              inputMode="numeric"
              min={MIN_DURATION}
              max={MAX_DURATION}
              step={1}
              value={draft.ownDays}
              onChange={(e) => set({ ownDays: e.target.value })}
            />
            {!days && <p className="ob-hint">Wähle eine Dauer von {MIN_DURATION} bis {MAX_DURATION} Tagen.</p>}
          </div>
        )}
      </fieldset>
      <fieldset className="ob-fieldset">
        <legend>Wann beginnst du?</legend>
        {seg(
          'Wann beginnst du?',
          draft.when,
          [
            ['today', 'Heute'],
            ['tomorrow', 'Morgen'],
            ['other', 'Anderer Tag'],
          ],
          (when) => set({ when: when as DesertDraft['when'] }),
        )}
        {draft.when === 'other' && (
          <div className="field">
            <label htmlFor={`${id}-start`}>Startdatum</label>
            <input id={`${id}-start`} type="date" value={draft.other} onChange={(e) => set({ other: e.target.value })} />
            {!start && <p className="ob-hint">Wähle ein Startdatum.</p>}
          </div>
        )}
      </fieldset>
      {days && start && isValidDuration(days) && (
        <p className="ob-text">
          Von {formatFullDate(start)} bis {formatFullDate(endDateOf(start, days))}.
        </p>
      )}
      {running && (
        <p className="ob-hint">
          Es läuft schon eine Wüstenzeit. Beginnst du eine neue, wird die laufende beendet. Haken und Rückblicke bleiben
          gespeichert.
        </p>
      )}
      <p className="ob-hint">Die Wüstenzeit beginnt erst mit dem letzten Schritt dieser Einrichtung.</p>
    </>
  );
}

export function DesertHabitsStep({ draft, set }: { draft: DesertDraft; set: SetDraft }) {
  const profile = useProfile();
  const chosen = new Set(draft.habits);
  const toggle = (id: string, on: boolean) => set({ habits: on ? [...chosen, id] : draft.habits.filter((x) => x !== id) });
  const waits = (o: DesertHabit) => {
    const need: HouseNeed | undefined = o.needs ?? HABIT_NEEDS[o.id];
    return need && !houseHas(profile.house, need) ? NEED_NOTE[need] : undefined;
  };
  // A habit that stands in several packages is listed once, in the first.
  const seen = new Set<string>();
  const fresh = (list: readonly DesertHabit[]) => list.filter((o) => !seen.has(o.id) && !!seen.add(o.id));
  const groups = [
    ...DESERT_PACKS.map((p) => ({ id: p.id, title: p.name, line: p.tagline, list: fresh(p.habits) })),
    { id: 'more', title: 'Weitere Vorschläge', line: '', list: fresh(DESERT_MORE) },
  ].filter((g) => g.list.length);
  const own = profile.habits.filter((h) => h.desert === 'own');
  return (
    <>
      <p className="ob-lead">Diese Gewohnheiten gelten nur für die Wüstenzeit. Danach kannst du sie in den Alltag mitnehmen.</p>
      {groups.map((g) => {
        const n = g.list.filter((o) => chosen.has(o.id)).length;
        return (
          // Open at first only where something is already chosen; after that the person's own folding stays.
          <details
            key={g.id}
            className="ob-fold"
            ref={(el) => {
              if (el && !el.dataset.init) {
                el.dataset.init = '1';
                el.open = n > 0;
              }
            }}
          >
            <summary>
              <span>{g.title}</span>
              <span className="ob-fold-count">{n > 0 ? `${n} gewählt` : ''}</span>
            </summary>
            {g.line && <p className="ob-hint">{g.line}</p>}
            {g.list.map((o) => (
              <SwitchRow key={o.id} label={o.name} line={waits(o)} checked={chosen.has(o.id)} onChange={(on) => toggle(o.id, on)} />
            ))}
          </details>
        );
      })}
      {own.length > 0 && (
        <section className="ob-group" aria-labelledby="ob-dh-own">
          <h3 id="ob-dh-own">Eigene</h3>
          {own.map((h) => (
            <SwitchRow key={h.id} label={h.name} checked={chosen.has(h.id)} onChange={(on) => toggle(h.id, on)} />
          ))}
        </section>
      )}
      <p className="ob-hint">Eigene Gewohnheiten legst du später in der Arena an.</p>
    </>
  );
}

export function DesertDoneStep({ draft }: { draft: DesertDraft }) {
  const store = useStore();
  const profile = useProfile();
  const days = draftDays(draft);
  const start = draftStart(draft, store.today());
  const names = draft.habits.map((id) => DESERT_NAMES.get(id) ?? profile.habits.find((h) => h.id === id)?.name).filter((n): n is string => !!n);
  const s = profile.schedule;
  return (
    <>
      <dl className="ob-sum">
        <Fact name="Weg">Wüstenwanderung</Fact>
        <Fact name="Dauer und Beginn">
          {days && start ? `${days} Tage, von ${formatFullDate(start)} bis ${formatFullDate(endDateOf(start, days))}` : 'noch offen'}
        </Fact>
        <Fact name="Gewohnheiten">{names.length ? names.join(', ') : 'keine gewählt'}</Fact>
        <Fact name="Zeiten">
          {profile.scheduleDays?.on ? 'je Wochentag' : `Stille Zeit ${s.stillTime} · Vesper ${s.vespers} · Nachtgebet ${s.compline}`}
        </Fact>
      </dl>
      <p className="ob-hint">Mit „Zur Wüstenwanderung“ beginnt die Wüstenzeit. Alles lässt sich später ändern.</p>
    </>
  );
}

const DESERT_NAMES = new Map<string, string>([...DESERT_PACKS.flatMap((p) => p.habits), ...DESERT_MORE].map((o) => [o.id, o.name]));
