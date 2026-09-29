/**
 * The intercession for the house in the morning and the blessing over the
 * house at night. Names are put in from "Mein Haus".
 */
import { childrenOf, joinNames, wifeOf, type ChildSex, type House } from '../domain/house';
import type { Text } from './types';

export const HOUSE_RUBRIC =
  'Bete für alle mit Namen. Für den, der heute im Mittelpunkt steht, bete länger und mit seinem Anliegen.';

export const HOUSE_BLESSING_RUBRIC = 'Wenn es passt, segne die Kinder vorher am Bett mit dem Kreuzzeichen.';

/** One paragraph per stanza, as PrayerText shows them. */
const paragraphs = (ps: readonly string[]): string[] => ps.flatMap((p, i) => (i ? ['', p] : [p]));

/** Pronouns for the sentence on the children: one child, or several. */
function childWords(sexes: readonly (ChildSex | undefined)[]) {
  if (sexes.length > 1) return { acc: 'sie', kind: 'deinen Kindern' };
  const s = sexes[0];
  return { acc: s === 'son' ? 'ihn' : s === 'daughter' ? 'sie' : 'es', kind: 'deinem Kind' };
}

/**
 * The prayer for all, every day. Without a wife or without children the
 * sentence on them is left out.
 */
export function houseForAll(h: House): Text {
  const wife = wifeOf(h);
  const children = childrenOf(h);
  const ps: string[] = [];
  if (wife) {
    const name = wife.name.trim();
    ps.push(
      `Herr, ich befehle dir meine liebe Frau ${name}. Du hast sie mir gegeben. Lass mich sie heute lieben, wie Christus die Gemeinde geliebt hat, stärke sie in ihrem Tagewerk und behüte sie vor allem Übel.`,
    );
  }
  if (children.length) {
    const w = childWords(children.map((c) => c.sex));
    const names = joinNames(children.map((c) => c.name.trim()));
    ps.push(
      `${wife ? 'Ich bringe' : 'Herr, ich bringe'} dir ${names}. Du hast ${w.acc} in der Taufe zu ${w.kind} gemacht; erhalte ${w.acc} darin bis ans Ende. Und mir gib, dass ich ${w.acc} nicht zum Zorn reize, sondern aufziehe in der Zucht und Vermahnung zum Herrn.`,
    );
  }
  if (ps.length) ps[ps.length - 1] += ' Amen.';
  return { lines: paragraphs(ps) };
}

/** A prayer for the one in the centre, with the Bible references it rests on. */
export interface FocusPrayer {
  lines: string[];
  refs?: readonly string[];
}

export const WIFE_PRAYER_TITLE = 'Gebet für meine Frau';

export const wifePrayer = (name: string): FocusPrayer => ({
  lines: paragraphs([
    `Herr, himmlischer Vater, ich danke dir für meine liebe Frau ${name}. Du hast sie mir geschenkt, und ich habe sie nicht verdient. Ich bringe sie dir heute: Umgib sie mit deiner Liebe und fülle ihr Herz mit deinem Frieden. Stärke sie in allem, was heute auf ihr liegt, und lass sie erkennen, wozu du sie berufen hast.`,
    'Gib ihr Freude im Herzen, Klarheit in den Gedanken und Zuversicht im Geist. Schenke ihr Weisheit und Mut für ihr Tagewerk. Nimm von ihr, was sie niederdrückt, behüte sie, leite ihre Schritte und lass sie deine Nähe spüren.',
    'Und mich mach zu einem Mann, der sie liebt, wie du es mir geboten hast: der sie ermutigt, ihr dankt und sie trägt. Lass sie nie daran zweifeln, wie sehr sie geliebt ist, von dir und von mir. Amen.',
  ]),
  refs: ['Epheser 5,25'],
});

export const daughterPrayer = (name: string): FocusPrayer => ({
  lines: paragraphs([
    `Herr, himmlischer Vater, im Namen Jesu bringe ich dir heute meine Tochter ${name}. Du hast sie in der Taufe zu deinem Kind gemacht und sie teuer erkauft mit dem Blut Christi als eines unschuldigen Lammes. Sie gehört dir.`,
    'Behüte sie an Leib und Seele. Bewahre ihr Herz, ihre Gedanken und ihre Zukunft vor dem Bösen, und lass keine Lüge Macht über sie gewinnen, weder die des Feindes noch die der Welt. Was an Verletzung und bösem Wort auf ihr liegt, das heile du.',
    'Lass sie wissen, wer sie in dir ist. Erhalte sie rein, gib ihr einen Weg, auf dem sie dir dient, und lass deinen Heiligen Geist ihre Schritte leiten.',
    'Und mich mach zu einem Vater, der für sie in den Riss tritt, sie segnet und ihr dein Wort vorlebt. Um Jesu Christi willen. Amen.',
  ]),
  refs: ['1. Petrus 1,19', 'Hesekiel 22,30'],
});

export const sonPrayer = (name: string): FocusPrayer => ({
  lines: paragraphs([
    `Herr, himmlischer Vater, im Namen Jesu bringe ich dir meinen Sohn ${name}. Ich stelle ihn unter das Blut Jesu Christi, das besser redet als Abels Blut und stärker ist als jede Lüge des Feindes. Er ist auf deinen Namen getauft; er gehört Jesus.`,
    'Lass deinen heiligen Engel mit ihm sein, dass der böse Feind keine Macht an ihm finde. Bewahre ihn vor Auflehnung und Verwirrung, vor jeder Abhängigkeit und vor der Lüge darüber, wer er ist. Christus ist ein Fluch geworden für uns; darum soll kein Fluch über ihm stehen.',
    'Heiliger Geist, behüte sein Herz. Lass ihn aufwachsen zu einem Mann, der fest in der Wahrheit steht, dir ohne Furcht dient, andere beschützt und ein Licht ist in der Dunkelheit. Um Jesu Christi willen. Amen.',
  ]),
  refs: ['Hebräer 12,24', 'Galater 3,13'],
});

export const HOUSE_PRAYER: FocusPrayer = {
  lines: paragraphs([
    'Herr, himmlischer Vater, ich komme zu dir als Hausvater, dem du dieses Haus anvertraut hast. Ich befehle meine Frau und meine Kinder dem Schutz des Blutes Jesu Christi, das für uns vergossen ist. Du hast verheißen: Einer jeglichen Waffe, die wider dich zubereitet wird, soll es nicht gelingen. Halte diese Zusage über uns.',
    'Erfülle unser Haus mit deiner Gegenwart und lass Liebe, Friede und Eintracht unter uns wohnen. Bewahre ihre Herzen, leite ihre Schritte und stärke ihren Glauben. Mich mach zu einem Mann, der mit Weisheit, Demut und Festigkeit vorangeht. Lass unser Haus ein Licht sein, das zu deiner Ehre leuchtet. Im Namen Jesu. Amen.',
  ]),
  refs: ['Jesaja 54,17'],
};

/** At night, after Luther's evening blessing. */
export function houseBlessing(h: House): Text {
  const wife = !!wifeOf(h);
  const children = childrenOf(h).length > 0;
  const whom = wife && children ? 'meine Frau und meine Kinder' : wife ? 'meine Frau' : 'meine Kinder';
  const them = wife && !children ? 'ihr' : 'ihnen';
  return {
    lines: [`Behüte, Herr, ${whom} in dieser Nacht. Was ich heute an ${them} versäumt habe, das decke du zu. Amen.`],
  };
}
