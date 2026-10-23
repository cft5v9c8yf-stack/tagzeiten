declare const __APP_VERSION__: string;
/** Whether the Dogmatik is in this build (vite.config.ts). */
declare const __DOGMATIK__: boolean;
/** The preview under /vorschau/ (PREVIEW=1): own database, own name, a band on top. */
declare const __PREVIEW__: boolean;

interface Window {
  /** Demo build only: set in the Sunday preview by scripts/build-demo.mjs. */
  henochDemo?: { sunday?: boolean };
}
