import { Link } from 'react-router';

export function NotFound() {
  return (
    <>
      <h2>Diese Seite gibt es nicht</h2>
      <p>
        <Link to="/">Zurück zu Heute</Link>
      </p>
    </>
  );
}
