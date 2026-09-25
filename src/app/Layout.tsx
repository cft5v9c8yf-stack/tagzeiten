import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { formatLong, formatShort } from '../domain/dates';
import { DemoBanner } from '../demo/DemoSetup';
import { SectionIcon } from '../ui/SectionIcon';
import { UpdateBanner } from './UpdateBanner';
import { SECTIONS } from './routes';
import { useSelectedDate, withDate } from './useSelectedDate';

export function Layout() {
  const { date, isToday } = useSelectedDate();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // On section change: back to the top, and move focus into the new content
  // so keyboard and screen-reader users land where the page begins.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Zum Inhalt
      </a>
      <div className="wrap">
        <header className="top">
          <h1>Tagzeiten</h1>
          <div className="date">
            {isToday ? (
              // On Today, the date heads the page itself (with the church year).
              pathname === '/' ? null : formatLong(date)
            ) : (
              <>
                {formatShort(date)}
                <Link to={pathname}>Heute</Link>
              </>
            )}
          </div>
        </header>
        <main id="main" ref={mainRef} tabIndex={-1} style={{ outline: 'none' }}>
          {import.meta.env.MODE === 'demo' && <DemoBanner />}
          <UpdateBanner />
          <Outlet />
        </main>
      </div>
      <nav className="tabs" aria-label="Bereiche">
        <ul>
          {SECTIONS.map((s) => (
            <li key={s.path} className={s.path === '/' ? 'tab-today' : undefined}>
              <NavLink to={withDate(s.path, date, isToday)} end={s.path === '/'}>
                {s.path === '/' ? (
                  <span className="today-ring">
                    <SectionIcon name={s.icon} size={28} />
                  </span>
                ) : (
                  <SectionIcon name={s.icon} />
                )}
                {s.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
