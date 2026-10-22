/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

import pkg from './package.json' with { type: 'json' };

// Served from the root (mein.henoch.app); BASE_PATH=/pfad/ builds for a sub-path.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig(({ mode }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    // The Dogmatik stays out of the app until every day is read against the print; the tests and
    // the preview (npm run build:demo:dogmatik) switch it on.
    __DOGMATIK__: JSON.stringify(mode === 'test' || process.env.DOGMATIK === '1'),
  },
  // Without the PWA plugin (demo), the update hook resolves to a no-op stub.
  resolve:
    mode === 'demo' ? { alias: { 'virtual:pwa-register/react': '/src/demo/pwaRegisterStub.ts' } } : undefined,
  // The demo build is a single file without service worker and with hash routing.
  base: mode === 'demo' ? './' : base,
  // The demo is one file: chunks loaded later (the long books) are packed in as well.
  build:
    mode === 'demo'
      ? { outDir: 'dist-demo', assetsInlineLimit: 0, rollupOptions: { output: { inlineDynamicImports: true } } }
      : undefined,
  plugins: [
    react(),
    mode !== 'demo' && VitePWA({
      // A new version waits until the user chooses to update – never a reload mid-prayer.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon-64.png'],
      manifest: {
        id: base,
        name: 'Henoch',
        short_name: 'Henoch',
        description: 'Eine Ordnung für Morgen und Abend',
        lang: 'de',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F6F4EF',
        theme_color: '#131A26',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Everything the app needs ships in the bundle, including fonts.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // The three volumes of the Dogmatik are about 2 MB each; they belong offline as well.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: `${base}index.html`,
        // The preview under /vorschau/ has a service worker of its own; the app's must not answer for it.
        navigateFallbackDenylist: base === '/' ? [/^\/vorschau\//] : [],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
}));
