/**
 * The spiritual armour (Epheser 6,10-18): one piece a day after the morning
 * blessing, Monday to Saturday; on Sunday the prayer that goes with it (V. 18).
 * In the night prayer, 1. Petrus 5,8-9 opens, and the question of the day
 * stands in the examination, before confession and absolution (rules 1–3).
 * The texts live in data/waffenruestung.json.
 */
import data from '../../data/waffenruestung.json';
import type { Weekday } from '../domain/dates';

export interface ArmorPiece {
  weekday: Weekday;
  day: string;
  title: string;
  /** One or more references, separated by "; ". */
  ref: string;
  /** Words of Scripture (Luther 1912). */
  word: string;
  meaning: string;
  prayer: string;
  /** Question for the evening, prayed in the examination. */
  question: string;
}

export const ARMOR_TITLE: string = data.titel;

export const ARMOR_CALL = {
  ref: data.einleitung.bibelstelle,
  text: data.einleitung.bibeltext,
  note: data.einleitung.hinweis,
};

export const ARMOR_EVENING = {
  ref: data.abend.eroeffnung.bibelstelle,
  text: data.abend.eroeffnung.bibeltext,
};

const PIECES: ArmorPiece[] = data.tage.map((t) => ({
  weekday: t.wochentag as Weekday,
  day: t.tag,
  title: t.stueck,
  ref: t.bibelstelle,
  word: t.bibeltext,
  meaning: t.deutung,
  prayer: t.gebet,
  question: t.rueckschau,
}));

export function armorOf(wd: Weekday): ArmorPiece {
  const p = PIECES.find((x) => x.weekday === wd);
  if (!p) throw new Error(`No armour piece for weekday ${wd}`);
  return p;
}

/** Monday first, as the week is lived. */
export const ARMOR_WEEK: readonly ArmorPiece[] = [1, 2, 3, 4, 5, 6, 0].map((d) => armorOf(d as Weekday));

/** "Epheser 6,14a; Johannes 14,6" → ["Epheser 6,14a", "Johannes 14,6"] */
export const refsOf = (ref: string) => ref.split(/;\s*/).filter(Boolean);
