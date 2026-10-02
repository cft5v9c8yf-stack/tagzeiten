/** Offers a text file for download (the export belongs to the user, rule 11). */
export function downloadText(filename: string, text: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Per-device conveniences that are not part of the user's entries: everything
 * the app keeps under "tz:" in local and session storage (rule 11: deleting
 * means all of it, also what a later version adds).
 */
export function clearDevicePreferences(): void {
  for (const get of [() => localStorage, () => sessionStorage]) {
    try {
      const store = get();
      const keys = Array.from({ length: store.length }, (_, i) => store.key(i)).filter((k): k is string => !!k?.startsWith('tz:'));
      for (const k of keys) store.removeItem(k);
    } catch {
      // storage unavailable: nothing to clear
    }
  }
}
