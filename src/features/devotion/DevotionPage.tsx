import { Navigate, NavLink, Outlet, useLocation } from 'react-router';
import { useSelectedDate, withDate } from '../../app/useSelectedDate';
import { FlowIcon } from '../../ui/FlowIcon';

/** Andacht: Stille Zeit in the morning, Vesper and Nachtgebet in the evening. */
export function DevotionPage() {
  const { date, isToday } = useSelectedDate();
  return (
    <>
      <nav className="devotion-switch" aria-label="Andacht">
        <NavLink to={withDate('/andacht/morgen', date, isToday)}>
          <FlowIcon name="sunrise" size={20} />
          Morgen
        </NavLink>
        <NavLink to={withDate('/andacht/abend', date, isToday)}>
          <FlowIcon name="moon" size={20} />
          Abend
        </NavLink>
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
