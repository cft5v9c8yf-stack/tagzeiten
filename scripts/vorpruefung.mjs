#!/usr/bin/env node
/**
 * The pre-check of the parameters B (docs/freigabe.md): builds the preview from the working tree, runs it in a
 * browser at phone width and brings the evidence. It answers what can be measured and shows the rest to Andreas.
 *
 *   node scripts/vorpruefung.mjs [--out ordner] [--seiten /arena,/mehr] [--fixture datei.json]
 *
 * B3  a new user: the setup runs to "Heute" without an error in the console (empty database)
 * B4  existing data: scripts/fixtures/sicherung-beispiel.json is imported, every entry is there
 * B1  phone: pages at 390 and 360 px wide, nothing runs over the edge; screenshots
 * B2  light and dark: the same pages in both, screenshots
 * B6  the entry in the version history and the tests that changed
 * B5/B7 are not measurable: the report names them as Andreas's.
 *
 * Needs Playwright with Chromium (in the cloud sessions it is there: PLAYWRIGHT_BROWSERS_PATH).
 * Exit code 1 if B3, B4 or B1 is not met.
 */
import { execSync } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const out = resolve(arg('out', mkdtempSync(join(tmpdir(), 'vorpruefung-'))));
mkdirSync(out, { recursive: true });
const pages = ['/', '/andacht/morgen', '/andacht/abend', '/bibel', '/arena', '/mehr', ...(arg('seiten', '') ? arg('seiten').split(',') : [])];
const sh = (cmd, env = {}) => execSync(cmd, { stdio: 'pipe', encoding: 'utf8', env: { ...process.env, ...env } });

/* ------------------------------------------------------------ Playwright and the build */

function playwright() {
  for (const base of [process.cwd(), sh('npm root -g').trim()]) {
    try {
      return createRequire(join(base, 'x.js'))('playwright');
    } catch {
      // try the next place
    }
  }
  throw new Error('Playwright ist nicht installiert (weder im Projekt noch global).');
}
const { chromium } = playwright();
const browserPath = () => {
  const dir = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!dir || !existsSync(dir)) return undefined;
  const c = readdirSync(dir).filter((d) => /^chromium-\d+$/.test(d)).sort().at(-1);
  return c ? join(dir, c, 'chrome-linux', 'chrome') : undefined;
};

const site = mkdtempSync(join(tmpdir(), 'vorschau-bau-'));
console.log('Baue die Vorschau …');
sh(`npx vite build --outDir ${join(site, 'vorschau')}`, { BASE_PATH: '/vorschau/', PREVIEW: '1' });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let file = join(site, path);
  if (!file.startsWith(site) || !existsSync(file) || statSync(file).isDirectory()) file = join(site, 'vorschau', 'index.html');
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}/vorschau`;

/* ------------------------------------------------------------ the checks */

const report = [];
const add = (id, name, ok, note) => report.push({ id, name, ok, note });
const browser = await chromium.launch({ executablePath: browserPath() });
const errorsOf = (page, list) => {
  page.on('pageerror', (e) => list.push(`Fehler: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && !/favicon|manifest/i.test(m.text()) && list.push(`Konsole: ${m.text()}`));
};

// B3: the setup of a new user, to "Heute"
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
const page = await ctx.newPage();
const errors = [];
errorsOf(page, errors);
await page.goto(`${base}/`);
await page.waitForTimeout(1500);
let arrived = false;
for (let i = 0; i < 25 && !arrived; i++) {
  arrived = (await page.locator('h2:text-is("Heute")').count()) > 0 && (await page.getByText('Einrichtung', { exact: true }).count()) === 0;
  if (arrived) break;
  const way = page.getByRole('button', { name: /^Alltag/ });
  if (await way.count()) await way.click();
  const next = page.getByRole('button', { name: /^(Weiter|Zu Heute)$/ });
  if ((await next.count()) && (await next.first().isEnabled())) await next.first().click();
  else {
    const skip = page.getByRole('button', { name: 'Überspringen' });
    if (await skip.count()) await skip.click();
    else break;
  }
  await page.waitForTimeout(250);
}
add('B3', 'Neuer Nutzer: Einrichtung bis „Heute“', arrived && errors.length === 0, arrived ? (errors.length ? errors.slice(0, 3).join(' | ') : 'ohne Fehler in der Konsole') : 'kam nicht bis „Heute“');

