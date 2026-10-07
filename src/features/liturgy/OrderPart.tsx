/**
 * Renders one part of an order (content/orders.ts). Texts depend on the order
 * (morning or evening), fields come from the part definition.
 */
import { useState, type ReactNode } from 'react';
import {
  ABSOLUTION_EVENING,
  ABSOLUTION_WREATH,
  AFTER_READING,
  BAPTISM_REMEMBRANCE,
  BENEDICAMUS,
  BENEDICTUS,
  BENEDICTUS_ANTIPHON,
  BLESSING,
  COLLECT_EVENING,
  COLLECT_MORNING,
  CREED_LUTHER,
  EVENING_BLESSING,
  GENERAL_CONFESSION,
  GLORIA,
  HALLELUJA,
  HALLELUJA_RUBRIC,
  HYMN_EVENING,
  HYMN_EVENING_ALTERNATIVES,
  HYMN_MORNING,
  HYMN_MORNING_ALTERNATIVES,
  KYRIE,
  LORDS_PRAYER_LUTHER,
  MAGNIFICAT,
  MAGNIFICAT_ANTIPHON,
  MORNING_BLESSING,
  NUNC_DIMITTIS,
  PRAYER_AFTER_READING,
  PRAYER_BEFORE_READING,
  SIGN_OF_THE_CROSS,
  SILENCE,
  VERSICLE_HELP,
  VERSICLE_OPEN_LIPS,
} from '../../content/liturgy';
import { ARMOR_CALL, ARMOR_EVENING, ARMOR_WEEK, armorOf, refsOf } from '../../content/armor';
import { WREATH_FREEDOM, WREATH_INTRO, WREATH_MATTER, WREATH_RULE_OF_THUMB } from '../../content/method';
import { RUBRICS, type OrderId, type Part } from '../../content/orders';
import { EVENING_PSALMS, MORNING_PSALMS, PSALM_RUBRIC_ANTIPHON, PSALM_RUBRIC_MORNING } from '../../content/psalms';
import { useDay, useProfile, useStore } from '../../data/hooks';
import { useNavigate } from 'react-router';
import { psalmRef } from '../../domain/bibleRef';
import { isPassiontide } from '../../domain/churchYear';
import { WEEKDAY_LONG, weekdayOf, type DateKey } from '../../domain/dates';
import type { OrderForm } from '../../domain/model';
import { BibleRef } from '../../ui/BibleRef';
import { Note, PrayerText, Rubric, VersicleView } from '../../ui/PrayerText';
import { Section } from '../../ui/Section';
import { Alignment } from './Alignment';
import { CatechismOfDay } from './CatechismOfDay';
import { Examination } from './Examination';
import { HouseBlessing, HouseIntercession } from './HouseParts';
import { MorningReading } from './MorningReading';
import { PartFields } from './PartFields';
import { DayField } from '../../ui/DayField';
import { Segmented } from '../../ui/Choice';
import { Review } from './Review';
import { WeekReview } from './WeekReview';

export interface PartContext {
  order: OrderId;
  form: OrderForm;
  date: DateKey;
}

function Collapsible({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="fold">
      <summary>{title}</summary>
      {children}
    </details>
  );
}

/** One link per reference in "Epheser 6,14a; Johannes 14,6". */
function Refs({ refs }: { refs: string }) {
  return (
    <span className="refs">
      {refsOf(refs).map((r, i) => (
        <span key={r}>
          {i > 0 && ' · '}
          <BibleRef reference={r} />
        </span>
      ))}
    </span>
  );
}

type EveningRead = 'reading' | 'devotion';
const EVENING_READ_KEY = 'tz:vespers-read';

/** What was read last in the Vesper, on this device: a convenience only. */
function lastEveningRead(): EveningRead {
  try {
    return localStorage.getItem(EVENING_READ_KEY) === 'devotion' ? 'devotion' : 'reading';
  } catch {
    return 'reading';
  }
}

/**
 * The reading of the Vesper: a few verses of Scripture, or a devotion from a
 * book at hand, with room to write down what became important in it.
 */
