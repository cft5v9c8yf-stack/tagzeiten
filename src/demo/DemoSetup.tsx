import { useEffect } from 'react';
import { useProfile, useStore } from '../data/hooks';
import { addDays } from '../domain/dates';

/** The Sunday preview (scripts/build-demo.mjs): the clock stands on Sunday. */
const sundayPreview = () => window.henochDemo?.sunday === true;

/**
 * Demo only: a few example entries so that the evening review of yesterday
 * shows up as a suggestion this morning. Written once into an empty database.
 * The Sunday preview also switches Sunday rest on.
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
    // Some weeks of habits, for the overview in the Rückblick: an even, human pattern, not perfect.
    for (let i = 2; i < 56; i++) {
      const k = addDays(today, -i);
      const wd = new Date(`${k}T12:00:00`).getDay();
      const habits: Record<string, boolean> = {};
      if ((i * i + 3 * i) % 10 < 6) habits.tablePrayer = true;
      if ((i * i) % 7 < 3) habits.blessChildren = true;
      if (wd === 0 && i % 21 !== 0) habits.worship = true;
      if (wd === 3 && i % 14 < 7) habits.catechismChildren = true;
      if (i === 12 || i === 40) habits.lordsSupper = true;
      store.updateDay(k, (d) => ({ ...d, habits: { ...d.habits, ...habits } }), { immediate: true });
    }
    store.updateProfile(
      (p) => ({
        ...p,
        habits: p.habits.map((h) => (h.id === 'blessChildren' ? { ...h, focus: true } : h)),
        showHabitHistory: true,
        sundayRest: sundayPreview() || p.sundayRest,
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
            id: 'demo-forge',
            kind: 'forge',
            meetingDate: addDays(today, 5),
            createdAt: new Date(`${addDays(today, -1)}T19:30:00`).getTime(),
            updatedAt: new Date(`${addDays(today, -1)}T19:30:00`).getTime(),
            verses: ['Galater 6,2'],
            concerns: ['Weisheit für die Entscheidung im Beruf', 'Treue im Gebet'],
            text: '',
            points: [
              { text: 'Wie ich morgens die Stille Zeit halte, wenn die Kinder früh wach sind', done: false },
              { text: 'Rat zur Entscheidung im Beruf', done: false },
            ],
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
        house: {
          wife: { name: 'Anna', concern: 'Kraft für die neue Woche' },
          children: [
            { id: 'demo-paul', name: 'Paul', sex: 'son', concern: 'Prüfung am Freitag' },
            { id: 'demo-marie', name: 'Marie', sex: 'daughter', concern: '' },
          ],
        },
        answered: [
          { id: 'demo-a1', date: addDays(today, -5), person: 'Marie', role: 'daughter', concern: 'Freundin in der neuen Klasse' },
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
  const resting = useProfile().sundayRest;
  return (
    <p className="demo-banner">
      {sundayPreview()
        ? `Sonntagsvorschau mit Beispieldaten: Die Uhr ist auf Sonntag gestellt${resting ? ', die Sonntagsruhe ist eingeschaltet' : ''}.`
        : 'Vorschau mit Beispieldaten.'}{' '}
      Einträge bleiben nur in diesem Browser. Export und Import sind in der Vorschau gesperrt; in der installierten
      App funktionieren sie.
    </p>
  );
}
