import { Link } from 'react-router';
import { FlowIcon } from './FlowIcon';

/** The way back at the top of a page: an arrow in the line of the Henoch icons, then where it leads. */
export function BackLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="back-link-to">
      <FlowIcon name="back" size={18} />
      {/* Read out as "Zurück: Arena"; a label that already says "Zurück" needs no more. */}
      {!(typeof children === 'string' && children.startsWith('Zurück')) && <><span className="visually-hidden">Zurück:</span> </>}
      {children}
    </Link>
  );
}
