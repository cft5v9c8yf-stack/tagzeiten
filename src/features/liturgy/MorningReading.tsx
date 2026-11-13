import { useEffect, useId, useState } from 'react';
import { FIELDS } from '../../content/fields';
import {
  COLOR_CODE,
  DOUBLE_QUESTION_NOTE,
  HARD_PASSAGES_NOTE,
  MARGIN_MARKS,
  METHOD_CREDIT,
  READING_PASSES,
  READING_RUBRICS,
  SALVATION_HISTORY_NOTE,
} from '../../content/method';
import type { FieldPath, Part } from '../../content/orders';
import { SEVEN_QUESTIONS } from '../../content/questions';
import { useDay, useProfile, useStore, useStoreVersion } from '../../data/hooks';
import type { DateKey } from '../../domain/dates';
import type { Day } from '../../domain/model';
import { isNotebookLink } from '../../domain/profile';
import { getPlan, portionLabel } from '../../domain/readingPlan';
import { Segmented } from '../../ui/Choice';
import { DayField } from '../../ui/DayField';
import { Rubric } from '../../ui/PrayerText';
import { RefLabel } from '../../ui/RefLabel';
import type { PartContext } from './OrderPart';

/** Today's portions with links. Shared with the Today page. */
export function ReadingRefs({ date, large = true }: { date: DateKey; large?: boolean }) {
  const store = useStore();
  useStoreVersion();
  const { reading } = store.readingFor(date);
  const plan = getPlan(reading.planId);
  return (
    <div className={`reading-refs${large ? ' large' : ''}`}>
      {plan.tracks.map((t) => {
        const i = reading.portions[t.def.id];
        const p = i === undefined ? undefined : t.portions[i];
        // Old and New Testament side by side; read in the printed Bible.
        return p ? (
          <div key={t.def.id} className="ref">
            <span className="track">{t.def.label}</span>
            <span className="ref-text">
              <RefLabel text={portionLabel(t, p)} />
            </span>
          </div>
        ) : (
          <div key={t.def.id} className="ref">
            <span className="track">{t.def.label}</span>
            <span className="ref-text">—</span>
          </div>
        );
      })}
    </div>
  );
}

function QuestionSelect({ date }: { date: DateKey }) {
  const store = useStore();
  const day = useDay(date);
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{FIELDS['morning.questionNo']?.label}</label>
      <select
        id={id}
        value={day.morning.questionNo ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          store.updateDay(date, (d) => {
            const morning = { ...d.morning };
            if (v === '') delete morning.questionNo;
            else morning.questionNo = Number(v);
            return { ...d, morning };
          }, { immediate: true });
        }}
      >
        <option value="">— eine wählen, je nach Text —</option>
        {SEVEN_QUESTIONS.map((q, i) => (
          <option key={i} value={i}>
            {i + 1}. {q}
          </option>
        ))}
      </select>
    </div>
  );
}

function MethodHelp() {
  return (
    <details className="fold">
      <summary>Dreimal lesen, Farbcode, Randzeichen</summary>
      <MethodHelpBody />
    </details>
  );
}

