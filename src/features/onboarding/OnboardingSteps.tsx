import { useId, useState, type ReactNode } from 'react';
import { DESERT_MORE, DESERT_PACKS, type DesertHabit } from '../../content/desert';
import { HABIT_NEEDS } from '../../content/habits';
import { QUICK_DESERT_DAYS } from '../../domain/desert';
import { isDateKey } from '../../domain/dates';
import { endDateOf, isValidDuration, MAX_DURATION, MIN_DURATION, activeRun } from '../../domain/winterArc';
import { houseHas, NEED_NOTE, type HouseNeed } from '../../domain/house';
import { formatFullDate } from '../desert/DesertSettings';
import { draftDays, draftStart, type DesertDraft } from './desertDraft';
import { ABSOLUTION_EVENING } from '../../content/liturgy';
import { BibleRef } from '../../ui/BibleRef';
import { FlowIcon, type FlowIconName } from '../../ui/FlowIcon';
import { PrayerText } from '../../ui/PrayerText';
import { Segmented } from '../../ui/Choice';
import { fixedAmounts, getPlan, ownPlanId, paulPlanId, portionLabel, positionFor, sectionKind } from '../../domain/readingPlan';
import { PAUL_DAYS, SECTION_PLANS, START_PLAN_ID } from '../../content/readingPlans';
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
import { fitsHouse, habitsOfRhythm, RHYTHM_ORDER, setHabitActive, shownHabit } from '../../domain/habits';
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
import { FixedPlan, SectionPlan } from '../settings/PlanSettings';
import { HouseDateField } from '../settings/HouseSettings';
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

/** A choice among a few: a card with a sign, a name, a line, and the mark of the chosen one. */
function ChoiceCard({
  icon,
  title,
  line,
  pressed,
  onClick,
}: {
  icon?: FlowIconName;
  title: string;
  line?: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={icon ? 'ob-choice' : 'ob-choice ob-pick'} aria-pressed={pressed} onClick={onClick}>
      {icon && <FlowIcon name={icon} size={24} />}
      <span className="ob-choice-text">
        <b>{title}</b>
        {line && <span>{line}</span>}
      </span>
      <span className="ob-choice-mark" aria-hidden="true" />
    </button>
  );
}

/* ------------------------------------------------------------ 1 */

export function OrderStep() {
  return (
    <>
      <p className="ob-tagline">Mit Gott durch den Tag.</p>
      <blockquote className="ob-verse">
        <p>
          „Trachtet am ersten nach dem Reich Gottes und nach seiner Gerechtigkeit, so wird euch solches alles zufallen.“
        </p>
        <cite>
          <BibleRef reference="Matthäus 6,33" />
        </cite>
      </blockquote>
      <section className="ob-day" aria-labelledby="ob-day-title">
        <h3 id="ob-day-title">So beginnt dein Tag</h3>
        <ol className="ob-order">
          <li>
            <b>Wort</b>
            <span>Du liest, bevor du planst.</span>
          </li>
          <li>
            <b>Gebet</b>
            <span>Du betest, was du gelesen hast.</span>
          </li>
          <li>
            <b>Ausrichtung</b>
            <span>Du legst den Tag vor Gott hin.</span>
          </li>
        </ol>
      </section>
    </>
  );
}

/** What the setup asks for, shown on its first page above the button. Not buttons: a look ahead. */
const AHEAD: readonly { icon: FlowIconName; label: string }[] = [
  { icon: 'compass', label: 'Dein Weg' },
  { icon: 'foldedHands', label: 'Gebet' },
  { icon: 'house', label: 'Haus' },
  { icon: 'clock', label: 'Zeiten' },
  { icon: 'habits', label: 'Gewohnheiten' },
  { icon: 'bible', label: 'Leseplan' },
];

