import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { formatLong, formatShort } from '../domain/dates';
import { DemoBanner } from '../demo/DemoSetup';
import { FlowIcon } from '../ui/FlowIcon';
import { ICON_SIZE } from '../ui/iconBase';
import { BackSlotContext, PageHeader } from '../ui/PageHeader';
import { SectionIcon } from '../ui/SectionIcon';
import { UpdateBanner } from './UpdateBanner';
import { inSection, SECTIONS, SUNDAY_PATH } from './routes';
import { useSelectedDate, withDate } from './useSelectedDate';

/** The title of the page head: the section the page belongs to. */
function pageTitle(pathname: string): string {
  if (pathname.startsWith(SUNDAY_PATH)) return 'Sonntag';
  if (pathname.startsWith('/suche')) return 'Suchen';
  if (pathname.startsWith('/kirchenjahr')) return 'Heute';
  return SECTIONS.find((s) => inSection(s, pathname))?.label ?? 'Henoch';
}

export function Layout() {
  const { date, isToday } = useSelectedDate();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  const [backSlot, setBackSlot] = useState<HTMLElement | null>(null);
  const title = pageTitle(pathname);
  // Today and the Sunday head their pages with the date themselves; elsewhere
  // the date stands under the title, or which other day is open.
  const own = pathname === '/' || pathname.startsWith(SUNDAY_PATH);
  const line = isToday ? (
    pathname.startsWith('/mehr') ? (
      'Henoch – mit Gott durch den Tag'
    ) : own ? null : (
      formatLong(date)
    )
  ) : (
    // Another day is open: say which, with the way back to today.
    <>
      {formatShort(date)}
      <Link to={pathname}>Heute</Link>
    </>
  );

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
      <BackSlotContext.Provider value={backSlot}>
      <div className="wrap">
        <PageHeader
          title={title}
          backRef={setBackSlot}
          line={line}
          action={
            !pathname.startsWith('/suche') && (
              <Link className="search-link" to="/suche" aria-label="Suchen">
                <FlowIcon name="search" size={ICON_SIZE.l} plain />
              </Link>
            )
          }
        />
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
      </BackSlotContext.Provider>
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
