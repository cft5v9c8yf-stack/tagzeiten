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

/** Per-device conveniences that are not part of the user's entries. */
export function clearDevicePreferences(): void {
  for (const [store, key] of [
    [localStorage, 'tz:family'],
    [localStorage, 'tz:theme'],
    [localStorage, 'tz:journal'],
    [sessionStorage, 'tz:timer'],
  ] as const) {
    try {
      store.removeItem(key);
    } catch {
      // storage unavailable: nothing to clear
    }
  }
}
