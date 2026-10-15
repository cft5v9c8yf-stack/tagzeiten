import { Link } from 'react-router';
import { FlowIcon } from './FlowIcon';

/**
 * The way back at the top of a page: only an arrow in the line of the Henoch
 * icons. Where it leads is read out ("Zurück: Arena") and shown on hover.
 */
export function BackLink({ to, children }: { to: string; children: string }) {
  const label = children.startsWith('Zurück') ? children : `Zurück: ${children}`;
  return (
    <Link to={to} className="back-link-to" title={label}>
      <FlowIcon name="back" size={22} />
      <span className="visually-hidden">{label}</span>
    </Link>
  );
}
