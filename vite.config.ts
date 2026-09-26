/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

import pkg from './package.json' with { type: 'json' };

// Served from a sub-path on GitHub Pages (BASE_PATH=/tagzeiten/), from the root elsewhere.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig(({ mode }) => ({
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  // Without the PWA plugin (demo), the update hook resolves to a no-op stub.
  resolve:
    mode === 'demo' ? { alias: { 'virtual:pwa-register/react': '/src/demo/pwaRegisterStub.ts' } } : undefined,
  // The demo build is a single file without service worker and with hash routing.
  base: mode === 'demo' ? './' : base,
  build: mode === 'demo' ? { outDir: 'dist-demo', assetsInlineLimit: 0 } : undefined,
  plugins: [
    react(),
    mode !== 'demo' && VitePWA({
      // A new version waits until the user chooses to update – never a reload mid-prayer.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/apple-touch-icon.png', 'icons/icon.svg'],
      manifest: {
        id: base,
        name: 'Tagzeiten',
        short_name: 'Tagzeiten',
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
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
}));
