import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { readStoredTheme } from '../app/theme';
import { useToast } from '../app/Toast';
import { Store } from './store';

const StoreContext = createContext<Store | null>(null);

/** Error messages in the UI's language. */
function saveErrorMessage(error: unknown): string {
  const name = (error as { name?: string } | null)?.name ?? '';
  if (name === 'QuotaExceededError' || /quota/i.test(String(error))) {
    return 'Speicher voll – nicht gespeichert. Bitte ältere Einträge exportieren.';
  }
  return 'Nicht gespeichert.';
}

/**
 * Opens the database, loads everything and keeps it saved:
 * pending writes are flushed whenever the page is hidden or closed.
 */
export function StoreProvider({ children, store: injected }: { children: ReactNode; store?: Store }) {
  const toast = useToast();
  const [store] = useState(() => injected ?? new Store({
        onError: (e) => toast(saveErrorMessage(e.error)),
        seedProfile: { theme: readStoredTheme() },
      }));
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    let alive = true;
    store
      .load()
      .then(() => alive && setState('ready'))
      .catch((e: unknown) => {
        console.error(e);
        if (alive) setState('failed');
      });
    // Ask the browser to keep our data (Safari may otherwise evict it after inactivity).
    void navigator.storage?.persist?.().catch(() => false);
    return () => {
      alive = false;
    };
  }, [store]);

  useEffect(() => {
    const flush = () => void store.suspend();
    const onVisibility = () => document.visibilityState === 'hidden' && flush();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
    };
  }, [store]);

  if (state === 'loading') return <div className="loading">Einen Moment …</div>;
  if (state === 'failed') {
    return (
      <div className="loading">
        Der Speicher dieses Geräts ist nicht erreichbar. Im privaten Modus des Browsers kann die App nichts
        speichern.
      </div>
    );
  }
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}
