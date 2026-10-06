/**
 * Text with LORD as in Luther Bibles: "HERR" and "HERRN" in small capitals,
 * a capital H and the rest smaller. Screen readers read "Herr".
 */
export function LordText({ children }: { children: string }) {
  const parts = children.split(/\b(HERRN?)\b/);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <span key={i} className="lord">
            {p === 'HERRN' ? 'Herrn' : 'Herr'}
          </span>
        ) : (
          p
        ),
      )}
    </>
  );
}