export function AheadList() {
  return (
    <>
      <h3 className="ob-ahead-title">Das richtest du gleich ein</h3>
      <ul className="ob-ahead">
        {AHEAD.map((a) => (
          <li key={a.label}>
            <FlowIcon name={a.icon} size={22} />
            <span>{a.label}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ------------------------------------------------------------ 2 */

export function WayStep({ way, onChoose }: { way: Way | null; onChoose: (w: Way) => void }) {
  return (
    <>
      <div className="ob-choices" role="group" aria-label="Wofür nutzt du Henoch?">
        <ChoiceCard
          icon="sunrise"
          title="Alltag"
          line="Stille Zeit, Bibellese, Vesper und Nachtgebet, dazu dein Haus. Der tägliche Rhythmus."
          pressed={way === 'everyday'}
          onClick={() => onChoose('everyday')}
        />
        <ChoiceCard
          icon="drop"
          title="Wüstenwanderung"
          line="Eine begrenzte Zeit: weniger Ablenkung, mehr Raum für Gottes Wort."
          pressed={way === 'desert'}
          onClick={() => onChoose('desert')}
        />
      </div>
      <p className="ob-hint">Die andere Möglichkeit bleibt in der App erhalten.</p>
    </>
  );
}

/* ------------------------------------------------------------ 2a */

/**
 * How the Stille Zeit and the Vesper are prayed: the order of the church, or
 * the free prayer ("Freies Gebet"), one sheet at a glance. Writes into the profile at once;
 * under Mehr it can be set for morning and evening each.
 */
export function PrayerWayStep() {
  const store = useStore();
  const petition = useProfile().petition;
  const chosen = petition.morning || petition.evening ? 'petition' : 'order';
  const choose = (c: 'order' | 'petition') =>
    store.updateProfile((p) => ({ ...p, petition: { morning: c === 'petition', evening: c === 'petition' } }), { immediate: true });
  return (
    <>
      <div className="ob-choices" role="group" aria-label="Wie betest du?">
        <ChoiceCard
          icon="scroll"
          title="Gebetsordnung"
          line="Stille Zeit und Vesper in der Ordnung der Kirche, Schritt für Schritt. Mit Kurzform für knappe Tage."
          pressed={chosen === 'order'}
          onClick={() => choose('order')}
        />
        <ChoiceCard
          icon="foldedHands"
          title="Freies Gebet"
          line="Morgen- und Abendgebet auf einem Blatt: das Wort, dein Haus, deine Anliegen, Dank und Segen. Ohne Uhr."
          pressed={chosen === 'petition'}
          onClick={() => choose('petition')}
        />
      </div>
      <p className="ob-hint">
        Beides gilt gleich. Unter Mehr → Tag und Woche → „Art des Gebets“ änderst du es jederzeit, auch für Morgen und
        Abend getrennt.
      </p>
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
      <div className="ob-list">
        <SwitchRow label="Ich habe eine Frau" checked={wife} onChange={toggleWife} />
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
        {wife && (
          <div className="grid2 ob-days">
            <HouseDateField
              label="Ihr Geburtstag"
              value={house.wife.birthday}
              onChange={(birthday) => setHouse((h) => ({ ...h, wife: { ...h.wife, birthday } }))}
            />
            <HouseDateField label="Hochzeitstag" value={house.wedding} onChange={(wedding) => setHouse((h) => ({ ...h, wedding }))} />
          </div>
        )}
      </div>
      <div className="ob-list">
        <SwitchRow label="Ich habe Kinder" checked={kids} onChange={toggleKids} />
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
                onBirthday={(birthday) => updateChild(i, (x) => ({ ...x, birthday }), true)}
              />
            ))}
            <button type="button" className="ob-add" onClick={addChild}>
              <FlowIcon name="plus" size={18} />
              Weiteres Kind hinzufügen
            </button>
          </>
        )}
      </div>
      <p className="ob-hint">
        Davon hängen die Gewohnheiten für Frau und Kinder ab. Namen und Tage sind freiwillig; an einem Geburtstag oder
        eurem Hochzeitstag steht es auf „Heute“. Gebetsanliegen trägst du später unter „Mehr, Gebet, Gebetsübersicht“ ein.
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
  onBirthday,
}: {
  index: number;
  several: boolean;
  child: House['children'][number];
  autoFocus: boolean;
  onName: (name: string) => void;
  onSex: (sex: ChildSex) => void;
  onBirthday: (day: string | undefined) => void;
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
          <HouseDateField label={`Geburtstag von ${child.name.trim()}`} value={child.birthday} onChange={onBirthday} />
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
      {profile.scheduleDays?.on ? (
        <p className="ob-hint">Für jeden Wochentag gelten eigene Zeiten. Du änderst sie unter „Mehr, Zeiten“.</p>
      ) : (
        <div className="ob-list ob-times">
          <TimesGrid
            keys={['stillTime', 'vespers', 'compline']}
            times={profile.schedule}
            onChange={(k, v) => store.updateProfile((p) => ({ ...p, schedule: { ...p.schedule, [k]: v } }))}
          />
        </div>
      )}
      <p className="ob-hint">Die Zeit erinnert dich an die Stunde. Verpasst du sie, fragt dich die App nicht danach.</p>
    </>
  );
}

/* ------------------------------------------------------------ 5 */

