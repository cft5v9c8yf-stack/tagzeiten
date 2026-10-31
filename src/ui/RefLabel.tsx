/**
 * A portion of the reading plan, "Apostelgeschichte 18; 1. Thessalonicher 1":
 * where the line is full, it breaks between the references, never inside one
 * ("1. Thessalonicher" and its chapter stay together). The text stays as it is,
 * for copying and searching; only the breaks are steered (.ref-piece).
 */
export function RefLabel({ text }: { text: string }) {
  const parts = text.split('; ');
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          <span className="ref-piece">
            {p}
            {i < parts.length - 1 && ';'}
          </span>
          {i < parts.length - 1 && ' '}
        </span>
      ))}
    </>
  );
}
