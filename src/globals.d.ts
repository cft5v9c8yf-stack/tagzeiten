declare const __APP_VERSION__: string;

interface Window {
  /** Demo build only: set in the Sunday preview by scripts/build-demo.mjs. */
  henochDemo?: { sunday?: boolean };
}
