/**
 * Takes the corrections of a review into the volumes and marks those days as
 * read by hand ("geprueft"). The corrections stand in
 * reference/pieper/durchsicht/band-N.json, one entry per day:
 *
 *   "5": {
 *     "text": [["die bezeichnet Sache", "die bezeichnete Sache"], ["wird. Um", "wird.\n\nUm"]],
 *     "fussnoten": { "22": [["Ies. 9", "Jes. 9"]] },
 *     "seite": "8–10"
 *   }
 *
 * "text" works on the day's paragraphs joined by a blank line, so "\n\n" in a
 * replacement begins a new paragraph. Each text replaced must stand exactly
 * once. Days already marked are left alone, so the script may run again.
 *
 * Run: node scripts/dogmatik/durchsicht.mjs, then node scripts/dogmatik/build.mjs.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function replaceOnce(text, [from, to], where) {
  const n = text.split(from).length - 1;
  if (n !== 1) throw new Error(`${where}: „${from}“ steht ${n}-mal statt einmal.`);
  return text.replace(from, () => to);
}

let changed = 0;
for (const band of [1, 2, 3]) {
  const fixesFile = join(ROOT, `reference/pieper/durchsicht/band-${band}.json`);
  if (!existsSync(fixesFile)) continue;
  const fixes = JSON.parse(readFileSync(fixesFile, 'utf8'));
  const bookFile = join(ROOT, `data/dogmatik/band-${band}.json`);
  const book = JSON.parse(readFileSync(bookFile, 'utf8'));
  for (const [tag, fix] of Object.entries(fixes)) {
    const day = book.tage.find((d) => d.tag === Number(tag));
    if (!day) throw new Error(`Band ${band}: Tag ${tag} fehlt.`);
    if (day.geprueft) continue;
    const where = `Band ${band}, Tag ${tag}`;
    let text = day.absaetze.join('\n\n');
    for (const r of fix.text ?? []) text = replaceOnce(text, r, where);
    day.absaetze = text.split('\n\n');
    for (const [no, rs] of Object.entries(fix.fussnoten ?? {})) {
      if (!(no in day.fussnoten)) throw new Error(`${where}: Fußnote ${no} fehlt.`);
      for (const r of rs) day.fussnoten[no] = replaceOnce(day.fussnoten[no], r, `${where}, Fußnote ${no}`);
    }
    if (fix.seite) day.seite = fix.seite;
    day.geprueft = true;
    changed += 1;
  }
  writeFileSync(bookFile, `${JSON.stringify(book, null, 1)}\n`);
}
console.log(`${changed} Tage durchgesehen eingetragen.`);
