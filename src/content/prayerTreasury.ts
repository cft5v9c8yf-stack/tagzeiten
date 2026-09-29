/**
 * The Gebetsschatz: historic Lutheran prayers, word for word as handed down –
 * no modernising, no shortening (rule 12: authors before 1900).
 */
import type { Text } from './types';

export interface TreasuryPrayer {
  id: string;
  title: string;
  author: string;
  text: Text;
}

/** Prayed on Saturday, when the marriage stands in the centre. */
export const HUSBAND_PRAYER: TreasuryPrayer = {
  id: 'ehemann',
  title: 'Gebet eines Ehemannes',
  author: 'Johann Habermann († 1590)',
  text: {
    lines: [
      'Allmächtiger, gütiger Gott, der du den heiligen Ehestand selbst eingesetzt und durch deines lieben Sohnes Jesu Christi erste Wunderzeichen geehrt und geziert hast als einen Stand, der dir angenehm ist, in welchem auch viele heilige Erzväter und Propheten gottselig gelebt, und dir wohl gefallen haben. Weil denn du mich auch in der heiligen Ehe beraten, zur Haushaltung verordnet und ein sonderliches Wohlgefallen an den dreien Stücken hast, nämlich: wenn Brüder eins sind, und die Nachbarn sich lieb haben, und Mann und Weib sich mit einander wohl begehen, so bitte ich dich von Herzensgrund, verleihe mir, dass ich in christlicher Liebe und Einigkeit mit Vernunft bei meinem Weibe, als dem schwächsten Werkzeug, wohne, derselben ihre Ehre, als auch Miterbin der Gnade des Lebens gebe, sie samt Kindern und Gesinde ziehe zu deiner Erkenntnis und göttlichen Ehre in aller Zucht und Ehrbarkeit. Dazu so gib Gnade, dass sie mir in allem Guten und zu aller Gottseligkeit folgen und sich ziehen lassen. Wehre dem Eheteufel, dass er nicht Zwietracht und Zank zwischen uns einmenge, und, wo wir etwa, aus Schwachheit übereilet, uneins würden, so hilf, dass wir uns bald wieder miteinander versöhnen. Gib mir Gnade, dass ich mich keines andern Ehegemahls und Weibes gelüsten lasse, oder dieselbe mit einem bösen Auge ansehe, ihrer zu begehren. Behüte mich, mein Weib, Kinder und Gesinde vor Krankheit nach deinem göttlichen Willen. Du wollest auch mir, deinem Knechte, verleihen, dass ich meines Berufes fleißig warte, im Schweiße meines Angesichts mein Brot esse, und mich es nicht verdrießen lasse, ob es mir sauer werden muss, denn du hast es also geschaffen. Verleihe auch Glück und Heil zu meiner Nahrung, dass dieselbe durch deinen Segen ohn’ anderer Leute Schaden und Nachteil gemehrt werde. Beschere mir frommes Gesinde und treue Arbeiter. Behüte mir Haus und Hof und alles, was du mir gegeben hast. Hilf uns auch das Kreuz in unserm Stande geduldig tragen, und nach diesem Leben versammle uns in dein Reich zu allen gottseligen Eheleuten; der du lebest und regierest von Ewigkeit zu Ewigkeit. Amen.',
    ],
    source: 'Johann Habermann († 1590)',
  },
};

/** Prayed on Sunday, after the prayer for the whole house. */
export const PARENTS_PRAYER: TreasuryPrayer = {
  id: 'eltern',
  title: 'Gebet der Eltern für ihre Kinder',
  author: 'Johann Arndt († 1621)',
  text: {
    lines: [
      'Ach getreuer, lieber Gott und Vater, Schöpfer und Erhalter aller Kreaturen: Ich danke dir von Herzen für die Leibesfrüchte, so du mir durch deinen Segen gegeben hast, und bitte dich herzlich, weil du gesagt hast: du wollest deinen Heiligen Geist geben allen, die dich darum bitten: Begnadige auch meine armen Kinder mit deinem Heiligen Geist, der in ihnen die wahre Furcht Gottes anzünde, welche ist der Weisheit Anfang, und die rechte Klugheit, wer darnach tut, deß Lob bleibet ewiglich. Beselige sie auch mit deiner wahren Erkenntnis, behüte sie vor aller Abgötterei und falscher Lehre, lass sie in dem wahren seligmachenden Glauben und in aller Gottseligkeit aufwachsen, und darin bis ans Ende verharren. Gib ihnen ein gläubiges, gehorsames, demütiges Herz, auch die rechte Weisheit und Verstand, dass sie wachsen und zunehmen an Alter und Gnade bei Gott und den Menschen. Ach pflanze in ihr Herz die Liebe deines göttlichen Wortes, dass sie seien andächtig im Gebet und Gottesdienst, ehrerbietig gegen die Diener des Worts, und gegen jedermann aufrichtig in Handlung, schamhaftig in Gebärden, züchtig in Sitten, wahrhaftig in Worten, treu in Werken, fleißig in Geschäften, glückselig in Verrichtungen ihres Berufs und Amts, verständig in Sachen, richtig in allen Dingen, sanftmütig und freundlich gegen alle Menschen. Behüte sie vor allen Ärgernissen der argen Welt, dass sie nicht verführet werden durch böse Gesellschaft, dass sie nicht in Schlemmen und Unzucht geraten, dass sie ihnen ihr Leben nicht selber verkürzen, auch andere nicht beleidigen, sei ihr Schutz in aller Gefahr, dass sie nicht plötzlich umkommen, lass mich ja nicht Unehre und Schande, sondern Freude und Ehre an ihnen erleben, dass durch sie auch dein Reich vermehret, und die Zahl der Gläubigen groß werde, dass sie auch im Himmel um deinen Tisch her sitzen mögen als die himmlischen Ölzweige, und dich mit allen Auserwählten ehren, loben und preisen mögen, durch Jesum Christum, unsern Herrn. Amen.',
    ],
    source: 'Johann Arndt († 1621)',
  },
};

export const TREASURY: readonly TreasuryPrayer[] = [HUSBAND_PRAYER, PARENTS_PRAYER];
