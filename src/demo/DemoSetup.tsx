import { useEffect } from 'react';
import { useStore } from '../data/hooks';
import { addDays } from '../domain/dates';

/**
 * Demo only: a few example entries so that the evening review of yesterday
 * shows up as a suggestion this morning. Written once into an empty database.
 */
export function DemoSetup() {
  const store = useStore();
  useEffect(() => {
    if (store.allDays().length > 0) return;
    const today = store.today();
    const y = addDays(today, -1);
    store.updateDay(y, (d) => ({
      ...d,
      morning: {
        ...d.morning,
        done: true,
        form: 'short',
        verse: 'Sei stille dem HERRN und warte auf ihn.',
        verseRef: 'Psalm 37,7',
        three: { word: 'Paul anrufen und ihm den Vers weitergeben', house: 'Mit Anna nach dem Essen spazieren', work: 'Angebot für die Schule fertig' },
      },
      evening: {
        ...d.evening,
        vespersDone: true,
        complineDone: true,
        marks: { word: 'minus', house: 'plus', work: 'tilde' },
        carry: { word: 'again', work: 'drop' },
        thanks: ['das Gespräch beim Abendessen'],
      },
    }), { immediate: true });
    store.updateDay(addDays(today, -3), (d) => ({ ...d, morning: { ...d.morning, done: true } }), { immediate: true });
    store.updateProfile(
      (p) => ({ ...p, habits: p.habits.map((h) => (h.id === 'blessChildren' ? { ...h, focus: true } : h)) }),
      { immediate: true },
    );
  }, [store]);
  return null;
}

export function DemoBanner() {
  return (
    <p className="demo-banner">
      Vorschau mit Beispieldaten. Einträge bleiben nur in diesem Browser. Export und Import sind in der Vorschau
      gesperrt; in der installierten App funktionieren sie.
    </p>
  );
}
