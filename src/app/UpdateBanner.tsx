import { useRegisterSW } from 'virtual:pwa-register/react';
import { useStore } from '../data/hooks';

const HOUR = 60 * 60 * 1000;

/**
 * Registers the service worker. A new version is announced quietly and
 * installed only when the user asks – never a reload in the middle of prayer.
 */
export function UpdateBanner() {
  const store = useStore();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      // Look for updates now and then while the app is open.
      setInterval(() => {
        if (document.visibilityState === 'visible' && navigator.onLine) void registration.update();
      }, HOUR);
    },
  });

  if (!needRefresh) return null;
  return (
    <div className="update-banner" role="status">
      <span>Eine neue Version der App ist bereit.</span>
      <span className="button-row">
        <button
          type="button"
          className="btn primary"
          onClick={async () => {
            await store.suspend();
            await updateServiceWorker(true);
          }}
        >
          Jetzt aktualisieren
        </button>
        <button type="button" className="btn quiet" onClick={() => setNeedRefresh(false)}>
          Später
        </button>
      </span>
    </div>
  );
}
