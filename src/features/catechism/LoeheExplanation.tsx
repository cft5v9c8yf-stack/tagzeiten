import { useSelectedDate } from '../../app/useSelectedDate';
import { CATECHISM } from '../../content/catechism';
import {
  LOEHE_HOME,
  LOEHE_PLACES,
  LOEHE_SOURCE,
  isQuestion,
  loeheBetween,
  loeheForChiefPart,
  type LoeheLesson,
  type LoeheQuestion,
} from '../../content/loeheCatechism';
import { useProfile } from '../../data/hooks';
import { catechismFor } from '../../domain/catechismDay';
import { Section } from '../../ui/Section';

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((l, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {l}
        </span>
      ))}
    </>
  );
}

/** Löhe's "Anm.", footnotes and quoted passages, shown small after the answer. */
function Notes({ q }: { q: LoeheQuestion }) {
  const notes = [...(q.quote ? [q.quote] : []), ...(q.note ? [q.note] : []), ...(q.footnotes ?? []).map((f, i) => `${'*'.repeat(i + 1)}) ${f}`)];
  return (
    <>
      {notes.map((n) => (
        <p key={n.slice(0, 30)} className="li-note">
          {n}
        </p>
      ))}
    </>
  );
}

/**
 * Löhe's questions on one place of the catechism under its title: number in
 * the margin, question, answer, his notes small after it. Nothing to tap.
 */
function LoeheBlock({ title, lessons }: { title: string; lessons: readonly LoeheLesson[] }) {
  const marks = lessons.flatMap((l) => l.items.filter((i) => !isQuestion(i))).length;
  if (!lessons.some((l) => l.items.some(isQuestion))) return null;
  return (
    <section className="li" aria-label={title}>
      <h4 className="li-label">{title}</h4>
      {lessons.map((l, li) => (
        <div key={li}>
          {l.items.map((item, i) =>
            isQuestion(item) ? (
              <div key={item.no} className="li-qa">
                <p className="li-q">
                  <span className="li-no">{item.no}</span>
                  {item.q}
                </p>
                <p className="li-a">
                  <Lines text={item.a} />
                </p>
                <Notes q={item} />
              </div>
            ) : marks > 1 ? (
              <p key={`m${i}`} className="li-mark">
                Zum {item.mark} Gebot
              </p>
            ) : null,
          )}
        </div>
      ))}
    </section>
  );
}

type Range = readonly [number, number];
const headingOf = (r?: Range) => (r ? loeheBetween(r).find((l) => l.heading)?.heading : undefined);
const span = (qs: readonly LoeheQuestion[]) => `Fragen ${qs[0]!.no}–${qs.at(-1)!.no}`;
const CARD_IDS = ['loehe.home', ...CATECHISM.map((c) => `loehe.${c.id}`)];

/**
 * Appendix "Fragen und Antworten zum Katechismus": Löhe's book in its own
 * order, one card per chief part, one open at a time; this week's chief part
 * open first. Inside, his questions under the piece they explain.
 */
export function LoeheBook() {
  const { date } = useSelectedDate();
  const profile = useProfile();
  const current = catechismFor(date, profile.catechism.weekOffset).chiefIndex;
  const home = loeheBetween(LOEHE_HOME);
  return (
    <>
      <p className="book-source">
        Wilhelm Löhe, lutherischer Pfarrer in Neuendettelsau, hat zu jedem Stück des Kleinen Katechismus Fragen und
        Antworten geschrieben, damit Kinder verstehen, was sie auswendig lernen. Wortgetreu in der Rechtschreibung der
        Ausgabe. Am Tisch stehen die Fragen des Tages neben dem Stück: „Am Tisch abfragen“ auf der Übersicht.
      </p>
      <Section
        id="loehe.home"
        group={CARD_IDS}
        defaultOpen={false}
        className="book-card"
        title={
          <>
            <span className="book-card-mark" aria-hidden="true">
              ·
            </span>
            <span className="book-card-text">
              <span className="book-card-title">Zum ganzen Katechismus</span>
              <span className="book-card-sub">{span(home.flatMap((l) => l.items.filter(isQuestion)))}</span>
            </span>
          </>
        }
      >
        <LoeheBlock title={home[0]?.heading ?? 'Einleitende Fragen'} lessons={home} />
      </Section>
      {CATECHISM.map((chief, ci) => {
        const places = LOEHE_PLACES[chief.id];
        return (
          <Section
            key={chief.id}
            id={`loehe.${chief.id}`}
            group={CARD_IDS}
            defaultOpen={ci === current}
            className="book-card"
            title={
              <>
                <span className="book-card-mark" aria-hidden="true">
                  {ci + 1}
                </span>
                <span className="book-card-text">
                  <span className="book-card-title">{chief.title}</span>
                  <span className="book-card-sub">
                    {span(loeheForChiefPart(chief.id))}
                    {ci === current && ' · diese Woche'}
                  </span>
                </span>
              </>
            }
          >
            {places.intro && (
              <LoeheBlock
                title={chief.id === 'lordsPrayer' ? 'Einleitende Fragen' : (headingOf(places.intro) ?? 'Einleitende Fragen')}
                lessons={loeheBetween(places.intro)}
              />
            )}
            {chief.pieces.map((piece, pi) => (
              <LoeheBlock key={pi} title={piece.title} lessons={loeheBetween(places.pieces[pi]!)} />
            ))}
            {places.outro && (
              <LoeheBlock title={headingOf(places.outro) ?? 'Zum Übergang'} lessons={loeheBetween(places.outro)} />
            )}
          </Section>
        );
      })}
      <p className="small muted">{LOEHE_SOURCE}</p>
    </>
  );
}
