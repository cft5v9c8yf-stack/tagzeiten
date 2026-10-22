/**
 * Packs the demo build (vite build --mode demo) into one self-contained HTML
 * fragment: CSS and JS inline, fonts as data URIs (woff2 only).
 * Output: dist-demo/tagzeiten-demo.html, and dist-demo/tagzeiten-demo-sonntag.html
 * with the clock on the coming Sunday. With "dist-dogmatik" (npm run
 * build:demo:dogmatik): dist-dogmatik/henoch-dogmatik-vorschau.html, the app
 * with the Dogmatik switched on.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'dist-demo';
const html = readFileSync(join(dir, 'index.html'), 'utf8');

const cssHref = /<link rel="stylesheet"[^>]*href="\.\/([^"]+)"/.exec(html)?.[1];
const jsSrc = /<script type="module"[^>]*src="\.\/([^"]+)"/.exec(html)?.[1];
if (!cssHref || !jsSrc) throw new Error('Unexpected index.html shape');

let css = readFileSync(join(dir, cssHref), 'utf8');
// woff2 as data URI; drop the woff fallbacks (every target browser reads woff2).
css = css.replace(/,\s*url\([^)]*\.woff\)\s*format\("woff"\)/g, '');
css = css.replace(/url\(\/?\.?\/?(?:assets\/)?([^)]+\.woff2)\)/g, (_, f) => {
  const data = readFileSync(join(dir, 'assets', f.replace(/^.*\//, ''))).toString('base64');
  return `url(data:font/woff2;base64,${data})`;
});
const js = readFileSync(join(dir, jsSrc), 'utf8').replace(/<\/script/gi, '<\\/script');
const themeScript = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '';

// The Sunday preview: the same app with its clock on the coming Sunday (today, if it is
// one) at the present time of day. The demo data switch Sunday rest on (src/demo).
const sundayClock = `(() => {
  const RealDate = Date;
  const now = RealDate.now();
  const sunday = new RealDate(now);
  sunday.setDate(sunday.getDate() + ((7 - sunday.getDay()) % 7));
  const offset = sunday.getTime() - now;
  function SundayDate(...args) {
    if (!new.target) return new RealDate(RealDate.now() + offset).toString();
    return args.length ? new RealDate(...args) : new RealDate(RealDate.now() + offset);
  }
  SundayDate.prototype = RealDate.prototype;
  SundayDate.now = () => RealDate.now() + offset;
  SundayDate.parse = RealDate.parse;
  SundayDate.UTC = RealDate.UTC;
  window.Date = SundayDate;
  window.henochDemo = { sunday: true };
})();`;

const page = (title, extra = '') => `<title>${title}</title>
<meta name="description" content="Eine Ordnung für Morgen und Abend">
<script>${themeScript}</script>${extra}
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;
const pages =
  dir === 'dist-dogmatik'
    ? [['henoch-dogmatik-vorschau.html', page('Henoch Dogmatik-Vorschau')]]
    : [
        ['tagzeiten-demo.html', page('Henoch')],
        ['tagzeiten-demo-sonntag.html', page('Henoch Sonntagsvorschau', `\n<script>${sundayClock}</script>`)],
      ];
for (const [file, out] of pages) {
  writeFileSync(join(dir, file), out);
  console.log(`${dir}/${file} ${(out.length / 1024).toFixed(0)} KB`);
}
