#!/usr/bin/env node
/**
 * The automatic parameters of the release (docs/freigabe.md, part A). Run on the branch "vorschau":
 *
 *   LUT1912_DIR=../lut1912/package/text node scripts/freigabe.mjs
 *
 * Prints every parameter as done or not; the exit code is 1 if one is not met.
 * A8 (the runs on GitHub) is checked by Claude on GitHub, not here.
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const run = (cmd, env = {}) => execSync(cmd, { stdio: 'pipe', encoding: 'utf8', env: { ...process.env, ...env } });
const results = [];
const check = (id, name, fn) => {
  try {
    const note = fn();
    results.push({ id, name, ok: true, note: note ?? '' });
  } catch (e) {
    const out = `${e.stdout ?? ''}${e.stderr ?? ''}`.trim().split('\n').slice(-6).join('\n');
    results.push({ id, name, ok: false, note: e.shortMessage ? `${e.shortMessage}\n${out}` : e.message });
  }
};
const semver = (v) => v.split('.').map(Number);
const newer = (a, b) => {
  const [x, y] = [semver(a), semver(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};

run('git fetch -q origin main');

check('A1', 'Stand des Zweigs', () => {
  const branch = run('git rev-parse --abbrev-ref HEAD').trim();
  if (branch !== 'vorschau') throw new Error(`Du stehst auf „${branch}“, nicht auf „vorschau“.`);
  if (run('git status --porcelain').trim()) throw new Error('Das Arbeitsverzeichnis ist nicht sauber.');
  try {
    run('git merge-base --is-ancestor origin/main HEAD');
  } catch {
    throw new Error('main ist nicht in vorschau enthalten: erst `git merge origin/main`.');
  }
});

check('A2', 'Version', () => {
  const here = JSON.parse(readFileSync('package.json', 'utf8')).version;
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8')).version;
  const main = JSON.parse(run('git show origin/main:package.json')).version;
  if (here !== lock) throw new Error(`package.json ${here} und package-lock.json ${lock} sind verschieden.`);
  if (!newer(here, main)) throw new Error(`Version ${here} ist nicht höher als die auf main (${main}).`);
  return `${main} → ${here}`;
});

check('A3', 'Namen, die nie wechseln', () => {
  const db = readFileSync('src/data/db.ts', 'utf8');
  const backup = readFileSync('src/domain/backup.ts', 'utf8');
  if (!/__PREVIEW__ \? 'tagzeiten-vorschau' : 'tagzeiten'/.test(db) && !/constructor\(name = 'tagzeiten'\)/.test(db))
    throw new Error("Der Name der Datenbank ist nicht mehr 'tagzeiten'.");
  if (!/BACKUP_FORMAT\s*=\s*'tagzeiten'/.test(backup)) throw new Error("BACKUP_FORMAT ist nicht mehr 'tagzeiten'.");
});

check('A4', 'Tests', () => {
  const lut = process.env.LUT1912_DIR;
  if (!lut) throw new Error('LUT1912_DIR fehlt: die Bibelverse würden nicht gegen Luther 1912 geprüft.');
  const out = run('npx vitest run', { LUT1912_DIR: lut });
  return out.split('\n').find((l) => /Tests\s/.test(l))?.trim();
});

check('A5', 'Bau der App', () => void run('npm run build'));
check('A6', 'Bau der Demo', () => void run('npm run build:demo'));
check('A7', 'Bau der Vorschau', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vorschau-'));
  try {
    run(`npx vite build --outDir ${dir}`, { BASE_PATH: '/vorschau/', PREVIEW: '1' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

for (const r of results) console.log(`${r.ok ? 'erfüllt   ' : 'NICHT      '} ${r.id}  ${r.name}${r.note ? ` – ${r.note}` : ''}`);
const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n${failed.length} Parameter nicht erfüllt: nicht freigeben.` : '\nAlle automatischen Parameter erfüllt (A8 prüft Claude auf GitHub).');
process.exit(failed.length ? 1 : 0);
