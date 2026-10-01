import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { formatLong, formatShort } from '../domain/dates';
import { DemoBanner } from '../demo/DemoSetup';
import { SectionIcon } from '../ui/SectionIcon';
import { UpdateBanner } from './UpdateBanner';
import { inSection, SECTIONS, SUNDAY_PATH } from './routes';
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
          {isToday && pathname.startsWith('/mehr') ? (
            // Under "Mehr", the name and line of the app.
            <h1 className="app-name">
              Henoch <span className="app-line">– mit Gott durch den Tag</span>
            </h1>
          ) : (
            <>
              <h1 className="visually-hidden">Henoch</h1>
              <div className="date">
                {isToday ? (
                  // Today and the Sunday head their pages themselves; elsewhere the date.
                  pathname === '/' || pathname.startsWith(SUNDAY_PATH) ? null : formatLong(date)
                ) : (
                  // Another day is open: say which, with the way back to today.
                  <>
                    {formatShort(date)}
                    <Link to={pathname}>Heute</Link>
                  </>
                )}
              </div>
            </>
          )}
          {!pathname.startsWith('/suche') && (
            <Link className="search-link" to="/suche" aria-label="Suchen">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
                <circle cx="10.5" cy="10.5" r="6" />
                <path d="m15 15 5.5 5.5" />
              </svg>
            </Link>
          )}
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
              <Link
                to={withDate(s.path, date, isToday)}
                className={inSection(s, pathname) ? 'active' : undefined}
                aria-current={inSection(s, pathname) ? 'page' : undefined}
              >
                <span className="tab-icon">
                  <SectionIcon name={s.icon} size={34} />
                </span>
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