const RHYTHM_TITLE: Record<Rhythm, string> = { daily: 'Täglich', weekly: 'Wöchentlich', monthly: 'Monatlich' };

export function HabitsStep() {
  const store = useStore();
  const profile = useProfile();
  const presets = profile.habits.filter((h) => h.preset && !h.desert && shownHabit(h, profile.well.on));
  const waiting = presets.some((h) => !fitsHouse(h, profile.house));
  return (
    <>
      {RHYTHM_ORDER.map((r) => {
        const list = habitsOfRhythm(presets, r).filter((h) => fitsHouse(h, profile.house));
        if (!list.length) return null;
        return (
          <section key={r} className="ob-group" aria-labelledby={`ob-habits-${r}`}>
            <h3 id={`ob-habits-${r}`}>{RHYTHM_TITLE[r]}</h3>
            <div className="ob-list">
              {list.map((h) => (
                <SwitchRow
                  key={h.id}
                  label={h.name}
                  line={h.auto ? 'aus dem Ablauf' : h.id === 'bibleReading' ? 'rückt den Leseplan weiter' : undefined}
                  checked={h.active}
                  onChange={(on) => store.updateProfile((p) => ({ ...p, habits: setHabitActive(p.habits, h.id, on) }), { immediate: true })}
                />
              ))}
            </div>
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

/** What the setup offers to read: both Testaments, one alone, or a plan by sections. */
type PlanChoice = Scope | 'beginner' | 'paul' | 'year';

const PLAN_CARDS: readonly [PlanChoice, string, string][] = [
  ['both', 'Altes und Neues Testament', 'Aus beiden jeden Tag ein Abschnitt.'],
  ['nt', 'Nur das Neue Testament', 'Fortlaufend, Kapitel für Kapitel.'],
  ['at', 'Nur das Alte Testament', 'Fortlaufend, Kapitel für Kapitel.'],
  ['beginner', SECTION_PLANS.beginner.name, 'Für den Anfang: 59 Kapitel, eines am Tag.'],
  ['paul', SECTION_PLANS.paul.name, 'Apostelgeschichte und Paulusbriefe in 40 oder 60 Tagen.'],
  ['year', SECTION_PLANS.year.name, 'Die ganze Bibel in 365 Abschnitten.'],
];

const SECTION_START = { beginner: 'einsteiger', paul: paulPlanId(PAUL_DAYS[0]), year: 'jahr' } as const;

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
  const section = sectionKind(profile.plan.planId);
  const chosen: PlanChoice | undefined = section && section !== 'desert' ? section : scope;
  const choose = (to: PlanChoice) => {
    if (!chosen || to === chosen) return;
    if (to === 'beginner' || to === 'paul' || to === 'year') store.setPlan(SECTION_START[to]);
    else if (scope) {
      const { planId, starts } = changeScope(profile, scope, to);
      store.setPlan(planId, starts);
    } else if (to === 'both') store.setPlan(profile.plan.fixed ?? START_PLAN_ID);
    else {
      // From a plan by sections to one Testament: its place in the plan of both is found again.
      const { planId, starts } = changeScope(profile, to === 'nt' ? 'at' : 'nt', to);
      store.setPlan(planId, starts);
    }
    toast('Leseplan angepasst');
  };
  return (
    <>
      {chosen ? (
        <>
          <div className="ob-list" role="group" aria-label="Leseplan">
            {PLAN_CARDS.map(([value, label, line]) => (
              <ChoiceCard key={value} title={label} line={line} pressed={chosen === value} onClick={() => choose(value)} />
            ))}
          </div>
          <details className="ob-fold">
            <summary>
              <span>Beginn und Menge anpassen</span>
            </summary>
            <div className="ob-fold-body">
              {chosen === 'both' && amounts ? (
                <FixedPlan amounts={amounts} />
              ) : chosen === 'nt' || chosen === 'at' ? (
                <SingleTestament scope={chosen} />
              ) : section ? (
                <SectionPlan key={profile.plan.planId} kind={section} />
              ) : null}
            </div>
          </details>
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
      <ul className="ob-list ob-facts">
        <li>
          <FlowIcon name="phone" size={22} />
          <div>
            <b>Alles bleibt bei dir.</b>
            <span>Einträge liegen nur auf diesem Gerät. Du kannst sie jederzeit exportieren oder löschen.</span>
          </div>
        </li>
        <li>
          <FlowIcon name="foldedHands" size={22} />
          <div>
            <b>Wird gebetet, nicht notiert.</b>
            <span>Für Schuld gibt es kein Eingabefeld. Sie wird vor Gott ausgesprochen.</span>
          </div>
        </li>
      </ul>
      <PrayerText text={ABSOLUTION_EVENING} className="absolution" />
    </>
  );
}

/* ------------------------------------------------------------ 8 */

function Fact({ icon, name, children }: { icon: FlowIconName; name: string; children: ReactNode }) {
  return (
    <div>
      <FlowIcon name={icon} size={22} />
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
  const on = profile.habits.filter((h) => h.preset && !h.desert && h.active && fitsHouse(h, house) && shownHabit(h, profile.well.on));
  const plan = getPlan(profile.plan.planId);
  const reading = plan.tracks.map((t) => portionLabel(t, t.portions[profile.plan.positions[t.def.id] ?? 0] ?? t.portions[0]!));
  const s = profile.schedule;
  return (
    <>
      <dl className="ob-list ob-sum">
        <Fact icon="compass" name="Weg">
          Alltag
        </Fact>
        <Fact icon="foldedHands" name="Gebet">
          {profile.petition.morning && profile.petition.evening
            ? 'Freies Gebet'
            : profile.petition.morning || profile.petition.evening
              ? 'Gebetsordnung und freies Gebet'
              : 'Gebetsordnung'}
        </Fact>
        <Fact icon="house" name="Haus">{names.length ? joinNames(names) : 'noch leer'}</Fact>
        <Fact icon="clock" name="Zeiten">
          {profile.scheduleDays?.on ? 'je Wochentag' : `Stille Zeit ${s.stillTime} · Vesper ${s.vespers} · Nachtgebet ${s.compline}`}
        </Fact>
        <Fact icon="habits" name="Gewohnheiten">{on.length ? on.map((h) => h.name).join(', ') : 'keine eingeschaltet'}</Fact>
        <Fact icon="bible" name="Nächste Lesung">{reading.join(' · ')}</Fact>
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
            <input id={`${id}-start`} type="date" min={today} value={draft.other} onChange={(e) => set({ other: e.target.value })} />
            {!start && (
              <p className="ob-hint">{isDateKey(draft.other) && draft.other < today ? 'Der Tag liegt in der Vergangenheit. Wähle heute oder einen späteren Tag.' : 'Wähle ein Startdatum.'}</p>
            )}
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
              <span className="ob-fold-name">
                <b>{g.title}</b>
                {g.line && <span>{g.line}</span>}
              </span>
              <span className="ob-fold-count">{n > 0 ? `${n} gewählt` : ''}</span>
            </summary>
            {g.list.map((o) => (
              <SwitchRow key={o.id} label={o.name} line={waits(o)} checked={chosen.has(o.id)} onChange={(on) => toggle(o.id, on)} />
            ))}
          </details>
        );
      })}
      {own.length > 0 && (
        <section className="ob-group" aria-labelledby="ob-dh-own">
          <h3 id="ob-dh-own">Eigene</h3>
          <div className="ob-list">
            {own.map((h) => (
              <SwitchRow key={h.id} label={h.name} checked={chosen.has(h.id)} onChange={(on) => toggle(h.id, on)} />
            ))}
          </div>
        </section>
      )}
      <p className="ob-hint">
        Sie gelten nur für die Wüstenzeit; danach kannst du sie in den Alltag mitnehmen. Eigene Gewohnheiten legst du später in der Arena an.
      </p>
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
      <dl className="ob-list ob-sum">
        <Fact icon="compass" name="Weg">
          Wüstenwanderung
        </Fact>
        <Fact icon="sunrise" name="Dauer und Beginn">
          {days && start ? `${days} Tage, von ${formatFullDate(start)} bis ${formatFullDate(endDateOf(start, days))}` : 'noch offen'}
        </Fact>
        <Fact icon="habits" name="Gewohnheiten">{names.length ? names.join(', ') : 'keine gewählt'}</Fact>
        <Fact icon="clock" name="Zeiten">
          {profile.scheduleDays?.on ? 'je Wochentag' : `Stille Zeit ${s.stillTime} · Vesper ${s.vespers} · Nachtgebet ${s.compline}`}
        </Fact>
      </dl>
      <p className="ob-hint">Mit „Zur Wüstenwanderung“ beginnt die Wüstenzeit. Alles lässt sich später ändern.</p>
    </>
  );
}

const DESERT_NAMES = new Map<string, string>([...DESERT_PACKS.flatMap((p) => p.habits), ...DESERT_MORE].map((o) => [o.id, o.name]));
