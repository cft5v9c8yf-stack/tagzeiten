import { APOLOGY, APOLOGY_SOURCE, APOLOGY_TITLE } from '../../content/apology';
import { BookParts } from './BookParts';

/** Melanchthon's Apology, in Jonas's German: preface and articles as cards. */
export default function ApologyBook() {
  return (
    <>
      <p className="book-source">{APOLOGY_TITLE}</p>
      <BookParts parts={APOLOGY} prefix="ap" />
      <p className="small muted">{APOLOGY_SOURCE}</p>
    </>
  );
}
