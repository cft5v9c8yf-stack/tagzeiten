import { Navigate, NavLink, Outlet, useLocation } from 'react-router';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';

/** Andacht: Stille Zeit in the morning, Vesper and Nachtgebet in the evening. */
export function DevotionPage() {
  const { date, isToday } = useSelectedDate();
  return (
    <>
      <nav className="seg devotion-switch" aria-label="Andacht">
        <NavLink to={withDate('/andacht/morgen', date, isToday)}>Morgen</NavLink>
        <NavLink to={withDate('/andacht/abend', date, isToday)}>Abend</NavLink>
      </nav>
      <Outlet />
    </>
  );
}

/** "/andacht" opens the morning before noon, the evening after. */
export function DevotionIndex() {
  const { search } = useLocation();
  const part = new Date().getHours() < 12 ? 'morgen' : 'abend';
  return <Navigate to={`/andacht/${part}${search}`} replace />;
}

/** Old addresses (/morgen, /abend) lead to their place under Andacht. */
export function DevotionRedirect({ part }: { part: 'morgen' | 'abend' }) {
  const { search } = useLocation();
  return <Navigate to={`/andacht/${part}${search}`} replace />;
}
