/**
 * Prints the app texts the Advent notebook needs as JSON on stdout, so that
 * notizbuch/advent.py takes every word from the app itself and keeps no copy.
 * Run: npx tsx notizbuch/app_texte.ts
 */
import { MOTTO, SOURCES, THE_ARC } from '../src/content/about';
import { ARMOR_CALL, ARMOR_EVENING, ARMOR_TITLE, ARMOR_WEEK } from '../src/content/armor';
import { CIRCLE_INFO, SEASON_INFO, SEASON_THEME, SUNDAY_INFO } from '../src/content/churchYearGuide';
import { EXAMEN_INTRO, EXAMEN_NOTE, STATIONS, STATION_BY_WEEKDAY } from '../src/content/examen';
import { FIELDS } from '../src/content/fields';
import { HOUSE_BLESSING_RUBRIC, HOUSE_RUBRIC, houseBlessing, houseForAll } from '../src/content/house';
import { EPISTLE_LECTIONS, LECTIONS } from '../src/content/lections';
import * as L from '../src/content/liturgy';
import * as M from '../src/content/method';
import { ORDER_MINUTES, RUBRICS, getOrder } from '../src/content/orders';
import { EVENING_PSALMS, MORNING_PSALMS, PSALM_RUBRIC_ANTIPHON, PSALM_RUBRIC_MORNING } from '../src/content/psalms';
import { SEVEN_QUESTIONS } from '../src/content/questions';
import { READING_SUMMARIES } from '../src/content/readingSummaries';
import { SUNDAY_GUIDE } from '../src/content/sundayGuide';
import { WEEK_PLACES, WEEK_REVIEW, WEEK_REVIEW_COMFORT } from '../src/content/weekReview';
import { WEEKLY_VERSES } from '../src/content/weeklyVerses';
import { emptyChild, emptyHouse } from '../src/domain/house';
import { composeVerse } from '../src/domain/weeklyVerse';

const verse = (v: (typeof WEEKLY_VERSES)[string]) => ({ ref: v.ref, text: composeVerse(v) });
const order = (id: 'morning' | 'compline', form: 'full' | 'short') =>
  getOrder(id, form).steps.map((s) => ({ id: s.id, title: s.title, minutes: s.minutes, parts: s.parts.map((p) => p.title) }));

/** A house with a wife and two children; advent.py turns NAME into a line to write the name on. */
const house = emptyHouse();
house.wife.name = 'NAME';
house.children = [{ ...emptyChild('a'), name: 'NAME' }, { ...emptyChild('b'), name: 'NAME' }];

const out = {
  arc: THE_ARC,
  motto: MOTTO,
  sources: SOURCES,
  orders: {
    morning: order('morning', 'full'),
    morningShort: order('morning', 'short'),
    compline: order('compline', 'full'),
    minutes: ORDER_MINUTES,
  },
  rubrics: RUBRICS,
  fields: FIELDS,
  psalms: { morning: MORNING_PSALMS, evening: EVENING_PSALMS, rubricMorning: PSALM_RUBRIC_MORNING, rubricAntiphon: PSALM_RUBRIC_ANTIPHON },
  liturgy: {
    sign: L.SIGN_OF_THE_CROSS,
    gloria: L.GLORIA,
    halleluja: L.HALLELUJA,
    hallelujaRubric: L.HALLELUJA_RUBRIC,
    openLips: L.VERSICLE_OPEN_LIPS,
    help: L.VERSICLE_HELP,
    kyrie: L.KYRIE,
    benedicamus: L.BENEDICAMUS,
    lordsPrayer: L.LORDS_PRAYER_LUTHER,
    creed: L.CREED_LUTHER,
    morningBlessing: L.MORNING_BLESSING,
    eveningBlessing: L.EVENING_BLESSING,
    baptism: L.BAPTISM_REMEMBRANCE,
    hymnMorning: L.HYMN_MORNING,
    hymnMorningAlt: L.HYMN_MORNING_ALTERNATIVES,
    benedictusAntiphon: L.BENEDICTUS_ANTIPHON,
    benedictus: L.BENEDICTUS,
    nuncDimittis: L.NUNC_DIMITTIS,
    collectMorning: L.COLLECT_MORNING,
    collectEvening: L.COLLECT_EVENING,
    blessing: L.BLESSING,
    beforeReading: L.PRAYER_BEFORE_READING,
    afterReading: L.PRAYER_AFTER_READING,
    silence: L.SILENCE,
    confession: L.GENERAL_CONFESSION,
    absolutionEvening: L.ABSOLUTION_EVENING,
    absolutionWreath: L.ABSOLUTION_WREATH,
  },
  method: {
    credit: M.METHOD_CREDIT,
    rubrics: M.READING_RUBRICS,
    passes: M.READING_PASSES,
    colors: M.COLOR_CODE,
    marks: M.MARGIN_MARKS,
    doubleQuestion: M.DOUBLE_QUESTION_NOTE,
    salvationHistory: M.SALVATION_HISTORY_NOTE,
    hardPassages: M.HARD_PASSAGES_NOTE,
    wreathIntro: M.WREATH_INTRO,
    wreathMatter: M.WREATH_MATTER,
    wreathRule: M.WREATH_RULE_OF_THUMB,
    wreathFreedom: M.WREATH_FREEDOM,
    questions: SEVEN_QUESTIONS,
  },
  armor: { title: ARMOR_TITLE, call: ARMOR_CALL, evening: ARMOR_EVENING, week: ARMOR_WEEK },
  examen: { intro: EXAMEN_INTRO, note: EXAMEN_NOTE, stations: STATIONS, byWeekday: STATION_BY_WEEKDAY },
  house: { rubric: HOUSE_RUBRIC, blessingRubric: HOUSE_BLESSING_RUBRIC, forAll: houseForAll(house), blessing: houseBlessing(house) },
  sundayGuide: SUNDAY_GUIDE,
  weekReview: { places: WEEK_PLACES, texts: WEEK_REVIEW, comfort: WEEK_REVIEW_COMFORT },
  advent: {
    season: SEASON_INFO.advent,
    theme: SEASON_THEME.advent,
    circle: CIRCLE_INFO.christmas,
    sundays: (['advent1', 'advent2', 'advent3', 'advent4'] as const).map((k) => ({
      key: k,
      verse: verse(WEEKLY_VERSES[k]!),
      ...SUNDAY_INFO[k]!,
      summary: READING_SUMMARIES[k],
      gospelLection: LECTIONS[k],
      epistleLection: EPISTLE_LECTIONS[k],
    })),
    christmas: { verse: verse(WEEKLY_VERSES.christmas!), ...SUNDAY_INFO.christmas, season: SEASON_INFO.christmastide },
  },
};

process.stdout.write(JSON.stringify(out));
