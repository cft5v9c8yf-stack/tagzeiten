import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { SCRIPTURE_PRAYER, SCRIPTURE_PRAYER_INTRO, SCRIPTURE_PRAYER_SOURCE, type Passage } from '../../content/scripturePrayer';
import { useStore } from '../../data/hooks';
import { formatLong } from '../../domain/dates';
import { BibleRef } from '../../ui/BibleRef';
import { LordText } from '../../ui/LordText';
import { PrayerText } from '../../ui/PrayerText';
import { useSundayLinks } from './SundayPage';

function PassageView({ passage }: { passage: Passage }) {
  return (
    <div className="pray walk-passage">
      {passage.kind === 'prose' ? (
        <p className="walk-prose">
          <LordText>{passage.text}</LordText>
        </p>
      ) : (
        <>
          {passage.intro && (
            <p className="walk-prose">
              <LordText>{passage.intro}</LordText>
            </p>
          )}
          <p className="walk-poem">
            {passage.lines.map((l, i) => {
              const indent = l.startsWith('>');
              return (
                <span key={i} className={`walk-line${indent ? ' is-indented' : ''}`}>
                  <LordText>{indent ? l.slice(1) : l}</LordText>
                </span>
              );
            })}
          </p>
        </>
      )}
      <p className="attribution">
        <BibleRef reference={passage.ref} />
      </p>
    </div>
  );
}

/**
 * "Mit der Schrift beten – Sonntag": eight steps from adoration to blessing,
 * one at a time. Each step: its texts, then a pause to pray on freely.
 */
export function ScripturePrayerPage() {
  const store = useStore();
  const navigate = useNavigate();
  const links = useSundayLinks();
  const walk = SCRIPTURE_PRAYER[0]!;
  const [i, setI] = useState(0);
  const step = walk.steps[i]!;
  const last = i === walk.steps.length - 1;
  const go = (n: number) => {
    setI(n);
    window.scrollTo?.({ top: 0 });
  };
  const toJournal = () => {
    const today = store.today();
    const id = store.addArenaEntry();
    store.updateArenaEntry(id, (e) => ({ ...e, text: `Sonntagsgebet, ${formatLong(today)} ${today.slice(0, 4)}\n\n` }), {
      immediate: true,
    });
    navigate(`/arena/${id}`);
  };
  return (
    <article className="scripture-walk">
      <p className="back-link">
        <Link to={links.sunday()}>‹ Sonntag</Link>
      </p>
      <h2>{walk.title}</h2>
      <p className="small muted">{SCRIPTURE_PRAYER_INTRO}</p>
      <section className="flow-step walk-step" aria-labelledby="walk-step-title">
        <p className="walk-count" aria-label={`Schritt ${i + 1} von ${walk.steps.length}`}>
          {i + 1} / {walk.steps.length}
        </p>
        <h3 id="walk-step-title" className="flow-title">
          {step.title}
        </h3>
        {step.passages.map((p) => (
          <PassageView key={p.ref} passage={p} />
        ))}
        {step.pause && (
          <p className="walk-pause">
            <span className="walk-pause-mark" aria-hidden="true">
              ❧
            </span>{' '}
            {step.pause}
          </p>
        )}
        {step.comfort && (
          <>
            <p className="rubric">Und höre den Zuspruch:</p>
            <PrayerText text={step.comfort} className="absolution" />
          </>
        )}
        <div className="flow-footer walk-nav">
          {i > 0 && (
            <button type="button" className="btn quiet" onClick={() => go(i - 1)}>
              Zurück zu: {walk.steps[i - 1]!.title}
            </button>
          )}
          {!last ? (
            <button type="button" className="btn primary" onClick={() => go(i + 1)}>
              Weiter zu: {walk.steps[i + 1]!.title}
            </button>
          ) : (
            <button type="button" className="btn primary" onClick={toJournal}>
              Gedanken ins Tagebuch
            </button>
          )}
        </div>
      </section>
      <p className="small muted walk-source">{SCRIPTURE_PRAYER_SOURCE}</p>
    </article>
  );
}