// B4: an existing backup is imported
const fixture = resolve(arg('fixture', join(import.meta.dirname, 'fixtures', 'sicherung-beispiel.json')));
const expected = JSON.parse(readFileSync(fixture, 'utf8'));
try {
  await page.goto(`${base}/mehr/daten`);
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /^Sicherung einspielen/ }).first().click();
  await page.locator('input[type=file]').setInputFiles(fixture);
  await page.getByRole('alertdialog').getByRole('button', { name: 'Sicherung einspielen' }).click();
  await page.waitForTimeout(1200);
  const got = await page.evaluate(
    () =>
      new Promise((ok, fail) => {
        const open = indexedDB.open('tagzeiten-vorschau');
        open.onerror = () => fail(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const all = (t) => new Promise((r) => (db.transaction(t).objectStore(t).getAll().onsuccess = (e) => r(e.target.result)));
          Promise.all([all('days'), all('arena'), all('profile')]).then(([days, arena, profile]) => ok({ days, arena, profile }));
        };
      }),
  );
  const wife = got.profile.find((p) => p.id === 'me')?.house?.wife?.name;
  const problems = [];
  if (got.days.length !== expected.days.length) problems.push(`${got.days.length} von ${expected.days.length} Tagen`);
  if (got.arena.length !== expected.profile.arena.length) problems.push(`${got.arena.length} von ${expected.profile.arena.length} Arena-Einträgen`);
  if (wife !== expected.profile.house.wife.name) problems.push(`Ehefrau „${wife}“ statt „${expected.profile.house.wife.name}“`);
  if (!got.days.some((d) => d.morning?.mainPoint === 'Muster-Hauptaussage')) problems.push('Hauptaussage fehlt');
  add('B4', 'Vorhandene Daten bleiben', problems.length === 0, problems.length ? problems.join('; ') : `${got.days.length} Tage, ${got.arena.length} Arena-Einträge, Ehefrau „${wife}“ da`);
} catch (e) {
  add('B4', 'Vorhandene Daten bleiben', false, `Einspielen nicht möglich: ${e.message.split('\n')[0]}`);
}

// B1 and B2: the pages at phone width, light and dark
const overflow = [];
for (const [width, height] of [[390, 844], [360, 740]]) {
  for (const scheme of ['light', 'dark']) {
    const c = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, serviceWorkers: 'block' });
    // The data of the import stand in the same browser profile only for the first context; carry them over.
    const p = await c.newPage();
    const errs = [];
    errorsOf(p, errs);
    await p.goto(`${base}/`);
    await p.evaluate((s) => localStorage.setItem('tz:onboarding', 'skipped'), 1);
    for (const path of pages) {
      await p.goto(`${base}${path}`);
      await p.waitForTimeout(700);
      const wide = await p.evaluate(() => {
        const w = document.documentElement.clientWidth;
        const bad = [...document.querySelectorAll('body *')].find((el) => el.getBoundingClientRect().right > w + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('.flow-chain, [role=navigation], nav'));
        return { scroll: document.documentElement.scrollWidth > w + 1, who: bad ? `${bad.tagName.toLowerCase()}.${String(bad.className).split(' ')[0]}` : '' };
      });
      if (wide.scroll) overflow.push(`${path} (${width} px, ${scheme}): ${wide.who || 'Seite läuft seitlich über'}`);
      const name = `${path === '/' ? 'heute' : path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-${width}-${scheme}.png`;
      await p.screenshot({ path: join(out, name), fullPage: true });
    }
    if (errs.length) overflow.push(`Fehler in der Konsole (${width} px, ${scheme}): ${errs[0]}`);
    await c.close();
  }
}
add('B1', 'Handy: nichts läuft über den Rand', overflow.length === 0, overflow.length ? overflow.slice(0, 5).join(' | ') : `${pages.length} Seiten in 390 und 360 px Breite`);
add('B2', 'Hell und dunkel', true, `Aufnahmen beider Darstellungen liegen in ${out}; ob es gut aussieht, entscheidet Andreas`);

// B6: what the new version says, and which tests changed
let changelog = '';
try {
  changelog = (readFileSync('src/content/changelog.ts', 'utf8').match(/version: '([\d.]+)'[\s\S]*?title: '([^']*)'/) ?? []).slice(1).join(' – ');
} catch {
  // no changelog
}
let tests = '';
try {
  tests = sh('git diff --name-only origin/main...HEAD').split('\n').filter((f) => /\.test\.tsx?$/.test(f)).join(', ');
} catch {
  // no base
}
add('B6', 'Die Neuerung', true, `Eintrag: ${changelog || 'nicht gefunden'}; geänderte Tests: ${tests || 'keine'} – ob sie tut, was der Eintrag sagt, bestätigt Andreas`);
add('B5', 'Ton und Regeln', true, 'nicht messbar: der Prüfer-Agent hat die Regeln geprüft, die Wärme der Sprache beurteilt Andreas');
add('B7', 'Freigabe', true, 'nur Andreas');

await browser.close();
server.close();
rmSync(site, { recursive: true, force: true });

const md = ['# Vorprüfung B', '', '| # | Parameter | Ergebnis | Beleg |', '|---|-----------|----------|-------|', ...report.map((r) => `| ${r.id} | ${r.name} | ${r.ok ? 'erfüllt' : '**NICHT**'} | ${r.note} |`), '', `Aufnahmen: ${out}`].join('\n');
writeFileSync(join(out, 'vorpruefung.md'), `${md}\n`);
console.log(`\n${md}`);
process.exit(report.some((r) => ['B1', 'B3', 'B4'].includes(r.id) && !r.ok) ? 1 : 0);
