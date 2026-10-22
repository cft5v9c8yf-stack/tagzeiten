/**
 * The preview build (PREVIEW=1, served under /vorschau/ on the same address as
 * the app): its per-device conveniences under "tz:" are kept apart from those of
 * the app, so the two never read or clear each other's. The entries are apart
 * already: the preview has a database of its own (data/db.ts).
 */
const PREFIX = 'tz:';
const OWN = 'tz:vorschau:';

if (__PREVIEW__) {
  try {
    const local = window.localStorage;
    const map = (k: string) => (k.startsWith(PREFIX) && !k.startsWith(OWN) ? OWN + k.slice(PREFIX.length) : k);
    const { getItem, setItem, removeItem } = Storage.prototype;
    Storage.prototype.getItem = function (this: Storage, k: string) {
      return getItem.call(this, this === local ? map(k) : k);
    };
    Storage.prototype.setItem = function (this: Storage, k: string, v: string) {
      setItem.call(this, this === local ? map(k) : k, v);
    };
    Storage.prototype.removeItem = function (this: Storage, k: string) {
      removeItem.call(this, this === local ? map(k) : k);
    };
  } catch {
    // No storage: nothing to keep apart.
  }
}

export {};
