import { Link } from 'react-router';
import { useSelectedDate, withDate } from '../app/useSelectedDate';

/** Under the tab "Wort": the Bible (reading plan) and the teaching (catechism, confessions), side by side. */
export function WordSwitch({ current }: { current: 'bible' | 'teaching' }) {
  const { date, isToday } = useSelectedDate();
  const items = [
    { key: 'bible', label: 'Bibel', to: '/bibel' },
    { key: 'teaching', label: 'Lehre', to: '/katechismus' },
  ] as const;
  return (
    <>
      <h2>Wort</h2>
      <nav className="seg word-switch" aria-label="Bibel oder Lehre">
        {items.map((it) => (
          <Link key={it.key} to={withDate(it.to, date, isToday)} aria-current={it.key === current ? 'page' : undefined}>
            {it.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
