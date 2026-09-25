import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { formatLong, formatShort } from '../domain/dates';
import { DemoBanner } from '../demo/DemoSetup';
import { LutherRose } from '../ui/LutherRose';
import { SectionIcon } from '../ui/SectionIcon';
import { UpdateBanner } from './UpdateBanner';
import { SECTIONS, SUNDAY_PATH } from './routes';
import { useSelectedDate, withDate } from './useSelectedDate';

/** Set once the app has opened; the start page is chosen only then. */
let launched = false;

export function Layout() {
  const { date, isToday } = useSelectedDate();
  const { pathname, search } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  const navigate = useNavigate();

  // The app opens on the Sunday: the week comes from it. Only on launch – "Heute" stays reachable.
  useEffect(() => {
    if (launched) return;
    launched = true;
    if (pathname === '/' && !search) navigate(SUNDAY_PATH, { replace: true });
  }, [pathname, search, navigate]);

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
          {/* The app's name stays the page heading for screen readers; Luther's word at Worms stands above. */}
          <h1 className="visually-hidden">Tagzeiten</h1>
          <p className="top-motto">Hier stehe ich und kann nicht anders!</p>
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
        {/* The four solas of the Reformation, at the end of every page, just above Luther's rose. */}
        <footer className="solas" lang="la">
          <span>Sola scriptura</span> · <span>Sola gratia</span> · <span>Sola fide</span> · <span>Solus Christus</span>
        </footer>
      </div>
      <nav className="tabs" aria-label="Bereiche">
        <ul>
          {SECTIONS.map((s) => (
            <li key={s.path}>
              <NavLink to={withDate(s.path, date, isToday)} end={s.path === '/'}>
                {/* All icons one size; the Sunday is Luther's rose. */}
                <span className="tab-icon">
                  {s.path === SUNDAY_PATH ? <LutherRose size={34} /> : <SectionIcon name={s.icon} size={34} />}
                </span>
                {s.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
