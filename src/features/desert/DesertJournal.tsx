import { useId, useState } from 'react';
import { FIELDS } from '../../content/fields';
import { useAllDays, useDay, useDayLookup, useStore } from '../../data/hooks';
import { addDays, formatLong, type DateKey } from '../../domain/dates';
import { inkToSvg } from '../../domain/ink';
import type { Day } from '../../domain/model';
import { setAt } from '../../domain/paths';
import { endDateOf, type WinterArcRun } from '../../domain/winterArc';
import { Segmented } from '../../ui/Choice';
import { GrowingTextarea } from '../../ui/DayField';
import { InkPad } from '../arena/InkPad';

type Writing = 'text' | 'ink';
const WRITING_KEY = 'tz:journal-writing';

/** How the journal was last written, on this device: a convenience only. */
const lastWriting = (): Writing => {
  try {
    return localStorage.getItem(WRITING_KEY) === 'ink' ? 'ink' : 'text';
  } catch {
    return 'text';
  }
};

/** Whether a day holds a journal, typed or handwritten. */
export const hasJournal = (d: Day | undefined): boolean => !!d?.evening.journal?.trim() || !!d?.evening.journalInk?.length;

/**
 * The journal of a Wüstenzeit for one day: written freely, with the keyboard or
 * in handwriting as in the Gebetskammer. It belongs to the day, so it is kept,
 * searched, exported and deleted with it (rules 10 and 11). Sin is prayed, not
 * written down (rule 9).
 */
export function DesertJournal({ date }: { date: DateKey }) {
  const store = useStore();
  const day = useDay(date);
  const textId = useId();
  const text = day.evening.journal ?? '';
  const ink = day.evening.journalInk ?? [];
  const [writing, setWriting] = useState<Writing>(() =>
    ink.length && !text.trim() ? 'ink' : text.trim() && !ink.length ? 'text' : lastWriting(),
  );
  const choose = (w: Writing) => {
    setWriting(w);
    try {
      localStorage.setItem(WRITING_KEY, w);
    } catch {
      // Only a convenience.
    }
  };
  const meta = FIELDS['evening.journal']!;
  return (
    <fieldset className="arena-lines arena-text desert-journal">
      <legend>Tagebuch</legend>
      <p className="small muted">Sünde wird gebetet, nicht notiert – dafür ist die Beichte im Nachtgebet.</p>
      <Segmented<Writing>
        label="Schreiben mit"
        value={writing}
        onChange={choose}
        options={[
          { value: 'text', label: 'Tastatur' },
          { value: 'ink', label: 'Handschrift' },
        ]}
      />
      {writing === 'text' ? (
        <div className="field">
          <label htmlFor={textId} className="visually-hidden">
            Tagebuch
          </label>
          <GrowingTextarea
            id={textId}
            rows={meta.rows}
            value={text}
            placeholder={meta.placeholder}
            onChange={(e) => store.updateDay(date, (d) => setAt(d, 'evening.journal', e.target.value))}
          />
          {ink.length > 0 && <p className="small muted">Dazu gibt es auch Handgeschriebenes.</p>}
        </div>
      ) : (
        <>
          <InkPad
            strokes={ink}
            onChange={(strokes) =>
              store.updateDay(date, (d) => {
                const { journalInk: _, ...evening } = d.evening;
                return { ...d, evening: strokes.length ? { ...evening, journalInk: strokes } : evening };
              })
            }
          />
          {text.trim() && <p className="small muted">Dazu gibt es auch Getipptes.</p>}
        </>
      )}
    </fieldset>
  );
}

/** The journal of a whole Wüstenzeit, day by day, to read again (Rückblick and the close). */
export function RoundJournal({ run }: { run: WinterArcRun }) {
  const lookup = useDayLookup();
  const end = endDateOf(run.startDate, run.durationDays);
  const days: Day[] = [];
  for (let d = run.startDate; d <= end; d = addDays(d, 1)) {
    const day = lookup(d);
    if (hasJournal(day)) days.push(day!);
  }
  if (!days.length) return <p className="small muted">In dieser Wüstenzeit hast du kein Tagebuch geschrieben.</p>;
  return <DaySheetList days={days} />;
}

function DaySheetList({ days }: { days: readonly Day[] }) {
  return (
    <div className="desert-journal-read">
      {days.map((d) => (
        <section key={d.date} className="desert-journal-day">
          <h5>{formatLong(d.date)}</h5>
          {d.evening.journal?.trim() && <p className="desert-journal-text">{d.evening.journal.trim()}</p>}
          {d.evening.journalInk?.length ? (
            <img
              className="desert-journal-ink"
              alt="Handschrift"
              src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(inkToSvg(d.evening.journalInk))}`}
            />
          ) : null}
        </section>
      ))}
    </div>
  );
}

/**
 * The sheets of single days, as the journal was written before it became entries: every day with a
 * text or handwriting, newest first, folded. They stay as they were (rule 11).
 */
export function DaySheets() {
  const days = useAllDays().filter(hasJournal);
  if (!days.length) return null;
  return (
    <details className="wa-settings desert-sheets">
      <summary>Aus den Tagesblättern</summary>
      <DaySheetList days={days} />
    </details>
  );
}