function VespersReading({ part, ctx }: { part: Part; ctx: PartContext }) {
  const day = useDay(ctx.date);
  const [what, setWhat] = useState<EveningRead>(() =>
    day.evening.devotion?.trim() || day.evening.devotionNotes?.trim() ? 'devotion' : lastEveningRead(),
  );
  const choose = (w: EveningRead) => {
    setWhat(w);
    try {
      localStorage.setItem(EVENING_READ_KEY, w);
    } catch {
      // Only a convenience.
    }
  };
  return (
    <>
      <Segmented<EveningRead>
        label="Was du liest"
        value={what}
        onChange={choose}
        options={[
          { value: 'reading', label: 'Lesung' },
          { value: 'devotion', label: 'Andacht' },
        ]}
      />
      {what === 'reading' ? (
        <>
          <Rubric>{RUBRICS.vespersReading}</Rubric>
          <PartFields part={part} date={ctx.date} />
        </>
      ) : (
        <>
          <Rubric>{RUBRICS.vespersDevotion}</Rubric>
          <DayField date={ctx.date} path="evening.devotion" />
          <DayField date={ctx.date} path="evening.devotionNotes" />
        </>
      )}
      <p className="pray-line">{AFTER_READING}</p>
    </>
  );
}

/**
 * After the review: the free writing of the day belongs in the Gebetskammer.
 * A new entry there, opened at once; the evening itself stays short.
 */
function ToChamber() {
  const store = useStore();
  const navigate = useNavigate();
  return (
    <div className="to-chamber">
      <p className="small muted">Was dich heute bewegt hat, ausführlicher:</p>
      <button type="button" className="btn quiet" onClick={() => navigate(`/arena/${store.addArenaEntry()}`)}>
        In der Gebetskammer weiterschreiben
      </button>
    </div>
  );
}

