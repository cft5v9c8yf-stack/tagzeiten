/**
 * Packs the demo build (vite build --mode demo) into one self-contained HTML
 * fragment: CSS and JS inline, fonts as data URIs (woff2 only).
 * Output: dist-demo/tagzeiten-demo.html
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'dist-demo';
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

const out = `<title>Tagzeiten</title>
<meta name="description" content="Eine Ordnung für Morgen und Abend">
<script>${themeScript}</script>
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;
writeFileSync(join(dir, 'tagzeiten-demo.html'), out);
console.log(`dist-demo/tagzeiten-demo.html ${(out.length / 1024).toFixed(0)} KB`);
