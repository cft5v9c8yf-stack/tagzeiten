import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** The place in the page head where the way back (BackLink) stands, the same on every sub-page. */
export const BackSlotContext = createContext<HTMLElement | null>(null);

/** Puts the way back into the page head when there is one; without a head (tests, bare pages) it stays where it is. */
export function InBackSlot({ children }: { children: ReactNode }) {
  const slot = useContext(BackSlotContext);
  return slot ? createPortal(children, slot) : <>{children}</>;
}

/**
 * The head of every page: the way back (sub-pages only) and the title on the
 * left, the search on the right, and under them one quiet line where one is
 * needed (the date, or the line of the app).
 */
export function PageHeader({
  title,
  line,
  action,
  backRef,
}: {
  title: string;
  line?: ReactNode;
  action?: ReactNode;
  backRef: (el: HTMLElement | null) => void;
}) {
  return (
    <header className="top">
      <div className="top-row">
        <span className="top-back" ref={backRef} />
        <h1 className="top-title">{title}</h1>
        {action}
      </div>
      {line && <p className="top-line">{line}</p>}
    </header>
  );
}