/** Hanniel Strebel's way of reading, in our own words, with credit (rule 14). */
export function MethodHelpBody() {
  return (
    <>
      <ol className="plain-list">
        {READING_PASSES.map(([t, d]) => (
          <li key={t}>
            <b>{t}:</b> {d}
          </li>
        ))}
      </ol>
      <table className="color-code">
        <tbody>
          {COLOR_CODE.map((c) => (
            <tr key={c.color}>
              <th scope="row">
                <span className="pencil" style={{ background: c.hex }} aria-hidden="true" />
                {c.color}
              </th>
              <td>{c.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="marks-list">
        {MARGIN_MARKS.map((m) => (
          <li key={m.mark}>
            <b className="mark-sign">{m.mark}</b> {m.meaning}
          </li>
        ))}
      </ul>
      <p className="small">{HARD_PASSAGES_NOTE}</p>
      <p className="small muted">{METHOD_CREDIT}</p>
    </>
  );
}

/**
 * In view: the verse and the double question, as in the short form. The rest
 * of the full form (main point, question of the day, the history of salvation,
 * the marks of the margin, already made on paper) stands folded, open as soon
 * as something is written in it (0.40).
 */
const IN_VIEW: ReadonlySet<FieldPath> = new Set(['morning.verseRef', 'morning.verse', 'morning.aboutGod', 'morning.aboutMan']);

/** Whether something is written in a field of the morning (the question of the day: chosen). */
function written(day: Day, f: FieldPath): boolean {
  if (f === 'morning.questionNo') return day.morning.questionNo !== undefined;
  const key = f.slice('morning.'.length) as keyof Day['morning'];
  const v = day.morning[key];
  return typeof v === 'string' && v.trim() !== '';
}

export function MorningReading({ part, ctx }: { part: Part; ctx: PartContext }) {
  const store = useStore();
  const day = useDay(ctx.date);
  const profile = useProfile();
  const full = ctx.form === 'full';

  // Today receives its portion when the reading is first shown.
  useEffect(() => {
    if (ctx.date === store.today()) store.ensureTodayReading();
  }, [store, ctx.date]);

  const fields = part.fields ?? [];
  const folded = fields.filter((f) => !IN_VIEW.has(f));
  // Open from the start where something is written; then it is the user's to fold.
  const [openAtStart] = useState(() => folded.some((f) => written(day, f)));
  const field = (f: FieldPath) => {
    if (f === 'morning.questionNo') return <QuestionSelect key={f} date={ctx.date} />;
    const extra =
      f === 'morning.aboutGod' ? (
        <p key={`${f}-note`} className="small muted">
          {DOUBLE_QUESTION_NOTE}
        </p>
      ) : f === 'morning.salvationHistory' ? (
        <p key={`${f}-note`} className="small muted">
          {SALVATION_HISTORY_NOTE}
        </p>
      ) : null;
    return (
      <div key={f}>
        {extra}
        <DayField date={ctx.date} path={f} />
      </div>
    );
  };

  // Paper or app: the choice of this day, else the last one; a day with more than the verse written stands in the app.
  const onPaper = day.morning.paper ?? (fields.some((f) => !ON_PAPER_DAY.has(f) && written(day, f)) ? false : profile.readingOnPaper);
  const choose = (where: 'paper' | 'app') => {
    const paper = where === 'paper';
    store.updateDay(ctx.date, (d) => ({ ...d, morning: { ...d.morning, paper } }), { immediate: true });
    store.updateProfile((p) => ({ ...p, readingOnPaper: paper }), { immediate: true });
  };

  return (
    <>
      <ReadingRefs date={ctx.date} />
      <Rubric>{full ? READING_RUBRICS.threeTimes : 'Einmal durchlesen, einen Vers auswählen, dann die Doppelfrage.'}</Rubric>
      <p className="small muted">{READING_RUBRICS.paper}</p>
      {full && <p className="small muted">{READING_RUBRICS.restart}</p>}
      {full && <MethodHelp />}
      <Segmented label="Wo du deine Gedanken aufschreibst" options={WHERE} value={onPaper ? 'paper' : 'app'} onChange={choose} />
      {onPaper ? (
        <>
          <p className="small muted">{READING_RUBRICS.paperDay}</p>
          {profile.notebookLink && (
            <p>
              <a className="btn" href={profile.notebookLink}>
                Notizbuch öffnen
              </a>
            </p>
          )}
          {fields.filter((f) => ON_PAPER_DAY.has(f)).map(field)}
          <NotebookLinkField />
        </>
      ) : (
        <>
          {fields.filter((f) => IN_VIEW.has(f)).map(field)}
          {folded.length > 0 && (
            <details className="fold" open={openAtStart || undefined}>
              <summary>Mehr notieren</summary>
              {folded.map(field)}
            </details>
          )}
        </>
      )}
    </>
  );
}

/** A shortcut named "Notizbuch" that opens the notebook in GoodNotes: GoodNotes itself offers no link to a notebook. */
const SHORTCUT_LINK = 'shortcuts://run-shortcut?name=Notizbuch';

/** One's own link for "Notizbuch öffnen"; kept when it is a link the button may follow (1.41). */
function NotebookLinkField() {
  const store = useStore();
  const profile = useProfile();
  const id = useId();
  const [draft, setDraft] = useState(profile.notebookLink);
  const ok = draft.trim() === '' || isNotebookLink(draft);
  const save = (v: string) => store.updateProfile((p) => ({ ...p, notebookLink: v.trim() }), { immediate: true });
  // Open while no link is kept: then the way to one is the first thing to read.
  const [openAtStart] = useState(() => !profile.notebookLink);
  return (
    <details className="fold" open={openAtStart || undefined}>
      <summary>Link zum Notizbuch</summary>
      <p className="small muted">{READING_RUBRICS.notebookLink}</p>
      {draft.trim() !== SHORTCUT_LINK && (
        <p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setDraft(SHORTCUT_LINK);
              save(SHORTCUT_LINK);
            }}
          >
            Kurzbefehl „Notizbuch“ eintragen
          </button>
        </p>
      )}
      <div className="field">
        <label htmlFor={id}>Eigener Link</label>
        <input
          id={id}
          type="url"
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          placeholder={SHORTCUT_LINK}
          value={draft}
          aria-invalid={!ok || undefined}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (ok) save(draft);
          }}
        />
        {!ok && <p className="small muted">Erlaubt sind Links mit goodnotes://, shortcuts:// oder https://.</p>}
      </div>
    </details>
  );
}

const WHERE = [
  { value: 'paper', label: 'Im Notizbuch' },
  { value: 'app', label: 'In der App' },
] as const;

/** On a notebook day only the verse stays in view: it also stands in the archive and the Wüstenzeit (1.41). */
const ON_PAPER_DAY: ReadonlySet<FieldPath> = new Set(['morning.verseRef', 'morning.verse']);
