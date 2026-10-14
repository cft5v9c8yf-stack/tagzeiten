/**
 * A Bible reference as plain text. The printed Bible is what is read (rule 13):
 * no link, no embedded passage.
 */
export function BibleRef({ reference }: { reference: string }) {
  return <span className="bible-ref">{reference}</span>;
}