function PartBody({ part, ctx }: { part: Part; ctx: PartContext }) {
  const profile = useProfile();
  const day = useDay(ctx.date);
  const wd = weekdayOf(ctx.date);
  const morning = ctx.order === 'morning' || ctx.order === 'atBed';
  // Lord's Prayer and Creed always as in Luther's catechism.
  const lordsPrayer = LORDS_PRAYER_LUTHER;
  const creed = CREED_LUTHER;

  switch (part.kind) {
    case 'sign-of-cross':
      return (
        <>
          <Rubric>Bekreuzige dich und sprich:</Rubric>
          <PrayerText text={SIGN_OF_THE_CROSS} />
        </>
      );

    case 'versicles':
      return (
        <>
          <VersicleView items={morning ? [VERSICLE_OPEN_LIPS, VERSICLE_HELP] : [VERSICLE_HELP]} />
          <PrayerText text={GLORIA} />
          {ctx.form === 'full' &&
            (isPassiontide(ctx.date) ? (
              <Rubric>Passionszeit: Das Halleluja entfällt.</Rubric>
            ) : (
              <>
                <p className="pray-line">{HALLELUJA}</p>
                <Rubric>{HALLELUJA_RUBRIC}</Rubric>
              </>
            ))}
        </>
      );

    case 'hymn': {
      const hymn = morning ? HYMN_MORNING : HYMN_EVENING;
      return (
        <>
          {morning && <Rubric>Wahlweise. Eine Strophe, gesungen oder gesprochen – wenn die Zeit es erlaubt.</Rubric>}
          <PrayerText text={hymn} />
          <p className="small muted">{morning ? HYMN_MORNING_ALTERNATIVES : HYMN_EVENING_ALTERNATIVES}</p>
        </>
      );
    }

    case 'psalm': {
      const ps = morning ? MORNING_PSALMS[wd] : EVENING_PSALMS[wd];
      return (
        <>
          <p className="psalm-ref">
            <BibleRef reference={psalmRef(ps.psalm)} />
          </p>
          <p className="antiphon">
            <span className="rubric-inline">Antiphon:</span> {ps.antiphon}
          </p>
          {morning && ctx.form === 'full' && <Rubric>{PSALM_RUBRIC_MORNING}</Rubric>}
          {ctx.order === 'vespers' && ctx.form === 'short' && (
            <Rubric>Im Wechsel, Vers um Vers. Die Kinder sprechen die Antiphon.</Rubric>
          )}
          <Collapsible title="Gloria Patri">
            <PrayerText text={GLORIA} />
          </Collapsible>
          <Rubric>{PSALM_RUBRIC_ANTIPHON}</Rubric>
        </>
      );
    }

    case 'prayer-before-reading':
      return <PrayerText text={PRAYER_BEFORE_READING} />;

    case 'reading':
      if (ctx.order === 'morning') return <MorningReading part={part} ctx={ctx} />;
      return <VespersReading part={part} ctx={ctx} />;

    case 'prayer-after-reading':
      return <PrayerText text={PRAYER_AFTER_READING} />;

    case 'catechism':
      return (
        <>
          <p className="small">{WREATH_INTRO}</p>
          <p className="small">{WREATH_MATTER}</p>
          <p className="small muted">{WREATH_RULE_OF_THUMB}</p>
          <CatechismOfDay date={ctx.date} />
          <Rubric>{RUBRICS.wreath}</Rubric>
        </>
      );

    case 'wreath-instruction':
    case 'wreath-thanks':
    case 'wreath-petition':
      return <PartFields part={part} date={ctx.date} />;

    case 'confession':
      if (ctx.order === 'morning') {
        return (
          <>
            <p className="field-like">
              <span className="field-label">Beichte – Wo stehe ich dagegen?</span>
              <span className="placeholder-text">Ich bekenne dir, daß ich …</span>
            </p>
            <Note>{RUBRICS.confessionNote}</Note>
          </>
        );
      }
      return <PrayerText text={GENERAL_CONFESSION} />;

    case 'absolution':
      if (ctx.order === 'morning') return <PrayerText text={ABSOLUTION_WREATH} className="absolution" />;
      return (
        <>
          <Rubric>{RUBRICS.absolutionAloud}</Rubric>
          <PrayerText text={ABSOLUTION_EVENING} className="absolution" />
          <p className="small">{RUBRICS.absolutionWeight}</p>
        </>
      );

    case 'free-prayer':
      return (
        <>
          {ctx.form === 'full' && <p className="small muted">{WREATH_FREEDOM}</p>}
          <Rubric>{ctx.form === 'full' ? RUBRICS.freePrayer : 'Über den Vers, den du mitnimmst – in eigenen Worten.'}</Rubric>
          <PartFields part={part} date={ctx.date} />
        </>
      );

    case 'silence':
      return (
        <>
          <PrayerText text={SILENCE} />
          <Rubric>{RUBRICS.silence}</Rubric>
        </>
      );

    case 'canticle':
      if (ctx.order === 'morning') {
        return (
          <>
            <p className="antiphon">
              <span className="rubric-inline">Antiphon:</span> {BENEDICTUS_ANTIPHON}
            </p>
            <Collapsible title="Text anzeigen">
              <PrayerText text={BENEDICTUS} />
              <PrayerText text={GLORIA} />
            </Collapsible>
            <p className="small muted">{RUBRICS.benedictus}</p>
          </>
        );
      }
      if (ctx.order === 'vespers') {
        return (
          <>
            <p className="antiphon">
              <span className="rubric-inline">Antiphon:</span> {MAGNIFICAT_ANTIPHON}
            </p>
            <Collapsible title="Text anzeigen">
              <PrayerText text={MAGNIFICAT} />
              <PrayerText text={GLORIA} />
            </Collapsible>
            <p className="small muted">{RUBRICS.magnificat}</p>
          </>
        );
      }
      return (
        <>
          <Rubric>Wahlweise.</Rubric>
          <Collapsible title="Text anzeigen">
            <PrayerText text={NUNC_DIMITTIS} />
          </Collapsible>
        </>
      );

    case 'intercession': {
      if (ctx.order === 'morning') {
        const weekly = profile.prayer.weekly[wd] ?? [];
        return (
          <>
            <VersicleView items={[KYRIE]} />
            <Rubric>{RUBRICS.intercession}</Rubric>
            <p>
              <b>Anliegen am {WEEKDAY_LONG[wd]}:</b>{' '}
              {weekly.length ? (
                weekly.join(' · ')
              ) : (
                <span className="muted">unter „Mehr → Gebet → Gebetsübersicht“ eintragen</span>
              )}
            </p>
            {profile.prayer.daily.length > 0 && (
              <p className="small">
                <b>Täglich:</b> {profile.prayer.daily.join(' · ')}
              </p>
            )}
            <PartFields part={part} date={ctx.date} />
          </>
        );
      }
      if (ctx.order === 'vespers') {
        // With the Nachtgebet after it, the names are written down once, there (0.40).
        const later = profile.showCompline && !day.evening.intercession?.trim();
        return (
          <>
            <VersicleView items={[KYRIE]} />
            <Rubric>{RUBRICS.vespersIntercession}</Rubric>
            {later ? (
              <p className="small muted">Die Namen des Tages notierst du im Nachtgebet.</p>
            ) : (
              <PartFields part={part} date={ctx.date} />
            )}
          </>
        );
      }
      return (
        <>
          <Rubric>{RUBRICS.complineIntercession}</Rubric>
          <PartFields part={part} date={ctx.date} />
        </>
      );
    }

    case 'lords-prayer':
      return (
        <Collapsible title="Text anzeigen">
          <PrayerText text={lordsPrayer} />
        </Collapsible>
      );

    case 'creed':
      return (
        <>
          <Collapsible title="Text anzeigen">
            <PrayerText text={creed} />
          </Collapsible>
          <p className="small muted">{RUBRICS.complineCreed}</p>
        </>
      );

    case 'armor': {
      const piece = armorOf(wd);
      return (
        <>
          <blockquote className="armor-call">
            {ARMOR_CALL.text} <Refs refs={ARMOR_CALL.ref} />
          </blockquote>
          <p className="small muted">{ARMOR_CALL.note}</p>
          <div className="armor-piece">
            <h5 className="armor-title">
              {piece.day}: {piece.title}
            </h5>
            <p className="armor-word">
              {piece.word} <Refs refs={piece.ref} />
            </p>
            <p>{piece.meaning}</p>
            <PrayerText text={{ lines: [piece.prayer] }} />
          </div>
          {ctx.form === 'full' && (
            <Collapsible title="Alle Stücke der Woche">
              <ul className="armor-week">
                {ARMOR_WEEK.map((a) => (
                  <li key={a.weekday} aria-current={a.weekday === wd ? 'true' : undefined}>
                    <span className="armor-day">{a.day}</span> {a.title}
                  </li>
                ))}
              </ul>
            </Collapsible>
          )}
        </>
      );
    }

    case 'armor-evening':
      return (
        <blockquote className="armor-call">
          {ARMOR_EVENING.text} <Refs refs={ARMOR_EVENING.ref} />
        </blockquote>
      );

    case 'alignment':
      return <Alignment part={part} ctx={ctx} />;

    case 'thanks':
      return (
        <>
          <Rubric>{RUBRICS.thanks}</Rubric>
          <PartFields part={part} date={ctx.date} />
        </>
      );

    case 'review':
      return (
        <>
          <Review date={ctx.date} />
          <ToChamber />
        </>
      );

    case 'week-review':
      return <WeekReview date={ctx.date} />;

    case 'examination':
      return <Examination date={ctx.date} />;

    case 'baptism':
      return (
        <>
          <Rubric>{RUBRICS.baptism}</Rubric>
          <PrayerText text={BAPTISM_REMEMBRANCE} />
        </>
      );

    case 'collect':
      return <PrayerText text={morning ? COLLECT_MORNING : COLLECT_EVENING} />;

    case 'blessing':
      return (
        <>
          <VersicleView items={[BENEDICAMUS, BLESSING]} />
          {ctx.order === 'morning' && <p className="send-off">{RUBRICS.sendOff}</p>}
        </>
      );

    case 'morning-blessing':
      return <PrayerText text={MORNING_BLESSING} />;

    case 'evening-blessing':
      // "Flugs und fröhlich geschlafen" follows after the blessing over the house.
      return <PrayerText text={EVENING_BLESSING} />;

    case 'house-intercession':
      return <HouseIntercession date={ctx.date} form={ctx.form} />;

    case 'house-blessing':
      return <HouseBlessing />;
  }
}

export function OrderPart({
  part,
  ctx,
  showTitle = true,
  headingLevel = 4,
}: {
  part: Part;
  ctx: PartContext;
  showTitle?: boolean;
  /** Keeps the outline valid: h4 below a step heading, h3 directly below the order, h5 in a nested flow. */
  headingLevel?: 3 | 4 | 5;
}) {
  const profile = useProfile();
  const Heading = (`h${headingLevel}` as 'h3' | 'h4' | 'h5');
  // The armour can be switched off in the settings.
  if ((part.kind === 'armor' || part.kind === 'armor-evening') && !profile.armor) return null;
  // The absolution never folds away: an examination always ends in the word of forgiveness (rule 1).
  if (!showTitle || part.kind === 'absolution') {
    return (
      <section className={`part part-${part.kind}`}>
        {showTitle && <Heading className="part-title">{part.title}</Heading>}
        <PartBody part={part} ctx={ctx} />
      </section>
    );
  }
  return (
    <Section
      id={`part.${ctx.order}.${part.kind}`}
      title={part.title}
      level={headingLevel}
      className={`part part-${part.kind}`}
      titleClassName="part-title"
    >
      <PartBody part={part} ctx={ctx} />
    </Section>
  );
}
