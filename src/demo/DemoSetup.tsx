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
      (p) => ({
        ...p,
        habits: p.habits.map((h) => (h.id === 'blessChildren' ? { ...h, focus: true } : h)),
        arena: [
          {
            id: 'demo-1',
            createdAt: new Date(`${addDays(today, -2)}T21:15:00`).getTime(),
            updatedAt: new Date(`${addDays(today, -2)}T21:15:00`).getTime(),
            verses: ['1. Korinther 10,13', 'Psalm 55,23'],
            concerns: ['Geduld mit den Kindern', 'Ruhe vor dem Gespräch mit dem Chef'],
            text: 'Heute gereizt gewesen, schon am Frühstückstisch.\nDie Sorge um die Arbeit sitzt mir im Nacken. Ich will sie abgeben und nicht wieder aufheben.',
          },
          {
            id: 'demo-0',
            createdAt: new Date(`${addDays(today, -20)}T21:40:00`).getTime(),
            updatedAt: new Date(`${addDays(today, -20)}T21:40:00`).getTime(),
            archivedAt: new Date(`${addDays(today, -6)}T20:00:00`).getTime(),
            verses: ['Römer 8,37'],
            concerns: ['Klarheit bei der Entscheidung'],
            text: 'Die Frage nach der neuen Stelle lässt mich nicht los.',
          },
        ],
        prayer: {
          concerns: ['Frau und Kinder', 'Gemeinde', 'Verfolgte Kirche', 'Missionare', 'Obrigkeit', 'Nachbarn'],
          daily: ['Frau und Kinder', 'Gemeinde'],
          weekly: { 1: ['Verfolgte Kirche'], 3: ['Missionare', 'Nachbarn'], 5: ['Obrigkeit'] },
        },
        catechism: {
          ...p.catechism,
          memorized: Object.fromEntries(
            ['commandments.0', 'commandments.1', 'commandments.2', 'commandments.3', 'creed.0', 'lordsPrayer.0'].map((id) => [id, true]),
          ),
        },
      }),
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
